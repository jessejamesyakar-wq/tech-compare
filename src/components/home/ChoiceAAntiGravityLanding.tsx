'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Smartphone,
  Tv,
  Laptop,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles
} from 'lucide-react';
import { AIAssistantModal } from '@/components/ai/AIAssistantModal';
import { Homepage2026Showcase } from './Homepage2026Showcase';
import { Showcase2026Data } from '@/lib/showcase2026';

// SHOWCASE VERİLERİ (ALT BÖLÜM VİTRİNİ)
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
      id: 'apple-macbook-air-m3-13-16gb',
      name: 'Apple MacBook Air 13" M3 16GB 512GB',
      brand: 'Apple',
      price: '49.999 TL',
      image: '/images/laptops/apple/apple-macbook-air-13-m3-uzay-grisi.jpg',
      score: '9.8',
      decisionTag: '18 Saat Pil Şampiyonu',
      tagBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      specs: ['Apple M3 Çip', '16GB Unified RAM', 'Liquid Retina']
    },
    {
      id: 'asus-zenbook-14-oled-ux3405ma-pp226w',
      name: 'ASUS Zenbook 14 OLED Intel Core Ultra 7',
      brand: 'ASUS',
      price: '47.999 TL',
      image: '/images/laptops/asus/asus-zenbook-14-oled-ux3405ma-pp226w.jpg',
      score: '9.7',
      decisionTag: '3K 120Hz OLED Ekran',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['Core Ultra 7', '32GB LPDDR5X', '1.2 kg Ultra Hafif']
    },
    {
      id: 'lenovo-yoga-slim-7x-snapdragon',
      name: 'Lenovo Yoga Slim 7x Snapdragon X Elite',
      brand: 'Lenovo',
      price: '52.999 TL',
      image: '/images/laptops/lenovo/lenovo-yoga-slim-7x-14-oled.jpg',
      score: '9.6',
      decisionTag: 'Copilot+ AI Ultrabook',
      tagBg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      specs: ['Snapdragon X Elite', '45 TOPS NPU', '3K OLED']
    }
  ]
};

interface ChoiceAAntiGravityLandingProps {
  showcase2026?: Showcase2026Data;
}

export function ChoiceAAntiGravityLanding({ showcase2026 }: ChoiceAAntiGravityLandingProps = {}) {
  const [activeTab, setActiveTab] = useState<'phones' | 'tvs' | 'laptops'>('phones');

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

        {/* 2026 TEKNOLOJİ VİTRİNİ (DYNAMIC SHOWCASE) */}
        {showcase2026 && showcase2026.initialProducts?.length > 0 && (
          <Homepage2026Showcase
            initialProducts={showcase2026.initialProducts}
            rotationPool={showcase2026.rotationPool}
          />
        )}

        {/* 2. PRODUCT PROOF SHOWCASE (RoboScore Doğrulanmış Donanım Vitrini) */}
        <div className="max-w-7xl mx-auto mt-16 mb-16">
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
                type="button"
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
                type="button"
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
                type="button"
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
                    href={`/compare?d1=${encodeURIComponent(product.id)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-colors min-h-[44px]"
                  >
                    <span>İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CANLI FİYAT DÜŞÜŞ RADARI (Radar Strip) */}
        <div className="max-w-7xl mx-auto p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-xs">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
                  Canlı Fiyat Düşüş Radarı
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-extrabold">
                  CANLI
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Katalogdaki 5.768+ ürün mağaza API'leri üzerinden anlık kontrol ediliyor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-900">En Çok İndirime Giren</span>
              <span className="text-xs text-slate-500">Samsung Galaxy S24 Ultra (%14 İndirim)</span>
            </div>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors min-h-[44px]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tüm İndirimleri Takip Et</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
