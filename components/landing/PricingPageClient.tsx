'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Button from '@/components/ui/Button';
import PricingSection from '@/components/landing/PricingSection';

/**
 * Pricing page client component - standalone page for viewing pricing tiers
 */
export default function PricingPageClient() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 1,
          px: 3,
          bgcolor: 'white',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Link href={returnTo || '/'} passHref legacyBehavior>
              <Button variant="outline" size="small" startIcon={<ArrowBackIcon />}>
                Back
              </Button>
            </Link>
            <Image src="/logo.png" alt="NativePace" width={80} height={80} />
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Box sx={{ py: 6, bgcolor: 'white' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            Unlock your full potential
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Get access to all 185 connected speech patterns and master native English
          </Typography>
        </Container>
      </Box>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ / Additional Info */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="md">
          <Typography variant="h5" fontWeight="bold" gutterBottom textAlign="center">
            Frequently Asked Questions
          </Typography>

          <Box sx={{ mt: 4 }}>
            <FaqItem
              question="Can I try before I subscribe?"
              answer="Yes! Levels 1 and 2 (50 patterns) are completely free. You can practice and learn without any payment."
            />
            <FaqItem
              question="Can I cancel anytime?"
              answer="Absolutely. You can cancel your subscription at any time. You'll keep access until the end of your billing period."
            />
            <FaqItem
              question="What payment methods do you accept?"
              answer="We accept all major credit cards, PayPal, and regional payment methods through our secure payment provider."
            />
            <FaqItem
              question="Is there a lifetime option?"
              answer="Yes! Choose the lifetime plan for one-time payment with permanent access to all current and future content."
            />
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'white',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Questions? Contact us at support@nativepace.com
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * FAQ item component
 */
function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {question}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {answer}
      </Typography>
    </Box>
  );
}
