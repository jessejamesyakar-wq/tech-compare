const fs = require('fs');
const path = require('path');

// Load all products by reading mock files and smartphonesData.json
const smartphones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

// Helper to load other categories from files
function loadTsArray(fileName) {
  const filePath = path.join(__dirname, '../src/lib', fileName);
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Extract JSON-like array
  const firstBracket = content.indexOf('[');
  const lastBracket = content.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1) {
    const jsonStr = content.slice(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      // If it fails, fallback to eval in sandbox or regex
      return [];
    }
  }
  return [];
}

const tvs = loadTsArray('mockTVs.ts');
const laptops = loadTsArray('mockLaptops.ts');
const tablets = loadTsArray('mockTablets.ts');
const smartwatches = loadTsArray('mockSmartwatches.ts');
const headphones = loadTsArray('mockHeadphones.ts');
const consoles = loadTsArray('mockConsoles.ts');
const appliances = loadTsArray('mockAppliances.ts');
const monitors = loadTsArray('mockMonitors.ts');

const allCatalog = [
  ...smartphones,
  ...tvs,
  ...laptops,
  ...tablets,
  ...smartwatches,
  ...headphones,
  ...consoles,
  ...appliances,
  ...monitors
];

console.log('Total catalog products loaded:', allCatalog.length);
console.log('Smartphones:', smartphones.length);
console.log('TVs:', tvs.length);
console.log('Laptops:', laptops.length);
console.log('Tablets:', tablets.length);
console.log('Smartwatches:', smartwatches.length);
console.log('Headphones:', headphones.length);
console.log('Consoles:', consoles.length);
console.log('Appliances:', appliances.length);
console.log('Monitors:', monitors.length);

// 1. Check all hardcoded IDs in components
const hardcodedIdChecks = [
  { file: 'src/lib/mockData.ts', ids: [
    'apple-iphone-17-pro-max-1tb-2',
    'samsung-galaxy-s26-ultra-1tb-2',
    'apple-iphone-17-pro-512gb-6',
    'apple-iphone-16-pro-max-512gb-2',
    'apple-iphone-17-pro-max-2tb-1',
    'apple-iphone-17-pro-1tb-4',
    'samsung-galaxy-s26-ultra-512gb-3',
    'xiaomi-16-ultra-512gb-2'
  ]},
  { file: 'src/components/promo/WeeklyPromoStrip.tsx', ids: [
    'apple-iphone-17-pro-256-gb'
  ]}
];

hardcodedIdChecks.forEach(check => {
  console.log(`\nChecking hardcoded IDs in ${check.file}:`);
  check.ids.forEach(id => {
    const match = allCatalog.find(p => p.id === id || p.slug === id);
    if (!match) {
      console.log(`  ❌ MISSING: "${id}"`);
      // Find closest matches
      const candidates = allCatalog.filter(p => p.slug.includes(id.slice(0, 15)) || p.id.includes(id.slice(0, 15)));
      if (candidates.length > 0) {
        console.log(`     💡 Suggestion: "${candidates[0].slug}" (${candidates[0].name})`);
      }
    } else {
      console.log(`  ✅ Found: "${id}" -> ${match.name}`);
    }
  });
});

// 2. Check all products in allCatalog for duplicate or missing slugs
const slugMap = new Map();
const duplicates = [];
const missing = [];

allCatalog.forEach(p => {
  if (!p.slug || typeof p.slug !== 'string' || p.slug.trim() === '') {
    missing.push(p);
  } else {
    const s = p.slug.toLowerCase();
    if (slugMap.has(s)) {
      duplicates.push({ slug: s, product1: slugMap.get(s).name, product2: p.name });
    } else {
      slugMap.set(s, p);
    }
  }
});

console.log('\nMissing slugs:', missing.length);
console.log('Duplicate slugs:', duplicates.length);
