import { Suspense } from 'react';
import { getAllSmartwatches } from '@/lib/data';
import SmartwatchesClient from './SmartwatchesClient';

export const revalidate = 3600;

export default async function SmartwatchesPage() {
  const products = await getAllSmartwatches();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <SmartwatchesClient initialProducts={products} />
    </Suspense>
  );
}
