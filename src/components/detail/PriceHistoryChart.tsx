'use client';

import React from 'react';
import { PriceHistoryPoint, Product } from '@/lib/types';
import { useI18n } from '@/lib/i18n/context';
import { PriceSignalCard } from './PriceSignalCard';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { TrendingDown, Sparkles } from 'lucide-react';
import { parseDateToMs } from '@/lib/priceSignal';
import { formatObservedDate } from '@/lib/dateParsing';
import { getObservedPriceHistory } from '@/lib/pricing/priceHistoryEvidence';

interface PriceHistoryChartProps {
  data: PriceHistoryPoint[];
  currency: string;
  product?: Product;
}

export function PriceHistoryChart({ data, currency, product }: PriceHistoryChartProps) {
  const { t } = useI18n();

  const effectiveData = React.useMemo(() => getObservedPriceHistory(data), [data]);

  const dateStats = React.useMemo(() => {
    if (effectiveData.length < 2) return null;
    const firstPoint = effectiveData[0];
    const lastPoint = effectiveData[effectiveData.length - 1];
    const t1 = parseDateToMs(firstPoint.date);
    const t2 = parseDateToMs(lastPoint.date);

    // Reject out-of-order or invalid date bounds - NO synthetic diffDays = 30 fallback!
    if (t1 <= 0 || t2 <= 0 || t2 <= t1) {
      return null;
    }

    const diffDays = Math.max(1, Math.round((t2 - t1) / (1000 * 60 * 60 * 24)));

    return {
      firstDate: formatObservedDate(firstPoint.date),
      lastDate: formatObservedDate(lastPoint.date),
      diffDays
    };
  }, [effectiveData]);

  if (effectiveData.length < 2 || !dateStats) {
    return (
      <div className="bg-white/90 border border-slate-200 rounded-3xl p-6 shadow-xs text-xs text-slate-500 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          <TrendingDown className="w-4 h-4 text-slate-400" />
          <span>{t.priceHistoryChart} (Yetersiz Doğrulanmış Veri)</span>
        </div>
        <p className="text-slate-500 font-medium">
          Bu ürün için henüz yeterli sayıda sıralı ve doğrulanmış geçmiş fiyat gözlemi bulunmamaktadır. Gerçekçi olmayan veya tahmini fiyat geçmişi grafiklere yansıtılmamaktadır.
        </p>
      </div>
    );
  }

  const prices = effectiveData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const currentPrice = effectiveData[effectiveData.length - 1].price;
  const initialPrice = effectiveData[0].price;
  const priceDiff = currentPrice - initialPrice;
  const percentChange = ((priceDiff / initialPrice) * 100).toFixed(1);

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] font-extrabold px-3 py-1 rounded-full border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-slate-600" />
              <span>Fiyat Trend Analizi (Gözlem Verisi)</span>
            </div>
            <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200">
              <span>Son Gözlem: {dateStats.lastDate}</span>
            </div>
          </div>
          <h3 className="text-slate-900 text-lg font-black flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
            <span>Kayıtlı Fiyat Geçmişi</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            {dateStats.firstDate} – {dateStats.lastDate} arasındaki kayıtlı fiyatlar ({effectiveData.length} gözlem noktası, {dateStats.diffDays} gün)
          </p>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-semibold">En Düşük ({dateStats.diffDays} Gün)</span>
            <span className="text-emerald-600 font-black text-sm">
              {minPrice.toLocaleString('tr-TR')} {currency}
            </span>
          </div>
          <div className="bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-500 block font-semibold">Değişim ({dateStats.diffDays} Gün)</span>
            <span className={`font-black text-sm ${Number(percentChange) <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {Number(percentChange) <= 0 ? '' : '+'}{percentChange}%
            </span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={effectiveData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradientLight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              tick={{ fontSize: 11, fontWeight: 600 }}
              tickLine={false}
              tickFormatter={formatObservedDate}
            />
            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11, fontWeight: 600 }}
              domain={['auto', 'auto']}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as PriceHistoryPoint;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl shadow-xl text-xs space-y-1 text-white">
                      <div className="text-slate-400 font-semibold">{formatObservedDate(item.date)}</div>
                      <div className="text-emerald-400 font-black text-base">
                        {item.price.toLocaleString('tr-TR')} {currency}
                      </div>
                      {item.store && (
                        <div className="text-[11px] text-slate-300 font-medium">Kaynak: <span className="font-bold text-white">{item.store}</span></div>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={3.5}
              fillOpacity={1}
              fill="url(#priceGradientLight)"
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
            />
            <ReferenceLine y={minPrice} stroke="#10b981" strokeDasharray="4 4" strokeWidth={1.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Embedded "Şimdi mi Al, Sonra mı?" Price Signal Card */}
      {product && (
        <div className="pt-2 border-t border-slate-100">
          <PriceSignalCard product={product} className="border-0 p-0 shadow-none bg-transparent" />
        </div>
      )}

    </div>
  );
}

export default PriceHistoryChart;
