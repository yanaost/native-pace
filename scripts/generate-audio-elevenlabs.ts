/**
 * Audio Generation Script (ElevenLabs)
 *
 * Generates clear and conversational audio versions for pattern files using ElevenLabs.
 *
 * Prerequisites:
 *   Set ELEVENLABS_API_KEY in .env.local
 *
 * Usage:
 *   npx tsx scripts/generate-audio-elevenlabs.ts [--pattern <id>] [--dry-run] [--demo-only]
 */

import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const AUDIO_OUTPUT_DIR = 'public/audio/patterns';
const DEMO_OUTPUT_DIR = 'public/audio/demo';
const PATTERNS_DIR = path.join(process.cwd(), 'content', 'patterns');

// ElevenLabs voice IDs - American English voices
const VOICE_ID = 'JBFqnCBsd6RMkjVDRZzb'; // George - natural American male

// Model for natural speech
const MODEL_ID = 'eleven_turbo_v2_5';

/** Audio variant type */
type AudioVariant = 'clear' | 'conversational';

interface PatternData {
  id: string;
  exampleSentence: string;
  exampleTranscription: string;
}

interface CLIArgs {
  patternId?: string;
  dryRun: boolean;
  demoOnly: boolean;
}

function parseArgs(): CLIArgs {
  const args = process.argv.slice(2);
  const result: CLIArgs = { dryRun: false, demoOnly: false };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pattern' && args[i + 1]) {
      result.patternId = args[i + 1];
      i++;
    } else if (args[i] === '--dry-run') {
      result.dryRun = true;
    } else if (args[i] === '--demo-only') {
      result.demoOnly = true;
    }
  }

  return result;
}

function readPatternFiles(): PatternData[] {
  const patterns: PatternData[] = [];

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
        for (const item of data) {
          if (item.id && item.exampleSentence && item.exampleTranscription) {
            patterns.push({
              id: item.id,
              exampleSentence: item.exampleSentence,
              exampleTranscription: item.exampleTranscription,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }

  return patterns;
}

async function generateAudio(
  client: ElevenLabsClient,
  text: string,
  outputPath: string,
  variant: AudioVariant
): Promise<void> {
  const fullPath = path.join(process.cwd(), outputPath);
  const dir = path.dirname(fullPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Adjust voice settings for clear/conversational
  const audio = await client.textToSpeech.convert(VOICE_ID, {
    text,
    modelId: MODEL_ID,
    outputFormat: 'mp3_44100_128',
    voiceSettings: {
      stability: variant === 'clear' ? 0.75 : 0.5,
      similarityBoost: 0.75,
      style: variant === 'clear' ? 0.0 : 0.3,
      useSpeakerBoost: true,
    },
  });

  // Convert ReadableStream to Buffer and write to file
  const chunks: Uint8Array[] = [];
  const reader = audio.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  fs.writeFileSync(fullPath, buffer);
}

async function generatePatternAudio(
  client: ElevenLabsClient,
  pattern: PatternData,
  dryRun: boolean
): Promise<void> {
  // CLEAR version uses dictionary pronunciation (exampleSentence)
  // CONVERSATIONAL version uses connected speech (exampleTranscription)
  const versions: Array<{ variant: AudioVariant; text: string }> = [
    { variant: 'clear', text: pattern.exampleSentence },
    { variant: 'conversational', text: pattern.exampleTranscription },
  ];

  for (const { variant, text } of versions) {
    const filename = `${pattern.id}-${variant}.mp3`;
    const outputPath = path.join(AUDIO_OUTPUT_DIR, filename);

    if (dryRun) {
      console.log(`  [DRY RUN] Would generate: ${outputPath}`);
      console.log(`            Text: "${text}"`);
    } else {
      try {
        await generateAudio(client, text, outputPath, variant);
        console.log(`  + Generated: ${outputPath}`);
      } catch (error) {
        console.error(`  x Failed: ${outputPath}`);
        console.error(`    Error: ${error}`);
      }
    }
  }
}

async function generateDemoAudio(client: ElevenLabsClient, dryRun: boolean): Promise<void> {
  // CLEAR: Dictionary pronunciation
  const clearText = 'What do you want to do?';
  // CONVERSATIONAL: Connected speech (reduced form)
  const conversationalText = 'Whaddya wanna do?';

  console.log('\nGenerating demo audio...');
  console.log(`CLEAR: "${clearText}"`);
  console.log(`CONVERSATIONAL: "${conversationalText}"\n`);

  if (dryRun) {
    console.log(`  [DRY RUN] Would generate: ${DEMO_OUTPUT_DIR}/demo-clear.mp3`);
    console.log(`  [DRY RUN] Would generate: ${DEMO_OUTPUT_DIR}/demo-conversational.mp3`);
    return;
  }

  try {
    await generateAudio(client, clearText, path.join(DEMO_OUTPUT_DIR, 'demo-clear.mp3'), 'clear');
    console.log(`  + Generated: ${DEMO_OUTPUT_DIR}/demo-clear.mp3`);

    await generateAudio(
      client,
      conversationalText,
      path.join(DEMO_OUTPUT_DIR, 'demo-conversational.mp3'),
      'conversational'
    );
    console.log(`  + Generated: ${DEMO_OUTPUT_DIR}/demo-conversational.mp3`);
  } catch (error) {
    console.error(`  x Failed to generate demo audio: ${error}`);
  }
}

async function main(): Promise<void> {
  const args = parseArgs();

  console.log('ElevenLabs Audio Generation Script');
  console.log('===================================\n');

  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('Error: ELEVENLABS_API_KEY not set in .env.local');
    process.exit(1);
  }

  const client = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  if (args.dryRun) {
    console.log('DRY RUN MODE - No files will be created\n');
  }

  // Generate demo audio
  await generateDemoAudio(client, args.dryRun);

  if (args.demoOnly) {
    console.log('\nDemo only mode - skipping pattern audio.');
    return;
  }

  // Read and generate pattern audio
  let patterns = readPatternFiles();
  console.log(`\nFound ${patterns.length} patterns in content/patterns/\n`);

  if (args.patternId) {
    patterns = patterns.filter((p) => p.id === args.patternId);
    if (patterns.length === 0) {
      console.error(`Pattern not found: ${args.patternId}`);
      process.exit(1);
    }
  }

  console.log(`Generating audio for ${patterns.length} patterns...\n`);

  let generated = 0;
  for (const pattern of patterns) {
    console.log(`${pattern.id}:`);
    await generatePatternAudio(client, pattern, args.dryRun);
    generated++;

    // Rate limiting - ElevenLabs has limits
    if (!args.dryRun && generated % 10 === 0) {
      console.log(`\n  [Progress: ${generated}/${patterns.length}]\n`);
    }
  }

  console.log('\nDone!');
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
