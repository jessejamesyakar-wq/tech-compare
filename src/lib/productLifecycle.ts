import type { Product } from '@/lib/types';
import { getProductReleaseYear } from '@/lib/releaseYearFilter';

export type ProductLifecycleTier =
  | 'CURRENT'
  | 'VALUE'
  | 'ARCHIVE_ACTIVE'
  | 'ARCHIVE'
  | 'UNKNOWN';

export type ProductPricePriority =
  | 'VERY_HIGH'
  | 'HIGH'
  | 'LOW'
  | 'ON_DEMAND'
  | 'UNKNOWN';

export interface ProductLifecycleState {
  releaseYear: number | null;
  lifecycleTier: ProductLifecycleTier;
  pricePriority: ProductPricePriority;
  eraLabel: string;
  isArchive: boolean;
}

export interface LifecycleHomeProduct {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Product['category'];
  image: string;
  releaseYear: number;
  lifecycleTier: Exclude<ProductLifecycleTier, 'CURRENT' | 'UNKNOWN'>;
  pricePriority: Exclude<ProductPricePriority, 'VERY_HIGH' | 'UNKNOWN'>;
  eraLabel: string;
  detailHref: string;
  priceStatusLabel: string;
}

export interface LifecycleHomeData {
  value2025: LifecycleHomeProduct[];
  archive2024: LifecycleHomeProduct[];
  archiveClassic: LifecycleHomeProduct[];
}

function hasReleaseYearEvidence(product: Product): boolean {
  const candidate = product as Product & {
    releaseDate?: string;
    specs?: Record<string, unknown> & {
      releaseYear?: number;
      year?: number;
      releaseDate?: string;
    };
  };

  if (typeof candidate.releaseYear === 'number') return true;
  if (typeof candidate.releaseDate === 'string' && /\b(19\d\d|20\d\d)\b/.test(candidate.releaseDate)) return true;

  const specs = candidate.specs;
  if (!specs) return false;
  if (typeof specs.releaseYear === 'number' || typeof specs.year === 'number') return true;
  return typeof specs.releaseDate === 'string' && /\b(19\d\d|20\d\d)\b/.test(specs.releaseDate);
}

/**
 * Lifecycle classification is intentionally stricter than generic catalog year lookup:
 * name/slug year heuristics never qualify a product for a commercial lifecycle surface.
 */
export function classifyProductLifecycle(product: Product): ProductLifecycleState {
  const releaseYear = hasReleaseYearEvidence(product) ? getProductReleaseYear(product) : null;

  if (releaseYear === 2026) {
    return {
      releaseYear,
      lifecycleTier: 'CURRENT',
      pricePriority: 'VERY_HIGH',
      eraLabel: '2026 Güncel Nesil',
      isArchive: false,
    };
  }

  if (releaseYear === 2025) {
    return {
      releaseYear,
      lifecycleTier: 'VALUE',
      pricePriority: 'HIGH',
      eraLabel: '2025 Akıllı Fırsatlar',
      isArchive: false,
    };
  }

  if (releaseYear === 2024) {
    return {
      releaseYear,
      lifecycleTier: 'ARCHIVE_ACTIVE',
      pricePriority: 'LOW',
      eraLabel: '2024 Yakın Arşiv',
      isArchive: true,
    };
  }

  if (releaseYear !== null && releaseYear <= 2023) {
    return {
      releaseYear,
      lifecycleTier: 'ARCHIVE',
      pricePriority: 'ON_DEMAND',
      eraLabel: releaseYear + ' Teknoloji Arşivi',
      isArchive: true,
    };
  }

  return {
    releaseYear,
    lifecycleTier: 'UNKNOWN',
    pricePriority: 'UNKNOWN',
    eraLabel: 'Çıkış yılı doğrulanmadı',
    isArchive: false,
  };
}

