// src/lib/ai/robopengu/priceIntelligence.ts
/**
 * Worker 4: Price Intelligence Engine
 * Integrates PriceRepository / unifiedPriceEvaluator to provide distinct, honest price status.
 *
 * Taxonomies:
 * - LIVE_PRICE: Active, verified direct in-stock store offer <= 24 hours old.
 * - PERSISTED_PRICE: Verified historical offer > 24h and <= 30 days old.
 * - CATALOG_FALLBACK: Catalog base price / MSRP without active store offers.
 * - NO_PRICE_DATA: No verified price available.
 */

import { PriceIntelligenceInfo, PriceStatus } from './types';
import { evaluateProductPricing, EvaluatedProductPrice } from '@/lib/pricing/unifiedPriceEvaluator';
import { CatalogProduct } from './candidateEngine';
import { getProvenanceTrustLabel } from '@/lib/pricing/priceProvenance';

export class PriceIntelligence {
  public static evaluate(product: CatalogProduct): PriceIntelligenceInfo {
    const evalResult: EvaluatedProductPrice = evaluateProductPricing({
      basePrice: (product as any).basePrice ?? product.price,
      sourceType: (product as any).sourceType,
      storeOffers: (product as any).storeOffers,
    });

    let status: PriceStatus = 'NO_PRICE_DATA';
    let effectivePrice: number | null = null;
    let isFallback = false;
    let confidence = 0.0;
    let bestStore: string | undefined = evalResult.cheapestStoreName;

    if (evalResult.currentPrice !== null && evalResult.currentPrice > 0) {
      status = 'LIVE_PRICE';
      effectivePrice = evalResult.currentPrice;
      confidence = 1.0;
      isFallback = false;
    } else if (evalResult.lastSeenPrice !== null && evalResult.lastSeenPrice > 0) {
      status = 'PERSISTED_PRICE';
      effectivePrice = evalResult.lastSeenPrice;
      confidence = 0.75;
      isFallback = false;
    } else if (evalResult.displayPrice !== null && evalResult.displayPrice > 0) {
      status = 'CATALOG_FALLBACK';
      effectivePrice = evalResult.displayPrice;
      confidence = 0.40;
      isFallback = true;
      bestStore = 'Katalog Liste Fiyatı';
    } else if (typeof product.price === 'number' && product.price > 0) {
      status = 'CATALOG_FALLBACK';
      effectivePrice = product.price;
      confidence = 0.40;
      isFallback = true;
      bestStore = 'Katalog Liste Fiyatı';
    } else {
      status = 'NO_PRICE_DATA';
      effectivePrice = null;
      confidence = 0.0;
      isFallback = false;
    }

    const formatted = effectivePrice !== null
      ? `${effectivePrice.toLocaleString('tr-TR')} TL`
      : 'Fiyat Bilgisi Yok';

    const matchedOffer = (product as any).storeOffers?.find(
      (o: any) => o.storeName === evalResult.cheapestStoreName && o.price === evalResult.currentPrice
    ) ?? (product as any).storeOffers?.[0];

    const sourceType = (matchedOffer as any)?.sourceType ?? (product as any).sourceType ?? null;
    const channelId = (matchedOffer as any)?.channelId ?? (product as any).channelId ?? null;
    const observedAt = (matchedOffer as any)?.observedAt ?? (matchedOffer as any)?.lastCheckedAt ?? evalResult.lastCheckedAt ?? null;
    const provenanceTrustLabel = sourceType ? getProvenanceTrustLabel(sourceType, channelId, (matchedOffer as any)?.store || bestStore) : null;

    return {
      status,
      effectivePrice,
      displayPriceFormatted: formatted,
      currency: 'TRY',
      isFallback,
      storeCount: evalResult.activeStoreCount || 0,
      activeOffers: (evalResult.activeStoreCount || 0) + (evalResult.staleStoreCount || 0),
      bestStore,
      lastUpdated: evalResult.lastCheckedAt,
      confidence,
      sourceType,
      channelId,
      observedAt,
      provenanceTrustLabel,
    };
  }

  public static getStatusDescription(status: PriceStatus): string {
    switch (status) {
      case 'LIVE_PRICE':
        return 'Doğrulanmış Canlı Mağaza Fiyatı';
      case 'PERSISTED_PRICE':
        return 'Son Görülen Geçmiş Fiyat';
      case 'CATALOG_FALLBACK':
        return 'Katalog Liste/Tavsiye Edilen Fiyat (Canlı Mağaza Teklifi Yok)';
      case 'NO_PRICE_DATA':
        return 'Fiyat Bilgisi Doğrulanmadı';
    }
  }
}
