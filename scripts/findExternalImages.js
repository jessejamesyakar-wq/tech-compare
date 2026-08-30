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

function extractProducts(item) {
  const filePath = path.join(__dirname, '../src/lib', item.file);
  if (!fs.existsSync(filePath)) return [];
  if (item.type === 'json') {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    try {
      return JSON.parse(match[2]);
    } catch(e) {
      console.log('JSON parse failed for', item.file);
      return [];
    }
  }
  return [];
}

console.log('=== SCANNING FOR EXTERNAL HOTLINKED IMAGES ===');
const externalMap = {};

datasets.forEach(d => {
  const products = extractProducts(d);
  const externalList = [];
  products.forEach(p => {
    const urls = [];
    if (p.image && (p.image.startsWith('http://') || p.image.startsWith('https://'))) {
      urls.push(p.image);
    }
    if (Array.isArray(p.images)) {
      p.images.forEach(img => {
        if (img && (img.startsWith('http://') || img.startsWith('https://'))) {
          urls.push(img);
        }
      });
    }
    if (urls.length > 0) {
      externalList.push({ id: p.id, slug: p.slug, name: p.name, urls });
    }
  });
  externalMap[d.name] = externalList;
  console.log(`${d.name} (${d.file}): ${externalList.length} products with external image URLs`);
});

console.log('\n--- Details of external image URLs ---');
Object.keys(externalMap).forEach(cat => {
  if (externalMap[cat].length > 0) {
    console.log(`\nCategory: ${cat} (${externalMap[cat].length} products)`);
    externalMap[cat].forEach(p => {
      console.log(`  - [${p.id}] ${p.name}:`);
      p.urls.forEach(u => console.log(`      ${u}`));
    });
  }
});
