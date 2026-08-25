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
  Wifi,
  Wind,
  Layers,
  ArrowRight,
  Sparkle,
  Flame,
  ShieldCheck,
  Coffee,
  UtensilsCrossed,
  Scissors,
  Shirt,
  Fan
} from 'lucide-react';

interface SubCategoryItem {
  id: string;
  label: string;
  countLabel?: string;
  icon?: any;
}

interface SectorPillar {
  id: string;
  name: string;
  shortName: string;
  icon: any;
  subCats: SubCategoryItem[];
  bannerImage: string;
  badge: string;
  description: string;
}

const SECTOR_PILLARS: SectorPillar[] = [
  {
    id: 'floorcare',
    name: '1. Zemin & Ev Hijyeni',
    shortName: 'Zemin & Hijyen',
    icon: Wind,
    badge: 'Robotik & HEPA Filtre',
    description: 'Robot süpürgeler, dikey şarjlı süpürgeler, halı yıkama ve buharlı temizlik',
    bannerImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    subCats: [
      { id: 'robot_vacuum', label: 'Robot Süpürgeler', icon: Wifi },
      { id: 'stick_vacuum', label: 'Dikey & Şarjlı Süpürgeler', icon: Zap },
      { id: 'canister_vacuum', label: 'Klasik Toz Torbasız Süpürge', icon: Layers },
      { id: 'carpet_cleaner', label: 'Halı Yıkama Makineleri', icon: Sparkles },
      { id: 'steam_cleaner', label: 'Buharlı Temizleyiciler', icon: Wind },
      { id: 'window_robot', label: 'Cam Silme Robotları', icon: Sparkle }
    ]
  },
  {
    id: 'kitchen',
    name: '2. Mutfak & Gastronomi',
    shortName: 'Mutfak & Gastronomi',
    icon: UtensilsCrossed,
    badge: 'Airfryer & Barista',
    description: 'Airfryer, espresso, mutfak robotu, tost, çay ve çok amaçlı pişiriciler',
    bannerImage: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
    subCats: [
      { id: 'airfryer', label: 'Airfryer & Sıcak Hava Fritözleri', icon: Flame },
      { id: 'coffee_machine', label: 'Kahve & Espresso Makineleri', icon: Coffee },
      { id: 'tea_maker', label: 'Çay Makinesi & Su Isıtıcı', icon: Zap },
      { id: 'toaster', label: 'Tost Makinesi & Izgara', icon: Flame },
      { id: 'blender', label: 'Mutfak Şefi, Blender & Mikser', icon: Layers },
      { id: 'chopper', label: 'Rondo & Mutfak Robotu', icon: UtensilsCrossed },
      { id: 'multi_cooker', label: 'Çok Amaçlı Pişirici & Düdüklü', icon: Flame },
      { id: 'juicer', label: 'Katı Meyve & Narenciye Sıkacağı', icon: Wind },
      { id: 'bread_maker', label: 'Ekmek, Yoğurt & Dondurma', icon: Sparkle },
      { id: 'meat_grinder', label: 'Kıyma & Vakum Makineleri', icon: ShieldCheck },
      { id: 'kitchen_scale', label: 'Mutfak Terazisi & Termos', icon: Layers }
    ]
  },
  {
    id: 'climate',
    name: '3. Isıtma, Soğutma & İklim',
    shortName: 'İklimlendirme',
    icon: Fan,
    badge: 'Inverter & Hava Kalitesi',
    description: 'Klimalar, HEPA hava temizleyiciler, vantilatörler ve akıllı termostatlar',
    bannerImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80',
    subCats: [
      { id: 'air_conditioner', label: 'Klimalar (Duvar & Salon Tipi)', icon: Wind },
      { id: 'air_purifier', label: 'Hava Temizleyiciler & HEPA', icon: ShieldCheck },
      { id: 'fan', label: 'Vantilatör & Kule Sirkülatör', icon: Fan },
      { id: 'humidifier', label: 'Nemlendirici & Nem Alma Cihazı', icon: Wind },
      { id: 'heater', label: 'Kombi, Şofben & Isıtıcılar', icon: Flame },
      { id: 'thermostat', label: 'Akıllı Oda Termostatları', icon: Zap }
    ]
  },
  {
    id: 'personal_care',
    name: '4. Kişisel Bakım & Sağlık',
    shortName: 'Kişisel Bakım',
    icon: Scissors,
    badge: 'SenseIQ & İyonik Bakım',
    description: 'Tıraş, saç şekillendirme, IPL lazer, elektrikli diş fırçası ve tartılar',
    bannerImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    subCats: [
      { id: 'personal_care', label: 'Tıraş Makineleri & OneBlade', icon: Scissors },
      { id: 'hair_styling', label: 'Saç Kurutma & Şekillendirici', icon: Wind },
      { id: 'hair_straightener', label: 'Saç Düzleştirici & Maşa', icon: Sparkle },
      { id: 'ipl_epilator', label: 'IPL Lazer & Epilasyon', icon: Zap },
      { id: 'electric_toothbrush', label: 'Elektrikli Diş Fırçası & Ağız Duşu', icon: Sparkles },
      { id: 'smart_scale', label: 'Akıllı Tartı & Vücut Analizi', icon: Layers },
      { id: 'massage_gun', label: 'Masaj Tabancası & Sağlık', icon: ShieldCheck }
    ]
  },
  {
    id: 'major_appliances',
    name: '5. Beyaz Eşya & Ankastre',
    shortName: 'Beyaz Eşya',
    icon: Layers,
    badge: 'A+++ Tasarruf & Ankastre',
    description: 'Bulaşık, çamaşır, kurutma, buzdolabı, fırın, ocak ve davlumbaz',
    bannerImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    subCats: [
      { id: 'dishwasher', label: 'Bulaşık Makineleri', icon: Sparkles },
      { id: 'washing_machine', label: 'Çamaşır Makineleri', icon: Layers },
      { id: 'dryer', label: 'Kurutma Makineleri', icon: Wind },
      { id: 'refrigerator', label: 'Buzdolabı & Dondurucular', icon: Wind },
      { id: 'built_in_set', label: 'Ankastre Set, Ocak & Fırın', icon: Flame },
      { id: 'microwave', label: 'Mikrodalga & Mini Fırınlar', icon: Zap },
      { id: 'range_hood', label: 'Davlumbaz ve Aspiratör', icon: Fan },
      { id: 'water_dispenser', label: 'Su Sebili & Su Arıtma', icon: Sparkle }
    ]
  },
  {
    id: 'smart_home_tools',
    name: '6. Giysi, Yapı Market & Akıllı Ev',
    shortName: 'Giysi & Akıllı Ev',
    icon: Shirt,
    badge: 'Buhar Gücü & Enerji',
    description: 'Buhar kazanlı ütüler, güç istasyonları, akıllı kilit/priz ve yapı aletleri',
    bannerImage: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&q=80',
    subCats: [
      { id: 'iron', label: 'Buhar Kazanlı & Buharlı Ütüler', icon: Wind },
      { id: 'garment_steamer', label: 'Dikey Kırışık Gidericiler', icon: Shirt },
      { id: 'sewing_machine', label: 'Dikiş Makineleri', icon: Scissors },
      { id: 'power_station', label: 'Taşınabilir Güç İstasyonu & Jeneratör', icon: Zap },
      { id: 'smart_plug', label: 'Akıllı Priz, Akıllı Kilit & Güvenlik', icon: ShieldCheck },
      { id: 'drill', label: 'Matkap, Vidalama & Testere', icon: Layers },
      { id: 'pressure_washer', label: 'Basınçlı Yıkama & Çim Biçme', icon: Wind },
      { id: 'laser_measure', label: 'Lazer Metre & Multimetre', icon: Sparkle }
    ]
  }
];

