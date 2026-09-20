import React from 'react';
import { evaluateProductPricing, getPriceHeading } from '@/lib/pricing/unifiedPriceEvaluator';
import type { StoreOffer } from '@/lib/types';

type PriceProduct = { basePrice?: number; sourceType?: string; storeOffers?: StoreOffer[] };

export function ProductPriceSummary({ product, dark = false, compact = false }: {
  product: PriceProduct; dark?: boolean; compact?: boolean;
}) {
  const price = evaluateProductPricing(product);
  const tone = price.isFresh
    ? dark ? 'text-emerald-300' : 'text-emerald-700'
    : dark ? 'text-slate-200' : 'text-slate-700';
  return (
    <div data-testid="product-price-summary" className="min-w-0 space-y-1">
      <p className={`text-xs font-medium ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{getPriceHeading(price)}</p>
      <p className={`${compact ? 'text-base' : 'text-2xl sm:text-3xl'} font-black tracking-tight break-words ${tone}`}>
        {price.displayPrice !== null ? `${price.displayPrice.toLocaleString('tr-TR')} TL` : 'Fiyat bilgisi yok'}
      </p>
      <p className={`text-xs font-semibold ${tone}`}>{price.statusLabel}</p>
      {price.activeStoreCount > 0 && <p className={`text-xs ${tone}`}>{price.activeStoreCount} mağazada doğrulanmış güncel teklif</p>}
    </div>
  );
}
