/**
 * Level Access Utilities
 *
 * Functions for determining level access based on subscription tier
 * and calculating level-related metrics.
 */

import type { Level, LevelAccessTier } from '@/lib/constants/levels';
import type { SubscriptionTier } from '@/types/user';

/**
 * Check if a user can access a level based on their subscription tier.
 *
 * @param levelAccessTier - The access tier required for the level
 * @param userTier - The user's current subscription tier
 * @returns true if the user can access the level
 */
export function canAccessLevel(
  levelAccessTier: LevelAccessTier,
  userTier: SubscriptionTier
): boolean {
  if (levelAccessTier === 'free') {
    return true;
  }
  if (levelAccessTier === 'free-account') {
    // All logged-in users can access free-account levels
    return true;
  }
  if (levelAccessTier === 'premium') {
    return userTier === 'premium' || userTier === 'lifetime';
  }
  return false;
}

/**
 * Calculate the total number of patterns in a level.
 *
 * @param level - The level definition
 * @returns The number of patterns in the level
 */
export function getLevelPatternCount(level: Level): number {
  return level.patternRange.end - level.patternRange.start + 1;
}

/**
 * Check if a level is locked for a user.
 *
 * @param level - The level to check
 * @param userTier - The user's subscription tier
 * @returns true if the level is locked
 */
export function isLevelLocked(level: Level, userTier: SubscriptionTier): boolean {
  return !canAccessLevel(level.accessTier, userTier);
}

/** Pattern with progress information */
export interface PatternWithProgress {
  id: string;
  title: string;
  orderIndex: number;
  masteryScore: number;
  isCompleted: boolean;
}

/**
 * Find the next unlearned pattern in a list.
 * Returns the first pattern with mastery < 50, or null if all are completed.
 *
 * @param patterns - List of patterns with progress info, sorted by orderIndex
 * @returns The next pattern to learn, or null if all completed
 */
export function findNextUnlearnedPattern(
  patterns: PatternWithProgress[]
): PatternWithProgress | null {
  // Patterns should already be sorted by orderIndex
  const sorted = [...patterns].sort((a, b) => a.orderIndex - b.orderIndex);
  return sorted.find((p) => !p.isCompleted) ?? null;
}

/**
 * Calculate completion percentage for a list of patterns.
 *
 * @param patterns - List of patterns with progress info
 * @returns Percentage of patterns completed (0-100)
 */
export function calculateCompletionPercentage(
  patterns: PatternWithProgress[]
): number {
  if (patterns.length === 0) return 0;
  const completed = patterns.filter((p) => p.isCompleted).length;
  return (completed / patterns.length) * 100;
}
