const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');

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

const categoryProducts = {};
let allRawProducts = [];

for (const d of datasets) {
  const filePath = path.join(ROOT, 'src/lib', d.file);
  const content = fs.readFileSync(filePath, 'utf8');
  let products = [];
  if (d.type === 'json') {
    products = JSON.parse(content);
  } else {
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (!match) throw new Error('Could not parse ' + d.file);
    products = JSON.parse(match[2]);
  }
  // Tag with category if missing
  products.forEach(p => { if (!p.category) p.category = d.name; });
  categoryProducts[d.name] = products;
  allRawProducts.push(...products);
}

console.log('=== RAW SOURCE PRODUCTS LOADED ===');
console.log('Total Raw Products:', allRawProducts.length);
Object.entries(categoryProducts).forEach(([cat, list]) => {
  console.log(`  - ${cat}: ${list.length}`);
});

// Identify Excluded / Quarantined items
const KNOWN_EXCLUSIONS = new Set([
  'oppo-k14-turbo-pro-512gb-2027',
  'oppo-k14-turbo-256gb-2027',
  'huawei-huawei-y9-1',
  'huawei-huawei-mate-60-pro-1',
  'huawei-huawei-p40-pro-1',
  'huawei-huawei-pura-70-pro-1'
]);

const canonicalProducts = allRawProducts.filter(p => !KNOWN_EXCLUSIONS.has(p.id));
console.log('Canonical Safe Products (excluding 6 known items):', canonicalProducts.length);

const issues = [];
let issueCounter = 1;
function recordIssue(item) {
  issues.push({
    issueId: `DQ2-${String(issueCounter++).padStart(5, '0')}`,
    ...item,
    mutationAllowed: false
  });
}

// 1. GOLDEN DATASET VERIFICATION
const GOLDEN_IDS = [
  'samsung-galaxy-s25', 'samsung-galaxy-s25-plus', 'samsung-galaxy-s25-ultra', 'samsung-galaxy-s26-plus',
  'samsung-galaxy-a57-5g', 'samsung-galaxy-a17-5g', 'samsung-galaxy-s26-ultra', 'samsung-samsung-galaxy-s24-93',
  'samsung-samsung-galaxy-s24-ultra-95', 'samsung-samsung-galaxy-a55-5g-103', 'samsung-samsung-galaxy-z-flip-6-97',
  'samsung-samsung-galaxy-z-fold-6-98', 'samsung-samsung-galaxy-s24-fe-96', 'samsung-samsung-galaxy-a54-5g-89',
  'samsung-samsung-galaxy-s22-ultra-68', 'samsung-samsung-galaxy-s21-51', 'samsung-samsung-galaxy-s21-50',
  'samsung-samsung-galaxy-s20-ultra-34', 'samsung-samsung-galaxy-z-fold-3-55', 'samsung-samsung-galaxy-note-20-ultra-37',
  'samsung-samsung-galaxy-a72-62',
  'apple-apple-iphone-16-pro-max-1-tb-960862', 'apple-apple-iphone-16-pro-max-512-gb-960861', 'apple-apple-iphone-16-pro-max-256-gb-952387',
  'apple-apple-iphone-16-pro-256-gb-960858', 'apple-apple-iphone-15-pro-max-1-tb-895854', 'apple-apple-iphone-15-pro-max-512-gb-895853',
  'apple-apple-iphone-16-pro-128-gb-952452', 'apple-apple-iphone-16-128-gb-959779', 'apple-apple-iphone-11-128-gb-335107',
  'apple-apple-iphone-16-pro-1-tb-960860',
  'apple-apple-iphone-16-plus-128-gb-959953', 'apple-apple-iphone-16-plus-256-gb-959954', 'apple-apple-iphone-16-plus-512-gb-959955',
  'apple-apple-iphone-16-256-gb-960853', 'apple-apple-iphone-16-512-gb-959781', 'apple-apple-iphone-16-pro-512-gb-960859',
  'apple-apple-iphone-15-128-gb-895865', 'apple-apple-iphone-15-256-gb-895866', 'apple-apple-iphone-15-512-gb-895867',
  'apple-apple-iphone-15-plus-128-gb-895859', 'apple-apple-iphone-15-plus-256-gb-895858', 'apple-apple-iphone-15-plus-512-gb-895862',
  'apple-apple-iphone-15-pro-128-gb-895855', 'apple-apple-iphone-15-pro-256-gb-895856', 'apple-apple-iphone-15-pro-512-gb-895860',
  'apple-apple-iphone-15-pro-1-tb-895857', 'apple-apple-iphone-15-pro-max-256-gb-895852', 'apple-apple-iphone-14-pro-max-128-gb-802361',
  'apple-apple-iphone-14-pro-256-gb-809144', 'apple-apple-iphone-14-pro-128-gb-802356', 'apple-apple-iphone-14-pro-512-gb-809145',
  'apple-apple-iphone-14-pro-1-tb-809146', 'apple-apple-iphone-13-128-gb-717135', 'apple-apple-iphone-13-pro-max-128-gb-716471',
  'apple-apple-iphone-13-pro-max-256-gb-717141',
  'apple-apple-iphone-13-pro-max-1-tb-717143', 'apple-apple-iphone-16e-512-gb-994887', 'apple-apple-iphone-13-pro-max-512-gb-717142',
  'apple-apple-iphone-16e-256-gb-994886', 'apple-apple-iphone-16e-128-gb-994885', 'apple-apple-iphone-13-pro-512-gb-717139',
  'apple-apple-iphone-11-64-gb-223976', 'apple-apple-iphone-se-2-2020-128-gb-548606', 'apple-apple-iphone-se-2-2020-548579',
  'apple-apple-iphone-xr-64-gb-127715', 'apple-apple-iphone-13-pro-1-tb-717140', 'apple-apple-iphone-11-pro-max-64-gb-224036',
  'apple-apple-iphone-11-pro-64-gb-224024', 'apple-apple-iphone-xs-max-512-gb-131639', 'apple-apple-iphone-xs-512-gb-131614',
  'apple-apple-iphone-xs-max-256-gb-131638', 'apple-apple-iphone-11-256-gb-335126', 'apple-apple-iphone-se-3-2022-256-gb-758822',
  'apple-apple-iphone-xs-256-gb-131610', 'apple-apple-iphone-se-3-2022-128-gb-758817', 'apple-apple-iphone-x-256-gb-92486',
  'apple-apple-iphone-xs-max-64-gb-127714', 'apple-apple-iphone-se-3-2022-758749', 'apple-apple-iphone-xs-64-gb-126668',
  'apple-apple-iphone-se-2-2020-256-gb-548607', 'apple-apple-iphone-xr-256-gb-138630', 'apple-apple-iphone-se-128-gb-76038'
];

