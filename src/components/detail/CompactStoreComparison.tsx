'use client';

import React, { useState } from 'react';
import { StoreOffer } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingBag, ExternalLink, Clock, ChevronDown, ChevronUp, AlertCircle, Search } from 'lucide-react';
import { ProductLike, isEligibleForLivePriceComparison } from '@/lib/releaseYearFilter';
import { HistoricalRetroShowcase } from './HistoricalRetroShowcase';
import { OutboundPriceModal } from '@/components/outbound/OutboundPriceModal';
import { PriceDisclaimer } from '@/components/legal/PriceDisclaimer';
import {
  evaluateAllStoresPresence,
  ValidatedStoreOffer,
} from '@/lib/pricing/storeAvailabilityEngine';
import { offerVariantLabel } from '@/lib/pricing/offerVariant';
import { getPriceFreshness } from '@/lib/priceFreshness';

interface CompactStoreComparisonProps {
  offers: StoreOffer[];
  basePrice?: number;
  currency: string;
  product?: ProductLike;
}

export function CompactStoreComparison({ offers = [], basePrice, currency, product }: CompactStoreComparisonProps) {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [outboundModal, setOutboundModal] = useState<{
    isOpen: boolean;
    productName: string;
    storeName: string;
    price: number | null;
    lastCheckedAt?: string;
    targetUrl: string;
  }>({
    isOpen: false,
    productName: '',
    storeName: '',
    price: 0,
    targetUrl: ''
  });

  // If product is a historical/retro model (pre-2018 non-Samsung/Apple), render the dedicated Retro Showcase
  if (product && !isEligibleForLivePriceComparison(product)) {
    return <HistoricalRetroShowcase product={product} compact={true} />;
  }

  // Real Multi-Store Presence Evaluation (Anti-False-Positive Shield)
  const presenceReport = evaluateAllStoresPresence({
    id: (product as any)?.id || '',
    name: product?.name || 'Ürün',
    category: (product as any)?.category,
    basePrice: basePrice ?? product?.basePrice,
    storeOffers: offers,
  });

  const activeStores = presenceReport.activeOffers; // Direct verified offers ONLY
  const searchStores = presenceReport.searchOffers;
  const unavailableStores = presenceReport.unavailableOffers;
  const lowestPrice = presenceReport.lowestPrice;

  const handleGoToStore = (store: ValidatedStoreOffer) => {
    setOutboundModal({
      isOpen: true,
      productName: [product?.name || 'Seçili Ürün', store.variantName].filter(Boolean).join(' · '),
      storeName: store.storeName,
      price: store.isSearchLink ? null : store.price,
      lastCheckedAt: store.lastCheckedAt,
      targetUrl: store.url
    });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-xs my-4">
      
      {/* Header with CANLI Badge & Real Store Count */}
      <div className="flex flex-wrap gap-2 items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <h3 className="text-slate-900 text-xs font-black uppercase tracking-wider">
            {activeStores.length > 0
              ? `${activeStores.length} Doğrulanmış Mağazada Satışta`
              : 'Piyasa Fiyat Kontrolü'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
            <span>{activeStores.length > 0 ? 'Güncel kayıtlar' : 'Güncel teklif yok'}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Kayıtlı teklif bilgisi
          </span>
        </div>
      </div>

      {/* Direct Verified Store Offers Grid */}
      {activeStores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(isExpanded ? activeStores : activeStores.slice(0, 6)).map((store) => {
            const isCheapest = lowestPrice !== null && store.price === lowestPrice;
            const freshness = getPriceFreshness(store.lastCheckedAt);

            return (
              <div
                key={store.storeKey}
                className={`flex flex-col items-stretch gap-2 p-2.5 rounded-xl border text-xs transition-all ${
                  isCheapest
                    ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Store Badge & Name */}
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-6 h-6 rounded-lg ${store.storeLogoBg} text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs`}>
                    {store.storeLabel}
                  </span>
                  <div className="truncate">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-slate-900 text-xs truncate">{store.storeName}</span>
                      {isCheapest && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-md shrink-0">
                          En Uygun
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium block">
                      {freshness.label}
                    </span>
                  </div>
                </div>

                {store.variantName && <p className="text-xs font-semibold text-slate-700 break-words">{offerVariantLabel(store)}</p>}
                {/* Price & Action Link */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {store.price ? (
                    <span className={`font-black text-xs ${isCheapest ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {store.price.toLocaleString('tr-TR')} {currency}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold italic">
                      ---
                    </span>
                  )}

                  <button
                    onClick={() => handleGoToStore(store)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] min-h-11 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    title={`${store.storeName} Mağazasında İncele`}
                  >
                    <span>Mağazada İncele</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Bu ürün için şu an doğrulanmış mağaza teklifi bulunmamaktadır. Aşağıdaki arama bağlantılarını kullanabilirsiniz.</span>
        </div>
      )}

      {/* Expand/Collapse Toggle if active stores > 6 */}
      {activeStores.length > 6 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          {isExpanded ? (
            <>
              <span>Daha Az Mağaza Göster</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span>Tüm {activeStores.length} Mağazayı Karşılaştır ({activeStores.length - 6} Mağaza Daha)</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      )}

      {/* Search Links in Compact View */}
      {searchStores.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-blue-600" />
            <span>Mağazada Ara ({searchStores.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {searchStores.map((store) => (
              <div
                key={store.storeKey}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className={`w-5 h-5 rounded text-[9px] font-black flex items-center justify-center shrink-0 ${store.storeLogoBg}`}>
                    {store.storeLabel}
                  </span>
                  <span className="truncate text-slate-800 font-bold text-[11px]">{store.storeName}</span>
                </div>
                <button
                  onClick={() => handleGoToStore(store)}
                  className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-[9px] px-2 py-1 rounded-md transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Mağazada ara 🔍</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Out-of-Stock / Not-Listed Stores Transparent Section */}
      {unavailableStores.length > 0 && (
        <div className="pt-1 border-t border-slate-100/80">
          <button
            type="button"
            onClick={() => setShowUnavailable(!showUnavailable)}
            className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-between w-full py-1 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              <span>Güncel Teklifi Doğrulanmayan Mağazalar ({unavailableStores.length})</span>
            </span>
            {showUnavailable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showUnavailable && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 text-[11px]">
              {unavailableStores.map((store) => (
                <div
                  key={store.storeKey}
                  className="flex items-center justify-between py-1 px-2 rounded-lg bg-white border border-slate-200/50 text-slate-600"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className={`w-4 h-4 rounded text-[9px] font-black flex items-center justify-center shrink-0 ${store.storeLogoBg}`}>
                      {store.storeLabel}
                    </span>
                    <span className="truncate text-slate-700 font-medium">{store.storeName}</span>
                  </div>
                  <span className="text-[9px] font-extrabold text-slate-400 shrink-0 ml-1">
                    {store.isSearchLink && store.isReal ? 'Arama bağlantısı' : store.status === 'OUT_OF_STOCK' ? 'Son kayıtta stok yok' : store.status === 'NOT_LISTED' ? 'Kayıtlı teklif yok' : store.status === 'UNKNOWN' ? 'Stok bilinmiyor' : 'Güncelliği doğrulanmadı'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mini Disclaimer in buybox */}
      <PriceDisclaimer variant="compact" />

      {/* Outbound Confirmation & Verification Modal */}
      <OutboundPriceModal
        isOpen={outboundModal.isOpen}
        onClose={() => setOutboundModal((prev) => ({ ...prev, isOpen: false }))}
        productName={outboundModal.productName}
        storeName={outboundModal.storeName}
        price={outboundModal.price}
        lastCheckedAt={outboundModal.lastCheckedAt}
        targetUrl={outboundModal.targetUrl}
      />
    </div>
  );
}

export default CompactStoreComparison;
