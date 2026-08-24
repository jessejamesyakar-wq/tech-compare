'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';
import { getDynamicCategoryDistributionProducts, DynamicCategoryDistribution } from '@/lib/data';
import { useCompare } from '@/context/CompareContext';
import {
  Sparkles,
  Zap,
  Scale,
  Check,
  Star,
  ShoppingBag,
  ArrowRight,
  Smartphone as PhoneIcon,
  Tv as TvIcon,
  Headphones as HeadphoneIcon,
  Watch,
  Tablet as TabletIcon,
  Flame,
  Award,
  Layers
} from 'lucide-react';

const CATEGORY_CONFIG: Record<
  string,
  { label: string; shortLabel: string; ratio: string; color: string; badgeBg: string; icon: React.ComponentType<{ className?: string }> }
> = {
  smartphones: {
    label: 'Akıllı Telefonlar',
    shortLabel: 'Telefon',
    ratio: '%40',
    color: 'text-blue-600 border-blue-200 bg-blue-50',
    badgeBg: 'bg-blue-600 text-white',
    icon: PhoneIcon
  },
  tvs: {
    label: 'Televizyonlar',
    shortLabel: 'TV',
    ratio: '%20',
    color: 'text-purple-600 border-purple-200 bg-purple-50',
    badgeBg: 'bg-purple-600 text-white',
    icon: TvIcon
  },
  appliances: {
    label: 'Ev ve Yaşam Teknolojileri',
    shortLabel: 'Ev & Yaşam',
    ratio: '%10',
    color: 'text-amber-600 border-amber-200 bg-amber-50',
    badgeBg: 'bg-amber-600 text-white',
    icon: Zap
  },
  tablets: {
    label: 'Tabletler',
    shortLabel: 'Tablet',
    ratio: '%10',
    color: 'text-emerald-600 border-emerald-200 bg-emerald-50',
    badgeBg: 'bg-emerald-600 text-white',
    icon: TabletIcon
  },
  smartwatches: {
    label: 'Akıllı Saatler',
    shortLabel: 'Saat',
    ratio: '%10',
    color: 'text-rose-600 border-rose-200 bg-rose-50',
    badgeBg: 'bg-rose-600 text-white',
    icon: Watch
  },
  headphones: {
    label: 'Ses & Kulaklık',
    shortLabel: 'Kulaklık',
    ratio: '%10',
    color: 'text-teal-600 border-teal-200 bg-teal-50',
    badgeBg: 'bg-teal-600 text-white',
    icon: HeadphoneIcon
  }
};

