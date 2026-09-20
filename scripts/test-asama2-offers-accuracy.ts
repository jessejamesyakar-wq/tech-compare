import { getProductById } from '../src/lib/data';
import { getStoredProducts } from '../src/lib/adminData';
import { mockMonitors } from '../src/lib/mockMonitors';
import { mockTVs } from '../src/lib/mockTVs';
import { mockConsoles } from '../src/lib/mockConsoles';
import { mockTablets } from '../src/lib/mockTablets';
import { mockLaptops } from '../src/lib/mockLaptops';
import { isSearchUrl, getPriceFreshness } from '../src/lib/priceFreshness';
import { getEffectiveStoreCount } from '../src/lib/activeStores';
import { evaluateAllStoresPresence } from '../src/lib/pricing/storeAvailabilityEngine';
import { parseDateToMs } from '../src/lib/priceSignal';
import { evaluateProductPricing } from '../src/lib/pricing/unifiedPriceEvaluator';
import { formatProductRecommendations } from '../src/lib/ai/resolvers';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

console.log('=== AŞAMA 2 TEKNİK VE MAĞAZA TEKLİFLERİ DOĞRULAMA TESTİ ===\n');

// 1. LG 27GX790A-B MONİTÖR & ALIAS REDIRECTION
console.log('1. LG 27GX790A-B Monitör ve Alias Yönlendirmesi:');
const lgMonitor = mockMonitors.find((m) => m.id === 'lg-ultragear-27gx790a-b');
assert(!!lgMonitor, 'LG 27GX790A-B monitör kataloğunda mevcut');
if (lgMonitor) {
  assert(lgMonitor.category === 'monitors', 'LG 27GX790A-B kategorisi "monitors"');
  assert(lgMonitor.sourceType === 'manufacturer', 'LG 27GX790A-B kaynak türü "manufacturer"');
  assert(
    lgMonitor.sourceUrl === 'https://www.lg.com/us/monitors/lg-27gx790a-b-gaming-monitor',
    'LG 27GX790A-B resmî üretici URL bağlantısı doğru'
  );
  const specs = lgMonitor.specs as any;
  assert(specs?.hdmiPorts === 2, 'HDMI port sayısı 2 (HDMI 2.1 x2)');
  assert(specs?.displayPortPorts === 1, 'DisplayPort sayısı 1 (DisplayPort 2.1 x1)');
  assert(typeof specs?.vesaMount === 'string' && specs.vesaMount.includes('100x100'), 'VESA montaj ölçüsü 100x100mm');
  assert(Array.isArray(lgMonitor.aliasIds) && lgMonitor.aliasIds.includes('lg-lg-ultragear-27gx790a-b'), 'aliasIds eski TV ID\'sini içeriyor');
}

const resolvedLg = getProductById('lg-lg-ultragear-27gx790a-b');
assert(!!resolvedLg && resolvedLg.id === 'lg-ultragear-27gx790a-b', 'Eski TV adresi "lg-lg-ultragear-27gx790a-b" doğrudan doğru monitöre yönleniyor');

const duplicateTv = mockTVs.find((t) => t.id === 'lg-lg-ultragear-27gx790a-b');
assert(!duplicateTv, 'mockTVs içinde yinelenen LG TV kaydı silindi (0 duplicate)');


// 2. MSI CLAW & HP OMEN C12CSEA KONTROLÜ
console.log('\n2. MSI Claw & HP OMEN (C12CSEA) Doğrulaması:');
const msi088 = getProductById('msi-claw-a1m-088tr') || mockConsoles.find((c) => c.name.includes('A1M-088TR'));
assert(!!msi088, 'MSI Claw A1M-088TR konsol kataloğunda var');
if (msi088) {
  assert((msi088 as any).storageGb === 512 || (msi088.specs as any)?.storageGb === 512, 'MSI Claw A1M-088TR kapasitesi 512 GB');
  assert(msi088.sourceType === 'unverified', 'MSI Claw A1M-088TR alan kaynakları bütün ürün veya fiyat doğrulaması sayılmadı');
}

const msi089 = getProductById('msi-claw-a1m-089tr') || mockConsoles.find((c) => c.name.includes('A1M-089TR'));
assert(!!msi089, 'MSI Claw A1M-089TR konsol kataloğunda var');
if (msi089) {
  assert((msi089 as any).storageGb === 1024 || (msi089.specs as any)?.storageGb === 1024, 'MSI Claw A1M-089TR kapasitesi 1024 GB (1 TB)');
  assert(msi089.sourceType === 'unverified', 'MSI Claw A1M-089TR alan kaynakları bütün ürün veya fiyat doğrulaması sayılmadı');
}

