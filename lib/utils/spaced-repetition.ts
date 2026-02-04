/**
 * SM-2 Spaced Repetition Algorithm Implementation
 *
 * The SM-2 algorithm calculates optimal review intervals based on user performance.
 * It adjusts the ease factor and interval based on the quality of recall.
 */

import { createLogger } from './logger';

const logger = createLogger('spaced-repetition');

/**
 * Result of SM-2 calculation containing the new ease factor,
 * interval in days, and the calculated next review date.
 */
export interface SM2Result {
  /** New ease factor (minimum 1.3) */
  easeFactor: number;
  /** Days until next review */
  intervalDays: number;
  /** Calculated next review date */
  nextReviewDate: Date;
}

/**
 * Calculates the next review interval using the SM-2 algorithm.
 *
 * @param quality - Quality of recall (0-5 scale)
 *   - 5: perfect response
 *   - 4: correct response after hesitation
 *   - 3: correct response with difficulty
 *   - 2: incorrect response but close
 *   - 1: incorrect response with some recall
 *   - 0: complete blackout
 * @param previousEF - Previous ease factor (default 2.5)
 * @param previousInterval - Previous interval in days (default 1)
 * @returns SM2Result with new ease factor, interval, and next review date
 */
export function calculateSM2(
  quality: number,
  previousEF: number = 2.5,
  previousInterval: number = 1
): SM2Result {
  logger.debug('SM2 calculation input', {
    quality,
    previousEF,
    previousInterval,
  });

  // Clamp quality to valid range
  const q = Math.max(0, Math.min(5, quality));

  // Calculate new ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = previousEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Enforce minimum ease factor of 1.3
  newEF = Math.max(1.3, newEF);

  let intervalDays: number;

  if (q < 3) {
    // If quality < 3, reset interval to 1 (failed recall)
    intervalDays = 1;
  } else {
    // Calculate interval based on repetition number
    if (previousInterval === 1) {
      // First successful review: interval stays at 1
      intervalDays = 1;
    } else if (previousInterval < 6) {
      // Second successful review: interval becomes 6
      intervalDays = 6;
    } else {
      // Third+ successful review: multiply by ease factor
      intervalDays = Math.round(previousInterval * newEF);
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);

  const result: SM2Result = {
    easeFactor: Number(newEF.toFixed(2)),
    intervalDays,
    nextReviewDate,
  };

  logger.debug('SM2 calculation output', {
    easeFactor: result.easeFactor,
    intervalDays: result.intervalDays,
    nextReviewDate: result.nextReviewDate.toISOString(),
  });

  return result;
}

/**
 * Converts exercise result to SM-2 quality score (0-5).
 *
 * @param isCorrect - Whether the answer was correct
 * @param responseTimeMs - Time taken to respond in milliseconds
 * @param averageTimeMs - Average response time in milliseconds (default 5000ms)
 * @returns Quality score from 0-5
 *   - Incorrect: 1
 *   - Correct + fast (<50% avg): 5
 *   - Correct + normal (<100% avg): 4
 *   - Correct + slow (>=100% avg): 3
 */
export function exerciseResultToQuality(
  isCorrect: boolean,
  responseTimeMs: number,
  averageTimeMs: number = 5000
): number {
  logger.debug('Converting exercise result to quality', {
    isCorrect,
    responseTimeMs,
    averageTimeMs,
  });

  let quality: number;

  if (!isCorrect) {
    quality = 1;
  } else {
    // Correct answer - determine quality based on response time
    const timeRatio = responseTimeMs / averageTimeMs;

    if (timeRatio < 0.5) {
      // Fast response (less than 50% of average time)
      quality = 5;
    } else if (timeRatio < 1.0) {
      // Normal speed (between 50% and 100% of average time)
      quality = 4;
    } else {
      // Slow response (100% or more of average time)
      quality = 3;
    }
  }

  logger.debug('Quality score calculated', { quality });

  return quality;
}
