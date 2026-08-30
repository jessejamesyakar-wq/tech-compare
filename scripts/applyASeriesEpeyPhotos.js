const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

console.log('=== APPLYING APPROVED EPEY STUDIO PHOTOS TO GALAXY A SERIES PHONES ===\n');

const updates = [
  { id: 'samsung-samsung-galaxy-a55-5g-103', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a55-5g-103.png' },
  { id: 'samsung-samsung-galaxy-a35-5g-102', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a35-5g-102.png' },
  { id: 'samsung-samsung-galaxy-a15-100', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a15-100.png' },
  { id: 'samsung-samsung-galaxy-a05-99', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a05-99.png' },
  { id: 'samsung-samsung-galaxy-a54-5g-89', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a54-5g-89.png' },
  { id: 'samsung-samsung-galaxy-a73-5g-75', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a73-5g-75.png' },
  { id: 'samsung-samsung-galaxy-a23-72', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a23-72.png' },
  { id: 'samsung-samsung-galaxy-a13-71', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a13-71.png' },
  { id: 'samsung-samsung-galaxy-a72-62', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a72-62.png' },
  { id: 'samsung-samsung-galaxy-a52s-5g-61', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a52s-5g-61.png' },
  { id: 'samsung-samsung-galaxy-a52-60', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a52-60.png' },
  { id: 'samsung-samsung-galaxy-a12-57', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a12-57.png' },
  { id: 'samsung-samsung-galaxy-a71-45', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a71-45.png' },
  { id: 'samsung-samsung-galaxy-a51-44', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a51-44.png' },
  { id: 'samsung-samsung-galaxy-a50-24', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a50-24.png' },
  { id: 'samsung-samsung-galaxy-a30-22', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a30-22.png' },
  { id: 'samsung-samsung-galaxy-a20-21', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-a20-21.png' }
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
    console.log(`✅ Applied: ${p.name} (${p.id}) -> ${newImg}`);
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`\nSuccessfully applied ${appliedCount} official Epey Galaxy A studio photos!`);

// Log change to audit ledger
logDataChange({
  title: `Applied Official Epey Studio Photos for ${appliedCount} Galaxy A Series Phones`,
  files: ['src/lib/smartphonesData.json', 'public/images/phones/samsung/epey/'],
  description: `Replaced monotone light blue promotional images across the Galaxy A series with authentic, dual-angle neutral studio photos directly from Epey (A55, A35, A15, A05s, A54, A73, A23, A13, A72, A52s, A52, A12, A71, A51, A50, A30, A20).`,
  rationale: 'User requested replacing monotone blue promotional renders with diverse, authentic Epey dual-angle studio product photography.'
});
