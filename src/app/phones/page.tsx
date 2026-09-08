import { Suspense } from 'react';
import { getAllBrands, getCatalogSmartphones } from '@/lib/data';
import { Metadata } from 'next';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import PhonesClient from './PhonesClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('phones');

export default async function PhonesPage() {
  const [phones, brands] = await Promise.all([getCatalogSmartphones(), getAllBrands()]);
  const brandCounts: Record<string, number> = {};
  phones.forEach((p) => {
    if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });

  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <PhonesClient
        initialPhones={phones}
        initialBrands={brands}
        initialBrandCounts={brandCounts}
      />
    </Suspense>
  );
}
