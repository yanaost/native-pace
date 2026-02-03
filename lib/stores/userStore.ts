import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import { Profile, ProfileUpdate } from '@/lib/supabase/types';

interface UserState {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  isPremium: () => boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
  clearProfile: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  isPremium: () => {
    const { profile } = get();
    if (!profile) return false;
    if (profile.subscription_tier === 'lifetime') return true;
    if (profile.subscription_tier === 'premium') {
      if (!profile.subscription_expires_at) return false;
      return new Date(profile.subscription_expires_at) > new Date();
    }
    return false;
  },

  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ profile: data, isLoading: false });
    }
  },

  updateProfile: async (updates: ProfileUpdate) => {
    const { profile } = get();
    if (!profile) return;

    set({ isLoading: true, error: null });
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', profile.id)
      .select()
      .single();

    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ profile: data, isLoading: false });
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null });
  },
}));
