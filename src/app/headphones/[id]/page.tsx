import { getHeadphoneById, getProductById } from '@/lib/data';
import HeadphonesDetailClient from './HeadphonesDetailClient';

export default async function HeadphonesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getHeadphoneById(id)) ?? (await getProductById(id)) ?? null;
  return <HeadphonesDetailClient initialProduct={product} />;
}