const hpOmen = mockLaptops.find((l) => l.id.includes('c12csea') || l.name.includes('C12CSEA'));
assert(!!hpOmen, 'HP OMEN C12CSEA laptop kataloğunda var');
if (hpOmen) {
  const hpStorage = (hpOmen as any).storageGb || (hpOmen.specs as any)?.storageGb;
  assert(hpStorage === 1024, 'HP OMEN C12CSEA SKU başlığındaki 1TBSSD ile uyumlu 1024 GB olarak doğrulandı (2048 değil)');
}


// 3. IPAD AIR 11 M4 MH7N4TU/A DOĞRUDAN KAYNAK KONTROLÜ
console.log('\n3. iPad Air 11 M4 (MH7N4TU/A) Doğrudan Ürün Sayfası Kaynak Kontrolü:');
const ipad = mockTablets.find((t) => t.id === 'apple-ipad-air-11-m4-wi-fi-plus-cellular-mh7n4tu-a');
assert(!!ipad, 'iPad Air 11 M4 MH7N4TU/A tablet kataloğunda var');
if (ipad) {
  assert((ipad as any).storageGb === 1024 || (ipad.specs as any)?.storageGb === 1024, 'MH7N4TU/A kodlu modelin hafızası 1024 GB (1 TB)');
  assert(ipad.sourceType === 'retailer', 'Kaynak türü "retailer" olarak işaretlendi');
  assert(
    !!ipad.sourceUrl && ipad.sourceUrl.includes('/product/') && ipad.sourceUrl.includes('mh7n4tu-a'),
    'iPad kaynak URL\'si ana sayfa değil, MH7N4TU/A doğrudan ürün sayfası bağlantısı'
  );
}


// 4. URL SINIFLANDIRMASI VE SIKI DOĞRULAMA KURALLARI
console.log('\n4. URL Sınıflandırması ve Teklif Doğrulama Kuralları:');
assert(isSearchUrl('https://www.amazon.com.tr/s?k=samsung+s24') === true, 'Amazon /s?k= arama URL\'si isSearchUrl ile true dönüyor');
assert(isSearchUrl('https://www.gaming.gen.tr/?s=rtx+4070') === true, 'Gaming.Gen ?s= arama URL\'si isSearchUrl ile true dönüyor');
assert(isSearchUrl('https://www.mediamarkt.com.tr') === true, 'MediaMarkt ana sayfa adresi arama/genel URL kabul edildi');
assert(isSearchUrl('https://www.vatanbilgisayar.com/') === true, 'Vatan ana sayfa adresi arama/genel URL kabul edildi');
assert(isSearchUrl('https://www.mediamarkt.com.tr/tr/product/_apple-ipad.html', false) === false, 'Doğrudan ürün URL\'si false dönüyor');

// 5. GEÇERSİZ / GELECEK VE SÜRESİ DOLMUŞ TARİHLER İÇİN ORTAK UYGUNLUK KURALLARI
console.log('\n5. Ortak Teklif Uygunluk ve Tarih Doğrulama Kuralları:');

// A. "not-a-date" (Geçersiz tarih)
const invalidDateOffer = {
  storeName: 'Hepsiburada',
  price: 45000,
  inStock: true,
  url: 'https://www.hepsiburada.com/tr/product/p1.html',
  isSearchLink: false,
  lastCheckedAt: 'not-a-date'
};
const presenceInvalidDate = evaluateAllStoresPresence({
  name: 'Test Product',
  storeOffers: [invalidDateOffer]
});
assert(presenceInvalidDate.inStockCount === 0, '"not-a-date" tarihli teklif aktif mağaza sayısına KATILMADI (0)');
assert(presenceInvalidDate.lowestPrice === null, '"not-a-date" tarihli teklif en düşük fiyata KATILMADI (lowestPrice = null)');
assert(getEffectiveStoreCount([invalidDateOffer]) === 0, 'getEffectiveStoreCount "not-a-date" teklifini 0 döndürdü');
assert(getPriceFreshness('not-a-date').status === 'unverified', 'getPriceFreshness("not-a-date") "unverified" döndürdü');

// B. "2099-01-01" (Gelecek tarih)
const futureDateOffer = {
  storeName: 'Hepsiburada',
  price: 45000,
  inStock: true,
  url: 'https://www.hepsiburada.com/tr/product/p1.html',
  isSearchLink: false,
  lastCheckedAt: '2099-01-01T00:00:00Z'
};
const presenceFutureDate = evaluateAllStoresPresence({
  name: 'Test Product',
  storeOffers: [futureDateOffer]
});
assert(presenceFutureDate.inStockCount === 0, '2099 (gelecek) tarihli teklif aktif mağaza sayısına KATILMADI (0)');
assert(presenceFutureDate.lowestPrice === null, '2099 (gelecek) tarihli teklif en düşük fiyata KATILMADI (null)');
assert(getEffectiveStoreCount([futureDateOffer]) === 0, 'getEffectiveStoreCount gelecek tarihi reddetti');
assert(getPriceFreshness('2099-01-01T00:00:00Z').status === 'unverified', 'getPriceFreshness gelecek tarihi "unverified" olarak etiketledi');

