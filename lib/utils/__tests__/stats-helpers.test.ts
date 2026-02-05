import {
  calculatePatternsLearned,
  calculateAverageAccuracy,
  calculateMasteryByCategory,
  calculateTotalPracticeMinutes,
  calculateCategoryStats,
  type ProgressRecord,
  type PatternRecord,
  type SessionRecord,
} from '../stats-helpers';

describe('calculatePatternsLearned', () => {
  it('should return 0 for empty array', () => {
    expect(calculatePatternsLearned([])).toBe(0);
  });

  it('should count patterns with mastery_score > 0', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 50, times_practiced: 5, times_correct: 4 },
      { pattern_id: 'p2', mastery_score: 0, times_practiced: 0, times_correct: 0 },
      { pattern_id: 'p3', mastery_score: 25, times_practiced: 3, times_correct: 2 },
    ];

    expect(calculatePatternsLearned(records)).toBe(2);
  });

  it('should return 0 when all mastery scores are 0', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 0, times_practiced: 0, times_correct: 0 },
      { pattern_id: 'p2', mastery_score: 0, times_practiced: 0, times_correct: 0 },
    ];

    expect(calculatePatternsLearned(records)).toBe(0);
  });

  it('should count all patterns when all have progress', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 100, times_practiced: 10, times_correct: 10 },
      { pattern_id: 'p2', mastery_score: 50, times_practiced: 5, times_correct: 3 },
      { pattern_id: 'p3', mastery_score: 1, times_practiced: 1, times_correct: 0 },
    ];

    expect(calculatePatternsLearned(records)).toBe(3);
  });
});

describe('calculateAverageAccuracy', () => {
  it('should return 0 for empty array', () => {
    expect(calculateAverageAccuracy([])).toBe(0);
  });

  it('should return 0 when no practice', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 0, times_practiced: 0, times_correct: 0 },
    ];

    expect(calculateAverageAccuracy(records)).toBe(0);
  });

  it('should calculate accuracy correctly', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 50, times_practiced: 10, times_correct: 8 },
      { pattern_id: 'p2', mastery_score: 30, times_practiced: 10, times_correct: 6 },
    ];

    // 14 correct / 20 practiced = 70%
    expect(calculateAverageAccuracy(records)).toBe(70);
  });

  it('should return 100 for perfect accuracy', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 100, times_practiced: 5, times_correct: 5 },
      { pattern_id: 'p2', mastery_score: 100, times_practiced: 3, times_correct: 3 },
    ];

    expect(calculateAverageAccuracy(records)).toBe(100);
  });

  it('should return 0 for zero correct answers', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 0, times_practiced: 5, times_correct: 0 },
    ];

    expect(calculateAverageAccuracy(records)).toBe(0);
  });

  it('should round to nearest integer', () => {
    const records: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 50, times_practiced: 3, times_correct: 2 },
    ];

    // 2/3 = 66.67%, rounds to 67%
    expect(calculateAverageAccuracy(records)).toBe(67);
  });
});

describe('calculateMasteryByCategory', () => {
  const patterns: PatternRecord[] = [
    { id: 'p1', category: 'weak-forms' },
    { id: 'p2', category: 'weak-forms' },
    { id: 'p3', category: 'reductions' },
    { id: 'p4', category: 'linking' },
  ];

  it('should return zeros for empty progress', () => {
    const result = calculateMasteryByCategory([], patterns);

    expect(result['weak-forms']).toBe(0);
    expect(result['reductions']).toBe(0);
    expect(result['linking']).toBe(0);
  });

  it('should calculate average mastery per category', () => {
    const progress: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 80, times_practiced: 5, times_correct: 4 },
      { pattern_id: 'p2', mastery_score: 60, times_practiced: 5, times_correct: 3 },
      { pattern_id: 'p3', mastery_score: 100, times_practiced: 10, times_correct: 10 },
    ];

    const result = calculateMasteryByCategory(progress, patterns);

    // weak-forms: (80 + 60) / 2 = 70
    expect(result['weak-forms']).toBe(70);
    // reductions: 100 / 1 = 100
    expect(result['reductions']).toBe(100);
    // linking: 0 (no progress)
    expect(result['linking']).toBe(0);
  });

  it('should include all categories in result', () => {
    const result = calculateMasteryByCategory([], patterns);

    expect(result).toHaveProperty('weak-forms');
    expect(result).toHaveProperty('reductions');
    expect(result).toHaveProperty('linking');
    expect(result).toHaveProperty('elision');
    expect(result).toHaveProperty('assimilation');
    expect(result).toHaveProperty('flapping');
  });

  it('should handle patterns without progress records', () => {
    const progress: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 50, times_practiced: 3, times_correct: 2 },
    ];

    const result = calculateMasteryByCategory(progress, patterns);

    // weak-forms: (50 + 0) / 2 = 25
    expect(result['weak-forms']).toBe(25);
  });

  it('should round to nearest integer', () => {
    const progress: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 33, times_practiced: 3, times_correct: 1 },
      { pattern_id: 'p2', mastery_score: 66, times_practiced: 3, times_correct: 2 },
    ];

    const result = calculateMasteryByCategory(progress, patterns);

    // (33 + 66) / 2 = 49.5, rounds to 50
    expect(result['weak-forms']).toBe(50);
  });
});

