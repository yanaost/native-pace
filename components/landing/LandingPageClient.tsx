'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PricingSection from '@/components/landing/PricingSection';
import {
  HERO_HEADLINE,
  HERO_SUBHEADLINE,
  DEMO_SENTENCE,
  DEMO_TRANSCRIPTION,
  getCountryFlags,
  getProblemPoints,
  getHowItWorksSteps,
} from '@/lib/utils/landing-page-helpers';

/**
 * Landing page client component - main entry point for new visitors
 */
export default function LandingPageClient() {
  const countryFlags = getCountryFlags();
  const problemPoints = getProblemPoints();
  const howItWorksSteps = getHowItWorksSteps();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 1.5,
          px: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'white',
          borderTop: '4px solid',
          borderImage: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899) 1',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }}
      >
        <Image src="/logo.png" alt="NativePace" width={72} height={72} />
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <Link
            href="/login"
            style={{
              textDecoration: 'none',
              color: '#64748b',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            LOGIN
          </Link>
          <Link href="/signup" passHref legacyBehavior>
            <Button
              variant="primary"
              size="small"
              sx={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
                },
              }}
            >
              Get Started
            </Button>
          </Link>
        </Box>
      </Box>

      {/* Hero Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          {HERO_HEADLINE}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          {HERO_SUBHEADLINE}
        </Typography>

        {/* Audio Demo */}
        <AudioDemo />

        {/* CTA Button */}
        <Box sx={{ mt: 4 }}>
          <Link href="/signup" passHref legacyBehavior>
            <Button variant="primary" size="large">
              Start Learning Free
            </Button>
          </Link>
        </Box>
      </Container>

      {/* Social Proof */}
      <Box sx={{ py: 4, bgcolor: 'grey.50', textAlign: 'center' }}>
        <Container maxWidth="md">
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Trusted by learners from:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
              fontSize: '2rem',
            }}
          >
            {countryFlags.map((flag) => (
              <Box
                key={flag.country}
                component="span"
                title={flag.country}
                role="img"
                aria-label={flag.country}
              >
                {flag.emoji}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Problem Section */}
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom textAlign="center">
          Why can&apos;t I understand native speakers?
        </Typography>
        <Box sx={{ mt: 4 }}>
          {problemPoints.map((point, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'error.light',
                  color: 'error.contrastText',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  flexShrink: 0,
                }}
              >
                !
              </Box>
              <Typography variant="body1">{point}</Typography>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 4, p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
          <Typography variant="body1" fontWeight="medium">
            The solution: Learn the 185 connected speech patterns that make &quot;What do you want to
            do?&quot; sound like &quot;Whaddya wanna do?&quot;
          </Typography>
        </Box>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ py: 8, bgcolor: 'grey.50' }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom textAlign="center">
            How it works
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 3,
              mt: 4,
            }}
          >
            {howItWorksSteps.map((step) => (
              <Card key={step.number} padding="medium">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    mb: 2,
                  }}
                >
                  {step.number}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.description}
                </Typography>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <PricingSection />

      {/* Final CTA Section */}
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h2" fontWeight="bold" gutterBottom>
          Ready to understand native speakers?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Start with 50 patterns for free. No credit card required.
        </Typography>
        <Link href="/signup" passHref legacyBehavior>
          <Button variant="primary" size="large">
            Start Learning Free
          </Button>
        </Link>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          textAlign: 'center',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          NativePace - Understand native English speakers
        </Typography>
      </Box>
    </Box>
  );
}

/**
 * Audio demo component with clear/conversational playback
 */
function AudioDemo() {
  const [isPlayingClear, setIsPlayingClear] = useState(false);
  const [isPlayingConversational, setIsPlayingConversational] = useState(false);
  const clearAudioRef = useRef<HTMLAudioElement | null>(null);
  const conversationalAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayClear = () => {
    if (conversationalAudioRef.current) {
      conversationalAudioRef.current.pause();
      conversationalAudioRef.current.currentTime = 0;
      setIsPlayingConversational(false);
    }
    if (clearAudioRef.current) {
      if (isPlayingClear) {
        clearAudioRef.current.pause();
        setIsPlayingClear(false);
      } else {
        clearAudioRef.current.play().catch(() => {
          // Audio not available
        });
        setIsPlayingClear(true);
      }
    }
  };

  const handlePlayConversational = () => {
    if (clearAudioRef.current) {
      clearAudioRef.current.pause();
      clearAudioRef.current.currentTime = 0;
      setIsPlayingClear(false);
    }
    if (conversationalAudioRef.current) {
      if (isPlayingConversational) {
        conversationalAudioRef.current.pause();
        setIsPlayingConversational(false);
      } else {
        conversationalAudioRef.current.play().catch(() => {
          // Audio not available
        });
        setIsPlayingConversational(true);
      }
    }
  };

  const handleAudioEnded = (type: 'clear' | 'conversational') => {
    if (type === 'clear') {
      setIsPlayingClear(false);
    } else {
      setIsPlayingConversational(false);
    }
  };

  return (
    <Card padding="medium" sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="body1" fontWeight="medium" gutterBottom>
        &quot;{DEMO_SENTENCE}&quot;
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sounds like: &quot;{DEMO_TRANSCRIPTION}&quot;
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={handlePlayClear}
            color="primary"
            sx={{
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
            }}
            aria-label="Play clear version"
          >
            {isPlayingClear ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Typography variant="caption" display="block">
            Clear
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={handlePlayConversational}
            color="primary"
            sx={{
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
            }}
            aria-label="Play conversational version"
          >
            {isPlayingConversational ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Typography variant="caption" display="block">
            Conversational
          </Typography>
        </Box>
      </Box>
      {/* Hidden audio elements */}
      <audio
        ref={clearAudioRef}
        src="/audio/demo/demo-clear.mp3"
        onEnded={() => handleAudioEnded('clear')}
        preload="none"
      />
      <audio
        ref={conversationalAudioRef}
        src="/audio/demo/demo-conversational.mp3"
        onEnded={() => handleAudioEnded('conversational')}
        preload="none"
      />
    </Card>
  );
}
