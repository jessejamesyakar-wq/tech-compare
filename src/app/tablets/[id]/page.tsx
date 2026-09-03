import { Metadata } from 'next';
import { getTabletById, getProductById } from '@/lib/data';
import TabletsDetailClient from './TabletsDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getTabletById(id)) ?? (await getProductById(id)) ?? null;

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

  const title = `${product.name} Fiyatları - En Ucuz ${bestPrice.toLocaleString('tr-TR')}₺ | aceleEtme`;
  const description = `${product.name} fiyatlarını karşılaştır, ${storeCount} mağazadan en uygun fiyatı bul. ${product.brand || ''} ${product.category || ''} modelleri arasında en iyi fırsatlar aceleEtme'de.`;
  const canonical = `https://www.aceleetme.tech/tablets/${slug}`;

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

export default async function TabletsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getTabletById(id)) ?? (await getProductById(id)) ?? null;
  return <TabletsDetailClient initialProduct={product as any} />;
}
