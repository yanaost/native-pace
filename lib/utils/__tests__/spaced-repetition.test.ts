import { calculateSM2, exerciseResultToQuality } from '../spaced-repetition';

describe('calculateSM2', () => {
  describe('ease factor calculations', () => {
    it('should increase ease factor for quality 5 (perfect)', () => {
      const result = calculateSM2(5, 2.5, 1);
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('should maintain ease factor for quality 4 (correct with hesitation)', () => {
      const result = calculateSM2(4, 2.5, 1);
      // EF change for quality 4: 0.1 - (5-4) * (0.08 + (5-4) * 0.02) = 0.1 - 1 * 0.10 = 0
      expect(result.easeFactor).toBe(2.5);
      // Quality 4 should result in same or lower EF than quality 5
      const result5 = calculateSM2(5, 2.5, 1);
      expect(result.easeFactor).toBeLessThanOrEqual(result5.easeFactor);
    });

    it('should roughly maintain ease factor for quality 3 (correct with difficulty)', () => {
      const result = calculateSM2(3, 2.5, 1);
      // EF change for quality 3: 0.1 - (5-3) * (0.08 + (5-3) * 0.02) = 0.1 - 2 * 0.12 = -0.14
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
    });

    it('should decrease ease factor for quality 2 (incorrect but remembered)', () => {
      const result = calculateSM2(2, 2.5, 1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should decrease ease factor for quality 1 (incorrect)', () => {
      const result = calculateSM2(1, 2.5, 1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should decrease ease factor for quality 0 (blackout)', () => {
      const result = calculateSM2(0, 2.5, 1);
      expect(result.easeFactor).toBeLessThan(2.5);
    });

    it('should never drop ease factor below 1.3', () => {
      // Start with minimum EF and give bad quality
      const result = calculateSM2(0, 1.3, 1);
      expect(result.easeFactor).toBe(1.3);

      // Even with repeated failures
      const result2 = calculateSM2(0, 1.5, 1);
      expect(result2.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('interval calculations', () => {
    it('should return interval of 1 day for first successful review', () => {
      const result = calculateSM2(5, 2.5, 1);
      expect(result.intervalDays).toBe(1);
    });

    it('should return interval of 6 days for second successful review', () => {
      // After first review, interval would be 1, then for second review with interval < 6
      const result = calculateSM2(5, 2.5, 2);
      expect(result.intervalDays).toBe(6);
    });

    it('should multiply interval by ease factor for third+ reviews', () => {
      const ef = 2.5;
      const previousInterval = 6;
      const result = calculateSM2(5, ef, previousInterval);
      // New EF after quality 5: 2.5 + 0.1 = 2.6
      // Expected interval: round(6 * 2.6) = 16
      expect(result.intervalDays).toBe(Math.round(previousInterval * result.easeFactor));
    });

    it('should reset interval to 1 for quality < 3', () => {
      expect(calculateSM2(2, 2.5, 10).intervalDays).toBe(1);
      expect(calculateSM2(1, 2.5, 20).intervalDays).toBe(1);
      expect(calculateSM2(0, 2.5, 30).intervalDays).toBe(1);
    });
  });

  describe('default parameters', () => {
    it('should work with only quality parameter', () => {
      const result = calculateSM2(5);
      expect(result.easeFactor).toBeGreaterThan(2.5);
      expect(result.intervalDays).toBe(1);
      expect(result.nextReviewDate).toBeInstanceOf(Date);
    });

    it('should use default ease factor of 2.5', () => {
      const result = calculateSM2(5);
      // EF after quality 5 from 2.5: 2.5 + 0.1 = 2.6
      expect(result.easeFactor).toBe(2.6);
    });
  });

  describe('next review date', () => {
    it('should calculate next review date correctly', () => {
      const before = new Date();
      const result = calculateSM2(5, 2.5, 6);
      const after = new Date();

      const expectedInterval = result.intervalDays;
      const expectedMin = new Date(before);
      expectedMin.setDate(expectedMin.getDate() + expectedInterval);
      const expectedMax = new Date(after);
      expectedMax.setDate(expectedMax.getDate() + expectedInterval);

      expect(result.nextReviewDate.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime());
      expect(result.nextReviewDate.getTime()).toBeLessThanOrEqual(expectedMax.getTime());
    });

    it('should be tomorrow for interval of 1', () => {
      const result = calculateSM2(5, 2.5, 1);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      expect(result.nextReviewDate.getDate()).toBe(tomorrow.getDate());
    });
  });

  describe('edge cases', () => {
    it('should clamp quality below 0 to 0', () => {
      const result = calculateSM2(-1, 2.5, 1);
      const resultZero = calculateSM2(0, 2.5, 1);
      expect(result.easeFactor).toBe(resultZero.easeFactor);
    });

    it('should clamp quality above 5 to 5', () => {
      const result = calculateSM2(10, 2.5, 1);
      const resultFive = calculateSM2(5, 2.5, 1);
      expect(result.easeFactor).toBe(resultFive.easeFactor);
    });
  });
});

describe('exerciseResultToQuality', () => {
  describe('incorrect answers', () => {
    it('should return 1 for incorrect answer', () => {
      expect(exerciseResultToQuality(false, 1000)).toBe(1);
      expect(exerciseResultToQuality(false, 5000)).toBe(1);
      expect(exerciseResultToQuality(false, 10000)).toBe(1);
    });

    it('should return 1 for incorrect regardless of response time', () => {
      expect(exerciseResultToQuality(false, 0)).toBe(1);
      expect(exerciseResultToQuality(false, 100000)).toBe(1);
    });
  });

  describe('correct answers with default average time', () => {
    it('should return 5 for fast correct answer (<50% avg time)', () => {
      // Default avg is 5000ms, so < 2500ms is fast
      expect(exerciseResultToQuality(true, 1000)).toBe(5);
      expect(exerciseResultToQuality(true, 2499)).toBe(5);
    });

    it('should return 4 for normal speed correct answer (<100% avg time)', () => {
      // Between 2500ms and 5000ms
      expect(exerciseResultToQuality(true, 2500)).toBe(4);
      expect(exerciseResultToQuality(true, 4999)).toBe(4);
    });

    it('should return 3 for slow correct answer (>=100% avg time)', () => {
      // 5000ms or more
      expect(exerciseResultToQuality(true, 5000)).toBe(3);
      expect(exerciseResultToQuality(true, 10000)).toBe(3);
    });
  });

  describe('custom average time', () => {
    it('should use custom average time for calculations', () => {
      const avgTime = 10000;

      // Fast: < 5000ms
      expect(exerciseResultToQuality(true, 4000, avgTime)).toBe(5);

      // Normal: 5000ms - 9999ms
      expect(exerciseResultToQuality(true, 7000, avgTime)).toBe(4);

      // Slow: >= 10000ms
      expect(exerciseResultToQuality(true, 10000, avgTime)).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle 0ms response time', () => {
      expect(exerciseResultToQuality(true, 0)).toBe(5);
    });

    it('should handle very high response time', () => {
      expect(exerciseResultToQuality(true, 1000000)).toBe(3);
    });

    it('should handle default averageTimeMs correctly', () => {
      // Without providing averageTimeMs, should use default 5000ms
      const fastResult = exerciseResultToQuality(true, 2000);
      const normalResult = exerciseResultToQuality(true, 3000);
      const slowResult = exerciseResultToQuality(true, 6000);

      expect(fastResult).toBe(5);
      expect(normalResult).toBe(4);
      expect(slowResult).toBe(3);
    });
  });
});
