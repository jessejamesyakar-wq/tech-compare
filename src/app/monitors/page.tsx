import { getAllMonitors } from '@/lib/data';
import MonitorsClient from './MonitorsClient';

export const revalidate = 3600;

export default async function MonitorsPage() {
  const products = await getAllMonitors();
  return <MonitorsClient initialProducts={products} />;
}
