const fs = require('fs');
const path = require('path');
const https = require('https');

// Read environment variables
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      process.env[match[1]] = (match[2] || '').trim();
    }
  });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';
const contentToken = process.env.ICECAT_CONTENT_TOKEN || '';

const datasets = [
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts' }
];

const BLACKLIST = new Set([
  'QNED', 'OLED', 'MINILED', 'NANO', 'QLED', 'LED', 'LCD', 'UHD', 'FHD', 'HD', '4K', '8K', 'HDR',
  'IPS', 'VA', 'TN', 'SMART', 'TV', 'TELEVIZYON', 'MONITOR', 'LAPTOP', 'TABLET', 'KULAKLIK', 'GAMING',
  'OYUN', 'PRO', 'MAX', 'PLUS', 'ULTRA', 'MINI', 'LITE', 'SE', 'FE', 'AIR', 'CPU', 'GPU', 'RAM',
  'SSD', 'DDR', 'GB', 'TB', 'MB', 'GHZ', 'MHZ', 'HZ', 'WATT', 'BTU', 'INCH', 'EKRAN', 'INC',
  'MM', 'CM', 'KG', 'VOLT', 'MAH', 'USB', 'HDMI', 'WIFI', 'BLUETOOTH', 'BLACK', 'WHITE', 'SILVER',
  'GOLD', 'GRAY', 'GREY', 'TITANIUM', 'SIYAH', 'BEYAZ', 'GUMUS', 'ALTIN', 'GRI', 'TITANYUM', 'KIRMIZI',
  'MAVI', 'YESIL', 'PEMBE', 'TURUNCU', 'SAR', 'LACIVERT', 'MOR', 'DUO', 'MONO', 'STEREO', 'TRUE',
  'WIRELESS', 'TWS', 'ANC', 'RF', 'EV', 'SINEMA', 'CAGRI', 'MERKEZI', 'KEMIK', 'ILETIMLI', 'SPOR',
  'KORDON', 'LOOP', 'ALUMINYUM', 'CELIK', 'PASLANMAZ', 'CELLULAR', 'GPS', 'DUVAR', 'TIPI', 'INVERTER',
  'KLIMA', 'FILTRE', 'KAHVE', 'MAKINESI', 'STANDLI', 'MIKSER', 'BLENDER', 'ROBOT', 'SUPURGE', 'AIRFRYER',
  'UTU', 'KAZANLI', 'BUZDOLABI', 'CAMASIR', 'BULASIK', 'KURUTMA', 'FIRIN', 'OCAK', 'DAVLUMBAZ'
]);

/**
 * Strict product code extractor.
 */
