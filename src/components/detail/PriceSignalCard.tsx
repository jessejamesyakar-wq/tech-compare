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
  Calendar,
  ExternalLink,
  Award,
  BellRing,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

interface PriceSignalCardProps {
  product: Product;
  className?: string;
}

export function PriceSignalCard({ product, className = '' }: PriceSignalCardProps) {
  if (!product) return null;

  const signal: PriceSignalResult = calculatePriceSignal(product);

  const getScoreBadgeStyles = () => {
    if (signal.timingScore >= 80) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-4 ring-emerald-500/10';
    }
    if (signal.timingScore <= 45) {
      return 'bg-amber-50 text-amber-900 border-amber-300 ring-4 ring-amber-500/10';
    }
    return 'bg-blue-50 text-blue-900 border-blue-200 ring-4 ring-blue-500/10';
  };

  const getScoreColor = () => {
    if (signal.timingScore >= 80) return 'text-emerald-600';
    if (signal.timingScore <= 45) return 'text-amber-600';
    return 'text-blue-600';
  };

  return (
    <div
      className={`bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-all ${className}`}
    >
      {/* 1. Üst Başlık & Zamanlama Skoru */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
            <Sparkles className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-slate-900 text-sm sm:text-base font-black tracking-tight">
                Almak İçin Doğru Zaman mı?
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                aceleEtme Zekası
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Çoklu Mağaza & Tarihsel Piyasa İndeksi
            </span>
          </div>
        </div>

        {/* 0 - 100 Dinamik Zamanlama Skoru Rozeti */}
        {signal.status !== 'insufficient_data' ? (
          <div
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border text-xs font-black self-start sm:self-auto transition-all ${getScoreBadgeStyles()}`}
          >
            <div className="flex flex-col items-end leading-none">
              <span className="text-[10px] uppercase font-bold text-slate-400">Zamanlama</span>
              <span className={`text-sm font-black ${getScoreColor()}`}>
                {signal.timingScore}<span className="text-[10px] font-bold text-slate-400">/100</span>
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <span className="font-extrabold">{signal.scoreLabel}</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Yeterli veri yok</span>
          </div>
        )}
      </div>

      {/* 2. Dinamik Görsel Fiyat Barometresi (Fiyat Cetveli & İbre) */}
      {signal.status !== 'insufficient_data' && signal.currentPrice > 0 && (
        <div className="bg-slate-50/75 border border-slate-100 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Dip Fiyat Bölgesi
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Dengeli Piyasa
            </span>
            <span className="flex items-center gap-1 text-amber-700">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Tepe Seviye
            </span>
          </div>

          {/* Barometre Çubuğu */}
          <div className="relative pt-6 pb-2">
            {/* Arka Plan Renkli Gradyan Bar */}
            <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-400 shadow-inner" />

            {/* İbre (Needle Pointer & Tooltip) */}
            <div
              className="absolute top-0 -translate-x-1/2 flex flex-col items-center transition-all duration-700 ease-out"
              style={{ left: `${Math.max(4, Math.min(96, signal.needlePositionPercent))}%` }}
            >
              <div className="bg-slate-900 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md whitespace-nowrap flex items-center gap-1">
                <span>₺{signal.currentPrice.toLocaleString('tr-TR')}</span>
              </div>
              <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-slate-900" />
              <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-slate-900 shadow-sm mt-0.5" />
            </div>
          </div>

          {/* Alt Limit Etiketleri */}
          <div className="flex items-center justify-between text-[10.5px] font-semibold text-slate-400 pt-1">
            <span>₺{signal.minHistoricalPrice.toLocaleString('tr-TR')}</span>
            <span>Ort: ₺{signal.avgHistoricalPrice.toLocaleString('tr-TR')}</span>
            <span>₺{signal.maxHistoricalPrice.toLocaleString('tr-TR')}</span>
          </div>
        </div>
      )}

      {/* 3. Açıklama & Karar Analizi */}
      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
        {signal.explanation}
      </div>

      {/* 4. Ticari Ortak Vitrini: "Günün En Rekabetçi Mağazası" */}
      {signal.bestStoreName && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-2xs shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                  Günün En Rekabetçi Teklifi
                </span>
                <span className="text-xs font-black text-slate-900">
                  {signal.bestStoreName}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {signal.marketSpreadPercent > 0
                  ? `Diğer mağazalara göre %${signal.marketSpreadPercent} (₺${signal.marketSpreadTl.toLocaleString('tr-TR')}) daha avantajlı!`
                  : `Güncel piyasadaki en iyi fiyat (₺${signal.currentPrice.toLocaleString('tr-TR')})`}
              </p>
            </div>
          </div>

          {/* Aksiyon Butonu (Kazan-Kazan) */}
          <div className="flex items-center gap-2 shrink-0">
            {signal.status === 'buy_now' && signal.bestStoreUrl ? (
              <a
                href={signal.bestStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow"
              >
                <span>{signal.bestStoreName}&apos;da İncele</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <Link
                href="/alerts"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>Fiyat Hedefi Kaydet</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* 5. İstatistik Metrikleri Tablosu */}
      {signal.status !== 'insufficient_data' && signal.currentPrice > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">En İyi Fiyat</span>
            <span className="text-slate-900 font-black text-xs sm:text-sm">
              ₺{signal.currentPrice.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Dönem Ortalaması</span>
            <span className="text-slate-700 font-bold text-xs sm:text-sm">
              ₺{signal.avgHistoricalPrice.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Dönem En Düşüğü</span>
            <span className="text-emerald-600 font-black text-xs sm:text-sm">
              ₺{signal.minHistoricalPrice.toLocaleString('tr-TR')}
            </span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <span className="text-[10px] text-slate-400 block font-semibold">Ortalama Farkı</span>
            <span
              className={`font-black text-xs sm:text-sm ${
                signal.diffPercentFromAvg <= 0 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {signal.diffPercentFromAvg > 0 ? `+${signal.diffPercentFromAvg}%` : `${signal.diffPercentFromAvg}%`}
            </span>
          </div>
        </div>
      )}

      {/* 6. Şeffaflık & Veri Kaynağı */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-600">{signal.dataSpanText}</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Şeffaf Çoklu Mağaza Endeksi</span>
        </div>
      </div>
    </div>
  );
}
