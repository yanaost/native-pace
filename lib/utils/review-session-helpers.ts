/**
 * Review Session Helpers
 *
 * Utility functions for managing review sessions that process multiple patterns.
 * Review sessions are lighter than learning sessions - typically 1-2 exercises per pattern.
 */

import type { ExerciseType } from '@/types/exercise';
import type { ProgressWithPattern } from './review-queue';
import type { ExerciseSessionResult } from './practice-session-helpers';
import type { PatternCategory } from '@/types/pattern';

/** Default exercise sequence for review (shorter than learning) */
export const REVIEW_EXERCISE_SEQUENCE: ExerciseType[] = [
  'discrimination',
  'dictation',
];

/** Result from a single pattern in the review session */
export interface PatternReviewResult {
  patternId: string;
  patternTitle: string;
  category: PatternCategory | null;
  exerciseResults: ExerciseSessionResult[];
  isCorrect: boolean; // Overall pass/fail for the pattern
}

/** Overall review session result */
export interface ReviewSessionResult {
  patternsReviewed: number;
  patternsPassed: number;
  patternsFailed: number;
  totalTimeMs: number;
  accuracy: number;
  patternResults: PatternReviewResult[];
}

/** State during a review session */
export interface ReviewSessionState {
  /** All patterns to review */
  patterns: ProgressWithPattern[];
  /** Index of current pattern being reviewed */
  currentPatternIndex: number;
  /** Current exercise index within the pattern */
  currentExerciseIndex: number;
  /** Exercise sequence for each pattern */
  exerciseSequence: ExerciseType[];
  /** Results for each pattern */
  patternResults: PatternReviewResult[];
  /** Current pattern's exercise results (accumulated until pattern complete) */
  currentPatternExerciseResults: ExerciseSessionResult[];
  /** Session start time */
  startTime: number;
  /** Whether session is complete */
  isComplete: boolean;
}

/**
 * Creates the initial state for a review session.
 *
 * @param patterns - The patterns to review
 * @param exerciseSequence - Exercise sequence per pattern (default: discrimination, dictation)
 * @returns Initial review session state
 */
export function createReviewSessionState(
  patterns: ProgressWithPattern[],
  exerciseSequence: ExerciseType[] = REVIEW_EXERCISE_SEQUENCE
): ReviewSessionState {
  return {
    patterns,
    currentPatternIndex: 0,
    currentExerciseIndex: 0,
    exerciseSequence,
    patternResults: [],
    currentPatternExerciseResults: [],
    startTime: Date.now(),
    isComplete: patterns.length === 0,
  };
}

/**
 * Gets the current pattern being reviewed.
 *
 * @param state - The review session state
 * @returns Current pattern or null if complete
 */
export function getCurrentPattern(
  state: ReviewSessionState
): ProgressWithPattern | null {
  if (state.isComplete || state.currentPatternIndex >= state.patterns.length) {
    return null;
  }
  return state.patterns[state.currentPatternIndex];
}

/**
 * Gets the current exercise type.
 *
 * @param state - The review session state
 * @returns Current exercise type or null if on summary
 */
export function getCurrentExerciseType(
  state: ReviewSessionState
): ExerciseType | null {
  if (state.isComplete) {
    return null;
  }
  if (state.currentExerciseIndex >= state.exerciseSequence.length) {
    return null;
  }
  return state.exerciseSequence[state.currentExerciseIndex];
}

/**
 * Checks if the session is showing the summary.
 *
 * @param state - The review session state
 * @returns True if on summary step
 */
export function isReviewSummary(state: ReviewSessionState): boolean {
  return state.isComplete;
}

/**
 * Records an exercise result and advances the session.
 *
 * @param state - The review session state
 * @param result - The exercise result
 * @returns Updated state
 */
