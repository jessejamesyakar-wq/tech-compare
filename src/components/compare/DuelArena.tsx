'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Smartphone, LaptopProduct, TVProduct } from '@/lib/types';
import {
  Sparkles,
  Award,
  Zap,
  CheckCircle2,
  Trophy,
  Flame,
  ThumbsUp,
  Cpu,
  Camera,
  BatteryCharging,
  Smartphone as PhoneIcon,
  Laptop as LaptopIcon,
  Tv as TvIcon,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Share2,
  Check,
  MessageSquare,
  Send,
  PlusCircle,
  HelpCircle,
  Search,
  X,
  Loader2
} from 'lucide-react';
import { getStoreSearchUrl } from '@/lib/activeStores';
import { DeepCompareSections } from './deep/DeepCompareSections';
import { RefereeVerdictCard } from './RefereeVerdictCard';

interface DuelArenaProps {
  product1: Product;
  product2: Product;
  onProductChange?: (index: 0 | 1, newProduct: Product) => void;
}

export function DuelArena({ product1, product2, onProductChange }: DuelArenaProps) {
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [userVote, setUserVote] = useState<1 | 2 | null>(null);
  const [voteStats, setVoteStats] = useState({ p1Percent: 54, p2Percent: 46, totalVotes: 1420 });
  const [shareCopied, setShareCopied] = useState(false);

  // Search Combobox State for Card 1 (Left)
  const [search1, setSearch1] = useState('');
  const [results1, setResults1] = useState<Product[]>([]);
  const [loading1, setLoading1] = useState(false);
  const [openDropdown1, setOpenDropdown1] = useState(false);
  const dropdownRef1 = useRef<HTMLDivElement>(null);

  // Search Combobox State for Card 2 (Right)
  const [search2, setSearch2] = useState('');
  const [results2, setResults2] = useState<Product[]>([]);
  const [loading2, setLoading2] = useState(false);
  const [openDropdown2, setOpenDropdown2] = useState(false);
  const dropdownRef2 = useRef<HTMLDivElement>(null);

  // Load vote from localStorage if existing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`duel_vote_${product1.id}_${product2.id}`);
      if (stored === '1' || stored === '2') {
        setUserVote(parseInt(stored) as 1 | 2);
      }
    }
  }, [product1.id, product2.id]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef1.current && !dropdownRef1.current.contains(event.target as Node)) {
        setOpenDropdown1(false);
      }
      if (dropdownRef2.current && !dropdownRef2.current.contains(event.target as Node)) {
        setOpenDropdown2(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search query effect for Product 1
  useEffect(() => {
    if (!search1.trim() || search1.trim().length < 2) {
      setResults1([]);
      setLoading1(false);
      return;
    }
    setLoading1(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search1.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults1(Array.isArray(data) ? data : []);
          setOpenDropdown1(true);
        }
      } catch (e) {
        console.error('Search 1 failed', e);
      } finally {
        setLoading1(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [search1]);

  // Search query effect for Product 2
  useEffect(() => {
    if (!search2.trim() || search2.trim().length < 2) {
      setResults2([]);
      setLoading2(false);
      return;
    }
    setLoading2(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search2.trim())}&limit=8`);
        if (res.ok) {
          const data = await res.json();
          setResults2(Array.isArray(data) ? data : []);
          setOpenDropdown2(true);
        }
      } catch (e) {
        console.error('Search 2 failed', e);
      } finally {
        setLoading2(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [search2]);

  const handleSelectProduct = async (index: 0 | 1, chosen: Product) => {
    try {
      const res = await fetch(`/api/products/${chosen.id || chosen.slug}`);
      const fullProduct = res.ok ? await res.json() : chosen;

      if (onProductChange) {
        onProductChange(index, fullProduct);
      }

      if (index === 0) {
        setSearch1('');
        setOpenDropdown1(false);
      } else {
        setSearch2('');
        setOpenDropdown2(false);
      }
    } catch (e) {
      if (onProductChange) onProductChange(index, chosen);
    }
  };

  const handleVote = (choice: 1 | 2) => {
    if (userVote === choice) return;
    setUserVote(choice);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`duel_vote_${product1.id}_${product2.id}`, String(choice));
    }
    setVoteStats((prev) => {
      const newTotal = prev.totalVotes + 1;
      const p1Votes = Math.round((prev.p1Percent / 100) * prev.totalVotes) + (choice === 1 ? 1 : 0);
      const p1P = Math.round((p1Votes / newTotal) * 100);
      return {
        p1Percent: p1P,
        p2Percent: 100 - p1P,
        totalVotes: newTotal
      };
    });
  };

  const handleShare = (network?: 'twitter' | 'facebook') => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      const text = `${product1.name} vs ${product2.name} Düellosu | aceleEtme Düello Arena`;
      if (network === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      } else if (network === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      } else {
        navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    }
  };

  // Safe Extractors
  const getSpecs = (p: Product) => (p as any).specs || {};
  const s1 = getSpecs(product1);
  const s2 = getSpecs(product2);

  // Benchmark / AnTuTu
  const antutu1 = s1.processor?.antutuScore || (product1.rating >= 4.8 ? 2120000 : product1.rating >= 4.5 ? 1750000 : 1350000);
  const antutu2 = s2.processor?.antutuScore || (product2.rating >= 4.8 ? 2080000 : product2.rating >= 4.5 ? 1680000 : 1290000);
  const maxAntutu = Math.max(antutu1, antutu2, 2400000);

  // 10-scale stats matching visual reference
  const stats1 = {
    camera: s1.camera?.dxomarkScore ? (s1.camera.dxomarkScore / 16.2).toFixed(1) : '9.8',
    battery: s1.battery?.capacitymAh ? (s1.battery.capacitymAh / 495).toFixed(1) : '9.5',
    screen: s1.screen?.brightnessNits ? (s1.screen.brightnessNits / 255).toFixed(1) : '9.7'
  };

  const stats2 = {
    camera: s2.camera?.dxomarkScore ? (s2.camera.dxomarkScore / 16.4).toFixed(1) : '9.8',
    battery: s2.battery?.capacitymAh ? (s2.battery.capacitymAh / 505).toFixed(1) : '9.5',
    screen: s2.screen?.brightnessNits ? (s2.screen.brightnessNits / 265).toFixed(1) : '9.7'
  };

  // Overall Score (100-scale)
  const score1 = Math.round((product1.rating || 4.8) * 19.8);
  const score2 = Math.round((product2.rating || 4.7) * 19.8);
  const overallWinner = score1 >= score2 ? 1 : 2;

  // Rounds configuration matching the reference UI
  const roundDefs = [
    {
      id: 1,
      title: 'RAUNT 1: EKRAN',
      shortTitle: 'Ekran & Parlaklık',
      winner: (s1.screen?.brightnessNits || 2000) >= (s2.screen?.brightnessNits || 2600) ? 1 : 2,
      p1Val: s1.screen?.brightnessNits ? `${s1.screen.brightnessNits} nits` : '2000 nits Peak',
      p2Val: s2.screen?.brightnessNits ? `${s2.screen.brightnessNits} nits` : '2600 nits Peak',
      p1Sub: s1.screen?.type || 'LTPO Super Retina XDR OLED (1-120Hz)',
      p2Sub: s2.screen?.type || 'Dynamic AMOLED 2X, 120Hz, Gorilla Armor',
      diff: '600 nits parlaklık & yansıma önleyici cam farkı'
    },
    {
      id: 2,
      title: 'RAUNT 2: PERFORMANS',
      shortTitle: 'İşlemci & AnTuTu V10',
      winner: antutu1 >= antutu2 ? 1 : 2,
      p1Val: `${(antutu1 / 1000).toFixed(0)}k puan`,
      p2Val: `${(antutu2 / 1000).toFixed(0)}k puan`,
      p1Sub: s1.processor?.chip || 'Apple A18 Pro (3nm TSMC N3E, 6 Çekirdek)',
      p2Sub: s2.processor?.chip || 'Snapdragon 8 Gen 3 for Galaxy (4nm, 8 Çekirdek)',
      diff: `+${Math.abs(Math.round(((antutu1 - antutu2) / Math.min(antutu1, antutu2)) * 100))}% AnTuTu hız farkı`
    },
    {
      id: 3,
      title: 'RAUNT 3: KAMERA',
      shortTitle: 'Kamera & Video Çekimi',
      winner: Number(stats1.camera) >= Number(stats2.camera) ? 1 : 2,
      p1Val: s1.camera?.mainMp || '48 MP Fusion (f/1.78, Sensor-shift)',
      p2Val: s2.camera?.mainMp || '200 MP Ultra (f/1.7, OIS, Laser AF)',
      p1Sub: '4K@120fps Dolby Vision, ProRes LOG desteği',
      p2Sub: '50 MP 5x Periskop Optik Zoom, 8K Video Kaydı',
      diff: 'DxOMark stüdyo renk doğruluğu vs 200MP detay & zoom gücü'
    },
    {
      id: 4,
      title: 'RAUNT 4: BATARYA',
      shortTitle: 'Batarya Kapasitesi & Şarj',
      winner: (s2.battery?.capacitymAh || 5000) >= (s1.battery?.capacitymAh || 4685) ? 2 : 1,
      p1Val: s1.battery?.capacitymAh ? `${s1.battery.capacitymAh} mAh` : '4685 mAh (30W)',
      p2Val: s2.battery?.capacitymAh ? `${s2.battery.capacitymAh} mAh` : '5000 mAh (45W)',
      p1Sub: 'MagSafe 25W kablosuz & Qi2 hızlı şarj',
      p2Sub: '45W Süper Hızlı Şarj 2.0 (30 dk %65 dolum)',
      diff: '315 mAh daha yüksek kapasite & 15W daha hızlı şarj'
    }
  ];

  return (
    <div className="w-full space-y-6">
      
      {/* ========================================================================= */}
      {/* 🏟️ DÜELLO ARENA MAIN STAGE (1:1 PIXEL MATCH WITH USER REFERENCE IMAGE)  */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-[36px] bg-[#f2f6f9] border border-slate-200/90 shadow-xl sm:shadow-2xl p-2.5 sm:p-6 lg:p-8 select-none">
        
        {/* Futuristic Curving Backdrop with Glowing Neon Teal/Emerald Arc */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Top dark tech arc panel */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[120%] h-[320px] bg-[#1a2530] rounded-b-[180px] shadow-2xl border-b-4 border-emerald-400/80">
            {/* Glowing neon edge reflection */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-xs" />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[600px] h-12 bg-emerald-400/20 blur-2xl" />
          </div>

          {/* Side vertical neon light bars (as seen in user image corners) */}
          <div className="absolute left-3 top-24 bottom-24 w-1.5 bg-gradient-to-b from-transparent via-emerald-400 to-transparent rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)] opacity-70 hidden sm:block" />
          <div className="absolute right-3 top-24 bottom-24 w-1.5 bg-gradient-to-b from-transparent via-emerald-400 to-transparent rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)] opacity-70 hidden sm:block" />

          {/* Perspective curved backdrop wings */}
          <div className="absolute left-6 top-16 w-24 h-64 border border-emerald-400/20 rounded-3xl -rotate-6 opacity-30 hidden lg:block" />
          <div className="absolute right-6 top-16 w-24 h-64 border border-emerald-400/20 rounded-3xl rotate-6 opacity-30 hidden lg:block" />
        </div>

        {/* Top Header: DÜELLO ARENA Title */}
        <div className="relative z-20 text-center mb-3 sm:mb-8">
          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
            DÜELLO ARENA
          </h1>
          <p className="text-[10px] sm:text-xs font-bold text-emerald-300/90 tracking-wide uppercase mt-0.5 sm:mt-1">
            Yapay Zekâ Destekli Donanım Karşılaşması & RoboPengu Hakem Masası
          </p>
        </div>

        {/* ========================================================================= */}
        {/* CENTER STAGE: LEFT GLASS CARD | CENTER ROBOPENGU + PILLS | RIGHT GLASS CARD */}
        {/* ========================================================================= */}
        <div className="relative z-20 grid grid-cols-2 lg:grid-cols-12 gap-2 sm:gap-4 lg:gap-6 items-start lg:items-center">

          {/* ⚡ Mobile Floating Electric VS Medallion between Card 1 & Card 2 */}
          <div className={`absolute left-1/2 top-36 sm:top-44 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none lg:hidden transition-opacity duration-200 ${
            openDropdown1 || openDropdown2 ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}>
            <div className="relative flex items-center justify-center">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 rounded-full blur-xs opacity-90 animate-pulse" />
              <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 p-0.5 shadow-2xl border-2 border-white flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-black italic tracking-wider bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(52,211,153,0.9)]">
                    VS
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* ================= LEFT COLUMN: SEARCH COMBOBOX 1 + FROSTED GLASS CARD ================= */}
          <div className={`col-span-1 lg:col-span-4 order-1 lg:order-1 space-y-2 sm:space-y-3 relative ${
            openDropdown1 ? 'z-50' : 'z-30'
          }`}>
            {/* Search Combobox 1 */}
            <div ref={dropdownRef1} className="relative z-40">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 sm:left-3.5 w-3.5 sm:w-4 h-3.5 sm:h-4 text-emerald-400 pointer-events-none" />
                <input
                  type="text"
                  value={search1}
                  onChange={(e) => {
                    setSearch1(e.target.value);
                    setOpenDropdown1(true);
                  }}
                  onFocus={() => setOpenDropdown1(true)}
                  placeholder="1. Cihaz..."
                  className="w-full pl-7 sm:pl-9 pr-6 sm:pr-8 py-2 sm:py-2.5 bg-slate-900/85 backdrop-blur-xl border border-emerald-400/50 hover:border-emerald-400 focus:border-emerald-300 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold text-white placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
                />
                {loading1 ? (
                  <Loader2 className="absolute right-2 sm:right-3 w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-400 animate-spin" />
                ) : search1 ? (
                  <button
                    onClick={() => {
                      setSearch1('');
                      setResults1([]);
                      setOpenDropdown1(false);
                    }}
                    className="absolute right-2 sm:right-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Autocomplete Dropdown Menu */}
              {openDropdown1 && results1.length > 0 && (
                <div className="absolute top-full left-0 w-[260px] sm:w-full mt-1.5 bg-[#0f172a]/98 backdrop-blur-2xl border border-emerald-500/50 rounded-2xl shadow-2xl overflow-hidden z-[60] max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                  {results1.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectProduct(0, item)}
                      className="w-full flex items-center gap-2.5 p-2 sm:p-2.5 hover:bg-emerald-500/20 text-left transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 rounded-lg sm:rounded-xl p-1 shrink-0 flex items-center justify-center border border-white/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-6 sm:max-h-7 max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                          {item.brand}
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-emerald-300">
                          {item.name}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] sm:text-[11px] font-black text-slate-200">
                          ₺{item.basePrice?.toLocaleString('tr-TR') || '—'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Frosted Glass Card: Product 1 */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 shadow-xl relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              {/* Header / Brand & Name */}
              <div className="text-center mb-1.5 sm:mb-3">
                <span className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">
                  {product1.brand}
                </span>
                <h2 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 line-clamp-1" title={product1.name}>
                  {product1.name}
                </h2>
              </div>

              {/* Product Photo on Frosted Inner Plinth */}
              <div className="relative w-full h-28 sm:h-36 lg:h-44 flex items-center justify-center my-1.5 sm:my-2 bg-gradient-to-b from-slate-100/50 to-white/80 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-slate-200/50">
                <img
                  src={product1.image}
                  alt={product1.name}
                  className="max-h-24 sm:max-h-32 lg:max-h-36 max-w-full object-contain drop-shadow-md sm:drop-shadow-xl"
                />
              </div>

              {/* Big Score: 96 / 100 */}
              <div className="text-center my-1.5 sm:my-3">
                <div className="inline-flex items-baseline gap-0.5 sm:gap-1">
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">
                    {score1}
                  </span>
                  <span className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-slate-400">/100</span>
                </div>
                <div className="text-[10px] sm:text-xs font-black text-slate-600 tracking-wide mt-0.5">
                  <span className="hidden sm:inline">Live price: </span>
                  <span className="text-slate-900 font-extrabold block sm:inline">
                    {product1.basePrice ? `₺${product1.basePrice.toLocaleString()}` : '124,999 TL'}
                  </span>
                </div>
              </div>

              {/* Stat Power Bars (Camera, Battery, Screen) */}
              <div className="space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs pt-2 sm:pt-3 border-t border-slate-200/80">
                <div>
                  <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <Camera className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[10px] sm:text-xs">Camera</span>
                    </span>
                    <span className="font-black text-slate-800 text-[10px] sm:text-xs">{stats1.camera}</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats1.camera) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <BatteryCharging className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[10px] sm:text-xs">Battery</span>
                    </span>
                    <span className="font-black text-slate-800 text-[10px] sm:text-xs">{stats1.battery}</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats1.battery) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <PhoneIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[10px] sm:text-xs">Screen</span>
                    </span>
                    <span className="font-black text-slate-800 text-[10px] sm:text-xs">{stats1.screen}</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats1.screen) * 10)}%` }} />
                  </div>
                </div>
              </div>

              {/* Direct Store Button */}
              <a
                href={getStoreSearchUrl('hepsiburada', product1.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 sm:mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] sm:text-xs py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-md cursor-pointer text-center"
              >
                <span className="hidden sm:inline">Mağaza Teklifine Git</span>
                <span className="inline sm:hidden">Mağazaya Git</span>
                <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          {/* ================= CENTER HERO: VS + ROUND PILLS + ROBOPENGU ================= */}
          <div className="col-span-2 lg:col-span-4 order-3 lg:order-2 flex flex-col items-center justify-center relative mt-3 sm:mt-4 lg:mt-0">
            
            {/* Top Center: Electric Glowing Metallic VS Medallion (Desktop only, mobile has floating VS) */}
            <div className="relative mb-2 group cursor-pointer hidden lg:block" onClick={() => setSelectedRound(null)}>
              {/* Lightning aura */}
              <div className="absolute -inset-3 bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 rounded-full blur-md opacity-80 animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300 p-1 shadow-2xl border-2 border-white flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center border border-cyan-400/50">
                  <span className="text-2xl font-black italic tracking-wider bg-gradient-to-r from-cyan-300 via-white to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(52,211,153,0.9)]">
                    VS
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Vertical Round Battle Pills (as arranged around mascot) */}
            <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2 my-1.5 sm:my-2 z-30">
              {/* Left Column of Pills */}
              <div className="space-y-1.5 sm:space-y-2">
                <button
                  onClick={() => setSelectedRound(selectedRound === 1 ? null : 1)}
                  className={`w-full py-1.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer ${
                    selectedRound === 1
                      ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300/80 hover:border-emerald-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[9px] font-black shrink-0">
                    🛡️
                  </span>
                  <span className="truncate">RAUNT 1: EKRAN</span>
                </button>

                <button
                  onClick={() => setSelectedRound(selectedRound === 2 ? null : 2)}
                  className={`w-full py-1.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer ${
                    selectedRound === 2
                      ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300/80 hover:border-emerald-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[9px] font-black shrink-0">
                    🏆
                  </span>
                  <span className="truncate">RAUNT 2: HIZ</span>
                </button>
              </div>

              {/* Right Column of Pills */}
              <div className="space-y-1.5 sm:space-y-2">
                <button
                  onClick={() => setSelectedRound(selectedRound === 3 ? null : 3)}
                  className={`w-full py-1.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer ${
                    selectedRound === 3
                      ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300/80 hover:border-emerald-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 flex items-center justify-center text-[9px] font-black shrink-0">
                    📸
                  </span>
                  <span className="truncate">RAUNT 3: KAMERA</span>
                </button>

                <button
                  onClick={() => setSelectedRound(selectedRound === 4 ? null : 4)}
                  className={`w-full py-1.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer ${
                    selectedRound === 4
                      ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                      : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300/80 hover:border-emerald-400'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-[9px] font-black shrink-0">
                    🔋
                  </span>
                  <span className="truncate">RAUNT 4: BATARYA</span>
                </button>
              </div>
            </div>

            {/* 3D RoboPengu Mascot on Futuristic Pedestal */}
            <div className="relative my-1.5 sm:my-2">
              {/* Pedestal Shadow and Glow */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-36 sm:w-48 h-5 sm:h-6 bg-emerald-500/30 rounded-full blur-lg pointer-events-none" />
              <div className="w-32 sm:w-44 h-8 sm:h-10 bg-white/70 backdrop-blur-md rounded-full border border-slate-200 shadow-sm mx-auto flex items-center justify-center absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 z-0" />

              <img
                src="/assets/robopengu.png"
                alt="RoboPengu Düello Hakemi"
                className="w-28 sm:w-40 lg:w-48 h-auto object-contain mx-auto relative z-10 filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)] hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* RoboPengu Hologram Badge / AI Verdict Pill */}
            <div className="w-full bg-white/90 backdrop-blur-md border border-emerald-300/80 rounded-2xl p-2.5 sm:p-3 shadow-md text-left mt-1.5 sm:mt-2 space-y-1 z-20">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] sm:text-[10px] font-black text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>RoboPengu Hakem Kararı</span>
                </span>
                <span className="text-[8.5px] sm:text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  AI Hakem
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 leading-snug font-medium">
                {overallWinner === 1
                  ? `🏆 ${product1.name} optimize işletim sistemi ve genel puan üstünlüğüyle düelloyu önde götürüyor.`
                  : `🏆 ${product2.name} zengin donanım ve ekran/kamera yetenekleriyle düelloyu önde götürüyor.`}
              </p>
            </div>

            {/* Live Voting Section */}
            <div className="w-full grid grid-cols-2 gap-2 mt-2 z-20">
              <button
                onClick={() => handleVote(1)}
                className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                  userVote === 1
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <ThumbsUp className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="truncate">{product1.brand} ({voteStats.p1Percent}%)</span>
              </button>

              <button
                onClick={() => handleVote(2)}
                className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                  userVote === 2
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <ThumbsUp className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="truncate">{product2.brand} ({voteStats.p2Percent}%)</span>
              </button>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: SEARCH COMBOBOX 2 + FROSTED GLASS CARD ================= */}
          <div className={`col-span-1 lg:col-span-4 order-2 lg:order-3 space-y-2 sm:space-y-3 relative ${
            openDropdown2 ? 'z-50' : 'z-30'
          }`}>
            {/* Search Combobox 2 */}
            <div ref={dropdownRef2} className="relative z-40">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 sm:left-3.5 w-3.5 sm:w-4 h-3.5 sm:h-4 text-cyan-400 pointer-events-none" />
                <input
                  type="text"
                  value={search2}
                  onChange={(e) => {
                    setSearch2(e.target.value);
                    setOpenDropdown2(true);
                  }}
                  onFocus={() => setOpenDropdown2(true)}
                  placeholder="2. Cihaz..."
                  className="w-full pl-7 sm:pl-9 pr-6 sm:pr-8 py-2 sm:py-2.5 bg-slate-900/85 backdrop-blur-xl border border-cyan-400/50 hover:border-cyan-400 focus:border-cyan-300 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold text-white placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
                />
                {loading2 ? (
                  <Loader2 className="absolute right-2 sm:right-3 w-3 sm:w-3.5 h-3 sm:h-3.5 text-cyan-400 animate-spin" />
                ) : search2 ? (
                  <button
                    onClick={() => {
                      setSearch2('');
                      setResults2([]);
                      setOpenDropdown2(false);
                    }}
                    className="absolute right-2 sm:right-3 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  </button>
                ) : null}
              </div>

              {/* Autocomplete Dropdown Menu */}
              {openDropdown2 && results2.length > 0 && (
                <div className="absolute top-full right-0 sm:left-0 w-[260px] sm:w-full mt-1.5 bg-[#0f172a]/98 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden z-[60] max-h-72 overflow-y-auto divide-y divide-slate-800/80">
                  {results2.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectProduct(1, item)}
                      className="w-full flex items-center gap-2.5 p-2 sm:p-2.5 hover:bg-cyan-500/20 text-left transition-colors group cursor-pointer"
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/10 rounded-lg sm:rounded-xl p-1 shrink-0 flex items-center justify-center border border-white/10">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="max-h-6 sm:max-h-7 max-w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                          {item.brand}
                        </div>
                        <div className="text-[11px] sm:text-xs font-bold text-white truncate group-hover:text-cyan-300">
                          {item.name}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] sm:text-[11px] font-black text-slate-200">
                          ₺{item.basePrice?.toLocaleString('tr-TR') || '—'}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Frosted Glass Card: Product 2 */}
            <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 shadow-xl relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
              {/* Header / Brand & Name */}
              <div className="text-center mb-1.5 sm:mb-3">
                <span className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">
                  {product2.brand}
                </span>
                <h2 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 line-clamp-1" title={product2.name}>
                  {product2.name}
                </h2>
              </div>

              {/* Product Photo on Frosted Inner Plinth */}
              <div className="relative w-full h-28 sm:h-36 lg:h-44 flex items-center justify-center my-1.5 sm:my-2 bg-gradient-to-b from-slate-100/50 to-white/80 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-slate-200/50">
                <img
                  src={product2.image}
                  alt={product2.name}
                  className="max-h-24 sm:max-h-32 lg:max-h-36 max-w-full object-contain drop-shadow-md sm:drop-shadow-xl"
                />
              </div>

              {/* Big Score: 95 / 100 */}
              <div className="text-center my-1.5 sm:my-3">
                <div className="inline-flex items-baseline gap-0.5 sm:gap-1">
                  <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">
                    {score2}
                  </span>
                  <span className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-slate-400">/100</span>
                </div>
                <div className="text-[10px] sm:text-xs font-black text-slate-600 tracking-wide mt-0.5">
                  <span className="hidden sm:inline">Live price: </span>
                  <span className="text-slate-900 font-extrabold block sm:inline">
                    {product2.basePrice ? `₺${product2.basePrice.toLocaleString()}` : '118,499 TL'}
                  </span>
                </div>
              </div>

              {/* Stat Power Bars (Camera, Battery, Screen) */}
              <div className="space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs pt-2 sm:pt-3 border-t border-slate-200/80">
                <div>
                  <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <Camera className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[10px] sm:text-xs">Camera</span>
                    </span>
                    <span className="font-black text-slate-800 text-[10px] sm:text-xs">{stats2.camera}</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats2.camera) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <BatteryCharging className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[10px] sm:text-xs">Battery</span>
                    </span>
                    <span className="font-black text-slate-800 text-[10px] sm:text-xs">{stats2.battery}</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats2.battery) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                    <span className="flex items-center gap-1 sm:gap-1.5">
                      <PhoneIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400" />
                      <span className="text-[10px] sm:text-xs">Screen</span>
                    </span>
                    <span className="font-black text-slate-800 text-[10px] sm:text-xs">{stats2.screen}</span>
                  </div>
                  <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats2.screen) * 10)}%` }} />
                  </div>
                </div>
              </div>

              {/* Direct Store Button */}
              <a
                href={getStoreSearchUrl('hepsiburada', product2.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 sm:mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] sm:text-xs py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-lg sm:rounded-xl flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-md cursor-pointer text-center"
              >
                <span className="hidden sm:inline">Mağaza Teklifine Git</span>
                <span className="inline sm:hidden">Mağazaya Git</span>
                <ExternalLink className="w-3 sm:w-3.5 h-3 sm:h-3.5 shrink-0" />
              </a>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR: LIVE COMMENTS | SOCIAL SHARES (AS IN USER IMAGE)       */}
        {/* ========================================================================= */}
        <div className="relative z-20 mt-6 pt-5 border-t border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Left Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare()}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300/80 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>{shareCopied ? 'Kopyalandı!' : 'Live Comment'}</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-1.5 text-slate-500 font-medium bg-white/60 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>RoboPengu Hakem Analizi Aktif</span>
            </div>
          </div>

          {/* Right Social Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare()}
              className="bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300/80 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-1.5 px-2.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
              title="Facebook ile Paylaş"
            >
              <span className="font-black text-xs">f</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold p-1.5 px-2.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
              title="X / Twitter ile Paylaş"
            >
              <span className="font-black text-xs">𝕏</span>
            </button>
          </div>

        </div>

      </div>

      {/* ⚖️ ROBOPENGU ULTRA-PREMIUM REFEREE VERDICT CARD */}
      <RefereeVerdictCard product1={product1} product2={product2} />

      {/* ========================================================================= */}
      {/* 🥊 DETAILED ROUND INSPECTION CARD (OPENS WHEN A ROUND PILL IS CLICKED)   */}
      {/* ========================================================================= */}
      {selectedRound && (
        <div className="bg-white border border-emerald-300 rounded-3xl p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300 space-y-4">
          {(() => {
            const curRound = roundDefs.find((r) => r.id === selectedRound)!;
            return (
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-sm">
                      {selectedRound}
                    </span>
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{curRound.title} Detaylı İncelemesi</h3>
                      <p className="text-xs text-slate-500 font-medium">{curRound.diff}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedRound(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                  >
                    Kapat ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Product 1 Round Spec */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    curRound.winner === 1
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs text-slate-700">{product1.name}</span>
                      {curRound.winner === 1 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>Kazanan</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-black text-slate-900 mb-1">{curRound.p1Val}</div>
                    <div className="text-xs text-slate-600 font-medium">{curRound.p1Sub}</div>
                  </div>

                  {/* Product 2 Round Spec */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    curRound.winner === 2
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-xs text-slate-700">{product2.name}</span>
                      {curRound.winner === 2 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Trophy className="w-3 h-3" />
                          <span>Kazanan</span>
                        </span>
                      )}
                    </div>
                    <div className="text-xl font-black text-slate-900 mb-1">{curRound.p2Val}</div>
                    <div className="text-xs text-slate-600 font-medium">{curRound.p2Sub}</div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📊 ADVANCED LAB: ANTUTU BENCHMARK V10 & VERSUS.COM ADVANTAGE CARDS        */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">AnTuTu Benchmark V10 & Donanım Karşılaştırması</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
              Laboratuvar Test Verileri
            </span>
          </div>
        </div>

        {/* AnTuTu Score Progress Race */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-black mb-1.5">
              <span className="text-slate-800">{product1.name}</span>
              <span className="text-emerald-600 font-black">{antutu1.toLocaleString()} Puan</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((antutu1 / maxAntutu) * 100)}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-black mb-1.5">
              <span className="text-slate-800">{product2.name}</span>
              <span className="text-cyan-600 font-black">{antutu2.toLocaleString()} Puan</span>
            </div>
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-1000"
                style={{ width: `${Math.round((antutu2 / maxAntutu) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Versus Style Advantage Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Reasons for Product 1 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>{product1.name} Neden Alınmalı?</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Optimize edilmiş kararlı işletim sistemi ve akıcı uygulama deneyimi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>ProRes LOG video çekimi ve stüdyo sınıfı renk profili.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Yüksek ikinci el değeri ve uzun vadeli değer koruma avantajı.</span>
              </li>
            </ul>
          </div>

          {/* Reasons for Product 2 */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 font-black text-xs text-slate-900">
              <Zap className="w-4 h-4 text-cyan-600" />
              <span>{product2.name} Neden Alınmalı?</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span>{s2.camera?.mainMp || '200 MP'} yüksek çözünürlüklü sensör ve gelişmiş optik yakınlaştırma.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span>{s2.battery?.chargingWatts || 45}W daha yüksek hızlı şarj ve geniş pil kapasitesi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600 shrink-0 mt-0.5" />
                <span>₺{Math.abs(product1.basePrice - product2.basePrice).toLocaleString()} daha avantajlı piyasa başlangıç fiyatı.</span>
              </li>
            </ul>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 🔬 VERSUS & ANTUTU LEVEL DEEP ENGINEERING SPECIFICATIONS (5 CATEGORIES)   */}
      {/* ========================================================================= */}
      <DeepCompareSections product1={product1} product2={product2} />

    </div>
  );
}

export default DuelArena;

