const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

console.log('=== APPLYING APPROVED EPEY STUDIO PHOTOS TO SAMSUNG PHONES ===\n');

const updates = [
  { id: 'samsung-samsung-galaxy-s24-ultra-95', image: '/images/phones/samsung/epey/samsung-galaxy-s24-ultra.png' },
  { id: 'samsung-samsung-galaxy-s24-94', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-s24-94.png' },
  { id: 'samsung-samsung-galaxy-s24-93', image: '/images/phones/samsung/epey/samsung-galaxy-s24.png' },
  { id: 'samsung-samsung-galaxy-s23-ultra-82', image: '/images/phones/samsung/epey/samsung-galaxy-s23-ultra.png' },
  { id: 'samsung-samsung-galaxy-s22-ultra-68', image: '/images/phones/samsung/epey/samsung-galaxy-s22-ultra.png' },
  { id: 'samsung-samsung-galaxy-z-fold-6-98', image: '/images/phones/samsung/epey/samsung-galaxy-z-fold6.png' },
  { id: 'samsung-samsung-galaxy-s25-ultra-109', image: '/images/phones/samsung/epey/samsung-galaxy-s25-ultra.png' },
  { id: 'samsung-galaxy-s25-ultra', image: '/images/phones/samsung/epey/samsung-galaxy-s25-ultra.png' },
  { id: 'samsung-samsung-galaxy-s25-107', image: '/images/phones/samsung/epey/samsung-galaxy-s25.png' },
  { id: 'samsung-galaxy-s25', image: '/images/phones/samsung/epey/samsung-galaxy-s25.png' },
  { id: 'samsung-samsung-galaxy-s26-ultra-120', image: '/images/phones/samsung/epey/samsung-galaxy-s26-ultra.png' },
  { id: 'samsung-galaxy-s26-ultra', image: '/images/phones/samsung/epey/samsung-galaxy-s26-ultra.png' },
  { id: 'samsung-samsung-galaxy-s26-118', image: '/images/phones/samsung/epey/samsung-galaxy-s26.png' },
  { id: 'samsung-galaxy-s26', image: '/images/phones/samsung/epey/samsung-galaxy-s26.png' }
];

const map = new Map();
updates.forEach(u => map.set(u.id, u.image));

const phonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));

let appliedCount = 0;
phones.forEach(p => {
  if (map.has(p.id)) {
    const newImg = map.get(p.id);
    p.image = newImg;
    p.images = [newImg, ...(p.images || []).filter(img => img !== newImg)];
    appliedCount++;
    console.log(`✅ Updated: ${p.name} (${p.id}) -> ${newImg}`);
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`\nSuccessfully applied ${appliedCount} official Epey studio photos!`);

// Log change
logDataChange({
  title: `Applied Official Epey Studio Photos for ${appliedCount} Samsung Models`,
  files: ['src/lib/smartphonesData.json', 'public/images/phones/samsung/epey/'],
  description: `Replaced product images with canonical, clean transparent-background studio photos sourced directly from Epey (Galaxy S24 Ultra, S24+, S24, S23 Ultra, S22 Ultra, Z Fold 6, S25 Ultra, S25, S26 series).`,
  rationale: 'User requested pulling official photos directly from Epey for gold-standard Turkish tech product presentation.'
});
