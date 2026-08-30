const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('🔬 KANIT 1: CANLI SİTENİN KULLANDIĞI DOSYALAR VE TAM ÜRÜN SAYILARI');
console.log('================================================================');

const liveFiles = [
  { name: 'smartphones', path: path.resolve(__dirname, '../src/lib/smartphonesData.json'), type: 'json' },
  { name: 'tvs', path: path.resolve(__dirname, '../src/lib/mockTVs.ts'), type: 'ts' },
  { name: 'laptops', path: path.resolve(__dirname, '../src/lib/mockLaptops.ts'), type: 'ts' },
  { name: 'tablets', path: path.resolve(__dirname, '../src/lib/mockTablets.ts'), type: 'ts' },
  { name: 'smartwatches', path: path.resolve(__dirname, '../src/lib/mockSmartwatches.ts'), type: 'ts' },
  { name: 'headphones', path: path.resolve(__dirname, '../src/lib/mockHeadphones.ts'), type: 'ts' },
  { name: 'appliances', path: path.resolve(__dirname, '../src/lib/mockAppliances.ts'), type: 'ts' },
  { name: 'monitors', path: path.resolve(__dirname, '../src/lib/mockMonitors.ts'), type: 'ts' },
  { name: 'consoles', path: path.resolve(__dirname, '../src/lib/mockConsoles.ts'), type: 'ts' }
];

let totalCount = 0;
const allLiveProducts = [];

liveFiles.forEach((f, idx) => {
  const content = fs.readFileSync(f.path, 'utf8');
  let count = 0;
  let items = [];

  if (f.type === 'json') {
    items = JSON.parse(content);
    count = items.length;
  } else {
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) {
      items = JSON.parse(match[2]);
      count = items.length;
    }
  }

  totalCount += count;
  items.forEach(it => allLiveProducts.push({ ...it, fileSource: f.path, categoryName: f.name }));
  console.log(`[${idx + 1}] Kategori: ${f.name.padEnd(14)} | Sayı: ${String(count).padStart(4)} | Dosya: ${f.path}`);
});

console.log(`\n👉 TOPLAM CANLI ÜRÜN SAYISI: ${totalCount}\n`);

console.log('================================================================');
console.log('🔬 KANIT 2: ICECAT SYNC SCRIPTİNİN OKUDUĞU DOSYALAR');
console.log('================================================================');
const syncScriptContent = fs.readFileSync(path.resolve(__dirname, '../scripts/icecatPreviewSync.js'), 'utf8');
const datasetsBlock = syncScriptContent.match(/const datasets = \[([\s\S]*?)\];/);
console.log('scripts/icecatPreviewSync.js dosyasındaki "datasets" tanımları:\n');
console.log(datasetsBlock ? datasetsBlock[0] : 'Bulunamadı');

console.log('\n================================================================');
console.log('🔬 KANIT 3: VARYANT FARKI (SAMSUNG S26 ULTRA & IPHONE 16 PRO ÖRNEĞİ)');
console.log('================================================================');

const s26Variants = allLiveProducts.filter(p => p.name.includes('S26 Ultra') || p.id.includes('s26-ultra'));
console.log(`📱 "Samsung Galaxy S26 Ultra" Havuzdaki Kayıtları (${s26Variants.length} adet):`);
s26Variants.forEach(v => {
  console.log(`   - ID: ${v.id.padEnd(30)} | Adı: ${v.name}`);
});

const ip16Variants = allLiveProducts.filter(p => p.name.includes('iPhone 16 Pro Max') || p.id.includes('iphone-16-pro-max'));
console.log(`\n📱 "iPhone 16 Pro Max" Havuzdaki Kayıtları (${ip16Variants.length} adet):`);
ip16Variants.forEach(v => {
  console.log(`   - ID: ${v.id.padEnd(30)} | Adı: ${v.name}`);
});

console.log('\n================================================================');
console.log('🔬 KANIT 4: CANLI VERİDEN RASTGELE 10 ÜRÜN VE ICECAT RAPORUNDAKİ BİREBİR KARŞILIĞI');
console.log('================================================================');

// Load icecat report and preview
const stagingPreview = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/icecat_staging_preview.json'), 'utf8'));
const reportContent = fs.readFileSync(path.resolve(__dirname, '../icecat-sync-report.md'), 'utf8');

// Deterministic 10 sample products across categories
const sampleIndices = [0, 350, 800, 1500, 2200, 2800, 3400, 4100, 4800, 5200];

sampleIndices.forEach((idx, num) => {
  const p = allLiveProducts[idx];
  const inStaging = stagingPreview.items.find(it => it.productId === p.id);
  const inReport = reportContent.includes(p.name);

  console.log(`[Örnek ${num + 1}] ID: ${p.id}`);
  console.log(`   Ürün Adı      : ${p.name}`);
  console.log(`   Kaynak Dosya  : ${p.fileSource}`);
  console.log(`   Staging Durumu: ${inStaging ? `VAR (Arama Kodu: ${inStaging.searchKeyUsed})` : 'Fallback / Kodu Yok'}`);
  console.log(`   Raporda Var mı: ${inReport ? '✅ EVET (icecat-sync-report.md içinde mevcut)' : '❌ HAYIR'}\n`);
});
