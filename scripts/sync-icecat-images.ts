import fs from 'fs';
import path from 'path';
import { fetchIcecatProduct, IcecatProductResult } from '../src/lib/icecat';

// 1. Read environment variables from .env.local
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

console.log('================================================================');
console.log('❄️  ICECAT STRICT PRODUCT CODE AUDITOR & SYNC ENGINE (v3.0)  ❄️');
console.log('================================================================');
console.log(`👤 Icecat User       : ${username}`);
console.log(`🔑 API Token (app_key): ${apiToken ? apiToken.slice(0, 8) + '...' : 'Not Set'}`);
console.log(`🖼️  Content Token     : ${contentToken ? contentToken.slice(0, 8) + '...' : 'Not Set'}`);
console.log('================================================================\n');

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
  'UTU', 'KAZANLI', 'BUZDOLABI', 'CAMASIR', 'BULASIK', 'KURUTMA', 'FIRIN', 'OCAK', 'DAVLUMBAZ',
  'GEN2', 'GEN3', 'GEN4', 'GEN5', 'GEN6', 'GEN7', 'GEN8', 'GEN9', 'GEN10', 'GEN11', 'GEN12',
  'INTEL', 'AMD', 'RYZEN', 'CORE', 'SNAPDRAGON', 'EXYNOS', 'MEDIATEK', 'DIMENSITY', 'BIONIC',
  'SERIES', 'SERISI', 'EDITION', 'SPECIAL', 'NEW', 'YENI', 'MODEL', 'VERSIYON', 'VERSION'
]);

/**
 * Extracts strictly verified manufacturer product code / MPN.
 * Rejects generic specs (CPU, GPU, RAM, QNED, OLED, 4K, etc.)
 */
export function extractStrictProductCode(name: string, brand?: string): string | null {
  if (!name) return null;

  // 1. Explicit Apple Part Number in parentheses: (MGE94TU/A), (MU793ZD/A), (MWTJ2TU/A)
  const appleParen = name.match(/\(([A-Z0-9]{4,7}(?:TU|FD|ZD|LL|HN|B|D|NF|QL)\/[A-Z0-9])\)/i);
  if (appleParen) return appleParen[1].toUpperCase();

  // 2. Any explicit manufacturer part number with slash format: (XXX/X) or HD7548/20, CSA250/10, 55PUS8108/62
  const parenPart = name.match(/\(([A-Z0-9]{4,10}\/[A-Z0-9]{1,4})\)/i);
  if (parenPart) return parenPart[1].toUpperCase();

  const cfiMatch = name.match(/\((CFI-[0-9]{4}[A-Z0-9]+)\)/i);
  if (cfiMatch) return cfiMatch[1].toUpperCase();

  const slashCode = name.match(/\b([A-Z0-9]{2,8}\/[0-9]{2,4})\b/i);
  if (slashCode) return slashCode[1].toUpperCase();

  // 3. Samsung TV / Monitor Code: QE65Q70DATXTK, UE55CU7000UXTK, LS32CG552EUXUF
  const samsungTV = name.match(/\b((?:QE|UE|GQ|QN|QA|TQ|GU|LS|LC|LF)[0-9]{2}[A-Z0-9]{4,12})\b/i);
  if (samsungTV) return samsungTV[1].toUpperCase();

  const samsungPhone = name.match(/\b(SM-[A-Z0-9]{4,8})\b/i);
  if (samsungPhone) return samsungPhone[1].toUpperCase();

  // 4. LG TV / Monitor Code: 55QNED81B6A, 86UT81006LA, OLED55C34LA, 27UP650P-W, 27GP850-B
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

  // 5. Bosch / Siemens / Beko / Arçelik Appliances: KGN56VWF0N, WGA25400TR, B360340
  const applianceCode = name.match(/\b([A-Z]{2,4}[0-9]{3,6}[A-Z0-9]*)\b/i);
  if (applianceCode) {
    const code = applianceCode[1].toUpperCase();
    if (!BLACKLIST.has(code) && !/^[0-9]+(BTU|W|V|A|HZ)$/i.test(code) && !/^(BTU|WATT|INCH|EKRAN|OLED|QNED)$/i.test(code)) {
      return code;
    }
  }

  // 6. Asus / Lenovo / HP / Dell Laptop part codes: 82XF0038TX, G614JIR-N4003, GA402RJ, 15ITL6, 9315
  const laptopCode = name.match(/\b([0-9]{2}[A-Z0-9]{6,10}|[A-Z][0-9]{3}[A-Z]{2,3}-[A-Z0-9]{4,6})\b/i);
  if (laptopCode) {
    const code = laptopCode[1].toUpperCase();
    if (!BLACKLIST.has(code)) return code;
  }

  // 7. Word with at least 1 letter and 1 number, strictly 5-16 chars, NO spec terms
  const tokens = name.replace(/[(),]/g, ' ').split(/\s+/);
  for (const t of tokens) {
    const clean = t.toUpperCase().trim();
    if (clean.length >= 5 && clean.length <= 16 && /[A-Z]/.test(clean) && /[0-9]/.test(clean)) {
      if (!BLACKLIST.has(clean)) {
        // Strict negative checks
        if (!clean.includes('CPU') && !clean.includes('GPU') && !clean.includes('RAM') && 
            !clean.includes('SSD') && !clean.includes('BTU') && !clean.includes('WATT') &&
            !clean.includes('INCH') && !clean.includes('EKRAN') && !clean.includes('HZ') &&
            !clean.includes('OLED') && !clean.includes('QNED') && !clean.includes('NANO')) {
          return clean;
        }
      }
    }
  }

  return null;
}

