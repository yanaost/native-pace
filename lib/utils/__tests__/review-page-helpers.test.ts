import {
  getCategoryDisplayName,
  createReviewSummary,
  formatDueCount,
  getFirstPatternId,
  getReviewPageTitle,
  getReviewPageSubtitle,
  getEmptyStateMessage,
  CATEGORY_DISPLAY_NAMES,
} from '../review-page-helpers';
import type { ProgressWithPattern } from '../review-queue';

describe('CATEGORY_DISPLAY_NAMES', () => {
  it('should have display names for all categories', () => {
    expect(CATEGORY_DISPLAY_NAMES['weak-forms']).toBe('Weak Forms');
    expect(CATEGORY_DISPLAY_NAMES['reductions']).toBe('Reductions');
    expect(CATEGORY_DISPLAY_NAMES['linking']).toBe('Linking');
    expect(CATEGORY_DISPLAY_NAMES['elision']).toBe('Elision');
    expect(CATEGORY_DISPLAY_NAMES['assimilation']).toBe('Assimilation');
    expect(CATEGORY_DISPLAY_NAMES['flapping']).toBe('Flapping');
  });

  it('should have exactly 6 categories', () => {
    expect(Object.keys(CATEGORY_DISPLAY_NAMES)).toHaveLength(6);
  });
});

describe('getCategoryDisplayName', () => {
  it('should return display name for known categories', () => {
    expect(getCategoryDisplayName('weak-forms')).toBe('Weak Forms');
    expect(getCategoryDisplayName('reductions')).toBe('Reductions');
    expect(getCategoryDisplayName('linking')).toBe('Linking');
    expect(getCategoryDisplayName('elision')).toBe('Elision');
    expect(getCategoryDisplayName('assimilation')).toBe('Assimilation');
    expect(getCategoryDisplayName('flapping')).toBe('Flapping');
  });

  it('should return the category itself for unknown categories', () => {
    expect(getCategoryDisplayName('unknown-category')).toBe('unknown-category');
  });
});

describe('createReviewSummary', () => {
  it('should return empty summary for empty array', () => {
    const result = createReviewSummary([]);
    expect(result.totalDue).toBe(0);
    expect(result.categories).toHaveLength(0);
    expect(result.isEmpty).toBe(true);
  });

  it('should count patterns by category', () => {
    const patterns: ProgressWithPattern[] = [
      createProgressWithPattern('1', 'weak-forms'),
      createProgressWithPattern('2', 'weak-forms'),
      createProgressWithPattern('3', 'reductions'),
    ];

    const result = createReviewSummary(patterns);

    expect(result.totalDue).toBe(3);
    expect(result.isEmpty).toBe(false);
    expect(result.categories).toHaveLength(2);
  });

  it('should include display names in category summaries', () => {
    const patterns: ProgressWithPattern[] = [
      createProgressWithPattern('1', 'weak-forms'),
    ];

    const result = createReviewSummary(patterns);

    expect(result.categories[0].displayName).toBe('Weak Forms');
    expect(result.categories[0].category).toBe('weak-forms');
    expect(result.categories[0].count).toBe(1);
  });

  it('should sort categories by count descending', () => {
    const patterns: ProgressWithPattern[] = [
      createProgressWithPattern('1', 'linking'),
      createProgressWithPattern('2', 'weak-forms'),
      createProgressWithPattern('3', 'weak-forms'),
      createProgressWithPattern('4', 'weak-forms'),
      createProgressWithPattern('5', 'reductions'),
      createProgressWithPattern('6', 'reductions'),
    ];

    const result = createReviewSummary(patterns);

    expect(result.categories[0].category).toBe('weak-forms');
    expect(result.categories[0].count).toBe(3);
    expect(result.categories[1].category).toBe('reductions');
    expect(result.categories[1].count).toBe(2);
    expect(result.categories[2].category).toBe('linking');
    expect(result.categories[2].count).toBe(1);
  });

  it('should skip patterns with null patterns object', () => {
    const patterns: ProgressWithPattern[] = [
      createProgressWithPattern('1', 'weak-forms'),
      { ...createProgressWithPattern('2', 'weak-forms'), patterns: null },
    ];

    const result = createReviewSummary(patterns);

    expect(result.totalDue).toBe(2);
    expect(result.categories).toHaveLength(1);
    expect(result.categories[0].count).toBe(1);
  });
});

