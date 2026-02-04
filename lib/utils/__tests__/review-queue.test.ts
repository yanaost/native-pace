import {
  isPatternDue,
  filterDuePatterns,
  sortByReviewDate,
  filterUnpracticedPatterns,
  sortByOrderIndex,
  groupByCategory,
  getDuePatterns,
  getNewPatternsForLevel,
  getDuePatternsCount,
  DEFAULT_DUE_PATTERNS_LIMIT,
  DEFAULT_NEW_PATTERNS_LIMIT,
  ProgressWithPattern,
} from '../review-queue';

describe('isPatternDue', () => {
  it('should return false for null next_review_at', () => {
    expect(isPatternDue(null)).toBe(false);
  });

  it('should return true when next_review_at is in the past', () => {
    const pastDate = new Date('2024-01-01T00:00:00Z').toISOString();
    const referenceDate = new Date('2025-01-15T00:00:00Z');
    expect(isPatternDue(pastDate, referenceDate)).toBe(true);
  });

  it('should return true when next_review_at equals reference date', () => {
    const date = new Date('2025-01-15T12:00:00Z');
    expect(isPatternDue(date.toISOString(), date)).toBe(true);
  });

  it('should return false when next_review_at is in the future', () => {
    const futureDate = new Date('2025-12-31T00:00:00Z').toISOString();
    const referenceDate = new Date('2025-01-15T00:00:00Z');
    expect(isPatternDue(futureDate, referenceDate)).toBe(false);
  });

  it('should use current date when no reference date provided', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString(); // 1 day ago
    expect(isPatternDue(pastDate)).toBe(true);

    const futureDate = new Date(Date.now() + 86400000).toISOString(); // 1 day ahead
    expect(isPatternDue(futureDate)).toBe(false);
  });
});

describe('filterDuePatterns', () => {
  const referenceDate = new Date('2025-01-15T12:00:00Z');

  it('should return empty array for empty input', () => {
    expect(filterDuePatterns([], referenceDate)).toEqual([]);
  });

  it('should filter out patterns with null next_review_at', () => {
    const records = [
      { id: '1', next_review_at: null },
      { id: '2', next_review_at: '2025-01-10T00:00:00Z' },
    ];
    const result = filterDuePatterns(records, referenceDate);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should include patterns with past next_review_at', () => {
    const records = [
      { id: '1', next_review_at: '2025-01-01T00:00:00Z' },
      { id: '2', next_review_at: '2025-01-14T23:59:59Z' },
      { id: '3', next_review_at: '2025-01-15T12:00:00Z' },
    ];
    const result = filterDuePatterns(records, referenceDate);
    expect(result).toHaveLength(3);
  });

  it('should exclude patterns with future next_review_at', () => {
    const records = [
      { id: '1', next_review_at: '2025-01-15T12:00:01Z' },
      { id: '2', next_review_at: '2025-12-31T00:00:00Z' },
    ];
    const result = filterDuePatterns(records, referenceDate);
    expect(result).toHaveLength(0);
  });

  it('should handle mixed records correctly', () => {
    const records = [
      { id: '1', next_review_at: null },
      { id: '2', next_review_at: '2025-01-10T00:00:00Z' },
      { id: '3', next_review_at: '2025-01-20T00:00:00Z' },
      { id: '4', next_review_at: '2025-01-15T12:00:00Z' },
    ];
    const result = filterDuePatterns(records, referenceDate);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.id)).toEqual(['2', '4']);
  });
});

describe('sortByReviewDate', () => {
  it('should return empty array for empty input', () => {
    expect(sortByReviewDate([])).toEqual([]);
  });

  it('should sort by next_review_at ascending', () => {
    const records = [
      { id: '3', next_review_at: '2025-01-20T00:00:00Z' },
      { id: '1', next_review_at: '2025-01-10T00:00:00Z' },
      { id: '2', next_review_at: '2025-01-15T00:00:00Z' },
    ];
    const result = sortByReviewDate([...records]);
    expect(result.map((r) => r.id)).toEqual(['1', '2', '3']);
  });

  it('should put null dates at the end', () => {
    const records = [
      { id: '2', next_review_at: '2025-01-15T00:00:00Z' },
      { id: '1', next_review_at: null },
      { id: '3', next_review_at: '2025-01-10T00:00:00Z' },
    ];
    const result = sortByReviewDate([...records]);
    expect(result.map((r) => r.id)).toEqual(['3', '2', '1']);
  });

  it('should handle all null dates', () => {
    const records = [
      { id: '1', next_review_at: null },
      { id: '2', next_review_at: null },
    ];
    const result = sortByReviewDate([...records]);
    expect(result).toHaveLength(2);
  });

  it('should handle equal dates', () => {
    const sameDate = '2025-01-15T00:00:00Z';
    const records = [
      { id: '1', next_review_at: sameDate },
      { id: '2', next_review_at: sameDate },
    ];
    const result = sortByReviewDate([...records]);
    expect(result).toHaveLength(2);
  });
});

