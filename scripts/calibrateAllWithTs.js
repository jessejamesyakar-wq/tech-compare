const fs = require('fs');
const path = require('path');
const ts = require('typescript');

console.log('🚀 Starting Comprehensive Catalog Price Calibration via TypeScript Engine...');

const STORES = [
  { name: 'Hepsiburada', logo: '/images/stores/hepsiburada.png', multiplier: 1.00 },
  { name: 'Trendyol', logo: '/images/stores/trendyol.png', multiplier: 1.012 },
  { name: 'MediaMarkt', logo: '/images/stores/mediamarkt.png', multiplier: 1.025 },
  { name: 'Vatan Bilgisayar', logo: '/images/stores/vatan.png', multiplier: 1.035 },
  { name: 'Amazon Türkiye', logo: '/images/stores/amazon.png', multiplier: 0.995 },
  { name: 'Teknosa', logo: '/images/stores/teknosa.png', multiplier: 1.028 }
];

const MONTHS = ['Ekim 2025', 'Kasım 2025', 'Aralık 2025', 'Ocak 2026', 'Şubat 2026', 'Ağustos 2026'];

function generateStoreOffers(basePrice, productName) {
  const encName = encodeURIComponent(productName);
  return STORES.map(s => {
    const rawPrice = Math.round(basePrice * s.multiplier);
    const roundedPrice = Math.round(rawPrice / 10) * 10 - 1;
    return {
      storeName: s.name,
      storeLogo: s.logo,
      price: roundedPrice > 0 ? roundedPrice : basePrice,
      shippingFee: 0,
      inStock: true,
      url: s.name === 'Trendyol' ? `https://www.trendyol.com/sr?q=${encName}` :
           s.name === 'Hepsiburada' ? `https://www.hepsiburada.com/ara?q=${encName}` :
           s.name === 'MediaMarkt' ? `https://www.mediamarkt.com.tr/tr/search.html?query=${encName}` :
           s.name === 'Vatan Bilgisayar' ? `https://www.vatanbilgisayar.com/arama/${encName}` :
           s.name === 'Teknosa' ? `https://www.teknosa.com/arama?s=${encName}` :
           `https://www.amazon.com.tr/s?k=${encName}`,
      rating: 4.8
    };
  });
}

function generatePriceHistory(basePrice) {
  const factors = [1.14, 1.11, 1.08, 1.05, 1.02, 1.00];
  return MONTHS.map((m, idx) => ({
    date: m,
    price: Math.round(basePrice * factors[idx] / 10) * 10
  }));
}

function loadTsModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const jsCode = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 }
  }).outputText;

  const m = { exports: {} };
  const fn = new Function('module', 'exports', 'require', '__dirname', '__filename', jsCode);
  fn(m, m.exports, require, path.dirname(filePath), filePath);
  return m.exports;
}

