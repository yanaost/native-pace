/**
 * Audio Generation Helpers
 *
 * Utilities for generating audio files from pattern data using edge-tts.
 */

import * as path from 'path';

/** Output directory for generated audio files */
export const AUDIO_OUTPUT_DIR = 'public/audio/patterns';

/** Audio speed type */
export type AudioSpeedType = 'slow' | 'fast';

/** Speed configuration for audio generation */
export interface SpeedConfig {
  rate: string; // edge-tts rate parameter
  suffix: string; // filename suffix
}

/** Audio speed configurations */
export const AUDIO_SPEEDS: Record<AudioSpeedType, SpeedConfig> = {
  slow: { rate: '-30%', suffix: 'slow' },
  fast: { rate: '+0%', suffix: 'fast' },
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
  slowPath: string;
  fastPath: string;
}

/**
 * Generates the filename for an audio file.
 *
 * @param patternId - Pattern identifier
 * @param speed - Audio speed type
 * @returns Filename with extension
 */
export function getAudioFilename(patternId: string, speed: AudioSpeedType): string {
  const suffix = AUDIO_SPEEDS[speed].suffix;
  return `${patternId}-${suffix}.mp3`;
}

/**
 * Generates the full output path for an audio file.
 *
 * @param patternId - Pattern identifier
 * @param speed - Audio speed type
 * @param baseDir - Base directory (defaults to AUDIO_OUTPUT_DIR)
 * @returns Full path to output file
 */
export function getAudioOutputPath(
  patternId: string,
  speed: AudioSpeedType,
  baseDir: string = AUDIO_OUTPUT_DIR
): string {
  const filename = getAudioFilename(patternId, speed);
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
    slowPath: getAudioOutputPath(pattern.id, 'slow'),
    fastPath: getAudioOutputPath(pattern.id, 'fast'),
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
