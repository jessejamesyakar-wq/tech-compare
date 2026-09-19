// scripts/testBrandProductIntegrity.ts
/**
 * TÜM MARKALAR & ÜRÜN LİNK BÜTÜNLÜĞÜ DOĞRULAMA TESTİ
 * 
 * Uygulamanın GERÇEK getProductById çözümleyicisini (src/lib/data.ts) kullanır.
 * Her ürün slug/id'si için dönen nesnenin kimliğinin (id/slug) ve 
 * depolama kapasitesinin (256 GB, 512 GB, 1 TB vb.) tam olarak eşleştiğini denetler.
 */

import { getStoredProducts } from '../src/lib/adminData';
import { getProductById } from '../src/lib/data';

function extractStorage(str: string): string | null {
  if (!str) return null;
  const match = str.match(/\b(\d{1,4}\s*(?:gb|tb))\b/i);
  return match ? match[1].toLowerCase().replace(/\s+/g, '') : null;
}

function getCategoryRoute(category: string): string {
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
console.log('🔍 TÜM MARKALAR & ÜRÜN LİNK BÜTÜNLÜĞÜ VE KAPASİTE EŞLEŞME TESTİ');
console.log('================================================================\n');

const catalog = getStoredProducts();

// Group catalog by Brand
const brandMap = new Map<string, typeof catalog>();
catalog.forEach((p) => {
  if (!p.brand) return;
  const brandNorm = p.brand.trim();
  if (!brandMap.has(brandNorm)) {
    brandMap.set(brandNorm, []);
  }
  brandMap.get(brandNorm)!.push(p);
});

console.log(`Toplam Doğrulanan Marka Sayısı: ${brandMap.size}`);
console.log(`Toplam Doğrulanan Ürün Sayısı: ${catalog.length}\n`);

let passedBrands = 0;
let failedBrands = 0;
let totalTestedProducts = 0;
let brokenLinksCount = 0;
let capacityMismatchCount = 0;
const errorDetails: { brand: string; name: string; id: string; targetSlug: string; reason: string }[] = [];

for (const [brand, products] of brandMap.entries()) {
  let brandAllOk = true;

  for (const p of products) {
    totalTestedProducts++;
    const route = getCategoryRoute(p.category);
    const targetSlug = p.slug || p.id;
    const expectedStorage = extractStorage(p.name || p.slug || p.id);

    // Test resolving this product using the application's ACTUAL getProductById function
    const resolved = getProductById(targetSlug);

    if (!resolved) {
      brandAllOk = false;
      brokenLinksCount++;
      errorDetails.push({
        brand,
        name: p.name,
        id: p.id,
        targetSlug,
        reason: 'Uygulama getProductById çözümleyicisi ürünü bulamadı (null döndü)'
      });
    } else {
      // Identity Check: resolved id/slug must match target product id/slug
      const identityMatches = resolved.id === p.id || resolved.slug === p.slug;
      if (!identityMatches) {
        brandAllOk = false;
        brokenLinksCount++;
        errorDetails.push({
          brand,
          name: p.name,
          id: p.id,
          targetSlug,
          reason: `Kimlik Uyuşmazlığı! Beklenen ID/Slug: "${p.id}" / "${p.slug}", Çözümlenen: "${resolved.id}" / "${resolved.slug}"`
        });
      }

      // Capacity Check: If a specific storage capacity (e.g. 512GB) is in product name, resolved product MUST match it
      if (expectedStorage) {
        const resolvedStorage = extractStorage(resolved.name || resolved.slug || resolved.id);
        if (resolvedStorage && resolvedStorage !== expectedStorage) {
          brandAllOk = false;
          capacityMismatchCount++;
          errorDetails.push({
            brand,
            name: p.name,
            id: p.id,
            targetSlug,
            reason: `Kapasite Sapması! Beklenen Kapasite: "${expectedStorage}", Çözümlenen Kapasite: "${resolvedStorage}" (${resolved.name})`
          });
        }
      }
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
console.log(`💾 Kapasite Sapması Hata Sayısı: ${capacityMismatchCount}`);

if (errorDetails.length > 0) {
  console.log('\n❌ Tespit Edilen Hatalar:');
  errorDetails.slice(0, 15).forEach((e) => {
    console.log(`  - [${e.brand}] ${e.name} (Slug: ${e.targetSlug}) -> ${e.reason}`);
  });
  process.exit(1);
} else {
  console.log('\n🎉 TEBRİKLER! Tüm markaların ve ürünlerin detay sayfaları linkleri ve kapasiteleri GERÇEK getProductById ile %100 kusursuz eşleşti.');
  console.log('================================================================');
  process.exit(0);
}
