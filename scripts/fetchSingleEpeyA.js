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

const targets = [
  { id: 'samsung-samsung-galaxy-a55-5g-103', name: 'Samsung Galaxy A55 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a55.html' },
  { id: 'samsung-samsung-galaxy-a35-5g-102', name: 'Samsung Galaxy A35 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a35.html' },
  { id: 'samsung-samsung-galaxy-a25-5g-101', name: 'Samsung Galaxy A25 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a25-5g.html' },
  { id: 'samsung-samsung-galaxy-a15-100', name: 'Samsung Galaxy A15', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a15.html' },
  { id: 'samsung-samsung-galaxy-a05-99', name: 'Samsung Galaxy A05s', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a05s.html' },
  { id: 'samsung-samsung-galaxy-a54-5g-89', name: 'Samsung Galaxy A54 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a54.html' },
  { id: 'samsung-samsung-galaxy-a34-5g-88', name: 'Samsung Galaxy A34 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a34.html' },
  { id: 'samsung-samsung-galaxy-a24-87', name: 'Samsung Galaxy A24', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a24.html' },
  { id: 'samsung-samsung-galaxy-a14-86', name: 'Samsung Galaxy A14', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a14.html' },
  { id: 'samsung-samsung-galaxy-a73-5g-75', name: 'Samsung Galaxy A73 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a73-5g.html' },
  { id: 'samsung-samsung-galaxy-a53-5g-74', name: 'Samsung Galaxy A53 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a53-5g.html' },
  { id: 'samsung-samsung-galaxy-a33-5g-73', name: 'Samsung Galaxy A33 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a33-5g.html' },
  { id: 'samsung-samsung-galaxy-a23-72', name: 'Samsung Galaxy A23', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a23.html' },
  { id: 'samsung-samsung-galaxy-a13-71', name: 'Samsung Galaxy A13', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a13.html' },
  { id: 'samsung-samsung-galaxy-a72-62', name: 'Samsung Galaxy A72', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a72.html' },
  { id: 'samsung-samsung-galaxy-a52s-5g-61', name: 'Samsung Galaxy A52s 5G', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a52s-5g.html' },
  { id: 'samsung-samsung-galaxy-a52-60', name: 'Samsung Galaxy A52', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a52.html' },
  { id: 'samsung-samsung-galaxy-a32-59', name: 'Samsung Galaxy A32', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a32-128gb.html' },
  { id: 'samsung-samsung-galaxy-a22-58', name: 'Samsung Galaxy A22', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a22-128gb.html' },
  { id: 'samsung-samsung-galaxy-a12-57', name: 'Samsung Galaxy A12', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a12.html' },
  { id: 'samsung-samsung-galaxy-a71-45', name: 'Samsung Galaxy A71', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a71.html' },
  { id: 'samsung-samsung-galaxy-a51-44', name: 'Samsung Galaxy A51', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a51.html' },
  { id: 'samsung-samsung-galaxy-a70-26', name: 'Samsung Galaxy A70', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a70.html' },
  { id: 'samsung-samsung-galaxy-a50-24', name: 'Samsung Galaxy A50', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a50.html' },
  { id: 'samsung-samsung-galaxy-a30-22', name: 'Samsung Galaxy A30', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a30.html' },
  { id: 'samsung-samsung-galaxy-a20-21', name: 'Samsung Galaxy A20', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a20.html' },
  { id: 'samsung-samsung-galaxy-a10-20', name: 'Samsung Galaxy A10', url: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a10.html' }
];

(async () => {
  console.log('=== HARVESTING GALAXY A SERIES WITH FRESH CONTEXT PER ITEM ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const results = [];

  for (const item of targets) {
    let browser;
    try {
      console.log(`Processing: ${item.name}...`);
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');

      await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 25000 });
      const html = await page.content();

      const matches = html.match(/https:\/\/resim\.epey\.com\/[0-9]+\/(?:b_|m_|s_|k_|z_)[^\s\"\'\<\>\&]+/gi);

      if (matches && matches.length > 0) {
        const prodMatch = matches.find(m => !m.includes('logo') && !m.includes('site/') && !m.includes('grup/')) || matches[0];
        const bigImg = prodMatch.replace('/m_', '/b_').replace('/s_', '/b_').replace('/k_', '/b_').replace('/z_', '/b_');

        const filename = `${item.id}.png`;
        const targetPath = path.join(epeyDir, filename);

        const ok = await downloadFile(bigImg, targetPath);
        if (ok) {
          const localPath = `/images/phones/samsung/epey/${filename}`;
          console.log(`  ✅ SAVED: ${localPath} (from ${bigImg})`);
          results.push({
            id: item.id,
            name: item.name,
            epeyImage: localPath,
            sourceUrl: bigImg
          });
        }
      } else {
        console.log(`  ⚠️ No image matched for ${item.name}`);
      }

    } catch (e) {
      console.error(`  ❌ Error on ${item.name}:`, e.message);
    } finally {
      if (browser) await browser.close();
      await new Promise(r => setTimeout(r, 1200));
    }
  }

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'epey_a_series_complete.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  console.log(`\n=== COMPLETE: ${results.length} / ${targets.length} GALAXY A PHOTOS HARVESTED! ===`);
})();
