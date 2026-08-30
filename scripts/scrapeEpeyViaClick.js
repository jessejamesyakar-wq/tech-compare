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
  console.log('=== SCRAPING ALL SAMSUNG PAGES ON EPEY VIA INTERACTIVE CLICKING ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

  await page.goto('https://www.epey.com/akilli-telefonlar/samsung/', { waitUntil: 'networkidle2' });

  const allProducts = [];

  for (let p = 1; p <= 8; p++) {
    console.log(`Extracting items on page ${p}...`);
    await new Promise(r => setTimeout(r, 1500));

    const pageItems = await page.evaluate(() => {
      const list = [];
      document.querySelectorAll('li, div.cell.row, div.urun, #liste li').forEach(el => {
        const nameEl = el.querySelector('.urunadi, a.link, .baslik a');
        const imgEl = el.querySelector('img');
        if (nameEl && imgEl) {
          const name = nameEl.textContent.trim();
          const href = nameEl.getAttribute('href') || '';
          const imgSrc = imgEl.getAttribute('data-src') || imgEl.getAttribute('src') || '';
          if (name.includes('Samsung') || href.includes('samsung')) {
            list.push({ name, href, imgSrc });
          }
        }
      });
      return list;
    });

    console.log(`  Found ${pageItems.length} items on page ${p}`);
    allProducts.push(...pageItems);

    // Click next page button
    const clicked = await page.evaluate((currPage) => {
      const links = Array.from(document.querySelectorAll('.sayfalama a, .sayfa a, a.sayfa, #sayfalama a'));
      const nextBtn = links.find(a => a.innerText.includes('Sonraki') || a.innerText.trim() === String(currPage + 1) || a.className.includes('sonraki'));
      if (nextBtn) {
        nextBtn.click();
        return true;
      }
      return false;
    }, p);

    if (clicked) {
      console.log(`  Clicked to navigate to page ${p + 1}...`);
      await new Promise(r => setTimeout(r, 2500));
    } else {
      console.log('  No next page button found.');
      break;
    }
  }

  await browser.close();

  // Deduplicate
  const seen = new Set();
  const unique = [];
  allProducts.forEach(item => {
    if (!seen.has(item.name)) {
      seen.add(item.name);
      unique.push(item);
    }
  });

  console.log(`\nExtracted ${unique.length} unique Samsung smartphones from Epey!`);

  let dlCount = 0;
  for (const item of unique) {
    if (item.imgSrc && item.imgSrc.includes('resim.epey.com')) {
      const bigImg = item.imgSrc.replace('/k_', '/b_').replace('/m_', '/b_').replace('/s_', '/b_');
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const filename = `${slug}.png`;
      const targetPath = path.join(epeyDir, filename);

      const ok = await downloadFile(bigImg, targetPath);
      if (ok) {
        item.localImage = `/images/phones/samsung/epey/${filename}`;
        dlCount++;
        console.log(`  ✅ [${dlCount}] Downloaded: ${item.name} -> ${item.localImage}`);
      }
    }
  }

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'epey_all_samsung_harvested.json'), JSON.stringify(unique, null, 2), 'utf8');

  console.log(`\n=== EPEY HARVEST COMPLETE: ${dlCount} OFFICIAL PHOTOS DOWNLOADED! ===`);
})();