let goldenRegressions = 0;
for (const gid of new Set(GOLDEN_IDS)) {
  const p = canonicalProducts.find(x => x.id === gid);
  if (!p) {
    goldenRegressions++;
    recordIssue({
      productId: gid,
      category: 'smartphones',
      brand: 'Apple/Samsung',
      model: gid,
      field: 'rootId',
      currentValue: null,
      issueType: 'GOLDEN_DATASET_MISSING',
      severity: 'CRITICAL',
      evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
      recommendedAction: 'Restore missing Golden root'
    });
  }
}

// 2. PREVIOUS REPAIR AUDIT
// iPhone 17 Pro 5G check
const p17pro = canonicalProducts.filter(p => p.id.startsWith('apple-apple-iphone-17-pro-') && !p.id.includes('max'));
for (const p of p17pro) {
  const has5G = p.specs?.connectivity?.has5G ?? p.specs?.has5G;
  if (has5G === false) {
    recordIssue({
      productId: p.id,
      category: 'smartphones',
      brand: 'Apple',
      model: p.name,
      field: 'specs.connectivity.has5G',
      currentValue: false,
      issueType: 'WRONG_CONNECTIVITY_5G',
      severity: 'HIGH',
      evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
      recommendedAction: 'Correct has5G to true (A19 Pro modem has native 5G)'
    });
  }
}

// 3. EMPTY & POPULATED SPECS PER CATEGORY
const specStats = {};
for (const [cat, list] of Object.entries(categoryProducts)) {
  const filtered = list.filter(p => !KNOWN_EXCLUSIONS.has(p.id));
  let empty = 0;
  let partial = 0;
  let well = 0;

  for (const p of filtered) {
    const s = p.specs;
    if (!s || typeof s !== 'object' || Object.keys(s).length === 0) {
      empty++;
      recordIssue({
        productId: p.id,
        category: cat,
        brand: p.brand || 'Unknown',
        model: p.name || p.id,
        field: 'specs',
        currentValue: '{}',
        issueType: 'EMPTY_SPECS',
        severity: 'MEDIUM',
        evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
        recommendedAction: 'Populate verified specs from manufacturer datasheet'
      });
    } else {
      const keys = Object.keys(s);
      if (keys.length <= 3) {
        partial++;
      } else {
        well++;
      }
    }
  }

  specStats[cat] = {
    total: filtered.length,
    empty,
    partial,
    well
  };
}

console.log('\n=== SPEC STATS PER CATEGORY ===');
console.table(specStats);

