import {
  DEFAULT_SPEED_LEVELS,
  createInitialState,
  getCurrentSpeed,
  recordComprehension,
  calculateComfortableSpeed,
  createResult,
  formatSpeed,
  getSpeedLabel,
  getProgress,
  isExerciseComplete,
  SpeedTrainingState,
  SpeedLevelResult,
} from '../speed-training-helpers';

describe('DEFAULT_SPEED_LEVELS', () => {
  it('should contain 0.75, 1.0, and 1.25', () => {
    expect(DEFAULT_SPEED_LEVELS).toEqual([0.75, 1.0, 1.25]);
  });

  it('should have 3 levels', () => {
    expect(DEFAULT_SPEED_LEVELS).toHaveLength(3);
  });
});

describe('createInitialState', () => {
  it('should initialize currentSpeedIndex to 0', () => {
    const state = createInitialState();
    expect(state.currentSpeedIndex).toBe(0);
  });

  it('should initialize speedResults from default speed levels', () => {
    const state = createInitialState();
    expect(state.speedResults).toHaveLength(3);
    expect(state.speedResults[0].speed).toBe(0.75);
    expect(state.speedResults[1].speed).toBe(1.0);
    expect(state.speedResults[2].speed).toBe(1.25);
  });

  it('should initialize all speedResults.understood to false', () => {
    const state = createInitialState();
    state.speedResults.forEach((result) => {
      expect(result.understood).toBe(false);
    });
  });

  it('should initialize isComplete to false', () => {
    const state = createInitialState();
    expect(state.isComplete).toBe(false);
  });

  it('should set startTime to current timestamp', () => {
    const before = Date.now();
    const state = createInitialState();
    const after = Date.now();

    expect(state.startTime).toBeGreaterThanOrEqual(before);
    expect(state.startTime).toBeLessThanOrEqual(after);
  });

  it('should use custom speed levels', () => {
    const customLevels = [0.5, 0.75, 1.0, 1.25, 1.5];
    const state = createInitialState(customLevels);

    expect(state.speedResults).toHaveLength(5);
    expect(state.speedResults[0].speed).toBe(0.5);
    expect(state.speedResults[4].speed).toBe(1.5);
  });
});

describe('getCurrentSpeed', () => {
  it('should return first speed when at index 0', () => {
    const state = createInitialState();
    expect(getCurrentSpeed(state)).toBe(0.75);
  });

  it('should return second speed when at index 1', () => {
    const state: SpeedTrainingState = {
      ...createInitialState(),
      currentSpeedIndex: 1,
    };
    expect(getCurrentSpeed(state)).toBe(1.0);
  });

  it('should return null when complete', () => {
    const state: SpeedTrainingState = {
      ...createInitialState(),
      currentSpeedIndex: 3,
      isComplete: true,
    };
    expect(getCurrentSpeed(state)).toBeNull();
  });
});

describe('recordComprehension', () => {
  it('should update understood for current speed', () => {
    const state = createInitialState();
    const newState = recordComprehension(state, true);

    expect(newState.speedResults[0].understood).toBe(true);
  });

  it('should advance to next speed index', () => {
    const state = createInitialState();
    const newState = recordComprehension(state, true);

    expect(newState.currentSpeedIndex).toBe(1);
  });

  it('should set isComplete when all speeds attempted', () => {
    let state = createInitialState();
    state = recordComprehension(state, true);
    state = recordComprehension(state, true);
    state = recordComprehension(state, false);

    expect(state.isComplete).toBe(true);
    expect(state.currentSpeedIndex).toBe(3);
  });

  it('should not modify state if already complete', () => {
    const state: SpeedTrainingState = {
      currentSpeedIndex: 3,
      speedResults: [
        { speed: 0.75, understood: true },
        { speed: 1.0, understood: true },
        { speed: 1.25, understood: false },
      ],
      isComplete: true,
      startTime: Date.now(),
    };

    const newState = recordComprehension(state, true);
    expect(newState).toEqual(state);
  });

  it('should record false when user does not understand', () => {
    const state = createInitialState();
    const newState = recordComprehension(state, false);

    expect(newState.speedResults[0].understood).toBe(false);
  });

  it('should not mutate original state', () => {
    const state = createInitialState();
    const newState = recordComprehension(state, true);

    expect(state.currentSpeedIndex).toBe(0);
    expect(state.speedResults[0].understood).toBe(false);
    expect(newState.currentSpeedIndex).toBe(1);
    expect(newState.speedResults[0].understood).toBe(true);
  });
});

