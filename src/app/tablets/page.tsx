import { getAllTablets } from '@/lib/data';
import TabletsClient from './TabletsClient';

export default async function TabletsPage({
  searchParams
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  await searchParams;
  const products = await getAllTablets();
  return <TabletsClient initialProducts={products} />;
}
