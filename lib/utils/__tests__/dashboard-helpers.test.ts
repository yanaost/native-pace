import {
  getTimeBasedGreeting,
  formatDashboardGreeting,
  calculateOverallProgress,
  getProgressDescription,
  getCurrentLevelInfo,
  getNextPatternIndex,
  getReviewSummaryText,
  getContinueLearningText,
  getLearnButtonText,
  hasStartedLearning,
  hasCompletedAllPatterns,
} from '../dashboard-helpers';

describe('getTimeBasedGreeting', () => {
  it('should return "Good morning" for hours 5-11', () => {
    expect(getTimeBasedGreeting(5)).toBe('Good morning');
    expect(getTimeBasedGreeting(8)).toBe('Good morning');
    expect(getTimeBasedGreeting(11)).toBe('Good morning');
  });

  it('should return "Good afternoon" for hours 12-16', () => {
    expect(getTimeBasedGreeting(12)).toBe('Good afternoon');
    expect(getTimeBasedGreeting(14)).toBe('Good afternoon');
    expect(getTimeBasedGreeting(16)).toBe('Good afternoon');
  });

  it('should return "Good evening" for hours 17-23 and 0-4', () => {
    expect(getTimeBasedGreeting(17)).toBe('Good evening');
    expect(getTimeBasedGreeting(20)).toBe('Good evening');
    expect(getTimeBasedGreeting(23)).toBe('Good evening');
    expect(getTimeBasedGreeting(0)).toBe('Good evening');
    expect(getTimeBasedGreeting(4)).toBe('Good evening');
  });
});

describe('formatDashboardGreeting', () => {
  it('should include name when provided', () => {
    expect(formatDashboardGreeting('John', 8)).toBe('Good morning, John!');
    expect(formatDashboardGreeting('Maria', 14)).toBe('Good afternoon, Maria!');
  });

  it('should handle null name', () => {
    expect(formatDashboardGreeting(null, 8)).toBe('Good morning!');
  });

  it('should handle empty string name', () => {
    expect(formatDashboardGreeting('', 8)).toBe('Good morning!');
  });

  it('should handle whitespace-only name', () => {
    expect(formatDashboardGreeting('   ', 8)).toBe('Good morning!');
  });

  it('should trim name with extra whitespace', () => {
    expect(formatDashboardGreeting('  John  ', 8)).toBe('Good morning, John!');
  });
});

describe('calculateOverallProgress', () => {
  it('should return 0 for no patterns learned', () => {
    expect(calculateOverallProgress(0, 185)).toBe(0);
  });

  it('should return 100 for all patterns learned', () => {
    expect(calculateOverallProgress(185, 185)).toBe(100);
  });

  it('should calculate correct percentage', () => {
    expect(calculateOverallProgress(50, 200)).toBe(25);
    expect(calculateOverallProgress(100, 200)).toBe(50);
  });

  it('should round to nearest integer', () => {
    expect(calculateOverallProgress(1, 3)).toBe(33);
    expect(calculateOverallProgress(2, 3)).toBe(67);
  });

  it('should handle edge cases', () => {
    expect(calculateOverallProgress(-1, 185)).toBe(0);
    expect(calculateOverallProgress(200, 185)).toBe(100);
    expect(calculateOverallProgress(0, 0)).toBe(0);
  });
});

describe('getProgressDescription', () => {
  it('should format progress description', () => {
    expect(getProgressDescription(0, 185)).toBe('0 of 185 patterns');
    expect(getProgressDescription(47, 185)).toBe('47 of 185 patterns');
    expect(getProgressDescription(185, 185)).toBe('185 of 185 patterns');
  });
});

