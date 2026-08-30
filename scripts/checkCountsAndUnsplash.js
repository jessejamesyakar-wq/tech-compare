const fs = require('fs');
const path = require('path');

const smartphones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

function loadMock(file) {
  const content = fs.readFileSync(path.join(__dirname, '../src/lib', file), 'utf8');
  const first = content.indexOf('[');
  const last = content.lastIndexOf(']');
  if (first !== -1 && last !== -1) {
    try {
      return JSON.parse(content.slice(first, last + 1));
    } catch(e) {
      return [];
    }
  }
  return [];
}

const mockFiles = [
  'mockTVs.ts',
  'mockLaptops.ts',
  'mockTablets.ts',
  'mockSmartwatches.ts',
  'mockHeadphones.ts',
  'mockConsoles.ts',
  'mockAppliances.ts',
  'mockMonitors.ts'
];

console.log('=== REAL PRODUCT COUNTS IN CATALOG ===');
console.log('Smartphones (smartphonesData.json):', smartphones.length);

const allProducts = [...smartphones];

mockFiles.forEach(f => {
  const items = loadMock(f);
  console.log(`${f}: ${items.length} products`);
  allProducts.push(...items);
});

console.log('Total catalog products:', allProducts.length);

console.log('\n=== CHECKING UNSPLASH IMAGES IN PRODUCTS ===');
const unsplashInProducts = [];
allProducts.forEach(p => {
  if (p.image && p.image.includes('unsplash.com')) {
    unsplashInProducts.push({ name: p.name, id: p.id, image: p.image, category: p.category });
  }
  if (p.images) {
    p.images.forEach(img => {
      if (img.includes('unsplash.com')) {
        unsplashInProducts.push({ name: p.name, id: p.id, image: img, category: p.category });
      }
    });
  }
});

console.log('Products using Unsplash images:', unsplashInProducts.length);
unsplashInProducts.forEach(u => console.log('  ', u.name, '->', u.image));

console.log('\n=== CHECKING JBL TUNE 520BT ===');
const jbl = allProducts.filter(p => p.name && p.name.toLowerCase().includes('jbl tune 520bt'));
console.log('Found JBL matches:', jbl.length);
jbl.forEach(p => console.log('  ', p.name, '| Image:', p.image));
