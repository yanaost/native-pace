import {
  canAccessLevel,
  getLevelPatternCount,
  isLevelLocked,
  findNextUnlearnedPattern,
  calculateCompletionPercentage,
  PatternWithProgress,
} from '../level-access';
import { LEVELS, Level } from '@/lib/constants/levels';
import type { SubscriptionTier } from '@/types/user';

describe('canAccessLevel', () => {
  describe('free tier levels', () => {
    it('should allow free users to access free levels', () => {
      expect(canAccessLevel('free', 'free')).toBe(true);
    });

    it('should allow premium users to access free levels', () => {
      expect(canAccessLevel('free', 'premium')).toBe(true);
    });

    it('should allow lifetime users to access free levels', () => {
      expect(canAccessLevel('free', 'lifetime')).toBe(true);
    });
  });

  describe('free-account tier levels', () => {
    it('should allow free users to access free-account levels', () => {
      expect(canAccessLevel('free-account', 'free')).toBe(true);
    });

    it('should allow premium users to access free-account levels', () => {
      expect(canAccessLevel('free-account', 'premium')).toBe(true);
    });

    it('should allow lifetime users to access free-account levels', () => {
      expect(canAccessLevel('free-account', 'lifetime')).toBe(true);
    });
  });

  describe('premium tier levels', () => {
    it('should not allow free users to access premium levels', () => {
      expect(canAccessLevel('premium', 'free')).toBe(false);
    });

    it('should allow premium users to access premium levels', () => {
      expect(canAccessLevel('premium', 'premium')).toBe(true);
    });

    it('should allow lifetime users to access premium levels', () => {
      expect(canAccessLevel('premium', 'lifetime')).toBe(true);
    });
  });

  describe('integration with LEVELS constant', () => {
    it('should allow free users to access Level 1 (free)', () => {
      const level1 = LEVELS.find((l) => l.id === 1)!;
      expect(canAccessLevel(level1.accessTier, 'free')).toBe(true);
    });

    it('should allow free users to access Level 2 (free-account)', () => {
      const level2 = LEVELS.find((l) => l.id === 2)!;
      expect(canAccessLevel(level2.accessTier, 'free')).toBe(true);
    });

    it('should not allow free users to access Level 3 (premium)', () => {
      const level3 = LEVELS.find((l) => l.id === 3)!;
      expect(canAccessLevel(level3.accessTier, 'free')).toBe(false);
    });

    it('should not allow free users to access Level 4 (premium)', () => {
      const level4 = LEVELS.find((l) => l.id === 4)!;
      expect(canAccessLevel(level4.accessTier, 'free')).toBe(false);
    });

    it('should not allow free users to access Level 5 (premium)', () => {
      const level5 = LEVELS.find((l) => l.id === 5)!;
      expect(canAccessLevel(level5.accessTier, 'free')).toBe(false);
    });

    it('should not allow free users to access Level 6 (premium)', () => {
      const level6 = LEVELS.find((l) => l.id === 6)!;
      expect(canAccessLevel(level6.accessTier, 'free')).toBe(false);
    });

    it('should allow premium users to access all levels', () => {
      LEVELS.forEach((level) => {
        expect(canAccessLevel(level.accessTier, 'premium')).toBe(true);
      });
    });

    it('should allow lifetime users to access all levels', () => {
      LEVELS.forEach((level) => {
        expect(canAccessLevel(level.accessTier, 'lifetime')).toBe(true);
      });
    });
  });
});

describe('getLevelPatternCount', () => {
  it('should return 20 patterns for Level 1', () => {
    const level1 = LEVELS.find((l) => l.id === 1)!;
    expect(getLevelPatternCount(level1)).toBe(20);
  });

  it('should return 30 patterns for Level 2', () => {
    const level2 = LEVELS.find((l) => l.id === 2)!;
    expect(getLevelPatternCount(level2)).toBe(30);
  });

  it('should return 30 patterns for Level 3', () => {
    const level3 = LEVELS.find((l) => l.id === 3)!;
    expect(getLevelPatternCount(level3)).toBe(30);
  });

  it('should return 40 patterns for Level 4', () => {
    const level4 = LEVELS.find((l) => l.id === 4)!;
    expect(getLevelPatternCount(level4)).toBe(40);
  });

  it('should return 30 patterns for Level 5', () => {
    const level5 = LEVELS.find((l) => l.id === 5)!;
    expect(getLevelPatternCount(level5)).toBe(30);
  });

  it('should return 35 patterns for Level 6', () => {
    const level6 = LEVELS.find((l) => l.id === 6)!;
    expect(getLevelPatternCount(level6)).toBe(35);
  });

  it('should calculate total patterns correctly', () => {
    const totalCalculated = LEVELS.reduce(
      (sum, level) => sum + getLevelPatternCount(level),
      0
    );
    expect(totalCalculated).toBe(185);
  });
});

