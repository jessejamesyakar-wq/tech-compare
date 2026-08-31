const fs = require('fs');
const path = require('path');

const files = [
  { name: 'smartphones', path: path.join(__dirname, '../src/lib/smartphonesData.json'), type: 'json' },
  { name: 'tvs', path: path.join(__dirname, '../src/lib/mockTVs.ts'), type: 'ts' },
  { name: 'laptops', path: path.join(__dirname, '../src/lib/mockLaptops.ts'), type: 'ts' },
  { name: 'tablets', path: path.join(__dirname, '../src/lib/mockTablets.ts'), type: 'ts' },
  { name: 'smartwatches', path: path.join(__dirname, '../src/lib/mockSmartwatches.ts'), type: 'ts' },
  { name: 'headphones', path: path.join(__dirname, '../src/lib/mockHeadphones.ts'), type: 'ts' },
  { name: 'appliances', path: path.join(__dirname, '../src/lib/mockAppliances.ts'), type: 'ts' },
  { name: 'monitors', path: path.join(__dirname, '../src/lib/mockMonitors.ts'), type: 'ts' },
  { name: 'consoles', path: path.join(__dirname, '../src/lib/mockConsoles.ts'), type: 'ts' }
];

console.log('================================================================');
console.log('📸 TÜM KATALOG DETAYLI FOTOĞRAF VE GÖRSEL DURUM ANALİZİ        📸');
console.log('================================================================\n');

const categoryStats = [];
const sharedImageMap = new Map();
const allProducts = [];

files.forEach(f => {
  const content = fs.readFileSync(f.path, 'utf8');
  let items = [];

  if (f.type === 'json') {
    items = JSON.parse(content);
  } else {
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) items = JSON.parse(match[2]);
  }

  let uniqueImageCount = 0;
  let icecatImageCount = 0;
  let placeholderCount = 0;
  let multiImageCount = 0;
  const imageCounts = new Map();

  items.forEach(p => {
    allProducts.push({ ...p, categoryName: f.name });
    const img = p.image || '';
    if (img) {
      imageCounts.set(img, (imageCounts.get(img) || 0) + 1);
      sharedImageMap.set(img, (sharedImageMap.get(img) || 0) + 1);

      if (img.includes('icecat')) icecatImageCount++;
      if (img.includes('placeholder') || img.includes('default') || img.includes('no-image')) placeholderCount++;
    }
    if (Array.isArray(p.images) && p.images.length > 1) {
      multiImageCount++;
    }
  });

  imageCounts.forEach((count, img) => {
    if (count === 1) uniqueImageCount++;
  });

  categoryStats.push({
    Kategori: f.name,
    'Toplam Ürün': items.length,
    'Özgün Tekil Görsel': uniqueImageCount,
    'Icecat Doğrulanmış': icecatImageCount,
    'Çoklu Açı (Galeri)': multiImageCount,
    'Ortak/Paylaşılan Görsel': items.length - uniqueImageCount
  });
});

console.table(categoryStats);

console.log('\n================================================================');
console.log('⚠️ EN ÇOK PAYLAŞILAN / JENERİK GÖRSELLER (Öncelikli Değiştirilecekler):');
console.log('================================================================');

const topShared = Array.from(sharedImageMap.entries())
  .filter(([img, count]) => count > 5)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 15);

topShared.forEach(([img, count], idx) => {
  console.log(`${idx + 1}. [${count} Üründe Paylaşılan]: ${img}`);
});
