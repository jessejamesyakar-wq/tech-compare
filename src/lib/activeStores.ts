/**
 * Centralized Store Activation & Dynamic Count Configuration
 * 
 * 15 Desteklenen Mağaza:
 * Hepsiburada, Trendyol, Amazon TR, N11, PttAVM, Vatan Bilgisayar,
 * MediaMarkt, Teknosa, İncehesap, İtopya, Sinerji Bilgisayar,
 * Gaming.Gen.TR, GameGaraj, Tebilon, Ebrar Bilgisayar.
 */

export type StoreKey =
  | 'hepsiburada'
  | 'trendyol'
  | 'amazon'
  | 'n11'
  | 'pttavm'
  | 'vatan'
  | 'mediamarkt'
  | 'teknosa'
  | 'incehesap'
  | 'itopya'
  | 'sinerji'
  | 'gaminggen'
  | 'gamegaraj'
  | 'tebilon'
  | 'ebrar';

export interface StoreDefinition {
  id: string;
  name: string;
  keyword: string;
  label: string;
  bg: string;
  color: string;
  defaultUrl: string;
  multiplier: number;
}

export const ALL_RETAILER_DEFINITIONS: Record<StoreKey, StoreDefinition> = {
  hepsiburada: {
    id: 'hb',
    name: 'Hepsiburada',
    keyword: 'hepsiburada',
    label: 'HB',
    bg: 'bg-orange-500 text-white',
    color: 'text-orange-600',
    defaultUrl: 'https://www.hepsiburada.com',
    multiplier: 0.996
  },
  trendyol: {
    id: 'ty',
    name: 'Trendyol',
    keyword: 'trendyol',
    label: 'TY',
    bg: 'bg-amber-600 text-white',
    color: 'text-amber-600',
    defaultUrl: 'https://www.trendyol.com',
    multiplier: 1.002
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon TR',
    keyword: 'amazon',
    label: 'AZ',
    bg: 'bg-amber-500 text-slate-950 font-black',
    color: 'text-amber-600',
    defaultUrl: 'https://www.amazon.com.tr',
    multiplier: 0.998
  },
  n11: {
    id: 'n11',
    name: 'N11',
    keyword: 'n11',
    label: 'N11',
    bg: 'bg-purple-700 text-white font-bold',
    color: 'text-purple-700',
    defaultUrl: 'https://www.n11.com',
    multiplier: 0.994
  },
  pttavm: {
    id: 'pttavm',
    name: 'PttAVM',
    keyword: 'ptt',
    label: 'PTT',
    bg: 'bg-yellow-400 text-blue-950 font-black',
    color: 'text-blue-900 font-extrabold',
    defaultUrl: 'https://www.pttavm.com',
    multiplier: 0.992
  },
  vatan: {
    id: 'vatan',
    name: 'Vatan Bilgisayar',
    keyword: 'vatan',
    label: 'VT',
    bg: 'bg-blue-800 text-white font-black',
    color: 'text-blue-700',
    defaultUrl: 'https://www.vatanbilgisayar.com',
    multiplier: 1.0
  },
  mediamarkt: {
    id: 'mm',
    name: 'MediaMarkt',
    keyword: 'media',
    label: 'MM',
    bg: 'bg-red-600 text-white font-bold',
    color: 'text-red-600',
    defaultUrl: 'https://www.mediamarkt.com.tr',
    multiplier: 1.006
  },
  teknosa: {
    id: 'teknosa',
    name: 'Teknosa',
    keyword: 'teknosa',
    label: 'TK',
    bg: 'bg-orange-600 text-white font-bold',
    color: 'text-orange-600',
    defaultUrl: 'https://www.teknosa.com',
    multiplier: 1.004
  },
  incehesap: {
    id: 'incehesap',
    name: 'İncehesap',
    keyword: 'incehesap',
    label: 'İH',
    bg: 'bg-yellow-500 text-slate-950 font-black',
    color: 'text-yellow-600',
    defaultUrl: 'https://www.incehesap.com',
    multiplier: 0.995
  },
  itopya: {
    id: 'itopya',
    name: 'İtopya',
    keyword: 'itopya',
    label: 'IT',
    bg: 'bg-orange-600 text-white font-black',
    color: 'text-orange-600',
    defaultUrl: 'https://www.itopya.com',
    multiplier: 0.997
  },
  sinerji: {
    id: 'sinerji',
    name: 'Sinerji Bilgisayar',
    keyword: 'sinerji',
    label: 'SN',
    bg: 'bg-blue-600 text-white font-bold',
    color: 'text-blue-600',
    defaultUrl: 'https://www.sinerji.gen.tr',
    multiplier: 0.996
  },
  gaminggen: {
    id: 'gaminggen',
    name: 'Gaming.Gen.TR',
    keyword: 'gaming',
    label: 'GG',
    bg: 'bg-red-700 text-white font-black',
    color: 'text-red-700',
    defaultUrl: 'https://www.gaming.gen.tr',
    multiplier: 0.998
  },
  gamegaraj: {
    id: 'gamegaraj',
    name: 'GameGaraj',
    keyword: 'gamegaraj',
    label: 'GR',
    bg: 'bg-zinc-900 text-white font-bold border border-zinc-700',
    color: 'text-zinc-800',
    defaultUrl: 'https://www.gamegaraj.com',
    multiplier: 1.001
  },
  tebilon: {
    id: 'tebilon',
    name: 'Tebilon',
    keyword: 'tebilon',
    label: 'TB',
    bg: 'bg-cyan-700 text-white font-bold',
    color: 'text-cyan-700',
    defaultUrl: 'https://www.tebilon.com',
    multiplier: 0.999
  },
  ebrar: {
    id: 'ebrar',
    name: 'Ebrar Bilgisayar',
    keyword: 'ebrar',
    label: 'EB',
    bg: 'bg-emerald-700 text-white font-bold',
    color: 'text-emerald-700',
    defaultUrl: 'https://www.ebrarbilgisayar.com',
    multiplier: 0.994
  }
};

