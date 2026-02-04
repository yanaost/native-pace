/**
 * Lemon Squeezy Webhook Handler
 *
 * Processes payment events to manage user subscriptions.
 */

import { headers } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createLogger } from '@/lib/utils/logger';
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  getEventType,
  extractUserId,
  determineSubscriptionTier,
  type WebhookEvent,
} from '@/lib/payments/webhook-helpers';

const logger = createLogger('webhook-route');

/**
 * Creates a Supabase admin client for database operations.
 */
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Updates user's subscription tier in the database.
 */
async function updateUserSubscription(
  userId: string,
  tier: 'free' | 'premium' | 'lifetime',
  expiresAt: string | null
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_expires_at: tier === 'lifetime' ? null : expiresAt,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    logger.error('Failed to update user subscription', { userId, tier, error });
    throw error;
  }

  logger.info('User subscription updated', { userId, tier, expiresAt });
}

/**
 * Handles subscription_created and subscription_updated events.
 */
async function handleSubscriptionUpdate(event: WebhookEvent) {
  const userId = extractUserId(event);
  if (!userId) {
    logger.warn('No user ID in subscription event');
    return;
  }

  const expiresAt = event.data.attributes.renews_at || null;
  await updateUserSubscription(userId, 'premium', expiresAt);
}

/**
 * Handles subscription_cancelled event.
 */
async function handleSubscriptionCancelled(event: WebhookEvent) {
  const userId = extractUserId(event);
  if (!userId) {
    logger.warn('No user ID in cancellation event');
    return;
  }

  // Keep premium until subscription actually ends
  const endsAt = event.data.attributes.ends_at || null;
  if (endsAt && new Date(endsAt) > new Date()) {
    // Still active, update expiration
    await updateUserSubscription(userId, 'premium', endsAt);
  } else {
    // Already ended
    await updateUserSubscription(userId, 'free', null);
  }
}

/**
 * Handles order_created event for lifetime purchases.
 */
async function handleLifetimePurchase(event: WebhookEvent) {
  const userId = extractUserId(event);
  if (!userId) {
    logger.warn('No user ID in lifetime purchase event');
    return;
  }

  await updateUserSubscription(userId, 'lifetime', null);
}

/**
 * POST /api/webhook
 *
 * Handles Lemon Squeezy webhook events.
 */
export async function POST(request: Request) {
  logger.info('Webhook received');

  // Get raw body for signature verification
  const body = await request.text();

  // Get signature from headers
  const headersList = headers();
  const signature = headersList.get('x-signature');

  if (!signature) {
    logger.warn('Missing webhook signature');
    return new Response('Missing signature', { status: 401 });
  }

  // Verify signature
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('Missing LEMON_SQUEEZY_WEBHOOK_SECRET');
    return new Response('Server configuration error', { status: 500 });
  }

  if (!verifyWebhookSignature(body, signature, webhookSecret)) {
    logger.warn('Invalid webhook signature');
    return new Response('Invalid signature', { status: 401 });
  }

  // Parse event
  const event = parseWebhookEvent(body);
  if (!event) {
    logger.warn('Failed to parse webhook event');
    return new Response('Invalid payload', { status: 400 });
  }

  const eventType = getEventType(event);
  logger.info('Processing webhook event', { eventType });

  if (!eventType) {
    // Unsupported event type, acknowledge but don't process
    logger.info('Unsupported event type', { eventName: event.meta.event_name });
    return new Response('OK', { status: 200 });
  }

  try {
    switch (eventType) {
      case 'subscription_created':
      case 'subscription_updated':
        await handleSubscriptionUpdate(event);
        break;

      case 'subscription_cancelled':
        await handleSubscriptionCancelled(event);
        break;

      case 'order_created':
        const tier = determineSubscriptionTier(eventType, event);
        if (tier === 'lifetime') {
          await handleLifetimePurchase(event);
        }
        break;
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    logger.error('Error processing webhook', { error });
    return new Response('Processing error', { status: 500 });
  }
}
