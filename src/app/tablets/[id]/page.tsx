import { getTabletById, getProductById } from '@/lib/data';
import TabletsDetailClient from './TabletsDetailClient';

export default async function TabletsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getTabletById(id)) ?? (await getProductById(id)) ?? null;
  return <TabletsDetailClient initialProduct={product} />;
}
