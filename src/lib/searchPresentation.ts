import type { Product } from './types';
import { getPriceFreshness } from './priceFreshness';

export type SearchProduct = Product & {
  currentPrice?: number | null; lastSeenPrice?: number | null; displayPrice?: number | null;
  priceStatus?: string; statusLabel?: string; lastCheckedAt?: string; activeStoreCount?: number;
};
const categoryPaths: Record<string, string> = { smartphones: 'phones', phones: 'phones', laptops: 'laptops',
  tvs: 'tvs', appliances: 'appliances', tablets: 'tablets', smartwatches: 'smartwatches',
  headphones: 'headphones', consoles: 'consoles', monitors: 'monitors' };

export function getSearchProductHref(p: Pick<Product, 'category' | 'slug' | 'id' | 'name'>): string {
  const path = categoryPaths[p.category];
  const identity = p.slug || p.id;
  return path && identity ? `/${path}/${encodeURIComponent(identity)}` : `/search?q=${encodeURIComponent(p.name)}`;
}
const positive = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;

/** Consume the server's verified projection; never reconstruct offers from basePrice. */
export function getSearchPrice(p: SearchProduct, nowMs = Date.now()) {
  const date = getPriceFreshness(p.lastCheckedAt, nowMs);
  const current = positive(p.currentPrice);
  const previous = positive(p.lastSeenPrice);
  const count = Number.isInteger(p.activeStoreCount) && (p.activeStoreCount ?? 0) > 0 ? p.activeStoreCount! : 0;
  if (p.priceStatus === 'fresh' && date.status === 'fresh' && current !== null && count > 0) {
    return { value: current, status: 'fresh', label: 'Güncel Fiyat', heading: `${count} Mağaza Teklifi` };
  }
  if ((p.priceStatus === 'stale' || p.priceStatus === 'fresh') && date.status === 'stale' && (previous ?? current) !== null) {
    return { value: previous ?? current, status: 'stale', label: date.label, heading: 'Son Görülen Fiyat' };
  }
  return { value: positive(p.basePrice), status: 'unverified', label: 'Fiyat doğrulanmadı', heading: 'Katalog Referans Fiyatı' };
}
export function compareSearchPrices(a: SearchProduct, b: SearchProduct, direction: 'asc' | 'desc', nowMs = Date.now()) {
  const p1 = getSearchPrice(a, nowMs).value, p2 = getSearchPrice(b, nowMs).value;
  if (p1 === null) return p2 === null ? 0 : 1;
  if (p2 === null) return -1;
  return direction === 'asc' ? p1 - p2 : p2 - p1;
}
export function parseSearchLimit(raw: string | null): number {
  if (!raw || !/^\d+$/.test(raw)) return 20;
  const n = Number(raw);
  return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 100) : 20;
}
