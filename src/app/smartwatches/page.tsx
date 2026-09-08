import { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllSmartwatches } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import SmartwatchesClient from './SmartwatchesClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('smartwatches');

export default async function SmartwatchesPage() {
  const products = await getAllSmartwatches();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <SmartwatchesClient initialProducts={products} />
    </Suspense>
  );
}
