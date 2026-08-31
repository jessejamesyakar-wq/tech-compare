const fs = require('fs');
const path = require('path');

const targets = [
  { file: 'src/app/tvs/[id]/TVDetailClient.tsx', varName: 'tv' },
  { file: 'src/app/laptops/[id]/LaptopDetailClient.tsx', varName: 'laptop' },
  { file: 'src/app/tablets/[id]/TabletsDetailClient.tsx', varName: 'tablet' },
  { file: 'src/app/appliances/[id]/ApplianceDetailClient.tsx', varName: 'appliance' },
  { file: 'src/app/headphones/[id]/HeadphonesDetailClient.tsx', varName: 'headphone' },
  { file: 'src/app/smartwatches/[id]/SmartwatchesDetailClient.tsx', varName: 'watch' },
  { file: 'src/app/consoles/[id]/ConsolesDetailClient.tsx', varName: 'consoleItem' }
];

targets.forEach(({ file, varName }) => {
  const fullPath = path.join(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // CompactStoreComparison
    content = content.replace(
      new RegExp(`<CompactStoreComparison([\\s\\S]*?)currency=\\{([a-zA-Z0-9_.]+)\\}([\\s\\S]*?)\\/>`, 'g'),
      (match, p1, curr, p2) => {
        if (match.includes('product=')) return match;
        return `<CompactStoreComparison${p1}currency={${curr}}${p2} product={${varName}} />`;
      }
    );

    // StoreTable
    content = content.replace(
      new RegExp(`<StoreTable([\\s\\S]*?)currency=\\{([a-zA-Z0-9_.]+)\\}([\\s\\S]*?)\\/>`, 'g'),
      (match, p1, curr, p2) => {
        if (match.includes('product=')) return match;
        return `<StoreTable${p1}currency={${curr}}${p2} product={${varName}} />`;
      }
    );

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
