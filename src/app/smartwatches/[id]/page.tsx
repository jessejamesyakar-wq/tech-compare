import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getSmartwatchById, findProductByIdSafe } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import SmartwatchesDetailClient from './SmartwatchesDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getSmartwatchById(id)) ?? (await findProductByIdSafe(id)) ?? null;
  return buildProductMetadata(product, 'smartwatches');
}

export default async function SmartwatchesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getSmartwatchById(id)) ?? (await findProductByIdSafe(id)) ?? null;

  if (!product) {
    notFound();
  }

  const expectedCategory = product.category === 'smartphones' ? 'phones' : product.category;
  const canonicalSlug = product.slug || product.id;

  if (expectedCategory && (expectedCategory !== 'smartwatches' || id !== canonicalSlug)) {
    permanentRedirect(`/${expectedCategory}/${canonicalSlug}`);
  }

  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <SmartwatchesDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
