import {
  LEVELS,
  PREMIUM_LEVELS,
  FREE_LEVELS,
  TOTAL_PATTERNS,
  getLevelById,
  isLevelPremium,
  getPatternLevel,
  LevelNumber,
} from '../levels';

describe('LEVELS constant', () => {
  it('should contain exactly 6 levels', () => {
    expect(LEVELS).toHaveLength(6);
  });

  it('should have level IDs 1-6 in order', () => {
    const ids = LEVELS.map((level) => level.id);
    expect(ids).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('should have required properties on each level', () => {
    LEVELS.forEach((level) => {
      expect(level).toHaveProperty('id');
      expect(level).toHaveProperty('name');
      expect(level).toHaveProperty('description');
      expect(level).toHaveProperty('patternRange');
      expect(level.patternRange).toHaveProperty('start');
      expect(level.patternRange).toHaveProperty('end');
      expect(level).toHaveProperty('accessTier');
    });
  });

  it('should have contiguous pattern ranges (no gaps)', () => {
    for (let i = 1; i < LEVELS.length; i++) {
      const previousLevel = LEVELS[i - 1];
      const currentLevel = LEVELS[i];
      expect(currentLevel.patternRange.start).toBe(
        previousLevel.patternRange.end + 1
      );
    }
  });

  it('should have non-overlapping pattern ranges', () => {
    for (let i = 0; i < LEVELS.length; i++) {
      for (let j = i + 1; j < LEVELS.length; j++) {
        const levelA = LEVELS[i];
        const levelB = LEVELS[j];
        // Ranges overlap if A.start <= B.end AND B.start <= A.end
        const overlaps =
          levelA.patternRange.start <= levelB.patternRange.end &&
          levelB.patternRange.start <= levelA.patternRange.end;
        expect(overlaps).toBe(false);
      }
    }
  });

  it('should have total patterns covered equal to 185', () => {
    const firstLevel = LEVELS[0];
    const lastLevel = LEVELS[LEVELS.length - 1];
    const totalCovered =
      lastLevel.patternRange.end - firstLevel.patternRange.start + 1;
    expect(totalCovered).toBe(185);
    expect(firstLevel.patternRange.start).toBe(1);
    expect(lastLevel.patternRange.end).toBe(185);
  });
});

describe('PREMIUM_LEVELS constant', () => {
  it('should contain levels 3, 4, 5, 6', () => {
    expect(PREMIUM_LEVELS).toContain(3);
    expect(PREMIUM_LEVELS).toContain(4);
    expect(PREMIUM_LEVELS).toContain(5);
    expect(PREMIUM_LEVELS).toContain(6);
  });

  it('should have length of 4', () => {
    expect(PREMIUM_LEVELS).toHaveLength(4);
  });
});

describe('FREE_LEVELS constant', () => {
  it('should contain levels 1 and 2', () => {
    expect(FREE_LEVELS).toContain(1);
    expect(FREE_LEVELS).toContain(2);
  });

  it('should have length of 2', () => {
    expect(FREE_LEVELS).toHaveLength(2);
  });
});

describe('TOTAL_PATTERNS constant', () => {
  it('should equal 185', () => {
    expect(TOTAL_PATTERNS).toBe(185);
  });
});

describe('getLevelById', () => {
  it('should return correct level for each ID', () => {
    expect(getLevelById(1)?.name).toBe('Foundation');
    expect(getLevelById(2)?.name).toBe('Common Reductions');
    expect(getLevelById(3)?.name).toBe('Linking Mastery');
    expect(getLevelById(4)?.name).toBe('Advanced Patterns');
    expect(getLevelById(5)?.name).toBe('Native Speed');
    expect(getLevelById(6)?.name).toBe('Mastery');
  });

  it('should return level with correct pattern range', () => {
    expect(getLevelById(1)?.patternRange).toEqual({ start: 1, end: 20 });
    expect(getLevelById(2)?.patternRange).toEqual({ start: 21, end: 50 });
    expect(getLevelById(3)?.patternRange).toEqual({ start: 51, end: 80 });
    expect(getLevelById(4)?.patternRange).toEqual({ start: 81, end: 120 });
    expect(getLevelById(5)?.patternRange).toEqual({ start: 121, end: 150 });
    expect(getLevelById(6)?.patternRange).toEqual({ start: 151, end: 185 });
  });

  it('should return undefined for invalid ID', () => {
    // Type-safe test using type assertion for invalid IDs
    expect(getLevelById(0 as LevelNumber)).toBeUndefined();
    expect(getLevelById(7 as LevelNumber)).toBeUndefined();
    expect(getLevelById(-1 as LevelNumber)).toBeUndefined();
  });
});

describe('isLevelPremium', () => {
  it('should return false for levels 1 and 2', () => {
    expect(isLevelPremium(1)).toBe(false);
    expect(isLevelPremium(2)).toBe(false);
  });

  it('should return true for levels 3, 4, 5, 6', () => {
    expect(isLevelPremium(3)).toBe(true);
    expect(isLevelPremium(4)).toBe(true);
    expect(isLevelPremium(5)).toBe(true);
    expect(isLevelPremium(6)).toBe(true);
  });
});

describe('getPatternLevel', () => {
  it('should return 1 for patterns 1-20', () => {
    expect(getPatternLevel(1)).toBe(1);
    expect(getPatternLevel(10)).toBe(1);
    expect(getPatternLevel(20)).toBe(1);
  });

  it('should return 2 for patterns 21-50', () => {
    expect(getPatternLevel(21)).toBe(2);
    expect(getPatternLevel(35)).toBe(2);
    expect(getPatternLevel(50)).toBe(2);
  });

  it('should return 3 for patterns 51-80', () => {
    expect(getPatternLevel(51)).toBe(3);
    expect(getPatternLevel(65)).toBe(3);
    expect(getPatternLevel(80)).toBe(3);
  });

  it('should return 4 for patterns 81-120', () => {
    expect(getPatternLevel(81)).toBe(4);
    expect(getPatternLevel(100)).toBe(4);
    expect(getPatternLevel(120)).toBe(4);
  });

  it('should return 5 for patterns 121-150', () => {
    expect(getPatternLevel(121)).toBe(5);
    expect(getPatternLevel(135)).toBe(5);
    expect(getPatternLevel(150)).toBe(5);
  });

  it('should return 6 for patterns 151-185', () => {
    expect(getPatternLevel(151)).toBe(6);
    expect(getPatternLevel(170)).toBe(6);
    expect(getPatternLevel(185)).toBe(6);
  });

  it('should return null for pattern 0 or negative', () => {
    expect(getPatternLevel(0)).toBeNull();
    expect(getPatternLevel(-1)).toBeNull();
    expect(getPatternLevel(-100)).toBeNull();
  });

  it('should return null for pattern > 185', () => {
    expect(getPatternLevel(186)).toBeNull();
    expect(getPatternLevel(200)).toBeNull();
    expect(getPatternLevel(1000)).toBeNull();
  });
});
