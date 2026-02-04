import {
  createInitialResult,
  hasListenedToBoth,
  AudioComparisonResult,
} from '@/lib/utils/audio-comparison-helpers';

describe('createInitialResult', () => {
  it('should create result with the given pattern ID', () => {
    const result = createInitialResult('test-pattern-id');
    expect(result.patternId).toBe('test-pattern-id');
  });

  it('should initialize listenedSlow to false', () => {
    const result = createInitialResult('test-pattern-id');
    expect(result.listenedSlow).toBe(false);
  });

  it('should initialize listenedFast to false', () => {
    const result = createInitialResult('test-pattern-id');
    expect(result.listenedFast).toBe(false);
  });

  it('should initialize replayCount to 0', () => {
    const result = createInitialResult('test-pattern-id');
    expect(result.replayCount).toBe(0);
  });

  it('should initialize completed to false', () => {
    const result = createInitialResult('test-pattern-id');
    expect(result.completed).toBe(false);
  });

  it('should return object with all required properties', () => {
    const result = createInitialResult('pattern-123');

    expect(result).toEqual({
      patternId: 'pattern-123',
      listenedSlow: false,
      listenedFast: false,
      replayCount: 0,
      completed: false,
    });
  });
});

describe('hasListenedToBoth', () => {
  it('should return false when neither audio has been listened to', () => {
    const result: AudioComparisonResult = {
      patternId: 'test',
      listenedSlow: false,
      listenedFast: false,
      replayCount: 0,
      completed: false,
    };

    expect(hasListenedToBoth(result)).toBe(false);
  });

  it('should return false when only slow audio has been listened to', () => {
    const result: AudioComparisonResult = {
      patternId: 'test',
      listenedSlow: true,
      listenedFast: false,
      replayCount: 0,
      completed: false,
    };

    expect(hasListenedToBoth(result)).toBe(false);
  });

  it('should return false when only fast audio has been listened to', () => {
    const result: AudioComparisonResult = {
      patternId: 'test',
      listenedSlow: false,
      listenedFast: true,
      replayCount: 0,
      completed: false,
    };

    expect(hasListenedToBoth(result)).toBe(false);
  });

  it('should return true when both audio versions have been listened to', () => {
    const result: AudioComparisonResult = {
      patternId: 'test',
      listenedSlow: true,
      listenedFast: true,
      replayCount: 0,
      completed: false,
    };

    expect(hasListenedToBoth(result)).toBe(true);
  });

  it('should return true regardless of replay count', () => {
    const result: AudioComparisonResult = {
      patternId: 'test',
      listenedSlow: true,
      listenedFast: true,
      replayCount: 5,
      completed: false,
    };

    expect(hasListenedToBoth(result)).toBe(true);
  });

  it('should return true regardless of completion status', () => {
    const result: AudioComparisonResult = {
      patternId: 'test',
      listenedSlow: true,
      listenedFast: true,
      replayCount: 0,
      completed: true,
    };

    expect(hasListenedToBoth(result)).toBe(true);
  });
});

describe('AudioComparisonResult interface', () => {
  it('should have correct shape', () => {
    const result: AudioComparisonResult = {
      patternId: 'reduction-wanna',
      listenedSlow: true,
      listenedFast: true,
      replayCount: 3,
      completed: true,
    };

    expect(Object.keys(result)).toHaveLength(5);
    expect(result.patternId).toBe('reduction-wanna');
    expect(result.listenedSlow).toBe(true);
    expect(result.listenedFast).toBe(true);
    expect(result.replayCount).toBe(3);
    expect(result.completed).toBe(true);
  });
});
