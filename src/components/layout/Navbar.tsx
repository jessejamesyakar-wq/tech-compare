'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  Scale
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

  // Real-time live product search via lightweight API route
  useEffect(() => {
    let isMounted = true;
    const trimmed = query.trim();

    if (trimmed.length > 1) {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Product[]) => {
          if (isMounted) {
            setSearchResults(Array.isArray(data) ? data : []);
            setSelectedIndex(-1);
          }
        })
        .catch(() => {
          if (isMounted) setSearchResults([]);
        });
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
    }

    return () => {
      isMounted = false;
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

      // TV / Keyboard Arrow navigation inside results
      if (isFocused && searchResults.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
        } else if (e.key === 'Enter' && selectedIndex >= 0 && searchResults[selectedIndex]) {
          e.preventDefault();
          handleSelectResult(searchResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused, searchResults, selectedIndex]);

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

  const handleSelectResult = (item: Product) => {
    setQuery('');
    setIsFocused(false);
    
    if (item.category === 'tvs') {
      router.push(`/tvs/${item.slug || item.id}`);
    } else if (item.category === 'laptops') {
      router.push(`/laptops/${item.slug || item.id}`);
    } else if (item.category === 'appliances') {
      router.push(`/appliances/${item.slug || item.id}`);
    } else if (item.category === 'tablets') {
      router.push(`/tablets/${item.slug || item.id}`);
    } else if (item.category === 'smartwatches') {
      router.push(`/smartwatches/${item.slug || item.id}`);
    } else if (item.category === 'headphones') {
      router.push(`/headphones/${item.slug || item.id}`);
    } else if (item.category === 'consoles') {
      router.push(`/consoles/${item.slug || item.id}`);
    } else if (item.category === 'monitors') {
      router.push(`/monitors/${item.slug || item.id}`);
    } else {
      router.push(`/phones/${item.slug || item.id}`);
    }
  };

  const popularQuickTags = ['iPhone 17', 'LG OLED', 'Samsung S26', 'MacBook Pro', 'PS5 Pro', 'Dyson V15'];

  // Reusable Search Results List Renderer
  const renderDropdownResults = () => {
    if (!isFocused) return null;

    // 1. Show Popular Quick Tags when query is empty or 1 char
    if (query.trim().length <= 1) {
      return (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl"
        >
          <div className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 px-1">
            🔥 Popüler Aramalar
          </div>
          <div className="flex flex-wrap gap-1.5">
            {popularQuickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setQuery(tag);
                  setIsFocused(false);
                  router.push(`/search?q=${encodeURIComponent(tag)}`);
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 2. Show Live Search Results
    return (
      <div
        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl max-h-[60vh] sm:max-h-96 overflow-y-auto"
      >
        {searchResults.length === 0 ? (
          <div className="py-6 text-center text-slate-500 text-xs font-semibold">
            {t.noResults || 'Eşleşen ürün bulunamadı'}
          </div>
        ) : (
          <>
            {searchResults.slice(0, 8).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelectResult(item)}
                className={`flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer group ${
                  selectedIndex === idx
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700'
                    : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent active:bg-emerald-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={44}
                      height={44}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-slate-900 dark:text-white text-xs sm:text-sm font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                      <span className="uppercase font-black text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span className="truncate">{item.brand}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-black block tabular-nums">
                    ₺{item.basePrice.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            ))}

            <div
              onClick={() => handleSearchSubmit()}
              className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-center"
            >
              <button
                type="button"
                className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{t.allResultsCount || 'Tüm Sonuçları Gör'} ({searchResults.length} {t.productsWord || 'Ürün'})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
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
                    onChange={(e) => setQuery(e.target.value)}
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
                  onChange={(e) => setQuery(e.target.value)}
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
