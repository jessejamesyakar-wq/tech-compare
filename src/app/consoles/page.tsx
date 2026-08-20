import { getAllConsoles } from '@/lib/data';
import ConsolesClient from './ConsolesClient';

export const revalidate = 3600;

export default async function ConsolesPage() {
  const products = await getAllConsoles();
  return <ConsolesClient initialProducts={products} />;
}
