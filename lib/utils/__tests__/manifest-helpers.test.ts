import * as fs from 'fs';
import * as path from 'path';
import {
  REQUIRED_MANIFEST_FIELDS,
  VALID_DISPLAY_MODES,
  VALID_ORIENTATIONS,
  validateManifest,
  validateIcons,
  isValidColor,
  hasMaskableIcon,
  type PWAManifest,
} from '../manifest-helpers';

describe('REQUIRED_MANIFEST_FIELDS', () => {
  it('should include essential PWA fields', () => {
    expect(REQUIRED_MANIFEST_FIELDS).toContain('name');
    expect(REQUIRED_MANIFEST_FIELDS).toContain('short_name');
    expect(REQUIRED_MANIFEST_FIELDS).toContain('start_url');
    expect(REQUIRED_MANIFEST_FIELDS).toContain('display');
    expect(REQUIRED_MANIFEST_FIELDS).toContain('icons');
  });
});

describe('VALID_DISPLAY_MODES', () => {
  it('should include standalone', () => {
    expect(VALID_DISPLAY_MODES).toContain('standalone');
  });

  it('should include all standard display modes', () => {
    expect(VALID_DISPLAY_MODES).toContain('fullscreen');
    expect(VALID_DISPLAY_MODES).toContain('minimal-ui');
    expect(VALID_DISPLAY_MODES).toContain('browser');
  });
});

describe('isValidColor', () => {
  it('should return true for valid 6-digit hex', () => {
    expect(isValidColor('#ffffff')).toBe(true);
    expect(isValidColor('#3b82f6')).toBe(true);
    expect(isValidColor('#000000')).toBe(true);
  });

  it('should return true for valid 3-digit hex', () => {
    expect(isValidColor('#fff')).toBe(true);
    expect(isValidColor('#000')).toBe(true);
  });

  it('should return true for 8-digit hex with alpha', () => {
    expect(isValidColor('#ffffff00')).toBe(true);
    expect(isValidColor('#00000080')).toBe(true);
  });

  it('should return false for invalid colors', () => {
    expect(isValidColor('white')).toBe(false);
    expect(isValidColor('rgb(255,255,255)')).toBe(false);
    expect(isValidColor('#gggggg')).toBe(false);
    expect(isValidColor('ffffff')).toBe(false);
    expect(isValidColor(null)).toBe(false);
    expect(isValidColor(undefined)).toBe(false);
  });
});

