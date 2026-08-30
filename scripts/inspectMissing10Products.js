const { execSync } = require('child_process');
const fs = require('fs');

console.log('=== CHECKING GIT COMMIT HISTORY FOR SMARTPHONEDATA.JSON ===');
const logs = execSync('git log -n 5 --oneline', { encoding: 'utf8' });
console.log(logs);

const oldJsonStr = execSync('git show 976309d~1:src/lib/smartphonesData.json', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const oldPhones = JSON.parse(oldJsonStr);
const currPhones = JSON.parse(fs.readFileSync('./src/lib/smartphonesData.json', 'utf8'));

console.log('Old phones count (commit eae1add):', oldPhones.length);
console.log('Current phones count:', currPhones.length);

const currIdSet = new Set(currPhones.map(p => p.id));
const removed = oldPhones.filter(p => !currIdSet.has(p.id));

console.log(`\n=== EXACT ${removed.length} REMOVED PRODUCTS ===`);
removed.forEach((p, idx) => {
  console.log(`${idx + 1}. ID: "${p.id}" | Slug: "${p.slug}" | Name: "${p.name}" | Brand: "${p.brand}"`);
});
