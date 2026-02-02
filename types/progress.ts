/**
 * Progress type definitions for NativePace
 * Tracking user learning progress and statistics
 */

import type { PatternCategory } from './pattern';

/** User's learning progress on a specific pattern */
export interface UserPatternProgress {
  /** Unique progress record identifier */
  id: string;
  /** ID of the user */
  userId: string;
  /** ID of the pattern being tracked */
  patternId: string;
  /** Mastery score from 0-100 */
  masteryScore: number;
  /** Total number of times practiced */
  timesPracticed: number;
  /** Number of correct responses */
  timesCorrect: number;
  /** When the pattern was last practiced */
  lastPracticedAt: Date | null;
  /** When the pattern is next due for review (SM-2) */
  nextReviewAt: Date | null;
  /** SM-2 ease factor (minimum 1.3, default 2.5) */
  easeFactor: number;
  /** SM-2 interval in days */
  intervalDays: number;
}

/** Aggregated user statistics */
export interface UserStats {
  /** Number of patterns the user has learned */
  patternsLearned: number;
  /** Total number of patterns available */
  patternsTotal: number;
  /** Current consecutive days streak */
  currentStreak: number;
  /** Longest streak ever achieved */
  longestStreak: number;
  /** Total practice time in minutes */
  totalPracticeMinutes: number;
  /** Overall accuracy percentage (0-100) */
  averageAccuracy: number;
  /** Mastery percentage (0-100) by pattern category */
  masteryByCategory: Record<PatternCategory, number>;
}
