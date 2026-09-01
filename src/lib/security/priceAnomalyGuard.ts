import { Product, StoreOffer, PriceHistoryPoint } from '@/lib/types';

export interface AnomalyRecord {
  id: string;
  productId: string;
  productName: string;
  category: string;
  storeName: string;
  storeKey?: string;
  incomingPrice: number;
  baselinePrice: number;
  deviationPercentage: number;
  direction: 'DROP' | 'SURGE';
  severity: 'HIGH_ANOMALY' | 'CRITICAL_SUSPICIOUS' | 'WARNING';
  reason: string;
  detectedAt: string;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  rawUrl?: string;
}

export interface GuardEvaluationResult {
  isAllowed: boolean;
  isAnomaly: boolean;
  deviationPercentage: number;
  baselinePrice: number;
  severity: 'NORMAL' | 'HIGH_ANOMALY' | 'CRITICAL_SUSPICIOUS';
  reason?: string;
  quarantineRecord?: AnomalyRecord;
}

/**
 * In-memory & Persistent Quarantine Queue for Pending Price Reviews
 */
class PriceAnomalyStore {
  private quarantineQueue: AnomalyRecord[] = [];

  constructor() {
    this.quarantineQueue = [];
  }

  public enqueue(record: AnomalyRecord): void {
    // Avoid duplicate queueing for the same product and price within 1 hour
    const exists = this.quarantineQueue.some(
      (r) =>
        r.productId === record.productId &&
        r.storeName === record.storeName &&
        r.incomingPrice === record.incomingPrice &&
        r.status === 'PENDING_REVIEW'
    );
    if (!exists) {
      this.quarantineQueue.unshift(record);
      // Cap memory queue to last 500 items
      if (this.quarantineQueue.length > 500) {
        this.quarantineQueue = this.quarantineQueue.slice(0, 500);
      }
    }
  }

  public getPendingReviews(): AnomalyRecord[] {
    return this.quarantineQueue.filter((r) => r.status === 'PENDING_REVIEW');
  }

  public getAll(): AnomalyRecord[] {
    return this.quarantineQueue;
  }

  public updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): boolean {
    const item = this.quarantineQueue.find((r) => r.id === id);
    if (item) {
      item.status = status;
      return true;
    }
    return false;
  }
}

export const priceAnomalyStore = new PriceAnomalyStore();

export class PriceAnomalyGuard {
  /**
   * Maximum permitted downward deviation from baseline before automatic quarantine (%30 limit)
   */
  public static readonly MAX_ALLOWED_DROP_PCT = 30;

  /**
   * Maximum permitted upward deviation from baseline before automatic quarantine (%100 limit)
   */
  public static readonly MAX_ALLOWED_SURGE_PCT = 100;

  /**
   * Calculate statistical robust baseline (Median of Price History & Existing Offers)
   */
  public static calculateBaseline(
    productOrBasePrice: number | { basePrice?: number; storeOffers?: StoreOffer[]; priceHistory?: PriceHistoryPoint[] }
  ): number {
    if (typeof productOrBasePrice === 'number') {
      return productOrBasePrice > 0 ? productOrBasePrice : 1;
    }

    const prices: number[] = [];
    if (productOrBasePrice.basePrice && productOrBasePrice.basePrice > 0) {
      prices.push(productOrBasePrice.basePrice);
    }
    if (productOrBasePrice.storeOffers && productOrBasePrice.storeOffers.length > 0) {
      productOrBasePrice.storeOffers.forEach((o) => {
        if (o.price > 0) prices.push(o.price);
      });
    }
    if (productOrBasePrice.priceHistory && productOrBasePrice.priceHistory.length > 0) {
      productOrBasePrice.priceHistory.forEach((h) => {
        if (h.price > 0) prices.push(h.price);
      });
    }

    if (prices.length === 0) return 1;

    // Calculate Median for resilience against outliers
    prices.sort((a, b) => a - b);
    const mid = Math.floor(prices.length / 2);
    return prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;
  }

