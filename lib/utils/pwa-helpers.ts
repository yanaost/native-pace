/**
 * PWA Configuration Helpers
 *
 * Utilities for Progressive Web App configuration.
 */

/** Audio cache name used by service worker */
export const AUDIO_CACHE_NAME = 'audio-cache';

/** Maximum number of audio files to cache */
export const AUDIO_CACHE_MAX_ENTRIES = 200;

/** Maximum age for cached audio files (30 days in seconds) */
export const AUDIO_CACHE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

/** Runtime caching configuration for audio files */
export interface RuntimeCacheConfig {
  urlPattern: RegExp;
  handler: string;
  options: {
    cacheName: string;
    expiration: {
      maxEntries: number;
      maxAgeSeconds: number;
    };
  };
}

/** PWA configuration options */
export interface PWAConfig {
  dest: string;
  disable: boolean;
  runtimeCaching: RuntimeCacheConfig[];
}

/**
 * Returns the runtime caching configuration for audio files.
 * Uses CacheFirst strategy for optimal offline audio playback.
 */
export function getAudioCacheConfig(): RuntimeCacheConfig {
  return {
    urlPattern: /^https:\/\/.*\.mp3$/,
    handler: 'CacheFirst',
    options: {
      cacheName: AUDIO_CACHE_NAME,
      expiration: {
        maxEntries: AUDIO_CACHE_MAX_ENTRIES,
        maxAgeSeconds: AUDIO_CACHE_MAX_AGE_SECONDS,
      },
    },
  };
}

/**
 * Returns the full PWA configuration for next-pwa.
 *
 * @param isDev - Whether running in development mode
 * @returns PWA configuration object
 */
export function getPWAConfig(isDev: boolean): PWAConfig {
  return {
    dest: 'public',
    disable: isDev,
    runtimeCaching: [getAudioCacheConfig()],
  };
}
