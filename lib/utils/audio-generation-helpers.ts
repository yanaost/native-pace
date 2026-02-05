/**
 * Audio Generation Helpers
 *
 * Utilities for generating audio files from pattern data.
 */

import * as path from 'path';

/** Output directory for generated audio files */
export const AUDIO_OUTPUT_DIR = 'public/audio/patterns';

/** Audio variant type */
export type AudioVariantType = 'clear' | 'conversational';

/** Variant configuration for audio generation */
export interface VariantConfig {
  rate: string; // TTS rate parameter
  suffix: string; // filename suffix
}

/** Audio variant configurations */
export const AUDIO_VARIANTS: Record<AudioVariantType, VariantConfig> = {
  clear: { rate: '-30%', suffix: 'clear' },
  conversational: { rate: '+0%', suffix: 'conversational' },
} as const;

/** Default TTS voice (American English male) */
export const DEFAULT_VOICE = 'en-US-GuyNeural';

/** Available TTS voices */
export const AVAILABLE_VOICES = [
  'en-US-GuyNeural',
  'en-US-JennyNeural',
  'en-GB-RyanNeural',
  'en-GB-SoniaNeural',
] as const;

/** Pattern data required for audio generation */
export interface AudioPatternData {
  id: string;
  exampleSentence: string;
}

/** Result of parsing a pattern for audio generation */
export interface ParsedAudioPattern {
  id: string;
  text: string;
  clearPath: string;
  conversationalPath: string;
}

/**
 * Generates the filename for an audio file.
 *
 * @param patternId - Pattern identifier
 * @param variant - Audio variant type
 * @returns Filename with extension
 */
export function getAudioFilename(patternId: string, variant: AudioVariantType): string {
  const suffix = AUDIO_VARIANTS[variant].suffix;
  return `${patternId}-${suffix}.mp3`;
}

/**
 * Generates the full output path for an audio file.
 *
 * @param patternId - Pattern identifier
 * @param variant - Audio variant type
 * @param baseDir - Base directory (defaults to AUDIO_OUTPUT_DIR)
 * @returns Full path to output file
 */
export function getAudioOutputPath(
  patternId: string,
  variant: AudioVariantType,
  baseDir: string = AUDIO_OUTPUT_DIR
): string {
  const filename = getAudioFilename(patternId, variant);
  return path.join(baseDir, filename);
}

/**
 * Builds the edge-tts command arguments.
 *
 * @param text - Text to convert to speech
 * @param outputPath - Path to write the audio file
 * @param rate - Speech rate (e.g., '-30%', '+0%')
 * @param voice - TTS voice to use
 * @returns Array of command arguments for edge-tts
 */
export function getEdgeTTSArgs(
  text: string,
  outputPath: string,
  rate: string,
  voice: string = DEFAULT_VOICE
): string[] {
  return [
    '--voice',
    voice,
    '--text',
    text,
    '--write-media',
    outputPath,
    '--rate',
    rate,
  ];
}

/**
 * Validates that a pattern has the required fields for audio generation.
 *
 * @param pattern - Pattern object to validate
 * @returns True if pattern has required fields
 */
export function validatePatternForAudio(pattern: unknown): pattern is AudioPatternData {
  if (!pattern || typeof pattern !== 'object') {
    return false;
  }

  const p = pattern as Record<string, unknown>;

  return (
    typeof p.id === 'string' &&
    p.id.length > 0 &&
    typeof p.exampleSentence === 'string' &&
    p.exampleSentence.length > 0
  );
}

/**
 * Parses a pattern object to extract audio generation data.
 *
 * @param pattern - Pattern object
 * @returns Parsed pattern data or null if invalid
 */
export function parsePatternForAudio(pattern: unknown): ParsedAudioPattern | null {
  if (!validatePatternForAudio(pattern)) {
    return null;
  }

  return {
    id: pattern.id,
    text: pattern.exampleSentence,
    clearPath: getAudioOutputPath(pattern.id, 'clear'),
    conversationalPath: getAudioOutputPath(pattern.id, 'conversational'),
  };
}

/**
 * Generates audio generation tasks for a list of patterns.
 *
 * @param patterns - Array of pattern objects
 * @returns Array of parsed patterns ready for audio generation
 */
export function getPatternsForAudioGeneration(patterns: unknown[]): ParsedAudioPattern[] {
  return patterns
    .map((p) => parsePatternForAudio(p))
    .filter((p): p is ParsedAudioPattern => p !== null);
}
