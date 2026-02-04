import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { publicEnv } from '@/lib/utils/env';
import {
  isProtectedPath,
  isPremiumPath,
  isPremiumSubscription,
  getLoginRedirectUrl,
  getPricingRedirectUrl,
} from '@/lib/utils/subscription-helpers';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session - important for token refresh
  const { data: { user } } = await supabase.auth.getUser();

  // Check if path requires authentication
  if (isProtectedPath(pathname) && !user) {
    const redirectUrl = getLoginRedirectUrl(pathname);
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Check if path requires premium subscription
  if (isPremiumPath(pathname) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_tier, subscription_expires_at')
      .eq('id', user.id)
      .single();

    const hasPremium = isPremiumSubscription(
      profile?.subscription_tier,
      profile?.subscription_expires_at
    );

    if (!hasPremium) {
      const redirectUrl = getPricingRedirectUrl(pathname);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return supabaseResponse;
}
