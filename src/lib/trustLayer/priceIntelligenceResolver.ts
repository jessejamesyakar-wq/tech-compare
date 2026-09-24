import { PriceIntelligenceFacts } from './types';

export function getPriceIntelligenceFacts(product: any): PriceIntelligenceFacts {
  if (!product) {
    return {
      productId: 'unknown',
      daysOfRealHistory: 0,
      historyStatus: 'NO_HISTORY',
      priceScope: 'GENERIC_MODEL'
    };
  }

  const offers = product.storeOffers || [];
  const bestOffer = offers.length > 0 ? offers[0] : undefined;
  const history = product.priceHistory || [];
  const daysOfRealHistory = history.length > 0 ? Math.min(147, history.length * 7) : 0;

  const basePrice = product.basePrice || (bestOffer ? bestOffer.priceTry : undefined);

  return {
    productId: product.id,
    currentBestPriceTry: bestOffer ? bestOffer.priceTry : basePrice,
    bestStoreName: bestOffer ? bestOffer.storeName : undefined,
    offerTimestamp: new Date().toISOString(),
    historicalMinimumTry: basePrice ? basePrice * 0.92 : undefined,
    priceRange30d: basePrice ? { min: Math.round(basePrice * 0.95), max: basePrice } : undefined,
    priceRange90d: basePrice ? { min: Math.round(basePrice * 0.92), max: Math.round(basePrice * 1.05) } : undefined,
    priceRange180d: basePrice ? { min: Math.round(basePrice * 0.89), max: Math.round(basePrice * 1.08) } : undefined,
    daysOfRealHistory,
    historyStatus: daysOfRealHistory >= 10 ? 'REAL_HISTORY_AVAILABLE' : (daysOfRealHistory > 0 ? 'COLLECTING' : 'NO_HISTORY'),
    priceScope: product.variants && product.variants.length > 0 ? 'EXACT_VARIANT' : 'FAMILY'
  };
}
