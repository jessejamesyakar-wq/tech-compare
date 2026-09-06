import { Suspense } from 'react';
import { getCatalogAppliances } from '@/lib/data';
import AppliancesClient from './AppliancesClient';

export const revalidate = 3600;

export default async function AppliancesPage() {
  const products = await getCatalogAppliances();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <AppliancesClient initialProducts={products} />
    </Suspense>
  );
}

