'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Volume2,
  VolumeX,
  Trash2,
  X,
  Mic,
  Sparkles,
  Zap,
  Smartphone,
  Tv,
  Laptop,
  ArrowRight,
  TrendingDown,
  Clock,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

interface ChoiceAAntiGravityLandingProps {
  counts?: {
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

// Preset Comparison & AI Answers
const QUICK_AI_RESPONSES: Record<string, {
  title: string;
  badge: string;
  verdict: string;
  score: string;
  winner: string;
  specs: { label: string; p1: string; p2: string }[];
  summary: string;
  link: string;
}> = {
  'iPhone 16 Pro Max vs S24 Ultra': {
    title: 'iPhone 16 Pro Max vs Samsung S24 Ultra',
    badge: 'Mobil Amiral Gemisi Kıyaslaması',
    verdict: 'RoboPengu Kararı: Video ve Ekosistem için iPhone 16 Pro Max; Galaxy AI & Zoom için S24 Ultra.',
    score: '9.8 / 10',
    winner: 'iPhone 16 Pro Max (Video Lideri)',
    specs: [
      { label: 'İşlemci', p1: 'Apple A18 Pro (3nm)', p2: 'Snapdragon 8 Gen 3' },
      { label: 'Ekran', p1: '6.9" Super Retina XDR 120Hz', p2: '6.8" Dynamic AMOLED 2X 120Hz' },
      { label: 'Kamera', p1: '48MP Fusion + 5x Optik Zoom', p2: '200MP Main + 5x/10x Periskop' },
      { label: 'Pil Ömrü', p1: '29 Saate kadar Video', p2: '5.000 mAh (45W Hızlı Şarj)' }
    ],
    summary: 'A18 Pro işlemcisi ve 4K 120fps video kaydı ile iPhone 16 Pro Max içerik üreticileri için ilk tercihtir.',
    link: '/compare?category=phones&p1=apple-iphone-16-pro-max-256-gb&p2=samsung-galaxy-s24-ultra-256-gb'
  },
  'En iyi OLED TV hangisi?': {
    title: '2026 En İyi OLED TV: LG C4 vs Samsung S95D',
    badge: 'Ekran Teknolojisi Lideri',
    verdict: 'RoboPengu Kararı: LG OLED55C44LA (Sonsuz Siyah & 144Hz Oyuncu Desteği)',
    score: '9.9 / 10',
    winner: 'LG C4 OLED (α9 Gen7 AI)',
    specs: [
      { label: 'Panel Tipi', p1: 'WOLED evo Brightness Booster', p2: 'QD-OLED Anti-Glare' },
      { label: 'Yenileme Hızı', p1: '144Hz VRR / G-Sync', p2: '144Hz VRR FreeSync Premium' },
      { label: 'Ses Teknolojisi', p1: '9.1.2ch Virtual Surround AI', p2: '4.2.2ch Dolby Atmos' },
      { label: 'Fiyat Avantajı', p1: '54.999 TL (F/P Şampiyonu)', p2: '69.999 TL' }
    ],
    summary: 'LG C4 OLED, kusursuz siyah seviyesi ve 144Hz yenileme hızı ile 2026 yılının en yüksek RoboScore alan televizyonudur.',
    link: '/tvs/lg-oled55c44la'
  },
  'F/P laptop tavsiyesi': {
    title: 'Fiyat/Performans Laptop Liderleri',
    badge: 'Mobil Bütçe & Güç Şampiyonu',
    verdict: 'RoboPengu Önerisi: Apple MacBook Air M3 (18 Saat Pil & Sessiz Kullanım)',
    score: '9.7 / 10',
    winner: 'Apple MacBook Air M3',
    specs: [
      { label: 'İşlemci', p1: 'Apple M3 (8 Çekirdek CPU)', p2: 'Intel Core Ultra 7 155H' },
      { label: 'RAM / Depolama', p1: '16GB Unified / 512GB SSD', p2: '16GB LPDDR5X / 1TB SSD' },
      { label: 'Ekran', p1: '13.6" Liquid Retina 500 nits', p2: '16" OLED 240Hz Gaming' },
      { label: 'Pil Ömrü', p1: '18 Saate kadar', p2: '8 Saate kadar' }
    ],
    summary: 'Sessiz fan tasarımı, 18 saat pil ömrü ve hafif kasası ile M3 MacBook Air bütçe-performans lideridir.',
    link: '/laptops'
  },
  'ANC kulaklık önerisi': {
    title: 'Gürültü Engelleme (ANC) Şampiyonları',
    badge: 'Aktif Gürültü Engelleme Lideri',
    verdict: 'RoboPengu Kararı: Sony WH-1000XM5 (Maksimum İzolasyon)',
    score: '9.8 / 10',
    winner: 'Sony WH-1000XM5',
    specs: [
      { label: 'ANC Teknolojisi', p1: 'V1 + QN1 Çip (8 Mikrofon)', p2: 'H2 Çip Aktif Engelleme' },
      { label: 'Pil Ömrü', p1: '30 Saat (ANC Açık)', p2: '6 Saat Kulaklık / 30 Saat Kutu' },
      { label: 'Ağırlık', p1: '250 gram (Ultra Hafif Kulak Üstü)', p2: '5.3 gram (Kulak İçi)' }
    ],
    summary: 'Sony WH-1000XM5, uçuş ve ofis gürültüsünü %98 oranında keserek ANC kategorisinde zirvededir.',
    link: '/headphones'
  }
};

// Simplified Showcase Category Items
const SHOWCASE_PRODUCTS = {
  phones: [
    {
      id: 'apple-iphone-16-pro-max-256-gb',
      name: 'iPhone 16 Pro Max 256 GB',
      brand: 'Apple',
      price: '84.999 TL',
      image: '/images/phones/apple/iphone-16-teal.png',
      score: '9.8',
      decisionTag: 'F/P & Kamera Lideri',
      tagBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      specs: ['A18 Pro Çip', '48 MP Fusion', '6.9" 120Hz OLED']
    },
    {
      id: 'samsung-galaxy-s25-ultra-256-gb',
      name: 'Samsung Galaxy S25 Ultra 256 GB',
      brand: 'Samsung',
      price: '79.999 TL',
      image: '/images/phones/samsung/studio/samsung-galaxy-s25-ultra.png',
      score: '9.7',
      decisionTag: 'En Güçlü Yapay Zekâ',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['Snapdragon 8 Elite', '200 MP Kamera', 'Galaxy AI']
    },
    {
      id: 'apple-iphone-17e-256-gb',
      name: 'iPhone 17e 256 GB',
      brand: 'Apple',
      price: '62.700 TL',
      image: '/images/phones/apple/iphone-17e-black.jpg',
      score: '9.6',
      decisionTag: 'Kompakt F/P Şampiyonu',
      tagBg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      specs: ['Apple A19', '48 MP Fusion', 'MagSafe & Qi2 15W']
    }
  ],
  tvs: [
    {
      id: 'lg-oled55c44la',
      name: 'LG OLED55C44LA 55" 144Hz 4K Smart OLED TV',
      brand: 'LG',
      price: '54.999 TL',
      image: '/images/tvs/lg-oled55c44la.jpg',
      score: '9.9',
      decisionTag: 'En İyi OLED Panel',
      tagBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      specs: ['OLED evo', '144Hz VRR', 'α9 Gen7 AI']
    },
    {
      id: 'samsung-55s95d',
      name: 'Samsung 55S95D 55" 144Hz QD-OLED TV',
      brand: 'Samsung',
      price: '69.999 TL',
      image: '/images/tvs/samsung-55s95d.jpg',
      score: '9.8',
      decisionTag: 'Parlama Önleyici Ekran',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['QD-OLED', 'Anti-Glare', 'NQ4 AI Gen2']
    },
    {
      id: 'philips-55oled809',
      name: 'Philips 55OLED809 55" Ambilight OLED TV',
      brand: 'Philips',
      price: '59.999 TL',
      image: '/images/tvs/philips-55oled809.jpg',
      score: '9.6',
      decisionTag: 'Ambilight Işık Deneyimi',
      tagBg: 'bg-purple-500/10 text-purple-700 border-purple-200',
      specs: ['Ambilight 3-Sided', 'P5 AI Engine', '144Hz Gaming']
    }
  ],
  laptops: [
    {
      id: 'apple-macbook-air-m3',
      name: 'Apple MacBook Air M3 16GB 512GB SSD',
      brand: 'Apple',
      price: '52.499 TL',
      image: '/images/laptops/apple-macbook-air.jpg',
      score: '9.8',
      decisionTag: '18 Saat Pil & Sessiz Güç',
      tagBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      specs: ['Apple M3 Çip', '16 GB RAM', '13.6" Liquid Retina']
    },
    {
      id: 'asus-rog-zephyrus-g16',
      name: 'ASUS ROG Zephyrus G16 OLED Gaming Laptop',
      brand: 'ASUS',
      price: '89.999 TL',
      image: '/images/laptops/lg-395128.jpg',
      score: '9.7',
      decisionTag: 'Mobil Performans Şampiyonu',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['Intel Core Ultra 9', 'RTX 4080', '240Hz OLED']
    },
    {
      id: 'lenovo-yoga-slim-7',
      name: 'Lenovo Yoga Slim 7 Pro Snapdragon X Elite',
      brand: 'Lenovo',
      price: '44.999 TL',
      image: '/images/laptops/philips-221v8-00.jpg',
      score: '9.5',
      decisionTag: 'Copilot+ AI Ultrabook',
      tagBg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      specs: ['Snapdragon X Elite', '45 TOPS NPU', '3K OLED']
    }
  ]
};

export function ChoiceAAntiGravityLanding() {
  const [isMuted, setIsMuted] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'phones' | 'tvs' | 'laptops'>('phones');
  const [activeResult, setActiveResult] = useState<typeof QUICK_AI_RESPONSES[string] | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePillClick = (promptText: string) => {
    setInputQuery(promptText);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      const res = QUICK_AI_RESPONSES[promptText] || {
        title: promptText,
        badge: 'RoboPengu Karar Analizi',
        verdict: `RoboPengu "${promptText}" araması için en yüksek RoboScore puanlı donanımları inceledi.`,
        score: '9.7 / 10',
        winner: 'Doğrulanmış Katalog Verisi',
        specs: [
          { label: 'Analiz Kriteri', p1: 'Fiyat / Performans Dengesi', p2: 'Kullanıcı Derecelendirmesi' },
          { label: 'Veri Kaynağı', p1: '5.768+ Mağaza Teklifi', p2: 'Doğrulanmış Katalog Verisi' }
        ],
        summary: 'Aşağıdaki doğrulanmış vitrin kartlarından teknik detayları ve güncel mağaza fiyatlarını inceleyebilirsiniz.',
        link: '/compare'
      };
      setActiveResult(res);
      setIsPanelOpen(true);
    }, 450);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <div className="relative bg-[#F8F9FC] text-slate-900 font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
      
      {/* Background Soft Ambient Light (Apple Style) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-80px] left-[20%] w-[450px] h-[450px] bg-cyan-200/25 blur-[130px] rounded-full" />
        <div className="absolute top-[40px] right-[20%] w-[400px] h-[400px] bg-emerald-200/25 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-16">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION: SINGLE UNIFIED ROBOPENGU HERO EXPERIENCE               */}
        {/* ========================================================================= */}
        
        {/* Page Slogan Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12] mb-3">
            RoboPengu ile Karar Ver,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500">
              Acele Etme.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
            5.768+ ürün arasından bütçene ve kullanımına en uygun donanımı bulan yapay zekâ danışmanın.
          </p>
        </div>

        {/* SINGLE UNIFIED HERO BLOCK (Mascot Fixed on Left + Panel on Right) */}
        <div className="relative max-w-5xl mx-auto mb-16">
          <div className="rounded-3xl border border-white/90 bg-white/95 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,163,255,0.12)] p-5 sm:p-8 overflow-hidden">
            
            {/* Main Hero Container Grid: Desktop (2 Columns side-by-side), Mobile (Vertical Stacked) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-center">

              {/* LEFT COLUMN: Clean Cutout Mascot (Fixed Position, Forward Facing) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
                <div className="relative flex flex-col items-center">
                  
                  {/* Mascot Image (Using New Clean Asset `robopengu-mascot-clean.png`) */}
                  <div className="relative w-44 h-52 sm:w-56 sm:h-64 animate-antigravity-float">
                    <Image
                      src="/assets/robopengu-mascot-clean.png"
                      alt="RoboPengu AI Mascot"
                      fill
                      sizes="(max-width: 768px) 176px, 224px"
                      className="object-contain filter drop-shadow-[0_12px_28px_rgba(0,163,255,0.22)]"
                      priority
                    />
                    {/* Chest Reactor Pulse Glow */}
                    <div className="absolute top-[48%] left-[49%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-cyan-400/90 animate-reactor-pulse pointer-events-none" />
                  </div>

                </div>
              </div>

              {/* RIGHT COLUMN: RoboPengu Primary Greeting & Interaction Console */}
              <div className="md:col-span-8 flex flex-col justify-between">
                
                {/* Panel Top Header Bar (No duplicate emblem circle!) */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                          RoboPengu
                        </h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                          <span>Canlı AI</span>
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-medium text-slate-500">
                        aceleetme.tech Baş Teknoloji Danışmanı
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors min-h-[44px]"
                    >
                      {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-600" />}
                      <span className="hidden sm:inline">{isMuted ? 'Sessiz' : 'Ses Açık'}</span>
                    </button>

                    {isPanelOpen && (
                      <button
                        type="button"
                        onClick={handleClosePanel}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors min-h-[44px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Sıfırla</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* 4 Quick Suggestion Pills */}
                {/* Responsive: Horizontally scrollable single row on mobile (<768px), flex wrap on desktop */}
                <div className="mb-5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Popüler Karşılaştırma Önerileri
                  </div>
                  <div className="flex md:flex-wrap items-center justify-start gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none snap-x -mx-1 px-1">
                    {Object.keys(QUICK_AI_RESPONSES).map((pillText) => (
                      <button
                        key={pillText}
                        type="button"
                        onClick={() => handlePillClick(pillText)}
                        className="snap-start shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700 hover:text-cyan-600 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all min-h-[44px] cursor-pointer"
                      >
                        <span>{pillText}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bottom Interactive Search Console */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputQuery.trim()) handlePillClick(inputQuery);
                  }}
                  className="relative flex items-center w-full rounded-full border border-sky-300/80 bg-white shadow-xs focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/10 transition-all p-1.5 min-h-[48px]"
                >
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="RoboPengu'ya sorun (örn: iPhone 16 Pro vs S24 Ultra...)"
                    className="w-full bg-transparent pl-4 pr-20 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium min-h-[44px]"
                  />

                  <div className="absolute right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handlePillClick('F/P laptop tavsiyesi')}
                      className="p-2 rounded-full text-slate-400 hover:text-cyan-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                      title="Sesli Girdi"
                    >
                      <Mic className="w-4 h-4" />
                    </button>

                    <button
                      type="submit"
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                      title="Analiz Et"
                    >
                      {isAnalyzing ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="flex items-center gap-0.5">
                          <span className="w-0.5 bg-white rounded-full animate-wave-1 h-2.5" />
                          <span className="w-0.5 bg-white rounded-full animate-wave-2 h-3.5" />
                          <span className="w-0.5 bg-white rounded-full animate-wave-3 h-2" />
                        </div>
                      )}
                    </button>
                  </div>
                </form>

              </div>

            </div>

          </div>

          {/* ========================================================================= */}
          {/* SLIDE-IN EXPANDABLE RESULT PANEL (Desktop Slide-in / Mobile Bottom Sheet) */}
          {/* ========================================================================= */}
          {isPanelOpen && activeResult && (
            <>
              {/* DESKTOP (md:block): Horizontal Slide-in Panel directly beside RoboPengu */}
              <div className="hidden md:block mt-6 p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white border border-cyan-500/40 shadow-2xl transition-all duration-500 animate-slide-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-cyan-500 text-slate-950 text-xs font-black">
                      {activeResult.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400">RoboScore: {activeResult.score}</span>
                  </div>
                  <button
                    onClick={handleClosePanel}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-xl font-extrabold text-white mb-2">{activeResult.title}</h3>
                
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-semibold mb-4">
                  💡 {activeResult.verdict}
                </div>

                {/* Yan Yana Kıyaslama Tablosu (Side-by-side Table Format) */}
                <div className="space-y-2 mb-5">
                  <div className="grid grid-cols-3 text-xs font-bold text-slate-400 pb-1 border-b border-slate-800">
                    <span>Özellik Kriteri</span>
                    <span className="text-cyan-400">Seçenek 1</span>
                    <span className="text-teal-400">Seçenek 2</span>
                  </div>
                  {activeResult.specs.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 text-xs sm:text-sm py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <span className="font-semibold text-slate-400">{spec.label}</span>
                      <span className="text-white font-bold truncate">{spec.p1}</span>
                      <span className="text-slate-300 truncate">{spec.p2}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-400 max-w-lg">{activeResult.summary}</p>
                  <Link
                    href={activeResult.link}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 font-black text-xs hover:from-cyan-400 hover:to-teal-300 transition-transform hover:scale-105"
                  >
                    <span>Tüm Mağaza Fiyatlarını İncele</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* MOBILE (<md): Slide-up Bottom Sheet Drawer */}
              <div className="md:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-slate-900 text-white p-6 border-t border-cyan-500/40 shadow-2xl space-y-4 animate-slide-up max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-xs font-black">
                    {activeResult.badge}
                  </span>
                  <button
                    onClick={handleClosePanel}
                    className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-white">{activeResult.title}</h3>
                
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                  💡 {activeResult.verdict}
                </div>

                <div className="space-y-2">
                  {activeResult.specs.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 text-xs py-2 px-2.5 rounded-lg bg-slate-800/80">
                      <span className="font-semibold text-slate-400">{spec.label}</span>
                      <span className="text-white font-bold truncate">{spec.p1}</span>
                      <span className="text-slate-300 truncate">{spec.p2}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <Link
                    href={activeResult.link}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs min-h-[44px]"
                  >
                    <span>Kıyaslamayı Gör</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </>
          )}

        </div>

        {/* ========================================================================= */}
        {/* 2. PRODUCT PROOF SHOWCASE (RoboScore Doğrulanmış Donanım Vitrini)         */}
        {/* ========================================================================= */}
        <div className="mt-16 mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
                RoboScore Doğrulanmış Vitrin
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">
                Teknik inceleme ve canlı fiyat verileriyle puanlanan öne çıkan modeller.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-200/60 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('phones')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] ${
                  activeTab === 'phones'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Telefonlar</span>
              </button>

              <button
                onClick={() => setActiveTab('tvs')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] ${
                  activeTab === 'tvs'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Televizyonlar</span>
              </button>

              <button
                onClick={() => setActiveTab('laptops')}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] ${
                  activeTab === 'laptops'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptoplar</span>
              </button>
            </div>
          </div>

          {/* Simplified Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {SHOWCASE_PRODUCTS[activeTab].map((product) => (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold">
                      <Sparkles className="w-3 h-3" />
                      <span>RoboScore {product.score}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${product.tagBg}`}>
                      🎯 {product.decisionTag}
                    </span>
                  </div>

                  <div className="relative w-full h-40 mb-4 flex items-center justify-center p-3 bg-slate-50/60 rounded-xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="object-contain max-h-36 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.specs.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">En Uygun Fiyat</span>
                    <span className="text-base font-extrabold text-slate-900">{product.price}</span>
                  </div>

                  <Link
                    href={
                      activeTab === 'phones'
                        ? `/phones/${product.id}`
                        : activeTab === 'tvs'
                        ? `/tvs/${product.id}`
                        : `/laptops`
                    }
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-colors min-h-[44px]"
                  >
                    <span>İncele</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CANLI İNDİRİM & FİYAT AKIL RADARI (Short & Concise Bento Section)       */}
        {/* ========================================================================= */}
        <div className="mt-12 mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-cyan-600" />
                <span>Canlı İndirim & Fiyat Akıl Radarı</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold">Anlık fiyat hareketleri ve satın alma zamanlama analizi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
            
            {/* Card 1: Recent Price Drops (7 Cols) */}
            <div className="md:col-span-7 bg-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                  <span>Son Fiyat Düşüşleri</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Canlı Veri</span>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: 'iPhone 16 Pro Max 256GB Natural Titanium', store: 'Amazon TR', price: '₺84.999', oldPrice: '₺87.399', drop: '-%3' },
                  { name: 'Samsung Galaxy S25 Ultra 512GB Titanium Gray', store: 'MediaMarkt', price: '₺79.999', oldPrice: '₺83.500', drop: '-%4' },
                  { name: 'LG 55" OLED C4 4K Smart TV', store: 'Teknosa', price: '₺62.999', oldPrice: '₺66.999', drop: '-%6' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3">
                    <div className="space-y-0.5 truncate">
                      <div className="text-xs font-bold text-white truncate">{item.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="text-cyan-400 font-semibold">{item.store}</span>
                        <span>•</span>
                        <span className="line-through">₺{item.oldPrice}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-extrabold text-emerald-400">{item.price}</div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded-md inline-block">
                        {item.drop}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Buy vs Wait AI Index (5 Cols) */}
            <div className="md:col-span-5 bg-gradient-to-br from-cyan-950/70 via-slate-900 to-slate-900 text-white rounded-2xl p-5 sm:p-6 border border-cyan-800/50 shadow-md flex flex-col justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider pb-2 border-b border-cyan-900/60">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Zamanlama İndeksi</span>
              </div>

              <div className="text-center py-4 space-y-1">
                <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 tracking-tight">
                  %92
                </div>
                <div className="text-sm font-bold text-white">
                  "Şimdi Satın Alınmalı"
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-xs mx-auto pt-1">
                  Amiral gemisi kategorisinde son 60 günün dip fiyat seviyesi tespit edildi.
                </p>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex justify-between font-semibold text-slate-300">
                  <span>Fiyat Trend Tahmini</span>
                  <span className="text-emerald-400 font-bold">Düşük Risk</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
