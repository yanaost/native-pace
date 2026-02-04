/**
 * PWA Icon Generation Script
 *
 * Generates app icons for PWA manifest.
 * Run with: npx ts-node scripts/generate-icons.ts
 */

import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';
import {
  ICON_BACKGROUND_COLOR,
  ICON_TEXT_COLOR,
  getIconConfigs,
  getMaskableSafeZone,
} from '../lib/utils/icon-helpers';

const ICONS_DIR = path.join(process.cwd(), 'public', 'icons');

/**
 * Creates an SVG icon with "NP" text.
 */
function createIconSvg(size: number, isMaskable: boolean): string {
  const { padding, contentSize } = getMaskableSafeZone(size);

  // For maskable icons, content should be within safe zone
  // For regular icons, use full size
  const textSize = isMaskable ? Math.round(contentSize * 0.5) : Math.round(size * 0.4);
  const centerX = size / 2;
  const centerY = size / 2;

  return `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${ICON_BACKGROUND_COLOR}"/>
      <text
        x="${centerX}"
        y="${centerY}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${textSize}"
        font-weight="bold"
        fill="${ICON_TEXT_COLOR}"
        text-anchor="middle"
        dominant-baseline="central"
      >NP</text>
    </svg>
  `.trim();
}

/**
 * Generates a single icon file.
 */
async function generateIcon(
  size: number,
  filename: string,
  isMaskable: boolean
): Promise<void> {
  const svg = createIconSvg(size, isMaskable);
  const outputPath = path.join(ICONS_DIR, filename);

  await sharp(Buffer.from(svg)).png().toFile(outputPath);

  console.log(`Generated: ${filename} (${size}x${size}${isMaskable ? ', maskable' : ''})`);
}

/**
 * Main function to generate all icons.
 */
async function main(): Promise<void> {
  // Ensure icons directory exists
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  console.log('Generating PWA icons...\n');

  const configs = getIconConfigs();

  for (const config of configs) {
    await generateIcon(config.size, config.filename, config.purpose === 'maskable');
  }

  console.log('\nDone! Icons generated in public/icons/');
}

main().catch((error) => {
  console.error('Error generating icons:', error);
  process.exit(1);
});
