import { Suspense } from 'react';
import { Metadata } from 'next';
import { getMonitorById, getProductById } from '@/lib/data';
import { buildProductMetadata } from '@/lib/seoHelper';
import MonitorDetailClient from './MonitorDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await getMonitorById(id)) ?? (await getProductById(id)) ?? null;
  return buildProductMetadata(product, 'monitors');
}

export default async function MonitorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await getMonitorById(id)) ?? (await getProductById(id)) ?? null;
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs font-bold text-slate-400 animate-pulse">Ürün yükleniyor...</div>}>
      <MonitorDetailClient initialProduct={product as any} />
    </Suspense>
  );
}
