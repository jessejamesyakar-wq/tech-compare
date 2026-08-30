const fs = require('fs');
const path = require('path');
const { extractPartCode } = require('./icecatPreviewSync');

const contentToken = process.env.ICECAT_CONTENT_TOKEN || '81a97782-9a81-4879-a49d-b4590ea070a9';
const reportPath = path.join(__dirname, '../icecat-sync-report.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Parse lines from section 3
const matchRegex = /\|\s*\d+\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*\[(?:Görsel Linki|Görseli İncele)\]\((https:\/\/images\.icecat\.biz\/[^\s)]+)\)/g;

const codeToImageMap = new Map();
const nameToImageMap = new Map();

let m;
while ((m = matchRegex.exec(reportContent)) !== null) {
  const name = m[1].trim();
  const category = m[2].trim();
  const code = m[3].trim();
  const imgUrl = m[5].trim();

  if (category === 'tvs') {
    codeToImageMap.set(code.toUpperCase(), imgUrl);
    nameToImageMap.set(name.toLowerCase().trim(), imgUrl);
  }
}

console.log(`📊 Eşleşen TV Model Kodu Sayısı: ${codeToImageMap.size}`);

// Read mockTVs.ts
const mockTVsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
let mockTVsContent = fs.readFileSync(mockTVsPath, 'utf8');
let mockTVs = [];
const matchTVArray = mockTVsContent.match(/export\s+const\s+mockTVs\s*:\s*TVProduct\[\]\s*=\s*(\[[\s\S]*\]);/);

if (matchTVArray) {
  mockTVs = JSON.parse(matchTVArray[1]);
}

let updatedTVs = 0;

mockTVs.forEach(tv => {
  const code = extractPartCode(tv.name, tv.brand);
  let targetImg = null;

  if (code && codeToImageMap.has(code.toUpperCase())) {
    targetImg = codeToImageMap.get(code.toUpperCase());
  } else if (nameToImageMap.has(tv.name.toLowerCase().trim())) {
    targetImg = nameToImageMap.get(tv.name.toLowerCase().trim());
  }

  if (targetImg) {
    tv.image = targetImg;
    if (Array.isArray(tv.images) && tv.images.length > 0) {
      tv.images[0] = targetImg;
    } else {
      tv.images = [targetImg];
    }
    updatedTVs++;
  }
});

const updatedTVsCode = `import { TVProduct } from './types';\n\nexport const mockTVs: TVProduct[] = ${JSON.stringify(mockTVs, null, 2)};\n`;
fs.writeFileSync(mockTVsPath, updatedTVsCode, 'utf8');

console.log(`\n====================================================`);
console.log(`📺 Toplam Güncellenen TV Sayısı: ${updatedTVs} / ${mockTVs.length}`);
console.log(`====================================================`);
