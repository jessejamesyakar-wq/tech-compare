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

console.log('=== KATEGORİ BAZLI FİYAT VE MAĞAZA (STORE) VERİSİ ANALİZİ ===\n');

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
  let withStores = 0;
  let storeBreakdown = { hepsiburada: 0, trendyol: 0, mediamarkt: 0, vatan: 0, amazon: 0, diger: 0 };

  items.forEach(p => {
    if (p.price && p.price > 0) withPrice++;
    if (Array.isArray(p.stores) && p.stores.length > 0) {
      withStores++;
      p.stores.forEach(s => {
        const n = (s.name || '').toLowerCase();
        if (n.includes('hepsiburada')) storeBreakdown.hepsiburada++;
        else if (n.includes('trendyol')) storeBreakdown.trendyol++;
        else if (n.includes('mediamarkt')) storeBreakdown.mediamarkt++;
        else if (n.includes('vatan')) storeBreakdown.vatan++;
        else if (n.includes('amazon')) storeBreakdown.amazon++;
        else storeBreakdown.diger++;
      });
    }
  });

  stats.push({
    kategori: f.name,
    toplamUrun: items.length,
    fiyatliUrun: withPrice,
    fiyatOrani: `${((withPrice / items.length) * 100).toFixed(1)}%`,
    magazaliUrun: withStores,
    magazaDetay: storeBreakdown
  });
});

console.table(stats.map(s => ({
  Kategori: s.kategori,
  'Toplam Ürün': s.toplamUrun,
  'Fiyatı Olan Ürün': s.fiyatliUrun,
  'Fiyat Oranı': s.fiyatOrani,
  'Mağazalı Ürün': s.magazaliUrun,
  'Hepsiburada Teklif': s.magazaDetay.hepsiburada,
  'Trendyol Teklif': s.magazaDetay.trendyol,
  'MediaMarkt Teklif': s.magazaDetay.mediamarkt,
  'Vatan Teklif': s.magazaDetay.vatan,
  'Amazon Teklif': s.magazaDetay.amazon
})));