function detailHref(product: Product): string {
  const slug = encodeURIComponent(product.slug || product.id);
  switch (product.category) {
    case 'smartphones': return '/phones/' + slug;
    case 'tvs': return '/tvs/' + slug;
    case 'laptops': return '/laptops/' + slug;
    case 'tablets': return '/tablets/' + slug;
    case 'smartwatches': return '/smartwatches/' + slug;
    case 'headphones': return '/headphones/' + slug;
    case 'consoles': return '/consoles/' + slug;
    case 'appliances': return '/appliances/' + slug;
    case 'monitors': return '/monitors/' + slug;
    default: return '/' + encodeURIComponent(product.category) + '/' + slug;
  }
}

function isPresentable(product: Product): boolean {
  if (!product.id || !product.name || !product.image) return false;
  if (product.image.includes('placeholder')) return false;
  return product.image !== '/images/product-placeholder.png';
}

function familyKey(product: Product): string {
  return ((product.brand || '') + '::' + (product.name || ''))
    .toLowerCase()
    .replace(/\b(64|128|256|512)\s*(gb)?\b/gi, '')
    .replace(/\b(1|2)\s*tb\b/gi, '')
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function score(product: Product): number {
  const rating = product.rating || 0;
  const reviews = product.reviewCount || 0;
  return (product.isFeatured ? 30 : 0)
    + (product.isPopular ? 20 : 0)
    + rating * 10
    + Math.log10(Math.max(1, reviews)) * 2;
}

function curate(products: Product[], limit: number): Product[] {
  const output: Product[] = [];
  const seenFamilies = new Set<string>();
  const brandCounts = new Map<string, number>();

  for (const product of [...products].sort((a, b) => score(b) - score(a))) {
    if (output.length >= limit) break;
    const brand = product.brand || 'Diğer';
    const family = familyKey(product);
    if (seenFamilies.has(family)) continue;
    if ((brandCounts.get(brand) || 0) >= 2) continue;

    output.push(product);
    seenFamilies.add(family);
    brandCounts.set(brand, (brandCounts.get(brand) || 0) + 1);
  }

  return output;
}

function toHomeProduct(product: Product): LifecycleHomeProduct | null {
  const lifecycle = classifyProductLifecycle(product);
  if (
    lifecycle.releaseYear === null
    || lifecycle.lifecycleTier === 'CURRENT'
    || lifecycle.lifecycleTier === 'UNKNOWN'
    || lifecycle.pricePriority === 'VERY_HIGH'
    || lifecycle.pricePriority === 'UNKNOWN'
  ) return null;

  return {
    id: product.id,
    slug: product.slug || product.id,
    name: product.name,
    brand: product.brand || '',
    category: product.category,
    image: product.image,
    releaseYear: lifecycle.releaseYear,
    lifecycleTier: lifecycle.lifecycleTier,
    pricePriority: lifecycle.pricePriority,
    eraLabel: lifecycle.eraLabel,
    detailHref: detailHref(product),
    priceStatusLabel:
      lifecycle.lifecycleTier === 'VALUE'
        ? 'Teklif yalnız doğrulandığında güncel kabul edilir'
        : 'Arşiv modeli · fiyat talep üzerine doğrulanır',
  };
}

/**
 * Input must already be canonical-safe. This helper intentionally has no access
 * to raw catalog loaders, price state, retailer state or persistence.
 */
export function getLifecycleHomeData(
  canonicalProducts: Product[],
  limits: { value2025?: number; archive2024?: number; archiveClassic?: number } = {},
): LifecycleHomeData {
  const presentable = canonicalProducts.filter(isPresentable);

  const select = (tier: ProductLifecycleTier, limit: number) =>
    curate(
      presentable.filter((product) => classifyProductLifecycle(product).lifecycleTier === tier),
      limit,
    ).map(toHomeProduct).filter(Boolean) as LifecycleHomeProduct[];

  return {
    value2025: select('VALUE', limits.value2025 ?? 8),
    archive2024: select('ARCHIVE_ACTIVE', limits.archive2024 ?? 6),
    archiveClassic: select('ARCHIVE', limits.archiveClassic ?? 6),
  };
}
