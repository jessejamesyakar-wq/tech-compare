const fs = require('fs');
const path = require('path');
const { logDataChange } = require('./logDataChange');

console.log('=== APPLYING COMPREHENSIVE OFFICIAL SAMSUNG STUDIO PHOTOS ===\n');

const updates = [
  // Z Series
  { id: 'samsung-samsung-galaxy-z-fold-5-85', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-z-fold-5-85.png' },
  { id: 'samsung-samsung-galaxy-z-fold-4-70', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-z-fold-4-70.png' },
  { id: 'samsung-samsung-galaxy-z-flip-3-54', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-z-flip-3-54.png' },

  // S Series
  { id: 'samsung-samsung-galaxy-s24-fe-96', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-s24-fe-96.png' },
  { id: 'samsung-samsung-galaxy-s22-67', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-s22-67.png' },
  { id: 'samsung-samsung-galaxy-s22-66', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-s22-66.png' },
  { id: 'samsung-samsung-galaxy-s20-fe-47', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-s20-fe-47.png' },

  // Note Series
  { id: 'samsung-samsung-galaxy-note-20-ultra-49', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-note-20-ultra-49.png' },

  // M Series
  { id: 'samsung-samsung-galaxy-m35-5g-105', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-m35-5g-105.png' },
  { id: 'samsung-samsung-galaxy-m34-5g-91', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-m34-5g-91.png' },
  { id: 'samsung-samsung-galaxy-m33-5g-78', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-m33-5g-78.png' },
  { id: 'samsung-samsung-galaxy-m13-76', image: '/images/phones/samsung/epey/samsung-samsung-galaxy-m13-76.png' }
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
console.log(`\nSuccessfully applied ${appliedCount} comprehensive official Samsung studio photos!`);

// Log data change
logDataChange({
  title: `Applied Comprehensive Official Epey/Samsung Studio Photos for ${appliedCount} Galaxy Z, S, Note, and M Models`,
  files: ['src/lib/smartphonesData.json', 'public/images/phones/samsung/epey/'],
  description: `Connected high-res, verified manufacturer studio photography directly from Epey for Galaxy Z Fold 5, Z Fold 4, Z Flip 3, S24 FE, S22+, S22, S20 FE, Note 20 Ultra, M35 5G, M34 5G, M33 5G, M13.`,
  rationale: 'User requested comprehensive overhaul of all Samsung smartphones to eliminate generic/repetitive photos.'
});
