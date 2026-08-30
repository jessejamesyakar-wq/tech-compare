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

const epeyCategoryUrls = [
  'https://www.epey.com/akilli-telefonlar/seri/samsung-galaxy-a/',
  'https://www.epey.com/akilli-telefonlar/seri/samsung-galaxy-s/',
  'https://www.epey.com/akilli-telefonlar/seri/samsung-galaxy-z/',
  'https://www.epey.com/akilli-telefonlar/seri/samsung-galaxy-m/'
];

(async () => {
  console.log('=== SCRAPING ALL EPEY SAMSUNG SERIES (A, S, Z, M) ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const allHarvested = [];

  for (const catUrl of epeyCategoryUrls) {
    try {
      console.log(`Loading Epey Series: ${catUrl}`);
      await page.goto(catUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1000));

      const items = await page.evaluate(() => {
        const list = [];
        document.querySelectorAll('li, .cell.row, div.urun, #liste li').forEach(el => {
          const nameEl = el.querySelector('.urunadi, a.link, .baslik a');
          const imgEl = el.querySelector('img');

          if (nameEl && imgEl) {
            const name = nameEl.textContent.trim();
            const href = nameEl.getAttribute('href') || '';
            const imgSrc = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
            if (name.includes('Samsung') && imgSrc.includes('resim.epey.com')) {
              list.push({ name, href, imgSrc });
            }
          }
        });
        return list;
      });

      console.log(`  Found ${items.length} products in this series.`);
      allHarvested.push(...items);

    } catch (e) {
      console.error(`  ❌ Error on ${catUrl}:`, e.message);
    }
  }

  await browser.close();

  // Deduplicate
  const seen = new Set();
  const uniqueItems = [];
  allHarvested.forEach(p => {
    if (!seen.has(p.name)) {
      seen.add(p.name);
      uniqueItems.push(p);
    }
  });

  console.log(`\nTotal unique Epey products harvested: ${uniqueItems.length}`);

  let dlCount = 0;
  for (const p of uniqueItems) {
    const bigImg = p.imgSrc.replace('/k_', '/b_').replace('/m_', '/b_').replace('/s_', '/b_');
    const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `${slug}.png`;
    const targetPath = path.join(epeyDir, filename);

    const ok = await downloadFile(bigImg, targetPath);
    if (ok) {
      p.localImage = `/images/phones/samsung/epey/${filename}`;
      dlCount++;
      console.log(`  ✅ [${dlCount}] Downloaded: ${p.name} -> ${p.localImage}`);
    }
  }

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'epey_all_samsung_series.json'),
    JSON.stringify(uniqueItems, null, 2),
    'utf8'
  );

  console.log(`\n=== COMPLETED: ${dlCount} TOTAL OFFICIAL EPEY PHOTOS DOWNLOADED! ===`);
})();
