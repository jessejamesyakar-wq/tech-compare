import type { Metadata } from 'next';
import { getCatalogTVs } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import TVsClient from './TVsClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('tvs');

export default async function TVsPage() {
  const tvs = await getCatalogTVs();
  return <TVsClient initialTVs={tvs} />;
}