describe('getCurrentLevelInfo', () => {
  it('should return level 1 for 0 patterns learned', () => {
    const info = getCurrentLevelInfo(0);
    expect(info).not.toBeNull();
    expect(info?.levelId).toBe(1);
    expect(info?.levelName).toBe('Foundation');
    expect(info?.patternsInLevel).toBe(20);
    expect(info?.patternsCompletedInLevel).toBe(0);
  });

  it('should return level 1 with progress for 10 patterns', () => {
    const info = getCurrentLevelInfo(10);
    expect(info?.levelId).toBe(1);
    expect(info?.patternsCompletedInLevel).toBe(10);
  });

  it('should return level 2 for 20 patterns', () => {
    const info = getCurrentLevelInfo(20);
    expect(info?.levelId).toBe(2);
    expect(info?.levelName).toBe('Common Reductions');
  });

  it('should return level 2 with progress for 30 patterns', () => {
    const info = getCurrentLevelInfo(30);
    expect(info?.levelId).toBe(2);
    expect(info?.patternsCompletedInLevel).toBe(10);
  });

  it('should return level 3 for 50 patterns', () => {
    const info = getCurrentLevelInfo(50);
    expect(info?.levelId).toBe(3);
    expect(info?.levelName).toBe('Linking Mastery');
  });

  it('should return null for 185 patterns (all complete)', () => {
    const info = getCurrentLevelInfo(185);
    expect(info).toBeNull();
  });

  it('should return null for more than 185 patterns', () => {
    const info = getCurrentLevelInfo(200);
    expect(info).toBeNull();
  });
});

describe('getNextPatternIndex', () => {
  it('should return 1 for 0 patterns learned', () => {
    expect(getNextPatternIndex(0)).toBe(1);
  });

  it('should return next index', () => {
    expect(getNextPatternIndex(10)).toBe(11);
    expect(getNextPatternIndex(50)).toBe(51);
  });

  it('should return null when all patterns completed', () => {
    expect(getNextPatternIndex(185)).toBeNull();
    expect(getNextPatternIndex(200)).toBeNull();
  });
});

describe('getReviewSummaryText', () => {
  it('should return "No patterns due" for 0', () => {
    expect(getReviewSummaryText(0)).toBe('No patterns due for review');
  });

  it('should return singular form for 1', () => {
    expect(getReviewSummaryText(1)).toBe('1 pattern due for review');
  });

  it('should return plural form for multiple', () => {
    expect(getReviewSummaryText(5)).toBe('5 patterns due for review');
    expect(getReviewSummaryText(20)).toBe('20 patterns due for review');
  });
});

describe('getContinueLearningText', () => {
  it('should return "Start Learning" for 0 patterns', () => {
    expect(getContinueLearningText(0)).toBe('Start Learning');
  });

  it('should return "Continue Learning" for partial progress', () => {
    expect(getContinueLearningText(1)).toBe('Continue Learning');
    expect(getContinueLearningText(100)).toBe('Continue Learning');
  });

  it('should return "All Patterns Completed" when done', () => {
    expect(getContinueLearningText(185)).toBe('All Patterns Completed');
  });
});

describe('getLearnButtonText', () => {
  it('should return "Start" for 0 patterns', () => {
    expect(getLearnButtonText(0)).toBe('Start');
  });

  it('should return "Continue" for partial progress', () => {
    expect(getLearnButtonText(1)).toBe('Continue');
    expect(getLearnButtonText(100)).toBe('Continue');
  });

  it('should return "Review All" when all completed', () => {
    expect(getLearnButtonText(185)).toBe('Review All');
  });
});

describe('hasStartedLearning', () => {
  it('should return false for 0 patterns', () => {
    expect(hasStartedLearning(0)).toBe(false);
  });

  it('should return true for any progress', () => {
    expect(hasStartedLearning(1)).toBe(true);
    expect(hasStartedLearning(100)).toBe(true);
  });
});

describe('hasCompletedAllPatterns', () => {
  it('should return false for incomplete', () => {
    expect(hasCompletedAllPatterns(0)).toBe(false);
    expect(hasCompletedAllPatterns(184)).toBe(false);
  });

  it('should return true for 185 or more', () => {
    expect(hasCompletedAllPatterns(185)).toBe(true);
    expect(hasCompletedAllPatterns(200)).toBe(true);
  });
});
