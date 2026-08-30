const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== VERIFYING ALL CATALOG IMAGES IN GIT REPOSITORY ===\n');

const gitFiles = new Set(execSync('git ls-files', { encoding: 'utf8' }).split('\n').map(f => f.trim().replace(/\\/g, '/')));

const datasets = [
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts' }
];

let totalImages = 0;
let missingInGit = 0;

datasets.forEach(d => {
  const filePath = path.join(__dirname, '../src/lib', d.file);
  if (!fs.existsSync(filePath)) return;
  let products = [];
  if (d.type === 'json') products = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  else {
    const match = fs.readFileSync(filePath, 'utf8').match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) products = JSON.parse(match[2]);
  }

  products.forEach(p => {
    const checkImg = (imgUrl, label) => {
      if (!imgUrl || typeof imgUrl !== 'string' || imgUrl.startsWith('http')) return;
      totalImages++;
      const cleanPath = imgUrl.startsWith('/') ? imgUrl.substring(1) : imgUrl;
      const fullPublic = `public/${cleanPath}`;
      if (!gitFiles.has(fullPublic)) {
        console.error(`❌ NOT IN GIT: "${fullPublic}" (${p.name} - ${label})`);
        missingInGit++;
      }
    };

    checkImg(p.image, 'main');
    (p.images || []).forEach(img => checkImg(img, 'gallery'));
    (p.variants || []).forEach(v => checkImg(v.image, `variant ${v.name || ''}`));
  });
});

console.log(`\nChecked ${totalImages} image references.`);
if (missingInGit === 0) {
  console.log('✅ 100% of all image files are committed and present in Git!');
} else {
  console.error(`❌ Found ${missingInGit} images missing in Git.`);
  process.exit(1);
}
