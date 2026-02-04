import {
  formatPhonetic,
  getPatternDisplayData,
  PatternDisplayData,
} from '../pattern-helpers';
import type { Pattern } from '@/types/pattern';

describe('formatPhonetic', () => {
  it('should return empty string for empty input', () => {
    expect(formatPhonetic('')).toBe('');
  });

  it('should return empty string for whitespace-only input', () => {
    expect(formatPhonetic('   ')).toBe('');
  });

  it('should add slashes to phonetic without slashes', () => {
    expect(formatPhonetic('wɑːnə')).toBe('/wɑːnə/');
  });

  it('should not double-wrap already slashed phonetic', () => {
    expect(formatPhonetic('/wɑːnə/')).toBe('/wɑːnə/');
  });

  it('should handle phonetic with only leading slash', () => {
    expect(formatPhonetic('/wɑːnə')).toBe('//wɑːnə/');
  });

  it('should handle phonetic with only trailing slash', () => {
    expect(formatPhonetic('wɑːnə/')).toBe('/wɑːnə//');
  });

  it('should trim whitespace before adding slashes', () => {
    expect(formatPhonetic('  wɑːnə  ')).toBe('/wɑːnə/');
  });

  it('should handle complex IPA characters', () => {
    expect(formatPhonetic('ðə')).toBe('/ðə/');
    expect(formatPhonetic('tuː')).toBe('/tuː/');
    expect(formatPhonetic('ɡoʊɪŋ')).toBe('/ɡoʊɪŋ/');
  });
});

describe('getPatternDisplayData', () => {
  const mockPattern: Pattern = {
    id: 'reduction-wanna',
    category: 'reductions',
    level: 1,
    title: 'Want to → Wanna',
    description: 'Test description',
    phoneticClear: 'wɑːnt tuː',
    phoneticReduced: 'wɑːnə',
    exampleSentence: 'I want to go.',
    exampleTranscription: 'I wanna go.',
    audioSlowUrl: '/audio/patterns/reduction-wanna-slow.mp3',
    audioFastUrl: '/audio/patterns/reduction-wanna-fast.mp3',
    tips: ['Tip 1', 'Tip 2'],
    difficulty: 1,
    orderIndex: 1,
  };

  it('should extract display data from pattern', () => {
    const displayData = getPatternDisplayData(mockPattern);

    expect(displayData.id).toBe('reduction-wanna');
    expect(displayData.title).toBe('Want to → Wanna');
    expect(displayData.description).toBe('Test description');
  });

  it('should format phonetic transcriptions with slashes', () => {
    const displayData = getPatternDisplayData(mockPattern);

    expect(displayData.phoneticClear).toBe('/wɑːnt tuː/');
    expect(displayData.phoneticReduced).toBe('/wɑːnə/');
  });

  it('should preserve already-formatted phonetics', () => {
    const patternWithSlashes: Pattern = {
      ...mockPattern,
      phoneticClear: '/wɑːnt tuː/',
      phoneticReduced: '/wɑːnə/',
    };

    const displayData = getPatternDisplayData(patternWithSlashes);

    expect(displayData.phoneticClear).toBe('/wɑːnt tuː/');
    expect(displayData.phoneticReduced).toBe('/wɑːnə/');
  });

  it('should include example sentence and transcription', () => {
    const displayData = getPatternDisplayData(mockPattern);

    expect(displayData.exampleSentence).toBe('I want to go.');
    expect(displayData.exampleTranscription).toBe('I wanna go.');
  });

  it('should include tips array', () => {
    const displayData = getPatternDisplayData(mockPattern);

    expect(displayData.tips).toHaveLength(2);
    expect(displayData.tips[0]).toBe('Tip 1');
    expect(displayData.tips[1]).toBe('Tip 2');
  });

  it('should include audio URLs', () => {
    const displayData = getPatternDisplayData(mockPattern);

    expect(displayData.audioSlowUrl).toBe('/audio/patterns/reduction-wanna-slow.mp3');
    expect(displayData.audioFastUrl).toBe('/audio/patterns/reduction-wanna-fast.mp3');
  });

  it('should handle empty tips array', () => {
    const patternNoTips: Pattern = {
      ...mockPattern,
      tips: [],
    };

    const displayData = getPatternDisplayData(patternNoTips);

    expect(displayData.tips).toHaveLength(0);
  });
});

describe('PatternDisplayData interface', () => {
  it('should have correct shape', () => {
    const displayData: PatternDisplayData = {
      id: 'test-id',
      title: 'Test Title',
      description: 'Test Description',
      phoneticClear: '/test/',
      phoneticReduced: '/tst/',
      exampleSentence: 'Test sentence.',
      exampleTranscription: 'Test transcription.',
      tips: ['Tip 1'],
      audioSlowUrl: '/audio/slow.mp3',
      audioFastUrl: '/audio/fast.mp3',
    };

    expect(Object.keys(displayData)).toHaveLength(10);
    expect(displayData.id).toBe('test-id');
  });
});

describe('Pattern data validation', () => {
  it('should handle pattern with all difficulty levels', () => {
    const difficulties: Array<1 | 2 | 3 | 4 | 5> = [1, 2, 3, 4, 5];

    difficulties.forEach((difficulty) => {
      const pattern: Pattern = {
        id: `test-${difficulty}`,
        category: 'reductions',
        level: 1,
        title: 'Test',
        description: 'Test',
        phoneticClear: '/t/',
        phoneticReduced: '/t/',
        exampleSentence: 'Test.',
        exampleTranscription: 'Test.',
        audioSlowUrl: '/audio/slow.mp3',
        audioFastUrl: '/audio/fast.mp3',
        tips: [],
        difficulty,
        orderIndex: 1,
      };

      const displayData = getPatternDisplayData(pattern);
      expect(displayData.id).toBe(`test-${difficulty}`);
    });
  });

  it('should handle all pattern categories', () => {
    const categories: Pattern['category'][] = [
      'weak-forms',
      'reductions',
      'linking',
      'elision',
      'assimilation',
      'flapping',
    ];

    categories.forEach((category) => {
      const pattern: Pattern = {
        id: `test-${category}`,
        category,
        level: 1,
        title: 'Test',
        description: 'Test',
        phoneticClear: '/t/',
        phoneticReduced: '/t/',
        exampleSentence: 'Test.',
        exampleTranscription: 'Test.',
        audioSlowUrl: '/audio/slow.mp3',
        audioFastUrl: '/audio/fast.mp3',
        tips: [],
        difficulty: 1,
        orderIndex: 1,
      };

      const displayData = getPatternDisplayData(pattern);
      expect(displayData.id).toBe(`test-${category}`);
    });
  });
});
