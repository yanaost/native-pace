import {
  DEFAULT_EXERCISE_SEQUENCE,
  createSessionState,
  getCurrentStep,
  isPatternViewStep,
  isExerciseStep,
  isSummaryStep,
  advanceStep,
  recordExerciseResult,
  getSessionProgress,
  createSessionResult,
  getExercisesRemaining,
  formatSessionTime,
  PracticeSessionState,
  ExerciseSessionResult,
} from '../practice-session-helpers';

describe('DEFAULT_EXERCISE_SEQUENCE', () => {
  it('should contain all four exercise types', () => {
    expect(DEFAULT_EXERCISE_SEQUENCE).toEqual([
      'comparison',
      'discrimination',
      'dictation',
      'speed',
    ]);
  });

  it('should have 4 exercises', () => {
    expect(DEFAULT_EXERCISE_SEQUENCE).toHaveLength(4);
  });
});

describe('createSessionState', () => {
  it('should initialize with pattern ID', () => {
    const state = createSessionState('pattern-123');
    expect(state.patternId).toBe('pattern-123');
  });

  it('should start at step index 0', () => {
    const state = createSessionState('pattern-123');
    expect(state.currentStepIndex).toBe(0);
  });

  it('should include pattern-view by default', () => {
    const state = createSessionState('pattern-123');
    expect(state.steps[0]).toBe('pattern-view');
  });

  it('should include all default exercises', () => {
    const state = createSessionState('pattern-123');
    expect(state.steps).toContain('comparison');
    expect(state.steps).toContain('discrimination');
    expect(state.steps).toContain('dictation');
    expect(state.steps).toContain('speed');
  });

  it('should end with summary', () => {
    const state = createSessionState('pattern-123');
    expect(state.steps[state.steps.length - 1]).toBe('summary');
  });

  it('should have 6 steps by default (pattern-view + 4 exercises + summary)', () => {
    const state = createSessionState('pattern-123');
    expect(state.steps).toHaveLength(6);
  });

  it('should initialize empty exercise results', () => {
    const state = createSessionState('pattern-123');
    expect(state.exerciseResults).toEqual([]);
  });

  it('should set startTime to current timestamp', () => {
    const before = Date.now();
    const state = createSessionState('pattern-123');
    const after = Date.now();

    expect(state.startTime).toBeGreaterThanOrEqual(before);
    expect(state.startTime).toBeLessThanOrEqual(after);
  });

  it('should initialize isComplete to false', () => {
    const state = createSessionState('pattern-123');
    expect(state.isComplete).toBe(false);
  });

  it('should use custom exercise sequence', () => {
    const state = createSessionState('pattern-123', ['comparison', 'dictation']);
    expect(state.steps).toEqual(['pattern-view', 'comparison', 'dictation', 'summary']);
  });

  it('should skip pattern-view when includePatternView is false', () => {
    const state = createSessionState('pattern-123', DEFAULT_EXERCISE_SEQUENCE, false);
    expect(state.steps[0]).toBe('comparison');
    expect(state.steps).not.toContain('pattern-view');
  });
});

describe('getCurrentStep', () => {
  it('should return pattern-view at index 0', () => {
    const state = createSessionState('pattern-123');
    expect(getCurrentStep(state)).toBe('pattern-view');
  });

  it('should return comparison at index 1', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 1,
    };
    expect(getCurrentStep(state)).toBe('comparison');
  });

  it('should return null when beyond steps', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 10,
    };
    expect(getCurrentStep(state)).toBeNull();
  });
});

describe('isPatternViewStep', () => {
  it('should return true on pattern-view step', () => {
    const state = createSessionState('pattern-123');
    expect(isPatternViewStep(state)).toBe(true);
  });

  it('should return false on exercise step', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 1,
    };
    expect(isPatternViewStep(state)).toBe(false);
  });

  it('should return false on summary step', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 5, // summary
    };
    expect(isPatternViewStep(state)).toBe(false);
  });
});

describe('isExerciseStep', () => {
  it('should return false on pattern-view step', () => {
    const state = createSessionState('pattern-123');
    expect(isExerciseStep(state)).toBe(false);
  });

  it('should return true on comparison step', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 1, // comparison
    };
    expect(isExerciseStep(state)).toBe(true);
  });

  it('should return true on dictation step', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 3, // dictation
    };
    expect(isExerciseStep(state)).toBe(true);
  });

  it('should return false on summary step', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 5, // summary
    };
    expect(isExerciseStep(state)).toBe(false);
  });
});

