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

console.log('====================================================');
console.log('🛡️  TECH-COMPARE PRE-DEPLOY INTEGRITY GATEKEEPER  🛡️');
console.log('====================================================\n');

let criticalErrors = [];
let warnings = [];
let totalProducts = 0;
const currentCounts = {};
const currentProductsMap = new Map();

// 1. Load and parse all datasets
datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  if (!fs.existsSync(filePath)) {
    criticalErrors.push(`[${d.name}] Dataset file missing: ${d.file}`);
    return;
  }

  let products = [];
  if (d.type === 'json') {
    products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) {
      try {
        products = JSON.parse(match[2]);
      } catch (e) {
        criticalErrors.push(`[${d.name}] Failed to parse JSON in ${d.file}: ${e.message}`);
        return;
      }
    } else {
      criticalErrors.push(`[${d.name}] Could not find exported array in ${d.file}`);
      return;
    }
  }

  currentCounts[d.name] = products.length;
  totalProducts += products.length;
  currentProductsMap.set(d.name, products);
});

// 2. Baseline count loss prevention check
const baselinePath = path.join(__dirname, '../data/catalog_baseline.json');
if (fs.existsSync(baselinePath)) {
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  Object.keys(baseline.counts || {}).forEach(cat => {
    const baseCount = baseline.counts[cat];
    const currCount = currentCounts[cat] || 0;
    if (currCount < baseCount) {
      criticalErrors.push(
        `🚨 DATA LOSS DETECTED in [${cat}]: Count decreased from ${baseCount} to ${currCount} (-${baseCount - currCount} products lost)!`
      );
    }
  });
} else {
  // Initialize baseline file if not present
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(
    baselinePath,
    JSON.stringify({ updatedAt: new Date().toISOString(), total: totalProducts, counts: currentCounts }, null, 2),
    'utf8'
  );
  console.log(`📌 Created initial catalog baseline snapshot (${totalProducts} total products).`);
}

// 3. Broken image files & Unique ID/Slug checks
const publicDir = path.join(__dirname, '../public');
const globalImageUsageMap = new Map(); // imagePath -> Array of product info

currentProductsMap.forEach((products, cat) => {
  const idSet = new Set();
  const slugSet = new Set();

  products.forEach(p => {
    // Unique ID check
    if (!p.id) {
      criticalErrors.push(`[${cat}] Product missing required ID: "${p.name}"`);
    } else if (idSet.has(p.id)) {
      criticalErrors.push(`[${cat}] Duplicate product ID detected: "${p.id}"`);
    } else {
      idSet.add(p.id);
    }

    // Unique Slug check
    if (!p.slug) {
      criticalErrors.push(`[${cat}] Product missing required slug: "${p.name}" (ID: ${p.id})`);
    } else if (slugSet.has(p.slug)) {
      criticalErrors.push(`[${cat}] Duplicate product slug detected: "${p.slug}" (ID: ${p.id})`);
    } else {
      slugSet.add(p.slug);
    }

    // Image on disk existence check
    if (!p.image) {
      criticalErrors.push(`[${cat}] Product has no image path: "${p.name}" (ID: ${p.id})`);
    } else if (p.image.startsWith('http://') || p.image.startsWith('https://')) {
      criticalErrors.push(`[${cat}] Hotlinked external image found: "${p.image}" on "${p.name}"`);
    } else {
      const diskPath = path.join(publicDir, p.image.startsWith('/') ? p.image.slice(1) : p.image);
      if (!fs.existsSync(diskPath)) {
        criticalErrors.push(`[${cat}] 🔴 BROKEN IMAGE FILE on disk: "${p.image}" for product "${p.name}" (ID: ${p.id})`);
      }

      // Track usage for shared/generic image collision detection
      const list = globalImageUsageMap.get(p.image) || [];
      list.push({ cat, id: p.id, name: p.name });
      globalImageUsageMap.set(p.image, list);
    }

    // Variant image checks if present
    if (Array.isArray(p.variants)) {
      p.variants.forEach(v => {
        if (v.image && !v.image.startsWith('http')) {
          const varDiskPath = path.join(publicDir, v.image.startsWith('/') ? v.image.slice(1) : v.image);
          if (!fs.existsSync(varDiskPath)) {
            criticalErrors.push(`[${cat}] 🔴 BROKEN VARIANT IMAGE on disk: "${v.image}" for variant "${v.name}" of "${p.name}"`);
          }
        }
      });
    }
  });
});

// 4. Shared image detection (detect generic fallbacks)
globalImageUsageMap.forEach((usedBy, imgPath) => {
  if (usedBy.length > 5) {
    warnings.push(`Shared Image: "${imgPath}" is shared across ${usedBy.length} different products (e.g. ${usedBy.slice(0, 3).map(u => u.name).join(', ')}...)`);
  }
});

// Summary reporting
console.log(`📊 Catalog Inventory Summary:`);
Object.entries(currentCounts).forEach(([cat, count]) => {
  console.log(`   - ${cat.padEnd(14)}: ${count} products`);
});
console.log(`   ------------------------------------`);
console.log(`   Total Products : ${totalProducts}`);

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length} items to review):`);
  warnings.slice(0, 10).forEach(w => console.log(`   - ${w}`));
  if (warnings.length > 10) console.log(`   ... and ${warnings.length - 10} more warnings.`);
}

if (criticalErrors.length > 0) {
  console.error(`\n❌ PRE-DEPLOY INTEGRITY CHECK FAILED with ${criticalErrors.length} critical errors!`);
  criticalErrors.forEach(err => console.error(`   ${err}`));
  console.error('\n🛑 Deploy halted to protect catalog integrity.');
  process.exit(1);
} else {
  console.log(`\n✅ ALL PRE-DEPLOY INTEGRITY CHECKS PASSED (0 broken links, 0 duplicate IDs/slugs, 0 data loss).`);
  process.exit(0);
}
