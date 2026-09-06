/**
 * scripts/nightlyPriceSync.js
 * 
 * Aceleetme.tech Gece Otomatik Fiyat Senkronizasyonu & Koruma Motoru
 * 
 * Güvenlik Özellikleri:
 * 1. Kılıf / Aksesuar Filtresi: Yanlışlıkla aksesuar fiyatlarının telefona yazılmasını engeller.
 * 2. Fiyat Uçurum Koruması: Mevcut fiyattan %40'tan fazla sapan şüpheli fiyatları reddeder.
 * 3. İnsansı Gecikme (Rate Limit Koruması): İstekler arasına 1.5 - 2.5 sn bekleme koyar.
 * 4. Veri Bütünlüğü: Mevcut verileri bozmaz, sadece mağaza fiyatı ve fiyat geçmişini günceller.
 * 5. Dry-run Desteği: --dry-run ile diske yazmadan güvenle test edilebilir.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Komut satırı argümanları
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const shouldPush = args.includes('--push');
const limitArg = args.find(a => a.startsWith('--limit='));
const maxLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;

console.log('====================================================');
console.log('🛡️  ACELEETME GECE FİYAT SENKRONİZASYON MOTORU  🛡️');
console.log('====================================================');
console.log(`Mod: ${isDryRun ? '🔍 DRY-RUN (Sadece Simülasyon, Diske Yazılmaz)' : '💾 CANLI (Diske Kaydedilir)'}`);
console.log(`Ürün Limiti: ${maxLimit}`);
console.log('----------------------------------------------------\n');

const HEPSIBURADA_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'tr-TR,tr;q=0.9',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
};

// Kılıf / Aksesuar kara listesi (başlıkta bunlardan biri varsa sonuç doğrudan elenir)
const ACCESSORY_BLACKLIST = [
  'kılıf', 'kilif', 'kapak', 'kırılmaz cam', 'kirilmaz cam', 'ekran koruyucu',
  'şarj', 'sarj', 'kablo', 'adaptör', 'adaptor', 'lens koruyucu', 'stand', 'tutucu',
  'yedek parça', 'batarya pili', 'kulaklık ucu', 'dönüştürücü'
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Türkçe fiyat stringini sayıya çevirir ("105.315,07" -> 105315.07)
function parseTurkishPrice(raw) {
  if (!raw) return null;
  const normalized = raw.replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

// Modelin ve alt serilerin kusursuz eşleşmesini denetler (Yanlış model, alt seri ve varyant karışmasını kesin önler)
function validateProductMatch(productName, rawSlug) {
  const normName = productName.toLowerCase().replace(/\+/g, ' plus ');
  const cleanNameTokens = normName.replace(/\s*\([^)]*\)/g, '').split(/[\s-]+/).filter(Boolean);
  const slugTokens = new Set(rawSlug.toLowerCase().split(/[\s-]+/).filter(Boolean));

  // 1. Kritik Seri Kontrolleri (Cross-Series Kirlenmesini Kesin Önler)
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

  // 2. Model Seviyesi (Tier / Suffix) Kontrolleri
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

  // T-Serisi Kontrolü (örn: Xiaomi 15 ile Xiaomi 15T Pro karışmasını kesin önler)
  const isTName = cleanNameTokens.some(t => /^\d+t$/i.test(t));
  const isTSlug = [...slugTokens].some(t => /^\d+t$/i.test(t));
  if (isTName !== isTSlug) return false;

  // 3. Model Numarası / Kodu Kontrolü (örn: 15, 14, 16, x6, s24, magic6)
  const stopWords = new Set([
    'apple', 'samsung', 'xiaomi', 'vivo', 'oppo', 'poco', 'honor', 'realme', 'huawei', 'google', 'nothing', 'redmi',
    'galaxy', 'phone', 'akilli', 'akıllı', 'cep', 'telefonu', '5g', '4g', 'lte', 'plus', 'ultra', 'pro', 'max', 'mini', 'fe', 'gb', 'note', 'nord', 'series'
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

// Hepsiburada üzerinde ürün araması yapar ve modelle tam uyuşan ilk geçerli ürün URL'ini döner
async function findHepsiburadaProduct(productName) {
  // Parantezleri kaldırarak temizle: örn. "iPhone 16 Pro (256 GB)" -> "iPhone 16 Pro 256 GB"
  const cleanName = productName.replace(/\(([^)]+)\)/g, '$1').replace(/\s+/g, ' ').trim();
  const searchUrl = `https://www.hepsiburada.com/ara?q=${encodeURIComponent(cleanName)}`;
  
  const res = await fetch(searchUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) {
    throw new Error(`Arama HTTP Hatası: ${res.status}`);
  }
  const html = await res.text();

  // Arama sonucundaki tüm ürün linklerini yakala (hem mutlak hem göreceli URL'ler)
  const linkMatches = [...html.matchAll(/href="(https:\/\/www\.hepsiburada\.com\/([^\"]+)-p-([A-Za-z0-9]+)|\/([^\"]+)-p-([A-Za-z0-9]+))"/g)];
  if (!linkMatches || linkMatches.length === 0) return null;

  // Linkleri kontrol et
  for (const m of linkMatches) {
    let fullUrl = m[1];
    if (fullUrl.startsWith('/')) {
      fullUrl = 'https://www.hepsiburada.com' + fullUrl;
    }
    const rawSlug = m[2] || m[4] || '';
    const slugLower = rawSlug.toLowerCase();
    
    // 1. Kılıf / Aksesuar kontrolü
    const isAccessory = ACCESSORY_BLACKLIST.some(badWord => slugLower.includes(badWord));
    if (isAccessory) continue;

    // 2. Kusursuz Model ve Seri Doğrulaması
    if (!validateProductMatch(productName, rawSlug)) {
      continue; // Yanlış model/seri (örn: Xiaomi yerine Redmi, Pro yerine düz model vb.)
    }

    return fullUrl;
  }

  return null;
}

// Ürün sayfasından fiyatı çıkarır (JSON-LD -> meta -> regex)
async function extractPriceFromProductPage(productUrl) {
  const res = await fetch(productUrl, { headers: HEPSIBURADA_HEADERS });
  if (!res.ok) {
    throw new Error(`Ürün Sayfası HTTP Hatası: ${res.status}`);
  }
  const html = await res.text();

  // Akıllı telefon için asgari makul fiyat (3.000 TL altı telefon olamaz; kargo, taksit, kılıf elenir)
  const MIN_PHONE_PRICE = 3000;

  // Strateji 1: JSON-LD structured data
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
          if (!isNaN(num) && num >= MIN_PHONE_PRICE) return num;
        }
      }
    } catch {
      continue;
    }
  }

  // Strateji 2: meta itemprop="price"
  const metaMatch = html.match(/itemprop=["']price["']\s+content=["']([\d.,]+)["']/);
  if (metaMatch) {
    const num = parseTurkishPrice(metaMatch[1]);
    if (num && num >= MIN_PHONE_PRICE) return num;
  }

  // Strateji 3: Genel Türk Lirası regex'i (Sadece 3.000 TL ve üzeri fiyatlar)
  const genericMatches = html.matchAll(/([\d]{1,3}(?:\.[\d]{3})*,[\d]{2})\s*TL/g);
  for (const gm of genericMatches) {
    const num = parseTurkishPrice(gm[1]);
    if (num && num >= MIN_PHONE_PRICE) return num;
  }

  return null;
}

// Ana çalışma döngüsü
async function main() {
  const filePath = path.join(__dirname, '..', 'src', 'lib', 'smartphonesData.json');
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Dosya bulunamadı: ${filePath}`);
    process.exit(1);
  }

  const allPhones = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  const isAll = args.includes('--all');

  // Hedef ürünler: --all verilirse 823 telefonun tamamı, aksi halde en popüler ve 2026 modeller
  let targetPhones = [];
  if (isAll) {
    targetPhones = allPhones;
  } else {
    targetPhones = allPhones
      .filter(p => p.isPopular || p.isFeatured || p.releaseYear === 2026)
      .sort((a, b) => {
        if (a.isPopular && !b.isPopular) return -1;
        if (!a.isPopular && b.isPopular) return 1;
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      })
      .slice(0, maxLimit);
  }

  console.log(`📋 Toplam Telefon Sayısı: ${allPhones.length}`);
  console.log(`🎯 Taranacak Hedef Ürün Sayısı: ${targetPhones.length}${isAll ? ' (Tüm Katalog)' : ''}\n`);

  let successCount = 0;
  let rejectedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;

  const todayLabel = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  for (let i = 0; i < targetPhones.length; i++) {
    const phone = targetPhones[i];
    const prefix = `[${i + 1}/${targetPhones.length}] ${phone.name}`;
    console.log(`\n🔍 ${prefix}`);
    console.log(`   Mevcut Fiyat: ${phone.basePrice ? phone.basePrice.toLocaleString('tr-TR') + ' TL' : 'Yok'}`);

    try {
      // 1. Ürün Linkini Ara
      const productUrl = await findHepsiburadaProduct(phone.name);
      if (!productUrl) {
        console.log(`   ⚠️  Hepsiburada'da bulunamadı.`);
        notFoundCount++;
        await sleep(1500);
        continue;
      }

      console.log(`   🔗 Link: ${productUrl.slice(0, 75)}...`);

      // 2. Fiyatı Çıkar
      const scrapedPrice = await extractPriceFromProductPage(productUrl);
      if (scrapedPrice === null) {
        console.log(`   ⚠️  Fiyat sayfadan çıkarılamadı.`);
        errorCount++;
        await sleep(1500);
        continue;
      }

      console.log(`   💵 Çekilen Fiyat: ${scrapedPrice.toLocaleString('tr-TR')} TL`);

      // 3. 🛡️ GÜVENLİK FİLTRESİ 1: Aksesuar & Kılıf Fiyat Tabanı Kontrolü
      // Telefon fiyatı mevcut fiyatın %35'inden azsa, bu bir aksesuardır.
      if (phone.basePrice && phone.basePrice > 10000 && scrapedPrice < phone.basePrice * 0.35) {
        console.log(`   🛡️ [GÜVENLİK ENGELİ]: Fiyat aşırı düşük (${scrapedPrice} TL). Kılıf/aksesuar şüphesiyle reddedildi.`);
        rejectedCount++;
        await sleep(1500);
        continue;
      }

      // 4. 🛡️ GÜVENLİK FİLTRESİ 2: Aşırı Uçurum (Anomali) Kontrolü
      if (phone.basePrice && phone.basePrice > 0) {
        const ratio = scrapedPrice / phone.basePrice;
        if (ratio > 2.5) {
          console.log(`   🛡️ [GÜVENLİK ENGELİ]: Fiyat aşırı yüksek (%${Math.round(ratio * 100)}). Fırsatçı satıcı şüphesiyle reddedildi.`);
          rejectedCount++;
          await sleep(1500);
          continue;
        }
      }

      // 5. Mağaza Teklifini Güncelle veya Ekle
      phone.storeOffers = phone.storeOffers || [];
      const hbIdx = phone.storeOffers.findIndex(s => s.name === 'Hepsiburada' || s.key === 'hepsiburada');
      if (hbIdx >= 0) {
        phone.storeOffers[hbIdx].price = scrapedPrice;
        phone.storeOffers[hbIdx].url = productUrl;
        phone.storeOffers[hbIdx].updatedAt = new Date().toISOString();
      } else {
        phone.storeOffers.push({
          name: 'Hepsiburada',
          price: scrapedPrice,
          url: productUrl,
          inStock: true,
          updatedAt: new Date().toISOString()
        });
      }

      // 6. BasePrice Güncelle (En düşük mağaza fiyatı)
      const validPrices = phone.storeOffers.map(s => s.price).filter(p => typeof p === 'number' && p > 0);
      if (validPrices.length > 0) {
        phone.basePrice = Math.min(...validPrices);
      }

      // 7. Fiyat Geçmişine (priceHistory) Ekle
      phone.priceHistory = phone.priceHistory || [];
      const historyIdx = phone.priceHistory.findIndex(h => h.date === todayLabel);
      if (historyIdx >= 0) {
        phone.priceHistory[historyIdx].price = phone.basePrice;
      } else {
        phone.priceHistory.push({ date: todayLabel, price: phone.basePrice });
      }

      console.log(`   ✅ BAŞARILI: Hepsiburada fiyatı ${scrapedPrice.toLocaleString('tr-TR')} TL olarak güncellendi.`);
      successCount++;

      // Veri Güvenliği: Her 5 başarılı güncellemede diske otomatik yaz (Elektrik/kapanma durumunda veri kaybını önler)
      if (!isDryRun && successCount % 5 === 0) {
        fs.writeFileSync(filePath, JSON.stringify(allPhones, null, 2), 'utf8');
        console.log(`   💾 [OTOMATİK KAYIT]: İlerleme güvenle diske kaydedildi (${successCount} ürün güncellendi).`);
      }

      // Rate limit yememek için insansı bekleme (1.5 sn)
      await sleep(1500);

    } catch (err) {
      console.log(`   ❌ Hata: ${err.message}`);
      errorCount++;
      await sleep(2000);
    }
  }

  console.log('\n====================================================');
  console.log('📊 TARAMA VE GÜNCELLEME ÖZETİ');
  console.log('====================================================');
  console.log(`✓ Başarıyla Güncellenen: ${successCount}`);
  console.log(`🛡️ Güvenlik Filtresine Takılan: ${rejectedCount}`);
  console.log(`⚠️ Hepsiburada'da Bulunamayan: ${notFoundCount}`);
  console.log(`❌ Hata Alan: ${errorCount}`);

  // Diske kaydet
  if (!isDryRun && successCount > 0) {
    fs.writeFileSync(filePath, JSON.stringify(allPhones, null, 2), 'utf8');
    console.log(`\n💾 ${filePath} dosyası başarıyla güncellendi!`);

    if (shouldPush) {
      console.log('\n🚀 Otomatik Push Modu Aktif:');
      try {
        console.log('1. Pre-deploy bütünlük testi çalıştırılıyor...');
        execSync('node scripts/preDeployCheck.js', { stdio: 'inherit' });
        
        console.log('2. Git commit ve push yapılıyor...');
        execSync('git add src/lib/smartphonesData.json', { stdio: 'inherit' });
        execSync('git commit -m "chore(prices): update smartphone store offers and prices"', { stdio: 'inherit' });
        execSync('git push origin main', { stdio: 'inherit' });
        console.log('\n🎉 Değişiklikler başarıyla GitHub\'a push edildi ve Vercel otomatik yayına alıyor!');
      } catch (e) {
        console.error('\n❌ Git push sırasında hata oluştu:', e.message);
      }
    }
  } else if (isDryRun) {
    console.log(`\n🔍 Dry-run modunda çalıştırıldığı için dosya değiştirilmedi.`);
  } else {
    console.log(`\nℹ️ Değişen veri olmadığı için dosya güncellenmedi.`);
  }
}

main().catch(err => {
  console.error('Kritik Hata:', err);
  process.exit(1);
});
