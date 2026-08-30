const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, targetPath) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const file = fs.createWriteStream(targetPath);
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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

// Queries for DuckDuckGo to get the direct canonical image link for the remaining models
const remaining = [
  { id: 'samsung-samsung-galaxy-z-flip-5-84', query: 'site:epey.com samsung galaxy z flip 5' },
  { id: 'samsung-samsung-galaxy-z-flip-4-69', query: 'site:epey.com samsung galaxy z flip 4' },
  { id: 'samsung-samsung-galaxy-z-fold-3-55', query: 'site:epey.com samsung galaxy z fold 3' },
  { id: 'samsung-samsung-galaxy-s23-81', query: 'site:epey.com samsung galaxy s23 plus' },
  { id: 'samsung-samsung-galaxy-s23-80', query: 'site:epey.com samsung galaxy s23' },
  { id: 'samsung-samsung-galaxy-s23-fe-83', query: 'site:epey.com samsung galaxy s23 fe' },
  { id: 'samsung-samsung-galaxy-s21-fe-53', query: 'site:epey.com samsung galaxy s21 fe' },
  { id: 'samsung-samsung-galaxy-s21-ultra-52', query: 'site:epey.com samsung galaxy s21 ultra' },
  { id: 'samsung-samsung-galaxy-s21-50', query: 'site:epey.com samsung galaxy s21' },
  { id: 'samsung-samsung-galaxy-note-20-48', query: 'site:epey.com samsung galaxy note 20' },
  { id: 'samsung-samsung-galaxy-m55-5g-106', query: 'site:epey.com samsung galaxy m55' },
  { id: 'samsung-samsung-galaxy-m15-5g-104', query: 'site:epey.com samsung galaxy m15' },
  { id: 'samsung-samsung-galaxy-a34-5g-88', query: 'site:epey.com samsung galaxy a34' },
  { id: 'samsung-samsung-galaxy-a24-87', query: 'site:epey.com samsung galaxy a24' },
  { id: 'samsung-samsung-galaxy-a14-86', query: 'site:epey.com samsung galaxy a14' },
  { id: 'samsung-samsung-galaxy-a53-5g-74', query: 'site:epey.com samsung galaxy a53' },
  { id: 'samsung-samsung-galaxy-a33-5g-73', query: 'site:epey.com samsung galaxy a33' },
  { id: 'samsung-samsung-galaxy-a32-59', query: 'site:epey.com samsung galaxy a32' },
  { id: 'samsung-samsung-galaxy-a22-58', query: 'site:epey.com samsung galaxy a22' }
];

(async () => {
  console.log('=== HARVESTING REMAINING HIGH-PRIORITY MODELS ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  const results = [];

  for (const item of remaining) {
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(item.query)}`;
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise(r => setTimeout(r, 500));

      const directLink = await page.evaluate(() => {
        const link = document.querySelector('a.result__url, .result__snippet a, a[href*="epey.com/akilli-telefonlar/samsung-galaxy"]');
        return link ? link.href : null;
      });

      if (directLink) {
        let cleanUrl = directLink;
        if (cleanUrl.includes('uddg=')) {
          cleanUrl = decodeURIComponent(cleanUrl.split('uddg=')[1].split('&')[0]);
        }

        if (cleanUrl.includes('epey.com')) {
          console.log(`Navigating to: ${cleanUrl}...`);
          await page.goto(cleanUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
          await new Promise(r => setTimeout(r, 600));

          const html = await page.content();
          const matches = html.match(/https:\/\/resim\.epey\.com\/[0-9]+\/(?:b_|m_|s_|k_|z_)[^\s\"\'\<\>\&]+/gi);

          if (matches && matches.length > 0) {
            const prod = matches.find(m => !m.includes('logo') && !m.includes('site/') && !m.includes('grup/')) || matches[0];
            const bigImg = prod.replace('/m_', '/b_').replace('/s_', '/b_').replace('/k_', '/b_').replace('/z_', '/b_');

            const filename = `${item.id}.png`;
            const dest = path.join(epeyDir, filename);

            const ok = await downloadFile(bigImg, dest);
            if (ok) {
              const localPath = `/images/phones/samsung/epey/${filename}`;
              console.log(`  ✅ SAVED: ${localPath} (${bigImg})`);
              results.push({ id: item.id, image: localPath });
            }
          }
        }
      }
    } catch (e) {
      console.error(`  ❌ Error for ${item.id}:`, e.message);
    }
  }

  await browser.close();
  console.log(`\n=== DOWNLOADED ${results.length} ADDITIONAL PHOTOS! ===`);
})();
