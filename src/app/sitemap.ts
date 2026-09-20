import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.aceleetme.tech';

  // 1. Indexable Static Content Pages (EXCLUDES /search, /alerts, /compare, /duello, /admin)
  // Omit lastModified when no proven content modification timestamp exists
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kullanim-kosullari`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/yasal-uyari`,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/iletisim`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  // 2. Category Hub Pages
  const categoryPaths = [
    'phones',
    'tvs',
    'laptops',
    'tablets',
    'smartwatches',
    'headphones',
    'appliances',
    'monitors',
    'consoles',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categoryPaths.map((cat) => ({
    url: `${baseUrl}/${cat}`,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Dynamic Canonical Product Pages (deduplicated by full canonical URL)
  const allProducts = await getAllProducts();
  const seenUrls = new Set<string>();
  const productRoutes: MetadataRoute.Sitemap = [];

  for (const p of allProducts) {
    if (!p) continue;

    const slug = p.slug || p.id;
    let pathPrefix = 'phones';
    if (p.category === 'tvs') pathPrefix = 'tvs';
    else if (p.category === 'laptops') pathPrefix = 'laptops';
    else if (p.category === 'appliances') pathPrefix = 'appliances';
    else if (p.category === 'tablets') pathPrefix = 'tablets';
    else if (p.category === 'smartwatches') pathPrefix = 'smartwatches';
    else if (p.category === 'headphones') pathPrefix = 'headphones';
    else if (p.category === 'consoles') pathPrefix = 'consoles';
    else if (p.category === 'monitors') pathPrefix = 'monitors';

    const fullUrl = `${baseUrl}/${pathPrefix}/${slug}`;
    if (!seenUrls.has(fullUrl)) {
      seenUrls.add(fullUrl);

      // Catalog timestamps do not track proven page-content changes. Omit lastmod
      // until that provenance exists; import/check times must not stand in for it.
      productRoutes.push({
        url: fullUrl,
        changeFrequency: 'daily',
        priority: p.isFeatured || p.isPopular ? 0.85 : 0.75,
      });
    }
  }

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
