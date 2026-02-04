/**
 * Analytics Helpers
 *
 * Pure utility functions for analytics configuration.
 * These are testable without the PostHog dependency.
 */

/** PostHog API host */
export const POSTHOG_API_HOST = 'https://app.posthog.com';

/** PostHog configuration options */
export interface PostHogConfig {
  api_host: string;
  loaded?: (posthog: unknown) => void;
  autocapture?: boolean;
  capture_pageview?: boolean;
}

/** Event properties type */
export type EventProperties = Record<string, unknown>;

/** User traits type */
export type UserTraits = Record<string, unknown>;

/**
 * Checks if analytics should be enabled.
 * Analytics is only enabled in browser environment.
 *
 * @returns True if analytics can be initialized
 */
export function isAnalyticsEnabled(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Checks if event capturing should be disabled.
 * Capturing is disabled in development mode.
 *
 * @param nodeEnv - NODE_ENV value (defaults to process.env.NODE_ENV)
 * @returns True if capturing should be disabled
 */
export function shouldDisableCapturing(nodeEnv?: string): boolean {
  const env = nodeEnv ?? process.env.NODE_ENV;
  return env === 'development';
}

/**
 * Returns PostHog configuration object.
 *
 * @param apiKey - PostHog API key
 * @param nodeEnv - NODE_ENV value for determining capture settings
 * @returns PostHog configuration
 */
export function getPostHogConfig(apiKey: string, nodeEnv?: string): PostHogConfig {
  return {
    api_host: POSTHOG_API_HOST,
    autocapture: !shouldDisableCapturing(nodeEnv),
    capture_pageview: !shouldDisableCapturing(nodeEnv),
  };
}

/**
 * Validates an event name.
 * Event names should be non-empty strings.
 *
 * @param event - Event name to validate
 * @returns True if event name is valid
 */
export function validateEventName(event: unknown): event is string {
  return typeof event === 'string' && event.length > 0;
}

/**
 * Sanitizes event properties by removing undefined values.
 *
 * @param properties - Properties to sanitize
 * @returns Sanitized properties object
 */
export function sanitizeProperties(
  properties: EventProperties | null | undefined
): EventProperties {
  if (!properties) {
    return {};
  }

  const sanitized: EventProperties = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Creates a timestamped event properties object.
 *
 * @param properties - Original properties
 * @returns Properties with timestamp added
 */
export function addTimestamp(properties: EventProperties = {}): EventProperties {
  return {
    ...sanitizeProperties(properties),
    timestamp: new Date().toISOString(),
  };
}
