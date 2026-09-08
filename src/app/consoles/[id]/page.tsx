import { Suspense } from 'react';
import { Metadata } from 'next';
import { getConsoleById, getProductById } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import ConsolesDetailClient from './ConsolesDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getConsoleById(id)) ?? (await getProductById(id)) ?? null;
  return buildProductMetadata(product, 'consoles');
}

export default async function ConsolesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getConsoleById(id)) ?? (await getProductById(id)) ?? null;
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <ConsolesDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
