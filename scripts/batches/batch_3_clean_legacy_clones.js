const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '../../src/lib/smartphonesData.json');
const BACKUP_PATH = path.join(__dirname, `../../src/lib/smartphonesData.json.bak.${Date.now()}`);

console.log('=== ACELEETME SAFE EXECUTION POLICY: BATCH 3 (CLEAN DIRTY LEGACY CLONES) ===');
console.log('MAX ROOT MUTATION: 10 (Target: 7 roots)');

// 1. Load data
const rawData = fs.readFileSync(CATALOG_PATH, 'utf8');
const products = JSON.parse(rawData);

// 2. Pre-mutation Price Fingerprint
const beforePriceFingerprint = products.map(p => ({
  id: p.id,
  basePrice: p.basePrice,
  price: p.price,
  offersCount: p.storeOffers?.length || 0
}));

// Create Backup
fs.writeFileSync(BACKUP_PATH, rawData, 'utf8');
console.log(`[SAFEGUARD] Backup created at: ${BACKUP_PATH}`);

// Whitelisted Root IDs
const WHITELIST_IDS = [
  'apple-apple-iphone-4-16-gb-138',
  'apple-apple-iphone-4-32-gb-139',
  'apple-apple-iphone-4-8-gb-93',
  'apple-apple-iphone-6s-plus-16-gb-26038',
  'apple-apple-iphone-6s-plus-32-gb-63222',
  'apple-apple-iphone-6s-plus-64-gb-31581',
  'apple-apple-iphone-6s-plus-128-gb-31582'
];

const beforeStates = {};
const afterStates = {};
let mutationCount = 0;

for (const p of products) {
  if (!WHITELIST_IDS.includes(p.id)) continue;

  beforeStates[p.id] = {
    name: p.name,
    wifiStandard: p.specs?.connectivity?.wifiStandard,
    bluetooth: p.specs?.connectivity?.bluetooth,
    thicknessMm: p.specs?.build?.thicknessMm,
    weightGrams: p.specs?.build?.weightGrams,
    basePrice: p.basePrice
  };

  // iPhone 4 family (8GB, 16GB, 32GB)
  if (p.id.includes('iphone-4-')) {
    if (!p.specs) p.specs = {};
    if (!p.specs.connectivity) p.specs.connectivity = {};
    if (!p.specs.build) p.specs.build = {};

    p.specs.connectivity.wifiStandard = 'Wi-Fi 4 (802.11b/g/n)';
    p.specs.connectivity.bluetooth = '2.1 + EDR';
    p.specs.build.thicknessMm = 9.3;
    p.specs.build.weightGrams = 137;
    mutationCount++;
  }

  // iPhone 6s Plus family (16GB, 32GB, 64GB, 128GB)
  if (p.id.includes('iphone-6s-plus-')) {
    if (!p.specs) p.specs = {};
    if (!p.specs.connectivity) p.specs.connectivity = {};
    if (!p.specs.build) p.specs.build = {};

    p.specs.connectivity.wifiStandard = 'Wi-Fi 5 (802.11ac) MIMO';
    p.specs.connectivity.bluetooth = '4.2';
    p.specs.build.thicknessMm = 7.3;
    p.specs.build.weightGrams = 192;
    mutationCount++;
  }

  afterStates[p.id] = {
    name: p.name,
    wifiStandard: p.specs?.connectivity?.wifiStandard,
    bluetooth: p.specs?.connectivity?.bluetooth,
    thicknessMm: p.specs?.build?.thicknessMm,
    weightGrams: p.specs?.build?.weightGrams,
    basePrice: p.basePrice
  };
}

// 3. Post-mutation Price Verification (Price Firewall)
let priceMutations = 0;
for (let i = 0; i < products.length; i++) {
  const p = products[i];
  const b = beforePriceFingerprint[i];
  if (p.id !== b.id || p.basePrice !== b.basePrice || p.price !== b.price || (p.storeOffers?.length || 0) !== b.offersCount) {
    priceMutations++;
  }
}

if (priceMutations > 0) {
  console.error(`[FATAL PRICE FIREWALL VIOLATION] ${priceMutations} price mutations detected! Rolling back!`);
  fs.writeFileSync(CATALOG_PATH, rawData, 'utf8');
  process.exit(1);
}

if (mutationCount !== 7) {
  console.error(`[UNEXPECTED MUTATION COUNT] Expected 7, got ${mutationCount}. Rolling back!`);
  fs.writeFileSync(CATALOG_PATH, rawData, 'utf8');
  process.exit(1);
}

// Write mutated data
fs.writeFileSync(CATALOG_PATH, JSON.stringify(products, null, 2), 'utf8');
console.log(`[SUCCESS] Exactly 7 roots mutated safely.`);
console.log(`[PRICE FIREWALL] Price Mutation Count: 0.`);

console.log('\n=== BEFORE / AFTER DIFF ===');
for (const id of WHITELIST_IDS) {
  console.log(`Product: ${beforeStates[id].name}`);
  console.log(`  wifiStandard: "${beforeStates[id].wifiStandard}" -> "${afterStates[id].wifiStandard}"`);
  console.log(`  bluetooth:    "${beforeStates[id].bluetooth}" -> "${afterStates[id].bluetooth}"`);
  console.log(`  thicknessMm:  ${beforeStates[id].thicknessMm} -> ${afterStates[id].thicknessMm}`);
  console.log(`  weightGrams:  ${beforeStates[id].weightGrams} -> ${afterStates[id].weightGrams}`);
  console.log(`  basePrice:    ${afterStates[id].basePrice} (UNCHANGED)`);
}
