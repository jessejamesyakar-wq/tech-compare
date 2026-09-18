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
import { getProductScore, calculateOverallDuelWinner, getDuelRefereeVerdictText } from '@/lib/compareMetrics';

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

  // Category Awareness
  const category = (product1 as any).category || (product2 as any).category || 'smartphones';
  const isTV = category === 'tvs';
  const isLaptop = category === 'laptops';

  // Benchmark / AnTuTu - strictly sourced from verified specs
  const antutu1 = typeof s1.processor?.antutuScore === 'number' && s1.processor.antutuScore > 0 ? s1.processor.antutuScore : null;
  const antutu2 = typeof s2.processor?.antutuScore === 'number' && s2.processor.antutuScore > 0 ? s2.processor.antutuScore : null;

  const parseMp = (val: string | undefined): number => {
    if (!val) return 0;
    const match = String(val).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // 10-scale stats strictly calculated from verified values without fabricated fallbacks
  const calc10 = (score: number | undefined | null, maxVal: number) => {
    if (!score || isNaN(score) || score <= 0) return null;
    const scaled = Math.min(10.0, Math.max(1.0, (score / maxVal) * 10));
    return scaled.toFixed(1);
  };

  const stats1 = {
    camera: calc10(s1.camera?.dxomarkScore, 170) || (parseMp(s1.camera?.mainMp) ? calc10(parseMp(s1.camera?.mainMp), 200) : null),
    battery: calc10(s1.battery?.capacitymAh, 5500),
    screen: calc10(s1.screen?.brightnessNits || s1.screen?.brightness, 3000)
  };

  const stats2 = {
    camera: calc10(s2.camera?.dxomarkScore, 170) || (parseMp(s2.camera?.mainMp) ? calc10(parseMp(s2.camera?.mainMp), 200) : null),
    battery: calc10(s2.battery?.capacitymAh, 5500),
    screen: calc10(s2.screen?.brightnessNits || s2.screen?.brightness, 3000)
  };

  // TV Metrics
  const tvDisplayScore = (tech?: string) => {
    if (!tech) return 7.5;
    const t = tech.toLowerCase();
    if (t.includes('oled evo') || t.includes('qd-oled') || t.includes('oled+')) return 9.9;
    if (t.includes('oled')) return 9.6;
    if (t.includes('mini-led') || t.includes('neo qled')) return 9.2;
    if (t.includes('qled')) return 8.5;
    return 7.5;
  };

  const tv1Refresh = s1.refreshRateHz || s1.screen?.refreshRate || 120;
  const tv2Refresh = s2.refreshRateHz || s2.screen?.refreshRate || 120;
  const tv1Audio = s1.audioPowerWatts || null;
  const tv2Audio = s2.audioPowerWatts || null;
  const tv1Size = s1.screenSizeInches || null;
  const tv2Size = s2.screenSizeInches || null;

  interface StatBarItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    val: string;
    score10: number | null;
  }

  let statBars1: StatBarItem[] = [];
  let statBars2: StatBarItem[] = [];

  if (isTV) {
    statBars1 = [
      {
        id: 'panel',
        label: 'Panel & Çözünürlük',
        icon: <TvIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: `${s1.displayTech || 'OLED'}${tv1Size ? ` (${tv1Size}")` : ''}`,
        score10: tvDisplayScore(s1.displayTech)
      },
      {
        id: 'refresh',
        label: 'Tazeleme Hızı',
        icon: <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: `${tv1Refresh} Hz${s1.gamingFeatures?.length ? ' • VRR' : ''}`,
        score10: tv1Refresh >= 144 ? 10.0 : (tv1Refresh >= 120 ? 9.2 : 6.5)
      },
      {
        id: 'audio',
        label: 'Ses Sistemi',
        icon: <Award className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: tv1Audio ? `${tv1Audio}W${s1.dolbyAtmos !== false ? ' Atmos' : ''}` : '20W Standart',
        score10: tv1Audio ? Math.min(10.0, Math.max(4.0, (tv1Audio / 70) * 10)) : 6.0
      }
    ];

    statBars2 = [
      {
        id: 'panel',
        label: 'Panel & Çözünürlük',
        icon: <TvIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: `${s2.displayTech || 'OLED'}${tv2Size ? ` (${tv2Size}")` : ''}`,
        score10: tvDisplayScore(s2.displayTech)
      },
      {
        id: 'refresh',
        label: 'Tazeleme Hızı',
        icon: <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: `${tv2Refresh} Hz${s2.gamingFeatures?.length ? ' • VRR' : ''}`,
        score10: tv2Refresh >= 144 ? 10.0 : (tv2Refresh >= 120 ? 9.2 : 6.5)
      },
      {
        id: 'audio',
        label: 'Ses Sistemi',
        icon: <Award className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: tv2Audio ? `${tv2Audio}W${s2.dolbyAtmos !== false ? ' Atmos' : ''}` : '20W Standart',
        score10: tv2Audio ? Math.min(10.0, Math.max(4.0, (tv2Audio / 70) * 10)) : 6.0
      }
    ];
  } else if (isLaptop) {
    statBars1 = [
      {
        id: 'cpu',
        label: 'İşlemci (CPU)',
        icon: <Cpu className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: s1.processor || 'Çok Çekirdek',
        score10: 9.0
      },
      {
        id: 'gpu',
        label: 'Grafik Kartı (GPU)',
        icon: <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: s1.gpu || 'Dahili GPU',
        score10: 8.8
      },
      {
        id: 'mobility',
        label: 'Pil / Ağırlık',
        icon: <BatteryCharging className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: s1.batteryCapacityWh ? `${s1.batteryCapacityWh} Wh` : (s1.weightKg ? `${s1.weightKg} kg` : 'Taşınabilir'),
        score10: 8.5
      }
    ];

    statBars2 = [
      {
        id: 'cpu',
        label: 'İşlemci (CPU)',
        icon: <Cpu className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: s2.processor || 'Çok Çekirdek',
        score10: 9.0
      },
      {
        id: 'gpu',
        label: 'Grafik Kartı (GPU)',
        icon: <Zap className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: s2.gpu || 'Dahili GPU',
        score10: 8.8
      },
      {
        id: 'mobility',
        label: 'Pil / Ağırlık',
        icon: <BatteryCharging className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: s2.batteryCapacityWh ? `${s2.batteryCapacityWh} Wh` : (s2.weightKg ? `${s2.weightKg} kg` : 'Taşınabilir'),
        score10: 8.5
      }
    ];
  } else {
    // Smartphones (default)
    statBars1 = [
      {
        id: 'camera',
        label: 'Kamera',
        icon: <Camera className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: stats1.camera ? `${stats1.camera}/10` : 'Doğrulanmış veri yok',
        score10: stats1.camera ? Number(stats1.camera) : null
      },
      {
        id: 'battery',
        label: 'Batarya',
        icon: <BatteryCharging className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: stats1.battery ? `${stats1.battery}/10` : 'Doğrulanmış veri yok',
        score10: stats1.battery ? Number(stats1.battery) : null
      },
      {
        id: 'screen',
        label: 'Ekran',
        icon: <PhoneIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: stats1.screen ? `${stats1.screen}/10` : 'Doğrulanmış veri yok',
        score10: stats1.screen ? Number(stats1.screen) : null
      }
    ];

    statBars2 = [
      {
        id: 'camera',
        label: 'Kamera',
        icon: <Camera className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: stats2.camera ? `${stats2.camera}/10` : 'Doğrulanmış veri yok',
        score10: stats2.camera ? Number(stats2.camera) : null
      },
      {
        id: 'battery',
        label: 'Batarya',
        icon: <BatteryCharging className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: stats2.battery ? `${stats2.battery}/10` : 'Doğrulanmış veri yok',
        score10: stats2.battery ? Number(stats2.battery) : null
      },
      {
        id: 'screen',
        label: 'Ekran',
        icon: <PhoneIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-400 shrink-0" />,
        val: stats2.screen ? `${stats2.screen}/10` : 'Doğrulanmış veri yok',
        score10: stats2.screen ? Number(stats2.screen) : null
      }
    ];
  }

  // Overall Score (100-scale) - Real verified data only, never fabricate 4.8 / 4.7
  const score1 = getProductScore(product1);
  const score2 = getProductScore(product2);
  const overallWinner = calculateOverallDuelWinner(score1, score2);

  const nits1 = s1.screen?.brightnessNits || s1.screen?.brightness || null;
  const nits2 = s2.screen?.brightnessNits || s2.screen?.brightness || null;
  const nitsWinner: 1 | 2 | 'tie' | undefined = (nits1 && nits2)
    ? (nits1 === nits2 ? 'tie' : (nits1 > nits2 ? 1 : 2))
    : undefined;
  const nitsDiff = (nits1 && nits2)
    ? (nits1 === nits2 ? 'Eşit tepe parlaklık seviyesi' : `${Math.abs(nits1 - nits2)} nits parlaklık farkı`)
    : 'Doğrulanmış kıyas verisi yok';

  const antutuWinner: 1 | 2 | 'tie' | undefined = (antutu1 && antutu2)
    ? (antutu1 === antutu2 ? 'tie' : (antutu1 > antutu2 ? 1 : 2))
    : undefined;
  const antutuDiff = (antutu1 && antutu2)
    ? (antutu1 === antutu2 ? 'Eşit sentetik benchmark skoru' : `+${Math.abs(Math.round(((antutu1 - antutu2) / Math.min(antutu1, antutu2)) * 100))}% AnTuTu hız farkı`)
    : 'Doğrulanmış kıyas verisi yok';

  const mp1 = parseMp(s1.camera?.mainMp);
  const mp2 = parseMp(s2.camera?.mainMp);
  const camWinner: 1 | 2 | 'tie' | undefined = (mp1 > 0 && mp2 > 0)
    ? (mp1 === mp2 ? 'tie' : (mp1 > mp2 ? 1 : 2))
    : undefined;
  const camDiff = (mp1 > 0 && mp2 > 0)
    ? (mp1 === mp2 ? 'Eşit kamera sensör çözünürlüğü' : `${mp1 > mp2 ? product1.brand : product2.brand} ${Math.max(mp1, mp2)} MP ile önde`)
    : (s1.camera?.mainMp && s2.camera?.mainMp ? 'Kamera sensör kıyası' : 'Doğrulanmış kıyas verisi yok');

  const bat1 = s1.battery?.capacitymAh || null;
  const bat2 = s2.battery?.capacitymAh || null;
  const watt1 = s1.battery?.chargingWatts || null;
  const watt2 = s2.battery?.chargingWatts || null;
  const batWinner: 1 | 2 | 'tie' | undefined = (bat1 && bat2)
    ? (bat1 === bat2 ? 'tie' : (bat1 > bat2 ? 1 : 2))
    : undefined;
  const batDiff = (bat1 && bat2)
    ? (bat1 === bat2 ? 'Eşit batarya kapasitesi' : `${Math.abs(bat1 - bat2)} mAh kapasite farkı`)
    : 'Doğrulanmış kıyas verisi yok';

  // Dynamic rounds configuration based on category
  let roundDefs: {
    id: number;
    title: string;
    shortTitle: string;
    icon: string;
    winner?: 1 | 2 | 'tie';
    p1Val: string;
    p2Val: string;
    p1Sub: string;
    p2Sub: string;
    diff: string;
  }[] = [];

  if (isTV) {
    const tvSizeWinner: 1 | 2 | 'tie' | undefined = (tv1Size && tv2Size)
      ? (tv1Size === tv2Size ? 'tie' : (tv1Size > tv2Size ? 1 : 2))
      : undefined;
    const tvRefreshWinner: 1 | 2 | 'tie' | undefined = (tv1Refresh && tv2Refresh)
      ? (tv1Refresh === tv2Refresh ? 'tie' : (tv1Refresh > tv2Refresh ? 1 : 2))
      : undefined;
    const tvAudioWinner: 1 | 2 | 'tie' | undefined = (tv1Audio && tv2Audio)
      ? (tv1Audio === tv2Audio ? 'tie' : (tv1Audio > tv2Audio ? 1 : 2))
      : undefined;

    roundDefs = [
      {
        id: 1,
        title: 'RAUNT 1: PANEL & GÖRÜNTÜ',
        shortTitle: 'Panel & Çözünürlük',
        icon: '🖥️',
        winner: tvSizeWinner,
        p1Val: `${s1.displayTech || 'OLED'} ${tv1Size ? `(${tv1Size}")` : ''}`,
        p2Val: `${s2.displayTech || 'OLED'} ${tv2Size ? `(${tv2Size}")` : ''}`,
        p1Sub: s1.resolution || '4K Ultra HD',
        p2Sub: s2.resolution || '4K Ultra HD',
        diff: (tv1Size && tv2Size) ? (tv1Size === tv2Size ? 'Eşit ekran boyutu ve premium panel mimarisi' : `${Math.abs(tv1Size - tv2Size)} inç ekran boyutu farkı`) : 'Ekran paneli ve çözünürlük kıyası'
      },
      {
        id: 2,
        title: 'RAUNT 2: HIZ & YENİLEME',
        shortTitle: 'Tazeleme Hızı & Oyun',
        icon: '⚡',
        winner: tvRefreshWinner,
        p1Val: `${tv1Refresh} Hz`,
        p2Val: `${tv2Refresh} Hz`,
        p1Sub: s1.gamingFeatures?.[0] || 'VRR & ALLM Destekli',
        p2Sub: s2.gamingFeatures?.[0] || 'VRR & ALLM Destekli',
        diff: (tv1Refresh && tv2Refresh && tv1Refresh !== tv2Refresh) ? `${Math.abs(tv1Refresh - tv2Refresh)} Hz tazeleme farkı` : 'Akıcı oyun ve konsol tazeleme hızı'
      },
      {
        id: 3,
        title: 'RAUNT 3: SES SİSTEMİ',
        shortTitle: 'Hoparlör Gücü & Akustik',
        icon: '🔊',
        winner: tvAudioWinner,
        p1Val: tv1Audio ? `${tv1Audio}W Hoparlör` : 'Doğrulanmış ses verisi yok',
        p2Val: tv2Audio ? `${tv2Audio}W Hoparlör` : 'Doğrulanmış ses verisi yok',
        p1Sub: s1.dolbyAtmos !== false ? 'Dolby Atmos Desteği' : 'Dahili Hoparlör',
        p2Sub: s2.dolbyAtmos !== false ? 'Dolby Atmos Desteği' : 'Dahili Hoparlör',
        diff: (tv1Audio && tv2Audio) ? (tv1Audio === tv2Audio ? 'Eşit ses çıkış gücü seviyesi' : `${Math.abs(tv1Audio - tv2Audio)}W ses çıkış gücü farkı`) : 'Dahili ses sistemi kıyası'
      },
      {
        id: 4,
        title: 'RAUNT 4: SMART TV & PORTLAR',
        shortTitle: 'Smart OS & Portlar',
        icon: '🌐',
        winner: 'tie',
        p1Val: s1.smartOs || 'Smart TV',
        p2Val: s2.smartOs || 'Smart TV',
        p1Sub: s1.hdmiPorts ? `${s1.hdmiPorts}x HDMI Girişi` : 'HDMI 2.1 & eARC',
        p2Sub: s2.hdmiPorts ? `${s2.hdmiPorts}x HDMI Girişi` : 'HDMI 2.1 & eARC',
        diff: 'Smart TV arayüzü ve yeni nesil HDMI bağlantıları'
      }
    ];
  } else if (isLaptop) {
    roundDefs = [
      {
        id: 1,
        title: 'RAUNT 1: İŞLEMCİ (CPU)',
        shortTitle: 'İşlemci Gücü',
        icon: '⚡',
        winner: 'tie',
        p1Val: s1.processor || 'Çok Çekirdekli CPU',
        p2Val: s2.processor || 'Çok Çekirdekli CPU',
        p1Sub: s1.processorCores ? `${s1.processorCores} Çekirdek` : 'Yüksek Performans',
        p2Sub: s2.processorCores ? `${s2.processorCores} Çekirdek` : 'Yüksek Performans',
        diff: 'İşlemci mimarisi ve çekirdek gücü'
      },
      {
        id: 2,
        title: 'RAUNT 2: GRAFİK (GPU)',
        shortTitle: 'Ekran Kartı & FPS',
        icon: '🎮',
        winner: 'tie',
        p1Val: s1.gpu || 'Grafik Birimi',
        p2Val: s2.gpu || 'Grafik Birimi',
        p1Sub: s1.gpuTgpWatts ? `${s1.gpuTgpWatts}W TGP Gücü` : 'Özel Grafik Mimarisi',
        p2Sub: s2.gpuTgpWatts ? `${s2.gpuTgpWatts}W TGP Gücü` : 'Özel Grafik Mimarisi',
        diff: 'Oyun ve grafik render performansı'
      },
      {
        id: 3,
        title: 'RAUNT 3: EKRAN & PANELLER',
        shortTitle: 'Ekran & Çözünürlük',
        icon: '💻',
        winner: 'tie',
        p1Val: s1.screenSizeInches ? `${s1.screenSizeInches}" Ekran` : 'Panel',
        p2Val: s2.screenSizeInches ? `${s2.screenSizeInches}" Ekran` : 'Panel',
        p1Sub: s1.screenResolution || 'Yüksek Çözünürlük',
        p2Sub: s2.screenResolution || 'Yüksek Çözünürlük',
        diff: 'Ekran boyutu ve piksel netliği'
      },
      {
        id: 4,
        title: 'RAUNT 4: PİL & MOBİLİTE',
        shortTitle: 'Batarya & Taşınabilirlik',
        icon: '🔋',
        winner: 'tie',
        p1Val: s1.batteryCapacityWh ? `${s1.batteryCapacityWh} Wh Pil` : (s1.weightKg ? `${s1.weightKg} kg` : 'Mobil Batarya'),
        p2Val: s2.batteryCapacityWh ? `${s2.batteryCapacityWh} Wh Pil` : (s2.weightKg ? `${s2.weightKg} kg` : 'Mobil Batarya'),
        p1Sub: s1.chargerWatts ? `${s1.chargerWatts}W Adaptör` : 'Taşınabilir Kasa',
        p2Sub: s2.chargerWatts ? `${s2.chargerWatts}W Adaptör` : 'Taşınabilir Kasa',
        diff: 'Pil kapasitesi ve mobil gövde ağırlığı'
      }
    ];
  } else {
    // Smartphones (default)
    roundDefs = [
      {
        id: 1,
        title: 'RAUNT 1: EKRAN',
        shortTitle: 'Ekran & Parlaklık',
        icon: '🛡️',
        winner: nitsWinner,
        p1Val: nits1 ? `${nits1} nits Peak` : 'Doğrulanmış veri yok',
        p2Val: nits2 ? `${nits2} nits Peak` : 'Doğrulanmış veri yok',
        p1Sub: s1.screen?.type || `${product1.brand} Ekran Paneli`,
        p2Sub: s2.screen?.type || `${product2.brand} Ekran Paneli`,
        diff: nitsDiff
      },
      {
        id: 2,
        title: 'RAUNT 2: PERFORMANS',
        shortTitle: 'İşlemci & AnTuTu V10',
        icon: '⚡',
        winner: antutuWinner,
        p1Val: antutu1 ? `${(antutu1 / 1000).toFixed(0)}k puan` : 'Doğrulanmış veri yok',
        p2Val: antutu2 ? `${(antutu2 / 1000).toFixed(0)}k puan` : 'Doğrulanmış veri yok',
        p1Sub: s1.processor?.chip || `${product1.brand} Çip Mimarisi`,
        p2Sub: s2.processor?.chip || `${product2.brand} Çip Mimarisi`,
        diff: antutuDiff
      },
      {
        id: 3,
        title: 'RAUNT 3: KAMERA',
        shortTitle: 'Kamera & Video Çekimi',
        icon: '📸',
        winner: camWinner,
        p1Val: s1.camera?.mainMp || 'Doğrulanmış veri yok',
        p2Val: s2.camera?.mainMp || 'Doğrulanmış veri yok',
        p1Sub: s1.camera?.videoRes || 'Yüksek Çözünürlüklü Video',
        p2Sub: s2.camera?.videoRes || 'Yüksek Çözünürlüklü Video',
        diff: camDiff
      },
      {
        id: 4,
        title: 'RAUNT 4: BATARYA',
        shortTitle: 'Batarya Kapasitesi & Şarj',
        icon: '🔋',
        winner: batWinner,
        p1Val: bat1 ? `${bat1} mAh${watt1 ? ` (${watt1}W)` : ''}` : 'Doğrulanmış veri yok',
        p2Val: bat2 ? `${bat2} mAh${watt2 ? ` (${watt2}W)` : ''}` : 'Doğrulanmış veri yok',
        p1Sub: watt1 ? `${watt1}W Hızlı Şarj` : (bat1 ? 'Standart Şarj' : 'Doğrulanmış şarj verisi yok'),
        p2Sub: watt2 ? `${watt2}W Hızlı Şarj` : (bat2 ? 'Standart Şarj' : 'Doğrulanmış şarj verisi yok'),
        diff: batDiff
      }
    ];
  }

  return (
    <div className="w-full space-y-6 pb-24 sm:pb-8">
      
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
        <div className="relative z-20 text-center mb-3 sm:mb-8 pt-2 sm:pt-4">
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

          {/* ⚡ Mobile Floating Electric VS Medallion between Card 1 & Card 2 (z-40 for proud elevation) */}
          <div className={`absolute left-1/2 top-36 sm:top-44 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none lg:hidden transition-opacity duration-200 ${
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
            <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 shadow-xl relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between">
              <div>
                {/* Header / Brand & Name */}
                <div className="text-center mb-1.5 sm:mb-3">
                  <span className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">
                    {product1.brand}
                  </span>
                  <h2 className="text-[11px] sm:text-base lg:text-lg font-black text-slate-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] leading-tight" title={product1.name}>
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

                {/* Big Score: 96 / 100 or Puan Yok */}
                <div className="text-center my-1.5 sm:my-3">
                  <div className="inline-flex items-baseline gap-0.5 sm:gap-1">
                    {score1 !== null ? (
                      <>
                        <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">
                          {score1}
                        </span>
                        <span className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-slate-400">/100</span>
                      </>
                    ) : (
                      <span className="text-base sm:text-xl font-bold text-slate-400 tracking-tight">
                        Puan Yok
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs font-black text-slate-600 tracking-wide mt-0.5">
                    <span className="hidden sm:inline">Canlı fiyat: </span>
                    <span className="text-slate-900 font-extrabold block sm:inline">
                      {product1.basePrice ? `₺${product1.basePrice.toLocaleString()}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Stat Power Bars (Dynamic Category-Aware) */}
                <div className="space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs pt-2 sm:pt-3 border-t border-slate-200/80">
                  {statBars1.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                        <span className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                          {item.icon}
                          <span className="text-[10px] sm:text-xs truncate">{item.label}</span>
                        </span>
                        <span className="font-black text-slate-800 text-[9.5px] sm:text-xs truncate ml-1">{item.val}</span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${item.score10 !== null ? Math.min(100, Math.max(12, item.score10 * 10)) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
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

            {/* Interactive Round Battle Pills (Dynamically category-aware) */}
            <div className="w-full grid grid-cols-2 gap-1.5 sm:gap-2 my-1.5 sm:my-2 z-30">
              {roundDefs.map((round) => {
                const isActive = selectedRound === round.id;
                return (
                  <button
                    key={round.id}
                    onClick={() => setSelectedRound(isActive ? null : round.id)}
                    className={`w-full py-1.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-300'
                        : 'bg-white/90 hover:bg-white text-slate-800 border-slate-300/80 hover:border-emerald-400'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black shrink-0">
                      {round.icon}
                    </span>
                    <span className="truncate">{round.title}</span>
                  </button>
                );
              })}
            </div>

            {/* 3D RoboPengu Mascot on Futuristic Pedestal (Desktop & Tablet, hidden on small mobile to prevent floating button collision) */}
            <div className="relative my-1.5 sm:my-2 hidden sm:block">
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
                <span className="text-[9.5px] sm:text-[10px] font-black text-emerald-700 flex items-center gap-1.5">
                  <img src="/assets/robopengu.png" alt="RoboPengu" className="w-5 h-5 object-contain sm:hidden" />
                  <Sparkles className="w-3 h-3 text-emerald-600 hidden sm:inline" />
                  <span>RoboPengu Hakem Kararı</span>
                </span>
                <span className="text-[8.5px] sm:text-[9px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  AI Hakem
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 leading-snug font-medium">
                {getDuelRefereeVerdictText(overallWinner, product1.name, product2.name)}
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
            <div className="bg-white/80 backdrop-blur-2xl border border-white/80 rounded-2xl sm:rounded-3xl p-3 sm:p-5 lg:p-6 shadow-xl relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between">
              <div>
                {/* Header / Brand & Name */}
                <div className="text-center mb-1.5 sm:mb-3">
                  <span className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-0.5">
                    {product2.brand}
                  </span>
                  <h2 className="text-[11px] sm:text-base lg:text-lg font-black text-slate-900 line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] leading-tight" title={product2.name}>
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

                {/* Big Score: 95 / 100 or Puan Yok */}
                <div className="text-center my-1.5 sm:my-3">
                  <div className="inline-flex items-baseline gap-0.5 sm:gap-1">
                    {score2 !== null ? (
                      <>
                        <span className="text-2xl sm:text-4xl lg:text-5xl font-black text-cyan-600 tracking-tight">
                          {score2}
                        </span>
                        <span className="text-[10px] sm:text-xs lg:text-sm font-extrabold text-slate-400">/100</span>
                      </>
                    ) : (
                      <span className="text-base sm:text-xl font-bold text-slate-400 tracking-tight">
                        Puan Yok
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs font-black text-slate-600 tracking-wide mt-0.5">
                    <span className="hidden sm:inline">Canlı fiyat: </span>
                    <span className="text-slate-900 font-extrabold block sm:inline">
                      {product2.basePrice ? `₺${product2.basePrice.toLocaleString()}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Stat Power Bars (Dynamic Category-Aware) */}
                <div className="space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs pt-2 sm:pt-3 border-t border-slate-200/80">
                  {statBars2.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                        <span className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                          {item.icon}
                          <span className="text-[10px] sm:text-xs truncate">{item.label}</span>
                        </span>
                        <span className="font-black text-slate-800 text-[9.5px] sm:text-xs truncate ml-1">{item.val}</span>
                      </div>
                      <div className="w-full bg-slate-200/70 h-1.5 sm:h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${item.score10 !== null ? Math.min(100, Math.max(12, item.score10 * 10)) : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                      {curRound.winner === 'tie' && (
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Eşit
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
                      {curRound.winner === 'tie' && (
                        <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          Eşit
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
        {antutu1 && antutu2 ? (
          (() => {
            const maxAntutu = Math.max(antutu1, antutu2, 100000);
            return (
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
            );
          })()
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs font-medium text-slate-500">
            {antutu1 || antutu2 ? (
              <span>Modellerden biri veya her ikisi için laboratuvar onaylı AnTuTu benchmark puanı henüz sisteme girilmemiştir.</span>
            ) : (
              <span>Doğrulanmış AnTuTu V10 benchmark verisi bulunamadı.</span>
            )}
          </div>
        )}

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

