const fs = require('fs');

console.log('=== YEREL DOGRULAMA TESTI BASLIYOR (AG / API CAGRISI YOK) ===');
const t0 = Date.now();

// 1. MatchedProds Kelime Eşleştirme Testi (route.ts mantığı)
function normalizeTr(text) {
  return (text || '')
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
}

const allProds = JSON.parse(fs.readFileSync('./src/lib/smartphonesData.json', 'utf8'));

function testSingleProductMatch(query) {
  const normMsg = normalizeTr(query);
  const words = normMsg.split(/\s+/).filter(w => w.length >= 2);

  const scoredProds = allProds
    .map(p => {
      const pName = normalizeTr(p.name);
      const pBrand = normalizeTr(p.brand || '');
      const haystack = pName + ' ' + pBrand;
      const matchCount = words.reduce((acc, w) => acc + (haystack.includes(w) ? 1 : 0), 0);
      const matchRatio = matchCount / (words.length || 1);
      return { p, matchCount, matchRatio };
    })
    .filter(entry => entry.matchRatio >= 0.75)
    .sort((a, b) => {
      if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
      return (b.p.reviewScore || 0) - (a.p.reviewScore || 0);
    })
    .map(entry => entry.p)
    .slice(0, 3);

  return scoredProds;
}

console.log('\n1. Arama Eslestirme Dogrulamasi ("redmi note 14 pro"):');
const redmiResults = testSingleProductMatch('redmi note 14 pro');
console.log('   Bulunan urun sayisi:', redmiResults.length);
redmiResults.forEach((p, idx) => {
  console.log(`   [${idx + 1}] ${p.name} - ${p.brand} (₺${p.basePrice?.toLocaleString('tr-TR')})`);
});
const hasApple = redmiResults.some(p => p.brand?.toLowerCase() === 'apple' || p.name?.toLowerCase().includes('iphone'));
console.log('   -> Sonuclarda yanlislikla Apple var mi?:', hasApple ? 'EVET (HATA)' : 'HAYIR (BASARILI)');

// 2. iPhone 17 Pro Max Fiyat Kontrolu (smartphonesData.json)
console.log('\n2. iPhone 17 Pro Max Fiyat Dogrulamasi:');
const ip17Models = allProds.filter(p => p.name && p.name.includes('iPhone 17 Pro Max'));
ip17Models.forEach(p => {
  console.log(`   • ${p.name}: ₺${p.basePrice?.toLocaleString('tr-TR')} (Magaza sayisi: ${p.storeOffers?.length || 0})`);
});
const prices = ip17Models.map(p => p.basePrice);
const uniquePrices = new Set(prices).size === 4;
console.log('   -> 4 depolama da farkli ve gercekci fiyata sahip mi?:', uniquePrices ? 'EVET (BASARILI)' : 'HAYIR (HATA)');

// 3. Scraper Varyant Kontrolu (nightlyPriceSync.js)
console.log('\n3. Scraper Depolama Dogrulamasi (nightlyPriceSync.js):');
const syncScript = fs.readFileSync('./scripts/nightlyPriceSync.js', 'utf8');
const start = syncScript.indexOf('function validateProductMatch');
const end = syncScript.indexOf('async function findHepsiburadaProduct');
const validateProductMatch = new Function(syncScript.slice(start, end) + '; return validateProductMatch;')();

const test512vs256 = validateProductMatch('Apple iPhone 17 Pro Max (512 GB)', 'apple-iphone-17-pro-max-256-gb-kozmik-turuncu');
const test512vs512 = validateProductMatch('Apple iPhone 17 Pro Max (512 GB)', 'apple-iphone-17-pro-max-512-gb-kozmik-turuncu');
const test1TBvs256 = validateProductMatch('Apple iPhone 17 Pro Max (1 TB)', 'apple-iphone-17-pro-max-256-gb-kozmik-turuncu');
const test1TBvs1TB = validateProductMatch('Apple iPhone 17 Pro Max (1 TB)', 'apple-iphone-17-pro-max-1-tb-kozmik-turuncu');

console.log('   • 512GB modele 256GB Hepsiburada linki atanir mi?:', test512vs256 ? 'EVET (HATA)' : 'HAYIR, REDDEDILDI (BASARILI)');
console.log('   • 512GB modele 512GB Hepsiburada linki atanir mi?:', test512vs512 ? 'EVET (BASARILI)' : 'HAYIR (HATA)');
console.log('   • 1TB modele 256GB Hepsiburada linki atanir mi?:', test1TBvs256 ? 'EVET (HATA)' : 'HAYIR, REDDEDILDI (BASARILI)');
console.log('   • 1TB modele 1TB Hepsiburada linki atanir mi?:', test1TBvs1TB ? 'EVET (BASARILI)' : 'HAYIR (HATA)');

const elapsed = Date.now() - t0;
console.log(`\n=== TUM YEREL TESTLER TAMAMLANDI (${elapsed}ms) ===`);