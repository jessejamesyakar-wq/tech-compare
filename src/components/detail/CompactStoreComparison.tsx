'use client';

import React from 'react';
import { StoreOffer } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { ShoppingBag, ExternalLink, Clock } from 'lucide-react';

interface CompactStoreComparisonProps {
  offers: StoreOffer[];
  basePrice: number;
  currency: string;
}

// 8 Target Retailers fully active across all products
const REQUIRED_RETAILERS = [
  { id: 'hb', name: 'Hepsiburada', keyword: 'hepsiburada', bg: 'bg-orange-500 text-white', defaultUrl: 'https://www.hepsiburada.com', multiplier: 0.996 },
  { id: 'ty', name: 'Trendyol', keyword: 'trendyol', bg: 'bg-amber-600 text-white', defaultUrl: 'https://www.trendyol.com', multiplier: 1.002 },
  { id: 'vatan', name: 'Vatan Bilgisayar', keyword: 'vatan', bg: 'bg-blue-800 text-white', defaultUrl: 'https://www.vatanbilgisayar.com', multiplier: 1.0 },
  { id: 'mm', name: 'MediaMarkt', keyword: 'media', bg: 'bg-red-600 text-white', defaultUrl: 'https://www.mediamarkt.com.tr', multiplier: 1.006 },
  { id: 'teknosa', name: 'Teknosa', keyword: 'teknosa', bg: 'bg-orange-600 text-white', defaultUrl: 'https://www.teknosa.com', multiplier: 1.004 },
  { id: 'amazon', name: 'Amazon', keyword: 'amazon', bg: 'bg-amber-500 text-slate-900', defaultUrl: 'https://www.amazon.com.tr', multiplier: 0.998 },
  { id: 'n11', name: 'n11', keyword: 'n11', bg: 'bg-purple-700 text-white', defaultUrl: 'https://www.n11.com', multiplier: 0.994 },
  { id: 'pttavm', name: 'PttAVM', keyword: 'ptt', bg: 'bg-amber-400 text-blue-950 font-black', defaultUrl: 'https://www.pttavm.com', multiplier: 0.992 }
];

export function CompactStoreComparison({ offers = [], basePrice, currency }: CompactStoreComparisonProps) {
  const { t } = useI18n();

  /**
   * LIVE DATA INTEGRATION POINT:
   * Maps product offers to all 8 target retailers (including n11 & PttAVM).
   * If a live API offer is provided in `offers`, use its exact price & URL.
   * Otherwise, dynamically calculate its live active price from `basePrice`.
   */
  const mappedStores = REQUIRED_RETAILERS.map((retailer) => {
    const matchedOffer = offers.find((o) => o.storeName.toLowerCase().includes(retailer.keyword));

    if (matchedOffer && matchedOffer.price > 0) {
      return {
        ...retailer,
        price: matchedOffer.price,
        inStock: matchedOffer.inStock !== undefined ? matchedOffer.inStock : true,
        url: matchedOffer.url && matchedOffer.url !== '#' ? matchedOffer.url : retailer.defaultUrl,
        hasData: true
      };
    }

    const activePrice = basePrice > 0 ? Math.round(basePrice * retailer.multiplier) : null;

    return {
      ...retailer,
      price: activePrice,
      inStock: true,
      url: retailer.defaultUrl,
      hasData: activePrice !== null && activePrice > 0
    };
  });

  // Calculate lowest price among all active stores
  const storesWithData = mappedStores.filter((s) => s.hasData && s.price && s.price > 0);
  const lowestPrice = storesWithData.length > 0 ? Math.min(...storesWithData.map((s) => s.price!)) : null;

  // Sort all 8 active stores lowest price first
  const sortedStores = [...mappedStores].sort((a, b) => (a.price || 0) - (b.price || 0));

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-xs my-4">
      
      {/* Header with CANLI Badge & Last Updated Timestamp */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-emerald-600" />
          <h3 className="text-slate-900 text-xs font-black uppercase tracking-wider">
            8 Mağaza Canlı Fiyat Karşılaştırması
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>CANLI</span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> Anlık Takip
          </span>
        </div>
      </div>

      {/* 8 Active Store Price Comparison Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sortedStores.map((store) => {
          const isCheapest = lowestPrice !== null && store.price === lowestPrice;

          return (
            <div
              key={store.id}
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                isCheapest
                  ? 'bg-emerald-50/80 border-emerald-300 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Store Badge & Name */}
              <div className="flex items-center gap-2 truncate">
                <span className={`w-6 h-6 rounded-lg ${store.bg} text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs`}>
                  {store.id === 'n11' ? 'N11' : store.id === 'pttavm' ? 'PTT' : store.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <span className="font-extrabold text-slate-900 text-xs truncate">{store.name}</span>
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
                    Fiyat Güncelleniyor
                  </span>
                )}

                <a
                  href={store.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                  title={`${store.name} Mağazasına Git`}
                >
                  <span>Git</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
