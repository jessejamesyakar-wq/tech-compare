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

const epeyDirectPages = [
  { id: 'samsung-samsung-galaxy-s24-ultra-95', name: 'Samsung Galaxy S24 Ultra', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24-ultra.html' },
  { id: 'samsung-samsung-galaxy-s24-94', name: 'Samsung Galaxy S24+', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24-plus.html' },
  { id: 'samsung-samsung-galaxy-s24-93', name: 'Samsung Galaxy S24', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24.html' },
  { id: 'samsung-samsung-galaxy-s24-fe-96', name: 'Samsung Galaxy S24 FE', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24-fe.html' },
  { id: 'samsung-samsung-galaxy-s23-ultra-82', name: 'Samsung Galaxy S23 Ultra', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-ultra.html' },
  { id: 'samsung-samsung-galaxy-s23-81', name: 'Samsung Galaxy S23+', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-plus.html' },
  { id: 'samsung-samsung-galaxy-s23-80', name: 'Samsung Galaxy S23', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23.html' },
  { id: 'samsung-samsung-galaxy-s23-fe-83', name: 'Samsung Galaxy S23 FE', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-fe.html' },
  { id: 'samsung-samsung-galaxy-s22-ultra-68', name: 'Samsung Galaxy S22 Ultra', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s22-ultra.html' },
  { id: 'samsung-samsung-galaxy-s22-66', name: 'Samsung Galaxy S22', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s22.html' },
  { id: 'samsung-samsung-galaxy-s21-fe-53', name: 'Samsung Galaxy S21 FE', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s21-fe-5g.html' },
  { id: 'samsung-samsung-galaxy-z-fold-6-98', name: 'Samsung Galaxy Z Fold 6', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-fold6.html' },
  { id: 'samsung-samsung-galaxy-z-flip-6-97', name: 'Samsung Galaxy Z Flip 6', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-flip6.html' },
  { id: 'samsung-samsung-galaxy-a55-5g-103', name: 'Samsung Galaxy A55 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a55-5g.html' },
  { id: 'samsung-samsung-galaxy-a35-5g-102', name: 'Samsung Galaxy A35 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a35-5g.html' },
  { id: 'samsung-samsung-galaxy-a25-5g-101', name: 'Samsung Galaxy A25 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a25-5g.html' },
  { id: 'samsung-samsung-galaxy-a15-100', name: 'Samsung Galaxy A15', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a15.html' },
  { id: 'samsung-samsung-galaxy-a05-99', name: 'Samsung Galaxy A05', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a05s.html' },
  { id: 'samsung-samsung-galaxy-m55-5g-106', name: 'Samsung Galaxy M55 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m55-5g.html' },
  { id: 'samsung-samsung-galaxy-m35-5g-105', name: 'Samsung Galaxy M35 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m35-5g.html' }
];

(async () => {
  console.log('=== DOWNLOADING CANONICAL EPEY PRODUCT PHOTOS ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const results = [];

  for (const item of epeyDirectPages) {
    try {
      console.log(`Processing: ${item.name} (${item.url})...`);
      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 25000 });

      const epeyImg = await page.evaluate((productName) => {
        const allImgs = Array.from(document.querySelectorAll('img')).map(i => i.src);
        // Find product image
        const prodImg = allImgs.find(s => s.includes('resim.epey.com') && (s.includes('/m_') || s.includes('/s_') || s.includes('/b_') || s.includes('/k_')) && !s.includes('logo') && !s.includes('site/'));
        return prodImg || null;
      }, item.name);

      if (epeyImg) {
        const bigImg = epeyImg.replace('/m_', '/b_').replace('/s_', '/b_').replace('/k_', '/b_');
        const filename = `${item.id}.png`;
        const targetPath = path.join(epeyDir, filename);

        const ok = await downloadFile(bigImg, targetPath);
        if (ok) {
          const localPath = `/images/phones/samsung/epey/${filename}`;
          console.log(`  ✅ SAVED EPEY PHOTO: ${localPath} (from ${bigImg})`);
          results.push({
            id: item.id,
            name: item.name,
            currentImage: '',
            epeyImage: localPath,
            sourceUrl: bigImg
          });
        }
      } else {
        console.log(`  ⚠️ Could not locate product image on ${item.name}`);
      }

    } catch (e) {
      console.error(`  ❌ Error processing ${item.name}:`, e.message);
    }
  }

  await browser.close();

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'epey_samsung_confirmed.json'), JSON.stringify(results, null, 2), 'utf8');

  console.log(`\n=== EPEY DOWNLOAD SUMMARY ===`);
  console.log(`Successfully downloaded ${results.length} / ${epeyDirectPages.length} official Epey studio photos!`);
})();
