
export type StoreKey =
  | 'hepsiburada' | 'trendyol' | 'amazon' | 'n11' | 'pttavm'
  | 'vatan' | 'mediamarkt' | 'teknosa' | 'incehesap' | 'itopya'
  | 'sinerji' | 'gaminggen' | 'gamegaraj' | 'tebilon' | 'ebrar';

export interface ScrapeOutput {
  store: StoreKey | null;
  price: number | null;
  inStock: boolean;
  title: string | null;
  currency: string;
  isValid: boolean;
  error?: string;
}


export function resolveStore(url: string): StoreKey | null {
  if (!url || typeof url !== 'string') return null;
  const lower = url.toLowerCase();
  if (lower.includes('hepsiburada.com')) return 'hepsiburada';
  if (lower.includes('trendyol.com')) return 'trendyol';
  if (lower.includes('amazon.com.tr') || lower.includes('amazon.tr')) return 'amazon';
  if (lower.includes('n11.com')) return 'n11';
  if (lower.includes('pttavm.com')) return 'pttavm';
  if (lower.includes('vatanbilgisayar.com')) return 'vatan';
  if (lower.includes('mediamarkt.com.tr') || lower.includes('mediamarkt.com')) return 'mediamarkt';
  if (lower.includes('teknosa.com')) return 'teknosa';
  if (lower.includes('incehesap.com')) return 'incehesap';
  if (lower.includes('itopya.com')) return 'itopya';
  if (lower.includes('sinerji.gen.tr') || lower.includes('sinerji.com')) return 'sinerji';
  if (lower.includes('gaming.gen.tr') || lower.includes('gaminggen')) return 'gaminggen';
  if (lower.includes('gamegaraj.com')) return 'gamegaraj';
  if (lower.includes('tebilon.com')) return 'tebilon';
  if (lower.includes('ebrarbilgisayar.com') || lower.includes('ebrar.com')) return 'ebrar';
  return null;
}

// Türkçe para formatını kusursuz float'a çevirici (örn: "54.999,90 TL" -> 54999.90)
export function cleanTurkishPrice(raw: string): number | null {
  if (!raw) return null;
  const sanitized = raw.replace(/[^\d.,]/g, '').trim();
  if (!sanitized) return null;

  if (sanitized.includes(',') && sanitized.includes('.')) {
    // 54.999,90 formatı
    const standard = sanitized.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(standard);
    return isNaN(val) ? null : val;
  } else if (sanitized.includes(',')) {
    // 54999,90 formatı
    const val = parseFloat(sanitized.replace(',', '.'));
    return isNaN(val) ? null : val;
  } else if (sanitized.includes('.')) {
    // 54999.90 veya binlik nokta
    const parts = sanitized.split('.');
    if (parts.length > 1 && parts[parts.length - 1].length === 3) {
      return parseFloat(sanitized.replace(/\./g, ''));
    }
    return parseFloat(sanitized);
  }
  const val = parseFloat(sanitized);
  return isNaN(val) ? null : val;
}

export async function scrapeTargetStore(url: string): Promise<ScrapeOutput> {
  const store = resolveStore(url);
  // H-D: this legacy dispatcher has no durable channel approval or identity gate.
  // Never send direct web requests through it, including on caller-supplied URLs.
  return { store, price: null, inStock: false, title: null,
    currency: 'TRY', isValid: false, error: 'CHANNEL_NOT_PRODUCTION_READY' };
}
