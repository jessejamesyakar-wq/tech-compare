import fs from 'fs';
import path from 'path';
import https from 'https';
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

console.log('====================================================');
console.log('❄️  ICECAT CATALOG MATCHING & IMAGE SYNC AUDITOR  ❄️');
console.log('====================================================');
console.log(`👤 Icecat User       : ${username}`);
console.log(`🔑 API Token (app_key): ${apiToken ? apiToken.slice(0, 8) + '...' : 'Not Set'}`);
console.log(`🖼️  Content Token     : ${contentToken ? contentToken.slice(0, 8) + '...' : 'Not Set'}`);
console.log('====================================================\n');

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

/**
 * Extracts candidate product codes from product name and brand for Icecat search.
 */
function extractProductCodeCandidates(p: CatalogProduct): string[] {
  const candidates: string[] = [];

  if (p.productCode) candidates.push(p.productCode);
  if (p.model) candidates.push(p.model);

  const cleanName = p.name
    .replace(/\(.*?\)/g, '') // remove parentheses
    .replace(/["'”]/g, '')
    .trim();

  // Pattern 1: TV/Monitor Model Codes (e.g. 55QNED81B6A, OLED55C34LA, QE65Q70DATXTK, 27GP850-B)
  const tvMatch = cleanName.match(/\b([A-Z0-9]{4,}(?:-[A-Z0-9]+|\/[A-Z0-9]+)?)\b/gi);
  if (tvMatch) {
    tvMatch.forEach(m => {
      if (m.length >= 4 && !/^(TELEVİZYON|SMART|ULTRA|INCH|SERIES|BLACK|WHITE|TITANIUM)$/i.test(m)) {
        candidates.push(m);
      }
    });
  }

  // Pattern 2: Appliance Model Codes (e.g. KGN56VWF0N, B360340, WGA25400TR)
  const appMatch = cleanName.match(/\b([A-Z]{2,4}[0-9]{3,}[A-Z0-9]*)\b/gi);
  if (appMatch) {
    appMatch.forEach(m => candidates.push(m));
  }

  // Pattern 3: Laptop Model Codes (e.g. 15ITL6, GA402RJ, 9315, 14-ek0000nt)
  const laptopMatch = cleanName.match(/\b([0-9]{2}-[a-z0-9]{4,}|[A-Z0-9]{5,}-[A-Z0-9]+)\b/gi);
  if (laptopMatch) {
    laptopMatch.forEach(m => candidates.push(m));
  }

  // Pattern 4: Smartphone Model Codes (e.g. SM-S928B, SM-A556B, SM-S908B)
  const phoneMatch = cleanName.match(/\b(SM-[A-Z0-9]{4,})\b/gi);
  if (phoneMatch) {
    phoneMatch.forEach(m => candidates.push(m));
  }

  // Pattern 5: Full model name without brand
  const words = cleanName.split(' ');
  if (words.length > 1 && words[0].toLowerCase() === p.brand.toLowerCase()) {
    candidates.push(words.slice(1).join(' '));
  } else {
    candidates.push(cleanName);
  }

  return Array.from(new Set(candidates.filter(c => c && c.length >= 2)));
}

interface MatchRecord {
  id: string;
  name: string;
  category: string;
  brand: string;
  productCode: string;
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
  attemptedCodes: string[];
  reason: string;
}

async function runIcecatSyncAudit() {
  const matches: MatchRecord[] = [];
  const unmatched: UnmatchedRecord[] = [];

  console.log('🚀 Starting Icecat query batch audit (Safety Mode: Read-Only)...\n');

  // Let's audit all products or prioritized sample across all categories
  // We audit representative batch with high-coverage rate limiting
  const maxToScan = Math.min(allProducts.length, 500); 

  for (let i = 0; i < maxToScan; i++) {
    const p = allProducts[i];
    const candidateCodes = extractProductCodeCandidates(p);
    let foundResult: IcecatProductResult | null = null;
    let successfulCode = '';

    // Try GTIN first
    if (p.gtin) {
      foundResult = await fetchIcecatProduct({
        gtin: p.gtin,
        username
      });
      if (foundResult?.images.highPic) {
        successfulCode = `GTIN:${p.gtin}`;
      }
    }

    // Try Brand + Candidate Product Codes
    if (!foundResult?.images.highPic) {
      for (const code of candidateCodes) {
        foundResult = await fetchIcecatProduct({
          brand: p.brand,
          productCode: code,
          username
        });

        if (foundResult && (foundResult.images.highPic || foundResult.images.gallery.length > 0)) {
          successfulCode = code;
          break;
        }

        // Small delay to be polite to API
        await new Promise(r => setTimeout(r, 40));
      }
    }

    if (foundResult && (foundResult.images.highPic || foundResult.images.gallery.length > 0)) {
      const bestImg = foundResult.images.highPic || foundResult.images.gallery[0];
      matches.push({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        productCode: successfulCode,
        currentImage: p.image,
        icecatImage: bestImg,
        icecatTitle: foundResult.title,
        icecatCategory: foundResult.category,
        galleryCount: foundResult.images.gallery.length,
        specsCount: foundResult.specs.length
      });

      console.log(`[MATCH ${matches.length}] ${p.name}`);
      console.log(`   Icecat Image: ${bestImg}\n`);
    } else {
      unmatched.push({
        id: p.id,
        name: p.name,
        category: p.category,
        brand: p.brand,
        attemptedCodes: candidateCodes,
        reason: 'Icecat veritabanında bu marka ve model koduyla eşleşen açık üretici kaydı bulunamadı veya marka kısıtlı.'
      });
    }

    if ((i + 1) % 50 === 0) {
      console.log(`⏳ Progress: ${i + 1}/${maxToScan} scanned (${matches.length} matched, ${unmatched.length} unmatched)...`);
    }
  }

  // 4. Generate the Icecat Sync Recommendation Report (icecat-sync-report.md)
  console.log('\n📝 Generating icecat-sync-report.md...');

  const reportPath = path.join(process.cwd(), 'icecat-sync-report.md');

  let report = `# ❄️ Icecat Ürün Eşleştirme & Görsel Öneri Raporu

**Oluşturulma Tarihi:** ${new Date().toLocaleString('tr-TR')}  
**Icecat Kullanıcısı:** \`${username}\`  
**API Durumu:** Aktif & Bağlı (\`live.icecat.biz/api?\`)  
**Çalışma Modu:** 🛡️ **Salt Okunur / Öneri Modu** *(Katalogdaki hiçbir görsel otomatik değiştirilmemiştir)*

---

## 📊 1. Yönetici Özeti & Eşleşme İstatistikleri

| Metrik | Değer |
|---|---|
| 🔍 **Taranan Toplam Ürün Sayısı** | **${maxToScan}** |
| ✅ **Icecat'te Resmi Görseli Bulunan Ürün Sayısı** | **${matches.length}** |
| ❌ **Eşleşme Bulunamayan Ürün Sayısı** | **${unmatched.length}** |
| 📈 **Eşleşme Başarı Oranı** | **%${((matches.length / maxToScan) * 100).toFixed(1)}** |

---

## 🖼️ 2. Bulunan Eşleşmeler & Önerilen Görsel Güncellemeleri

Aşağıdaki tabloda, Icecat resmi üretici veritabanında doğrulanmış yüksek çözünürlüklü fotoğrafları bulunan ürünler listelenmiştir.

| # | Ürün Adı | Kategori | Mevcut Görsel | Icecat'te Bulunan Resmi Görsel URL | Icecat Başlığı & Özellikler |
|---|---|---|---|---|---|
`;

  matches.forEach((m, idx) => {
    report += `| ${idx + 1} | **${m.name}** | \`${m.category}\` | \`${m.currentImage}\` | [Görseli Görüntüle](${m.icecatImage}) | ${m.icecatTitle} (*${m.specsCount} teknik özellik, ${m.galleryCount} galeri açısı*) |\n`;
  });

  report += `\n---

## ❌ 3. Eşleşme Bulunamadı

Aşağıdaki ürünler için Icecat Open Catalog veritabanında belirtilen marka ve model koduyla kayıt bulunamamıştır (veya marka erişim kısıtlaması mevcuttur).

| # | Ürün Adı | Kategori | Marka | Denenen Model Kodları | Açıklama |
|---|---|---|---|---|---|
`;

  unmatched.slice(0, 100).forEach((u, idx) => {
    report += `| ${idx + 1} | **${u.name}** | \`${u.category}\` | ${u.brand} | \`${u.attemptedCodes.slice(0, 3).join(', ')}\` | ${u.reason} |\n`;
  });

  if (unmatched.length > 100) {
    report += `\n*...ve ${unmatched.length - 100} adet daha eşleşmeyen ürün listelenmedi.*\n`;
  }

  report += `\n---

## 🛡️ 4. Sonraki Adım ve Onay

Bu rapor yalnızca bir **öneri listesidir**. Onayınız alındıktan sonra seçilen modellerin görselleri kataloğa güvenle uygulanacaktır.
`;

  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`✅ Report saved to: ${reportPath}`);

  // Print top 10 matches summary to console
  console.log('\n====================================================');
  console.log('🌟 İLK 10 EŞLEŞME ÖRNEĞİ:');
  console.log('====================================================');
  matches.slice(0, 10).forEach((m, i) => {
    console.log(`${i + 1}. ${m.name}`);
    console.log(`   Eski Görsel    : ${m.currentImage}`);
    console.log(`   Icecat URL     : ${m.icecatImage}`);
    console.log(`   Icecat Başlığı : ${m.icecatTitle}\n`);
  });

  console.log('====================================================');
  console.log(`📊 Toplam Eşleşen : ${matches.length}`);
  console.log(`📊 Eşleşmeyen     : ${unmatched.length}`);
  console.log('====================================================');
}

runIcecatSyncAudit();
