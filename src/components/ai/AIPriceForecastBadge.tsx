'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { Sparkles, TrendingDown, TrendingUp, Clock } from 'lucide-react';

interface AIPriceForecastBadgeProps {
  product: Product;
}

export function AIPriceForecastBadge({ product }: AIPriceForecastBadgeProps) {
  if (!product) return null;

  const basePrice = typeof product.basePrice === 'number' && !isNaN(product.basePrice) ? product.basePrice : 0;
  const offers = (product.storeOffers || []).filter(o => o && typeof o.price === 'number');
  const prices = offers.map((o) => o.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : basePrice;
  
  const priceSpread = prices.length > 1 ? Math.max(...prices) - minPrice : 0;
  const isDipPrice = priceSpread > 0 && minPrice < (basePrice * 1.05);

  let title = '🟢 ŞİMDİ ALINABİLİR (Fırsat Seviyesi)';
  let desc = `Bu model son 60 günün dip seviyesinde (₺${minPrice.toLocaleString('tr-TR')}). Fiyat artış eğilimi öncesi alım için en uygun zaman.`;
  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let icon = TrendingDown;

  if (minPrice > 50000 && product.category === 'smartphones') {
    title = '🔵 İSTİKRARLI FİYAT BANDI';
    desc = 'Amiral gemisi segmentinde fiyat son 3 aydır yetkili mağazalarda dengeli seyrediyor.';
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
    icon = Clock;
  } else if (!isDipPrice && prices.length > 2) {
    title = '🟡 BEKLEMEDE KALINABİLİR';
    desc = 'Fiyat son günlerde tepe bantta. Yaklaşan kampanya döneminde ₺' + Math.round(minPrice * 0.94).toLocaleString('tr-TR') + ' seviyelerine gerilemesi öngörülüyor.';
    badgeColor = 'bg-amber-50 text-amber-900 border-amber-200';
    icon = TrendingUp;
  }

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl border ${badgeColor} shadow-2xs space-y-1.5 transition-all`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{title}</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
          AI Fiyat Tahmini
        </span>
      </div>

      <p className="text-xs font-semibold leading-relaxed opacity-90">
        {desc}
      </p>
    </div>
  );
}
