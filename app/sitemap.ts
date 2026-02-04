/**
 * Sitemap configuration
 *
 * Generates sitemap.xml for search engine crawlers.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import type { MetadataRoute } from 'next';
import { getSitemapUrls } from '@/lib/seo/seo-helpers';

export default function sitemap(): MetadataRoute.Sitemap {
  return getSitemapUrls();
}
