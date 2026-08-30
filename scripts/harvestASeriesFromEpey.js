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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.epey.com/'
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

const aSeriesModels = [
  { id: 'samsung-samsung-galaxy-a55-5g-103', query: 'Samsung Galaxy A55' },
  { id: 'samsung-samsung-galaxy-a35-5g-102', query: 'Samsung Galaxy A35' },
  { id: 'samsung-samsung-galaxy-a25-5g-101', query: 'Samsung Galaxy A25' },
  { id: 'samsung-samsung-galaxy-a15-100', query: 'Samsung Galaxy A15' },
  { id: 'samsung-samsung-galaxy-a05-99', query: 'Samsung Galaxy A05s' },
  { id: 'samsung-samsung-galaxy-a54-5g-89', query: 'Samsung Galaxy A54' },
  { id: 'samsung-samsung-galaxy-a34-5g-88', query: 'Samsung Galaxy A34' },
  { id: 'samsung-samsung-galaxy-a24-87', query: 'Samsung Galaxy A24' },
  { id: 'samsung-samsung-galaxy-a14-86', query: 'Samsung Galaxy A14' },
  { id: 'samsung-samsung-galaxy-a73-5g-75', query: 'Samsung Galaxy A73' },
  { id: 'samsung-samsung-galaxy-a53-5g-74', query: 'Samsung Galaxy A53' },
  { id: 'samsung-samsung-galaxy-a33-5g-73', query: 'Samsung Galaxy A33' },
  { id: 'samsung-samsung-galaxy-a23-72', query: 'Samsung Galaxy A23' },
  { id: 'samsung-samsung-galaxy-a13-71', query: 'Samsung Galaxy A13' },
  { id: 'samsung-samsung-galaxy-a72-62', query: 'Samsung Galaxy A72' },
  { id: 'samsung-samsung-galaxy-a52s-5g-61', query: 'Samsung Galaxy A52s' },
  { id: 'samsung-samsung-galaxy-a52-60', query: 'Samsung Galaxy A52' },
  { id: 'samsung-samsung-galaxy-a32-59', query: 'Samsung Galaxy A32' },
  { id: 'samsung-samsung-galaxy-a22-58', query: 'Samsung Galaxy A22' },
  { id: 'samsung-samsung-galaxy-a12-57', query: 'Samsung Galaxy A12' },
  { id: 'samsung-samsung-galaxy-a71-45', query: 'Samsung Galaxy A71' },
  { id: 'samsung-samsung-galaxy-a51-44', query: 'Samsung Galaxy A51' },
  { id: 'samsung-samsung-galaxy-a70-26', query: 'Samsung Galaxy A70' },
  { id: 'samsung-samsung-galaxy-a50-24', query: 'Samsung Galaxy A50' },
  { id: 'samsung-samsung-galaxy-a30-22', query: 'Samsung Galaxy A30' },
  { id: 'samsung-samsung-galaxy-a20-21', query: 'Samsung Galaxy A20' },
  { id: 'samsung-samsung-galaxy-a10-20', query: 'Samsung Galaxy A10' }
];

(async () => {
  console.log('=== HARVESTING GALAXY A-SERIES EPEY CANONICAL URLS VIA BING/DDG ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const harvested = [];

  for (const item of aSeriesTargets = aSeriesModels) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=site:epey.com/akilli-telefonlar/+${encodeURIComponent(item.query)}`;
      console.log(`Searching DuckDuckGo for: "${item.query}"...`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      const epeyUrl = await page.evaluate(() => {
        const link = document.querySelector('a.result__url, .result__snippet a, a[href*="epey.com/akilli-telefonlar/samsung-galaxy-a"]');
        return link ? link.href : null;
      });

      console.log(`  Epey URL for ${item.query}:`, epeyUrl);

      if (epeyUrl && epeyUrl.includes('epey.com')) {
        await page.goto(epeyUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
        await new Promise(r => setTimeout(r, 600));

        const imgUrl = await page.evaluate(() => {
          const og = document.querySelector('meta[property="og:image"]');
          if (og && og.content) return og.content;
          const img = document.querySelector('img[src*="resim.epey.com"]');
          return img ? (img.getAttribute('src') || img.getAttribute('data-src')) : null;
        });

        if (imgUrl) {
          const bigImg = imgUrl.replace('/k_', '/b_').replace('/m_', '/b_').replace('/s_', '/b_');
          const filename = `${item.id}.png`;
          const targetPath = path.join(epeyDir, filename);

          const ok = await downloadFile(bigImg, targetPath);
          if (ok) {
            const localSaved = `/images/phones/samsung/epey/${filename}`;
            console.log(`  ✅ SAVED EPEY PHOTO: ${localSaved} (from ${bigImg})`);
            harvested.push({
              id: item.id,
              name: item.query,
              image: localSaved
            });
          }
        }
      }

    } catch (e) {
      console.error(`  ❌ Failed for ${item.query}:`, e.message);
    }
  }

  await browser.close();

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'epey_a_series_harvested.json'),
    JSON.stringify(harvested, null, 2),
    'utf8'
  );

  console.log(`\n=== A-SERIES EPEY HARVEST COMPLETE: ${harvested.length} / ${aSeriesModels.length} SAVED! ===`);
})();
