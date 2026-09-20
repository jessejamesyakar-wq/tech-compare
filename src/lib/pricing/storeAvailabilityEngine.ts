/**
 * Multi-Store Availability & Anti-False-Positive Shield Engine
 *
 * Protects against false-positive matches (e.g. phone cases, accessories, older models)
 * and accurately resolves which of the 15 supported stores carry the product IN_STOCK,
 * which are OUT_OF_STOCK, and which do NOT list the product (NOT_LISTED).
 */

import { StoreOffer } from '@/lib/types';
import {
  ACTIVE_STORES,
  ALL_RETAILER_DEFINITIONS,
  StoreKey,
  getStoreSearchUrl,
} from '@/lib/activeStores';
import { isSearchUrl, isValidFreshOfferDate, getPriceFreshness } from '@/lib/priceFreshness';

export type StoreOfferStatus = 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN' | 'NOT_LISTED';

export interface ValidatedStoreOffer {
  storeKey: StoreKey;
  storeName: string;
  storeLabel: string;
  storeLogoBg: string;
  storeLogoColor: string;
  price: number | null;
  status: StoreOfferStatus;
  inStock: boolean;
  url: string;
  isReal: boolean;
  isSearchLink: boolean;
  lastCheckedAt?: string;
  shippingInfo?: string;
  sellerRating?: number;
  rejectionReason?: string;
  matchedTitle?: string;
  variantName?: string;
  variantId?: string;
}

export interface StorePresenceReport {
  productId: string;
  productName: string;
  basePrice: number;
  totalStoresChecked: number;
  inStockCount: number;
  searchCount: number;
  outOfStockCount: number;
  unknownStockCount: number;
  notListedCount: number;
  lowestPrice: number | null;
  highestPrice: number | null;
  activeOffers: ValidatedStoreOffer[];
  searchOffers: ValidatedStoreOffer[];
  unavailableOffers: ValidatedStoreOffer[];
}

export interface ProductVerificationTarget {
  id?: string;
  name: string;
  brand?: string;
  category?: string;
  basePrice?: number;
  barcode?: string;
  ean?: string;
  mpn?: string;
}

// 1. NEGATIVE KEYWORD SHIELD (Aksesuar, Kılıf ve Yan Sanayi Engeli)
const ACCESSORY_NEGATIVE_KEYWORDS: string[] = [
  'kılıf', 'kilif', 'case', 'cover', 'kapak', 'silikon kılıf', 'deri kılıf', 'magsafe kılıf',
  'ekran koruyucu', 'cam koruyucu', 'nano cam', 'hayalet ekran', 'temperli cam', 'lens koruyucu',
  'kamera koruyucu', 'koruma camı', 'koruma kılıfı',
  'şarj kablosu', 'sarj kablosu', 'lightning kablo', 'type-c kablo', 'şarj aleti', 'adaptör', 'adaptor',
  'hızlı şarj adaptörü', 'kablosuz şarj standı',
  'yedek parça', 'yedek parca', 'yan fırça', 'ana fırça', 'paspas bezi', 'toz torbası', 'hepa filtre',
  'filtre seti', 'su tankı haznesi', 'toz haznesi filtresi',
  'askı aparatı', 'aski aparati', 'duvar askısı', 'stand', 'ayak', 'dönüştürücü', 'donusturucu',
  'taşıma çantası', 'taşıma kılıfı', 'konsol standı', 'kol şarj istasyonu', 'kulaklık pedi',
  'kulaklık süngeri', 'koruyucu film'
];

/**
 * Normalizes text for Turkish search & strict token evaluation
 */
