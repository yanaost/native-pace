/**
 * SEO Helpers
 *
 * Utility functions for building SEO metadata, robots directives,
 * and sitemap URLs. Pure functions that can be unit tested.
 */

import type { Metadata } from 'next';

/**
 * Site name used in titles
 */
export const SITE_NAME = 'NativePace';

/**
 * Default site URL (should be overridden by env variable in production)
 */
export const DEFAULT_SITE_URL = 'https://nativepace.com';

/**
 * Get site URL from environment or use default
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
}

/**
 * Default meta description
 */
export const DEFAULT_DESCRIPTION =
  'Learn to understand fast native English speech. Master the 185 connected speech patterns that textbooks never teach.';

/**
 * Default keywords for SEO
 */
export const DEFAULT_KEYWORDS: readonly string[] = [
  'English listening',
  'connected speech',
  'native English',
  'understand native speakers',
  'English pronunciation',
  'English learning',
  'ESL',
  'IELTS listening',
  'TOEFL listening',
  'English reductions',
  'English contractions',
] as const;

/**
 * Open Graph image configuration
 */
export const DEFAULT_OG_IMAGE = {
  url: '/og-image.png',
  width: 1200,
  height: 630,
  alt: 'NativePace - Understand Native English Speakers',
};

/**
 * Known pages with predefined metadata
 */
export type PageKey = 'home' | 'pricing' | 'login' | 'signup';

/**
 * Page metadata configuration
 */
export interface PageMetadataConfig {
  title: string;
  description: string;
  keywords?: string[];
  noIndex?: boolean;
}

/**
 * Predefined metadata for known pages
 */
export const PAGE_METADATA: Record<PageKey, PageMetadataConfig> = {
  home: {
    title: 'Understand Native English Speakers',
    description:
      'Finally understand fast native English speech. Learn the 185 connected speech patterns that make "What do you want to do?" sound like "Whaddya wanna do?"',
    keywords: [
      'understand native English',
      'English listening practice',
      'connected speech patterns',
    ],
  },
  pricing: {
    title: 'Pricing',
    description:
      'Get access to all 185 connected speech patterns. Start free with 50 patterns, upgrade for full access.',
    keywords: ['English course pricing', 'English learning subscription'],
  },
  login: {
    title: 'Log In',
    description: 'Log in to your NativePace account to continue learning.',
    noIndex: true,
  },
  signup: {
    title: 'Sign Up',
    description: 'Create a free NativePace account and start understanding native English speakers.',
    noIndex: true,
  },
};

/**
 * Builds a page title with the site name suffix.
 */
export function buildPageTitle(title?: string): string {
  if (!title) {
    return SITE_NAME;
  }
  return `${title} | ${SITE_NAME}`;
}

/**
 * Builds a full canonical URL from a path.
 */
export function buildCanonicalUrl(path: string): string {
  const baseUrl = getSiteUrl();
  // Remove trailing slash from base URL
  const cleanBase = baseUrl.replace(/\/$/, '');
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Remove trailing slash from path (except for root)
  const finalPath = cleanPath === '/' ? cleanPath : cleanPath.replace(/\/$/, '');
  return `${cleanBase}${finalPath}`;
}

/**
 * Open Graph data for building metadata
 */
export interface OpenGraphInput {
  title: string;
  description: string;
  path: string;
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
}

/**
 * Builds Open Graph metadata object.
 */
export function buildOpenGraph(data: OpenGraphInput): Metadata['openGraph'] {
  const url = buildCanonicalUrl(data.path);
  const image = data.image || DEFAULT_OG_IMAGE;
  const imageUrl = image.url.startsWith('http') ? image.url : buildCanonicalUrl(image.url);

  return {
    title: data.title,
    description: data.description,
    url,
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: imageUrl,
        width: image.width,
        height: image.height,
        alt: image.alt,
      },
    ],
  };
}

/**
 * Twitter card metadata
 */
export function buildTwitterCard(data: OpenGraphInput): Metadata['twitter'] {
  const image = data.image || DEFAULT_OG_IMAGE;
  const imageUrl = image.url.startsWith('http') ? image.url : buildCanonicalUrl(image.url);

  return {
    card: 'summary_large_image',
    title: data.title,
    description: data.description,
    images: [imageUrl],
  };
}

/**
 * Robots directive configuration
 */
export interface RobotsConfig {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
}

/**
 * Builds robots meta content string.
 */
export function buildRobotsDirective(config: RobotsConfig): string {
  const directives: string[] = [];

  if (config.index === false) {
    directives.push('noindex');
  } else {
    directives.push('index');
  }

  if (config.follow === false) {
    directives.push('nofollow');
  } else {
    directives.push('follow');
  }

  if (config.noarchive) {
    directives.push('noarchive');
  }

  if (config.nosnippet) {
    directives.push('nosnippet');
  }

  if (config.noimageindex) {
    directives.push('noimageindex');
  }

  return directives.join(', ');
}

/**
 * Builds robots metadata object for Next.js.
 */
export function buildRobotsMetadata(config: RobotsConfig): Metadata['robots'] {
  return {
    index: config.index !== false,
    follow: config.follow !== false,
    noarchive: config.noarchive,
    nosnippet: config.nosnippet,
    noimageindex: config.noimageindex,
  };
}

/**
 * Gets predefined metadata for a known page.
 */
export function getPageMetadata(page: PageKey): PageMetadataConfig {
  return PAGE_METADATA[page];
}

/**
 * Sitemap URL entry
 */
export interface SitemapUrl {
  path: string;
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

/**
 * Public URLs for the sitemap
 */
export const SITEMAP_URLS: readonly SitemapUrl[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/login', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/signup', changeFrequency: 'yearly', priority: 0.5 },
] as const;

/**
 * Gets sitemap URLs with full canonical URLs.
 */
export function getSitemapUrls(): Array<{
  url: string;
  lastModified: Date;
  changeFrequency: SitemapUrl['changeFrequency'];
  priority: number;
}> {
  const now = new Date();

  return SITEMAP_URLS.map((entry) => ({
    url: buildCanonicalUrl(entry.path),
    lastModified: now,
    changeFrequency: entry.changeFrequency,
    priority: entry.priority,
  }));
}

/**
 * Protected paths that should be excluded from indexing
 */
export const PROTECTED_PATHS: readonly string[] = [
  '/dashboard',
  '/learn',
  '/practice',
  '/review',
  '/test-db',
] as const;

/**
 * Checks if a path should be excluded from indexing.
 */
export function isProtectedPath(path: string): boolean {
  return PROTECTED_PATHS.some(
    (protectedPath) => path === protectedPath || path.startsWith(`${protectedPath}/`)
  );
}

/**
 * Builds complete page metadata for Next.js.
 */
export function buildPageMetadata(
  page: PageKey,
  path: string,
  overrides?: Partial<PageMetadataConfig>
): Metadata {
  const config = { ...getPageMetadata(page), ...overrides };
  const title = buildPageTitle(config.title);
  const canonicalUrl = buildCanonicalUrl(path);

  const metadata: Metadata = {
    title,
    description: config.description,
    keywords: [...DEFAULT_KEYWORDS, ...(config.keywords || [])],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: buildOpenGraph({
      title: config.title,
      description: config.description,
      path,
    }),
    twitter: buildTwitterCard({
      title: config.title,
      description: config.description,
      path,
    }),
  };

  if (config.noIndex) {
    metadata.robots = buildRobotsMetadata({ index: false, follow: true });
  }

  return metadata;
}
