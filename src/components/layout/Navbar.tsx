'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/ui/ProductImage';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Language } from '@/lib/types';
import { Product } from '@/lib/types';
import { Logo } from './Logo';
import { CategoryBar } from './CategoryBar';
import {
  Search,
  ChevronDown,
  X,
  Globe,
  ArrowRight,
  Scale,
  Sparkles,
  Loader2,
  Bot
} from 'lucide-react';

export function Navbar() {
  const { t, language, setLanguage, languageNames } = useI18n();
  const { compareList } = useCompare();
  const pathname = usePathname();
  const router = useRouter();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);

  // Helper for generating category-specific URLs (supports both Product and GeminiRecommendation)
  const getProductUrl = (item: { category?: string; slug?: string; id?: string; productId?: string }) => {
    const slug = item.slug || item.id || item.productId || '';
    const cat = item.category || 'phones';
    if (cat === 'tvs') return `/tvs/${slug}`;
    if (cat === 'laptops') return `/laptops/${slug}`;
    if (cat === 'appliances') return `/appliances/${slug}`;
    if (cat === 'tablets') return `/tablets/${slug}`;
    if (cat === 'smartwatches') return `/smartwatches/${slug}`;
    if (cat === 'headphones') return `/headphones/${slug}`;
    if (cat === 'consoles') return `/consoles/${slug}`;
    if (cat === 'monitors') return `/monitors/${slug}`;
    return `/phones/${slug}`;
  };

  // Gemini AI Assistant State
  const [geminiData, setGeminiData] = useState<{
    reply: string;
    recommendations: {
      productId: string;
      slug: string;
      productName: string;
      category: string;
      price: number;
      reason: string;
    }[];
  } | null>(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiRequested, setGeminiRequested] = useState(false);
  const abortGeminiRef = useRef<AbortController | null>(null);

  const askGemini = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed) return;

    if (abortGeminiRef.current) {
      abortGeminiRef.current.abort();
    }
    const controller = new AbortController();
    abortGeminiRef.current = controller;

    setGeminiLoading(true);
    setGeminiRequested(true);
    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = await res.json();
        setGeminiData(data);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Gemini fetch error:', err);
      }
    } finally {
      setGeminiLoading(false);
    }
  };

  // Real-time live product search with debouncing & cancellation
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      setSearchResults([]);
      setSelectedIndex(-1);
      setGeminiData(null);
      setGeminiRequested(false);
      if (abortGeminiRef.current) abortGeminiRef.current.abort();
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=8`, {
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Product[]) => {
          setSearchResults(Array.isArray(data) ? data : []);
          setSelectedIndex(-1);
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            setSearchResults([]);
          }
        });
    }, 120);

    // Auto-detect AI intent if query looks like a question or advice request
    const isAiQuery =
      trimmed.length >= 8 &&
      (/\b(bütçe|öneri|tavsiye|en iyi|hangisi|fiyat|fiyatı|uygun|için|kamera|oyun|gaming|alınır mı|\?)\b/i.test(trimmed) ||
        trimmed.split(/\s+/).length >= 3);

    let aiTimer: NodeJS.Timeout | null = null;
    if (isAiQuery && !geminiRequested) {
      aiTimer = setTimeout(() => {
        askGemini(trimmed);
      }, 550);
    }

    return () => {
      clearTimeout(timer);
      if (aiTimer) clearTimeout(aiTimer);
      controller.abort();
    };
  }, [query]);

  // Global ⌘K / Ctrl+K keyboard shortcut listener & TV D-Pad / Arrow keys navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const target = window.innerWidth < 768 ? mobileInputRef.current : searchInputRef.current;
        target?.focus();
        setIsFocused(true);
      }

      if (e.key === 'Escape') {
        setQuery('');
        setIsFocused(false);
        searchInputRef.current?.blur();
        mobileInputRef.current?.blur();
      }

      // Keyboard Arrow navigation inside results
      if (isFocused && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0 && searchResults[selectedIndex]) {
          e.preventDefault();
          const targetItem = searchResults[selectedIndex];
          setQuery('');
          setIsFocused(false);
          router.push(getProductUrl(targetItem));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, searchResults, selectedIndex, router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      const insideDesktop = searchContainerRef.current && searchContainerRef.current.contains(target);
      const insideMobile = mobileSearchContainerRef.current && mobileSearchContainerRef.current.contains(target);

      if (!insideDesktop && !insideMobile) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsFocused(false);
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/search');
    }
  };

  // Live Search Results List Renderer with Gemini 3.8 AI Recommendation Engine
  const renderDropdownResults = () => {
    if (!isFocused) return null;
    const trimmed = query.trim();
    if (trimmed.length === 0) return null;

    const hasGeminiRecs = geminiData && geminiData.recommendations && geminiData.recommendations.length > 0;
    const hasLexicalResults = searchResults.length > 0;

    return (
      <div
        className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl max-h-[70vh] sm:max-h-[520px] overflow-y-auto space-y-3"
      >
        {/* ========================================================= */}
        {/* 1. ✨ GEMINI 3.8 AI INTELLIGENT ASSISTANT SECTION         */}
        {/* ========================================================= */}
        {geminiLoading && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-cyan-950/40 border border-emerald-300/80 dark:border-emerald-700/60 animate-pulse">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>✨ Google Gemini 3.8 Analiz Ediyor...</span>
              <span className="text-[10px] ml-auto bg-emerald-200/60 dark:bg-emerald-800/60 px-2 py-0.5 rounded-full">RoboPengu 🐧</span>
            </div>
            <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 mt-1 font-medium">
              5.768 ürünlük kataloğumuzda bütçeniz ve talebiniz için en doğru modeller taranıyor...
            </p>
          </div>
        )}

        {hasGeminiRecs && (
          <div className="p-3 rounded-xl bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 dark:border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-black text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
                <span>Gemini 3.8 & RoboPengu Tavsiyesi</span>
                <span className="text-xs">🐧</span>
              </div>
              <span className="text-[9px] font-black uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full shadow-2xs">
                Yapay Zeka
              </span>
            </div>

            {geminiData.reply && (
              <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                "{geminiData.reply}"
              </p>
            )}

            <div className="space-y-1.5 pt-1">
              {geminiData.recommendations.map((rec, idx) => (
                <Link
                  key={rec.productId || idx}
                  href={getProductUrl(rec)}
                  onClick={() => {
                    setQuery('');
                    setIsFocused(false);
                  }}
                  className="block p-2 rounded-lg bg-white dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 border border-slate-200/80 dark:border-slate-700 transition-all group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                          {rec.category}
                        </span>
                        <h5 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                          {rec.productName}
                        </h5>
                      </div>
                      {rec.reason && (
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium mt-0.5 line-clamp-1">
                          💡 <span className="font-semibold">{rec.reason}</span>
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                        ₺{rec.price.toLocaleString('tr-TR')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Trigger Button for Gemini if not already requested */}
        {!hasGeminiRecs && !geminiLoading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              askGemini(trimmed);
            }}
            className="w-full py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-900/50 dark:hover:to-teal-900/50 text-emerald-800 dark:text-emerald-300 text-xs font-black rounded-xl border border-emerald-300/80 dark:border-emerald-700/60 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            <span>"{trimmed}" için Gemini 3.8'e Danış (F/P & Bütçe Analizi)</span>
          </button>
        )}

        {/* ========================================================= */}
        {/* 2. ⚡ FAST LEXICAL CATALOG RESULTS SECTION                */}
        {/* ========================================================= */}
        {hasLexicalResults ? (
          <div>
            <div className="px-1 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Doğrudan Eşleşen Modeller</span>
              <span>{searchResults.length} Sonuç</span>
            </div>

            <div className="space-y-1">
              {searchResults.slice(0, 6).map((item, idx) => (
                <Link
                  key={item.id}
                  href={getProductUrl(item)}
                  onClick={() => {
                    setQuery('');
                    setIsFocused(false);
                  }}
                  className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl transition-all cursor-pointer group ${
                    selectedIndex === idx
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent active:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        variant="card"
                        className="w-full h-full group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-slate-900 dark:text-white text-xs font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate leading-tight">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                        <span className="uppercase font-black text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1 py-0.2 rounded">
                          {item.category}
                        </span>
                        <span>•</span>
                        <span className="truncate">{item.brand}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black block tabular-nums">
                      ₺{item.basePrice.toLocaleString('tr-TR')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}`}
                onClick={() => {
                  setIsFocused(false);
                }}
                className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t.allResultsCount || 'Tüm Sonuçları Gör'} ({searchResults.length} {t.productsWord || 'Ürün'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : !hasGeminiRecs && !geminiLoading ? (
          <div className="py-6 text-center text-slate-500 text-xs font-semibold">
            {t.noResults || 'Eşleşen ürün bulunamadı. Yukarıdaki butona tıklayarak Gemini 3.8 AI\'dan tavsiye alabilirsiniz.'}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090D16]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Row 1: Logo & Desktop Inline Search Bar & Right Language/Compare */}
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3 sm:gap-4">
          
          {/* 1. Left: Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="group block" title="aceleEtme Ana Sayfası">
              <Logo />
            </Link>
          </div>

          {/* 2. Center: Desktop Inline Search Bar (md and up) */}
          <div
            ref={searchContainerRef}
            onClick={() => {
              searchInputRef.current?.focus();
              setIsFocused(true);
            }}
            className="hidden md:flex flex-1 max-w-xl mx-auto relative cursor-text"
          >
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div
                className={`w-full flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 text-xs px-4 py-2.5 rounded-full border transition-all shadow-2xs backdrop-blur-md ${
                  isFocused
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-900 shadow-md'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button
                    type="submit"
                    aria-label="Arama yap"
                    className="p-1 rounded-full text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Search className={`w-4 h-4 shrink-0 transition-colors ${isFocused ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                  </button>
                  
                  <input
                    ref={searchInputRef}
                    type="search"
                    inputMode="search"
                    enterKeyHint="search"
                    autoCapitalize="off"
                    autoCorrect="off"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setIsFocused(true);
                    }}
                    onFocus={() => setIsFocused(true)}
                    placeholder={isFocused ? '' : (t.searchBarPlaceholder || 'Model, Marka veya Özellik Ara (ör. iPhone 17, OLED, 144Hz...)')}
                    className="w-full bg-transparent text-slate-900 dark:text-white text-[16px] md:text-xs font-bold focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuery('');
                        searchInputRef.current?.focus();
                      }}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Gemini AI pill action button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFocused) {
                      searchInputRef.current?.focus();
                      setIsFocused(true);
                    }
                    askGemini(query || 'en çok satan teknolojik ürünler');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer shrink-0 ml-1.5 ${
                    geminiLoading
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse border border-amber-300'
                      : geminiData
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/60'
                  }`}
                  title="Google Gemini 3.8 AI Asistanı"
                >
                  {geminiLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  )}
                  <span>✨ Gemini AI</span>
                </button>

                {!isFocused && !query && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      searchInputRef.current?.focus();
                      setIsFocused(true);
                    }}
                    className="hidden lg:flex items-center gap-1.5 shrink-0 pl-2 cursor-pointer"
                  >
                    <span className="bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 text-[10px] px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-extrabold shadow-2xs transition-colors">
                      {t.quickSearchKbd || '⌘K / Hızlı Ara'}
                    </span>
                  </button>
                )}
              </div>
            </form>

            {/* Dropdown Results for Desktop */}
            {renderDropdownResults()}
          </div>

          {/* 3. Right: Compare Link & Language Selector */}
          <div className="shrink-0 flex items-center gap-2">
            
            {/* Quick Compare Indicator */}
            {compareList.length > 0 && (
              <Link
                href="/compare"
                className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-black px-2.5 sm:px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all shadow-2xs"
                title={t.compareNavBtn || "Karşılaştırma Masası"}
              >
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">{t.compareNavBtn || 'Kıyasla'}</span>
                <span className="bg-emerald-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {compareList.length}
                </span>
              </Link>
            )}

            {/* Language Selector Pill */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full border border-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="uppercase text-xs font-black">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </motion.button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white/95 border border-slate-200 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md">
                  {(Object.keys(languageNames) as Language[]).map((langKey) => (
                    <button
                      key={langKey}
                      onClick={() => {
                        setLanguage(langKey);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-extrabold cursor-pointer transition-colors ${
                        language === langKey
                          ? 'bg-emerald-50 text-emerald-700 font-black'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{languageNames[langKey].flag}</span>
                        <span>{languageNames[langKey].name}</span>
                      </span>
                      <span className="uppercase text-[10px] font-black opacity-60">
                        {langKey}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* 📱 MOBILE & TABLET FULL-WIDTH DIRECT INLINE SEARCH BAR (< md)            */}
        {/* Generously padded, full screen width, crystal clear, 0% clipping         */}
        {/* ========================================================================= */}
        <div ref={mobileSearchContainerRef} className="block md:hidden pb-3 relative">
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div
              className={`w-full flex items-center justify-between bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-xs px-3.5 py-2.5 rounded-full border transition-all shadow-2xs ${
                isFocused
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-900 shadow-md'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <button
                  type="submit"
                  aria-label="Arama yap"
                  className="p-1 rounded-full text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
                >
                  <Search className={`w-4 h-4 shrink-0 transition-colors ${isFocused ? 'text-emerald-600' : 'text-slate-400'}`} />
                </button>
                
                <input
                  ref={mobileInputRef}
                  type="search"
                  inputMode="search"
                  enterKeyHint="search"
                  autoCapitalize="off"
                  autoCorrect="off"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setIsFocused(true);
                  }}
                  onFocus={() => setIsFocused(true)}
                  placeholder={t.searchBarMobilePlaceholder || "Model, Marka veya Özellik Ara..."}
                  className="w-full bg-transparent text-slate-900 dark:text-white text-[16px] font-bold focus:outline-none placeholder:text-slate-400"
                />

                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('');
                      mobileInputRef.current?.focus();
                    }}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Mobile Gemini AI button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isFocused) {
                      mobileInputRef.current?.focus();
                      setIsFocused(true);
                    }
                    askGemini(query || 'en popüler teknoloji ürünleri');
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer shrink-0 ml-1 ${
                    geminiLoading
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : geminiData
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  }`}
                  title="Google Gemini 3.8 AI"
                >
                  {geminiLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  ) : (
                    <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />
                  )}
                  <span>Gemini</span>
                </button>
              </div>
            </div>
          </form>

          {/* Direct Dropdown Results for Mobile/Tablet */}
          {renderDropdownResults()}
        </div>

      </div>

      {/* Global Persistent Category Navigation Bar */}
      <CategoryBar />
    </header>
  );
}

export default Navbar;
