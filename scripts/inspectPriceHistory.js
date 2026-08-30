const fs = require('fs');
const path = require('path');

const files = [
  'mockTVs.ts',
  'mockLaptops.ts',
  'mockTablets.ts',
  'mockSmartwatches.ts',
  'mockHeadphones.ts',
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
    let withHistory = 0;
    let withoutHistory = 0;
    list.forEach(p => {
      if (p.priceHistory && p.priceHistory.length > 0) withHistory++;
      else withoutHistory++;
    });
    console.log(f + ': Total ' + list.length + ' | With history: ' + withHistory + ' | Without history: ' + withoutHistory);
  }
});
