const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log('======================================================');
console.log('⚡ TECH-COMPARE BULK IMAGE OPTIMIZATION PIPELINE ⚡');
console.log('======================================================\n');

const imagesDir = path.join(process.cwd(), 'public/images');

function getLargeImages(dir) {
  let matched = [];
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      matched = matched.concat(getLargeImages(full));
    } else if (entry.endsWith('.jpg') || entry.endsWith('.jpeg') || entry.endsWith('.png') || entry.endsWith('.webp')) {
      if (stat.size > 200 * 1024) { // Larger than 200 KB
        matched.push({ path: full, sizeKb: Math.round(stat.size / 1024), ext: path.extname(full).toLowerCase() });
      }
    }
  }
  return matched;
}

const largeImages = getLargeImages(imagesDir);
console.log(`Found ${largeImages.length} images exceeding 200 KB threshold.`);

async function optimizeImages() {
  let totalSavedKb = 0;
  let optimizedCount = 0;

  for (const item of largeImages) {
    try {
      const buffer = fs.readFileSync(item.path);
      const isPng = item.ext === '.png';

      let pipeline = sharp(buffer).resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      });

      let optimizedBuffer;
      if (isPng) {
        optimizedBuffer = await pipeline.png({ quality: 85, compressionLevel: 8 }).toBuffer();
      } else {
        optimizedBuffer = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
      }

      if (optimizedBuffer.length < buffer.length) {
        fs.writeFileSync(item.path, optimizedBuffer);
        const newSizeKb = Math.round(optimizedBuffer.length / 1024);
        const savedKb = item.sizeKb - newSizeKb;
        totalSavedKb += savedKb;
        optimizedCount++;
      }
    } catch (err) {
      console.error(`Failed to optimize ${item.path}:`, err.message);
    }
  }

  console.log(`\n🎉 Successfully compressed ${optimizedCount} images!`);
  console.log(`📊 Total bandwidth saved: ${(totalSavedKb / 1024).toFixed(2)} MB!`);
}

optimizeImages();
