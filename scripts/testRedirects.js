const fs = require('fs');
const path = require('path');

const redirects = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/redirects.json'), 'utf8'));

console.log('=== VERIFYING 301 REDIRECT DESTINATIONS ===\n');

// Load datasets to verify destinations exist
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

const allSlugs = new Set();
datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  if (!fs.existsSync(filePath)) return;
  let products = [];
  if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  else {
    const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }
  products.forEach(p => {
    allSlugs.add(`/${d.name}/${p.slug}`);
    allSlugs.add(`/phones/${p.slug}`);
  });
});

let failed = 0;
redirects.forEach(r => {
  const destExists = allSlugs.has(r.destination);
  if (destExists) {
    console.log(`✅ [301 OK] "${r.source}"  -->  "${r.destination}" (Valid destination)`);
  } else {
    console.error(`❌ [301 BROKEN] "${r.source}"  -->  "${r.destination}" (Destination does NOT exist in catalog!)`);
    failed++;
  }
});

console.log('\n========================================');
console.log(`Total Redirects Checked: ${redirects.length}`);
if (failed === 0) {
  console.log('✅ ALL 301 redirects successfully point to valid live catalog products!');
} else {
  console.error(`❌ Found ${failed} broken redirect targets!`);
  process.exit(1);
}
