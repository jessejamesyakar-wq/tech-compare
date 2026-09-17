'use client';

import React, { useState } from 'react';
import { StoreOffer } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingBag, ExternalLink, Clock, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { ProductLike, isEligibleForLivePriceComparison } from '@/lib/releaseYearFilter';
import { HistoricalRetroShowcase } from './HistoricalRetroShowcase';
import { OutboundPriceModal } from '@/components/outbound/OutboundPriceModal';
import { PriceDisclaimer } from '@/components/legal/PriceDisclaimer';
import {
  evaluateAllStoresPresence,
  ValidatedStoreOffer,
} from '@/lib/pricing/storeAvailabilityEngine';

interface CompactStoreComparisonProps {
  offers: StoreOffer[];
  basePrice: number;
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
    price: number;
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

  // Find actual lowest price among real offers or basePrice
  const realOffers = (offers || []).filter((o) => o && o.price > 0);
  const effectiveBasePrice =
    realOffers.length > 0 ? Math.min(...realOffers.map((o) => o.price)) : basePrice > 0 ? basePrice : 0;

  // Real Multi-Store Presence Evaluation (Anti-False-Positive Shield)
  const presenceReport = evaluateAllStoresPresence({
    id: (product as any)?.id || '',
    name: product?.name || 'Ürün',
    category: (product as any)?.category,
    basePrice: effectiveBasePrice,
    storeOffers: offers,
  });

  const activeStores = presenceReport.activeOffers;
  const unavailableStores = presenceReport.unavailableOffers;
  const lowestPrice = presenceReport.lowestPrice || effectiveBasePrice;

  const handleGoToStore = (store: ValidatedStoreOffer) => {
    setOutboundModal({
      isOpen: true,
      productName: product?.name || 'Seçili Ürün',
      storeName: store.storeName,
      price: store.price || effectiveBasePrice,
      targetUrl: store.url
    });
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3.5 shadow-xs my-4">
      
      {/* Header with CANLI Badge & Real Store Count */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <h3 className="text-slate-900 text-xs font-black uppercase tracking-wider">
            {activeStores.length > 0
              ? `${activeStores.length} Güvenilir Mağazada Satışta`
              : 'Canlı Piyasa Fiyat Kontrolü'}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CANLI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Anlık Doğrulandı
          </span>
        </div>
      </div>

      {/* In-Stock Stores Grid */}
      {activeStores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(isExpanded ? activeStores : activeStores.slice(0, 6)).map((store) => {
            const isCheapest = lowestPrice !== null && store.price === lowestPrice;

            return (
              <div
                key={store.storeKey}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
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
                  </div>
                </div>

                {/* Price & Action Link */}
                <div className="flex items-center gap-2 shrink-0">
                  {store.price ? (
                    <span className={`font-black text-xs ${isCheapest ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {store.price.toLocaleString()} {currency}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold italic">
                      Fiyat Alınıyor
                    </span>
                  )}

                  <button
                    onClick={() => handleGoToStore(store)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                    title={`${store.storeName} Mağazasına Git`}
                  >
                    <span>Git</span>
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
          <span>Bu ürün şu an anlaşmalı mağazaların canlı stoklarında tükenmiş durumda. Fiyat alarmı kurarak yeni stok geldiğinde haberdar olabilirsiniz.</span>
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
              <span>Stokta Olmayan Mağazalar ({unavailableStores.length})</span>
            </span>
            {showUnavailable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showUnavailable && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 text-[11px]">
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
                    {store.status === 'OUT_OF_STOCK' ? 'Tükendi' : 'Yok'}
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
        targetUrl={outboundModal.targetUrl}
      />
    </div>
  );
}

export default CompactStoreComparison;
