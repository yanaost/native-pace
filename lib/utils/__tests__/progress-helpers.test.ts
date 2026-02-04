import {
  VALID_EXERCISE_TYPES,
  validateAttemptRequest,
  parseAttemptRequest,
  calculateNewMastery,
  isPatternLearned,
  createAttemptRecord,
  createProgressRecord,
  RecordAttemptRequest,
} from '../progress-helpers';
import type { ExerciseType } from '@/types/exercise';

describe('VALID_EXERCISE_TYPES', () => {
  it('should contain all four exercise types', () => {
    expect(VALID_EXERCISE_TYPES).toContain('comparison');
    expect(VALID_EXERCISE_TYPES).toContain('discrimination');
    expect(VALID_EXERCISE_TYPES).toContain('dictation');
    expect(VALID_EXERCISE_TYPES).toContain('speed');
  });

  it('should have exactly 4 types', () => {
    expect(VALID_EXERCISE_TYPES).toHaveLength(4);
  });
});

describe('validateAttemptRequest', () => {
  const validRequest = {
    patternId: 'pattern-123',
    exerciseType: 'dictation',
    isCorrect: true,
    responseTimeMs: 5000,
  };

  it('should return valid for a complete valid request', () => {
    const result = validateAttemptRequest(validRequest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return invalid for null body', () => {
    const result = validateAttemptRequest(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Request body must be an object');
  });

  it('should return invalid for non-object body', () => {
    const result = validateAttemptRequest('string');
    expect(result.valid).toBe(false);
  });

  it('should require patternId', () => {
    const request = { ...validRequest, patternId: undefined };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('patternId'))).toBe(true);
  });

  it('should require patternId to be a string', () => {
    const request = { ...validRequest, patternId: 123 };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('patternId'))).toBe(true);
  });

  it('should require exerciseType', () => {
    const request = { ...validRequest, exerciseType: undefined };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('exerciseType'))).toBe(true);
  });

  it('should validate exerciseType is a valid type', () => {
    const request = { ...validRequest, exerciseType: 'invalid' };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('exerciseType'))).toBe(true);
  });

  it('should accept all valid exercise types', () => {
    VALID_EXERCISE_TYPES.forEach((type) => {
      const request = { ...validRequest, exerciseType: type };
      const result = validateAttemptRequest(request);
      expect(result.valid).toBe(true);
    });
  });

  it('should require isCorrect', () => {
    const request = { ...validRequest, isCorrect: undefined };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('isCorrect'))).toBe(true);
  });

  it('should require isCorrect to be a boolean', () => {
    const request = { ...validRequest, isCorrect: 'true' };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
  });

  it('should require responseTimeMs', () => {
    const request = { ...validRequest, responseTimeMs: undefined };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('responseTimeMs'))).toBe(true);
  });

  it('should require responseTimeMs to be non-negative', () => {
    const request = { ...validRequest, responseTimeMs: -100 };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
  });

  it('should accept 0 for responseTimeMs', () => {
    const request = { ...validRequest, responseTimeMs: 0 };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(true);
  });

  it('should accept optional userInput when string', () => {
    const request = { ...validRequest, userInput: 'user typed this' };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(true);
  });

  it('should reject userInput when not string', () => {
    const request = { ...validRequest, userInput: 123 };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
  });

  it('should accept optional sessionId when string', () => {
    const request = { ...validRequest, sessionId: 'session-123' };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(true);
  });

  it('should reject sessionId when not string', () => {
    const request = { ...validRequest, sessionId: 123 };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
  });

  it('should collect multiple errors', () => {
    const request = { someOtherField: 'value' };
    const result = validateAttemptRequest(request);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});

describe('parseAttemptRequest', () => {
  it('should parse a valid request', () => {
    const body = {
      patternId: 'pattern-123',
      exerciseType: 'dictation',
      isCorrect: true,
      responseTimeMs: 5000,
    };

    const result = parseAttemptRequest(body);

    expect(result.patternId).toBe('pattern-123');
    expect(result.exerciseType).toBe('dictation');
    expect(result.isCorrect).toBe(true);
    expect(result.responseTimeMs).toBe(5000);
  });

  it('should parse optional fields', () => {
    const body = {
      patternId: 'pattern-123',
      exerciseType: 'dictation',
      isCorrect: false,
      responseTimeMs: 3000,
      userInput: 'typed answer',
      sessionId: 'session-456',
    };

    const result = parseAttemptRequest(body);

    expect(result.userInput).toBe('typed answer');
    expect(result.sessionId).toBe('session-456');
  });

  it('should set optional fields to undefined when not provided', () => {
    const body = {
      patternId: 'pattern-123',
      exerciseType: 'comparison',
      isCorrect: true,
      responseTimeMs: 2000,
    };

    const result = parseAttemptRequest(body);

    expect(result.userInput).toBeUndefined();
    expect(result.sessionId).toBeUndefined();
  });
});

