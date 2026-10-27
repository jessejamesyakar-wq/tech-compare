const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '../../src/lib/smartphonesData.json');
const BACKUP_PATH = path.join(__dirname, `../../src/lib/smartphonesData.json.bak.${Date.now()}`);

console.log('=== ACELEETME SAFE EXECUTION POLICY: BATCH 1A (APPLE LEGACY SPECS FIX) ===');
console.log('MAX ROOT MUTATION: 10 (Target: 4 roots)');

// 1. Load data
const rawData = fs.readFileSync(CATALOG_PATH, 'utf8');
const products = JSON.parse(rawData);

// 2. Pre-mutation Price & Integrity Fingerprint
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
  'apple-apple-iphone-6s-plus-16-gb-26038',
  'apple-apple-iphone-5-16-gb-91',
  'apple-apple-iphone-5c-16-gb-90'
];

// Reference roots for cloning accurate family specs
const ip4_32 = products.find(p => p.id === 'apple-apple-iphone-4-32-gb-139');
const ip6sp_32 = products.find(p => p.id === 'apple-apple-iphone-6s-plus-32-gb-63222');

if (!ip4_32 || !ip6sp_32) {
  console.error('[FATAL] Reference products not found. Aborting!');
  process.exit(1);
}

const beforeStates = {};
const afterStates = {};
let mutationCount = 0;

for (const p of products) {
  if (!WHITELIST_IDS.includes(p.id)) continue;

  beforeStates[p.id] = {
    screen: p.specs?.screen?.size,
    camera: p.specs?.camera?.mainMp,
    has5G: p.specs?.connectivity?.has5G,
    basePrice: p.basePrice
  };

  // 1. iPhone 4 (16 GB)
  if (p.id === 'apple-apple-iphone-4-16-gb-138') {
    p.specs = JSON.parse(JSON.stringify(ip4_32.specs));
    p.specs.memory.storageGb = 16;
    p.specs.memory.storageOptions = [8, 16, 32];
    mutationCount++;
  }

  // 2. iPhone 6s Plus (16 GB)
  if (p.id === 'apple-apple-iphone-6s-plus-16-gb-26038') {
    p.specs = JSON.parse(JSON.stringify(ip6sp_32.specs));
    p.specs.memory.storageGb = 16;
    p.specs.memory.storageOptions = [16, 32, 64, 128];
    mutationCount++;
  }

  // 3. iPhone 5 (16 GB)
  if (p.id === 'apple-apple-iphone-5-16-gb-91') {
    p.specs = {
      screen: {
        size: "4.0 inç",
        type: "Retina IPS LCD",
        resolution: "1136 x 640 piksel",
        refreshRate: 60,
        ppi: 326,
        brightnessNits: 500
      },
      processor: {
        chip: "Apple A6 (32nm)",
        cores: "2 Çekirdek (1.3 GHz Swift)",
        process: "32nm",
        antutuScore: 120000
      },
      memory: {
        ramGb: 1,
        ramType: "LPDDR2",
        storageGb: 16,
        storageOptions: [16, 32, 64],
        expandableStorage: false
      },
      camera: {
        mainMp: "8 MP, f/2.4",
        selfieMp: "1.2 MP FaceTime HD",
        videoRes: "1080p@30fps",
        dxomarkScore: 72
      },
      battery: {
        capacitymAh: 1440,
        chargingWatts: 5,
        wirelessCharging: false,
        reverseWireless: false
      },
      connectivity: {
        has5G: false,
        wifiStandard: "Wi-Fi 4 (802.11a/b/g/n)",
        bluetooth: "4.0",
        hasNFC: false,
        hasesim: false
      },
      build: {
        weightGrams: 112,
        thicknessMm: 7.6,
        waterResistance: "Yok",
        frameMaterial: "Alüminyum Kasa"
      },
      software: {
        osName: "iOS 6 (iOS 10.3.4'e kadar güncellenebilir)",
        updateYears: 5
      }
    };
    mutationCount++;
  }

  // 4. iPhone 5c (16 GB)
  if (p.id === 'apple-apple-iphone-5c-16-gb-90') {
    p.specs = {
      screen: {
        size: "4.0 inç",
        type: "Retina IPS LCD",
        resolution: "1136 x 640 piksel",
        refreshRate: 60,
        ppi: 326,
        brightnessNits: 500
      },
      processor: {
        chip: "Apple A6 (32nm)",
        cores: "2 Çekirdek (1.3 GHz Swift)",
        process: "32nm",
        antutuScore: 120000
      },
      memory: {
        ramGb: 1,
        ramType: "LPDDR2",
        storageGb: 16,
        storageOptions: [16, 32],
        expandableStorage: false
      },
      camera: {
        mainMp: "8 MP, f/2.4",
        selfieMp: "1.2 MP FaceTime HD",
        videoRes: "1080p@30fps",
        dxomarkScore: 72
      },
      battery: {
        capacitymAh: 1510,
        chargingWatts: 5,
        wirelessCharging: false,
        reverseWireless: false
      },
      connectivity: {
        has5G: false,
        wifiStandard: "Wi-Fi 4 (802.11a/b/g/n)",
        bluetooth: "4.0",
        hasNFC: false,
        hasesim: false
      },
      build: {
        weightGrams: 132,
        thicknessMm: 8.97,
        waterResistance: "Yok",
        frameMaterial: "Polikarbonat Gövde & Çelik Çerçeve"
      },
      software: {
        osName: "iOS 7 (iOS 10.3.3'e kadar güncellenebilir)",
        updateYears: 4
      }
    };
    mutationCount++;
  }

  afterStates[p.id] = {
    screen: p.specs?.screen?.size,
    camera: p.specs?.camera?.mainMp,
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

if (mutationCount !== 4) {
  console.error(`[UNEXPECTED MUTATION COUNT] Expected 4, got ${mutationCount}. Rolling back!`);
  fs.writeFileSync(CATALOG_PATH, rawData, 'utf8');
  process.exit(1);
}

// Write mutated data
fs.writeFileSync(CATALOG_PATH, JSON.stringify(products, null, 2), 'utf8');
console.log(`[SUCCESS] Exactly 4 roots mutated safely.`);
console.log(`[PRICE FIREWALL] Price Mutation Count: 0.`);

console.log('\n=== BEFORE / AFTER DIFF ===');
for (const id of WHITELIST_IDS) {
  console.log(`\nProduct ID: ${id}`);
  console.log('  BEFORE:', beforeStates[id]);
  console.log('  AFTER: ', afterStates[id]);
}
