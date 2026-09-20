export function getRecordedProductScore(product: { aceleEtmeScore?: number; epeyScore?: number }): number | null {
  for (const value of [product.aceleEtmeScore, product.epeyScore]) {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100) return value;
  }
  return null;
}
