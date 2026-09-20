'use client';

import React, { useState } from 'react';
import { StoreOffer } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingBag, Star, ExternalLink, Award, ChevronDown, ChevronUp, AlertCircle, Search } from 'lucide-react';
import { ProductLike, isEligibleForLivePriceComparison } from '@/lib/releaseYearFilter';
import { HistoricalRetroShowcase } from './HistoricalRetroShowcase';
import { OutboundPriceModal } from '@/components/outbound/OutboundPriceModal';
import { PriceDisclaimer } from '@/components/legal/PriceDisclaimer';
import {
  evaluateAllStoresPresence,
  ValidatedStoreOffer,
} from '@/lib/pricing/storeAvailabilityEngine';
import { getPriceFreshness } from '@/lib/priceFreshness';

interface StoreTableProps {
  offers: StoreOffer[];
  currency: string;
  product?: ProductLike;
}

export function StoreTable({ offers = [], currency, product }: StoreTableProps) {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [showSearchLinks, setShowSearchLinks] = useState(true);
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
    return <div id="store-section" className="scroll-mt-72"><HistoricalRetroShowcase product={product} compact={false} /></div>;
  }

  // Reference base price for the product
  const baseReferencePrice = product?.basePrice;

  // Real Multi-Store Presence Evaluation (Anti-False-Positive Shield & Search Link Taxonomy)
  const presenceReport = evaluateAllStoresPresence({
    id: (product as any)?.id || '',
    name: product?.name || 'Ürün',
    category: (product as any)?.category,
    basePrice: baseReferencePrice,
    storeOffers: offers,
  });

  const activeOffers = presenceReport.activeOffers; // Direct verified offers ONLY
  const searchOffers = presenceReport.searchOffers; // Search query links ONLY
  const unavailableOffers = presenceReport.unavailableOffers;

  const handleGoToStore = (offer: ValidatedStoreOffer) => {
    setOutboundModal({
      isOpen: true,
      productName: product?.name || 'Seçili Ürün',
      storeName: offer.storeName,
      price: offer.isSearchLink ? null : offer.price,
      lastCheckedAt: offer.lastCheckedAt,
      targetUrl: offer.url
    });
  };

  return (
    <div id="store-section" className="scroll-mt-72 min-w-0 bg-white border border-slate-200 rounded-3xl p-4 sm:p-8 space-y-6 shadow-xs">
      
      {/* Table Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-slate-900 text-lg font-black flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>
              {activeOffers.length > 0
                ? `${activeOffers.length} Doğrulanmış Mağaza Teklifi`
                : 'Piyasa Fiyat Takibi'}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Güncel teklif kayıtları ve mağaza arama bağlantıları ayrı gösterilir.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-800 font-black bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200">
            {activeOffers.length > 0 ? `${activeOffers.length} Güncel Teklif` : 'Güncel teklif doğrulanmadı'}
          </span>
        </div>
      </div>

      {/* Direct In-Stock Store Offers List */}
      {activeOffers.length > 0 ? (
        <div className="space-y-3">
          {(isExpanded ? activeOffers : activeOffers.slice(0, 6)).map((offer, idx) => {
            const freshness = getPriceFreshness(offer.lastCheckedAt);

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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{offer.storeName}</span>
                      {idx === 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                          <Award className="w-3 h-3" />
                          <span>En Uygun Fiyat</span>
                        </span>
                      )}

                      {/* Price Freshness Badge */}
                      {freshness.status === 'fresh' && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          Güncel Fiyat
                        </span>
                      )}
                      {freshness.status === 'stale' && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                          {freshness.label}
                        </span>
                      )}
                      {freshness.status === 'unverified' && (
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                          Fiyat doğrulanmadı
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-slate-600 font-medium">
                        {offer.sellerRating ? (
                          <>
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{offer.sellerRating}</span>
                          </>
                        ) : (
                          <span className="text-slate-400 font-normal">Değerlendirme: Bilinmiyor</span>
                        )}
                      </span>
                      <span>•</span>
                      <span className="text-slate-500">
                        Kargo: {offer.shippingInfo || 'Bilinmiyor'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price & Go button */}
                <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Doğrulanmış Fiyat</span>
                    <span className={`text-xl sm:text-2xl font-black ${idx === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {offer.price ? offer.price.toLocaleString('tr-TR') : '---'} {currency}
                    </span>
                  </div>

                  <button
                    onClick={() => handleGoToStore(offer)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Mağazada İncele</span>
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
          <span>Bu ürün için şu anda doğrulanmış doğrudan mağaza teklifi bulunmamaktadır. Aşağıdaki mağaza içi arama bağlantılarını kullanarak stok durumunu kontrol edebilirsiniz.</span>
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

      {/* Store Search Query Links (Mağazada Ara Section) */}
      {searchOffers.length > 0 && (
        <div className="pt-3 border-t border-slate-200/80">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex flex-wrap items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                <span>Mağazada Ara (Arama Yönlendirmeleri)</span>
                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                  {searchOffers.length} Mağaza
                </span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Arama sonuçlarına yönlendirir; doğrulanmış en düşük fiyat hesaplamasına katılmaz.
              </p>
            </div>
            <button
              type="button"
              aria-label={showSearchLinks ? 'Mağaza arama bağlantılarını gizle' : 'Mağaza arama bağlantılarını göster'}
              aria-expanded={showSearchLinks}
              onClick={() => setShowSearchLinks(!showSearchLinks)}
              className="w-11 h-11 shrink-0 text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer"
            >
              {showSearchLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showSearchLinks && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {searchOffers.map((offer) => (
                <div
                  key={offer.storeKey}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${offer.storeLogoBg}`}>
                      {offer.storeLabel}
                    </span>
                    <div className="truncate">
                      <span className="font-bold text-slate-900 block truncate">{offer.storeName}</span>
                      <span className="text-[10px] text-slate-400 block font-medium">Arama Bağlantısı</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleGoToStore(offer)}
                    className="min-h-11 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <span>Mağazada ara 🔍</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
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
              <span>Güncel Teklifi Doğrulanmayan Mağazalar ({unavailableOffers.length})</span>
            </span>
            {showUnavailable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showUnavailable && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
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
                    {store.isSearchLink && store.isReal ? 'Arama bağlantısı' : store.status === 'OUT_OF_STOCK' ? 'Son kayıtta stok yok' : store.status === 'NOT_LISTED' ? 'Kayıtlı teklif yok' : store.status === 'UNKNOWN' ? 'Stok bilinmiyor' : 'Güncelliği doğrulanmadı'}
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
        lastCheckedAt={outboundModal.lastCheckedAt}
        targetUrl={outboundModal.targetUrl}
      />

    </div>
  );
}

export default StoreTable;
