import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllHeadphones } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import HeadphonesClient from './HeadphonesClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = buildCategoryMetadata('headphones');

export default async function HeadphonesPage() {
  const products = await getAllHeadphones();
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-slate-500 font-bold">Yükleniyor...</div>}>
      <HeadphonesClient initialProducts={products} />
    </Suspense>
  );
}

