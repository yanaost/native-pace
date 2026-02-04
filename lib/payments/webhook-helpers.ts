/**
 * Webhook Helpers
 *
 * Utility functions for processing Lemon Squeezy webhook events.
 */

import crypto from 'crypto';
import { createLogger } from '@/lib/utils/logger';

const logger = createLogger('webhook');

/** Lemon Squeezy webhook event structure */
export interface WebhookEvent {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
  };
  data: {
    id: string;
    type: string;
    attributes: {
      status?: string;
      renews_at?: string;
      ends_at?: string;
      first_order_item?: {
        variant_name?: string;
      };
      custom_data?: {
        user_id?: string;
      };
    };
  };
}

/** Subscription data extracted from webhook */
export interface SubscriptionData {
  userId: string;
  tier: 'premium' | 'lifetime';
  expiresAt: string | null;
}

/** Supported webhook event types */
export type WebhookEventType =
  | 'subscription_created'
  | 'subscription_updated'
  | 'subscription_cancelled'
  | 'order_created';

/**
 * Verifies the webhook signature using HMAC-SHA256.
 *
 * @param body - Raw request body as string
 * @param signature - Signature from x-signature header
 * @param secret - Webhook secret from environment
 * @returns True if signature is valid
 */
export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!body || !signature || !secret) {
    logger.warn('Missing parameters for signature verification');
    return false;
  }

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    // Buffers have different lengths
    return false;
  }
}

/**
 * Computes the expected webhook signature.
 *
 * @param body - Raw request body as string
 * @param secret - Webhook secret
 * @returns Computed signature
 */
export function computeSignature(body: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  return hmac.update(body).digest('hex');
}

/**
 * Parses and validates a webhook event payload.
 *
 * @param body - Raw request body as string
 * @returns Parsed webhook event or null if invalid
 */
export function parseWebhookEvent(body: string): WebhookEvent | null {
  try {
    const event = JSON.parse(body) as WebhookEvent;

    if (!event.meta?.event_name) {
      logger.warn('Webhook event missing meta.event_name');
      return null;
    }

    if (!event.data) {
      logger.warn('Webhook event missing data');
      return null;
    }

    return event;
  } catch (error) {
    logger.error('Failed to parse webhook event', { error });
    return null;
  }
}

/**
 * Gets the event type from a webhook event.
 *
 * @param event - Webhook event
 * @returns Event type or null if not supported
 */
export function getEventType(event: WebhookEvent): WebhookEventType | null {
  const eventName = event.meta.event_name;
  const validTypes: WebhookEventType[] = [
    'subscription_created',
    'subscription_updated',
    'subscription_cancelled',
    'order_created',
  ];

  if (validTypes.includes(eventName as WebhookEventType)) {
    return eventName as WebhookEventType;
  }

  return null;
}

/**
 * Extracts user ID from webhook event custom data.
 *
 * @param event - Webhook event
 * @returns User ID or null if not found
 */
export function extractUserId(event: WebhookEvent): string | null {
  // Try attributes.custom_data first (subscription events)
  const userId = event.data.attributes.custom_data?.user_id;
  if (userId) {
    return userId;
  }

  // Try meta.custom_data (some order events)
  const metaUserId = event.meta.custom_data?.user_id;
  if (metaUserId) {
    return metaUserId;
  }

  return null;
}

/**
 * Checks if an order event is a lifetime purchase.
 *
 * @param event - Webhook event
 * @returns True if this is a lifetime purchase
 */
export function isLifetimePurchase(event: WebhookEvent): boolean {
  const variantName = event.data.attributes.first_order_item?.variant_name;
  return variantName?.toLowerCase() === 'lifetime';
}

/**
 * Extracts subscription data from a subscription event.
 *
 * @param event - Webhook event
 * @returns Subscription data or null if user ID not found
 */
export function extractSubscriptionData(event: WebhookEvent): SubscriptionData | null {
  const userId = extractUserId(event);

  if (!userId) {
    logger.warn('No user ID in webhook event');
    return null;
  }

  const eventType = getEventType(event);

  // Determine tier
  let tier: 'premium' | 'lifetime' = 'premium';
  if (eventType === 'order_created' && isLifetimePurchase(event)) {
    tier = 'lifetime';
  }

  // Determine expiration
  let expiresAt: string | null = null;
  if (tier === 'premium') {
    expiresAt = event.data.attributes.renews_at || event.data.attributes.ends_at || null;
  }

  return {
    userId,
    tier,
    expiresAt,
  };
}

/**
 * Determines the subscription tier to set based on event type.
 *
 * @param eventType - Webhook event type
 * @param event - Full webhook event
 * @returns Subscription tier to set
 */
export function determineSubscriptionTier(
  eventType: WebhookEventType,
  event: WebhookEvent
): 'free' | 'premium' | 'lifetime' {
  if (eventType === 'subscription_cancelled') {
    return 'free';
  }

  if (eventType === 'order_created' && isLifetimePurchase(event)) {
    return 'lifetime';
  }

  if (eventType === 'subscription_created' || eventType === 'subscription_updated') {
    return 'premium';
  }

  return 'free';
}
