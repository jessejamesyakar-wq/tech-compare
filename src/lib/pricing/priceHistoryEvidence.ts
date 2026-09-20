import type { PriceHistoryPoint } from '@/lib/types';
import { parseOfferDateToMs } from '@/lib/dateParsing';
import { isSearchUrl } from '@/lib/priceFreshness';

/** Legacy date/price pairs include generated series: they are not observations.
 * Writers must retain the actual check timestamp, direct product source and currency.
 * Neither a product-level verification date nor a plausible number establishes this.
 */
export function getObservedPriceHistory(points: PriceHistoryPoint[] = [], nowMs = Date.now()): PriceHistoryPoint[] {
  if (!Number.isFinite(nowMs) || !Array.isArray(points)) return [];
  const observations = new Map<string, PriceHistoryPoint | null>();
  for (const point of points) {
    if (!point || point.sourceType !== 'observed' || point.currency !== 'TRY') continue;
    if (!Number.isFinite(point.price) || point.price <= 0 || !point.store?.trim()) continue;
    const timestamp = parseOfferDateToMs(point.observedAt);
    if (!timestamp || timestamp > nowMs || timestamp !== parseOfferDateToMs(point.date)) continue;
    if (!point.sourceUrl?.startsWith('https://') || isSearchUrl(point.sourceUrl)) continue;
    const key = `${timestamp}|${point.store.trim()}|${point.sourceUrl}`;
    const existing = observations.get(key);
    // Conflicting duplicates cannot choose the most attractive price.
    if (observations.has(key) && (!existing || existing.price !== point.price)) observations.set(key, null);
    else observations.set(key, { ...point });
  }
  return [...observations.values()].filter((point): point is PriceHistoryPoint => point !== null)
    .sort((a, b) => parseOfferDateToMs(a.date) - parseOfferDateToMs(b.date));
}
