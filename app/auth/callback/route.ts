import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { publicEnv } from '@/lib/utils/env';
import { createLogger } from '@/lib/utils/logger';

const log = createLogger('auth-callback');

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  log.info('OAuth callback received', { hasCode: !!code, error: error || undefined });

  // Handle OAuth errors
  if (error) {
    log.error('OAuth provider returned error', new Error(errorDescription || error));
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(loginUrl);
  }

  if (!code) {
    log.error('OAuth callback missing code', new Error('Missing code'));
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'Authentication failed');
    return NextResponse.redirect(loginUrl);
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            log.warn('Failed to set cookies in callback');
          }
        },
      },
    }
  );

  const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);

  if (sessionError) {
    log.error('Failed to exchange code for session', sessionError);
    const loginUrl = new URL('/login', requestUrl.origin);
    loginUrl.searchParams.set('error', 'Authentication failed');
    return NextResponse.redirect(loginUrl);
  }

  log.info('OAuth callback successful', { userId: data.user?.id, email: data.user?.email });
  return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
}
