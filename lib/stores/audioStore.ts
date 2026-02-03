import { create } from 'zustand';

interface AudioState {
  currentAudioId: string | null;
  isPlaying: boolean;
  play: (audioId: string) => void;
  pause: () => void;
  stop: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  currentAudioId: null,
  isPlaying: false,
  play: (audioId: string) => set({ currentAudioId: audioId, isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ currentAudioId: null, isPlaying: false }),
}));
