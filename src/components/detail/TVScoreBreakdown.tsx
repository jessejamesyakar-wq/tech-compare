'use client';

import React from 'react';
import { TVProduct } from '@/lib/types';
import { calculateTVScore } from '@/lib/tvScoring';
import { Award, Tv, Gamepad2, Volume2, Cpu, Sparkles, ShieldCheck, Info } from 'lucide-react';

interface TVScoreBreakdownProps {
  tv: TVProduct;
}

export function TVScoreBreakdown({ tv }: TVScoreBreakdownProps) {
  const scoreResult = calculateTVScore(tv);
  const { totalScore, categories } = scoreResult;

  const categoryList = [
    { key: 'display', icon: Tv, data: categories.display, color: 'from-blue-500 to-indigo-600', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200' },
    { key: 'gaming', icon: Gamepad2, data: categories.gaming, color: 'from-emerald-500 to-teal-600', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { key: 'audio', icon: Volume2, data: categories.audio, color: 'from-purple-500 to-violet-600', badgeColor: 'bg-purple-50 text-purple-700 border-purple-200' },
    { key: 'smart', icon: Cpu, data: categories.smart, color: 'from-amber-500 to-orange-600', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
    { key: 'design', icon: Sparkles, data: categories.design, color: 'from-pink-500 to-rose-600', badgeColor: 'bg-pink-50 text-pink-700 border-pink-200' },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-xs font-extrabold px-3 py-1 rounded-full border border-amber-200">
            <Award className="w-4 h-4 text-amber-600" />
            <span>TechCompare / Epey TV Performans Puanı</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Televizyon Puanlama Analizi
          </h2>
          <p className="text-xs text-slate-500">
            Panel teknolojisi, yenileme hızı, ses sistemi, akıllı işlemci ve tasarım kriterlerine göre hesaplanmıştır.
          </p>
        </div>

        {/* Big Score Gauge Badge */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex flex-col items-center justify-center">
              <span className="text-xl font-black text-white leading-none">{totalScore}</span>
              <span className="text-[8px] uppercase font-black text-amber-400 tracking-wider">PUAN</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Genel TV Puanı</div>
            <div className="text-sm font-black text-white">
              {totalScore >= 95 ? 'Mükemmel Amiral Gemisi' : totalScore >= 90 ? 'Üst Seviye Performans' : totalScore >= 80 ? 'Fiyat / Performans' : 'Standart Model'}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Sub-category Progress Bars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categoryList.map(({ key, icon: Icon, data, color, badgeColor }) => (
          <div
            key={key}
            className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2 hover:bg-slate-100/50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl border ${badgeColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-slate-900 block leading-tight">
                    {data.title}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate block max-w-[200px] sm:max-w-[260px]">
                    {data.details}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-slate-900">{data.score}</span>
                <span className="text-[10px] text-slate-400 font-bold"> / 100</span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-2 rounded-full bg-slate-200/80 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
