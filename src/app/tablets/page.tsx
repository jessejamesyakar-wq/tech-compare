import { Suspense } from 'react';
import { Metadata } from 'next';
import { getAllTablets } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import TabletsClient from './TabletsClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('tablets');

export default async function TabletsPage() {
  const products = await getAllTablets();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <TabletsClient initialProducts={products} />
    </Suspense>
  );
}
