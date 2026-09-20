import { evaluateProductPricing } from './pricing/unifiedPriceEvaluator';
import type { StoreOffer } from './types';

type ListingProduct = {
  id: string; name: string; brand: string; specs?: unknown;
  basePrice?: number; storeOffers?: StoreOffer[]; rating?: number; releaseYear?: number; isPopular?: boolean;
};

export function normalizeCatalogQuery(value: string): string {
  return value.trim().toLocaleLowerCase('tr-TR').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ı/g, 'i').replace(/\s+/g, ' ');
}

export function getCatalogSearchText(product: ListingProduct): string {
  const values = (value: unknown, depth = 0): string => {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (!value || typeof value !== 'object' || depth > 5) return '';
    return Object.entries(value).map(([key, item]) => {
      const unit = typeof item === 'number' && /(?:ram|storage).*gb/i.test(key) ? `${item}GB`
        : typeof item === 'number' && /hz$/i.test(key) ? `${item}Hz` : '';
      return `${values(item, depth + 1)} ${unit}`;
    }).join(' ');
  };
  return normalizeCatalogQuery(`${product.name} ${product.brand} ${values(product.specs)}`);
}

export function getCatalogDisplayPrices(products: ListingProduct[]) {
  const now = Date.now();
  return new Map(products.map((product) => [product.id, evaluateProductPricing(product, now).displayPrice]));
}

export function compareListingProducts(a: ListingProduct, b: ListingProduct, sort: string, prices: Map<string, number | null>): number {
  if (sort === 'priceAsc' || sort === 'priceDesc') {
    const first = prices.get(a.id), second = prices.get(b.id);
    if (first == null) return second == null ? 0 : 1;
    if (second == null) return -1;
    return sort === 'priceAsc' ? first - second : second - first;
  }
  if (sort === 'rating') return (Number.isFinite(b.rating) ? b.rating! : -1) - (Number.isFinite(a.rating) ? a.rating! : -1);
  if (sort === 'newest') return (Number.isFinite(b.releaseYear) ? b.releaseYear! : 0) - (Number.isFinite(a.releaseYear) ? a.releaseYear! : 0);
  return Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular));
}