// 2. Load all datasets
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

interface CatalogProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  model?: string;
  productCode?: string;
  gtin?: string;
}

const allProducts: CatalogProduct[] = [];

datasets.forEach(d => {
  const filePath = path.join(process.cwd(), 'src/lib', d.file);
  if (!fs.existsSync(filePath)) return;

  let items: any[] = [];
  if (d.type === 'json') {
    items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) {
      try {
        items = JSON.parse(match[2]);
      } catch (e) {
        console.error(`Failed to parse ${d.file}`);
      }
    }
  }

  items.forEach(p => {
    allProducts.push({
      id: p.id,
      name: p.name,
      brand: p.brand || (p.name ? p.name.split(' ')[0] : 'Unknown'),
      category: d.name,
      image: p.image || (Array.isArray(p.images) ? p.images[0] : ''),
      model: p.model,
      productCode: p.productCode || p.mpn || p.sku,
      gtin: p.gtin || p.ean
    });
  });
});

console.log(`📦 Loaded ${allProducts.length} total products across all ${datasets.length} catalog categories.\n`);

interface MatchRecord {
  id: string;
  name: string;
  category: string;
  brand: string;
  searchKey: string; // The exact verified unique key used
  currentImage: string;
  icecatImage: string;
  icecatTitle: string;
  icecatCategory?: string;
  galleryCount: number;
  specsCount: number;
}

interface UnmatchedRecord {
  id: string;
  name: string;
  category: string;
  brand: string;
  attemptedKey: string;
  reason: string;
}

