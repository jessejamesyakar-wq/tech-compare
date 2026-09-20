'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product, Smartphone, LaptopProduct, TVProduct } from '@/lib/types';
import {
  Scale,
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
import { ProductPriceSummary } from '@/components/detail/ProductPriceSummary';
import { CompareVerdictCard } from './CompareVerdictCard';
import { getDuelRows, getMetricOutcome, describeMetric } from '@/lib/comparisonEvidence';
import { getSpecVerificationNotice } from '@/lib/specVerification';
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
  const [actionError, setActionError] = useState('');
  const [shareCopied, setShareCopied] = useState(false);
  const selectionRequests=useRef([0,0]);
  useEffect(()=>()=>{selectionRequests.current[0]++;selectionRequests.current[1]++;},[]);

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

  // This is only the visitor's local preference, not a community vote.
  useEffect(() => {
    setSelectedRound(null);
    setUserVote(null);
    setActionError('');
    try {
      const saved = localStorage.getItem(`duel_vote_${product1.id}_${product2.id}`);
      if (saved === '1' || saved === '2') setUserVote(Number(saved) as 1 | 2);
    } catch { /* Storage is optional; viewing comparisons remains available. */ }
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

  // Abort old searches so slower responses cannot replace the latest query.
  useEffect(() => {
    const query=search1.trim();
    const controller=new AbortController();
    setResults1([]);
    if(query.length<2){setLoading1(false);return;}
    setLoading1(true);
    const timer=setTimeout(async()=>{
      try {
        const response=await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`,{signal:controller.signal});
        if(!response.ok)throw new Error('search failed');
        const data=await response.json();
        if(!controller.signal.aborted){setResults1(Array.isArray(data)?data:[]);setOpenDropdown1(true);}
      } catch { if(!controller.signal.aborted)setActionError('Arama yüklenemedi. Lütfen yeniden deneyin.'); }
      finally { if(!controller.signal.aborted)setLoading1(false); }
    },200);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[search1]);

  // Abort old searches so slower responses cannot replace the latest query.
  useEffect(() => {
    const query=search2.trim();
    const controller=new AbortController();
    setResults2([]);
    if(query.length<2){setLoading2(false);return;}
    setLoading2(true);
    const timer=setTimeout(async()=>{
      try {
        const response=await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`,{signal:controller.signal});
        if(!response.ok)throw new Error('search failed');
        const data=await response.json();
        if(!controller.signal.aborted){setResults2(Array.isArray(data)?data:[]);setOpenDropdown2(true);}
      } catch { if(!controller.signal.aborted)setActionError('Arama yüklenemedi. Lütfen yeniden deneyin.'); }
      finally { if(!controller.signal.aborted)setLoading2(false); }
    },200);
    return ()=>{clearTimeout(timer);controller.abort();};
  },[search2]);

  const handleSelectProduct = async (index:0|1,chosen:Product) => {
    const request=++selectionRequests.current[index];
    setActionError('');
    try {
      const response=await fetch(`/api/products/${encodeURIComponent(chosen.id||chosen.slug)}`);
      if(!response.ok)throw new Error('product unavailable');
      const fullProduct=await response.json();
      if(!fullProduct?.id || !fullProduct?.category)throw new Error('invalid product');
      if(request!==selectionRequests.current[index])return;
      onProductChange?.(index,fullProduct);
      if(index===0){setSearch1('');setOpenDropdown1(false);}else{setSearch2('');setOpenDropdown2(false);}
    } catch {if(request===selectionRequests.current[index])setActionError('Seçilen ürün yüklenemedi. Mevcut karşılaştırma korundu; yeniden deneyin.');}
  };

  const handleVote = (choice: 1 | 2) => {
    if (userVote === choice) return;
    setUserVote(choice);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem(`duel_vote_${product1.id}_${product2.id}`, String(choice)); } catch { setActionError('Tercihiniz bu tarayıcıya kaydedilemedi.'); }
    }
  };

  const handleShare = async (network?: 'twitter' | 'facebook') => {
    const shareUrl = new URL('/compare', window.location.origin);
    shareUrl.searchParams.set('d1', product1.slug || product1.id);
    shareUrl.searchParams.set('d2', product2.slug || product2.id);
    const url=shareUrl.href;
    const text=`${product1.name} vs ${product2.name} | aceleEtme`;
    setActionError('');
    if(network==='twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,'_blank','noopener,noreferrer');
    else if(network==='facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,'_blank','noopener,noreferrer');
    else try { await navigator.clipboard.writeText(url); setShareCopied(true); setTimeout(()=>setShareCopied(false),2000); }
    catch { setShareCopied(false); setActionError('Bağlantı kopyalanamadı. Tarayıcının pano iznini kontrol edin.'); }
  };

  const products = [product1, product2];
  const duelRows = getDuelRows(products);
  const score1 = getProductScore(product1), score2 = getProductScore(product2);
  // Catalog scores do not carry a shared, verified measurement method.
  const overallWinner = 'insufficient_data' as const;
  const roundDefs = duelRows.map((row,index) => {
    const outcome = getMetricOutcome(row,products);
    return {id:index+1,title:row.label,shortTitle:row.label,icon:'⚖',
      winner: outcome===1||outcome===2||outcome==='tie' ? outcome : undefined,
      p1Val:row.getValue(product1),p2Val:row.getValue(product2),
      p1Sub:'Katalog kaydı',p2Sub:'Katalog kaydı',diff:describeMetric(row,products)};
  });
  const statRows = duelRows.filter(row=>row.id!=='price').slice(0,3);
  const bars = (product:Product) => statRows.map(row => ({id:row.id,label:row.label,val:row.getValue(product),icon:<Scale className="w-3 h-3 shrink-0"/>}));
  const statBars1=bars(product1),statBars2=bars(product2);

  return (
    <div className="w-full space-y-6 pb-24 sm:pb-8">
      {actionError && <p role="alert" className="text-sm text-rose-700 bg-rose-50 rounded-xl p-3">{actionError}</p>}
      
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
          <div className={`min-w-0 col-span-1 lg:col-span-4 order-1 lg:order-1 space-y-2 sm:space-y-3 relative ${
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
                  onKeyDown={event=>{if(event.key==='Escape')setOpenDropdown1(false);}}
                  aria-label="Birinci karşılaştırma cihazını ara" placeholder="1. Cihaz..."
                  className="min-h-11 w-full pl-7 sm:pl-9 pr-11 py-2 sm:py-2.5 bg-slate-900/85 backdrop-blur-xl border border-emerald-400/50 hover:border-emerald-400 focus:border-emerald-300 rounded-xl sm:rounded-2xl text-base sm:text-sm font-semibold text-white placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-emerald-400/40 transition-all"
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
                    aria-label="Birinci cihaz aramasını temizle" className="absolute right-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-white cursor-pointer"
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
                      className="w-full grid grid-cols-[36px_minmax(0,1fr)] items-center gap-2.5 p-3 hover:bg-emerald-500/20 text-left transition-colors group cursor-pointer"
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
                        <div className="text-[11px] sm:text-xs font-bold text-white break-words leading-relaxed group-hover:text-emerald-300">
                          {item.name}
                        </div>
                      </div>
                      <div className="col-span-2 border-t border-white/10 pt-2 text-left">
                        <div className="text-[10px] sm:text-[11px] font-black text-slate-200">
                          <ProductPriceSummary product={item} compact dark />
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
                  <h2 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 break-words min-h-[3rem] sm:min-h-[2.75rem] leading-snug" title={product1.name}>
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
                  <p className="text-[10px] text-slate-500">Katalog puanı · ölçüm yöntemi doğrulanmadı</p>
                  <div className="mt-2"><ProductPriceSummary product={product1} compact /></div>
                </div>

                {/* Stat Power Bars (Dynamic Category-Aware) */}
                <div className="space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs pt-2 sm:pt-3 border-t border-slate-200/80">
                  {getSpecVerificationNotice(product1) && <p className="text-[10px] text-amber-800" title={getSpecVerificationNotice(product1)!}>Özellikler kaynak doğrulaması bekliyor</p>}
                  {statBars1.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                        <span className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                          {item.icon}
                          <span className="text-[10px] sm:text-xs truncate">{item.label}</span>
                        </span>
                        <span className="font-black text-slate-800 text-[9.5px] sm:text-xs truncate ml-1">{item.val}</span>
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
                <span className="hidden sm:inline">Mağazada Ara</span>
                <span className="inline sm:hidden">Mağazada Ara</span>
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
                    className={`min-h-11 w-full py-1.5 px-2 sm:px-3 rounded-xl sm:rounded-full text-[10px] sm:text-[11px] font-black tracking-wide border transition-all flex items-center gap-1 sm:gap-1.5 shadow-sm cursor-pointer ${
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

            <p className="text-xs text-slate-600 mt-2">Benim tercihim · yalnız bu tarayıcıda saklanır</p>
            <div className="w-full grid grid-cols-2 gap-2 mt-2 z-20">
              <button
                aria-pressed={userVote===1} aria-label={`${product1.name} benim tercihim`}
                onClick={() => handleVote(1)}
                className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                  userVote === 1
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <ThumbsUp className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="truncate">{userVote === 1 ? '✓ ' : ''}{product1.brand}</span>
              </button>

              <button
                aria-pressed={userVote===2} aria-label={`${product2.name} benim tercihim`}
                onClick={() => handleVote(2)}
                className={`py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center justify-center gap-1 cursor-pointer border ${
                  userVote === 2
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-white/80 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <ThumbsUp className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="truncate">{userVote === 2 ? '✓ ' : ''}{product2.brand}</span>
              </button>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: SEARCH COMBOBOX 2 + FROSTED GLASS CARD ================= */}
          <div className={`min-w-0 col-span-1 lg:col-span-4 order-2 lg:order-3 space-y-2 sm:space-y-3 relative ${
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
                  onKeyDown={event=>{if(event.key==='Escape')setOpenDropdown2(false);}}
                  aria-label="İkinci karşılaştırma cihazını ara" placeholder="2. Cihaz..."
                  className="min-h-11 w-full pl-7 sm:pl-9 pr-11 py-2 sm:py-2.5 bg-slate-900/85 backdrop-blur-xl border border-cyan-400/50 hover:border-cyan-400 focus:border-cyan-300 rounded-xl sm:rounded-2xl text-base sm:text-sm font-semibold text-white placeholder-slate-400 shadow-[0_4px_20px_rgba(0,0,0,0.3)] focus:outline-none focus:ring-2 focus:ring-cyan-400/40 transition-all"
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
                    aria-label="İkinci cihaz aramasını temizle" className="absolute right-0 flex h-11 w-11 items-center justify-center text-slate-400 hover:text-white cursor-pointer"
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
                      className="w-full grid grid-cols-[36px_minmax(0,1fr)] items-center gap-2.5 p-3 hover:bg-cyan-500/20 text-left transition-colors group cursor-pointer"
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
                        <div className="text-[11px] sm:text-xs font-bold text-white break-words leading-relaxed group-hover:text-cyan-300">
                          {item.name}
                        </div>
                      </div>
                      <div className="col-span-2 border-t border-white/10 pt-2 text-left">
                        <div className="text-[10px] sm:text-[11px] font-black text-slate-200">
                          <ProductPriceSummary product={item} compact dark />
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
                  <h2 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 break-words min-h-[3rem] sm:min-h-[2.75rem] leading-snug" title={product2.name}>
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
                  <p className="text-[10px] text-slate-500">Katalog puanı · ölçüm yöntemi doğrulanmadı</p>
                  <div className="mt-2"><ProductPriceSummary product={product2} compact /></div>
                </div>

                {/* Stat Power Bars (Dynamic Category-Aware) */}
                <div className="space-y-1.5 sm:space-y-2.5 text-[10px] sm:text-xs pt-2 sm:pt-3 border-t border-slate-200/80">
                  {getSpecVerificationNotice(product2) && <p className="text-[10px] text-amber-800" title={getSpecVerificationNotice(product2)!}>Özellikler kaynak doğrulaması bekliyor</p>}
                  {statBars2.map((item) => (
                    <div key={item.id}>
                      <div className="flex justify-between items-center font-bold text-slate-600 mb-0.5 sm:mb-1">
                        <span className="flex items-center gap-1 sm:gap-1.5 min-w-0">
                          {item.icon}
                          <span className="text-[10px] sm:text-xs truncate">{item.label}</span>
                        </span>
                        <span className="font-black text-slate-800 text-[9.5px] sm:text-xs truncate ml-1">{item.val}</span>
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
                <span className="hidden sm:inline">Mağazada Ara</span>
                <span className="inline sm:hidden">Mağazada Ara</span>
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
              className="min-h-11 bg-white hover:bg-slate-100 text-slate-700 font-bold px-3 py-1.5 rounded-xl border border-slate-300/80 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{shareCopied ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}</span>
            </button>
            <div className="hidden sm:inline-flex items-center gap-1.5 text-slate-500 font-medium bg-white/60 px-3 py-1.5 rounded-xl border border-slate-200/60">
              <span>RoboPengu Özellik Karşılaştırması</span>
            </div>
          </div>

          {/* Right Social Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare('facebook')}
              className="min-h-11 min-w-11 justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold p-1.5 px-2.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
              aria-label="Facebook ile paylaş"
              title="Facebook ile Paylaş"
            >
              <span className="font-black text-xs">f</span>
            </button>

            <button
              onClick={() => handleShare('twitter')}
              className="min-h-11 min-w-11 justify-center bg-slate-900 hover:bg-slate-800 text-white font-bold p-1.5 px-2.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
              aria-label="X ile paylaş"
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

      {/* Kayıtlı ürün özetleri */}
      <CompareVerdictCard products={products} />

      {/* 🔬 VERSUS & ANTUTU LEVEL DEEP ENGINEERING SPECIFICATIONS (5 CATEGORIES)   */}
      {/* ========================================================================= */}
      <DeepCompareSections product1={product1} product2={product2} />

    </div>
  );
}

export default DuelArena;
