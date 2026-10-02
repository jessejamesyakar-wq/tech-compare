// src/lib/ai/robopengu/buyWaitEngine.ts
/**
 * Worker 5: Buy Now / Wait Engine
 * Deterministic purchasing advice based on price intelligence, product release cycle, and offer stability.
 */

import { BuyWaitAdvice, BuyWaitDecision, PriceIntelligenceInfo } from './types';
import { CatalogProduct } from './candidateEngine';

export class BuyWaitEngine {
  public static evaluate(product: CatalogProduct, priceInfo: PriceIntelligenceInfo): BuyWaitAdvice {
    const reasonCodes: string[] = [];

    // Case 1: Insufficient Price Data
    if (priceInfo.status === 'NO_PRICE_DATA' || priceInfo.effectivePrice === null) {
      return {
        decision: 'INSUFFICIENT_DATA',
        confidence: 0.2,
        reasonCodes: ['NO_VERIFIED_PRICE_DATA'],
        freshness: 'Bilinmiyor',
        summary: 'Bu ürün için doğrulanmış güncel mağaza teklifi bulunmadığından satın alma zamanlaması tavsiyesi verilemiyor.',
      };
    }

    // Case 2: Catalog Fallback Only (No Active Retailer Offers)
    if (priceInfo.status === 'CATALOG_FALLBACK') {
      return {
        decision: 'NEUTRAL',
        confidence: 0.5,
        reasonCodes: ['CATALOG_MSRP_ONLY', 'NO_ACTIVE_RETAILER_OFFERS'],
        freshness: 'Katalog referans fiyatı',
        summary: 'Güncel perakende mağaza rekabeti gözlenmedi; liste fiyatı üzerinden işlem görüyor. İndirim dönemleri takip edilebilir.',
      };
    }

    // Case 3: Live Verified Price Analysis
    const releaseYear = product.releaseYear || product.specs?.releaseYear;
    const currentYear = 2026;
    const ageYears = releaseYear ? (currentYear - releaseYear) : 1;

    let decision: BuyWaitDecision = 'NEUTRAL';
    let confidence = 0.8;
    let summary = '';

    if (priceInfo.status === 'LIVE_PRICE' && priceInfo.storeCount >= 3) {
      reasonCodes.push('MULTI_STORE_COMPETITION');
      // If product has strong multi-store competition and mature market
      if (ageYears >= 1 && ageYears <= 2) {
        decision = 'BUY_NOW';
        confidence = 0.85;
        reasonCodes.push('MATURE_PRODUCT_OPTIMAL_PRICE', 'HEALTHY_COMPETITION');
        summary = 'Ürün piyasada olgunlaşmış ve çoklu mağaza rekabetiyle dengeli bir fiyat seviyesine ulaşmış durumda. Satın almak için uygun bir dönem.';
      } else if (ageYears === 0) {
        // Brand new launch
        decision = 'NEUTRAL';
        confidence = 0.75;
        reasonCodes.push('NEW_RELEASE_PREMIUM');
        summary = 'Yeni çıkan bir model olduğundan lansman fiyatı geçerli. Fiyatların oturması ve ilk kampanyaların başlaması için birkaç hafta beklenebilir.';
      } else {
        decision = 'BUY_NOW';
        confidence = 0.80;
        reasonCodes.push('CLEARANCE_OR_BEST_VALUE');
        summary = 'Fiyat/performans açısından cazip seviyede; stok durumuna göre değerlendirilebilir.';
      }
    } else if (priceInfo.status === 'PERSISTED_PRICE') {
      decision = 'NEUTRAL';
      confidence = 0.65;
      reasonCodes.push('STALE_OFFER_VERIFICATION_RECOMMENDED');
      summary = 'Son görülen fiyat üzerinden takip ediliyor. Satın almadan önce mağaza stok ve anlık sepet fiyatını teyit etmeniz önerilir.';
    } else {
      decision = 'NEUTRAL';
      confidence = 0.60;
      reasonCodes.push('STANDARD_MARKET_CONDITION');
      summary = 'Mevcut piyasa koşullarında standart fiyatlandırma devam ediyor.';
    }

    return {
      decision,
      confidence,
      reasonCodes,
      freshness: priceInfo.lastUpdated ? `Son kontrol: ${priceInfo.lastUpdated}` : 'Güncel kontrol',
      summary,
    };
  }
}
