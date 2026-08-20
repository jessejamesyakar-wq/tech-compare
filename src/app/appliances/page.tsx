import { getAllAppliances } from '@/lib/data';
import AppliancesClient from './AppliancesClient';

export const revalidate = 3600;

export default async function AppliancesPage() {
  const products = await getAllAppliances();
  return <AppliancesClient initialProducts={products} />;
}
