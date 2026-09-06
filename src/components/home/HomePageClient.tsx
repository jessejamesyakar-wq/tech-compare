'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Smartphone, TVProduct } from '@/lib/types';
import { calculateTVScore } from '@/lib/tvScoring';
import { HeroCarousel, HeroSlideItem } from '@/components/promo/HeroCarousel';
import { HeroThumbnailStrip } from '@/components/promo/HeroThumbnailStrip';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { ProductImage } from '@/components/ui/ProductImage';
import { CategoryBannerGrid } from '@/components/promo/CategoryBannerGrid';
import { ProductCarousel } from '@/components/catalog/ProductCarousel';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import { DynamicCategoryShowcase, DynamicCategoryDistribution } from '@/components/home/DynamicCategoryShowcase';
import { LiveDealsBillboard } from '@/components/ads/LiveDealsBillboard';
import {
  Scale,
  ArrowRight,
  Sparkles,
  Award,
  ChevronRight,
  Tv
} from 'lucide-react';

interface HomePageClientProps {
  heroSlides: HeroSlideItem[];
  allTVsList: TVProduct[];
  mixedDiscountGrid: (Smartphone | TVProduct)[];
  bestSellerCarouselList: (Smartphone | TVProduct)[];
  popularComparisons: Array<{
    phone1Id: string;
    phone2Id: string;
    phone1Name: string;
    phone2Name: string;
    viewCount: number;
  }>;
  showcaseData: DynamicCategoryDistribution;
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
  heroSlides,
  allTVsList,
  mixedDiscountGrid,
  bestSellerCarouselList,
  popularComparisons,
  showcaseData,
  counts
}: HomePageClientProps) {
  const { t } = useI18n();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [activeTVTab, setActiveTVTab] = useState<string>('oled');
  const [heroIndex, setHeroIndex] = useState<number>(0);

  const heroThumbnails = heroSlides.map((slide) => ({
    id: slide.id,
    name: slide.productName,
    price: slide.price,
    image: slide.image
  }));

  const getFilteredTVs = () => {
    let list = [...allTVsList];

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

  const currentTVs = getFilteredTVs();

  const CATEGORY_BANNERS_ROW1 = [
    {
      id: 'cat-1',
      title: 'Akıllı Telefonlar',
      subtitle: 'ZİRVE VERİMLİLİK',
      badge: `📱 ${counts.smartphones}+ MODEL`,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
      href: '/phones'
    },
    {
      id: 'cat-2',
      title: 'Bilgisayar & Laptop',
      subtitle: 'YAPAY ZEKÂ İŞLEMCİLER',
      badge: `💻 ${counts.laptops} MODEL`,
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80',
      href: '/laptops'
    },
    {
      id: 'cat-3',
      title: 'Televizyonlar',
      subtitle: 'DEV EKRAN SİNEMA',
      badge: `📺 ${counts.tvs} MODEL`,
      image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
      href: '/tvs'
    },
    {
      id: 'cat-4',
      title: 'Tabletler',
      subtitle: 'MOBİL ÜRETKENLİK',
      badge: `📱 ${counts.tablets} MODEL`,
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

  return (
    <div className="space-y-8 py-2">
      {/* 2. Hero Banner & Interactive Showcase Slider */}
      <HeroCarousel activeIndex={heroIndex} onSelect={setHeroIndex} initialSlides={heroSlides} />

      {/* 3. Sub-Hero Horizontal Thumbnail Strip */}
      <HeroThumbnailStrip items={heroThumbnails} activeIndex={heroIndex} onSelect={setHeroIndex} />

      {/* 🏢 3D Köşe Billboard & Pengi Maskotu */}
      <LiveDealsBillboard />

      {/* 5. Dynamic Category Distribution Showcase */}
      <DynamicCategoryShowcase initialData={showcaseData} />

      {/* 📺 Top Rated TVs Showcase */}
      <section className="space-y-8 bg-gradient-to-br from-white via-emerald-50/30 to-white text-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

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
              Panel teknolojisi, yenileme hızı, ses sistemi ve işlemci gücüne göre 100 puan üzerinden sıralı modeller.
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
              Tüm Modeller
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
              Mini-LED & 144Hz
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
            const preciseInch = `${inchVal}"`;

            let techName = tv.specs?.displayTech || 'LED';

            return (
              <div
                key={tv.id}
                className="bg-white backdrop-blur-md border border-slate-200 hover:border-emerald-500/60 hover:-translate-y-1.5 transition-all duration-300 shadow-md hover:shadow-2xl rounded-3xl p-5 flex flex-col justify-between group relative overflow-hidden"
              >
                <div>
                  {/* Image Stage */}
                  <div className="w-full h-44 sm:h-48 bg-slate-50 rounded-xl p-3 sm:p-4 flex items-center justify-center border border-slate-100 relative mb-3 overflow-hidden group-hover:border-slate-200 transition-colors">
                    <ProductImage
                      src={tv.image}
                      alt={tv.name}
                      variant="card"
                    />

                    <span className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                      {techName} • {preciseInch}
                    </span>

                    <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md border border-amber-300/60 rounded-xl p-1 shadow-md flex items-center gap-1 z-10">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex flex-col items-center justify-center font-black leading-none shadow-md">
                        <span className="text-[11px] font-black">{score100}</span>
                        <span className="text-[6px] uppercase font-bold tracking-tighter opacity-95">puan</span>
                      </div>
                    </div>
                  </div>

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
                </div>

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
            <span>Tüm Televizyon Kataloğunu İncele ({counts.tvs} Ürün)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 1. SECTION: Compact Discounted Products Grid (16 Items) */}
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

        <div className="text-center pt-2">
          <Link
            href="/phones"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-extrabold text-xs px-8 py-3.5 rounded-full border border-slate-200 shadow-xs transition-all hover:border-emerald-500 cursor-pointer"
          >
            <span>Tüm Telefon Kataloğunu İncele ({counts.smartphones} Model)</span>
            <ArrowRight className="w-4 h-4 text-emerald-600" />
          </Link>
        </div>
      </section>

      {/* Category Banners */}
      <CategoryBannerGrid
        sectionTitle="Öne Çıkan Yaşam Tarzı & Kategori Koleksiyonları"
        items={CATEGORY_BANNERS_ROW1}
        variant="quad"
      />

      <CategoryBannerGrid
        sectionTitle="Özel Kampanyalar & Şeffaf Analiz Kılavuzları"
        items={WIDE_PROMO_BANNERS}
        variant="wide"
      />

      <CategoryBannerGrid
        sectionTitle="Donanım & Ekipman Kategorileri"
        items={CATEGORY_BANNERS_ROW2}
        variant="quad"
      />

      {/* "Çok Satanlar" Product Carousel */}
      <ProductCarousel
        title="En Çok Satanlar & İlgi Görenler"
        subtitle="Hepsiburada, Trendyol ve Vatan verilerine göre haftanın popüler modelleri"
        products={bestSellerCarouselList}
      />

      {/* Popular Comparisons Section */}
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
          {popularComparisons.map((duel, idx) => (
            <Link
              key={idx}
              href={`/compare?p1=${duel.phone1Id}&p2=${duel.phone2Id}`}
              className="group bg-white border border-slate-200 hover:border-emerald-500/60 rounded-3xl p-6 transition-all duration-300 flex items-center justify-between gap-4 shadow-md hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">
                  Düello #{idx + 1}
                </span>
                <h3 className="text-slate-900 text-sm font-black group-hover:text-emerald-600 transition-colors">
                  {duel.phone1Name} vs {duel.phone2Name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {duel.viewCount.toLocaleString()} Canlı İnceleme
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors shadow-xs">
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Shortcut Strip */}
      <CategoryIconStrip customCounts={counts} />
    </div>
  );
}
