/**
 * Audio Generation Script (edge-tts)
 *
 * Generates clear and conversational audio versions for pattern files using edge-tts.
 * Note: For better quality, use generate-audio-elevenlabs.ts instead.
 *
 * Prerequisites:
 *   pip install edge-tts
 *
 * Usage:
 *   npx tsx scripts/generate-audio.ts [--pattern <id>] [--dry-run]
 *
 * Options:
 *   --pattern <id>  Generate audio for specific pattern only
 *   --dry-run       Show what would be generated without creating files
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import {
  AUDIO_OUTPUT_DIR,
  AUDIO_VARIANTS,
  DEFAULT_VOICE,
  getEdgeTTSArgs,
  getPatternsForAudioGeneration,
  type AudioVariantType,
  type ParsedAudioPattern,
} from '../lib/utils/audio-generation-helpers';

const PATTERNS_DIR = path.join(process.cwd(), 'content', 'patterns');

/** Command line arguments */
interface CLIArgs {
  patternId?: string;
  dryRun: boolean;
}

/**
 * Parse command line arguments.
 */
function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const result: CLIArgs = { dryRun: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pattern' && args[i + 1]) {
      result.patternId = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      result.dryRun = true;
    }
  }

  return result;
}

/**
 * Read all pattern files from the patterns directory.
 */
function readPatternFiles(): unknown[] {
  const patterns: unknown[] = [];

  if (!fs.existsSync(PATTERNS_DIR)) {
    console.error(`Patterns directory not found: ${PATTERNS_DIR}`);
    return patterns;
  }

  const files = fs.readdirSync(PATTERNS_DIR).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(PATTERNS_DIR, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) {
        patterns.push(...data);
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  return patterns;
}

/**
 * Execute edge-tts command to generate audio.
 */
function generateAudio(
  text: string,
  outputPath: string,
  rate: string,
  voice: string = DEFAULT_VOICE
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = getEdgeTTSArgs(text, outputPath, rate, voice);

    const proc = spawn('edge-tts', args);

    let stderr = '';
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`edge-tts exited with code ${code}: ${stderr}`));
      }
    });

    proc.on('error', (error) => {
      reject(new Error(`Failed to run edge-tts: ${error.message}`));
    });
  });
}

/**
 * Generate audio files for a single pattern.
 */
async function generatePatternAudio(
  pattern: ParsedAudioPattern,
  dryRun: boolean
): Promise<void> {
  const variants: AudioVariantType[] = ['clear', 'conversational'];

  for (const variant of variants) {
    const outputPath = variant === 'clear' ? pattern.clearPath : pattern.conversationalPath;
    const rate = AUDIO_VARIANTS[variant].rate;
    const fullPath = path.join(process.cwd(), outputPath);

    if (dryRun) {
      console.log(`  [DRY RUN] Would generate: ${outputPath}`);
      console.log(`            Text: "${pattern.text}"`);
      console.log(`            Rate: ${rate}`);
    } else {
      // Ensure output directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      try {
        await generateAudio(pattern.text, fullPath, rate);
        console.log(`  + Generated: ${outputPath}`);
      } catch (error) {
        console.error(`  x Failed: ${outputPath}`);
        console.error(`    Error: ${error}`);
      }
    }
  }
}

/**
 * Main function.
 */
async function main(): Promise<void> {
  const args = parseArgs();

  console.log('Audio Generation Script (edge-tts)');
  console.log('==================================\n');

  if (args.dryRun) {
    console.log('DRY RUN MODE - No files will be created\n');
  }

  // Read patterns
  const rawPatterns = readPatternFiles();
  console.log(`Found ${rawPatterns.length} patterns in content/patterns/\n`);

  // Parse and filter patterns
  let patterns = getPatternsForAudioGeneration(rawPatterns);

  if (args.patternId) {
    patterns = patterns.filter((p) => p.id === args.patternId);
    if (patterns.length === 0) {
      console.error(`Pattern not found: ${args.patternId}`);
      process.exit(1);
    }
  }

  console.log(`Generating audio for ${patterns.length} patterns...\n`);

  // Generate audio for each pattern
  for (const pattern of patterns) {
    console.log(`\n${pattern.id}:`);
    await generatePatternAudio(pattern, args.dryRun);
  }

  console.log('\nDone!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