describe('calculateNewMastery', () => {
  it('should increase mastery for correct answer', () => {
    const newMastery = calculateNewMastery(50, true, 'dictation');
    expect(newMastery).toBeGreaterThan(50);
  });

  it('should decrease mastery for incorrect answer', () => {
    const newMastery = calculateNewMastery(50, false, 'dictation');
    expect(newMastery).toBeLessThan(50);
  });

  it('should not exceed 100', () => {
    const newMastery = calculateNewMastery(95, true, 'dictation');
    expect(newMastery).toBeLessThanOrEqual(100);
  });

  it('should not go below 0', () => {
    const newMastery = calculateNewMastery(5, false, 'dictation');
    expect(newMastery).toBeGreaterThanOrEqual(0);
  });

  it('should return integer values', () => {
    const newMastery = calculateNewMastery(33, true, 'comparison');
    expect(Number.isInteger(newMastery)).toBe(true);
  });

  it('should weight dictation more than comparison', () => {
    const dictationIncrease = calculateNewMastery(50, true, 'dictation') - 50;
    const comparisonIncrease = calculateNewMastery(50, true, 'comparison') - 50;
    expect(dictationIncrease).toBeGreaterThan(comparisonIncrease);
  });

  it('should handle 0 mastery', () => {
    const newMastery = calculateNewMastery(0, true, 'discrimination');
    expect(newMastery).toBeGreaterThan(0);
  });

  it('should handle 100 mastery', () => {
    const newMastery = calculateNewMastery(100, false, 'speed');
    expect(newMastery).toBeLessThan(100);
  });

  it('should work with all exercise types', () => {
    const types: ExerciseType[] = ['comparison', 'discrimination', 'dictation', 'speed'];
    types.forEach((type) => {
      const result = calculateNewMastery(50, true, type);
      expect(result).toBeGreaterThan(50);
    });
  });
});

describe('isPatternLearned', () => {
  it('should return true when mastery >= 50', () => {
    expect(isPatternLearned(50)).toBe(true);
    expect(isPatternLearned(75)).toBe(true);
    expect(isPatternLearned(100)).toBe(true);
  });

  it('should return false when mastery < 50', () => {
    expect(isPatternLearned(0)).toBe(false);
    expect(isPatternLearned(25)).toBe(false);
    expect(isPatternLearned(49)).toBe(false);
  });

  it('should use custom threshold', () => {
    expect(isPatternLearned(70, 80)).toBe(false);
    expect(isPatternLearned(80, 80)).toBe(true);
    expect(isPatternLearned(90, 80)).toBe(true);
  });
});

describe('createAttemptRecord', () => {
  it('should create record with all required fields', () => {
    const request: RecordAttemptRequest = {
      patternId: 'pattern-123',
      exerciseType: 'dictation',
      isCorrect: true,
      responseTimeMs: 5000,
    };

    const record = createAttemptRecord('user-456', request);

    expect(record.user_id).toBe('user-456');
    expect(record.pattern_id).toBe('pattern-123');
    expect(record.exercise_type).toBe('dictation');
    expect(record.is_correct).toBe(true);
    expect(record.response_time_ms).toBe(5000);
    expect(record.user_input).toBeNull();
  });

  it('should include user input when provided', () => {
    const request: RecordAttemptRequest = {
      patternId: 'pattern-123',
      exerciseType: 'dictation',
      isCorrect: false,
      responseTimeMs: 3000,
      userInput: 'I wanna go',
    };

    const record = createAttemptRecord('user-456', request);

    expect(record.user_input).toBe('I wanna go');
  });
});

describe('createProgressRecord', () => {
  it('should create record with all fields', () => {
    const nextReview = new Date('2025-01-15T12:00:00Z');

    const record = createProgressRecord(
      'user-123',
      'pattern-456',
      75,
      10,
      8,
      2.5,
      6,
      nextReview
    );

    expect(record.user_id).toBe('user-123');
    expect(record.pattern_id).toBe('pattern-456');
    expect(record.mastery_score).toBe(75);
    expect(record.times_practiced).toBe(10);
    expect(record.times_correct).toBe(8);
    expect(record.ease_factor).toBe(2.5);
    expect(record.interval_days).toBe(6);
    expect(record.next_review_at).toBe('2025-01-15T12:00:00.000Z');
  });

  it('should set last_practiced_at to current time', () => {
    const before = new Date();
    const record = createProgressRecord(
      'user-123',
      'pattern-456',
      50,
      1,
      1,
      2.5,
      1,
      new Date()
    );
    const after = new Date();

    const lastPracticed = new Date(record.last_practiced_at);
    expect(lastPracticed.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(lastPracticed.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should format dates as ISO strings', () => {
    const nextReview = new Date();
    const record = createProgressRecord(
      'user-123',
      'pattern-456',
      50,
      1,
      1,
      2.5,
      1,
      nextReview
    );

    expect(record.last_practiced_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(record.next_review_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
