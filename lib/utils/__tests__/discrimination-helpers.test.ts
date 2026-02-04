import {
  createInitialState,
  checkAnswer,
  createResult,
  validateOptions,
  canSubmit,
  DiscriminationState,
  DiscriminationResult,
} from '../discrimination-helpers';

describe('createInitialState', () => {
  it('should initialize selectedOption to null', () => {
    const state = createInitialState();
    expect(state.selectedOption).toBeNull();
  });

  it('should initialize hasSubmitted to false', () => {
    const state = createInitialState();
    expect(state.hasSubmitted).toBe(false);
  });

  it('should initialize isCorrect to null', () => {
    const state = createInitialState();
    expect(state.isCorrect).toBeNull();
  });

  it('should set startTime to current timestamp', () => {
    const before = Date.now();
    const state = createInitialState();
    const after = Date.now();

    expect(state.startTime).toBeGreaterThanOrEqual(before);
    expect(state.startTime).toBeLessThanOrEqual(after);
  });
});

describe('checkAnswer', () => {
  it('should return true for exact match', () => {
    expect(checkAnswer('wanna', 'wanna')).toBe(true);
  });

  it('should return true for case-insensitive match', () => {
    expect(checkAnswer('Wanna', 'wanna')).toBe(true);
    expect(checkAnswer('WANNA', 'wanna')).toBe(true);
    expect(checkAnswer('wanna', 'WANNA')).toBe(true);
  });

  it('should return true when trimming whitespace', () => {
    expect(checkAnswer('  wanna  ', 'wanna')).toBe(true);
    expect(checkAnswer('wanna', '  wanna  ')).toBe(true);
    expect(checkAnswer('  wanna  ', '  wanna  ')).toBe(true);
  });

  it('should return false for different answers', () => {
    expect(checkAnswer('wanna', 'gonna')).toBe(false);
    expect(checkAnswer('want to', 'wanna')).toBe(false);
  });

  it('should return false for partial matches', () => {
    expect(checkAnswer('wan', 'wanna')).toBe(false);
    expect(checkAnswer('wannabe', 'wanna')).toBe(false);
  });

  it('should handle empty strings', () => {
    expect(checkAnswer('', '')).toBe(true);
    expect(checkAnswer('wanna', '')).toBe(false);
    expect(checkAnswer('', 'wanna')).toBe(false);
  });
});

describe('createResult', () => {
  const mockState: DiscriminationState = {
    selectedOption: 'wanna',
    hasSubmitted: true,
    isCorrect: true,
    startTime: Date.now() - 5000, // 5 seconds ago
  };

  it('should include exerciseId', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'wanna');
    expect(result.exerciseId).toBe('ex-123');
  });

  it('should include patternId', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'wanna');
    expect(result.patternId).toBe('pat-456');
  });

  it('should include selectedAnswer', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'wanna');
    expect(result.selectedAnswer).toBe('wanna');
  });

  it('should include correctAnswer', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'wanna');
    expect(result.correctAnswer).toBe('wanna');
  });

  it('should set isCorrect to true for matching answer', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'wanna');
    expect(result.isCorrect).toBe(true);
  });

  it('should set isCorrect to false for non-matching answer', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'gonna');
    expect(result.isCorrect).toBe(false);
  });

  it('should calculate responseTimeMs from startTime', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'wanna');
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(5000);
    expect(result.responseTimeMs).toBeLessThan(6000); // Allow some margin
  });

  it('should handle null selectedOption', () => {
    const stateWithNull: DiscriminationState = {
      ...mockState,
      selectedOption: null,
    };
    const result = createResult('ex-123', 'pat-456', stateWithNull, 'wanna');
    expect(result.selectedAnswer).toBeNull();
    expect(result.isCorrect).toBe(false);
  });
});

describe('validateOptions', () => {
  it('should return true for valid options array with 3 options', () => {
    expect(validateOptions(['a', 'b', 'c'])).toBe(true);
  });

  it('should return true for valid options array with 4 options', () => {
    expect(validateOptions(['a', 'b', 'c', 'd'])).toBe(true);
  });

  it('should return true for 2 options (minimum default)', () => {
    expect(validateOptions(['a', 'b'])).toBe(true);
  });

  it('should return true for 6 options (maximum default)', () => {
    expect(validateOptions(['a', 'b', 'c', 'd', 'e', 'f'])).toBe(true);
  });

  it('should return false for less than minimum options', () => {
    expect(validateOptions(['a'])).toBe(false);
    expect(validateOptions([])).toBe(false);
  });

  it('should return false for more than maximum options', () => {
    expect(validateOptions(['a', 'b', 'c', 'd', 'e', 'f', 'g'])).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(validateOptions(undefined)).toBe(false);
  });

  it('should return false for non-array', () => {
    expect(validateOptions('not an array' as unknown as string[])).toBe(false);
  });

  it('should respect custom minOptions', () => {
    expect(validateOptions(['a', 'b', 'c'], 3)).toBe(true);
    expect(validateOptions(['a', 'b'], 3)).toBe(false);
  });

  it('should respect custom maxOptions', () => {
    expect(validateOptions(['a', 'b', 'c'], 2, 3)).toBe(true);
    expect(validateOptions(['a', 'b', 'c', 'd'], 2, 3)).toBe(false);
  });
});

describe('canSubmit', () => {
  it('should return true when option is selected and not submitted', () => {
    const state: DiscriminationState = {
      selectedOption: 'wanna',
      hasSubmitted: false,
      isCorrect: null,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(true);
  });

  it('should return false when no option is selected', () => {
    const state: DiscriminationState = {
      selectedOption: null,
      hasSubmitted: false,
      isCorrect: null,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(false);
  });

  it('should return false when already submitted', () => {
    const state: DiscriminationState = {
      selectedOption: 'wanna',
      hasSubmitted: true,
      isCorrect: true,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(false);
  });

  it('should return false when no option and already submitted', () => {
    const state: DiscriminationState = {
      selectedOption: null,
      hasSubmitted: true,
      isCorrect: false,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(false);
  });
});

describe('DiscriminationResult interface', () => {
  it('should have correct shape', () => {
    const result: DiscriminationResult = {
      exerciseId: 'disc-wanna-001',
      patternId: 'reduction-wanna',
      selectedAnswer: 'wanna',
      correctAnswer: 'wanna',
      isCorrect: true,
      responseTimeMs: 3500,
    };

    expect(Object.keys(result)).toHaveLength(6);
    expect(result.exerciseId).toBe('disc-wanna-001');
    expect(result.patternId).toBe('reduction-wanna');
    expect(result.selectedAnswer).toBe('wanna');
    expect(result.correctAnswer).toBe('wanna');
    expect(result.isCorrect).toBe(true);
    expect(result.responseTimeMs).toBe(3500);
  });
});

describe('DiscriminationState interface', () => {
  it('should have correct shape', () => {
    const state: DiscriminationState = {
      selectedOption: 'gonna',
      hasSubmitted: false,
      isCorrect: null,
      startTime: 1704067200000,
    };

    expect(Object.keys(state)).toHaveLength(4);
    expect(state.selectedOption).toBe('gonna');
    expect(state.hasSubmitted).toBe(false);
    expect(state.isCorrect).toBeNull();
    expect(state.startTime).toBe(1704067200000);
  });
});
