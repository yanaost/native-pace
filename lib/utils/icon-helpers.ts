/**
 * PWA Icon Helpers
 *
 * Configuration and utilities for PWA app icons.
 */

/** Supported icon sizes in pixels */
export const ICON_SIZES = [192, 512] as const;

/** Icon size type */
export type IconSize = (typeof ICON_SIZES)[number];

/** Icon background color (theme color) */
export const ICON_BACKGROUND_COLOR = '#3b82f6';

/** Icon text/foreground color */
export const ICON_TEXT_COLOR = '#ffffff';

/** Maskable icon safe zone padding (percentage of icon size) */
export const MASKABLE_SAFE_ZONE_PADDING = 0.1;

/** Icon purpose types */
export type IconPurpose = 'any' | 'maskable';

/** Icon configuration */
export interface IconConfig {
  size: IconSize;
  purpose: IconPurpose;
  filename: string;
  path: string;
}

/**
 * Returns array of icon configurations required for PWA.
 */
export function getIconConfigs(): IconConfig[] {
  return [
    {
      size: 192,
      purpose: 'any',
      filename: 'icon-192.png',
      path: '/icons/icon-192.png',
    },
    {
      size: 512,
      purpose: 'any',
      filename: 'icon-512.png',
      path: '/icons/icon-512.png',
    },
    {
      size: 512,
      purpose: 'maskable',
      filename: 'icon-maskable.png',
      path: '/icons/icon-maskable.png',
    },
  ];
}

/**
 * Returns the icon file path for a given size and purpose.
 *
 * @param size - Icon size in pixels
 * @param purpose - Icon purpose (default: 'any')
 * @returns Icon path or null if not found
 */
export function getIconPath(size: IconSize, purpose: IconPurpose = 'any'): string | null {
  const configs = getIconConfigs();
  const config = configs.find((c) => c.size === size && c.purpose === purpose);
  return config?.path ?? null;
}

/**
 * Validates if a size is a supported icon size.
 *
 * @param size - Size to validate
 * @returns True if size is supported
 */
export function validateIconSize(size: number): size is IconSize {
  return ICON_SIZES.includes(size as IconSize);
}

/**
 * Calculates the safe zone dimensions for maskable icons.
 * Maskable icons need content within the safe zone (inner 80% of the icon).
 *
 * @param size - Icon size in pixels
 * @returns Safe zone dimensions
 */
export function getMaskableSafeZone(size: number): { padding: number; contentSize: number } {
  const padding = Math.round(size * MASKABLE_SAFE_ZONE_PADDING);
  const contentSize = size - padding * 2;
  return { padding, contentSize };
}