/**
 * 🔒 ACTIVE_STORES configuration
 * 15 Mağaza Tam Entegrasyonu: Epey Modeli Kapsamı
 */
export const ACTIVE_STORES: StoreKey[] = [
  'hepsiburada',
  'trendyol',
  'amazon',
  'n11',
  'pttavm',
  'vatan',
  'mediamarkt',
  'teknosa',
  'incehesap',
  'itopya',
  'sinerji',
  'gaminggen',
  'gamegaraj',
  'tebilon',
  'ebrar'
];

/**
 * Filtered list of store definitions matching only the active stores
 */
export const ACTIVE_RETAILERS: StoreDefinition[] = ACTIVE_STORES.map(
  (key) => ALL_RETAILER_DEFINITIONS[key]
);

/**
 * Total count of currently active stores (15)
 */
export const ACTIVE_STORE_COUNT = ACTIVE_STORES.length;

/**
 * Filter an array of store offers to include ONLY currently active stores
 */
export function filterActiveStoreOffers<T extends { storeName: string }>(offers: T[] = []): T[] {
  if (!offers || offers.length === 0) return [];
  return offers.filter((offer) => {
    const sName = (offer.storeName || '').toLowerCase();
    return ACTIVE_RETAILERS.some((retailer) => sName.includes(retailer.keyword.toLowerCase()));
  });
}

/**
 * Get effective active store count for a product
 */
export function getEffectiveStoreCount(offers: { storeName: string; price?: number }[] = []): number {
  const activeOffers = filterActiveStoreOffers(offers).filter((o) => (o.price || 0) > 0);
  return activeOffers.length > 0 ? activeOffers.length : ACTIVE_STORE_COUNT;
}

/**
 * Helper to generate dynamic title or description text
 * Example: getActiveStoreComparisonTitle() -> "15 Mağaza Canlı Fiyat Karşılaştırması"
 */
export function getActiveStoreComparisonTitle(prefix = ''): string {
  if (ACTIVE_STORE_COUNT === 1) {
    const storeName = ACTIVE_RETAILERS[0]?.name || 'Hepsiburada';
    return prefix ? `${prefix} ${storeName} Canlı Fiyatı` : `${storeName} Canlı Fiyatı`;
  }
  return `${prefix ? prefix + ' ' : ''}${ACTIVE_STORE_COUNT} Mağaza Canlı Fiyat Karşılaştırması`;
}

/**
 * Generate targeted search URL for any of the 15 supported retailers.
 * When an exact SKU or affiliate link is not provided, this links directly
 * to the store's search result page for the product.
 */
export function getStoreSearchUrl(storeKey: StoreKey | string, query: string): string {
  if (!query) return 'https://www.google.com';
  const clean = encodeURIComponent(query.trim());
  const key = (storeKey || '').toLowerCase();

  if (key.includes('hepsiburada') || key === 'hb') return `https://www.hepsiburada.com/ara?q=${clean}`;
  if (key.includes('trendyol') || key === 'ty') return `https://www.trendyol.com/sr?q=${clean}`;
  if (key.includes('amazon') || key === 'az') return `https://www.amazon.com.tr/s?k=${clean}`;
  if (key.includes('n11')) return `https://www.n11.com/arama?q=${clean}`;
  if (key.includes('ptt')) return `https://www.pttavm.com/arama?q=${clean}`;
  if (key.includes('vatan') || key === 'vt') return `https://www.vatanbilgisayar.com/arama/${clean}/`;
  if (key.includes('mediamarkt') || key.includes('media') || key === 'mm') return `https://www.mediamarkt.com.tr/tr/search.html?query=${clean}`;
  if (key.includes('teknosa') || key === 'tk') return `https://www.teknosa.com/arama?s=${clean}`;
  if (key.includes('incehesap') || key === 'ih') return `https://www.incehesap.com/arama/?q=${clean}`;
  if (key.includes('itopya') || key === 'it') return `https://www.itopya.com/AramaSonuclari/?b=${clean}`;
  if (key.includes('sinerji') || key === 'sn') return `https://www.sinerji.gen.tr/Arama?q=${clean}`;
  if (key.includes('gaming') || key === 'gg') return `https://www.gaming.gen.tr/?s=${clean}`;
  if (key.includes('gamegaraj') || key === 'gr') return `https://www.gamegaraj.com/arama/?q=${clean}`;
  if (key.includes('tebilon') || key === 'tb') return `https://www.tebilon.com/arama/?q=${clean}`;
  if (key.includes('ebrar') || key === 'eb') return `https://www.ebrarbilgisayar.com/arama?q=${clean}`;

  return `https://www.google.com/search?q=${clean}+fiyat`;
}