describe('filterUnpracticedPatterns', () => {
  it('should return empty array for empty input', () => {
    expect(filterUnpracticedPatterns([], new Set())).toEqual([]);
  });

  it('should return all patterns when none are practiced', () => {
    const patterns = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const result = filterUnpracticedPatterns(patterns, new Set());
    expect(result).toHaveLength(3);
  });

  it('should filter out practiced patterns using Set', () => {
    const patterns = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const practicedIds = new Set(['2']);
    const result = filterUnpracticedPatterns(patterns, practicedIds);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(['1', '3']);
  });

  it('should filter out practiced patterns using Array', () => {
    const patterns = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const practicedIds = ['1', '3'];
    const result = filterUnpracticedPatterns(patterns, practicedIds);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should return empty array when all patterns are practiced', () => {
    const patterns = [{ id: '1' }, { id: '2' }];
    const practicedIds = new Set(['1', '2', '3']);
    const result = filterUnpracticedPatterns(patterns, practicedIds);
    expect(result).toHaveLength(0);
  });
});

describe('sortByOrderIndex', () => {
  it('should return empty array for empty input', () => {
    expect(sortByOrderIndex([])).toEqual([]);
  });

  it('should sort by order_index ascending', () => {
    const patterns = [
      { id: '3', order_index: 30 },
      { id: '1', order_index: 10 },
      { id: '2', order_index: 20 },
    ];
    const result = sortByOrderIndex([...patterns]);
    expect(result.map((p) => p.id)).toEqual(['1', '2', '3']);
  });

  it('should handle equal order indices', () => {
    const patterns = [
      { id: '1', order_index: 10 },
      { id: '2', order_index: 10 },
    ];
    const result = sortByOrderIndex([...patterns]);
    expect(result).toHaveLength(2);
  });

  it('should handle negative order indices', () => {
    const patterns = [
      { id: '2', order_index: 0 },
      { id: '1', order_index: -1 },
      { id: '3', order_index: 1 },
    ];
    const result = sortByOrderIndex([...patterns]);
    expect(result.map((p) => p.id)).toEqual(['1', '2', '3']);
  });
});

describe('groupByCategory', () => {
  it('should return empty map for empty input', () => {
    const result = groupByCategory([]);
    expect(result.size).toBe(0);
  });

  it('should group patterns by category', () => {
    const records: ProgressWithPattern[] = [
      createProgressWithPattern('1', 'weak-forms'),
      createProgressWithPattern('2', 'weak-forms'),
      createProgressWithPattern('3', 'reductions'),
    ];
    const result = groupByCategory(records);
    expect(result.get('weak-forms')).toBe(2);
    expect(result.get('reductions')).toBe(1);
  });

  it('should handle patterns with null patterns object', () => {
    const records: ProgressWithPattern[] = [
      { ...createBaseProgress('1'), patterns: null },
      createProgressWithPattern('2', 'weak-forms'),
    ];
    const result = groupByCategory(records);
    expect(result.get('unknown')).toBe(1);
    expect(result.get('weak-forms')).toBe(1);
  });

  it('should handle multiple categories', () => {
    const records: ProgressWithPattern[] = [
      createProgressWithPattern('1', 'weak-forms'),
      createProgressWithPattern('2', 'reductions'),
      createProgressWithPattern('3', 'linking'),
      createProgressWithPattern('4', 'elision'),
      createProgressWithPattern('5', 'assimilation'),
      createProgressWithPattern('6', 'flapping'),
    ];
    const result = groupByCategory(records);
    expect(result.size).toBe(6);
    expect(result.get('weak-forms')).toBe(1);
    expect(result.get('reductions')).toBe(1);
    expect(result.get('linking')).toBe(1);
    expect(result.get('elision')).toBe(1);
    expect(result.get('assimilation')).toBe(1);
    expect(result.get('flapping')).toBe(1);
  });
});

