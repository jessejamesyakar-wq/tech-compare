import crypto from 'node:crypto';

export interface PriceSnapshotEntry {
  rootId: string;
  priceHash: string;
  storeOffersCount: number;
  priceHistoryLength: number;
}

export interface PriceViolation {
  rootId: string;
  field: string;
  expectedHash: string;
  actualHash: string;
  message: string;
}

export interface PriceImmutabilityReport {
  evaluatedAt: string;
  rootsInspected: number;
  violationsCount: number;
  violations: PriceViolation[];
  priceProtectionState: 'IMMUTABLE_CLEAN' | 'PRICE_MUTATION_VIOLATION';
}

export function observePriceImmutability(
  catalog: any[],
  baselineSnapshots?: Record<string, PriceSnapshotEntry>
): PriceImmutabilityReport {
  const violations: PriceViolation[] = [];

  for (const p of catalog) {
    if (!p) continue;
    const priceData = {
      price: p.price,
      priceMin: p.priceMin,
      priceMax: p.priceMax,
      currency: p.currency,
      storeOffers: p.storeOffers || [],
      priceHistory: p.priceHistory || []
    };

    const currentHash = crypto.createHash('sha256').update(JSON.stringify(priceData)).digest('hex');

    if (baselineSnapshots && baselineSnapshots[p.id]) {
      const baseline = baselineSnapshots[p.id];
      if (baseline.priceHash !== currentHash) {
        violations.push({
          rootId: p.id,
          field: 'price_boundary',
          expectedHash: baseline.priceHash,
          actualHash: currentHash,
          message: `Price data mutated for root ${p.id}`
        });
      }
    }
  }

  const priceProtectionState = violations.length === 0 ? 'IMMUTABLE_CLEAN' : 'PRICE_MUTATION_VIOLATION';

  return {
    evaluatedAt: new Date().toISOString(),
    rootsInspected: catalog.length,
    violationsCount: violations.length,
    violations,
    priceProtectionState
  };
}
