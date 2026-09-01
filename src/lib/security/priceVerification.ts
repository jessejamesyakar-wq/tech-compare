export interface VerificationStatus {
  verified: boolean;
  freshnessSeconds: number;
  lastCheckedTimeAgo: string;
  stockStatus: 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK';
  currentPrice: number;
  formattedPrice: string;
  storeName: string;
  redirectUrl: string;
  isFallback: boolean;
  verificationToken: string;
}

export class PriceVerificationEngine {
  /**
   * Fast In-Memory Cache for Verified Outbound Offers (TTL: 15 minutes)
   */
  private static cache = new Map<string, { timestamp: number; data: VerificationStatus }>();

  /**
   * Perform rapid cache and price sanity verification before outbound redirect
   */
  public static verifyOffer(params: {
    productId: string;
    storeName: string;
    price: number;
    targetUrl: string;
    stockStatus?: 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK';
    checkedAt?: string;
  }): VerificationStatus {
    const { productId, storeName, price, targetUrl, stockStatus = 'IN_STOCK', checkedAt } = params;
    const cacheKey = `${productId}_${storeName}_${price}`;

    const now = Date.now();
    const cached = this.cache.get(cacheKey);

    if (cached && now - cached.timestamp < 15 * 60 * 1000) {
      return cached.data;
    }

    const checkTimestamp = checkedAt ? new Date(checkedAt).getTime() : now;
    const freshnessSeconds = Math.max(0, Math.floor((now - checkTimestamp) / 1000));

    let timeAgo = 'Az önce';
    if (freshnessSeconds >= 3600) {
      timeAgo = `${Math.floor(freshnessSeconds / 3600)} saat önce`;
    } else if (freshnessSeconds >= 60) {
      timeAgo = `${Math.floor(freshnessSeconds / 60)} dakika önce`;
    }

    const verificationResult: VerificationStatus = {
      verified: price > 0,
      freshnessSeconds,
      lastCheckedTimeAgo: timeAgo,
      stockStatus: price > 0 ? stockStatus : 'OUT_OF_STOCK',
      currentPrice: price,
      formattedPrice: `₺${price.toLocaleString('tr-TR')}`,
      storeName,
      redirectUrl: targetUrl || '#',
      isFallback: freshnessSeconds > 7200, // Fallback triggered if data older than 2 hours
      verificationToken: `vfy_${Buffer.from(`${productId}:${storeName}:${price}:${now}`).toString('base64url').slice(0, 16)}`
    };

    this.cache.set(cacheKey, { timestamp: now, data: verificationResult });
    return verificationResult;
  }
}
