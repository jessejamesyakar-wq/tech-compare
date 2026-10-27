const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '../../src/lib/smartphonesData.json');
const BACKUP_PATH = path.join(__dirname, `../../src/lib/smartphonesData.json.bak.${Date.now()}`);

console.log('=== ACELEETME SAFE EXECUTION POLICY: BATCH 2B (APPLE PRE-5G LEGACY CLEANUP PART 2) ===');
console.log('MAX ROOT MUTATION: 10 (Target: 6 roots)');

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
  'apple-apple-iphone-7-128-gb-61487',
  'apple-apple-iphone-7-product-red-special-edition-128-gb-75834',
  'apple-apple-iphone-xs-512-gb-131614',
  'apple-apple-iphone-xs-max-512-gb-131639',
  'apple-apple-iphone-se-2-2020-128-gb-548606',
  'apple-apple-iphone-11-128-gb-335107'
];

const beforeStates = {};
const afterStates = {};
let mutationCount = 0;

for (const p of products) {
  if (!WHITELIST_IDS.includes(p.id)) continue;

  beforeStates[p.id] = {
    name: p.name,
    has5G: p.specs?.connectivity?.has5G,
    basePrice: p.basePrice
  };

  if (p.specs && p.specs.connectivity) {
    p.specs.connectivity.has5G = false;
    mutationCount++;
  }

  afterStates[p.id] = {
    name: p.name,
    has5G: p.specs?.connectivity?.has5G,
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

if (mutationCount !== 6) {
  console.error(`[UNEXPECTED MUTATION COUNT] Expected 6, got ${mutationCount}. Rolling back!`);
  fs.writeFileSync(CATALOG_PATH, rawData, 'utf8');
  process.exit(1);
}

// Write mutated data
fs.writeFileSync(CATALOG_PATH, JSON.stringify(products, null, 2), 'utf8');
console.log(`[SUCCESS] Exactly 6 roots mutated safely.`);
console.log(`[PRICE FIREWALL] Price Mutation Count: 0.`);

console.log('\n=== BEFORE / AFTER DIFF ===');
for (const id of WHITELIST_IDS) {
  console.log(`Product: ${beforeStates[id].name}`);
  console.log(`  has5G: ${beforeStates[id].has5G} -> ${afterStates[id].has5G} (Price: ${afterStates[id].basePrice})`);
}
