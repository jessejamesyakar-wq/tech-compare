const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const samsung = phones.filter(p => p.brand.toLowerCase() === 'samsung');

console.log('=== SAMSUNG SMARTPHONES IMAGE AUDIT ===');
console.log(`Total Samsung Phones: ${samsung.length}`);

const svgPhones = samsung.filter(p => p.image.endsWith('.svg'));
console.log(`\nPhones using SVG vector illustrations (${svgPhones.length}):`);
svgPhones.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] "${p.name}" -> ${p.image}`);
});

const scrapedJpgPhones = samsung.filter(p => p.image.includes('/images/products/smartphones/'));
console.log(`\nPhones using exact scraped photos in /images/products/smartphones/ (${scrapedJpgPhones.length}):`);

const otherPhones = samsung.filter(p => !p.image.endsWith('.svg') && !p.image.includes('/images/products/smartphones/'));
console.log(`\nOther Samsung photos in /images/phones/samsung/ (${otherPhones.length}):`);
otherPhones.forEach(p => console.log(`- [${p.id}] "${p.name}" -> ${p.image}`));
