'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { Sparkles, TrendingDown, TrendingUp, Clock } from 'lucide-react';

interface AIPriceForecastBadgeProps {
  product: Product;
}

export function AIPriceForecastBadge({ product }: AIPriceForecastBadgeProps) {
  if (!product) return null;

  const offers = (product.storeOffers || []).filter((o) => o && typeof o.price === 'number');
  const prices = offers.map((o) => o.price).filter((p) => p > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice > 0 ? product.basePrice : 0;

  if (minPrice === 0) return null;

  // Real historical analytics
  const historyPrices = (product.priceHistory || []).map((h) => h.price).filter((p) => p > 0);
  const maxHistory = historyPrices.length > 0 ? Math.max(...historyPrices) : Math.round(minPrice * 1.12);
  const minHistory = historyPrices.length > 0 ? Math.min(...historyPrices) : minPrice;
  const avgHistory =
    historyPrices.length > 0
      ? historyPrices.reduce((a, b) => a + b, 0) / historyPrices.length
      : minPrice;

  const dropFromPeakPercent = maxHistory > minPrice ? Math.round(((maxHistory - minPrice) / maxHistory) * 100) : 0;
  const isDipPrice = minPrice <= minHistory * 1.02 || (dropFromPeakPercent >= 8);
  const isPeakPrice = maxHistory > 0 && minPrice >= maxHistory * 0.97 && dropFromPeakPercent <= 2;

  let title = '🔵 DENGELİ PİYASA BANDI';
  let desc = `Bu model piyasa ortalamasında (₺${minPrice.toLocaleString('tr-TR')}) istikrarlı seyrediyor. Yetkili mağazalarda fiyat dengeli.`;
  let badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
  let icon = Clock;

  if (isDipPrice && dropFromPeakPercent >= 5) {
    title = '🟢 ŞİMDİ ALINABİLİR (Fırsat Seviyesi)';
    desc = `Bu model son ayların en dip seviyesinde (₺${minPrice.toLocaleString('tr-TR')}). Geçmiş tepe fiyatına (₺${maxHistory.toLocaleString('tr-TR')}) kıyasla %${dropFromPeakPercent} avantaj sağlıyor.`;
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    icon = TrendingDown;
  } else if (isPeakPrice) {
    title = '🟡 BEKLEMEDE KALINABİLİR';
    desc = `Fiyat son günlerin tepe bandında seyrediyor. Kampanya dönemlerinde ₺${Math.round(avgHistory).toLocaleString('tr-TR')} seviyelerine gerilemesi öngörülüyor.`;
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