function calibrateCategory(filePath, exportName) {
  if (!fs.existsSync(filePath)) return;
  const mod = loadTsModule(filePath);
  const products = mod[exportName];

  if (!products || !Array.isArray(products)) {
    console.error(`Could not load array ${exportName} from ${filePath}`);
    return;
  }

  products.forEach(p => {
    let bp = p.basePrice || 15000;
    const nameLower = (p.name || '').toLowerCase();

    // TVs
    if (p.category === 'tvs') {
      if (nameLower.includes('oled') || nameLower.includes('qd-oled')) {
        if (bp < 45000) bp = 69999;
      } else if (nameLower.includes('mini led') || nameLower.includes('neo qled')) {
        if (bp < 30000) bp = 44999;
      } else if (nameLower.includes('85"') || nameLower.includes('98"')) {
        if (bp < 50000) bp = 89999;
      } else if (nameLower.includes('55"') || nameLower.includes('65"')) {
        if (bp < 18000) bp = 26999;
      }
    }

    // Consoles
    if (p.category === 'consoles') {
      if (nameLower.includes('ps5 pro') || nameLower.includes('playstation 5 pro')) {
        bp = 46999;
      } else if (nameLower.includes('ps5 slim') || nameLower.includes('playstation 5')) {
        bp = 24999;
      } else if (nameLower.includes('xbox series x')) {
        bp = 32999;
      } else if (nameLower.includes('xbox series s')) {
        bp = 18499;
      } else if (nameLower.includes('switch oled')) {
        bp = 16499;
      } else if (nameLower.includes('steam deck')) {
        bp = 31999;
      } else if (nameLower.includes('rog ally')) {
        bp = 28999;
      }
    }

    // Laptops
    if (p.category === 'laptops') {
      if (nameLower.includes('macbook pro')) {
        if (bp < 65000) bp = 79999;
      } else if (nameLower.includes('macbook air')) {
        if (bp < 38000) bp = 47999;
      } else if (nameLower.includes('rtx 4080') || nameLower.includes('rtx 4090')) {
        if (bp < 70000) bp = 94999;
      } else if (nameLower.includes('rtx 4060') || nameLower.includes('rtx 4070')) {
        if (bp < 30000) bp = 42999;
      }
    }

    // Headphones
    if (p.category === 'headphones') {
      if (nameLower.includes('airpods max')) {
        bp = 26999;
      } else if (nameLower.includes('wh-1000xm5')) {
        bp = 14999;
      } else if (nameLower.includes('airpods pro')) {
        bp = 9299;
      } else if (nameLower.includes('galaxy buds 3 pro')) {
        bp = 6499;
      }
    }

    // Appliances
    if (p.category === 'appliances') {
      if (nameLower.includes('gen5detect')) {
        bp = 36999;
      } else if (nameLower.includes('v15 detect')) {
        bp = 29999;
      } else if (nameLower.includes('v12 detect')) {
        bp = 23999;
      } else if (nameLower.includes('roborock s8')) {
        if (bp < 35000) bp = 48999;
      }
    }

    // Smartwatches
    if (p.category === 'smartwatches') {
      if (nameLower.includes('ultra 2') || nameLower.includes('watch ultra')) {
        if (bp < 35000) bp = 42999;
      } else if (nameLower.includes('series 10') || nameLower.includes('series 9')) {
        if (bp < 15000) bp = 19499;
      }
    }

    // Monitors
    if (p.category === 'monitors') {
      if (nameLower.includes('oled') && bp < 30000) bp = 39999;
      else if (nameLower.includes('240hz') && bp < 15000) bp = 18999;
      else if (nameLower.includes('144hz') && bp < 5000) bp = 6499;
    }

    p.basePrice = bp;
    p.storeOffers = generateStoreOffers(bp, p.name);
    p.priceHistory = generatePriceHistory(bp);
    const valid = p.storeOffers.map(o => o.price).filter(pr => pr > 0);
    if (valid.length > 0) p.basePrice = Math.min(...valid);
  });

  const output = `import { Product } from './types';\n\nexport const ${exportName}: Product[] = ${JSON.stringify(products, null, 2)};\n`;
  fs.writeFileSync(filePath, output, 'utf8');
  console.log(`✅ Calibrated ${products.length} products in ${path.basename(filePath)}`);
}

// Calibrate all categories
calibrateCategory(path.join(__dirname, '../src/lib/mockTVs.ts'), 'mockTVs');
calibrateCategory(path.join(__dirname, '../src/lib/mockLaptops.ts'), 'mockLaptops');
calibrateCategory(path.join(__dirname, '../src/lib/mockTablets.ts'), 'mockTablets');
calibrateCategory(path.join(__dirname, '../src/lib/mockSmartwatches.ts'), 'mockSmartwatches');
calibrateCategory(path.join(__dirname, '../src/lib/mockHeadphones.ts'), 'mockHeadphones');
calibrateCategory(path.join(__dirname, '../src/lib/mockConsoles.ts'), 'mockConsoles');
calibrateCategory(path.join(__dirname, '../src/lib/mockAppliances.ts'), 'mockAppliances');
calibrateCategory(path.join(__dirname, '../src/lib/mockMonitors.ts'), 'mockMonitors');

console.log('🎉 Bulk Price Calibration Successfully Finished Across All 9 Categories!');
