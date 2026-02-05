import {
  createReviewSessionState,
  getCurrentPattern,
  getCurrentExerciseType,
  isReviewSummary,
  recordReviewExerciseResult,
  getReviewProgress,
  createReviewSessionResult,
  getPatternsRemaining,
  hasPatterns,
  formatReviewProgress,
  REVIEW_EXERCISE_SEQUENCE,
  ReviewSessionState,
} from '../review-session-helpers';
import type { ProgressWithPattern } from '../review-queue';
import type { ExerciseSessionResult } from '../practice-session-helpers';

describe('REVIEW_EXERCISE_SEQUENCE', () => {
  it('should include discrimination and dictation', () => {
    expect(REVIEW_EXERCISE_SEQUENCE).toContain('discrimination');
    expect(REVIEW_EXERCISE_SEQUENCE).toContain('dictation');
  });

  it('should have exactly 2 exercises', () => {
    expect(REVIEW_EXERCISE_SEQUENCE).toHaveLength(2);
  });
});

describe('createReviewSessionState', () => {
  it('should create initial state with patterns', () => {
    const patterns = [createPattern('1'), createPattern('2')];
    const state = createReviewSessionState(patterns);

    expect(state.patterns).toHaveLength(2);
    expect(state.currentPatternIndex).toBe(0);
    expect(state.currentExerciseIndex).toBe(0);
    expect(state.patternResults).toHaveLength(0);
    expect(state.isComplete).toBe(false);
  });

  it('should mark as complete for empty patterns array', () => {
    const state = createReviewSessionState([]);
    expect(state.isComplete).toBe(true);
  });

  it('should use default exercise sequence', () => {
    const patterns = [createPattern('1')];
    const state = createReviewSessionState(patterns);
    expect(state.exerciseSequence).toEqual(REVIEW_EXERCISE_SEQUENCE);
  });

  it('should accept custom exercise sequence', () => {
    const patterns = [createPattern('1')];
    const customSequence = ['dictation'] as const;
    const state = createReviewSessionState(patterns, [...customSequence]);
    expect(state.exerciseSequence).toEqual(['dictation']);
  });

  it('should set start time', () => {
    const before = Date.now();
    const state = createReviewSessionState([createPattern('1')]);
    const after = Date.now();

    expect(state.startTime).toBeGreaterThanOrEqual(before);
    expect(state.startTime).toBeLessThanOrEqual(after);
  });
});

describe('getCurrentPattern', () => {
  it('should return first pattern initially', () => {
    const patterns = [createPattern('1'), createPattern('2')];
    const state = createReviewSessionState(patterns);
    const current = getCurrentPattern(state);

    expect(current?.pattern_id).toBe('1');
  });

  it('should return null when complete', () => {
    const state = createReviewSessionState([]);
    expect(getCurrentPattern(state)).toBeNull();
  });

  it('should return null when index exceeds patterns', () => {
    const patterns = [createPattern('1')];
    const state: ReviewSessionState = {
      ...createReviewSessionState(patterns),
      currentPatternIndex: 10,
    };
    expect(getCurrentPattern(state)).toBeNull();
  });
});

describe('getCurrentExerciseType', () => {
  it('should return first exercise type initially', () => {
    const patterns = [createPattern('1')];
    const state = createReviewSessionState(patterns);
    expect(getCurrentExerciseType(state)).toBe('discrimination');
  });

  it('should return null when complete', () => {
    const state = createReviewSessionState([]);
    expect(getCurrentExerciseType(state)).toBeNull();
  });

  it('should return null when exercise index exceeds sequence', () => {
    const patterns = [createPattern('1')];
    const state: ReviewSessionState = {
      ...createReviewSessionState(patterns),
      currentExerciseIndex: 10,
    };
    expect(getCurrentExerciseType(state)).toBeNull();
  });
});

describe('isReviewSummary', () => {
  it('should return false initially', () => {
    const patterns = [createPattern('1')];
    const state = createReviewSessionState(patterns);
    expect(isReviewSummary(state)).toBe(false);
  });

  it('should return true when complete', () => {
    const state: ReviewSessionState = {
      ...createReviewSessionState([createPattern('1')]),
      isComplete: true,
    };
    expect(isReviewSummary(state)).toBe(true);
  });
});

