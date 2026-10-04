'use client';

import React from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { AIAssistantModal } from '@/components/ai/AIAssistantModal';
import { Homepage2026Showcase } from './Homepage2026Showcase';
import { Showcase2026Data } from '@/lib/showcase2026';

interface ChoiceAAntiGravityLandingProps {
  showcase2026?: Showcase2026Data;
}

export function ChoiceAAntiGravityLanding({ showcase2026 }: ChoiceAAntiGravityLandingProps = {}) {
  return (
    <div className="relative bg-transparent text-slate-900 font-sans selection:bg-emerald-600 selection:text-white">
      {/* Background Soft Atmospheric Ambient Glow (Sitenin gri tonuyla kesintisiz bütünleşen ferah mavi aura) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1560px] h-[640px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-80px] left-[15%] w-[650px] h-[500px] bg-sky-200/25 blur-[160px] rounded-full" />
        <div className="absolute top-[40px] right-[15%] w-[550px] h-[450px] bg-cyan-200/20 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-full 2xl:max-w-[1560px] mx-auto px-2 sm:px-4 lg:px-6 pt-2 pb-16">
        {/* 1. HERO SECTION: ROBOPENGU INLINE ASİSTAN DENEYİMİ */}
        <AIAssistantModal isInline={true} />

        {/* 2026 TEKNOLOJİ VİTRİNİ (DYNAMIC SHOWCASE - CANONICAL DATA ENGINE) */}
        {showcase2026 && showcase2026.initialProducts?.length > 0 && (
          <Homepage2026Showcase
            initialProducts={showcase2026.initialProducts}
            rotationPool={showcase2026.rotationPool}
          />
        )}

        {/* 2. DOĞRULANMIŞ FİYAT TAKİBİ (RADAR STRIP) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 sm:my-14">
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center border border-slate-200 shrink-0">
                <TrendingDown className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Doğrulanmış Fiyat Takibi
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                    <ShieldCheck className="w-3 h-3 text-slate-600" />
                    <span>ŞEFFAF TAKİP</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Katalogdaki 5.814 ürünü listeliyoruz; doğrulanmış mağaza tekliflerini ve mevcut fiyat geçmişini şeffaf biçimde gösteriyoruz.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <div className="text-left md:text-right">
                <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fiyat Geçmişi</span>
                <span className="text-xs font-bold text-slate-800">Doğrulanmış Fiyat Alarmları</span>
              </div>
              <Link
                href="/alerts"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors min-h-[44px] shrink-0"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Tüm İndirimleri Takip Et</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
export default ChoiceAAntiGravityLanding;
