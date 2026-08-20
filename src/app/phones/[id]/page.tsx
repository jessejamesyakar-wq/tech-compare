import { getSmartphoneById } from '@/lib/data';
import PhoneDetailClient from './PhoneDetailClient';

export default async function PhoneDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const phone = (await getSmartphoneById(id)) ?? null;
  return <PhoneDetailClient initialPhone={phone} />;
}
