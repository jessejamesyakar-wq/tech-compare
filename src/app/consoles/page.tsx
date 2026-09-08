import type { Metadata } from 'next';
import { getAllConsoles } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import ConsolesClient from './ConsolesClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('consoles');

export default async function ConsolesPage() {
  const products = await getAllConsoles();
  return <ConsolesClient initialProducts={products} />;
}