describe('calculateComfortableSpeed', () => {
  it('should return highest understood speed', () => {
    const results: SpeedLevelResult[] = [
      { speed: 0.75, understood: true },
      { speed: 1.0, understood: true },
      { speed: 1.25, understood: false },
    ];

    expect(calculateComfortableSpeed(results)).toBe(1.0);
  });

  it('should return 0 when none understood', () => {
    const results: SpeedLevelResult[] = [
      { speed: 0.75, understood: false },
      { speed: 1.0, understood: false },
      { speed: 1.25, understood: false },
    ];

    expect(calculateComfortableSpeed(results)).toBe(0);
  });

  it('should return highest speed when all understood', () => {
    const results: SpeedLevelResult[] = [
      { speed: 0.75, understood: true },
      { speed: 1.0, understood: true },
      { speed: 1.25, understood: true },
    ];

    expect(calculateComfortableSpeed(results)).toBe(1.25);
  });

  it('should return only understood speed when one understood', () => {
    const results: SpeedLevelResult[] = [
      { speed: 0.75, understood: true },
      { speed: 1.0, understood: false },
      { speed: 1.25, understood: false },
    ];

    expect(calculateComfortableSpeed(results)).toBe(0.75);
  });

  it('should handle non-contiguous understood speeds', () => {
    const results: SpeedLevelResult[] = [
      { speed: 0.75, understood: true },
      { speed: 1.0, understood: false },
      { speed: 1.25, understood: true },
    ];

    expect(calculateComfortableSpeed(results)).toBe(1.25);
  });

  it('should handle empty array', () => {
    expect(calculateComfortableSpeed([])).toBe(0);
  });
});

describe('createResult', () => {
  const mockState: SpeedTrainingState = {
    currentSpeedIndex: 3,
    speedResults: [
      { speed: 0.75, understood: true },
      { speed: 1.0, understood: true },
      { speed: 1.25, understood: false },
    ],
    isComplete: true,
    startTime: Date.now() - 30000, // 30 seconds ago
  };

  it('should include exerciseId', () => {
    const result = createResult('ex-123', 'pat-456', mockState);
    expect(result.exerciseId).toBe('ex-123');
  });

  it('should include patternId', () => {
    const result = createResult('ex-123', 'pat-456', mockState);
    expect(result.patternId).toBe('pat-456');
  });

  it('should include speedResults', () => {
    const result = createResult('ex-123', 'pat-456', mockState);
    expect(result.speedResults).toEqual(mockState.speedResults);
  });

  it('should calculate comfortableSpeed', () => {
    const result = createResult('ex-123', 'pat-456', mockState);
    expect(result.comfortableSpeed).toBe(1.0);
  });

  it('should calculate responseTimeMs', () => {
    const result = createResult('ex-123', 'pat-456', mockState);
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(30000);
    expect(result.responseTimeMs).toBeLessThan(31000);
  });
});

describe('formatSpeed', () => {
  it('should format 0.75 as "0.75x"', () => {
    expect(formatSpeed(0.75)).toBe('0.75x');
  });

  it('should format 1.0 as "1x"', () => {
    expect(formatSpeed(1.0)).toBe('1x');
  });

  it('should format 1.25 as "1.25x"', () => {
    expect(formatSpeed(1.25)).toBe('1.25x');
  });

  it('should format 0.5 as "0.5x"', () => {
    expect(formatSpeed(0.5)).toBe('0.5x');
  });

  it('should format 2 as "2x"', () => {
    expect(formatSpeed(2)).toBe('2x');
  });
});

