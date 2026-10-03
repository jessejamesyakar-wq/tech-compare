/**
 * src/lib/pricing/vatanOfferParser.ts
 *
 * PRODUCTION VATAN PARSER & IDENTITY REVALIDATION ENGINE (PHASE G)
 *
 * Grounded in:
 * - scripts/observedStoreOffer.cjs
 * - src/lib/matching/productMatcher.ts
 *
 * Extracts structured product offer evidence from HTML and validates against canonical product identity.
 * NO PRICE GUESSING VIA AD-HOC REGEX.
 * MISSING FIELDS ARE RETURNED AS NULL.
 */

import * as cheerio from 'cheerio';
import { Product } from '@/lib/types';
import { StoreProduct } from '@/integrations/stores/types';
import { ProductMatcher } from '@/lib/matching/productMatcher';

export interface ExtractedVatanFields {
  title: string | null;
  brand: string | null;
  sku: string | null;
  productId: string | null;
  mpn: string | null;
  price: number | null;
  currency: string | null;
  availability: string | null;
  shipping: string | null;
  seller: string | null;
  canonicalUrl: string | null;
  observedAt: string | null;
}

export type ObservedOfferStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'STORE_ONLY' | 'NO_VALID_OFFER' | 'HTTP_ERROR';

export type IdentityStatus = 'MATCHED' | 'MATCH_REVIEW_REQUIRED' | 'REJECTED' | 'UNREACHABLE';

export interface VatanObservationResult {
  url: string;
  httpStatus: number;
  extracted: ExtractedVatanFields;
  observedOfferStatus: ObservedOfferStatus;
  observedPriceValid: boolean;
  observedPrice: number | null;
  observedCurrency: string | null;
  observedStock: string | null;
  observedShipping: string | null;
  identityStatus: IdentityStatus;
  matchConfidence: number;
  matchReason: string;
  wouldActions: {
    mappingAction: 'KEEP_ACTIVE' | 'WOULD_DEACTIVATE' | 'WOULD_QUARANTINE_MAPPING';
    priceAction: 'WOULD_INSERT' | 'WOULD_UPDATE' | 'NO_CHANGE' | 'NO_VALID_OFFER' | 'IDENTITY_BLOCKED' | 'UNREACHABLE';
    historyAction: 'WOULD_APPEND' | 'NO_CHANGE' | 'BLOCKED';
    observationStateAction: 'WOULD_UPDATE_STATE' | 'NO_CHANGE';
    storeHealthAction: 'WOULD_UPDATE_HEALTH' | 'NO_CHANGE';
    httpFailureActions?: {
      wouldIncrementCounter: boolean;
      wouldApplyCooldown: boolean;
      wouldEvaluateCircuitBreaker: boolean;
    };
  };
}

/**
 * Normalizes text to NFKC whitespace-collapsed string.
 */
function cleanText(val: any): string {
  if (typeof val !== 'string') return '';
  return val.normalize('NFKC').replace(/\s+/g, ' ').trim();
}

/**
 * Checks if JSON-LD object is of a specific @type
 */
function hasType(node: any, type: string): boolean {
  return [node?.['@type']].flat().some(
    (value) =>
      value === type ||
      value === `https://schema.org/${type}` ||
      value === `http://schema.org/${type}`
  );
}

/**
 * Parses Vatan HTML response and evaluates observation and identity.
 */