export function recordReviewExerciseResult(
  state: ReviewSessionState,
  result: ExerciseSessionResult
): ReviewSessionState {
  const updatedExerciseResults = [...state.currentPatternExerciseResults, result];
  const nextExerciseIndex = state.currentExerciseIndex + 1;

  // Check if we've completed all exercises for this pattern
  if (nextExerciseIndex >= state.exerciseSequence.length) {
    // Pattern complete - create pattern result and move to next pattern
    const currentPattern = state.patterns[state.currentPatternIndex];
    const correctCount = updatedExerciseResults.filter((r) => r.isCorrect).length;
    const isPatternCorrect = correctCount >= updatedExerciseResults.length / 2; // Pass if >= 50%

    const patternResult: PatternReviewResult = {
      patternId: currentPattern.pattern_id,
      patternTitle: currentPattern.patterns?.title ?? 'Unknown Pattern',
      category: (currentPattern.patterns?.category as PatternCategory) ?? null,
      exerciseResults: updatedExerciseResults,
      isCorrect: isPatternCorrect,
    };

    const newPatternResults = [...state.patternResults, patternResult];
    const nextPatternIndex = state.currentPatternIndex + 1;
    const isSessionComplete = nextPatternIndex >= state.patterns.length;

    return {
      ...state,
      currentPatternIndex: nextPatternIndex,
      currentExerciseIndex: 0,
      patternResults: newPatternResults,
      currentPatternExerciseResults: [],
      isComplete: isSessionComplete,
    };
  }

  // Move to next exercise within same pattern
  return {
    ...state,
    currentExerciseIndex: nextExerciseIndex,
    currentPatternExerciseResults: updatedExerciseResults,
  };
}

/**
 * Calculates the review session progress.
 *
 * @param state - The review session state
 * @returns Progress object with patterns and overall progress
 */
export function getReviewProgress(state: ReviewSessionState): {
  currentPattern: number;
  totalPatterns: number;
  currentExercise: number;
  totalExercises: number;
  overallPercentage: number;
} {
  const totalPatterns = state.patterns.length;
  const currentPattern = Math.min(state.currentPatternIndex + 1, totalPatterns);
  const totalExercises = state.exerciseSequence.length;
  const currentExercise = Math.min(state.currentExerciseIndex + 1, totalExercises);

  // Calculate overall progress
  const totalSteps = totalPatterns * totalExercises;
  const completedSteps =
    state.patternResults.length * totalExercises +
    state.currentPatternExerciseResults.length;
  const overallPercentage = totalSteps > 0
    ? Math.round((completedSteps / totalSteps) * 100)
    : 100;

  return {
    currentPattern,
    totalPatterns,
    currentExercise,
    totalExercises,
    overallPercentage,
  };
}

/**
 * Creates the final review session result.
 *
 * @param state - The completed review session state
 * @returns The review session result summary
 */
export function createReviewSessionResult(
  state: ReviewSessionState
): ReviewSessionResult {
  const totalTimeMs = Date.now() - state.startTime;
  const patternsReviewed = state.patternResults.length;
  const patternsPassed = state.patternResults.filter((r) => r.isCorrect).length;
  const patternsFailed = patternsReviewed - patternsPassed;
  const accuracy = patternsReviewed > 0
    ? Math.round((patternsPassed / patternsReviewed) * 100)
    : 0;

  return {
    patternsReviewed,
    patternsPassed,
    patternsFailed,
    totalTimeMs,
    accuracy,
    patternResults: state.patternResults,
  };
}

/**
 * Gets the count of patterns remaining in the review.
 *
 * @param state - The review session state
 * @returns Number of patterns remaining
 */
export function getPatternsRemaining(state: ReviewSessionState): number {
  return Math.max(0, state.patterns.length - state.patternResults.length);
}

/**
 * Checks if there are patterns to review.
 *
 * @param state - The review session state
 * @returns True if there are patterns to review
 */
export function hasPatterns(state: ReviewSessionState): boolean {
  return state.patterns.length > 0;
}

/**
 * Formats review progress as a string.
 *
 * @param state - The review session state
 * @returns Formatted progress string (e.g., "Pattern 2/5")
 */
export function formatReviewProgress(state: ReviewSessionState): string {
  const progress = getReviewProgress(state);
  return `Pattern ${progress.currentPattern}/${progress.totalPatterns}`;
}
