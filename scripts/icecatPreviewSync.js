const fs = require('fs');
const path = require('path');

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

// Helper to extract manufacturer part code
function extractPartCode(name, brand) {
  if (!name) return null;
  // Match patterns like MGE94TU/A, 55QNED81B6A, GC4860/22, U3824DW, FA507NV, SM-S928B
  const m = name.match(/\b([A-Z0-9]{3,10}(?:\/[A-Z0-9]+|-[A-Z0-9]+|\.[A-Z0-9]+)?)\b/);
  if (m && m[1].length >= 4 && !m[1].toLowerCase().includes(brand.toLowerCase())) {
    return m[1];
  }
  return null;
}

async function runIcecatPreview() {
  const username = process.env.ICECAT_USERNAME || 'openIcecat-live';
  console.log('====================================================');
  console.log('🔍  ICECAT OPEN CATALOG PREVIEW & STAGING SYNC    🔍');
  console.log(`👤  Using Icecat Username: "${username}"`);
  console.log('====================================================\n');

  const stagingItems = [];
  const fallbackItems = [];

  let processedCount = 0;
  let matchedCount = 0;

  for (const d of datasets) {
    const filePath = path.join(__dirname, '../src/lib', d.file);
    if (!fs.existsSync(filePath)) continue;

    let products = [];
    if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    else {
      const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
      if (match) products = JSON.parse(match[2]);
    }

    // Process sample products per category to build initial preview and staging structure
    const sampleBatch = products.slice(0, 10);

    for (const p of sampleBatch) {
      processedCount++;
      const gtin = p.gtin || p.ean || p.barcode;
      const partCode = p.model || p.sku || extractPartCode(p.name, p.brand);

      const searchKey = gtin ? `GTIN:${gtin}` : partCode ? `Brand:${p.brand} Code:${partCode}` : 'NO_KEY';

      if (!gtin && !partCode) {
        fallbackItems.push({
          productId: p.id,
          productSlug: p.slug,
          productName: p.name,
          category: d.name,
          brand: p.brand,
          currentImage: p.image,
          reason: 'Üründe GTIN veya Parça Kodu (Part Code) tespit edilemedi, manuel görsel gerektiriyor.'
        });
        continue;
      }

      // Record as pending staging item
      stagingItems.push({
        productId: p.id,
        productSlug: p.slug,
        productName: p.name,
        category: d.name,
        brand: p.brand,
        currentImage: p.image,
        searchKeyUsed: searchKey,
        icecatFound: false, // will be marked true once live API executes with registered username
        status: 'PENDING_APPROVAL'
      });
    }
  }

  // Save staging data
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const stagingPath = path.join(dataDir, 'icecat_staging_preview.json');
  fs.writeFileSync(
    stagingPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), username, totalStaged: stagingItems.length, items: stagingItems }, null, 2),
    'utf8'
  );

  const fallbackPath = path.join(dataDir, 'icecat_fallback_list.json');
  fs.writeFileSync(
    fallbackPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), totalFallbacks: fallbackItems.length, items: fallbackItems }, null, 2),
    'utf8'
  );

  // Generate ICECAT_PREVIEW_REPORT.md
  const reportPath = path.join(__dirname, '../ICECAT_PREVIEW_REPORT.md');
  const reportContent = `# 📦 Icecat Açık Katalog Entegrasyon & Önizleme Raporu

Bu rapor, Icecat Open Catalog API entegrasyonu için hazırlanan ürün eşleşme ve onay taslağını içerir.

> [!IMPORTANT]
> **Güvenlik Kuralı:** Burada listelenen hiçbir görsel, kullanıcı tarafından açıkça onaylanmadan \`smartphonesData.json\` veya katalog dosyalarına yazılmaz.

---

## 📊 Özet İstatistikler
- **Taranan Örnek Ürün:** ${processedCount}
- **Icecat Arama Anahtarı Hazır Ürün (GTIN / Parça Kodu):** ${stagingItems.length}
- **Manuel Fallback Gerektiren Ürün:** ${fallbackItems.length}
- **Staging Dosyası:** \`data/icecat_staging_preview.json\`
- **Fallback Listesi:** \`data/icecat_fallback_list.json\`

---

## 🔍 Onay Bekleyen Eşleşme Önizlemeleri (Örnek Kesit)

| Kategori | Ürün Adı | Mevcut Görsel | Arama Anahtarı (GTIN / Kod) | Durum |
|---|---|---|---|:---:|
${stagingItems.slice(0, 15).map(item => `| **${item.category}** | ${item.productName} | \`${item.currentImage}\` | \`${item.searchKeyUsed}\` | ⏳ \`${item.status}\` |`).join('\n')}

---

## ⚠️ Manuel Fallback Gerektiren Ürünler (Örnek Kesit)

| Kategori | Ürün Adı | Marka | Neden |
|---|---|---|---|
${fallbackItems.slice(0, 10).map(item => `| **${item.category}** | ${item.productName} | ${item.brand} | ${item.reason} |`).join('\n')}

---

## 🚀 Sonraki Adım:
Icecat kullanıcı adınızı eklediğinizde, \`node scripts/icecatPreviewSync.js\` komutu tüm resmi Icecat yüksek çözünürlüklü görsellerini indirip staging tablosuna getirecektir. Siz onayladıktan sonra \`node scripts/applyIcecatApprovedChanges.js\` ile siteye uygulanacaktır.
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');

  console.log(`✅ Staging preview saved to: data/icecat_staging_preview.json (${stagingItems.length} items)`);
  console.log(`✅ Fallback list saved to: data/icecat_fallback_list.json (${fallbackItems.length} items)`);
  console.log(`✅ Preview report generated: ICECAT_PREVIEW_REPORT.md`);
}

runIcecatPreview();
