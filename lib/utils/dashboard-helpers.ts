/**
 * Dashboard Display Helpers
 *
 * Pure utility functions for dashboard page display logic.
 */

import { LEVELS, TOTAL_PATTERNS, type LevelNumber } from '@/lib/constants/levels';

/**
 * Gets a time-based greeting based on the hour of day.
 *
 * @param hour - Hour of day (0-23), defaults to current hour
 * @returns Greeting string (Good morning/afternoon/evening)
 */
export function getTimeBasedGreeting(hour?: number): string {
  const h = hour ?? new Date().getHours();

  if (h >= 5 && h < 12) {
    return 'Good morning';
  }
  if (h >= 12 && h < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}

/**
 * Formats the dashboard greeting with optional user name.
 *
 * @param displayName - User's display name (or null)
 * @param hour - Hour of day for time-based greeting
 * @returns Formatted greeting (e.g., "Good morning, John!")
 */
export function formatDashboardGreeting(
  displayName: string | null,
  hour?: number
): string {
  const greeting = getTimeBasedGreeting(hour);

  if (displayName && displayName.trim()) {
    return `${greeting}, ${displayName.trim()}!`;
  }

  return `${greeting}!`;
}

/**
 * Calculates overall progress percentage.
 *
 * @param patternsLearned - Number of patterns learned
 * @param totalPatterns - Total patterns available
 * @returns Progress percentage (0-100)
 */
export function calculateOverallProgress(
  patternsLearned: number,
  totalPatterns: number
): number {
  if (totalPatterns <= 0) return 0;
  if (patternsLearned <= 0) return 0;
  if (patternsLearned >= totalPatterns) return 100;

  return Math.round((patternsLearned / totalPatterns) * 100);
}

/**
 * Gets progress description text.
 *
 * @param patternsLearned - Number of patterns learned
 * @param totalPatterns - Total patterns available
 * @returns Description string (e.g., "47 of 185 patterns")
 */
export function getProgressDescription(
  patternsLearned: number,
  totalPatterns: number
): string {
  return `${patternsLearned} of ${totalPatterns} patterns`;
}

/** Info about the user's current level */
export interface CurrentLevelInfo {
  levelId: LevelNumber;
  levelName: string;
  patternsInLevel: number;
  patternsCompletedInLevel: number;
}

/**
 * Gets current level info based on patterns learned count.
 * Returns the level the user is currently working on.
 *
 * @param patternsLearned - Number of patterns the user has learned
 * @returns Current level info, or null if all patterns completed
 */
export function getCurrentLevelInfo(
  patternsLearned: number
): CurrentLevelInfo | null {
  if (patternsLearned >= TOTAL_PATTERNS) {
    return null; // All patterns completed
  }

  // Find the level containing the next pattern to learn
  const nextPatternIndex = patternsLearned + 1;

  for (const level of LEVELS) {
    if (
      nextPatternIndex >= level.patternRange.start &&
      nextPatternIndex <= level.patternRange.end
    ) {
      const patternsInLevel = level.patternRange.end - level.patternRange.start + 1;
      const patternsCompletedInLevel = Math.max(
        0,
        patternsLearned - level.patternRange.start + 1
      );

      return {
        levelId: level.id,
        levelName: level.name,
        patternsInLevel,
        patternsCompletedInLevel,
      };
    }
  }

  // Default to first level if patterns learned is 0
  const firstLevel = LEVELS[0];
  return {
    levelId: firstLevel.id,
    levelName: firstLevel.name,
    patternsInLevel: firstLevel.patternRange.end - firstLevel.patternRange.start + 1,
    patternsCompletedInLevel: 0,
  };
}

/**
 * Gets the index of the next pattern to learn.
 *
 * @param patternsLearned - Number of patterns learned
 * @returns Next pattern index (1-based), or null if all completed
 */
export function getNextPatternIndex(patternsLearned: number): number | null {
  if (patternsLearned >= TOTAL_PATTERNS) {
    return null;
  }
  return patternsLearned + 1;
}

/**
 * Gets review section summary text.
 *
 * @param dueCount - Number of patterns due for review
 * @returns Summary text for review section
 */
export function getReviewSummaryText(dueCount: number): string {
  if (dueCount === 0) {
    return 'No patterns due for review';
  }
  if (dueCount === 1) {
    return '1 pattern due for review';
  }
  return `${dueCount} patterns due for review`;
}

/**
 * Gets the "continue learning" section title text.
 *
 * @param patternsLearned - Number of patterns learned
 * @returns Section title text
 */
export function getContinueLearningText(patternsLearned: number): string {
  if (patternsLearned === 0) {
    return 'Start Learning';
  }
  if (patternsLearned >= TOTAL_PATTERNS) {
    return 'All Patterns Completed';
  }
  return 'Continue Learning';
}

/**
 * Gets the learn button text.
 *
 * @param patternsLearned - Number of patterns learned
 * @returns Button label text
 */
export function getLearnButtonText(patternsLearned: number): string {
  if (patternsLearned === 0) {
    return 'Start';
  }
  if (patternsLearned >= TOTAL_PATTERNS) {
    return 'Review All';
  }
  return 'Continue';
}

/**
 * Checks if the user has any progress.
 *
 * @param patternsLearned - Number of patterns learned
 * @returns True if user has started learning
 */
export function hasStartedLearning(patternsLearned: number): boolean {
  return patternsLearned > 0;
}

/**
 * Checks if the user has completed all patterns.
 *
 * @param patternsLearned - Number of patterns learned
 * @returns True if all patterns are completed
 */
export function hasCompletedAllPatterns(patternsLearned: number): boolean {
  return patternsLearned >= TOTAL_PATTERNS;
}
