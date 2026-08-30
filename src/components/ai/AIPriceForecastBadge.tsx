import React from 'react';
import { Product } from '@/lib/types';
import { calculatePriceSignal, PriceSignalResult } from '@/lib/priceSignal';
import { Sparkles, TrendingDown, TrendingUp, Clock, Info } from 'lucide-react';

interface AIPriceForecastBadgeProps {
  product: Product;
}

export function AIPriceForecastBadge({ product }: AIPriceForecastBadgeProps) {
  if (!product) return null;

  const signal: PriceSignalResult = calculatePriceSignal(product);

  const getIcon = () => {
    switch (signal.iconType) {
      case 'trend_down':
        return <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'trend_up':
        return <TrendingUp className="w-4 h-4 text-amber-600 shrink-0" />;
      case 'clock':
        return <Clock className="w-4 h-4 text-blue-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-slate-500 shrink-0" />;
    }
  };

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl border ${signal.badgeColor} shadow-2xs space-y-1.5 transition-all`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-black">
          {getIcon()}
          <span>{signal.badgeText}</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current shadow-2xs">
          Şimdi mi Al, Sonra mı?
        </span>
      </div>

      <p className="text-xs font-semibold leading-relaxed opacity-90">
        {signal.explanation}
      </p>

      <div className="text-[10px] text-slate-500 pt-1 font-medium flex items-center justify-between">
        <span>{signal.dataSpanText}</span>
      </div>
    </div>
  );
}

