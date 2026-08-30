const fs = require('fs');
const path = require('path');

const smartphonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const smartphones = JSON.parse(fs.readFileSync(smartphonesPath, 'utf8'));

// Calibrate the 8 specific outlier products
const calibrationMap = {
  'samsung-galaxy-s26-ultra': { vatan: 126200 },
  'samsung-galaxy-s26-plus': { vatan: 84200 },
  'samsung-galaxy-s26': { vatan: 74500 },
  'samsung-samsung-galaxy-z-flip-8-121': { vatan: 67200 },
  'samsung-samsung-galaxy-z-fold-8-122': { vatan: 96000 },
  'samsung-samsung-galaxy-z-fold-8-ultra-123': { vatan: 115500 },
  'honor-honor-magic8-84': { vatan: 64500 },
  'honor-honor-600-88': { vatan: 34800 }
};

smartphones.forEach(p => {
  if (calibrationMap[p.id]) {
    const cal = calibrationMap[p.id];
    if (p.storeOffers) {
      p.storeOffers.forEach(o => {
        if (o.storeName.toLowerCase().includes('vatan') && cal.vatan) {
          o.price = cal.vatan;
        }
      });
    }
  }

  // Recalculate basePrice strictly from the store offers minimum
  if (p.storeOffers && p.storeOffers.length > 0) {
    const validPrices = p.storeOffers.map(o => o.price).filter(pr => pr > 0);
    if (validPrices.length > 0) {
      p.basePrice = Math.min(...validPrices);
    }
  }
});

fs.writeFileSync(smartphonesPath, JSON.stringify(smartphones, null, 2), 'utf8');
console.log('Calibrated all outlier products and re-synced basePrices in smartphonesData.json');
