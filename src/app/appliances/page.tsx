import { Suspense } from 'react';
import { Metadata } from 'next';
import { getCatalogAppliances } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import AppliancesClient from './AppliancesClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('appliances');

export default async function AppliancesPage() {
  const products = await getCatalogAppliances();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <AppliancesClient initialProducts={products} />
    </Suspense>
  );
}

