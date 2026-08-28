'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { Sparkles, ArrowRight, Zap, Trophy, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AIUpgradeAdvisorProps {
  currentProduct: Product;
}

const OLD_DEVICE_PRESETS: Record<string, string[]> = {
  smartphones: ['iPhone 12 / 13', 'iPhone 11', 'Galaxy S21 / S22', 'Redmi Note 10 / 11'],
  monitors: ['75Hz 1080p Standart Monitör', '60Hz TN Panel Ofis Ekranı', '144Hz 1080p Eski Nesil IPS'],
  laptops: ['Intel 10./11. Nesil Eski Laptop', 'MacBook Air M1 (2020)', 'GTX 1650 Eski Oyuncu Laptopu'],
  tvs: ['Full HD 1080p Eski LCD TV', '55 inç Standart 60Hz 4K TV (2019)']
};

export function AIUpgradeAdvisor({ currentProduct }: AIUpgradeAdvisorProps) {
  if (!currentProduct) return null;

  const category = currentProduct.category || 'smartphones';
  const presets = OLD_DEVICE_PRESETS[category] || OLD_DEVICE_PRESETS.smartphones;
  const [selectedOldDevice, setSelectedOldDevice] = useState(presets[0] || 'Eski Model Cihaz');

  const basePrice = typeof currentProduct.basePrice === 'number' ? currentProduct.basePrice : 20000;
  const performanceGain = basePrice > 40000 ? '+%75 Zirve Performans Sıçraması' : '+%50 Akıcılık & Panel Gelişimi';

  return (
    <div className="bg-gradient-to-br from-indigo-50/80 via-white to-emerald-50/80 border border-indigo-200/80 rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-[11px] font-black px-2.5 py-0.5 rounded-full border border-indigo-200 uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Yükseltme (Upgrade) Danışmanı</span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Eski Cihazınızdan Bu Modele Geçmeye Değer mi?
          </h3>
        </div>

        <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
          Değer Analizi: 9.1 / 10
        </span>
      </div>

      {/* Selector and Evaluation */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-bold text-slate-600 block mb-1.5">
            Şu An Kullandığınız Cihaz Segmenti:
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset}
                onClick={() => setSelectedOldDevice(preset)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  selectedOldDevice === preset
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Verdict Box */}
        <div className="bg-white/90 border border-indigo-100 rounded-2xl p-4 space-y-2">
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <span>{selectedOldDevice}</span>
              <ArrowRight className="w-4 h-4 text-indigo-500" />
              <strong className="text-indigo-900">{currentProduct.name}</strong>
            </span>
            <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {performanceGain}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            🤖 <strong>Yapay Zekâ Kararı:</strong> {selectedOldDevice} modelinden bu cihaza geçtiğinizde gerek panel akıcılığı, gerekse tepki süresi ve enerji verimliliğinde çok belirgin bir sıçrama yaşarsınız. <strong>Yükseltmeye kesinlikle değer!</strong>
          </p>
        </div>
      </div>

    </div>
  );
}
