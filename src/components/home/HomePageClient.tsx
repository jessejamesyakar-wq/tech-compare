'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import {
  Scale,
  Sparkles,
  Swords,
  Search,
  ShieldCheck,
  ArrowRight,
  HelpCircle
} from 'lucide-react';

interface HomePageClientProps {
  heroSlides?: any[];
  allTVsList?: any[];
  mixedDiscountGrid?: any[];
  bestSellerCarouselList?: any[];
  popularComparisons: Array<{
    phone1Id: string;
    phone2Id: string;
    phone1Name: string;
    phone2Name: string;
  }>;
  showcaseData?: any;
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

export function HomePageClient({
  popularComparisons,
  counts
}: HomePageClientProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-6 sm:space-y-8 py-2 max-w-full overflow-hidden">
      {/* SECTION (A): Model Arama & Karşılaştırma Başlangıcı */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xl text-white space-y-4">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tarafsız Teknoloji Rehberi</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            Acele etme. Sana uygun teknolojiyi birlikte bulalım.
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Ürünlerin özelliklerini karşılaştır; fiyatların doğrulama durumunu gör.
          </p>
        </div>

        {/* Hero Arama & Karşılaştırma Ana Eylemi (Mobil Uyumlu Flex Wrap) */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Link
              href="/duello"
              className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all border border-emerald-400/40 cursor-pointer shrink-0"
            >
              <Swords className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
              <span>Düello Arena</span>
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md hover:bg-slate-800 transition-all cursor-pointer shrink-0"
            >
              <Scale className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>Karşılaştırma Masası</span>
            </Link>
          </div>

          {/* Hero Quick Search Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const input = (e.currentTarget.elements.namedItem('heroSearch') as HTMLInputElement)?.value;
              if (input?.trim()) {
                window.location.href = `/search?q=${encodeURIComponent(input.trim())}`;
              }
            }}
            className="relative w-full md:max-w-md flex items-center"
          >
            <label htmlFor="hero-search-input" className="sr-only">
              Model veya özellik ara
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="hero-search-input"
              name="heroSearch"
              type="text"
              aria-label="Model veya özellik ara"
              placeholder="Model veya özellik ara (ör. iPhone 15, LG OLED, S24 Ultra)..."
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 rounded-xl min-h-11 pl-9 pr-24 py-2 text-xs font-semibold text-white outline-none transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              aria-label="Model ara"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:outline-none text-white text-[11px] font-black px-3.5 py-1.5 rounded-lg shadow-xs transition-colors cursor-pointer min-h-9 flex items-center justify-center"
            >
              Model Ara
            </button>
          </form>
        </div>
      </section>

      {/* SECTION (B): İhtiyaca Göre Keşfet & Kategori Başlangıcı */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>İhtiyaca Göre Keşfet</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">9 Kategori Kataloğu</span>
        </div>

        <CategoryIconStrip customCounts={counts} />
      </section>

      {/* SECTION (C): Karşılaştırma Önerileri (Sınırlı Liste) */}
      {popularComparisons && popularComparisons.length > 0 && (
        <section className="space-y-4 bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Karşılaştırma Önerileri</span>
              </h2>
              <p className="text-xs text-slate-500">Teknik özellik farklarını yan yana inceleyin</p>
            </div>
            <Link
              href="/compare"
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
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
                className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all space-y-2 block"
              >
                <div className="text-[11px] font-bold text-slate-400">Karşılaştırma #{idx + 1}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white break-words leading-snug">
                  {item.phone1Name} <span className="text-emerald-600 font-black">vs</span> {item.phone2Name}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                  <span>Farkları İncele</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SECTION (D): Veri Güvenilirliği & Şeffaflık */}
      <section className="bg-emerald-50/60 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Veri Güvenilirliği ve Şeffaflık Taahhüdü</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Katalog puanları bağımsız laboratuvar testi değildir. Fiyat etiketinde güncel teklif, son görülen fiyat veya katalog referansı ayrımını kontrol edin. Eksik kaynak bilgisi doğrulanmış sayılmaz.
        </p>
        <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-bold">
          <Link
            href="/iletisim?subject=hatali-bilgi"
            className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hatalı Bilgi Bildir</span>
          </Link>
          <Link href="/gizlilik-politikasi" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Gizlilik Politikası
          </Link>
          <Link href="/kullanim-kosullari" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            Kullanım Koşulları
          </Link>
        </div>
      </section>
    </div>
  );
}
