import { getAllProducts, getPopularComparisonsData, isCanonicalExcluded } from '@/lib/data';
import { get2026ShowcaseData } from '@/lib/showcase2026';
import { calculatePriceSignal } from '@/lib/priceSignal';
import { getLifecycleHomeData } from '@/lib/productLifecycle';
import { HomePageClient, type HomepageDecision } from '@/components/home/HomePageClient';

export const revalidate = 3600;

export default async function HomePage() {
  const [allProducts, comparisons] = await Promise.all([getAllProducts(), getPopularComparisonsData()]);
  // Count the same canonical identities used by catalog pages. Never include quarantined aliases.
  const products = allProducts.filter(product => !isCanonicalExcluded(product.id) && !isCanonicalExcluded(product.slug));
  const counts = {
    smartphones: products.filter(p => p.category === 'smartphones').length,
    laptops: products.filter(p => p.category === 'laptops').length,
    tvs: products.filter(p => p.category === 'tvs').length,
    appliances: products.filter(p => p.category === 'appliances').length,
    tablets: products.filter(p => p.category === 'tablets').length,
    smartwatches: products.filter(p => p.category === 'smartwatches').length,
    headphones: products.filter(p => p.category === 'headphones').length,
    consoles: products.filter(p => p.category === 'consoles').length,
    monitors: products.filter(p => p.category === 'monitors').length,
  };
  const phones = products.filter(product => product.category === 'smartphones');
  const popularComparisons = comparisons.flatMap(comparison => {
    const first = phones.find(p => p.id === comparison.phone1Id || p.slug === comparison.phone1Id);
    const second = phones.find(p => p.id === comparison.phone2Id || p.slug === comparison.phone2Id);
    if (!first || !second) return [];
    return [{ phone1Id: first.slug || first.id, phone2Id: second.slug || second.id, phone1Name: first.name, phone2Name: second.name }];
  });
  // Preserve the existing canonical 2026 selection and client rotation contracts.
  const showcase2026 = get2026ShowcaseData(products);
  const lifecycleHome = getLifecycleHomeData(products, { value2025: 8, archive2024: 6, archiveClassic: 6 });
  const decisions: HomepageDecision[] = ['smartphones', 'laptops', 'tvs'].flatMap(category => {
    const showcaseProduct = showcase2026.initialProducts.find(product => product.category === category);
    if (!showcaseProduct) return [];
    const product = products.find(candidate => candidate.id === showcaseProduct.id);
    if (!product) return [];
    const signal = calculatePriceSignal(product);
    // Do not send synthetic history, catalog reference prices or placeholder scores to this UI.
    return [{ id: product.id, name: product.name, image: product.image, href: showcaseProduct.detailHref, signal: { status: signal.status, title: signal.title, explanation: signal.explanation } }];
  });
  return <HomePageClient popularComparisons={popularComparisons} counts={counts} showcase2026={showcase2026} decisions={decisions} lifecycleHome={lifecycleHome} />;
}
