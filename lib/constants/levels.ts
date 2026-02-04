/**
 * Level Constants
 *
 * Defines the 6 learning levels, their pattern ranges, and premium gating.
 * These constants are used throughout the app for navigation, progress tracking,
 * and subscription enforcement.
 */

/** Level number (1-6) */
export type LevelNumber = 1 | 2 | 3 | 4 | 5 | 6;

/** Access tier required for a level */
export type LevelAccessTier = 'free' | 'free-account' | 'premium';

/** Level definition */
export interface Level {
  id: LevelNumber;
  name: string;
  description: string;
  patternRange: { start: number; end: number };
  accessTier: LevelAccessTier;
}

/** All level definitions */
export const LEVELS: Level[] = [
  {
    id: 1,
    name: 'Foundation',
    description: 'Essential patterns for basic comprehension',
    patternRange: { start: 1, end: 20 },
    accessTier: 'free',
  },
  {
    id: 2,
    name: 'Common Reductions',
    description: 'Frequently used reductions in everyday speech',
    patternRange: { start: 21, end: 50 },
    accessTier: 'free-account',
  },
  {
    id: 3,
    name: 'Linking Mastery',
    description: 'Word linking patterns for smoother listening',
    patternRange: { start: 51, end: 80 },
    accessTier: 'premium',
  },
  {
    id: 4,
    name: 'Advanced Patterns',
    description: 'Complex patterns found in rapid speech',
    patternRange: { start: 81, end: 120 },
    accessTier: 'premium',
  },
  {
    id: 5,
    name: 'Native Speed',
    description: 'Patterns for understanding native speakers',
    patternRange: { start: 121, end: 150 },
    accessTier: 'premium',
  },
  {
    id: 6,
    name: 'Mastery',
    description: 'Advanced patterns for complete fluency',
    patternRange: { start: 151, end: 185 },
    accessTier: 'premium',
  },
];

/** Array of premium level numbers */
export const PREMIUM_LEVELS: LevelNumber[] = [3, 4, 5, 6];

/** Array of free level numbers */
export const FREE_LEVELS: LevelNumber[] = [1, 2];

/** Total number of patterns across all levels */
export const TOTAL_PATTERNS = 185;

/**
 * Get level by ID.
 *
 * @param id - Level number (1-6)
 * @returns Level definition or undefined if not found
 */
export function getLevelById(id: LevelNumber): Level | undefined {
  return LEVELS.find((level) => level.id === id);
}

/**
 * Check if a level requires premium subscription.
 *
 * @param id - Level number (1-6)
 * @returns true if the level requires premium access
 */
export function isLevelPremium(id: LevelNumber): boolean {
  return PREMIUM_LEVELS.includes(id);
}

/**
 * Get the level for a pattern by its order index.
 *
 * @param patternIndex - Pattern index (1-185)
 * @returns Level number or null if pattern index is out of range
 */
export function getPatternLevel(patternIndex: number): LevelNumber | null {
  if (patternIndex < 1 || patternIndex > TOTAL_PATTERNS) {
    return null;
  }

  for (const level of LEVELS) {
    if (
      patternIndex >= level.patternRange.start &&
      patternIndex <= level.patternRange.end
    ) {
      return level.id;
    }
  }

  return null;
}
