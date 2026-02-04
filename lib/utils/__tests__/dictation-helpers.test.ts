import {
  createInitialState,
  normalizeText,
  levenshteinDistance,
  calculateSimilarity,
  isAnswerAcceptable,
  highlightPatterns,
  createResult,
  canReplay,
  canSubmit,
  DictationState,
  DictationResult,
  TextSegment,
} from '../dictation-helpers';

describe('createInitialState', () => {
  it('should initialize userInput to empty string', () => {
    const state = createInitialState();
    expect(state.userInput).toBe('');
  });

  it('should initialize hasSubmitted to false', () => {
    const state = createInitialState();
    expect(state.hasSubmitted).toBe(false);
  });

  it('should initialize isCorrect to null', () => {
    const state = createInitialState();
    expect(state.isCorrect).toBeNull();
  });

  it('should initialize replaysUsed to 0', () => {
    const state = createInitialState();
    expect(state.replaysUsed).toBe(0);
  });

  it('should set startTime to current timestamp', () => {
    const before = Date.now();
    const state = createInitialState();
    const after = Date.now();

    expect(state.startTime).toBeGreaterThanOrEqual(before);
    expect(state.startTime).toBeLessThanOrEqual(after);
  });
});

describe('normalizeText', () => {
  it('should convert to lowercase', () => {
    expect(normalizeText('Hello World')).toBe('hello world');
    expect(normalizeText('UPPERCASE')).toBe('uppercase');
  });

  it('should remove punctuation', () => {
    expect(normalizeText('Hello, world!')).toBe('hello world');
    expect(normalizeText("What's up?")).toBe('whats up');
    expect(normalizeText('Wait... really?!')).toBe('wait really');
  });

  it('should collapse multiple spaces', () => {
    expect(normalizeText('hello    world')).toBe('hello world');
    expect(normalizeText('  multiple   spaces  ')).toBe('multiple spaces');
  });

  it('should trim whitespace', () => {
    expect(normalizeText('  hello  ')).toBe('hello');
    expect(normalizeText('\thello\n')).toBe('hello');
  });

  it('should handle empty string', () => {
    expect(normalizeText('')).toBe('');
  });

  it('should handle complex sentences', () => {
    expect(normalizeText("I wanna go to the store!")).toBe('i wanna go to the store');
    expect(normalizeText("What do you want to do?")).toBe('what do you want to do');
  });
});

describe('levenshteinDistance', () => {
  it('should return 0 for identical strings', () => {
    expect(levenshteinDistance('hello', 'hello')).toBe(0);
    expect(levenshteinDistance('', '')).toBe(0);
  });

  it('should return length of other string when one is empty', () => {
    expect(levenshteinDistance('hello', '')).toBe(5);
    expect(levenshteinDistance('', 'hello')).toBe(5);
  });

  it('should calculate single character substitution', () => {
    expect(levenshteinDistance('cat', 'bat')).toBe(1);
    expect(levenshteinDistance('hello', 'hallo')).toBe(1);
  });

  it('should calculate single character insertion', () => {
    expect(levenshteinDistance('cat', 'cats')).toBe(1);
    expect(levenshteinDistance('hello', 'hellos')).toBe(1);
  });

  it('should calculate single character deletion', () => {
    expect(levenshteinDistance('cats', 'cat')).toBe(1);
    expect(levenshteinDistance('hello', 'hell')).toBe(1);
  });

  it('should calculate multiple edits', () => {
    expect(levenshteinDistance('kitten', 'sitting')).toBe(3);
    expect(levenshteinDistance('sunday', 'saturday')).toBe(3);
  });
});

