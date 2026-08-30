const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const samsung = phones.filter(p => p.brand.toLowerCase() === 'samsung');

console.log('=== FULL SAMSUNG CATALOG INSPECTION ===');
samsung.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] ${p.name}`);
  console.log(`   Slug: ${p.slug} | Image: ${p.image}`);
});
