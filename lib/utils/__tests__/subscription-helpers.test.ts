import {
  PREMIUM_LEVEL_PATHS,
  PROTECTED_PATHS,
  isPremiumPath,
  isProtectedPath,
  isPremiumSubscription,
  getLoginRedirectUrl,
  getPricingRedirectUrl,
  extractLevelFromPath,
  isLevelPremium,
} from '../subscription-helpers';

describe('PREMIUM_LEVEL_PATHS', () => {
  it('should include levels 3-6', () => {
    expect(PREMIUM_LEVEL_PATHS).toContain('/learn/3');
    expect(PREMIUM_LEVEL_PATHS).toContain('/learn/4');
    expect(PREMIUM_LEVEL_PATHS).toContain('/learn/5');
    expect(PREMIUM_LEVEL_PATHS).toContain('/learn/6');
  });

  it('should have 4 paths', () => {
    expect(PREMIUM_LEVEL_PATHS).toHaveLength(4);
  });
});

describe('PROTECTED_PATHS', () => {
  it('should include main protected routes', () => {
    expect(PROTECTED_PATHS).toContain('/dashboard');
    expect(PROTECTED_PATHS).toContain('/learn');
    expect(PROTECTED_PATHS).toContain('/review');
    expect(PROTECTED_PATHS).toContain('/practice');
  });
});

describe('isPremiumPath', () => {
  it('should return true for level 3', () => {
    expect(isPremiumPath('/learn/3')).toBe(true);
  });

  it('should return true for level 4', () => {
    expect(isPremiumPath('/learn/4')).toBe(true);
  });

  it('should return true for level 5', () => {
    expect(isPremiumPath('/learn/5')).toBe(true);
  });

  it('should return true for level 6', () => {
    expect(isPremiumPath('/learn/6')).toBe(true);
  });

  it('should return true for subpaths of premium levels', () => {
    expect(isPremiumPath('/learn/3/pattern/1')).toBe(true);
    expect(isPremiumPath('/learn/4/exercise')).toBe(true);
  });

  it('should return false for level 1', () => {
    expect(isPremiumPath('/learn/1')).toBe(false);
  });

  it('should return false for level 2', () => {
    expect(isPremiumPath('/learn/2')).toBe(false);
  });

  it('should return false for /learn without level', () => {
    expect(isPremiumPath('/learn')).toBe(false);
  });

  it('should return false for dashboard', () => {
    expect(isPremiumPath('/dashboard')).toBe(false);
  });

  it('should return false for home', () => {
    expect(isPremiumPath('/')).toBe(false);
  });
});

describe('isProtectedPath', () => {
  it('should return true for dashboard', () => {
    expect(isProtectedPath('/dashboard')).toBe(true);
  });

  it('should return true for learn', () => {
    expect(isProtectedPath('/learn')).toBe(true);
    expect(isProtectedPath('/learn/1')).toBe(true);
  });

  it('should return true for review', () => {
    expect(isProtectedPath('/review')).toBe(true);
  });

  it('should return true for practice', () => {
    expect(isProtectedPath('/practice')).toBe(true);
  });

  it('should return false for home', () => {
    expect(isProtectedPath('/')).toBe(false);
  });

  it('should return false for login', () => {
    expect(isProtectedPath('/login')).toBe(false);
  });

  it('should return false for signup', () => {
    expect(isProtectedPath('/signup')).toBe(false);
  });

  it('should return false for pricing', () => {
    expect(isProtectedPath('/pricing')).toBe(false);
  });
});

describe('isPremiumSubscription', () => {
  const now = new Date('2024-01-15T12:00:00Z');
  const future = '2024-02-15T12:00:00Z';
  const past = '2024-01-01T12:00:00Z';

  it('should return false for null tier', () => {
    expect(isPremiumSubscription(null, null, now)).toBe(false);
  });

  it('should return false for undefined tier', () => {
    expect(isPremiumSubscription(undefined, null, now)).toBe(false);
  });

  it('should return false for free tier', () => {
    expect(isPremiumSubscription('free', null, now)).toBe(false);
  });

  it('should return true for lifetime tier', () => {
    expect(isPremiumSubscription('lifetime', null, now)).toBe(true);
  });

  it('should return true for lifetime even with expiration', () => {
    expect(isPremiumSubscription('lifetime', past, now)).toBe(true);
  });

  it('should return true for premium with future expiration', () => {
    expect(isPremiumSubscription('premium', future, now)).toBe(true);
  });

  it('should return false for premium with past expiration', () => {
    expect(isPremiumSubscription('premium', past, now)).toBe(false);
  });

  it('should return true for premium with no expiration', () => {
    expect(isPremiumSubscription('premium', null, now)).toBe(true);
  });

  it('should return true for premium with undefined expiration', () => {
    expect(isPremiumSubscription('premium', undefined, now)).toBe(true);
  });
});

describe('getLoginRedirectUrl', () => {
  it('should include returnTo parameter', () => {
    const url = getLoginRedirectUrl('/dashboard');
    expect(url).toBe('/login?returnTo=%2Fdashboard');
  });

  it('should encode complex paths', () => {
    const url = getLoginRedirectUrl('/learn/3/pattern?id=123');
    expect(url).toContain('/login?returnTo=');
    expect(url).toContain(encodeURIComponent('/learn/3/pattern?id=123'));
  });
});

describe('getPricingRedirectUrl', () => {
  it('should include returnTo parameter', () => {
    const url = getPricingRedirectUrl('/learn/3');
    expect(url).toBe('/pricing?returnTo=%2Flearn%2F3');
  });

  it('should encode complex paths', () => {
    const url = getPricingRedirectUrl('/learn/4/exercise');
    expect(url).toContain('/pricing?returnTo=');
    expect(url).toContain(encodeURIComponent('/learn/4/exercise'));
  });
});

describe('extractLevelFromPath', () => {
  it('should extract level 1', () => {
    expect(extractLevelFromPath('/learn/1')).toBe(1);
  });

  it('should extract level 6', () => {
    expect(extractLevelFromPath('/learn/6')).toBe(6);
  });

  it('should extract level from subpath', () => {
    expect(extractLevelFromPath('/learn/3/pattern/1')).toBe(3);
  });

  it('should return null for /learn without level', () => {
    expect(extractLevelFromPath('/learn')).toBeNull();
  });

  it('should return null for non-learn paths', () => {
    expect(extractLevelFromPath('/dashboard')).toBeNull();
    expect(extractLevelFromPath('/')).toBeNull();
  });

  it('should return null for invalid level format', () => {
    expect(extractLevelFromPath('/learn/abc')).toBeNull();
  });
});

describe('isLevelPremium', () => {
  it('should return false for level 1', () => {
    expect(isLevelPremium(1)).toBe(false);
  });

  it('should return false for level 2', () => {
    expect(isLevelPremium(2)).toBe(false);
  });

  it('should return true for level 3', () => {
    expect(isLevelPremium(3)).toBe(true);
  });

  it('should return true for level 4', () => {
    expect(isLevelPremium(4)).toBe(true);
  });

  it('should return true for level 5', () => {
    expect(isLevelPremium(5)).toBe(true);
  });

  it('should return true for level 6', () => {
    expect(isLevelPremium(6)).toBe(true);
  });

  it('should return false for level 0', () => {
    expect(isLevelPremium(0)).toBe(false);
  });

  it('should return false for level 7', () => {
    expect(isLevelPremium(7)).toBe(false);
  });
});
