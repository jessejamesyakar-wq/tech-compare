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
  displayPrice: number | null; // currentPrice || lastSeenPrice || (referencePrice if verified)
  hasDisplayPrice: boolean; // True if a verified numeric price (fresh, stale, or evidenced reference) exists
  displayMode: 'fresh' | 'stale' | 'catalog_reference' | 'no_offer';
  priceStatus: 'fresh' | 'stale' | 'unverified' | 'no_offer';
  statusLabel: string; // "Güncel Fiyat" | "Son görülen fiyat: DD.MM.YYYY" | "Güncel Doğrulanmış Teklif Yok"
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
  if (price.displayMode === 'catalog_reference' || (price.hasDisplayPrice && price.displayPrice !== null)) {
    return 'Katalog Referans Fiyatı';
  }
  return 'Fiyat Bilgisi Yok';
}

/**
 * Checks whether a product has an authoritative, proven reference price with provenance & observation date.
 * Rule: NO VERIFIED RETAILER OFFER + NO PROVEN REFERENCE PRICE EVIDENCE = DO NOT DISPLAY A NUMERIC PRICE.
 */
export function hasVerifiedCatalogReference(product?: {
  basePrice?: number;
  sourceType?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  fieldSources?: Array<{ fields?: string[]; sourceUrl?: string; checkedAt?: string }>;
  priceProvenance?: any;
  referencePriceEvidence?: any;
  verifiedReferencePrice?: any;
} | any, nowMs = Date.now()): boolean {
  if (!product) return false;

  const priceValue = (typeof product.basePrice === 'number' && Number.isFinite(product.basePrice) && product.basePrice > 0)
    ? product.basePrice
    : (typeof (product as any).referencePrice === 'number' && Number.isFinite((product as any).referencePrice) && (product as any).referencePrice > 0)
      ? (product as any).referencePrice
      : null;

  if (priceValue === null || priceValue <= 0) return false;

  // 1. Explicit priceProvenance contract
  if (product.priceProvenance) {
    const prov = product.priceProvenance;
    const hasSource = Boolean(prov.channelId?.trim() || (prov.sourceType && prov.sourceType !== 'unverified'));
    const dateStr = prov.observedAt instanceof Date ? prov.observedAt.toISOString() : prov.observedAt;
    const dateMs = dateStr ? parseOfferDateToMs(dateStr) : 0;
    if (hasSource && dateMs > 0 && dateMs <= nowMs) {
      return true;
    }
  }

  // 2. Explicit referencePriceEvidence
  if (product.referencePriceEvidence) {
    const refEv = product.referencePriceEvidence;
    const hasSource = typeof refEv.sourceUrl === 'string' && refEv.sourceUrl.trim().length > 0;
    const dateMs = refEv.observedAt ? parseOfferDateToMs(refEv.observedAt) : 0;
    if (hasSource && dateMs > 0 && dateMs <= nowMs) {
      return true;
    }
  }

  // 3. Explicit verifiedReferencePrice
  if (product.verifiedReferencePrice) {
    const vrp = product.verifiedReferencePrice;
    const hasSource = typeof vrp.sourceUrl === 'string' && vrp.sourceUrl.trim().length > 0;
    const dateMs = vrp.observedAt ? parseOfferDateToMs(vrp.observedAt) : 0;
    if (hasSource && dateMs > 0 && dateMs <= nowMs) {
      return true;
    }
  }

  // 4. fieldSources containing price field with valid sourceUrl and observation/checked date
  if (Array.isArray(product.fieldSources) && product.fieldSources.length > 0) {
    const priceField = product.fieldSources.find((fs: { fields?: string[]; sourceUrl?: string; checkedAt?: string }) => {
      if (!fs || !Array.isArray(fs.fields) || !fs.sourceUrl || !fs.checkedAt) return false;
      const coversPrice = fs.fields.some((f: string) => {
        const lower = f.toLowerCase();
        return lower === 'baseprice' || lower === 'price' || lower === 'referenceprice' || lower === 'fiyat';
      });
      const dateMs = parseOfferDateToMs(fs.checkedAt);
      return coversPrice && dateMs > 0 && dateMs <= nowMs && fs.sourceUrl.trim().length > 0;
    });
    if (priceField) {
      return true;
    }
  }

  return false;
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

export function evaluateProductPricing(product?: {
  basePrice?: number;
  sourceType?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  fieldSources?: Array<{ fields?: string[]; sourceUrl?: string; checkedAt?: string }>;
  priceProvenance?: any;
  referencePriceEvidence?: any;
  verifiedReferencePrice?: any;
  storeOffers?: StoreOffer[];
} | null, nowMs = Date.now()): EvaluatedProductPrice {
  const { freshDirectOffers, staleDirectOffers } = getEligibleDirectOffers(product?.storeOffers, nowMs);

  if (freshDirectOffers.length > 0) {
    const cheapest = freshDirectOffers[0];
    return {
      currentPrice: cheapest.price,
      lastSeenPrice: null,
      displayPrice: cheapest.price,
      hasDisplayPrice: true,
      displayMode: 'fresh',
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
      hasDisplayPrice: true,
      displayMode: 'stale',
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

  if (hasVerifiedCatalogReference(product, nowMs)) {
    const refPrice = (typeof product?.basePrice === 'number' && Number.isFinite(product.basePrice) && product.basePrice > 0)
      ? product.basePrice
      : (typeof (product as any)?.referencePrice === 'number' && Number.isFinite((product as any).referencePrice) && (product as any).referencePrice > 0)
        ? (product as any).referencePrice
        : null;

    return {
      currentPrice: null,
      lastSeenPrice: null,
      displayPrice: refPrice,
      hasDisplayPrice: refPrice !== null,
      displayMode: 'catalog_reference',
      priceStatus: 'unverified',
      statusLabel: 'Katalog Referans Fiyatı',
      variantLabel: undefined,
      lastCheckedAt: undefined,
      activeStoreCount: 0,
      staleStoreCount: 0,
      lowestFreshPrice: null,
      isFresh: false,
      cheapestStoreName: undefined
    };
  }

  return {
    currentPrice: null,
    lastSeenPrice: null,
    displayPrice: null,
    hasDisplayPrice: false,
    displayMode: 'no_offer',
    priceStatus: 'no_offer',
    statusLabel: 'Güncel Doğrulanmış Teklif Yok',
    variantLabel: undefined,
    lastCheckedAt: undefined,
    activeStoreCount: 0,
    staleStoreCount: 0,
    lowestFreshPrice: null,
    isFresh: false,
    cheapestStoreName: undefined
  };
}