const ALL_SUB_CATEGORIES = [
  { id: 'all', label: 'Tüm Ürünler' },
  { id: 'robot_vacuum', label: 'Robot Süpürgeler' },
  { id: 'stick_vacuum', label: 'Dikey Süpürgeler' },
  { id: 'airfryer', label: 'Airfryer & Fritöz' },
  { id: 'coffee_machine', label: 'Kahve Makineleri' },
  { id: 'personal_care', label: 'Kişisel Bakım' },
  { id: 'air_purifier', label: 'Hava Temizleyiciler' },
  { id: 'blender', label: 'Mutfak Şefi & Blender' },
  { id: 'iron', label: 'Buharlı Ütüler' },
  { id: 'tea_maker', label: 'Çay & Su Isıtıcı' },
  { id: 'toaster', label: 'Tost & Izgara' },
  { id: 'dishwasher', label: 'Bulaşık Makineleri' },
  { id: 'washing_machine', label: 'Çamaşır Makineleri' },
  { id: 'refrigerator', label: 'Buzdolapları' },
  { id: 'built_in_set', label: 'Ankastre Set & Fırın' },
  { id: 'air_conditioner', label: 'Klimalar' },
  { id: 'power_station', label: 'Güç İstasyonu & Jeneratör' },
  { id: 'smart_plug', label: 'Akıllı Ev & Priz' }
];

