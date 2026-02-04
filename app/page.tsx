/**
 * Landing page - main entry point for new visitors
 *
 * This is a server component that exports metadata for SEO.
 * The actual UI is rendered by the LandingPageClient component.
 */

import type { Metadata } from 'next';
import LandingPageClient from '@/components/landing/LandingPageClient';
import { buildPageMetadata } from '@/lib/seo/seo-helpers';

export const metadata: Metadata = buildPageMetadata('home', '/');

export default function LandingPage() {
  return <LandingPageClient />;
}
