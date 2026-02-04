/**
 * Exercise Feedback Helpers
 *
 * Utility functions for the ExerciseFeedback modal component.
 */

import type { ExerciseType } from '@/types/exercise';

/** Feedback data to display in the modal */
export interface FeedbackData {
  isCorrect: boolean;
  exerciseType: ExerciseType;
  userAnswer?: string;
  correctAnswer: string;
  patternTitle: string;
  patternExplanation?: string;
  highlightedPatterns?: string[];
}

/** Encouragement messages for correct answers */
export const CORRECT_MESSAGES = [
  'Great job!',
  'Excellent!',
  'Well done!',
  'Perfect!',
  'You got it!',
  'Awesome!',
] as const;

/** Encouragement messages for incorrect answers */
export const INCORRECT_MESSAGES = [
  'Not quite, but keep practicing!',
  'Almost there!',
  'Good try! Let\'s review.',
  'Keep going, you\'re learning!',
  'Practice makes perfect!',
] as const;

/**
 * Gets a random encouragement message based on correctness.
 *
 * @param isCorrect - Whether the answer was correct
 * @param seed - Optional seed for deterministic selection (for testing)
 * @returns A random encouragement message
 */
export function getEncouragementMessage(isCorrect: boolean, seed?: number): string {
  const messages = isCorrect ? CORRECT_MESSAGES : INCORRECT_MESSAGES;
  const index = seed !== undefined
    ? seed % messages.length
    : Math.floor(Math.random() * messages.length);
  return messages[index];
}

/**
 * Gets a title for the feedback modal based on correctness.
 *
 * @param isCorrect - Whether the answer was correct
 * @returns The modal title
 */
export function getFeedbackTitle(isCorrect: boolean): string {
  return isCorrect ? 'Correct!' : 'Not Quite';
}

/**
 * Gets explanation text for why the answer was incorrect.
 *
 * @param exerciseType - The type of exercise
 * @param correctAnswer - The correct answer
 * @returns Explanation text
 */
export function getIncorrectExplanation(
  exerciseType: ExerciseType,
  correctAnswer: string
): string {
  switch (exerciseType) {
    case 'comparison':
      return 'Listen carefully to the difference between the slow and fast versions.';
    case 'discrimination':
      return `The correct answer was "${correctAnswer}". Listen for the subtle differences in pronunciation.`;
    case 'dictation':
      return `The correct transcription was "${correctAnswer}". Pay attention to the connected speech patterns.`;
    case 'speed':
      return 'Try to build up your listening speed gradually. Start slow and work your way up.';
    default:
      return `The correct answer was "${correctAnswer}".`;
  }
}

/**
 * Gets a tip for the specific exercise type.
 *
 * @param exerciseType - The type of exercise
 * @returns A helpful tip
 */
export function getExerciseTip(exerciseType: ExerciseType): string {
  switch (exerciseType) {
    case 'comparison':
      return 'Focus on how sounds blend together in natural speech.';
    case 'discrimination':
      return 'Train your ear to recognize subtle pronunciation differences.';
    case 'dictation':
      return 'Don\'t worry about perfect spelling - focus on capturing the sounds.';
    case 'speed':
      return 'Regular practice helps your brain process faster speech naturally.';
    default:
      return 'Keep practicing to improve your listening skills.';
  }
}

/**
 * Determines if the user's answer should be shown in feedback.
 *
 * @param exerciseType - The type of exercise
 * @param userAnswer - The user's answer (may be undefined)
 * @returns True if user answer should be displayed
 */
export function shouldShowUserAnswer(
  exerciseType: ExerciseType,
  userAnswer?: string
): boolean {
  if (!userAnswer) return false;
  // Show user answer for exercises where they typed/selected something
  return exerciseType === 'dictation' || exerciseType === 'discrimination';
}

/**
 * Determines if the correct answer should be shown.
 *
 * @param isCorrect - Whether the answer was correct
 * @param exerciseType - The type of exercise
 * @returns True if correct answer should be displayed
 */
export function shouldShowCorrectAnswer(
  isCorrect: boolean,
  exerciseType: ExerciseType
): boolean {
  // Always show correct answer for incorrect responses
  // For comparison and speed, there's no single "correct answer" to show
  if (isCorrect) return false;
  return exerciseType === 'dictation' || exerciseType === 'discrimination';
}

/**
 * Creates feedback data from exercise result.
 *
 * @param isCorrect - Whether the answer was correct
 * @param exerciseType - The type of exercise
 * @param patternTitle - The title of the pattern
 * @param correctAnswer - The correct answer
 * @param userAnswer - The user's answer (optional)
 * @param patternExplanation - Additional explanation about the pattern (optional)
 * @param highlightedPatterns - Patterns to highlight in the answer (optional)
 * @returns FeedbackData object
 */
export function createFeedbackData(
  isCorrect: boolean,
  exerciseType: ExerciseType,
  patternTitle: string,
  correctAnswer: string,
  userAnswer?: string,
  patternExplanation?: string,
  highlightedPatterns?: string[]
): FeedbackData {
  return {
    isCorrect,
    exerciseType,
    userAnswer,
    correctAnswer,
    patternTitle,
    patternExplanation,
    highlightedPatterns,
  };
}
