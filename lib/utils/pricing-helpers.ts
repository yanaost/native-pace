/**
 * Pricing Helpers
 *
 * Constants and utility functions for pricing display.
 */

/** Pricing tier definition */
export interface PricingTier {
  id: string;
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  highlighted?: boolean;
}

/** Free tier features */
export const FREE_TIER_FEATURES: string[] = [
  'Access to Level 1 & 2 (50 patterns)',
  'Audio comparison exercises',
  'Basic progress tracking',
  'Spaced repetition reviews',
];

/** Premium tier features */
export const PREMIUM_TIER_FEATURES: string[] = [
  'All 185 connected speech patterns',
  'All 6 learning levels',
  'Dictation challenges',
  'Speed training exercises',
  'Detailed analytics',
  'Priority support',
];

/** Free tier definition */
export const FREE_TIER: PricingTier = {
  id: 'free',
  name: 'Free',
  price: '$0',
  description: 'Get started with the basics',
  features: FREE_TIER_FEATURES,
  cta: 'Get Started',
  ctaHref: '/signup',
  highlighted: false,
};

/** Premium tier definition */
export const PREMIUM_TIER: PricingTier = {
  id: 'premium',
  name: 'Premium',
  price: '$3.99',
  period: '/month',
  description: 'Unlock your full potential',
  features: PREMIUM_TIER_FEATURES,
  cta: 'Start Free Trial',
  ctaHref: '/signup?plan=premium',
  highlighted: true,
};

/** All pricing tiers */
export const PRICING_TIERS: PricingTier[] = [FREE_TIER, PREMIUM_TIER];

/**
 * Gets all pricing tiers.
 *
 * @returns Array of pricing tiers
 */
export function getPricingTiers(): PricingTier[] {
  return PRICING_TIERS;
}

/**
 * Gets free tier features.
 *
 * @returns Array of free tier feature strings
 */
export function getFreeTierFeatures(): string[] {
  return FREE_TIER_FEATURES;
}

/**
 * Gets premium tier features.
 *
 * @returns Array of premium tier feature strings
 */
export function getPremiumTierFeatures(): string[] {
  return PREMIUM_TIER_FEATURES;
}

/**
 * Gets a specific tier by ID.
 *
 * @param tierId - Tier ID ('free' or 'premium')
 * @returns Pricing tier or undefined
 */
export function getTierById(tierId: string): PricingTier | undefined {
  return PRICING_TIERS.find((tier) => tier.id === tierId);
}

/**
 * Formats the price display string.
 *
 * @param tier - Pricing tier
 * @returns Formatted price string (e.g., "$3.99/month")
 */
export function formatPriceDisplay(tier: PricingTier): string {
  if (tier.period) {
    return `${tier.price}${tier.period}`;
  }
  return tier.price;
}
