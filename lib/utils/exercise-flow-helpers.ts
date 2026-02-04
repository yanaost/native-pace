/**
 * Exercise Flow Helpers
 *
 * Integration utilities for exercise submission and progress tracking.
 * Combines practice session state with progress updates.
 */

import type { ExerciseType } from '@/types/exercise';
import { exerciseResultToQuality } from './spaced-repetition';
import { calculateNewMastery, VALID_EXERCISE_TYPES } from './progress-helpers';

/**
 * Complete exercise submission data
 */
export interface ExerciseSubmission {
  patternId: string;
  exerciseType: ExerciseType;
  isCorrect: boolean;
  responseTimeMs: number;
  userInput?: string;
  sessionId?: string;
}

/**
 * Validation result for exercise submission
 */
export interface SubmissionValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Progress update after exercise completion
 */
export interface ProgressUpdate {
  patternId: string;
  previousMastery: number;
  newMastery: number;
  masteryChange: number;
  quality: number;
  isImprovement: boolean;
}

/**
 * Summary of a completed session
 */
export interface SessionCompletionSummary {
  patternId: string;
  totalExercises: number;
  correctCount: number;
  incorrectCount: number;
  accuracy: number;
  averageResponseTimeMs: number;
  totalTimeMs: number;
  progressUpdates: ProgressUpdate[];
  overallMasteryChange: number;
  achievedMilestone: SessionMilestone | null;
}

/**
 * Session milestone achievements
 */
export type SessionMilestone =
  | 'first-practice'
  | 'perfect-score'
  | 'mastery-50'
  | 'mastery-75'
  | 'mastery-100';

/**
 * Minimum response time to be considered valid (prevents gaming)
 */
export const MIN_RESPONSE_TIME_MS = 500;

/**
 * Maximum response time to track (cap for statistics)
 */
export const MAX_RESPONSE_TIME_MS = 60000;

/**
 * Validates a complete exercise submission.
 */
