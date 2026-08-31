const fs = require('fs');
const path = require('path');

const tvContent = fs.readFileSync(path.join(__dirname, '../src/lib/mockTVs.ts'), 'utf8');
const eqIdx = tvContent.indexOf('=');
const startIdx = tvContent.indexOf('[', eqIdx);
const endIdx = tvContent.lastIndexOf(']');
const tvs = JSON.parse(tvContent.substring(startIdx, endIdx + 1));

const imageFiles = fs.readdirSync(path.join(__dirname, '../public/images/products/tvs'));

console.log('Total TVs:', tvs.length);
console.log('Total image files in tvs directory:', imageFiles.length);

let fixedCount = 0;
let stillMissing = [];

tvs.forEach(tv => {
  const brand = (tv.brand || '').trim();
  const brandLower = brand.toLowerCase();
  const currentImg = tv.image || '';

  // If using LG image but not LG
  if (brandLower !== 'lg' && (currentImg.includes('lg-') || currentImg.includes('/lg/'))) {
    // Look for dedicated image matching slug or id
    const slug = tv.slug || tv.id.replace('tv-', '');
    const cleanId = tv.id;

    // Potential matches in tv directory
    const candidates = [
      `icecat-${slug}.jpg`,
      `icecat-${cleanId}.jpg`,
      `tv-${slug}.jpg`,
      `${slug}.jpg`,
      `${cleanId}.jpg`,
      `${slug}-1.jpg`,
      `${brandLower}-${slug}.jpg`
    ];

    let found = candidates.find(c => imageFiles.includes(c));

    // If not exact slug, check if there's any image starting with the brand and model
    if (!found) {
      const modelPart = slug.split('-').slice(0, 3).join('-');
      found = imageFiles.find(f => f.toLowerCase().includes(modelPart) && f.toLowerCase().startsWith(brandLower));
    }

    // If still not found, check for brand generic image
    if (!found) {
      found = imageFiles.find(f => f.startsWith(`${brandLower}-`) || f.startsWith(`icecat-${brandLower}-`));
    }

    if (found) {
      fixedCount++;
    } else {
      stillMissing.push({ id: tv.id, brand: tv.brand, name: tv.name });
    }
  }
});

console.log(`Matched brand-specific images for ${fixedCount} non-LG TVs.`);
console.log(`Still without dedicated brand image: ${stillMissing.length}`);
if (stillMissing.length > 0) {
  console.log('Sample missing:', stillMissing.slice(0, 10));
}