describe('isSummaryStep', () => {
  it('should return false on pattern-view step', () => {
    const state = createSessionState('pattern-123');
    expect(isSummaryStep(state)).toBe(false);
  });

  it('should return false on exercise step', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 2,
    };
    expect(isSummaryStep(state)).toBe(false);
  });

  it('should return true on summary step', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 5, // summary
    };
    expect(isSummaryStep(state)).toBe(true);
  });
});

describe('advanceStep', () => {
  it('should increment currentStepIndex', () => {
    const state = createSessionState('pattern-123');
    const newState = advanceStep(state);
    expect(newState.currentStepIndex).toBe(1);
  });

  it('should not mutate original state', () => {
    const state = createSessionState('pattern-123');
    const newState = advanceStep(state);
    expect(state.currentStepIndex).toBe(0);
    expect(newState.currentStepIndex).toBe(1);
  });

  it('should set isComplete when reaching end', () => {
    let state = createSessionState('pattern-123');
    // Advance through all steps
    for (let i = 0; i < 6; i++) {
      state = advanceStep(state);
    }
    expect(state.isComplete).toBe(true);
  });

  it('should not advance if already complete', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      currentStepIndex: 6,
      isComplete: true,
    };
    const newState = advanceStep(state);
    expect(newState.currentStepIndex).toBe(6);
  });
});

describe('recordExerciseResult', () => {
  it('should add result to exerciseResults', () => {
    const state = createSessionState('pattern-123');
    const advancedState = advanceStep(state); // Move to first exercise

    const result: ExerciseSessionResult = {
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 5000,
    };

    const newState = recordExerciseResult(advancedState, result);
    expect(newState.exerciseResults).toHaveLength(1);
    expect(newState.exerciseResults[0]).toEqual(result);
  });

  it('should advance to next step', () => {
    const state = createSessionState('pattern-123');
    const advancedState = advanceStep(state);

    const result: ExerciseSessionResult = {
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 5000,
    };

    const newState = recordExerciseResult(advancedState, result);
    expect(newState.currentStepIndex).toBe(2);
  });

  it('should accumulate multiple results', () => {
    let state = createSessionState('pattern-123');
    state = advanceStep(state); // Move to comparison

    const results: ExerciseSessionResult[] = [
      { exerciseType: 'comparison', isCorrect: true, responseTimeMs: 5000 },
      { exerciseType: 'discrimination', isCorrect: false, responseTimeMs: 3000 },
    ];

    state = recordExerciseResult(state, results[0]);
    state = recordExerciseResult(state, results[1]);

    expect(state.exerciseResults).toHaveLength(2);
    expect(state.exerciseResults[0].exerciseType).toBe('comparison');
    expect(state.exerciseResults[1].exerciseType).toBe('discrimination');
  });
});

describe('getSessionProgress', () => {
  it('should return current=1 at start', () => {
    const state = createSessionState('pattern-123');
    const progress = getSessionProgress(state);
    expect(progress.current).toBe(1);
    expect(progress.total).toBe(6);
  });

  it('should calculate percentage based on steps', () => {
    let state = createSessionState('pattern-123');
    state = advanceStep(state);
    state = advanceStep(state);

    const progress = getSessionProgress(state);
    expect(progress.percentage).toBe(40); // 2/5 steps (excluding summary from count)
  });

  it('should return 100% when complete', () => {
    let state = createSessionState('pattern-123');
    for (let i = 0; i < 6; i++) {
      state = advanceStep(state);
    }

    const progress = getSessionProgress(state);
    expect(progress.percentage).toBe(100);
  });
});

