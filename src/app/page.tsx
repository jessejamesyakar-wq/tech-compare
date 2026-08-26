'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { getFeaturedSmartphones, getPopularComparisonsData, getAllSmartphones, getAllTVs, getAllProducts } from '@/lib/data';
import { getStoredProducts } from '@/lib/adminData';
import { popularComparisonsList } from '@/lib/mockData';
import { Smartphone, TVProduct } from '@/lib/types';
import { calculateTVScore } from '@/lib/tvScoring';
import { HeroCarousel, getDynamicHeroSlides } from '@/components/promo/HeroCarousel';
import { HeroThumbnailStrip } from '@/components/promo/HeroThumbnailStrip';
import { WeeklyPromoStrip } from '@/components/promo/WeeklyPromoStrip';
import { PhoneCard } from '@/components/catalog/PhoneCard';
import { BrandLogoBar } from '@/components/catalog/BrandLogoBar';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryBannerGrid } from '@/components/promo/CategoryBannerGrid';
import { ProductCarousel } from '@/components/catalog/ProductCarousel';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { DynamicCategoryShowcase } from '@/components/home/DynamicCategoryShowcase';
import { DualBrandCorner3DBillboard } from '@/components/ads/DualBrandCorner3DBillboard';

const allProductsCache = getStoredProducts();
const allMockSmartphonesCount = allProductsCache.filter((p) => p.category === 'smartphones').length;
const allMockTVsCount = allProductsCache.filter((p) => p.category === 'tvs').length;
const allMockTabletsCount = allProductsCache.filter((p) => p.category === 'tablets').length;
const allMockLaptopsCount = allProductsCache.filter((p) => p.category === 'laptops').length;
const allMockSmartwatchesCount = allProductsCache.filter((p) => p.category === 'smartwatches').length;

const CATEGORY_BANNERS_ROW1 = [
  {
    id: 'cat-1',
    title: 'Akıllı Telefonlar',
    subtitle: 'ZİRVE VERİMLİLİK',
    badge: `📱 ${allMockSmartphonesCount}+ MODEL`,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    href: '/phones'
  },
  {
    id: 'cat-2',
    title: 'Bilgisayar & Laptop',
    subtitle: 'YAPAY ZEKÂ İŞLEMCİLER',
    badge: `💻 ${allMockLaptopsCount > 0 ? `${allMockLaptopsCount} MODEL` : 'LAPTOPS'}`,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
    href: '/laptops'
  },
  {
    id: 'cat-3',
    title: 'Televizyonlar',
    subtitle: 'DEV EKRAN SİNEMA',
    badge: `📺 ${allMockTVsCount > 0 ? `${allMockTVsCount} MODEL` : 'TELEVİZYON'}`,
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    href: '/tvs'
  },
  {
    id: 'cat-4',
    title: 'Tabletler',
    subtitle: 'MOBİL ÜRETKENLİK',
    badge: `📱 ${allMockTabletsCount > 0 ? `${allMockTabletsCount} MODEL` : 'TABLETLER'}`,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
    href: '/tablets'
  }
];

const WIDE_PROMO_BANNERS = [
  {
    id: 'wide-1',
    title: 'Sezon Sonu Canlı Fiyat Düşüşleri',
    subtitle: '8 MAĞAZA ANLIK TAKİP',
    badge: '⚡ FIRSAT ALARMI',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80',
    href: '/phones?sortBy=popular'
  },
  {
    id: 'wide-2',
    title: '6 Aylık Şeffaf Fiyat Geçmişi Analizi',
    subtitle: 'EN DOĞRU ALIM ZAMANI',
    badge: '📈 DÜELLO MASASI',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    href: '/compare'
  }
];

