const fs = require('fs');
const path = require('path');

const files = [
  { name: 'monitors', file: 'mockMonitors.ts' },
  { name: 'laptops', file: 'mockLaptops.ts' },
  { name: 'tablets', file: 'mockTablets.ts' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts' },
  { name: 'headphones', file: 'mockHeadphones.ts' },
  { name: 'appliances', file: 'mockAppliances.ts' },
  { name: 'consoles', file: 'mockConsoles.ts' },
  { name: 'smartphones', file: 'smartphonesData.json', isJson: true }
];

files.forEach(f => {
  const filePath = path.join(__dirname, '../src/lib', f.file);
  const c = fs.readFileSync(filePath, 'utf8');
  let items = [];
  if (f.isJson) {
    items = JSON.parse(c);
  } else {
    const eq = c.indexOf('=');
    const start = c.indexOf('[', eq);
    const end = c.lastIndexOf(']');
    items = JSON.parse(c.substring(start, end + 1));
  }

  let issues = [];
  items.forEach(p => {
    const brand = (p.brand || '').toLowerCase().trim();
    const img = (p.image || '').toLowerCase();

    // Cross brand checks
    const brands = ['lg', 'samsung', 'apple', 'dyson', 'sony', 'philips', 'bosch', 'lenovo', 'dell', 'asus', 'hp'];
    for (const b of brands) {
      if (img.includes(`${b}-`) || img.includes(`/${b}/`)) {
        if (!brand.includes(b)) {
          issues.push({ id: p.id, brand: p.brand, name: p.name, image: p.image });
          break;
        }
      }
    }
  });

  console.log(`[${f.name.toUpperCase()}]: ${issues.length} cross-brand image issues found.`);
  if (issues.length > 0) {
    console.log('Sample:', issues.slice(0, 3));
  }
});
