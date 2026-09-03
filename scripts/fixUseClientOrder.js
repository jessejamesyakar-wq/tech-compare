const fs = require('fs');
const path = require('path');

const clientFiles = [
  'src/app/phones/[id]/PhoneDetailClient.tsx',
  'src/app/tvs/[id]/TVDetailClient.tsx',
  'src/app/laptops/[id]/LaptopDetailClient.tsx',
  'src/app/tablets/[id]/TabletsDetailClient.tsx',
  'src/app/smartwatches/[id]/SmartwatchesDetailClient.tsx',
  'src/app/headphones/[id]/HeadphonesDetailClient.tsx',
  'src/app/appliances/[id]/ApplianceDetailClient.tsx',
  'src/app/monitors/[id]/MonitorDetailClient.tsx',
  'src/app/consoles/[id]/ConsolesDetailClient.tsx'
];

clientFiles.forEach(f => {
  const p = path.join(process.cwd(), f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(/['"]use client['"];?\s*/g, '');
  content = content.replace(/import\s+\{\s*ProductJsonLd\s*\}\s+from\s+['"]@\/components\/seo\/ProductJsonLd['"];?\s*/g, '');
  
  content = `'use client';\n\nimport { ProductJsonLd } from '@/components/seo/ProductJsonLd';\n` + content;
  fs.writeFileSync(p, content, 'utf8');
  console.log('Fixed use client in ' + f);
});
