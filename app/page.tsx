'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
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
 * Landing page - main entry point for new visitors
 */
export default function LandingPage() {
  const countryFlags = getCountryFlags();
  const problemPoints = getProblemPoints();
  const howItWorksSteps = getHowItWorksSteps();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          py: 2,
          px: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          NativePace
        </Typography>
        <Link href="/login" passHref legacyBehavior>
          <Button variant="outline" size="small">
            Login
          </Button>
        </Link>
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
          Why can't I understand native speakers?
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
            The solution: Learn the 185 connected speech patterns that make "What do you want to
            do?" sound like "Whaddya wanna do?"
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
 * Audio demo component with slow/fast playback
 */
function AudioDemo() {
  const [isPlayingSlow, setIsPlayingSlow] = useState(false);
  const [isPlayingFast, setIsPlayingFast] = useState(false);
  const slowAudioRef = useRef<HTMLAudioElement | null>(null);
  const fastAudioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlaySlow = () => {
    if (fastAudioRef.current) {
      fastAudioRef.current.pause();
      fastAudioRef.current.currentTime = 0;
      setIsPlayingFast(false);
    }
    if (slowAudioRef.current) {
      if (isPlayingSlow) {
        slowAudioRef.current.pause();
        setIsPlayingSlow(false);
      } else {
        slowAudioRef.current.play().catch(() => {
          // Audio not available
        });
        setIsPlayingSlow(true);
      }
    }
  };

  const handlePlayFast = () => {
    if (slowAudioRef.current) {
      slowAudioRef.current.pause();
      slowAudioRef.current.currentTime = 0;
      setIsPlayingSlow(false);
    }
    if (fastAudioRef.current) {
      if (isPlayingFast) {
        fastAudioRef.current.pause();
        setIsPlayingFast(false);
      } else {
        fastAudioRef.current.play().catch(() => {
          // Audio not available
        });
        setIsPlayingFast(true);
      }
    }
  };

  const handleAudioEnded = (type: 'slow' | 'fast') => {
    if (type === 'slow') {
      setIsPlayingSlow(false);
    } else {
      setIsPlayingFast(false);
    }
  };

  return (
    <Card padding="medium" sx={{ maxWidth: 400, mx: 'auto' }}>
      <Typography variant="body1" fontWeight="medium" gutterBottom>
        "{DEMO_SENTENCE}"
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sounds like: "{DEMO_TRANSCRIPTION}"
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={handlePlaySlow}
            color="primary"
            sx={{
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
            }}
            aria-label="Play slow version"
          >
            {isPlayingSlow ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Typography variant="caption" display="block">
            Slow
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <IconButton
            onClick={handlePlayFast}
            color="primary"
            sx={{
              bgcolor: 'primary.light',
              '&:hover': { bgcolor: 'primary.main', color: 'white' },
            }}
            aria-label="Play fast version"
          >
            {isPlayingFast ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>
          <Typography variant="caption" display="block">
            Fast
          </Typography>
        </Box>
      </Box>
      {/* Hidden audio elements */}
      <audio
        ref={slowAudioRef}
        src="/audio/demo/demo-slow.mp3"
        onEnded={() => handleAudioEnded('slow')}
        preload="none"
      />
      <audio
        ref={fastAudioRef}
        src="/audio/demo/demo-fast.mp3"
        onEnded={() => handleAudioEnded('fast')}
        preload="none"
      />
    </Card>
  );
}