describe('getSpeedLabel', () => {
  it('should return "Slow" for speeds below 0.9', () => {
    expect(getSpeedLabel(0.5)).toBe('Slow');
    expect(getSpeedLabel(0.75)).toBe('Slow');
    expect(getSpeedLabel(0.89)).toBe('Slow');
  });

  it('should return "Normal" for speeds between 0.9 and 1.1', () => {
    expect(getSpeedLabel(0.9)).toBe('Normal');
    expect(getSpeedLabel(1.0)).toBe('Normal');
    expect(getSpeedLabel(1.1)).toBe('Normal');
  });

  it('should return "Fast" for speeds above 1.1', () => {
    expect(getSpeedLabel(1.11)).toBe('Fast');
    expect(getSpeedLabel(1.25)).toBe('Fast');
    expect(getSpeedLabel(1.5)).toBe('Fast');
    expect(getSpeedLabel(2.0)).toBe('Fast');
  });
});

describe('getProgress', () => {
  it('should return current=1 and percentage=0 at start', () => {
    const state = createInitialState();
    const progress = getProgress(state);

    expect(progress.current).toBe(1);
    expect(progress.total).toBe(3);
    expect(progress.percentage).toBe(0);
  });

  it('should return current=2 and percentage=33 after first response', () => {
    let state = createInitialState();
    state = recordComprehension(state, true);
    const progress = getProgress(state);

    expect(progress.current).toBe(2);
    expect(progress.total).toBe(3);
    expect(progress.percentage).toBe(33);
  });

  it('should return current=3 and percentage=67 after second response', () => {
    let state = createInitialState();
    state = recordComprehension(state, true);
    state = recordComprehension(state, true);
    const progress = getProgress(state);

    expect(progress.current).toBe(3);
    expect(progress.total).toBe(3);
    expect(progress.percentage).toBe(67);
  });

  it('should return current=3 and percentage=100 when complete', () => {
    let state = createInitialState();
    state = recordComprehension(state, true);
    state = recordComprehension(state, true);
    state = recordComprehension(state, false);
    const progress = getProgress(state);

    expect(progress.current).toBe(3);
    expect(progress.total).toBe(3);
    expect(progress.percentage).toBe(100);
  });

  it('should handle custom number of levels', () => {
    const state = createInitialState([0.5, 0.75, 1.0, 1.25, 1.5]);
    const progress = getProgress(state);

    expect(progress.current).toBe(1);
    expect(progress.total).toBe(5);
    expect(progress.percentage).toBe(0);
  });
});

describe('isExerciseComplete', () => {
  it('should return false when not complete', () => {
    const state = createInitialState();
    expect(isExerciseComplete(state)).toBe(false);
  });

  it('should return false after partial completion', () => {
    let state = createInitialState();
    state = recordComprehension(state, true);
    expect(isExerciseComplete(state)).toBe(false);
  });

  it('should return true when complete', () => {
    let state = createInitialState();
    state = recordComprehension(state, true);
    state = recordComprehension(state, true);
    state = recordComprehension(state, false);
    expect(isExerciseComplete(state)).toBe(true);
  });
});

describe('SpeedTrainingState interface', () => {
  it('should have correct shape', () => {
    const state: SpeedTrainingState = {
      currentSpeedIndex: 1,
      speedResults: [
        { speed: 0.75, understood: true },
        { speed: 1.0, understood: false },
      ],
      isComplete: false,
      startTime: 1704067200000,
    };

    expect(Object.keys(state)).toHaveLength(4);
  });
});

describe('SpeedLevelResult interface', () => {
  it('should have correct shape', () => {
    const result: SpeedLevelResult = {
      speed: 1.0,
      understood: true,
    };

    expect(Object.keys(result)).toHaveLength(2);
    expect(result.speed).toBe(1.0);
    expect(result.understood).toBe(true);
  });
});
