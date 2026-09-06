import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSmartphoneById, findProductByIdSafe } from '@/lib/data';
import PhoneDetailClient from './PhoneDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getSmartphoneById(id)) ?? (await findProductByIdSafe(id)) ?? null;

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
  const canonical = `https://www.aceleetme.tech/phones/${slug}`;

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

export default async function PhoneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getSmartphoneById(id)) ?? (await findProductByIdSafe(id)) ?? null;

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <PhoneDetailClient initialPhone={product as any} />
    </Suspense>
  );
}
