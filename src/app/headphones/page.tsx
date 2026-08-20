import { getAllHeadphones } from '@/lib/data';
import HeadphonesClient from './HeadphonesClient';

export const revalidate = 3600;

export default async function HeadphonesPage() {
  const products = await getAllHeadphones();
  return <HeadphonesClient initialProducts={products} />;
}
