import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getHeadphoneById, findProductByIdSafe } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import HeadphonesDetailClient from './HeadphonesDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getHeadphoneById(id)) ?? (await findProductByIdSafe(id)) ?? null;
  return buildProductMetadata(product, 'headphones');
}

export default async function HeadphonesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getHeadphoneById(id)) ?? (await findProductByIdSafe(id)) ?? null;

  if (!product) {
    notFound();
  }

  const expectedCategory = product.category === 'smartphones' ? 'phones' : product.category;
  const canonicalSlug = product.slug || product.id;

  if (expectedCategory && (expectedCategory !== 'headphones' || id !== canonicalSlug)) {
    permanentRedirect(`/${expectedCategory}/${canonicalSlug}`);
  }

  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <HeadphonesDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
