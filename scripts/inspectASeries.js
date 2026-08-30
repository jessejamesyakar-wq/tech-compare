const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const aSeries = phones.filter(p => p.brand.toLowerCase() === 'samsung' && p.name.includes('Galaxy A'));

console.log(`Total Galaxy A Series Phones: ${aSeries.length}\n`);
aSeries.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] "${p.name}"`);
  console.log(`   Image: ${p.image}`);
});
