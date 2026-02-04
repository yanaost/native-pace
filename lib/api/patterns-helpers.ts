/**
 * Patterns API Helpers
 *
 * Utility functions for the patterns API route.
 * Extracted for testing purposes.
 */

import type { PatternCategory } from '@/lib/supabase/types';

/** Valid pattern categories for filtering */
export const VALID_CATEGORIES: PatternCategory[] = [
  'weak-forms',
  'reductions',
  'linking',
  'elision',
  'assimilation',
  'flapping',
];

/** Default pagination values */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/** Response type for the patterns API */
export interface PatternsResponse {
  success: boolean;
  data?: {
    patterns: unknown[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
  error?: string;
}

/** Parsed query parameters result */
export interface ParsedQueryParams {
  level: number | null;
  category: PatternCategory | null;
  page: number;
  limit: number;
  errors: string[];
}

/**
 * Parse and validate query parameters
 */
export function parseQueryParams(searchParams: URLSearchParams): ParsedQueryParams {
  const errors: string[] = [];

  // Parse level (1-6)
  let level: number | null = null;
  const levelParam = searchParams.get('level');
  if (levelParam) {
    const parsedLevel = parseInt(levelParam, 10);
    if (isNaN(parsedLevel) || parsedLevel < 1 || parsedLevel > 6) {
      errors.push('level must be a number between 1 and 6');
    } else {
      level = parsedLevel;
    }
  }

  // Parse category
  let category: PatternCategory | null = null;
  const categoryParam = searchParams.get('category');
  if (categoryParam) {
    if (VALID_CATEGORIES.includes(categoryParam as PatternCategory)) {
      category = categoryParam as PatternCategory;
    } else {
      errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
    }
  }

  // Parse page (default: 1)
  let page = DEFAULT_PAGE;
  const pageParam = searchParams.get('page');
  if (pageParam) {
    const parsedPage = parseInt(pageParam, 10);
    if (isNaN(parsedPage) || parsedPage < 1) {
      errors.push('page must be a positive integer');
    } else {
      page = parsedPage;
    }
  }

  // Parse limit (default: 20, max: 100)
  let limit = DEFAULT_LIMIT;
  const limitParam = searchParams.get('limit');
  if (limitParam) {
    const parsedLimit = parseInt(limitParam, 10);
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      errors.push('limit must be a positive integer');
    } else {
      limit = Math.min(parsedLimit, MAX_LIMIT);
    }
  }

  return { level, category, page, limit, errors };
}
