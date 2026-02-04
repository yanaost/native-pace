import {
  AUDIO_OUTPUT_DIR,
  AUDIO_SPEEDS,
  DEFAULT_VOICE,
  AVAILABLE_VOICES,
  getAudioFilename,
  getAudioOutputPath,
  getEdgeTTSArgs,
  validatePatternForAudio,
  parsePatternForAudio,
  getPatternsForAudioGeneration,
} from '../audio-generation-helpers';

describe('AUDIO_OUTPUT_DIR', () => {
  it('should be the correct output directory', () => {
    expect(AUDIO_OUTPUT_DIR).toBe('public/audio/patterns');
  });
});

describe('AUDIO_SPEEDS', () => {
  it('should have slow speed config', () => {
    expect(AUDIO_SPEEDS.slow).toEqual({
      rate: '-30%',
      suffix: 'slow',
    });
  });

  it('should have fast speed config', () => {
    expect(AUDIO_SPEEDS.fast).toEqual({
      rate: '+0%',
      suffix: 'fast',
    });
  });
});

describe('DEFAULT_VOICE', () => {
  it('should be American English male voice', () => {
    expect(DEFAULT_VOICE).toBe('en-US-GuyNeural');
  });
});

describe('AVAILABLE_VOICES', () => {
  it('should include default voice', () => {
    expect(AVAILABLE_VOICES).toContain(DEFAULT_VOICE);
  });

  it('should have at least 4 voices', () => {
    expect(AVAILABLE_VOICES.length).toBeGreaterThanOrEqual(4);
  });
});

describe('getAudioFilename', () => {
  it('should generate slow filename', () => {
    expect(getAudioFilename('reduction-wanna', 'slow')).toBe('reduction-wanna-slow.mp3');
  });

  it('should generate fast filename', () => {
    expect(getAudioFilename('reduction-wanna', 'fast')).toBe('reduction-wanna-fast.mp3');
  });

  it('should handle pattern IDs with hyphens', () => {
    expect(getAudioFilename('weak-form-to', 'slow')).toBe('weak-form-to-slow.mp3');
  });
});

describe('getAudioOutputPath', () => {
  it('should generate correct slow path', () => {
    const path = getAudioOutputPath('reduction-wanna', 'slow');
    expect(path).toContain('reduction-wanna-slow.mp3');
    expect(path).toContain('public/audio/patterns');
  });

  it('should generate correct fast path', () => {
    const path = getAudioOutputPath('reduction-gonna', 'fast');
    expect(path).toContain('reduction-gonna-fast.mp3');
  });

  it('should use custom base directory when provided', () => {
    const path = getAudioOutputPath('test-pattern', 'slow', '/custom/dir');
    expect(path).toBe('/custom/dir/test-pattern-slow.mp3');
  });
});

describe('getEdgeTTSArgs', () => {
  it('should return correct arguments array', () => {
    const args = getEdgeTTSArgs('Hello world', '/output/test.mp3', '-30%');
    expect(args).toContain('--voice');
    expect(args).toContain(DEFAULT_VOICE);
    expect(args).toContain('--text');
    expect(args).toContain('Hello world');
    expect(args).toContain('--write-media');
    expect(args).toContain('/output/test.mp3');
    expect(args).toContain('--rate');
    expect(args).toContain('-30%');
  });

  it('should use custom voice when provided', () => {
    const args = getEdgeTTSArgs('Hello', '/out.mp3', '+0%', 'en-GB-RyanNeural');
    expect(args).toContain('en-GB-RyanNeural');
  });

  it('should have correct argument order', () => {
    const args = getEdgeTTSArgs('Test', '/test.mp3', '-30%');
    expect(args[0]).toBe('--voice');
    expect(args[2]).toBe('--text');
    expect(args[4]).toBe('--write-media');
    expect(args[6]).toBe('--rate');
  });
});

describe('validatePatternForAudio', () => {
  it('should return true for valid pattern', () => {
    const pattern = {
      id: 'reduction-wanna',
      exampleSentence: 'I want to go home.',
    };
    expect(validatePatternForAudio(pattern)).toBe(true);
  });

  it('should return false for null', () => {
    expect(validatePatternForAudio(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(validatePatternForAudio(undefined)).toBe(false);
  });

  it('should return false for non-object', () => {
    expect(validatePatternForAudio('string')).toBe(false);
    expect(validatePatternForAudio(123)).toBe(false);
  });

  it('should return false for missing id', () => {
    const pattern = { exampleSentence: 'Test sentence' };
    expect(validatePatternForAudio(pattern)).toBe(false);
  });

  it('should return false for missing exampleSentence', () => {
    const pattern = { id: 'test-id' };
    expect(validatePatternForAudio(pattern)).toBe(false);
  });

  it('should return false for empty id', () => {
    const pattern = { id: '', exampleSentence: 'Test' };
    expect(validatePatternForAudio(pattern)).toBe(false);
  });

  it('should return false for empty exampleSentence', () => {
    const pattern = { id: 'test', exampleSentence: '' };
    expect(validatePatternForAudio(pattern)).toBe(false);
  });
});

describe('parsePatternForAudio', () => {
  it('should parse valid pattern', () => {
    const pattern = {
      id: 'reduction-wanna',
      exampleSentence: 'I want to go home.',
      category: 'reductions', // extra fields should be ignored
    };
    const result = parsePatternForAudio(pattern);
    expect(result).not.toBeNull();
    expect(result?.id).toBe('reduction-wanna');
    expect(result?.text).toBe('I want to go home.');
    expect(result?.slowPath).toContain('reduction-wanna-slow.mp3');
    expect(result?.fastPath).toContain('reduction-wanna-fast.mp3');
  });

  it('should return null for invalid pattern', () => {
    expect(parsePatternForAudio(null)).toBeNull();
    expect(parsePatternForAudio({})).toBeNull();
    expect(parsePatternForAudio({ id: 'test' })).toBeNull();
  });
});

describe('getPatternsForAudioGeneration', () => {
  it('should parse array of valid patterns', () => {
    const patterns = [
      { id: 'pattern-1', exampleSentence: 'Sentence 1' },
      { id: 'pattern-2', exampleSentence: 'Sentence 2' },
    ];
    const result = getPatternsForAudioGeneration(patterns);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('pattern-1');
    expect(result[1].id).toBe('pattern-2');
  });

  it('should filter out invalid patterns', () => {
    const patterns = [
      { id: 'valid-pattern', exampleSentence: 'Valid sentence' },
      { id: 'invalid' }, // missing exampleSentence
      null,
      { exampleSentence: 'No ID' }, // missing id
    ];
    const result = getPatternsForAudioGeneration(patterns);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('valid-pattern');
  });

  it('should return empty array for empty input', () => {
    expect(getPatternsForAudioGeneration([])).toHaveLength(0);
  });

  it('should return empty array for all invalid patterns', () => {
    const patterns = [null, undefined, {}, { id: '' }];
    expect(getPatternsForAudioGeneration(patterns)).toHaveLength(0);
  });
});
