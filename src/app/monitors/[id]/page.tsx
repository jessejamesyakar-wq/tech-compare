import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { getMonitorById, findProductByIdSafe } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import MonitorDetailClient from './MonitorDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getMonitorById(id)) ?? (await findProductByIdSafe(id)) ?? null;
  return buildProductMetadata(product, 'monitors');
}

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getMonitorById(id)) ?? (await findProductByIdSafe(id)) ?? null;

  if (!product) {
    notFound();
  }

  const expectedCategory = product.category === 'smartphones' ? 'phones' : product.category;
  const canonicalSlug = product.slug || product.id;

  if (expectedCategory && (expectedCategory !== 'monitors' || id !== canonicalSlug)) {
    permanentRedirect(`/${expectedCategory}/${canonicalSlug}`);
  }

  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <MonitorDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