describe('recordReviewExerciseResult', () => {
  it('should add result and advance exercise index', () => {
    const patterns = [createPattern('1')];
    const state = createReviewSessionState(patterns);
    const result: ExerciseSessionResult = {
      exerciseType: 'discrimination',
      isCorrect: true,
      responseTimeMs: 1000,
    };

    const newState = recordReviewExerciseResult(state, result);

    expect(newState.currentExerciseIndex).toBe(1);
    expect(newState.currentPatternExerciseResults).toHaveLength(1);
    expect(newState.currentPatternIndex).toBe(0); // Still on same pattern
  });

  it('should move to next pattern after completing all exercises', () => {
    const patterns = [createPattern('1'), createPattern('2')];
    let state = createReviewSessionState(patterns);

    // Complete first exercise
    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    expect(state.currentPatternIndex).toBe(0);

    // Complete second exercise - should move to next pattern
    state = recordReviewExerciseResult(state, createResult('dictation', true));
    expect(state.currentPatternIndex).toBe(1);
    expect(state.currentExerciseIndex).toBe(0);
    expect(state.patternResults).toHaveLength(1);
    expect(state.currentPatternExerciseResults).toHaveLength(0);
  });

  it('should mark session complete after last pattern', () => {
    const patterns = [createPattern('1')];
    let state = createReviewSessionState(patterns);

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    expect(state.isComplete).toBe(true);
    expect(state.patternResults).toHaveLength(1);
  });

  it('should mark pattern as passed if >= 50% correct', () => {
    const patterns = [createPattern('1')];
    let state = createReviewSessionState(patterns);

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', false));

    expect(state.patternResults[0].isCorrect).toBe(true); // 1/2 = 50%
  });

  it('should mark pattern as failed if < 50% correct', () => {
    const patterns = [createPattern('1')];
    let state = createReviewSessionState(patterns, ['discrimination', 'dictation', 'speed']);

    state = recordReviewExerciseResult(state, createResult('discrimination', false));
    state = recordReviewExerciseResult(state, createResult('dictation', false));
    state = recordReviewExerciseResult(state, createResult('speed', true));

    expect(state.patternResults[0].isCorrect).toBe(false); // 1/3 = 33%
  });

  it('should capture pattern info in results', () => {
    const patterns = [createPattern('test-pattern')];
    let state = createReviewSessionState(patterns);

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    expect(state.patternResults[0].patternId).toBe('test-pattern');
    expect(state.patternResults[0].patternTitle).toBe('Pattern test-pattern');
    expect(state.patternResults[0].category).toBe('weak-forms');
  });
});

describe('getReviewProgress', () => {
  it('should return initial progress', () => {
    const patterns = [createPattern('1'), createPattern('2'), createPattern('3')];
    const state = createReviewSessionState(patterns);
    const progress = getReviewProgress(state);

    expect(progress.currentPattern).toBe(1);
    expect(progress.totalPatterns).toBe(3);
    expect(progress.currentExercise).toBe(1);
    expect(progress.totalExercises).toBe(2);
    expect(progress.overallPercentage).toBe(0);
  });

  it('should update percentage as exercises complete', () => {
    const patterns = [createPattern('1'), createPattern('2')];
    let state = createReviewSessionState(patterns);

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    let progress = getReviewProgress(state);
    expect(progress.overallPercentage).toBe(25); // 1/4 exercises done

    state = recordReviewExerciseResult(state, createResult('dictation', true));
    progress = getReviewProgress(state);
    expect(progress.overallPercentage).toBe(50); // 2/4 exercises done
  });

  it('should show 100% when complete', () => {
    let state = createReviewSessionState([createPattern('1')]);
    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    const progress = getReviewProgress(state);
    expect(progress.overallPercentage).toBe(100);
  });

  it('should return 100% for empty patterns', () => {
    const state = createReviewSessionState([]);
    const progress = getReviewProgress(state);
    expect(progress.overallPercentage).toBe(100);
  });
});