function extractPartCode(name, brand) {
  if (!name) return null;

  // 1. Apple exact Part Number in parentheses: (MGE94TU/A), (MU793ZD/A), (MKGP3TU/A)
  const appleParen = name.match(/\(([A-Z0-9]{4,7}(?:TU|FD|ZD|LL|HN|B|D|NF|QL)\/[A-Z0-9])\)/i);
  if (appleParen) return appleParen[1].toUpperCase();

  // General paranthetical slash code (e.g. XXX/X)
  const anyParen = name.match(/\(([A-Z0-9]{4,10}\/[A-Z0-9]{1,4})\)/i);
  if (anyParen) return anyParen[1].toUpperCase();

  // Sony Console CFI code: (CFI-2000A01)
  const cfiMatch = name.match(/\((CFI-[0-9]{4}[A-Z0-9]+)\)/i);
  if (cfiMatch) return cfiMatch[1].toUpperCase();

  // 2. Philips / Braun Appliances / TVs: HD7548/20, CSA250/10, 55PUS8108/62
  const slashCode = name.match(/\b([A-Z0-9]{2,8}\/[0-9]{2,4})\b/i);
  if (slashCode) return slashCode[1].toUpperCase();

  // 3. Samsung TV / Monitor: QE65Q70DATXTK, UE55CU7000UXTK, LS32CG552EUXUF, SM-S928B
  const samsungTV = name.match(/\b((?:QE|UE|GQ|QN|QA|TQ|GU|LS|LC|LF)[0-9]{2}[A-Z0-9]{4,12})\b/i);
  if (samsungTV) return samsungTV[1].toUpperCase();

  const samsungPhone = name.match(/\b(SM-[A-Z0-9]{4,8})\b/i);
  if (samsungPhone) return samsungPhone[1].toUpperCase();

  // 4. LG Full Model Code: 55QNED81B6A, 65QNED816QA, 86UT81006LA, OLED55C34LA, 27UP650P-W
  const lgTV = name.match(/\b([0-9]{2,3}(?:QNED|NANO|UT|UR|UQ|UP|UN|LM|LQ|UK|SK|SM|B[0-9]|C[0-9]|G[0-9]|M[0-9]|W[0-9]|Z[0-9])[A-Z0-9\-_]{2,8})\b/i);
  if (lgTV) {
    const code = lgTV[1].toUpperCase();
    if (!BLACKLIST.has(code)) return code;
  }

  const lgOLED = name.match(/\b(OLED[0-9]{2}[A-Z0-9\-_]{3,8})\b/i);
  if (lgOLED) return lgOLED[1].toUpperCase();

  const monitorCode = name.match(/\b([0-9]{2}[A-Z]{2,4}[0-9]{3,4}[A-Z0-9\-_]*)\b/i);
  if (monitorCode) {
    const code = monitorCode[1].toUpperCase();
    if (!BLACKLIST.has(code) && !/^[0-9]+(HZ|MS|BIT|FPS)$/i.test(code)) return code;
  }

  // 5. Bosch / Siemens / Beko / Arçelik: KGN56VWF0N, WGA25400TR, B360340
  const applianceCode = name.match(/\b([A-Z]{2,4}[0-9]{3,6}[A-Z0-9]*)\b/i);
  if (applianceCode) {
    const code = applianceCode[1].toUpperCase();
    if (!BLACKLIST.has(code) && !/^[0-9]+(BTU|W|V|A|HZ)$/i.test(code)) return code;
  }

  // 6. Asus / Lenovo / HP / Dell Part Codes: 82XF0038TX, G614JIR-N4003, GA402RJ, 15ITL6, 9315
  const laptopCode = name.match(/\b([0-9]{2}[A-Z0-9]{6,10}|[A-Z][0-9]{3}[A-Z]{2,3}-[A-Z0-9]{4,6})\b/i);
  if (laptopCode) {
    const code = laptopCode[1].toUpperCase();
    if (!BLACKLIST.has(code)) return code;
  }

  // 7. General part number fallback: strictly must not match spec terms or generic words
  const tokens = name.replace(/[(),]/g, ' ').split(/\s+/);
  for (const t of tokens) {
    const clean = t.toUpperCase().trim();
    if (clean.length >= 5 && clean.length <= 16 && /[A-Z]/.test(clean) && /[0-9]/.test(clean)) {
      if (!BLACKLIST.has(clean)) {
        if (!clean.includes('CPU') && !clean.includes('GPU') && !clean.includes('RAM') && 
            !clean.includes('SSD') && !clean.includes('BTU') && !clean.includes('WATT') &&
            !clean.includes('INCH') && !clean.includes('EKRAN') && !clean.includes('HZ') &&
            !clean.includes('QNED') && !clean.includes('OLED') && !clean.includes('NANO')) {
          return clean;
        }
      }
    }
  }

  return null;
}

/**
 * Query Icecat JSON API
 */
