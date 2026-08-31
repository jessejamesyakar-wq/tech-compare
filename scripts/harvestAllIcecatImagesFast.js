const fs = require('fs');
const path = require('path');
const https = require('https');
const { extractPartCode } = require('./icecatPreviewSync');

// Read environment variables
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) process.env[match[1]] = (match[2] || '').trim();
  });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';
const contentToken = process.env.ICECAT_CONTENT_TOKEN || '81a97782-9a81-4879-a49d-b4590ea070a9';

const datasets = [
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts', folder: 'tvs' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts', folder: 'monitors' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts', folder: 'laptops' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts', folder: 'tablets' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts', folder: 'smartwatches' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts', folder: 'appliances' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts', folder: 'headphones' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts', folder: 'consoles' },
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json', folder: 'phones' }
];

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 2000) {
      return resolve(true);
    }
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(fs.existsSync(dest) && fs.statSync(dest).size > 2000);
        });
        fileStream.on('error', () => resolve(false));
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function queryIcecat(brand, productCode, gtin) {
  const queryParams = new URLSearchParams();
  queryParams.set('UserName', username);
  queryParams.set('Language', 'tr');

  if (gtin) queryParams.set('GTIN', gtin);
  else if (brand && productCode) {
    queryParams.set('Brand', brand);
    queryParams.set('ProductCode', productCode);
  } else {
    return Promise.resolve(null);
  }

  if (apiToken) queryParams.set('app_key', apiToken);
  const url = `https://live.icecat.biz/api/?${queryParams.toString()}`;

  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'TechCompare-App/2.0',
        'api-token': apiToken,
        'Content-Token': contentToken,
        'Authorization': `Bearer ${apiToken}`
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.data) {
            const d = json.data;
            const imgObj = d.Image || {};
            const gallery = Array.isArray(d.Gallery) ? d.Gallery : [];
            let highPic = imgObj.HighPic || imgObj.highPic || d.GeneralInfo?.Image?.HighPic;
            if (!highPic && gallery.length > 0) {
              highPic = gallery[0].Pic || gallery[0].pic || gallery[0].HighPic;
            }

            if (highPic) {
              if (contentToken && !highPic.includes('content_token=')) {
                highPic += `${highPic.includes('?') ? '&' : '?'}content_token=${contentToken}`;
              }

              const galleryUrls = gallery
                .map(g => g.Pic || g.pic || g.HighPic)
                .filter(Boolean)
                .map(u => (contentToken && !u.includes('content_token=')) ? `${u}${u.includes('?') ? '&' : '?'}content_token=${contentToken}` : u);

              return resolve({
                title: d.GeneralInfo?.Title || d.GeneralInfo?.ProductName || productCode,
                highPic,
                gallery: galleryUrls
              });
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => {
      req.destroy();
      resolve(null);
    });
  });
}

async function processCategoryFast(cat, concurrency = 15) {
  const filePath = path.join(__dirname, '../src/lib', cat.file);
  if (!fs.existsSync(filePath)) return;

  const targetDir = path.join(__dirname, `../public/images/products/${cat.folder}`);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  let products = [];
  let rawContent = fs.readFileSync(filePath, 'utf8');

  if (cat.type === 'json') {
    products = JSON.parse(rawContent);
  } else {
    const eqIdx = rawContent.indexOf('=');
    const startIdx = rawContent.indexOf('[', eqIdx);
    const endIdx = rawContent.lastIndexOf(']');
    products = JSON.parse(rawContent.substring(startIdx, endIdx + 1));
  }

  console.log(`\n====================================================`);
  console.log(`🚀 [Kategori: ${cat.name.toUpperCase()}] ${products.length} Ürün Paralel Taranıyor (Worker: ${concurrency})...`);
  console.log(`====================================================`);

  let index = 0;
  let codeFound = 0;
  let icecatMatched = 0;
  let downloadedCount = 0;

  async function worker() {
    while (index < products.length) {
      const i = index++;
      const p = products[i];

      // Skip already downloaded local icecat images
      if (p.image && p.image.includes(`/images/products/${cat.folder}/icecat-`)) {
        icecatMatched++;
        continue;
      }

      // Skip Samsung phones with custom Epey studio renders
      if (cat.name === 'smartphones' && p.brand?.toLowerCase().includes('samsung') && p.image?.includes('/images/phones/samsung/')) {
        continue;
      }

      const strictCode = p.model || p.sku || extractPartCode(p.name, p.brand);
      const gtin = p.gtin || p.ean;

      if (!strictCode && !gtin) continue;
      codeFound++;

      const res = await queryIcecat(p.brand, strictCode, gtin);
      if (res && res.highPic) {
        icecatMatched++;
        const baseFilename = `icecat-${p.slug || p.id}`;
        const mainDest = path.join(targetDir, `${baseFilename}.jpg`);
        const mainLocalPath = `/images/products/${cat.folder}/${baseFilename}.jpg`;

        const ok = await downloadFile(res.highPic, mainDest);
        if (ok) {
          downloadedCount++;
          p.image = mainLocalPath;
          const newImages = [mainLocalPath];

          if (Array.isArray(res.gallery) && res.gallery.length > 1) {
            for (let gIdx = 1; gIdx < Math.min(res.gallery.length, 4); gIdx++) {
              const galDest = path.join(targetDir, `${baseFilename}-${gIdx}.jpg`);
              const galLocalPath = `/images/products/${cat.folder}/${baseFilename}-${gIdx}.jpg`;
              const galOk = await downloadFile(res.gallery[gIdx], galDest);
              if (galOk) newImages.push(galLocalPath);
            }
          }

          p.images = newImages;
        }
      }

      if (index % 50 === 0 || index >= products.length) {
        console.log(`⏳ ${cat.name}: ${Math.min(index, products.length)}/${products.length} işlendi | Eşleşen: ${icecatMatched} | Yeni İndirilen: ${downloadedCount}`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  // Save updated file
  if (cat.type === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
  } else {
    const updatedContent = `import { Product } from './types';\n\nexport const ${rawContent.match(/export\s+const\s+(\w+)/)[1]}: Product[] = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync(filePath, updatedContent, 'utf8');
  }

  console.log(`✅ [${cat.name.toUpperCase()}] Bitti: ${icecatMatched} doğrulanmış Icecat fotoğrafı yerel depolamaya bağlandı.`);
}

async function runAllFast() {
  console.log('================================================================');
  console.log('⚡ ICECAT HIZLI VE PARALEL FOTOĞRAF HASADI (15 CONCURRENCY)     ⚡');
  console.log(`👤 Kullanıcı: "${username}"`);
  console.log('================================================================');

  for (const cat of datasets) {
    await processCategoryFast(cat, 15);
  }

  console.log('\n================================================================');
  console.log('🎉 TÜM KATEGORİLER İÇİN ICECAT FOTOĞRAF ENTEGRASYONU TAMAMLANDI!');
  console.log('================================================================');
}

runAllFast();
