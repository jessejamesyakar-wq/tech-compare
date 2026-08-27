import { PriceResult } from '@/integrations/stores/types';
import { DbPrice } from '@/lib/db/priceRepository';
import { PriceAnomalyDetector } from './anomalyDetector';

export interface NormalizedPriceView extends DbPrice {
  isCheapest: boolean;
  formattedPrice: string;
  formattedTotalPrice: string;
  formattedShipping: string;
  isStale: boolean;
  updatedTimeAgo: string;
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
    const diffMs = Date.now() - new Date(dateIso).getTime();
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
    const diffMs = Date.now() - new Date(dateIso).getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return hours > 24;
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
      sellerName: result.sellerName || 'Resmi Mağaza',
      url: result.url,
      isAnomaly: anomalyEval.isAnomaly,
      checkedAt: result.checkedAt || new Date().toISOString(),
    };
  }

  /**
   * Prepare UI View List sorted by lowest total price with cheapest badge
   */
  static preparePriceViewList(prices: DbPrice[]): NormalizedPriceView[] {
    // Exclude anomalies from frontend view list
    const validPrices = prices
      .filter((p) => !p.isAnomaly && p.stockStatus !== 'OUT_OF_STOCK')
      .sort((a, b) => a.totalPrice - b.totalPrice);

    const lowestTotalPrice = validPrices.length > 0 ? validPrices[0].totalPrice : null;

    return prices
      .filter((p) => !p.isAnomaly)
      .sort((a, b) => a.totalPrice - b.totalPrice)
      .map((item) => {
        const isCheapest = lowestTotalPrice !== null && item.totalPrice === lowestTotalPrice && item.stockStatus === 'IN_STOCK';
        return {
          ...item,
          isCheapest,
          formattedPrice: this.formatCurrency(item.price),
          formattedTotalPrice: this.formatCurrency(item.totalPrice),
          formattedShipping:
            !item.shippingPrice || item.shippingPrice === 0
              ? 'Ücretsiz Kargo'
              : this.formatCurrency(item.shippingPrice),
          isStale: this.isPriceStale(item.checkedAt),
          updatedTimeAgo: this.getTimeAgo(item.checkedAt),
        };
      });
  }
}
