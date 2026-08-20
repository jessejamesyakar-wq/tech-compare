import { getSmartwatchById, getProductById } from '@/lib/data';
import SmartwatchesDetailClient from './SmartwatchesDetailClient';

export default async function SmartwatchesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getSmartwatchById(id)) ?? (await getProductById(id)) ?? null;
  return <SmartwatchesDetailClient initialProduct={product} />;
}
