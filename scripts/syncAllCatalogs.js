/**
 * scripts/syncAllCatalogs.js
 * 
 * Aceleetme.tech Evrensel 9 Kategori Fiyat Senkronizasyonu & Koruma Motoru
 * 
 * Desteklenen Kategoriler:
 * 1. smartphones   (smartphonesData.json)
 * 2. tvs           (mockTVs.ts)
 * 3. laptops       (mockLaptops.ts)
 * 4. tablets       (mockTablets.ts)
 * 5. smartwatches  (mockSmartwatches.ts)
 * 6. headphones   (mockHeadphones.ts)
 * 7. appliances   (mockAppliances.ts)
 * 8. monitors      (mockMonitors.ts)
 * 9. consoles      (mockConsoles.ts)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Komut satırı parametreleri
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const isAll = args.includes('--all');
const shouldPush = args.includes('--push');
const categoryArg = args.find(a => a.startsWith('--category='));
const selectedCategory = categoryArg ? categoryArg.split('=')[1].toLowerCase().trim() : null;
const limitArg = args.find(a => a.startsWith('--limit='));
const maxLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : (isAll ? 99999 : 30);

const CATALOGS = [
  {
    name: 'smartphones',
    title: '📱 Akıllı Telefonlar',
    file: 'smartphonesData.json',
    type: 'json',
    exportVar: null,
    minPrice: 3000,
    accessoryBlacklist: ['kılıf', 'kilif', 'kapak', 'kırılmaz cam', 'kirilmaz cam', 'ekran koruyucu', 'şarj', 'sarj', 'kablo', 'adaptör', 'adaptor', 'lens koruyucu', 'stand', 'tutucu', 'yedek parça']
  },
  {
    name: 'tvs',
    title: '📺 Televizyonlar',
    file: 'mockTVs.ts',
    type: 'ts',
    exportVar: 'mockTVs',
    minPrice: 4000,
    accessoryBlacklist: ['askı aparatı', 'aski aparati', 'kumanda', 'hdmi', 'tv ayağı', 'ekran koruyucu', 'temizleme kiti', 'duvar askı', 'duvar aski', 'kablo', 'ayak']
  },
  {
    name: 'laptops',
    title: '💻 Laptop / Bilgisayarlar',
    file: 'mockLaptops.ts',
    type: 'ts',
    exportVar: 'mockLaptops',
    minPrice: 6000,
    accessoryBlacklist: ['çanta', 'canta', 'kılıf', 'kilif', 'stand', 'soğutucu', 'sogutucu', 'mouse', 'klavye koruyucu', 'adaptör', 'adaptor', 'şarj', 'sarj', 'yedek batarya', 'ram bellek', 'ssd']
  },
  {
    name: 'tablets',
    title: '📱 Tabletler',
    file: 'mockTablets.ts',
    type: 'ts',
    exportVar: 'mockTablets',
    minPrice: 2500,
    accessoryBlacklist: ['kılıf', 'kilif', 'kalem ucu', 'ekran koruyucu', 'klavye kılıf', 'şarj', 'sarj', 'kablo', 'adaptör']
  },
  {
    name: 'smartwatches',
    title: '⌚ Akıllı Saatler',
    file: 'mockSmartwatches.ts',
    type: 'ts',
    exportVar: 'mockSmartwatches',
    minPrice: 1000,
    accessoryBlacklist: ['kordon', 'kayış', 'kayis', 'ekran koruyucu', 'koruyucu cam', 'şarj aleti', 'sarj aleti', 'şarj kablosu', 'kılıf', 'kilif', 'toka']
  },
  {
    name: 'headphones',
    title: '🎧 Kulaklıklar',
    file: 'mockHeadphones.ts',
    type: 'ts',
    exportVar: 'mockHeadphones',
    minPrice: 500,
    accessoryBlacklist: ['kulaklık ucu', 'kulaklik ucu', 'kılıf', 'kilif', 'şarj kutusu', 'sarj kutusu', 'yedek ped', 'kablo', 'dönüştürücü', 'adaptör']
  },
  {
    name: 'appliances',
    title: '🏠 Beyaz Eşya & Küçük Ev Aletleri',
    file: 'mockAppliances.ts',
    type: 'ts',
    exportVar: 'mockAppliances',
    minPrice: 800,
    accessoryBlacklist: ['yedek parça', 'filtre', 'toz torbası', 'kablo', 'aparat', 'deterjan', 'hazne', 'fırça', 'firca', 'hortum', 'boru']
  },
  {
    name: 'monitors',
    title: '🖥️ Monitörler',
    file: 'mockMonitors.ts',
    type: 'ts',
    exportVar: 'mockMonitors',
    minPrice: 2000,
    accessoryBlacklist: ['askı aparatı', 'aski aparati', 'kablo', 'ayak', 'adaptör', 'adaptor', 'stand', 'kol', 'temizleyici']
  },
  {
    name: 'consoles',
    title: '🎮 Oyun Konsolları',
    file: 'mockConsoles.ts',
    type: 'ts',
    exportVar: 'mockConsoles',
    minPrice: 5000,
    accessoryBlacklist: ['kol', 'gamepad', 'kontrolcü', 'kontrolcu', 'stand', 'kapak', 'şarj istasyonu', 'sarj istasyonu', 'kablo', 'kılıf', 'çanta']
  }
];

const HEPSIBURADA_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'tr-TR,tr;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function parseTurkishPrice(raw) {
  if (!raw) return null;
  const normalized = raw.replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

// Modelin ve serinin kusursuz eşleştiğini doğrular
function validateProductMatch(productName, rawSlug) {
  const shortName = cleanSearchQuery(productName);
  const normName = shortName.toLowerCase().replace(/\+/g, ' plus ');
  const cleanNameTokens = normName.split(/[\s-]+/).filter(Boolean);
  const slugTokens = new Set(rawSlug.toLowerCase().split(/[\s-]+/).filter(Boolean));

  // 1. Alt Seri Çakışma Korumaları
  const isRedmiName = cleanNameTokens.includes('redmi');
  const isRedmiSlug = slugTokens.has('redmi');
  if (isRedmiName !== isRedmiSlug) return false;

  const isNoteName = cleanNameTokens.includes('note');
  const isNoteSlug = slugTokens.has('note');
  if (isNoteName !== isNoteSlug) return false;

  const isPocoName = cleanNameTokens.includes('poco');
  const isPocoSlug = slugTokens.has('poco');
  if (isPocoName !== isPocoSlug) return false;

  const isNordName = cleanNameTokens.includes('nord');
  const isNordSlug = slugTokens.has('nord');
  if (isNordName !== isNordSlug) return false;

  // 2. Model Seviyesi (Tier) Koruması
  const isUltraName = cleanNameTokens.includes('ultra');
  const isUltraSlug = slugTokens.has('ultra');
  if (isUltraName !== isUltraSlug) return false;

  const isProName = cleanNameTokens.includes('pro');
  const isProSlug = slugTokens.has('pro');
  if (isProName !== isProSlug) return false;

  const isPlusName = cleanNameTokens.includes('plus');
  const isPlusSlug = slugTokens.has('plus');
  if (isPlusName !== isPlusSlug) return false;

  const isMaxName = cleanNameTokens.includes('max');
  const isMaxSlug = slugTokens.has('max');
  if (isMaxName !== isMaxSlug) return false;

  const isLiteName = cleanNameTokens.includes('lite');
  const isLiteSlug = slugTokens.has('lite');
  if (isLiteName !== isLiteSlug) return false;

  // T-Serisi Ayrımı
  const isTName = cleanNameTokens.some(t => /^\d+t$/i.test(t));
  const isTSlug = [...slugTokens].some(t => /^\d+t$/i.test(t));
  if (isTName !== isTSlug) return false;

  // 3. Model Numarası Doğrulaması
  const stopWords = new Set([
    'apple', 'samsung', 'xiaomi', 'lg', 'philips', 'sony', 'lenovo', 'asus', 'hp', 'dell', 'acer', 'msi', 'huawei', 'oppo', 'vivo', 'honor',
    'smart', 'tv', 'led', 'qled', 'oled', '4k', 'ultra', 'hd', 'pro', 'plus', 'max', 'mini', 'laptop', 'tablet', 'monitör', 'monitor', 'gb', 'ram', 'inch', 'inç'
  ]);
  const coreTokens = cleanNameTokens.filter(w => w.length >= 2 && !stopWords.has(w));

  if (coreTokens.length > 0) {
    const slugWithoutHyphens = rawSlug.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const tok of coreTokens) {
      const cleanTok = tok.replace(/[^a-z0-9]/g, '');
      if (!slugWithoutHyphens.includes(cleanTok)) {
        return false;
      }
    }
  }

  return true;
}

// Uzun açıklayıcı ürün adlarından sadece Marka + Model Kodunu çıkarır (Aramanın nokta atışı tutması için)
function cleanSearchQuery(productName) {
  let clean = productName.replace(/\s*\([^)]*\)/g, '').replace(/["”]/g, '').trim();

  // Yaygın arama gürültüsü yaratan marka tekrarlarını sadeleştir
  clean = clean.replace(/^Sony\s+PlayStation\b/i, 'PlayStation');
  clean = clean.replace(/^Apple\s+iPhone\b/i, 'iPhone');
  clean = clean.replace(/^Xiaomi\s+Redmi\b/i, 'Redmi');
  clean = clean.replace(/^Xiaomi\s+Poco\b/i, 'Poco');

  const words = clean.split(/\s+/);
  const cutoffWords = new Set([
    'kablosuz', 'gurultu', 'gürültü', 'engelleme', 'ozellikli', 'özellikli', 'kulak', 'ustu', 'üstü', 'kulaklik', 'kulaklık',
    'ici', 'içi', 'mikrofonlu', 'oyuncu', 'gaming', 'akilli', 'akıllı', 'som', 'sari', 'sarı', 'altin', 'altın',
    'televizyon', 'smart', 'tv', 'qned', 'oled', 'qled', 'led', 'ekran', 'stereo', 'profesyonel', 'clearcast',
    'multi', 'connect', 'kemik', 'iletimli', 'uyumlu', 'universal', 'ev', 'sinema', 'sistemi', 'ses', 'bombası'
  ]);

  const resultWords = [];
  for (const w of words) {
    const lower = w.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, '');
    if (cutoffWords.has(lower) && resultWords.length >= 2) {
      break;
    }
    resultWords.push(w);
    if (resultWords.length >= 4) break;
  }

  return resultWords.join(' ').trim();
}

// Hepsiburada'da ürün arar
async function findHepsiburadaProduct(productName, blacklist) {
  const searchQuery = cleanSearchQuery(productName);
  const searchUrl = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(searchQuery)}`;
  
  const res = await fetch(searchUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) {
    throw new Error(`Arama HTTP Hatası: ${res.status}`);
  }
  const html = await res.text();

  const linkMatches = [...html.matchAll(/href="(https:\/\/www\.hepsiburada\.com\/([^\"]+)-p-([A-Za-z0-9]+)|\/([^\"]+)-p-([A-Za-z0-9]+))"/g)];
  if (!linkMatches || linkMatches.length === 0) {
    // console.log(`   [DEBUG] Link bulunamadı. HTML uzunluğu: ${html.length}`);
    return null;
  }

  for (const m of linkMatches) {
    let fullUrl = m[1];
    if (fullUrl.startsWith('/')) {
      fullUrl = 'https://www.hepsiburada.com' + fullUrl;
    }
    const rawSlug = m[2] || m[4] || '';
    const slugLower = rawSlug.toLowerCase();
    
    // Aksesuar kontrolü
    const isAccessory = blacklist.some(badWord => slugLower.includes(badWord));
    if (isAccessory) {
      // console.log(`      [Aksesuar elendi]: ${rawSlug.slice(0, 50)}`);
      continue;
    }

    // Model doğrulaması
    if (!validateProductMatch(productName, rawSlug)) {
      console.log(`      [Model uyuşmadı]: ${rawSlug.slice(0, 60)}`);
      continue;
    }

    return fullUrl;
  }

  return null;
}

// Ürün sayfasından fiyat çıkarır
async function extractPriceFromProductPage(productUrl, minPrice) {
  const res = await fetch(productUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) {
    throw new Error(`Ürün Sayfası HTTP Hatası: ${res.status}`);
  }
  const html = await res.text();

  // 1. JSON-LD
  const scriptMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const match of scriptMatches) {
    try {
      const data = JSON.parse(match[1]);
      const candidates = Array.isArray(data) ? data : [data];
      for (const item of candidates) {
        const offers = item?.offers;
        const price = offers?.price ?? offers?.[0]?.price;
        if (price) {
          const num = typeof price === 'number' ? price : parseFloat(String(price));
          if (!isNaN(num) && num >= minPrice) return num;
        }
      }
    } catch {
      continue;
    }
  }

  // 2. itemprop price
  const metaMatch = html.match(/itemprop=["']price["']\s+content=["']([\d.,]+)["']/);
  if (metaMatch) {
    const num = parseTurkishPrice(metaMatch[1]);
    if (num && num >= minPrice) return num;
  }

  // 3. Genel TL regex
  const genericMatches = html.matchAll(/([\d]{1,3}(?:\.[\d]{3})*,[\d]{2})\s*TL/g);
  for (const gm of genericMatches) {
    const num = parseTurkishPrice(gm[1]);
    if (num && num >= minPrice) return num;
  }

  return null;
}

// Veri setini diske kaydeder (JSON veya TS formatında)
function saveCatalogFile(catalog, products) {
  const filePath = path.join(__dirname, '..', 'src', 'lib', catalog.file);
  if (catalog.type === 'json') {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
  } else {
    const tsContent = `import { Product } from './types';\n\nexport const ${catalog.exportVar}: Product[] = ${JSON.stringify(products, null, 2)};\n`;
    fs.writeFileSync(filePath, tsContent, 'utf8');
  }
}

// Veri setini diskten okur
function loadCatalogFile(catalog) {
  const filePath = path.join(__dirname, '..', 'src', 'lib', catalog.file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dosya bulunamadı: ${filePath}`);
  }
  if (catalog.type === 'json') {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export\s+const\s+\w+\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (!match) throw new Error(`${catalog.file} içinden array bulunamadı`);
    return JSON.parse(match[1]);
  }
}

async function runCategorySync(catalog) {
  console.log('\n====================================================');
  console.log(`🚀 ${catalog.title.toUpperCase()} TARANIYOR`);
  console.log('====================================================');

  const allProducts = loadCatalogFile(catalog);
  
  let targetProducts = [];
  if (isAll) {
    targetProducts = allProducts;
  } else {
    targetProducts = allProducts
      .filter(p => p.isPopular || p.isFeatured || p.releaseYear === 2026)
      .sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      })
      .slice(0, maxLimit);
  }

  console.log(`📋 Toplam Ürün: ${allProducts.length}`);
  console.log(`🎯 Taranacak Ürün: ${targetProducts.length} ${isAll ? '(Tüm Liste)' : `(İlk ${targetProducts.length})`}\n`);

  let successCount = 0;
  let rejectedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  const todayLabel = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  for (let i = 0; i < targetProducts.length; i++) {
    const product = targetProducts[i];
    const prefix = `[${i + 1}/${targetProducts.length}] ${product.name}`;
    console.log(`🔍 ${prefix}`);
    console.log(`   Mevcut Fiyat: ${product.basePrice ? product.basePrice.toLocaleString('tr-TR') + ' TL' : 'Yok'}`);

    try {
      // 1. Link Bul
      const productUrl = await findHepsiburadaProduct(product.name, catalog.accessoryBlacklist);
      if (!productUrl) {
        console.log(`   ⚠️  Hepsiburada'da bulunamadı veya model uyuşmadı.`);
        notFoundCount++;
        await sleep(1500);
        continue;
      }

      console.log(`   🔗 Link: ${productUrl.slice(0, 70)}...`);

      // 2. Fiyat Çıkar
      const scrapedPrice = await extractPriceFromProductPage(productUrl, catalog.minPrice);
      if (scrapedPrice === null) {
        console.log(`   ⚠️  Fiyat sayfadan çıkarılamadı.`);
        errorCount++;
        await sleep(1500);
        continue;
      }

      console.log(`   💵 Çekilen Fiyat: ${scrapedPrice.toLocaleString('tr-TR')} TL`);

      // 3. Fiyat Uçurum & Taban Kontrolü
      if (product.basePrice && product.basePrice > catalog.minPrice && scrapedPrice < product.basePrice * 0.35) {
        console.log(`   🛡️ [GÜVENLİK ENGELİ]: Fiyat aşırı düşük (${scrapedPrice} TL). Aksesuar şüphesiyle reddedildi.`);
        rejectedCount++;
        await sleep(1500);
        continue;
      }

      if (product.basePrice && product.basePrice > 0) {
        const ratio = scrapedPrice / product.basePrice;
        if (ratio > 2.5) {
          console.log(`   🛡️ [GÜVENLİK ENGELİ]: Fiyat aşırı yüksek (%${Math.round(ratio * 100)}). Reddedildi.`);
          rejectedCount++;
          await sleep(1500);
          continue;
        }
      }

      // 4. storeOffers Güncelle
      product.storeOffers = product.storeOffers || [];
      const hbIdx = product.storeOffers.findIndex(s => s.name === 'Hepsiburada' || s.storeName === 'Hepsiburada' || s.key === 'hepsiburada');
      if (hbIdx >= 0) {
        product.storeOffers[hbIdx].price = scrapedPrice;
        product.storeOffers[hbIdx].url = productUrl;
        product.storeOffers[hbIdx].updatedAt = new Date().toISOString();
      } else {
        product.storeOffers.push({
          name: 'Hepsiburada',
          storeName: 'Hepsiburada',
          price: scrapedPrice,
          url: productUrl,
          inStock: true,
          updatedAt: new Date().toISOString()
        });
      }

      // 5. basePrice Güncelle
      const validPrices = product.storeOffers.map(s => s.price).filter(p => typeof p === 'number' && p > 0);
      if (validPrices.length > 0) {
        product.basePrice = Math.min(...validPrices);
      }

      // 6. priceHistory Güncelle
      product.priceHistory = product.priceHistory || [];
      const histIdx = product.priceHistory.findIndex(h => h.date === todayLabel);
      if (histIdx >= 0) {
        product.priceHistory[histIdx].price = product.basePrice;
      } else {
        product.priceHistory.push({ date: todayLabel, price: product.basePrice });
      }

      console.log(`   ✅ BAŞARILI: Hepsiburada fiyatı ${scrapedPrice.toLocaleString('tr-TR')} TL olarak güncellendi.`);
      successCount++;

      // Güvenli Kayıt: Her 5 üründe bir diske yaz
      if (!isDryRun && successCount % 5 === 0) {
        saveCatalogFile(catalog, allProducts);
        console.log(`   💾 [OTOMATİK KAYIT]: ${successCount} ürün ${catalog.file} dosyasına güvenle kaydedildi.`);
      }

      await sleep(1500);

    } catch (err) {
      console.log(`   ❌ Hata: ${err.message}`);
      errorCount++;
      await sleep(2000);
    }
  }

  console.log(`\n📊 [${catalog.title}] ÖZETİ:`);
  console.log(`   ✓ Güncellenen: ${successCount} | 🛡️ Engellenen: ${rejectedCount} | ⚠️ Bulunamayan: ${notFoundCount} | ❌ Hata: ${errorCount}`);

  if (!isDryRun && successCount > 0) {
    saveCatalogFile(catalog, allProducts);
    console.log(`💾 ${catalog.file} başarıyla kaydedildi!`);
  }

  return { successCount, rejectedCount, notFoundCount, errorCount };
}

async function main() {
  console.log('====================================================');
  console.log('🛡️  ACELEETME.TECH EVRENSEL FİYAT SENKRONİZASYONU  🛡️');
  console.log('====================================================');
  console.log(`Mod: ${isDryRun ? '🔍 DRY-RUN (Simülasyon)' : '💾 CANLI (Diske Kaydedilir)'}`);
  console.log(`Hedef Kategori: ${selectedCategory ? selectedCategory : 'TÜM KATALOGLAR (9 Kategori)'}`);
  console.log(`Limit: ${isAll ? 'Tüm Ürünler' : `Kategori başına max ${maxLimit}`}`);
  console.log('----------------------------------------------------');

  const targets = selectedCategory
    ? CATALOGS.filter(c => c.name === selectedCategory)
    : CATALOGS;

  if (targets.length === 0) {
    console.error(`❌ Geçersiz kategori: ${selectedCategory}`);
    console.log(`Geçerli kategoriler: ${CATALOGS.map(c => c.name).join(', ')}`);
    process.exit(1);
  }

  let totalUpdated = 0;

  for (const catalog of targets) {
    const res = await runCategorySync(catalog);
    totalUpdated += res.successCount;
    // Kategoriler arası 3 sn dinlenme
    await sleep(3000);
  }

  console.log('\n====================================================');
  console.log(`🏁 TÜM İŞLEMLER TAMAMLANDI! Toplam Güncellenen: ${totalUpdated}`);
  console.log('====================================================');

  if (shouldPush && !isDryRun && totalUpdated > 0) {
    console.log('\n🚀 Otomatik Push Modu Başlatılıyor...');
    try {
      console.log('1. Pre-deploy katalog bütünlük testi çalıştırılıyor...');
      execSync('node scripts/preDeployCheck.js', { stdio: 'inherit' });

      console.log('2. Git commit ve push yapılıyor...');
      execSync('git add src/lib/*', { stdio: 'inherit' });
      execSync('git commit -m "chore(prices): automated multi-catalog price sync across all categories"', { stdio: 'inherit' });
      execSync('git push origin main', { stdio: 'inherit' });
      console.log('\n🎉 Tüm güncellemeler başarıyla GitHub\'a push edildi ve Vercel otomatik yayına alıyor!');
    } catch (e) {
      console.error('\n❌ Git push sırasında hata:', e.message);
    }
  }
}

main().catch(err => {
  console.error('Kritik Hata:', err);
  process.exit(1);
});