describe('isLevelLocked', () => {
  describe('free user', () => {
    const tier: SubscriptionTier = 'free';

    it('should return false for Level 1', () => {
      const level = LEVELS.find((l) => l.id === 1)!;
      expect(isLevelLocked(level, tier)).toBe(false);
    });

    it('should return false for Level 2', () => {
      const level = LEVELS.find((l) => l.id === 2)!;
      expect(isLevelLocked(level, tier)).toBe(false);
    });

    it('should return true for Level 3', () => {
      const level = LEVELS.find((l) => l.id === 3)!;
      expect(isLevelLocked(level, tier)).toBe(true);
    });

    it('should return true for Level 4', () => {
      const level = LEVELS.find((l) => l.id === 4)!;
      expect(isLevelLocked(level, tier)).toBe(true);
    });

    it('should return true for Level 5', () => {
      const level = LEVELS.find((l) => l.id === 5)!;
      expect(isLevelLocked(level, tier)).toBe(true);
    });

    it('should return true for Level 6', () => {
      const level = LEVELS.find((l) => l.id === 6)!;
      expect(isLevelLocked(level, tier)).toBe(true);
    });
  });

  describe('premium user', () => {
    const tier: SubscriptionTier = 'premium';

    it('should return false for all levels', () => {
      LEVELS.forEach((level) => {
        expect(isLevelLocked(level, tier)).toBe(false);
      });
    });
  });

  describe('lifetime user', () => {
    const tier: SubscriptionTier = 'lifetime';

    it('should return false for all levels', () => {
      LEVELS.forEach((level) => {
        expect(isLevelLocked(level, tier)).toBe(false);
      });
    });
  });
});

describe('level lock states summary', () => {
  const testCases: {
    tier: SubscriptionTier;
    expectedLocked: number[];
    expectedUnlocked: number[];
  }[] = [
    {
      tier: 'free',
      expectedLocked: [3, 4, 5, 6],
      expectedUnlocked: [1, 2],
    },
    {
      tier: 'premium',
      expectedLocked: [],
      expectedUnlocked: [1, 2, 3, 4, 5, 6],
    },
    {
      tier: 'lifetime',
      expectedLocked: [],
      expectedUnlocked: [1, 2, 3, 4, 5, 6],
    },
  ];

  testCases.forEach(({ tier, expectedLocked, expectedUnlocked }) => {
    describe(`${tier} user`, () => {
      it(`should have levels ${expectedLocked.join(', ') || 'none'} locked`, () => {
        const lockedLevels = LEVELS.filter((l) => isLevelLocked(l, tier)).map(
          (l) => l.id
        );
        expect(lockedLevels).toEqual(expectedLocked);
      });

      it(`should have levels ${expectedUnlocked.join(', ')} unlocked`, () => {
        const unlockedLevels = LEVELS.filter((l) => !isLevelLocked(l, tier)).map(
          (l) => l.id
        );
        expect(unlockedLevels).toEqual(expectedUnlocked);
      });
    });
  });
});

describe('findNextUnlearnedPattern', () => {
  it('should return the first incomplete pattern', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 30, isCompleted: false },
      { id: 'p3', title: 'Pattern 3', orderIndex: 3, masteryScore: 0, isCompleted: false },
    ];

    const next = findNextUnlearnedPattern(patterns);
    expect(next).not.toBeNull();
    expect(next!.id).toBe('p2');
  });

  it('should return null when all patterns are completed', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 90, isCompleted: true },
      { id: 'p3', title: 'Pattern 3', orderIndex: 3, masteryScore: 100, isCompleted: true },
    ];

    const next = findNextUnlearnedPattern(patterns);
    expect(next).toBeNull();
  });

  it('should return null for empty array', () => {
    const next = findNextUnlearnedPattern([]);
    expect(next).toBeNull();
  });

  it('should return the first pattern when none are completed', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 0, isCompleted: false },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 0, isCompleted: false },
    ];

    const next = findNextUnlearnedPattern(patterns);
    expect(next).not.toBeNull();
    expect(next!.id).toBe('p1');
  });

  it('should sort by orderIndex before finding next', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p3', title: 'Pattern 3', orderIndex: 3, masteryScore: 0, isCompleted: false },
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 0, isCompleted: false },
    ];

    const next = findNextUnlearnedPattern(patterns);
    expect(next).not.toBeNull();
    expect(next!.id).toBe('p2');
  });

  it('should handle patterns with gaps in completion', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 0, isCompleted: false },
      { id: 'p3', title: 'Pattern 3', orderIndex: 3, masteryScore: 90, isCompleted: true },
      { id: 'p4', title: 'Pattern 4', orderIndex: 4, masteryScore: 0, isCompleted: false },
    ];

    const next = findNextUnlearnedPattern(patterns);
    expect(next).not.toBeNull();
    expect(next!.id).toBe('p2');
  });
});

describe('calculateCompletionPercentage', () => {
  it('should return 0 for empty array', () => {
    expect(calculateCompletionPercentage([])).toBe(0);
  });

  it('should return 0 when no patterns are completed', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 0, isCompleted: false },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 30, isCompleted: false },
    ];

    expect(calculateCompletionPercentage(patterns)).toBe(0);
  });

  it('should return 100 when all patterns are completed', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 90, isCompleted: true },
    ];

    expect(calculateCompletionPercentage(patterns)).toBe(100);
  });

  it('should return 50 when half are completed', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 30, isCompleted: false },
    ];

    expect(calculateCompletionPercentage(patterns)).toBe(50);
  });

  it('should calculate correct percentage for various completion states', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
      { id: 'p2', title: 'Pattern 2', orderIndex: 2, masteryScore: 90, isCompleted: true },
      { id: 'p3', title: 'Pattern 3', orderIndex: 3, masteryScore: 0, isCompleted: false },
      { id: 'p4', title: 'Pattern 4', orderIndex: 4, masteryScore: 30, isCompleted: false },
    ];

    expect(calculateCompletionPercentage(patterns)).toBe(50);
  });

  it('should handle single completed pattern', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 80, isCompleted: true },
    ];

    expect(calculateCompletionPercentage(patterns)).toBe(100);
  });

  it('should handle single incomplete pattern', () => {
    const patterns: PatternWithProgress[] = [
      { id: 'p1', title: 'Pattern 1', orderIndex: 1, masteryScore: 30, isCompleted: false },
    ];

    expect(calculateCompletionPercentage(patterns)).toBe(0);
  });
});
