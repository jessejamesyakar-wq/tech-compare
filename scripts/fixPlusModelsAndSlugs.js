const fs = require('fs');
const path = require('path');

// 1. Copy Plus images to public/images/phones/samsung/
const imageCopies = [
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-s9-2.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-s9-plus.jpg' },
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-s10-15.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-s10-plus.jpg' },
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-note-10-18.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-note-10-plus.jpg' },
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-s20-33.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-s20-plus.jpg' },
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-s21-51.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-s21-plus.jpg' },
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-s22-67.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-s22-plus.jpg' },
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-a8-2018-5.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-a8-plus-2018.jpg' },
  { src: 'public/images/products/smartphones/samsung-samsung-galaxy-a6-2018-8.jpg', dest: 'public/images/phones/samsung/samsung-galaxy-a6-plus-2018.jpg' }
];

imageCopies.forEach(({ src, dest }) => {
  const fullSrc = path.join(__dirname, '..', src);
  const fullDest = path.join(__dirname, '..', dest);
  if (fs.existsSync(fullSrc)) {
    fs.copyFileSync(fullSrc, fullDest);
    console.log(`Copied ${src} -> ${dest}`);
  }
});

// 2. Fix smartphonesData.json
const smartphonesPath = path.join(__dirname, '../src/lib/smartphonesData.json');
let smartphones = JSON.parse(fs.readFileSync(smartphonesPath, 'utf8'));

// Specifications map for Plus models
const plusSpecsMap = {
  'samsung-samsung-galaxy-s9-2': {
    slug: 'samsung-galaxy-s9-plus',
    name: 'Samsung Galaxy S9+',
    image: '/images/phones/samsung/samsung-galaxy-s9-plus.jpg',
    specs: {
      screen: { size: '6.2 inç', resolution: '1440 x 2960 px', technology: 'Super AMOLED' },
      memory: { ramGb: 6, storageGb: 128 },
      battery: { capacitymAh: 3500, fastChargingWatt: 15 },
      camera: { mainMp: '12 MP + 12 MP Telephoto', frontMp: '8 MP' }
    }
  },
  'samsung-samsung-galaxy-s10-15': {
    slug: 'samsung-galaxy-s10-plus',
    name: 'Samsung Galaxy S10+',
    image: '/images/phones/samsung/samsung-galaxy-s10-plus.jpg',
    specs: {
      screen: { size: '6.4 inç', resolution: '1440 x 3040 px', technology: 'Dynamic AMOLED' },
      memory: { ramGb: 8, storageGb: 128 },
      battery: { capacitymAh: 4100, fastChargingWatt: 15 },
      camera: { mainMp: '12 MP + 12 MP + 16 MP Ultra Geniş', frontMp: '10 MP + 8 MP Çift Ön' }
    }
  },
  'samsung-samsung-galaxy-note-10-18': {
    slug: 'samsung-galaxy-note-10-plus',
    name: 'Samsung Galaxy Note 10+',
    image: '/images/phones/samsung/samsung-galaxy-note-10-plus.jpg',
    specs: {
      screen: { size: '6.8 inç', resolution: '1440 x 3040 px', technology: 'Dynamic AMOLED' },
      memory: { ramGb: 12, storageGb: 256 },
      battery: { capacitymAh: 4300, fastChargingWatt: 45 },
      camera: { mainMp: '12 MP + 12 MP + 16 MP + TOF 3D', frontMp: '10 MP' }
    }
  },
  'samsung-samsung-galaxy-s20-33': {
    slug: 'samsung-galaxy-s20-plus',
    name: 'Samsung Galaxy S20+',
    image: '/images/phones/samsung/samsung-galaxy-s20-plus.jpg',
    specs: {
      screen: { size: '6.7 inç', resolution: '1440 x 3200 px', technology: 'Dynamic AMOLED 2X 120Hz' },
      memory: { ramGb: 8, storageGb: 128 },
      battery: { capacitymAh: 4500, fastChargingWatt: 25 },
      camera: { mainMp: '12 MP + 64 MP + 12 MP + TOF', frontMp: '10 MP' }
    }
  },
  'samsung-samsung-galaxy-s21-51': {
    slug: 'samsung-galaxy-s21-plus',
    name: 'Samsung Galaxy S21+',
    image: '/images/phones/samsung/samsung-galaxy-s21-plus.jpg',
    specs: {
      screen: { size: '6.7 inç', resolution: '1080 x 2400 px', technology: 'Dynamic AMOLED 2X 120Hz' },
      memory: { ramGb: 8, storageGb: 128 },
      battery: { capacitymAh: 4800, fastChargingWatt: 25 },
      camera: { mainMp: '12 MP + 64 MP + 12 MP', frontMp: '10 MP' }
    }
  },
  'samsung-samsung-galaxy-s22-67': {
    slug: 'samsung-galaxy-s22-plus',
    name: 'Samsung Galaxy S22+',
    image: '/images/phones/samsung/samsung-galaxy-s22-plus.jpg',
    specs: {
      screen: { size: '6.6 inç', resolution: '1080 x 2340 px', technology: 'Dynamic AMOLED 2X 120Hz' },
      memory: { ramGb: 8, storageGb: 128 },
      battery: { capacitymAh: 4500, fastChargingWatt: 45 },
      camera: { mainMp: '50 MP + 10 MP + 12 MP', frontMp: '10 MP' }
    }
  },
  'samsung-samsung-galaxy-s23-81': {
    slug: 'samsung-galaxy-s23-plus',
    name: 'Samsung Galaxy S23+',
    image: '/images/phones/samsung/samsung-galaxy-s23-plus.svg',
    specs: {
      screen: { size: '6.6 inç', resolution: '1080 x 2340 px', technology: 'Dynamic AMOLED 2X 120Hz' },
      memory: { ramGb: 8, storageGb: 256 },
      battery: { capacitymAh: 4700, fastChargingWatt: 45 },
      camera: { mainMp: '50 MP + 10 MP + 12 MP', frontMp: '12 MP' }
    }
  },
  'samsung-samsung-galaxy-s24-94': {
    slug: 'samsung-galaxy-s24-plus',
    name: 'Samsung Galaxy S24+',
    image: '/images/phones/samsung/samsung-galaxy-s24-plus.svg',
    specs: {
      screen: { size: '6.7 inç', resolution: '1440 x 3120 px', technology: 'Dynamic LTPO AMOLED 2X 120Hz' },
      memory: { ramGb: 12, storageGb: 256 },
      battery: { capacitymAh: 4900, fastChargingWatt: 45 },
      camera: { mainMp: '50 MP + 10 MP + 12 MP', frontMp: '12 MP' }
    }
  },
  'samsung-samsung-galaxy-s25-108': {
    slug: 'samsung-galaxy-s25-plus',
    name: 'Samsung Galaxy S25+',
    image: '/images/phones/samsung/samsung-galaxy-s25-plus.svg',
    specs: {
      screen: { size: '6.7 inç', resolution: '1440 x 3120 px', technology: 'Dynamic LTPO AMOLED 2X 120Hz' },
      memory: { ramGb: 12, storageGb: 256 },
      battery: { capacitymAh: 4900, fastChargingWatt: 45 },
      camera: { mainMp: '50 MP + 10 MP + 12 MP', frontMp: '12 MP' }
    }
  },
  'samsung-samsung-galaxy-s26-119': {
    slug: 'samsung-galaxy-s26-plus',
    name: 'Samsung Galaxy S26+',
    image: '/images/phones/samsung/samsung-galaxy-s26-plus.png',
    specs: {
      screen: { size: '6.7 inç', resolution: '1440 x 3120 px', technology: 'Dynamic LTPO AMOLED 2X 120Hz' },
      memory: { ramGb: 12, storageGb: 256 },
      battery: { capacitymAh: 4900, fastChargingWatt: 45 },
      camera: { mainMp: '50 MP + 10 MP + 12 MP', frontMp: '12 MP' }
    }
  },
  'samsung-samsung-galaxy-a8-2018-5': {
    slug: 'samsung-galaxy-a8-plus-2018',
    name: 'Samsung Galaxy A8+ (2018)',
    image: '/images/phones/samsung/samsung-galaxy-a8-plus-2018.jpg',
    specs: {
      screen: { size: '6.0 inç', resolution: '1080 x 2220 px', technology: 'Super AMOLED' },
      memory: { ramGb: 6, storageGb: 64 },
      battery: { capacitymAh: 3500, fastChargingWatt: 18 },
      camera: { mainMp: '16 MP', frontMp: '16 MP + 8 MP Çift Ön' }
    }
  },
  'samsung-samsung-galaxy-a6-2018-8': {
    slug: 'samsung-galaxy-a6-plus-2018',
    name: 'Samsung Galaxy A6+ (2018)',
    image: '/images/phones/samsung/samsung-galaxy-a6-plus-2018.jpg',
    specs: {
      screen: { size: '6.0 inç', resolution: '1080 x 2220 px', technology: 'Super AMOLED' },
      memory: { ramGb: 4, storageGb: 64 },
      battery: { capacitymAh: 3500, fastChargingWatt: 10 },
      camera: { mainMp: '16 MP + 5 MP', frontMp: '24 MP' }
    }
  }
};

