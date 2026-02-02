/**
 * User type definitions for NativePace
 * User profile and subscription information
 */

/** Available subscription tiers */
export type SubscriptionTier = 'free' | 'premium' | 'lifetime';

/** User profile information */
export interface UserProfile {
  /** Unique user identifier (from Supabase Auth) */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  displayName: string | null;
  /** User's native language */
  nativeLanguage: string | null;
  /** Current subscription tier */
  subscriptionTier: SubscriptionTier;
  /** When the subscription expires (null for lifetime) */
  subscriptionExpiresAt: Date | null;
  /** Current consecutive days streak */
  streakCurrent: number;
  /** Longest streak ever achieved */
  streakLongest: number;
  /** Date of last practice session */
  lastPracticeDate: Date | null;
  /** When the profile was created */
  createdAt: Date;
}
