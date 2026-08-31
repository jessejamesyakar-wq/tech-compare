const fs = require('fs');
const path = require('path');

const files = [
  'src/app/consoles/[id]/ConsolesDetailClient.tsx',
  'src/app/headphones/[id]/HeadphonesDetailClient.tsx',
  'src/app/smartwatches/[id]/SmartwatchesDetailClient.tsx',
  'src/app/tablets/[id]/TabletsDetailClient.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/product=\{consoleItem\}/g, 'product={product}');
    content = content.replace(/product=\{headphone\}/g, 'product={product}');
    content = content.replace(/product=\{watch\}/g, 'product={product}');
    content = content.replace(/product=\{tablet\}/g, 'product={product}');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
