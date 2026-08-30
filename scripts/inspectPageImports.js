const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'Phones Page', file: path.join(__dirname, '../src/app/phones/page.tsx') },
  { name: 'TVs Page', file: path.join(__dirname, '../src/app/tvs/page.tsx') },
  { name: 'Laptops Page', file: path.join(__dirname, '../src/app/laptops/page.tsx') },
  { name: 'Tablets Page', file: path.join(__dirname, '../src/app/tablets/page.tsx') },
  { name: 'Smartwatches Page', file: path.join(__dirname, '../src/app/smartwatches/page.tsx') },
  { name: 'Headphones Page', file: path.join(__dirname, '../src/app/headphones/page.tsx') },
  { name: 'Appliances Page', file: path.join(__dirname, '../src/app/appliances/page.tsx') },
  { name: 'Monitors Page', file: path.join(__dirname, '../src/app/monitors/page.tsx') },
  { name: 'Consoles Page', file: path.join(__dirname, '../src/app/consoles/page.tsx') }
];

console.log('=== NEXT.JS APP ROUTER PAGE IMPORTS & DATA SOURCES ===\n');

pages.forEach(p => {
  if (!fs.existsSync(p.file)) {
    console.log(`${p.name}: File not found`);
    return;
  }
  const content = fs.readFileSync(p.file, 'utf8');
  const lines = content.split('\n');
  const dataImports = lines.filter(l => l.includes('import') && (l.includes('mock') || l.includes('smartphonesData')));
  console.log(`📄 ${p.name.padEnd(20)}:`);
  dataImports.forEach(i => console.log(`   ${i.trim()}`));
});
