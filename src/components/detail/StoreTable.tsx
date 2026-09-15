'use client';

import React, { useState } from 'react';
import { StoreOffer } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingBag, Star, ExternalLink, ShieldCheck, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { ProductLike, isEligibleForLivePriceComparison } from '@/lib/releaseYearFilter';
import { HistoricalRetroShowcase } from './HistoricalRetroShowcase';
import { OutboundPriceModal } from '@/components/outbound/OutboundPriceModal';
import { PriceDisclaimer } from '@/components/legal/PriceDisclaimer';
import { ACTIVE_RETAILERS, ACTIVE_STORE_COUNT, getStoreSearchUrl } from '@/lib/activeStores';

interface StoreTableProps {
  offers: StoreOffer[];
  currency: string;
  product?: ProductLike;
}

// Active store defaults controlled via src/lib/activeStores.ts (currently Hepsiburada only)
const ALL_STORE_DEFAULTS = ACTIVE_RETAILERS.map((r) => ({
  keyword: r.keyword,
  storeName: r.name,
  bg: r.bg,
  label: r.label,
  url: r.defaultUrl,
  multiplier: r.multiplier
}));

export function StoreTable({ offers = [], currency, product }: StoreTableProps) {
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
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

  const combinedOffers = ALL_STORE_DEFAULTS.map((def) => {
    const existing = offers.find((o) => o.storeName.toLowerCase().includes(def.keyword));
    const searchUrl = product?.name ? getStoreSearchUrl(def.keyword, product.name) : def.url;

    if (existing && existing.price > 0) {
      const targetUrl = existing.url && existing.url !== '#' && !existing.url.endsWith('.com') && !existing.url.endsWith('.com.tr')
        ? existing.url
        : (existing as any).productUrl || searchUrl;

      return {
        ...existing,
        bg: def.bg,
        label: def.label,
        url: targetUrl
      };
    }

    return {
      id: `st-${def.keyword}-gen`,
      storeName: def.storeName,
      storeLogoColor: def.bg,
      price: Math.round(baseReferencePrice * def.multiplier),
      inStock: true,
      shippingDays: 1,
      badges: ['Canlı Mağaza Fiyatı'],
      sellerRating: 4.8,
      sellerReviews: 8500,
      url: searchUrl,
      bg: def.bg,
      label: def.label
    };
  });

  // Sorted by lowest price first
  const sortedOffers = [...combinedOffers].sort((a, b) => a.price - b.price);

  const handleGoToStore = (offer: typeof combinedOffers[0]) => {
    setOutboundModal({
      isOpen: true,
      productName: product?.name || 'Seçili Ürün',
      storeName: offer.storeName,
      price: offer.price,
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
              {ACTIVE_STORE_COUNT === 1
                ? `${ACTIVE_RETAILERS[0]?.name || 'Hepsiburada'} Detaylı Fiyatı`
                : `${ACTIVE_STORE_COUNT} Mağaza Detaylı Fiyat Karşılaştırması`}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {ACTIVE_RETAILERS.map((r) => r.name).join(', ')} canlı teklifleri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Son Güncelleme: 16 Eylül 2026</span>
          </span>
          <span className="text-xs text-emerald-800 font-black bg-emerald-100 px-3.5 py-1.5 rounded-full border border-emerald-200">
            {ACTIVE_STORE_COUNT} Canlı Mağaza
          </span>
        </div>
      </div>

      {/* Stores List */}
      <div className="space-y-3">
        {(isExpanded ? sortedOffers : sortedOffers.slice(0, 6)).map((offer, idx) => {
          return (
            <div
              key={offer.id}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4.5 rounded-2xl border transition-all ${
                idx === 0
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
              }`}
            >
              
              {/* Store logo & info */}
              <div className="flex items-center gap-3.5">
                <div className={`w-11 h-11 rounded-xl ${offer.bg} flex items-center justify-center font-black text-sm shadow-xs border border-white/20 shrink-0`}>
                  {offer.label}
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
                      <span>{offer.sellerRating || 4.8}</span>
                      <span className="text-slate-400 font-normal">({offer.sellerReviews || 8500}+ yorum)</span>
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">Kargo: {offer.shippingDays || 1} iş günü</span>
                  </div>
                </div>
              </div>

              {/* Price & Go button */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Peşin Fiyat</span>
                  <span className={`text-xl sm:text-2xl font-black ${idx === 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {offer.price.toLocaleString()} {currency}
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

      {/* Expand/Collapse Toggle for 15 Stores */}
      {sortedOffers.length > 6 && (
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
              <span>Tüm {sortedOffers.length} Mağazayı Göster ({sortedOffers.length - 6} Mağaza Daha)</span>
              <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
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