export function normalizeForVerification(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .replace(/['’"-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * SHIELD 1: Price Floor Sanity Check
 * Rejects offers under 40% of baseline price (prevents accessories being priced as flagship devices)
 */
export function isPriceSane(candidatePrice: number, basePrice: number): { valid: boolean; reason?: string } {
  if (!candidatePrice || candidatePrice <= 0) {
    return { valid: false, reason: 'Geçersiz veya 0 TL fiyat' };
  }
  if (!basePrice || basePrice <= 0) {
    return { valid: true };
  }

  const minFloor = basePrice * 0.40;
  if (candidatePrice < minFloor) {
    return {
      valid: false,
      reason: `Fiyat taban sınırının altında (₺${candidatePrice.toLocaleString('tr-TR')} < ₺${Math.round(minFloor).toLocaleString('tr-TR')}). Aksesuar/Kılıf şüphesi.`
    };
  }

  const maxCeiling = basePrice * 2.8;
  if (candidatePrice > maxCeiling) {
    return {
      valid: false,
      reason: `Fiyat tavan sınırının çok üzerinde (₺${candidatePrice.toLocaleString('tr-TR')} > ₺${Math.round(maxCeiling).toLocaleString('tr-TR')}). Paket/Fahiş fiyat sapması.`
    };
  }

  return { valid: true };
}

/**
 * SHIELD 2: Negative Keyword Detection
 * Detects whether the candidate offer title is an accessory, case, protector or replacement part
 */
export function containsAccessoryNegativeKeywords(title: string): { isAccessory: boolean; matchedKeyword?: string } {
  if (!title) return { isAccessory: false };
  const normTitle = ` ${normalizeForVerification(title)} `;

  for (const kw of ACCESSORY_NEGATIVE_KEYWORDS) {
    const normKw = normalizeForVerification(kw);
    // Match whole words or clean boundaries
    const regex = new RegExp(`\\b${normKw}\\b`, 'i');
    if (regex.test(normTitle) || normTitle.includes(` ${normKw} `)) {
      return { isAccessory: true, matchedKeyword: kw };
    }
  }

  return { isAccessory: false };
}

/**
 * SHIELD 3: Strict Model Token Matching
 * Ensures critical model specifiers (e.g. '18', 'pro', 'max', 'ultra', 'slim', 'sonic') match
 */
export function matchesModelStrictly(targetName: string, candidateTitle: string): { matches: boolean; reason?: string } {
  const normTarget = normalizeForVerification(targetName);
  const normCandidate = normalizeForVerification(candidateTitle);

  // 1. Critical Sub-Model Keywords: pro, max, ultra, plus, mini, slim, sonic, curv
  const criticalSpecifiers = ['max', 'ultra', 'plus', 'mini', 'slim', 'fe', 'sonic', 'curv', 'pro'];
  for (const spec of criticalSpecifiers) {
    const targetHasSpec = new RegExp(`\\b${spec}\\b`, 'i').test(normTarget);
    const candidateHasSpec = new RegExp(`\\b${spec}\\b`, 'i').test(normCandidate);

    if (targetHasSpec && !candidateHasSpec) {
      return {
        matches: false,
        reason: `Aranan modelde '${spec.toUpperCase()}' özelliği var ancak mağaza sonucunda '${spec.toUpperCase()}' bulunamadı.`
      };
    }
  }

  // 2. Generation / Number specifier check (e.g. 18, 16, 24, 25, 20, 5, 4)
  const targetNumbers = (normTarget.match(/\b\d+\b/g) || []).filter((n) => n.length <= 4);
  const candidateNumbers = new Set(normCandidate.match(/\b\d+\b/g) || []);

  for (const num of targetNumbers) {
    // If target has a prominent model number like 18, 16, 20, candidate must contain it
    if (parseInt(num, 10) >= 4 && !candidateNumbers.has(num)) {
      return {
        matches: false,
        reason: `Model jenerasyon numarası (${num}) mağaza başlığında uyuşmuyor.`
      };
    }
  }

  return { matches: true };
}

/**
 * Validates a single candidate store offer against target product requirements
 */
export function validateStoreOffer(
  target: ProductVerificationTarget,
  offer: Partial<StoreOffer> & { candidateTitle?: string },
  storeKey: StoreKey
): ValidatedStoreOffer {
  const definition = ALL_RETAILER_DEFINITIONS[storeKey];
  const storeName = definition?.name || offer.storeName || storeKey;
  const storeLabel = definition?.label || storeKey.slice(0, 2).toUpperCase();
  const storeLogoBg = definition?.bg || 'bg-slate-800 text-white';
  const storeLogoColor = definition?.color || 'text-slate-700';
  const defaultSearchUrl = getStoreSearchUrl(definition?.keyword || storeKey, target.name);

  // If no offer or zero price
  if (!offer || !offer.price || offer.price <= 0) {
    return {
      storeKey,
      storeName,
      storeLabel,
      storeLogoBg,
      storeLogoColor,
      price: null,
      status: 'NOT_LISTED',
      inStock: false,
      url: defaultSearchUrl,
      isReal: false,
      isSearchLink: true,
      rejectionReason: 'Mağazada ürün listelenmemiş veya arama sonucu bulunamadı'
    };
  }

  const basePrice = target.basePrice || offer.price;
  const candidateTitle = offer.observationEvidence?.title || offer.candidateTitle || (offer as any).title || (offer as any).productTitle || (offer as any).rawTitle || '';

  // Check 1: Price floor
  const priceCheck = isPriceSane(offer.price, basePrice);
  if (!priceCheck.valid) {
    return {
      storeKey,
      storeName,
      storeLabel,
      storeLogoBg,
      storeLogoColor,
      price: null,
      status: 'NOT_LISTED',
      inStock: false,
      url: offer.url || defaultSearchUrl,
      isReal: false,
      isSearchLink: true,
      rejectionReason: priceCheck.reason,
      matchedTitle: candidateTitle || target.name
    };
  }

  // Check 2: Negative keywords & Model check (if raw candidate title is present)
  if (candidateTitle) {
    const accessoryCheck = containsAccessoryNegativeKeywords(candidateTitle);
    if (accessoryCheck.isAccessory) {
      return {
        storeKey,
        storeName,
        storeLabel,
        storeLogoBg,
        storeLogoColor,
        price: null,
        status: 'NOT_LISTED',
        inStock: false,
        url: offer.url || defaultSearchUrl,
        isReal: false,
        isSearchLink: true,
        rejectionReason: `Aksesuar filtresi tetiklendi: '${accessoryCheck.matchedKeyword}'`,
        matchedTitle: candidateTitle
      };
    }

    // Check 3: Strict model matching
    const modelCheck = matchesModelStrictly(target.name, candidateTitle);
    if (!modelCheck.matches) {
      return {
        storeKey,
        storeName,
        storeLabel,
        storeLogoBg,
        storeLogoColor,
        price: null,
        status: 'NOT_LISTED',
        inStock: false,
        url: offer.url || defaultSearchUrl,
        isReal: false,
        isSearchLink: true,
        rejectionReason: modelCheck.reason,
        matchedTitle: candidateTitle
      };
    }
  }

  // Check 4: Stock presence & verified date proof
  const hasInStockProof = offer.inStock === true && !['out_of_stock', 'OUT_OF_STOCK', 'preorder', 'unknown'].includes(offer.stockStatus || '');
  const isExplicitOutOfStock = offer.inStock === false || (offer as any).stockStatus === 'out_of_stock' || (offer as any).stockStatus === 'OUT_OF_STOCK';
  const isStockUnknown = !hasInStockProof && !isExplicitOutOfStock;

  const rawUrl = offer.url && offer.url !== '#' && !offer.url.endsWith('.com') && !offer.url.endsWith('.com.tr')
    ? offer.url
    : defaultSearchUrl;
  const isSearchLink = isSearchUrl(rawUrl, offer.isSearchLink);

  // Strict timestamp proof: only accept lastCheckedAt or verifiedAt (do NOT accept unverified updatedAt as price observation timestamp)
  const lastCheckedAt = offer.lastCheckedAt || (offer as any).verifiedAt;
  const shippingInfo = offer.shippingInfo || (offer.shippingDays ? `${offer.shippingDays} iş günü` : undefined);
  const sellerRating = offer.sellerRating || offer.merchantRating || offer.rating;

  const status: StoreOfferStatus = isExplicitOutOfStock
    ? 'OUT_OF_STOCK'
    : hasInStockProof
    ? 'IN_STOCK'
    : isStockUnknown
    ? 'UNKNOWN'
    : 'NOT_LISTED';

  return {
    storeKey,
    storeName,
    storeLabel,
    storeLogoBg,
    storeLogoColor,
    price: offer.price,
    status,
    inStock: hasInStockProof,
    url: rawUrl,
    isReal: true,
    isSearchLink,
    lastCheckedAt,
    variantName: offer.variantName,
    variantId: offer.variantId,
    shippingInfo,
    sellerRating,
    rejectionReason: isStockUnknown ? 'Stok durumu bilinmiyor' : undefined,
    matchedTitle: candidateTitle
  };
}

/**
 * Evaluates all 15 active stores for a product and generates a transparent presence report
 */
export function evaluateAllStoresPresence(
  product: ProductVerificationTarget & { storeOffers?: StoreOffer[] }
): StorePresenceReport {
  const rawOffers = product.storeOffers || [];
  const basePrice = product.basePrice || 0;

  const allValidated: ValidatedStoreOffer[] = [];

  for (const storeKey of ACTIVE_STORES) {
    const def = ALL_RETAILER_DEFINITIONS[storeKey];
    // Find matching offer from storeOffers
    const candidates = rawOffers.filter((o) => {
      if (!o || !o.storeName) return false;
      const oName = o.storeName.toLowerCase();
      return oName.includes(def.keyword) || oName.includes(storeKey);
    });

    const validated = candidates.map(offer => validateStoreOffer({ ...product, basePrice }, offer, storeKey));
    // A legacy search URL must not hide a later, exact observed offer from the same merchant.
    const rank = (offer: ValidatedStoreOffer) => {
      if (!offer.isReal || offer.price === null) return 4;
      if (offer.isSearchLink) return 3;
      if (offer.status === 'IN_STOCK' && offer.inStock && getPriceFreshness(offer.lastCheckedAt).status === 'fresh') return 0;
      if (offer.status === 'IN_STOCK' && getPriceFreshness(offer.lastCheckedAt).status === 'stale') return 1;
      return 2;
    };
    validated.sort((a, b) => rank(a) - rank(b) || (a.price ?? Infinity) - (b.price ?? Infinity));
    allValidated.push(validated[0] || validateStoreOffer({ ...product, basePrice }, {}, storeKey));
  }

  // Direct verified in-stock fresh offers ONLY (must have status === 'IN_STOCK', inStock: true, price > 0, !isSearchLink, and checked <= 24h)
  const activeOffers = allValidated
    .filter((o) => {
      if (o.status !== 'IN_STOCK' || !o.inStock || o.price === null || o.price <= 0 || o.isSearchLink || !o.lastCheckedAt) {
        return false;
      }
      const freshness = getPriceFreshness(o.lastCheckedAt);
      return freshness.status === 'fresh';
    })
    .sort((a, b) => (a.price || 0) - (b.price || 0));

  // Search links ONLY
  const searchOffers = allValidated
    .filter((o) => o.price !== null && o.price > 0 && o.isSearchLink);

  const unavailableOffers = allValidated
    .filter((o) => !activeOffers.includes(o));

  const prices = activeOffers.map((o) => o.price!).filter((p) => typeof p === 'number' && p > 0);

  // Rule: If no verified in-stock direct offers exist, lowestPrice MUST return null (never filled with basePrice)
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null;
  const highestPrice = prices.length > 0 ? Math.max(...prices) : lowestPrice;

  return {
    productId: product.id || product.name,
    productName: product.name,
    basePrice,
    totalStoresChecked: ACTIVE_STORES.length,
    inStockCount: activeOffers.length,
    searchCount: searchOffers.length,
    outOfStockCount: unavailableOffers.filter((o) => o.status === 'OUT_OF_STOCK').length,
    unknownStockCount: unavailableOffers.filter((o) => o.status === 'UNKNOWN').length,
    notListedCount: unavailableOffers.filter((o) => o.status === 'NOT_LISTED').length,
    lowestPrice,
    highestPrice,
    activeOffers,
    searchOffers,
    unavailableOffers
  };
}
