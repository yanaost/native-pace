/**
 * PostHog Analytics Integration
 *
 * Analytics tracking for user behavior and product insights.
 * Disabled in development mode.
 */

import posthog from 'posthog-js';
import {
  isAnalyticsEnabled,
  shouldDisableCapturing,
  getPostHogConfig,
  validateEventName,
  sanitizeProperties,
  type EventProperties,
  type UserTraits,
} from './analytics-helpers';

/** Whether PostHog has been initialized */
let isInitialized = false;

/**
 * Initialize PostHog analytics.
 * Only initializes in browser environment.
 * Disables capturing in development mode.
 */
export function initAnalytics(): void {
  if (!isAnalyticsEnabled()) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!apiKey) {
    console.warn('PostHog API key not configured');
    return;
  }

  if (isInitialized) {
    return;
  }

  const config = getPostHogConfig(apiKey);

  posthog.init(apiKey, {
    ...config,
    loaded: (ph) => {
      if (shouldDisableCapturing()) {
        ph.opt_out_capturing();
      }
    },
  });

  isInitialized = true;
}

/**
 * Track a custom event.
 *
 * @param event - Event name
 * @param properties - Optional event properties
 */
export function trackEvent(event: string, properties?: EventProperties): void {
  if (!validateEventName(event)) {
    console.warn('Invalid event name:', event);
    return;
  }

  if (!isAnalyticsEnabled() || !isInitialized) {
    return;
  }

  const sanitized = sanitizeProperties(properties);
  posthog.capture(event, sanitized);
}

/**
 * Identify a user with their ID and optional traits.
 *
 * @param userId - User's unique identifier
 * @param traits - Optional user traits/properties
 */
export function identifyUser(userId: string, traits?: UserTraits): void {
  if (!userId) {
    console.warn('User ID required for identification');
    return;
  }

  if (!isAnalyticsEnabled() || !isInitialized) {
    return;
  }

  const sanitized = sanitizeProperties(traits);
  posthog.identify(userId, sanitized);
}

/**
 * Reset analytics state (e.g., on logout).
 * Clears user identification and generates new anonymous ID.
 */
export function resetAnalytics(): void {
  if (!isAnalyticsEnabled() || !isInitialized) {
    return;
  }

  posthog.reset();
}

/**
 * Check if analytics is currently initialized.
 * Useful for testing and conditional logic.
 */
export function isAnalyticsInitialized(): boolean {
  return isInitialized;
}

/**
 * Reset initialization state (for testing only).
 * @internal
 */
export function _resetInitState(): void {
  isInitialized = false;
}
