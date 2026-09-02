const fs = require('fs');
const path = require('path');

console.log('Fixing i18n usage and imports across all UI components...');

// 1. Fix CompactProductCard.tsx
const cardPath = path.join(process.cwd(), 'src/components/catalog/CompactProductCard.tsx');
let card = fs.readFileSync(cardPath, 'utf8');
if (!card.includes("import { useI18n } from '@/lib/i18n/context';")) {
  card = "import { useI18n } from '@/lib/i18n/context';\n" + card;
}
card = card.replace(/{t\('([^']+)'\)}/g, '{t.$1}');
card = card.replace(/t\('([^']+)'\)/g, 't.$1');
fs.writeFileSync(cardPath, card, 'utf8');

// 2. Fix search/page.tsx
const searchPath = path.join(process.cwd(), 'src/app/search/page.tsx');
let search = fs.readFileSync(searchPath, 'utf8');
if (!search.includes("import { useI18n } from '@/lib/i18n/context';")) {
  search = search.replace("import React, { useState,", "import { useI18n } from '@/lib/i18n/context';\nimport React, { useState,");
}
fs.writeFileSync(searchPath, search, 'utf8');

// 3. Fix WeeklyPromoStrip.tsx
const promoPath = path.join(process.cwd(), 'src/components/promo/WeeklyPromoStrip.tsx');
let promo = fs.readFileSync(promoPath, 'utf8');
if (!promo.includes("import { useI18n } from '@/lib/i18n/context';")) {
  promo = "import { useI18n } from '@/lib/i18n/context';\n" + promo;
}
fs.writeFileSync(promoPath, promo, 'utf8');

// 4. Fix PriceDisclaimer.tsx
const discPath = path.join(process.cwd(), 'src/components/legal/PriceDisclaimer.tsx');
let disc = fs.readFileSync(discPath, 'utf8');
if (!disc.includes("import { useI18n } from '@/lib/i18n/context';")) {
  disc = "import { useI18n } from '@/lib/i18n/context';\n" + disc;
}
fs.writeFileSync(discPath, disc, 'utf8');

// 5. Ensure category client files have useI18n import
const categoryFiles = [
  'src/app/phones/PhonesClient.tsx',
  'src/app/tvs/TVsClient.tsx',
  'src/app/laptops/LaptopsClient.tsx',
  'src/app/tablets/TabletsClient.tsx',
  'src/app/smartwatches/SmartwatchesClient.tsx',
  'src/app/headphones/HeadphonesClient.tsx',
  'src/app/appliances/AppliancesClient.tsx',
  'src/app/monitors/MonitorsClient.tsx',
  'src/app/consoles/ConsolesClient.tsx'
];

categoryFiles.forEach(file => {
  const p = path.join(process.cwd(), file);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (!content.includes("import { useI18n } from '@/lib/i18n/context';")) {
      content = "import { useI18n } from '@/lib/i18n/context';\n" + content;
      fs.writeFileSync(p, content, 'utf8');
    }
  }
});

console.log('✅ All imports and usages fixed.');
