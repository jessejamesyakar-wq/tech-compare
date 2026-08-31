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

console.log('=== DOĞRU ALANLARLA (basePrice & storeOffers) TÜM KATEGORİLER FİYAT ANALİZİ ===\n');

const stats = [];

files.forEach(f => {
  const content = fs.readFileSync(f.path, 'utf8');
  let items = [];

  if (f.type === 'json') {
    items = JSON.parse(content);
  } else {
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) items = JSON.parse(match[2]);
  }

  let withPrice = 0;
  let withStoreOffers = 0;

  items.forEach(p => {
    const pr = p.basePrice || p.price;
    if (pr && pr > 0) withPrice++;
    const offers = p.storeOffers || p.stores || p.merchants || [];
    if (Array.isArray(offers) && offers.length > 0) withStoreOffers++;
  });

  stats.push({
    Kategori: f.name,
    'Toplam Ürün': items.length,
    'Fiyatı Olan Ürün': withPrice,
    'Fiyat Oranı': `${((withPrice / items.length) * 100).toFixed(1)}%`,
    'Mağaza Teklifi (storeOffers) Olan': withStoreOffers,
    'Mağaza Oranı': `${((withStoreOffers / items.length) * 100).toFixed(1)}%`
  });
});

console.table(stats);
