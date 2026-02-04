/**
 * Listening Discrimination Exercise Helpers
 *
 * Utility functions for the ListeningDiscrimination exercise component.
 */

/** Result of a listening discrimination exercise */
export interface DiscriminationResult {
  exerciseId: string;
  patternId: string;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  responseTimeMs: number;
}

/** State during a discrimination exercise */
export interface DiscriminationState {
  selectedOption: string | null;
  hasSubmitted: boolean;
  isCorrect: boolean | null;
  startTime: number;
}

/**
 * Creates the initial state for a discrimination exercise.
 *
 * @returns Initial state with no selection and current timestamp
 */
export function createInitialState(): DiscriminationState {
  return {
    selectedOption: null,
    hasSubmitted: false,
    isCorrect: null,
    startTime: Date.now(),
  };
}

/**
 * Checks if an answer is correct.
 *
 * @param selected - The user's selected answer
 * @param correct - The correct answer
 * @returns True if the answers match (case-insensitive)
 */
export function checkAnswer(selected: string, correct: string): boolean {
  return selected.toLowerCase().trim() === correct.toLowerCase().trim();
}

/**
 * Creates a result object after the user submits an answer.
 *
 * @param exerciseId - The exercise ID
 * @param patternId - The pattern ID being tested
 * @param state - The current exercise state
 * @param correctAnswer - The correct answer
 * @returns The completed result object
 */
export function createResult(
  exerciseId: string,
  patternId: string,
  state: DiscriminationState,
  correctAnswer: string
): DiscriminationResult {
  const responseTimeMs = Date.now() - state.startTime;
  const isCorrect = state.selectedOption
    ? checkAnswer(state.selectedOption, correctAnswer)
    : false;

  return {
    exerciseId,
    patternId,
    selectedAnswer: state.selectedOption,
    correctAnswer,
    isCorrect,
    responseTimeMs,
  };
}

/**
 * Validates that an exercise has the required options.
 *
 * @param options - The answer options array
 * @param minOptions - Minimum number of options required (default: 2)
 * @param maxOptions - Maximum number of options allowed (default: 6)
 * @returns True if options are valid
 */
export function validateOptions(
  options: string[] | undefined,
  minOptions: number = 2,
  maxOptions: number = 6
): boolean {
  if (!options || !Array.isArray(options)) {
    return false;
  }
  return options.length >= minOptions && options.length <= maxOptions;
}

/**
 * Checks if the user can submit their answer.
 *
 * @param state - The current exercise state
 * @returns True if an option is selected and not yet submitted
 */
export function canSubmit(state: DiscriminationState): boolean {
  return state.selectedOption !== null && !state.hasSubmitted;
}