export function validateSubmission(
  submission: unknown
): SubmissionValidationResult {
  const errors: string[] = [];

  if (!submission || typeof submission !== 'object') {
    return { isValid: false, errors: ['Submission must be an object'] };
  }

  const data = submission as Record<string, unknown>;

  // Required fields
  if (!data.patternId || typeof data.patternId !== 'string') {
    errors.push('patternId is required');
  }

  if (!data.exerciseType || typeof data.exerciseType !== 'string') {
    errors.push('exerciseType is required');
  } else if (!VALID_EXERCISE_TYPES.includes(data.exerciseType as ExerciseType)) {
    errors.push(`Invalid exerciseType: ${data.exerciseType}`);
  }

  if (typeof data.isCorrect !== 'boolean') {
    errors.push('isCorrect must be a boolean');
  }

  if (typeof data.responseTimeMs !== 'number') {
    errors.push('responseTimeMs must be a number');
  } else if (data.responseTimeMs < 0) {
    errors.push('responseTimeMs cannot be negative');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes response time to valid range.
 */
export function normalizeResponseTime(responseTimeMs: number): number {
  if (responseTimeMs < MIN_RESPONSE_TIME_MS) {
    return MIN_RESPONSE_TIME_MS;
  }
  if (responseTimeMs > MAX_RESPONSE_TIME_MS) {
    return MAX_RESPONSE_TIME_MS;
  }
  return responseTimeMs;
}

/**
 * Calculates SM-2 quality score from exercise result.
 */
export function getSubmissionQuality(
  isCorrect: boolean,
  responseTimeMs: number,
  averageTimeMs: number = 5000
): number {
  return exerciseResultToQuality(isCorrect, responseTimeMs, averageTimeMs);
}

/**
 * Calculates progress update for an exercise submission.
 */
export function calculateProgressUpdate(
  patternId: string,
  previousMastery: number,
  submission: ExerciseSubmission
): ProgressUpdate {
  const newMastery = calculateNewMastery(
    previousMastery,
    submission.isCorrect,
    submission.exerciseType
  );

  const quality = getSubmissionQuality(
    submission.isCorrect,
    submission.responseTimeMs
  );

  const masteryChange = newMastery - previousMastery;

  return {
    patternId,
    previousMastery,
    newMastery,
    masteryChange,
    quality,
    isImprovement: masteryChange > 0,
  };
}

/**
 * Calculates overall session score (0-100).
 */
export function calculateSessionScore(
  correctCount: number,
  totalCount: number,
  averageResponseTimeMs: number
): number {
  if (totalCount === 0) {
    return 0;
  }

  // Base score from accuracy (70% weight)
  const accuracyScore = (correctCount / totalCount) * 100;

  // Speed bonus (30% weight) - faster is better, capped at 10s average
  const speedFactor = Math.max(0, 1 - averageResponseTimeMs / 10000);
  const speedBonus = speedFactor * 100;

  return Math.round(accuracyScore * 0.7 + speedBonus * 0.3);
}

/**
 * Determines milestone achieved in a session.
 */
export function checkSessionMilestone(
  isFirstPractice: boolean,
  accuracy: number,
  newMastery: number,
  previousMastery: number
): SessionMilestone | null {
  if (isFirstPractice) {
    return 'first-practice';
  }

  if (accuracy === 100) {
    return 'perfect-score';
  }

  // Check mastery milestones (only if crossed threshold)
  if (newMastery >= 100 && previousMastery < 100) {
    return 'mastery-100';
  }
  if (newMastery >= 75 && previousMastery < 75) {
    return 'mastery-75';
  }
  if (newMastery >= 50 && previousMastery < 50) {
    return 'mastery-50';
  }

  return null;
}

/**
 * Creates a completion summary for a finished session.
 */
export function createCompletionSummary(
  patternId: string,
  submissions: ExerciseSubmission[],
  previousMastery: number,
  isFirstPractice: boolean = false
): SessionCompletionSummary {
  const totalExercises = submissions.length;
  const correctCount = submissions.filter((s) => s.isCorrect).length;
  const incorrectCount = totalExercises - correctCount;
  const accuracy = totalExercises > 0
    ? Math.round((correctCount / totalExercises) * 100)
    : 0;

  const totalResponseTime = submissions.reduce(
    (sum, s) => sum + s.responseTimeMs,
    0
  );
  const averageResponseTimeMs = totalExercises > 0
    ? Math.round(totalResponseTime / totalExercises)
    : 0;

  // Calculate cumulative progress updates
  let currentMastery = previousMastery;
  const progressUpdates: ProgressUpdate[] = [];

  for (const submission of submissions) {
    const update = calculateProgressUpdate(patternId, currentMastery, submission);
    progressUpdates.push(update);
    currentMastery = update.newMastery;
  }

  const overallMasteryChange = currentMastery - previousMastery;
  const achievedMilestone = checkSessionMilestone(
    isFirstPractice,
    accuracy,
    currentMastery,
    previousMastery
  );

  // Estimate total time from response times (rough approximation)
  const totalTimeMs = totalResponseTime;

  return {
    patternId,
    totalExercises,
    correctCount,
    incorrectCount,
    accuracy,
    averageResponseTimeMs,
    totalTimeMs,
    progressUpdates,
    overallMasteryChange,
    achievedMilestone,
  };
}

/**
 * Summarizes multiple progress updates.
 */
export function summarizeProgressUpdates(updates: ProgressUpdate[]): {
  totalImprovement: number;
  averageQuality: number;
  improvementCount: number;
  declineCount: number;
} {
  if (updates.length === 0) {
    return {
      totalImprovement: 0,
      averageQuality: 0,
      improvementCount: 0,
      declineCount: 0,
    };
  }

  const totalImprovement = updates.reduce((sum, u) => sum + u.masteryChange, 0);
  const averageQuality = Math.round(
    updates.reduce((sum, u) => sum + u.quality, 0) / updates.length
  );
  const improvementCount = updates.filter((u) => u.isImprovement).length;
  const declineCount = updates.filter((u) => u.masteryChange < 0).length;

  return {
    totalImprovement,
    averageQuality,
    improvementCount,
    declineCount,
  };
}

/**
 * Determines if streak should be updated based on practice date.
 */
export function shouldUpdateStreak(
  lastPracticeDate: string | null,
  currentDate: Date = new Date()
): { shouldIncrement: boolean; shouldReset: boolean } {
  if (!lastPracticeDate) {
    return { shouldIncrement: true, shouldReset: false };
  }

  const lastPractice = new Date(lastPracticeDate);
  const lastDay = new Date(
    Date.UTC(
      lastPractice.getUTCFullYear(),
      lastPractice.getUTCMonth(),
      lastPractice.getUTCDate()
    )
  );
  const today = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate()
    )
  );

  const daysDiff = Math.floor(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) {
    // Already practiced today
    return { shouldIncrement: false, shouldReset: false };
  } else if (daysDiff === 1) {
    // Practiced yesterday, streak continues
    return { shouldIncrement: true, shouldReset: false };
  } else {
    // Missed days, reset streak
    return { shouldIncrement: true, shouldReset: true };
  }
}

/**
 * Gets recommendation for next pattern based on progress.
 */
export interface PatternProgress {
  patternId: string;
  mastery: number;
  nextReviewAt: Date | null;
  timesPracticed: number;
}

export function getNextRecommendedPattern(
  progress: PatternProgress[],
  currentDate: Date = new Date()
): string | null {
  if (progress.length === 0) {
    return null;
  }

  // Priority 1: Patterns due for review
  const dueForReview = progress
    .filter((p) => p.nextReviewAt && p.nextReviewAt <= currentDate)
    .sort((a, b) => {
      // Sort by review date (oldest first)
      const aTime = a.nextReviewAt?.getTime() || 0;
      const bTime = b.nextReviewAt?.getTime() || 0;
      return aTime - bTime;
    });

  if (dueForReview.length > 0) {
    return dueForReview[0].patternId;
  }

  // Priority 2: Patterns with low mastery
  const lowMastery = progress
    .filter((p) => p.mastery < 50)
    .sort((a, b) => a.mastery - b.mastery);

  if (lowMastery.length > 0) {
    return lowMastery[0].patternId;
  }

  // Priority 3: Least practiced pattern
  const leastPracticed = [...progress].sort(
    (a, b) => a.timesPracticed - b.timesPracticed
  );

  return leastPracticed[0].patternId;
}
