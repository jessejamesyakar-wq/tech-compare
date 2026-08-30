const fs = require('fs');
const path = require('path');

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const samsung = phones.filter(p => p.brand.toLowerCase() === 'samsung');
const svgPhones = samsung.filter(p => p.image.endsWith('.svg'));

const allProdFiles = fs.readdirSync(path.join(__dirname, '../public/images/products/smartphones'));
const allSamsungFiles = fs.readdirSync(path.join(__dirname, '../public/images/phones/samsung'));

console.log(`Searching JPG/PNG replacements for ${svgPhones.length} SVG models:\n`);

const proposal = [];

svgPhones.forEach(p => {
  const cleanId = p.id.toLowerCase();
  
  // 1. Exact match in /images/products/smartphones/
  const prodMatch = allProdFiles.find(f => {
    const fn = f.toLowerCase();
    return fn === (cleanId + '.jpg') || fn === (cleanId + '.png') || fn.startsWith(cleanId + '-');
  });

  // 2. Exact match in /images/phones/samsung/
  const samsungMatch = allSamsungFiles.find(f => {
    const fn = f.toLowerCase();
    const baseSlug = p.slug.replace('-256gb', '').replace('-128gb', '');
    return (fn.endsWith('.jpg') || fn.endsWith('.png')) && (fn === (baseSlug + '.jpg') || fn === (baseSlug + '.png') || fn.startsWith(baseSlug + '-'));
  });

  const bestReplacement = prodMatch ? `/images/products/smartphones/${prodMatch}` : samsungMatch ? `/images/phones/samsung/${samsungMatch}` : null;

  proposal.push({
    id: p.id,
    name: p.name,
    currentImage: p.image,
    proposedImage: bestReplacement,
    found: !!bestReplacement
  });
});

console.log('Results:');
proposal.forEach((item, idx) => {
  console.log(`${idx + 1}. [${item.id}] ${item.name}`);
  console.log(`   - Mevcut:   ${item.currentImage}`);
  console.log(`   - Önerilen: ${item.proposedImage || '⚠️ (Yeni fotoğraf gerektiriyor)'}`);
});

const readyCount = proposal.filter(p => p.found).length;
console.log(`\nReady to replace with real photos: ${readyCount} / ${proposal.length}`);

// Save to data/samsung_image_proposal.json
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'samsung_image_proposal.json'), JSON.stringify(proposal, null, 2), 'utf8');
