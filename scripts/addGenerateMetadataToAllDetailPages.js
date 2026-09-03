const fs = require('fs');
const path = require('path');

console.log('Adding generateMetadata() to all 9 product detail pages...');

const pages = [
  {
    path: 'src/app/phones/[id]/page.tsx',
    categoryPath: 'phones',
    getFn: 'getSmartphoneById',
    clientComponent: 'PhoneDetailClient',
    clientProp: 'initialPhone',
    pageComponent: 'PhoneDetailPage'
  },
  {
    path: 'src/app/tvs/[id]/page.tsx',
    categoryPath: 'tvs',
    getFn: 'getTVById',
    clientComponent: 'TVDetailClient',
    clientProp: 'initialTVProduct',
    pageComponent: 'TVDetailPage'
  },
  {
    path: 'src/app/laptops/[id]/page.tsx',
    categoryPath: 'laptops',
    getFn: 'getLaptopById',
    clientComponent: 'LaptopDetailClient',
    clientProp: 'initialLaptopProduct',
    pageComponent: 'LaptopDetailPage'
  },
  {
    path: 'src/app/tablets/[id]/page.tsx',
    categoryPath: 'tablets',
    getFn: 'getTabletById',
    clientComponent: 'TabletsDetailClient',
    clientProp: 'initialProduct',
    pageComponent: 'TabletsDetailPage'
  },
  {
    path: 'src/app/smartwatches/[id]/page.tsx',
    categoryPath: 'smartwatches',
    getFn: 'getSmartwatchById',
    clientComponent: 'SmartwatchesDetailClient',
    clientProp: 'initialProduct',
    pageComponent: 'SmartwatchesDetailPage'
  },
  {
    path: 'src/app/headphones/[id]/page.tsx',
    categoryPath: 'headphones',
    getFn: 'getHeadphoneById',
    clientComponent: 'HeadphonesDetailClient',
    clientProp: 'initialProduct',
    pageComponent: 'HeadphonesDetailPage'
  },
  {
    path: 'src/app/appliances/[id]/page.tsx',
    categoryPath: 'appliances',
    getFn: 'getApplianceById',
    clientComponent: 'ApplianceDetailClient',
    clientProp: 'initialApplianceProduct',
    pageComponent: 'ApplianceDetailPage'
  },
  {
    path: 'src/app/monitors/[id]/page.tsx',
    categoryPath: 'monitors',
    getFn: 'getMonitorById',
    clientComponent: 'MonitorDetailClient',
    clientProp: 'initialProduct',
    pageComponent: 'MonitorDetailPage'
  },
  {
    path: 'src/app/consoles/[id]/page.tsx',
    categoryPath: 'consoles',
    getFn: 'getConsoleById',
    clientComponent: 'ConsolesDetailClient',
    clientProp: 'initialProduct',
    pageComponent: 'ConsolesDetailPage'
  }
];

pages.forEach(p => {
  const fullPath = path.join(process.cwd(), p.path);
  const code = `import { Metadata } from 'next';
import { ${p.getFn}, getProductById } from '@/lib/data';
import ${p.clientComponent} from './${p.clientComponent}';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await ${p.getFn}(id)) ?? (await getProductById(id)) ?? null;

  if (!product) {
    return {
      title: 'Ürün Bulunamadı | aceleEtme',
      description: 'Aradığınız ürün bulunamadı.',
    };
  }

  const slug = product.slug || product.id;
  const offers = product.storeOffers || [];
  const prices = offers.map((o) => o.price).filter((pr) => pr > 0);
  const bestPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice;
  const storeCount = offers.length > 0 ? offers.length : 8;

  const title = \`\${product.name} Fiyatları - En Ucuz \${bestPrice.toLocaleString('tr-TR')}₺ | aceleEtme\`;
  const description = \`\${product.name} fiyatlarını karşılaştır, \${storeCount} mağazadan en uygun fiyatı bul. \${product.brand || ''} \${product.category || ''} modelleri arasında en iyi fırsatlar aceleEtme'de.\`;
  const canonical = \`https://www.aceleetme.tech/${p.categoryPath}/\${slug}\`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'aceleEtme',
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ${p.pageComponent}({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await ${p.getFn}(id)) ?? (await getProductById(id)) ?? null;
  return <${p.clientComponent} ${p.clientProp}={product as any} />;
}
`;

  fs.writeFileSync(fullPath, code, 'utf8');
  console.log(`✅ Updated ${p.path} with generateMetadata()`);
});

console.log('\n🎉 All 9 category detail pages successfully equipped with dynamic SEO metadata!');
