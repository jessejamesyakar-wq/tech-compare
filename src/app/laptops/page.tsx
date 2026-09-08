import type { Metadata } from 'next';
import { getCatalogLaptops } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import LaptopsClient from './LaptopsClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('laptops');

export default async function LaptopsPage() {
  const laptops = await getCatalogLaptops();
  return <LaptopsClient initialLaptops={laptops} />;
}
