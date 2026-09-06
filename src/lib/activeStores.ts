/**
 * Centralized Store Activation & Dynamic Count Configuration
 * 
 * To activate more stores in the comparison tables and cards as approvals are received,
 * simply add their key to the ACTIVE_STORE_KEYS array (e.g. ['hepsiburada', 'trendyol', 'amazon']).
 */

export type StoreKey =
  | 'hepsiburada'
  | 'trendyol'
  | 'vatan'
  | 'mediamarkt'
  | 'teknosa'
  | 'amazon'
  | 'n11'
  | 'pttavm';

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
  vatan: {
    id: 'vatan',
    name: 'Vatan Bilgisayar',
    keyword: 'vatan',
    label: 'VT',
    bg: 'bg-blue-800 text-white',
    color: 'text-blue-700',
    defaultUrl: 'https://www.vatanbilgisayar.com',
    multiplier: 1.0
  },
  mediamarkt: {
    id: 'mm',
    name: 'MediaMarkt',
    keyword: 'media',
    label: 'MM',
    bg: 'bg-red-600 text-white',
    color: 'text-red-600',
    defaultUrl: 'https://www.mediamarkt.com.tr',
    multiplier: 1.006
  },
  teknosa: {
    id: 'teknosa',
    name: 'Teknosa',
    keyword: 'teknosa',
    label: 'TK',
    bg: 'bg-orange-600 text-white',
    color: 'text-orange-600',
    defaultUrl: 'https://www.teknosa.com',
    multiplier: 1.004
  },
  amazon: {
    id: 'amazon',
    name: 'Amazon',
    keyword: 'amazon',
    label: 'AZ',
    bg: 'bg-amber-500 text-slate-900',
    color: 'text-amber-600',
    defaultUrl: 'https://www.amazon.com.tr',
    multiplier: 0.998
  },
  n11: {
    id: 'n11',
    name: 'n11',
    keyword: 'n11',
    label: 'N11',
    bg: 'bg-purple-700 text-white',
    color: 'text-purple-700',
    defaultUrl: 'https://www.n11.com',
    multiplier: 0.994
  },
  pttavm: {
    id: 'pttavm',
    name: 'PttAVM',
    keyword: 'ptt',
    label: 'PTT',
    bg: 'bg-amber-400 text-blue-950 font-black',
    color: 'text-blue-900 font-extrabold',
    defaultUrl: 'https://www.pttavm.com',
    multiplier: 0.992
  }
};

/**
 * 🔒 ACTIVE_STORES configuration
 * Currently ONLY Hepsiburada is active.
 * To activate other stores, simply uncomment them below or append to the array.
 */
export const ACTIVE_STORES: StoreKey[] = [
  'hepsiburada',
  // 'trendyol',
  // 'vatan',
  // 'mediamarkt',
  // 'teknosa',
  // 'amazon',
  // 'n11',
  // 'pttavm',
];

/**
 * Filtered list of store definitions matching only the active stores
 */
export const ACTIVE_RETAILERS: StoreDefinition[] = ACTIVE_STORES.map(
  (key) => ALL_RETAILER_DEFINITIONS[key]
);

/**
 * Total count of currently active stores (e.g. 1)
 */
export const ACTIVE_STORE_COUNT = ACTIVE_STORES.length;

/**
 * Helper to generate dynamic title or description text
 * Example: getActiveStoreComparisonTitle() -> "{count} Mağaza Canlı Fiyat Karşılaştırması"
 */
export function getActiveStoreComparisonTitle(prefix = ''): string {
  if (ACTIVE_STORE_COUNT === 1) {
    const storeName = ACTIVE_RETAILERS[0]?.name || 'Hepsiburada';
    return prefix ? `${prefix} ${storeName} Canlı Fiyatı` : `${storeName} Canlı Fiyatı`;
  }
  return `${prefix ? prefix + ' ' : ''}${ACTIVE_STORE_COUNT} Mağaza Canlı Fiyat Karşılaştırması`;
}
