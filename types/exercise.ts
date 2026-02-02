/**
 * Exercise type definitions for NativePace
 * Exercises that test user comprehension of connected speech patterns
 */

/** Types of exercises available for pattern practice */
export type ExerciseType =
  | 'comparison'
  | 'discrimination'
  | 'dictation'
  | 'speed';

/** An exercise for practicing a speech pattern */
export interface Exercise {
  /** Unique exercise identifier */
  id: string;
  /** ID of the pattern this exercise tests */
  patternId: string;
  /** Type of exercise */
  type: ExerciseType;
  /** URL to the audio file for this exercise */
  audioUrl: string;
  /** The correct answer */
  correctAnswer: string;
  /** Answer options for discrimination exercises */
  options?: string[];
  /** Alternative acceptable answers for dictation exercises */
  acceptableAnswers?: string[];
  /** Playback speed levels for speed training (e.g., [0.75, 1.0, 1.25]) */
  speedLevels?: number[];
}

/** A record of a user's exercise attempt */
export interface ExerciseAttempt {
  /** Unique attempt identifier */
  id: string;
  /** ID of the user who made the attempt */
  userId: string;
  /** ID of the pattern being tested */
  patternId: string;
  /** Type of exercise attempted */
  exerciseType: ExerciseType;
  /** Whether the answer was correct */
  isCorrect: boolean;
  /** Time taken to respond in milliseconds */
  responseTimeMs: number;
  /** User's input (for dictation exercises) */
  userInput?: string;
  /** When the attempt was made */
  createdAt: Date;
}
