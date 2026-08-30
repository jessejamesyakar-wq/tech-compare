const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').trim();
    }
  });
}

const contentToken = process.env.ICECAT_CONTENT_TOKEN || '81a97782-9a81-4879-a49d-b4590ea070a9';
const reportPath = path.join(__dirname, '../icecat-sync-report.md');
const reportContent = fs.readFileSync(reportPath, 'utf8');

// Parse verified matches from report
const matchRegex = /\|\s*\d+\s*\|\s*\*\*([^*]+)\*\*\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|\s*\[(?:Görsel Linki|Görseli İncele)\]\((https:\/\/images\.icecat\.biz\/[^\s)]+)\)/g;

const matches = [];
let m;
while ((m = matchRegex.exec(reportContent)) !== null) {
  matches.push({
    name: m[1].trim(),
    category: m[2].trim(),
    code: m[3].trim(),
    currentImage: m[4].trim(),
    icecatUrl: m[5].trim()
  });
}

console.log(`🔍 Bulunan toplam doğrulanmış Icecat eşleşmesi: ${matches.length}`);

// 1. Filter ONLY TVs and Smartphones
const tvMatches = matches.filter(it => it.category === 'tvs');
const phoneMatches = matches.filter(it => it.category === 'smartphones');

console.log(`📺 Uygulanacak TV Eşleşmesi      : ${tvMatches.length}`);
console.log(`📱 Uygulanacak Telefon Eşleşmesi : ${phoneMatches.length}`);

// 2. Update mockTVs.ts
const mockTVsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
let mockTVsContent = fs.readFileSync(mockTVsPath, 'utf8');
let mockTVs = [];
const matchTVArray = mockTVsContent.match(/export\s+const\s+mockTVs\s*:\s*TVProduct\[\]\s*=\s*(\[[\s\S]*\]);/);

if (matchTVArray) {
  mockTVs = JSON.parse(matchTVArray[1]);
}

let tvUpdatedCount = 0;
const tvMatchMap = new Map();
tvMatches.forEach(t => {
  tvMatchMap.set(t.name.toLowerCase(), t.icecatUrl);
});

mockTVs.forEach(tv => {
  const icecatUrl = tvMatchMap.get(tv.name.toLowerCase());
  if (icecatUrl) {
    tv.image = icecatUrl;
    if (Array.isArray(tv.images) && tv.images.length > 0) {
      tv.images[0] = icecatUrl;
    } else {
      tv.images = [icecatUrl];
    }
    tvUpdatedCount++;
  }
});

const updatedTVsCode = `import { TVProduct } from './types';\n\nexport const mockTVs: TVProduct[] = ${JSON.stringify(mockTVs, null, 2)};\n`;
fs.writeFileSync(mockTVsPath, updatedTVsCode, 'utf8');
console.log(`✅ mockTVs.ts güncellendi: ${tvUpdatedCount} adet TV resmi Icecat URL'sine bağlandı.`);

// 3. Update smartphonesData.json (ONLY for non-samsung phones that have icecat matches to preserve our custom epey studio photos)
const phonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
let phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
let phoneUpdatedCount = 0;

const phoneMatchMap = new Map();
phoneMatches.forEach(p => {
  phoneMatchMap.set(p.name.toLowerCase(), p.icecatUrl);
});

phones.forEach(p => {
  // If phone is not samsung (samsung has high quality studio epey photos) and has icecat match
  if (!p.brand?.toLowerCase().includes('samsung')) {
    const icecatUrl = phoneMatchMap.get(p.name.toLowerCase());
    if (icecatUrl) {
      p.image = icecatUrl;
      if (Array.isArray(p.images) && p.images.length > 0) {
        p.images[0] = icecatUrl;
      }
      phoneUpdatedCount++;
    }
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`✅ smartphonesData.json güncellendi: ${phoneUpdatedCount} adet telefon güncellendi (Samsung Epey fotoğrafları korundu).`);

console.log('\n====================================================');
console.log(`🎉 SEÇENEK B BAŞARIYLA UYGULANDI!`);
console.log(`📺 Toplam Güncellenen TV Sayısı     : ${tvUpdatedCount}`);
console.log(`📱 Toplam Güncellenen Telefon Sayısı: ${phoneUpdatedCount}`);
console.log(`🛡️ Diğer kategoriler (Laptop, Ev Aletleri vb.) el değmeden korundu.`);
console.log('====================================================');
