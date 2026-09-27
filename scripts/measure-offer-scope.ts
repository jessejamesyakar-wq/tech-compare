import fs from 'node:fs';
import path from 'node:path';
import { evaluateOfferScope, CatalogProductRaw } from '../src/lib/pricing/offerScopeEvaluator';

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

function parseArgs(): { outputPath?: string; stdout: boolean } {
  const args = process.argv.slice(2);
  let outputPath: string | undefined;
  let stdout = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    } else if (args[i] === '--stdout') {
      stdout = true;
    }
  }

  return { outputPath, stdout };
}

function runMeasurement() {
  const { outputPath, stdout } = parseArgs();
  const allProducts: CatalogProductRaw[] = [];

  datasets.forEach(d => {
    const filePath = path.join(__dirname, '../src/lib', d.file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`[D02 Parser Error] Katalog dosyası bulunamadı: ${d.file}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    let products: CatalogProductRaw[] = [];

    if (d.type === 'json') {
      try {
        products = JSON.parse(fileContent);
      } catch (e: any) {
        throw new Error(`[D02 Parser Error] JSON ayrıştırma hatası (${d.file}): ${e.message}`);
      }
    } else {
      const match = fileContent.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
      if (match) {
        try {
          products = JSON.parse(match[2]);
        } catch (e: any) {
          throw new Error(`[D02 Parser Error] TS dizisi JSON ayrıştırma hatası (${d.file}): ${e.message}`);
        }
      } else {
        throw new Error(`[D02 Parser Error] TS dosyasında export dizisi bulunamadı (${d.file})`);
      }
    }

    allProducts.push(...products);
  });

  const sourcesPath = path.join(__dirname, '../data/store_offer_sources.json');
  let sourceBindings: any[] = [];
  if (fs.existsSync(sourcesPath)) {
    try {
      const sourcesData = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));
      sourceBindings = sourcesData.bindings || [];
    } catch (e: any) {
      throw new Error(`[D02 Parser Error] Source bindings file (${sourcesPath}) JSON parse error: ${e.message}`);
    }
  }

  const result = evaluateOfferScope(allProducts, sourceBindings);

  if (outputPath) {
    try {
      const resolvedPath = path.isAbsolute(outputPath) ? outputPath : path.resolve(process.cwd(), outputPath);
      const parentDir = path.dirname(resolvedPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(resolvedPath, JSON.stringify(result, null, 2), 'utf8');
      console.log(`📄 Makine Okunur Ölçüm Çıktısı Yazıldı: ${resolvedPath}`);
    } catch (e: any) {
      console.error(`❌ Output dosyasına yazılamadı (${outputPath}): ${e.message}`);
      process.exit(1);
    }
  }

  if (stdout) {
    process.stdout.write(JSON.stringify(result, null, 2));
  } else if (!outputPath) {
    // Print human-readable summary if no --stdout or --output
    console.log('====================================================');
    console.log('📊  D02 — TEKLİF KAPSAMI VE VERİ ÖLÇÜM RAPORU  📊');
    console.log('====================================================\n');
    console.log(`Ölçüm Zamanı: ${result.measuredAt}`);
    console.log(`1. Kataloğun Genel Ölçeği:`);
    console.log(`   - Toplam Ürün Sayısı                     : ${result.catalogMetrics.totalProducts}`);
    console.log(`   - Modellere Tanımlı Varyant Sayısı       : ${result.catalogMetrics.totalModeledVariants}`);
    console.log(`   - ColorOptions Kapsayıcı Sayısı          : ${result.catalogMetrics.totalColorOptionsContainers}`);
    console.log(`   - Variants Kapsayıcı Sayısı              : ${result.catalogMetrics.totalVariantsContainers}`);
    console.log(`   - Toplam Teklif Öğesi (Katalog)          : ${result.catalogMetrics.totalStoreOfferElements}\n`);
    console.log(`2. Mağaza Bağlayıcıları (data/store_offer_sources.json):`);
    console.log(`   - Tanımlı Binding Sayısı                  : ${result.registeredBindings.count}`);
    console.log(`   - Ağ Üstünden Canlı Erişim               : ${result.registeredBindings.accessStatus}`);
    console.log(`   - Doğrulanmış Canlı Teklif               : ${result.registeredBindings.liveOffersCount ?? 'null'}\n`);
    console.log(`3. Teklif Bağlantı Sınıflandırması:`);
    console.log(`   - Doğrudan Ürün Sayfası Adayı            : ${result.urlClassification.directProductUrlCandidates}`);
    console.log(`   - Dinamik / Arama URL'si                  : ${result.urlClassification.searchUrlOffersCount}`);
    console.log(`   - Geçersiz / Bozuk URL (#, Boş)           : ${result.urlClassification.invalidUrlCount}\n`);
    console.log(`4. Stok Durumu:`);
    console.log(`   - Stokta (inStock === true)               : ${result.stockStatus.inStockTrueCount}`);
    console.log(`   - Stokta Yok (inStock === false)          : ${result.stockStatus.inStockFalseCount}`);
    console.log(`   - Belirtilmemiş (Unknown)                : ${result.stockStatus.inStockUnknownCount}\n`);
    console.log(`5. Tazelik Durumu:`);
    console.log(`   - Güncel (<= 24h)                         : ${result.freshnessStatus.freshOffersCount}`);
    console.log(`   - Son Görülen (> 24h & <= 30d)              : ${result.freshnessStatus.staleOffersCount}`);
    console.log(`   - Doğrulanmadı / Geçersiz Tarih           : ${result.freshnessStatus.unverifiedDateOffersCount}`);
    console.log(`   - Toplam Geçerli Tarih Sayacı             : ${result.freshnessStatus.validDateTotalCount}\n`);
  }
}

try {
  runMeasurement();
} catch (e: any) {
  console.error(`❌ Ölçüm hatası: ${e.message}`);
  process.exit(1);
}