// 4. SUSPICIOUS / IMPOSSIBLE VALUES
for (const p of canonicalProducts) {
  const s = p.specs || {};

  // Check display size
  const screenSize = p.screenSize || s.screen?.size || s.screenSize || s.display;
  if (screenSize !== undefined) {
    const numSize = parseFloat(String(screenSize));
    if (!isNaN(numSize) && numSize <= 0) {
      recordIssue({
        productId: p.id,
        category: p.category,
        brand: p.brand,
        model: p.name,
        field: 'screen.size',
        currentValue: screenSize,
        issueType: 'IMPOSSIBLE_VALUE_SCREEN_SIZE',
        severity: 'HIGH',
        evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
        recommendedAction: 'Correct screen size to positive number'
      });
    }
  }

  // Check battery capacity
  const battery = s.battery?.capacitymAh || s.batteryCapacity || s.battery;
  if (battery !== undefined) {
    const numBat = parseFloat(String(battery));
    if (!isNaN(numBat) && numBat <= 0) {
      recordIssue({
        productId: p.id,
        category: p.category,
        brand: p.brand,
        model: p.name,
        field: 'battery.capacity',
        currentValue: battery,
        issueType: 'IMPOSSIBLE_VALUE_BATTERY',
        severity: 'HIGH',
        evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
        recommendedAction: 'Correct battery capacity'
      });
    }
  }

  // Check release year
  const year = p.releaseYear || s.releaseYear;
  if (year !== undefined) {
    const numYear = parseInt(String(year), 10);
    if (numYear > 2026) {
      recordIssue({
        productId: p.id,
        category: p.category,
        brand: p.brand,
        model: p.name,
        field: 'releaseYear',
        currentValue: year,
        issueType: 'FUTURE_RELEASE_YEAR_QUARANTINE',
        severity: 'HIGH',
        evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
        recommendedAction: 'Quarantine or verify launch date'
      });
    }
  }

  // Check storage 0
  const storage = s.memory?.storageGb || s.storageGb || s.storage;
  if (storage !== undefined) {
    const numStorage = parseInt(String(storage), 10);
    if (numStorage === 0) {
      recordIssue({
        productId: p.id,
        category: p.category,
        brand: p.brand,
        model: p.name,
        field: 'memory.storageGb',
        currentValue: storage,
        issueType: 'IMPOSSIBLE_STORAGE_ZERO',
        severity: 'HIGH',
        evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
        recommendedAction: 'Correct storage capacity'
      });
    }
  }

  // Check negative basePrice
  if (typeof p.basePrice === 'number' && p.basePrice < 0) {
    recordIssue({
      productId: p.id,
      category: p.category,
      brand: p.brand,
      model: p.name,
      field: 'basePrice',
      currentValue: p.basePrice,
      issueType: 'NEGATIVE_PRICE',
      severity: 'CRITICAL',
      evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
      recommendedAction: 'Correct price to non-negative value'
    });
  }
}

// 5. DUPLICATES IN CANONICAL
const seenIdentities = new Map();
let exactDuplicates = 0;
let probableDuplicates = 0;

for (const p of canonicalProducts) {
  // Normalize brand and name with + preserved for identity significance
  const normName = (p.name || '')
    .toLowerCase()
    .replace(/[ğg]/g, 'g')
    .replace(/[üü]/g, 'u')
    .replace(/[şs]/g, 's')
    .replace(/[ıi]/g, 'i')
    .replace(/[öo]/g, 'o')
    .replace(/[çc]/g, 'c')
    .replace(/[^a-z0-9+]/g, ' ')
    .replace(/\s*\+\s*/g, '+ ')
    .replace(/\s+/g, ' ')
    .trim();
  const key = `${(p.brand || '').toLowerCase()}|${normName}|${p.category}`;

  if (seenIdentities.has(key)) {
    const prior = seenIdentities.get(key);
    exactDuplicates++;
    recordIssue({
      productId: p.id,
      category: p.category,
      brand: p.brand,
      model: p.name,
      field: 'identity',
      currentValue: p.id,
      issueType: 'DUPLICATE_IDENTITY_EXACT',
      severity: 'HIGH',
      evidenceStatus: 'CONFIRMED_FROM_INTERNAL_CONTRADICTION',
      recommendedAction: `Consolidate with root ${prior.id}`
    });
  } else {
    seenIdentities.set(key, p);
  }
}

console.log('\n=== AUDIT SUMMARY ===');
console.log('Total Issues Found:', issues.length);
const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
issues.forEach(i => { severityCounts[i.severity]++; });
console.log('Severity Breakdown:', severityCounts);
console.log('Golden Regressions:', goldenRegressions);
console.log('Exact Duplicates in Canonical:', exactDuplicates);

// Write audit summary json for report construction
fs.writeFileSync('scratch/day2_audit_raw.json', JSON.stringify({
  rawCount: allRawProducts.length,
  canonicalCount: canonicalProducts.length,
  goldenCount: 83,
  goldenRegressions,
  specStats,
  severityCounts,
  exactDuplicates,
  issues
}, null, 2));

console.log('Saved raw audit to scratch/day2_audit_raw.json');
