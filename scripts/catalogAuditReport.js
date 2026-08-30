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

console.log('=== COMPREHENSIVE CATALOG IMAGE AUDIT REPORT ===\n');

const publicDir = path.join(__dirname, '../public');
const sharedImages = new Map();
const missingImages = [];
const productsWithoutVariants = [];
let totalProducts = 0;

datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  if (!fs.existsSync(filePath)) return;

  let products = [];
  if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  else {
    const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }

  totalProducts += products.length;

  products.forEach(p => {
    // Check missing file on disk
    if (p.image) {
      const diskPath = path.join(publicDir, p.image.startsWith('/') ? p.image.slice(1) : p.image);
      if (!fs.existsSync(diskPath)) {
        missingImages.push({ cat: d.name, id: p.id, name: p.name, image: p.image });
      }

      // Check shared images
      const list = sharedImages.get(p.image) || [];
      list.push({ cat: d.name, id: p.id, name: p.name });
      sharedImages.set(p.image, list);
    } else {
      missingImages.push({ cat: d.name, id: p.id, name: p.name, image: 'NONE' });
    }

    // Check color variants
    if (!p.variants || p.variants.length === 0) {
      if (p.colorOptions && p.colorOptions.length > 0) {
        productsWithoutVariants.push({ cat: d.name, id: p.id, name: p.name, colorOptionsCount: p.colorOptions.length });
      }
    }
  });
});

console.log(`📦 Total Products Analyzed: ${totalProducts}`);
console.log(`🔴 Missing/Broken Image Files on Disk: ${missingImages.length}`);
console.log(`🎨 Products with colorOptions needing Variant Conversion: ${productsWithoutVariants.length}`);

console.log('\n--- SHARED / COLLIDING IMAGES SUMMARY ---');
const heavyShared = [...sharedImages.entries()].filter(([img, list]) => list.length > 3).sort((a, b) => b[1].length - a[1].length);
console.log(`Found ${heavyShared.length} images shared by >3 different products:`);
heavyShared.forEach(([img, list]) => {
  console.log(`\n📷 "${img}" (Used by ${list.length} products):`);
  console.log(`   Sample products:`);
  list.slice(0, 5).forEach(p => console.log(`     - [${p.cat}] ${p.name} (ID: ${p.id})`));
  if (list.length > 5) console.log(`     ... and ${list.length - 5} more products`);
});
