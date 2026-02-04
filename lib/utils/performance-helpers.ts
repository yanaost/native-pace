/**
 * Performance Optimization Helpers
 *
 * Constants and utilities for performance optimization including
 * Core Web Vitals thresholds, image optimization, and audio preloading.
 */

/**
 * Core Web Vitals threshold type
 */
export type WebVitalRating = 'good' | 'needs-improvement' | 'poor';

/**
 * Core Web Vitals metric definition
 */
export interface WebVitalMetric {
  name: string;
  unit: string;
  good: number;
  needsImprovement: number;
}

/**
 * Core Web Vitals thresholds per Google guidelines
 * - LCP (Largest Contentful Paint): < 2.5s good, < 4.0s needs improvement
 * - FID (First Input Delay): < 100ms good, < 300ms needs improvement
 * - CLS (Cumulative Layout Shift): < 0.1 good, < 0.25 needs improvement
 */
export const CORE_WEB_VITALS: Record<string, WebVitalMetric> = {
  LCP: {
    name: 'Largest Contentful Paint',
    unit: 'ms',
    good: 2500,
    needsImprovement: 4000,
  },
  FID: {
    name: 'First Input Delay',
    unit: 'ms',
    good: 100,
    needsImprovement: 300,
  },
  CLS: {
    name: 'Cumulative Layout Shift',
    unit: '',
    good: 0.1,
    needsImprovement: 0.25,
  },
} as const;

/**
 * Image optimization configuration
 */
export interface ImageOptimizationConfig {
  quality: number;
  formats: readonly string[];
  deviceSizes: readonly number[];
  imageSizes: readonly number[];
}

/**
 * Default image quality (Next.js default is 75)
 */
export const DEFAULT_IMAGE_QUALITY = 75;

/**
 * Supported image formats for optimization
 */
export const IMAGE_FORMATS = ['image/avif', 'image/webp'] as const;

/**
 * Device sizes for responsive images (viewport widths)
 */
export const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920, 2048, 3840] as const;

/**
 * Image sizes for the sizes attribute
 */
export const IMAGE_SIZES = [16, 32, 48, 64, 96, 128, 256, 384] as const;

/**
 * Audio preload batch size
 */
export const PRELOAD_BATCH_SIZE = 5;

/**
 * Delay between audio preload batches in milliseconds
 */
export const AUDIO_PRELOAD_DELAY_MS = 100;

/**
 * Preload queue options
 */
export interface PreloadQueueOptions {
  batchSize: number;
  delayMs: number;
}

/**
 * Network information interface (from Network Information API)
 */
export interface NetworkInfo {
  effectiveType?: '2g' | '3g' | '4g' | 'slow-2g';
  saveData?: boolean;
}

/**
 * Check if LCP value is good (< 2.5s)
 */
export function isGoodLCP(value: number): boolean {
  return value < CORE_WEB_VITALS.LCP.good;
}

/**
 * Check if FID value is good (< 100ms)
 */
export function isGoodFID(value: number): boolean {
  return value < CORE_WEB_VITALS.FID.good;
}

/**
 * Check if CLS value is good (< 0.1)
 */
export function isGoodCLS(value: number): boolean {
  return value < CORE_WEB_VITALS.CLS.good;
}

/**
 * Get the rating for a Core Web Vital metric
 */
export function getWebVitalRating(
  metric: 'LCP' | 'FID' | 'CLS',
  value: number
): WebVitalRating {
  const thresholds = CORE_WEB_VITALS[metric];

  if (value < thresholds.good) {
    return 'good';
  }
  if (value < thresholds.needsImprovement) {
    return 'needs-improvement';
  }
  return 'poor';
}

/**
 * Get all Core Web Vitals ratings for a set of metrics
 */
export function getAllWebVitalRatings(metrics: {
  lcp: number;
  fid: number;
  cls: number;
}): { lcp: WebVitalRating; fid: WebVitalRating; cls: WebVitalRating } {
  return {
    lcp: getWebVitalRating('LCP', metrics.lcp),
    fid: getWebVitalRating('FID', metrics.fid),
    cls: getWebVitalRating('CLS', metrics.cls),
  };
}

/**
 * Check if all Core Web Vitals pass the good threshold
 */
export function passesWebVitals(metrics: {
  lcp: number;
  fid: number;
  cls: number;
}): boolean {
  return isGoodLCP(metrics.lcp) && isGoodFID(metrics.fid) && isGoodCLS(metrics.cls);
}

/**
 * Returns the image optimization configuration for Next.js
 */
export function getImageOptimizationConfig(): ImageOptimizationConfig {
  return {
    quality: DEFAULT_IMAGE_QUALITY,
    formats: IMAGE_FORMATS,
    deviceSizes: DEVICE_SIZES,
    imageSizes: IMAGE_SIZES,
  };
}

/**
 * Split URLs into batches for preloading
 */
export function createPreloadQueue(
  urls: string[],
  options: PreloadQueueOptions = {
    batchSize: PRELOAD_BATCH_SIZE,
    delayMs: AUDIO_PRELOAD_DELAY_MS,
  }
): string[][] {
  if (urls.length === 0) {
    return [];
  }

  const batches: string[][] = [];
  const { batchSize } = options;

  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  return batches;
}

/**
 * Check if audio preloading should happen based on network conditions
 * Returns false for slow connections or data saver mode
 */
export function shouldPreloadAudio(networkInfo?: NetworkInfo): boolean {
  if (!networkInfo) {
    // If no network info available, assume preloading is OK
    return true;
  }

  // Don't preload if data saver is enabled
  if (networkInfo.saveData) {
    return false;
  }

  // Don't preload on slow connections
  if (
    networkInfo.effectiveType === '2g' ||
    networkInfo.effectiveType === 'slow-2g'
  ) {
    return false;
  }

  return true;
}

/**
 * Get optimal preload batch size based on network conditions
 */
export function getOptimalBatchSize(networkInfo?: NetworkInfo): number {
  if (!networkInfo || !networkInfo.effectiveType) {
    return PRELOAD_BATCH_SIZE;
  }

  switch (networkInfo.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 1;
    case '3g':
      return 3;
    case '4g':
    default:
      return PRELOAD_BATCH_SIZE;
  }
}

/**
 * Calculate the preload delay based on network conditions
 */
export function getPreloadDelay(networkInfo?: NetworkInfo): number {
  if (!networkInfo || !networkInfo.effectiveType) {
    return AUDIO_PRELOAD_DELAY_MS;
  }

  switch (networkInfo.effectiveType) {
    case 'slow-2g':
      return 500;
    case '2g':
      return 300;
    case '3g':
      return 200;
    case '4g':
    default:
      return AUDIO_PRELOAD_DELAY_MS;
  }
}
