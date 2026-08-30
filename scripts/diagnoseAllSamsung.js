const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const samsung = phones.filter(p => p.brand.toLowerCase() === 'samsung');

console.log(`=== TOTAL SAMSUNG PHONES IN CATALOG: ${samsung.length} ===\n`);

const imgUsage = {};
samsung.forEach(p => {
  imgUsage[p.image] = (imgUsage[p.image] || 0) + 1;
});

console.log('--- SHARED / DUPLICATE IMAGES IN SAMSUNG PHONES ---');
let sharedTotal = 0;
Object.entries(imgUsage).filter(([img, count]) => count > 1).forEach(([img, count]) => {
  sharedTotal++;
  const prods = samsung.filter(p => p.image === img).map(p => `${p.name} (${p.id})`);
  console.log(`⚠️ Image used ${count} times: "${img}"`);
  prods.forEach(pr => console.log(`   - ${pr}`));
});

console.log(`\nTotal shared image groups: ${sharedTotal}\n`);

console.log('--- ALL 142 SAMSUNG PHONES LIST ---');
samsung.forEach((p, i) => {
  const exists = fs.existsSync(path.join(__dirname, '../public', p.image));
  console.log(`${i + 1}. [${p.id}] "${p.name}"`);
  console.log(`   Image: ${p.image} (File exists on disk: ${exists ? 'YES' : 'NO'})`);
});
