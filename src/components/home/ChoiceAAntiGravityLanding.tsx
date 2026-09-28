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
  Clock
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

// Preset Quick Answer Responses for the 4 Pills
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
    }, 400);
  };

  const handleClear = () => {
    setInputQuery('');
    setActiveResult(null);
  };

  return (
    <div className="relative bg-[#F8F9FC] text-slate-900 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Background Soft Glow (Apple Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-cyan-200/25 blur-[140px] rounded-full" />
        <div className="absolute top-[30px] right-[20%] w-[450px] h-[450px] bg-emerald-200/25 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION: 1:1 EXACT MATCH FOR REFERENCE MOCKUP                    */}
        {/* ========================================================================= */}
        <div className="relative max-w-3xl mx-auto my-6 sm:my-10">

          {/* Overlapping 3D RoboPengu Character on Top-Left Corner (EXACT MATCH) */}
          <div className="absolute -top-16 -left-8 sm:-top-20 sm:-left-16 md:-left-20 z-30 pointer-events-none">
            <div className="relative flex flex-col items-center">
              
              {/* Mascot Image with Anti-Gravity Float Animation */}
              <div className="relative w-36 h-48 sm:w-52 sm:h-64 animate-antigravity-float">
                <Image
                  src="/assets/robopengu-character-clean.png"
                  alt="RoboPengu AI Mascot"
                  fill
                  sizes="(max-width: 640px) 144px, 208px"
                  className="object-contain filter drop-shadow-[0_15px_30px_rgba(0,163,255,0.25)]"
                  priority
                />
                {/* Glowing Blue Chest Reactor Pulse */}
                <div className="absolute top-[48%] left-[49%] -translate-x-1/2 -translate-y-1/2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-cyan-400/90 animate-reactor-pulse pointer-events-none" />
              </div>

              {/* "Küresel AI Haberleri •" Dark Badge Under Mascot's Feet */}
              <div className="mt-[-6px] sm:mt-[-8px] inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b1329] text-white text-[11px] sm:text-xs font-semibold shadow-xl border border-slate-700/80 pointer-events-auto">
                <span className="text-cyan-400">🌐</span>
                <span>Küresel AI Haberleri</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>

            </div>
          </div>

          {/* Main White Console Card (1:1 Exact Match with Reference Image) */}
          <div className="relative rounded-[32px] border border-white/90 bg-white/95 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(0,163,255,0.16)] p-6 sm:p-10 pt-12 sm:pt-10 overflow-hidden">
            
            {/* Top Bar: RoboPengu | Sessiz | Temizle | X */}
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2 pl-24 sm:pl-32">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-xs">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-[9px] font-bold">
                    RP
                  </div>
                </div>
                <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">RoboPengu</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 text-xs font-medium text-slate-500">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors min-h-[44px]"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-600" />}
                  <span className="hidden sm:inline">{isMuted ? 'Sessiz' : 'Sessiz'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Temizle</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Section: Glowing Circular Disc + Cyber Heart Emblem */}
            {!activeResult ? (
              <div className="text-center my-4 sm:my-6">
                
                {/* 3D Circular Glowing Bevel Disc */}
                <div className="relative inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-100/70 border-2 border-sky-200/90 shadow-[0_12px_35px_rgba(0,163,255,0.22)] mb-4 group">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <Image
                      src="/images/robopengu_cyber_heart.png"
                      alt="RoboPengu Cyber Heart Emblem"
                      width={80}
                      height={80}
                      className="object-contain filter drop-shadow-[0_4px_12px_rgba(0,163,255,0.4)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                  RoboPengu
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide mb-8">
                  aceleetme.tech Baş Teknoloji Danışmanı
                </p>

                {/* 4 Suggestion Pills (Arranged in 2 neat rows, matching screenshot) */}
                <div className="max-w-xl mx-auto space-y-2.5 mb-8">
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handlePillClick('iPhone 16 Pro Max vs S24 Ultra')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>📱 iPhone 16 Pro Max vs S24 Ultra</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePillClick('En iyi OLED TV hangisi?')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>📺 En iyi OLED TV hangisi?</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handlePillClick('F/P laptop tavsiyesi')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>💻 F/P laptop tavsiyesi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePillClick('ANC kulaklık önerisi')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>🎧 ANC kulaklık önerisi</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Active Answer Result Inside the Card */
              <div className="my-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/40 border border-cyan-100 animate-fadeIn">
                <div className="flex items-center justify-between pb-3 border-b border-cyan-100 mb-3">
                  <span className="px-3 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold">
                    {activeResult.badge}
                  </span>
                  <button
                    onClick={handleClear}
                    className="text-xs text-slate-400 hover:text-slate-800 underline font-medium"
                  >
                    Yeni Soru Sor
                  </button>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">{activeResult.title}</h3>
                
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs sm:text-sm font-semibold mb-4">
                  💡 {activeResult.verdict}
                </div>

                <div className="space-y-1.5 mb-4">
                  {activeResult.specs.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 text-xs sm:text-sm py-1.5 px-3 rounded-lg bg-white border border-slate-100">
                      <span className="font-semibold text-slate-500">{spec.label}</span>
                      <span className="text-slate-900 font-bold truncate">{spec.p1}</span>
                      <span className="text-slate-600 truncate">{spec.p2}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-cyan-100">
                  <span className="text-xs font-bold text-slate-500">RoboScore: {activeResult.score}</span>
                  <Link
                    href={activeResult.link}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-colors min-h-[44px]"
                  >
                    <span>Detaylı Kıyaslama</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Input Console Bar (Sky Blue Pill Border - 1:1 Match) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputQuery.trim()) handlePillClick(inputQuery);
              }}
              className="relative flex items-center w-full rounded-full border-2 border-[#60a5fa] bg-white shadow-xs focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all p-1.5 min-h-[52px]"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="RoboPengu'ya sorun"
                className="w-full bg-transparent pl-5 pr-24 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none font-medium min-h-[44px]"
              />

              <div className="absolute right-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePillClick('F/P laptop tavsiyesi')}
                  className="p-2 rounded-full text-slate-500 hover:text-cyan-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                  title="Sesli Girdi"
                >
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  type="submit"
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  title="Analiz Et"
                >
                  {isAnalyzing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    /* Live Audio Spectrum Equalizer Waveform Bars */
                    <div className="flex items-center gap-0.5">
                      <span className="w-0.5 bg-white rounded-full animate-wave-1 h-3" />
                      <span className="w-0.5 bg-white rounded-full animate-wave-2 h-4" />
                      <span className="w-0.5 bg-white rounded-full animate-wave-3 h-2" />
                      <span className="w-0.5 bg-white rounded-full animate-wave-4 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </form>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. PRODUCT PROOF SHOWCASE (RoboScore Doğrulanmış Donanım Vitrini)         */}
        {/* ========================================================================= */}
        <div className="mt-20 mb-16">
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
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
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
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
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
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
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
