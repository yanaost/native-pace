/**
 * Subscription Helpers
 *
 * Utility functions for subscription validation and premium gating.
 */

import type { SubscriptionTier } from '@/types/user';

/** Paths that require premium subscription */
export const PREMIUM_LEVEL_PATHS = ['/learn/3', '/learn/4', '/learn/5', '/learn/6'];

/** Paths that require authentication */
export const PROTECTED_PATHS = ['/dashboard', '/learn', '/review', '/practice', '/settings'];

/**
 * Checks if a pathname requires premium subscription.
 *
 * @param pathname - URL pathname
 * @returns True if path requires premium
 */
export function isPremiumPath(pathname: string): boolean {
  return PREMIUM_LEVEL_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Checks if a pathname requires authentication.
 *
 * @param pathname - URL pathname
 * @returns True if path requires auth
 */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some((path) => pathname.startsWith(path));
}

/**
 * Checks if a subscription is currently active and premium.
 *
 * @param tier - Subscription tier
 * @param expiresAt - Expiration timestamp or null
 * @param currentDate - Current date for comparison (defaults to now)
 * @returns True if subscription is active premium or lifetime
 */
export function isPremiumSubscription(
  tier: SubscriptionTier | null | undefined,
  expiresAt: string | null | undefined,
  currentDate: Date = new Date()
): boolean {
  // No tier or free tier
  if (!tier || tier === 'free') {
    return false;
  }

  // Lifetime never expires
  if (tier === 'lifetime') {
    return true;
  }

  // Premium needs valid expiration
  if (tier === 'premium') {
    if (!expiresAt) {
      // No expiration set, assume active
      return true;
    }
    return new Date(expiresAt) > currentDate;
  }

  return false;
}

/**
 * Gets the redirect URL for unauthenticated users.
 *
 * @param pathname - Current pathname
 * @returns Login URL with return path
 */
export function getLoginRedirectUrl(pathname: string): string {
  const encodedPath = encodeURIComponent(pathname);
  return `/login?returnTo=${encodedPath}`;
}

/**
 * Gets the redirect URL for non-premium users trying to access premium content.
 *
 * @param pathname - Current pathname attempting to access
 * @returns Pricing URL with return path
 */
export function getPricingRedirectUrl(pathname: string): string {
  const encodedPath = encodeURIComponent(pathname);
  return `/pricing?returnTo=${encodedPath}`;
}

/**
 * Extracts the level number from a learn path.
 *
 * @param pathname - URL pathname (e.g., '/learn/3')
 * @returns Level number or null if not a learn path
 */
export function extractLevelFromPath(pathname: string): number | null {
  const match = pathname.match(/^\/learn\/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Checks if a specific level requires premium.
 *
 * @param level - Level number (1-6)
 * @returns True if level requires premium (3-6)
 */
export function isLevelPremium(level: number): boolean {
  return level >= 3 && level <= 6;
}
