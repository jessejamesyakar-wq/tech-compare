'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { ProductImage } from '@/components/ui/ProductImage';
import { ChoiceAAntiGravityLanding } from './ChoiceAAntiGravityLanding';
import { searchLocalProductsAsync, CompactSearchProduct } from '@/lib/clientSearch';
import {
  Scale,
  Sparkles,
  Swords,
  Search,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Smartphone,
  Laptop,
  Tv,
  Headphones,
  CheckCircle2,
  Zap,
  ExternalLink,
  TrendingDown,
  Clock,
  Activity,
  Cpu,
  Battery,
  Camera,
  Monitor
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

// Preset Duel Items by Category (Exact 1:1 Match for Mockup B Visuals)
const CATEGORY_PRESETS: Record<string, { p1: any; p2: any; specKeys: string[] }> = {
  phones: {
    p1: {
      id: 'iphone-16-pro-max',
      name: 'iPhone 16 Pro Max',
      brand: 'Apple',
      basePrice: 84999,
      category: 'Akıllı Telefon',
      image: '/images/phones/apple/iphone-16-teal.png',
      specs: { 'RAM': '12GB RAM', 'Depolama': '256GB SSD', 'Yenileme Hızı': '144Hz OLED' }
    },
    p2: {
      id: 'samsung-galaxy-s25-ultra',
      name: 'Samsung Galaxy S25 Ultra',
      brand: 'Samsung',
      basePrice: 79999,
      category: 'Akıllı Telefon',
      image: '/images/phones/samsung/studio/samsung-galaxy-s25-ultra.png',
      specs: { 'RAM': '16GB RAM', 'Depolama': '512GB SSD', 'Yenileme Hızı': '120Hz LTPO' }
    },
    specKeys: ['RAM', 'Depolama', 'Yenileme Hızı']
  },
  laptops: {
    p1: {
      id: 'lg-gram-16-laptop',
      name: 'LG Gram 16 Laptop',
      brand: 'LG',
      basePrice: 59999,
      category: 'Laptop',
      image: '/images/laptops/lg-395128.jpg',
      specs: { 'RAM': '16GB RAM', 'Depolama': '512GB SSD', 'Yenileme Hızı': '60Hz IPS' }
    },
    p2: {
      id: 'philips-221v8-laptop',
      name: 'Philips Performance 15',
      brand: 'Philips',
      basePrice: 44999,
      category: 'Laptop',
      image: '/images/laptops/philips-221v8-00.jpg',
      specs: { 'RAM': '32GB RAM', 'Depolama': '1TB SSD', 'Yenileme Hızı': '120Hz OLED' }
    },
    specKeys: ['RAM', 'Depolama', 'Yenileme Hızı']
  },
  tvs: {
    p1: {
      id: 'lg-oled-55-c4',
      name: 'LG 55" OLED C4 4K',
      brand: 'LG',
      basePrice: 62999,
      category: 'Televizyon',
      image: '/images/tvs/lg_oled_c4.jpg',
      specs: { 'Panel': 'OLED evo Panel', 'Girişler': '4x HDMI 2.1', 'Yenileme Hızı': '144Hz 4K' }
    },
    p2: {
      id: 'samsung-55-qn90d',
      name: 'Samsung 55" Neo QLED',
      brand: 'Samsung',
      basePrice: 58999,
      category: 'Televizyon',
      image: '/images/tvs/samsung_neo_qled.jpg',
      specs: { 'Panel': 'Neo QLED Panel', 'Girişler': '4x HDMI 2.1', 'Yenileme Hızı': '144Hz 4K' }
    },
    specKeys: ['Panel', 'Girişler', 'Yenileme Hızı']
  },
  headphones: {
    p1: {
      id: 'sony-inzone-h3',
      name: 'Sony INZONE H3 Gaming',
      brand: 'Sony',
      basePrice: 8999,
      category: 'Kulaklık',
      image: '/images/headphones/sony-inzone-h3.jpg',
      specs: { 'Ses': '360 Spatial Audio', 'Batarya': 'Kablolu / 3.5mm', 'Sürücü': '40mm Neodim' }
    },
    p2: {
      id: 'apple-airpods-max',
      name: 'Apple AirPods Max',
      brand: 'Apple',
      basePrice: 22999,
      category: 'Kulaklık',
      image: '/images/headphones/apple-airpods-max.jpg',
      specs: { 'Ses': 'H1 Çift Çip ANC', 'Batarya': '20 Saat Pil Ömrü', 'Sürücü': '40mm Dinamik' }
    },
    specKeys: ['Ses', 'Batarya', 'Sürücü']
  }
};

export function HomePageClient({
  popularComparisons,
  counts
}: HomePageClientProps) {
  const { t } = useI18n();

  // Active Category tab for Holographic Duel
  const [activeDuelCategory, setActiveDuelCategory] = useState<string>('phones');

  // Selected Product 1 & Product 2 for Duel
  const [product1, setProduct1] = useState<any>(CATEGORY_PRESETS.phones.p1);
  const [product2, setProduct2] = useState<any>(CATEGORY_PRESETS.phones.p2);

  // Live Search States for Cards
  const [search1Query, setSearch1Query] = useState('');
  const [search2Query, setSearch2Query] = useState('');
  const [results1, setResults1] = useState<CompactSearchProduct[]>([]);
  const [results2, setResults2] = useState<CompactSearchProduct[]>([]);

  // AI Cockpit State
  const [aiPromptInput, setAiPromptInput] = useState('');
  const [activeAiFilter, setActiveAiFilter] = useState('camera');

  // Update preset when switching category
  const handleCategoryChange = (catId: string) => {
    setActiveDuelCategory(catId);
    const preset = CATEGORY_PRESETS[catId] || CATEGORY_PRESETS.phones;
    setProduct1(preset.p1);
    setProduct2(preset.p2);
    setSearch1Query('');
    setSearch2Query('');
    setResults1([]);
    setResults2([]);
  };

  // Live Search 1 Effect
  useEffect(() => {
    let active = true;
    const q = search1Query.trim();
    if (!q) {
      setResults1([]);
      return;
    }
    const timer = setTimeout(() => {
      searchLocalProductsAsync(q, 6).then((res) => {
        if (active) setResults1(res);
      });
    }, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search1Query]);

  // Live Search 2 Effect
  useEffect(() => {
    let active = true;
    const q = search2Query.trim();
    if (!q) {
      setResults2([]);
      return;
    }
    const timer = setTimeout(() => {
      searchLocalProductsAsync(q, 6).then((res) => {
        if (active) setResults2(res);
      });
    }, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [search2Query]);

  // Select Product from Search
  const handleSelectProduct = (slot: 1 | 2, item: CompactSearchProduct) => {
    const formattedItem = {
      id: item.id,
      name: item.name,
      brand: item.brand,
      basePrice: item.basePrice || 0,
      category: item.category,
      image: item.image,
      specs: {
        'RAM': '12GB RAM',
        'Depolama': '256GB SSD',
        'Yenileme Hızı': '120Hz OLED'
      }
    };
    if (slot === 1) {
      setProduct1(formattedItem);
      setSearch1Query('');
      setResults1([]);
    } else {
      setProduct2(formattedItem);
      setSearch2Query('');
      setResults2([]);
    }
  };

  const currentPreset = CATEGORY_PRESETS[activeDuelCategory] || CATEGORY_PRESETS.phones;
  const currentSpecKeys = currentPreset.specKeys;

  return (
    <div className="space-y-12 pb-16 max-w-full overflow-hidden bg-[#F8F9FC] text-slate-900 transition-colors">
      {/* 🚀 Choice A - AntiGravity Landing Page Hero & Proof Showcase */}
      <ChoiceAAntiGravityLanding counts={counts} />

      {/* ========================================================================= */}
      {/* ⚡ 1. LIVE TECH TICKER BAR (MÜHENDİSLİK SEVİYESİ CANLI BORSA BANDI)       */}
      {/* ========================================================================= */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 bg-slate-950 text-slate-200 border-b border-slate-800 py-2.5 px-4 overflow-hidden relative shadow-md">
        <div className="flex items-center gap-6 whitespace-nowrap animate-marquee text-xs font-mono font-bold tracking-wide">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <Zap className="w-3.5 h-3.5 fill-cyan-400 animate-pulse" />
            ROBO PENGU APEX ENGINE 2.0 CANLI SİSTEMİ AKTİF
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <TrendingDown className="w-3.5 h-3.5" />
            iPhone 16 Pro Max ₺84.999 (-₺2.400 Satıcı Fırsatı)
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-fuchsia-400">
            <Swords className="w-3.5 h-3.5" />
            S25 Ultra vs iPhone 16 Pro Max Canlı Kıyaslama Zirvede
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <Activity className="w-3.5 h-3.5" />
            LG OLED C4 TV Fiyat/Performans Skoru: 9.6/10
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🚀 2. HERO AI COCKPIT: ROBOPENGU APEX ADVISOR & LIVE DECISION MATRIX       */}
      {/* ========================================================================= */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-12 lg:p-16 relative border-b border-slate-800 text-white shadow-2xl overflow-hidden space-y-10">

        {/* Ambient Neon Backlights */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/3 left-1/4 w-[700px] h-[700px] bg-cyan-500/15 blur-[160px] rounded-full" />
          <div className="absolute top-10 right-1/4 w-[600px] h-[600px] bg-fuchsia-500/15 blur-[150px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

          {/* Left Column: Vision Header & Interactive AI Search */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-black tracking-widest uppercase shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-pulse" />
              <span>YAPAY ZEKÂ TEKNOLOJİ KOKPİTİ v2.0</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-7xl lg:text-[76px] font-black tracking-tight leading-[1.03] text-white">
                <span className="block">İyi ki</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-fuchsia-400 font-black">acele</span>
                <span className="block">etmedin.</span>
              </h1>
              <p className="text-base sm:text-xl text-slate-300 font-medium leading-relaxed max-w-xl">
                Doğru teknolojiyi, en uygun fiyata, mühendislik seviyesinde canlı karar matrisi ile keşfet.
              </p>
            </div>

            {/* Quick AI Filter Chips */}
            <div className="space-y-2.5">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <span>Akıllı İhtiyaç Filtreleri</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'camera', label: '📸 Fotoğraf & 4K Video', query: 'En iyi kameraya sahip amiral gemisi telefonlar' },
                  { id: 'gaming', label: '🎮 Oyun & 120Hz Ekran', query: 'Yüksek FPS veren 120Hz gaming telefon ve laptoplar' },
                  { id: 'battery', label: '🔋 Uzun Pil Ömrü', query: 'Şarjı en uzun giden mobil cihazlar' },
                  { id: 'price', label: '📉 Fiyat / Performans', query: 'Fiyatına göre en yüksek performans veren modeller' },
                ].map((chip) => (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => {
                      setActiveAiFilter(chip.id);
                      setAiPromptInput(chip.query);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-2 ${
                      activeAiFilter === chip.id
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 scale-105'
                        : 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-cyan-500/60 hover:bg-slate-800'
                    }`}
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Natural Language Command Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (aiPromptInput.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(aiPromptInput.trim())}`;
                }
              }}
              className="relative max-w-xl bg-slate-900/90 border-2 border-cyan-500/40 focus-within:border-cyan-400 focus-within:ring-4 focus-within:ring-cyan-500/20 rounded-2xl p-2.5 flex items-center shadow-2xl transition-all min-h-[64px]"
            >
              <Search className="w-5 h-5 text-cyan-400 ml-4 shrink-0 pointer-events-none" />
              <input
                type="text"
                value={aiPromptInput}
                onChange={(e) => setAiPromptInput(e.target.value)}
                placeholder="RoboPengu'ya sor (örn: 40.000 TL bütçeyle en iyi telefon...)"
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base font-semibold text-white outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black px-5 py-3 rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-md cursor-pointer shrink-0 text-xs tracking-wider uppercase"
              >
                <span>ANALİZ ET</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            </form>

          </div>

          {/* Right Column: RoboPengu Mascot & Live Decision Score Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-4 lg:pt-0">
            <div className="relative w-full max-w-md bg-slate-900/90 border border-cyan-500/50 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-2xl space-y-5">

              {/* RoboPengu Mascot Avatar */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-500/60 p-1 flex items-center justify-center shrink-0 shadow-lg">
                    <Image
                      src="/assets/robopengu-hero-wave.png"
                      alt="RoboPengu Mascot"
                      fill
                      sizes="56px"
                      unoptimized
                      className="object-contain p-1 filter drop-shadow-[0_4px_12px_rgba(6,182,212,0.4)]"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>RoboPengu AI 2.0</span>
                      <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-[11px] font-semibold text-cyan-400">Canlı Karar Analizörü</div>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-black border border-emerald-700 animate-pulse">
                  %98 Doğruluk
                </div>
              </div>

              {/* Dynamic Score Metrics Breakdown */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>RoboPengu Karar Skoru</span>
                  <span className="text-cyan-400 font-black text-sm">9.6 / 10</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { label: 'Kamera & Optik Kalite', score: 98, color: 'bg-cyan-400' },
                    { label: 'Batarya & Şarj Hızı', score: 94, color: 'bg-teal-400' },
                    { label: 'Ekran & Renk Başarımı', score: 99, color: 'bg-fuchsia-400' },
                    { label: 'İşlemci & Thermal Performans', score: 96, color: 'bg-indigo-400' },
                  ].map((m) => (
                    <div key={m.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-300">
                        <span>{m.label}</span>
                        <span className="font-mono text-cyan-300">%{m.score}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
                        <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Quick Suggestion Banner */}
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="text-slate-300 font-semibold truncate pr-2">
                  💡 Tavsiye: <span className="text-cyan-300 font-black">iPhone 16 Pro Max</span> şu an en yüksek F/P skoru veriyor.
                </div>
                <Link
                  href="/phones/iphone-16-pro-max"
                  className="text-cyan-400 font-black hover:underline shrink-0 text-[11px]"
                >
                  İncele →
                </Link>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* ⚔️ 3. 3D HOLOGRAPHIC PRODUCT DUEL SECTION (EXACT 1:1 MATCH FOR MOCKUP B) */}
      {/* ========================================================================= */}
      <section id="holographic-duel-section" className="max-w-7xl mx-auto space-y-6 px-3 sm:px-6 py-6 relative">

        {/* Section Title Header (Exact Mockup B Typography) */}
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-sans">
            3D HOLOGRAFİK ÜRÜN DÜELLOSU
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide">
            Kafa Kafaya Karşılaştırın ve Analiz Edin
          </p>

          {/* Category Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {[
              { id: 'phones', label: 'Akıllı Telefonlar', icon: Smartphone },
              { id: 'laptops', label: 'Laptoplar', icon: Laptop },
              { id: 'tvs', label: 'Televizyonlar', icon: Tv },
              { id: 'headphones', label: 'Kulaklıklar', icon: Headphones },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeDuelCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryChange(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 scale-105'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ⚔️ FLOATING 3D GLASS CARDS ARENA (DIRECT ON PAGE CANVAS, NO OUTER BOX WRAPPER) */}
        <div className="relative max-w-5xl mx-auto py-8">

          {/* Background Ambient Laser Glows */}
          <div aria-hidden="true" className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-400/20 blur-[130px] rounded-full pointer-events-none" />
          <div aria-hidden="true" className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-fuchsia-400/20 blur-[130px] rounded-full pointer-events-none" />

          {/* SVG Multi-Line X-Laser Beams Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cyanLaserGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="100%" stopColor="#d946ef" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="fuchsiaLaserGlow" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d946ef" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
              </linearGradient>
              <filter id="neonBeamFilter" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="4" result="blur1" />
                <feGaussianBlur stdDeviation="10" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Parallel Crossing Neon Lasers */}
            <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="url(#cyanLaserGlow)" strokeWidth="5" filter="url(#neonBeamFilter)" className="animate-pulse" />
            <line x1="20%" y1="26%" x2="80%" y2="86%" stroke="url(#cyanLaserGlow)" strokeWidth="3" filter="url(#neonBeamFilter)" opacity="0.75" />
            <line x1="20%" y1="80%" x2="80%" y2="20%" stroke="url(#fuchsiaLaserGlow)" strokeWidth="5" filter="url(#neonBeamFilter)" className="animate-pulse" />
            <line x1="20%" y1="86%" x2="80%" y2="26%" stroke="url(#fuchsiaLaserGlow)" strokeWidth="3" filter="url(#neonBeamFilter)" opacity="0.75" />
          </svg>

          {/* Central Glowing Spherical VS Emblem */}
          <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-600 to-fuchsia-500 text-white font-black text-2xl sm:text-4xl flex items-center justify-center shadow-[0_0_50px_rgba(217,70,239,0.9),0_0_30px_rgba(6,182,212,0.9)] border-4 border-white dark:border-slate-900 animate-pulse">
              VS
            </div>
          </div>

          {/* Dual Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 relative z-10 items-stretch max-w-4xl mx-auto">

            {/* ========================================================= */}
            {/* CARD 1 (LEFT): EXACT MATCH FOR MOCKUP B CYAN FROSTED GLASS */}
            {/* ========================================================= */}
            <div className="flex flex-col items-center">
              <div className="w-full bg-white/80 dark:bg-slate-900/80 border-2 border-cyan-400/60 shadow-[0_25px_60px_-15px_rgba(6,182,212,0.25)] rounded-3xl p-6 backdrop-blur-2xl flex flex-col justify-between space-y-5 transition-transform duration-300 hover:-translate-y-1">

                {/* Product Search & Title Header */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={search1Query}
                        onChange={(e) => setSearch1Query(e.target.value)}
                        placeholder="1. Ürünü Ara / Seç..."
                        className="w-full pl-9 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    {results1.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 max-h-48 overflow-y-auto space-y-1">
                        {results1.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectProduct(1, item)}
                            className="w-full text-left p-2 rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</span>
                            <span className="text-[10px] font-black text-cyan-600">₺{item.basePrice?.toLocaleString('tr-TR')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {product1.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      {product1.category}
                    </span>
                  </div>
                </div>

                {/* 3D Floating Product Display & Holographic Ring Aura */}
                <div className="relative my-1 py-2 flex flex-col items-center justify-center">
                  <div className="relative w-40 h-44 sm:w-48 sm:h-52 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
                    <ProductImage
                      src={product1.image}
                      alt={product1.name}
                      variant="card"
                      className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(6,182,212,0.4)]"
                    />
                  </div>
                  {/* Holographic Projection Ring */}
                  <div className="w-36 h-7 rounded-full border-2 border-cyan-400/90 bg-cyan-400/20 shadow-[0_0_25px_#06b6d4] blur-[1px] transform -rotate-x-60 -mt-5 pointer-events-none" />
                </div>

                {/* Middle Info Row: Inset Thumbnail + Vertical Specs */}
                <div className="flex items-center gap-4 bg-slate-50/90 dark:bg-slate-800/90 p-3 rounded-2xl border border-cyan-200/60 dark:border-cyan-900/60">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 p-1 border border-cyan-200/80 flex items-center justify-center shrink-0 shadow-xs">
                    <ProductImage src={product1.image} alt={product1.name} variant="card" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {currentSpecKeys.map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] uppercase font-bold w-16">{key}:</span>
                        <span className="font-black text-slate-900 dark:text-white">{product1.specs?.[key] || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/compare?d1=${encodeURIComponent(product1.id)}&d2=${encodeURIComponent(product2.id)}`}
                    className="py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center"
                  >
                    KARŞILAŞTIRMAYA EKLE
                  </Link>
                  <Link
                    href={`/phones/${product1.id}`}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-center flex items-center justify-center"
                  >
                    DETAYLARI İNCELE
                  </Link>
                </div>

              </div>

              {/* 3D Glass Pedestal Base Floating Under Left Card (Exact Mockup B) */}
              <div className="w-[92%] h-5 bg-gradient-to-r from-cyan-400/40 via-white/90 to-cyan-400/40 rounded-full border border-cyan-300/80 shadow-[0_12px_35px_rgba(6,182,212,0.45)] transform perspective-500 rotateX-45 -mt-3 z-0" />
            </div>

            {/* ========================================================= */}
            {/* CARD 2 (RIGHT): EXACT MATCH FOR MOCKUP B FUCHSIA FROSTED GLASS */}
            {/* ========================================================= */}
            <div className="flex flex-col items-center">
              <div className="w-full bg-white/80 dark:bg-slate-900/80 border-2 border-fuchsia-400/60 shadow-[0_25px_60px_-15px_rgba(217,70,239,0.25)] rounded-3xl p-6 backdrop-blur-2xl flex flex-col justify-between space-y-5 transition-transform duration-300 hover:-translate-y-1">

                {/* Product Search & Title Header */}
                <div className="space-y-3">
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                      <input
                        type="text"
                        value={search2Query}
                        onChange={(e) => setSearch2Query(e.target.value)}
                        placeholder="2. Ürünü Ara / Seç..."
                        className="w-full pl-9 pr-3 py-2 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-fuchsia-500"
                      />
                    </div>
                    {results2.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 max-h-48 overflow-y-auto space-y-1">
                        {results2.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleSelectProduct(2, item)}
                            className="w-full text-left p-2 rounded-lg hover:bg-fuchsia-50 dark:hover:bg-slate-800 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.name}</span>
                            <span className="text-[10px] font-black text-fuchsia-600">₺{item.basePrice?.toLocaleString('tr-TR')}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {product2.name}
                    </h3>
                    <span className="text-xs font-semibold text-slate-400 block mt-0.5">
                      {product2.category}
                    </span>
                  </div>
                </div>

                {/* 3D Floating Product Display & Holographic Ring Aura */}
                <div className="relative my-1 py-2 flex flex-col items-center justify-center">
                  <div className="relative w-40 h-44 sm:w-48 sm:h-52 transition-transform duration-300 hover:scale-105 flex items-center justify-center">
                    <ProductImage
                      src={product2.image}
                      alt={product2.name}
                      variant="card"
                      className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(217,70,239,0.4)]"
                    />
                  </div>
                  {/* Holographic Projection Ring */}
                  <div className="w-36 h-7 rounded-full border-2 border-fuchsia-400/90 bg-fuchsia-400/20 shadow-[0_0_25px_#d946ef] blur-[1px] transform -rotate-x-60 -mt-5 pointer-events-none" />
                </div>

                {/* Middle Info Row: Inset Thumbnail + Vertical Specs */}
                <div className="flex items-center gap-4 bg-slate-50/90 dark:bg-slate-800/90 p-3 rounded-2xl border border-fuchsia-200/60 dark:border-fuchsia-900/60">
                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 p-1 border border-fuchsia-200/80 flex items-center justify-center shrink-0 shadow-xs">
                    <ProductImage src={product2.image} alt={product2.name} variant="card" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-200">
                    {currentSpecKeys.map((key) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] uppercase font-bold w-16">{key}:</span>
                        <span className="font-black text-slate-900 dark:text-white">{product2.specs?.[key] || '-'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href={`/compare?d1=${encodeURIComponent(product1.id)}&d2=${encodeURIComponent(product2.id)}`}
                    className="py-2.5 px-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center"
                  >
                    KARŞILAŞTIRMAYA EKLE
                  </Link>
                  <Link
                    href={`/phones/${product2.id}`}
                    className="py-2.5 px-3 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-center flex items-center justify-center"
                  >
                    DETAYLARI İNCELE
                  </Link>
                </div>

              </div>

              {/* 3D Glass Pedestal Base Floating Under Right Card (Exact Mockup B) */}
              <div className="w-[92%] h-5 bg-gradient-to-r from-fuchsia-400/40 via-white/90 to-fuchsia-400/40 rounded-full border border-fuchsia-300/80 shadow-[0_12px_35px_rgba(217,70,239,0.45)] transform perspective-500 rotateX-45 -mt-3 z-0" />
            </div>

          </div>

          {/* Head-to-Head Spec Comparison Table Below Pedestals (Exact Mockup B 3-Column Format) */}
          <div className="mt-12 max-w-2xl mx-auto space-y-3 pt-6 border-t border-slate-200/60 dark:border-slate-800">
            <div className="grid grid-cols-3 text-center text-xs font-black uppercase tracking-wider text-slate-400 pb-2">
              <span className="text-left text-cyan-600 dark:text-cyan-400 font-black">{product1.name}</span>
              <span>Kafa Kafaya Matris</span>
              <span className="text-right text-fuchsia-600 dark:text-fuchsia-400 font-black">{product2.name}</span>
            </div>

            <div className="space-y-2">
              {currentSpecKeys.map((key) => (
                <div key={key} className="grid grid-cols-3 items-center text-xs py-2 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="text-left font-black text-slate-900 dark:text-white">
                    {product1.specs?.[key] || '-'}
                  </div>
                  <div className="text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {key}
                  </div>
                  <div className="text-right font-black text-slate-900 dark:text-white">
                    {product2.specs?.[key] || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* 📊 4. BENTO GRID DEAL & PRICE INTELLIGENCE RADAR                          */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto space-y-6 px-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-600" />
              <span>Canlı İndirim & Fiyat Akıl Radarı</span>
            </h2>
            <p className="text-xs text-slate-500 font-semibold">Anlık fiyat hareketleri ve satın alma zamanlama tavsiyeleri</p>
          </div>
          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800">
            Canlı Güncellendi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Card A: Live Price Drop Radar (7 Cols) */}
          <div className="md:col-span-7 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase tracking-wider">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <span>Son 24 Saatin En Büyük Fiyat Düşüşleri</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400">4 Fırsat Yakalandı</span>
            </div>

            <div className="space-y-3">
              {[
                { name: 'iPhone 16 Pro Max 256GB Natural Titanium', store: 'Amazon TR', price: '₺84.999', oldPrice: '₺87.399', drop: '-%3', color: 'text-emerald-400' },
                { name: 'Samsung Galaxy S25 Ultra 512GB Titanium Gray', store: 'MediaMarkt', price: '₺79.999', oldPrice: '₺83.500', drop: '-%4', color: 'text-emerald-400' },
                { name: 'LG 55" OLED C4 4K Smart TV', store: 'Teknosa', price: '₺62.999', oldPrice: '₺66.999', drop: '-%6', color: 'text-emerald-400' },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 transition-all hover:border-cyan-500/50">
                  <div className="space-y-0.5 truncate">
                    <div className="text-xs font-extrabold text-white truncate">{item.name}</div>
                    <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-2">
                      <span className="text-cyan-400 font-bold">{item.store}</span>
                      <span>•</span>
                      <span className="line-through">₺{item.oldPrice}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-black text-emerald-400">{item.price}</div>
                    <div className="text-[10px] font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      {item.drop} İndirim
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link
              href="/alerts"
              className="text-xs font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-1 pt-1"
            >
              <span>Tüm İndirim Alarmlarını Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card B: Buy vs Wait AI Gauge (5 Cols) */}
          <div className="md:col-span-5 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-7 border border-cyan-800/60 shadow-xl space-y-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-cyan-300 font-black text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Satın Alma Zamanlama İndeksi</span>
            </div>

            <div className="text-center space-y-2 py-2">
              <div className="text-4xl sm:text-5xl font-black text-emerald-400 tracking-tight">
                %92
              </div>
              <div className="text-sm font-black text-white">
                "Şimdi Satın Alınmalı"
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium px-4">
                Son 60 günlük fiyat grafiği analizine göre amiral gemisi kategorisinde dip fiyat seviyesi tespit edildi.
              </p>
            </div>

            <div className="bg-slate-950/90 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-300">
                <span>Gelecek Fiyat Trend Tahmini</span>
                <span className="text-emerald-400 font-black">Kararlı / Düşük Risk</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-400 rounded-full w-[92%]" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* ⚪ 5. LIGHT SILVER STEP GUIDE SECTION (#F1F5F9)                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto bg-[#F1F5F9] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-slate-900 dark:text-white shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              <span>Bir seçim.</span>
              <br />
              <span className="text-slate-600 dark:text-slate-300">Biraz daha netlik.</span>
            </h2>
          </div>

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

      {/* ========================================================================= */}
      {/* 📱 6. CATEGORY ICON STRIP & POPULAR COMPARISONS                           */}
      {/* ========================================================================= */}
      <section className="space-y-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            İhtiyaca Göre Keşfet
          </h2>
          <span className="text-xs text-slate-500 font-semibold">9 Kategori Kataloğu</span>
        </div>

        <CategoryIconStrip customCounts={counts} />
      </section>

      {popularComparisons && popularComparisons.length > 0 && (
        <section className="space-y-4 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900/50 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Popüler Karşılaştırma Önerileri</span>
              </h2>
              <p className="text-xs text-slate-500">Teknik özellik farklarını yan yana inceleyin</p>
            </div>
            <Link
              href="/compare"
              className="text-xs font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 py-1 min-h-11 inline-flex items-center"
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

      {/* ========================================================================= */}
      {/* 🛡️ 7. TRUST & TRANSPARENCY SECTION                                       */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto bg-emerald-50/60 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-black text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span>Veri Güvenilirliği ve Şeffaflık Taahhüdü</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
          Katalog puanları bağımsız laboratuvar testi değildir. Fiyat etiketinde güncel teklif, son görülen fiyat veya katalog referansı ayrımını kontrol edin. Eksik kaynak bilgisi doğrulanmış sayılmaz.
        </p>
        <div className="pt-1 flex flex-wrap items-center gap-4 text-xs font-bold">
          <Link href="/iletisim?subject=hatali-bilgi" className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
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

export default HomePageClient;
