const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Compare previous commit eae1add or 2610f1b with current
const oldJsonStr = execSync('git show 2610f1b:src/lib/smartphonesData.json', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
const oldPhones = JSON.parse(oldJsonStr);
const currPhones = JSON.parse(fs.readFileSync('./src/lib/smartphonesData.json', 'utf8'));

console.log('Old phones count:', oldPhones.length);
console.log('Current phones count:', currPhones.length);

const redirects = [];
const seenSources = new Set();

// Check phones
currPhones.forEach(curr => {
  const old = oldPhones.find(o => o.id === curr.id);
  if (old && old.slug !== curr.slug) {
    if (!seenSources.has(`/phones/${old.slug}`)) {
      seenSources.add(`/phones/${old.slug}`);
      redirects.push({
        category: 'smartphones',
        id: curr.id,
        name: curr.name,
        source: `/phones/${old.slug}`,
        destination: `/phones/${curr.slug}`,
        permanent: true
      });
    }
  }
});

// Also check if any older known legacy slugs existed
const legacyAliases = [
  // Plus models that previously collided with base model
  { source: '/phones/samsung-galaxy-s9-plus-old', destination: '/phones/samsung-galaxy-s9-plus' },
  // Headphones
  { source: '/headphones/samsung-samsung-galaxy-buds', destination: '/headphones/samsung-galaxy-buds-plus' },
  // Appliances
  { source: '/appliances/xiaomi-robot-vacuum-x20-plus-mop', destination: '/appliances/xiaomi-robot-vacuum-x20-plus-pro-mop' }
];

console.log(`\n=== FOUND ${redirects.length} CHANGED PHONE SLUGS ===`);
redirects.forEach(r => {
  console.log(`- ${r.name}: ${r.source} -> ${r.destination}`);
});

// Save all 301 redirects to data/redirects.json
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'redirects.json'), JSON.stringify(redirects, null, 2), 'utf8');
console.log(`Saved redirects to data/redirects.json`);
