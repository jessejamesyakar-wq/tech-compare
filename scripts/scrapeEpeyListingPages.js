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

(async () => {
  console.log('=== SCRAPING ALL EPEY SAMSUNG SMARTPHONE LISTINGS (PAGES 1-5) ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const allEpeyProducts = [];

  for (let pageNum = 1; pageNum <= 5; pageNum++) {
    const listUrl = pageNum === 1
      ? 'https://www.epey.com/akilli-telefonlar/samsung/'
      : `https://www.epey.com/akilli-telefonlar/samsung/${pageNum}/`;

    console.log(`Scraping Epey Listing Page ${pageNum}: ${listUrl}`);
    try {
      await page.goto(listUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1000));

      const pageProducts = await page.evaluate(() => {
        const list = [];
        // On Epey listing pages: #liste > ul > li
        document.querySelectorAll('li, .cell.row, div.urun').forEach(el => {
          const nameEl = el.querySelector('.urunadi, a.link, .baslik a');
          const imgEl = el.querySelector('img');
          const priceEl = el.querySelector('.fiyat, span.fiyat');

          if (nameEl && imgEl) {
            const name = nameEl.textContent.trim();
            const href = nameEl.getAttribute('href') || '';
            const imgSrc = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
            const price = priceEl ? priceEl.textContent.trim() : '';

            if (name.includes('Samsung') || href.includes('samsung')) {
              list.push({ name, href, imgSrc, price });
            }
          }
        });
        return list;
      });

      console.log(`  Found ${pageProducts.length} Samsung products on page ${pageNum}`);
      allEpeyProducts.push(...pageProducts);

    } catch (e) {
      console.error(`  ❌ Error on page ${pageNum}:`, e.message);
    }
  }

  await browser.close();

  // Deduplicate by name
  const seen = new Set();
  const uniqueProducts = [];
  allEpeyProducts.forEach(p => {
    if (!seen.has(p.name)) {
      seen.add(p.name);
      uniqueProducts.push(p);
    }
  });

  console.log(`\nExtracted ${uniqueProducts.length} unique Samsung smartphones from Epey!`);
  
  let dlSuccess = 0;
  for (const p of uniqueProducts) {
    if (p.imgSrc && p.imgSrc.includes('resim.epey.com')) {
      const bigImg = p.imgSrc.replace('/k_', '/b_').replace('/m_', '/b_').replace('/s_', '/b_');
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const filename = `${slug}.png`;
      const targetPath = path.join(epeyDir, filename);

      const ok = await downloadFile(bigImg, targetPath);
      if (ok) {
        p.localImage = `/images/phones/samsung/epey/${filename}`;
        dlSuccess++;
        console.log(`  ✅ [${dlSuccess}] Downloaded: ${p.name} -> ${p.localImage}`);
      }
    }
  }

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'epey_samsung_full_harvest.json'),
    JSON.stringify(uniqueProducts, null, 2),
    'utf8'
  );

  console.log(`\n=== EPEY HARVEST COMPLETE: ${dlSuccess} OFFICIAL EPEY PHOTOS DOWNLOADED! ===`);
})();