describe('constants', () => {
  it('should have correct default due patterns limit', () => {
    expect(DEFAULT_DUE_PATTERNS_LIMIT).toBe(20);
  });

  it('should have correct default new patterns limit', () => {
    expect(DEFAULT_NEW_PATTERNS_LIMIT).toBe(5);
  });
});

describe('getDuePatterns', () => {
  it('should return empty array when query fails', async () => {
    const mockSupabase = createMockSupabase({
      queryResult: { data: null, error: new Error('Database error') },
    });

    const result = await getDuePatterns(mockSupabase as never, 'user-123');
    expect(result).toEqual([]);
  });

  it('should return empty array when no patterns are due', async () => {
    const mockSupabase = createMockSupabase({
      queryResult: { data: [], error: null },
    });

    const result = await getDuePatterns(mockSupabase as never, 'user-123');
    expect(result).toEqual([]);
  });

  it('should return due patterns with pattern data', async () => {
    const mockData = [createProgressWithPattern('1', 'weak-forms')];
    const mockSupabase = createMockSupabase({
      queryResult: { data: mockData, error: null },
    });

    const result = await getDuePatterns(mockSupabase as never, 'user-123');
    expect(result).toEqual(mockData);
  });

  it('should use default limit when not specified', async () => {
    const mockSupabase = createMockSupabase({
      queryResult: { data: [], error: null },
    });

    await getDuePatterns(mockSupabase as never, 'user-123');
    expect(mockSupabase._limitCalled).toBe(DEFAULT_DUE_PATTERNS_LIMIT);
  });

  it('should use custom limit when specified', async () => {
    const mockSupabase = createMockSupabase({
      queryResult: { data: [], error: null },
    });

    await getDuePatterns(mockSupabase as never, 'user-123', 10);
    expect(mockSupabase._limitCalled).toBe(10);
  });
});

describe('getNewPatternsForLevel', () => {
  it('should return empty array when practiced patterns query fails', async () => {
    const mockSupabase = createMockSupabaseForNewPatterns({
      practicedResult: { data: null, error: new Error('Database error') },
      patternsResult: { data: [], error: null },
    });

    const result = await getNewPatternsForLevel(
      mockSupabase as never,
      'user-123',
      1
    );
    expect(result).toEqual([]);
  });

  it('should return empty array when patterns query fails', async () => {
    const mockSupabase = createMockSupabaseForNewPatterns({
      practicedResult: { data: [], error: null },
      patternsResult: { data: null, error: new Error('Database error') },
    });

    const result = await getNewPatternsForLevel(
      mockSupabase as never,
      'user-123',
      1
    );
    expect(result).toEqual([]);
  });

  it('should return patterns when user has no practiced patterns', async () => {
    const mockPatterns = [createPattern('1', 1)];
    const mockSupabase = createMockSupabaseForNewPatterns({
      practicedResult: { data: [], error: null },
      patternsResult: { data: mockPatterns, error: null },
    });

    const result = await getNewPatternsForLevel(
      mockSupabase as never,
      'user-123',
      1
    );
    expect(result).toEqual(mockPatterns);
  });

  it('should exclude practiced patterns', async () => {
    const mockPatterns = [createPattern('2', 1)];
    const mockSupabase = createMockSupabaseForNewPatterns({
      practicedResult: { data: [{ pattern_id: '1' }], error: null },
      patternsResult: { data: mockPatterns, error: null },
    });

    const result = await getNewPatternsForLevel(
      mockSupabase as never,
      'user-123',
      1
    );
    expect(result).toEqual(mockPatterns);
  });

  it('should use default limit when not specified', async () => {
    const mockSupabase = createMockSupabaseForNewPatterns({
      practicedResult: { data: [], error: null },
      patternsResult: { data: [], error: null },
    });

    await getNewPatternsForLevel(mockSupabase as never, 'user-123', 1);
    expect(mockSupabase._limitCalled).toBe(DEFAULT_NEW_PATTERNS_LIMIT);
  });

  it('should use custom limit when specified', async () => {
    const mockSupabase = createMockSupabaseForNewPatterns({
      practicedResult: { data: [], error: null },
      patternsResult: { data: [], error: null },
    });

    await getNewPatternsForLevel(mockSupabase as never, 'user-123', 1, 3);
    expect(mockSupabase._limitCalled).toBe(3);
  });
});