const CATEGORY_BANNERS_ROW2 = [
  {
    id: 'cat-5',
    title: 'Ev ve Yaşam Teknolojileri',
    subtitle: 'AKILLI EV, MUTFAK & BAKIM',
    badge: '⚡ DYSON, PHILIPS & DREAME',
    image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80',
    href: '/appliances'
  },
  {
    id: 'cat-6',
    title: 'Kulaklık & Hi-Fi Audio',
    subtitle: 'KRİSTAL NETLİK',
    badge: '🎧 AIRPODS & SONY ANC',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    href: '/headphones'
  },
  {
    id: 'cat-7',
    title: 'Oyun Konsolları',
    subtitle: 'YENİ NESİL GRAFİK',
    badge: '🎮 PS5 PRO & XBOX',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80',
    href: '/consoles'
  },
  {
    id: 'cat-8',
    title: 'Akıllı Saatler',
    subtitle: 'SAĞLIK & SPOR TAKİBİ',
    badge: '⌚ WATCH ULTRA 2',
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
    href: '/smartwatches'
  }
];
import {
  Scale,
  Search,
  ShieldCheck,
  Zap,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Crown,
  Camera,
  Award,
  CheckCircle2,
  Lock,
  History,
  Sliders,
  Smartphone as PhoneIcon,
  Tv as TvIcon,
  Laptop,
  Headphones,
  Gamepad2,
  Percent,
  Flame,
  Filter,
  ChevronRight,
  DollarSign,
  Tv,
  Check
} from 'lucide-react';

