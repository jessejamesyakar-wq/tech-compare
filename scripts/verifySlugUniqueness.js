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

console.log('=== SYSTEMATIC SLUG & VARIANT INTEGRITY AUDIT ===');
let hasErrors = false;
let totalChecked = 0;

datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  if (!fs.existsSync(filePath)) return;

  let products = [];
  if (d.type === 'json') {
    products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }

  totalChecked += products.length;
  const slugMap = new Map();
  const duplicateList = [];
  const variantCollisionList = [];

  products.forEach(p => {
    // 1. Direct duplicate slugs check
    if (slugMap.has(p.slug)) {
      duplicateList.push({ slug: p.slug, p1: slugMap.get(p.slug), p2: p });
    } else {
      slugMap.set(p.slug, p);
    }

    // 2. Plus Model Variant check for phone/tablet/audio devices (e.g. S9+, S10+, S20+, Note 10+, Buds+)
    const isModelPlus = /\b(s\d+|note\s*\d+|a\d+|buds)\s*\+/i.test(p.name);
    const slugHasPlus = p.slug.toLowerCase().includes('plus') || p.slug.toLowerCase().includes('+');

    if (isModelPlus && !slugHasPlus) {
      variantCollisionList.push({ name: p.name, slug: p.slug, reason: 'Plus model must have plus in slug' });
    }
  });

  if (duplicateList.length > 0) {
    hasErrors = true;
    console.error(`❌ [${d.name.toUpperCase()}] Found ${duplicateList.length} duplicate slug collisions!`);
    duplicateList.forEach(dupe => {
      console.error(`   - Slug: "${dupe.slug}" => "${dupe.p1.name}" vs "${dupe.p2.name}"`);
    });
  } else {
    console.log(`✅ [${d.name.toUpperCase()}] 0 duplicate slugs (${products.length} products verified).`);
  }

  if (variantCollisionList.length > 0) {
    hasErrors = true;
    console.error(`❌ [${d.name.toUpperCase()}] Found ${variantCollisionList.length} variant slug collisions!`);
    variantCollisionList.forEach(v => {
      console.error(`   - "${v.name}" has slug "${v.slug}" (${v.reason})`);
    });
  }
});

console.log('\n=================================================');
console.log(`Total Products Verified: ${totalChecked}`);
if (hasErrors) {
  console.error('❌ Slug integrity check FAILED.');
  process.exit(1);
} else {
  console.log('✅ ALL categories passed 100% slug uniqueness & Plus model integrity check.');
  process.exit(0);
}