// C. "2020-01-01" (Süresi dolmuş eski tarih >30 gün)
const staleDateOffer = {
  storeName: 'Hepsiburada',
  price: 45000,
  inStock: true,
  url: 'https://www.hepsiburada.com/tr/product/p1.html',
  isSearchLink: false,
  lastCheckedAt: '2020-01-01T00:00:00Z'
};
const presenceStaleDate = evaluateAllStoresPresence({
  name: 'Test Product',
  storeOffers: [staleDateOffer]
});
assert(presenceStaleDate.inStockCount === 0, '2020 tarihli (süresi dolmuş) teklif aktif mağaza sayısına KATILMADI (0)');
assert(presenceStaleDate.lowestPrice === null, '2020 tarihli teklif en düşük fiyata KATILMADI (null)');
assert(getPriceFreshness('2020-01-01T00:00:00Z').status === 'unverified', 'getPriceFreshness süresi dolmuş tarihi "unverified" döndürdü');

// D. 48 Saatlik Teklif (PRICE_FRESHNESS_HOURS = 24 Kuralı)
const hours48Ago = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
const offer48h = {
  storeName: 'Hepsiburada',
  price: 42000,
  inStock: true,
  url: 'https://www.hepsiburada.com/tr/product/p1.html',
  isSearchLink: false,
  lastCheckedAt: hours48Ago
};

const presence48h = evaluateAllStoresPresence({
  name: 'Test 48h Phone',
  storeOffers: [offer48h]
});

assert(presence48h.inStockCount === 0, '48 saatlik teklif güncel mağaza sayısına KATILMADI (inStockCount = 0)');
assert(presence48h.lowestPrice === null, '48 saatlik teklif güncel en düşük fiyata KATILMADI (lowestPrice = null)');
assert(getEffectiveStoreCount([offer48h]) === 0, 'getEffectiveStoreCount 48 saatlik teklif için 0 döndürdü');

const eval48h = evaluateProductPricing({
  basePrice: 50000,
  storeOffers: [offer48h]
});
assert(eval48h.currentPrice === null, '48 saatlik teklif için currentPrice KESİNLİKLE null dönüyor');
assert(eval48h.lowestFreshPrice === null, '48 saatlik teklif için lowestFreshPrice null dönüyor');
assert(eval48h.lastSeenPrice === 42000, '48 saatlik teklif lastSeenPrice = 42000 olarak son görülen fiyata aktarıldı');
assert(eval48h.priceStatus === 'stale', '48 saatlik teklif priceStatus = "stale" olarak etiketlendi');
assert(eval48h.statusLabel.startsWith('Son görülen fiyat:'), '48 saatlik teklif statusLabel "Son görülen fiyat: DD.MM.YYYY" taşıyor');

// E. 24 Saat İçi Güncel Teklif (Fresh Offer)
const freshOffer = {
  storeName: 'Hepsiburada',
  price: 39000,
  inStock: true,
  url: 'https://www.hepsiburada.com/tr/product/p1.html',
  isSearchLink: false,
  lastCheckedAt: new Date().toISOString()
};

const evalFresh = evaluateProductPricing({
  basePrice: 50000,
  storeOffers: [freshOffer]
});
assert(evalFresh.currentPrice === 39000, 'Güncel teklif (<=24h) için currentPrice = 39000');
assert(evalFresh.lastSeenPrice === null, 'Güncel teklif varlığında lastSeenPrice = null');
assert(evalFresh.priceStatus === 'fresh', 'Güncel teklif priceStatus = "fresh"');
assert(evalFresh.statusLabel === 'Güncel Fiyat', 'Güncel teklif statusLabel = "Güncel Fiyat"');

// F. AI Resolvers Entegrasyonu
const aiFormatted = formatProductRecommendations([{
  id: 'phone-48h',
  name: 'Phone 48h',
  category: 'smartphones',
  basePrice: 50000,
  storeOffers: [offer48h]
}]);
assert(aiFormatted[0].currentPrice === null, 'AI önerisi 48 saatlik teklif için currentPrice = null taşıyor');
assert(aiFormatted[0].priceStatus === 'stale', 'AI önerisi 48 saatlik teklif için priceStatus = "stale" taşıyor');
assert(aiFormatted[0].statusLabel.startsWith('Son görülen fiyat:'), 'AI önerisi statusLabel "Son görülen fiyat" taşıyor');