describe('calculateTotalPracticeMinutes', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotalPracticeMinutes([])).toBe(0);
  });

  it('should return 0 when no sessions have ended', () => {
    const sessions: SessionRecord[] = [
      { started_at: '2024-01-01T10:00:00Z', ended_at: null },
      { started_at: '2024-01-02T10:00:00Z', ended_at: null },
    ];

    expect(calculateTotalPracticeMinutes(sessions)).toBe(0);
  });

  it('should calculate total minutes from completed sessions', () => {
    const sessions: SessionRecord[] = [
      { started_at: '2024-01-01T10:00:00Z', ended_at: '2024-01-01T10:30:00Z' }, // 30 min
      { started_at: '2024-01-02T10:00:00Z', ended_at: '2024-01-02T10:15:00Z' }, // 15 min
    ];

    expect(calculateTotalPracticeMinutes(sessions)).toBe(45);
  });

  it('should ignore sessions without end time', () => {
    const sessions: SessionRecord[] = [
      { started_at: '2024-01-01T10:00:00Z', ended_at: '2024-01-01T10:30:00Z' }, // 30 min
      { started_at: '2024-01-02T10:00:00Z', ended_at: null }, // ongoing
    ];

    expect(calculateTotalPracticeMinutes(sessions)).toBe(30);
  });

  it('should handle single session', () => {
    const sessions: SessionRecord[] = [
      { started_at: '2024-01-01T10:00:00Z', ended_at: '2024-01-01T11:00:00Z' }, // 60 min
    ];

    expect(calculateTotalPracticeMinutes(sessions)).toBe(60);
  });

  it('should round to nearest minute', () => {
    const sessions: SessionRecord[] = [
      { started_at: '2024-01-01T10:00:00Z', ended_at: '2024-01-01T10:00:45Z' }, // 45 sec = ~1 min
    ];

    expect(calculateTotalPracticeMinutes(sessions)).toBe(1);
  });
});

describe('calculateCategoryStats', () => {
  const patterns: PatternRecord[] = [
    { id: 'p1', category: 'weak-forms' },
    { id: 'p2', category: 'weak-forms' },
    { id: 'p3', category: 'reductions' },
  ];

  it('should return empty array for empty patterns', () => {
    const stats = calculateCategoryStats([], []);
    expect(stats).toHaveLength(0);
  });

  it('should calculate stats for each category', () => {
    const progress: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 80, times_practiced: 5, times_correct: 4 },
      { pattern_id: 'p2', mastery_score: 0, times_practiced: 0, times_correct: 0 },
      { pattern_id: 'p3', mastery_score: 50, times_practiced: 3, times_correct: 2 },
    ];

    const stats = calculateCategoryStats(progress, patterns);

    const weakForms = stats.find((s) => s.category === 'weak-forms');
    expect(weakForms).toBeDefined();
    expect(weakForms?.averageMastery).toBe(40); // (80 + 0) / 2
    expect(weakForms?.patternsLearned).toBe(1);
    expect(weakForms?.totalPatterns).toBe(2);

    const reductions = stats.find((s) => s.category === 'reductions');
    expect(reductions).toBeDefined();
    expect(reductions?.averageMastery).toBe(50);
    expect(reductions?.patternsLearned).toBe(1);
    expect(reductions?.totalPatterns).toBe(1);
  });

  it('should handle no progress', () => {
    const stats = calculateCategoryStats([], patterns);

    const weakForms = stats.find((s) => s.category === 'weak-forms');
    expect(weakForms?.averageMastery).toBe(0);
    expect(weakForms?.patternsLearned).toBe(0);
    expect(weakForms?.totalPatterns).toBe(2);
  });

  it('should count learned patterns correctly', () => {
    const progress: ProgressRecord[] = [
      { pattern_id: 'p1', mastery_score: 1, times_practiced: 1, times_correct: 0 },
      { pattern_id: 'p2', mastery_score: 100, times_practiced: 10, times_correct: 10 },
    ];

    const stats = calculateCategoryStats(progress, patterns);

    const weakForms = stats.find((s) => s.category === 'weak-forms');
    expect(weakForms?.patternsLearned).toBe(2); // Both have mastery > 0
  });

  it('should only include categories with patterns', () => {
    const singleCategoryPatterns: PatternRecord[] = [
      { id: 'p1', category: 'flapping' },
    ];

    const stats = calculateCategoryStats([], singleCategoryPatterns);

    expect(stats).toHaveLength(1);
    expect(stats[0].category).toBe('flapping');
  });
});
