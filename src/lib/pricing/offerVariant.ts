import type { StoreOffer, PriceHistoryPoint } from '@/lib/types';

type VariantScope = { variantId?: string; variantName?: string };

/** An explicitly scoped price must never cross to another selected colour/SKU. */
export function matchesOfferVariant(offer: VariantScope, variantId?: string, colorName?: string): boolean {
  if (!variantId && !colorName) return true; // Model-level listings expose the offer's scope label.
  if (offer.variantId) return offer.variantId === variantId;
  if (offer.variantName) return offer.variantName === colorName;
  return true;
}

export function selectProductOfferVariant<T extends { storeOffers?: StoreOffer[]; priceHistory?: PriceHistoryPoint[] }>(
  product: T, variantId?: string, colorName?: string,
): T {
  return {
    ...product,
    storeOffers: product.storeOffers?.filter(offer => matchesOfferVariant(offer, variantId, colorName)),
    priceHistory: product.priceHistory?.filter(point => matchesOfferVariant(point, variantId, colorName)),
  };
}

export function offerVariantLabel(offer: VariantScope): string {
  return offer.variantName?.trim() ? `Teklif varyantı: ${offer.variantName.trim()}` : '';
}
