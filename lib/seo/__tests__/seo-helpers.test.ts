import {
  SITE_NAME,
  DEFAULT_SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  PAGE_METADATA,
  SITEMAP_URLS,
  PROTECTED_PATHS,
  getSiteUrl,
  buildPageTitle,
  buildCanonicalUrl,
  buildOpenGraph,
  buildTwitterCard,
  buildRobotsDirective,
  buildRobotsMetadata,
  getPageMetadata,
  getSitemapUrls,
  isProtectedPath,
  buildPageMetadata,
} from '../seo-helpers';

describe('Constants', () => {
  it('should have SITE_NAME', () => {
    expect(SITE_NAME).toBe('NativePace');
  });

  it('should have DEFAULT_SITE_URL', () => {
    expect(DEFAULT_SITE_URL).toBe('https://nativepace.com');
  });

  it('should have DEFAULT_DESCRIPTION', () => {
    expect(DEFAULT_DESCRIPTION).toContain('native English');
    expect(DEFAULT_DESCRIPTION.length).toBeGreaterThan(50);
  });

  it('should have DEFAULT_KEYWORDS array', () => {
    expect(Array.isArray(DEFAULT_KEYWORDS)).toBe(true);
    expect(DEFAULT_KEYWORDS.length).toBeGreaterThan(5);
    expect(DEFAULT_KEYWORDS).toContain('English listening');
  });

  it('should have DEFAULT_OG_IMAGE configuration', () => {
    expect(DEFAULT_OG_IMAGE.url).toBe('/og-image.png');
    expect(DEFAULT_OG_IMAGE.width).toBe(1200);
    expect(DEFAULT_OG_IMAGE.height).toBe(630);
  });
});

describe('PAGE_METADATA', () => {
  it('should have home page metadata', () => {
    expect(PAGE_METADATA.home).toBeDefined();
    expect(PAGE_METADATA.home.title).toContain('Native English');
    expect(PAGE_METADATA.home.description).toBeTruthy();
  });

  it('should have pricing page metadata', () => {
    expect(PAGE_METADATA.pricing).toBeDefined();
    expect(PAGE_METADATA.pricing.title).toBe('Pricing');
  });

  it('should have login page metadata with noIndex', () => {
    expect(PAGE_METADATA.login).toBeDefined();
    expect(PAGE_METADATA.login.noIndex).toBe(true);
  });

  it('should have signup page metadata with noIndex', () => {
    expect(PAGE_METADATA.signup).toBeDefined();
    expect(PAGE_METADATA.signup.noIndex).toBe(true);
  });
});

describe('SITEMAP_URLS', () => {
  it('should include home page with highest priority', () => {
    const home = SITEMAP_URLS.find((url) => url.path === '/');
    expect(home).toBeDefined();
    expect(home?.priority).toBe(1.0);
  });

  it('should include pricing page', () => {
    const pricing = SITEMAP_URLS.find((url) => url.path === '/pricing');
    expect(pricing).toBeDefined();
  });

  it('should have valid priority values', () => {
    SITEMAP_URLS.forEach((url) => {
      expect(url.priority).toBeGreaterThanOrEqual(0);
      expect(url.priority).toBeLessThanOrEqual(1);
    });
  });
});

describe('PROTECTED_PATHS', () => {
  it('should include dashboard', () => {
    expect(PROTECTED_PATHS).toContain('/dashboard');
  });

  it('should include learn', () => {
    expect(PROTECTED_PATHS).toContain('/learn');
  });

  it('should include practice', () => {
    expect(PROTECTED_PATHS).toContain('/practice');
  });

  it('should include review', () => {
    expect(PROTECTED_PATHS).toContain('/review');
  });

  it('should include test-db', () => {
    expect(PROTECTED_PATHS).toContain('/test-db');
  });
});

describe('getSiteUrl', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default URL when env not set', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
  });

  it('should return env URL when set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.com';
    expect(getSiteUrl()).toBe('https://custom.com');
  });
});

describe('buildPageTitle', () => {
  it('should return site name only when no title provided', () => {
    expect(buildPageTitle()).toBe('NativePace');
    expect(buildPageTitle('')).toBe('NativePace');
  });

  it('should append site name to custom title', () => {
    expect(buildPageTitle('Pricing')).toBe('Pricing | NativePace');
  });

  it('should handle long titles', () => {
    const longTitle = 'This is a very long page title for testing';
    expect(buildPageTitle(longTitle)).toBe(`${longTitle} | NativePace`);
  });
});

