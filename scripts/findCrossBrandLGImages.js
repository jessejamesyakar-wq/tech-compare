const fs = require('fs');
const path = require('path');

const files = [
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts', folder: 'tvs' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts', folder: 'monitors' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts', folder: 'laptops' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts', folder: 'tablets' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts', folder: 'smartwatches' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts', folder: 'headphones' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts', folder: 'appliances' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts', folder: 'consoles' },
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json', folder: 'phones' }
];

console.log('================================================================');
console.log('🔍 DİĞER MARKALARDA KULLANILAN LG GÖRSELLERİNİN TESPİTİ       🔍');
console.log('================================================================\n');

let totalContaminated = 0;
const contaminatedByCat = {};

files.forEach(f => {
  const filePath = path.join(__dirname, '../src/lib', f.file);
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'utf8');
  let products = [];

  if (f.type === 'json') {
    products = JSON.parse(content);
  } else {
    const eqIdx = content.indexOf('=');
    const startIdx = content.indexOf('[', eqIdx);
    const endIdx = content.lastIndexOf(']');
    products = JSON.parse(content.substring(startIdx, endIdx + 1));
  }

  const badItems = [];

  products.forEach(p => {
    const brand = (p.brand || '').trim().toLowerCase();
    const isLG = brand === 'lg' || brand === 'lg electronics';
    
    // Check if non-LG product has an LG image
    const checkImg = (img) => {
      if (!img) return false;
      const lower = img.toLowerCase();
      return lower.includes('lg-') || lower.includes('/lg/') || lower.includes('lg_') || lower.includes('qned81b6a') || lower.includes('oled48a1');
    };

    if (!isLG) {
      const mainIsLG = checkImg(p.image);
      const galleryHasLG = Array.isArray(p.images) && p.images.some(checkImg);

      if (mainIsLG || galleryHasLG) {
        badItems.push({
          id: p.id,
          name: p.name,
          brand: p.brand,
          currentImage: p.image
        });
      }
    }
  });

  contaminatedByCat[f.name] = badItems;
  totalContaminated += badItems.length;

  console.log(`📂 [${f.name.toUpperCase()}]: ${badItems.length} adet LG görseli kullanan NON-LG ürün bulundu.`);
  if (badItems.length > 0) {
    console.log(`   Örnekler:`);
    badItems.slice(0, 5).forEach(b => {
      console.log(`   - [${b.brand}] ${b.name} -> Görsel: ${b.currentImage}`);
    });
  }
  console.log('----------------------------------------------------------------');
});

console.log(`\n🚨 TOPLAM DÜZELTİLMESİ GEREKEN ÜRÜN SAYISI: ${totalContaminated}`);
