'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { ChoiceAAntiGravityLanding } from './ChoiceAAntiGravityLanding';
import { Scale, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { Showcase2026Data } from '@/lib/showcase2026';

interface HomePageClientProps {
  heroSlides?: any[];
  allTVsList?: any[];
  mixedDiscountGrid?: any[];
  bestSellerCarouselList?: any[];
  showcaseData?: any;
  showcase2026?: Showcase2026Data;
  popularComparisons: Array<{
    phone1Id: string;
    phone2Id: string;
    phone1Name: string;
    phone2Name: string;
  }>;
  counts: {
    smartphones: number;
    tvs: number;
    laptops: number;
    appliances: number;
    tablets: number;
    smartwatches: number;
    headphones: number;
    consoles: number;
    monitors: number;
  };
}

export function HomePageClient({ popularComparisons, counts, showcase2026 }: HomePageClientProps) {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16 max-w-full overflow-hidden bg-transparent text-slate-900 transition-colors">
      
      {/* 🚀 1. MAIN HERO LANDING EXPERIENCE & SIMPLIFIED PROOF SHOWCASE */}
      {/* (RoboPengu Chat as main entry + RoboScore Vitrin + Canlı İndirim Radarı) */}
      <ChoiceAAntiGravityLanding showcase2026={showcase2026} />

      {/* 📱 2. İHTİYACA GÖRE KEŞFET (9 Kategori Grid'i) */}
      <section aria-label="İhtiyaca Göre Keşfet" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80 uppercase tracking-wider">
                <span>Kategori Dizini</span>
              </span>
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                9 Ana Donanım Grubu
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              İhtiyaca Göre Keşfet
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Aradığınız teknoloji kategorisini seçin, teknik filtrelerle karşılaştırın.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-bold hidden sm:inline self-end pb-1">
            Toplam 5.800+ Model
          </span>
        </div>

        <CategoryIconStrip customCounts={counts} />
      </section>

      {/* ⚔️ 3. POPÜLER KARŞILAŞTIRMA ÖNERİLERİ */}
      {popularComparisons && popularComparisons.length > 0 && (
        <section aria-label="Popüler Karşılaştırmalar" className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-800 text-[11px] font-bold border border-indigo-200/80 uppercase tracking-wider">
                    <Scale className="w-3 h-3 text-indigo-600" />
                    <span>Doğrudan Düello</span>
                  </span>
                  <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
                    Yan Yana Tarafsız Analiz
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Popüler Karşılaştırmalar
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                  En çok merak edilen amiral gemisi modellerin teknik farklarını inceleyin.
                </p>
              </div>
              <Link
                href="/compare"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors min-h-[44px] shrink-0"
              >
                <span>Tümünü Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularComparisons.slice(0, 4).map((item, idx) => (
                <Link
                  key={idx}
                  href={`/compare?d1=${encodeURIComponent(item.phone1Id)}&d2=${encodeURIComponent(item.phone2Id)}`}
                  className="p-4 bg-slate-50/70 hover:bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all duration-200 space-y-3 block group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Düello #{idx + 1}</span>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">VS</span>
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 break-words leading-snug line-clamp-2 min-h-[2.5rem]">
                    {item.phone1Name} <span className="text-indigo-600 font-black">vs</span> {item.phone2Name}
                  </div>
                  <div className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700 flex items-center gap-1 pt-1">
                    <span>Farkları İncele</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🛡️ 4. VERİ GÜVENİLİRLİĞİ VE ŞEFFAFLIK TAAHHÜDÜ */}
      <section aria-label="Veri Güvenilirliği ve Şeffaflık" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-bold border border-slate-200/80 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Güven ve Doğruluk Standartları</span>
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Veri Güvenilirliği ve Şeffaflık Taahhüdü
              </h2>
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
              <span className="block text-xs font-bold text-slate-900">Doğrulanmış Katalog</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tüm teknik veriler üretici resmi belgeleri, teknik kılavuzlar ve doğrulanmış spesifikasyon standartlarıyla işlenir.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
              <span className="block text-xs font-bold text-slate-900">Şeffaf Fiyat Ayrımı</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                Canlı mağaza teklifleri, son görülen referanslar ve teklifi henüz doğrulanmamış ürünler açık etiketlerle sunulur.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1.5">
              <span className="block text-xs font-bold text-slate-900">Bağımsız Algoritma</span>
              <p className="text-xs text-slate-500 leading-relaxed">
                RoboScore puanları laboratuvar testi değildir; ağırlıklandırılmış teknik metrikler ve fiyat-performans analizidir.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold">
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/iletisim?subject=hatali-bilgi" className="text-slate-700 hover:text-emerald-700 flex items-center gap-1.5 min-h-[44px] transition-colors">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Hatalı Bilgi Bildir</span>
              </Link>
              <Link href="/gizlilik-politikasi" className="text-slate-500 hover:text-slate-800 min-h-[44px] inline-flex items-center transition-colors">
                Gizlilik Politikası
              </Link>
              <Link href="/kullanim-kosullari" className="text-slate-500 hover:text-slate-800 min-h-[44px] inline-flex items-center transition-colors">
                Kullanım Koşulları
              </Link>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              AceleEtme Karar Altyapısı © 2026
            </span>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePageClient;
