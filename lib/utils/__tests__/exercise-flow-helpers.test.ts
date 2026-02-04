import {
  MIN_RESPONSE_TIME_MS,
  MAX_RESPONSE_TIME_MS,
  validateSubmission,
  normalizeResponseTime,
  getSubmissionQuality,
  calculateProgressUpdate,
  calculateSessionScore,
  checkSessionMilestone,
  createCompletionSummary,
  summarizeProgressUpdates,
  shouldUpdateStreak,
  getNextRecommendedPattern,
  ExerciseSubmission,
  ProgressUpdate,
  PatternProgress,
} from '../exercise-flow-helpers';

describe('Response Time Constants', () => {
  it('should have MIN_RESPONSE_TIME_MS at 500', () => {
    expect(MIN_RESPONSE_TIME_MS).toBe(500);
  });

  it('should have MAX_RESPONSE_TIME_MS at 60000', () => {
    expect(MAX_RESPONSE_TIME_MS).toBe(60000);
  });
});

describe('validateSubmission', () => {
  const validSubmission: ExerciseSubmission = {
    patternId: 'reduction-wanna',
    exerciseType: 'discrimination',
    isCorrect: true,
    responseTimeMs: 3000,
  };

  it('should return valid for correct submission', () => {
    const result = validateSubmission(validSubmission);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return invalid for null', () => {
    const result = validateSubmission(null);
    expect(result.isValid).toBe(false);
  });

  it('should return invalid for non-object', () => {
    const result = validateSubmission('string');
    expect(result.isValid).toBe(false);
  });

  it('should require patternId', () => {
    const { patternId, ...rest } = validSubmission;
    const result = validateSubmission(rest);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('patternId'))).toBe(true);
  });

  it('should require exerciseType', () => {
    const { exerciseType, ...rest } = validSubmission;
    const result = validateSubmission(rest);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('exerciseType'))).toBe(true);
  });

  it('should validate exerciseType values', () => {
    const invalid = { ...validSubmission, exerciseType: 'invalid' };
    const result = validateSubmission(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid exerciseType'))).toBe(true);
  });

  it('should require isCorrect boolean', () => {
    const { isCorrect, ...rest } = validSubmission;
    const result = validateSubmission(rest);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('isCorrect'))).toBe(true);
  });

  it('should require responseTimeMs number', () => {
    const invalid = { ...validSubmission, responseTimeMs: 'fast' };
    const result = validateSubmission(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('responseTimeMs'))).toBe(true);
  });

  it('should reject negative responseTimeMs', () => {
    const invalid = { ...validSubmission, responseTimeMs: -100 };
    const result = validateSubmission(invalid);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes('negative'))).toBe(true);
  });

  it('should accept optional userInput', () => {
    const withInput = { ...validSubmission, userInput: 'I wanna go' };
    const result = validateSubmission(withInput);
    expect(result.isValid).toBe(true);
  });

  it('should accept optional sessionId', () => {
    const withSession = { ...validSubmission, sessionId: 'session-123' };
    const result = validateSubmission(withSession);
    expect(result.isValid).toBe(true);
  });
});

describe('normalizeResponseTime', () => {
  it('should return MIN for values below minimum', () => {
    expect(normalizeResponseTime(100)).toBe(MIN_RESPONSE_TIME_MS);
    expect(normalizeResponseTime(0)).toBe(MIN_RESPONSE_TIME_MS);
  });

  it('should return MAX for values above maximum', () => {
    expect(normalizeResponseTime(100000)).toBe(MAX_RESPONSE_TIME_MS);
  });

  it('should return input for valid range', () => {
    expect(normalizeResponseTime(3000)).toBe(3000);
    expect(normalizeResponseTime(MIN_RESPONSE_TIME_MS)).toBe(MIN_RESPONSE_TIME_MS);
    expect(normalizeResponseTime(MAX_RESPONSE_TIME_MS)).toBe(MAX_RESPONSE_TIME_MS);
  });
});

