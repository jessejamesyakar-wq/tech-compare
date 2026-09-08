import { Suspense } from 'react';
import { Metadata } from 'next';
import { getHeadphoneById, getProductById } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import HeadphonesDetailClient from './HeadphonesDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getHeadphoneById(id)) ?? (await getProductById(id)) ?? null;
  return buildProductMetadata(product, 'headphones');
}

export default async function HeadphonesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getHeadphoneById(id)) ?? (await getProductById(id)) ?? null;
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <HeadphonesDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
