import type { Metadata } from 'next';
import { getAllHeadphones } from '@/lib/data';
import { buildCategoryMetadata } from '@/lib/seoHelper';
import HeadphonesClient from './HeadphonesClient';

export const revalidate = 3600;
export const metadata: Metadata = buildCategoryMetadata('headphones');

export default async function HeadphonesPage() {
  const products = await getAllHeadphones();
  return <HeadphonesClient initialProducts={products} />;
}
