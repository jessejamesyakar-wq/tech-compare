const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.join(__dirname, '../public/images/products/tvs');
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const mockTVsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
const rawContent = fs.readFileSync(mockTVsPath, 'utf8');

const equalsIndex = rawContent.indexOf('=');
const jsonStartIndex = rawContent.indexOf('[', equalsIndex);
const jsonEndIndex = rawContent.lastIndexOf(']');

const jsonString = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
const mockTVs = JSON.parse(jsonString);

const icecatTVs = mockTVs.filter(tv => tv.image && tv.image.startsWith('https://images.icecat.biz/'));
console.log(`📦 mockTVs.ts yüklendi: ${mockTVs.length} ürün`);
console.log(`🔍 Hızlı İndirilecek Icecat TV Görseli: ${icecatTVs.length}`);

function downloadOne(url, dest) {
  return new Promise((resolve) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      return resolve(true);
    }
    const req = https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
        fileStream.on('error', () => resolve(false));
      } else {
        resolve(false);
      }
    });
    req.on('error', () => resolve(false));
    req.setTimeout(10000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function runPool(items, concurrency = 15) {
  let index = 0;
  let successCount = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      const tv = items[i];
      const filename = `icecat-${tv.slug || tv.id}.jpg`;
      const localDest = path.join(targetDir, filename);
      const localPath = `/images/products/tvs/${filename}`;

      const ok = await downloadOne(tv.image, localDest);
      if (ok && fs.existsSync(localDest) && fs.statSync(localDest).size > 1000) {
        tv.image = localPath;
        if (Array.isArray(tv.images) && tv.images.length > 0) {
          tv.images[0] = localPath;
        } else {
          tv.images = [localPath];
        }
        successCount++;
      }

      if (successCount % 25 === 0 || index >= items.length) {
        console.log(`⏳ İlerleme: ${Math.min(index, items.length)}/${items.length} işlendi (${successCount} başarılı)...`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const updatedTVsFileContent = `import { Product } from './types';\n\nexport const mockTVs: Product[] = ${JSON.stringify(mockTVs, null, 2)};\n`;
  fs.writeFileSync(mockTVsPath, updatedTVsFileContent, 'utf8');

  console.log(`\n====================================================`);
  console.log(`✅ ${successCount} TV görseli yerel depolamaya indirildi ve mockTVs.ts güncellendi.`);
  console.log(`====================================================`);
}

runPool(icecatTVs, 15);
