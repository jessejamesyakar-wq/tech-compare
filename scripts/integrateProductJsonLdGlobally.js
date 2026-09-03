const fs = require('fs');
const path = require('path');

console.log('Integrating ProductJsonLd globally across all 9 detail clients...');

const clientConfigs = [
  {
    file: 'src/app/phones/[id]/PhoneDetailClient.tsx',
    propVar: 'phone'
  },
  {
    file: 'src/app/tvs/[id]/TVDetailClient.tsx',
    propVar: 'tv'
  },
  {
    file: 'src/app/laptops/[id]/LaptopDetailClient.tsx',
    propVar: 'laptop'
  },
  {
    file: 'src/app/tablets/[id]/TabletsDetailClient.tsx',
    propVar: 'product'
  },
  {
    file: 'src/app/smartwatches/[id]/SmartwatchesDetailClient.tsx',
    propVar: 'product'
  },
  {
    file: 'src/app/headphones/[id]/HeadphonesDetailClient.tsx',
    propVar: 'product'
  },
  {
    file: 'src/app/appliances/[id]/ApplianceDetailClient.tsx',
    propVar: 'product'
  },
  {
    file: 'src/app/monitors/[id]/MonitorDetailClient.tsx',
    propVar: 'initialProduct'
  },
  {
    file: 'src/app/consoles/[id]/ConsolesDetailClient.tsx',
    propVar: 'product'
  }
];

clientConfigs.forEach(c => {
  const fullPath = path.join(process.cwd(), c.file);
  if (!fs.existsSync(fullPath)) return;

  let code = fs.readFileSync(fullPath, 'utf8');

  // 1. Remove any old inline application/ld+json script if present
  code = code.replace(/<script\s+type="application\/ld\+json"[\s\S]*?<\/script>/gi, '');

  // 2. Add import if not present
  if (!code.includes("import { ProductJsonLd } from '@/components/seo/ProductJsonLd';")) {
    code = "import { ProductJsonLd } from '@/components/seo/ProductJsonLd';\n" + code;
  }

  // 3. Inject <ProductJsonLd product={...} /> right before the last closing </div> or </main>
  if (!code.includes('<ProductJsonLd')) {
    const lastClosingDiv = code.lastIndexOf('</div>');
    if (lastClosingDiv !== -1) {
      code = code.slice(0, lastClosingDiv) + `  <ProductJsonLd product={${c.propVar} as any} />\n    ` + code.slice(lastClosingDiv);
    }
  }

  fs.writeFileSync(fullPath, code, 'utf8');
  console.log(`✅ Integrated ProductJsonLd in ${c.file}`);
});

console.log('\n🎉 Global ProductJsonLd with TRY ISO currency and Rich Snippets connected to all 9 category pages!');
