/**
 * Progress Tracking Helpers
 *
 * Utility functions for managing user progress and exercise attempts.
 */

import type { ExerciseType } from '@/types/exercise';

/** Request body for recording an exercise attempt */
export interface RecordAttemptRequest {
  patternId: string;
  exerciseType: ExerciseType;
  isCorrect: boolean;
  responseTimeMs: number;
  userInput?: string;
  sessionId?: string;
}

/** Validation errors for attempt request */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/** Valid exercise types */
export const VALID_EXERCISE_TYPES: ExerciseType[] = [
  'comparison',
  'discrimination',
  'dictation',
  'speed',
];

/**
 * Validates an exercise attempt request body.
 *
 * @param body - The request body to validate
 * @returns Validation result with errors if any
 */
export function validateAttemptRequest(body: unknown): ValidationResult {
  const errors: string[] = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['Request body must be an object'] };
  }

  const data = body as Record<string, unknown>;

  // Validate patternId
  if (!data.patternId || typeof data.patternId !== 'string') {
    errors.push('patternId is required and must be a string');
  }

  // Validate exerciseType
  if (!data.exerciseType || typeof data.exerciseType !== 'string') {
    errors.push('exerciseType is required and must be a string');
  } else if (!VALID_EXERCISE_TYPES.includes(data.exerciseType as ExerciseType)) {
    errors.push(`exerciseType must be one of: ${VALID_EXERCISE_TYPES.join(', ')}`);
  }

  // Validate isCorrect
  if (typeof data.isCorrect !== 'boolean') {
    errors.push('isCorrect is required and must be a boolean');
  }

  // Validate responseTimeMs
  if (typeof data.responseTimeMs !== 'number' || data.responseTimeMs < 0) {
    errors.push('responseTimeMs is required and must be a non-negative number');
  }

  // Validate userInput (optional)
  if (data.userInput !== undefined && typeof data.userInput !== 'string') {
    errors.push('userInput must be a string if provided');
  }

  // Validate sessionId (optional)
  if (data.sessionId !== undefined && typeof data.sessionId !== 'string') {
    errors.push('sessionId must be a string if provided');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Parses a validated request body into a typed request object.
 *
 * @param body - The validated request body
 * @returns Parsed request object
 */
export function parseAttemptRequest(body: Record<string, unknown>): RecordAttemptRequest {
  return {
    patternId: body.patternId as string,
    exerciseType: body.exerciseType as ExerciseType,
    isCorrect: body.isCorrect as boolean,
    responseTimeMs: body.responseTimeMs as number,
    userInput: body.userInput as string | undefined,
    sessionId: body.sessionId as string | undefined,
  };
}

/**
 * Calculates the new mastery score based on exercise result.
 * Mastery increases for correct answers and decreases for incorrect ones.
 *
 * @param currentMastery - Current mastery score (0-100)
 * @param isCorrect - Whether the answer was correct
 * @param exerciseType - Type of exercise completed
 * @returns New mastery score (0-100)
 */
export function calculateNewMastery(
  currentMastery: number,
  isCorrect: boolean,
  exerciseType: ExerciseType
): number {
  // Different exercises contribute different amounts to mastery
  const masteryWeights: Record<ExerciseType, number> = {
    comparison: 5,
    discrimination: 10,
    dictation: 15,
    speed: 10,
  };

  const weight = masteryWeights[exerciseType] || 10;

  let newMastery: number;
  if (isCorrect) {
    // Increase mastery, with diminishing returns as mastery gets higher
    const remainingToMax = 100 - currentMastery;
    const increase = Math.min(weight, remainingToMax * 0.2 + weight * 0.5);
    newMastery = currentMastery + increase;
  } else {
    // Decrease mastery, but not too harshly
    const decrease = weight * 0.5;
    newMastery = currentMastery - decrease;
  }

  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(newMastery)));
}

/**
 * Determines if a pattern should be considered "learned" based on mastery.
 *
 * @param masteryScore - Current mastery score (0-100)
 * @param threshold - Mastery threshold to be considered learned (default: 50)
 * @returns True if the pattern is learned
 */
export function isPatternLearned(masteryScore: number, threshold: number = 50): boolean {
  return masteryScore >= threshold;
}

/**
 * Creates exercise attempt data for database insertion.
 *
 * @param userId - The user's ID
 * @param request - The exercise attempt request
 * @returns Object ready for database insertion
 */
export function createAttemptRecord(
  userId: string,
  request: RecordAttemptRequest
): {
  user_id: string;
  pattern_id: string;
  exercise_type: ExerciseType;
  is_correct: boolean;
  response_time_ms: number;
  user_input: string | null;
} {
  return {
    user_id: userId,
    pattern_id: request.patternId,
    exercise_type: request.exerciseType,
    is_correct: request.isCorrect,
    response_time_ms: request.responseTimeMs,
    user_input: request.userInput || null,
  };
}

/**
 * Creates or updates progress record data for database upsert.
 *
 * @param userId - The user's ID
 * @param patternId - The pattern's ID
 * @param masteryScore - New mastery score
 * @param timesPracticed - Updated practice count
 * @param timesCorrect - Updated correct count
 * @param easeFactor - SM-2 ease factor
 * @param intervalDays - SM-2 interval in days
 * @param nextReviewAt - Next review date
 * @returns Object ready for database upsert
 */
export function createProgressRecord(
  userId: string,
  patternId: string,
  masteryScore: number,
  timesPracticed: number,
  timesCorrect: number,
  easeFactor: number,
  intervalDays: number,
  nextReviewAt: Date
): {
  user_id: string;
  pattern_id: string;
  mastery_score: number;
  times_practiced: number;
  times_correct: number;
  last_practiced_at: string;
  ease_factor: number;
  interval_days: number;
  next_review_at: string;
} {
  return {
    user_id: userId,
    pattern_id: patternId,
    mastery_score: masteryScore,
    times_practiced: timesPracticed,
    times_correct: timesCorrect,
    last_practiced_at: new Date().toISOString(),
    ease_factor: easeFactor,
    interval_days: intervalDays,
    next_review_at: nextReviewAt.toISOString(),
  };
}
