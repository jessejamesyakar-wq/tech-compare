const fs = require('fs');
const path = require('path');

const detailFiles = [
  { file: 'src/app/phones/[id]/PhoneDetailClient.tsx', prop: 'phone' },
  { file: 'src/app/tvs/[id]/TVDetailClient.tsx', prop: 'tv' },
  { file: 'src/app/laptops/[id]/LaptopDetailClient.tsx', prop: 'laptop' },
  { file: 'src/app/appliances/[id]/ApplianceDetailClient.tsx', prop: 'appliance' },
  { file: 'src/app/headphones/[id]/HeadphonesDetailClient.tsx', prop: 'headphones' },
  { file: 'src/app/smartwatches/[id]/SmartwatchesDetailClient.tsx', prop: 'smartwatch' },
  { file: 'src/app/tablets/[id]/TabletsDetailClient.tsx', prop: 'tablet' },
  { file: 'src/app/monitors/[id]/MonitorDetailClient.tsx', prop: 'monitor' },
  { file: 'src/app/consoles/[id]/ConsolesDetailClient.tsx', prop: 'console' }
];

detailFiles.forEach(({ file, prop }) => {
  const full = path.join(__dirname, '..', file);
  if (!fs.existsSync(full)) return;
  let content = fs.readFileSync(full, 'utf8');

  // Replace <PriceHistoryChart data={...} currency={...} /> with product={prop}
  content = content.replace(
    new RegExp(`<PriceHistoryChart\\s+data=\\{(${prop}\\.priceHistory)\\}\\s+currency=\\{(${prop}\\.currency)\\}\\s*\\/>`, 'g'),
    `<PriceHistoryChart data={$1} currency={$2} product={${prop}} />`
  );

  fs.writeFileSync(full, content, 'utf8');
  console.log('Updated PriceHistoryChart in:', file);
});
