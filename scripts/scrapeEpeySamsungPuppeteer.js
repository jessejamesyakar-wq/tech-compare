const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, targetPath) {
  return new Promise((resolve, reject) => {
    if (!url) return resolve(false);
    let cleanUrl = url.startsWith('//') ? `https:${url}` : url;
    if (cleanUrl.startsWith('/')) cleanUrl = `https://www.epey.com${cleanUrl}`;
    const file = fs.createWriteStream(targetPath);
    https.get(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://www.epey.com/'
      }
    }, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve(true));
        });
      } else {
        file.close();
        if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
        resolve(false);
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      resolve(false);
    });
  });
}

(async () => {
  console.log('=== SCRAPING EPEY SAMSUNG CATALOG & ORIGINAL PHOTOS ===\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const url = 'https://www.epey.com/akilli-telefonlar/samsung/';
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const products = await page.evaluate(() => {
    const list = [];
    // Epey product table or list items
    const rows = document.querySelectorAll('li, tr, .cell, div[data-id]');
    
    // Find all product links with images
    const allLinks = document.querySelectorAll('a');
    const seen = new Set();

    allLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      const text = a.innerText.trim();
      const img = a.querySelector('img') || (a.parentElement ? a.parentElement.querySelector('img') : null);

      if (href.includes('/akilli-telefonlar/samsung-') && text.length > 5 && !seen.has(href)) {
        seen.add(href);
        const imgSrc = img ? (img.getAttribute('data-src') || img.getAttribute('src') || '') : '';
        list.push({
          name: text.split('\n')[0].trim(),
          link: href,
          imgSrc: imgSrc
        });
      }
    });

    return list;
  });

  console.log(`Found ${products.length} Samsung smartphones on Epey:`);
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. ${p.name} -> Photo: ${p.imgSrc} (Link: ${p.link})`);
  });

  // Download all high-res photos
  const epeyImgDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyImgDir)) fs.mkdirSync(epeyImgDir, { recursive: true });

  let dlCount = 0;
  for (const p of products) {
    if (p.imgSrc) {
      const slug = p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const target = path.join(epeyImgDir, `${slug}.jpg`);
      const ok = await downloadFile(p.imgSrc, target);
      if (ok) {
        p.localImage = `/images/phones/samsung/epey/${slug}.jpg`;
        dlCount++;
      }
    }
  }

  console.log(`\nSuccessfully downloaded ${dlCount} original Epey photos to public/images/phones/samsung/epey/`);
  fs.writeFileSync(path.join(__dirname, '../data/epey_samsung_harvest.json'), JSON.stringify(products, null, 2), 'utf8');

  await browser.close();
})();
