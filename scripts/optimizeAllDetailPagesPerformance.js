const fs = require('fs');
const path = require('path');

console.log('Optimizing all category detail pages for LCP, Next.js Image, and Code-Splitting...');

const targets = [
  {
    file: 'src/app/laptops/[id]/LaptopDetailClient.tsx',
    imgVar: 'laptop.image',
    nameVar: 'laptop.name',
    specSheet: 'LaptopSpecSheet'
  },
  {
    file: 'src/app/tablets/[id]/TabletsDetailClient.tsx',
    imgVar: 'product.image',
    nameVar: 'product.name',
    specSheet: 'SpecSheet'
  },
  {
    file: 'src/app/smartwatches/[id]/SmartwatchesDetailClient.tsx',
    imgVar: 'product.image',
    nameVar: 'product.name',
    specSheet: 'SpecSheet'
  },
  {
    file: 'src/app/headphones/[id]/HeadphonesDetailClient.tsx',
    imgVar: 'product.image',
    nameVar: 'product.name',
    specSheet: 'SpecSheet'
  },
  {
    file: 'src/app/appliances/[id]/ApplianceDetailClient.tsx',
    imgVar: 'product.image',
    nameVar: 'product.name',
    specSheet: 'SpecSheet'
  },
  {
    file: 'src/app/monitors/[id]/MonitorDetailClient.tsx',
    imgVar: 'initialProduct.image',
    nameVar: 'initialProduct.name',
    specSheet: 'SpecSheet'
  },
  {
    file: 'src/app/consoles/[id]/ConsolesDetailClient.tsx',
    imgVar: 'product.image',
    nameVar: 'product.name',
    specSheet: 'SpecSheet'
  }
];

targets.forEach(t => {
  const fullPath = path.join(process.cwd(), t.file);
  if (!fs.existsSync(fullPath)) return;

  let code = fs.readFileSync(fullPath, 'utf8');

  // 1. Add Image & dynamic imports if not present
  if (!code.includes("import Image from 'next/image';")) {
    code = code.replace("import React", "import Image from 'next/image';\nimport dynamic from 'next/dynamic';\nimport React");
  }

  // 2. Replace static PriceHistoryChart with dynamic
  if (code.includes("import { PriceHistoryChart } from '@/components/detail/PriceHistoryChart';")) {
    code = code.replace(
      "import { PriceHistoryChart } from '@/components/detail/PriceHistoryChart';",
      "const PriceHistoryChart = dynamic(() => import('@/components/detail/PriceHistoryChart').then(m => m.PriceHistoryChart), { loading: () => <div className=\"h-64 bg-slate-50 rounded-3xl animate-pulse\" /> });"
    );
  }

  // 3. Replace static SpecSheet with dynamic if imported
  if (code.includes(`import { ${t.specSheet} } from '@/components/detail/${t.specSheet}';`)) {
    code = code.replace(
      `import { ${t.specSheet} } from '@/components/detail/${t.specSheet}';`,
      `const ${t.specSheet} = dynamic(() => import('@/components/detail/${t.specSheet}').then(m => m.${t.specSheet}), { loading: () => <div className=\"h-64 bg-slate-50 rounded-3xl animate-pulse\" /> });`
    );
  }

  // 4. Replace PriceAlertModal with dynamic
  if (code.includes("import { PriceAlertModal } from '@/components/detail/PriceAlertModal';")) {
    code = code.replace(
      "import { PriceAlertModal } from '@/components/detail/PriceAlertModal';",
      "const PriceAlertModal = dynamic(() => import('@/components/detail/PriceAlertModal').then(m => m.PriceAlertModal), { ssr: false });"
    );
  }

  // 5. Replace BrandLogoBar with dynamic
  if (code.includes("import { BrandLogoBar } from '@/components/catalog/BrandLogoBar';")) {
    code = code.replace(
      "import { BrandLogoBar } from '@/components/catalog/BrandLogoBar';",
      "const BrandLogoBar = dynamic(() => import('@/components/catalog/BrandLogoBar').then(m => m.BrandLogoBar));"
    );
  }

  // 6. Replace hero <img ...> with Next.js <Image ... priority />
  code = code.replace(
    /<img\s+src=\{([^}]+)\}\s+alt=\{([^}]+)\}\s+className="([^"]*)"\s*\/>/g,
    `<Image src={$1} alt={$2} width={420} height={420} priority={true} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 420px" className="$3" />`
  );

  fs.writeFileSync(fullPath, code, 'utf8');
  console.log(`✅ Optimized ${t.file}`);
});

console.log('\n🎉 Performance optimizations applied across all product detail clients!');
