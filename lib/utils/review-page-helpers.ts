/**
 * Review Page Helpers
 *
 * Pure utility functions for the review page display logic.
 */

import type { PatternCategory } from '@/types/pattern';
import type { ProgressWithPattern } from './review-queue';

/** Display information for a category in the review summary */
export interface CategorySummary {
  category: PatternCategory;
  displayName: string;
  count: number;
}

/** Summary data for the review page */
export interface ReviewSummary {
  totalDue: number;
  categories: CategorySummary[];
  isEmpty: boolean;
}

/** Map of pattern category to display name */
export const CATEGORY_DISPLAY_NAMES: Record<PatternCategory, string> = {
  'weak-forms': 'Weak Forms',
  'reductions': 'Reductions',
  'linking': 'Linking',
  'elision': 'Elision',
  'assimilation': 'Assimilation',
  'flapping': 'Flapping',
};

/**
 * Gets the display name for a pattern category.
 *
 * @param category - The pattern category
 * @returns Human-readable display name
 */
export function getCategoryDisplayName(category: PatternCategory | string): string {
  return CATEGORY_DISPLAY_NAMES[category as PatternCategory] ?? category;
}

/**
 * Creates a review summary from progress records.
 *
 * @param duePatterns - Array of progress records with pattern data
 * @returns Review summary with category breakdown
 */
export function createReviewSummary(duePatterns: ProgressWithPattern[]): ReviewSummary {
  const categoryMap = new Map<PatternCategory, number>();

  for (const record of duePatterns) {
    const category = record.patterns?.category;
    if (category) {
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + 1);
    }
  }

  const categories: CategorySummary[] = Array.from(categoryMap.entries())
    .map(([category, count]) => ({
      category,
      displayName: getCategoryDisplayName(category),
      count,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return {
    totalDue: duePatterns.length,
    categories,
    isEmpty: duePatterns.length === 0,
  };
}

/**
 * Formats the total count for display.
 *
 * @param count - Number of patterns due
 * @returns Formatted string (e.g., "8 patterns", "1 pattern")
 */
export function formatDueCount(count: number): string {
  if (count === 0) {
    return 'No patterns';
  }
  return count === 1 ? '1 pattern' : `${count} patterns`;
}

/**
 * Gets the first pattern ID for starting a review session.
 *
 * @param duePatterns - Array of progress records with pattern data
 * @returns The pattern ID to start with, or null if no patterns
 */
export function getFirstPatternId(duePatterns: ProgressWithPattern[]): string | null {
  if (duePatterns.length === 0) {
    return null;
  }
  return duePatterns[0].pattern_id;
}

/**
 * Gets the review page title based on due count.
 *
 * @param count - Number of patterns due
 * @returns Title string for the page header
 */
export function getReviewPageTitle(count: number): string {
  if (count === 0) {
    return 'All Caught Up!';
  }
  return 'Review Due';
}

/**
 * Gets the review page subtitle/description.
 *
 * @param count - Number of patterns due
 * @returns Subtitle string for the page
 */
export function getReviewPageSubtitle(count: number): string {
  if (count === 0) {
    return "You don't have any patterns due for review. Great job staying on top of your practice!";
  }
  if (count === 1) {
    return 'You have 1 pattern due for review. Keep your skills sharp!';
  }
  return `You have ${count} patterns due for review. Keep your skills sharp!`;
}

/**
 * Gets the empty state message for the review page.
 *
 * @returns Object with title and description for empty state
 */
export function getEmptyStateMessage(): { title: string; description: string } {
  return {
    title: 'All Caught Up!',
    description:
      "You don't have any patterns due for review right now. Come back later or continue learning new patterns!",
  };
}
