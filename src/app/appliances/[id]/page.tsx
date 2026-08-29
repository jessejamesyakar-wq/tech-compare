import { getApplianceById, getProductById } from '@/lib/data';
import ApplianceDetailClient from './ApplianceDetailClient';

export default async function ApplianceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getApplianceById(id)) ?? ((await getProductById(id)) as any) ?? null;
  return <ApplianceDetailClient initialApplianceProduct={product} />;
}
