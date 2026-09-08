import { Suspense } from 'react';
import { Metadata } from 'next';
import { getSmartwatchById, getProductById } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import SmartwatchesDetailClient from './SmartwatchesDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getSmartwatchById(id)) ?? (await getProductById(id)) ?? null;
  return buildProductMetadata(product, 'smartwatches');
}

export default async function SmartwatchesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getSmartwatchById(id)) ?? (await getProductById(id)) ?? null;
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <SmartwatchesDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
