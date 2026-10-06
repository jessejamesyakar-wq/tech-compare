import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCatalogLaptops } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import LaptopsClient from './LaptopsClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildCategoryMetadata('laptops');

export default async function LaptopsPage() {
  const laptops = await getCatalogLaptops();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <LaptopsClient initialLaptops={laptops} />
    </Suspense>
  );
}

