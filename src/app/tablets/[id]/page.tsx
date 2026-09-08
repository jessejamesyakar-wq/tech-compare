import { Suspense } from 'react';
import { Metadata } from 'next';
import { getTabletById, getProductById } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import TabletsDetailClient from './TabletsDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getTabletById(id)) ?? (await getProductById(id)) ?? null;
  return buildProductMetadata(product, 'tablets');
}

export default async function TabletsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getTabletById(id)) ?? (await getProductById(id)) ?? null;
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <TabletsDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
