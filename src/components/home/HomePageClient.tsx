'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import {
  Scale,
  Sparkles,
  Swords,
  Search,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Headphones,
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
    <div className="space-y-8 pb-8 max-w-full overflow-hidden">
      {/* 🚀 SEAMLESS DARK HERO + AD CANVAS: Continuous Dark Ink Navy (#070D18) */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 bg-[#070D18] text-white p-6 sm:p-10 lg:p-12 relative border-b border-slate-800 shadow-2xl space-y-10">
        {/* Background Tech Grid & Cyan Glow Overlay */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] rounded-full" />
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />

          {/* SVG Tech Circuit Overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit-pattern" width="120" height="120" patternUnits="userSpaceOnUse">
                <path d="M20 0 v50 h50 v70" fill="none" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" />
                <circle cx="20" cy="50" r="3.5" fill="#38BDF8" />
                <circle cx="70" cy="50" r="2.5" fill="#5EEAD4" />
                <path d="M90 120 v-40 h-50" fill="none" stroke="#0284C7" strokeWidth="0.8" />
                <circle cx="90" cy="80" r="3" fill="#38BDF8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-pattern)" />
          </svg>
        </div>

        {/* HERO PART: 3-Line Headline, Search & 400px Metallic RoboPengu */}
        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & Search */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs sm:text-sm font-bold tracking-[0.25em] uppercase">
              <span>TEKNOLOJİDE ACELEYE YER YOK</span>
            </div>

            {/* 3-Line Large Main Headline */}
            <h1 className="text-4xl sm:text-7xl lg:text-[84px] font-black tracking-tight leading-[1.05] text-white">
              <span className="block">İyi ki</span>
              <span className="block">acele</span>
              <span className="block text-cyan-400 font-black">etmedin.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-lg">
              Önce sana neyin uygun olduğunu bulalım.
            </p>

            {/* Large Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('heroSearch') as HTMLInputElement)?.value;
                if (input?.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(input.trim())}`;
                }
              }}
              className="relative max-w-lg bg-[#10192A]/90 border border-slate-700/80 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-400/30 rounded-full p-2 flex items-center shadow-xl transition-all min-h-[58px]"
            >
              <label htmlFor="hero-search-input" className="sr-only">
                Neyi seçmek istiyorsun?
              </label>
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0 pointer-events-none" />
              <input
                id="hero-search-input"
                name="heroSearch"
                type="text"
                aria-label="Neyi seçmek istiyorsun?"
                placeholder="Neyi seçmek istiyorsun?"
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base font-semibold text-white outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Arama yap"
                className="bg-cyan-400 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 text-slate-950 font-black min-w-12 min-h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-md cursor-pointer shrink-0"
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>

            {/* Quick Category Links */}
            <div className="flex flex-wrap items-center gap-6 pt-1 text-sm font-bold text-slate-300">
              <Link
                href="/phones"
                className="py-2 min-h-11 inline-flex items-center hover:text-cyan-400 transition-colors border-b-2 border-transparent hover:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                Telefon
              </Link>
              <Link
                href="/laptops"
                className="py-2 min-h-11 inline-flex items-center hover:text-cyan-400 transition-colors border-b-2 border-transparent hover:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                Bilgisayar
              </Link>
              <Link
                href="/monitors"
                className="py-2 min-h-11 inline-flex items-center hover:text-cyan-400 transition-colors border-b-2 border-transparent hover:border-cyan-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
              >
                Monitör
              </Link>
            </div>
          </div>

          {/* Right Column: 400px Metallic RoboPengu Mascot Scene */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-4 lg:pt-0">
            {/* Speech Bubble */}
            <div className="relative mb-4 z-20">
              <div className="bg-slate-900/95 border border-cyan-400/40 text-cyan-200 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md relative">
                <span>Merhaba, ben RoboPengu. Birlikte bakalım.</span>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-r border-b border-cyan-400/40 rotate-45" />
              </div>
            </div>

            {/* RoboPengu Mascot Scene with 400px Cyber Platform */}
            <div className="relative w-72 sm:w-96 lg:w-[420px] h-72 sm:h-96 lg:h-[420px] flex items-center justify-center">
              {/* Circular Glowing Pedestal */}
              <div
                aria-hidden="true"
                className="absolute bottom-2 w-64 sm:w-80 lg:w-[400px] h-20 bg-gradient-to-t from-cyan-500/35 via-cyan-400/15 to-transparent border border-cyan-400/50 rounded-[100%] shadow-[0_0_60px_rgba(34,211,238,0.4)] motion-safe:animate-pulse"
              />
              <div
                aria-hidden="true"
                className="absolute bottom-4 w-52 sm:w-64 lg:w-[320px] h-12 border border-cyan-300/60 rounded-[100%]"
              />

              {/* High-Resolution RoboPengu Hero Waving Mascot Image (/assets/robopengu-hero-wave.png) */}
              <div className="relative w-60 sm:w-80 lg:w-[360px] h-60 sm:h-80 lg:h-[360px] z-10 transition-transform hover:scale-105 duration-300">
                <Image
                  src="/assets/robopengu-hero-wave.png"
                  alt="RoboPengu - Akıllı Teknoloji Rehberi"
                  fill
                  sizes="(max-width: 640px) 240px, (max-width: 1024px) 320px, 360px"
                  quality={95}
                  unoptimized
                  className="object-contain drop-shadow-[0_15px_30px_rgba(34,211,238,0.35)]"
                  priority
                />
              </div>
            </div>
          </div>

        </div>

        {/* 📢 AD BANNER PART (INTEGRATED INSIDE THE CONTINUOUS DARK CANVAS) */}
        <div className="relative z-10 max-w-7xl mx-auto space-y-2 pt-4">
          <div className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase px-1">
            REKLAM · ÖRNEK ALAN
          </div>

          <div className="relative bg-[#0A1224] border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Background Glow */}
            <div aria-hidden="true" className="absolute top-1/2 right-1/3 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

            {/* Ad Left Content */}
            <div className="space-y-3 max-w-lg z-10">
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                Markanız burada.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Teknoloji meraklılarıyla buluşun.
              </p>
              <div className="pt-1">
                <Link
                  href="/iletisim?subject=reklam"
                  className="inline-flex items-center gap-2 border border-cyan-400/80 hover:bg-cyan-400/10 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-full transition-all min-h-11 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
                >
                  <span>Reklam ver</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </Link>
              </div>
            </div>

            {/* Ad Right Product Visual (Sony WH-1000XM5 Headphone Decorative Asset) */}
            <div className="flex items-center gap-4 z-10 shrink-0">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-cyan-400/40 bg-slate-900/80 overflow-hidden shadow-lg p-2 flex items-center justify-center">
                <Image
                  src="/images/headphones/sony-wh-1000xm5.jpg"
                  alt="Sponsorlu Ürün Görseli"
                  width={96}
                  height={96}
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="hidden sm:block text-[10px] font-bold text-cyan-400 tracking-[0.15em] uppercase max-w-[160px] leading-relaxed">
                DOĞRU KİTLEYLE DAHA FAZLA MÜMKÜN.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⚪ LIGHT SILVER SECTION: "Bir seçim. Biraz daha netlik." */}
      <section className="max-w-7xl mx-auto bg-[#F1F5F9] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Title */}
          <div className="md:col-span-5 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              <span>Bir seçim.</span>
              <br />
              <span className="text-slate-700 dark:text-slate-300">Biraz daha netlik.</span>
            </h2>
          </div>

          {/* Right 3 Steps */}
          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div className="space-y-1">
              <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">01</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">İhtiyacını belirle</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">02</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Farkları gör</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs font-black text-cyan-600 dark:text-cyan-400">03</div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Kararını ver</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION (B): İhtiyaca Göre Keşfet */}
      <section className="space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>İhtiyaca Göre Keşfet</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">9 Kategori Kataloğu</span>
        </div>

        <CategoryIconStrip customCounts={counts} />
      </section>

      {/* SECTION (C): Karşılaştırma Önerileri */}
      {popularComparisons && popularComparisons.length > 0 && (
        <section className="space-y-4 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
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
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 py-1 min-h-11 inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
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
                className="p-3.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:shadow-md transition-all space-y-2 block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
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
      <section className="max-w-7xl mx-auto bg-emerald-50/60 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
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
            className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 py-1 min-h-11 inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Hatalı Bilgi Bildir</span>
          </Link>
          <Link
            href="/gizlilik-politikasi"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1 min-h-11 inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Gizlilik Politikası
          </Link>
          <Link
            href="/kullanim-kosullari"
            className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 py-1 min-h-11 inline-flex items-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
          >
            Kullanım Koşulları
          </Link>
        </div>
      </section>
    </div>
  );
}
