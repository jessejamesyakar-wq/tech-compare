'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useI18n } from '@/lib/i18n/context';
import { useCompare } from '@/context/CompareContext';
import { useLogo } from '@/context/LogoContext';
import { Language } from '@/lib/types';
import { searchProducts } from '@/lib/data';
import { Product } from '@/lib/types';
import { Logo } from './Logo';
import {
  Smartphone as PhoneIcon,
  Tv as TvIcon,
  Search,
  Scale,
  ChevronDown,
  X,
  Apple,
  Sparkles,
  SlidersHorizontal,
  Globe,
  Upload
} from 'lucide-react';

export function Navbar() {
  const { t, language, setLanguage, languageNames } = useI18n();
  const { compareList } = useCompare();
  const { setIsModalOpen } = useLogo();
  const pathname = usePathname();
  const router = useRouter();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length > 1) {
      searchProducts(query).then((res) => setSearchResults(res));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSearchResults([]);
    }
  }, [query]);

  // Global ⌘K / Ctrl+K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsFocused(true);
      }
      if (e.key === 'Escape') {
        setQuery('');
        setIsFocused(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length > 0) {
      setIsFocused(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectResult = (item: Product) => {
    setQuery('');
    setIsFocused(false);
    if (item.category === 'tvs') {
      router.push(`/tvs/${item.slug}`);
    } else if (item.category === 'laptops') {
      router.push(`/laptops/${item.slug}`);
    } else if (item.category === 'appliances') {
      router.push(`/appliances/${item.slug}`);
    } else if (item.category === 'tablets') {
      router.push(`/tablets/${item.slug}`);
    } else if (item.category === 'smartwatches') {
      router.push(`/smartwatches/${item.slug}`);
    } else if (item.category === 'headphones') {
      router.push(`/headphones/${item.slug}`);
    } else if (item.category === 'consoles') {
      router.push(`/consoles/${item.slug}`);
    } else {
      router.push(`/phones/${item.slug}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#090D16]/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Link to Homepage */}
          <Link href="/" className="shrink-0 group" title="TechKıyas Ana Sayfası">
            <Logo />
          </Link>

          {/* Center: Direct Inline Writing Search Bar */}
          <div ref={searchContainerRef} className="flex-1 max-w-xl mx-2 sm:mx-6 lg:mx-8 relative">
            <form onSubmit={handleSearchSubmit}>
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
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder={isFocused ? '' : 'Model, Marka veya Özellik Ara (ör. iPhone 17, 144Hz, OLED...)'}
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
                  <div className="hidden sm:flex items-center gap-1.5 shrink-0 pl-2 pointer-events-none">
                    <kbd className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 font-extrabold shadow-2xs">
                      ⌘K / Hızlı Ara
                    </kbd>
                  </div>
                )}
              </div>
            </form>

            {/* Floating Instant Auto-Complete Dropdown */}
            {isFocused && query.trim().length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl max-h-96 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="py-6 text-center text-slate-500 text-xs font-semibold">
                    {t.noResults}
                  </div>
                ) : (
                  <>
                    {searchResults.slice(0, 7).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div>
                            <h4 className="text-slate-900 dark:text-white text-xs font-black group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                              <span className="uppercase font-black text-[9px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-400 px-1.5 py-0.5 rounded">{item.category}</span>
                              <span>•</span>
                              <span>{item.brand}</span>
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-emerald-600 dark:text-emerald-400 text-xs font-black block">
                            {item.basePrice.toLocaleString()} {item.currency}
                          </span>
                        </div>
                      </div>
                    ))}

                    <div
                      onClick={(e) => handleSearchSubmit(e)}
                      className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 text-center"
                    >
                      <button className="w-full py-2 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                        <span>Tüm Sonuçları Gör ({searchResults.length} Ürün)</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Actions: Profile / Language / Settings */}
          <div className="flex items-center gap-2 shrink-0">

            {/* Language / Region Selector Pill (TR) */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black px-3 py-2 rounded-full border border-slate-200 transition-all cursor-pointer"
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

            {/* Profile & Settings Icon Menu */}
            <div className="flex items-center gap-1.5">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black border border-emerald-500/20 shadow-2xs transition-all cursor-pointer"
                title="Sitenin Amblemini Değiştir"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Amblem Değiştir</span>
              </motion.button>


            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
