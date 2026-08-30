const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

async function downloadFile(url, targetPath) {
  return new Promise((resolve) => {
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
    }).on('error', () => {
      file.close();
      if (fs.existsSync(targetPath)) fs.unlinkSync(targetPath);
      resolve(false);
    });
  });
}

// Target popular Samsung phone URLs on Epey
const targets = [
  { slug: 'samsung-galaxy-s24-ultra', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24-ultra.html' },
  { slug: 'samsung-galaxy-s24-plus', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24-plus.html' },
  { slug: 'samsung-galaxy-s24', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24.html' },
  { slug: 'samsung-galaxy-s24-fe', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24-fe.html' },
  { slug: 'samsung-galaxy-s23-ultra', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-ultra.html' },
  { slug: 'samsung-galaxy-s23-plus', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-plus.html' },
  { slug: 'samsung-galaxy-s23', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23.html' },
  { slug: 'samsung-galaxy-s23-fe', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-fe.html' },
  { slug: 'samsung-galaxy-z-fold6', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-fold6.html' },
  { slug: 'samsung-galaxy-z-flip6', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-flip6.html' },
  { slug: 'samsung-galaxy-a55-5g', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a55-5g.html' },
  { slug: 'samsung-galaxy-a35-5g', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a35-5g.html' },
  { slug: 'samsung-galaxy-a25-5g', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a25-5g.html' },
  { slug: 'samsung-galaxy-a15', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a15.html' },
  { slug: 'samsung-galaxy-a05s', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a05s.html' }
];

(async () => {
  console.log('=== SCRAPING DIRECT EPEY PRODUCT PAGES FOR HIGH-RES STUDIO PHOTOS ===\n');

  const epeyImgDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyImgDir)) fs.mkdirSync(epeyImgDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const results = [];

  for (const t of targets) {
    try {
      console.log(`Scraping: ${t.slug} (${t.url})`);
      await page.goto(t.url, { waitUntil: 'domcontentloaded', timeout: 25000 });

      const imgUrls = await page.evaluate(() => {
        const imgs = [];
        // Look for main gallery images on Epey product page
        document.querySelectorAll('#galeri img, .resimler img, #detay_resim img, .buyuk_resim img').forEach(img => {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          if (src && (src.includes('resim.epey.com') || src.includes('epey.com'))) {
            // Replace thumbnail 'k_' with big 'b_'
            const bigSrc = src.replace('/k_', '/b_').replace('/m_', '/b_');
            imgs.push(bigSrc);
            imgs.push(src);
          }
        });
        if (imgs.length === 0) {
          const og = document.querySelector('meta[property="og:image"]');
          if (og) imgs.push(og.getAttribute('content'));
        }
        return Array.from(new Set(imgs));
      });

      console.log(`  Found ${imgUrls.length} image URLs on Epey`);
      let savedPath = null;
      for (const imgUrl of imgUrls) {
        const targetFile = path.join(epeyImgDir, `${t.slug}.png`);
        const ok = await downloadFile(imgUrl, targetFile);
        if (ok) {
          savedPath = `/images/phones/samsung/epey/${t.slug}.png`;
          console.log(`  ✅ Successfully saved: ${savedPath}`);
          break;
        }
      }

      results.push({ slug: t.slug, url: t.url, image: savedPath });

    } catch (e) {
      console.error(`  ❌ Failed to scrape ${t.slug}:`, e.message);
    }
  }

  await browser.close();

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'epey_harvested_images.json'), JSON.stringify(results, null, 2), 'utf8');

  console.log('\n=== EPEY HARVEST COMPLETE ===');
  console.log(`Saved ${results.filter(r => r.image).length} / ${targets.length} official Epey studio photos!`);
})();
