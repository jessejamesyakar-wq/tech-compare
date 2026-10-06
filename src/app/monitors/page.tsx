import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllMonitors } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import MonitorsClient from './MonitorsClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildCategoryMetadata('monitors');

export default async function MonitorsPage() {
  const products = await getAllMonitors();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <MonitorsClient initialProducts={products} />
    </Suspense>
  );
}

