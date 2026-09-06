'use client';

import { ProductImage } from '@/components/ui/ProductImage';
import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Scale, Check, ShoppingBag } from 'lucide-react';

interface StickyHeaderBarProps {
  phone: Product;
}

export function StickyHeaderBar({ phone }: StickyHeaderBarProps) {
  const { t } = useI18n();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const inCompare = isInCompare(phone.id);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  // Safe subtitle generation across product categories
  const getSubTitle = () => {
    if (phone.category === 'smartphones') {
      const sp = phone.specs;
      return `${phone.brand} • ${sp?.screen?.size || ''} • ${sp?.memory?.ramGb || 8}GB RAM`;
    }
    if (phone.category === 'tvs') {
      const tv = phone.specs;
      return `${phone.brand} • ${tv?.screenSizeInches || ''}" ${tv?.displayTech || ''} • ${tv?.resolution || ''}`;
    }
    if (phone.category === 'laptops') {
      const lp = phone.specs;
      return `${phone.brand} • ${lp?.processor || 'Laptop'} • ${lp?.ramGb ? `${lp.ramGb}GB RAM` : ''}`;
    }
    return `${phone.brand}`;
  };

  return (
    <div className="fixed top-16 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-md animate-in slide-in-from-top-4 duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4">
        
        {/* Left: Thumbnail & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-50 p-0.5 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
            <ProductImage src={phone.image} alt={phone.name} variant="card" className="w-full h-full" />
          </div>
          <div>
            <h4 className="text-slate-900 text-xs sm:text-sm font-extrabold line-clamp-1">
              {phone.name}
            </h4>
            <span className="text-[10px] text-slate-500 font-semibold">
              {getSubTitle()}
            </span>
          </div>
        </div>

        {/* Right: Price & CTA buttons */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 block">{t.startingFrom}</span>
            <span className="text-base font-black text-emerald-600">
              {((phone.storeOffers && phone.storeOffers.length > 0 && Math.min(...phone.storeOffers.map((o) => o.price).filter((p) => p > 0)) > 0)
                ? Math.min(...phone.storeOffers.map((o) => o.price).filter((p) => p > 0))
                : phone.basePrice) > 0
                ? `${((phone.storeOffers && phone.storeOffers.length > 0 && Math.min(...phone.storeOffers.map((o) => o.price).filter((p) => p > 0)) > 0)
                    ? Math.min(...phone.storeOffers.map((o) => o.price).filter((p) => p > 0))
                    : phone.basePrice
                  ).toLocaleString()} ${phone.currency || 'TL'}`
                : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => (inCompare ? removeFromCompare(phone.id) : addToCompare(phone))}
              className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                inCompare
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {inCompare ? <Check className="w-3.5 h-3.5" /> : <Scale className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{inCompare ? t.inCompareList : t.addToCompare}</span>
            </button>

            <a
              href="#store-section"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer accent-glow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>En Uygun Mağazayı Gör</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