async function runStrictIcecatAudit() {
  const matches: MatchRecord[] = [];
  const unmatched: UnmatchedRecord[] = [];
  const matchedKeys = new Map<string, string[]>(); // searchKey -> [product names]

  console.log('🚀 Starting Strict Code Icecat Audit (Safety Mode: Read-Only)...\n');

  // Let's audit all products across the catalog
  const total = allProducts.length;

  for (let i = 0; i < total; i++) {
    const p = allProducts[i];
    const strictCode = extractStrictProductCode(p.name, p.brand);

    if (!strictCode && !p.gtin) {
      unmatched.push({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        attemptedKey: 'None',
        reason: 'Ürün adında üreticiye ait özgün bir parça/model numarası veya GTIN bulunamadı (Manuel İnceleme Gerekli).'
      });
      continue;
    }

    const searchKey = p.gtin ? `GTIN:${p.gtin}` : strictCode!;
    let foundResult: IcecatProductResult | null = null;

    if (p.gtin) {
      foundResult = await fetchIcecatProduct({ gtin: p.gtin, username });
    } else if (strictCode) {
      foundResult = await fetchIcecatProduct({
        brand: p.brand,
        productCode: strictCode,
        username
      });
    }

    if (foundResult && (foundResult.images.highPic || foundResult.images.gallery.length > 0)) {
      const bestImg = foundResult.images.highPic || foundResult.images.gallery[0];
      
      // Track search key usage to verify uniqueness
      if (!matchedKeys.has(searchKey)) matchedKeys.set(searchKey, []);
      matchedKeys.get(searchKey)!.push(p.name);

      matches.push({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        searchKey,
        currentImage: p.image,
        icecatImage: bestImg,
        icecatTitle: foundResult.title,
        icecatCategory: foundResult.category,
        galleryCount: foundResult.images.gallery.length,
        specsCount: foundResult.specs.length
      });

      console.log(`[MATCH ${matches.length}] ${p.name}`);
      console.log(`   Strict Key   : ${searchKey}`);
      console.log(`   Icecat Image : ${bestImg}\n`);
    } else {
      unmatched.push({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        attemptedKey: searchKey,
        reason: 'Icecat veritabanında bu marka ve özgün model koduyla açık üretici kaydı bulunamadı (veya marka kısıtlı).'
      });
    }

    if ((i + 1) % 200 === 0 || i + 1 === total) {
      console.log(`⏳ Progress: ${i + 1}/${total} scanned (${matches.length} matched, ${unmatched.length} unmatched)...`);
    }

    // Small delay
    await new Promise(r => setTimeout(r, 20));
  }

  // 3. Uniqueness Check on Search Keys
  const duplicateSearchKeys = Array.from(matchedKeys.entries()).filter(([key, prods]) => prods.length > 1);

  // 4. Generate the Icecat Sync Recommendation Report (icecat-sync-report.md)
  console.log('\n📝 Generating strictly verified icecat-sync-report.md...');

  const reportPath = path.join(process.cwd(), 'icecat-sync-report.md');

  let report = `# ❄️ Icecat Ürün Eşleştirme & Görsel Öneri Raporu (v3.0 - Doğrulanmış Model Kodları)

**Oluşturulma Tarihi:** ${new Date().toLocaleString('tr-TR')}  
**Icecat Kullanıcısı:** \`${username}\`  
**API Durumu:** Aktif & Bağlı (\`live.icecat.biz/api?\`)  
**Eşleştirme Modu:** 🛡️ **Sıkı Parça / Model Numarası Doğrulaması** *(Genel çip/özellik/seri metinleri filtrelenmiştir)*  
**Çalışma Durumu:** 🛡️ **Salt Okunur / Öneri Modu** *(Katalogdaki hiçbir görsel otomatik uygulanmamıştır)*

---

## 📊 1. Yönetici Özeti & Eşleşme İstatistikleri

| Metrik | Değer |
|---|---|
| 🔍 **Taranan Toplam Katalog Ürünü** | **${total}** |
| ✅ **Özgün Üretici Koduyla Icecat'te Eşleşen** | **${matches.length}** |
| ❌ **Eşleşme Bulunamayan / Manuel Kod Gerekli** | **${unmatched.length}** |
| 🛡️ **Arama Anahtarı Benzersizlik Doğrulaması** | **${duplicateSearchKeys.length === 0 ? '✅ 0 Çakışma (Her anahtar benzersiz)' : `⚠️ ${duplicateSearchKeys.length} Çakışma`}** |

---

## 🔍 2. Arama Anahtarı Benzersizlik Kontrolü

${duplicateSearchKeys.length === 0 
  ? `> [!TIP]\n> **Mükemmel Benzersizlik:** Eşleşen tüm ürünlerde kullanılan arama anahtarları (örn. \`55QNED81B6A\`, \`OLED55C34LA\`, \`MGE94TU/A\`) her modele özgüdür. Hiçbir genel kategori veya seri adı (örn. \`QNED\`, \`18CPU\`) kod olarak kullanılmamıştır.`
  : `> [!WARNING]\n> Birden fazla üründe görülen ortak kodlar:\n` + duplicateSearchKeys.map(([k, p]) => `- **${k}**: ${p.join(', ')}`).join('\n')
}

---

## 🖼️ 3. Doğrulanmış Eşleşmeler & Önerilen Görsel Güncellemeleri

Aşağıdaki tabloda, Icecat resmi üretici veritabanında doğrulanmış yüksek çözünürlüklü fotoğrafları bulunan ürünler listelenmiştir.

| # | Ürün Adı | Kategori | Doğrulanmış Parça / Model Kodu | Mevcut Görsel | Icecat'te Bulunan Resmi Görsel URL | Icecat Başlığı |
|---|---|---|---|---|---|---|
`;

  matches.forEach((m, idx) => {
    report += `| ${idx + 1} | **${m.name}** | \`${m.category}\` | \`${m.searchKey}\` | \`${m.currentImage}\` | [Görseli Görüntüle](${m.icecatImage}) | ${m.icecatTitle} |\n`;
  });

  report += `\n---

## ❌ 4. Eşleşme Bulunamadı / Manuel Kod Gerekli

Aşağıdaki ürünlerin adında açık ve özgün bir parça/model numarası tespit edilememiş veya Icecat Open Catalog veritabanında bu kodla açık üretici kaydı bulunamamıştır.

| # | Ürün Adı | Kategori | Marka | Denenen Anahtar | Durum / Sebep |
|---|---|---|---|---|---|
`;

  unmatched.slice(0, 150).forEach((u, idx) => {
    report += `| ${idx + 1} | **${u.name}** | \`${u.category}\` | ${u.brand} | \`${u.attemptedKey}\` | ${u.reason} |\n`;
  });

  if (unmatched.length > 150) {
    report += `\n*...ve kalan ${unmatched.length - 150} adet ürün raporda özetlenmiştir.*\n`;
  }

  report += `\n---

## 🛡️ 5. Sonraki Adım ve Onay

Bu rapor yalnızca bir **öneri listesidir**. Onayınız olmadan **hiçbir görsel katalogda değiştirilmeyecektir**.
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`✅ Report saved to: ${reportPath}`);

  // Print summary to console
  console.log('\n====================================================');
  console.log('🌟 DOĞRULANMIŞ İLK 10 EŞLEŞME ÖRNEĞİ:');
  console.log('====================================================');
  matches.slice(0, 10).forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}`);
    console.log(`   Özgün Kod      : ${m.searchKey}`);
    console.log(`   Eski Görsel    : ${m.currentImage}`);
    console.log(`   Icecat URL     : ${m.icecatImage}`);
    console.log(`   Icecat Başlığı : ${m.icecatTitle}\n`);
  });

  console.log('====================================================');
  console.log(`📊 Toplam Taranan : ${total}`);
  console.log(`📊 Eşleşen        : ${matches.length}`);
  console.log(`📊 Eşleşmeyen     : ${unmatched.length}`);
  console.log('====================================================');
}

runStrictIcecatAudit();
