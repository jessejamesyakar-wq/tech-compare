const fs = require('fs');
const path = require('path');

const files = [
  { name: 'mockData.ts', path: path.join(__dirname, '../src/lib/mockData.ts') },
  { name: 'smartphonesData.json', path: path.join(__dirname, '../src/lib/smartphonesData.json') },
  { name: 'mockTVs.ts', path: path.join(__dirname, '../src/lib/mockTVs.ts') },
  { name: 'mockLaptops.ts', path: path.join(__dirname, '../src/lib/mockLaptops.ts') },
  { name: 'mockTablets.ts', path: path.join(__dirname, '../src/lib/mockTablets.ts') },
  { name: 'mockSmartwatches.ts', path: path.join(__dirname, '../src/lib/mockSmartwatches.ts') },
  { name: 'mockHeadphones.ts', path: path.join(__dirname, '../src/lib/mockHeadphones.ts') },
  { name: 'mockAppliances.ts', path: path.join(__dirname, '../src/lib/mockAppliances.ts') },
  { name: 'mockMonitors.ts', path: path.join(__dirname, '../src/lib/mockMonitors.ts') },
  { name: 'mockConsoles.ts', path: path.join(__dirname, '../src/lib/mockConsoles.ts') }
];

console.log('=== EXACT PRODUCT COUNTS IN SOURCE FILES ===\n');

let grandTotal = 0;
const counts = {};

files.forEach(f => {
  if (!fs.existsSync(f.path)) {
    console.log(`${f.name}: NOT FOUND`);
    return;
  }
  const content = fs.readFileSync(f.path, 'utf8');
  if (f.path.endsWith('.json')) {
    const arr = JSON.parse(content);
    console.log(`📁 ${f.name.padEnd(22)} : ${arr.length} products`);
    counts[f.name] = arr.length;
    if (f.name !== 'mockData.ts') grandTotal += arr.length;
  } else {
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) {
      const arr = JSON.parse(match[2]);
      console.log(`📁 ${f.name.padEnd(22)} (${match[1]}) : ${arr.length} products`);
      counts[f.name] = arr.length;
      if (f.name !== 'mockData.ts') grandTotal += arr.length;
    } else {
      console.log(`📁 ${f.name.padEnd(22)} : Special format (needs inspection)`);
    }
  }
});

console.log('\n----------------------------------------');
console.log(`🎯 TOTAL ACTIVE PRODUCTS ACROSS 9 CATEGORY FILES : ${grandTotal}`);
console.log('----------------------------------------\n');

// Also check what mockData.ts exports
const mockDataContent = fs.readFileSync(path.join(__dirname, '../src/lib/mockData.ts'), 'utf8');
console.log('=== INSPECTING mockData.ts ===');
console.log('mockData.ts lines of code:', mockDataContent.split('\n').length);
const exportedArrays = mockDataContent.match(/export const (\w+)/g);
console.log('mockData.ts exported arrays:', exportedArrays);