describe('buildCanonicalUrl', () => {
  it('should build URL for root path', () => {
    expect(buildCanonicalUrl('/')).toBe('https://nativepace.com/');
  });

  it('should build URL for page path', () => {
    expect(buildCanonicalUrl('/pricing')).toBe('https://nativepace.com/pricing');
  });

  it('should add leading slash if missing', () => {
    expect(buildCanonicalUrl('pricing')).toBe('https://nativepace.com/pricing');
  });

  it('should remove trailing slash from path', () => {
    expect(buildCanonicalUrl('/pricing/')).toBe('https://nativepace.com/pricing');
  });

  it('should handle nested paths', () => {
    expect(buildCanonicalUrl('/learn/level-1')).toBe('https://nativepace.com/learn/level-1');
  });
});

describe('buildOpenGraph', () => {
  it('should build Open Graph metadata', () => {
    const og = buildOpenGraph({
      title: 'Test Page',
      description: 'Test description',
      path: '/test',
    });

    expect(og?.title).toBe('Test Page');
    expect(og?.description).toBe('Test description');
    expect(og?.url).toBe('https://nativepace.com/test');
    expect(og?.siteName).toBe('NativePace');
    expect(og?.locale).toBe('en_US');
    expect(og?.type).toBe('website');
  });

  it('should use default OG image when not provided', () => {
    const og = buildOpenGraph({
      title: 'Test',
      description: 'Test',
      path: '/',
    });

    expect(og?.images).toHaveLength(1);
    const image = og?.images?.[0];
    expect(image).toBeDefined();
    if (typeof image === 'object' && 'url' in image) {
      expect(image.url).toContain('og-image.png');
    }
  });

  it('should use custom OG image when provided', () => {
    const og = buildOpenGraph({
      title: 'Test',
      description: 'Test',
      path: '/',
      image: {
        url: '/custom-image.png',
        width: 800,
        height: 400,
        alt: 'Custom image',
      },
    });

    const image = og?.images?.[0];
    if (typeof image === 'object' && 'url' in image) {
      expect(image.url).toContain('custom-image.png');
      expect(image.width).toBe(800);
    }
  });
});

describe('buildTwitterCard', () => {
  it('should build Twitter card metadata', () => {
    const twitter = buildTwitterCard({
      title: 'Test Page',
      description: 'Test description',
      path: '/test',
    });

    expect(twitter?.card).toBe('summary_large_image');
    expect(twitter?.title).toBe('Test Page');
    expect(twitter?.description).toBe('Test description');
  });

  it('should include image', () => {
    const twitter = buildTwitterCard({
      title: 'Test',
      description: 'Test',
      path: '/',
    });

    expect(twitter?.images).toBeDefined();
    expect(twitter?.images?.length).toBeGreaterThan(0);
  });
});

describe('buildRobotsDirective', () => {
  it('should return index,follow by default', () => {
    expect(buildRobotsDirective({})).toBe('index, follow');
  });

  it('should return noindex when index is false', () => {
    expect(buildRobotsDirective({ index: false })).toBe('noindex, follow');
  });

  it('should return nofollow when follow is false', () => {
    expect(buildRobotsDirective({ follow: false })).toBe('index, nofollow');
  });

  it('should include noarchive when specified', () => {
    expect(buildRobotsDirective({ noarchive: true })).toBe('index, follow, noarchive');
  });

  it('should include multiple directives', () => {
    const result = buildRobotsDirective({
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
    });
    expect(result).toContain('noindex');
    expect(result).toContain('nofollow');
    expect(result).toContain('noarchive');
    expect(result).toContain('nosnippet');
  });
});

describe('buildRobotsMetadata', () => {
  it('should return metadata object with defaults', () => {
    const robots = buildRobotsMetadata({});

    expect(robots?.index).toBe(true);
    expect(robots?.follow).toBe(true);
  });

  it('should set noindex when index is false', () => {
    const robots = buildRobotsMetadata({ index: false });
    expect(robots?.index).toBe(false);
  });

  it('should include optional directives', () => {
    const robots = buildRobotsMetadata({
      noarchive: true,
      noimageindex: true,
    });
    expect(robots?.noarchive).toBe(true);
    expect(robots?.noimageindex).toBe(true);
  });
});

describe('getPageMetadata', () => {
  it('should return home page metadata', () => {
    const meta = getPageMetadata('home');
    expect(meta.title).toBeTruthy();
    expect(meta.description).toBeTruthy();
  });

  it('should return pricing page metadata', () => {
    const meta = getPageMetadata('pricing');
    expect(meta.title).toBe('Pricing');
  });

  it('should return login page metadata with noIndex', () => {
    const meta = getPageMetadata('login');
    expect(meta.noIndex).toBe(true);
  });
});

