const fs = require('fs');
const path = require('path');

const files = [
  'mockLaptops.ts',
  'mockTVs.ts',
  'mockTablets.ts',
  'mockHeadphones.ts',
  'mockSmartwatches.ts',
  'mockAppliances.ts',
  'mockMonitors.ts',
  'mockConsoles.ts'
];

files.forEach(f => {
  const full = path.join(__dirname, '../src/lib', f);
  if (!fs.existsSync(full)) return;
  const content = fs.readFileSync(full, 'utf8');
  const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    const list = JSON.parse(match[2]);
    const imageCounts = {};
    list.forEach(p => {
      imageCounts[p.image] = (imageCounts[p.image] || 0) + 1;
    });
    console.log(`\n=== ${f} (Total: ${list.length}) ===`);
    const sorted = Object.entries(imageCounts).sort((a,b) => b[1] - a[1]);
    console.log('Top image paths:');
    sorted.slice(0, 5).forEach(([img, count]) => {
      console.log(`  ${img}: ${count} products`);
    });
  }
});
