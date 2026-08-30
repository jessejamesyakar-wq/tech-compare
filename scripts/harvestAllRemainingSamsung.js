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

// All major remaining Samsung phone models across S, Z, Note, and M series
const targets = [
  // Z Series
  { id: 'samsung-samsung-galaxy-z-flip-6-97', query: 'Samsung Galaxy Z Flip 6', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-flip6.html' },
  { id: 'samsung-samsung-galaxy-z-fold-5-85', query: 'Samsung Galaxy Z Fold 5', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-fold5.html' },
  { id: 'samsung-samsung-galaxy-z-flip-5-84', query: 'Samsung Galaxy Z Flip 5', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-flip5.html' },
  { id: 'samsung-samsung-galaxy-z-fold-4-70', query: 'Samsung Galaxy Z Fold 4', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-fold4.html' },
  { id: 'samsung-samsung-galaxy-z-flip-4-69', query: 'Samsung Galaxy Z Flip 4', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-flip4.html' },
  { id: 'samsung-samsung-galaxy-z-fold-3-55', query: 'Samsung Galaxy Z Fold 3', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-fold3-5g.html' },
  { id: 'samsung-samsung-galaxy-z-flip-3-54', query: 'Samsung Galaxy Z Flip 3', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-z-flip3-5g.html' },

  // S Series
  { id: 'samsung-samsung-galaxy-s24-fe-96', query: 'Samsung Galaxy S24 FE', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s24-fe.html' },
  { id: 'samsung-samsung-galaxy-s23-81', query: 'Samsung Galaxy S23+', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-plus.html' },
  { id: 'samsung-samsung-galaxy-s23-80', query: 'Samsung Galaxy S23', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23.html' },
  { id: 'samsung-samsung-galaxy-s23-fe-83', query: 'Samsung Galaxy S23 FE', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s23-fe.html' },
  { id: 'samsung-samsung-galaxy-s22-67', query: 'Samsung Galaxy S22+', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s22-plus.html' },
  { id: 'samsung-samsung-galaxy-s22-66', query: 'Samsung Galaxy S22', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s22.html' },
  { id: 'samsung-samsung-galaxy-s21-fe-53', query: 'Samsung Galaxy S21 FE', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s21-fe-5g.html' },
  { id: 'samsung-samsung-galaxy-s21-ultra-52', query: 'Samsung Galaxy S21 Ultra', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s21-ultra-5g.html' },
  { id: 'samsung-samsung-galaxy-s21-51', query: 'Samsung Galaxy S21+', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s21-plus-5g.html' },
  { id: 'samsung-samsung-galaxy-s21-50', query: 'Samsung Galaxy S21', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s21-5g.html' },
  { id: 'samsung-samsung-galaxy-s20-fe-47', query: 'Samsung Galaxy S20 FE', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-s20-fe.html' },

  // Note Series
  { id: 'samsung-samsung-galaxy-note-20-ultra-49', query: 'Samsung Galaxy Note 20 Ultra', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-note-20-ultra.html' },
  { id: 'samsung-samsung-galaxy-note-20-48', query: 'Samsung Galaxy Note 20', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-note-20.html' },

  // M Series
  { id: 'samsung-samsung-galaxy-m55-5g-106', query: 'Samsung Galaxy M55 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m55-5g.html' },
  { id: 'samsung-samsung-galaxy-m35-5g-105', query: 'Samsung Galaxy M35 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m35-5g.html' },
  { id: 'samsung-samsung-galaxy-m15-5g-104', query: 'Samsung Galaxy M15 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m15-5g.html' },
  { id: 'samsung-samsung-galaxy-m54-5g-92', query: 'Samsung Galaxy M54 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m54-5g.html' },
  { id: 'samsung-samsung-galaxy-m34-5g-91', query: 'Samsung Galaxy M34 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m34-5g.html' },
  { id: 'samsung-samsung-galaxy-m14-5g-90', query: 'Samsung Galaxy M14 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m14-5g.html' },
  { id: 'samsung-samsung-galaxy-m53-5g-79', query: 'Samsung Galaxy M53 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m53-5g.html' },
  { id: 'samsung-samsung-galaxy-m33-5g-78', query: 'Samsung Galaxy M33 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m33-5g.html' },
  { id: 'samsung-samsung-galaxy-m23-5g-77', query: 'Samsung Galaxy M23 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m23-5g.html' },
  { id: 'samsung-samsung-galaxy-m13-76', query: 'Samsung Galaxy M13', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-m13.html' },

  // Remaining A Series
  { id: 'samsung-samsung-galaxy-a34-5g-88', query: 'Samsung Galaxy A34 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a34.html' },
  { id: 'samsung-samsung-galaxy-a24-87', query: 'Samsung Galaxy A24', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a24.html' },
  { id: 'samsung-samsung-galaxy-a14-86', query: 'Samsung Galaxy A14', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a14.html' },
  { id: 'samsung-samsung-galaxy-a53-5g-74', query: 'Samsung Galaxy A53 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a53-5g.html' },
  { id: 'samsung-samsung-galaxy-a33-5g-73', query: 'Samsung Galaxy A33 5G', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a33-5g.html' },
  { id: 'samsung-samsung-galaxy-a32-59', query: 'Samsung Galaxy A32', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a32-128gb.html' },
  { id: 'samsung-samsung-galaxy-a22-58', query: 'Samsung Galaxy A22', epeyUrl: 'https://www.epey.com/akilli-telefonlar/samsung-galaxy-a22-128gb.html' }
];

(async () => {
  console.log('=== HARVESTING ALL REMAINING SAMSUNG PHONE STUDIO PHOTOS ===\n');

  const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
  if (!fs.existsSync(epeyDir)) fs.mkdirSync(epeyDir, { recursive: true });

  const results = [];

  for (const item of targets) {
    let browser;
    try {
      console.log(`Processing: ${item.query}...`);
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      await page.goto(item.epeyUrl, { waitUntil: 'networkidle2', timeout: 25000 });
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
            name: item.query,
            epeyImage: localPath,
            sourceUrl: bigImg
          });
        }
      } else {
        console.log(`  ⚠️ No image found on Epey for ${item.query}`);
      }

    } catch (e) {
      console.error(`  ❌ Error on ${item.query}:`, e.message);
    } finally {
      if (browser) await browser.close();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    path.join(dataDir, 'epey_all_remaining_samsung.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );

  console.log(`\n=== COMPLETED: ${results.length} / ${targets.length} OFFICIAL SAMSUNG STUDIO PHOTOS HARVESTED! ===`);
})();