const ITEMS_PER_PAGE = 24;

export default function AppliancesClient({ initialProducts }: { initialProducts: ApplianceProduct[] }) {
  const searchParams = useSearchParams();
  const brandParam = searchParams.get('brand');

  const [products] = useState<ApplianceProduct[]>(initialProducts);
  const [activeSector, setActiveSector] = useState<string | null>(null);
  const [hoveredSector, setHoveredSector] = useState<string | null>(null);
  const [selectedSubCat, setSelectedSubCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange] = useState<number>(150000);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  useEffect(() => {
    if (brandParam) {
      const matchedBrand = products.find(
        (p) => p.brand.toLowerCase() === brandParam.toLowerCase()
      )?.brand || brandParam;
      setSelectedBrands([matchedBrand]);
    }
  }, [brandParam, products]);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const handleMouseEnterSector = (sectorId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredSector(sectorId);
  };

  const handleMouseLeaveSector = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredSector(null);
    }, 200);
  };

  const handleSectorClick = (sectorId: string) => {
    if (activeSector === sectorId) {
      setActiveSector(null);
      setSelectedSubCat('all');
    } else {
      setActiveSector(sectorId);
      setSelectedSubCat('all');
    }
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSubCatSelect = (subCatId: string) => {
    setSelectedSubCat(subCatId);
    setHoveredSector(null);
    setVisibleCount(ITEMS_PER_PAGE);
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const allBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);
  }, [products]);

  const toggleBrand = (brand: string) => {
    setVisibleCount(ITEMS_PER_PAGE);
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Sector Pillar filter
        if (activeSector) {
          const sec = SECTOR_PILLARS.find((s) => s.id === activeSector);
          if (sec) {
            const allowedSubCats = [sec.id, ...sec.subCats.map((sc) => sc.id)];
            const prodSubCat = p.specs?.subCategory || '';
            const prodLabel = (p.specs?.subCategoryLabel || '').toLowerCase();
            const prodName = p.name.toLowerCase();

            let matched = allowedSubCats.includes(prodSubCat);
            if (!matched) {
              if (activeSector === 'kitchen') {
                matched =
                  prodSubCat === 'kitchen' ||
                  prodSubCat === 'airfryer' ||
                  prodSubCat === 'coffee_machine' ||
                  prodSubCat === 'blender' ||
                  prodSubCat === 'toaster' ||
                  prodSubCat === 'tea_maker' ||
                  prodLabel.includes('kahve') ||
                  prodLabel.includes('mutfak') ||
                  prodLabel.includes('blender') ||
                  prodLabel.includes('mikser') ||
                  prodLabel.includes('tost') ||
                  prodName.includes('kahve') ||
                  prodName.includes('blender') ||
                  prodName.includes('mikser');
              } else if (activeSector === 'personal_care') {
                matched =
                  prodSubCat === 'personal_care' ||
                  prodSubCat === 'cosmetics' ||
                  prodLabel.includes('tıraş') ||
                  prodLabel.includes('epilasyon') ||
                  prodLabel.includes('saç') ||
                  prodLabel.includes('diş') ||
                  prodName.includes('tıraş') ||
                  prodName.includes('oneblade') ||
                  prodName.includes('hairclipper') ||
                  prodName.includes('epilatör') ||
                  prodName.includes('diş fırçası');
              } else if (activeSector === 'smart_home_tools') {
                matched =
                  prodSubCat === 'iron' ||
                  prodSubCat === 'smart_home_tools' ||
                  prodSubCat === 'power_station' ||
                  prodLabel.includes('ütü') ||
                  prodName.includes('ütü') ||
                  prodName.includes('buhar');
              } else if (activeSector === 'floorcare') {
                matched =
                  prodSubCat === 'robot_vacuum' ||
                  prodSubCat === 'stick_vacuum' ||
                  prodSubCat === 'floorcare' ||
                  prodLabel.includes('süpürge') ||
                  prodName.includes('süpürge') ||
                  prodName.includes('robot');
              } else if (activeSector === 'climate') {
                matched =
                  prodSubCat === 'air_purifier' ||
                  prodSubCat === 'air_conditioner' ||
                  prodSubCat === 'climate' ||
                  prodLabel.includes('hava') ||
                  prodLabel.includes('klima') ||
                  prodName.includes('hava') ||
                  prodName.includes('klima');
              } else if (activeSector === 'major_appliances') {
                matched =
                  prodSubCat === 'dishwasher' ||
                  prodSubCat === 'washing_machine' ||
                  prodSubCat === 'dryer' ||
                  prodSubCat === 'refrigerator' ||
                  prodSubCat === 'built_in_set' ||
                  prodSubCat === 'microwave' ||
                  prodSubCat === 'range_hood' ||
                  prodSubCat === 'water_dispenser' ||
                  prodSubCat === 'major_appliances' ||
                  prodLabel.includes('çamaşır') ||
                  prodLabel.includes('bulaşık') ||
                  prodLabel.includes('buzdolabı') ||
                  prodLabel.includes('kurutma') ||
                  prodLabel.includes('fırın') ||
                  prodLabel.includes('ocak') ||
                  prodName.includes('çamaşır') ||
                  prodName.includes('bulaşık') ||
                  prodName.includes('buzdolabı') ||
                  prodName.includes('kurutma');
              }
            }
            if (!matched) return false;
          }
        }

        // Subcategory filter
        if (selectedSubCat !== 'all') {
          const prodSubCat = p.specs?.subCategory || '';
          const prodLabel = (p.specs?.subCategoryLabel || '').toLowerCase();
          const prodName = p.name.toLowerCase();

          let subMatch = prodSubCat === selectedSubCat;
          if (!subMatch) {
            if (selectedSubCat === 'coffee_machine') {
              subMatch = prodLabel.includes('kahve') || prodName.includes('kahve') || prodName.includes('espresso') || prodName.includes('senseo') || prodName.includes('telve');
            } else if (selectedSubCat === 'blender') {
              subMatch = prodLabel.includes('blender') || prodLabel.includes('mikser') || prodLabel.includes('robot') || prodName.includes('blender') || prodName.includes('mikser') || prodName.includes('mutfak robotu');
            } else if (selectedSubCat === 'iron') {
              subMatch = prodLabel.includes('ütü') || prodName.includes('ütü') || prodName.includes('azur') || prodName.includes('perfectcare');
            } else if (selectedSubCat === 'personal_care') {
              subMatch = prodLabel.includes('tıraş') || prodLabel.includes('saç') || prodLabel.includes('epilasyon') || prodLabel.includes('diş') || prodName.includes('tıraş') || prodName.includes('oneblade') || prodName.includes('hairclipper');
            } else if (selectedSubCat === 'airfryer') {
              subMatch = prodLabel.includes('airfryer') || prodLabel.includes('fritöz') || prodName.includes('airfryer') || prodName.includes('fritöz');
            } else if (selectedSubCat === 'robot_vacuum') {
              subMatch = prodLabel.includes('robot') || prodName.includes('robot');
            } else if (selectedSubCat === 'stick_vacuum') {
              subMatch = prodLabel.includes('dikey') || prodLabel.includes('şarjlı süpürge') || prodName.includes('dikey');
            } else if (selectedSubCat === 'air_purifier') {
              subMatch = prodLabel.includes('hava') || prodName.includes('hava temizleyici');
            } else if (selectedSubCat === 'air_conditioner') {
              subMatch = prodLabel.includes('klima') || prodName.includes('klima') || prodName.includes('inverter');
            } else if (selectedSubCat === 'tea_maker') {
              subMatch = prodLabel.includes('çay') || prodLabel.includes('su ısıtıcı') || prodName.includes('çay') || prodName.includes('kettle');
            } else if (selectedSubCat === 'toaster') {
              subMatch = prodLabel.includes('tost') || prodLabel.includes('ızgara') || prodName.includes('tost');
            } else if (selectedSubCat === 'washing_machine') {
              subMatch = prodLabel.includes('çamaşır') || prodName.includes('çamaşır');
            } else if (selectedSubCat === 'dishwasher') {
              subMatch = prodLabel.includes('bulaşık') || prodName.includes('bulaşık');
            } else if (selectedSubCat === 'refrigerator') {
              subMatch = prodLabel.includes('buzdolabı') || prodName.includes('buzdolabı');
            } else if (selectedSubCat === 'dryer') {
              subMatch = prodLabel.includes('kurutma') || prodName.includes('kurutma');
            } else if (selectedSubCat === 'built_in_set') {
              subMatch = prodLabel.includes('ankastre') || prodLabel.includes('fırın') || prodLabel.includes('ocak') || prodName.includes('fırın') || prodName.includes('ocak') || prodName.includes('davlumbaz');
            }
          }
          if (!subMatch) return false;
        }
        // Search query filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesBrand = p.brand.toLowerCase().includes(q);
          const matchesSubCat = p.specs?.subCategoryLabel?.toLowerCase().includes(q);
          if (!matchesName && !matchesBrand && !matchesSubCat) return false;
        }
        // Brand filter
        if (selectedBrands.length > 0 && !selectedBrands.some(b => b.toLowerCase() === p.brand.toLowerCase())) return false;
        // Price filter
        if (p.basePrice > priceRange) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.basePrice - b.basePrice;
        if (sortBy === 'priceDesc') return b.basePrice - a.basePrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
      });
  }, [products, activeSector, selectedSubCat, searchQuery, selectedBrands, priceRange, sortBy]);

  const paginatedProducts = useMemo(() => {
    return displayProducts.slice(0, visibleCount);
  }, [displayProducts, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

  // Find sample representative products for the 4 Hub Cards
  const hubCardRobot = useMemo(() => {
    return products.find((p) => p.specs?.subCategory === 'robot_vacuum') || products[0];
  }, [products]);

  const hubCardAirfryer = useMemo(() => {
    return products.find((p) => p.specs?.subCategory === 'airfryer') || products[1];
  }, [products]);

  const hubCardCoffee = useMemo(() => {
    return products.find((p) => p.specs?.subCategory === 'coffee_machine') || products[2];
  }, [products]);

  const hubCardPersonal = useMemo(() => {
    return products.find((p) => p.specs?.subCategory === 'personal_care') || products[3];
  }, [products]);

  return (
    <div className="space-y-8 pb-16">
      <CategoryBar />

      {/* 🌟 1. HERO TITLE HEADER */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-sans">
          Ev ve Yaşam Teknolojileri
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
          En akıllı ve yenilikçi ev aletlerini karşılaştırın, 8 mağaza canlı fiyatlarını takip edin ve keşfedin.
        </p>
      </div>

      {/* 🌟 2. LUXURY 5-PILLAR MEGA SECTOR HUB (WITH HOVER MEGA FLYOUT) */}
      <div className="relative z-30">
        <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-3xl p-3 sm:p-4 shadow-sm">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {SECTOR_PILLARS.map((sector) => {
              const Icon = sector.icon;
              const isActive = activeSector === sector.id;
              const isHovered = hoveredSector === sector.id;

              return (
                <div
                  key={sector.id}
                  className="relative"
                  onMouseEnter={() => handleMouseEnterSector(sector.id)}
                  onMouseLeave={handleMouseLeaveSector}
                >
                  <button
                    onClick={() => handleSectorClick(sector.id)}
                    className={`w-full text-left px-3.5 py-3 rounded-2xl transition-all duration-300 flex items-center justify-between gap-2 border cursor-pointer ${
                      isActive
                        ? 'bg-emerald-700 text-white border-emerald-800 shadow-md shadow-emerald-700/20 scale-102 font-black'
                        : 'bg-slate-50 hover:bg-emerald-50/70 border-slate-200/80 text-slate-700 hover:text-emerald-800 hover:border-emerald-300 font-bold'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-emerald-700 shadow-2xs border border-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs tracking-tight block truncate">
                          {sector.shortName}
                        </span>
                        <span
                          className={`text-[10px] font-medium block truncate ${
                            isActive ? 'text-emerald-100' : 'text-slate-400'
                          }`}
                        >
                          {sector.subCats.length} Alt Kategori
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${
                        isHovered ? 'rotate-180 text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                  </button>

                  {/* 🚀 MEGA HOVER FLYOUT MENU */}
                  {isHovered && (
                    <div
                      onMouseEnter={() => handleMouseEnterSector(sector.id)}
                      onMouseLeave={handleMouseLeaveSector}
                      className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white/98 backdrop-blur-xl border border-slate-200/90 rounded-2xl p-3 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-200 space-y-1.5"
                    >
                      <div className="px-2.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                          {sector.name}
                        </span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md">
                          {sector.badge}
                        </span>
                      </div>

                      <div className="space-y-1 pt-1">
                        {sector.subCats.map((sc) => {
                          const SubIcon = sc.icon || Zap;
                          const isSubSelected = selectedSubCat === sc.id;
                          return (
                            <button
                              key={sc.id}
                              onClick={() => {
                                setActiveSector(sector.id);
                                handleSubCatSelect(sc.id);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                                isSubSelected
                                  ? 'bg-emerald-600 text-white'
                                  : 'hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <SubIcon className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{sc.label}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t border-slate-100 px-1">
                        <button
                          onClick={() => handleSectorClick(sector.id)}
                          className="w-full text-center py-1.5 text-[11px] font-black text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer flex items-center justify-center gap-1"
                        >
                          <span>Tüm {sector.shortName} Ürünlerini Filtrele</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {activeSector && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs px-1">
              <span className="text-slate-500 font-semibold">
                Aktif Alan Filtresi: <strong className="text-emerald-700 font-black">{SECTOR_PILLARS.find(s => s.id === activeSector)?.name}</strong>
              </span>
              <button
                onClick={() => {
                  setActiveSector(null);
                  setSelectedSubCat('all');
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className="text-red-600 hover:text-red-700 font-black text-xs cursor-pointer hover:underline"
              >
                Sektör Filtresini Sıfırla ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 3. FOUR PROMINENT SHOWCASE HUB CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: ROBOT SÜPÜRGELER */}
        <div className="bg-white border border-slate-200/90 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.9</span>
              </div>
              <span className="bg-slate-900 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Yeni Nesil
              </span>
            </div>

            {/* Product Image Stage */}
            <div className="w-full h-44 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-emerald-50/40 transition-colors">
              <img
                src={hubCardRobot.image || '/images/appliances/roborock-404410.jpg'}
                alt="Robot Süpürgeler"
                loading="lazy"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Feature Icons */}
            <div className="flex items-center gap-2 text-slate-400 mt-3 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Akıllı Lidar Haritalama">
                <Wifi className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Yüksek Emiş Gücü">
                <Wind className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Otomatik Paspas & Kurutma">
                <Layers className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              ROBOT SÜPÜRGE & PASPAS
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Lidar navigasyon & sıcak su paspas yıkama istasyonları
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setActiveSector('floorcare');
              handleSubCatSelect('robot_vacuum');
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Robot Süpürgeleri İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: AIRFRYER & FRİTÖZ */}
        <div className="bg-white border border-slate-200/90 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.8</span>
              </div>
              <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                <span>Fiyat Düşüşü %20</span>
              </span>
            </div>

            {/* Product Image Stage */}
            <div className="w-full h-44 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-emerald-50/40 transition-colors">
              <img
                src={hubCardAirfryer.image || '/images/appliances/philips-682542.jpg'}
                alt="Airfryer XXL Sıcak Hava"
                loading="lazy"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Feature Icons */}
            <div className="flex items-center gap-2 text-slate-400 mt-3 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Rapid Air Teknolojisi">
                <Zap className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="XXL Geniş Aile Boyu">
                <Layers className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Wi-Fi Uygulama Bağlantısı">
                <Wifi className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              AIRFRYER XXL SICAK HAVA
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Çift hazneli, cam pencereli ve XXL sıcak hava fritözleri
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setActiveSector('kitchen');
              handleSubCatSelect('airfryer');
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Airfryer Modellerini Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: KAHVE MAKİNELERİ */}
        <div className="bg-white border border-slate-200/90 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.7</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Kupon Fırsatı
              </span>
            </div>

            {/* Product Image Stage */}
            <div className="w-full h-44 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-emerald-50/40 transition-colors">
              <img
                src={hubCardCoffee.image || '/images/appliances/philips-646738.jpg'}
                alt="Tam Otomatik Kahve Makineleri"
                loading="lazy"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Feature Icons */}
            <div className="flex items-center gap-2 text-slate-400 mt-3 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Tam Otomatik Çekirdek Öğütme">
                <Zap className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="LatteGo Süt Köpürtücü">
                <Sparkle className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Renkli Dokunmatik Ekran">
                <Layers className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              TAM OTOMATİK KAHVE MAKİNESİ
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Çekirdekten fincana tam otomatik espresso & filtre kahve
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setActiveSector('kitchen');
              handleSubCatSelect('coffee_machine');
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Kahve Makinelerini Kıyasla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: KİŞİSEL BAKIM */}
        <div className="bg-white border border-slate-200/90 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.9</span>
              </div>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Haftanın Ürünü
              </span>
            </div>

            {/* Product Image Stage */}
            <div className="w-full h-44 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-emerald-50/40 transition-colors">
              <img
                src={hubCardPersonal.image || '/images/appliances/dyson-693303.jpg'}
                alt="Akıllı Kişisel Bakım Seti"
                loading="lazy"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Feature Icons */}
            <div className="flex items-center gap-2 text-slate-400 mt-3 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="SenseIQ & Akıllı Koruma">
                <Sparkle className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Kablosuz / Hızlı Şarj">
                <Zap className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="İyonik Bakım">
                <Wind className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              AKILLI KİŞİSEL BAKIM SETİ
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Tıraş makineleri, saç şekillendirme & elektrikli diş fırçaları
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              setActiveSector('personal_care');
              handleSubCatSelect('personal_care');
            }}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Kişisel Bakımı İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 🌟 4. SPONSORED CAMPAIGN BANNER (MEDIAMARKT / TEKNOLOJİ ŞÖLENİ) */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm bg-gradient-to-r from-[#e30613] via-[#b8000b] to-[#800007] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
              Sponsorlu • Kampanya
            </span>
            <span className="text-xs text-white/80 font-bold">MediaMarkt ile Teknoloji Şöleni</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Ev ve Yaşam Teknolojilerinde Özel Kulüp İndirimleri!
          </h3>
          <p className="text-xs text-white/90 font-medium">
            Robot süpürgeler, airfryer modelleri ve kahve makinelerinde 8 mağaza arasındaki en avantajlı taksit ve kupon fırsatlarını kaçırmayın.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/search?q=mediamarkt"
            className="bg-white hover:bg-slate-100 text-[#e30613] font-black text-xs px-6 py-3.5 rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95 text-center cursor-pointer"
          >
            Hemen Fırsatları Keşfet ➔
          </Link>
        </div>
      </div>

      {/* 🌟 5. CONTROL CENTER & FILTER BAR */}
      <div ref={catalogRef} className="pt-2 space-y-4">
        
        {/* Search & Sort Panel */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Tüm Ürün Kataloğu
              </h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full shadow-2xs">
                {displayProducts.length} Model
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              8 yetkili mağazadan anlık fiyat karşılaştırması ve teknik detaylar
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Model, marka veya özellik ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className="bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl pl-9 pr-4 py-2 text-xs font-bold outline-none w-full sm:w-64 shadow-2xs transition-all"
              />
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setVisibleCount(ITEMS_PER_PAGE);
              }}
              className="bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer shadow-2xs hover:border-slate-300 transition-all"
            >
              <option value="popular">Öne Çıkanlar & Popüler</option>
              <option value="priceAsc">Fiyat: Düşükten Yükseğe</option>
              <option value="priceDesc">Fiyat: Yüksekten Düşüğe</option>
              <option value="rating">En Yüksek Müşteri Puanı</option>
            </select>
          </div>
        </div>

        {/* Subcategory Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {ALL_SUB_CATEGORIES.map((cat) => {
            const isSelected = selectedSubCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSubCatSelect(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Brand Filters Bar */}
        {allBrands.length > 0 && (
          <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              Marka:
            </span>
            {allBrands.map((brand) => {
              const isChecked = selectedBrands.includes(brand);
              return (
                <button
                  key={brand}
                  onClick={() => toggleBrand(brand)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-extrabold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isChecked && <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />}
                  <span>{brand}</span>
                </button>
              );
            })}
            {selectedBrands.length > 0 && (
              <button
                onClick={() => {
                  setSelectedBrands([]);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className="text-xs text-red-600 hover:text-red-700 font-bold ml-auto cursor-pointer"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        )}

      </div>

      {/* 🌟 6. PRODUCT CATALOG GRID WITH PAGINATION */}
      {paginatedProducts.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {paginatedProducts.map((product, idx) => (
              <CompactProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < displayProducts.length && (
            <div className="text-center pt-4">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-emerald-600 text-white font-extrabold text-xs px-8 py-3.5 rounded-2xl shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Daha Fazla Ürün Göster ({displayProducts.length - visibleCount} model kaldı)</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <p className="text-[11px] text-slate-400 mt-2 font-semibold">
                {visibleCount} / {displayProducts.length} ürün listeleniyor
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Aramanıza uygun ürün bulunamadı</h3>
          <p className="text-xs text-slate-500">Lütfen filtreleri sıfırlamayı veya farklı bir arama terimi denemeyi düşünün.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveSector(null);
              setSelectedSubCat('all');
              setSelectedBrands([]);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer hover:bg-emerald-700 transition-all"
          >
            Tüm Ürünleri Göster
          </button>
        </div>
      )}

      <CategoryIconStrip />
    </div>
  );
}
