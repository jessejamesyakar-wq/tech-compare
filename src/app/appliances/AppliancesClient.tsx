'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
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
  Sparkle
} from 'lucide-react';

const SUB_CATEGORIES = [
  { id: 'all', label: 'Tüm Ürünler' },
  { id: 'robot_vacuum', label: 'Robot Süpürgeler' },
  { id: 'stick_vacuum', label: 'Dikey Süpürgeler' },
  { id: 'personal_care', label: 'Kişisel Bakım' },
  { id: 'air_purifier', label: 'Hava Temizleyiciler' },
  { id: 'airfryer', label: 'Airfryer & Fritöz' },
  { id: 'coffee_machine', label: 'Kahve Makineleri' },
  { id: 'blender', label: 'Mutfak Şefi & Blender' },
  { id: 'iron', label: 'Buharlı Ütüler' },
  { id: 'tea_maker', label: 'Çay & Su Isıtıcı' },
  { id: 'toaster', label: 'Tost & Izgara' }
];

const ROOM_ZONES = [
  {
    id: 'all_rooms',
    name: 'Tüm Odalar',
    subCats: ['all'],
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
    description: 'Evinizdeki tüm akıllı teknolojiler'
  },
  {
    id: 'living_room',
    name: 'Salon',
    subCats: ['robot_vacuum', 'stick_vacuum', 'air_purifier'],
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80',
    description: 'Robot & Dikey Süpürgeler, Hava Temizleme'
  },
  {
    id: 'kitchen',
    name: 'Mutfak',
    subCats: ['airfryer', 'coffee_machine', 'blender', 'tea_maker', 'toaster'],
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
    description: 'Airfryer, Espresso, Blender & Pişirme'
  },
  {
    id: 'bathroom',
    name: 'Banyo',
    subCats: ['personal_care', 'cosmetics'],
    image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
    description: 'Tıraş, Saç Şekillendirme, Diş Bakımı'
  }
];

const ITEMS_PER_PAGE = 24;

