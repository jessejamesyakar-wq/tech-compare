const fs = require('fs');
const path = require('path');

const files = [
  'src/app/alerts/page.tsx',
  'src/app/compare/page.tsx',
  'src/components/compare/CompareMatrix.tsx',
  'src/components/detail/StickyHeaderBar.tsx',
  'src/components/layout/CompareBar.tsx',
  'src/components/layout/Footer.tsx',
  'src/components/catalog/PhoneCard.tsx',
  'src/components/promo/HeroCarousel.tsx',
  'src/components/promo/HeroThumbnailStrip.tsx'
];

files.forEach(f => {
  const p = path.join(process.cwd(), f);
  if (!fs.existsSync(p)) return;
  let code = fs.readFileSync(p, 'utf8');
  if (code.includes("'use client'")) {
    code = code.replace(/['"]use client['"];?\s*/g, '');
    code = "'use client';\n\n" + code;
    fs.writeFileSync(p, code, 'utf8');
    console.log('Fixed use client order in ' + f);
  }
});
