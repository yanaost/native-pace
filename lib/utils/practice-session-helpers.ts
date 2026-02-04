/**
 * Practice Session Helpers
 *
 * Utility functions for managing practice sessions that cycle through exercises.
 */

import type { ExerciseType } from '@/types/exercise';

/** Steps in a practice session */
export type PracticeStep = 'pattern-view' | ExerciseType | 'summary';

/** Default exercise sequence after pattern view */
export const DEFAULT_EXERCISE_SEQUENCE: ExerciseType[] = [
  'comparison',
  'discrimination',
  'dictation',
  'speed',
];

/** Result from a single exercise in the session */
export interface ExerciseSessionResult {
  exerciseType: ExerciseType;
  isCorrect: boolean;
  responseTimeMs: number;
}

/** Overall session result */
export interface PracticeSessionResult {
  patternId: string;
  exerciseResults: ExerciseSessionResult[];
  totalTimeMs: number;
  correctCount: number;
  totalCount: number;
  accuracy: number;
}

/** State during a practice session */
export interface PracticeSessionState {
  patternId: string;
  currentStepIndex: number;
  steps: PracticeStep[];
  exerciseResults: ExerciseSessionResult[];
  startTime: number;
  isComplete: boolean;
}

/**
 * Creates the initial state for a practice session.
 *
 * @param patternId - The ID of the pattern being practiced
 * @param exerciseSequence - Custom exercise sequence (default: all four types)
 * @param includePatternView - Whether to start with pattern view (default: true)
 * @returns Initial session state
 */
export function createSessionState(
  patternId: string,
  exerciseSequence: ExerciseType[] = DEFAULT_EXERCISE_SEQUENCE,
  includePatternView: boolean = true
): PracticeSessionState {
  const steps: PracticeStep[] = includePatternView
    ? ['pattern-view', ...exerciseSequence, 'summary']
    : [...exerciseSequence, 'summary'];

  return {
    patternId,
    currentStepIndex: 0,
    steps,
    exerciseResults: [],
    startTime: Date.now(),
    isComplete: false,
  };
}

/**
 * Gets the current step in the session.
 *
 * @param state - The current session state
 * @returns The current step, or null if complete
 */
export function getCurrentStep(state: PracticeSessionState): PracticeStep | null {
  if (state.currentStepIndex >= state.steps.length) {
    return null;
  }
  return state.steps[state.currentStepIndex];
}

/**
 * Checks if the current step is the pattern view.
 *
 * @param state - The current session state
 * @returns True if on pattern view step
 */
export function isPatternViewStep(state: PracticeSessionState): boolean {
  return getCurrentStep(state) === 'pattern-view';
}

/**
 * Checks if the current step is an exercise.
 *
 * @param state - The current session state
 * @returns True if on an exercise step
 */
export function isExerciseStep(state: PracticeSessionState): boolean {
  const step = getCurrentStep(state);
  return step !== null && step !== 'pattern-view' && step !== 'summary';
}

/**
 * Checks if the current step is the summary.
 *
 * @param state - The current session state
 * @returns True if on summary step
 */
export function isSummaryStep(state: PracticeSessionState): boolean {
  return getCurrentStep(state) === 'summary';
}

/**
 * Advances to the next step in the session.
 *
 * @param state - The current session state
 * @returns Updated state with incremented step
 */
export function advanceStep(state: PracticeSessionState): PracticeSessionState {
  if (state.isComplete) {
    return state;
  }

  const nextIndex = state.currentStepIndex + 1;
  const isComplete = nextIndex >= state.steps.length;

  return {
    ...state,
    currentStepIndex: nextIndex,
    isComplete,
  };
}

/**
 * Records an exercise result and advances to the next step.
 *
 * @param state - The current session state
 * @param result - The exercise result to record
 * @returns Updated state with result recorded
 */
export function recordExerciseResult(
  state: PracticeSessionState,
  result: ExerciseSessionResult
): PracticeSessionState {
  const updatedState = {
    ...state,
    exerciseResults: [...state.exerciseResults, result],
  };

  return advanceStep(updatedState);
}

/**
 * Calculates the session progress.
 *
 * @param state - The current session state
 * @returns Progress object with current, total, and percentage
 */
export function getSessionProgress(state: PracticeSessionState): {
  current: number;
  total: number;
  percentage: number;
} {
  const total = state.steps.length;
  const current = Math.min(state.currentStepIndex + 1, total);
  const percentage = state.isComplete
    ? 100
    : Math.round((state.currentStepIndex / (total - 1)) * 100); // -1 because summary isn't a "step"

  return { current, total, percentage };
}

/**
 * Creates the final session result.
 *
 * @param state - The completed session state
 * @returns The session result summary
 */
export function createSessionResult(state: PracticeSessionState): PracticeSessionResult {
  const totalTimeMs = Date.now() - state.startTime;
  const correctCount = state.exerciseResults.filter((r) => r.isCorrect).length;
  const totalCount = state.exerciseResults.length;
  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    patternId: state.patternId,
    exerciseResults: state.exerciseResults,
    totalTimeMs,
    correctCount,
    totalCount,
    accuracy,
  };
}

/**
 * Gets the number of exercises remaining.
 *
 * @param state - The current session state
 * @returns Number of exercise steps remaining
 */
export function getExercisesRemaining(state: PracticeSessionState): number {
  const exerciseSteps = state.steps.filter(
    (step) => step !== 'pattern-view' && step !== 'summary'
  );
  const completedExercises = state.exerciseResults.length;
  return Math.max(0, exerciseSteps.length - completedExercises);
}

/**
 * Formats time in milliseconds to a readable string.
 *
 * @param ms - Time in milliseconds
 * @returns Formatted string (e.g., "1:30" or "45s")
 */
export function formatSessionTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}
