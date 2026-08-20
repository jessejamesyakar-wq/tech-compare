import { getTVById } from '@/lib/data';
import TVDetailClient from './TVDetailClient';

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tv = (await getTVById(id)) ?? null;
  return <TVDetailClient initialTVProduct={tv} />;
}
