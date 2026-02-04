/**
 * Streak Calculation Helpers
 *
 * Utility functions for calculating and managing user practice streaks.
 * A streak is the number of consecutive days a user has practiced.
 */

/** Streak data from user profile */
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
}

/** Result of streak calculation */
export interface StreakUpdateResult {
  newCurrentStreak: number;
  newLongestStreak: number;
  streakContinued: boolean;
  streakBroken: boolean;
  isNewRecord: boolean;
}

/** One day in milliseconds */
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Normalizes a date to the start of the day (midnight UTC).
 *
 * @param date - Date to normalize
 * @returns New Date set to midnight UTC
 */
export function normalizeToDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Calculates the number of days between two dates.
 * Returns a positive number if date2 is after date1.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates (can be fractional)
 */
export function daysBetween(date1: Date, date2: Date): number {
  const normalized1 = normalizeToDay(date1);
  const normalized2 = normalizeToDay(date2);
  return (normalized2.getTime() - normalized1.getTime()) / ONE_DAY_MS;
}

/**
 * Checks if two dates are on the same day (UTC).
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are on the same UTC day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return daysBetween(date1, date2) === 0;
}

/**
 * Checks if date2 is the day after date1.
 *
 * @param date1 - First date
 * @param date2 - Second date (should be after date1)
 * @returns True if date2 is exactly one day after date1
 */
export function isNextDay(date1: Date, date2: Date): boolean {
  return daysBetween(date1, date2) === 1;
}

/**
 * Checks if the streak should continue based on the last practice date.
 * Streak continues if:
 * - Last practice was today (same day)
 * - Last practice was yesterday (next day now)
 *
 * @param lastPracticeDate - The last practice date (ISO string or null)
 * @param currentDate - The current date (defaults to now)
 * @returns True if streak should continue, false if broken
 */
export function shouldStreakContinue(
  lastPracticeDate: string | null,
  currentDate: Date = new Date()
): boolean {
  if (lastPracticeDate === null) {
    // No previous practice - streak starts fresh
    return false;
  }

  const lastDate = new Date(lastPracticeDate);
  const days = daysBetween(lastDate, currentDate);

  // Streak continues if last practice was today (0 days) or yesterday (1 day)
  return days >= 0 && days <= 1;
}

/**
 * Checks if practice was already recorded today.
 *
 * @param lastPracticeDate - The last practice date (ISO string or null)
 * @param currentDate - The current date (defaults to now)
 * @returns True if practice was already recorded today
 */
export function hasPracticedToday(
  lastPracticeDate: string | null,
  currentDate: Date = new Date()
): boolean {
  if (lastPracticeDate === null) {
    return false;
  }

  const lastDate = new Date(lastPracticeDate);
  return isSameDay(lastDate, currentDate);
}

/**
 * Calculates the new streak values after a practice session.
 *
 * @param currentStreak - Current streak count
 * @param longestStreak - Longest streak ever
 * @param lastPracticeDate - Last practice date (ISO string or null)
 * @param practiceDate - Date of this practice (defaults to now)
 * @returns Updated streak values and status flags
 */
export function calculateStreakUpdate(
  currentStreak: number,
  longestStreak: number,
  lastPracticeDate: string | null,
  practiceDate: Date = new Date()
): StreakUpdateResult {
  // If already practiced today, no change needed
  if (hasPracticedToday(lastPracticeDate, practiceDate)) {
    return {
      newCurrentStreak: currentStreak,
      newLongestStreak: longestStreak,
      streakContinued: true,
      streakBroken: false,
      isNewRecord: false,
    };
  }

  let newCurrentStreak: number;
  let streakContinued: boolean;
  let streakBroken: boolean;

  if (shouldStreakContinue(lastPracticeDate, practiceDate)) {
    // Streak continues - increment
    newCurrentStreak = currentStreak + 1;
    streakContinued = true;
    streakBroken = false;
  } else {
    // Streak broken - start fresh
    newCurrentStreak = 1;
    streakContinued = false;
    // Only mark as broken if there was a previous streak
    streakBroken = currentStreak > 0 && lastPracticeDate !== null;
  }

  // Check for new record
  const newLongestStreak = Math.max(longestStreak, newCurrentStreak);
  const isNewRecord = newCurrentStreak > longestStreak;

  return {
    newCurrentStreak,
    newLongestStreak,
    streakContinued,
    streakBroken,
    isNewRecord,
  };
}

/**
 * Creates the database update object for streak fields.
 *
 * @param result - Streak update result
 * @param practiceDate - Date of practice (defaults to now)
 * @returns Object with fields to update in profiles table
 */
export function createStreakUpdateData(
  result: StreakUpdateResult,
  practiceDate: Date = new Date()
): {
  streak_current: number;
  streak_longest: number;
  last_practice_date: string;
} {
  return {
    streak_current: result.newCurrentStreak,
    streak_longest: result.newLongestStreak,
    last_practice_date: normalizeToDay(practiceDate).toISOString(),
  };
}

/**
 * Gets a human-readable description of the streak status.
 *
 * @param streak - Current streak count
 * @returns Descriptive string (e.g., "3 day streak", "No streak")
 */
export function formatStreakText(streak: number): string {
  if (streak === 0) {
    return 'No streak';
  }
  if (streak === 1) {
    return '1 day streak';
  }
  return `${streak} day streak`;
}

/**
 * Gets motivational message based on streak status.
 *
 * @param currentStreak - Current streak count
 * @param isNewRecord - Whether this is a new personal record
 * @returns Motivational message string
 */
export function getStreakMotivationMessage(
  currentStreak: number,
  isNewRecord: boolean
): string {
  if (isNewRecord && currentStreak > 1) {
    return 'New personal best! Keep it up!';
  }
  if (currentStreak >= 30) {
    return 'Incredible dedication! A month of practice!';
  }
  if (currentStreak >= 14) {
    return 'Two weeks strong! Amazing consistency!';
  }
  if (currentStreak >= 7) {
    return 'One week streak! Great commitment!';
  }
  if (currentStreak >= 3) {
    return 'Building momentum! Keep going!';
  }
  if (currentStreak === 1) {
    return 'Great start! Come back tomorrow!';
  }
  return 'Start your streak today!';
}
