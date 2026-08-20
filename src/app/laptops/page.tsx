import { getAllLaptops } from '@/lib/data';
import LaptopsClient from './LaptopsClient';

export const revalidate = 3600;

export default async function LaptopsPage() {
  const laptops = await getAllLaptops();
  return <LaptopsClient initialLaptops={laptops} />;
}
