import { getCatalogLaptops } from '@/lib/data';
import LaptopsClient from './LaptopsClient';

export const revalidate = 3600;

export default async function LaptopsPage() {
  const laptops = await getCatalogLaptops();
  return <LaptopsClient initialLaptops={laptops} />;
}
