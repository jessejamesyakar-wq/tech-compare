const fs = require('fs');
const path = require('path');
const { extractPartCode } = require('./icecatPreviewSync');

console.log('====================================================');
console.log('🚀 UYGULAMA: SEÇENEK B (SADECE TV & TELEFONLAR)');
console.log('====================================================\n');

const reportPath = path.join(__dirname, '../icecat-sync-report.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Match table rows
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

console.log(`📊 Icecat Raporunda Bulunan TV Kodları: ${codeToImageMap.size}`);

// 1. Update mockTVs.ts
const mockTVsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
const rawContent = fs.readFileSync(mockTVsPath, 'utf8');

const equalsIndex = rawContent.indexOf('=');
const jsonStartIndex = rawContent.indexOf('[', equalsIndex);
const jsonEndIndex = rawContent.lastIndexOf(']');

if (jsonStartIndex === -1 || jsonEndIndex === -1) {
  throw new Error('mockTVs.ts JSON array sınırları bulunamadı!');
}

const jsonString = rawContent.substring(jsonStartIndex, jsonEndIndex + 1);
const mockTVs = JSON.parse(jsonString);
console.log(`📦 mockTVs.ts içindeki toplam TV sayısı: ${mockTVs.length}`);

let updatedTVsCount = 0;

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
    updatedTVsCount++;
  }
});

const updatedTVsFileContent = `import { Product } from './types';\n\nexport const mockTVs: Product[] = ${JSON.stringify(mockTVs, null, 2)};\n`;
fs.writeFileSync(mockTVsPath, updatedTVsFileContent, 'utf8');

console.log(`✅ mockTVs.ts GÜNCELLENDİ: ${updatedTVsCount} / ${mockTVs.length} adet TV doğrulanmış Icecat görseline bağlandı.`);

// 2. Smartphones
const phonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
console.log(`📦 smartphonesData.json içindeki toplam telefon sayısı: ${phones.length}`);

let updatedPhonesCount = 0;
phones.forEach(p => {
  if (!p.brand || !p.brand.toLowerCase().includes('samsung')) {
    const code = extractPartCode(p.name, p.brand);
    if (code && codeToImageMap.has(code.toUpperCase())) {
      const img = codeToImageMap.get(code.toUpperCase());
      p.image = img;
      if (Array.isArray(p.images) && p.images.length > 0) p.images[0] = img;
      updatedPhonesCount++;
    }
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`✅ smartphonesData.json GÜNCELLENDİ: ${updatedPhonesCount} adet telefon güncellendi (Samsung Epey stüdyo görselleri korundu).`);

console.log('\n====================================================');
console.log(`🎉 SEÇENEK B TAMAMLANDI!`);
console.log(`📺 Güncellenen TV Sayısı     : ${updatedTVsCount}`);
console.log(`📱 Güncellenen Telefon Sayısı: ${updatedPhonesCount}`);
console.log(`🛡️ Laptop, Ev Aleti, Monitör vb. kategorilere dokunulmadı.`);
console.log('====================================================');
