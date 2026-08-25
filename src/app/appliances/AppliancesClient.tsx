'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ApplianceProduct } from '@/lib/types';
import { CompactProductCard } from '@/components/catalog/CompactProductCard';
import { CategoryBar } from '@/components/layout/CategoryBar';
import { CategoryIconStrip } from '@/components/layout/CategoryIconStrip';
import {
  Search,
  Sparkles,
  SlidersHorizontal,
  Check,
  ChevronDown,
  ChevronRight,
  Star,
  Tag,
  Zap,
  Wind,
  Layers,
  ArrowRight,
  Flame,
  ShieldCheck,
  Coffee,
  UtensilsCrossed,
  Scissors,
  Shirt,
  Fan,
  X,
  RotateCcw,
  Sparkle
} from 'lucide-react';

export interface MasterCategory {
  id: string;
  label: string;
  shortLabel: string;
  icon: any;
  description: string;
  badge: string;
  colorClass: {
    active: string;
    pill: string;
    border: string;
    text: string;
  };
}

export const MASTER_CATEGORIES: MasterCategory[] = [
  {
    id: 'all',
    label: 'Tüm Ev Teknolojileri',
    shortLabel: 'Tümü',
    icon: Sparkles,
    badge: '900 Model',
    description: 'Robot süpürgeler, küçük ev aletleri, mutfak teknolojileri, kişisel bakım ve iklimlendirme',
    colorClass: {
      active: 'bg-emerald-600 text-white border-emerald-600 shadow-md',
      pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      border: 'border-emerald-500',
      text: 'text-emerald-700'
    }
  },
  {
    id: 'cleaning',
    label: 'Süpürge & Temizlik',
    shortLabel: 'Süpürge & Hijyen',
    icon: Wind,
    badge: '492 Model',
    description: 'Robot süpürgeler, dikey şarjlı süpürgeler, halı yıkama ve buharlı temizlik',
    colorClass: {
      active: 'bg-sky-600 text-white border-sky-600 shadow-md',
      pill: 'bg-sky-50 text-sky-700 border-sky-200',
      border: 'border-sky-500',
      text: 'text-sky-700'
    }
  },
  {
    id: 'kitchen',
    label: 'Mutfak Aletleri',
    shortLabel: 'Mutfak & Kahve',
    icon: UtensilsCrossed,
    badge: '125 Model',
    description: 'Airfryer, kahve makineleri, çay makineleri, blender ve tost makineleri',
    colorClass: {
      active: 'bg-amber-600 text-white border-amber-600 shadow-md',
      pill: 'bg-amber-50 text-amber-700 border-amber-200',
      border: 'border-amber-500',
      text: 'text-amber-700'
    }
  },
  {
    id: 'climate',
    label: 'Isıtma & İklimlendirme',
    shortLabel: 'Klima & Hava',
    icon: Fan,
    badge: '70 Model',
    description: 'Inverter klimalar, hava temizleme cihazları, vantilatör ve nemlendiriciler',
    colorClass: {
      active: 'bg-teal-600 text-white border-teal-600 shadow-md',
      pill: 'bg-teal-50 text-teal-700 border-teal-200',
      border: 'border-teal-500',
      text: 'text-teal-700'
    }
  },
  {
    id: 'personal_care',
    label: 'Kişisel Bakım & Sağlık',
    shortLabel: 'Kişisel Bakım',
    icon: Scissors,
    badge: '119 Model',
    description: 'Tıraş makineleri, saç şekillendiriciler, IPL lazer epilasyon ve diş fırçaları',
    colorClass: {
      active: 'bg-rose-600 text-white border-rose-600 shadow-md',
      pill: 'bg-rose-50 text-rose-700 border-rose-200',
      border: 'border-rose-500',
      text: 'text-rose-700'
    }
  },
  {
    id: 'home_tools',
    label: 'Ütü & Ev Gereçleri',
    shortLabel: 'Ütü & Gereçler',
    icon: Shirt,
    badge: '94 Model',
    description: 'Buhar kazanlı ütüler, dikey düzleştiriciler, su sebilleri ve güç istasyonları',
    colorClass: {
      active: 'bg-violet-600 text-white border-violet-600 shadow-md',
      pill: 'bg-violet-50 text-violet-700 border-violet-200',
      border: 'border-violet-500',
      text: 'text-violet-700'
    }
  }
];

