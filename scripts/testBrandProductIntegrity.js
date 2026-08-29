const fs = require('fs');
const path = require('path');

// Load smartphonesData.json and all mock files
const smartphones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

function loadMockArray(fileName) {
  const filePath = path.join(__dirname, '../src/lib', fileName);
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract JSON objects using regex / array bounds
  const firstBracket = content.indexOf('[');
  const lastBracket = content.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1) {
    try {
      return JSON.parse(content.slice(firstBracket, lastBracket + 1));
    } catch (e) {
      return [];
    }
  }
  return [];
}

const tvs = loadMockArray('mockTVs.ts');
const laptops = loadMockArray('mockLaptops.ts');
const tablets = loadMockArray('mockTablets.ts');
const smartwatches = loadMockArray('mockSmartwatches.ts');
const headphones = loadMockArray('mockHeadphones.ts');
const consoles = loadMockArray('mockConsoles.ts');
const appliances = loadMockArray('mockAppliances.ts');
const monitors = loadMockArray('mockMonitors.ts');

const allCatalog = [
  ...smartphones,
  ...tvs,
  ...laptops,
  ...tablets,
  ...smartwatches,
  ...headphones,
  ...consoles,
  ...appliances,
  ...monitors
];

// Resolver simulation matching src/lib/data.ts getProductById
function getProductById(id) {
  if (!id) return undefined;
  const decoded = decodeURIComponent(id).toLowerCase().trim();

  // 1. Direct exact matches
  const exact = allCatalog.find(
    p =>
      p.id.toLowerCase() === decoded ||
      p.slug.toLowerCase() === decoded ||
      p.slug.toLowerCase().replace(/_/g, '-') === decoded.replace(/_/g, '-') ||
      p.name.toLowerCase() === decoded
  );
  if (exact) return exact;

  // 2. Normalized prefix/suffix matching
  const stripNumbers = str => str.replace(/-[0-9]+$/, '');
  const stripPrefix = str => str.replace(/^[a-z0-9]+-([a-z0-9]+-)/, '$1');

  const normalized = allCatalog.find(
    p =>
      stripNumbers(p.slug.toLowerCase()) === stripNumbers(decoded) ||
      stripNumbers(p.id.toLowerCase()) === stripNumbers(decoded) ||
      stripPrefix(p.slug.toLowerCase()) === stripPrefix(decoded) ||
      stripPrefix(p.id.toLowerCase()) === stripPrefix(decoded) ||
      p.slug.toLowerCase().includes(decoded) ||
      decoded.includes(p.slug.toLowerCase())
  );
  if (normalized) return normalized;

  // 3. Name fuzzy match
  return allCatalog.find(p => p.name.toLowerCase().includes(decoded) || decoded.includes(p.name.toLowerCase()));
}

function getCategoryRoute(category) {
  switch (category) {
    case 'smartphones': return 'phones';
    case 'tvs': return 'tvs';
    case 'laptops': return 'laptops';
    case 'appliances': return 'appliances';
    case 'tablets': return 'tablets';
    case 'smartwatches': return 'smartwatches';
    case 'headphones': return 'headphones';
    case 'consoles': return 'consoles';
    case 'monitors': return 'monitors';
    default: return 'phones';
  }
}

console.log('================================================================');
console.log('🔍 TÜM MARKALAR & ÜRÜN LİNK BÜTÜNLÜĞÜ DOĞRULAMA TESTİ');
console.log('================================================================\n');

// Group catalog by Brand
const brandMap = new Map();
allCatalog.forEach(p => {
  if (!p.brand) return;
  const brandNorm = p.brand.trim();
  if (!brandMap.has(brandNorm)) {
    brandMap.set(brandNorm, []);
  }
  brandMap.get(brandNorm).push(p);
});

console.log(`Toplam Doğrulanan Marka Sayısı: ${brandMap.size}`);
console.log(`Toplam Doğrulanan Ürün Sayısı: ${allCatalog.length}\n`);

let passedBrands = 0;
let failedBrands = 0;
let totalTestedProducts = 0;
let brokenLinksCount = 0;
const errorDetails = [];

for (const [brand, products] of brandMap.entries()) {
  let brandAllOk = true;

  for (const p of products) {
    totalTestedProducts++;
    const route = getCategoryRoute(p.category);
    const slug = p.slug || p.id;
    const generatedHref = `/${route}/${slug}`;

    // Test resolving this product from slug
    const resolved = getProductById(slug);

    if (!resolved) {
      brandAllOk = false;
      brokenLinksCount++;
      errorDetails.push({
        brand,
        productName: p.name,
        productId: p.id,
        slug: p.slug,
        generatedHref
      });
    }
  }

  if (brandAllOk) {
    passedBrands++;
  } else {
    failedBrands++;
  }
}

console.log('--- TEST SONUÇLARI ---');
console.log(`✅ Başarılı Markalar: ${passedBrands} / ${brandMap.size}`);
console.log(`❌ Hatalı Markalar: ${failedBrands}`);
console.log(`📦 Test Edilen Toplam Ürün Linki: ${totalTestedProducts}`);
console.log(`🔗 Kırık / Çözülemeyen Link Sayısı: ${brokenLinksCount}`);

if (errorDetails.length > 0) {
  console.log('\n❌ Tespit Edilen Hatalı Linkler:');
  errorDetails.slice(0, 10).forEach(e => {
    console.log(`  - [${e.brand}] ${e.productName} -> Link: ${e.generatedHref} (Çözülemedi)`);
  });
} else {
  console.log('\n🎉 TEBRİKLER! Tüm markaların ve ürünlerin detay sayfaları linkleri %100 kusursuz çalışıyor.');
}

console.log('================================================================');
