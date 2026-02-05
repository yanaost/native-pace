/**
 * Audio File Helpers
 *
 * Utilities for verifying audio files exist for patterns.
 */

import * as fs from 'fs';
import * as path from 'path';

/** Audio output directory */
export const AUDIO_PATTERNS_DIR = 'public/audio/patterns';

/** Level 1 pattern IDs (orderIndex 1-20) */
export const LEVEL_1_PATTERN_IDS = [
  // Reductions (1-8)
  'reduction-wanna',
  'reduction-gonna',
  'reduction-hafta',
  'reduction-gotta',
  'reduction-kinda',
  'reduction-lotta',
  'reduction-outta',
  'reduction-sorta',
  // Weak forms (9-20)
  'weak-form-to',
  'weak-form-for',
  'weak-form-of',
  'weak-form-and',
  'weak-form-the',
  'weak-form-a',
  'weak-form-him',
  'weak-form-her',
  'weak-form-them',
  'weak-form-can',
  'weak-form-was',
  'weak-form-were',
] as const;

/** Level 2 pattern IDs (orderIndex 21-50) */
export const LEVEL_2_PATTERN_IDS = [
  'reduction-lemme',
  'reduction-gimme',
  'reduction-shoulda',
  'reduction-coulda',
  'reduction-woulda',
  'reduction-musta',
  'reduction-mighta',
  'reduction-oughta',
  'reduction-useta',
  'reduction-supposta',
  'reduction-dunno',
  'reduction-whatcha',
  'reduction-gotcha',
  'reduction-betcha',
  'reduction-letcha',
  'reduction-getcha',
  'reduction-meetcha',
  'reduction-didja',
  'reduction-wouldja',
  'reduction-couldja',
  'reduction-doncha',
  'reduction-wontcha',
  'reduction-cantcha',
  'reduction-tellim',
  'reduction-teller',
  'reduction-askim',
  'reduction-asker',
  'reduction-cmon',
  'reduction-yknow',
  'reduction-imma',
] as const;

/** Audio variants: clear (dictionary) and conversational (natural speech) */
export const AUDIO_VARIANTS = ['clear', 'conversational'] as const;

/** Audio variant type */
export type AudioVariant = (typeof AUDIO_VARIANTS)[number];

/** Audio file info */
export interface AudioFileInfo {
  patternId: string;
  variant: AudioVariant;
  filename: string;
  path: string;
  exists: boolean;
}

/**
 * Get Level 1 pattern IDs.
 */
export function getLevel1PatternIds(): readonly string[] {
  return LEVEL_1_PATTERN_IDS;
}

/**
 * Get Level 2 pattern IDs.
 */
export function getLevel2PatternIds(): readonly string[] {
  return LEVEL_2_PATTERN_IDS;
}

/**
 * Get expected audio filename for a pattern and variant.
 */
export function getAudioFilename(patternId: string, variant: AudioVariant): string {
  return `${patternId}-${variant}.mp3`;
}

/**
 * Get expected audio file path for a pattern and variant.
 */
export function getAudioFilePath(patternId: string, variant: AudioVariant): string {
  return path.join(AUDIO_PATTERNS_DIR, getAudioFilename(patternId, variant));
}

/**
 * Get all expected audio files for a list of pattern IDs.
 */
export function getExpectedAudioFiles(patternIds: readonly string[]): AudioFileInfo[] {
  const files: AudioFileInfo[] = [];

  for (const patternId of patternIds) {
    for (const variant of AUDIO_VARIANTS) {
      const filename = getAudioFilename(patternId, variant);
      const filePath = getAudioFilePath(patternId, variant);
      files.push({
        patternId,
        variant,
        filename,
        path: filePath,
        exists: false, // Will be set by verification
      });
    }
  }

  return files;
}

/**
 * Check if an audio file exists.
 */
export function checkAudioFileExists(filePath: string): boolean {
  const fullPath = path.join(process.cwd(), filePath);
  return fs.existsSync(fullPath);
}

/**
 * Verify audio files exist and return their status.
 */
export function verifyAudioFiles(patternIds: readonly string[]): AudioFileInfo[] {
  const files = getExpectedAudioFiles(patternIds);

  for (const file of files) {
    file.exists = checkAudioFileExists(file.path);
  }

  return files;
}

/**
 * Verify all Level 1 audio files exist.
 */
export function verifyLevel1AudioFiles(): AudioFileInfo[] {
  return verifyAudioFiles(LEVEL_1_PATTERN_IDS);
}

/**
 * Verify all Level 2 audio files exist.
 */
export function verifyLevel2AudioFiles(): AudioFileInfo[] {
  return verifyAudioFiles(LEVEL_2_PATTERN_IDS);
}

/**
 * Get summary of audio file verification.
 */
export function getAudioVerificationSummary(files: AudioFileInfo[]): {
  total: number;
  existing: number;
  missing: number;
  missingFiles: string[];
} {
  const existing = files.filter((f) => f.exists).length;
  const missing = files.filter((f) => !f.exists);

  return {
    total: files.length,
    existing,
    missing: missing.length,
    missingFiles: missing.map((f) => f.filename),
  };
}
