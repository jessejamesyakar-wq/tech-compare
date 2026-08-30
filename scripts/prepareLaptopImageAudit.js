const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '../src/lib/mockLaptops.ts'), 'utf8');
const match = content.match(/export\s+const\s+mockLaptops\s*:\s*(?:Product\[\]|LaptopProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
const laptops = JSON.parse(match[1]);

const prodLaptopFiles = fs.readdirSync(path.join(__dirname, '../public/images/products/laptops'));
const fileSet = new Map();
prodLaptopFiles.forEach(f => fileSet.set(f.toLowerCase(), f));

console.log('Total laptops in catalog:', laptops.length);
console.log('Total files in public/images/products/laptops:', prodLaptopFiles.length);

let matched = 0;
let unmatched = [];
const proposedMap = [];

laptops.forEach(p => {
  const expectedName1 = (p.id + '.jpg').toLowerCase();
  const expectedName2 = (p.id + '.png').toLowerCase();
  const expectedName3 = (p.slug + '.jpg').toLowerCase();
  const expectedName4 = (p.slug + '.png').toLowerCase();
  const expectedName5 = (p.slug + '-1.jpg').toLowerCase();
  const expectedName6 = (p.slug + '-1.png').toLowerCase();
  const expectedName7 = (p.id + '-1.jpg').toLowerCase();
  const expectedName8 = (p.id + '-1.png').toLowerCase();

  let foundFile = null;
  if (fileSet.has(expectedName1)) foundFile = fileSet.get(expectedName1);
  else if (fileSet.has(expectedName2)) foundFile = fileSet.get(expectedName2);
  else if (fileSet.has(expectedName3)) foundFile = fileSet.get(expectedName3);
  else if (fileSet.has(expectedName4)) foundFile = fileSet.get(expectedName4);
  else if (fileSet.has(expectedName5)) foundFile = fileSet.get(expectedName5);
  else if (fileSet.has(expectedName6)) foundFile = fileSet.get(expectedName6);
  else if (fileSet.has(expectedName7)) foundFile = fileSet.get(expectedName7);
  else if (fileSet.has(expectedName8)) foundFile = fileSet.get(expectedName8);
  else {
    // Try normalized match
    const normSlug = p.slug.toLowerCase().replace(/[^a-z0-9]/g, '');
    const found = prodLaptopFiles.find(f => {
      const normF = f.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/1jpg$|1png$|jpg$|png$/, '');
      return normF === normSlug || (normSlug.length > 8 && normF.includes(normSlug)) || (normF.length > 8 && normSlug.includes(normF));
    });
    if (found) foundFile = found;
  }

  if (foundFile) {
    matched++;
    proposedMap.push({
      id: p.id,
      name: p.name,
      brand: p.brand,
      currentImage: p.image,
      proposedImage: `/images/products/laptops/${foundFile}`
    });
  } else {
    unmatched.push(p);
  }
});

console.log('Successfully Matched Genuine Images:', matched);
console.log('Unmatched count:', unmatched.length);

// Save staging proposal to data/laptop_image_proposal.json
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

fs.writeFileSync(
  path.join(dataDir, 'laptop_image_proposal.json'),
  JSON.stringify({ totalLaptops: laptops.length, matched, unmatched: unmatched.length, proposals: proposedMap }, null, 2),
  'utf8'
);

console.log('Saved proposals to data/laptop_image_proposal.json');
