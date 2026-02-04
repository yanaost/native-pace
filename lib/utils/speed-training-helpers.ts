/**
 * Speed Training Exercise Helpers
 *
 * Utility functions for the SpeedTraining exercise component.
 */

/** Default speed levels for training */
export const DEFAULT_SPEED_LEVELS = [0.75, 1.0, 1.25] as const;

/** Result of a speed training exercise */
export interface SpeedTrainingResult {
  exerciseId: string;
  patternId: string;
  speedResults: SpeedLevelResult[];
  comfortableSpeed: number;
  responseTimeMs: number;
}

/** Result for a single speed level */
export interface SpeedLevelResult {
  speed: number;
  understood: boolean;
}

/** State during a speed training exercise */
export interface SpeedTrainingState {
  currentSpeedIndex: number;
  speedResults: SpeedLevelResult[];
  isComplete: boolean;
  startTime: number;
}

/**
 * Creates the initial state for a speed training exercise.
 *
 * @param speedLevels - Array of speed levels to train on
 * @returns Initial state
 */
export function createInitialState(speedLevels: readonly number[] = DEFAULT_SPEED_LEVELS): SpeedTrainingState {
  return {
    currentSpeedIndex: 0,
    speedResults: speedLevels.map((speed) => ({ speed, understood: false })),
    isComplete: false,
    startTime: Date.now(),
  };
}

/**
 * Gets the current speed level from the state.
 *
 * @param state - The current exercise state
 * @returns The current speed value, or null if complete
 */
export function getCurrentSpeed(state: SpeedTrainingState): number | null {
  if (state.currentSpeedIndex >= state.speedResults.length) {
    return null;
  }
  return state.speedResults[state.currentSpeedIndex].speed;
}

/**
 * Records the user's comprehension result for the current speed.
 *
 * @param state - The current exercise state
 * @param understood - Whether the user understood at this speed
 * @returns Updated state
 */
export function recordComprehension(
  state: SpeedTrainingState,
  understood: boolean
): SpeedTrainingState {
  if (state.isComplete) {
    return state;
  }

  const newSpeedResults = [...state.speedResults];
  newSpeedResults[state.currentSpeedIndex] = {
    ...newSpeedResults[state.currentSpeedIndex],
    understood,
  };

  const nextIndex = state.currentSpeedIndex + 1;
  const isComplete = nextIndex >= state.speedResults.length;

  return {
    ...state,
    speedResults: newSpeedResults,
    currentSpeedIndex: nextIndex,
    isComplete,
  };
}

/**
 * Calculates the comfortable speed from the results.
 * This is the highest speed at which the user marked "understood".
 *
 * @param speedResults - Array of speed level results
 * @returns The comfortable speed, or 0 if none understood
 */
export function calculateComfortableSpeed(speedResults: SpeedLevelResult[]): number {
  let comfortableSpeed = 0;

  for (const result of speedResults) {
    if (result.understood && result.speed > comfortableSpeed) {
      comfortableSpeed = result.speed;
    }
  }

  return comfortableSpeed;
}

/**
 * Creates a result object after the exercise is complete.
 *
 * @param exerciseId - The exercise ID
 * @param patternId - The pattern ID being tested
 * @param state - The final exercise state
 * @returns The completed result object
 */
export function createResult(
  exerciseId: string,
  patternId: string,
  state: SpeedTrainingState
): SpeedTrainingResult {
  const responseTimeMs = Date.now() - state.startTime;
  const comfortableSpeed = calculateComfortableSpeed(state.speedResults);

  return {
    exerciseId,
    patternId,
    speedResults: state.speedResults,
    comfortableSpeed,
    responseTimeMs,
  };
}

/**
 * Formats a speed value for display.
 *
 * @param speed - The speed value (e.g., 0.75, 1.0, 1.25)
 * @returns Formatted string (e.g., "0.75x", "1.0x", "1.25x")
 */
export function formatSpeed(speed: number): string {
  return `${speed}x`;
}

/**
 * Gets a label for a speed level.
 *
 * @param speed - The speed value
 * @returns Human-readable label
 */
export function getSpeedLabel(speed: number): string {
  if (speed < 0.9) {
    return 'Slow';
  } else if (speed <= 1.1) {
    return 'Normal';
  } else {
    return 'Fast';
  }
}

/**
 * Gets the progress through the exercise.
 *
 * @param state - The current exercise state
 * @returns Object with current step, total steps, and percentage
 */
export function getProgress(state: SpeedTrainingState): {
  current: number;
  total: number;
  percentage: number;
} {
  const total = state.speedResults.length;
  const current = Math.min(state.currentSpeedIndex + 1, total);
  const percentage = state.isComplete ? 100 : Math.round((state.currentSpeedIndex / total) * 100);

  return { current, total, percentage };
}

/**
 * Checks if the exercise is complete.
 *
 * @param state - The current exercise state
 * @returns True if all speed levels have been attempted
 */
export function isExerciseComplete(state: SpeedTrainingState): boolean {
  return state.isComplete;
}
