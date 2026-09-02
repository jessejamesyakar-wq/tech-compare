const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function processFavicon() {
  const inputPath = path.join(process.cwd(), 'public', 'Emblem.jpg');
  const fallbackPath = path.join(process.cwd(), 'public', 'emblem.png');
  const sourceFile = fs.existsSync(inputPath) ? inputPath : fallbackPath;

  const fileBuffer = fs.readFileSync(sourceFile);
  const metadata = await sharp(fileBuffer).metadata();
  console.log('Input dimensions:', metadata.width, metadata.height);

  const size = Math.min(metadata.width, metadata.height);
  const r = size / 2;

  // Create a perfectly smooth anti-aliased SVG circle mask
  const circleSvg = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${r}" cy="${r}" r="${r - 3}" fill="white" /></svg>`
  );

  // Apply composite with dest-in to make everything outside the circle 100% transparent!
  const circularImageBuffer = await sharp(fileBuffer)
    .resize(size, size, { fit: 'cover' })
    .composite([
      {
        input: circleSvg,
        blend: 'dest-in'
      }
    ])
    .png()
    .toBuffer();

  // Create 32x32 and 192x192 icons
  const icon32 = await sharp(circularImageBuffer).resize(32, 32).png().toBuffer();
  const icon192 = await sharp(circularImageBuffer).resize(192, 192).png().toBuffer();
  const icon512 = await sharp(circularImageBuffer).resize(512, 512).png().toBuffer();

  // Write targets
  fs.writeFileSync(path.join(process.cwd(), 'public', 'emblem.png'), circularImageBuffer);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.png'), icon32);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.ico'), icon32);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'apple-touch-icon.png'), icon192);
  fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'icon.png'), icon192);
  fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'apple-icon.png'), icon192);
  fs.writeFileSync(path.join(process.cwd(), 'src', 'app', 'favicon.ico'), icon32);

  console.log('✅ Successfully generated transparent circular favicons across all destinations!');
}

processFavicon().catch(err => {
  console.error('Error generating favicon:', err);
  process.exit(1);
});
