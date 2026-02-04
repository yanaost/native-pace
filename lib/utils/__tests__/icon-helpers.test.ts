import {
  ICON_SIZES,
  ICON_BACKGROUND_COLOR,
  ICON_TEXT_COLOR,
  MASKABLE_SAFE_ZONE_PADDING,
  getIconConfigs,
  getIconPath,
  validateIconSize,
  getMaskableSafeZone,
} from '../icon-helpers';

describe('ICON_SIZES', () => {
  it('should contain 192', () => {
    expect(ICON_SIZES).toContain(192);
  });

  it('should contain 512', () => {
    expect(ICON_SIZES).toContain(512);
  });

  it('should have exactly 2 sizes', () => {
    expect(ICON_SIZES).toHaveLength(2);
  });
});

describe('ICON_BACKGROUND_COLOR', () => {
  it('should equal theme color #3b82f6', () => {
    expect(ICON_BACKGROUND_COLOR).toBe('#3b82f6');
  });
});

describe('ICON_TEXT_COLOR', () => {
  it('should equal white #ffffff', () => {
    expect(ICON_TEXT_COLOR).toBe('#ffffff');
  });
});

describe('MASKABLE_SAFE_ZONE_PADDING', () => {
  it('should equal 0.1 (10%)', () => {
    expect(MASKABLE_SAFE_ZONE_PADDING).toBe(0.1);
  });
});

describe('getIconConfigs', () => {
  it('should return array of icon configurations', () => {
    const configs = getIconConfigs();
    expect(Array.isArray(configs)).toBe(true);
    expect(configs.length).toBeGreaterThan(0);
  });

  it('should include 192x192 icon', () => {
    const configs = getIconConfigs();
    const icon192 = configs.find((c) => c.size === 192 && c.purpose === 'any');
    expect(icon192).toBeDefined();
    expect(icon192?.filename).toBe('icon-192.png');
    expect(icon192?.path).toBe('/icons/icon-192.png');
  });

  it('should include 512x512 icon', () => {
    const configs = getIconConfigs();
    const icon512 = configs.find((c) => c.size === 512 && c.purpose === 'any');
    expect(icon512).toBeDefined();
    expect(icon512?.filename).toBe('icon-512.png');
    expect(icon512?.path).toBe('/icons/icon-512.png');
  });

  it('should include maskable icon', () => {
    const configs = getIconConfigs();
    const maskable = configs.find((c) => c.purpose === 'maskable');
    expect(maskable).toBeDefined();
    expect(maskable?.filename).toBe('icon-maskable.png');
    expect(maskable?.path).toBe('/icons/icon-maskable.png');
  });

  it('should have exactly 3 configurations', () => {
    const configs = getIconConfigs();
    expect(configs).toHaveLength(3);
  });

  it('should have all required properties on each config', () => {
    const configs = getIconConfigs();
    configs.forEach((config) => {
      expect(config).toHaveProperty('size');
      expect(config).toHaveProperty('purpose');
      expect(config).toHaveProperty('filename');
      expect(config).toHaveProperty('path');
    });
  });
});

describe('getIconPath', () => {
  it('should return correct path for 192 icon', () => {
    expect(getIconPath(192)).toBe('/icons/icon-192.png');
  });

  it('should return correct path for 512 icon', () => {
    expect(getIconPath(512)).toBe('/icons/icon-512.png');
  });

  it('should return correct path for maskable icon', () => {
    expect(getIconPath(512, 'maskable')).toBe('/icons/icon-maskable.png');
  });

  it('should return null for non-existent size', () => {
    expect(getIconPath(256 as 192)).toBe(null);
  });

  it('should return null for non-existent purpose at valid size', () => {
    expect(getIconPath(192, 'maskable')).toBe(null);
  });

  it('should default to any purpose', () => {
    expect(getIconPath(192)).toBe(getIconPath(192, 'any'));
  });
});

describe('validateIconSize', () => {
  it('should return true for 192', () => {
    expect(validateIconSize(192)).toBe(true);
  });

  it('should return true for 512', () => {
    expect(validateIconSize(512)).toBe(true);
  });

  it('should return false for 64', () => {
    expect(validateIconSize(64)).toBe(false);
  });

  it('should return false for 128', () => {
    expect(validateIconSize(128)).toBe(false);
  });

  it('should return false for 256', () => {
    expect(validateIconSize(256)).toBe(false);
  });

  it('should return false for 1024', () => {
    expect(validateIconSize(1024)).toBe(false);
  });

  it('should return false for 0', () => {
    expect(validateIconSize(0)).toBe(false);
  });

  it('should return false for negative numbers', () => {
    expect(validateIconSize(-192)).toBe(false);
  });
});

describe('getMaskableSafeZone', () => {
  it('should calculate correct padding for 512', () => {
    const { padding } = getMaskableSafeZone(512);
    expect(padding).toBe(51); // 512 * 0.1 = 51.2 rounded
  });

  it('should calculate correct content size for 512', () => {
    const { contentSize } = getMaskableSafeZone(512);
    expect(contentSize).toBe(410); // 512 - 51*2 = 410
  });

  it('should calculate correct padding for 192', () => {
    const { padding } = getMaskableSafeZone(192);
    expect(padding).toBe(19); // 192 * 0.1 = 19.2 rounded
  });

  it('should calculate correct content size for 192', () => {
    const { contentSize } = getMaskableSafeZone(192);
    expect(contentSize).toBe(154); // 192 - 19*2 = 154
  });

  it('should return padding + contentSize + padding = size', () => {
    const size = 512;
    const { padding, contentSize } = getMaskableSafeZone(size);
    expect(padding * 2 + contentSize).toBe(size);
  });
});
