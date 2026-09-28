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
  ShieldCheck,
  Smartphone,
  Tv,
  Laptop,
  Headphones,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Sliders,
  Search,
  Bot
} from 'lucide-react';

interface ChoiceAAntiGravityLandingProps {
  smartphones?: any[];
  tvs?: any[];
  laptops?: any[];
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
    badge: 'Mobil Çip & Kamera Düello Analizi',
    verdict: 'RoboPengu Tavsiyesi: Video ve Ekosistem için iPhone 16 Pro Max; Yapay Zeka & Zoom için S24 Ultra.',
    score: '9.8 / 10',
    winner: 'iPhone 16 Pro Max (Video Lideri)',
    specs: [
      { label: 'İşlemci', p1: 'Apple A18 Pro (3nm)', p2: 'Snapdragon 8 Gen 3' },
      { label: 'Ekran', p1: '6.9" Super Retina XDR 120Hz', p2: '6.8" Dynamic AMOLED 2X 120Hz' },
      { label: 'Kamera', p1: '48MP Fusion + 5x Optik Zoom', p2: '200MP Main + 5x/10x Periskop' },
      { label: 'Pil / Şarj', p1: '4.685 mAh (29 saat video)', p2: '5.000 mAh (45W hızlı şarj)' }
    ],
    summary: 'A18 Pro çipi ve Sinematik 4K 120fps video kaydı ile iPhone 16 Pro Max içerik üreticileri için rakipsizdir.',
    link: '/compare?category=phones&p1=apple-iphone-16-pro-max-256-gb&p2=samsung-galaxy-s24-ultra-256-gb'
  },
  'En iyi OLED TV hangisi?': {
    title: '2026 En İyi OLED TV Seçimi: LG C4 vs Samsung S95D',
    badge: 'Ekran Teknolojisi Lideri',
    verdict: 'RoboPengu Kararı: LG OLED55C44LA (Tam Fiyat/Performans Lideri)',
    score: '9.9 / 10',
    winner: 'LG OLED55C44LA (144Hz & α9 Gen7 AI)',
    specs: [
      { label: 'Panel Tipi', p1: 'WOLED evo Brightness Booster', p2: 'QD-OLED Anti-Glare' },
      { label: 'Yenileme Hızı', p1: '144Hz VRR / G-Sync / FreeSync', p2: '144Hz VRR FreeSync Premium' },
      { label: 'Ses Sistemi', p1: '9.1.2ch Virtual Surround AI', p2: '4.2.2ch Dolby Atmos' },
      { label: 'Fiyat Avantajı', p1: '54.999 TL (En Uygun)', p2: '69.999 TL' }
    ],
    summary: 'LG C4 OLED, sonsuz siyah seviyesi ve 144Hz oyuncu desteği ile 2026 yılının en yüksek puan alan OLED televizyonudur.',
    link: '/tvs/lg-oled55c44la'
  },
  'F/P laptop tavsiyesi': {
    title: 'Fiyat/Performans Laptop Liderleri (Yazılım & Gaming)',
    badge: 'Mobil Güç & Bütçe Şampiyonu',
    verdict: 'RoboPengu Önerisi: Apple MacBook Air M3 (Taşınabilirlik) veya ASUS ROG Zephyrus G16 (Performans)',
    score: '9.7 / 10',
    winner: 'Apple MacBook Air M3 (18 Saat Pil)',
    specs: [
      { label: 'İşlemci', p1: 'Apple M3 (8 Çekirdek CPU / 10 Çekirdek GPU)', p2: 'Intel Core Ultra 7 155H' },
      { label: 'RAM / Depolama', p1: '16GB Unified / 512GB SSD', p2: '16GB LPDDR5X / 1TB SSD' },
      { label: 'Ekran', p1: '13.6" Liquid Retina 500 nits', p2: '16" OLED 240Hz ROG Nebula' },
      { label: 'Pil Ömrü', p1: '18 Saate kadar', p2: '8 Saate kadar' }
    ],
    summary: 'Sessiz fan tasarımı, 18 saat gerçek pil ömrü ve hafif kasası ile M3 MacBook Air bütçe-performans kralıdır.',
    link: '/laptops'
  },
  'ANC kulaklık önerisi': {
    title: 'Gürültü Engelleme (ANC) Şampiyonları',
    badge: 'Aktif Gürültü Engelleme Lideri',
    verdict: 'RoboPengu Kararı: Sony WH-1000XM5 (En İyi ANC) & AirPods Pro 2 (Mobil Uyum)',
    score: '9.8 / 10',
    winner: 'Sony WH-1000XM5 (V1 Processor)',
    specs: [
      { label: 'ANC Teknolojisi', p1: 'Entegre İşlemci V1 + QN1 (8 Mikrofon)', p2: 'H2 Çip Aktif Gürültü Engelleme' },
      { label: 'Pil Ömrü', p1: '30 Saat (ANC Açık)', p2: '6 Saat Kulaklık / 30 Saat Kutu' },
      { label: 'Ses Sürücüsü', p1: '30mm Karbon Fiber Sürücü', p2: 'Özel Apple Sürücü + UHQ' },
      { label: 'Ağırlık', p1: '250 gram (Ultra Hafif)', p2: '5.3 gram (Kulak İçi)' }
    ],
    summary: 'Sony WH-1000XM5, uçuş ve ofis ortamındaki gürültüyü %98 oranında keserek ANC kategorisinde zirvededir.',
    link: '/headphones'
  }
};

