import { getMonitorById, getProductById } from '@/lib/data';
import MonitorDetailClient from './MonitorDetailClient';

export default async function MonitorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = (await getMonitorById(id)) ?? (await getProductById(id)) ?? null;
  return <MonitorDetailClient initialProduct={product} />;
}