  /**
   * Evaluates incoming scraped or updated price against %30 safety threshold.
   * If deviation > %30, blocks publication and enqueues to Pending Review.
   */
  public static evaluateAndGuard(params: {
    productId: string;
    productName: string;
    category?: string;
    storeName: string;
    incomingPrice: number;
    baselinePrice?: number;
    rawUrl?: string;
  }): GuardEvaluationResult {
    const { productId, productName, category = 'general', storeName, incomingPrice, rawUrl } = params;

    // 1. Sanity check: 0 or negative price
    if (!incomingPrice || incomingPrice <= 0 || isNaN(incomingPrice)) {
      const record: AnomalyRecord = {
        id: `anom_${productId}_${Date.now()}`,
        productId,
        productName,
        category,
        storeName,
        incomingPrice: incomingPrice || 0,
        baselinePrice: params.baselinePrice || 1,
        deviationPercentage: -100,
        direction: 'DROP',
        severity: 'CRITICAL_SUSPICIOUS',
        reason: 'Geçersiz fiyat: 0 veya negatif değer girildi.',
        detectedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
        rawUrl
      };
      priceAnomalyStore.enqueue(record);

      return {
        isAllowed: false,
        isAnomaly: true,
        deviationPercentage: -100,
        baselinePrice: params.baselinePrice || 1,
        severity: 'CRITICAL_SUSPICIOUS',
        reason: record.reason,
        quarantineRecord: record
      };
    }

    const baseline = params.baselinePrice && params.baselinePrice > 0 ? params.baselinePrice : incomingPrice;
    const diff = incomingPrice - baseline;
    const deviationPct = Number(((diff / baseline) * 100).toFixed(2));

    // 2. Anomaly Check: Downward deviation > 30% (e.g. -35%, -70%, -90%)
    if (deviationPct <= -PriceAnomalyGuard.MAX_ALLOWED_DROP_PCT) {
      const severity: 'HIGH_ANOMALY' | 'CRITICAL_SUSPICIOUS' =
        deviationPct <= -60 ? 'CRITICAL_SUSPICIOUS' : 'HIGH_ANOMALY';

      const reason = `Fiyat medyan referansına (₺${baseline.toLocaleString('tr-TR')}) göre %${Math.abs(
        deviationPct
      )} oranında beklenmedik şekilde düştü. Olası bot aksaklığı, aksesuar eşleşmesi veya hatalı ilan şüphesiyle yayına alınmadı.`;

      const record: AnomalyRecord = {
        id: `anom_${productId}_${Date.now()}`,
        productId,
        productName,
        category,
        storeName,
        incomingPrice,
        baselinePrice: baseline,
        deviationPercentage: deviationPct,
        direction: 'DROP',
        severity,
        reason,
        detectedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
        rawUrl
      };

      // Automatically quarantine and protect the live catalogue
      priceAnomalyStore.enqueue(record);

      return {
        isAllowed: false,
        isAnomaly: true,
        deviationPercentage: deviationPct,
        baselinePrice: baseline,
        severity,
        reason,
        quarantineRecord: record
      };
    }

    // 3. Anomaly Check: Extreme Upward surge > 100% (e.g. +150%, +300%)
    if (deviationPct >= PriceAnomalyGuard.MAX_ALLOWED_SURGE_PCT) {
      const reason = `Fiyat referansına (₺${baseline.toLocaleString('tr-TR')}) göre %${deviationPct} oranında aşırı yükseldi.`;
      const record: AnomalyRecord = {
        id: `anom_${productId}_${Date.now()}`,
        productId,
        productName,
        category,
        storeName,
        incomingPrice,
        baselinePrice: baseline,
        deviationPercentage: deviationPct,
        direction: 'SURGE',
        severity: 'HIGH_ANOMALY',
        reason,
        detectedAt: new Date().toISOString(),
        status: 'PENDING_REVIEW',
        rawUrl
      };

      priceAnomalyStore.enqueue(record);

      return {
        isAllowed: false,
        isAnomaly: true,
        deviationPercentage: deviationPct,
        baselinePrice: baseline,
        severity: 'HIGH_ANOMALY',
        reason,
        quarantineRecord: record
      };
    }

    // Safe and verified within %30 deviation tolerance
    return {
      isAllowed: true,
      isAnomaly: false,
      deviationPercentage: deviationPct,
      baselinePrice: baseline,
      severity: 'NORMAL'
    };
  }
}
