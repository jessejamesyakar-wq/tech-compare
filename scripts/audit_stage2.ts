// scripts/audit_stage2.ts
import { getStoredProducts } from '../src/lib/adminData';

function runAudit() {
  console.log('================================================================');
  console.log('🔍 AŞAMA 2 KATALOG VE MAĞAZA TEKLİFLERİ DENETİMİ BAŞLIYOR');
  console.log('================================================================\n');

  const allProducts = getStoredProducts();
  console.log(`Toplam Katalog Ürünü Sayısı: ${allProducts.length}`);

  let searchUrlCount = 0;
  let directUrlCount = 0;
  let capacityMismatchCount = 0;
  const capacityMismatches: any[] = [];
  const searchUrlExamples: string[] = [];

  for (const p of allProducts) {
    // Storage Capacity Audit (focus on storage, excluding RAM if title has both e.g. 16GB/1TB)
    const matches = Array.from(p.name.matchAll(/\b(\d+)\s*(GB|TB|SSD|NVMe)\b/gi));
    let storageGbInTitle: number | null = null;

    for (const m of matches) {
      const num = parseInt(m[1], 10);
      const unit = (m[2] || '').toUpperCase();
      // If title explicitly says TB or SSD or 128/256/512/1024/2048, or if it's the second capacity match
      if (unit === 'TB') {
        storageGbInTitle = num * 1024;
      } else if (unit === 'SSD' || unit === 'NVME' || num >= 128 || (matches.length > 1 && m === matches[matches.length - 1])) {
        if (num >= 64) {
          storageGbInTitle = num;
        }
      }
    }

    const specGb = (p.specs as any)?.storageGb || (p.specs as any)?.ssdStorageGb;
    if (storageGbInTitle && typeof specGb === 'number' && specGb > 0 && specGb !== storageGbInTitle) {
      capacityMismatchCount++;
      capacityMismatches.push({
        id: p.id,
        name: p.name,
        titleGb: storageGbInTitle,
        specGb
      });
    }

    // Store Offers Audit
    if (Array.isArray(p.storeOffers)) {
      for (const offer of p.storeOffers) {
        const url = offer.url || '';
        const isSearchUrl =
          url.includes('/ara?q=') ||
          url.includes('/sr?q=') ||
          url.includes('/search.html') ||
          url.includes('/arama/') ||
          url.includes('/s?k=') ||
          url.includes('/arama?s=');

        if (isSearchUrl) {
          searchUrlCount++;
          if (searchUrlExamples.length < 5) {
            searchUrlExamples.push(`${p.name} -> ${offer.storeName}: ${url}`);
          }
        } else {
          directUrlCount++;
        }
      }
    }
  }

  console.log(`\n1. Mağaza Teklifi Bağlantı Türü Dağılımı:`);
  console.log(`   - Mağaza Arama Bağlantıları (Search URLs): ${searchUrlCount}`);
  console.log(`   - Doğrudan Ürün Bağlantıları (Direct Product URLs): ${directUrlCount}`);
  console.log(`   Örnek Arama Bağlantıları:`);
  searchUrlExamples.forEach(ex => console.log(`     * ${ex}`));

  console.log(`\n2. Ürün Başlığı vs Specs Depolama Çelişkisi:`);
  console.log(`   - Tespit Edilen Çelişkili Ürün Sayısı: ${capacityMismatchCount}`);
  if (capacityMismatches.length > 0) {
    capacityMismatches.slice(0, 10).forEach(m => {
      console.log(`     * [${m.id}] ${m.name} -> Başlık: ${m.titleGb}GB, Specs: ${m.specGb}GB`);
    });
  }

  // 3. Check LG 27GX790A-B duplicate across categories
  const lgInMonitors = allProducts.filter(p => p.id.includes('27gx790a-b') && p.category === 'monitors');
  const lgInTvs = allProducts.filter(p => p.id.includes('27gx790a-b') && p.category === 'tvs');

  console.log(`\n3. LG 27GX790A-B Kategori Denetimi:`);
  console.log(`   - "monitors" Kategorisindeki Kayıt Sayısı: ${lgInMonitors.length}`);
  console.log(`   - "tvs" Kategorisindeki Kayıt Sayısı (Hatalı): ${lgInTvs.length}`);

  // 4. Check MSI Claw A1M-088TR
  const msi088 = allProducts.find(p => p.name.includes('A1M-088TR'));
  console.log(`\n4. MSI Claw A1M-088TR Kaydı:`);
  if (msi088) {
    console.log(`   - ID: ${msi088.id}`);
    console.log(`   - İsim: ${msi088.name}`);
    console.log(`   - Specs storageGb: ${(msi088.specs as any)?.storageGb}`);
  } else {
    console.log(`   - MSI Claw A1M-088TR bulunamadı`);
  }
}

runAudit();
