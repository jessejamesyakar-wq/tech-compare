const fs = require('fs');
const path = require('path');

const tabletsPath = path.join(__dirname, '../src/lib/mockTablets.ts');
if (fs.existsSync(tabletsPath)) {
  let content = fs.readFileSync(tabletsPath, 'utf8');
  const match = content.match(/export\s+const\s+mockTablets\s*:\s*(?:Product\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
  if (match) {
    const list = JSON.parse(match[1]);
    list.forEach(p => {
      if (/\b(s\d+|tab\s*s\d+)\+/i.test(p.name) && !p.slug.includes('plus')) {
        p.slug = `${p.slug}-plus`;
      }
    });
    const newContent = content.replace(match[1], JSON.stringify(list, null, 2));
    fs.writeFileSync(tabletsPath, newContent, 'utf8');
    console.log('Updated tablet accessory plus slugs in mockTablets.ts');
  }
}
