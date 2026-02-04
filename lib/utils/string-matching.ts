/**
 * String Matching Utilities
 *
 * Pure functions for text comparison and fuzzy matching.
 * Used for dictation exercises and answer validation.
 */

/**
 * Normalizes text for comparison by:
 * - Converting to lowercase
 * - Removing punctuation
 * - Collapsing multiple spaces
 * - Trimming whitespace
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,!?;:'"()\-\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein distance between two strings.
 * Measures minimum single-character edits (insertions, deletions, substitutions).
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculates similarity score between two strings (0-100).
 * 100 means identical (after normalization), 0 means completely different.
 */
export function calculateSimilarity(input: string, target: string): number {
  const normalizedInput = normalizeText(input);
  const normalizedTarget = normalizeText(target);

  if (normalizedInput === normalizedTarget) {
    return 100;
  }

  if (normalizedInput.length === 0 || normalizedTarget.length === 0) {
    return 0;
  }

  const distance = levenshteinDistance(normalizedInput, normalizedTarget);
  const maxLength = Math.max(normalizedInput.length, normalizedTarget.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(Math.max(0, similarity));
}

/**
 * Default similarity threshold for fuzzy matching (85%)
 */
export const DEFAULT_SIMILARITY_THRESHOLD = 85;

/**
 * Checks if input matches target within similarity threshold.
 */
export function isMatch(
  input: string,
  target: string,
  threshold: number = DEFAULT_SIMILARITY_THRESHOLD
): boolean {
  const normalizedInput = normalizeText(input);
  const normalizedTarget = normalizeText(target);

  if (normalizedInput === normalizedTarget) {
    return true;
  }

  return calculateSimilarity(input, target) >= threshold;
}

/**
 * Result of finding best match among candidates
 */
export interface BestMatchResult {
  match: string;
  score: number;
  index: number;
}

/**
 * Finds the best matching string from a list of candidates.
 * Returns null if no candidates or all scores are 0.
 */
export function findBestMatch(
  input: string,
  candidates: string[]
): BestMatchResult | null {
  if (candidates.length === 0) {
    return null;
  }

  let bestMatch: BestMatchResult | null = null;

  for (let i = 0; i < candidates.length; i++) {
    const score = calculateSimilarity(input, candidates[i]);

    if (bestMatch === null || score > bestMatch.score) {
      bestMatch = {
        match: candidates[i],
        score,
        index: i,
      };
    }
  }

  if (bestMatch && bestMatch.score === 0) {
    return null;
  }

  return bestMatch;
}

/**
 * Splits text into tokens (words).
 */
export function tokenize(text: string): string[] {
  const normalized = normalizeText(text);
  if (normalized.length === 0) {
    return [];
  }
  return normalized.split(' ');
}

/**
 * Counts how many tokens from input appear in target.
 */
export function countMatchingTokens(input: string, target: string): number {
  const inputTokens = tokenize(input);
  const targetTokens = new Set(tokenize(target));

  if (inputTokens.length === 0) {
    return 0;
  }

  let count = 0;
  for (const token of inputTokens) {
    if (targetTokens.has(token)) {
      count++;
    }
  }

  return count;
}

/**
 * Calculates token-based similarity (percentage of matching tokens).
 */
export function tokenSimilarity(input: string, target: string): number {
  const inputTokens = tokenize(input);
  const targetTokens = tokenize(target);

  if (inputTokens.length === 0 || targetTokens.length === 0) {
    return 0;
  }

  const matchingCount = countMatchingTokens(input, target);
  const totalUnique = new Set([...inputTokens, ...targetTokens]).size;

  return Math.round((matchingCount / totalUnique) * 100);
}

/**
 * Checks if all required tokens are present in input.
 */
export function containsAllTokens(input: string, requiredTokens: string[]): boolean {
  const inputTokenSet = new Set(tokenize(input));

  for (const token of requiredTokens) {
    const normalizedToken = normalizeText(token);
    if (!inputTokenSet.has(normalizedToken)) {
      return false;
    }
  }

  return true;
}

/**
 * Calculates combined similarity using both character and token methods.
 * Weights: 70% character similarity, 30% token similarity.
 */
export function combinedSimilarity(input: string, target: string): number {
  const charSim = calculateSimilarity(input, target);
  const tokenSim = tokenSimilarity(input, target);

  return Math.round(charSim * 0.7 + tokenSim * 0.3);
}