describe('getSubmissionQuality', () => {
  it('should return 5 for fast correct answer', () => {
    expect(getSubmissionQuality(true, 1000)).toBe(5);
  });

  it('should return 4 for normal speed correct answer', () => {
    expect(getSubmissionQuality(true, 3000)).toBe(4);
  });

  it('should return 3 for slow correct answer', () => {
    expect(getSubmissionQuality(true, 6000)).toBe(3);
  });

  it('should return 1 for incorrect answer', () => {
    expect(getSubmissionQuality(false, 1000)).toBe(1);
    expect(getSubmissionQuality(false, 10000)).toBe(1);
  });

  it('should use custom average time', () => {
    // Fast with 10s average
    expect(getSubmissionQuality(true, 3000, 10000)).toBe(5);
  });
});

describe('calculateProgressUpdate', () => {
  const submission: ExerciseSubmission = {
    patternId: 'test-pattern',
    exerciseType: 'discrimination',
    isCorrect: true,
    responseTimeMs: 3000,
  };

  it('should calculate mastery increase for correct answer', () => {
    const update = calculateProgressUpdate('test-pattern', 50, submission);
    expect(update.newMastery).toBeGreaterThan(50);
    expect(update.masteryChange).toBeGreaterThan(0);
    expect(update.isImprovement).toBe(true);
  });

  it('should calculate mastery decrease for incorrect answer', () => {
    const incorrect = { ...submission, isCorrect: false };
    const update = calculateProgressUpdate('test-pattern', 50, incorrect);
    expect(update.newMastery).toBeLessThan(50);
    expect(update.masteryChange).toBeLessThan(0);
    expect(update.isImprovement).toBe(false);
  });

  it('should include quality score', () => {
    const update = calculateProgressUpdate('test-pattern', 50, submission);
    expect(update.quality).toBeGreaterThanOrEqual(1);
    expect(update.quality).toBeLessThanOrEqual(5);
  });

  it('should include pattern ID', () => {
    const update = calculateProgressUpdate('my-pattern', 50, submission);
    expect(update.patternId).toBe('my-pattern');
  });
});