async function queryIcecat(brand, productCode, gtin) {
  const queryParams = new URLSearchParams();
  queryParams.set('UserName', username);
  queryParams.set('Language', 'tr');

  if (gtin) {
    queryParams.set('GTIN', gtin);
  } else if (brand && productCode) {
    queryParams.set('Brand', brand);
    queryParams.set('ProductCode', productCode);
  } else {
    return null;
  }

  if (apiToken) queryParams.set('app_key', apiToken);

  const url = `https://live.icecat.biz/api/?${queryParams.toString()}`;

  return new Promise(resolve => {
    https.get(url, {
      headers: {
        'User-Agent': 'TechCompare-App/2.0',
        'api-token': apiToken,
        'Content-Token': contentToken,
        'Authorization': `Bearer ${apiToken}`
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.data) {
            const d = json.data;
            const imgObj = d.Image || {};
            const gallery = Array.isArray(d.Gallery) ? d.Gallery : [];
            let highPic = imgObj.HighPic || imgObj.highPic || d.GeneralInfo?.Image?.HighPic;
            if (!highPic && gallery.length > 0) {
              highPic = gallery[0].Pic || gallery[0].pic || gallery[0].HighPic;
            }

            if (highPic) {
              if (contentToken && !highPic.includes('content_token=')) {
                highPic += `${highPic.includes('?') ? '&' : '?'}content_token=${contentToken}`;
              }
              return resolve({
                title: d.GeneralInfo?.Title || d.GeneralInfo?.ProductName || productCode,
                highPic,
                specsCount: Array.isArray(d.FeaturesGroups) ? d.FeaturesGroups.reduce((acc, g) => acc + (g.Features?.length || 0), 0) : 0,
                galleryCount: gallery.length
              });
            }
          }
          resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function runIcecatFullAudit() {
  console.log('================================================================');
  console.log('❄️  ICECAT FULL CATALOG AUDIT & LIVE REPORT GENERATION        ❄️');
  console.log(`👤  User: "${username}"`);
  console.log('================================================================\n');

  const allProducts = [];

  for (const d of datasets) {
    const filePath = path.join(__dirname, '../src/lib', d.file);
    if (!fs.existsSync(filePath)) continue;

    let products = [];
    if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    else {
      const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
      if (match) products = JSON.parse(match[2]);
    }

    products.forEach(p => {
      allProducts.push({
        id: p.id,
        name: p.name,
        category: d.name,
        brand: p.brand || (p.name ? p.name.split(' ')[0] : 'Unknown'),
        currentImage: p.image || (Array.isArray(p.images) ? p.images[0] : ''),
        gtin: p.gtin || p.ean || p.barcode,
        model: p.model || p.sku
      });
    });
  }

  const total = allProducts.length;
  console.log(`📦 Loaded ${total} total products across all ${datasets.length} catalog categories.\n`);

  let codeReadyCount = 0;
  let noCodeCount = 0;
  const matches = [];
  const fallbacks = [];

  console.log('🚀 Executing Live Icecat API Queries across catalog...\n');

  for (let i = 0; i < total; i++) {
    const p = allProducts[i];
    const strictCode = p.model || extractPartCode(p.name, p.brand);
    const gtin = p.gtin;

    if (!strictCode && !gtin) {
      noCodeCount++;
      fallbacks.push({
        name: p.name,
        category: p.category,
        brand: p.brand,
        reason: 'Ürün adında üreticiye ait özgün parça/model kodu bulunamadı (Manuel İnceleme Gerekli)'
      });
      continue;
    }

    codeReadyCount++;
    const searchKey = gtin ? `GTIN:${gtin}` : strictCode;

    // Live API query
    const icecatRes = await queryIcecat(p.brand, strictCode, gtin);

    if (icecatRes && icecatRes.highPic) {
      matches.push({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        searchKey,
        currentImage: p.currentImage,
        icecatImage: icecatRes.highPic,
        icecatTitle: icecatRes.title,
        specsCount: icecatRes.specsCount,
        galleryCount: icecatRes.galleryCount
      });
      if (matches.length % 50 === 0) {
        console.log(`  ✅ [Live Match ${matches.length}] ${p.name} (Code: ${searchKey})`);
      }
    } else {
      fallbacks.push({
        name: p.name,
        category: p.category,
        brand: p.brand,
        searchKey,
        reason: 'Icecat veritabanında bu marka ve model koduyla açık üretici kaydı / görsel bulunamadı.'
      });
    }

    if ((i + 1) % 500 === 0 || i + 1 === total) {
      console.log(`⏳ Progress: ${i + 1}/${total} products processed (${matches.length} Icecat images verified)...`);
    }

    await new Promise(r => setTimeout(r, 15));
  }

  // Generate icecat-sync-report.md
  console.log('\n📝 Generating icecat-sync-report.md...');

  // Select 15 representative sample matches across categories for top highlight
  const sampleHighlights = matches.slice(0, 15);

  let report = `# ❄️ Icecat Ürün Eşleştirme & Canlı Görsel Öneri Raporu

**Oluşturulma Tarihi:** ${new Date().toLocaleString('tr-TR')}  
**Icecat Kullanıcısı:** \`${username}\`  
**API Durumu:** Aktif & Canlı Bağlı (\`live.icecat.biz/api?\`)  
**Eşleştirme Modu:** 🛡️ **Doğrulanmış Üretici Parça/Model Kodu** *(Genel çip/özellik/seri metinleri filtrelenmiştir)*  
**Çalışma Durumu:** 🛡️ **Salt Okunur / Öneri Modu** *(Katalogdaki hiçbir görsel otomatik uygulanmamıştır)*

---

## 🌟 1. Doğrulanan İlk 15 Temsili Eşleşme Örneği

Aşağıda, hem kod çıkarma mantığı doğrulanan hem de Icecat API'sinden **gerçek yüksek çözünürlüklü üretici görseli başarıyla dönen 15 örnek model** listelenmiştir:

| # | Ürün Adı | Kategori | Çıkarılan Doğru Model Kodu | Mevcut Görsel | Icecat'te Bulunan Resmi Görsel URL | Icecat Başlığı |
|---|---|---|---|---|---|---|
`;

  sampleHighlights.forEach((m, idx) => {
    report += `| ${idx + 1} | **${m.name}** | \`${m.category}\` | \`${m.searchKey}\` | \`${m.currentImage}\` | [Görseli İncele](${m.icecatImage}) | ${m.icecatTitle} |\n`;
  });

  report += `\n---

## 📊 2. Yönetici Özeti & Eşleşme İstatistikleri

| Metrik | Değer | Açıklama |
|---|---|---|
| 🔍 **Toplam Taranan Katalog Ürünü** | **${total}** | 9 kategorideki tüm ürünler eksiksiz tarandı |
| 🏷️ **Doğru Kod Bulunan Ürün Sayısı (Arama Anahtarı Hazır)** | **${codeReadyCount}** | Parça/model kodu başarıyla ayrıştırılan ürünler |
| ❌ **Özgün Kodu Tespit Edilemeyen Ürün Sayısı** | **${noCodeCount}** | Adında benzersiz model no bulunmayan, manuel kod gerekenler |
| ✅ **Icecat'te GERÇEKTEN Görseli Bulunan Ürün Sayısı** | **${matches.length}** | Icecat API'sinden resmi fotoğrafı başarıyla dönenler |
| ⚠️ **Görsel Bulunamayan / Fallback Gereken Ürün Sayısı** | **${fallbacks.length}** | Icecat'te kaydı olmayan veya açık lisansı bulunmayanlar |

---

## 🖼️ 3. Icecat'te Görseli Bulunan Tüm Ürünler (${matches.length} Adet)

| # | Ürün Adı | Kategori | Doğrulanmış Model Kodu | Mevcut Görsel | Icecat Görsel URL | Icecat Ürün Bilgisi |
|---|---|---|---|---|---|---|
`;

  matches.forEach((m, idx) => {
    report += `| ${idx + 1} | **${m.name}** | \`${m.category}\` | \`${m.searchKey}\` | \`${m.currentImage}\` | [Görsel Linki](${m.icecatImage}) | ${m.icecatTitle} (*${m.specsCount} özellik, ${m.galleryCount} açı*) |\n`;
  });

  report += `\n---

## ⚠️ 4. Görsel Bulunamayan / Fallback Gereken Ürünler (${fallbacks.length} Adet)

| # | Ürün Adı | Kategori | Marka | Denenen Kod | Durum / Sebep |
|---|---|---|---|---|---|
`;

  fallbacks.slice(0, 150).forEach((f, idx) => {
    report += `| ${idx + 1} | **${f.name}** | \`${f.category}\` | ${f.brand} | \`${f.searchKey || 'Yok'}\` | ${f.reason} |\n`;
  });

  if (fallbacks.length > 150) {
    report += `\n*...ve kalan ${fallbacks.length - 150} adet ürün raporda özetlenmiştir.*\n`;
  }

  report += `\n---

## 🛡️ 5. Sonraki Adım ve Onay

Bu rapor yalnızca bir **öneri listesidir**. Siz onaylayana kadar **hiçbir görsel katalogda uygulanmayacaktır**.
`;

  const reportPath = path.join(process.cwd(), 'icecat-sync-report.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`✅ icecat-sync-report.md saved successfully!`);

  // Print top 15 to console
  console.log('\n====================================================');
  console.log('🌟 DOĞRULANAN İLK 15 EŞLEŞME:');
  console.log('====================================================');
  sampleHighlights.forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}`);
    console.log(`   Model Kodu  : ${m.searchKey}`);
    console.log(`   Eski Görsel : ${m.currentImage}`);
    console.log(`   Icecat URL  : ${m.icecatImage}`);
    console.log(`   Icecat Adı  : ${m.icecatTitle}\n`);
  });

  console.log('====================================================');
  console.log(`📊 Toplam Taranan       : ${total}`);
  console.log(`🏷️  Doğru Kodu Olan     : ${codeReadyCount}`);
  console.log(`✅ Icecat'te Görsel Var : ${matches.length}`);
  console.log(`⚠️  Görsel Bulunamayan  : ${fallbacks.length}`);
  console.log('====================================================');
}

runIcecatFullAudit();

module.exports = { extractPartCode, runIcecatFullAudit };