export const SUB_CATEGORIES_BY_MASTER: Record<string, { id: string; label: string }[]> = {
  all: [
    { id: 'all', label: 'Tüm Ürünler' },
    { id: 'robot_vacuum', label: 'Robot Süpürgeler' },
    { id: 'airfryer', label: 'Airfryer & Fritöz' },
    { id: 'coffee_machine', label: 'Kahve Makineleri' },
    { id: 'air_purifier', label: 'Hava Temizleyiciler' },
    { id: 'air_conditioner', label: 'Klimalar' },
    { id: 'personal_care', label: 'Tıraş & Bakım' },
    { id: 'iron', label: 'Buharlı Ütüler' }
  ],
  cleaning: [
    { id: 'all', label: 'Tüm Süpürge & Temizlik' },
    { id: 'robot_vacuum', label: 'Robot Süpürgeler' },
    { id: 'stick_vacuum', label: 'Dikey Şarjlı Süpürgeler' },
    { id: 'canister_vacuum', label: 'Toz Torbasız Süpürgeler' },
    { id: 'carpet_cleaner', label: 'Halı & Koltuk Yıkama' },
    { id: 'steam_cleaner', label: 'Buharlı Temizleyiciler' }
  ],
  kitchen: [
    { id: 'all', label: 'Tüm Mutfak Aletleri' },
    { id: 'airfryer', label: 'Airfryer & Sıcak Hava Fritözü' },
    { id: 'coffee_machine', label: 'Kahve & Espresso Makineleri' },
    { id: 'tea_maker', label: 'Çay Makineleri & Su Isıtıcı' },
    { id: 'blender', label: 'Blender & Mutfak Robotu' },
    { id: 'toaster', label: 'Tost Makineleri & Izgara' },
    { id: 'chopper', label: 'Rondo & Doğrayıcı' }
  ],
  climate: [
    { id: 'all', label: 'Tüm İklimlendirme' },
    { id: 'air_conditioner', label: 'Klimalar (Inverter)' },
    { id: 'air_purifier', label: 'Hava Temizleyiciler' },
    { id: 'fan', label: 'Vantilatörler' },
    { id: 'humidifier', label: 'Hava Nemlendiriciler' },
    { id: 'heater', label: 'Isıtıcılar' }
  ],
  personal_care: [
    { id: 'all', label: 'Tüm Kişisel Bakım' },
    { id: 'personal_care', label: 'Erkek Bakım & Tıraş' },
    { id: 'hair_styling', label: 'Saç Kurutma & Şekillendirici' },
    { id: 'hair_straightener', label: 'Düzleştirici & Maşa' },
    { id: 'electric_toothbrush', label: 'Elektrikli Diş Fırçası' },
    { id: 'ipl_epilator', label: 'IPL Lazer Epilasyon' },
    { id: 'cosmetics', label: 'Cilt & Vücut Bakımı' }
  ],
  home_tools: [
    { id: 'all', label: 'Tüm Ev Gereçleri' },
    { id: 'iron', label: 'Buhar Kazanlı & Dikey Ütü' },
    { id: 'water_dispenser', label: 'Su Sebilleri' },
    { id: 'power_station', label: 'Taşınabilir Güç İstasyonları' }
  ]
};

export const SPOTLIGHT_CARDS = [
  {
    id: 'robot_vacuum',
    masterCategory: 'cleaning',
    title: 'Robot Süpürgeler',
    subtitle: 'Lidar Lazer Navigasyon & Otomatik Boşaltma',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80',
    count: '210+ Model',
    tag: 'En Çok Tercih Edilen',
    accent: 'from-sky-900/90 to-slate-900/90'
  },
  {
    id: 'airfryer',
    masterCategory: 'kitchen',
    title: 'Airfryer & Sıcak Hava Fritözü',
    subtitle: 'Çift Hazneli, XXL Kapasite & %90 Az Yağ',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?auto=format&fit=crop&w=600&q=80',
    count: '45+ Model',
    tag: 'Mutfak Trendi',
    accent: 'from-amber-900/90 to-slate-900/90'
  },
  {
    id: 'coffee_machine',
    masterCategory: 'kitchen',
    title: 'Tam Otomatik Kahve & Espresso',
    subtitle: 'Entegre Öğütücülü & Süt Köpürtücülü Barista',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=600&q=80',
    count: '60+ Model',
    tag: 'Gurme Lezzet',
    accent: 'from-orange-950/90 to-slate-900/90'
  },
  {
    id: 'air_purifier',
    masterCategory: 'climate',
    title: 'Hava Temizleyici & Nemlendirici',
    subtitle: 'HEPA 13 Filtre, Akıllı Hava Kalitesi Sensörü',
    image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=600&q=80',
    count: '45+ Model',
    tag: 'Temiz Hava',
    accent: 'from-emerald-950/90 to-slate-900/90'
  },
  {
    id: 'air_conditioner',
    masterCategory: 'climate',
    title: 'Inverter Klimalar',
    subtitle: '9.000 - 24.000 BTU, Sessiz Mod & Enerji Tasarrufu',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
    count: '35+ Model',
    tag: '4 Mevsim Konfor',
    accent: 'from-teal-950/90 to-slate-900/90'
  },
  {
    id: 'personal_care',
    masterCategory: 'personal_care',
    title: 'Kişisel Bakım & Tıraş',
    subtitle: 'OneBlade, IPL Epilasyon & İyonik Saç Bakımı',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    count: '119+ Model',
    tag: 'Bakım & Sağlık',
    accent: 'from-rose-950/90 to-slate-900/90'
  }
];

