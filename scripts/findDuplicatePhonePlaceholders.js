const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

console.log('Total phones in catalog:', phones.length);

const placeholderHash = 'aa5f7446f46b66ed2c2afdee4fde4c88'; // the dark blue generic S wallpaper

let duplicateCount = 0;
const duplicatePhones = [];

phones.forEach(p => {
  const relPath = (p.image || '').replace(/^\//, '');
  const fullPath = path.join(__dirname, '..', relPath);

  if (fs.existsSync(fullPath)) {
    const hash = crypto.createHash('md5').update(fs.readFileSync(fullPath)).digest('hex');
    if (hash === placeholderHash) {
      duplicateCount++;
      duplicatePhones.push(p);
    }
  }
});

console.log(`\n🚨 Toplam ${duplicateCount} adet telefonda bu aynı mavi placeholder görseli kullanılıyor!`);
console.log('Örnekler:');
duplicatePhones.slice(0, 20).forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.brand}] ${p.name} (ID: ${p.id})`);
});