describe('createSessionResult', () => {
  it('should include patternId', () => {
    const state = createSessionState('pattern-123');
    const result = createSessionResult(state);
    expect(result.patternId).toBe('pattern-123');
  });

  it('should include exerciseResults', () => {
    let state = createSessionState('pattern-123');
    state = advanceStep(state);
    state = recordExerciseResult(state, {
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 5000,
    });

    const result = createSessionResult(state);
    expect(result.exerciseResults).toHaveLength(1);
  });

  it('should calculate correctCount', () => {
    let state = createSessionState('pattern-123');
    state = advanceStep(state);
    state = recordExerciseResult(state, {
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 5000,
    });
    state = recordExerciseResult(state, {
      exerciseType: 'discrimination',
      isCorrect: false,
      responseTimeMs: 3000,
    });
    state = recordExerciseResult(state, {
      exerciseType: 'dictation',
      isCorrect: true,
      responseTimeMs: 8000,
    });

    const result = createSessionResult(state);
    expect(result.correctCount).toBe(2);
    expect(result.totalCount).toBe(3);
  });

  it('should calculate accuracy', () => {
    let state = createSessionState('pattern-123');
    state = advanceStep(state);
    state = recordExerciseResult(state, {
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 5000,
    });
    state = recordExerciseResult(state, {
      exerciseType: 'discrimination',
      isCorrect: true,
      responseTimeMs: 3000,
    });
    state = recordExerciseResult(state, {
      exerciseType: 'dictation',
      isCorrect: false,
      responseTimeMs: 8000,
    });
    state = recordExerciseResult(state, {
      exerciseType: 'speed',
      isCorrect: true,
      responseTimeMs: 20000,
    });

    const result = createSessionResult(state);
    expect(result.accuracy).toBe(75);
  });

  it('should return 0 accuracy for empty results', () => {
    const state = createSessionState('pattern-123');
    const result = createSessionResult(state);
    expect(result.accuracy).toBe(0);
  });

  it('should calculate totalTimeMs', () => {
    const state: PracticeSessionState = {
      ...createSessionState('pattern-123'),
      startTime: Date.now() - 60000, // 60 seconds ago
    };

    const result = createSessionResult(state);
    expect(result.totalTimeMs).toBeGreaterThanOrEqual(60000);
    expect(result.totalTimeMs).toBeLessThan(61000);
  });
});

describe('getExercisesRemaining', () => {
  it('should return 4 at start', () => {
    const state = createSessionState('pattern-123');
    expect(getExercisesRemaining(state)).toBe(4);
  });

  it('should decrease as exercises complete', () => {
    let state = createSessionState('pattern-123');
    state = advanceStep(state); // Move to comparison
    state = recordExerciseResult(state, {
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 5000,
    });

    expect(getExercisesRemaining(state)).toBe(3);
  });

  it('should return 0 when all exercises complete', () => {
    let state = createSessionState('pattern-123');
    state = advanceStep(state);

    const exercises: ExerciseSessionResult[] = [
      { exerciseType: 'comparison', isCorrect: true, responseTimeMs: 5000 },
      { exerciseType: 'discrimination', isCorrect: true, responseTimeMs: 3000 },
      { exerciseType: 'dictation', isCorrect: true, responseTimeMs: 8000 },
      { exerciseType: 'speed', isCorrect: true, responseTimeMs: 20000 },
    ];

    for (const exercise of exercises) {
      state = recordExerciseResult(state, exercise);
    }

    expect(getExercisesRemaining(state)).toBe(0);
  });

  it('should work with custom exercise sequence', () => {
    const state = createSessionState('pattern-123', ['comparison', 'dictation']);
    expect(getExercisesRemaining(state)).toBe(2);
  });
});

describe('formatSessionTime', () => {
  it('should format seconds under 60', () => {
    expect(formatSessionTime(5000)).toBe('5s');
    expect(formatSessionTime(45000)).toBe('45s');
    expect(formatSessionTime(59000)).toBe('59s');
  });

  it('should format minutes and seconds', () => {
    expect(formatSessionTime(60000)).toBe('1:00');
    expect(formatSessionTime(90000)).toBe('1:30');
    expect(formatSessionTime(125000)).toBe('2:05');
  });

  it('should pad seconds with leading zero', () => {
    expect(formatSessionTime(65000)).toBe('1:05');
    expect(formatSessionTime(301000)).toBe('5:01');
  });

  it('should handle 0 milliseconds', () => {
    expect(formatSessionTime(0)).toBe('0s');
  });

  it('should handle large values', () => {
    expect(formatSessionTime(3600000)).toBe('60:00');
    expect(formatSessionTime(7200000)).toBe('120:00');
  });
});

describe('PracticeSessionState interface', () => {
  it('should have correct shape', () => {
    const state: PracticeSessionState = {
      patternId: 'test-pattern',
      currentStepIndex: 2,
      steps: ['pattern-view', 'comparison', 'summary'],
      exerciseResults: [],
      startTime: 1704067200000,
      isComplete: false,
    };

    expect(Object.keys(state)).toHaveLength(6);
  });
});

describe('ExerciseSessionResult interface', () => {
  it('should have correct shape', () => {
    const result: ExerciseSessionResult = {
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 5000,
    };

    expect(Object.keys(result)).toHaveLength(3);
  });
});
