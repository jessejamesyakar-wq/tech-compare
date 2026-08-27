export interface AnomalyEvaluationResult {
  isAnomaly: boolean;
  severity: 'NORMAL' | 'SUSPICIOUS' | 'CRITICAL_ANOMALY';
  reason?: string;
  changePercentage: number;
}

export class PriceAnomalyDetector {
  /**
   * Evaluates price change against previous historical price or base price
   */
  static evaluate(
    newPrice: number,
    previousPrice?: number,
    baseCatalogPrice?: number
  ): AnomalyEvaluationResult {
    // Basic sanity checks
    if (newPrice <= 0) {
      return {
        isAnomaly: true,
        severity: 'CRITICAL_ANOMALY',
        reason: 'Geçersiz fiyat: 0 veya negatif değer',
        changePercentage: -100,
      };
    }

    const baseline = previousPrice || baseCatalogPrice;
    if (!baseline || baseline <= 0) {
      return {
        isAnomaly: false,
        severity: 'NORMAL',
        changePercentage: 0,
      };
    }

    const diff = newPrice - baseline;
    const changePct = Number(((diff / baseline) * 100).toFixed(2));

    // Sudden extreme drop (e.g. -70% or more, likely typo like 59.999 -> 599)
    if (changePct <= -70) {
      return {
        isAnomaly: true,
        severity: 'CRITICAL_ANOMALY',
        reason: `Olağandışı aşırı fiyat düşüşü (%${changePct}). Olası hatalı ilan veya veri girişi.`,
        changePercentage: changePct,
      };
    }

    // Moderate suspicious drop (e.g. -50% to -70%)
    if (changePct <= -50) {
      return {
        isAnomaly: true,
        severity: 'SUSPICIOUS',
        reason: `Yüksek fiyat düşüşü (%${changePct}). İnceleme önerilir.`,
        changePercentage: changePct,
      };
    }

    // Extreme price surge (e.g. +300% or more)
    if (changePct >= 300) {
      return {
        isAnomaly: true,
        severity: 'SUSPICIOUS',
        reason: `Olağandışı aşırı fiyat artışı (%+${changePct}).`,
        changePercentage: changePct,
      };
    }

    return {
      isAnomaly: false,
      severity: 'NORMAL',
      changePercentage: changePct,
    };
  }
}
