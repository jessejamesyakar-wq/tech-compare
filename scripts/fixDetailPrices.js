const fs = require('fs');
const path = require('path');

const detailFiles = [
  'src/app/phones/[id]/PhoneDetailClient.tsx',
  'src/app/tvs/[id]/TVDetailClient.tsx',
  'src/app/laptops/[id]/LaptopDetailClient.tsx',
  'src/app/appliances/[id]/ApplianceDetailClient.tsx',
  'src/app/headphones/[id]/HeadphonesDetailClient.tsx',
  'src/app/smartwatches/[id]/SmartwatchesDetailClient.tsx',
  'src/app/tablets/[id]/TabletsDetailClient.tsx',
  'src/app/monitors/[id]/MonitorDetailClient.tsx',
  'src/app/consoles/[id]/ConsolesDetailClient.tsx'
];

detailFiles.forEach(rel => {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) return;
  let content = fs.readFileSync(full, 'utf8');

  // Ensure base price display is derived from lowest available offer
  content = content.replace(
    /\{(\w+)\.basePrice > 0 \? `\$\{(\w+)\.basePrice\.toLocaleString\(\)\} \$\{(\w+)\.currency\}` : 'Fiyat Güncelleniyor'\}/g,
    '{((($1.storeOffers && $1.storeOffers.length > 0 && Math.min(...$1.storeOffers.map(o => o.price).filter(p => p > 0)) > 0) ? Math.min(...$1.storeOffers.map(o => o.price).filter(p => p > 0)) : $1.basePrice) > 0 ? `${(($1.storeOffers && $1.storeOffers.length > 0 && Math.min(...$1.storeOffers.map(o => o.price).filter(p => p > 0)) > 0) ? Math.min(...$1.storeOffers.map(o => o.price).filter(p => p > 0)) : $1.basePrice).toLocaleString()} ${$1.currency}` : \'Fiyat Güncelleniyor\')}'
  );

  fs.writeFileSync(full, content, 'utf8');
  console.log('Updated price display in:', rel);
});
