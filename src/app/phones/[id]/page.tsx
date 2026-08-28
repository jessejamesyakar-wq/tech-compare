import { getSmartphoneById, getProductById } from '@/lib/data';
import PhoneDetailClient from './PhoneDetailClient';

export default async function PhoneDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const phone = (await getSmartphoneById(id)) ?? (await getProductById(id)) ?? null;
  return <PhoneDetailClient initialPhone={phone as any} />;
}
