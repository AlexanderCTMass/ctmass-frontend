/* eslint-disable */
// Generates the advertising QR code that points to https://ctmass.com/goto with the CTMASS logo in the center.
// Run: node scripts/generate-goto-qr.js

const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { QRCodeSVG } = require('qrcode.react');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'qr');
const URL = 'https://ctmass.com/goto';
const SIZE = 2048;
const LOGO_SIZE = Math.round(SIZE * 0.24);

const variants = [
    { name: 'ctmass-goto-qr', logo: path.join(ROOT, 'mobile', 'assets', 'images', 'logo-mark.png') },
    { name: 'ctmass-goto-qr-web-logo', logo: path.join(ROOT, 'public', 'assets', 'logo.png') },
];

async function logoDataUrl(file) {
    const buf = await sharp(file)
        .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 }, kernel: 'lanczos3' })
        .png()
        .toBuffer();
    return `data:image/png;base64,${buf.toString('base64')}`;
}

async function generate({ name, logo }) {
    const svg = renderToStaticMarkup(
        React.createElement(QRCodeSVG, {
            value: URL,
            size: SIZE,
            level: 'H',
            marginSize: 4,
            bgColor: '#ffffff',
            fgColor: '#000000',
            xmlns: 'http://www.w3.org/2000/svg',
            imageSettings: {
                src: await logoDataUrl(logo),
                height: LOGO_SIZE,
                width: LOGO_SIZE,
                excavate: true,
            },
        })
    );
    fs.writeFileSync(path.join(OUT, `${name}.svg`), svg);
    await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `${name}.png`));
    console.log(`Generated ${name}.svg / ${name}.png`);
}

(async () => {
    fs.mkdirSync(OUT, { recursive: true });
    for (const variant of variants) {
        await generate(variant);
    }
})();