export default function AppliancesClient({ initialProducts }: { initialProducts: ApplianceProduct[] }) {
  const [products] = useState<ApplianceProduct[]>(initialProducts);
  const [selectedRoom, setSelectedRoom] = useState('all_rooms');
  const [selectedSubCat, setSelectedSubCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange] = useState<number>(150000);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const catalogRef = useRef<HTMLDivElement>(null);

  const allBrands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand))).filter(Boolean);
  }, [products]);

  const toggleBrand = (brand: string) => {
    setVisibleCount(ITEMS_PER_PAGE);
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setSelectedSubCat('all');
    setVisibleCount(ITEMS_PER_PAGE);
  };

  const handleSubCatSelect = (subCatId: string) => {
    setSelectedSubCat(subCatId);
    setVisibleCount(ITEMS_PER_PAGE);
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Room Zone filter
        if (selectedRoom !== 'all_rooms') {
          const roomObj = ROOM_ZONES.find((r) => r.id === selectedRoom);
          if (roomObj && !roomObj.subCats.includes(p.specs?.subCategory || '')) {
            return false;
          }
        }
        // Subcategory filter
        if (selectedSubCat !== 'all' && p.specs?.subCategory !== selectedSubCat) {
          return false;
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
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
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
  }, [products, selectedRoom, selectedSubCat, searchQuery, selectedBrands, priceRange, sortBy]);

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

      {/* 🌟 2. SMART LIFESTYLE ROOM SELECTOR (DARK CURVED HERO BANNER) */}
      <div className="relative bg-gradient-to-br from-[#063828] via-[#084532] to-[#04281c] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl overflow-hidden border border-emerald-800/40 text-white">
        {/* Subtle Ambient Glows */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-2 mb-6 sm:mb-8">
          <span className="text-[11px] font-black tracking-widest uppercase text-emerald-300/90 block">
            Smart Lifestyle Room Selector
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Eviniz İçin Akıllı Çözümler
          </h2>
        </div>

        {/* Room Cards Row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          {ROOM_ZONES.map((room) => {
            const isSelected = selectedRoom === room.id;
            return (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`group relative rounded-2xl overflow-hidden text-left p-3 sm:p-3.5 flex flex-col justify-between h-28 sm:h-36 transition-all duration-300 cursor-pointer border ${
                  isSelected
                    ? 'ring-3 ring-emerald-400 border-white bg-emerald-950/90 shadow-lg scale-102'
                    : 'border-emerald-800/60 bg-emerald-950/50 hover:bg-emerald-900/60 hover:border-emerald-500/60'
                }`}
              >
                {/* Background Image with Dark Overlay */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 opacity-35"
                  style={{ backgroundImage: `url(${room.image})` }}
                />
                <div className={`absolute inset-0 transition-opacity ${isSelected ? 'bg-emerald-950/70' : 'bg-slate-950/60 group-hover:bg-slate-950/40'}`} />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-white/20 text-white/90 backdrop-blur-xs'}`}>
                    {isSelected ? 'Seçildi ✓' : 'Keşfet'}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-400 text-slate-950' : 'bg-white/20 text-white group-hover:bg-emerald-500 group-hover:text-white'}`}>
                    <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Bottom Room Label */}
                <div className="relative z-10 space-y-0.5">
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-tight group-hover:text-emerald-300 transition-colors">
                    {room.name}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-semibold line-clamp-1 opacity-80">
                    {room.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🌟 3. FOUR PROMINENT SHOWCASE HUB CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: ROBOT SÜPÜRGELER */}
        <div className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.8</span>
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
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Akıllı Wi-Fi Haritalama">
                <Wifi className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Yüksek Emiş Gücü">
                <Wind className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Otomatik Paspas">
                <Layers className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              ROBOT SÜPÜRGELER
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Lidar navigasyon & akıllı paspas istasyonlu modeller
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleSubCatSelect('robot_vacuum')}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Robot Süpürge Karşılaştır</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: AIRFRYER & FRİTÖZ */}
        <div className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.9</span>
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
                alt="Airfryer & Fritöz"
                loading="lazy"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Feature Icons */}
            <div className="flex items-center gap-2 text-slate-400 mt-3 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Rapid Air Teknolojisi">
                <Zap className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Geniş XXL Kapasite">
                <Layers className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Mobil Uygulama Bağlantılı">
                <Wifi className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              AIRFRYERS & FRİTÖZ
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Çift hazneli, pencereli ve XXL sıcak hava fritözleri
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleSubCatSelect('airfryer')}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Modelleri İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: KAHVE MAKİNELERİ */}
        <div className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
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
                alt="Kahve Makineleri"
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
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Dokunmatik Ekran">
                <Layers className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              KAHVE MAKİNELERİ
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Tam otomatik espresso, filtre kahve & Türk kahvesi
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleSubCatSelect('coffee_machine')}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Filtrele & Kıyasla</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: KİŞİSEL BAKIM */}
        <div className="bg-white border border-slate-200 hover:border-emerald-500/80 rounded-3xl p-5 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
          <div>
            {/* Badges */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black px-2.5 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>4.6</span>
              </div>
              <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Haftanın Ürünü
              </span>
            </div>

            {/* Product Image Stage */}
            <div className="w-full h-44 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden border border-slate-100 group-hover:bg-emerald-50/40 transition-colors">
              <img
                src={hubCardPersonal.image || '/images/appliances/dyson-693303.jpg'}
                alt="Kişisel Bakım Aletleri"
                loading="lazy"
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Feature Icons */}
            <div className="flex items-center gap-2 text-slate-400 mt-3 mb-1">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="SenseIQ & Akıllı Koruma">
                <Sparkle className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Kablosuz / Şarjlı Kullanım">
                <Zap className="w-3 h-3" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700" title="Hızlı Şarj">
                <Wind className="w-3 h-3" />
              </div>
            </div>

            {/* Title & Info */}
            <h3 className="text-base font-black text-slate-900 tracking-tight mt-1">
              KİŞİSEL BAKIM
            </h3>
            <p className="text-xs text-slate-500 font-semibold line-clamp-1 mb-4">
              Tıraş makineleri, saç şekillendirme & diş fırçaları
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => handleSubCatSelect('personal_care')}
            className="w-full bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-extrabold text-xs py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Seçenekleri Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 🌟 4. CONTROL CENTER & FILTER BAR */}
      <div ref={catalogRef} className="pt-4 space-y-4">
        
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
          {SUB_CATEGORIES.map((cat) => {
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

      {/* 🌟 5. PRODUCT CATALOG GRID WITH PAGINATION */}
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
              setSelectedRoom('all_rooms');
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