describe('getSitemapUrls', () => {
  it('should return array of sitemap entries', () => {
    const urls = getSitemapUrls();
    expect(Array.isArray(urls)).toBe(true);
    expect(urls.length).toBeGreaterThan(0);
  });

  it('should include full canonical URLs', () => {
    const urls = getSitemapUrls();
    urls.forEach((entry) => {
      expect(entry.url).toMatch(/^https:\/\//);
    });
  });

  it('should include lastModified dates', () => {
    const urls = getSitemapUrls();
    urls.forEach((entry) => {
      expect(entry.lastModified).toBeInstanceOf(Date);
    });
  });

  it('should include changeFrequency', () => {
    const urls = getSitemapUrls();
    const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
    urls.forEach((entry) => {
      expect(validFrequencies).toContain(entry.changeFrequency);
    });
  });

  it('should include priority', () => {
    const urls = getSitemapUrls();
    urls.forEach((entry) => {
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });
  });
});

describe('isProtectedPath', () => {
  it('should return true for exact protected paths', () => {
    expect(isProtectedPath('/dashboard')).toBe(true);
    expect(isProtectedPath('/learn')).toBe(true);
    expect(isProtectedPath('/practice')).toBe(true);
    expect(isProtectedPath('/review')).toBe(true);
  });

  it('should return true for nested protected paths', () => {
    expect(isProtectedPath('/dashboard/settings')).toBe(true);
    expect(isProtectedPath('/learn/level-1')).toBe(true);
    expect(isProtectedPath('/review/session')).toBe(true);
  });

  it('should return false for public paths', () => {
    expect(isProtectedPath('/')).toBe(false);
    expect(isProtectedPath('/pricing')).toBe(false);
    expect(isProtectedPath('/login')).toBe(false);
    expect(isProtectedPath('/signup')).toBe(false);
  });

  it('should return false for similar but not protected paths', () => {
    expect(isProtectedPath('/dashboard-public')).toBe(false);
    expect(isProtectedPath('/learning')).toBe(false);
  });
});

describe('buildPageMetadata', () => {
  it('should build complete metadata for home page', () => {
    const metadata = buildPageMetadata('home', '/');

    expect(metadata.title).toContain('NativePace');
    expect(metadata.description).toBeTruthy();
    expect(metadata.keywords).toBeDefined();
    expect(metadata.alternates?.canonical).toBe('https://nativepace.com/');
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.twitter).toBeDefined();
  });

  it('should build metadata for pricing page', () => {
    const metadata = buildPageMetadata('pricing', '/pricing');

    expect(metadata.title).toContain('Pricing');
    expect(metadata.alternates?.canonical).toBe('https://nativepace.com/pricing');
  });

  it('should include noindex robots for auth pages', () => {
    const loginMeta = buildPageMetadata('login', '/login');
    expect(loginMeta.robots).toBeDefined();
    if (typeof loginMeta.robots === 'object') {
      expect(loginMeta.robots.index).toBe(false);
    }
  });

  it('should allow overrides', () => {
    const metadata = buildPageMetadata('home', '/', {
      description: 'Custom description',
    });

    expect(metadata.description).toBe('Custom description');
  });

  it('should merge keywords with defaults', () => {
    const metadata = buildPageMetadata('home', '/');

    expect(Array.isArray(metadata.keywords)).toBe(true);
    expect(metadata.keywords?.length).toBeGreaterThan(DEFAULT_KEYWORDS.length);
  });
});

describe('Integration', () => {
  it('should generate consistent metadata across functions', () => {
    const path = '/pricing';
    const config = getPageMetadata('pricing');

    const canonical = buildCanonicalUrl(path);
    const og = buildOpenGraph({
      title: config.title,
      description: config.description,
      path,
    });

    expect(canonical).toBe(og?.url);
  });

  it('should handle all sitemap URLs correctly', () => {
    const urls = getSitemapUrls();

    urls.forEach((entry) => {
      // Each URL should be a valid canonical URL
      expect(entry.url).toMatch(/^https:\/\/nativepace\.com/);
      // Priority should be valid
      expect(entry.priority).toBeGreaterThanOrEqual(0);
      expect(entry.priority).toBeLessThanOrEqual(1);
    });
  });

  it('should not include protected paths in sitemap', () => {
    const urls = getSitemapUrls();

    urls.forEach((entry) => {
      const path = entry.url.replace('https://nativepace.com', '');
      expect(isProtectedPath(path)).toBe(false);
    });
  });
});
