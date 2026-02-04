import * as fs from 'fs';
import * as path from 'path';
import {
  transformPatternToRow,
  readPatternFiles,
  PatternRow,
} from '../seed-patterns';
import { Pattern } from '../../types/pattern';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('seed-patterns', () => {
  describe('transformPatternToRow', () => {
    const samplePattern: Pattern = {
      id: 'reduction-wanna',
      category: 'reductions',
      level: 1,
      title: 'Want to → Wanna',
      description: 'Test description',
      phoneticClear: '/wɑːnt tuː/',
      phoneticReduced: '/wɑːnə/',
      exampleSentence: 'I want to go.',
      exampleTranscription: 'I wanna go.',
      audioSlowUrl: '/audio/patterns/reduction-wanna-slow.mp3',
      audioFastUrl: '/audio/patterns/reduction-wanna-fast.mp3',
      tips: ['Tip 1', 'Tip 2'],
      difficulty: 1,
      orderIndex: 1,
    };

    it('should transform camelCase fields to snake_case', () => {
      const row = transformPatternToRow(samplePattern);

      expect(row.phonetic_clear).toBe(samplePattern.phoneticClear);
      expect(row.phonetic_reduced).toBe(samplePattern.phoneticReduced);
      expect(row.example_sentence).toBe(samplePattern.exampleSentence);
      expect(row.example_transcription).toBe(samplePattern.exampleTranscription);
      expect(row.audio_slow_url).toBe(samplePattern.audioSlowUrl);
      expect(row.audio_fast_url).toBe(samplePattern.audioFastUrl);
      expect(row.order_index).toBe(samplePattern.orderIndex);
    });

    it('should preserve fields that are already the same', () => {
      const row = transformPatternToRow(samplePattern);

      expect(row.id).toBe(samplePattern.id);
      expect(row.category).toBe(samplePattern.category);
      expect(row.level).toBe(samplePattern.level);
      expect(row.title).toBe(samplePattern.title);
      expect(row.description).toBe(samplePattern.description);
      expect(row.tips).toEqual(samplePattern.tips);
      expect(row.difficulty).toBe(samplePattern.difficulty);
    });

    it('should return a valid PatternRow shape', () => {
      const row = transformPatternToRow(samplePattern);

      const expectedKeys: (keyof PatternRow)[] = [
        'id',
        'category',
        'level',
        'title',
        'description',
        'phonetic_clear',
        'phonetic_reduced',
        'example_sentence',
        'example_transcription',
        'audio_slow_url',
        'audio_fast_url',
        'tips',
        'difficulty',
        'order_index',
      ];

      expect(Object.keys(row).sort()).toEqual(expectedKeys.sort());
    });

    it('should preserve array fields correctly', () => {
      const patternWithManyTips: Pattern = {
        ...samplePattern,
        tips: ['Tip 1', 'Tip 2', 'Tip 3'],
      };

      const row = transformPatternToRow(patternWithManyTips);

      expect(row.tips).toHaveLength(3);
      expect(row.tips).toEqual(['Tip 1', 'Tip 2', 'Tip 3']);
    });
  });

  describe('readPatternFiles', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return empty array if directory does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      const patterns = readPatternFiles('/nonexistent');

      expect(patterns).toEqual([]);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/nonexistent');
    });

    it('should read and parse JSON files from directory', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        'reductions.json',
        'weak-forms.json',
        '.gitkeep',
        'readme.md',
      ] as unknown as fs.Dirent[]);

      const reductionsData: Pattern[] = [
        {
          id: 'reduction-wanna',
          category: 'reductions',
          level: 1,
          title: 'Test',
          description: 'Desc',
          phoneticClear: '/a/',
          phoneticReduced: '/b/',
          exampleSentence: 'Ex',
          exampleTranscription: 'Ex trans',
          audioSlowUrl: '/audio/slow.mp3',
          audioFastUrl: '/audio/fast.mp3',
          tips: ['Tip'],
          difficulty: 1,
          orderIndex: 1,
        },
      ];

      const weakFormsData: Pattern[] = [
        {
          id: 'weak-form-to',
          category: 'weak-forms',
          level: 1,
          title: 'Test 2',
          description: 'Desc 2',
          phoneticClear: '/c/',
          phoneticReduced: '/d/',
          exampleSentence: 'Ex 2',
          exampleTranscription: 'Ex trans 2',
          audioSlowUrl: '/audio/slow2.mp3',
          audioFastUrl: '/audio/fast2.mp3',
          tips: ['Tip 2'],
          difficulty: 1,
          orderIndex: 9,
        },
      ];

      mockFs.readFileSync.mockImplementation((filePath: fs.PathOrFileDescriptor) => {
        const pathStr = filePath.toString();
        if (pathStr.includes('reductions.json')) {
          return JSON.stringify(reductionsData);
        }
        if (pathStr.includes('weak-forms.json')) {
          return JSON.stringify(weakFormsData);
        }
        return '[]';
      });

      const patterns = readPatternFiles('/test/patterns');

      expect(patterns).toHaveLength(2);
      expect(patterns[0].id).toBe('reduction-wanna');
      expect(patterns[1].id).toBe('weak-form-to');
    });

    it('should skip non-JSON files', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue([
        'patterns.json',
        '.gitkeep',
        'README.md',
        '.hidden.json',
      ] as unknown as fs.Dirent[]);

      mockFs.readFileSync.mockReturnValue(
        JSON.stringify([
          {
            id: 'test-pattern',
            category: 'reductions',
            level: 1,
            title: 'Test',
            description: 'Desc',
            phoneticClear: '/a/',
            phoneticReduced: '/b/',
            exampleSentence: 'Ex',
            exampleTranscription: 'Ex trans',
            audioSlowUrl: '/audio/slow.mp3',
            audioFastUrl: '/audio/fast.mp3',
            tips: ['Tip'],
            difficulty: 1,
            orderIndex: 1,
          },
        ])
      );

      const patterns = readPatternFiles('/test/patterns');

      // Should only read patterns.json, not .gitkeep, README.md, or .hidden.json
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
      expect(patterns).toHaveLength(1);
    });

    it('should handle JSON parse errors gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['invalid.json'] as unknown as fs.Dirent[]);
      mockFs.readFileSync.mockReturnValue('{ invalid json }');

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const patterns = readPatternFiles('/test/patterns');

      expect(patterns).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle non-array JSON content', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['object.json'] as unknown as fs.Dirent[]);
      mockFs.readFileSync.mockReturnValue(JSON.stringify({ id: 'not-array' }));

      const patterns = readPatternFiles('/test/patterns');

      // Non-array content should not add any patterns
      expect(patterns).toEqual([]);
    });
  });

  describe('integration with real pattern files', () => {
    // Restore real fs for this test
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    it('should read actual reductions.json file', () => {
      const actualFs = jest.requireActual('fs') as typeof fs;
      const patternsDir = path.join(__dirname, '..', '..', 'content', 'patterns');

      if (!actualFs.existsSync(patternsDir)) {
        // Skip if patterns directory doesn't exist (CI environment)
        return;
      }

      const reductionsPath = path.join(patternsDir, 'reductions.json');
      if (!actualFs.existsSync(reductionsPath)) {
        // Skip if reductions.json doesn't exist
        return;
      }

      const content = actualFs.readFileSync(reductionsPath, 'utf-8');
      const patterns: Pattern[] = JSON.parse(content);

      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);

      // Verify each pattern can be transformed
      patterns.forEach((pattern) => {
        const row = transformPatternToRow(pattern);
        expect(row.id).toBe(pattern.id);
        expect(row.order_index).toBe(pattern.orderIndex);
      });
    });
  });
});
