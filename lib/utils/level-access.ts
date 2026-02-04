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
