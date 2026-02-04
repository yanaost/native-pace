/**
 * Stats Calculation Helpers
 *
 * Pure utility functions for calculating user statistics.
 */

import type { PatternCategory } from '@/types/pattern';

/** Progress record from database */
export interface ProgressRecord {
  pattern_id: string;
  mastery_score: number;
  times_practiced: number;
  times_correct: number;
}

/** Pattern record with category */
export interface PatternRecord {
  id: string;
  category: PatternCategory;
}

/** Practice session record */
export interface SessionRecord {
  started_at: string;
  ended_at: string | null;
}

/** Category statistics */
export interface CategoryStats {
  category: PatternCategory;
  averageMastery: number;
  patternsLearned: number;
  totalPatterns: number;
}

/**
 * Counts patterns with any progress (mastery_score > 0).
 *
 * @param progressRecords - Array of progress records
 * @returns Number of patterns learned
 */
export function calculatePatternsLearned(progressRecords: ProgressRecord[]): number {
  return progressRecords.filter((p) => p.mastery_score > 0).length;
}

/**
 * Calculates average accuracy from progress records.
 * Accuracy = total correct / total practiced
 *
 * @param progressRecords - Array of progress records
 * @returns Average accuracy as percentage (0-100), 0 if no practice
 */
export function calculateAverageAccuracy(progressRecords: ProgressRecord[]): number {
  const totalPracticed = progressRecords.reduce((sum, p) => sum + p.times_practiced, 0);
  const totalCorrect = progressRecords.reduce((sum, p) => sum + p.times_correct, 0);

  if (totalPracticed === 0) {
    return 0;
  }

  return Math.round((totalCorrect / totalPracticed) * 100);
}

/**
 * Calculates average mastery score per category.
 *
 * @param progressRecords - Array of progress records
 * @param patterns - Array of pattern records with categories
 * @returns Record mapping category to average mastery
 */
export function calculateMasteryByCategory(
  progressRecords: ProgressRecord[],
  patterns: PatternRecord[]
): Record<PatternCategory, number> {
  // Create a map of pattern ID to category
  const patternToCategory = new Map<string, PatternCategory>();
  for (const pattern of patterns) {
    patternToCategory.set(pattern.id, pattern.category);
  }

  // Create progress map
  const progressMap = new Map<string, number>();
  for (const record of progressRecords) {
    progressMap.set(record.pattern_id, record.mastery_score);
  }

  // Group patterns by category and calculate average mastery
  const categoryGroups = new Map<PatternCategory, number[]>();

  for (const pattern of patterns) {
    const mastery = progressMap.get(pattern.id) ?? 0;
    const existing = categoryGroups.get(pattern.category) ?? [];
    existing.push(mastery);
    categoryGroups.set(pattern.category, existing);
  }

  // Calculate averages
  const result: Record<PatternCategory, number> = {
    'weak-forms': 0,
    'reductions': 0,
    'linking': 0,
    'elision': 0,
    'assimilation': 0,
    'flapping': 0,
  };

  for (const [category, scores] of categoryGroups) {
    if (scores.length > 0) {
      const sum = scores.reduce((a, b) => a + b, 0);
      result[category] = Math.round(sum / scores.length);
    }
  }

  return result;
}

/**
 * Calculates total practice time from sessions.
 *
 * @param sessions - Array of session records
 * @returns Total practice time in minutes
 */
export function calculateTotalPracticeMinutes(sessions: SessionRecord[]): number {
  let totalMs = 0;

  for (const session of sessions) {
    if (session.ended_at) {
      const start = new Date(session.started_at).getTime();
      const end = new Date(session.ended_at).getTime();
      totalMs += end - start;
    }
  }

  return Math.round(totalMs / (1000 * 60));
}

/**
 * Calculates detailed statistics per category.
 *
 * @param progressRecords - Array of progress records
 * @param patterns - Array of pattern records with categories
 * @returns Array of category statistics
 */
export function calculateCategoryStats(
  progressRecords: ProgressRecord[],
  patterns: PatternRecord[]
): CategoryStats[] {
  // Create progress map
  const progressMap = new Map<string, number>();
  for (const record of progressRecords) {
    progressMap.set(record.pattern_id, record.mastery_score);
  }

  // Group patterns by category
  const categoryGroups = new Map<PatternCategory, PatternRecord[]>();
  for (const pattern of patterns) {
    const existing = categoryGroups.get(pattern.category) ?? [];
    existing.push(pattern);
    categoryGroups.set(pattern.category, existing);
  }

  // Calculate stats for each category
  const stats: CategoryStats[] = [];

  for (const [category, categoryPatterns] of categoryGroups) {
    const scores = categoryPatterns.map((p) => progressMap.get(p.id) ?? 0);
    const learnedCount = scores.filter((s) => s > 0).length;
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = scores.length > 0 ? Math.round(sum / scores.length) : 0;

    stats.push({
      category,
      averageMastery: avg,
      patternsLearned: learnedCount,
      totalPatterns: categoryPatterns.length,
    });
  }

  return stats;
}
