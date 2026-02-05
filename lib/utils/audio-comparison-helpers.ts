/**
 * Audio Comparison Exercise Helpers
 *
 * Utility functions for the AudioComparison exercise component.
 */

/** Result of an audio comparison exercise */
export interface AudioComparisonResult {
  patternId: string;
  listenedClear: boolean;
  listenedConversational: boolean;
  replayCount: number;
  completed: boolean;
}

/**
 * Creates the initial result state for an audio comparison exercise.
 *
 * @param patternId - The ID of the pattern being practiced
 * @returns Initial result state with all tracking values reset
 */
export function createInitialResult(patternId: string): AudioComparisonResult {
  return {
    patternId,
    listenedClear: false,
    listenedConversational: false,
    replayCount: 0,
    completed: false,
  };
}

/**
 * Checks if the user has listened to both audio versions.
 *
 * @param result - The current exercise result state
 * @returns True if both clear and conversational versions have been played
 */
export function hasListenedToBoth(result: AudioComparisonResult): boolean {
  return result.listenedClear && result.listenedConversational;
}
