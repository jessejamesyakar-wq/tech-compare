'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { ProductImage } from '@/components/ui/ProductImage';
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
  ExternalLink
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

// Preset Duel Items by Category (Matching Mockup B)
const CATEGORY_PRESETS: Record<string, { p1: any; p2: any; specKeys: string[] }> = {
  phones: {
    p1: {
      id: 'iphone-16-pro-max',
      name: 'iPhone 16 Pro Max',
      brand: 'Apple',
      basePrice: 84999,
      category: 'Akıllı Telefon',
      image: '/images/phones/apple/apple-iphone-16-pro-max.jpg',
      specs: { 'RAM': '12GB RAM', 'Depolama': '256GB SSD', 'Yenileme Hızı': '144Hz OLED' }
    },
    p2: {
      id: 'samsung-galaxy-s25-ultra',
      name: 'Samsung Galaxy S25 Ultra',
      brand: 'Samsung',
      basePrice: 79999,
      category: 'Akıllı Telefon',
      image: '/images/phones/samsung/samsung-galaxy-s25-ultra.png',
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
        'Storage': '256GB SSD',
        'Refresh Rate': '120Hz OLED'
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
    <div className="space-y-12 pb-12 max-w-full overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">

      {/* ========================================================================= */}
      {/* 🚀 1. HERO SECTION: CONCEPT 1 PRISMATIC HOLOGRAM ON CLEAN WHITE CANVAS     */}
      {/* ========================================================================= */}
      <section className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-6 bg-gradient-to-b from-slate-50 via-white to-slate-50/80 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 p-6 sm:p-10 lg:p-14 relative border-b border-slate-200/80 dark:border-slate-800 shadow-xs space-y-8">

        {/* Ambient Prism Light Glow Effect */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-cyan-400/10 blur-[140px] rounded-full" />
          <div className="absolute top-10 right-10 w-96 h-96 bg-purple-400/10 blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Typography & Interactive Search */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-black tracking-widest uppercase shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-600 fill-cyan-500 animate-pulse" />
              <span>AKILLI KARŞILAŞTIRMA VE FİYAT ANALİZİ</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-7xl lg:text-[80px] font-black tracking-tight leading-[1.05] text-slate-900 dark:text-white">
              <span className="block">İyi ki</span>
              <span className="block text-cyan-600 dark:text-cyan-400 font-black">acele</span>
              <span className="block">etmedin.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg">
              Doğru teknolojiyi, en uygun fiyata, acele etmeden bul.
            </p>

            {/* Category Quick Chips */}
            <div className="space-y-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Hızlı Kategori Seçimi</div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: '📱 Telefonlar', href: '/phones' },
                  { label: '💻 Bilgisayarlar', href: '/laptops' },
                  { label: '📺 TV & Ekran', href: '/tvs' },
                  { label: '🎧 Ses & Kulaklık', href: '/headphones' },
                  { label: '⌚ Akıllı Saatler', href: '/smartwatches' },
                ].map((chip) => (
                  <Link
                    key={chip.label}
                    href={chip.href}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-slate-800 dark:text-slate-200 hover:text-cyan-700 dark:hover:text-cyan-300 text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{chip.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Search Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const input = (e.currentTarget.elements.namedItem('heroSearch') as HTMLInputElement)?.value;
                if (input?.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(input.trim())}`;
                }
              }}
              className="relative max-w-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 rounded-full p-2 flex items-center shadow-md transition-all min-h-[58px]"
            >
              <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0 pointer-events-none" />
              <input
                name="heroSearch"
                type="text"
                aria-label="Neyi keşfetmek istiyorsun?"
                placeholder="Neyi keşfetmek istiyorsun? (örn: iPhone 16 Pro vs S24 Ultra)"
                className="w-full bg-transparent px-3 py-2 text-sm sm:text-base font-semibold text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Arama yap"
                className="bg-cyan-600 hover:bg-cyan-500 text-white font-black min-w-12 min-h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-sm cursor-pointer shrink-0"
              >
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </form>

          </div>

          {/* Right Column: High-Res RoboPengu & 3D Holographic Cards */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative pt-6 lg:pt-0">
            <div className="relative w-full max-w-md bg-white/80 dark:bg-slate-900/80 border border-cyan-200/90 dark:border-cyan-800/90 rounded-3xl p-6 shadow-2xl backdrop-blur-xl space-y-4 text-center">

              <div className="relative flex flex-col items-center justify-center">
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 transition-transform hover:scale-105 duration-300">
                  <Image
                    src="/assets/robopengu-hero-wave.png"
                    alt="RoboPengu - Akıllı Teknoloji Danışmanı"
                    fill
                    sizes="(max-width: 640px) 160px, 176px"
                    quality={95}
                    unoptimized
                    className="object-contain filter drop-shadow-[0_12px_24px_rgba(6,182,212,0.3)]"
                    priority
                  />
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-200 text-xs font-black border border-cyan-300 dark:border-cyan-700">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                  <span>RoboPengu Canlı Karar Matrisi</span>
                </div>
              </div>

              {/* Floating Holographic Cards Preview */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  { name: 'iPhone 16 Pro', score: '9.4', color: 'from-cyan-500/20 to-teal-500/10 border-cyan-300' },
                  { name: 'S25 Ultra', score: '9.2', color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-300' },
                  { name: 'MacBook M3', score: '9.6', color: 'from-emerald-500/20 to-teal-500/10 border-emerald-300' },
                  { name: 'LG OLED C4', score: '9.5', color: 'from-blue-500/20 to-cyan-500/10 border-blue-300' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-2xl bg-gradient-to-br ${item.color} border dark:border-slate-700 shadow-sm text-left transition-transform hover:scale-105`}
                  >
                    <div className="text-[10px] font-black uppercase text-slate-400">Puan: {item.score}</div>
                    <div className="text-xs font-black text-slate-900 dark:text-white truncate">{item.name}</div>
                    <div className="text-[9px] font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">Holografik İncele →</div>
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* ⚔️ 2. 3D HOLOGRAPHIC PRODUCT DUEL SECTION (EXACT MATCH FOR MOCKUP B)     */}
      {/* ========================================================================= */}
      <section id="holographic-duel-section" className="max-w-7xl mx-auto space-y-8 px-3 sm:px-6">

        {/* Section Title Header (Exact Mockup B Typography) */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-sans">
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

        {/* ⚔️ DUAL VERTICAL 3D FROSTED GLASS CARDS & X-LASER BEAMS */}
        <div className="relative bg-gradient-to-b from-slate-50/80 via-white to-slate-50/80 dark:from-slate-900 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden">

          {/* SVG Glowing X-Laser Beams Crossing Layer (Exact Mockup B Laser Effect) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-90" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="laserCyanBeam" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity="1" />
                <stop offset="100%" stopColor="#d946ef" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="laserFuchsiaBeam" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#d946ef" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#c084fc" stopOpacity="1" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
              </linearGradient>
              <filter id="neonGlowFilter" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur1" />
                <feGaussianBlur stdDeviation="12" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* X-Crossing Laser Lines */}
            <line x1="20%" y1="25%" x2="80%" y2="75%" stroke="url(#laserCyanBeam)" strokeWidth="4" filter="url(#neonGlowFilter)" className="animate-pulse" />
            <line x1="20%" y1="75%" x2="80%" y2="25%" stroke="url(#laserFuchsiaBeam)" strokeWidth="4" filter="url(#neonGlowFilter)" className="animate-pulse" />
          </svg>

          {/* Central Glowing VS Emblem */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-[0_0_40px_rgba(217,70,239,0.8)] border-4 border-white dark:border-slate-900 animate-pulse">
              VS
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-20 relative z-10 items-stretch">

            {/* ========================================================= */}
            {/* CARD 1 (LEFT): EXACT MATCH FOR MOCKUP B FROSTED GLASS CARD */}
            {/* ========================================================= */}
            <div className="relative bg-white/75 dark:bg-slate-900/75 border-2 border-cyan-300/60 dark:border-cyan-700/60 shadow-[0_20px_50px_rgba(6,182,212,0.15)] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl flex flex-col justify-between space-y-6 transition-transform hover:-translate-y-1">

              {/* Card Top Search & Title */}
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {product1.category}
                  </span>
                </div>
              </div>

              {/* Product Floating 3D Image & Holographic Ring Aura */}
              <div className="relative my-4 py-4 flex items-center justify-center">
                <div className="absolute w-36 h-36 bg-cyan-400/20 blur-2xl rounded-full pointer-events-none" />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 p-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-cyan-200/60 dark:border-cyan-800/60 shadow-md flex items-center justify-center">
                  <ProductImage src={product1.image} alt={product1.name} variant="card" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Spec Badges Grid Inside Card */}
              <div className="space-y-2">
                {currentSpecKeys.map((key) => (
                  <div key={key} className="bg-slate-100/90 dark:bg-slate-800/90 p-2.5 rounded-xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">{key}</span>
                    <span className="font-black text-slate-900 dark:text-white">{product1.specs?.[key] || 'Detaylar'}</span>
                  </div>
                ))}
              </div>

              {/* Card Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href={`/compare?d1=${encodeURIComponent(product1.id)}&d2=${encodeURIComponent(product2.id)}`}
                  className="py-2.5 px-3 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center"
                >
                  KARŞILAŞTIRMAYA EKLE
                </Link>
                <Link
                  href={`/phones/${product1.id}`}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-center flex items-center justify-center"
                >
                  DETAYLARI İNCELE
                </Link>
              </div>

              {/* Translucent Glass Pedestal Base at Bottom of Card */}
              <div className="w-full h-3 bg-gradient-to-r from-cyan-400/30 via-white to-cyan-400/30 rounded-full border border-cyan-300/50 shadow-[0_8px_16px_rgba(6,182,212,0.2)] mt-2" />

            </div>

            {/* ========================================================= */}
            {/* CARD 2 (RIGHT): EXACT MATCH FOR MOCKUP B FROSTED GLASS CARD*/}
            {/* ========================================================= */}
            <div className="relative bg-white/75 dark:bg-slate-900/75 border-2 border-fuchsia-300/60 dark:border-fuchsia-700/60 shadow-[0_20px_50px_rgba(217,70,239,0.15)] rounded-3xl p-6 sm:p-8 backdrop-blur-2xl flex flex-col justify-between space-y-6 transition-transform hover:-translate-y-1">

              {/* Card Top Search & Title */}
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                    {product2.category}
                  </span>
                </div>
              </div>

              {/* Product Floating 3D Image & Holographic Ring Aura */}
              <div className="relative my-4 py-4 flex items-center justify-center">
                <div className="absolute w-36 h-36 bg-fuchsia-400/20 blur-2xl rounded-full pointer-events-none" />
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 p-3 bg-white/60 dark:bg-slate-800/60 rounded-2xl border border-fuchsia-200/60 dark:border-fuchsia-800/60 shadow-md flex items-center justify-center">
                  <ProductImage src={product2.image} alt={product2.name} variant="card" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Spec Badges Grid Inside Card */}
              <div className="space-y-2">
                {currentSpecKeys.map((key) => (
                  <div key={key} className="bg-slate-100/90 dark:bg-slate-800/90 p-2.5 rounded-xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">{key}</span>
                    <span className="font-black text-slate-900 dark:text-white">{product2.specs?.[key] || 'Detaylar'}</span>
                  </div>
                ))}
              </div>

              {/* Card Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href={`/compare?d1=${encodeURIComponent(product1.id)}&d2=${encodeURIComponent(product2.id)}`}
                  className="py-2.5 px-3 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white font-black text-xs rounded-xl shadow-md transition-all text-center flex items-center justify-center"
                >
                  KARŞILAŞTIRMAYA EKLE
                </Link>
                <Link
                  href={`/phones/${product2.id}`}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-center flex items-center justify-center"
                >
                  DETAYLARI İNCELE
                </Link>
              </div>

              {/* Translucent Glass Pedestal Base at Bottom of Card */}
              <div className="w-full h-3 bg-gradient-to-r from-fuchsia-400/30 via-white to-fuchsia-400/30 rounded-full border border-fuchsia-300/50 shadow-[0_8px_16px_rgba(217,70,239,0.2)] mt-2" />

            </div>

          </div>

          {/* ========================================================= */}
          {/* EXACT MOCKUP B SPEC COMPARISON TABLE BELOW THE CARDS       */}
          {/* ========================================================= */}
          <div className="mt-10 pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-3 max-w-2xl mx-auto">
            <div className="text-center text-xs font-black uppercase tracking-wider text-slate-400 pb-1">
              Kafa Kafaya Özellik Matrisi
            </div>

            <div className="bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm space-y-2">
              {currentSpecKeys.map((key) => (
                <div key={key} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <div className="w-1/3 text-left font-black text-cyan-600 dark:text-cyan-400">
                    {product1.specs?.[key] || '-'}
                  </div>
                  <div className="w-1/3 text-center text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    {key}
                  </div>
                  <div className="w-1/3 text-right font-black text-fuchsia-600 dark:text-fuchsia-400">
                    {product2.specs?.[key] || '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

      {/* ========================================================================= */}
      {/* ⚪ 3. LIGHT SILVER STEP GUIDE SECTION (#F1F5F9)                             */}
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
      {/* 📱 4. CATEGORY ICON STRIP & POPULAR COMPARISONS                           */}
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
      {/* 🛡️ 5. TRUST & TRANSPARENCY SECTION                                       */}
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
