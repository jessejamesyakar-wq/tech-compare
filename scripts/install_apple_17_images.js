const https = require('https');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const targetDir = path.join(__dirname, '..', 'public', 'images', 'phones', 'apple');

const downloads = [
  {
    name: 'iphone-17-pro-finish-select-202509-6-9inch-cosmicorange',
    targets: ['iphone-17-promax-cosmicorange.jpg', 'apple-iphone-17-pro-max.jpg']
  },
  {
    name: 'iphone-17-pro-finish-select-202509-6-9inch-deepblue',
    targets: ['iphone-17-promax-deepblue.jpg']
  },
  {
    name: 'iphone-17-pro-finish-select-202509-6-9inch-silver',
    targets: ['iphone-17-promax-silver.jpg']
  },
  {
    name: 'iphone-17-pro-finish-select-202509-6-3inch-cosmicorange',
    targets: ['iphone-17-pro-cosmicorange.jpg', 'apple-iphone-17-pro.jpg']
  },
  {
    name: 'iphone-17-pro-finish-select-202509-6-3inch-deepblue',
    targets: ['iphone-17-pro-deepblue.jpg']
  },
  {
    name: 'iphone-17-pro-finish-select-202509-6-3inch-silver',
    targets: ['iphone-17-pro-silver.jpg']
  }
];

async function fetchBuffer(appleAssetName) {
  const url = `https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/${appleAssetName}?wid=1600&hei=1600&fmt=jpeg&qlt=95`;
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Apple CDN status ${res.statusCode} for ${appleAssetName}`));
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function processAndSave(buf, targetFilenames) {
  // 1. Trim whitespace
  // 2. Add 6% proportional padding
  const img = sharp(buf);
  const trimmed = await img.trim({ background: { r: 255, g: 255, b: 255 } }).toBuffer();
  
  const trimmedMeta = await sharp(trimmed).metadata();
  const padX = Math.round(trimmedMeta.width * 0.06);
  const padY = Math.round(trimmedMeta.height * 0.06);

  const finalBuffer = await sharp(trimmed)
    .extend({
      top: padY,
      bottom: padY,
      left: padX,
      right: padX,
      background: { r: 255, g: 255, b: 255 }
    })
    .jpeg({ quality: 95 })
    .toBuffer();

  for (const filename of targetFilenames) {
    const dest = path.join(targetDir, filename);
    fs.writeFileSync(dest, finalBuffer);
    console.log(`Saved ${filename} (${finalBuffer.length} bytes, ${trimmedMeta.width + padX * 2}x${trimmedMeta.height + padY * 2})`);
  }
}

async function run() {
  for (const item of downloads) {
    console.log(`Downloading ${item.name}...`);
    const buf = await fetchBuffer(item.name);
    await processAndSave(buf, item.targets);
  }
  console.log('All Apple 17 Pro / Pro Max images updated successfully!');
}

run().catch(console.error);
