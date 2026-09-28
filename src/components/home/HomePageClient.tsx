'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { ChoiceAAntiGravityLanding } from './ChoiceAAntiGravityLanding';
import { Scale, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';

interface HomePageClientProps {
  heroSlides?: any[];
  allTVsList?: any[];
  mixedDiscountGrid?: any[];
  bestSellerCarouselList?: any[];
  showcaseData?: any;
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

export function HomePageClient({ popularComparisons, counts }: HomePageClientProps) {
  return (
    <div className="space-y-12 pb-16 max-w-full overflow-hidden bg-[#F8F9FC] text-slate-900 transition-colors">
      
      {/* 🚀 1. MAIN HERO LANDING EXPERIENCE & SIMPLIFIED PROOF SHOWCASE */}
      {/* (RoboPengu Chat as main entry + RoboScore Vitrin + Canlı İndirim Radarı) */}
      <ChoiceAAntiGravityLanding />

      {/* 📱 2. İHTİYACA GÖRE KEŞFET (9 Kategori Grid'i) */}
      <section className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            İhtiyaca Göre Keşfet
          </h2>
          <span className="text-xs text-slate-500 font-semibold">9 Kategori Kataloğu</span>
        </div>

        <CategoryIconStrip customCounts={counts} />
      </section>

      {/* ⚔️ 3. POPÜLER KARŞILAŞTIRMA ÖNERİLERİ */}
      {popularComparisons && popularComparisons.length > 0 && (
        <section className="space-y-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span>Popüler Karşılaştırma Önerileri</span>
                </h2>
                <p className="text-xs text-slate-500">Teknik özellik farklarını yan yana inceleyin</p>
              </div>
              <Link
                href="/compare"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 py-1 min-h-[44px]"
              >
                <span>Tümünü Gör</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {popularComparisons.slice(0, 4).map((item, idx) => (
                <Link
                  key={idx}
                  href={`/compare?d1=${encodeURIComponent(item.phone1Id)}&d2=${encodeURIComponent(item.phone2Id)}`}
                  className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all space-y-2 block"
                >
                  <div className="text-[11px] font-bold text-slate-400">Karşılaştırma #{idx + 1}</div>
                  <div className="text-xs font-bold text-slate-900 break-words leading-snug">
                    {item.phone1Name} <span className="text-emerald-600 font-extrabold">vs</span> {item.phone2Name}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span>Farkları İncele</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🛡️ 4. VERİ GÜVENİLİRLİĞİ VE ŞEFFAFLIK TAAHHÜDÜ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Veri Güvenilirliği ve Şeffaflık Taahhüdü</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            Katalog puanları bağımsız laboratuvar testi değildir. Fiyat etiketinde güncel teklif, son görülen fiyat veya katalog referansı ayrımını kontrol edin. Eksik kaynak bilgisi doğrulanmış sayılmaz.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-bold">
            <Link href="/iletisim?subject=hatali-bilgi" className="text-emerald-700 hover:underline flex items-center gap-1 min-h-[44px] inline-flex items-center">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hatalı Bilgi Bildir</span>
            </Link>
            <Link href="/gizlilik-politikasi" className="text-slate-500 hover:text-slate-700 min-h-[44px] inline-flex items-center">
              Gizlilik Politikası
            </Link>
            <Link href="/kullanim-kosullari" className="text-slate-500 hover:text-slate-700 min-h-[44px] inline-flex items-center">
              Kullanım Koşulları
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

export default HomePageClient;