describe('getDuePatternsCount', () => {
  it('should return 0 when query fails', async () => {
    const mockSupabase = createMockSupabaseCount({
      count: null,
      error: new Error('Database error'),
    });

    const result = await getDuePatternsCount(mockSupabase as never, 'user-123');
    expect(result).toBe(0);
  });

  it('should return 0 when count is null', async () => {
    const mockSupabase = createMockSupabaseCount({ count: null, error: null });

    const result = await getDuePatternsCount(mockSupabase as never, 'user-123');
    expect(result).toBe(0);
  });

  it('should return correct count', async () => {
    const mockSupabase = createMockSupabaseCount({ count: 5, error: null });

    const result = await getDuePatternsCount(mockSupabase as never, 'user-123');
    expect(result).toBe(5);
  });
});

// Helper functions

function createBaseProgress(id: string) {
  return {
    id,
    user_id: 'user-123',
    pattern_id: `pattern-${id}`,
    mastery_score: 50,
    times_practiced: 5,
    times_correct: 4,
    last_practiced_at: '2025-01-10T00:00:00Z',
    next_review_at: '2025-01-15T00:00:00Z',
    ease_factor: 2.5,
    interval_days: 3,
    created_at: '2025-01-01T00:00:00Z',
  };
}

function createProgressWithPattern(
  id: string,
  category: string
): ProgressWithPattern {
  return {
    ...createBaseProgress(id),
    patterns: createPattern(`pattern-${id}`, 1, category),
  };
}

function createPattern(id: string, level: number, category = 'weak-forms') {
  return {
    id,
    category: category as 'weak-forms',
    level,
    title: `Pattern ${id}`,
    description: `Description for pattern ${id}`,
    phonetic_clear: '/test/',
    phonetic_reduced: '/tst/',
    example_sentence: 'Example sentence',
    example_transcription: 'Example transcription',
    audio_slow_url: '/audio/slow.mp3',
    audio_fast_url: '/audio/fast.mp3',
    tips: ['Tip 1'],
    difficulty: 1,
    order_index: parseInt(id) || 1,
  };
}

function createMockSupabase(options: {
  queryResult: { data: unknown; error: Error | null };
}) {
  const { queryResult } = options;
  const mock = {
    _limitCalled: 0,
    from: () => ({
      select: () => ({
        eq: () => ({
          lte: () => ({
            order: () => ({
              limit: (n: number) => {
                mock._limitCalled = n;
                return Promise.resolve(queryResult);
              },
            }),
          }),
        }),
      }),
    }),
  };
  return mock;
}

function createMockSupabaseForNewPatterns(options: {
  practicedResult: { data: unknown; error: Error | null };
  patternsResult: { data: unknown; error: Error | null };
}) {
  const { practicedResult, patternsResult } = options;
  let callIndex = 0;
  const mock = {
    _limitCalled: 0,
    from: (table: string) => {
      if (table === 'user_pattern_progress') {
        return {
          select: () => ({
            eq: () => Promise.resolve(practicedResult),
          }),
        };
      }
      // patterns table
      return {
        select: () => ({
          eq: () => ({
            order: () => ({
              limit: (n: number) => {
                mock._limitCalled = n;
                // If there are practiced IDs, the .not() will be called
                // Otherwise, the query resolves directly
                const practicedIds =
                  (practicedResult.data as Array<{ pattern_id: string }>) ?? [];
                if (practicedIds.length > 0) {
                  return {
                    not: () => Promise.resolve(patternsResult),
                  };
                }
                return Promise.resolve(patternsResult);
              },
            }),
          }),
        }),
      };
    },
  };
  return mock;
}

function createMockSupabaseCount(result: { count: number | null; error: Error | null }) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          lte: () => Promise.resolve(result),
        }),
      }),
    }),
  };
}
