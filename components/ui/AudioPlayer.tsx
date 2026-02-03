'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SpeedIcon from '@mui/icons-material/Speed';
import CircularProgress from '@mui/material/CircularProgress';

type PlaybackState = 'idle' | 'loading' | 'playing';
type AudioType = 'slow' | 'fast';

export interface AudioPlayerProps {
  slowUrl: string;
  fastUrl: string;
  onPlaySlow?: () => void;
  onPlayFast?: () => void;
  enableGlobalShortcuts?: boolean;
}

export default function AudioPlayer({
  slowUrl,
  fastUrl,
  onPlaySlow,
  onPlayFast,
  enableGlobalShortcuts = false,
}: AudioPlayerProps) {
  const slowAudioRef = useRef<HTMLAudioElement | null>(null);
  const fastAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [activeType, setActiveType] = useState<AudioType | null>(null);
  const lastPlayedRef = useRef<AudioType | null>(null);

  // Preload audio on mount
  useEffect(() => {
    slowAudioRef.current = new Audio(slowUrl);
    fastAudioRef.current = new Audio(fastUrl);
    slowAudioRef.current.preload = 'auto';
    fastAudioRef.current.preload = 'auto';

    return () => {
      slowAudioRef.current?.pause();
      fastAudioRef.current?.pause();
    };
  }, [slowUrl, fastUrl]);

  const stopAll = useCallback(() => {
    slowAudioRef.current?.pause();
    fastAudioRef.current?.pause();
    if (slowAudioRef.current) slowAudioRef.current.currentTime = 0;
    if (fastAudioRef.current) fastAudioRef.current.currentTime = 0;
  }, []);

  const play = useCallback((type: AudioType) => {
    stopAll();
    const audio = type === 'slow' ? slowAudioRef.current : fastAudioRef.current;
    if (!audio) return;

    setActiveType(type);
    lastPlayedRef.current = type;

    const onEnded = () => {
      setPlaybackState('idle');
      setActiveType(null);
    };

    audio.removeEventListener('ended', onEnded);
    audio.addEventListener('ended', onEnded);

    if (audio.readyState >= 3) {
      audio.play();
      setPlaybackState('playing');
    } else {
      setPlaybackState('loading');
      audio.addEventListener('canplaythrough', () => {
        audio.play();
        setPlaybackState('playing');
      }, { once: true });
    }

    if (type === 'slow') onPlaySlow?.();
    else onPlayFast?.();
  }, [stopAll, onPlaySlow, onPlayFast]);

  const replay = useCallback(() => {
    if (lastPlayedRef.current) {
      play(lastPlayedRef.current);
    }
  }, [play]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!enableGlobalShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        play('slow');
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        play('fast');
      } else if (e.key === ' ') {
        e.preventDefault();
        replay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableGlobalShortcuts, play, replay]);

  const isPlaying = playbackState === 'playing';
  const isLoading = playbackState === 'loading';

  return (
    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ textAlign: 'center' }}>
        <IconButton
          onClick={() => play('slow')}
          disabled={isLoading}
          sx={{
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
            animation: isPlaying && activeType === 'slow' ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          {isLoading && activeType === 'slow' ? (
            <CircularProgress size={24} />
          ) : (
            <SlowMotionVideoIcon />
          )}
        </IconButton>
        <Typography variant="caption" display="block">Slow</Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <IconButton
          onClick={() => play('fast')}
          disabled={isLoading}
          sx={{
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
            animation: isPlaying && activeType === 'fast' ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          {isLoading && activeType === 'fast' ? (
            <CircularProgress size={24} />
          ) : (
            <SpeedIcon />
          )}
        </IconButton>
        <Typography variant="caption" display="block">Fast</Typography>
      </Box>
    </Box>
  );
}
