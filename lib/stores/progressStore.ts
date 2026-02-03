import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { UserPatternProgress, UserPatternProgressInsert } from '@/lib/supabase/types';

interface ProgressStats {
  patternsLearned: number;
  totalPracticed: number;
  averageMastery: number;
  dueForReview: number;
}

interface ProgressState {
  progress: UserPatternProgress[];
  isLoading: boolean;
  error: string | null;
  getStats: () => ProgressStats;
  fetchProgress: (userId: string) => Promise<void>;
  updatePatternProgress: (userId: string, patternId: string, updates: Partial<UserPatternProgressInsert>) => Promise<void>;
  getPatternProgress: (patternId: string) => UserPatternProgress | undefined;
  clearProgress: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: [],
  isLoading: false,
  error: null,

  getStats: () => {
    const { progress } = get();
    const now = new Date();

    const patternsLearned = progress.filter(p => p.mastery_score >= 50).length;
    const totalPracticed = progress.length;
    const averageMastery = progress.length > 0
      ? progress.reduce((sum, p) => sum + p.mastery_score, 0) / progress.length
      : 0;
    const dueForReview = progress.filter(p =>
      p.next_review_at && new Date(p.next_review_at) <= now
    ).length;

    return { patternsLearned, totalPracticed, averageMastery, dueForReview };
  },

  fetchProgress: async (userId: string) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('user_pattern_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ progress: data || [], isLoading: false });
    }
  },

  updatePatternProgress: async (userId: string, patternId: string, updates: Partial<UserPatternProgressInsert>) => {
    const supabase = createClient();
    const { progress } = get();
    const existing = progress.find(p => p.pattern_id === patternId);

    if (existing) {
      const { data, error } = await supabase
        .from('user_pattern_progress')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();

      if (!error && data) {
        set({ progress: progress.map(p => p.id === existing.id ? data : p) });
      }
    } else {
      const { data, error } = await supabase
        .from('user_pattern_progress')
        .insert({ user_id: userId, pattern_id: patternId, ...updates })
        .select()
        .single();

      if (!error && data) {
        set({ progress: [...progress, data] });
      }
    }
  },

  getPatternProgress: (patternId: string) => {
    return get().progress.find(p => p.pattern_id === patternId);
  },

  clearProgress: () => {
    set({ progress: [], error: null });
  },
}));
