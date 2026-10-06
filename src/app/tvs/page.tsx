import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getCatalogTVs } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import TVsClient from './TVsClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildCategoryMetadata('tvs');

export default async function TVsPage() {
  const tvs = await getCatalogTVs();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <TVsClient initialTVs={tvs} />
    </Suspense>
  );
}

