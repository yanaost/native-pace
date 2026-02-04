// lib/utils/audio-helpers.ts

import { createLogger } from './logger';

const logger = createLogger('audio-helpers');

/**
 * Preloads audio from a URL and returns the HTMLAudioElement when ready to play.
 */
export function preloadAudio(url: string): Promise<HTMLAudioElement> {
  logger.debug('preloadAudio called', { url });

  return new Promise((resolve, reject) => {
    const audio = new Audio();

    const handleCanPlayThrough = () => {
      cleanup();
      logger.info('Audio preloaded successfully', { url, duration: audio.duration });
      resolve(audio);
    };

    const handleError = () => {
      cleanup();
      const errorMessage = `Failed to load audio from URL: ${url}`;
      logger.error(errorMessage, audio.error, { url });
      reject(new Error(errorMessage));
    };

    const cleanup = () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('error', handleError);
    };

    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('error', handleError);

    audio.src = url;
    audio.load();
  });
}

/**
 * Returns the duration of an audio element in seconds.
 * Returns 0 if duration is not available (NaN or Infinity).
 */
export function getAudioDuration(audio: HTMLAudioElement): number {
  const duration = audio.duration;

  logger.debug('getAudioDuration called', { duration });

  if (Number.isNaN(duration) || !Number.isFinite(duration)) {
    logger.warn('Audio duration not available', { duration });
    return 0;
  }

  return duration;
}

/**
 * Formats seconds as "M:SS" (e.g., "1:30", "0:05").
 * Handles edge cases: negative numbers, NaN, Infinity all return "0:00".
 */
export function formatTime(seconds: number): string {
  logger.debug('formatTime called', { seconds });

  if (Number.isNaN(seconds) || !Number.isFinite(seconds) || seconds < 0) {
    logger.debug('formatTime returning default for invalid input', { seconds });
    return '0:00';
  }

  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  const formatted = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  logger.debug('formatTime result', { seconds, formatted });

  return formatted;
}
