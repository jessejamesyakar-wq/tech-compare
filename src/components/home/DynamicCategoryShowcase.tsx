'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { useI18n } from '@/lib/i18n/context';
import { TiltCard } from '@/components/ui/TiltCard';
import {
  Sparkles,
  Zap,
  Scale,
  Check,
  Star,
  ArrowRight,
  Smartphone as PhoneIcon,
  Tv as TvIcon,
  Headphones as HeadphoneIcon,
  Watch,
  Tablet as TabletIcon,
  Laptop as LaptopIcon,
  Gamepad2,
  Monitor as MonitorIcon,
  Flame,
  Award,
  Layers,
  Store
} from 'lucide-react';

const CATEGORY_CONFIG: Record<
  string,
  {
    label: string;
    shortLabel: string;
    emoji: string;
    badgeStyle: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  smartphones: {
    label: 'Akıllı Telefonlar',
    shortLabel: 'Telefon',
    emoji: '📱',
    badgeStyle: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: PhoneIcon
  },
  laptops: {
    label: 'Laptop & Bilgisayar',
    shortLabel: 'Laptop',
    emoji: '💻',
    badgeStyle: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: LaptopIcon
  },
  tvs: {
    label: 'Televizyonlar',
    shortLabel: 'TV',
    emoji: '📺',
    badgeStyle: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: TvIcon
  },
  appliances: {
    label: 'Ev ve Yaşam',
    shortLabel: 'Ev Aleti',
    emoji: '⚡',
    badgeStyle: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Zap
  },
  consoles: {
    label: 'Oyun Konsolları',
    shortLabel: 'Konsol',
    emoji: '🎮',
    badgeStyle: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    icon: Gamepad2
  },
  headphones: {
    label: 'Ses & Kulaklık',
    shortLabel: 'Kulaklık',
    emoji: '🎧',
    badgeStyle: 'bg-teal-50 text-teal-700 border-teal-200',
    icon: HeadphoneIcon
  },
  smartwatches: {
    label: 'Akıllı Saatler',
    shortLabel: 'Saat',
    emoji: '⌚',
    badgeStyle: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: Watch
  },
  tablets: {
    label: 'Tabletler',
    shortLabel: 'Tablet',
    emoji: '📱',
    badgeStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: TabletIcon
  },
  monitors: {
    label: 'Monitörler',
    shortLabel: 'Monitör',
    emoji: '🖥️',
    badgeStyle: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: MonitorIcon
  }
};

