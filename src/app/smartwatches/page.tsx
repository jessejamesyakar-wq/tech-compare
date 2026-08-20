import { getAllSmartwatches } from '@/lib/data';
import SmartwatchesClient from './SmartwatchesClient';

export default async function SmartwatchesPage({
  searchParams
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  await searchParams;
  const products = await getAllSmartwatches();
  return <SmartwatchesClient initialProducts={products} />;
}