const ITEMS_PER_PAGE = 24;

export default function AppliancesClient({
  initialAppliances,
  initialProducts
}: {
  initialAppliances?: ApplianceProduct[];
  initialProducts?: ApplianceProduct[];
}) {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');
  const subCategoryParam = searchParams.get('subCategory') || searchParams.get('subcategory') || searchParams.get('category');

  const [products] = useState<ApplianceProduct[]>(initialAppliances || initialProducts || []);
  const [selectedMaster, setSelectedMaster] = useState<string>('all');
  const [selectedSubCat, setSelectedSubCat] = useState<string>('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(150000);
  const [sortBy, setSortBy] = useState<string>('popular');
  const [visibleCount, setVisibleCount] = useState<number>(ITEMS_PER_PAGE);

  const catalogRef = useRef<HTMLDivElement>(null);

  // Sync URL query params on initial load
  useEffect(() => {
    if (brandParam) {
      setSelectedBrands([brandParam]);
    }
    if (subCategoryParam) {
      const targetSub = subCategoryParam.toLowerCase();
      let matchedMaster = 'all';
      for (const [mId, subList] of Object.entries(SUB_CATEGORIES_BY_MASTER)) {
        if (subList.some(s => s.id === targetSub)) {
          matchedMaster = mId;
          break;
        }
      }
      setSelectedMaster(matchedMaster);
      setSelectedSubCat(targetSub);
    }
  }, [brandParam, subCategoryParam]);

  // Master Category Switcher Handler
  const handleMasterSelect = (masterId: string) => {
    setSelectedMaster(masterId);
    setSelectedSubCat('all');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  // Subcategory Switcher Handler
  const handleSubCatSelect = (subCatId: string) => {
    setSelectedSubCat(subCatId);
    setVisibleCount(ITEMS_PER_PAGE);
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Spotlight click handler
  const handleSpotlightClick = (card: typeof SPOTLIGHT_CARDS[0]) => {
    setSelectedMaster(card.masterCategory);
    setSelectedSubCat(card.id);
    setVisibleCount(ITEMS_PER_PAGE);
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Clear all filters
  const resetFilters = () => {
    setSelectedMaster('all');
    setSelectedSubCat('all');
    setSelectedBrands([]);
    setSearchQuery('');
    setPriceRange(150000);
    setSortBy('popular');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  // All distinct brands with counts
  const brandListWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      if (p.brand) {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([brand, count]) => ({ brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const toggleBrand = (brand: string) => {
    setVisibleCount(ITEMS_PER_PAGE);
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Current Subcategories for active master
  const currentSubCats = useMemo(() => {
    return SUB_CATEGORIES_BY_MASTER[selectedMaster] || SUB_CATEGORIES_BY_MASTER.all;
  }, [selectedMaster]);

  // Master category counts
  const masterCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    products.forEach((p) => {
      const mId = p.specs?.masterCategory || 'other';
      counts[mId] = (counts[mId] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered and Sorted Products
  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Master Category Filter
        if (selectedMaster !== 'all') {
          const pMaster = p.specs?.masterCategory;
          if (pMaster !== selectedMaster) {
            const pName = p.name.toLowerCase();
            const pLabel = (p.specs?.subCategoryLabel || '').toLowerCase();
            if (selectedMaster === 'cleaning' && !pName.includes('süpürge') && !pName.includes('robot') && !pName.includes('cleaner') && !pLabel.includes('süpürge')) {
              return false;
            }
            if (selectedMaster === 'kitchen' && !pName.includes('airfryer') && !pName.includes('kahve') && !pName.includes('blender') && !pName.includes('tost') && !pName.includes('çay') && !pLabel.includes('mutfak') && !pLabel.includes('kahve')) {
              return false;
            }
            if (selectedMaster === 'major_appliances' && !pName.includes('buzdolabı') && !pName.includes('çamaşır') && !pName.includes('bulaşık') && !pName.includes('kurutma') && !pName.includes('fırın') && !pName.includes('ocak') && !pLabel.includes('çamaşır') && !pLabel.includes('buzdolabı')) {
              return false;
            }
            if (selectedMaster === 'climate' && !pName.includes('klima') && !pName.includes('hava') && !pLabel.includes('klima') && !pLabel.includes('hava')) {
              return false;
            }
            if (selectedMaster === 'personal_care' && !pName.includes('tıraş') && !pName.includes('saç') && !pName.includes('diş') && !pName.includes('epilasyon') && !pLabel.includes('tıraş') && !pLabel.includes('saç')) {
              return false;
            }
            if (selectedMaster === 'home_tools' && !pName.includes('ütü') && !pName.includes('sebil') && !pLabel.includes('ütü') && !pLabel.includes('sebil')) {
              return false;
            }
          }
        }

        // 2. Subcategory Filter
        if (selectedSubCat !== 'all') {
          const pSub = p.specs?.subCategory || '';
          const pLabel = (p.specs?.subCategoryLabel || '').toLowerCase();
          const pName = p.name.toLowerCase();

          let matched = pSub === selectedSubCat;
          if (!matched) {
            if (selectedSubCat === 'robot_vacuum') matched = pName.includes('robot') || pLabel.includes('robot');
            else if (selectedSubCat === 'stick_vacuum') matched = pName.includes('dikey') || pName.includes('şarjlı süpürge') || pLabel.includes('dikey');
            else if (selectedSubCat === 'canister_vacuum') matched = pName.includes('toz torbasız') || pLabel.includes('toz torbasız');
            else if (selectedSubCat === 'carpet_cleaner') matched = pName.includes('halı') || pName.includes('koltuk');
            else if (selectedSubCat === 'steam_cleaner') matched = pName.includes('buharlı') || pLabel.includes('buhar');
            else if (selectedSubCat === 'airfryer') matched = pName.includes('airfryer') || pName.includes('fritöz') || pLabel.includes('airfryer');
            else if (selectedSubCat === 'coffee_machine') matched = pName.includes('kahve') || pName.includes('espresso') || pName.includes('telve') || pLabel.includes('kahve');
            else if (selectedSubCat === 'tea_maker') matched = pName.includes('çay') || pName.includes('kettle') || pName.includes('su ısıtıcı');
            else if (selectedSubCat === 'blender') matched = pName.includes('blender') || pName.includes('mikser') || pName.includes('mutfak robotu');
            else if (selectedSubCat === 'toaster') matched = pName.includes('tost') || pName.includes('ızgara');
            else if (selectedSubCat === 'refrigerator') matched = (pName.includes('buzdolabı') || pLabel.includes('buzdolabı')) && !pName.includes('şarküteri');
            else if (selectedSubCat === 'washing_machine') matched = pName.includes('çamaşır') || pLabel.includes('çamaşır');
            else if (selectedSubCat === 'dryer') matched = pName.includes('kurutma') || pLabel.includes('kurutma');
            else if (selectedSubCat === 'dishwasher') matched = (pName.includes('bulaşık') || pLabel.includes('bulaşık')) && !pName.includes('sanayi');
            else if (selectedSubCat === 'deep_freezer') matched = pName.includes('dondurucu') || pLabel.includes('dondurucu');
            else if (selectedSubCat === 'built_in_set') matched = pName.includes('ankastre set') || pLabel.includes('ankastre set') || pName.includes('3\'lü');
            else if (selectedSubCat === 'oven') matched = (pName.includes('fırın') || pLabel.includes('fırın')) && !pName.includes('mikrodalga');
            else if (selectedSubCat === 'hob') matched = pName.includes('ocak') || pLabel.includes('ocak');
            else if (selectedSubCat === 'range_hood') matched = pName.includes('davlumbaz') || pName.includes('aspiratör');
            else if (selectedSubCat === 'microwave') matched = pName.includes('mikrodalga');
            else if (selectedSubCat === 'air_conditioner') matched = pName.includes('klima') || pLabel.includes('klima');
            else if (selectedSubCat === 'air_purifier') matched = pName.includes('hava') || pLabel.includes('hava');
            else if (selectedSubCat === 'personal_care') matched = pName.includes('tıraş') || pName.includes('oneblade') || pLabel.includes('tıraş');
            else if (selectedSubCat === 'iron') matched = pName.includes('ütü') || pLabel.includes('ütü');
          }
          if (!matched) return false;
        }

        // 3. Search Query Filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          const matchesSub = (p.specs?.subCategoryLabel || '').toLowerCase().includes(q);
          if (!matchesName && !matchesBrand && !matchesSub) return false;
        }

        // 4. Brand Filter
        if (selectedBrands.length > 0) {
          if (!selectedBrands.some(b => b.toLowerCase() === p.brand.toLowerCase())) {
            return false;
          }
        }

        // 5. Price Filter
        if (p.basePrice > priceRange) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
        if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, selectedMaster, selectedSubCat, searchQuery, selectedBrands, priceRange, sortBy]);

  const visibleProducts = useMemo(() => {
    return displayProducts.slice(0, visibleCount);
  }, [displayProducts, visibleCount]);

  const hasActiveFilters = selectedMaster !== 'all' || selectedSubCat !== 'all' || selectedBrands.length > 0 || searchQuery !== '' || priceRange < 150000;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Global Navigation Bar */}
      <CategoryBar />

      {/* 2. Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden border border-slate-700/50">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -top-20 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              Ev & Yaşam Teknolojileri Merkezi
            </span>
            <span className="bg-white/10 text-slate-200 text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
              935 Model • 8 Mağaza Canlı Fiyat Takibi
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Eviniz İçin En İleri Teknolojiler, <span className="text-emerald-400">En Uygun Fiyatlarla.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-2xl">
            Robot süpürgelerden beyaz eşyaya, kahve makinelerinden inverter klimalara kadar tüm ürünleri teknik detaylarıyla kıyaslayın, 8 yetkili satıcıdaki gerçek indirimleri yakalayın.
          </p>

          {/* Quick Search inside Hero */}
          <div className="pt-2 max-w-xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                placeholder="Model, marka veya ürün adı arayın (Örn: Roborock Q Revo, Arçelik 570471, Philips Airfryer)..."
                className="w-full bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 pl-11 pr-10 py-3.5 rounded-2xl border border-white/20 focus:border-emerald-500 text-xs sm:text-sm font-medium outline-none transition-all shadow-inner backdrop-blur-md"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. 🌟 MASTER CATEGORY TABS (THE UNIFIED MAIN NAVIGATION) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            Ana Kategori Seçimi
          </h2>
          <span className="text-xs text-slate-400 font-semibold">
            {displayProducts.length} Ürün Listeleniyor
          </span>
        </div>

        {/* Master Categories Horizontal Scroll / Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {MASTER_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedMaster === cat.id;
            const count = masterCounts[cat.id] || (cat.id === 'all' ? products.length : 0);

            return (
              <button
                key={cat.id}
                onClick={() => handleMasterSelect(cat.id)}
                className={`p-3 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? cat.colorClass.active
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-slate-50/80 text-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </div>

                <div>
                  <span className={`text-xs font-black block line-clamp-1 ${
                    isSelected ? 'text-white' : 'text-slate-900 group-hover:text-emerald-700'
                  }`}>
                    {cat.shortLabel}
                  </span>
                  <span className={`text-[10px] block line-clamp-1 mt-0.5 ${
                    isSelected ? 'text-white/80' : 'text-slate-400'
                  }`}>
                    {cat.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. 🏷️ CONTEXTUAL SUB-CATEGORY QUICK PILLS */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3.5 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500">
          <span>Alt Kategori Filtresi ({currentSubCats.length} Seçenek):</span>
          {selectedSubCat !== 'all' && (
            <button
              onClick={() => handleSubCatSelect('all')}
              className="text-emerald-700 hover:underline flex items-center gap-1 font-bold"
            >
              <RotateCcw className="w-3 h-3" />
              Tümünü Göster
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentSubCats.map((sub) => {
            const isSubSelected = selectedSubCat === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubCatSelect(sub.id)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isSubSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. 🌟 SPOTLIGHT POPULAR CATEGORY SHOWCASE CARDS */}
      {selectedMaster === 'all' && selectedSubCat === 'all' && !searchQuery && selectedBrands.length === 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-amber-500" />
              En Çok İncelenen Popüler Kategoriler
            </h3>
            <span className="text-xs text-slate-400 font-medium">Doğrudan Kategoriye Git</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPOTLIGHT_CARDS.map((card) => (
              <div
                key={card.id}
                onClick={() => handleSpotlightClick(card)}
                className="group relative h-48 rounded-3xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-end p-5"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${card.accent} opacity-85 group-hover:opacity-90 transition-opacity`} />

                <div className="relative z-10 space-y-1.5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 backdrop-blur-md text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider text-white">
                      {card.tag}
                    </span>
                    <span className="text-[10px] font-bold text-white/80">
                      {card.count}
                    </span>
                  </div>

                  <h4 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
                    {card.title}
                  </h4>

                  <p className="text-[11px] text-white/80 font-medium line-clamp-1">
                    {card.subtitle}
                  </p>

                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 pt-1 group-hover:translate-x-1 transition-transform">
                    <span>Modelleri Listele</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. 🛠️ CONTROL CENTER: BRAND FILTER & SORTING & ACTIVE TAGS */}
      <div ref={catalogRef} className="space-y-4 pt-4 border-t border-slate-200">
        
        {/* Brand Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Markaya Göre Filtrele:</span>
            {selectedBrands.length > 0 && (
              <button
                onClick={() => setSelectedBrands([])}
                className="text-emerald-700 hover:underline font-bold"
              >
                Marka Filtresini Sıfırla
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {brandListWithCounts.slice(0, 16).map(({ brand, count }) => {
              const isBrandActive = selectedBrands.includes(brand);
              return (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isBrandActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isBrandActive && <Check className="w-3.5 h-3.5" />}
                  <span>{brand}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    isBrandActive ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Result Count, Price Slider, Sort Dropdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black">
              {displayProducts.length}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {displayProducts.length} Model Bulundu
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                8 yetkili mağazada stok ve fiyatlar doğrulanıyor
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Price Max Slider */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span>Maks:</span>
              <input
                type="range"
                min={1000}
                max={150000}
                step={2500}
                value={priceRange}
                onChange={(e) => {
                  setPriceRange(Number(e.target.value));
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className="accent-emerald-600 w-28 sm:w-36 cursor-pointer"
              />
              <span className="text-slate-900 font-black tabular-nums">
                {priceRange.toLocaleString('tr-TR')} TL
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="popular">En Popülerler</option>
                <option value="priceAsc">En Düşük Fiyat</option>
                <option value="priceDesc">En Yüksek Fiyat</option>
                <option value="rating">En Yüksek Puan (Puan & Yorum)</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Filtreleri Sıfırla</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-semibold">Aktif Filtreler:</span>
            {selectedMaster !== 'all' && (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                Kategori: {MASTER_CATEGORIES.find(m => m.id === selectedMaster)?.label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedMaster('all')} />
              </span>
            )}
            {selectedSubCat !== 'all' && (
              <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                Alt Kategori: {currentSubCats.find(s => s.id === selectedSubCat)?.label || selectedSubCat}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedSubCat('all')} />
              </span>
            )}
            {selectedBrands.map(b => (
              <span key={b} className="bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                Marka: {b}
                <X className="w-3 h-3 cursor-pointer" onClick={() => toggleBrand(b)} />
              </span>
            ))}
            {searchQuery && (
              <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                Arama: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* 7. 📦 PRODUCT GRID */}
      {visibleProducts.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {visibleProducts.map((product, idx) => (
              <CompactProductCard
                key={product.id}
                product={product}
                index={idx}
                badgeType={product.isFeatured ? 'featured' : idx % 3 === 0 ? 'discount' : 'none'}
              />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < displayProducts.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
                className="bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white text-slate-900 font-black text-xs sm:text-sm px-8 py-3.5 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer"
              >
                Daha Fazla Ürün Göster ({displayProducts.length - visibleCount} Ürün Kaldı)
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">Aradığınız kriterlere uygun ürün bulunamadı</h3>
            <p className="text-xs text-slate-500 font-medium">
              Farklı bir arama terimi deneyebilir veya filtreleri sıfırlayabilirsiniz.
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      )}

      {/* 8. Bottom Global Category Icons */}
      <CategoryIconStrip />
    </div>
  );
}
