// lib/utils/__tests__/audio-helpers.test.ts

import { preloadAudio, getAudioDuration, formatTime } from '../audio-helpers';

// Mock HTMLAudioElement since Jest runs in Node environment
class MockAudioElement {
  src = '';
  duration = 0;
  error: MediaError | null = null;
  private listeners: Map<string, Set<EventListener>> = new Map();
  private loadBehavior: 'success' | 'error' = 'success';

  addEventListener(event: string, callback: EventListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  removeEventListener(event: string, callback: EventListener) {
    this.listeners.get(event)?.delete(callback);
  }

  load() {
    // Simulate async loading
    setTimeout(() => {
      if (this.loadBehavior === 'success') {
        this.triggerEvent('canplaythrough');
      } else {
        this.error = { code: 4, message: 'MEDIA_ERR_SRC_NOT_SUPPORTED' } as MediaError;
        this.triggerEvent('error');
      }
    }, 0);
  }

  private triggerEvent(event: string) {
    this.listeners.get(event)?.forEach((callback) => callback(new Event(event)));
  }

  // Test helpers
  setLoadBehavior(behavior: 'success' | 'error') {
    this.loadBehavior = behavior;
  }

  setDuration(duration: number) {
    this.duration = duration;
  }
}

// Store mock instance for test access (prefixed to indicate intentionally unused)
let _mockAudioInstance: MockAudioElement;

// Mock the global Audio constructor
beforeAll(() => {
  (global as unknown as { Audio: typeof MockAudioElement }).Audio = class extends MockAudioElement {
    constructor() {
      super();
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      _mockAudioInstance = this;
    }
  };
});

describe('preloadAudio', () => {
  it('resolves with audio element when load succeeds', async () => {
    const url = 'https://example.com/audio.mp3';
    const promise = preloadAudio(url);

    // Wait for the promise to resolve
    const audio = await promise;

    expect(audio.src).toBe(url);
  });

  it('rejects when URL fails to load', async () => {
    const url = 'https://example.com/invalid.mp3';

    // Set up the mock to fail before calling preloadAudio
    const originalAudio = (global as unknown as { Audio: typeof MockAudioElement }).Audio;
    (global as unknown as { Audio: typeof MockAudioElement }).Audio = class extends MockAudioElement {
      constructor() {
        super();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        _mockAudioInstance = this;
        this.setLoadBehavior('error');
      }
    };

    await expect(preloadAudio(url)).rejects.toThrow(`Failed to load audio from URL: ${url}`);

    // Restore original mock
    (global as unknown as { Audio: typeof MockAudioElement }).Audio = originalAudio;
  });

  it('sets correct src attribute', async () => {
    const url = 'https://example.com/test.mp3';
    const promise = preloadAudio(url);

    const audio = await promise;

    expect(audio.src).toBe(url);
  });
});

describe('getAudioDuration', () => {
  it('returns duration when available', () => {
    const mockAudio = { duration: 120.5 } as HTMLAudioElement;

    expect(getAudioDuration(mockAudio)).toBe(120.5);
  });

  it('returns 0 when duration is NaN', () => {
    const mockAudio = { duration: NaN } as HTMLAudioElement;

    expect(getAudioDuration(mockAudio)).toBe(0);
  });

  it('returns 0 when duration is Infinity', () => {
    const mockAudio = { duration: Infinity } as HTMLAudioElement;

    expect(getAudioDuration(mockAudio)).toBe(0);
  });
});

describe('formatTime', () => {
  it('formats 0 seconds as "0:00"', () => {
    expect(formatTime(0)).toBe('0:00');
  });

  it('formats 65 seconds as "1:05"', () => {
    expect(formatTime(65)).toBe('1:05');
  });

  it('formats 125 seconds as "2:05"', () => {
    expect(formatTime(125)).toBe('2:05');
  });

  it('formats 5 seconds as "0:05"', () => {
    expect(formatTime(5)).toBe('0:05');
  });

  it('formats 90 seconds as "1:30"', () => {
    expect(formatTime(90)).toBe('1:30');
  });

  it('handles fractional seconds by rounding down', () => {
    expect(formatTime(65.9)).toBe('1:05');
    expect(formatTime(125.7)).toBe('2:05');
  });

  it('returns "0:00" for negative numbers', () => {
    expect(formatTime(-5)).toBe('0:00');
    expect(formatTime(-100)).toBe('0:00');
  });

  it('returns "0:00" for NaN', () => {
    expect(formatTime(NaN)).toBe('0:00');
  });

  it('returns "0:00" for Infinity', () => {
    expect(formatTime(Infinity)).toBe('0:00');
    expect(formatTime(-Infinity)).toBe('0:00');
  });
});
