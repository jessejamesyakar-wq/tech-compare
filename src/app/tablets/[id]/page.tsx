import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getTabletById, findProductByIdSafe } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import TabletsDetailClient from './TabletsDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getTabletById(id)) ?? (await findProductByIdSafe(id)) ?? null;
  return buildProductMetadata(product, 'tablets');
}

export default async function TabletsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getTabletById(id)) ?? (await findProductByIdSafe(id)) ?? null;

  if (!product) {
    notFound();
  }

  const expectedCategory = product.category === 'smartphones' ? 'phones' : product.category;
  const canonicalSlug = product.slug || product.id;

  if (expectedCategory && (expectedCategory !== 'tablets' || id !== canonicalSlug)) {
    permanentRedirect(`/${expectedCategory}/${canonicalSlug}`);
  }

  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <TabletsDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
