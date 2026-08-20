import { getApplianceById } from '@/lib/data';
import ApplianceDetailClient from './ApplianceDetailClient';

export default async function ApplianceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getApplianceById(id)) ?? null;
  return <ApplianceDetailClient initialApplianceProduct={product} />;
}
