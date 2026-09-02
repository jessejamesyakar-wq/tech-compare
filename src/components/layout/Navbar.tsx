'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { Language } from '@/lib/types';
import { searchProducts } from '@/lib/data';
import { Product } from '@/lib/types';
import { Logo } from './Logo';
import { CategoryBar } from './CategoryBar';
import {
  Search,
  ChevronDown,
  X,
  Sparkles,
  Globe,
  Flame,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

const POPULAR_SEARCH_TAGS = [
  'iPhone 16 Pro',
  'Samsung S26 Ultra',
  'PlayStation 5 Pro',
  'LG OLED TV',
  'MacBook Pro M3',
  'Dyson Gen5'
];

export function Navbar() {
  const { t, language, setLanguage, languageNames } = useI18n();
  const { compareList } = useCompare();
  const pathname = usePathname();
  const router = useRouter();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Real-time search query execution
  useEffect(() => {
    if (query.trim().length > 1) {
      searchProducts(query).then((res) => {
        setSearchResults(res);
        setSelectedIndex(-1);
      });
    } else {
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [query]);

  // Focus mobile input when mobile search overlay opens
  useEffect(() => {
    if (isMobileSearchOpen) {
      const timer = setTimeout(() => {
        mobileSearchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isMobileSearchOpen]);

  // Global ⌘K / Ctrl+K keyboard shortcut listener & TV D-Pad / Arrow keys navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileSearchOpen(true);
        } else {
          searchInputRef.current?.focus();
          setIsFocused(true);
        }
      }

      if (e.key === 'Escape') {
        setQuery('');
        setIsFocused(false);
        setIsMobileSearchOpen(false);
        searchInputRef.current?.blur();
        mobileSearchInputRef.current?.blur();
      }

      // TV / Keyboard Arrow navigation inside results
      if ((isFocused || isMobileSearchOpen) && searchResults.length > 0) {
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
  }, [isFocused, isMobileSearchOpen, searchResults, selectedIndex]);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      setIsFocused(false);
      setIsMobileSearchOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectResult = (item: Product) => {
    setQuery('');
    setIsFocused(false);
    setIsMobileSearchOpen(false);
    
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

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    setIsFocused(false);
    setIsMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* 1. Left: Logo (Responsive auto-width) */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="group block" title="aceleEtme Ana Sayfası">
              <Logo />
            </Link>
          </div>

          {/* 2. Center: Desktop & Tablet Search Bar (md and up) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-xl mx-auto relative">
            <form onSubmit={handleSearchSubmit} className="w-full">
              <div
                className={`w-full flex items-center justify-between bg-slate-100/90 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 text-xs px-4 py-2.5 rounded-full border transition-all shadow-2xs backdrop-blur-md ${
                  isFocused
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-white dark:bg-slate-900 shadow-md'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <button type="submit" aria-label="Arama yap" className="cursor-pointer">
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
                    placeholder={isFocused ? '' : 'Model, Marka veya Özellik Ara (ör. iPhone 17, OLED, 144Hz...)'}
                    className="w-full bg-transparent text-slate-900 dark:text-white text-xs font-bold focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />

                  {query && (
                    <button
                      type="button"
                      onClick={() => {
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
                  <div className="hidden lg:flex items-center gap-1.5 shrink-0 pl-2 pointer-events-none">
                    <kbd className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-extrabold shadow-2xs">
                      ⌘K / Hızlı Ara
                    </kbd>
                  </div>
                )}
              </div>
            </form>

            {/* Floating Instant Auto-Complete Dropdown for Desktop/Tablet */}
            {isFocused && query.trim().length > 1 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl max-h-96 overflow-y-auto"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur race condition
              >
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs font-semibold">
                    {t.noResults}
                  </div>
                ) : (
                  <>
                    {searchResults.slice(0, 8).map((item, idx) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className={`flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer group ${
                          selectedIndex === idx
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-slate-900 dark:text-white text-xs font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                              <span className="uppercase font-black text-[9px] text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                                {item.category}
                              </span>
                              <span>•</span>
                              <span className="truncate">{item.brand}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black block">
                            ₺{item.basePrice.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={(e) => handleSearchSubmit(e)}
                      className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-center"
                    >
                      <button className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                        <span>Tüm Sonuçları Gör ({searchResults.length} Ürün)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* 3. Center/Right for Mobile Phones (< md): Direct Clickable Quick Search Button */}
          <div className="flex md:hidden flex-1 justify-end items-center gap-2">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="flex-1 max-w-[200px] sm:max-w-xs flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs font-semibold px-3 py-2 rounded-full border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">Ürün Ara...</span>
            </button>
          </div>

          {/* 4. Right: Language Selector Pill */}
          <div className="shrink-0 flex items-center gap-2">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-2.5 sm:px-3 py-2 rounded-full border border-slate-200 transition-all cursor-pointer shadow-2xs"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="uppercase text-xs font-black">TR</span>
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
      </div>

      {/* Global Persistent Category Navigation Bar */}
      <CategoryBar />

      {/* ========================================================================= */}
      {/* 📱 MOBILE & TABLET FULL-SCREEN LIVE SEARCH MODAL OVERLAY (100% TOUCH SAFE) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex flex-col justify-start p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] w-full max-w-xl mx-auto"
            >
              {/* Search Form Header */}
              <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2.5">
                <div className="flex-1 flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-3.5 py-2.5 border border-slate-200/80 dark:border-slate-700">
                  <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                  <form onSubmit={handleSearchSubmit} className="w-full">
                    <input
                      ref={mobileSearchInputRef}
                      type="search"
                      inputMode="search"
                      enterKeyHint="search"
                      autoCapitalize="off"
                      autoCorrect="off"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Model, Marka veya Özellik Ara..."
                      className="w-full bg-transparent text-slate-900 dark:text-white text-xs sm:text-sm font-bold focus:outline-none placeholder:text-slate-400"
                    />
                  </form>
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-2.5 rounded-2xl transition-colors cursor-pointer"
                >
                  Kapat
                </button>
              </div>

              {/* Suggestions / Results Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {query.trim().length <= 1 ? (
                  <div className="space-y-3 py-2">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-500 uppercase tracking-wider px-1">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      <span>Popüler Aramalar</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {POPULAR_SEARCH_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagClick(tag)}
                          className="bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 text-slate-700 dark:text-slate-300 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                          <span>{tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="py-10 text-center space-y-2">
                    <p className="text-slate-700 dark:text-slate-300 text-sm font-bold">
                      &quot;{query}&quot; ile eşleşen ürün bulunamadı.
                    </p>
                    <p className="text-xs text-slate-400">
                      Farklı bir model adı veya marka deneyebilirsiniz.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block px-1">
                      Sonuçlar ({searchResults.length})
                    </span>

                    {searchResults.slice(0, 10).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/70 dark:border-slate-700/80 transition-all cursor-pointer group active:scale-[0.99]"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden flex items-center justify-center p-1.5 border border-slate-200/80 dark:border-slate-700 shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-slate-900 dark:text-white text-xs sm:text-sm font-black group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                              <span className="uppercase font-black text-[9px] text-emerald-700 bg-emerald-100/70 dark:bg-emerald-950/80 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                                {item.category}
                              </span>
                              <span>•</span>
                              <span className="truncate">{item.brand}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm font-black block">
                            ₺{item.basePrice.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={handleSearchSubmit}
                      className="w-full py-3 bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 mt-2 shadow-md"
                    >
                      <span>Tüm Sonuçları Gör ({searchResults.length} Ürün)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;
