'use client';

import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/Check';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getPricingTiers, type PricingTier } from '@/lib/utils/pricing-helpers';

/**
 * Pricing section for landing page showing free and premium tiers
 */
export default function PricingSection() {
  const tiers = getPricingTiers();

  return (
    <Box sx={{ py: 8 }} id="pricing">
      <Container maxWidth="md">
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom textAlign="center">
          Simple pricing
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
          Start free, upgrade when you&apos;re ready
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          {tiers.map((tier) => (
            <PricingCard key={tier.id} tier={tier} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}

/**
 * Individual pricing card
 */
function PricingCard({ tier }: { tier: PricingTier }) {
  return (
    <Card
      padding="large"
      sx={{
        border: tier.highlighted ? 2 : 1,
        borderColor: tier.highlighted ? 'primary.main' : 'divider',
        position: 'relative',
      }}
    >
      {tier.highlighted && (
        <Box
          sx={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            px: 2,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          MOST POPULAR
        </Box>
      )}

      <Typography variant="h5" fontWeight="bold" gutterBottom>
        {tier.name}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="h3" fontWeight="bold">
          {tier.price}
        </Typography>
        {tier.period && (
          <Typography variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
            {tier.period}
          </Typography>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {tier.description}
      </Typography>

      <Box sx={{ mb: 3 }}>
        {tier.features.map((feature, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
              mb: 1.5,
            }}
          >
            <CheckIcon
              sx={{
                fontSize: 20,
                color: tier.highlighted ? 'primary.main' : 'success.main',
                mt: 0.25,
              }}
            />
            <Typography variant="body2">{feature}</Typography>
          </Box>
        ))}
      </Box>

      <Link href={tier.ctaHref} passHref legacyBehavior>
        <Button
          variant={tier.highlighted ? 'primary' : 'outline'}
          fullWidth
          size="large"
        >
          {tier.cta}
        </Button>
      </Link>
    </Card>
  );
}
