'use client';

import React from 'react';
import { Product } from '@/lib/types';
import { generateRefereeVerdict, RefereeVerdictResult, ScenarioVerdict } from '@/lib/ai/refereeVerdictEngine';
import {
  Sparkles,
  Camera,
  BatteryCharging,
  Coins,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Scale,
  Tv,
  Cpu,
  Monitor,
  Gamepad2,
  Zap
} from 'lucide-react';

interface RefereeVerdictCardProps {
  product1: Product;
  product2: Product;
  className?: string;
}

export function RefereeVerdictCard({ product1, product2, className = '' }: RefereeVerdictCardProps) {
  if (!product1 || !product2) return null;

  const verdict: RefereeVerdictResult = React.useMemo(() => {
    return generateRefereeVerdict(product1, product2);
  }, [product1, product2]);

  const getScenarioIcon = (name: ScenarioVerdict['iconName']) => {
    switch (name) {
      case 'Camera':
        return <Camera className="w-4 h-4 text-emerald-600" />;
      case 'BatteryCharging':
        return <BatteryCharging className="w-4 h-4 text-teal-600" />;
      case 'Coins':
        return <Coins className="w-4 h-4 text-amber-600" />;
      case 'Tv':
        return <Tv className="w-4 h-4 text-indigo-600" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4 text-purple-600" />;
      case 'Monitor':
        return <Monitor className="w-4 h-4 text-cyan-600" />;
      case 'Gamepad':
        return <Gamepad2 className="w-4 h-4 text-rose-600" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div
      className={`bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-[28px] p-5 sm:p-7 shadow-sm space-y-6 transition-all ${className}`}
    >
      {/* 1. Üst Başlık (Minimalist & Prestijli) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xs">
            <Scale className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-slate-900 text-base sm:text-lg font-black tracking-tight">
                RoboPengu Hakem Masası
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Tarafsız Jüri
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
              Teknik detayları basitleştiren senaryo bazlı karar özeti
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sponsor Etkisi Yok • %100 Veri Odaklı</span>
        </div>
      </div>

      {/* 2. Üç Temel Kullanım Senaryosu (3-Sütunlu Şık Kartlar) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {verdict.scenarios.map((scen, idx) => (
          <div
            key={idx}
            className="bg-slate-50/75 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all duration-200 hover:shadow-xs group"
          >
            {/* Kategori Başlığı ve İkon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                  {getScenarioIcon(scen.iconName)}
                </div>
                <span className="text-xs font-black text-slate-800">
                  {scen.label}
                </span>
              </div>
            </div>

            {/* Kazanan Ürün & Avantaj Rozeti */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs sm:text-[13px] font-black text-slate-900 line-clamp-1">
                  {scen.winnerProductName}
                </span>
              </div>
              <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                {scen.winnerAdvantage}
              </span>
            </div>

            {/* Gerekçe Cümlesi */}
            <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium pt-1 border-t border-slate-200/60">
              {scen.reason}
            </p>
          </div>
        ))}
      </div>

      {/* 3. Nihai Karar ve Seçim Rehberi (Alt Karar Kutusu) */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-black text-slate-100">
            Hangi Cihaz Size Göre? (Hızlı Karar Notu)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 font-medium">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <p className="leading-relaxed">
              {verdict.recommendation1}
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
            <p className="leading-relaxed">
              {verdict.recommendation2}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