describe('calculateSessionScore', () => {
  it('should return 0 for empty session', () => {
    expect(calculateSessionScore(0, 0, 0)).toBe(0);
  });

  it('should return high score for perfect accuracy and fast time', () => {
    const score = calculateSessionScore(4, 4, 2000);
    expect(score).toBeGreaterThan(80);
  });

  it('should return lower score for lower accuracy', () => {
    const perfectScore = calculateSessionScore(4, 4, 3000);
    const halfScore = calculateSessionScore(2, 4, 3000);
    expect(halfScore).toBeLessThan(perfectScore);
  });

  it('should factor in response time', () => {
    const fastScore = calculateSessionScore(3, 4, 2000);
    const slowScore = calculateSessionScore(3, 4, 8000);
    expect(fastScore).toBeGreaterThan(slowScore);
  });

  it('should be between 0 and 100', () => {
    const score = calculateSessionScore(2, 4, 5000);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('checkSessionMilestone', () => {
  it('should return first-practice for first session', () => {
    expect(checkSessionMilestone(true, 75, 30, 0)).toBe('first-practice');
  });

  it('should return perfect-score for 100% accuracy', () => {
    expect(checkSessionMilestone(false, 100, 60, 50)).toBe('perfect-score');
  });

  it('should return mastery-50 when crossing 50 threshold', () => {
    expect(checkSessionMilestone(false, 75, 55, 45)).toBe('mastery-50');
  });

  it('should return mastery-75 when crossing 75 threshold', () => {
    expect(checkSessionMilestone(false, 80, 80, 70)).toBe('mastery-75');
  });

  it('should return mastery-100 when reaching 100', () => {
    expect(checkSessionMilestone(false, 90, 100, 95)).toBe('mastery-100');
  });

  it('should return null when no milestone achieved', () => {
    expect(checkSessionMilestone(false, 80, 60, 55)).toBeNull();
  });

  it('should prioritize first-practice over perfect-score', () => {
    expect(checkSessionMilestone(true, 100, 50, 0)).toBe('first-practice');
  });
});

describe('createCompletionSummary', () => {
  const submissions: ExerciseSubmission[] = [
    { patternId: 'test', exerciseType: 'comparison', isCorrect: true, responseTimeMs: 2000 },
    { patternId: 'test', exerciseType: 'discrimination', isCorrect: true, responseTimeMs: 3000 },
    { patternId: 'test', exerciseType: 'dictation', isCorrect: false, responseTimeMs: 5000 },
    { patternId: 'test', exerciseType: 'speed', isCorrect: true, responseTimeMs: 4000 },
  ];

  it('should calculate correct counts', () => {
    const summary = createCompletionSummary('test', submissions, 50);
    expect(summary.totalExercises).toBe(4);
    expect(summary.correctCount).toBe(3);
    expect(summary.incorrectCount).toBe(1);
  });

  it('should calculate accuracy', () => {
    const summary = createCompletionSummary('test', submissions, 50);
    expect(summary.accuracy).toBe(75);
  });

  it('should calculate average response time', () => {
    const summary = createCompletionSummary('test', submissions, 50);
    expect(summary.averageResponseTimeMs).toBe(3500); // (2000+3000+5000+4000)/4
  });

  it('should include pattern ID', () => {
    const summary = createCompletionSummary('my-pattern', submissions, 50);
    expect(summary.patternId).toBe('my-pattern');
  });

  it('should generate progress updates', () => {
    const summary = createCompletionSummary('test', submissions, 50);
    expect(summary.progressUpdates).toHaveLength(4);
  });

  it('should calculate overall mastery change', () => {
    const summary = createCompletionSummary('test', submissions, 50);
    expect(typeof summary.overallMasteryChange).toBe('number');
  });

  it('should detect milestones', () => {
    const summary = createCompletionSummary('test', submissions, 50, true);
    expect(summary.achievedMilestone).toBe('first-practice');
  });

  it('should handle empty submissions', () => {
    const summary = createCompletionSummary('test', [], 50);
    expect(summary.totalExercises).toBe(0);
    expect(summary.accuracy).toBe(0);
    expect(summary.progressUpdates).toHaveLength(0);
  });
});

describe('summarizeProgressUpdates', () => {
  const updates: ProgressUpdate[] = [
    { patternId: 'p1', previousMastery: 50, newMastery: 60, masteryChange: 10, quality: 5, isImprovement: true },
    { patternId: 'p2', previousMastery: 40, newMastery: 45, masteryChange: 5, quality: 4, isImprovement: true },
    { patternId: 'p3', previousMastery: 60, newMastery: 55, masteryChange: -5, quality: 1, isImprovement: false },
  ];

  it('should calculate total improvement', () => {
    const summary = summarizeProgressUpdates(updates);
    expect(summary.totalImprovement).toBe(10); // 10 + 5 - 5
  });

  it('should calculate average quality', () => {
    const summary = summarizeProgressUpdates(updates);
    expect(summary.averageQuality).toBe(3); // (5 + 4 + 1) / 3 = 3.33, rounded
  });

  it('should count improvements', () => {
    const summary = summarizeProgressUpdates(updates);
    expect(summary.improvementCount).toBe(2);
  });

  it('should count declines', () => {
    const summary = summarizeProgressUpdates(updates);
    expect(summary.declineCount).toBe(1);
  });

  it('should handle empty updates', () => {
    const summary = summarizeProgressUpdates([]);
    expect(summary.totalImprovement).toBe(0);
    expect(summary.averageQuality).toBe(0);
    expect(summary.improvementCount).toBe(0);
    expect(summary.declineCount).toBe(0);
  });
});

describe('shouldUpdateStreak', () => {
  const today = new Date('2024-01-15T12:00:00Z');

  it('should increment for first practice', () => {
    const result = shouldUpdateStreak(null, today);
    expect(result.shouldIncrement).toBe(true);
    expect(result.shouldReset).toBe(false);
  });

  it('should not increment if already practiced today', () => {
    const result = shouldUpdateStreak('2024-01-15T08:00:00Z', today);
    expect(result.shouldIncrement).toBe(false);
    expect(result.shouldReset).toBe(false);
  });

  it('should increment without reset if practiced yesterday', () => {
    const result = shouldUpdateStreak('2024-01-14T20:00:00Z', today);
    expect(result.shouldIncrement).toBe(true);
    expect(result.shouldReset).toBe(false);
  });

  it('should reset if missed a day', () => {
    const result = shouldUpdateStreak('2024-01-13T12:00:00Z', today);
    expect(result.shouldIncrement).toBe(true);
    expect(result.shouldReset).toBe(true);
  });

  it('should reset if missed multiple days', () => {
    const result = shouldUpdateStreak('2024-01-10T12:00:00Z', today);
    expect(result.shouldIncrement).toBe(true);
    expect(result.shouldReset).toBe(true);
  });
});

describe('getNextRecommendedPattern', () => {
  const now = new Date('2024-01-15T12:00:00Z');

  it('should return null for empty progress', () => {
    expect(getNextRecommendedPattern([], now)).toBeNull();
  });

  it('should prioritize patterns due for review', () => {
    const progress: PatternProgress[] = [
      { patternId: 'p1', mastery: 80, nextReviewAt: new Date('2024-01-20'), timesPracticed: 5 },
      { patternId: 'p2', mastery: 60, nextReviewAt: new Date('2024-01-10'), timesPracticed: 3 },
      { patternId: 'p3', mastery: 40, nextReviewAt: new Date('2024-01-18'), timesPracticed: 2 },
    ];
    expect(getNextRecommendedPattern(progress, now)).toBe('p2');
  });

  it('should return oldest due pattern first', () => {
    const progress: PatternProgress[] = [
      { patternId: 'p1', mastery: 60, nextReviewAt: new Date('2024-01-12'), timesPracticed: 5 },
      { patternId: 'p2', mastery: 60, nextReviewAt: new Date('2024-01-10'), timesPracticed: 5 },
    ];
    expect(getNextRecommendedPattern(progress, now)).toBe('p2');
  });

  it('should prioritize low mastery when no reviews due', () => {
    const progress: PatternProgress[] = [
      { patternId: 'p1', mastery: 80, nextReviewAt: new Date('2024-01-20'), timesPracticed: 5 },
      { patternId: 'p2', mastery: 30, nextReviewAt: new Date('2024-01-20'), timesPracticed: 3 },
      { patternId: 'p3', mastery: 45, nextReviewAt: new Date('2024-01-20'), timesPracticed: 2 },
    ];
    expect(getNextRecommendedPattern(progress, now)).toBe('p2');
  });

  it('should return lowest mastery pattern', () => {
    const progress: PatternProgress[] = [
      { patternId: 'p1', mastery: 40, nextReviewAt: new Date('2024-01-20'), timesPracticed: 5 },
      { patternId: 'p2', mastery: 20, nextReviewAt: new Date('2024-01-20'), timesPracticed: 5 },
    ];
    expect(getNextRecommendedPattern(progress, now)).toBe('p2');
  });

  it('should prioritize least practiced when all mastery high', () => {
    const progress: PatternProgress[] = [
      { patternId: 'p1', mastery: 80, nextReviewAt: new Date('2024-01-20'), timesPracticed: 10 },
      { patternId: 'p2', mastery: 75, nextReviewAt: new Date('2024-01-20'), timesPracticed: 2 },
      { patternId: 'p3', mastery: 70, nextReviewAt: new Date('2024-01-20'), timesPracticed: 5 },
    ];
    expect(getNextRecommendedPattern(progress, now)).toBe('p2');
  });

  it('should handle null nextReviewAt', () => {
    const progress: PatternProgress[] = [
      { patternId: 'p1', mastery: 30, nextReviewAt: null, timesPracticed: 5 },
      { patternId: 'p2', mastery: 40, nextReviewAt: null, timesPracticed: 3 },
    ];
    expect(getNextRecommendedPattern(progress, now)).toBe('p1');
  });
});

describe('Complete Exercise Flow', () => {
  it('should validate, calculate progress, and summarize session', () => {
    const submissions: ExerciseSubmission[] = [
      { patternId: 'reduction-wanna', exerciseType: 'comparison', isCorrect: true, responseTimeMs: 2000 },
      { patternId: 'reduction-wanna', exerciseType: 'discrimination', isCorrect: true, responseTimeMs: 3000 },
      { patternId: 'reduction-wanna', exerciseType: 'dictation', isCorrect: true, responseTimeMs: 4000 },
      { patternId: 'reduction-wanna', exerciseType: 'speed', isCorrect: true, responseTimeMs: 2500 },
    ];

    // Step 1: Validate all submissions
    for (const submission of submissions) {
      const validation = validateSubmission(submission);
      expect(validation.isValid).toBe(true);
    }

    // Step 2: Create completion summary
    const summary = createCompletionSummary('reduction-wanna', submissions, 0, true);

    // Step 3: Verify summary
    expect(summary.accuracy).toBe(100);
    expect(summary.achievedMilestone).toBe('first-practice');
    expect(summary.overallMasteryChange).toBeGreaterThan(0);

    // Step 4: Check streak update
    const streakResult = shouldUpdateStreak(null);
    expect(streakResult.shouldIncrement).toBe(true);
  });

  it('should handle mixed results correctly', () => {
    const submissions: ExerciseSubmission[] = [
      { patternId: 'test', exerciseType: 'comparison', isCorrect: true, responseTimeMs: 2000 },
      { patternId: 'test', exerciseType: 'discrimination', isCorrect: false, responseTimeMs: 3000 },
      { patternId: 'test', exerciseType: 'dictation', isCorrect: false, responseTimeMs: 4000 },
      { patternId: 'test', exerciseType: 'speed', isCorrect: true, responseTimeMs: 2500 },
    ];

    const summary = createCompletionSummary('test', submissions, 50);

    expect(summary.accuracy).toBe(50);
    expect(summary.correctCount).toBe(2);
    expect(summary.incorrectCount).toBe(2);
    // With mixed results at 50% accuracy, no mastery milestone expected
    expect(summary.achievedMilestone).toBeNull();
  });
});

describe('Progress Tracking Flow', () => {
  it('should track progress through exercise sequence', () => {
    let currentMastery = 0;
    const updates: ProgressUpdate[] = [];

    const submissions: ExerciseSubmission[] = [
      { patternId: 'test', exerciseType: 'comparison', isCorrect: true, responseTimeMs: 2000 },
      { patternId: 'test', exerciseType: 'discrimination', isCorrect: true, responseTimeMs: 3000 },
      { patternId: 'test', exerciseType: 'dictation', isCorrect: true, responseTimeMs: 4000 },
    ];

    for (const submission of submissions) {
      const update = calculateProgressUpdate('test', currentMastery, submission);
      updates.push(update);
      currentMastery = update.newMastery;
    }

    // Mastery should increase with each correct answer
    expect(updates[0].newMastery).toBeGreaterThan(0);
    expect(updates[1].newMastery).toBeGreaterThan(updates[0].newMastery);
    expect(updates[2].newMastery).toBeGreaterThan(updates[1].newMastery);

    // Summarize updates
    const summary = summarizeProgressUpdates(updates);
    expect(summary.improvementCount).toBe(3);
    expect(summary.declineCount).toBe(0);
    expect(summary.totalImprovement).toBeGreaterThan(0);
  });
});
