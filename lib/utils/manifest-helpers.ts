/**
 * PWA Manifest Helpers
 *
 * Validation utilities for PWA manifest files.
 */

/** Required fields for a valid PWA manifest */
export const REQUIRED_MANIFEST_FIELDS = [
  'name',
  'short_name',
  'start_url',
  'display',
  'icons',
] as const;

/** Valid display modes for PWA */
export const VALID_DISPLAY_MODES = [
  'fullscreen',
  'standalone',
  'minimal-ui',
  'browser',
] as const;

/** Valid orientation values */
export const VALID_ORIENTATIONS = [
  'any',
  'natural',
  'landscape',
  'landscape-primary',
  'landscape-secondary',
  'portrait',
  'portrait-primary',
  'portrait-secondary',
] as const;

/** PWA manifest icon */
export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
}

/** PWA manifest structure */
export interface PWAManifest {
  name: string;
  short_name: string;
  description?: string;
  start_url: string;
  display: string;
  background_color?: string;
  theme_color?: string;
  orientation?: string;
  scope?: string;
  icons: ManifestIcon[];
  categories?: string[];
  lang?: string;
  dir?: string;
}

/** Validation result */
export interface ManifestValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a PWA manifest object.
 *
 * @param manifest - Manifest object to validate
 * @returns Validation result with errors array
 */
export function validateManifest(manifest: unknown): ManifestValidationResult {
  const errors: string[] = [];

  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, errors: ['Manifest must be an object'] };
  }

  const m = manifest as Record<string, unknown>;

  // Check required fields
  for (const field of REQUIRED_MANIFEST_FIELDS) {
    if (!(field in m) || m[field] === undefined || m[field] === null) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate name
  if (typeof m.name !== 'string' || m.name.length === 0) {
    errors.push('name must be a non-empty string');
  }

  // Validate short_name
  if (typeof m.short_name !== 'string' || m.short_name.length === 0) {
    errors.push('short_name must be a non-empty string');
  } else if (m.short_name.length > 12) {
    errors.push('short_name should be 12 characters or less');
  }

  // Validate start_url
  if (typeof m.start_url !== 'string' || m.start_url.length === 0) {
    errors.push('start_url must be a non-empty string');
  }

  // Validate display
  if (typeof m.display !== 'string') {
    errors.push('display must be a string');
  } else if (!VALID_DISPLAY_MODES.includes(m.display as typeof VALID_DISPLAY_MODES[number])) {
    errors.push(`display must be one of: ${VALID_DISPLAY_MODES.join(', ')}`);
  }

  // Validate icons
  if (!Array.isArray(m.icons)) {
    errors.push('icons must be an array');
  } else {
    const iconErrors = validateIcons(m.icons);
    errors.push(...iconErrors);
  }

  // Validate optional orientation
  if (m.orientation !== undefined) {
    if (!VALID_ORIENTATIONS.includes(m.orientation as typeof VALID_ORIENTATIONS[number])) {
      errors.push(`orientation must be one of: ${VALID_ORIENTATIONS.join(', ')}`);
    }
  }

  // Validate optional colors
  if (m.background_color !== undefined && !isValidColor(m.background_color)) {
    errors.push('background_color must be a valid hex color');
  }
  if (m.theme_color !== undefined && !isValidColor(m.theme_color)) {
    errors.push('theme_color must be a valid hex color');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates manifest icons array.
 *
 * @param icons - Icons array to validate
 * @returns Array of error messages
 */
export function validateIcons(icons: unknown[]): string[] {
  const errors: string[] = [];

  if (icons.length === 0) {
    errors.push('icons array must not be empty');
    return errors;
  }

  // Check for required sizes
  const sizes = icons
    .filter((icon): icon is ManifestIcon => typeof icon === 'object' && icon !== null)
    .map((icon) => icon.sizes);

  if (!sizes.some((s) => s?.includes('192'))) {
    errors.push('icons should include a 192x192 icon');
  }
  if (!sizes.some((s) => s?.includes('512'))) {
    errors.push('icons should include a 512x512 icon');
  }

  // Validate each icon
  icons.forEach((icon, index) => {
    if (typeof icon !== 'object' || icon === null) {
      errors.push(`icons[${index}] must be an object`);
      return;
    }

    const i = icon as Record<string, unknown>;

    if (typeof i.src !== 'string' || i.src.length === 0) {
      errors.push(`icons[${index}].src must be a non-empty string`);
    }
    if (typeof i.sizes !== 'string' || i.sizes.length === 0) {
      errors.push(`icons[${index}].sizes must be a non-empty string`);
    }
    if (typeof i.type !== 'string' || i.type.length === 0) {
      errors.push(`icons[${index}].type must be a non-empty string`);
    }
  });

  return errors;
}

/**
 * Checks if a string is a valid hex color.
 *
 * @param color - Color value to check
 * @returns True if valid hex color
 */
export function isValidColor(color: unknown): boolean {
  if (typeof color !== 'string') {
    return false;
  }
  // Match #RGB, #RRGGBB, or #RRGGBBAA
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(color);
}

/**
 * Checks if manifest has a maskable icon.
 *
 * @param manifest - Manifest to check
 * @returns True if has maskable icon
 */
export function hasMaskableIcon(manifest: PWAManifest): boolean {
  return manifest.icons.some((icon) => icon.purpose === 'maskable');
}
