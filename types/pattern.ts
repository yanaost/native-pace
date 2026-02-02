/**
 * Pattern type definitions for NativePace
 * Connected speech patterns that users learn and practice
 */

/** Categories of connected speech patterns */
export type PatternCategory =
  | 'weak-forms'
  | 'reductions'
  | 'linking'
  | 'elision'
  | 'assimilation'
  | 'flapping';

/** A connected speech pattern that users can learn */
export interface Pattern {
  /** Unique identifier (e.g., 'weak-form-to', 'reduction-wanna') */
  id: string;
  /** Pattern category for grouping */
  category: PatternCategory;
  /** Learning level (1-6, where 1-2 are free, 3-6 are premium) */
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** Display title (e.g., "The weak form of 'to'") */
  title: string;
  /** Detailed explanation of the pattern */
  description: string;
  /** IPA transcription of clear/dictionary pronunciation */
  phoneticClear: string;
  /** IPA transcription of reduced/natural pronunciation */
  phoneticReduced: string;
  /** Example sentence in written form */
  exampleSentence: string;
  /** How the example sounds when spoken naturally */
  exampleTranscription: string;
  /** URL to slow/clear audio file */
  audioSlowUrl: string;
  /** URL to fast/natural audio file */
  audioFastUrl: string;
  /** Learning tips for mastering this pattern */
  tips: string[];
  /** Difficulty rating (1-5) */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Display order within level */
  orderIndex: number;
}