describe('calculateSimilarity', () => {
  it('should return 100 for identical strings', () => {
    expect(calculateSimilarity('hello', 'hello')).toBe(100);
  });

  it('should return 100 for strings differing only in case/punctuation', () => {
    expect(calculateSimilarity('Hello!', 'hello')).toBe(100);
    expect(calculateSimilarity('What?', 'what')).toBe(100);
  });

  it('should return 0 for empty input', () => {
    expect(calculateSimilarity('', 'hello')).toBe(0);
  });

  it('should return 0 for empty correct answer', () => {
    expect(calculateSimilarity('hello', '')).toBe(0);
  });

  it('should return high similarity for minor typos', () => {
    const similarity = calculateSimilarity('I wanna go', 'I wanna goo');
    expect(similarity).toBeGreaterThan(80);
  });

  it('should return low similarity for very different strings', () => {
    const similarity = calculateSimilarity('hello', 'xyz');
    expect(similarity).toBeLessThan(50);
  });

  it('should handle word substitutions', () => {
    const similarity = calculateSimilarity('I want to go', 'I wanna go');
    expect(similarity).toBeGreaterThan(60);
    expect(similarity).toBeLessThan(100);
  });
});

describe('isAnswerAcceptable', () => {
  it('should accept exact match', () => {
    expect(isAnswerAcceptable('I wanna go', 'I wanna go', [])).toBe(true);
  });

  it('should accept case-insensitive match', () => {
    expect(isAnswerAcceptable('i wanna go', 'I Wanna Go', [])).toBe(true);
  });

  it('should accept punctuation variations', () => {
    expect(isAnswerAcceptable('I wanna go!', 'I wanna go', [])).toBe(true);
    expect(isAnswerAcceptable('I wanna go?', 'I wanna go.', [])).toBe(true);
  });

  it('should accept answers from acceptableAnswers list', () => {
    expect(
      isAnswerAcceptable('I want to go', 'I wanna go', ['I want to go', 'i wanna go'])
    ).toBe(true);
  });

  it('should accept answers above similarity threshold', () => {
    // Minor typo should still be accepted
    expect(isAnswerAcceptable('I wana go', 'I wanna go', [], 80)).toBe(true);
  });

  it('should reject answers below similarity threshold', () => {
    expect(isAnswerAcceptable('something else', 'I wanna go', [])).toBe(false);
  });

  it('should use custom similarity threshold', () => {
    // With strict threshold, minor differences are rejected
    expect(isAnswerAcceptable('I wana go', 'I wanna go', [], 95)).toBe(false);
    // With lenient threshold, they're accepted
    expect(isAnswerAcceptable('I wana go', 'I wanna go', [], 70)).toBe(true);
  });
});

describe('highlightPatterns', () => {
  it('should return single segment when no patterns', () => {
    const result = highlightPatterns('Hello world', []);
    expect(result).toEqual([{ text: 'Hello world', isHighlighted: false }]);
  });

  it('should return single segment when patterns is undefined-like', () => {
    const result = highlightPatterns('Hello world', []);
    expect(result.length).toBe(1);
    expect(result[0].isHighlighted).toBe(false);
  });

  it('should highlight single pattern', () => {
    const result = highlightPatterns('I wanna go home', ['wanna']);
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ text: 'I ', isHighlighted: false });
    expect(result[1]).toEqual({ text: 'wanna', isHighlighted: true });
    expect(result[2]).toEqual({ text: ' go home', isHighlighted: false });
  });

  it('should highlight multiple patterns', () => {
    const result = highlightPatterns('I wanna go to the store', ['wanna', 'to the']);
    const highlighted = result.filter((s) => s.isHighlighted);
    expect(highlighted).toHaveLength(2);
    expect(highlighted[0].text).toBe('wanna');
    expect(highlighted[1].text).toBe('to the');
  });

  it('should be case-insensitive', () => {
    const result = highlightPatterns('I WANNA go', ['wanna']);
    const highlighted = result.filter((s) => s.isHighlighted);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].text).toBe('WANNA');
  });

  it('should handle pattern at start', () => {
    const result = highlightPatterns('wanna go home', ['wanna']);
    expect(result[0]).toEqual({ text: 'wanna', isHighlighted: true });
  });

  it('should handle pattern at end', () => {
    const result = highlightPatterns('I just wanna', ['wanna']);
    expect(result[result.length - 1]).toEqual({ text: 'wanna', isHighlighted: true });
  });

  it('should handle overlapping patterns (longer first)', () => {
    const result = highlightPatterns('gonna be', ['gonna', 'gon']);
    const highlighted = result.filter((s) => s.isHighlighted);
    // Should match 'gonna' not 'gon'
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].text).toBe('gonna');
  });
});

