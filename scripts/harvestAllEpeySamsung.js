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

const samsungModelsToScrape = [
  'Samsung Galaxy S24 Ultra',
  'Samsung Galaxy S24 Plus',
  'Samsung Galaxy S24',
  'Samsung Galaxy S24 FE',
  'Samsung Galaxy S23 Ultra',
  'Samsung Galaxy S23 Plus',
  'Samsung Galaxy S23',
  'Samsung Galaxy S23 FE',
  'Samsung Galaxy S22 Ultra',
  'Samsung Galaxy S22 Plus',
  'Samsung Galaxy S22',
  'Samsung Galaxy S21 FE',
  'Samsung Galaxy Z Fold 6',
  'Samsung Galaxy Z Flip 6',
  'Samsung Galaxy Z Fold 5',
  'Samsung Galaxy Z Flip 5',
  'Samsung Galaxy A55 5G',
  'Samsung Galaxy A35 5G',
  'Samsung Galaxy A25 5G',
  'Samsung Galaxy A15',
  'Samsung Galaxy A05s',
  'Samsung Galaxy A54 5G',
  'Samsung Galaxy A34 5G',
  'Samsung Galaxy M55 5G',
  'Samsung Galaxy M35 5G',
  'Samsung Galaxy M15 5G'
];

(async () => {
  console.log('=== SCRAPING DIRECT EPEY SEARCH & PRODUCT PAGES FOR SAMSUNG SMARTPHONES ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

  const harvested = [];

  for (const modelName of samsungModelsToScrape) {
    try {
      const searchUrl = `https://www.epey.com/ara/?q=${encodeURIComponent(modelName)}`;
      console.log(`Searching Epey for: "${modelName}"...`);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      const productInfo = await page.evaluate(() => {
        // Look for first product link on search results page or direct product page
        const firstLink = document.querySelector('.urunadi, .baslik a, a[href*="/akilli-telefonlar/"]');
        let directImg = document.querySelector('.buyuk_resim img, #detay_resim img, .resim img, img[src*="resim.epey.com"]');
        
        return {
          currentUrl: window.location.href,
          title: document.title,
          productLink: firstLink ? firstLink.getAttribute('href') : null,
          imgSrc: directImg ? (directImg.getAttribute('src') || directImg.getAttribute('data-src')) : null
        };
      });

      let finalImgUrl = productInfo.imgSrc;

      if (!finalImgUrl && productInfo.productLink) {
        console.log(`  Navigating to direct product page: ${productInfo.productLink}`);
        await page.goto(productInfo.productLink, { waitUntil: 'domcontentloaded', timeout: 20000 });
        finalImgUrl = await page.evaluate(() => {
          const img = document.querySelector('.buyuk_resim img, #detay_resim img, .resim img, img[src*="resim.epey.com"]');
          return img ? (img.getAttribute('src') || img.getAttribute('data-src')) : null;
        });
      }

      if (finalImgUrl) {
        const bigUrl = finalImgUrl.replace('/s_', '/b_').replace('/m_', '/b_').replace('/k_', '/b_');
        const slug = modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const targetFilename = `${slug}.png`;
        const targetPath = path.join(epeyDir, targetFilename);

        const ok = await downloadFile(bigUrl, targetPath);
        if (ok) {
          const localPath = `/images/phones/samsung/epey/${targetFilename}`;
          console.log(`  ✅ SAVED EPEY OFFICIAL PHOTO: ${localPath}`);
          harvested.push({
            name: modelName,
            slug,
            localImage: localPath,
            sourceUrl: bigUrl
          });
        }
      } else {
        console.log(`  ⚠️ No image found for ${modelName}`);
      }

    } catch (e) {
      console.error(`  ❌ Error on ${modelName}:`, e.message);
    }
  }

  await browser.close();

  console.log(`\n=== COMPLETED EPEY HARVEST: ${harvested.length} / ${samsungModelsToScrape.length} PHOTOS SAVED! ===`);
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'epey_samsung_harvested.json'), JSON.stringify(harvested, null, 2), 'utf8');
})();
