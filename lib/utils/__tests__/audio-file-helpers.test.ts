import {
  AUDIO_PATTERNS_DIR,
  LEVEL_1_PATTERN_IDS,
  AUDIO_VARIANTS,
  getLevel1PatternIds,
  getAudioFilename,
  getAudioFilePath,
  getExpectedAudioFiles,
  checkAudioFileExists,
  verifyAudioFiles,
  getAudioVerificationSummary,
} from '../audio-file-helpers';

describe('AUDIO_PATTERNS_DIR', () => {
  it('should be the correct directory', () => {
    expect(AUDIO_PATTERNS_DIR).toBe('public/audio/patterns');
  });
});

describe('LEVEL_1_PATTERN_IDS', () => {
  it('should have exactly 20 patterns', () => {
    expect(LEVEL_1_PATTERN_IDS).toHaveLength(20);
  });

  it('should include reduction patterns', () => {
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-wanna');
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-gonna');
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-hafta');
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-gotta');
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-kinda');
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-lotta');
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-outta');
    expect(LEVEL_1_PATTERN_IDS).toContain('reduction-sorta');
  });

  it('should include weak-form patterns', () => {
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-to');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-for');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-of');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-and');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-the');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-a');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-him');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-her');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-them');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-can');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-was');
    expect(LEVEL_1_PATTERN_IDS).toContain('weak-form-were');
  });
});

describe('AUDIO_VARIANTS', () => {
  it('should have slow and fast variants', () => {
    expect(AUDIO_VARIANTS).toContain('slow');
    expect(AUDIO_VARIANTS).toContain('fast');
  });

  it('should have exactly 2 variants', () => {
    expect(AUDIO_VARIANTS).toHaveLength(2);
  });
});

describe('getLevel1PatternIds', () => {
  it('should return all Level 1 pattern IDs', () => {
    const ids = getLevel1PatternIds();
    expect(ids).toHaveLength(20);
    expect(ids).toEqual(LEVEL_1_PATTERN_IDS);
  });
});

describe('getAudioFilename', () => {
  it('should generate slow filename', () => {
    expect(getAudioFilename('reduction-wanna', 'slow')).toBe('reduction-wanna-slow.mp3');
  });

  it('should generate fast filename', () => {
    expect(getAudioFilename('reduction-wanna', 'fast')).toBe('reduction-wanna-fast.mp3');
  });

  it('should handle weak-form patterns', () => {
    expect(getAudioFilename('weak-form-to', 'slow')).toBe('weak-form-to-slow.mp3');
    expect(getAudioFilename('weak-form-to', 'fast')).toBe('weak-form-to-fast.mp3');
  });
});

describe('getAudioFilePath', () => {
  it('should generate correct path for slow variant', () => {
    const path = getAudioFilePath('reduction-wanna', 'slow');
    expect(path).toBe('public/audio/patterns/reduction-wanna-slow.mp3');
  });

  it('should generate correct path for fast variant', () => {
    const path = getAudioFilePath('weak-form-to', 'fast');
    expect(path).toBe('public/audio/patterns/weak-form-to-fast.mp3');
  });
});

describe('getExpectedAudioFiles', () => {
  it('should return 2 files per pattern (slow and fast)', () => {
    const files = getExpectedAudioFiles(['pattern-1']);
    expect(files).toHaveLength(2);
    expect(files[0].variant).toBe('slow');
    expect(files[1].variant).toBe('fast');
  });

  it('should return correct structure for each file', () => {
    const files = getExpectedAudioFiles(['reduction-wanna']);
    expect(files[0]).toEqual({
      patternId: 'reduction-wanna',
      variant: 'slow',
      filename: 'reduction-wanna-slow.mp3',
      path: 'public/audio/patterns/reduction-wanna-slow.mp3',
      exists: false,
    });
  });

  it('should return 40 files for 20 patterns', () => {
    const files = getExpectedAudioFiles(LEVEL_1_PATTERN_IDS);
    expect(files).toHaveLength(40);
  });

  it('should return empty array for empty input', () => {
    const files = getExpectedAudioFiles([]);
    expect(files).toHaveLength(0);
  });
});

describe('checkAudioFileExists', () => {
  it('should return false for non-existent file', () => {
    expect(checkAudioFileExists('public/audio/patterns/non-existent.mp3')).toBe(false);
  });

  it('should return true for existing file', () => {
    // package.json exists in project root
    expect(checkAudioFileExists('package.json')).toBe(true);
  });
});

describe('verifyAudioFiles', () => {
  it('should set exists property for each file', () => {
    const files = verifyAudioFiles(['non-existent-pattern']);
    expect(files).toHaveLength(2);
    expect(files[0].exists).toBe(false);
    expect(files[1].exists).toBe(false);
  });
});

describe('getAudioVerificationSummary', () => {
  it('should return correct summary for all missing', () => {
    const files = [
      { patternId: 'p1', variant: 'slow' as const, filename: 'p1-slow.mp3', path: '', exists: false },
      { patternId: 'p1', variant: 'fast' as const, filename: 'p1-fast.mp3', path: '', exists: false },
    ];
    const summary = getAudioVerificationSummary(files);
    expect(summary.total).toBe(2);
    expect(summary.existing).toBe(0);
    expect(summary.missing).toBe(2);
    expect(summary.missingFiles).toEqual(['p1-slow.mp3', 'p1-fast.mp3']);
  });

  it('should return correct summary for all existing', () => {
    const files = [
      { patternId: 'p1', variant: 'slow' as const, filename: 'p1-slow.mp3', path: '', exists: true },
      { patternId: 'p1', variant: 'fast' as const, filename: 'p1-fast.mp3', path: '', exists: true },
    ];
    const summary = getAudioVerificationSummary(files);
    expect(summary.total).toBe(2);
    expect(summary.existing).toBe(2);
    expect(summary.missing).toBe(0);
    expect(summary.missingFiles).toEqual([]);
  });

  it('should return correct summary for mixed', () => {
    const files = [
      { patternId: 'p1', variant: 'slow' as const, filename: 'p1-slow.mp3', path: '', exists: true },
      { patternId: 'p1', variant: 'fast' as const, filename: 'p1-fast.mp3', path: '', exists: false },
    ];
    const summary = getAudioVerificationSummary(files);
    expect(summary.total).toBe(2);
    expect(summary.existing).toBe(1);
    expect(summary.missing).toBe(1);
    expect(summary.missingFiles).toEqual(['p1-fast.mp3']);
  });
});
