import { PriceResult } from '@/integrations/stores/types';
import { DbPrice } from '@/lib/db/priceRepository';
import { PriceAnomalyDetector } from './anomalyDetector';
import { readPriceRecord } from './priceRecordEvidence';
import { getPriceFreshness } from '@/lib/priceFreshness';
import { parseOfferDateToMs } from '@/lib/dateParsing';

export interface NormalizedPriceView extends DbPrice {
  isCheapest: boolean;
  formattedPrice: string;
  formattedTotalPrice: string;
  formattedShipping: string;
  isStale: boolean;
  updatedTimeAgo: string;
  priceStatus: 'fresh' | 'stale' | 'unverified';
  statusLabel: string;
}

export class PriceNormalizer {
  /**
   * Format Turkish Lira Currency (e.g. 57.999 ₺)
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate human readable time ago (e.g. 5 dk önce)
   */
  static getTimeAgo(dateIso: string): string {
    const timestamp = parseOfferDateToMs(dateIso);
    if (!timestamp || timestamp > Date.now()) return 'Kontrol tarihi doğrulanmadı';
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return `${diffDays} gün önce`;
  }

  /**
   * Check if price is stale (>24 hours)
   */
  static isPriceStale(dateIso: string): boolean {
    return getPriceFreshness(dateIso).status !== 'fresh';
  }

  /**
   * Normalize store raw price result into database record
   */
  static normalizeRawResult(
    productId: string,
    storeId: string,
    result: PriceResult,
    previousPrice?: number,
    baseCatalogPrice?: number
  ): DbPrice {
    const cleanPrice = Number(Math.max(0, result.price).toFixed(2));
    const cleanShipping = result.shippingPrice !== null && result.shippingPrice !== undefined ? Number(Math.max(0, result.shippingPrice).toFixed(2)) : null;
    const cleanTotal = cleanShipping !== null ? Number((cleanPrice + cleanShipping).toFixed(2)) : cleanPrice;

    // Check for anomalies
    const anomalyEval = PriceAnomalyDetector.evaluate(cleanPrice, previousPrice, baseCatalogPrice);

    return {
      id: `pr_${productId}_${storeId}_${result.sellerName.replace(/\s+/g, '_')}`,
      productId,
      storeId,
      storeProductId: result.storeProductId,
      price: cleanPrice,
      shippingPrice: cleanShipping,
      totalPrice: cleanTotal,
      currency: 'TRY',
      stockStatus: result.stockStatus,
      sellerName: result.sellerName || '',
      url: result.url,
      isAnomaly: anomalyEval.isAnomaly,
      checkedAt: result.checkedAt || '',
    };
  }

  /**
   * Prepare UI View List sorted by lowest total price with cheapest badge
   */
  static preparePriceViewList(prices: DbPrice[]): NormalizedPriceView[] {
    const nowMs = Date.now();
    const records = prices.map(readPriceRecord).filter((p): p is DbPrice => p !== null && !p.isAnomaly);
    const current = records.filter((p) => p.stockStatus === 'IN_STOCK' && getPriceFreshness(p.checkedAt, nowMs).status === 'fresh');
    // Same item-price basis as the shared product evaluator; shipping stays explicit.
    const lowestPrice = current.length ? Math.min(...current.map((p) => p.price)) : null;

    return records.sort((a, b) => a.price - b.price)
      .map((item) => {
        const freshness = getPriceFreshness(item.checkedAt, nowMs);
        const isCheapest = lowestPrice !== null && item.price === lowestPrice && item.stockStatus === 'IN_STOCK' && freshness.status === 'fresh';
        return {
          ...item,
          isCheapest,
          formattedPrice: this.formatCurrency(item.price),
          formattedTotalPrice: this.formatCurrency(item.totalPrice),
          formattedShipping:
            item.shippingPrice === null || item.shippingPrice === undefined ? 'Kargo ücreti bilinmiyor'
              : item.shippingPrice === 0 ? 'Ücretsiz Kargo' : this.formatCurrency(item.shippingPrice),
          isStale: freshness.status !== 'fresh',
          priceStatus: freshness.status,
          statusLabel: freshness.label,
          updatedTimeAgo: this.getTimeAgo(item.checkedAt),
        };
      });
  }
}
