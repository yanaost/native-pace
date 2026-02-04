/**
 * Pattern Helper Utilities
 *
 * Helper functions for working with pattern data.
 */

import type { Pattern } from '@/types/pattern';

/**
 * Format phonetic transcription for display.
 * Ensures the transcription is wrapped in slashes if not already.
 *
 * @param phonetic - The phonetic transcription string
 * @returns Formatted phonetic string with slashes
 */
export function formatPhonetic(phonetic: string): string {
  if (!phonetic) return '';
  const trimmed = phonetic.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') && trimmed.endsWith('/')) {
    return trimmed;
  }
  return `/${trimmed}/`;
}

/**
 * Get display data for a pattern suitable for UI rendering.
 *
 * @param pattern - The pattern object
 * @returns Display-ready pattern data
 */
export interface PatternDisplayData {
  id: string;
  title: string;
  description: string;
  phoneticClear: string;
  phoneticReduced: string;
  exampleSentence: string;
  exampleTranscription: string;
  tips: string[];
  audioSlowUrl: string;
  audioFastUrl: string;
}

export function getPatternDisplayData(pattern: Pattern): PatternDisplayData {
  return {
    id: pattern.id,
    title: pattern.title,
    description: pattern.description,
    phoneticClear: formatPhonetic(pattern.phoneticClear),
    phoneticReduced: formatPhonetic(pattern.phoneticReduced),
    exampleSentence: pattern.exampleSentence,
    exampleTranscription: pattern.exampleTranscription,
    tips: pattern.tips,
    audioSlowUrl: pattern.audioSlowUrl,
    audioFastUrl: pattern.audioFastUrl,
  };
}