describe('createResult', () => {
  const mockState: DictationState = {
    userInput: 'I wanna go home',
    hasSubmitted: true,
    isCorrect: true,
    replaysUsed: 2,
    startTime: Date.now() - 10000, // 10 seconds ago
  };

  it('should include exerciseId', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.exerciseId).toBe('ex-123');
  });

  it('should include patternId', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.patternId).toBe('pat-456');
  });

  it('should include userInput', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.userInput).toBe('I wanna go home');
  });

  it('should include correctAnswer', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.correctAnswer).toBe('I wanna go home');
  });

  it('should set isCorrect to true for matching answer', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.isCorrect).toBe(true);
  });

  it('should set isCorrect to false for non-matching answer', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'Something else');
    expect(result.isCorrect).toBe(false);
  });

  it('should calculate similarityScore', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.similarityScore).toBe(100);
  });

  it('should calculate responseTimeMs from startTime', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(10000);
    expect(result.responseTimeMs).toBeLessThan(11000);
  });

  it('should include replaysUsed', () => {
    const result = createResult('ex-123', 'pat-456', mockState, 'I wanna go home');
    expect(result.replaysUsed).toBe(2);
  });

  it('should accept answers from acceptableAnswers', () => {
    const stateWithAlt: DictationState = {
      ...mockState,
      userInput: 'I want to go home',
    };
    const result = createResult('ex-123', 'pat-456', stateWithAlt, 'I wanna go home', [
      'I want to go home',
    ]);
    expect(result.isCorrect).toBe(true);
  });
});

describe('canReplay', () => {
  it('should return true when replays remaining', () => {
    expect(canReplay(0, 3)).toBe(true);
    expect(canReplay(1, 3)).toBe(true);
    expect(canReplay(2, 3)).toBe(true);
  });

  it('should return false when no replays remaining', () => {
    expect(canReplay(3, 3)).toBe(false);
    expect(canReplay(4, 3)).toBe(false);
  });

  it('should work with different max values', () => {
    expect(canReplay(0, 5)).toBe(true);
    expect(canReplay(4, 5)).toBe(true);
    expect(canReplay(5, 5)).toBe(false);
  });

  it('should return false when maxReplays is 0', () => {
    expect(canReplay(0, 0)).toBe(false);
  });
});

describe('canSubmit', () => {
  it('should return true when input is non-empty and not submitted', () => {
    const state: DictationState = {
      userInput: 'some answer',
      hasSubmitted: false,
      isCorrect: null,
      replaysUsed: 0,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(true);
  });

  it('should return false when input is empty', () => {
    const state: DictationState = {
      userInput: '',
      hasSubmitted: false,
      isCorrect: null,
      replaysUsed: 0,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(false);
  });

  it('should return false when input is only whitespace', () => {
    const state: DictationState = {
      userInput: '   ',
      hasSubmitted: false,
      isCorrect: null,
      replaysUsed: 0,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(false);
  });

  it('should return false when already submitted', () => {
    const state: DictationState = {
      userInput: 'some answer',
      hasSubmitted: true,
      isCorrect: true,
      replaysUsed: 0,
      startTime: Date.now(),
    };
    expect(canSubmit(state)).toBe(false);
  });
});

describe('DictationResult interface', () => {
  it('should have correct shape', () => {
    const result: DictationResult = {
      exerciseId: 'dict-wanna-001',
      patternId: 'reduction-wanna',
      userInput: 'I wanna go home',
      correctAnswer: 'I wanna go home',
      isCorrect: true,
      similarityScore: 100,
      responseTimeMs: 5000,
      replaysUsed: 1,
    };

    expect(Object.keys(result)).toHaveLength(8);
  });
});

describe('TextSegment interface', () => {
  it('should have correct shape', () => {
    const segment: TextSegment = {
      text: 'wanna',
      isHighlighted: true,
    };

    expect(Object.keys(segment)).toHaveLength(2);
    expect(segment.text).toBe('wanna');
    expect(segment.isHighlighted).toBe(true);
  });
});
