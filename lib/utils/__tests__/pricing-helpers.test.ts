import {
  FREE_TIER,
  PREMIUM_TIER,
  FREE_TIER_FEATURES,
  PREMIUM_TIER_FEATURES,
  PRICING_TIERS,
  getPricingTiers,
  getFreeTierFeatures,
  getPremiumTierFeatures,
  getTierById,
  formatPriceDisplay,
} from '../pricing-helpers';

describe('FREE_TIER', () => {
  it('should have id "free"', () => {
    expect(FREE_TIER.id).toBe('free');
  });

  it('should have name "Free"', () => {
    expect(FREE_TIER.name).toBe('Free');
  });

  it('should have price "$0"', () => {
    expect(FREE_TIER.price).toBe('$0');
  });

  it('should not have a period', () => {
    expect(FREE_TIER.period).toBeUndefined();
  });

  it('should not be highlighted', () => {
    expect(FREE_TIER.highlighted).toBe(false);
  });

  it('should have features array', () => {
    expect(Array.isArray(FREE_TIER.features)).toBe(true);
    expect(FREE_TIER.features.length).toBeGreaterThan(0);
  });

  it('should have cta and ctaHref', () => {
    expect(FREE_TIER.cta).toBeDefined();
    expect(FREE_TIER.ctaHref).toBe('/signup');
  });
});

describe('PREMIUM_TIER', () => {
  it('should have id "premium"', () => {
    expect(PREMIUM_TIER.id).toBe('premium');
  });

  it('should have name "Premium"', () => {
    expect(PREMIUM_TIER.name).toBe('Premium');
  });

  it('should have a price', () => {
    expect(PREMIUM_TIER.price).toMatch(/^\$\d+\.\d{2}$/);
  });

  it('should have period "/month"', () => {
    expect(PREMIUM_TIER.period).toBe('/month');
  });

  it('should be highlighted', () => {
    expect(PREMIUM_TIER.highlighted).toBe(true);
  });

  it('should have more features than free tier', () => {
    expect(PREMIUM_TIER.features.length).toBeGreaterThan(FREE_TIER.features.length);
  });

  it('should have cta and ctaHref', () => {
    expect(PREMIUM_TIER.cta).toBeDefined();
    expect(PREMIUM_TIER.ctaHref).toContain('/signup');
  });
});

describe('FREE_TIER_FEATURES', () => {
  it('should have at least 3 features', () => {
    expect(FREE_TIER_FEATURES.length).toBeGreaterThanOrEqual(3);
  });

  it('should all be non-empty strings', () => {
    for (const feature of FREE_TIER_FEATURES) {
      expect(typeof feature).toBe('string');
      expect(feature.length).toBeGreaterThan(0);
    }
  });

  it('should mention patterns', () => {
    const hasPatterns = FREE_TIER_FEATURES.some((f) => f.toLowerCase().includes('pattern'));
    expect(hasPatterns).toBe(true);
  });
});

describe('PREMIUM_TIER_FEATURES', () => {
  it('should have at least 5 features', () => {
    expect(PREMIUM_TIER_FEATURES.length).toBeGreaterThanOrEqual(5);
  });

  it('should all be non-empty strings', () => {
    for (const feature of PREMIUM_TIER_FEATURES) {
      expect(typeof feature).toBe('string');
      expect(feature.length).toBeGreaterThan(0);
    }
  });

  it('should mention all patterns', () => {
    const hasAllPatterns = PREMIUM_TIER_FEATURES.some(
      (f) => f.toLowerCase().includes('all') && f.toLowerCase().includes('pattern')
    );
    expect(hasAllPatterns).toBe(true);
  });
});

describe('PRICING_TIERS', () => {
  it('should have 2 tiers', () => {
    expect(PRICING_TIERS).toHaveLength(2);
  });

  it('should include free tier first', () => {
    expect(PRICING_TIERS[0].id).toBe('free');
  });

  it('should include premium tier second', () => {
    expect(PRICING_TIERS[1].id).toBe('premium');
  });
});

describe('getPricingTiers', () => {
  it('should return PRICING_TIERS', () => {
    expect(getPricingTiers()).toBe(PRICING_TIERS);
  });

  it('should return 2 tiers', () => {
    expect(getPricingTiers()).toHaveLength(2);
  });
});

describe('getFreeTierFeatures', () => {
  it('should return FREE_TIER_FEATURES', () => {
    expect(getFreeTierFeatures()).toBe(FREE_TIER_FEATURES);
  });
});

describe('getPremiumTierFeatures', () => {
  it('should return PREMIUM_TIER_FEATURES', () => {
    expect(getPremiumTierFeatures()).toBe(PREMIUM_TIER_FEATURES);
  });
});

describe('getTierById', () => {
  it('should return free tier for "free"', () => {
    expect(getTierById('free')).toBe(FREE_TIER);
  });

  it('should return premium tier for "premium"', () => {
    expect(getTierById('premium')).toBe(PREMIUM_TIER);
  });

  it('should return undefined for unknown id', () => {
    expect(getTierById('unknown')).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(getTierById('')).toBeUndefined();
  });
});

describe('formatPriceDisplay', () => {
  it('should format free tier as "$0"', () => {
    expect(formatPriceDisplay(FREE_TIER)).toBe('$0');
  });

  it('should format premium tier with period', () => {
    expect(formatPriceDisplay(PREMIUM_TIER)).toBe('$3.99/month');
  });

  it('should handle tier without period', () => {
    const tierWithoutPeriod = { ...FREE_TIER, price: '$10' };
    expect(formatPriceDisplay(tierWithoutPeriod)).toBe('$10');
  });

  it('should concatenate price and period', () => {
    const customTier = { ...PREMIUM_TIER, price: '$5', period: '/year' };
    expect(formatPriceDisplay(customTier)).toBe('$5/year');
  });
});
