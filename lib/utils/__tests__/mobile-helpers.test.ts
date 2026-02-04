import {
  MOBILE_BREAKPOINT,
  TABLET_BREAKPOINT,
  DESKTOP_BREAKPOINT,
  LARGE_DESKTOP_BREAKPOINT,
  MIN_TAP_TARGET_SIZE,
  RECOMMENDED_TAP_TARGET_SIZE,
  MOBILE_PADDING,
  getResponsiveBreakpoints,
  validateTapTargetSize,
  isRecommendedTapTargetSize,
  isMobileWidth,
  isTabletWidth,
  isDesktopWidth,
  getDeviceCategory,
  getMobileViewportMeta,
  getMinContentWidth,
  contentFitsViewport,
} from '../mobile-helpers';

describe('Breakpoint Constants', () => {
  it('should have MOBILE_BREAKPOINT at 375px', () => {
    expect(MOBILE_BREAKPOINT).toBe(375);
  });

  it('should have TABLET_BREAKPOINT at 768px', () => {
    expect(TABLET_BREAKPOINT).toBe(768);
  });

  it('should have DESKTOP_BREAKPOINT at 1024px', () => {
    expect(DESKTOP_BREAKPOINT).toBe(1024);
  });

  it('should have LARGE_DESKTOP_BREAKPOINT at 1440px', () => {
    expect(LARGE_DESKTOP_BREAKPOINT).toBe(1440);
  });

  it('should have breakpoints in ascending order', () => {
    expect(MOBILE_BREAKPOINT).toBeLessThan(TABLET_BREAKPOINT);
    expect(TABLET_BREAKPOINT).toBeLessThan(DESKTOP_BREAKPOINT);
    expect(DESKTOP_BREAKPOINT).toBeLessThan(LARGE_DESKTOP_BREAKPOINT);
  });
});

describe('Tap Target Constants', () => {
  it('should have MIN_TAP_TARGET_SIZE at 44px', () => {
    expect(MIN_TAP_TARGET_SIZE).toBe(44);
  });

  it('should have RECOMMENDED_TAP_TARGET_SIZE at 48px', () => {
    expect(RECOMMENDED_TAP_TARGET_SIZE).toBe(48);
  });

  it('should have recommended >= minimum', () => {
    expect(RECOMMENDED_TAP_TARGET_SIZE).toBeGreaterThanOrEqual(MIN_TAP_TARGET_SIZE);
  });
});

describe('MOBILE_PADDING', () => {
  it('should have xs padding at 8px', () => {
    expect(MOBILE_PADDING.xs).toBe(8);
  });

  it('should have sm padding at 12px', () => {
    expect(MOBILE_PADDING.sm).toBe(12);
  });

  it('should have md padding at 16px', () => {
    expect(MOBILE_PADDING.md).toBe(16);
  });

  it('should have lg padding at 24px', () => {
    expect(MOBILE_PADDING.lg).toBe(24);
  });
});

describe('getResponsiveBreakpoints', () => {
  it('should return all breakpoints', () => {
    const breakpoints = getResponsiveBreakpoints();
    expect(breakpoints.mobile).toBe(MOBILE_BREAKPOINT);
    expect(breakpoints.tablet).toBe(TABLET_BREAKPOINT);
    expect(breakpoints.desktop).toBe(DESKTOP_BREAKPOINT);
    expect(breakpoints.largeDesktop).toBe(LARGE_DESKTOP_BREAKPOINT);
  });
});

describe('validateTapTargetSize', () => {
  it('should return true for 44px', () => {
    expect(validateTapTargetSize(44)).toBe(true);
  });

  it('should return true for sizes >= 44px', () => {
    expect(validateTapTargetSize(48)).toBe(true);
    expect(validateTapTargetSize(100)).toBe(true);
  });

  it('should return false for sizes < 44px', () => {
    expect(validateTapTargetSize(43)).toBe(false);
    expect(validateTapTargetSize(32)).toBe(false);
    expect(validateTapTargetSize(0)).toBe(false);
  });
});