describe('createReviewSessionResult', () => {
  it('should create result with pattern stats', () => {
    const patterns = [createPattern('1'), createPattern('2')];
    let state = createReviewSessionState(patterns);

    // Complete all exercises
    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));
    state = recordReviewExerciseResult(state, createResult('discrimination', false));
    state = recordReviewExerciseResult(state, createResult('dictation', false));

    const result = createReviewSessionResult(state);

    expect(result.patternsReviewed).toBe(2);
    expect(result.patternsPassed).toBe(1);
    expect(result.patternsFailed).toBe(1);
    expect(result.accuracy).toBe(50);
  });

  it('should include all pattern results', () => {
    const patterns = [createPattern('1')];
    let state = createReviewSessionState(patterns);

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    const result = createReviewSessionResult(state);

    expect(result.patternResults).toHaveLength(1);
    expect(result.patternResults[0].exerciseResults).toHaveLength(2);
  });

  it('should calculate total time', () => {
    const patterns = [createPattern('1')];
    let state = createReviewSessionState(patterns);
    state = { ...state, startTime: Date.now() - 5000 }; // 5 seconds ago

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    const result = createReviewSessionResult(state);

    expect(result.totalTimeMs).toBeGreaterThanOrEqual(5000);
  });

  it('should handle empty session', () => {
    const state = createReviewSessionState([]);
    const result = createReviewSessionResult(state);

    expect(result.patternsReviewed).toBe(0);
    expect(result.accuracy).toBe(0);
    expect(result.patternResults).toHaveLength(0);
  });
});

describe('getPatternsRemaining', () => {
  it('should return total patterns initially', () => {
    const patterns = [createPattern('1'), createPattern('2'), createPattern('3')];
    const state = createReviewSessionState(patterns);
    expect(getPatternsRemaining(state)).toBe(3);
  });

  it('should decrease as patterns are completed', () => {
    const patterns = [createPattern('1'), createPattern('2')];
    let state = createReviewSessionState(patterns);

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    expect(getPatternsRemaining(state)).toBe(1);
  });

  it('should return 0 when complete', () => {
    let state = createReviewSessionState([createPattern('1')]);
    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    expect(getPatternsRemaining(state)).toBe(0);
  });
});

describe('hasPatterns', () => {
  it('should return true when patterns exist', () => {
    const state = createReviewSessionState([createPattern('1')]);
    expect(hasPatterns(state)).toBe(true);
  });

  it('should return false for empty patterns', () => {
    const state = createReviewSessionState([]);
    expect(hasPatterns(state)).toBe(false);
  });
});

describe('formatReviewProgress', () => {
  it('should format progress string', () => {
    const patterns = [createPattern('1'), createPattern('2'), createPattern('3')];
    const state = createReviewSessionState(patterns);
    expect(formatReviewProgress(state)).toBe('Pattern 1/3');
  });

  it('should update as patterns are completed', () => {
    const patterns = [createPattern('1'), createPattern('2')];
    let state = createReviewSessionState(patterns);

    state = recordReviewExerciseResult(state, createResult('discrimination', true));
    state = recordReviewExerciseResult(state, createResult('dictation', true));

    expect(formatReviewProgress(state)).toBe('Pattern 2/2');
  });
});

// Helper functions for creating test data

function createPattern(id: string): ProgressWithPattern {
  return {
    id: `progress-${id}`,
    user_id: 'user-123',
    pattern_id: id,
    mastery_score: 50,
    times_practiced: 5,
    times_correct: 4,
    last_practiced_at: '2025-01-10T00:00:00Z',
    next_review_at: '2025-01-15T00:00:00Z',
    ease_factor: 2.5,
    interval_days: 3,
    created_at: '2025-01-01T00:00:00Z',
    patterns: {
      id,
      category: 'weak-forms',
      level: 1,
      title: `Pattern ${id}`,
      description: `Description for pattern ${id}`,
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

function createResult(
  exerciseType: 'discrimination' | 'dictation' | 'speed',
  isCorrect: boolean
): ExerciseSessionResult {
  return {
    exerciseType,
    isCorrect,
    responseTimeMs: 1000,
  };
}
