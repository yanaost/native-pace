'use client';

import { useRef, useState, useEffect, useCallback, useId } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import SlowMotionVideoIcon from '@mui/icons-material/SlowMotionVideo';
import SpeedIcon from '@mui/icons-material/Speed';
import CircularProgress from '@mui/material/CircularProgress';
import { useAudioStore } from '@/lib/stores/audioStore';

type PlaybackState = 'idle' | 'loading' | 'playing';
type AudioType = 'clear' | 'conversational';

export interface AudioPlayerProps {
  clearUrl: string;
  conversationalUrl: string;
  audioId?: string;
  onPlayClear?: () => void;
  onPlayConversational?: () => void;
  enableGlobalShortcuts?: boolean;
}

export default function AudioPlayer({
  clearUrl,
  conversationalUrl,
  audioId: providedAudioId,
  onPlayClear,
  onPlayConversational,
  enableGlobalShortcuts = false,
}: AudioPlayerProps) {
  const generatedId = useId();
  const audioId = providedAudioId || generatedId;

  const clearAudioRef = useRef<HTMLAudioElement | null>(null);
  const conversationalAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>('idle');
  const [activeType, setActiveType] = useState<AudioType | null>(null);
  const lastPlayedRef = useRef<AudioType | null>(null);

  const { currentAudioId, play: storePlay, stop: storeStop } = useAudioStore();

  // Preload audio on mount
  useEffect(() => {
    clearAudioRef.current = new Audio(clearUrl);
    conversationalAudioRef.current = new Audio(conversationalUrl);
    clearAudioRef.current.preload = 'auto';
    conversationalAudioRef.current.preload = 'auto';

    return () => {
      clearAudioRef.current?.pause();
      conversationalAudioRef.current?.pause();
    };
  }, [clearUrl, conversationalUrl]);

  const stopAll = useCallback(() => {
    clearAudioRef.current?.pause();
    conversationalAudioRef.current?.pause();
    if (clearAudioRef.current) clearAudioRef.current.currentTime = 0;
    if (conversationalAudioRef.current) conversationalAudioRef.current.currentTime = 0;
    setPlaybackState('idle');
    setActiveType(null);
  }, []);

  // Stop when another audio starts playing
  useEffect(() => {
    if (currentAudioId && currentAudioId !== audioId && playbackState === 'playing') {
      stopAll();
    }
  }, [currentAudioId, audioId, playbackState, stopAll]);

  const play = useCallback((type: AudioType) => {
    stopAll();
    const audio = type === 'clear' ? clearAudioRef.current : conversationalAudioRef.current;
    if (!audio) return;

    setActiveType(type);
    lastPlayedRef.current = type;
    storePlay(audioId);

    const onEnded = () => {
      setPlaybackState('idle');
      setActiveType(null);
      storeStop();
    };

    const onError = () => {
      console.error('Audio failed to load:', audio.src);
      setPlaybackState('idle');
      setActiveType(null);
      storeStop();
    };

    audio.removeEventListener('ended', onEnded);
    audio.removeEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // readyState >= 2 means we have enough data to play
    if (audio.readyState >= 2) {
      audio.play().then(() => {
        setPlaybackState('playing');
      }).catch((err) => {
        console.error('Play failed:', err);
        setPlaybackState('idle');
        setActiveType(null);
      });
    } else {
      setPlaybackState('loading');

      const onCanPlay = () => {
        audio.removeEventListener('canplay', onCanPlay);
        audio.play().then(() => {
          setPlaybackState('playing');
        }).catch((err) => {
          console.error('Play failed:', err);
          setPlaybackState('idle');
          setActiveType(null);
        });
      };

      audio.addEventListener('canplay', onCanPlay);
      audio.load(); // Force load if not already loading
    }

    if (type === 'clear') onPlayClear?.();
    else onPlayConversational?.();
  }, [stopAll, onPlayClear, onPlayConversational, audioId, storePlay, storeStop]);

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

      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        play('clear');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        play('conversational');
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
          onClick={() => play('clear')}
          disabled={isLoading}
          sx={{
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
            animation: isPlaying && activeType === 'clear' ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          {isLoading && activeType === 'clear' ? (
            <CircularProgress size={24} />
          ) : (
            <SlowMotionVideoIcon />
          )}
        </IconButton>
        <Typography variant="caption" display="block">Clear</Typography>
      </Box>

      <Box sx={{ textAlign: 'center' }}>
        <IconButton
          onClick={() => play('conversational')}
          disabled={isLoading}
          sx={{
            bgcolor: 'primary.light',
            '&:hover': { bgcolor: 'primary.main', color: 'white' },
            animation: isPlaying && activeType === 'conversational' ? 'pulse 1s infinite' : 'none',
            '@keyframes pulse': {
              '0%, 100%': { transform: 'scale(1)' },
              '50%': { transform: 'scale(1.1)' },
            },
          }}
        >
          {isLoading && activeType === 'conversational' ? (
            <CircularProgress size={24} />
          ) : (
            <SpeedIcon />
          )}
        </IconButton>
        <Typography variant="caption" display="block">Conversational</Typography>
      </Box>
    </Box>
  );
}