// Proof Showcase Category Showcase Items
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
      decisionTag: 'En Yeni Kompakt F/P',
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
      specs: ['OLED evo', '144Hz VRR', 'α9 Gen7 AI Processor']
    },
    {
      id: 'samsung-55s95d',
      name: 'Samsung 55S95D 55" 144Hz Anti-Glare QD-OLED TV',
      brand: 'Samsung',
      price: '69.999 TL',
      image: '/images/tvs/samsung-55s95d.jpg',
      score: '9.8',
      decisionTag: 'Parlama Önleyici QD-OLED',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['QD-OLED', 'Glare-Free Screen', 'NQ4 AI Gen2']
    },
    {
      id: 'philips-55oled809',
      name: 'Philips 55OLED809 55" Ambilight 4K OLED TV',
      brand: 'Philips',
      price: '59.999 TL',
      image: '/images/tvs/philips-55oled809.jpg',
      score: '9.6',
      decisionTag: 'Ambilight İllüzyon Lideri',
      tagBg: 'bg-purple-500/10 text-purple-700 border-purple-200',
      specs: ['Ambilight 3-sided', 'P5 AI Perfect Picture', '144Hz Gaming']
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
      specs: ['Snapdragon X Elite', '45 TOPS NPU', '3K PureSight OLED']
    }
  ]
};

