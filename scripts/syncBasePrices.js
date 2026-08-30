const fs = require('fs');
const path = require('path');

// 1. Sync smartphonesData.json
const smartphonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const smartphones = JSON.parse(fs.readFileSync(smartphonesPath, 'utf8'));

let updatedPhonesCount = 0;
smartphones.forEach(p => {
  if (p.storeOffers && p.storeOffers.length > 0) {
    const valid = p.storeOffers.map(o => o.price).filter(pr => pr > 0);
    if (valid.length > 0) {
      const minStore = Math.min(...valid);
      if (p.basePrice !== minStore) {
        p.basePrice = minStore;
        updatedPhonesCount++;
      }
    }
  }
});

fs.writeFileSync(smartphonesPath, JSON.stringify(smartphones, null, 2), 'utf8');
console.log(`Synchronized smartphonesData.json: ${updatedPhonesCount} products updated to exact minStore price.`);

// 2. Function to sync TS mock files
const mockFiles = [
  'mockData.ts',
  'mockTVs.ts',
  'mockLaptops.ts',
  'mockTablets.ts',
  'mockSmartwatches.ts',
  'mockHeadphones.ts',
  'mockAppliances.ts',
  'mockMonitors.ts',
  'mockConsoles.ts'
];

mockFiles.forEach(f => {
  const filePath = path.join(__dirname, '../src/lib', f);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');
  // Check if it has export const mock... = [ ... ];
  const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    try {
      const arrayCode = match[2];
      const parsed = JSON.parse(arrayCode);
      let count = 0;
      parsed.forEach(p => {
        if (p.storeOffers && p.storeOffers.length > 0) {
          const valid = p.storeOffers.map(o => o.price).filter(pr => pr > 0);
          if (valid.length > 0) {
            const minStore = Math.min(...valid);
            if (p.basePrice !== minStore) {
              p.basePrice = minStore;
              count++;
            }
          }
        }
      });
      if (count > 0) {
        const newArrayCode = JSON.stringify(parsed, null, 2);
        content = content.replace(match[2], newArrayCode);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Synchronized ${f}: ${count} products updated.`);
      } else {
        console.log(`${f}: already in sync.`);
      }
    } catch(e) {
      console.log(`Could not JSON.parse ${f} directly (contains TS expressions or formatting)`);
    }
  }
});
