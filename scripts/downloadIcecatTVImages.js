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

console.log(`📦 mockTVs.ts yüklendi: ${mockTVs.length} ürün`);

// Filter TVs that currently have external Icecat URLs
const icecatTVs = mockTVs.filter(tv => tv.image && tv.image.startsWith('https://images.icecat.biz/'));
console.log(`🔍 İndirilecek Icecat TV Görseli: ${icecatTVs.length}`);

function downloadImage(url, dest) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

async function runDownload() {
  let downloadedCount = 0;
  for (let i = 0; i < icecatTVs.length; i++) {
    const tv = icecatTVs[i];
    const filename = `icecat-${tv.slug || tv.id}.jpg`;
    const localDest = path.join(targetDir, filename);
    const localPath = `/images/products/tvs/${filename}`;

    const ok = await downloadImage(tv.image, localDest);
    if (ok && fs.existsSync(localDest) && fs.statSync(localDest).size > 1000) {
      tv.image = localPath;
      if (Array.isArray(tv.images) && tv.images.length > 0) {
        tv.images[0] = localPath;
      } else {
        tv.images = [localPath];
      }
      downloadedCount++;
    }

    if ((i + 1) % 50 === 0 || i + 1 === icecatTVs.length) {
      console.log(`⏳ İlerleme: ${i + 1}/${icecatTVs.length} TV fotoğrafı indirildi (${downloadedCount} başarılı)...`);
    }
  }

  const updatedTVsFileContent = `import { Product } from './types';\n\nexport const mockTVs: Product[] = ${JSON.stringify(mockTVs, null, 2)};\n`;
  fs.writeFileSync(mockTVsPath, updatedTVsFileContent, 'utf8');

  console.log(`\n====================================================`);
  console.log(`✅ ${downloadedCount} TV görseli yerel depolamaya indirildi ve mockTVs.ts güncellendi.`);
  console.log(`====================================================`);
}

runDownload();