export function parseVatanHtml(
  html: string,
  url: string,
  httpStatus: number,
  canonicalProduct: Product | null,
  existingPrice: number | null = null,
  observedAt: string = new Date().toISOString()
): VatanObservationResult {
  // If HTTP status is not 200, return UNREACHABLE observation
  if (httpStatus !== 200) {
    const isError = [403, 429, 500, 502, 503, 504].includes(httpStatus);
    return {
      url,
      httpStatus,
      extracted: {
        title: null,
        brand: null,
        sku: null,
        productId: null,
        mpn: null,
        price: null,
        currency: null,
        availability: null,
        shipping: null,
        seller: null,
        canonicalUrl: null,
        observedAt,
      },
      observedOfferStatus: 'HTTP_ERROR',
      observedPriceValid: false,
      observedPrice: null,
      observedCurrency: null,
      observedStock: null,
      observedShipping: null,
      identityStatus: 'UNREACHABLE',
      matchConfidence: 0,
      matchReason: `HTTP ${httpStatus} returned from retailer`,
      wouldActions: {
        mappingAction: httpStatus === 404 ? 'WOULD_DEACTIVATE' : 'KEEP_ACTIVE',
        priceAction: 'UNREACHABLE',
        historyAction: 'NO_CHANGE',
        observationStateAction: 'WOULD_UPDATE_STATE',
        storeHealthAction: isError ? 'WOULD_UPDATE_HEALTH' : 'NO_CHANGE',
        httpFailureActions: isError
          ? {
              wouldIncrementCounter: true,
              wouldApplyCooldown: true,
              wouldEvaluateCircuitBreaker: true,
            }
          : undefined,
      },
    };
  }

  const $ = cheerio.load(html);

  // 1. Canonical URL
  const canonicalUrl = cleanText($('link[rel="canonical"]').attr('href')) || null;

  // 2. Extract JSON-LD product nodes
  const nodes: any[] = [];
  function collect(value: any) {
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    if (!value || typeof value !== 'object') return;
    nodes.push(value);
    if (Array.isArray(value['@graph'])) {
      value['@graph'].forEach(collect);
    }
  }

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const raw = $(el).html();
      if (raw) collect(JSON.parse(raw));
    } catch {
      // Ignore JSON parse errors in script tags
    }
  });

  const productNodes = nodes.filter((n) => hasType(n, 'Product'));
  const primaryProduct = productNodes[0] || null;

  let rawTitle: string | null = primaryProduct ? cleanText(primaryProduct.name) : null;
  let rawBrand: string | null = primaryProduct
    ? cleanText(typeof primaryProduct.brand === 'string' ? primaryProduct.brand : primaryProduct.brand?.name)
    : null;
  let rawSku: string | null = primaryProduct?.sku ? String(primaryProduct.sku).trim() : null;
  let rawMpn: string | null = primaryProduct?.mpn ? cleanText(primaryProduct.mpn) : null;
  let rawProductId: string | null = primaryProduct?.productID ? String(primaryProduct.productID).trim() : rawSku;

  let rawPrice: number | null = null;
  let rawCurrency: string | null = null;
  let rawAvailability: string | null = null;
  let rawSeller: string | null = null;
  let rawShipping: string | null = null;

  if (primaryProduct) {
    const rawOffers = Array.isArray(primaryProduct.offers)
      ? primaryProduct.offers
      : primaryProduct.offers
      ? [primaryProduct.offers]
      : [];
    const directOffer = rawOffers.find((o: any) => hasType(o, 'Offer')) || rawOffers[0] || null;

    if (directOffer) {
      if (directOffer.priceCurrency) {
        rawCurrency = String(directOffer.priceCurrency).trim().toUpperCase();
      }
      const priceStr = String(directOffer.price ?? '');
      if (/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(priceStr)) {
        const num = Number(priceStr);
        if (Number.isFinite(num) && num > 0) {
          rawPrice = num;
        }
      }
      if (directOffer.availability) {
        rawAvailability = String(directOffer.availability).replace(/^https?:\/\/schema\.org\//, '');
      }
      if (directOffer.seller) {
        rawSeller = cleanText(typeof directOffer.seller === 'string' ? directOffer.seller : directOffer.seller?.name);
      }
    }
  }

  // 3. Fallback / Enrichment from DOM (Vatan specific classes)
  if (!rawTitle) {
    const h1 = $('h1.product-list__product-name, h1.product-detail__title, h1').first().text();
    rawTitle = cleanText(h1) || null;
  }
  if (!rawSku) {
    const codeText = $('.product-list__product-code, .product-detail__product-code').first().text();
    const skuMatch = codeText.match(/(\d{5,8})/);
    if (skuMatch) rawSku = skuMatch[1];
  }

  const pageText = $('body').text();
  const hasStoreOnlyText =
    pageText.includes('Sadece Mağazada') ||
    pageText.includes('Sadece Mağazalarda') ||
    pageText.includes('Mağazadan Teslim');

  const hasOutOfStockText =
    pageText.includes('Tükendi') ||
    pageText.includes('Stokta Yok') ||
    pageText.includes('Gelince Haber Ver');

  const hasAddToCartBtn =
    $('.btn-add-to-cart, #add-to-cart, .btn-basket, button:contains("Sepete Ekle")').length > 0;

  // Determine offer status
  let observedOfferStatus: ObservedOfferStatus = 'NO_VALID_OFFER';
  let observedStock = 'out_of_stock';

  if (hasStoreOnlyText) {
    observedOfferStatus = 'STORE_ONLY';
    observedStock = 'store_only';
  } else if (
    rawAvailability === 'OutOfStock' ||
    rawAvailability === 'SoldOut' ||
    hasOutOfStockText
  ) {
    observedOfferStatus = 'OUT_OF_STOCK';
    observedStock = 'out_of_stock';
  } else if (
    (rawAvailability === 'InStock' || hasAddToCartBtn) &&
    rawPrice !== null &&
    rawPrice > 0 &&
    rawCurrency === 'TRY'
  ) {
    observedOfferStatus = 'IN_STOCK';
    observedStock = 'in_stock';
  } else if (rawPrice !== null && rawPrice > 0) {
    observedOfferStatus = 'IN_STOCK';
    observedStock = 'in_stock';
  }

  const observedPriceValid =
    observedOfferStatus === 'IN_STOCK' &&
    rawPrice !== null &&
    rawPrice > 0 &&
    rawCurrency === 'TRY';

  const extracted: ExtractedVatanFields = {
    title: rawTitle,
    brand: rawBrand,
    sku: rawSku,
    productId: rawProductId,
    mpn: rawMpn,
    price: rawPrice,
    currency: rawCurrency,
    availability: rawAvailability,
    shipping: rawShipping,
    seller: rawSeller,
    canonicalUrl,
    observedAt,
  };

  // 4. Identity Revalidation against canonical product
  let identityStatus: IdentityStatus = 'REJECTED';
  let matchConfidence = 0;
  let matchReason = 'No canonical product available for matching';

  if (canonicalProduct) {
    const candidateStoreProduct: StoreProduct = {
      storeProductId: rawSku || 'unknown',
      storeId: 'vatan',
      title: rawTitle || '',
      url,
      storeSku: rawSku || undefined,
    };

    const matchEval = ProductMatcher.evaluateMatch(canonicalProduct, candidateStoreProduct);
    matchConfidence = matchEval.confidenceScore;
    matchReason = matchEval.reason;
    identityStatus = matchEval.matchStatus;

    // Strict variant verification check:
    // If canonical has variant keywords (e.g. 256 GB, Pro Max) and candidate title contradicts them,
    // ensure identity is NOT MATCHED.
    const normCandTitle = (rawTitle || '').toLowerCase();
    const normCanName = canonicalProduct.name.toLowerCase();

    // Check storage tokens
    const storagePattern = /(\d+)\s*(?:gb|tb)/i;
    const canStorage = normCanName.match(storagePattern);
    const candStorage = normCandTitle.match(storagePattern);
    if (canStorage && candStorage && canStorage[1] !== candStorage[1]) {
      identityStatus = 'REJECTED';
      matchConfidence = 20;
      matchReason = `Storage mismatch: expected ${canStorage[0]}, found ${candStorage[0]}`;
    }

    // Check Pro / Max / Ultra tokens
    for (const token of ['pro max', 'pro', 'plus', 'ultra']) {
      if (normCanName.includes(token) && !normCandTitle.includes(token)) {
        identityStatus = 'REJECTED';
        matchConfidence = 20;
        matchReason = `Model variant mismatch: expected ${token}`;
        break;
      }
    }
  }

  // 5. Derive Would-Actions
  let mappingAction: 'KEEP_ACTIVE' | 'WOULD_DEACTIVATE' | 'WOULD_QUARANTINE_MAPPING' = 'KEEP_ACTIVE';
  if (identityStatus === 'REJECTED') {
    mappingAction = 'WOULD_QUARANTINE_MAPPING';
  }

  let priceAction: 'WOULD_INSERT' | 'WOULD_UPDATE' | 'NO_CHANGE' | 'NO_VALID_OFFER' | 'IDENTITY_BLOCKED' | 'UNREACHABLE' = 'NO_VALID_OFFER';
  if (identityStatus !== 'MATCHED') {
    priceAction = 'IDENTITY_BLOCKED';
  } else if (observedOfferStatus === 'IN_STOCK' && observedPriceValid && rawPrice !== null) {
    if (existingPrice !== null) {
      if (Math.abs(existingPrice - rawPrice) < 0.01) {
        priceAction = 'NO_CHANGE';
      } else {
        priceAction = 'WOULD_UPDATE';
      }
    } else {
      priceAction = 'WOULD_INSERT';
    }
  } else {
    priceAction = 'NO_VALID_OFFER';
  }

  let historyAction: 'WOULD_APPEND' | 'NO_CHANGE' | 'BLOCKED' = 'NO_CHANGE';
  if (priceAction === 'WOULD_INSERT' || priceAction === 'WOULD_UPDATE') {
    historyAction = 'WOULD_APPEND';
  } else if (priceAction === 'IDENTITY_BLOCKED') {
    historyAction = 'BLOCKED';
  }

  return {
    url,
    httpStatus,
    extracted,
    observedOfferStatus,
    observedPriceValid,
    observedPrice: rawPrice,
    observedCurrency: rawCurrency,
    observedStock,
    observedShipping: rawShipping,
    identityStatus,
    matchConfidence,
    matchReason,
    wouldActions: {
      mappingAction,
      priceAction,
      historyAction,
      observationStateAction: 'WOULD_UPDATE_STATE',
      storeHealthAction: 'WOULD_UPDATE_HEALTH',
    },
  };
}
