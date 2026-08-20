import { getAllTVs } from '@/lib/data';
import TVsClient from './TVsClient';

export const revalidate = 3600;

export default async function TVsPage() {
  const tvs = await getAllTVs();
  return <TVsClient initialTVs={tvs} />;
}
