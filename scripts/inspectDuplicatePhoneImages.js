const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));

console.log('Total phones:', phones.length);

const imageMap = new Map();
phones.forEach(p => {
  const img = p.image || '';
  if (!imageMap.has(img)) imageMap.set(img, []);
  imageMap.get(img).push(p);
});

console.log('\n--- SHARED PHONE IMAGES ---');
imageMap.forEach((list, img) => {
  if (list.length > 1) {
    console.log(`\n📸 [${list.length} phones share]: ${img}`);
    list.forEach(p => console.log(`   - ${p.brand} ${p.name} (ID: ${p.id})`));
  }
});
