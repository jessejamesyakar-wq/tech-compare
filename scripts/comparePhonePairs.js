const { execSync } = require('child_process');
const oldJsonStr = execSync('git show 976309d~1:src/lib/smartphonesData.json', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const oldPhones = JSON.parse(oldJsonStr);

const pairs = [
  ['samsung-galaxy-s26-ultra', 'samsung-samsung-galaxy-s26-ultra-120'],
  ['samsung-galaxy-s26-plus', 'samsung-samsung-galaxy-s26-119'],
  ['samsung-galaxy-s26', 'samsung-samsung-galaxy-s26-118'],
  ['samsung-galaxy-s25-ultra', 'samsung-samsung-galaxy-s25-ultra-109'],
  ['samsung-galaxy-s25-plus', 'samsung-samsung-galaxy-s25-108'],
  ['samsung-galaxy-s25', 'samsung-samsung-galaxy-s25-107'],
  ['samsung-galaxy-s25-fe', 'samsung-samsung-galaxy-s25-fe-110'],
  ['samsung-galaxy-a57-5g', 'samsung-samsung-galaxy-a57-5g-126'],
  ['samsung-galaxy-a37-5g', 'samsung-samsung-galaxy-a37-5g-125'],
  ['samsung-galaxy-a17-5g', 'samsung-samsung-galaxy-a17-5g-124']
];

pairs.forEach(([id1, id2]) => {
  const p1 = oldPhones.find(p => p.id === id1);
  const p2 = oldPhones.find(p => p.id === id2);
  console.log(`\n=== PAIR: ${id1} vs ${id2} ===`);
  console.log(`P1 (${id1}): Name="${p1?.name}", Price=${p1?.basePrice}, Storage=${p1?.specs?.memory?.storageGb}GB, Offers=${p1?.storeOffers?.length}`);
  console.log(`P2 (${id2}): Name="${p2?.name}", Price=${p2?.basePrice}, Storage=${p2?.specs?.memory?.storageGb}GB, Offers=${p2?.storeOffers?.length}`);
});
