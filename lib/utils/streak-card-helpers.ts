/**
 * Streak Card Display Helpers
 *
 * Helper functions for StreakCard component display logic.
 * These are extracted for testing purposes.
 */

/**
 * Gets the emoji to display based on streak status.
 *
 * @param currentStreak - Current streak count
 * @returns Emoji string (fire for active streak, sleeping for no streak)
 */
export function getStreakEmoji(currentStreak: number): string {
  return currentStreak > 0 ? '🔥' : '💤';
}

/**
 * Determines if the longest streak should be shown.
 * Only shows if there's a longest streak that's greater than current.
 *
 * @param currentStreak - Current streak count
 * @param longestStreak - Longest streak ever (undefined if not provided)
 * @returns True if longest streak should be displayed
 */
export function shouldShowLongestStreak(
  currentStreak: number,
  longestStreak: number | undefined
): boolean {
  return longestStreak !== undefined && longestStreak > currentStreak;
}

/**
 * Determines if the new record badge should be shown.
 * Only shows for new records with streak > 1.
 *
 * @param isNewRecord - Whether this is a new record
 * @param currentStreak - Current streak count
 * @returns True if new record badge should be displayed
 */
export function shouldShowNewRecordBadge(
  isNewRecord: boolean,
  currentStreak: number
): boolean {
  return isNewRecord && currentStreak > 1;
}
