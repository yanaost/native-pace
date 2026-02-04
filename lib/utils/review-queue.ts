/**
 * Review Queue Utilities
 *
 * Functions for managing the spaced repetition review queue,
 * including fetching due patterns and getting new patterns for a level.
 */

import { createLogger } from './logger';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Pattern, UserPatternProgress } from '@/lib/supabase/types';

const logger = createLogger('review-queue');

/** Progress record with joined pattern data */
export interface ProgressWithPattern extends UserPatternProgress {
  patterns: Pattern | null;
}

/** Default limit for due patterns query */
export const DEFAULT_DUE_PATTERNS_LIMIT = 20;

/** Default limit for new patterns query */
export const DEFAULT_NEW_PATTERNS_LIMIT = 5;

/**
 * Checks if a pattern is due for review based on its next_review_at date.
 *
 * @param nextReviewAt - The next review date string (ISO format) or null
 * @param referenceDate - The date to compare against (defaults to now)
 * @returns True if the pattern is due for review
 */
export function isPatternDue(
  nextReviewAt: string | null,
  referenceDate: Date = new Date()
): boolean {
  if (nextReviewAt === null) {
    // Patterns with no review date are not due (never practiced)
    return false;
  }

  const reviewDate = new Date(nextReviewAt);
  return reviewDate <= referenceDate;
}

/**
 * Filters progress records to only include those that are due for review.
 *
 * @param progressRecords - Array of progress records
 * @param referenceDate - The date to compare against (defaults to now)
 * @returns Filtered array of due progress records
 */
export function filterDuePatterns<T extends { next_review_at: string | null }>(
  progressRecords: T[],
  referenceDate: Date = new Date()
): T[] {
  return progressRecords.filter((record) =>
    isPatternDue(record.next_review_at, referenceDate)
  );
}

/**
 * Sorts progress records by next_review_at date (earliest first).
 *
 * @param progressRecords - Array of progress records
 * @returns Sorted array (mutates original)
 */
export function sortByReviewDate<T extends { next_review_at: string | null }>(
  progressRecords: T[]
): T[] {
  return progressRecords.sort((a, b) => {
    if (a.next_review_at === null && b.next_review_at === null) return 0;
    if (a.next_review_at === null) return 1;
    if (b.next_review_at === null) return -1;
    return new Date(a.next_review_at).getTime() - new Date(b.next_review_at).getTime();
  });
}

/**
 * Filters patterns to exclude those the user has already practiced.
 *
 * @param patterns - Array of patterns
 * @param practicedPatternIds - Set or array of pattern IDs the user has practiced
 * @returns Filtered array of unpracticed patterns
 */
export function filterUnpracticedPatterns<T extends { id: string }>(
  patterns: T[],
  practicedPatternIds: Set<string> | string[]
): T[] {
  const practicedSet =
    practicedPatternIds instanceof Set
      ? practicedPatternIds
      : new Set(practicedPatternIds);

  return patterns.filter((pattern) => !practicedSet.has(pattern.id));
}

/**
 * Sorts patterns by their order_index.
 *
 * @param patterns - Array of patterns
 * @returns Sorted array (mutates original)
 */
export function sortByOrderIndex<T extends { order_index: number }>(
  patterns: T[]
): T[] {
  return patterns.sort((a, b) => a.order_index - b.order_index);
}

/**
 * Fetches patterns that are due for review for a user.
 * Returns progress records with joined pattern data, sorted by next_review_at.
 *
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param limit - Maximum number of patterns to return (default: 20)
 * @returns Array of progress records with pattern data, or empty array on error
 */
export async function getDuePatterns(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit: number = DEFAULT_DUE_PATTERNS_LIMIT
): Promise<ProgressWithPattern[]> {
  logger.info('Fetching due patterns', { userId, limit });

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_pattern_progress')
    .select('*, patterns(*)')
    .eq('user_id', userId)
    .lte('next_review_at', now)
    .order('next_review_at', { ascending: true })
    .limit(limit);

  if (error) {
    logger.error('Failed to fetch due patterns', error);
    return [];
  }

  logger.info('Due patterns fetched', { count: data?.length ?? 0 });

  return (data ?? []) as ProgressWithPattern[];
}

/**
 * Fetches new (unpracticed) patterns for a specific level.
 * Returns patterns the user hasn't started yet, sorted by order_index.
 *
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @param level - The level to fetch patterns for (1-6)
 * @param limit - Maximum number of patterns to return (default: 5)
 * @returns Array of patterns, or empty array on error
 */
export async function getNewPatternsForLevel(
  supabase: SupabaseClient<Database>,
  userId: string,
  level: number,
  limit: number = DEFAULT_NEW_PATTERNS_LIMIT
): Promise<Pattern[]> {
  logger.info('Fetching new patterns for level', { userId, level, limit });

  // First, get all pattern IDs the user has practiced
  const { data: practiced, error: practicedError } = await supabase
    .from('user_pattern_progress')
    .select('pattern_id')
    .eq('user_id', userId);

  if (practicedError) {
    logger.error('Failed to fetch practiced patterns', practicedError);
    return [];
  }

  const practicedIds = practiced?.map((p) => p.pattern_id) ?? [];

  logger.debug('User practiced patterns', { count: practicedIds.length });

  // Build query for patterns at this level that haven't been practiced
  let query = supabase
    .from('patterns')
    .select('*')
    .eq('level', level)
    .order('order_index', { ascending: true })
    .limit(limit);

  // Only add the filter if there are practiced IDs
  if (practicedIds.length > 0) {
    query = query.not('id', 'in', `(${practicedIds.join(',')})`);
  }

  const { data: patterns, error: patternsError } = await query;

  if (patternsError) {
    logger.error('Failed to fetch patterns for level', patternsError);
    return [];
  }

  logger.info('New patterns fetched', { count: patterns?.length ?? 0 });

  return patterns ?? [];
}

/**
 * Gets the count of patterns due for review for a user.
 *
 * @param supabase - Supabase client instance
 * @param userId - The user's ID
 * @returns Count of due patterns, or 0 on error
 */
export async function getDuePatternsCount(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<number> {
  logger.info('Counting due patterns', { userId });

  const now = new Date().toISOString();

  const { count, error } = await supabase
    .from('user_pattern_progress')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .lte('next_review_at', now);

  if (error) {
    logger.error('Failed to count due patterns', error);
    return 0;
  }

  logger.info('Due patterns counted', { count: count ?? 0 });

  return count ?? 0;
}

/**
 * Groups progress records by pattern category.
 *
 * @param progressRecords - Array of progress records with pattern data
 * @returns Map of category to count
 */
export function groupByCategory(
  progressRecords: ProgressWithPattern[]
): Map<string, number> {
  const groups = new Map<string, number>();

  for (const record of progressRecords) {
    const category = record.patterns?.category ?? 'unknown';
    groups.set(category, (groups.get(category) ?? 0) + 1);
  }

  return groups;
}