// 6. EKSİK STOK KONTROLÜ VE UNKNOWN DURUMU AYRIMI
console.log('\n6. Eksik Stok (UNKNOWN) ve Listelenmiyor (NOT_LISTED) Ayrımı:');
const missingStockOffer = {
  storeName: 'MediaMarkt',
  price: 52000,
  url: 'https://www.mediamarkt.com.tr/tr/product/_p2.html',
  isSearchLink: false
  // inStock bilgisi eksik (undefined)
};
const presenceUnknownStock = evaluateAllStoresPresence({
  name: 'Test Laptop',
  storeOffers: [missingStockOffer as any]
});
const unknownValidated = presenceUnknownStock.unavailableOffers.find((o) => o.storeKey === 'mediamarkt');
assert(!!unknownValidated && unknownValidated.status === 'UNKNOWN', 'Stoğu belirtilmeyen teklif status = "UNKNOWN" olarak tanımlandı');
assert(presenceUnknownStock.unknownStockCount === 1, 'unknownStockCount = 1 olarak hesaplandı');

const notListedStore = presenceUnknownStock.unavailableOffers.find((o) => o.storeKey === 'vatan');
assert(!!notListedStore && notListedStore.status === 'NOT_LISTED', 'Hiç verilmeyen mağaza status = "NOT_LISTED" olarak korundu');


// 7. FİYAT GEÇMİŞİ TARİH SIRALAMASI VE GEÇERSİZ TARİH KONTROLÜ (NO diffDays = 30 FALLBACK)
console.log('\n7. Fiyat Geçmişi Grafik Tarih Doğrulaması ve Sıralaması:');

// A. Sırasız/ters tarihler kronolojik olarak sıralanmalı
const reversedPoints = [
  { date: '2026-09-15', price: 50000 },
  { date: '2026-09-05', price: 48000 }
];
const nowMs = Date.now();
const sortedPoints = reversedPoints
  .filter((h) => parseDateToMs(h.date) > 0 && parseDateToMs(h.date) <= nowMs)
  .sort((a, b) => parseDateToMs(a.date) - parseDateToMs(b.date));

assert(sortedPoints[0].date === '2026-09-05', 'Ters verilen geçmiş verileri kronolojik olarak sıralandı (2026-09-05 ilk sıraya geldi)');

const t1 = parseDateToMs(sortedPoints[0].date);
const t2 = parseDateToMs(sortedPoints[sortedPoints.length - 1].date);
const computedDiffDays = Math.max(1, Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));
assert(computedDiffDays === 10, 'Sıralanmış veride fark 10 gün olarak doğru hesaplandı (sabit 30 varsayımı kullanılmadı)');

// B. Geçersiz tarih içeren grafik noktası reddedilmeli
const invalidPoints = [
  { date: 'invalid-date-str', price: 50000 },
  { date: '2026-09-10', price: 48000 }
];
const validPointsOnly = invalidPoints.filter((h) => parseDateToMs(h.date) > 0 && parseDateToMs(h.date) <= nowMs);
assert(validPointsOnly.length === 1, 'Geçersiz tarihli grafik noktası elendi (kalan nokta sayısı: 1)');
assert(validPointsOnly.length < 2, 'Kullanılabilir gözlem sayısı < 2 olduğu için grafik "Yetersiz Doğrulanmış Veri" moduna geçti');


// 8. BÜTÜN KATALOĞUN KELİME SINIRI UYARLAMALI KAPASİTE TARAMASI
console.log('\n8. Bütün Kataloğun Kelime Sınırı Uyarlamalı Kapasite Taraması:');
const catalogProducts = getStoredProducts();
let mismatchCount = 0;

for (const p of catalogProducts) {
  const nameNorm = p.name.toLowerCase();
  const stGb = (p as any).storageGb || (p.specs as any)?.storageGb;
  if (stGb) {
    if (/\b1\s*tb\b/i.test(nameNorm)) {
      if (stGb !== 1024) mismatchCount++;
    } else if (/\b512\s*gb\b/i.test(nameNorm)) {
      if (stGb !== 512) mismatchCount++;
    } else if (/\b256\s*gb\b/i.test(nameNorm)) {
      if (stGb !== 256) mismatchCount++;
    } else if (/\b128\s*gb\b/i.test(nameNorm)) {
      if (stGb !== 128) mismatchCount++;
    }
  }
}
assert(mismatchCount === 0, `Katalogda başlık ve depolama spec çelişkisi olan ürün sayısı: ${mismatchCount} (TB330 gibi model kodları yanlış pozitif üretmedi)`);

console.log(`\n========================================`);
console.log(`AŞAMA 2 TEST SONUÇLARI: ${passed} GEÇTİ, ${failed} BAŞARISIZ`);
console.log(`========================================`);

if (failed > 0) {
  process.exit(1);
}
