import type { Metadata } from 'next';
import { getAllMonitors } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import MonitorsClient from './MonitorsClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('monitors');

export default async function MonitorsPage() {
  const products = await getAllMonitors();
  return <MonitorsClient initialProducts={products} />;
}
