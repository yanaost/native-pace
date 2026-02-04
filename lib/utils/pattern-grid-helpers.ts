/**
 * Pattern Grid Helpers
 *
 * Pure utility functions for the pattern grid visualization.
 */

import type { PatternCategory } from '@/types/pattern';

/** Mastery level classification */
export type MasteryLevel = 'not-started' | 'learning' | 'practiced' | 'mastered';

/** Pattern item data for the grid */
export interface PatternGridItem {
  patternId: string;
  masteryScore: number;
  masteryLevel: MasteryLevel;
  color: string;
}

/** Category group for display */
export interface CategoryGroup {
  category: PatternCategory;
  displayName: string;
  patterns: PatternGridItem[];
}

/** Mastery thresholds */
export const MASTERY_THRESHOLDS = {
  MASTERED: 80,
  PRACTICED: 50,
  LEARNING: 1,
} as const;

/** Colors for mastery levels (using MUI palette-compatible colors) */
export const MASTERY_COLORS: Record<MasteryLevel, string> = {
  'not-started': '#e5e7eb', // gray-200
  'learning': '#fde047', // yellow-300
  'practiced': '#86efac', // green-300
  'mastered': '#22c55e', // green-500
};

/** Ordered list of categories for consistent display */
export const CATEGORY_ORDER: PatternCategory[] = [
  'weak-forms',
  'reductions',
  'linking',
  'elision',
  'assimilation',
  'flapping',
];

/** Display names for categories */
export const CATEGORY_NAMES: Record<PatternCategory, string> = {
  'weak-forms': 'Weak Forms',
  'reductions': 'Reductions',
  'linking': 'Linking',
  'elision': 'Elision',
  'assimilation': 'Assimilation',
  'flapping': 'Flapping',
};

/**
 * Determines the mastery level based on score.
 *
 * @param score - Mastery score (0-100)
 * @returns Mastery level classification
 */
export function getMasteryLevel(score: number): MasteryLevel {
  if (score >= MASTERY_THRESHOLDS.MASTERED) {
    return 'mastered';
  }
  if (score >= MASTERY_THRESHOLDS.PRACTICED) {
    return 'practiced';
  }
  if (score >= MASTERY_THRESHOLDS.LEARNING) {
    return 'learning';
  }
  return 'not-started';
}

/**
 * Gets the color for a mastery score.
 *
 * @param score - Mastery score (0-100)
 * @returns Hex color string
 */
export function getMasteryColor(score: number): string {
  const level = getMasteryLevel(score);
  return MASTERY_COLORS[level];
}

/**
 * Gets the display name for a mastery level.
 *
 * @param level - Mastery level
 * @returns Human-readable label
 */
export function getMasteryLevelLabel(level: MasteryLevel): string {
  switch (level) {
    case 'mastered':
      return 'Mastered';
    case 'practiced':
      return 'Practiced';
    case 'learning':
      return 'Learning';
    case 'not-started':
      return 'Not Started';
  }
}

/**
 * Creates a grid item from pattern ID and mastery score.
 *
 * @param patternId - Pattern identifier
 * @param masteryScore - Mastery score (0-100)
 * @returns Grid item data
 */
export function createPatternGridItem(
  patternId: string,
  masteryScore: number
): PatternGridItem {
  const level = getMasteryLevel(masteryScore);
  return {
    patternId,
    masteryScore,
    masteryLevel: level,
    color: MASTERY_COLORS[level],
  };
}

/**
 * Groups patterns by category for display.
 *
 * @param patterns - Array of pattern records with category
 * @param progressMap - Map of pattern ID to mastery score
 * @returns Array of category groups sorted by CATEGORY_ORDER
 */
export function groupPatternsByCategory<T extends { id: string; category: PatternCategory }>(
  patterns: T[],
  progressMap: Map<string, number>
): CategoryGroup[] {
  // Group patterns by category
  const categoryMap = new Map<PatternCategory, PatternGridItem[]>();

  for (const pattern of patterns) {
    const masteryScore = progressMap.get(pattern.id) ?? 0;
    const item = createPatternGridItem(pattern.id, masteryScore);

    const existing = categoryMap.get(pattern.category) ?? [];
    existing.push(item);
    categoryMap.set(pattern.category, existing);
  }

  // Sort by CATEGORY_ORDER
  return CATEGORY_ORDER
    .filter((category) => categoryMap.has(category))
    .map((category) => ({
      category,
      displayName: CATEGORY_NAMES[category],
      patterns: categoryMap.get(category) ?? [],
    }));
}

/**
 * Creates a progress map from progress records.
 *
 * @param progressRecords - Array of progress records
 * @returns Map of pattern ID to mastery score
 */
export function createProgressMap<T extends { pattern_id: string; mastery_score: number }>(
  progressRecords: T[]
): Map<string, number> {
  const map = new Map<string, number>();
  for (const record of progressRecords) {
    map.set(record.pattern_id, record.mastery_score);
  }
  return map;
}

/**
 * Counts patterns by mastery level.
 *
 * @param items - Array of grid items
 * @returns Object with counts per level
 */
export function countByMasteryLevel(
  items: PatternGridItem[]
): Record<MasteryLevel, number> {
  const counts: Record<MasteryLevel, number> = {
    'not-started': 0,
    'learning': 0,
    'practiced': 0,
    'mastered': 0,
  };

  for (const item of items) {
    counts[item.masteryLevel]++;
  }

  return counts;
}

/**
 * Gets legend items for the grid.
 *
 * @returns Array of legend items with label and color
 */
export function getLegendItems(): Array<{ level: MasteryLevel; label: string; color: string }> {
  return [
    { level: 'mastered', label: 'Mastered (80%+)', color: MASTERY_COLORS.mastered },
    { level: 'practiced', label: 'Practiced (50-79%)', color: MASTERY_COLORS.practiced },
    { level: 'learning', label: 'Learning (1-49%)', color: MASTERY_COLORS.learning },
    { level: 'not-started', label: 'Not Started', color: MASTERY_COLORS['not-started'] },
  ];
}
