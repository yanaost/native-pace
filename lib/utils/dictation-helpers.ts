/**
 * Dictation Challenge Exercise Helpers
 *
 * Utility functions for the DictationChallenge exercise component.
 * Includes fuzzy matching for accepting reasonable answer variations.
 */

/** Result of a dictation exercise */
export interface DictationResult {
  exerciseId: string;
  patternId: string;
  userInput: string;
  correctAnswer: string;
  isCorrect: boolean;
  similarityScore: number;
  responseTimeMs: number;
  replaysUsed: number;
}

/** State during a dictation exercise */
export interface DictationState {
  userInput: string;
  hasSubmitted: boolean;
  isCorrect: boolean | null;
  replaysUsed: number;
  startTime: number;
}

/**
 * Creates the initial state for a dictation exercise.
 *
 * @returns Initial state with empty input
 */
export function createInitialState(): DictationState {
  return {
    userInput: '',
    hasSubmitted: false,
    isCorrect: null,
    replaysUsed: 0,
    startTime: Date.now(),
  };
}

/**
 * Normalizes text for comparison by:
 * - Converting to lowercase
 * - Removing punctuation
 * - Collapsing multiple spaces
 * - Trimming whitespace
 *
 * @param text - The text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings.
 * This measures the minimum number of single-character edits
 * (insertions, deletions, substitutions) needed to transform one string into another.
 *
 * @param a - First string
 * @param b - Second string
 * @returns The edit distance
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates similarity score between two strings (0-100).
 * 100 means identical, 0 means completely different.
 *
 * @param input - User's input
 * @param correct - Correct answer
 * @returns Similarity score (0-100)
 */
export function calculateSimilarity(input: string, correct: string): number {
  const normalizedInput = normalizeText(input);
  const normalizedCorrect = normalizeText(correct);

  if (normalizedInput === normalizedCorrect) {
    return 100;
  }

  if (normalizedInput.length === 0 || normalizedCorrect.length === 0) {
    return 0;
  }

  const distance = levenshteinDistance(normalizedInput, normalizedCorrect);
  const maxLength = Math.max(normalizedInput.length, normalizedCorrect.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(Math.max(0, similarity));
}

/**
 * Checks if the user's answer is acceptable.
 * An answer is acceptable if:
 * - It exactly matches the correct answer (after normalization)
 * - It matches any of the acceptable answers (after normalization)
 * - It has a similarity score above the threshold
 *
 * @param input - User's input
 * @param correctAnswer - The correct answer
 * @param acceptableAnswers - Alternative acceptable answers
 * @param similarityThreshold - Minimum similarity score to accept (default: 85)
 * @returns True if the answer is acceptable
 */
export function isAnswerAcceptable(
  input: string,
  correctAnswer: string,
  acceptableAnswers: string[] = [],
  similarityThreshold: number = 85
): boolean {
  const normalizedInput = normalizeText(input);

  // Check exact match with correct answer
  if (normalizedInput === normalizeText(correctAnswer)) {
    return true;
  }

  // Check exact match with any acceptable answer
  for (const acceptable of acceptableAnswers) {
    if (normalizedInput === normalizeText(acceptable)) {
      return true;
    }
  }

  // Check similarity threshold
  const similarity = calculateSimilarity(input, correctAnswer);
  return similarity >= similarityThreshold;
}

/**
 * Highlights patterns in the text by wrapping them with markers.
 * Returns an array of segments with highlight flags.
 *
 * @param text - The text to process
 * @param patterns - Patterns to highlight
 * @returns Array of text segments with highlight flags
 */
export interface TextSegment {
  text: string;
  isHighlighted: boolean;
}

export function highlightPatterns(text: string, patterns: string[]): TextSegment[] {
  if (!patterns || patterns.length === 0) {
    return [{ text, isHighlighted: false }];
  }

  // Sort patterns by length (longest first) to avoid partial matches
  const sortedPatterns = [...patterns].sort((a, b) => b.length - a.length);

  // Create regex pattern that matches any of the patterns (case-insensitive)
  const regexPattern = sortedPatterns
    .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|');
  const regex = new RegExp(`(${regexPattern})`, 'gi');

  const segments: TextSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add non-highlighted segment before match
    if (match.index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, match.index),
        isHighlighted: false,
      });
    }

    // Add highlighted segment
    segments.push({
      text: match[0],
      isHighlighted: true,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining non-highlighted text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isHighlighted: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, isHighlighted: false }];
}

/**
 * Creates a result object after the user submits an answer.
 *
 * @param exerciseId - The exercise ID
 * @param patternId - The pattern ID being tested
 * @param state - The current exercise state
 * @param correctAnswer - The correct answer
 * @param acceptableAnswers - Alternative acceptable answers
 * @returns The completed result object
 */
export function createResult(
  exerciseId: string,
  patternId: string,
  state: DictationState,
  correctAnswer: string,
  acceptableAnswers: string[] = []
): DictationResult {
  const responseTimeMs = Date.now() - state.startTime;
  const similarityScore = calculateSimilarity(state.userInput, correctAnswer);
  const isCorrect = isAnswerAcceptable(state.userInput, correctAnswer, acceptableAnswers);

  return {
    exerciseId,
    patternId,
    userInput: state.userInput,
    correctAnswer,
    isCorrect,
    similarityScore,
    responseTimeMs,
    replaysUsed: state.replaysUsed,
  };
}

/**
 * Checks if the user can still replay the audio.
 *
 * @param replaysUsed - Number of replays already used
 * @param maxReplays - Maximum number of replays allowed
 * @returns True if more replays are available
 */
export function canReplay(replaysUsed: number, maxReplays: number): boolean {
  return replaysUsed < maxReplays;
}

/**
 * Checks if the user can submit their answer.
 *
 * @param state - The current exercise state
 * @returns True if input is non-empty and not yet submitted
 */
export function canSubmit(state: DictationState): boolean {
  return state.userInput.trim().length > 0 && !state.hasSubmitted;
}
