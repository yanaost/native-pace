/**
 * Mobile Responsiveness Helpers
 *
 * Constants and utilities for mobile-responsive design.
 */

/** Minimum mobile viewport width (iPhone SE) */
export const MOBILE_BREAKPOINT = 375;

/** Tablet breakpoint */
export const TABLET_BREAKPOINT = 768;

/** Desktop breakpoint */
export const DESKTOP_BREAKPOINT = 1024;

/** Large desktop breakpoint */
export const LARGE_DESKTOP_BREAKPOINT = 1440;

/** Minimum tap target size per Apple/Google guidelines */
export const MIN_TAP_TARGET_SIZE = 44;

/** Recommended tap target size for better accessibility */
export const RECOMMENDED_TAP_TARGET_SIZE = 48;

/** Standard mobile padding in pixels */
export const MOBILE_PADDING = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
} as const;

/** Responsive breakpoints */
export interface ResponsiveBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
  largeDesktop: number;
}

/**
 * Returns all responsive breakpoints.
 */
export function getResponsiveBreakpoints(): ResponsiveBreakpoints {
  return {
    mobile: MOBILE_BREAKPOINT,
    tablet: TABLET_BREAKPOINT,
    desktop: DESKTOP_BREAKPOINT,
    largeDesktop: LARGE_DESKTOP_BREAKPOINT,
  };
}

/**
 * Check if a tap target size meets the minimum requirement.
 *
 * @param size - Size in pixels
 * @returns True if size meets minimum tap target requirement
 */
export function validateTapTargetSize(size: number): boolean {
  return size >= MIN_TAP_TARGET_SIZE;
}

/**
 * Check if a tap target size meets the recommended size.
 *
 * @param size - Size in pixels
 * @returns True if size meets recommended tap target size
 */
export function isRecommendedTapTargetSize(size: number): boolean {
  return size >= RECOMMENDED_TAP_TARGET_SIZE;
}

/**
 * Check if a viewport width is considered mobile.
 *
 * @param width - Viewport width in pixels
 * @returns True if width is mobile (below tablet breakpoint)
 */
export function isMobileWidth(width: number): boolean {
  return width < TABLET_BREAKPOINT;
}

/**
 * Check if a viewport width is considered tablet.
 *
 * @param width - Viewport width in pixels
 * @returns True if width is tablet (between tablet and desktop breakpoints)
 */
export function isTabletWidth(width: number): boolean {
  return width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT;
}

/**
 * Check if a viewport width is considered desktop.
 *
 * @param width - Viewport width in pixels
 * @returns True if width is desktop (at or above desktop breakpoint)
 */
export function isDesktopWidth(width: number): boolean {
  return width >= DESKTOP_BREAKPOINT;
}

/**
 * Get the device category based on viewport width.
 *
 * @param width - Viewport width in pixels
 * @returns Device category string
 */
export function getDeviceCategory(width: number): 'mobile' | 'tablet' | 'desktop' {
  if (width < TABLET_BREAKPOINT) {
    return 'mobile';
  }
  if (width < DESKTOP_BREAKPOINT) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Returns the correct viewport meta content for mobile devices.
 */
export function getMobileViewportMeta(): string {
  return 'width=device-width, initial-scale=1, maximum-scale=5';
}

/**
 * Calculate the minimum container width for readable content.
 *
 * @param padding - Horizontal padding on each side
 * @returns Minimum content width after accounting for padding
 */
export function getMinContentWidth(padding: number = MOBILE_PADDING.md): number {
  return MOBILE_BREAKPOINT - padding * 2;
}

/**
 * Check if content width is appropriate for mobile.
 *
 * @param contentWidth - Width of content in pixels
 * @param viewportWidth - Viewport width in pixels
 * @param padding - Horizontal padding
 * @returns True if content fits within viewport with padding
 */
export function contentFitsViewport(
  contentWidth: number,
  viewportWidth: number,
  padding: number = MOBILE_PADDING.md
): boolean {
  return contentWidth <= viewportWidth - padding * 2;
}
