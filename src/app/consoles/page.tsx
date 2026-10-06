import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllConsoles } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import ConsolesClient from './ConsolesClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildCategoryMetadata('consoles');

export default async function ConsolesPage() {
  const products = await getAllConsoles();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <ConsolesClient initialProducts={products} />
    </Suspense>
  );
}