export function ChoiceAAntiGravityLanding({ counts }: ChoiceAAntiGravityLandingProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'phones' | 'tvs' | 'laptops'>('phones');
  const [activeQuickResponse, setActiveQuickResponse] = useState<typeof QUICK_AI_RESPONSES[string] | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePillClick = (promptText: string) => {
    setInputQuery(promptText);
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      if (QUICK_AI_RESPONSES[promptText]) {
        setActiveQuickResponse(QUICK_AI_RESPONSES[promptText]);
      } else {
        // Fallback default response
        setActiveQuickResponse({
          title: promptText,
          badge: 'RoboPengu Yapay Zekâ Analizi',
          verdict: `RoboPengu "${promptText}" araması için en yüksek RoboScore değerine sahip ürünleri analiz etti.`,
          score: '9.7 / 10',
          winner: 'AceleEtme Karşılaştırma Motoru Doğrulanmış Veri',
          specs: [
            { label: 'Tavsiye Kriteri', p1: 'Fiyat / Performans Dengesi', p2: 'Donanım Kalitesi' },
            { label: 'Veri Kaynağı', p1: '5.768+ Güncel Mağaza Fiyatı', p2: 'Gerçek Kullanıcı Skorları' }
          ],
          summary: 'En güncel fiyat ve donanım karşılaştırma sonuçları için aşağıdaki vitrin kartlarını inceleyebilirsiniz.',
          link: '/compare'
        });
      }
    }, 600);
  };

  const handleClear = () => {
    setInputQuery('');
    setActiveQuickResponse(null);
  };

  return (
    <div className="relative min-h-screen bg-[#F8F9FC] text-slate-900 font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-white">
      {/* Background Subtle Gradient Glows (Apple Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[15%] w-[500px] h-[500px] bg-cyan-200/30 blur-[130px] rounded-full" />
        <div className="absolute top-[50px] right-[15%] w-[450px] h-[450px] bg-emerald-200/30 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (RoboPengu Centered & Anti-Gravity Concept) */}
        {/* ========================================================================= */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200/80 shadow-sm backdrop-blur-md mb-6">
            <Sparkles className="w-4 h-4 text-cyan-500 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600">
              RoboPengu 2.0 AI Destekli Karar Motoru
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6">
            RoboPengu ile Karar Ver,{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500">
              Acele Etme.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-3xl mx-auto leading-relaxed">
            5.768+ ürün arasından bütçene ve kullanımına en uygun donanımı bulan yapay zekâ danışmanın.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. EMBEDDED CONSOLE (Ekteki Chat UI ile Birebir 1:1 Matching) */}
        {/* ========================================================================= */}
        <div className="relative max-w-4xl mx-auto my-12">
          {/* Overlapping Metallic 3D RoboPengu Character (Floating & Pulse Glow) */}
          <div className="absolute -top-16 -left-6 sm:-left-16 z-30 pointer-events-none group">
            <div className="relative flex flex-col items-center">
              {/* Mascot Image with Anti-Gravity Float Animation */}
              <div className="relative w-36 h-44 sm:w-48 sm:h-56 animate-antigravity-float">
                <Image
                  src="/assets/robopengu-modal-mascot.png"
                  alt="RoboPengu Metallic Mascot"
                  fill
                  className="object-contain drop-shadow-[0_15px_30px_rgba(0,163,255,0.25)]"
                  priority
                />

                {/* Chest Glowing Blue Reactor Pulse Effect */}
                <div className="absolute top-[42%] left-[45%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-cyan-400/80 animate-reactor-pulse pointer-events-none" />
              </div>

              {/* "Küresel AI Haberleri •" Badge under Penguin's foot */}
              <div className="mt-[-8px] sm:mt-[-12px] inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700/60 transition-transform duration-300 group-hover:scale-105">
                <span className="text-cyan-400">🌐</span>
                <span>Küresel AI Haberleri</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
            </div>
          </div>

          {/* Main Glass Modal Card (1:1 UI matched with reference image) */}
          <div className="relative rounded-[32px] border border-white/90 bg-white/95 backdrop-blur-2xl shadow-[0_25px_70px_-15px_rgba(0,163,255,0.14)] p-6 sm:p-10 pt-14 sm:pt-10 overflow-hidden">
            {/* Top Bar: RoboPengu | Sessiz | Temizle | X */}
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
              <div className="flex items-center gap-3 pl-24 sm:pl-28">
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-sm">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                    RP
                  </div>
                </div>
                <span className="text-base font-bold text-slate-900 tracking-tight">RoboPengu</span>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-medium text-slate-500">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
                  <span>{isMuted ? 'Sessiz' : 'Ses Açık'}</span>
                </button>

                <button
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Temizle</span>
                </button>

                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ml-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Center Section: Glowing Gear & Shield Emblem + Header */}
            {!activeQuickResponse ? (
              <div className="text-center my-6 sm:my-8 max-w-lg mx-auto">
                <div className="relative inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-cyan-100/80 via-teal-50/50 to-blue-100/80 border border-cyan-200/60 shadow-[0_10px_35px_-5px_rgba(0,163,255,0.2)] mb-5 group">
                  <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping opacity-25" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden flex items-center justify-center p-1">
                    <Image
                      src="/images/futuristic_robopengu_emblem.png"
                      alt="RoboPengu Gear & Shield Emblem"
                      width={80}
                      height={80}
                      className="object-contain transform transition-transform duration-500 group-hover:rotate-12"
                    />
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                  RoboPengu
                </h2>
                <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide mb-8">
                  aceleetme.tech Baş Teknoloji Danışmanı
                </p>

                {/* 4 Quick Action Pills (1:1 Reference UI match) */}
                <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 mb-8">
                  {Object.keys(QUICK_AI_RESPONSES).map((pillText) => (
                    <button
                      key={pillText}
                      onClick={() => handlePillClick(pillText)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/90 text-xs sm:text-sm font-medium text-slate-700 hover:text-cyan-600 hover:border-cyan-400/80 hover:bg-cyan-50/40 hover:shadow-md transition-all duration-200"
                    >
                      <span>{pillText}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Active AI Response View Inside Console */
              <div className="my-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 border border-cyan-100 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-100">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-cyan-500 text-white text-xs font-bold tracking-wide">
                      {activeQuickResponse.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">RoboScore: {activeQuickResponse.score}</span>
                  </div>
                  <button
                    onClick={() => setActiveQuickResponse(null)}
                    className="text-xs text-slate-400 hover:text-slate-700 underline"
                  >
                    Yeni Arama
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">{activeQuickResponse.title}</h3>
                <p className="text-sm font-medium text-emerald-700 mb-4 bg-emerald-50 p-3 rounded-xl border border-emerald-200/60">
                  💡 {activeQuickResponse.verdict}
                </p>

                {/* Specs comparison table inside response */}
                <div className="space-y-2 mb-4">
                  {activeQuickResponse.specs.map((spec, idx) => (
                    <div key={idx} className="grid grid-cols-3 text-xs sm:text-sm py-1.5 px-3 rounded-lg bg-white/80 border border-slate-100">
                      <span className="font-semibold text-slate-500">{spec.label}</span>
                      <span className="text-slate-900 font-medium">{spec.p1}</span>
                      <span className="text-slate-600">{spec.p2}</span>
                    </div>
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">{activeQuickResponse.summary}</p>

                <div className="flex justify-end">
                  <Link
                    href={activeQuickResponse.link}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Detaylı Düello ve Mağaza Fiyatları</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Bottom Interactive Search Bar (1:1 Reference UI match) */}
            <div className="relative pt-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputQuery.trim()) handlePillClick(inputQuery);
                }}
                className="relative flex items-center w-full rounded-full border border-sky-300/70 bg-white shadow-sm focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all p-1.5 sm:p-2"
              >
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder="RoboPengu'ya sorun"
                  className="w-full bg-transparent pl-5 pr-24 py-2 sm:py-2.5 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none font-medium"
                />

                <div className="absolute right-2 flex items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => handlePillClick('F/P laptop tavsiyesi')}
                    className="p-2 rounded-full text-slate-400 hover:text-cyan-600 hover:bg-slate-50 transition-colors"
                    title="Sesli Girdi"
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>

                  <button
                    type="submit"
                    className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                    title="RoboPengu Analiz Et"
                  >
                    {isAnalyzing ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      /* Live Audio Spectrum Equalizer Waveform Icon */
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
        </div>

        {/* ========================================================================= */}
        {/* 3. PRODUCT PROOF SHOWCASE (Apple-Style Category Bento Grid) */}
        {/* ========================================================================= */}
        <div className="mt-20">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              RoboScore Doğrulanmış Donanım Vitrini
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Yapay zekâ karar motorumuzun teknik incelemeler ve mağaza teklifleriyle puanladığı öne çıkan modeller.
            </p>

            {/* Category Filter Tabs */}
            <div className="flex items-center justify-center gap-2 mt-6 p-1.5 rounded-full bg-slate-200/60 max-w-sm mx-auto backdrop-blur-md">
              <button
                onClick={() => setActiveTab('phones')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'phones'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Telefonlar</span>
              </button>

              <button
                onClick={() => setActiveTab('tvs')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'tvs'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-4 h-4" />
                <span>Televizyonlar</span>
              </button>

              <button
                onClick={() => setActiveTab('laptops')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeTab === 'laptops'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-4 h-4" />
                <span>Laptoplar</span>
              </button>
            </div>
          </div>

          {/* Bento Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {SHOWCASE_PRODUCTS[activeTab].map((product) => (
              <div
                key={product.id}
                className="group relative rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Badges: Brand & RoboScore */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold tracking-wide">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>RoboScore {product.score}</span>
                    </div>
                  </div>

                  {/* AI Decision Tag */}
                  <div className="mb-4">
                    <span className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${product.tagBg}`}>
                      🎯 {product.decisionTag}
                    </span>
                  </div>

                  {/* Product Image Container */}
                  <div className="relative w-full h-48 mb-6 flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl group-hover:bg-slate-50 transition-colors">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={180}
                      height={180}
                      className="object-contain max-h-40 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Title */}
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  {/* Specs Highlights */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {product.specs.map((spec, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer: Price & CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-xs font-medium text-slate-400">En Uygun Fiyat</span>
                    <span className="text-lg font-extrabold text-slate-900">{product.price}</span>
                  </div>

                  <Link
                    href={
                      activeTab === 'phones'
                        ? `/phones/${product.id}`
                        : activeTab === 'tvs'
                        ? `/tvs/${product.id}`
                        : `/laptops`
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <span>İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. TRUST & FEATURE HIGHLIGHT STRIP */}
        {/* ========================================================================= */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">5.768+ Donanım Karşılaştırma</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Tüm mağazaların canlı fiyat verilerini ve teknik spektleri milisaniyeler içinde işleyen yapay zekâ altyapısı.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Tarafsız & Bağımsız Karar</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Herhangi bir markanın veya mağazanın sponsorluğu olmadan sadece saf teknik puanlama (RoboScore).
              </p>
            </div>

            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Akıllı Fiyat Analizi</h4>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Fiyat geçmişi trendlerini izleyerek "Şimdi mi alınmalı, yoksa beklenmeli mi?" kararını söyler.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
