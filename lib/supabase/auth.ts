import { createClient } from './client';
import { publicEnv } from '@/lib/utils/env';
import { createLogger } from '@/lib/utils/logger';
import type { AuthError, AuthResponse, OAuthResponse } from '@supabase/supabase-js';

const log = createLogger('auth');

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  log.info('signUpWithEmail called', { email });
  const supabase = createClient();

  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${publicEnv.appUrl}/auth/callback`,
    },
  });

  if (response.error) {
    log.error('signUpWithEmail failed', response.error, { email });
  } else {
    log.info('signUpWithEmail succeeded', { email, userId: response.data.user?.id });
  }
  return response;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResponse> {
  log.info('signInWithEmail called', { email });
  const supabase = createClient();

  const response = await supabase.auth.signInWithPassword({ email, password });

  if (response.error) {
    log.error('signInWithEmail failed', response.error, { email });
  } else {
    log.info('signInWithEmail succeeded', { email, userId: response.data.user?.id });
  }
  return response;
}

export async function signInWithGoogle(): Promise<OAuthResponse> {
  log.info('signInWithGoogle called');
  const supabase = createClient();

  const response = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${publicEnv.appUrl}/auth/callback`,
    },
  });

  if (response.error) {
    log.error('signInWithGoogle failed', response.error);
  } else {
    log.info('signInWithGoogle initiated', { redirectUrl: response.data.url });
  }
  return response;
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  log.info('signOut called');
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    log.error('signOut failed', error);
  } else {
    log.info('signOut succeeded');
  }
  return { error };
}
