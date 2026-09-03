import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/data';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Automatically revalidate every 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.aceleetme.tech';
  const now = new Date();

  // 1. Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/alerts`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/gizlilik-politikasi`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/kullanim-kosullari`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/yasal-uyari`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
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
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // 3. Dynamic Product Pages (from dataset)
  const allProducts = await getAllProducts();

  const productRoutes: MetadataRoute.Sitemap = allProducts.map((p) => {
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

    return {
      url: `${baseUrl}/${pathPrefix}/${slug}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: p.isFeatured || p.isPopular ? 0.85 : 0.75,
    };
  });

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
