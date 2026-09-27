/**
 * Offer Scope Evaluator Module
 * Refactored D02 measurement logic into an importable function module.
 */

import { isSearchUrl, isBrokenUrl, getPriceFreshness, PRICE_FRESHNESS_HOURS } from '../priceFreshness';

export interface CatalogProductRaw {
  id: string;
  name?: string;
  category?: string;
  brand?: string;
  variants?: any[];
  colorOptions?: any[];
  storeOffers?: Array<{
    storeName?: string;
    url?: string;
    price?: number;
    inStock?: boolean;
    lastCheckedAt?: string;
    [key: string]: any;
  }>;
  [key: string]: any;
}

export interface OfferScopeResult {
  measuredAt: string;
  catalogMetrics: {
    totalProducts: number;
    totalModeledVariants: number;
    totalColorOptionsContainers: number;
    totalVariantsContainers: number;
    totalStoreOfferElements: number;
    includedOfferPaths: string[];
    excludedOfferPaths: string[];
    variantScopeNote: string;
  };
  registeredBindings: {
    count: number;
    details: any[];
    accessStatus: 'UNVERIFIED';
    liveOffersCount: null;
  };
  urlClassification: {
    directProductUrlCandidates: number;
    searchUrlOffersCount: number;
    invalidUrlCount: number;
    note: string;
  };
  stockStatus: {
    inStockTrueCount: number;
    inStockFalseCount: number;
    inStockUnknownCount: number;
  };
  freshnessStatus: {
    freshOffersCount: number;
    staleOffersCount: number;
    unverifiedDateOffersCount: number;
    priceFreshnessHoursLimit: number;
    freshDate24hCount: number;
    staleDate30dCount: number;
    validDateTotalCount: number;
  };
}

/**
 * Evaluates offer scope across an array of catalog products.
 * Throws explicit Error on invalid/malformed product schema.
 */
export function evaluateOfferScope(products: CatalogProductRaw[], sourceBindings: any[] = []): OfferScopeResult {
  if (!Array.isArray(products)) {
    throw new Error('[OfferScopeEvaluator Error] Input products must be an array.');
  }

  let totalModeledVariants = 0;
  let totalColorOptionsContainers = 0;
  let totalVariantsContainers = 0;
  let totalStoreOfferElements = 0;

  let directProductUrlCandidates = 0;
  let searchUrlOffersCount = 0;
  let invalidUrlCount = 0;

  let inStockTrueCount = 0;
  let inStockFalseCount = 0;
  let inStockUnknownCount = 0;

  let freshOffersCount = 0;
  let staleOffersCount = 0;
  let unverifiedDateOffersCount = 0;
  let freshDateCount = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    if (!p || typeof p !== 'object' || typeof p.id !== 'string') {
      throw new Error(`[OfferScopeEvaluator Error] Invalid product schema at index ${i}`);
    }

    const hasColorOptions = Array.isArray(p.colorOptions) && p.colorOptions.length > 0;
    const hasVariants = Array.isArray(p.variants) && p.variants.length > 0;

    if (hasColorOptions) totalColorOptionsContainers++;
    if (hasVariants) totalVariantsContainers++;

    const varCount = hasVariants ? p.variants!.length : 1;
    totalModeledVariants += varCount;

    if (Array.isArray(p.storeOffers)) {
      p.storeOffers.forEach((o) => {
        if (!o || typeof o !== 'object') {
          throw new Error(`[OfferScopeEvaluator Error] Invalid offer schema in product ${p.id}`);
        }
        totalStoreOfferElements++;

        // Stock Breakdown
        if (o.inStock === true) {
          inStockTrueCount++;
        } else if (o.inStock === false) {
          inStockFalseCount++;
        } else {
          inStockUnknownCount++;
        }

        // URL Classification
        const rawUrl = o.url;
        if (isBrokenUrl(rawUrl)) {
          invalidUrlCount++;
        } else if (isSearchUrl(rawUrl)) {
          searchUrlOffersCount++;
        } else {
          directProductUrlCandidates++;
        }

        // Freshness Breakdown
        const freshness = getPriceFreshness(o.lastCheckedAt);
        if (freshness.status === 'fresh') {
          freshOffersCount++;
          freshDateCount++;
        } else if (freshness.status === 'stale') {
          staleOffersCount++;
          freshDateCount++;
        } else {
          unverifiedDateOffersCount++;
        }
      });
    }
  }

  return {
    measuredAt: new Date().toISOString(),
    catalogMetrics: {
      totalProducts: products.length,
      totalModeledVariants,
      totalColorOptionsContainers,
      totalVariantsContainers,
      totalStoreOfferElements,
      includedOfferPaths: ['product.storeOffers'],
      excludedOfferPaths: ['product.colorOptions[].storeOffers', 'product.variants[].storeOffers'],
      variantScopeNote: `Katalogda ${totalColorOptionsContainers} colorOptions ve ${totalVariantsContainers} variants kapsayıcısı (toplam ${totalModeledVariants} tanımlı varyant) mevcuttur. Ölçüm yalnızca kök 'product.storeOffers' yolunu dâhil eder; 'colorOptions[].storeOffers' ve 'variants[].storeOffers' kapsayıcıları hariç tutulmuştur. Metadata tarihinin güncel olması ağ üzerinden doğrulanmış fiyat/stok anlamına gelmez.`
    },
    registeredBindings: {
      count: sourceBindings.length,
      details: sourceBindings,
      accessStatus: 'UNVERIFIED',
      liveOffersCount: null
    },
    urlClassification: {
      directProductUrlCandidates,
      searchUrlOffersCount,
      invalidUrlCount,
      note: 'isSearchUrl === true olan adresler dinamik arama URL’si kabul edilir. Bozuk (#, boş) adresler invalidUrlCount olarak ayrılmıştır.'
    },
    stockStatus: {
      inStockTrueCount,
      inStockFalseCount,
      inStockUnknownCount
    },
    freshnessStatus: {
      freshOffersCount,
      staleOffersCount,
      unverifiedDateOffersCount,
      priceFreshnessHoursLimit: PRICE_FRESHNESS_HOURS,
      freshDate24hCount: freshOffersCount,
      staleDate30dCount: staleOffersCount,
      validDateTotalCount: freshDateCount
    }
  };
}
