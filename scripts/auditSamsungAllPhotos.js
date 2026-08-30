const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const samsung = phones.filter(p => p.brand.toLowerCase() === 'samsung');

console.log('=== DETAILED SAMSUNG SMARTPHONE PHOTOS AUDIT ===');
console.log(`Total Samsung phones: ${samsung.length}\n`);

const imageUsage = {};
samsung.forEach(p => {
  imageUsage[p.image] = (imageUsage[p.image] || 0) + 1;
});

const shared = Object.entries(imageUsage).filter(([img, count]) => count > 1);
console.log(`Shared images count: ${shared.length}`);
shared.forEach(([img, count]) => {
  const models = samsung.filter(p => p.image === img).map(p => p.name);
  console.log(`\n⚠️ Shared Image: ${img} (${count} models)`);
  models.forEach(m => console.log(`   - ${m}`));
});

console.log('\n--- Model Series Breakdown ---');
const series = {
  'Galaxy S Series (S9 - S26)': samsung.filter(p => p.name.includes('Galaxy S')),
  'Galaxy Z Series (Fold / Flip)': samsung.filter(p => p.name.includes('Galaxy Z')),
  'Galaxy Note Series': samsung.filter(p => p.name.includes('Note')),
  'Galaxy A Series (A01 - A57)': samsung.filter(p => p.name.includes('Galaxy A')),
  'Galaxy M Series': samsung.filter(p => p.name.includes('Galaxy M')),
  'Galaxy J Series': samsung.filter(p => p.name.includes('Galaxy J'))
};

Object.entries(series).forEach(([seriesName, list]) => {
  console.log(`\n📁 ${seriesName}: ${list.length} models`);
  list.slice(0, 5).forEach(p => {
    console.log(`   • ${p.name} -> ${p.image}`);
  });
  if (list.length > 5) console.log(`   ... ve ${list.length - 5} model daha`);
});

// Check if any SVG remains
const svgRemaining = samsung.filter(p => p.image.endsWith('.svg'));
console.log(`\nRemaining SVG illustrations: ${svgRemaining.length}`);
