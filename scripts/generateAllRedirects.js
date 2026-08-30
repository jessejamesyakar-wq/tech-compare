const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== GENERATING COMPREHENSIVE REDIRECT MAP (ALL CATEGORIES) ===');

const redirects = [];
const seenSources = new Set();

function addRedirect(source, destination, name = '') {
  if (!source || !destination || source === destination) return;
  const cleanSource = source.startsWith('/') ? source : `/${source}`;
  const cleanDest = destination.startsWith('/') ? destination : `/${destination}`;
  if (!seenSources.has(cleanSource)) {
    seenSources.add(cleanSource);
    redirects.push({
      source: cleanSource,
      destination: cleanDest,
      permanent: true,
      name
    });
  }
}

// 1. Phone Slugs that changed (storage variants and plus models)
const phoneRedirects = [
  // Storage Variants
  { src: '/phones/samsung-galaxy-s26-ultra', dest: '/phones/samsung-galaxy-s26-ultra-256gb', name: 'Samsung Galaxy S26 Ultra 256GB' },
  { src: '/phones/samsung-galaxy-s26-plus', dest: '/phones/samsung-galaxy-s26-plus-256gb', name: 'Samsung Galaxy S26+ 256GB' },
  { src: '/phones/samsung-galaxy-s26', dest: '/phones/samsung-galaxy-s26-128gb', name: 'Samsung Galaxy S26 128GB' },
  { src: '/phones/samsung-galaxy-s25-ultra', dest: '/phones/samsung-galaxy-s25-ultra-256gb', name: 'Samsung Galaxy S25 Ultra 256GB' },
  { src: '/phones/samsung-galaxy-s25-plus', dest: '/phones/samsung-galaxy-s25-plus-256gb', name: 'Samsung Galaxy S25+ 256GB' },
  { src: '/phones/samsung-galaxy-s25', dest: '/phones/samsung-galaxy-s25-128gb', name: 'Samsung Galaxy S25 128GB' },
  { src: '/phones/samsung-galaxy-s25-fe', dest: '/phones/samsung-galaxy-s25-fe-128gb', name: 'Samsung Galaxy S25 FE 128GB' },
  { src: '/phones/samsung-galaxy-a57-5g', dest: '/phones/samsung-galaxy-a57-5g-128gb', name: 'Samsung Galaxy A57 5G 128GB' },
  { src: '/phones/samsung-galaxy-a37-5g', dest: '/phones/samsung-galaxy-a37-5g-128gb', name: 'Samsung Galaxy A37 5G 128GB' },
  { src: '/phones/samsung-galaxy-a17-5g', dest: '/phones/samsung-galaxy-a17-5g-128gb', name: 'Samsung Galaxy A17 5G 128GB' },

  // Plus Models (URL encoded & variations)
  { src: '/phones/samsung-galaxy-s9-plus-old', dest: '/phones/samsung-galaxy-s9-plus', name: 'Samsung Galaxy S9+' },
  { src: '/phones/samsung-galaxy-s10-plus-old', dest: '/phones/samsung-galaxy-s10-plus', name: 'Samsung Galaxy S10+' },
  { src: '/phones/samsung-galaxy-note-10-plus-old', dest: '/phones/samsung-galaxy-note-10-plus', name: 'Samsung Galaxy Note 10+' },
  { src: '/phones/samsung-galaxy-s20-plus-old', dest: '/phones/samsung-galaxy-s20-plus', name: 'Samsung Galaxy S20+' },
  { src: '/phones/samsung-galaxy-s21-plus-old', dest: '/phones/samsung-galaxy-s21-plus', name: 'Samsung Galaxy S21+' },
  { src: '/phones/samsung-galaxy-s22-plus-old', dest: '/phones/samsung-galaxy-s22-plus', name: 'Samsung Galaxy S22+' },
  { src: '/phones/samsung-galaxy-s23-plus-old', dest: '/phones/samsung-galaxy-s23-plus', name: 'Samsung Galaxy S23+' },
  { src: '/phones/samsung-galaxy-s24-plus-old', dest: '/phones/samsung-galaxy-s24-plus', name: 'Samsung Galaxy S24+' }
];

phoneRedirects.forEach(p => addRedirect(p.src, p.dest, p.name));

// 2. Audio & Headphones
addRedirect('/headphones/samsung-samsung-galaxy-buds', '/headphones/samsung-galaxy-buds-plus', 'Samsung Galaxy Buds+');
addRedirect('/headphones/samsung-galaxy-buds', '/headphones/samsung-galaxy-buds-plus', 'Samsung Galaxy Buds+');

// 3. Tablets
addRedirect('/tablets/samsung-samsung-galaxy-tab-s7-s7-fe-s8-turkce-klavyeli-kilif', '/tablets/samsung-samsung-galaxy-tab-s7-s7-fe-s8-turkce-klavyeli-kilif-plus', 'Tab S7+ Kilif');
addRedirect('/tablets/samsung-samsung-galaxy-s23-cok-amacli-seffaf-kilif', '/tablets/samsung-samsung-galaxy-s23-cok-amacli-seffaf-kilif-plus', 'Galaxy S23+ Kilif');
addRedirect('/tablets/samsung-samsung-galaxy-tab-s9-mousepadli-klavyeli-kapakli-kilif', '/tablets/samsung-samsung-galaxy-tab-s9-mousepadli-klavyeli-kapakli-kilif-plus', 'Tab S9+ Kilif');
addRedirect('/tablets/samsung-samsung-galaxy-tab-s9-not-ekrani', '/tablets/samsung-samsung-galaxy-tab-s9-not-ekrani-plus', 'Tab S9+ Not Ekrani');

// 4. Appliances
addRedirect('/appliances/xiaomi-robot-vacuum-x20-plus-mop', '/appliances/xiaomi-robot-vacuum-x20-plus-pro-mop', 'Xiaomi Robot Vacuum X20+ Mop');

// 5. Save to data/redirects.json
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(
  path.join(dataDir, 'redirects.json'),
  JSON.stringify(redirects, null, 2),
  'utf8'
);

console.log(`\nGenerated ${redirects.length} total 301 redirects.`);
redirects.forEach((r, idx) => {
  console.log(`${idx + 1}. [301] ${r.source} -> ${r.destination} (${r.name || ''})`);
});
