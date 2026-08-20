import { getAllBrands, getAllSmartphones } from '@/lib/data';
import PhonesClient from './PhonesClient';

export default async function PhonesPage({
  searchParams
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const { brand } = await searchParams;
  const [phones, brands] = await Promise.all([getAllSmartphones(), getAllBrands()]);
  const brandCounts: Record<string, number> = {};
  phones.forEach((p) => {
    if (p.brand) brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
  });
  const initialPhones = brand ? phones.filter((p) => p.brand === brand) : phones;
  return (
    <PhonesClient
      initialPhones={initialPhones}
      initialBrands={brands}
      initialBrandCounts={brandCounts}
    />
  );
}
