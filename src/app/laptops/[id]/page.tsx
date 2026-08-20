import { getLaptopById, getProductById } from '@/lib/data';
import { LaptopProduct } from '@/lib/types';
import LaptopDetailClient from './LaptopDetailClient';

export default async function LaptopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const laptop = (await getLaptopById(id)) ?? ((await getProductById(id)) as LaptopProduct | null) ?? null;
  return <LaptopDetailClient initialLaptopProduct={laptop} />;
}
