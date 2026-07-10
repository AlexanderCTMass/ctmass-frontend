/* eslint-disable */
// Generates PWA icons and iOS splash screens from existing brand assets.
// Icon source:   public/apple-touch-icon.png
// Splash source: public/assets/logo.png (centered on white)
// Run: node scripts/generate-pwa-assets.js

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const ICON_SRC = path.join(ROOT, 'public', 'apple-touch-icon.png');
const LOGO_SRC = path.join(ROOT, 'public', 'assets', 'logo.png');
const OUT = path.join(ROOT, 'public', 'icons');

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

const splashSizes = [
  [1290, 2796],
  [1284, 2778],
  [1179, 2556],
  [1170, 2532],
  [1125, 2436],
  [828, 1792],
  [750, 1334],
];

async function makeIcon(size, fileName) {
  const buf = await sharp(ICON_SRC)
    .resize(size, size, { fit: 'cover', kernel: 'lanczos3' })
    .flatten({ background: WHITE })
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, fileName), buf);
}

async function makeMaskable(size, fileName) {
  const inner = Math.round(size * 0.6);
  const logo = await sharp(ICON_SRC)
    .resize(inner, inner, { fit: 'contain', background: WHITE, kernel: 'lanczos3' })
    .toBuffer();
  const buf = await sharp({
    create: { width: size, height: size, channels: 4, background: WHITE },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, fileName), buf);
}

async function makeSplash(w, h) {
  const logoSize = Math.round(Math.min(w, h) * 0.35);
  const logo = await sharp(LOGO_SRC)
    .resize(logoSize, logoSize, { fit: 'contain', background: WHITE, kernel: 'lanczos3' })
    .toBuffer();
  const buf = await sharp({
    create: { width: w, height: h, channels: 4, background: WHITE },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer();
  fs.writeFileSync(path.join(OUT, `apple-splash-${w}-${h}.png`), buf);
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  await makeIcon(192, 'icon-192.png');
  await makeIcon(512, 'icon-512.png');
  await makeMaskable(512, 'maskable-512.png');
  for (const [w, h] of splashSizes) {
    await makeSplash(w, h);
  }
  console.log('PWA assets generated in public/icons');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
