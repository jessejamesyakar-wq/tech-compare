const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const samsung = phones.filter(p => p.brand.toLowerCase() === 'samsung');

console.log('=== SAMSUNG PHONES STILL NOT USING /images/phones/samsung/epey/ ===');
const notEpey = samsung.filter(p => !p.image.startsWith('/images/phones/samsung/epey/'));
console.log(`Count: ${notEpey.length} / ${samsung.length}\n`);

notEpey.forEach((p, idx) => {
  console.log(`${idx + 1}. [${p.id}] "${p.name}" -> ${p.image}`);
});
