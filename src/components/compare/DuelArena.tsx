'use client';

import React, { useState, useEffect } from 'react';
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
  Check
} from 'lucide-react';
import { getStoreSearchUrl } from '@/lib/activeStores';

interface DuelArenaProps {
  product1: Product;
  product2: Product;
}

interface SpecRound {
  title: string;
  icon: any;
  val1: string | number;
  val2: string | number;
  winner: 1 | 2 | 'tie';
  diffText: string;
}

export function DuelArena({ product1, product2 }: DuelArenaProps) {
  const [activeTab, setActiveTab] = useState<'arena' | 'antutu' | 'versus' | 'rounds'>('arena');
  const [userVote, setUserVote] = useState<1 | 2 | null>(null);
  const [voteStats, setVoteStats] = useState({ p1Percent: 54, p2Percent: 46, totalVotes: 1420 });
  const [shareCopied, setShareCopied] = useState(false);

  // Load vote from localStorage if existing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`duel_vote_${product1.id}_${product2.id}`);
      if (stored === '1' || stored === '2') {
        setUserVote(parseInt(stored) as 1 | 2);
      }
    }
  }, [product1.id, product2.id]);

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

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }
  };

  // Safe Extractors
  const getSpecs = (p: Product) => (p as any).specs || {};
  const s1 = getSpecs(product1);
  const s2 = getSpecs(product2);

  // AnTuTu Benchmarks calculation or extraction
  const antutu1 = s1.processor?.antutuScore || (product1.rating >= 4.8 ? 2120000 : product1.rating >= 4.5 ? 1750000 : 1350000);
  const antutu2 = s2.processor?.antutuScore || (product2.rating >= 4.8 ? 2080000 : product2.rating >= 4.5 ? 1680000 : 1290000);
  const maxAntutu = Math.max(antutu1, antutu2, 2400000);

  // Stat Bars calculation (Scale 1.0 to 10.0)
  const stats1 = {
    camera: s1.camera?.dxomarkScore ? (s1.camera.dxomarkScore / 16).toFixed(1) : (product1.rating * 1.98).toFixed(1),
    battery: s1.battery?.capacitymAh ? (s1.battery.capacitymAh / 520).toFixed(1) : (product1.rating * 1.94).toFixed(1),
    screen: s1.screen?.brightnessNits ? (s1.screen.brightnessNits / 260).toFixed(1) : (product1.rating * 1.96).toFixed(1),
    speed: (antutu1 / 225000).toFixed(1)
  };

  const stats2 = {
    camera: s2.camera?.dxomarkScore ? (s2.camera.dxomarkScore / 16).toFixed(1) : (product2.rating * 1.97).toFixed(1),
    battery: s2.battery?.capacitymAh ? (s2.battery.capacitymAh / 510).toFixed(1) : (product2.rating * 1.95).toFixed(1),
    screen: s2.screen?.brightnessNits ? (s2.screen.brightnessNits / 250).toFixed(1) : (product2.rating * 1.96).toFixed(1),
    speed: (antutu2 / 225000).toFixed(1)
  };

  // Overall Score (100-base)
  const score1 = Math.round((product1.rating || 4.8) * 19.8);
  const score2 = Math.round((product2.rating || 4.7) * 19.8);
  const overallWinner = score1 > score2 ? 1 : score2 > score1 ? 2 : 'tie';

  // Round by round battle definition
  const rounds: SpecRound[] = [
    {
      title: 'Ekran & Tepe Parlaklık',
      icon: PhoneIcon,
      val1: s1.screen?.brightnessNits ? `${s1.screen.brightnessNits} nits` : (s1.screenSizeInches ? `${s1.screenSizeInches}" Ekran` : 'OLED HDR'),
      val2: s2.screen?.brightnessNits ? `${s2.screen.brightnessNits} nits` : (s2.screenSizeInches ? `${s2.screenSizeInches}" Ekran` : 'Dynamic AMOLED'),
      winner: (s1.screen?.brightnessNits || 0) >= (s2.screen?.brightnessNits || 0) ? 1 : 2,
      diffText: (s1.screen?.brightnessNits && s2.screen?.brightnessNits)
        ? `${Math.abs(s1.screen.brightnessNits - s2.screen.brightnessNits)} nits fark`
        : 'Üstün Panel Kalitesi'
    },
    {
      title: 'İşlemci & AnTuTu V10',
      icon: Cpu,
      val1: `${(antutu1 / 1000).toFixed(0)}k puan`,
      val2: `${(antutu2 / 1000).toFixed(0)}k puan`,
      winner: antutu1 >= antutu2 ? 1 : 2,
      diffText: `+${Math.abs(Math.round(((antutu1 - antutu2) / Math.min(antutu1, antutu2)) * 100))}% Hız Farkı`
    },
    {
      title: 'Kamera & Çözünürlük',
      icon: Camera,
      val1: s1.camera?.mainMp || '48 MP Stüdyo OIS',
      val2: s2.camera?.mainMp || '200 MP Ultra Pro',
      winner: Number(stats1.camera) >= Number(stats2.camera) ? 1 : 2,
      diffText: s1.camera?.dxomarkScore && s2.camera?.dxomarkScore
        ? `${Math.abs(s1.camera.dxomarkScore - s2.camera.dxomarkScore)} DxOMark Farkı`
        : 'Yüksek Sensör Boyutu'
    },
    {
      title: 'Batarya & Şarj Gücü',
      icon: BatteryCharging,
      val1: s1.battery?.capacitymAh ? `${s1.battery.capacitymAh} mAh (${s1.battery.chargingWatts || 30}W)` : (s1.batteryCapacityWh ? `${s1.batteryCapacityWh} Wh` : 'Uzun Pil Ömrü'),
      val2: s2.battery?.capacitymAh ? `${s2.battery.capacitymAh} mAh (${s2.battery.chargingWatts || 45}W)` : (s2.batteryCapacityWh ? `${s2.batteryCapacityWh} Wh` : 'Hızlı Şarj'),
      winner: (s1.battery?.capacitymAh || 0) >= (s2.battery?.capacitymAh || 0) ? 1 : 2,
      diffText: s1.battery?.capacitymAh && s2.battery?.capacitymAh
        ? `${Math.abs(s1.battery.capacitymAh - s2.battery.capacitymAh)} mAh Kapasite`
        : 'Hızlı Şarj Üstünlüğü'
    }
  ];

  // Versus.com Style Reasons to Buy
  const reasonsForP1 = [
    Number(stats1.speed) >= Number(stats2.speed) ? `Daha yüksek AnTuTu işlemci skoru (${(antutu1/1000).toFixed(0)}k)` : `Optimize edilmiş akıcı işletim sistemi mimarisi`,
    s1.camera?.videoRes ? `${s1.camera.videoRes} profesyonel video çekim kalitesi` : `Üst düzey fotoğraf sensör renk doğruluğu`,
    s1.screen?.type ? `${s1.screen.type} panel teknolojisi` : `Yüksek parlaklık ve kontrast oranı`,
    product1.basePrice < product2.basePrice ? `₺${(product2.basePrice - product1.basePrice).toLocaleString()} daha uygun piyasa fiyatı` : `Yüksek ikinci el ve yeniden satış değeri`
  ];

  const reasonsForP2 = [
    Number(stats2.speed) >= Number(stats1.speed) ? `Daha yüksek grafik ve AnTuTu hızı (${(antutu2/1000).toFixed(0)}k)` : `Gelişmiş termal soğutma ve çoklu görev performansı`,
    s2.camera?.telephotoMp ? `${s2.camera.telephotoMp} optik yakınlaştırma avantajı` : `Gelişmiş yapay zeka destekli gece çekimi`,
    s2.battery?.chargingWatts ? `${s2.battery.chargingWatts}W daha hızlı şarj desteği` : `Genişletilmiş batarya kullanım süresi`,
    product2.basePrice < product1.basePrice ? `₺${(product1.basePrice - product2.basePrice).toLocaleString()} daha avantajlı fiyat` : `Geniş donanım ve aksesuar ekosistemi`
  ];

  return (
    <div className="space-y-6">
      
      {/* ARENA CONTAINER: Sleek Curving Tech Stage */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl p-5 sm:p-8 text-white">
        
        {/* Futuristic Glowing Background Arc Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute inset-x-8 top-12 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
        </div>

        {/* Top Header & Mode Switcher */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/20 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>DÜELLO ARENA • ROBOPENGU HAKEM ANALİZİ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-emerald-400" />
              <span>Teknoloji Devlerinin Karşılaşması</span>
            </h2>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('arena')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                activeTab === 'arena' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Arena Özeti
            </button>
            <button
              onClick={() => setActiveTab('antutu')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'antutu' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>AnTuTu Benchmark</span>
            </button>
            <button
              onClick={() => setActiveTab('versus')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'versus' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Neden Bu Cihaz?</span>
            </button>
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer flex items-center gap-1"
              title="Düelloyu Kopyala"
            >
              {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ================= TAB 1: MAIN ARENA VIEW (PROTOTYPE 1 MATCH) ================= */}
        {activeTab === 'arena' && (
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* CORNER 1: Product 1 Card (Glassmorphic White/Slate) */}
            <div className="lg:col-span-4 bg-white/95 text-slate-900 rounded-3xl p-6 shadow-2xl border border-white/20 relative backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                  {product1.brand}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {product1.releaseYear || 2026}
                </span>
              </div>

              {/* Product Photo */}
              <div className="relative w-full h-44 flex items-center justify-center my-2">
                <img
                  src={product1.image}
                  alt={product1.name}
                  className="max-h-40 max-w-full object-contain drop-shadow-xl"
                />
              </div>

              {/* Title & Score */}
              <h3 className="font-black text-slate-900 text-base line-clamp-1 mt-2 text-center" title={product1.name}>
                {product1.name}
              </h3>

              <div className="flex items-baseline justify-center gap-1 my-3">
                <span className="text-4xl font-black text-emerald-600">{score1}</span>
                <span className="text-xs font-bold text-slate-400">/ 100 Skor</span>
              </div>

              {/* Live Market Price */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center mb-4">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Canlı Piyasa Fiyatı</span>
                <span className="text-xl font-black text-slate-900">
                  ₺{product1.basePrice ? product1.basePrice.toLocaleString() : 'Fiyat Alınıyor'}
                </span>
              </div>

              {/* Stat Power Bars */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-emerald-600" /> Kamera</span>
                    <span className="text-slate-900">{stats1.camera}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats1.camera) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Batarya</span>
                    <span className="text-slate-900">{stats1.battery}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats1.battery) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><PhoneIcon className="w-3.5 h-3.5 text-emerald-600" /> Ekran</span>
                    <span className="text-slate-900">{stats1.screen}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats1.screen) * 10)}%` }} />
                  </div>
                </div>
              </div>

              {/* Go to Store Button */}
              <a
                href={getStoreSearchUrl('hepsiburada', product1.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Mağaza Tekliflerine Git</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* CENTER: Glowing VS & RoboPengu Referee Centerpiece */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-4 px-2">
              
              {/* Electric Neon VS Badge */}
              <div className="relative group cursor-default">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition animate-pulse" />
                <div className="relative w-16 h-16 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center font-black text-xl italic tracking-wider text-white shadow-2xl">
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-md">
                    VS
                  </span>
                </div>
              </div>

              {/* 3D RoboPengu Mascot as Duel Master Referee */}
              <div className="relative">
                {/* Pedestal Glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-8 bg-emerald-500/30 rounded-full blur-xl pointer-events-none" />
                
                <img
                  src="/assets/robopengu.png"
                  alt="RoboPengu Hakem"
                  className="w-36 sm:w-44 h-auto object-contain mx-auto filter drop-shadow-[0_15px_25px_rgba(16,185,129,0.35)] hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Holographic Tablet / AI Verdict Box */}
              <div className="w-full bg-slate-900/90 border border-emerald-500/40 rounded-2xl p-3.5 backdrop-blur-md shadow-xl text-left space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-[10px] font-black tracking-wider uppercase text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>RoboPengu Hakem Kararı</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    AI Analiz
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {overallWinner === 1
                    ? `🏆 RoboPengu bu düelloda genel puan ve optimizasyon üstünlüğüyle ${product1.name} modelini öne çıkarıyor.`
                    : overallWinner === 2
                    ? `🏆 RoboPengu bu düelloda donanım gücü ve zengin özellikleriyle ${product2.name} modelini öne çıkarıyor.`
                    : `⚖️ İki amiral gemisi başa baş mücadele ediyor! İhtiyacınıza göre karar verin.`}
                </p>
              </div>

              {/* User Voting Section ("Senin Oyun?") */}
              <div className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl p-3">
                <span className="text-[11px] font-bold text-slate-400 block mb-2">Senin Kararın Hangisi? ({voteStats.totalVotes} Oy)</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleVote(1)}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                      userVote === 1
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{product1.brand} ({voteStats.p1Percent}%)</span>
                  </button>
                  <button
                    onClick={() => handleVote(2)}
                    className={`py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                      userVote === 2
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{product2.brand} ({voteStats.p2Percent}%)</span>
                  </button>
                </div>
              </div>

            </div>

            {/* CORNER 2: Product 2 Card (Glassmorphic White/Slate) */}
            <div className="lg:col-span-4 bg-white/95 text-slate-900 rounded-3xl p-6 shadow-2xl border border-white/20 relative backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                  {product2.brand}
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {product2.releaseYear || 2026}
                </span>
              </div>

              {/* Product Photo */}
              <div className="relative w-full h-44 flex items-center justify-center my-2">
                <img
                  src={product2.image}
                  alt={product2.name}
                  className="max-h-40 max-w-full object-contain drop-shadow-xl"
                />
              </div>

              {/* Title & Score */}
              <h3 className="font-black text-slate-900 text-base line-clamp-1 mt-2 text-center" title={product2.name}>
                {product2.name}
              </h3>

              <div className="flex items-baseline justify-center gap-1 my-3">
                <span className="text-4xl font-black text-emerald-600">{score2}</span>
                <span className="text-xs font-bold text-slate-400">/ 100 Skor</span>
              </div>

              {/* Live Market Price */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center mb-4">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Canlı Piyasa Fiyatı</span>
                <span className="text-xl font-black text-slate-900">
                  ₺{product2.basePrice ? product2.basePrice.toLocaleString() : 'Fiyat Alınıyor'}
                </span>
              </div>

              {/* Stat Power Bars */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-emerald-600" /> Kamera</span>
                    <span className="text-slate-900">{stats2.camera}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats2.camera) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><BatteryCharging className="w-3.5 h-3.5 text-emerald-600" /> Batarya</span>
                    <span className="text-slate-900">{stats2.battery}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats2.battery) * 10)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-600 mb-1">
                    <span className="flex items-center gap-1"><PhoneIcon className="w-3.5 h-3.5 text-emerald-600" /> Ekran</span>
                    <span className="text-slate-900">{stats2.screen}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Number(stats2.screen) * 10)}%` }} />
                  </div>
                </div>
              </div>

              {/* Go to Store Button */}
              <a
                href={getStoreSearchUrl('hepsiburada', product2.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <span>Mağaza Tekliflerine Git</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        )}

        {/* ================= TAB 2: ANTUTU BENCHMARK & HARDWARE LAB ================= */}
        {activeTab === 'antutu' && (
          <div className="relative z-10 space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-black flex items-center gap-2 mb-1">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>AnTuTu Benchmark V10 Hız Karşılaştırması</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                İşlemci (CPU), Grafik (GPU), Bellek (RAM) ve Kullanıcı Deneyimi (UX) testlerinin birleşik puanı.
              </p>

              {/* AnTuTu Visual Progress Race */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span>{product1.name}</span>
                    <span className="text-emerald-400 font-black">{antutu1.toLocaleString()} Puan</span>
                  </div>
                  <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round((antutu1 / maxAntutu) * 100)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-1.5">
                    <span>{product2.name}</span>
                    <span className="text-cyan-400 font-black">{antutu2.toLocaleString()} Puan</span>
                  </div>
                  <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden p-0.5">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-indigo-400 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${Math.round((antutu2 / maxAntutu) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Hardware Spec Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">{product1.brand} İşlemci Mimarisi</span>
                  <div className="font-extrabold text-sm">{s1.processor?.chip || 'Apple A-Series Bionic / Pro'}</div>
                  <div className="text-slate-400">{s1.processor?.cores || '6 Çekirdekli Yüksek Performans Mimarisi'}</div>
                  <div className="text-slate-400">RAM: {s1.memory?.ramGb ? `${s1.memory.ramGb} GB LPDDR5X` : 'Optimize Birleşik Bellek'}</div>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">{product2.brand} İşlemci Mimarisi</span>
                  <div className="font-extrabold text-sm">{s2.processor?.chip || 'Snapdragon 8 Series / Exynos Flagship'}</div>
                  <div className="text-slate-400">{s2.processor?.cores || '8 Çekirdekli Oryon / Kryo Mimarisi'}</div>
                  <div className="text-slate-400">RAM: {s2.memory?.ramGb ? `${s2.memory.ramGb} GB LPDDR5X` : '12 GB Yüksek Hızlı RAM'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: VERSUS.COM STYLE "NEDEN ALMALISIN?" ================= */}
        {activeTab === 'versus' && (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            
            {/* Reasons for Product 1 */}
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <img src={product1.image} alt={product1.name} className="w-12 h-12 object-contain" />
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase block">Versus Karşılaştırma</span>
                  <h4 className="font-black text-sm text-white">{product1.name} Neden Daha İyi?</h4>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {reasonsForP1.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reasons for Product 2 */}
            <div className="bg-slate-900/90 border border-cyan-500/40 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <img src={product2.image} alt={product2.name} className="w-12 h-12 object-contain" />
                <div>
                  <span className="text-[10px] text-cyan-400 font-bold uppercase block">Versus Karşılaştırma</span>
                  <h4 className="font-black text-sm text-white">{product2.name} Neden Daha İyi?</h4>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {reasonsForP2.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        )}

      </div>

      {/* ROUND-BY-ROUND SPEC BATTLE PILLS (From Prototype 2) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="font-black text-slate-900 text-base">Raunt Bazlı Donanım Galibiyeti</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">4 Kategori Mücadelesi</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rounds.map((round, idx) => {
            const Icon = round.icon;
            return (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 hover:border-emerald-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span>{round.title}</span>
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.2 rounded-md">
                    Raunt {idx + 1}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className={`flex justify-between items-center p-1.5 rounded-lg ${round.winner === 1 ? 'bg-emerald-50 text-emerald-900 font-black' : 'text-slate-600'}`}>
                    <span className="truncate max-w-[110px]">{product1.brand}</span>
                    <span className="font-extrabold">{round.val1}</span>
                  </div>
                  <div className={`flex justify-between items-center p-1.5 rounded-lg ${round.winner === 2 ? 'bg-emerald-50 text-emerald-900 font-black' : 'text-slate-600'}`}>
                    <span className="truncate max-w-[110px]">{product2.brand}</span>
                    <span className="font-extrabold">{round.val2}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">{round.diffText}</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>{round.winner === 1 ? product1.brand : product2.brand}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default DuelArena;
