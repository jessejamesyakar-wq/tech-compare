const fs = require('fs');
const path = require('path');

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

datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  if (!fs.existsSync(filePath)) return;
  let products = [];
  if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  else {
    const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }

  const slugMap = {};
  products.forEach(p => {
    slugMap[p.slug] = slugMap[p.slug] || [];
    slugMap[p.slug].push(p.name);
  });

  const dupes = Object.entries(slugMap).filter(([slug, list]) => list.length > 1);
  if (dupes.length > 0) {
    console.log(`\n=== ${d.name.toUpperCase()} has ${dupes.length} duplicate slugs: ===`);
    dupes.forEach(([slug, list]) => console.log(`  - "${slug}": ${list.join(' | ')}`));
  } else {
    console.log(`${d.name.toUpperCase()}: 0 duplicate slugs.`);
  }
});
