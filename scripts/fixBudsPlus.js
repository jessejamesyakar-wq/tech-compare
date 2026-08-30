const fs = require('fs');
const path = require('path');

const headphonesPath = path.join(__dirname, '../src/lib/mockHeadphones.ts');
if (fs.existsSync(headphonesPath)) {
  let content = fs.readFileSync(headphonesPath, 'utf8');
  const match = content.match(/export\s+const\s+mockHeadphones\s*:\s*(?:Product\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    const list = JSON.parse(match[1]);
    list.forEach(p => {
      if (p.name.includes('Buds+') && !p.slug.includes('plus')) {
        p.slug = 'samsung-galaxy-buds-plus';
        console.log('Updated Samsung Galaxy Buds+ slug to samsung-galaxy-buds-plus');
      }
    });
    const newContent = content.replace(match[1], JSON.stringify(list, null, 2));
    fs.writeFileSync(headphonesPath, newContent, 'utf8');
  }
}
