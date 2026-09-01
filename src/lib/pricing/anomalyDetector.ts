import { PriceAnomalyGuard, AnomalyRecord, priceAnomalyStore } from '@/lib/security/priceAnomalyGuard';

export interface AnomalyEvaluationResult {
  isAnomaly: boolean;
  severity: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL_ANOMALY';
  reason?: string;
  changePercentage: number;
}

export class PriceAnomalyDetector {
  /**
   * Evaluates price change against previous historical price or base price
   * Automatically adheres to the %30 deviation threshold.
   */
  static evaluate(
    newPrice: number,
    previousPrice?: number,
    baseCatalogPrice?: number,
    meta?: { productId?: string; productName?: string; storeName?: string; rawUrl?: string }
  ): AnomalyEvaluationResult {
    const baseline = previousPrice || baseCatalogPrice || newPrice;

    const guardResult = PriceAnomalyGuard.evaluateAndGuard({
      productId: meta?.productId || 'unknown',
      productName: meta?.productName || 'Ürün',
      storeName: meta?.storeName || 'Pazaryeri Satıcısı',
      incomingPrice: newPrice,
      baselinePrice: baseline,
      rawUrl: meta?.rawUrl
    });

    if (!guardResult.isAllowed) {
      return {
        isAnomaly: true,
        severity: guardResult.severity === 'CRITICAL_SUSPICIOUS' ? 'CRITICAL_ANOMALY' : 'SUSPICIOUS',
        reason: guardResult.reason,
        changePercentage: guardResult.deviationPercentage
      };
    }

    return {
      isAnomaly: false,
      severity: 'NORMAL',
      changePercentage: guardResult.deviationPercentage
    };
  }
}
