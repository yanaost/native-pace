import reductions from '../reductions.json';
import { Pattern, PatternCategory } from '../../../types/pattern';

// Type assertion to validate JSON matches Pattern interface
const patterns: Pattern[] = reductions as Pattern[];

describe('reductions.json', () => {
  describe('basic structure', () => {
    it('should parse as valid JSON array', () => {
      expect(Array.isArray(patterns)).toBe(true);
    });

    it('should contain exactly 38 patterns', () => {
      expect(patterns).toHaveLength(38);
    });
  });

  describe('pattern IDs', () => {
    it('should have unique IDs', () => {
      const ids = patterns.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should follow naming convention (reduction-*)', () => {
      patterns.forEach((pattern) => {
        expect(pattern.id).toMatch(/^reduction-[a-z]+$/);
      });
    });
  });

  describe('category field', () => {
    it('should have category "reductions" for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.category).toBe('reductions' as PatternCategory);
      });
    });
  });

  describe('level field', () => {
    it('should have level 1 for first 8 patterns (Foundation)', () => {
      const level1Patterns = patterns.filter((p) => p.level === 1);
      expect(level1Patterns).toHaveLength(8);
    });

    it('should have level 2 for patterns 21-50 (Common Reductions)', () => {
      const level2Patterns = patterns.filter((p) => p.level === 2);
      expect(level2Patterns).toHaveLength(30);
    });

    it('should have valid level values (1-6)', () => {
      patterns.forEach((pattern) => {
        expect([1, 2, 3, 4, 5, 6]).toContain(pattern.level);
      });
    });
  });

  describe('required fields', () => {
    it('should have non-empty title for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.title).toBeTruthy();
        expect(typeof pattern.title).toBe('string');
        expect(pattern.title.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty description for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.description).toBeTruthy();
        expect(typeof pattern.description).toBe('string');
        expect(pattern.description.length).toBeGreaterThan(0);
      });
    });

    it('should have non-empty phoneticClear for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.phoneticClear).toBeTruthy();
        expect(typeof pattern.phoneticClear).toBe('string');
      });
    });

    it('should have non-empty phoneticReduced for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.phoneticReduced).toBeTruthy();
        expect(typeof pattern.phoneticReduced).toBe('string');
      });
    });

    it('should have non-empty exampleSentence for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.exampleSentence).toBeTruthy();
        expect(typeof pattern.exampleSentence).toBe('string');
      });
    });

    it('should have non-empty exampleTranscription for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.exampleTranscription).toBeTruthy();
        expect(typeof pattern.exampleTranscription).toBe('string');
      });
    });
  });

  describe('audio URLs', () => {
    it('should have valid audioClearUrl format for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.audioClearUrl).toMatch(
          /^\/audio\/patterns\/reduction-[a-z]+-clear\.mp3$/
        );
      });
    });

    it('should have valid audioConversationalUrl format for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(pattern.audioConversationalUrl).toMatch(
          /^\/audio\/patterns\/reduction-[a-z]+-conversational\.mp3$/
        );
      });
    });
  });

  describe('tips array', () => {
    it('should have non-empty tips array for all patterns', () => {
      patterns.forEach((pattern) => {
        expect(Array.isArray(pattern.tips)).toBe(true);
        expect(pattern.tips.length).toBeGreaterThan(0);
      });
    });

    it('should have string tips for all patterns', () => {
      patterns.forEach((pattern) => {
        pattern.tips.forEach((tip) => {
          expect(typeof tip).toBe('string');
          expect(tip.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('difficulty field', () => {
    it('should have valid difficulty values (1-5)', () => {
      patterns.forEach((pattern) => {
        expect([1, 2, 3, 4, 5]).toContain(pattern.difficulty);
      });
    });
  });

  describe('orderIndex field', () => {
    it('should have unique orderIndex values', () => {
      const orderIndices = patterns.map((p) => p.orderIndex);
      const uniqueOrderIndices = new Set(orderIndices);
      expect(uniqueOrderIndices.size).toBe(orderIndices.length);
    });

    it('should have orderIndex 1-8 for Level 1 patterns', () => {
      const level1Patterns = patterns.filter((p) => p.level === 1);
      const orderIndices = level1Patterns.map((p) => p.orderIndex).sort((a, b) => a - b);
      expect(orderIndices).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('should have orderIndex 21-50 for Level 2 patterns', () => {
      const level2Patterns = patterns.filter((p) => p.level === 2);
      const orderIndices = level2Patterns.map((p) => p.orderIndex).sort((a, b) => a - b);
      const expected = Array.from({ length: 30 }, (_, i) => 21 + i);
      expect(orderIndices).toEqual(expected);
    });
  });

  describe('specific patterns', () => {
    it('should include wanna reduction', () => {
      const wanna = patterns.find((p) => p.id === 'reduction-wanna');
      expect(wanna).toBeDefined();
      expect(wanna?.title).toContain('Wanna');
    });

    it('should include gonna reduction', () => {
      const gonna = patterns.find((p) => p.id === 'reduction-gonna');
      expect(gonna).toBeDefined();
      expect(gonna?.title).toContain('Gonna');
    });

    it('should include hafta reduction', () => {
      const hafta = patterns.find((p) => p.id === 'reduction-hafta');
      expect(hafta).toBeDefined();
      expect(hafta?.title).toContain('Hafta');
    });

    it('should include gotta reduction', () => {
      const gotta = patterns.find((p) => p.id === 'reduction-gotta');
      expect(gotta).toBeDefined();
      expect(gotta?.title).toContain('Gotta');
    });
  });
});
