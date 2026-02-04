/**
 * Robots.txt configuration
 *
 * Tells search engines which pages to crawl and index.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import type { MetadataRoute } from 'next';
import { getSiteUrl, PROTECTED_PATHS } from '@/lib/seo/seo-helpers';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: PROTECTED_PATHS.map((path) => path),
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
