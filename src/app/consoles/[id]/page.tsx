import { getConsoleById, getProductById } from '@/lib/data';
import ConsolesDetailClient from './ConsolesDetailClient';

export default async function ConsolesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getConsoleById(id)) ?? (await getProductById(id)) ?? null;
  return <ConsolesDetailClient initialProduct={product} />;
}