describe('isRecommendedTapTargetSize', () => {
  it('should return true for 48px', () => {
    expect(isRecommendedTapTargetSize(48)).toBe(true);
  });

  it('should return true for sizes >= 48px', () => {
    expect(isRecommendedTapTargetSize(56)).toBe(true);
  });

  it('should return false for sizes < 48px', () => {
    expect(isRecommendedTapTargetSize(44)).toBe(false);
    expect(isRecommendedTapTargetSize(47)).toBe(false);
  });
});

describe('isMobileWidth', () => {
  it('should return true for 375px', () => {
    expect(isMobileWidth(375)).toBe(true);
  });

  it('should return true for widths < 768px', () => {
    expect(isMobileWidth(320)).toBe(true);
    expect(isMobileWidth(767)).toBe(true);
  });

  it('should return false for widths >= 768px', () => {
    expect(isMobileWidth(768)).toBe(false);
    expect(isMobileWidth(1024)).toBe(false);
  });
});

describe('isTabletWidth', () => {
  it('should return true for 768px', () => {
    expect(isTabletWidth(768)).toBe(true);
  });

  it('should return true for widths between 768 and 1024', () => {
    expect(isTabletWidth(800)).toBe(true);
    expect(isTabletWidth(1023)).toBe(true);
  });

  it('should return false for mobile widths', () => {
    expect(isTabletWidth(375)).toBe(false);
    expect(isTabletWidth(767)).toBe(false);
  });

  it('should return false for desktop widths', () => {
    expect(isTabletWidth(1024)).toBe(false);
    expect(isTabletWidth(1440)).toBe(false);
  });
});

describe('isDesktopWidth', () => {
  it('should return true for 1024px', () => {
    expect(isDesktopWidth(1024)).toBe(true);
  });

  it('should return true for widths >= 1024', () => {
    expect(isDesktopWidth(1440)).toBe(true);
    expect(isDesktopWidth(1920)).toBe(true);
  });

  it('should return false for mobile/tablet widths', () => {
    expect(isDesktopWidth(375)).toBe(false);
    expect(isDesktopWidth(768)).toBe(false);
    expect(isDesktopWidth(1023)).toBe(false);
  });
});

describe('getDeviceCategory', () => {
  it('should return mobile for widths < 768', () => {
    expect(getDeviceCategory(375)).toBe('mobile');
    expect(getDeviceCategory(767)).toBe('mobile');
  });

  it('should return tablet for widths 768-1023', () => {
    expect(getDeviceCategory(768)).toBe('tablet');
    expect(getDeviceCategory(1023)).toBe('tablet');
  });

  it('should return desktop for widths >= 1024', () => {
    expect(getDeviceCategory(1024)).toBe('desktop');
    expect(getDeviceCategory(1920)).toBe('desktop');
  });
});

describe('getMobileViewportMeta', () => {
  it('should return correct viewport meta content', () => {
    const meta = getMobileViewportMeta();
    expect(meta).toContain('width=device-width');
    expect(meta).toContain('initial-scale=1');
  });

  it('should include maximum-scale for accessibility', () => {
    const meta = getMobileViewportMeta();
    expect(meta).toContain('maximum-scale=5');
  });
});

describe('getMinContentWidth', () => {
  it('should calculate content width with default padding', () => {
    // 375 - 16*2 = 343
    expect(getMinContentWidth()).toBe(343);
  });

  it('should calculate content width with custom padding', () => {
    // 375 - 24*2 = 327
    expect(getMinContentWidth(24)).toBe(327);
  });
});

describe('contentFitsViewport', () => {
  it('should return true when content fits', () => {
    expect(contentFitsViewport(300, 375, 16)).toBe(true);
    expect(contentFitsViewport(343, 375, 16)).toBe(true);
  });

  it('should return false when content is too wide', () => {
    expect(contentFitsViewport(350, 375, 16)).toBe(false);
    expect(contentFitsViewport(400, 375, 16)).toBe(false);
  });

  it('should use default padding when not specified', () => {
    // 375 - 16*2 = 343 max content width
    expect(contentFitsViewport(343, 375)).toBe(true);
    expect(contentFitsViewport(344, 375)).toBe(false);
  });
});
