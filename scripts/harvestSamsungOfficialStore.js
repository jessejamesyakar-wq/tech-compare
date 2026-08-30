const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, targetPath) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    let cleanUrl = url.startsWith('//') ? `https:${url}` : url;
    const file = fs.createWriteStream(targetPath);
    https.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.samsung.com/'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
      } else {
        file.close();
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
        resolve(false);
      }
    }).on('error', () => {
      file.close();
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      resolve(false);
    });
  });
}

(async () => {
  console.log('=== SCRAPING SAMSUNG TURKEY OFFICIAL WEBSITE & PRODUCT CATALOG ===\n');

  const officialDir = path.join(__dirname, '../public/images/phones/samsung/official');
  if (!fs.existsSync(officialDir)) fs.mkdirSync(officialDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const samsungUrls = [
    'https://www.samsung.com/tr/smartphones/galaxy-s/',
    'https://www.samsung.com/tr/smartphones/galaxy-z/',
    'https://www.samsung.com/tr/smartphones/galaxy-a/',
    'https://www.samsung.com/tr/smartphones/galaxy-m/',
    'https://www.samsung.com/tr/smartphones/all-smartphones/'
  ];

  const harvestedOfficial = [];

  for (const sUrl of samsungUrls) {
    try {
      console.log(`Connecting to: ${sUrl}...`);
      await page.goto(sUrl, { waitUntil: 'networkidle2', timeout: 35000 });
      await new Promise(r => setTimeout(r, 2000));

      const items = await page.evaluate(() => {
        const found = [];
        // Samsung product cards
        document.querySelectorAll('.pd03-product-card, .product-card, [data-modelcode], .item-card').forEach(card => {
          const titleEl = card.querySelector('.pd03-product-card__product-name, .product-name, h3, h4, a');
          const imgEl = card.querySelector('img');
          const modelCode = card.getAttribute('data-modelcode') || '';

          if (titleEl && imgEl) {
            const name = titleEl.innerText.trim();
            const src = imgEl.src || imgEl.getAttribute('data-src') || '';
            if (name.length > 3 && src.includes('images.samsung.com')) {
              found.push({ name, modelCode, src });
            }
          }
        });

        // Also extract any images.samsung.com image with product alt
        document.querySelectorAll('img[src*="images.samsung.com/is/image/samsung"]').forEach(img => {
          const alt = img.alt || '';
          const src = img.src || '';
          if (alt.length > 5 && src.includes('smartphones')) {
            found.push({ name: alt, modelCode: '', src });
          }
        });

        return found;
      });

      console.log(`  Found ${items.length} official Samsung products on this page.`);
      harvestedOfficial.push(...items);

    } catch (e) {
      console.error(`  ❌ Failed on ${sUrl}:`, e.message);
    }
  }

  await browser.close();

  // Deduplicate
  const seen = new Set();
  const uniqueItems = [];
  harvestedOfficial.forEach(it => {
    const key = `${it.name}_${it.src}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(it);
    }
  });

  console.log(`\nTotal unique official Samsung products found: ${uniqueItems.length}`);

  let dlSuccess = 0;
  for (const it of uniqueItems) {
    const slug = it.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `${slug}.png`;
    const targetPath = path.join(officialDir, filename);

    // Get high-res version from Samsung CDN
    let bigUrl = it.src;
    if (bigUrl.includes('?$')) {
      bigUrl = bigUrl.split('?$')[0] + '?$1300_1038_PNG$';
    }

    const ok = await downloadFile(bigUrl, targetPath);
    if (ok) {
      it.localImage = `/images/phones/samsung/official/${filename}`;
      dlSuccess++;
      console.log(`  ✅ [${dlSuccess}] Downloaded Official Samsung: ${it.name} -> ${it.localImage}`);
    }
  }

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'samsung_official_harvest.json'),
    JSON.stringify(uniqueItems, null, 2),
    'utf8'
  );

  console.log(`\n=== SAMSUNG OFFICIAL HARVEST COMPLETED: ${dlSuccess} PHOTOS DOWNLOADED! ===`);
})();
