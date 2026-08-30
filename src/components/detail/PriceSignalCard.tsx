'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { calculatePriceSignal, PriceSignalResult } from '@/lib/priceSignal';
import {
  TrendingDown,
  TrendingUp,
  Clock,
  Info,
  Sparkles,
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface PriceSignalCardProps {
  product: Product;
  className?: string;
}

export function PriceSignalCard({ product, className = '' }: PriceSignalCardProps) {
  if (!product) return null;

  const signal: PriceSignalResult = calculatePriceSignal(product);

  const getIcon = () => {
    switch (signal.iconType) {
      case 'trend_down':
        return <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'trend_up':
        return <TrendingUp className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'clock':
        return <Clock className="w-5 h-5 text-blue-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4 transition-all ${className}`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-slate-900 text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5">
              <span>Şimdi mi Al, Sonra mı?</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Veri Odaklı Fiyat Karar Rehberi
            </span>
          </div>
        </div>

        {/* AI Decision Badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black self-start sm:self-auto ${signal.badgeColor}`}
        >
          {getIcon()}
          <span>{signal.badgeText}</span>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {signal.explanation}
          </p>
        </div>

        {/* Statistical Metrics Grid (Only shown when data is sufficient) */}
        {signal.status !== 'insufficient_data' && signal.currentPrice > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Mevcut Fiyat</span>
              <span className="text-slate-900 font-black text-xs sm:text-sm">
                ₺{signal.currentPrice.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Dönem Ortalaması</span>
              <span className="text-slate-700 font-bold text-xs sm:text-sm">
                ₺{signal.avgHistoricalPrice.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Dönem En Düşüğü</span>
              <span className="text-emerald-600 font-black text-xs sm:text-sm">
                ₺{signal.minHistoricalPrice.toLocaleString('tr-TR')}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-500 block font-semibold">Ortalama Sapma</span>
              <span
                className={`font-black text-xs sm:text-sm ${
                  signal.diffPercentFromAvg < 0 ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {signal.diffPercentFromAvg > 0 ? `+${signal.diffPercentFromAvg}%` : `${signal.diffPercentFromAvg}%`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer Transparency & Data Source Note */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100/90 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">{signal.dataSpanText}</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          <span>Şeffaf Algoritmik Analiz</span>
        </div>
      </div>
    </div>
  );
}
