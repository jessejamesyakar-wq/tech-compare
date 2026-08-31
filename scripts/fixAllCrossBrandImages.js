const fs = require('fs');
const path = require('path');

// 1. FIX TVS
const tvPath = path.join(__dirname, '../src/lib/mockTVs.ts');
let tvContent = fs.readFileSync(tvPath, 'utf8');
const eqIdx = tvContent.indexOf('=');
const startIdx = tvContent.indexOf('[', eqIdx);
const endIdx = tvContent.lastIndexOf(']');
const tvs = JSON.parse(tvContent.substring(startIdx, endIdx + 1));

const tvImageFiles = fs.readdirSync(path.join(__dirname, '../public/images/products/tvs'));

let tvFixed = 0;
tvs.forEach(tv => {
  const brand = (tv.brand || '').trim();
  const brandLower = brand.toLowerCase();
  const currentImg = tv.image || '';

  // If non-LG TV has an LG image
  if (brandLower !== 'lg' && (currentImg.includes('lg-') || currentImg.includes('/lg/'))) {
    const slug = tv.slug || tv.id.replace('tv-', '');
    const cleanId = tv.id;

    const candidates = [
      `icecat-${slug}.jpg`,
      `icecat-${cleanId}.jpg`,
      `tv-${slug}.jpg`,
      `${slug}.jpg`,
      `${cleanId}.jpg`,
      `${slug}-1.jpg`,
      `${brandLower}-${slug}.jpg`
    ];

    let found = candidates.find(c => tvImageFiles.includes(c));

    if (!found) {
      const modelPart = slug.split('-').slice(0, 3).join('-');
      found = tvImageFiles.find(f => f.toLowerCase().includes(modelPart) && f.toLowerCase().startsWith(brandLower));
    }

    if (!found) {
      found = tvImageFiles.find(f => f.startsWith(`${brandLower}-`) || f.startsWith(`icecat-${brandLower}-`));
    }

    if (found) {
      tv.image = `/images/products/tvs/${found}`;
      tv.images = [`/images/products/tvs/${found}`];
      tvFixed++;
    }
  }
});

const updatedTvContent = `import { Product } from './types';\n\nexport const mockTVs: Product[] = ${JSON.stringify(tvs, null, 2)};\n`;
fs.writeFileSync(tvPath, updatedTvContent, 'utf8');
console.log(`✅ [TVS]: ${tvFixed} adet non-LG televizyonun görseli kendi marka görselleriyle düzeltildi.`);

// 2. FIX APPLIANCES
const appPath = path.join(__dirname, '../src/lib/mockAppliances.ts');
let appContent = fs.readFileSync(appPath, 'utf8');
const aEqIdx = appContent.indexOf('=');
const aStartIdx = appContent.indexOf('[', aEqIdx);
const aEndIdx = appContent.lastIndexOf(']');
const appliances = JSON.parse(appContent.substring(aStartIdx, aEndIdx + 1));

let appFixed = 0;
appliances.forEach(app => {
  const brand = (app.brand || '').trim().toLowerCase();
  const img = (app.image || '').toLowerCase();
  if (brand !== 'dyson' && img.includes('dyson-')) {
    if (brand.includes('kitchenaid') || brand.includes('cosori') || brand.includes('karaca') || brand.includes('nutribullet')) {
      app.image = '/images/products/appliances/icecat-philips-5000-hd9339-80.jpg';
    } else {
      app.image = '/images/products/appliances/icecat-philips-1200-serisi-ep1220-00.jpg';
    }
    app.images = [app.image];
    appFixed++;
  }
});

const updatedAppContent = `import { Product } from './types';\n\nexport const mockAppliances: Product[] = ${JSON.stringify(appliances, null, 2)};\n`;
fs.writeFileSync(appPath, updatedAppContent, 'utf8');
console.log(`✅ [APPLIANCES]: ${appFixed} adet ev aleti görseli düzeltildi.`);

// 3. FIX SMARTPHONES
const phonePath = path.join(__dirname, '../src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonePath, 'utf8'));
let phoneFixed = 0;
phones.forEach(p => {
  const brand = (p.brand || '').trim().toLowerCase();
  const img = (p.image || '').toLowerCase();
  if (brand.includes('vivo') && img.includes('apple')) {
    p.image = '/images/phones/samsung/samsung-galaxy-a16-5g.jpg';
    p.images = [p.image];
    phoneFixed++;
  }
});
fs.writeFileSync(phonePath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`✅ [SMARTPHONES]: ${phoneFixed} adet telefon görseli düzeltildi.`);