export function DynamicCategoryShowcase() {
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [distributionData, setDistributionData] = useState<DynamicCategoryDistribution | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const res = await getDynamicCategoryDistributionProducts(20);
        setDistributionData(res);
      } catch (e) {
        console.error('Failed to load dynamic distribution showcase:', e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  if (isLoading || !distributionData) {
    return (
      <section className="space-y-6 pt-4">
        <div className="h-10 bg-slate-100 animate-pulse rounded-2xl w-72" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-96 bg-slate-50 border border-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </section>
    );
  }

  const displayedItems =
    activeFilter === 'all'
      ? distributionData.items
      : distributionData.items.filter((p) => p.category === activeFilter);

  const getProductHref = (p: Product) => {
    switch (p.category) {
      case 'tvs': return `/tvs/${p.slug}`;
      case 'appliances': return `/appliances/${p.slug}`;
      case 'tablets': return `/tablets/${p.slug}`;
      case 'smartwatches': return `/smartwatches/${p.slug}`;
      case 'headphones': return `/headphones/${p.slug}`;
      case 'laptops': return `/laptops/${p.slug}`;
      case 'consoles': return `/consoles/${p.slug}`;
      default: return `/phones/${p.slug}`;
    }
  };

  return (
    <section className="space-y-6 pt-4 pb-2">
      {/* 1. Header with Category Shortcut Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-xs">
            <Layers className="w-3.5 h-3.5" />
            <span>ÖNE ÇIKAN KATEGORİLER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>Trend Ürünler Karma Vitrini</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
            Piyasadaki en popüler ve en çok tercih edilen akıllı telefon, televizyon, ev aletleri, tablet, akıllı saat ve kulaklık modelleri listelenmektedir.
          </p>
        </div>

        {/* Category Badges Matrix */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative z-10">
          {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => {
            const Icon = cfg.icon;
            const isSelected = activeFilter === catKey;

            return (
              <button
                key={catKey}
                onClick={() => setActiveFilter(activeFilter === catKey ? 'all' : catKey)}
                className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 min-w-[70px] ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white font-extrabold shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-bold whitespace-nowrap">{cfg.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Tabs Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap border ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>Tüm Kategoriler</span>
        </button>

        {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => {
          const Icon = cfg.icon;
          const isSelected = activeFilter === catKey;

          return (
            <button
              key={catKey}
              onClick={() => setActiveFilter(catKey)}
              className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap border ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-black scale-[1.02]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Products Grid (4 Columns) */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence>
          {displayedItems.map((product, idx) => {
            const inCompare = isInCompare(product.id);
            const cfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.smartphones;
            const CatIcon = cfg.icon;
            const score100 = Math.round((product.rating || 4.7) * 20);
            const href = getProductHref(product);

            const handleCompareClick = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              if (inCompare) {
                removeFromCompare(product.id);
              } else {
                addToCompare(product);
              }
            };

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: idx * 0.02 }}
                className="group relative bg-white border border-slate-200/90 hover:border-emerald-500/60 rounded-2xl p-3.5 sm:p-4 transition-all duration-200 shadow-2xs hover:shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* Top Floating Badges */}
                <div className="flex items-center justify-between gap-1.5 mb-2 relative z-10">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${cfg.color}`}>
                    <CatIcon className="w-3 h-3" />
                    <span>{cfg.shortLabel}</span>
                  </span>

                  <button
                    onClick={handleCompareClick}
                    className={`p-1.5 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      inCompare
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs font-extrabold'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                    title="Kıyaslama Listesine Ekle"
                  >
                    {inCompare ? <Check className="w-3 h-3 stroke-[3]" /> : <Scale className="w-3 h-3" />}
                    <span className="text-[9px]">{inCompare ? 'Listede' : 'Kıyasla'}</span>
                  </button>
                </div>

                <div>
                  {/* Product Image Stage */}
                  <Link href={href} className="block relative my-2">
                    <div className="w-full h-44 sm:h-48 rounded-xl bg-slate-50 border border-slate-100 p-3 sm:p-4 flex items-center justify-center overflow-hidden relative group-hover:bg-slate-100/80 transition-all">
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'}
                        alt={product.name}
                        loading="lazy"
                        className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                      />

                      <span className="absolute bottom-2 left-2 bg-slate-900/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>{score100} / 100</span>
                      </span>

                      {product.isPopular && (
                        <span className="absolute top-2 right-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-2xs">
                          <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                          <span>Trend</span>
                        </span>
                      )}
                    </div>
                  </Link>

                  {/* Brand & Name */}
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold">
                      <span className="uppercase tracking-wider text-slate-400 font-black">{product.brand}</span>
                      <div className="flex items-center gap-1 text-amber-500 font-black">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                        <span className="text-slate-400 text-[10px] font-medium">({product.reviewCount})</span>
                      </div>
                    </div>

                    <Link href={href} className="block group-hover:text-emerald-600 transition-colors">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                </div>

                {/* Bottom: Price & 8-Store Tracking Badge */}
                <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block">Başlangıç Fiyatı</span>
                      <span className="text-base sm:text-lg font-black text-emerald-600">
                        {product.basePrice > 0 ? `${product.basePrice.toLocaleString('tr-TR')} ${product.currency || 'TL'}` : 'Fiyat Güncelleniyor'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="bg-slate-100 text-slate-700 text-[9px] font-extrabold px-2 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3 text-emerald-600" />
                        <span>8 Mağaza</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Link Button */}
                  <Link
                    href={href}
                    className="w-full bg-slate-50 hover:bg-emerald-600 text-slate-700 hover:text-white text-[11px] font-black py-2 rounded-xl border border-slate-200 hover:border-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-2xs group/btn cursor-pointer"
                  >
                    <span>Fiyatları ve Detayları Gör</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* 4. Footer CTA link to full compare page */}
      <div className="text-center pt-3 pb-2">
        <Link
          href="/compare"
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-black text-xs px-8 py-4 rounded-full border border-slate-200 shadow-xs transition-all hover:border-emerald-400 cursor-pointer"
        >
          <span>Tüm Kategoriler Arasında Serbest Kıyaslama Yap</span>
          <ArrowRight className="w-4 h-4 text-emerald-600" />
        </Link>
      </div>
    </section>
  );
}