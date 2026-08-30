const fs = require('fs');
const path = require('path');

const smartphones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

console.log('=== CHECKING PLUS / + IN SMARTPHONES ===');
const plusProducts = smartphones.filter(p => p.name.includes('+') || p.name.toLowerCase().includes('plus'));

console.log('Total products with + or Plus in name:', plusProducts.length);
plusProducts.forEach(p => {
  console.log('ID: ' + p.id + ' | Slug: ' + p.slug + ' | Name: ' + p.name);
});

// Check if multiple products share the same slug!
const slugMap = {};
smartphones.forEach(p => {
  slugMap[p.slug] = slugMap[p.slug] || [];
  slugMap[p.slug].push(p);
});

const duplicateSlugs = Object.entries(slugMap).filter(([slug, list]) => list.length > 1);
console.log('\n=== DUPLICATE SLUGS DETECTED IN SMARTPHONES === ' + duplicateSlugs.length);
duplicateSlugs.forEach(([slug, list]) => {
  console.log(`\nSlug: "${slug}" (${list.length} products):`);
  list.forEach(p => console.log(`   - ID: ${p.id} | Name: ${p.name} | Image: ${p.image}`));
});