let updatedPlusCount = 0;

smartphones.forEach(p => {
  if (plusSpecsMap[p.id]) {
    const config = plusSpecsMap[p.id];
    p.slug = config.slug;
    p.name = config.name;
    p.image = config.image;
    p.images = [config.image];
    if (p.specs) {
      Object.assign(p.specs, config.specs);
    } else {
      p.specs = config.specs;
    }
    updatedPlusCount++;
  }
});

// Remove exact duplicate ID entries (such as duplicate legacy mock items)
const seenSlugs = new Set();
const deduplicated = [];

smartphones.forEach(p => {
  if (!seenSlugs.has(p.slug)) {
    seenSlugs.add(p.slug);
    deduplicated.push(p);
  } else {
    console.log(`Deduplicated identical slug: ${p.slug} (ID: ${p.id})`);
  }
});

fs.writeFileSync(smartphonesPath, JSON.stringify(deduplicated, null, 2), 'utf8');
console.log(`Updated ${updatedPlusCount} Plus models with dedicated slugs, specs, and images in smartphonesData.json.`);
console.log(`Total smartphones after deduplication: ${deduplicated.length}`);

// 3. Fix mockAppliances.ts duplicate slug if any
const appliancesPath = path.join(__dirname, '../src/lib/mockAppliances.ts');
if (fs.existsSync(appliancesPath)) {
  let content = fs.readFileSync(appliancesPath, 'utf8');
  const match = content.match(/export\s+const\s+mockAppliances\s*:\s*(?:Product\[\]|ApplianceProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    const appliances = JSON.parse(match[1]);
    const seenApp = new Set();
    const dedupApp = [];
    appliances.forEach(p => {
      if (!seenApp.has(p.slug)) {
        seenApp.add(p.slug);
        dedupApp.push(p);
      } else {
        p.slug = `${p.slug}-pro-mop`;
        seenApp.add(p.slug);
        dedupApp.push(p);
      }
    });
    const newContent = content.replace(match[1], JSON.stringify(dedupApp, null, 2));
    fs.writeFileSync(appliancesPath, newContent, 'utf8');
    console.log('Resolved duplicate slug in mockAppliances.ts');
  }
}
