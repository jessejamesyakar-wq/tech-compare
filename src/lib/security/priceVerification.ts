import { StoreOffer } from '@/lib/types';
import { evaluateProductPricing } from '@/lib/pricing/unifiedPriceEvaluator';
import { parseOfferDateToMs } from '@/lib/dateParsing';

export interface VerificationStatus {
  verified: boolean;
  freshnessSeconds: number | null;
  lastCheckedTimeAgo: string;
  stockStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'UNKNOWN';
  currentPrice: number | null;
  lastSeenPrice: number | null;
  formattedPrice: string | null;
  statusLabel: string;
  storeName: string;
  redirectUrl: string | null;
  isFallback: boolean;
}

/** Evaluates an existing catalogue offer; this is not a live merchant price check. */
export class PriceVerificationEngine {
  public static verifyOffer(offer: StoreOffer, nowMs = Date.now()): VerificationStatus {
    const pricing = evaluateProductPricing({ storeOffers: [offer] }, nowMs);
    const checked = parseOfferDateToMs(offer.lastCheckedAt || offer.verifiedAt);
    const freshnessSeconds = checked > 0 && checked <= nowMs ? Math.floor((nowMs - checked) / 1000) : null;
    let redirectUrl: string | null = null;
    try {
      const parsed = new URL(offer.url || '');
      if (['http:', 'https:'].includes(parsed.protocol) && !parsed.username && !parsed.password) redirectUrl = parsed.href;
    } catch { /* Missing or unsafe URLs cannot be opened. */ }
    const verified = pricing.currentPrice !== null && redirectUrl !== null;
    const shownPrice = verified ? pricing.currentPrice : pricing.lastSeenPrice;
    return {
      verified,
      freshnessSeconds,
      lastCheckedTimeAgo: freshnessSeconds === null ? 'Kontrol tarihi bilinmiyor'
        : freshnessSeconds >= 3600 ? `${Math.floor(freshnessSeconds / 3600)} saat önce`
        : freshnessSeconds >= 60 ? `${Math.floor(freshnessSeconds / 60)} dakika önce` : 'Az önce',
      stockStatus: offer.inStock === true ? 'IN_STOCK' : offer.inStock === false ? 'OUT_OF_STOCK' : 'UNKNOWN',
      currentPrice: verified ? pricing.currentPrice : null,
      lastSeenPrice: pricing.lastSeenPrice,
      formattedPrice: shownPrice === null ? null : `₺${shownPrice.toLocaleString('tr-TR')}`,
      statusLabel: pricing.priceStatus === 'no_offer' ? 'Fiyat doğrulanmadı' : pricing.statusLabel,
      storeName: offer.storeName,
      redirectUrl,
      isFallback: !verified,
    };
  }
}