const DYNAMIC_BADGES = [
  { text: '🔥 Trend #1', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { text: '⭐ Editörün Seçimi', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  { text: '🏆 En Yüksek Puan', style: 'bg-purple-50 text-purple-700 border-purple-200' },
  { text: '⚡ Fırsat Fiyat', style: 'bg-rose-50 text-rose-700 border-rose-200' },
  { text: '✨ Çok Satan', style: 'bg-blue-50 text-blue-700 border-blue-200' }
];

export interface DynamicCategoryDistribution {
  total: number;
  items: Product[];
  categoryBreakdown: Record<string, { count: number; ratio: number; items: Product[] }>;
}

export function DynamicCategoryShowcase({ initialData }: { initialData?: DynamicCategoryDistribution }) {
  const { t } = useI18n();
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();
  const [distributionData, setDistributionData] = useState<DynamicCategoryDistribution | null>(initialData || null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(!initialData);

  useEffect(() => {
    if (initialData) {
      setDistributionData(initialData);
      setIsLoading(false);
    }
  }, [initialData]);

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
    const slug = p.slug || p.id;
    switch (p.category) {
      case 'tvs': return `/tvs/${slug}`;
      case 'appliances': return `/appliances/${slug}`;
      case 'tablets': return `/tablets/${slug}`;
      case 'smartwatches': return `/smartwatches/${slug}`;
      case 'headphones': return `/headphones/${slug}`;
      case 'laptops': return `/laptops/${slug}`;
      case 'consoles': return `/consoles/${slug}`;
      case 'monitors': return `/monitors/${slug}`;
      default: return `/phones/${slug}`;
    }
  };

  const getSpecSummary = (p: Product) => {
    const specs = (p.specs || {}) as Record<string, any>;
    if (p.category === 'smartphones') {
      const screen = specs.screen?.size ? `${specs.screen.size}"` : '';
      const chip = specs.processor?.chip ? String(specs.processor.chip).split(' ')[0] : '';
      const cam = specs.camera?.mainMp ? `${String(specs.camera.mainMp).split(' ')[0]} MP` : '';
      return [screen, chip, cam].filter(Boolean).join(' • ') || (p.highlights?.[0] || '');
    } else if (p.category === 'laptops') {
      const cpu = specs.processor ? String(specs.processor).split(' ')[0] : '';
      const ram = specs.ramGb ? `${specs.ramGb}GB RAM` : '';
      const gpu = specs.gpu ? String(specs.gpu).split(' ')[0] : '';
      return [cpu, ram, gpu].filter(Boolean).join(' • ') || (p.highlights?.[0] || '');
    } else if (p.category === 'tvs') {
      const size = specs.screenSizeInches ? `${specs.screenSizeInches}"` : '';
      const tech = specs.displayTech || '';
      const hz = specs.refreshRateHz ? `${specs.refreshRateHz}Hz` : '';
      return [size, tech, hz].filter(Boolean).join(' • ') || (p.highlights?.[0] || '');
    } else if (p.category === 'appliances') {
      const suction = specs.suctionPowerPa ? `${Number(specs.suctionPowerPa).toLocaleString()} Pa` : '';
      const power = specs.powerWatts ? `${specs.powerWatts}W` : '';
      return [suction, power].filter(Boolean).join(' • ') || (p.highlights?.[0] || '');
    } else if (p.category === 'consoles') {
      const res = specs.resolution || '4K 120 FPS';
      const storage = specs.storage || '1 TB SSD';
      return [res, storage].join(' • ');
    } else if (p.category === 'headphones') {
      const anc = specs.anc && specs.anc !== 'Yok' ? 'ANC' : '';
      const bat = specs.batteryLife ? `${specs.batteryLife}` : '';
      return [anc, bat].filter(Boolean).join(' • ') || (p.highlights?.[0] || '');
    } else if (p.category === 'smartwatches') {
      const size = specs.caseSize || '';
      const gps = specs.gps ? 'GPS' : '';
      return [size, gps].filter(Boolean).join(' • ') || (p.highlights?.[0] || '');
    }
    return p.highlights?.[0] || '';
  };

  return (
    <section className="space-y-6 pt-4 pb-2">
      {/* 1. Header with Glassmorphism Ambient Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900/85 via-slate-800/80 to-emerald-950/85 backdrop-blur-xl border border-emerald-500/25 p-6 sm:p-8 text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Soft Ambient Glows */}
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[10.5px] font-black px-3 py-1 rounded-full border border-emerald-500/30 backdrop-blur-xs uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5" />
            <span>9 KATEGORİ HARMANI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <span>Trend Ürünler Karma Vitrini</span>
          </h2>
          <p className="text-xs text-slate-300 font-medium max-w-xl leading-relaxed">
            Piyasadaki en popüler ve en çok tercih edilen akıllı telefon, laptop, televizyon, ev aletleri, tablet, kulaklık ve konsol modelleri canlı takipte.
          </p>
        </div>

        {/* Category Badges Matrix */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative z-10">
          <button
            onClick={() => setActiveFilter('all')}
            className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-w-[70px] ${
              activeFilter === 'all'
                ? 'bg-white text-slate-900 border-white font-black shadow-lg scale-105'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
            }`}
          >
            <span className="text-base">✨</span>
            <span className="text-[11px] font-bold whitespace-nowrap">Tümü</span>
          </button>

          {Object.entries(CATEGORY_CONFIG).slice(0, 5).map(([catKey, cfg]) => {
            const isSelected = activeFilter === catKey;
            return (
              <button
                key={catKey}
                onClick={() => setActiveFilter(activeFilter === catKey ? 'all' : catKey)}
                className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 min-w-[70px] ${
                  isSelected
                    ? 'bg-white text-slate-900 border-white font-black shadow-lg scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                }`}
              >
                <span className="text-base">{cfg.emoji}</span>
                <span className="text-[11px] font-bold whitespace-nowrap">{cfg.shortLabel}</span>
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
          <span>Tüm Kategoriler ({distributionData.items.length})</span>
        </button>

        {Object.entries(CATEGORY_CONFIG).map(([catKey, cfg]) => {
          const Icon = cfg.icon;
          const isSelected = activeFilter === catKey;
          const count = distributionData.items.filter((p) => p.category === catKey).length;

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
              <span>{cfg.label} {count > 0 && `(${count})`}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Products Grid (Apple/Stripe 3D Tilt Cards) */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <AnimatePresence>
          {displayedItems.map((product, idx) => {
            const inCompare = isInCompare(product.id);
            const cfg = CATEGORY_CONFIG[product.category] || CATEGORY_CONFIG.smartphones;
            const badge = DYNAMIC_BADGES[idx % DYNAMIC_BADGES.length];
            const href = getProductHref(product);
            const offers = product.storeOffers || [];
            const offerCount = offers.length > 0 ? offers.length : 3;
            const prices = offers.map((o) => o.price).filter((p) => p > 0);
            const minPrice = prices.length > 0 ? Math.min(...prices) : product.basePrice;
            const specSub = getSpecSummary(product);

            return (
              <TiltCard
                key={product.id}
                className="group bg-white border border-slate-200/90 hover:border-emerald-500/50 rounded-3xl p-4.5 transition-all duration-300 shadow-xs hover:shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Category Badge & Dynamic Badge */}
                  <div className="flex items-center justify-between gap-1.5 mb-2.5">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badgeStyle}`}>
                      <span>{cfg.emoji}</span>
                      <span>{cfg.shortLabel}</span>
                    </span>

                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${badge.style}`}>
                      {badge.text}
                    </span>
                  </div>

                  {/* Product Image Box */}
                  <Link href={href} className="block relative mb-2.5">
                    <div className="w-full h-44 bg-slate-50/90 rounded-2xl p-3.5 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-slate-100/60 transition-colors">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={200}
                        height={176}
                        loading="lazy"
                        className="max-h-full max-w-full w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300 ease-out drop-shadow-xs"
                      />
                    </div>
                  </Link>

                  {/* Product Brand & Title */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {product.brand}
                    </span>

                    <Link href={href} className="block">
                      <h4 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {product.name}
                      </h4>
                    </Link>

                    {specSub && (
                      <p className="text-[10.5px] text-slate-500 font-medium line-clamp-1 pt-0.5">
                        {specSub}
                      </p>
                    )}
                  </div>
                </div>

                {/* Seller & Price Comparison Info */}
                <div className="mt-3 pt-2.5 border-t border-slate-100/90 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                        En İyi Fiyat
                      </span>
                      <div className="text-base sm:text-lg font-black text-slate-900 tracking-tight tabular-nums">
                        ₺{minPrice.toLocaleString()}
                      </div>
                    </div>

                    <span className="text-emerald-700 font-bold lowercase flex items-center gap-1 text-[10px] sm:text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <Store className="w-3 h-3" />
                      {offerCount} satıcı
                    </span>
                  </div>

                  {/* Compare Prices Link */}
                  <div className="flex items-center gap-2 pt-0.5">
                    <Link
                      href={href}
                      className="flex-1 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <span>İncele</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>

                    <button
                      onClick={() => (inCompare ? removeFromCompare(product.id) : addToCompare(product))}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                        inCompare
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                      title="Kıyasla"
                    >
                      {inCompare ? <Check className="w-4 h-4 stroke-[3]" /> : <Scale className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </TiltCard>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export default DynamicCategoryShowcase;