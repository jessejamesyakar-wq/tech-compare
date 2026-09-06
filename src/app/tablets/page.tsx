import { Suspense } from 'react';
import { getAllTablets } from '@/lib/data';
import TabletsClient from './TabletsClient';

export const revalidate = 3600;

export default async function TabletsPage() {
  const products = await getAllTablets();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <TabletsClient initialProducts={products} />
    </Suspense>
  );
}
