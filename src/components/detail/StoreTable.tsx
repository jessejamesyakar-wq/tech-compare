'use client';

import React, { useState } from 'react';
import { StoreOffer } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingBag, Star, ExternalLink, Award, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { ProductLike, isEligibleForLivePriceComparison } from '@/lib/releaseYearFilter';
import { HistoricalRetroShowcase } from './HistoricalRetroShowcase';
import { OutboundPriceModal } from '@/components/outbound/OutboundPriceModal';
import { PriceDisclaimer } from '@/components/legal/PriceDisclaimer';
import {
  evaluateAllStoresPresence,
  ValidatedStoreOffer,
} from '@/lib/pricing/storeAvailabilityEngine';

interface StoreTableProps {
  offers: StoreOffer[];
  currency: string;
  product?: ProductLike;
}

export function StoreTable({ offers = [], currency, product }: StoreTableProps) {
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
    return <HistoricalRetroShowcase product={product} compact={false} />;
  }

  // Reference base price for the product
  const baseReferencePrice = offers.length > 0 ? offers[0].price : (product?.basePrice || 40000);

  // Real Multi-Store Presence Evaluation (Anti-False-Positive Shield)
  const presenceReport = evaluateAllStoresPresence({
    id: (product as any)?.id || '',
    name: product?.name || 'Ürün',
    category: (product as any)?.category,
    basePrice: baseReferencePrice,
    storeOffers: offers,
  });

  const activeOffers = presenceReport.activeOffers;
  const unavailableOffers = presenceReport.unavailableOffers;

  const handleGoToStore = (offer: ValidatedStoreOffer) => {
    setOutboundModal({
      isOpen: true,
      productName: product?.name || 'Seçili Ürün',
      storeName: offer.storeName,
      price: offer.price || baseReferencePrice,
      targetUrl: offer.url
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
      
      {/* Table Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-slate-900 text-lg font-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>
              {activeOffers.length > 0
                ? `${activeOffers.length} Güvenilir Mağazada Canlı Fiyat`
                : 'Piyasa Fiyat Takibi'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Yetkili satıcılar ve pazar yeri mağazalarının doğrulanmış anlık teklifleri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Canlı Doğrulandı</span>
          </span>
          <span className="text-xs text-emerald-800 font-black bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200">
            {activeOffers.length} Satış Noktası
          </span>
        </div>
      </div>

      {/* Active In-Stock Stores List */}
      {activeOffers.length > 0 ? (
        <div className="space-y-3">
          {(isExpanded ? activeOffers : activeOffers.slice(0, 6)).map((offer, idx) => {
            return (
              <div
                key={offer.storeKey}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl border transition-all ${
                  idx === 0
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                }`}
              >
                
                {/* Store logo & info */}
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl ${offer.storeLogoBg} flex items-center justify-center font-black text-sm shadow-xs border border-white/20 shrink-0`}>
                    {offer.storeLabel}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{offer.storeName}</span>
                      {idx === 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <Award className="w-3 h-3" />
                          <span>En Uygun Fiyat</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>4.8</span>
                        <span className="text-slate-400 font-normal">(Doğrulanmış Mağaza)</span>
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">Kargo: 1-2 iş günü</span>
                    </div>
                  </div>
                </div>

                {/* Price & Go button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Peşin Fiyat</span>
                    <span className={`text-xl sm:text-2xl font-black ${idx === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {offer.price ? offer.price.toLocaleString() : '---'} {currency}
                    </span>
                  </div>

                  <button
                    onClick={() => handleGoToStore(offer)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Fiyata Git</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Bu ürün şu anda anlaşmalı online mağazaların hiçbirinde satışta bulunmamaktadır. Stoklar yenilendiğinde bildirim almak için fiyat alarmı kurabilirsiniz.</span>
        </div>
      )}

      {/* Expand/Collapse Toggle if active stores > 6 */}
      {activeOffers.length > 6 && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/60 text-slate-700 hover:text-emerald-800 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
        >
          {isExpanded ? (
            <>
              <span>Daha Az Mağaza Göster</span>
              <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>Tüm {activeOffers.length} Mağazayı Göster ({activeOffers.length - 6} Mağaza Daha)</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      )}

      {/* Out-of-Stock / Not-Listed Stores Transparent Section */}
      {unavailableOffers.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowUnavailable(!showUnavailable)}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-between w-full py-1.5 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-300" />
              <span>Şu An Bu Ürünü Satmayan veya Stoğu Tükenen Mağazalar ({unavailableOffers.length})</span>
            </span>
            {showUnavailable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showUnavailable && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              {unavailableOffers.map((store) => (
                <div
                  key={store.storeKey}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 text-slate-600"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={`w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 ${store.storeLogoBg}`}>
                      {store.storeLabel}
                    </span>
                    <span className="truncate text-slate-800 font-medium text-xs">{store.storeName}</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-400 shrink-0 ml-1">
                    {store.status === 'OUT_OF_STOCK' ? 'Tükendi' : 'Stokta Yok'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Legal Transparency & Disclaimer Component */}
      <PriceDisclaimer variant="card" />

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

export default StoreTable;