describe('validateIcons', () => {
  const validIcons = [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
  ];

  it('should return no errors for valid icons', () => {
    const errors = validateIcons(validIcons);
    expect(errors).toHaveLength(0);
  });

  it('should error if icons array is empty', () => {
    const errors = validateIcons([]);
    expect(errors).toContain('icons array must not be empty');
  });

  it('should error if missing 192x192 icon', () => {
    const icons = [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }];
    const errors = validateIcons(icons);
    expect(errors).toContain('icons should include a 192x192 icon');
  });

  it('should error if missing 512x512 icon', () => {
    const icons = [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }];
    const errors = validateIcons(icons);
    expect(errors).toContain('icons should include a 512x512 icon');
  });

  it('should error if icon missing src', () => {
    const icons = [
      { sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ];
    const errors = validateIcons(icons as any);
    expect(errors.some((e) => e.includes('src'))).toBe(true);
  });

  it('should error if icon missing sizes', () => {
    const icons = [
      { src: '/icon-192.png', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ];
    const errors = validateIcons(icons as any);
    expect(errors.some((e) => e.includes('sizes'))).toBe(true);
  });

  it('should error if icon missing type', () => {
    const icons = [
      { src: '/icon-192.png', sizes: '192x192' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ];
    const errors = validateIcons(icons as any);
    expect(errors.some((e) => e.includes('type'))).toBe(true);
  });
});

describe('validateManifest', () => {
  const validManifest: PWAManifest = {
    name: 'Test App',
    short_name: 'Test',
    start_url: '/dashboard',
    display: 'standalone',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };

  it('should return valid for correct manifest', () => {
    const result = validateManifest(validManifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return invalid for null', () => {
    const result = validateManifest(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Manifest must be an object');
  });

  it('should return invalid for non-object', () => {
    const result = validateManifest('string');
    expect(result.valid).toBe(false);
  });

  it('should error for missing name', () => {
    const manifest = { ...validManifest, name: undefined };
    const result = validateManifest(manifest);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('name'))).toBe(true);
  });

  it('should error for missing short_name', () => {
    const manifest = { ...validManifest, short_name: undefined };
    const result = validateManifest(manifest);
    expect(result.valid).toBe(false);
  });

  it('should error for short_name > 12 characters', () => {
    const manifest = { ...validManifest, short_name: 'VeryLongAppName' };
    const result = validateManifest(manifest);
    expect(result.errors.some((e) => e.includes('12 characters'))).toBe(true);
  });

  it('should error for invalid display mode', () => {
    const manifest = { ...validManifest, display: 'invalid' };
    const result = validateManifest(manifest);
    expect(result.errors.some((e) => e.includes('display'))).toBe(true);
  });

  it('should accept valid display modes', () => {
    for (const mode of VALID_DISPLAY_MODES) {
      const manifest = { ...validManifest, display: mode };
      const result = validateManifest(manifest);
      expect(result.errors.filter((e) => e.includes('display'))).toHaveLength(0);
    }
  });

  it('should error for invalid orientation', () => {
    const manifest = { ...validManifest, orientation: 'invalid' };
    const result = validateManifest(manifest);
    expect(result.errors.some((e) => e.includes('orientation'))).toBe(true);
  });

  it('should accept valid orientations', () => {
    for (const orientation of VALID_ORIENTATIONS) {
      const manifest = { ...validManifest, orientation };
      const result = validateManifest(manifest);
      expect(result.errors.filter((e) => e.includes('orientation'))).toHaveLength(0);
    }
  });

  it('should error for invalid background_color', () => {
    const manifest = { ...validManifest, background_color: 'white' };
    const result = validateManifest(manifest);
    expect(result.errors.some((e) => e.includes('background_color'))).toBe(true);
  });

  it('should error for invalid theme_color', () => {
    const manifest = { ...validManifest, theme_color: 'blue' };
    const result = validateManifest(manifest);
    expect(result.errors.some((e) => e.includes('theme_color'))).toBe(true);
  });

  it('should accept valid colors', () => {
    const manifest = {
      ...validManifest,
      background_color: '#ffffff',
      theme_color: '#3b82f6',
    };
    const result = validateManifest(manifest);
    expect(result.errors.filter((e) => e.includes('color'))).toHaveLength(0);
  });
});

describe('hasMaskableIcon', () => {
  it('should return true if has maskable icon', () => {
    const manifest: PWAManifest = {
      name: 'Test',
      short_name: 'Test',
      start_url: '/',
      display: 'standalone',
      icons: [
        { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    };
    expect(hasMaskableIcon(manifest)).toBe(true);
  });

  it('should return false if no maskable icon', () => {
    const manifest: PWAManifest = {
      name: 'Test',
      short_name: 'Test',
      start_url: '/',
      display: 'standalone',
      icons: [
        { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      ],
    };
    expect(hasMaskableIcon(manifest)).toBe(false);
  });
});

describe('public/manifest.json', () => {
  let manifest: PWAManifest;

  beforeAll(() => {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const content = fs.readFileSync(manifestPath, 'utf-8');
    manifest = JSON.parse(content);
  });

  it('should be valid JSON', () => {
    expect(manifest).toBeDefined();
    expect(typeof manifest).toBe('object');
  });

  it('should pass validation', () => {
    const result = validateManifest(manifest);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should have correct name', () => {
    expect(manifest.name).toBe('NativePace - Understand Native English');
  });

  it('should have correct short_name', () => {
    expect(manifest.short_name).toBe('NativePace');
    expect(manifest.short_name.length).toBeLessThanOrEqual(12);
  });

  it('should have description', () => {
    expect(manifest.description).toBeDefined();
    expect(manifest.description?.length).toBeGreaterThan(0);
  });

  it('should have start_url pointing to dashboard', () => {
    expect(manifest.start_url).toBe('/dashboard');
  });

  it('should use standalone display', () => {
    expect(manifest.display).toBe('standalone');
  });

  it('should have theme_color', () => {
    expect(manifest.theme_color).toBe('#3b82f6');
  });

  it('should have background_color', () => {
    expect(manifest.background_color).toBe('#ffffff');
  });

  it('should have at least 3 icons', () => {
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);
  });

  it('should have 192x192 icon', () => {
    const has192 = manifest.icons.some((icon) => icon.sizes === '192x192');
    expect(has192).toBe(true);
  });

  it('should have 512x512 icon', () => {
    const has512 = manifest.icons.some((icon) => icon.sizes === '512x512');
    expect(has512).toBe(true);
  });

  it('should have maskable icon', () => {
    expect(hasMaskableIcon(manifest)).toBe(true);
  });
});
