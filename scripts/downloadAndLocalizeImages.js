const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const datasets = [
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts' },
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts' }
];

// Fallbacks per category in case of download failure
const localFallbacks = {
  tvs: '/images/products/tvs/lg-55qned81b6a-1.jpg',
  monitors: '/images/products/tvs/lg-55qned81b6a-1.jpg',
  smartphones: '/images/phones/apple/iphone-16-pro-natural.jpg',
  laptops: '/images/products/laptops/apple-macbook-air-m3.jpg',
  tablets: '/images/phones/apple/iphone-16-pro-natural.jpg',
  smartwatches: '/images/phones/apple/iphone-16-pro-natural.jpg',
  headphones: '/images/headphones/jbl-tune-520bt.jpg',
  appliances: '/images/products/appliances/dyson-v15-detect.jpg',
  consoles: '/images/products/appliances/dyson-v15-detect.jpg'
};

function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      const req = client.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.google.com/'
        },
        timeout: 7000
      }, (res) => {
        if (res.statusCode === 200) {
          const fileStream = fs.createWriteStream(destPath);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close();
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
    } catch(e) {
      resolve(false);
    }
  });
}

async function processAll() {
  console.log('=== STARTING EXTERNAL IMAGE LOCALIZATION ===');

  for (const d of datasets) {
    const filePath = path.join(__dirname, '../src/lib', d.file);
    if (!fs.existsSync(filePath)) continue;

    const dirTarget = path.join(__dirname, `../public/images/products/${d.name}`);
    if (!fs.existsSync(dirTarget)) {
      fs.mkdirSync(dirTarget, { recursive: true });
    }

    let products = [];
    let fileContent = '';
    let matchHeader = '';

    if (d.type === 'json') {
      products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      fileContent = fs.readFileSync(filePath, 'utf8');
      const match = fileContent.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
      if (match) {
        matchHeader = match[1];
        try {
          products = JSON.parse(match[2]);
        } catch(e) {
          console.error('Failed to parse', d.file);
          continue;
        }
      }
    }

    let modifiedCount = 0;

    for (const p of products) {
      const isExternalImage = p.image && (p.image.startsWith('http://') || p.image.startsWith('https://'));
      const hasExternalImages = Array.isArray(p.images) && p.images.some(img => img && (img.startsWith('http://') || img.startsWith('https://')));

      if (isExternalImage || hasExternalImages) {
        const destRelative = `/images/products/${d.name}/${p.id}.jpg`;
        const destAbsolute = path.join(__dirname, `../public/images/products/${d.name}/${p.id}.jpg`);

        let success = false;
        if (p.image && (p.image.startsWith('http://') || p.image.startsWith('https://'))) {
          success = await downloadImage(p.image, destAbsolute);
        }

        if (success && fs.existsSync(destAbsolute) && fs.statSync(destAbsolute).size > 500) {
          p.image = destRelative;
          p.images = [destRelative];
        } else {
          // Fallback to local category image
          const fallback = localFallbacks[d.name] || '/images/products/tvs/lg-55qned81b6a-1.jpg';
          p.image = fallback;
          p.images = [fallback];
        }

        modifiedCount++;
      }
    }

    // Save back file
    if (d.type === 'json') {
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
    } else if (matchHeader) {
      const newArrayStr = JSON.stringify(products, null, 2);
      const newContent = fileContent.replace(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*\[[\s\S]*\];/, `export const ${matchHeader}: Product[] = ${newArrayStr};`);
      fs.writeFileSync(filePath, newContent, 'utf8');
    }

    console.log(`[${d.name}] Processed and localized ${modifiedCount} products in ${d.file}`);
  }

  console.log('=== EXTERNAL IMAGE LOCALIZATION COMPLETE ===');
}

processAll();
