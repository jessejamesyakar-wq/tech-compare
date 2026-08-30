const fs = require('fs');
const path = require('path');

const epeyDir = path.join(__dirname, '../public/images/phones/samsung/epey');
const files = fs.readdirSync(epeyDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));

console.log(`Total verified high-res Epey studio photos ready on disk: ${files.length}\n`);

const phones = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/lib/smartphonesData.json'), 'utf8'));
const samsung = phones.filter(p => p.brand.toLowerCase() === 'samsung');

let matches = 0;
const updateProposal = [];

files.forEach(f => {
  const baseName = f.replace(/\.(png|jpg)$/, '');
  // Match by ID or by slug
  const matchedPhone = samsung.find(p => p.id === baseName || p.slug === baseName || p.slug === baseName.replace('samsung-samsung-', 'samsung-'));
  if (matchedPhone) {
    matches++;
    const newImgPath = `/images/phones/samsung/epey/${f}`;
    updateProposal.push({
      id: matchedPhone.id,
      name: matchedPhone.name,
      oldImage: matchedPhone.image,
      newImage: newImgPath
    });
    console.log(`Match ${matches}: [${matchedPhone.id}] ${matchedPhone.name}`);
    console.log(`   Old: ${matchedPhone.image}`);
    console.log(`   New: ${newImgPath}\n`);
  }
});

console.log(`Total matched Samsung updates ready to apply: ${updateProposal.length}`);
fs.writeFileSync(path.join(__dirname, '../data/comprehensive_samsung_proposal.json'), JSON.stringify(updateProposal, null, 2), 'utf8');
