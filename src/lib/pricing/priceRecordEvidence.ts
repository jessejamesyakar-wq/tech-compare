import type { DbPrice, DbPriceHistory } from '@/lib/db/priceRepository';
import type { StoreOffer } from '@/lib/types';
import { getEligibleDirectOffers } from './unifiedPriceEvaluator';
import { getObservedPriceHistory } from './priceHistoryEvidence';
import { isSearchUrl } from '@/lib/priceFreshness';

/** Map the database's snake_case fields explicitly; a type cast cannot do it. */
export function readPriceRecord(raw: unknown): DbPrice | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const field = (camel: string, snake: string) => row[camel] ?? row[snake];
  const price = row.price, total = field('totalPrice', 'total_price');
  const url = row.url;
  if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) return null;
  if (typeof total !== 'number' || !Number.isFinite(total) || total < price) return null;
  if (typeof url !== 'string' || isSearchUrl(url)) return null;
  const text = (camel: string, snake = camel) => typeof field(camel, snake) === 'string' ? field(camel, snake) as string : '';
  if (!text('productId', 'product_id') || row.currency !== 'TRY') return null;
  const shipping = field('shippingPrice', 'shipping_price');
  const stock = text('stockStatus', 'stock_status');
  return {
    id: text('id'), productId: text('productId', 'product_id'), storeId: text('storeId', 'store_id'),
    storeProductId: text('storeProductId', 'store_product_id'), price, totalPrice: total,
    shippingPrice: typeof shipping === 'number' && Number.isFinite(shipping) && shipping >= 0 ? shipping : null,
    currency: 'TRY', stockStatus: ['IN_STOCK', 'OUT_OF_STOCK', 'PREORDER'].includes(stock) ? stock as DbPrice['stockStatus'] : 'UNKNOWN',
    sellerName: text('sellerName', 'seller_name'), url,
    isAnomaly: field('isAnomaly', 'is_anomaly') !== false,
    checkedAt: text('checkedAt', 'checked_at'),
    channelId: (row.channel_id ?? row.channelId ?? null) as string | null,
    sourceType: (row.source_type ?? row.sourceType ?? null) as string | null,
    sourceIdentifier: (row.source_identifier ?? row.sourceIdentifier ?? null) as string | null,
    sourceUrl: (row.source_url ?? row.sourceUrl ?? null) as string | null,
    observedAt: (row.observed_at ?? row.observedAt ?? null) as string | null,
    affiliateUrl: (row.affiliate_url ?? row.affiliateUrl ?? null) as string | null,
  };
}

/** Catalog fallback preserves successful check evidence; reading never refreshes it. */
export function catalogPriceRecords(productId: string, offers: StoreOffer[] = [], nowMs = Date.now()): DbPrice[] {
  const { freshDirectOffers, staleDirectOffers } = getEligibleDirectOffers(offers, nowMs);
  return [...freshDirectOffers, ...staleDirectOffers].map((offer, index) => {
    const shipping = Number.isFinite(offer.shippingFee) && offer.shippingFee! >= 0 ? offer.shippingFee! : offer.freeShipping === true ? 0 : null;
    return {
      id: `catalog_${productId}_${index}`, productId,
      storeId: offer.storeName.toLowerCase().replace(/[^a-z0-9]/g, ''), storeProductId: offer.id || '',
      price: offer.price, shippingPrice: shipping, totalPrice: offer.price + (shipping ?? 0),
      currency: 'TRY', stockStatus: 'IN_STOCK', sellerName: offer.sellerName || offer.storeName,
      url: offer.url!, isAnomaly: false, checkedAt: offer.lastCheckedAt!,
      channelId: null, sourceType: null, sourceIdentifier: null, sourceUrl: null, observedAt: null, affiliateUrl: null,
    };
  });
}

/** Only a completed, matched, in-stock check can create an observed history point. */
export function createPriceObservation(price: DbPrice, previous?: DbPrice | null, nowMs = Date.now()): DbPriceHistory | null {
  if (price.isAnomaly || price.stockStatus !== 'IN_STOCK') return null;

  // Commercial Price Firewall: Updating provenance metadata on current price row
  // must NOT generate a duplicate history observation if commercial terms are unchanged.
  if (
    previous &&
    previous.price === price.price &&
    previous.totalPrice === price.totalPrice &&
    previous.stockStatus === price.stockStatus &&
    previous.shippingPrice === price.shippingPrice
  ) {
    return null;
  }

  const points = getObservedPriceHistory([{
    date: price.checkedAt, observedAt: price.observedAt || price.checkedAt, price: price.price,
    currency: price.currency, store: price.sellerName || price.storeId, sourceUrl: price.url, sourceType: 'observed',
  }], nowMs);
  if (!points.length) return null;
  const oldPrice = previous && Number.isFinite(previous.price) && previous.price > 0 ? previous.price : undefined;
  const difference = oldPrice === undefined ? 0 : Number((price.price - oldPrice).toFixed(2));
  return {
    productId: price.productId, storeId: price.storeId, storeProductId: price.storeProductId,
    oldPrice, price: price.price, shippingPrice: price.shippingPrice, totalPrice: price.totalPrice,
    difference, percentageDifference: oldPrice === undefined ? 0 : Number((difference / oldPrice * 100).toFixed(2)),
    stockStatus: price.stockStatus, recordedAt: price.checkedAt,
    sourceUrl: price.sourceUrl ?? price.url,
    sourceType: price.sourceType ?? null,
    currency: price.currency,
    channelId: price.channelId ?? null,
    channelType: (price as any).channelType ?? null,
    sourceIdentifier: price.sourceIdentifier ?? price.storeProductId ?? null,
    sellerName: price.sellerName || null,
    observedAt: price.observedAt ?? price.checkedAt,
  };
}