export default function HomePage() {
  const { t } = useI18n();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [allPhones, setAllPhones] = useState<Smartphone[]>([]);
  const [allTVs, setAllTVs] = useState<TVProduct[]>([]);
  const [totalCatalogCount, setTotalCatalogCount] = useState<number>(0);
  const [popularComparisons, setPopularComparisons] = useState<typeof popularComparisonsList>([]);

  const [activeTab, setActiveTab] = useState<string>('2026');
  const [activeTVTab, setActiveTVTab] = useState<string>('oled');
  const [heroIndex, setHeroIndex] = useState<number>(0);

  useEffect(() => {
    async function loadData() {
      const phones = await getAllSmartphones();
      const tvs = await getAllTVs();
      const products = await getAllProducts();
      const popComp = await getPopularComparisonsData();

      setAllPhones(phones);
      setAllTVs(tvs);
      setTotalCatalogCount(products.length);
      setPopularComparisons(popComp);
    }
    loadData();
  }, []);

  const getFilteredSubList = () => {
    let list = [...allPhones];

    if (activeTab === '2026') {
      list = list.filter((p) => p.releaseYear === 2026);
    } else if (activeTab === 'flagship') {
      list = list.filter((p) => p.basePrice >= 50000);
    } else if (activeTab === 'camera') {
      list = list.filter((p) => {
        const mp = parseInt(p.specs?.camera?.mainMp || '0', 10);
        return mp >= 50 || p.highlights.some((h) => h.toLowerCase().includes('kamera'));
      });
    } else if (activeTab === 'value') {
      list = list.filter((p) => p.basePrice < 45000 && (p.rating || 0) >= 4.5);
    }

    return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  };

  const getFilteredTVs = () => {
    let list = [...allTVs];

    if (activeTVTab === 'oled') {
      list = list.filter((tv) => {
        const tech = tv.specs?.displayTech?.toLowerCase() || '';
        return tech.includes('oled');
      });
    } else if (activeTVTab === 'miniled') {
      list = list.filter((tv) => {
        const tech = tv.specs?.displayTech?.toLowerCase() || '';
        return tech.includes('mini') || tech.includes('neo qled');
      });
    } else if (activeTVTab === 'gaming144') {
      list = list.filter((tv) => (tv.specs?.refreshRateHz || 60) >= 120);
    } else if (activeTVTab === 'giant') {
      list = list.filter((tv) => {
        const nameInchMatch = tv.name.match(/\b(\d+(?:\.\d+)?)"/);
        const inchVal = nameInchMatch ? parseFloat(nameInchMatch[1]) : tv.specs?.screenSizeInches || 55;
        return inchVal >= 75;
      });
    }

    return list.sort((a, b) => calculateTVScore(b).totalScore - calculateTVScore(a).totalScore).slice(0, 8);
  };

  // Mixed dataset for 16-card Discount Grid (interleaving top phones & TVs)
  const getMixedDiscountedProducts = (): (Smartphone | TVProduct)[] => {
    const topPhones = [...allPhones].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    const topTVs = [...allTVs].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
    const mixed: (Smartphone | TVProduct)[] = [];

    const maxLen = Math.max(topPhones.length, topTVs.length);
    for (let i = 0; i < maxLen; i++) {
      if (topPhones[i]) mixed.push(topPhones[i]);
      if (topTVs[i]) mixed.push(topTVs[i]);
    }
    return mixed.slice(0, 16);
  };

  // Mixed dataset for 20-card "Çok Satanlar" Carousel
  const getBestSellerCarouselProducts = (): (Smartphone | TVProduct)[] => {
    const popPhones = [...allPhones].filter(p => p.isPopular || (p.rating || 0) >= 4.5).sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 12);
    const popTVs = [...allTVs].filter(t => t.isPopular || (t.rating || 0) >= 4.5).sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 12);
    const mixed: (Smartphone | TVProduct)[] = [];

    const maxLen = Math.max(popPhones.length, popTVs.length);
    for (let i = 0; i < maxLen; i++) {
      if (popPhones[i]) mixed.push(popPhones[i]);
      if (popTVs[i]) mixed.push(popTVs[i]);
    }
    return mixed.slice(0, 20);
  };

  const mixedDiscountGrid = getMixedDiscountedProducts();
  const bestSellerCarouselList = getBestSellerCarouselProducts();

  const currentProducts = getFilteredSubList().slice(0, 16);
  const currentTVs = getFilteredTVs();
  const firstRowProducts = currentProducts.slice(0, 4);
  const secondRowProducts = currentProducts.slice(4, 8);
  const remainingProducts = currentProducts.slice(8, 16);

  const dynamicHeroSlides = getDynamicHeroSlides();
  const heroThumbnails = dynamicHeroSlides.map((slide) => ({
    id: slide.id,
    name: slide.productName,
    price: slide.price,
    image: slide.image
  }));

  return (
    <div className="space-y-8 py-2">

      {/* 2. Hero Banner & Interactive Showcase Slider */}
      <HeroCarousel activeIndex={heroIndex} onSelect={setHeroIndex} />

      {/* 3. Sub-Hero Horizontal Thumbnail Strip */}
      <HeroThumbnailStrip items={heroThumbnails} activeIndex={heroIndex} onSelect={setHeroIndex} />

      {/* 🏢 3D Köşe Billboard Reklamı (Sol: Trendyol, Sağ: MediaMarkt) & Pengi Maskotu */}
      <DualBrandCorner3DBillboard />

      {/* 5. Dynamic Category Distribution Showcase (%40 Telefon, %20 TV, %10 Ev Aletleri, %10 Tablet, %10 Saat, %10 Kulaklık) */}
      <DynamicCategoryShowcase />

      {/* 📺 NEW SECTION: Top Rated TVs Showcase (100-Point Score Ranked - Premium Light Glassmorphism Edition) */}
      <section className="space-y-8 bg-gradient-to-br from-white via-emerald-50/30 to-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        {/* Subtle Ambient Color Glow Blobs */}
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Frosted Glass Header Panel */}
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-300/80 mb-2 shadow-2xs">
              <Award className="w-3.5 h-3.5" />
              <span>100 PUAN SIRALAMASI</span>
            </div>
            <h2 className="text-slate-900 text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
              <Tv className="w-7 h-7 text-emerald-600" />
              <span>En Yüksek Puanlı Televizyonlar</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Panel teknolojisi, yenileme hızı, ses sistemi ve işlemci gücüne göre 100 puan üzerinden sıralı amiral gemisi modeller.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/90 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTVTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTVTab === 'all'
                  ? 'bg-emerald-600 text-white font-black shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent'
              }`}
            >
              Tüm Puan Şampiyonları
            </button>
            <button
              onClick={() => setActiveTVTab('oled')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTVTab === 'oled'
                  ? 'bg-emerald-600 text-white font-black shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent'
              }`}
            >
              OLED & QD-OLED
            </button>
            <button
              onClick={() => setActiveTVTab('miniled')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTVTab === 'miniled'
                  ? 'bg-emerald-600 text-white font-black shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent'
              }`}
            >
              Mini-LED & 120Hz/144Hz
            </button>
            <button
              onClick={() => setActiveTVTab('giant')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTVTab === 'giant'
                  ? 'bg-emerald-600 text-white font-black shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent'
              }`}
            >
              Dev Ekranlar (75&quot;-98&quot;)
            </button>
          </div>
        </div>

        {/* 8 TV Showcase Floating Glass Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {currentTVs.map((tv) => {
            const score100 = calculateTVScore(tv).totalScore;
            const inCompare = isInCompare(tv.id);

            const nameInchMatch = tv.name.match(/\b(\d+(?:\.\d+)?)"/);
            const inchVal = nameInchMatch ? parseFloat(nameInchMatch[1]) : tv.specs?.screenSizeInches || 55;
            const preciseInch =
              inchVal === 98 ? '97.5"' :
              inchVal === 85 ? '84.6"' :
              inchVal === 75 ? '74.5"' :
              inchVal === 77 ? '76.77"' :
              inchVal === 65 ? '64.5"' :
              inchVal === 55 ? '54.6"' :
              inchVal === 50 ? '49.5"' :
              inchVal === 43 ? '42.5"' : `${inchVal}"`;

            const nameUpper = tv.name.toUpperCase();
            let techName = tv.specs?.displayTech || 'LED';
            if (nameUpper.includes('QD-MINI LED') || nameUpper.includes('QD-MINILED') || nameUpper.includes('QD MINI LED')) {
              techName = 'QD-Mini LED';
            } else if (nameUpper.includes('MINI-LED') || nameUpper.includes('MINI LED') || nameUpper.includes('NEO QLED')) {
              techName = 'Mini-LED';
            } else if (nameUpper.includes('QD-OLED')) {
              techName = 'QD-OLED';
            } else if (nameUpper.includes('OLED+')) {
              techName = 'OLED+';
            } else if (nameUpper.includes('OLED EX')) {
              techName = 'OLED EX';
            } else if (nameUpper.includes('OLED EVO')) {
              techName = 'OLED evo';
            } else if (nameUpper.includes('OLED')) {
              techName = 'OLED';
            } else if (nameUpper.includes('QLED')) {
              techName = 'QLED';
            }

            return (
              <div
                key={tv.id}
                className="bg-white backdrop-blur-md border border-slate-200 hover:border-emerald-500/50 hover:-translate-y-1 transition-all duration-300 shadow-md rounded-2xl p-4 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Subtle Card Glow Highlight Line */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/0 to-transparent group-hover:via-emerald-500 transition-all duration-500" />

                <div>
                  {/* Image Stage */}
                  <div className="w-full h-44 sm:h-48 bg-slate-50 rounded-xl p-3 sm:p-4 flex items-center justify-center border border-slate-100 relative mb-3 overflow-hidden group-hover:border-slate-200 transition-colors">
                    <img
                      src={tv.image}
                      alt={tv.name}
                      className="max-h-full max-w-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-xs"
                    />

                    <span className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      {techName} • {preciseInch}
                    </span>

                    {/* Circular Score Badge Overlay */}
                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md border border-amber-300/60 rounded-xl p-1 shadow-md flex items-center gap-1 z-10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex flex-col items-center justify-center font-black leading-none shadow-md">
                        <span className="text-[11px] font-black">{score100}</span>
                        <span className="text-[6px] uppercase font-bold tracking-tighter opacity-95">puan</span>
                      </div>
                    </div>
                  </div>

                  {/* Brand & Rating */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-extrabold text-emerald-700 uppercase tracking-widest">{tv.brand} • {tv.releaseYear}</span>
                    <div className="bg-amber-50 text-amber-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1 shadow-2xs">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>{score100} / 100</span>
                    </div>
                  </div>

                  <Link href={`/tvs/${tv.slug}`}>
                    <h3 className="text-sm font-black text-slate-900 hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      {tv.name}
                    </h3>
                  </Link>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 pt-2">
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-bold px-2 py-0.5 rounded">
                      {tv.specs?.refreshRateHz || 60}Hz
                    </span>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[9px] font-bold px-2 py-0.5 rounded">
                      {tv.specs?.resolution || '4K'}
                    </span>
                    {tv.highlights[0] && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold px-2 py-0.5 rounded truncate max-w-[120px]">
                        {tv.highlights[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom Price & Compare Row */}
                <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Başlangıç Fiyatı</span>
                    <span className="text-emerald-700 font-black text-sm tabular-nums">
                      {tv.basePrice.toLocaleString()} ₺
                    </span>
                  </div>

                  <button
                    onClick={() => (inCompare ? removeFromCompare(tv.id) : addToCompare(tv))}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                      inCompare
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-800 border border-slate-200'
                    }`}
                  >
                    {inCompare ? 'Eklendi' : '+ Kıyasla'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center pt-2 relative z-10">
          <Link
            href="/tvs"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
          >
            <span>Tüm Televizyon Kataloğunu İncele ({allTVs.length > 0 ? allTVs.length.toLocaleString('tr-TR') : '120+'} Ürün)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 1. SECTION: Compact Discounted Products Grid (16 Items: 4 Columns x 4 Rows) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <h2 className="text-slate-900 text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <span>Günün İndirimli Ürün Fırsatları</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">8 perakende mağazasında son 24 saatte fiyatı düşen popüler modeller</p>
          </div>

          <Link
            href="/phones?sortBy=popular"
            className="text-xs font-black text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1 uppercase tracking-wider bg-rose-50 px-3.5 py-2 rounded-xl border border-rose-200 shadow-2xs cursor-pointer"
          >
            <span>TÜM İNDİRİMLER</span>
            <ChevronRight className="w-4 h-4 text-rose-600 stroke-[3]" />
          </Link>
        </div>

        {/* 4-Column Compact Grid (16 Items) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {mixedDiscountGrid.map((product, idx) => (
            <CompactProductCard
              key={product.id}
              product={product}
              index={idx}
              badgeType={idx % 3 === 0 ? 'discount' : idx % 3 === 1 ? 'featured' : 'new'}
              customBadgeText={idx % 3 === 0 ? `%${10 + (idx % 5) * 3} İNDİRİM` : idx % 3 === 1 ? '⭐ 100 PUAN' : '🔥 ÇOK SATAN'}
            />
          ))}
        </div>

        {/* Bottom Link to Full Catalog */}
        <div className="text-center pt-2">
          <Link
            href="/phones"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs px-8 py-3.5 rounded-full border border-slate-200 shadow-xs transition-all hover:border-emerald-500 cursor-pointer"
          >
            <span>Tüm Fırsat Kataloğunu İncele ({mixedDiscountGrid.length} Ürün)</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </Link>
        </div>
      </section>

      {/* 2. SECTION: Category Lifestyle Banner Grid (4 Columns Quad) */}
      <CategoryBannerGrid
        sectionTitle="Öne Çıkan Yaşam Tarzı & Kategori Koleksiyonları"
        items={CATEGORY_BANNERS_ROW1}
        variant="quad"
      />

      {/* 3. SECTION: Large Campaign Banners (2 Wide Columns) */}
      <CategoryBannerGrid
        sectionTitle="Özel Kampanyalar & Şeffaf Analiz Kılavuzları"
        items={WIDE_PROMO_BANNERS}
        variant="wide"
      />

      {/* 4. SECTION: Second Category Banner Row (4 Columns Quad) */}
      <CategoryBannerGrid
        sectionTitle="Donanım & Ekipman Kategorileri"
        items={CATEGORY_BANNERS_ROW2}
        variant="quad"
      />

      {/* 5. SECTION: "Çok Satanlar" Product Carousel (20 Items) */}
      <ProductCarousel
        title="En Çok Satanlar & İlgi Görenler"
        subtitle="Hepsiburada, Trendyol ve Vatan verilerine göre haftanın popüler modelleri"
        products={bestSellerCarouselList}
      />

      {/* Popular Duels / Comparisons Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 text-2xl font-black flex items-center gap-2">
              <Scale className="w-6 h-6 text-emerald-600" />
              <span>{t.popularComparisons}</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">En çok merak edilen amiral gemisi düelloları</p>
          </div>

          <Link href="/compare" className="text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-1">
            <span>Tüm Düelloları Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {popularComparisons.map((duel, idx) => {
            const p1 = allPhones.find((p) => p.id === duel.phone1Id || p.slug === duel.phone1Id);
            const p2 = allPhones.find((p) => p.id === duel.phone2Id || p.slug === duel.phone2Id);
            const duelTitle = p1 && p2 ? `${p1.brand} ${p1.name.split(' ')[1]} vs ${p2.brand} ${p2.name.split(' ')[1]}` : `Karşılaştırma Düellosu #${idx + 1}`;
            const duelDesc = `${(duel.viewCount || 10000).toLocaleString()} Canlı İnceleme`;

            return (
              <Link
                key={idx}
                href={`/compare?phone1=${duel.phone1Id}&phone2=${duel.phone2Id}`}
                className="group bg-white border border-slate-200 hover:border-emerald-400 rounded-3xl p-5 transition-all flex items-center justify-between gap-4 shadow-xs hover:shadow-md"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                    Düello #{idx + 1}
                  </span>
                  <h3 className="text-slate-900 text-sm font-black group-hover:text-emerald-600 transition-colors">
                    {duelTitle}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{duelDesc}</p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors shadow-xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. SECTION: Bottom Category Icon Shortcut Strip */}
      <CategoryIconStrip />

      {/* Top Brands Logo Bar */}
      <section className="pt-6 border-t border-slate-200">
        <BrandLogoBar />
      </section>

    </div>
  );
}
