/**
 * Pattern Seed Script
 *
 * Reads JSON pattern files from content/patterns/ and upserts them
 * into the Supabase patterns table.
 *
 * Usage:
 *   npx ts-node scripts/seed-patterns.ts
 *
 * Requires:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (for bypassing RLS)
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { Pattern } from '../types/pattern';

// Database row type (snake_case)
export interface PatternRow {
  id: string;
  category: string;
  level: number;
  title: string;
  description: string;
  phonetic_clear: string;
  phonetic_reduced: string;
  example_sentence: string;
  example_transcription: string;
  audio_slow_url: string;
  audio_fast_url: string;
  tips: string[];
  difficulty: number;
  order_index: number;
}

/**
 * Transform a Pattern (camelCase) to PatternRow (snake_case)
 */
export function transformPatternToRow(pattern: Pattern): PatternRow {
  return {
    id: pattern.id,
    category: pattern.category,
    level: pattern.level,
    title: pattern.title,
    description: pattern.description,
    phonetic_clear: pattern.phoneticClear,
    phonetic_reduced: pattern.phoneticReduced,
    example_sentence: pattern.exampleSentence,
    example_transcription: pattern.exampleTranscription,
    audio_slow_url: pattern.audioSlowUrl,
    audio_fast_url: pattern.audioFastUrl,
    tips: pattern.tips,
    difficulty: pattern.difficulty,
    order_index: pattern.orderIndex,
  };
}

/**
 * Read all JSON pattern files from the content/patterns directory
 */
export function readPatternFiles(patternsDir: string): Pattern[] {
  const patterns: Pattern[] = [];

  if (!fs.existsSync(patternsDir)) {
    console.warn(`Patterns directory not found: ${patternsDir}`);
    return patterns;
  }

  const files = fs.readdirSync(patternsDir);
  const jsonFiles = files.filter(
    (f) => f.endsWith('.json') && !f.startsWith('.')
  );

  for (const file of jsonFiles) {
    const filePath = path.join(patternsDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const filePatterns: Pattern[] = JSON.parse(content);

      if (Array.isArray(filePatterns)) {
        patterns.push(...filePatterns);
        console.log(`  Loaded ${filePatterns.length} patterns from ${file}`);
      }
    } catch (error) {
      console.error(`  Error reading ${file}:`, error);
    }
  }

  return patterns;
}

/**
 * Seed patterns to Supabase database
 */
export async function seedPatterns(
  supabaseUrl: string,
  serviceRoleKey: string,
  patternsDir: string
): Promise<{ inserted: number; errors: string[] }> {
  const errors: string[] = [];

  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  console.log('Reading pattern files...');
  const patterns = readPatternFiles(patternsDir);

  if (patterns.length === 0) {
    console.log('No patterns found to seed.');
    return { inserted: 0, errors: [] };
  }

  console.log(`Found ${patterns.length} total patterns to seed.`);

  // Transform patterns to database rows
  const rows = patterns.map(transformPatternToRow);

  // Upsert patterns (insert or update on conflict)
  console.log('Upserting patterns to database...');
  const { data, error } = await supabase
    .from('patterns')
    .upsert(rows, { onConflict: 'id' })
    .select();

  if (error) {
    errors.push(`Database error: ${error.message}`);
    console.error('Database error:', error);
    return { inserted: 0, errors };
  }

  const insertedCount = data?.length ?? 0;
  console.log(`Successfully upserted ${insertedCount} patterns.`);

  return { inserted: insertedCount, errors };
}

// Main execution
async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL is not set');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is not set');
    console.error(
      'This key is required to bypass RLS and insert patterns directly.'
    );
    process.exit(1);
  }

  const patternsDir = path.join(__dirname, '..', 'content', 'patterns');

  console.log('='.repeat(50));
  console.log('NativePace Pattern Seed Script');
  console.log('='.repeat(50));
  console.log(`Supabase URL: ${supabaseUrl}`);
  console.log(`Patterns directory: ${patternsDir}`);
  console.log('');

  try {
    const result = await seedPatterns(supabaseUrl, serviceRoleKey, patternsDir);

    console.log('');
    console.log('='.repeat(50));
    console.log('Seed Summary');
    console.log('='.repeat(50));
    console.log(`Patterns upserted: ${result.inserted}`);

    if (result.errors.length > 0) {
      console.log(`Errors: ${result.errors.length}`);
      result.errors.forEach((e) => console.log(`  - ${e}`));
      process.exit(1);
    }

    console.log('Seed completed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Only run main if this file is executed directly
if (require.main === module) {
  main();
}
