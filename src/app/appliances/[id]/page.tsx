import { Suspense } from 'react';
import { Metadata } from 'next';
import { getApplianceById, getProductById } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import ApplianceDetailClient from './ApplianceDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getApplianceById(id)) ?? (await getProductById(id)) ?? null;
  return buildProductMetadata(product, 'appliances');
}

export default async function ApplianceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getApplianceById(id)) ?? (await getProductById(id)) ?? null;
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <ApplianceDetailClient initialApplianceProduct={product as any} />
    </Suspense>
  );
}
