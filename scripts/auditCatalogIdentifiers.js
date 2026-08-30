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

console.log('=== CATALOG IDENTIFIERS (GTIN / EAN / PART CODE) AUDIT ===\n');

let total = 0;
let hasGtinCount = 0;
let hasModelCodeCount = 0;
let extractableFromTitleCount = 0;
let fallbackManualCount = 0;

const categoryStats = {};
const sampleExtractable = [];
const sampleFallbacks = [];

datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  if (!fs.existsSync(filePath)) return;

  let products = [];
  if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  else {
    const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }

  const stat = { total: products.length, withGtin: 0, withModelCode: 0, extractable: 0, fallback: 0 };

  products.forEach(p => {
    total++;
    stat.total++;

    const hasGtin = !!(p.gtin || p.ean || p.barcode);
    const hasModel = !!(p.model || p.sku);

    // Heuristic regex to extract manufacturer part code (e.g. MGE94TU/A, OLED65C44LA, GC4860/22, SM-S928B, U3824DW, etc.)
    const codeMatch = p.name.match(/\b([A-Z0-9]{3,8}(?:\/[A-Z0-9]+|-[A-Z0-9]+|\.[A-Z0-9]+)?)\b/);
    const hasExtractable = !hasGtin && !hasModel && !!codeMatch && codeMatch[1].length >= 4;

    if (hasGtin) {
      hasGtinCount++;
      stat.withGtin++;
    } else if (hasModel) {
      hasModelCodeCount++;
      stat.withModelCode++;
    } else if (hasExtractable) {
      extractableFromTitleCount++;
      stat.extractable++;
      if (sampleExtractable.length < 5) {
        sampleExtractable.push({ cat: d.name, name: p.name, brand: p.brand, extractedCode: codeMatch[1] });
      }
    } else {
      fallbackManualCount++;
      stat.fallback++;
      if (sampleFallbacks.length < 5) {
        sampleFallbacks.push({ cat: d.name, name: p.name, brand: p.brand });
      }
    }
  });

  categoryStats[d.name] = stat;
});

console.log('Category Breakdown:');
Object.entries(categoryStats).forEach(([cat, s]) => {
  const ready = s.withGtin + s.withModelCode + s.extractable;
  const readyPct = ((ready / s.total) * 100).toFixed(1);
  console.log(`  - ${cat.padEnd(14)}: ${s.total} items | Direct/Extractable Key: ${ready} (%${readyPct}) | Manual Fallback: ${s.fallback}`);
});

console.log('\n========================================');
console.log(`Total Products Analyzed: ${total}`);
console.log(`Direct GTIN/EAN: ${hasGtinCount}`);
console.log(`Direct Model/SKU: ${hasModelCodeCount}`);
console.log(`Extractable Manufacturer Part Code: ${extractableFromTitleCount}`);
console.log(`TOTAL ICECAT-READY PRODUCTS: ${hasGtinCount + hasModelCodeCount + extractableFromTitleCount} (%${(((hasGtinCount + hasModelCodeCount + extractableFromTitleCount) / total) * 100).toFixed(1)})`);
console.log(`MANUAL FALLBACK REQUIRED: ${fallbackManualCount} (%${((fallbackManualCount / total) * 100).toFixed(1)})`);
