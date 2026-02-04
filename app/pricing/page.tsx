/**
 * Pricing page - standalone page for viewing pricing tiers
 *
 * This is a server component that exports metadata for SEO.
 * The actual UI is rendered by the PricingPageClient component.
 */

import type { Metadata } from 'next';
import { Suspense } from 'react';
import PricingPageClient from '@/components/landing/PricingPageClient';
import { buildPageMetadata } from '@/lib/seo/seo-helpers';

export const metadata: Metadata = buildPageMetadata('pricing', '/pricing');

export default function PricingPage() {
  return (
    <Suspense fallback={null}>
      <PricingPageClient />
    </Suspense>
  );
}
