/**
 * Unified Product Price Evaluator
 *
 * Centralizes price evaluation across Search API, AI Resolvers, Product Detail, and Listing pages.
 *
 * Strict Freshness & Taxonomy Rules:
 * - Fresh Offer (status: 'fresh'): Direct, non-search, in-stock offer checked within PRICE_FRESHNESS_HOURS (24 hours).
 * - Stale Offer (status: 'stale'): Direct, non-search, in-stock offer checked > 24 hours ago (and <= 30 days old).
 * - Unverified (status: 'unverified'): Product marked unverified or offers with unverified/invalid/future dates.
 * - No Offer (status: 'no_offer'): Product has zero eligible direct offers.
 */

import { StoreOffer } from '@/lib/types';
import { isSearchUrl, PRICE_FRESHNESS_HOURS, MAX_ALLOWED_OFFER_AGE_DAYS } from '@/lib/priceFreshness';
import { parseOfferDateToMs, formatObservedDate } from '@/lib/dateParsing';
import { offerVariantLabel } from './offerVariant';

export interface EvaluatedProductPrice {
  currentPrice: number | null; // Lowest fresh direct offer price (checked <= 24h), or null
  lastSeenPrice: number | null; // Lowest stale direct offer price (> 24h & <= 30d) if no fresh price exists
  displayPrice: number | null; // currentPrice || lastSeenPrice || (basePrice if presented as catalog reference)
  priceStatus: 'fresh' | 'stale' | 'unverified' | 'no_offer';
  statusLabel: string; // "Güncel Fiyat" | "Son görülen fiyat: DD.MM.YYYY" | "Fiyat doğrulanmadı" | "Teklif Yok"
  lastCheckedAt?: string;
  activeStoreCount: number; // Count of direct in-stock fresh store offers (<= 24h)
  staleStoreCount: number; // Count of direct in-stock stale store offers (> 24h & <= 30d)
  lowestFreshPrice: number | null;
  isFresh: boolean;
  cheapestStoreName?: string;
  variantLabel?: string;
}

export function getPriceHeading(price: EvaluatedProductPrice): string {
  if (price.currentPrice !== null) return 'Güncel Fiyat';
  if (price.lastSeenPrice !== null) return 'Son Görülen Fiyat';
  return price.displayPrice !== null ? 'Katalog Referans Fiyatı' : 'Fiyat Bilgisi Yok';
}

// Shared by visible pricing and Product JSON-LD: both must describe the same offers.
export function getEligibleDirectOffers(rawOffers: StoreOffer[] = [], nowMs = Date.now()) {
  const maxAgeMs = MAX_ALLOWED_OFFER_AGE_DAYS * 24 * 60 * 60 * 1000;

  const freshDirectOffers: StoreOffer[] = [];
  const staleDirectOffers: StoreOffer[] = [];

  for (const offer of rawOffers) {
    if (!offer || !Number.isFinite(offer.price) || offer.price <= 0) continue;

    // Check inStock proof
    if (offer.inStock !== true || ['out_of_stock', 'OUT_OF_STOCK', 'preorder', 'unknown'].includes(offer.stockStatus || '')) continue;

    // Check search link
    const isSearch = isSearchUrl(offer.url, offer.isSearchLink);
    if (isSearch) continue;

    // Check date proof
    const dateStr = offer.lastCheckedAt || (offer as any).verifiedAt;
    if (!dateStr) continue;

    const tMs = parseOfferDateToMs(dateStr);
    if (tMs <= 0 || tMs > nowMs) continue; // Invalid or future dates rejected!

    const ageHours = (nowMs - tMs) / (1000 * 60 * 60);

    if (ageHours <= PRICE_FRESHNESS_HOURS) {
      freshDirectOffers.push({ ...offer, lastCheckedAt: dateStr });
    } else if (nowMs - tMs <= maxAgeMs) {
      staleDirectOffers.push({ ...offer, lastCheckedAt: dateStr });
    }
  }

  // Sort by price ascending
  freshDirectOffers.sort((a, b) => a.price - b.price);
  staleDirectOffers.sort((a, b) => a.price - b.price);

  return { freshDirectOffers, staleDirectOffers };
}

export function evaluateProductPricing(product: {
  basePrice?: number;
  sourceType?: string;
  storeOffers?: StoreOffer[];
}, nowMs = Date.now()): EvaluatedProductPrice {
  const { freshDirectOffers, staleDirectOffers } = getEligibleDirectOffers(product?.storeOffers, nowMs);

  if (freshDirectOffers.length > 0) {
    const cheapest = freshDirectOffers[0];
    return {
      currentPrice: cheapest.price,
      lastSeenPrice: null,
      displayPrice: cheapest.price,
      priceStatus: 'fresh',
      statusLabel: ['Güncel Fiyat', offerVariantLabel(cheapest)].filter(Boolean).join(' · '),
      variantLabel: offerVariantLabel(cheapest) || undefined,
      lastCheckedAt: cheapest.lastCheckedAt,
      activeStoreCount: new Set(freshDirectOffers.map(offer => offer.storeName.trim().toLocaleLowerCase('tr-TR'))).size,
      staleStoreCount: new Set(staleDirectOffers.map(offer => offer.storeName.trim().toLocaleLowerCase('tr-TR'))).size,
      lowestFreshPrice: cheapest.price,
      isFresh: true,
      cheapestStoreName: cheapest.storeName
    };
  }

  if (staleDirectOffers.length > 0) {
    const cheapest = staleDirectOffers[0];
    const formattedDate = formatObservedDate(cheapest.lastCheckedAt!);

    return {
      currentPrice: null, // STRICTLY null for currentPrice when offer is > 24h!
      lastSeenPrice: cheapest.price,
      displayPrice: cheapest.price,
      priceStatus: 'stale',
      statusLabel: [`Son görülen fiyat: ${formattedDate}`, offerVariantLabel(cheapest)].filter(Boolean).join(' · '),
      variantLabel: offerVariantLabel(cheapest) || undefined,
      lastCheckedAt: cheapest.lastCheckedAt,
      activeStoreCount: 0, // 0 active fresh stores!
      staleStoreCount: new Set(staleDirectOffers.map(offer => offer.storeName.trim().toLocaleLowerCase('tr-TR'))).size,
      lowestFreshPrice: null,
      isFresh: false,
      cheapestStoreName: cheapest.storeName
    };
  }

  const isUnverified = product?.sourceType === 'unverified';
  return {
    currentPrice: null,
    lastSeenPrice: null,
    displayPrice: Number.isFinite(product?.basePrice) && product.basePrice! > 0 ? product.basePrice! : null,
    priceStatus: isUnverified ? 'unverified' : 'no_offer',
    statusLabel: isUnverified ? 'Fiyat doğrulanmadı' : 'Teklif Yok',
    lastCheckedAt: undefined,
    activeStoreCount: 0,
    staleStoreCount: 0,
    lowestFreshPrice: null,
    isFresh: false,
    cheapestStoreName: undefined
  };
}
