const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadCdnImage(url, targetPath) {
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

const aModels = [
  { id: 'samsung-samsung-galaxy-a55-5g-103', query: 'samsung galaxy a55' },
  { id: 'samsung-samsung-galaxy-a35-5g-102', query: 'samsung galaxy a35' },
  { id: 'samsung-samsung-galaxy-a25-5g-101', query: 'samsung galaxy a25' },
  { id: 'samsung-samsung-galaxy-a15-100', query: 'samsung galaxy a15' },
  { id: 'samsung-samsung-galaxy-a05-99', query: 'samsung galaxy a05s' },
  { id: 'samsung-samsung-galaxy-a54-5g-89', query: 'samsung galaxy a54' },
  { id: 'samsung-samsung-galaxy-a34-5g-88', query: 'samsung galaxy a34' },
  { id: 'samsung-samsung-galaxy-a24-87', query: 'samsung galaxy a24' },
  { id: 'samsung-samsung-galaxy-a14-86', query: 'samsung galaxy a14' },
  { id: 'samsung-samsung-galaxy-a73-5g-75', query: 'samsung galaxy a73' },
  { id: 'samsung-samsung-galaxy-a53-5g-74', query: 'samsung galaxy a53' },
  { id: 'samsung-samsung-galaxy-a33-5g-73', query: 'samsung galaxy a33' },
  { id: 'samsung-samsung-galaxy-a23-72', query: 'samsung galaxy a23' },
  { id: 'samsung-samsung-galaxy-a13-71', query: 'samsung galaxy a13' },
  { id: 'samsung-samsung-galaxy-a72-62', query: 'samsung galaxy a72' },
  { id: 'samsung-samsung-galaxy-a52s-5g-61', query: 'samsung galaxy a52s' },
  { id: 'samsung-samsung-galaxy-a52-60', query: 'samsung galaxy a52' },
  { id: 'samsung-samsung-galaxy-a32-59', query: 'samsung galaxy a32' },
  { id: 'samsung-samsung-galaxy-a22-58', query: 'samsung galaxy a22' },
  { id: 'samsung-samsung-galaxy-a12-57', query: 'samsung galaxy a12' },
  { id: 'samsung-samsung-galaxy-a71-45', query: 'samsung galaxy a71' },
  { id: 'samsung-samsung-galaxy-a51-44', query: 'samsung galaxy a51' },
  { id: 'samsung-samsung-galaxy-a70-26', query: 'samsung galaxy a70' },
  { id: 'samsung-samsung-galaxy-a50-24', query: 'samsung galaxy a50' },
  { id: 'samsung-samsung-galaxy-a30-22', query: 'samsung galaxy a30' },
  { id: 'samsung-samsung-galaxy-a20-21', query: 'samsung galaxy a20' },
  { id: 'samsung-samsung-galaxy-a10-20', query: 'samsung galaxy a10' }
];

(async () => {
  console.log('=== HARVESTING EPEY CDN IMAGES VIA DUCKDUCKGO ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const harvested = [];

  for (const item of aModels) {
    try {
      const query = `site:resim.epey.com ${item.query}`;
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      console.log(`Searching: "${query}"...`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await new Promise(r => setTimeout(r, 600));

      const foundUrls = await page.evaluate(() => {
        const links = [];
        document.querySelectorAll('a').forEach(a => {
          const href = a.href || '';
          if (href.includes('resim.epey.com') && !href.includes('logo') && !href.includes('site/') && !href.includes('grup/')) {
            links.push(href);
          }
          const text = a.innerText || '';
          const match = text.match(/https:\/\/resim\.epey\.com\/[^\s]+/);
          if (match) links.push(match[0]);
        });

        // Also check snippets
        const snippetText = document.body.innerText;
        const matches = snippetText.match(/https:\/\/resim\.epey\.com\/[0-9]+\/[^\s\)\"\'\<\>]+/g);
        if (matches) links.push(...matches);

        return Array.from(new Set(links));
      });

      console.log(`  Found ${foundUrls.length} CDN URLs`);

      let saved = false;
      for (let raw of foundUrls) {
        // Clean URL
        let clean = raw;
        if (clean.includes('uddg=')) {
          clean = decodeURIComponent(clean.split('uddg=')[1].split('&')[0]);
        }
        if (clean.includes('resim.epey.com')) {
          const bigUrl = clean.replace('/s_', '/b_').replace('/m_', '/b_').replace('/k_', '/b_').replace('/z_', '/b_');
          const filename = `${item.id}.png`;
          const targetPath = path.join(epeyDir, filename);

          const ok = await downloadCdnImage(bigUrl, targetPath);
          if (ok) {
            const localPath = `/images/phones/samsung/epey/${filename}`;
            console.log(`  ✅ SAVED EPEY PHOTO: ${localPath} (${bigUrl})`);
            harvested.push({
              id: item.id,
              name: item.query,
              image: localPath,
              sourceUrl: bigUrl
            });
            saved = true;
            break;
          }
        }
      }

      if (!saved) {
        console.log(`  ⚠️ Could not download CDN image for ${item.query}`);
      }

    } catch (e) {
      console.error(`  ❌ Error on ${item.query}:`, e.message);
    }
  }

  await browser.close();

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'epey_a_series_cdn_harvested.json'),
    JSON.stringify(harvested, null, 2),
    'utf8'
  );

  console.log(`\n=== HARVEST COMPLETE: ${harvested.length} / ${aModels.length} SAVED! ===`);
})();