describe('formatDueCount', () => {
  it('should return "No patterns" for 0', () => {
    expect(formatDueCount(0)).toBe('No patterns');
  });

  it('should return singular form for 1', () => {
    expect(formatDueCount(1)).toBe('1 pattern');
  });

  it('should return plural form for 2+', () => {
    expect(formatDueCount(2)).toBe('2 patterns');
    expect(formatDueCount(10)).toBe('10 patterns');
    expect(formatDueCount(100)).toBe('100 patterns');
  });
});

describe('getFirstPatternId', () => {
  it('should return null for empty array', () => {
    expect(getFirstPatternId([])).toBeNull();
  });

  it('should return the first pattern ID', () => {
    const patterns: ProgressWithPattern[] = [
      createProgressWithPattern('first-pattern', 'weak-forms'),
      createProgressWithPattern('second-pattern', 'reductions'),
    ];

    expect(getFirstPatternId(patterns)).toBe('first-pattern');
  });
});

describe('getReviewPageTitle', () => {
  it('should return "All Caught Up!" for 0 patterns', () => {
    expect(getReviewPageTitle(0)).toBe('All Caught Up!');
  });

  it('should return "Review Due" for 1+ patterns', () => {
    expect(getReviewPageTitle(1)).toBe('Review Due');
    expect(getReviewPageTitle(5)).toBe('Review Due');
    expect(getReviewPageTitle(100)).toBe('Review Due');
  });
});

describe('getReviewPageSubtitle', () => {
  it('should return empty state message for 0 patterns', () => {
    const result = getReviewPageSubtitle(0);
    expect(result).toContain("don't have any patterns");
    expect(result).toContain('Great job');
  });

  it('should return singular message for 1 pattern', () => {
    const result = getReviewPageSubtitle(1);
    expect(result).toContain('1 pattern');
    expect(result).not.toContain('patterns');
  });

  it('should return plural message for 2+ patterns', () => {
    expect(getReviewPageSubtitle(2)).toContain('2 patterns');
    expect(getReviewPageSubtitle(10)).toContain('10 patterns');
  });

  it('should include encouragement message', () => {
    expect(getReviewPageSubtitle(5)).toContain('Keep your skills sharp');
  });
});

describe('getEmptyStateMessage', () => {
  it('should return title and description', () => {
    const result = getEmptyStateMessage();
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
  });

  it('should have meaningful content', () => {
    const result = getEmptyStateMessage();
    expect(result.title).toBe('All Caught Up!');
    expect(result.description).toContain("don't have any patterns");
    expect(result.description).toContain('Come back later');
  });
});

// Helper functions for creating test data

function createProgressWithPattern(
  patternId: string,
  category: string
): ProgressWithPattern {
  return {
    id: `progress-${patternId}`,
    user_id: 'user-123',
    pattern_id: patternId,
    mastery_score: 50,
    times_practiced: 5,
    times_correct: 4,
    last_practiced_at: '2025-01-10T00:00:00Z',
    next_review_at: '2025-01-15T00:00:00Z',
    ease_factor: 2.5,
    interval_days: 3,
    created_at: '2025-01-01T00:00:00Z',
    patterns: {
      id: patternId,
      category: category as 'weak-forms',
      level: 1,
      title: `Pattern ${patternId}`,
      description: `Description for pattern ${patternId}`,
      phonetic_clear: '/test/',
      phonetic_reduced: '/tst/',
      example_sentence: 'Example sentence',
      example_transcription: 'Example transcription',
      audio_clear_url: '/audio/slow.mp3',
      audio_conversational_url: '/audio/fast.mp3',
      tips: ['Tip 1'],
      difficulty: 1,
      order_index: 1,
    },
  };
}
