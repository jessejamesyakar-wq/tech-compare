'use client';

import { useI18n } from '@/lib/i18n/context';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/ui/ProductImage';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/types';
import { useCompare } from '@/context/CompareContext';
import { Search, ChevronRight, Scale, Check, Filter, Sparkles, ShoppingBag, Award, ArrowUpDown, RefreshCw } from 'lucide-react';

function SearchContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';
  
  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [queryInput, setQueryInput] = useState(queryParam);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc' | 'rating'>('relevance');

  // Gemini 3.8 AI Assistant State
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

  useEffect(() => {
    setQueryInput(queryParam);
    const trimmed = queryParam.trim();
    if (trimmed) {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data: Product[]) => {
          setResults(Array.isArray(data) ? data : []);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));

      // Fetch Gemini recommendations if query has natural language intent or is long
      const isAiIntent =
        trimmed.length >= 6 &&
        (/\b(bütçe|öneri|tavsiye|en iyi|hangisi|fiyat|uygun|için|kamera|oyun|alınır mı|\?)\b/i.test(trimmed) ||
          trimmed.split(/\s+/).length >= 2);

      if (isAiIntent) {
        setGeminiLoading(true);
        fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: trimmed }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data) setGeminiData(data);
          })
          .catch((err) => console.error('Search page Gemini error:', err))
          .finally(() => setGeminiLoading(false));
      } else {
        setGeminiData(null);
      }
    } else {
      setResults([]);
      setGeminiData(null);
    }
  }, [queryParam]);

  const triggerGeminiExplicitly = () => {
    const trimmed = queryParam.trim() || queryInput.trim();
    if (!trimmed) return;
    setGeminiLoading(true);
    fetch('/api/ai-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: trimmed }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setGeminiData(data);
      })
      .catch((err) => console.error('Search page Gemini error:', err))
      .finally(() => setGeminiLoading(false));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(queryInput.trim())}`);
    }
  };

  const getProductHref = (p: Product) => {
    if (p.category === 'tvs') return `/tvs/${p.slug}`;
    if (p.category === 'laptops') return `/laptops/${p.slug}`;
    if (p.category === 'appliances') return `/appliances/${p.slug}`;
    if (p.category === 'tablets') return `/tablets/${p.slug}`;
    if (p.category === 'smartwatches') return `/smartwatches/${p.slug}`;
    if (p.category === 'headphones') return `/headphones/${p.slug}`;
    if (p.category === 'consoles') return `/consoles/${p.slug}`;
    return `/phones/${p.slug}`;
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'smartphones': return 'Telefonlar';
      case 'tvs': return 'Televizyonlar';
      case 'laptops': return 'Laptoplar';
      case 'appliances': return 'Ev Aletleri';
      case 'tablets': return 'Tabletler';
      case 'smartwatches': return 'Akıllı Saatler';
      case 'headphones': return 'Kulaklıklar';
      case 'consoles': return 'Konsollar';
      default: return cat;
    }
  };

  // Filter results by category
  const filteredResults = results.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  // Sort results
  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.basePrice || 0) - (b.basePrice || 0);
    if (sortBy === 'price-desc') return (b.basePrice || 0) - (a.basePrice || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0; // relevance keeps default search order
  });

  // Count per category
  const categoryCounts: Record<string, number> = {};
  results.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const popularSearches = ['iPhone 17', 'LG OLED', 'Samsung S26', 'PS5 Pro', '144Hz', 'Dyson V15', 'MacBook Pro'];

  return (
    <div className="space-y-6 py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-emerald-600 font-bold">Arama Sonuçları</span>
      </div>

      {/* Main Search Input Stage */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>CANLI AKILLI ARAMA MOTORU</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {queryParam ? `"${queryParam}" için arama sonuçları` : 'Ürün veya Özellik Arayın'}
          </h1>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Model, Marka, Özellik veya Fiyat Ara..."
                className="w-full bg-slate-900/90 text-white text-sm font-bold pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-6 py-3.5 rounded-2xl transition-colors cursor-pointer shadow-md shrink-0 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Ara</span>
            </button>
          </form>

          {/* Suggested Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-400">
            <span className="font-bold text-slate-300 mr-1">Popüler:</span>
            {popularSearches.map((chip) => (
              <button
                key={chip}
                onClick={() => router.push(`/search?q=${encodeURIComponent(chip)}`)}
                className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700/60 text-[11px] font-semibold transition-all cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ✨ GEMINI 3.8 AI SHOPPING ADVISOR BANNER                  */}
      {/* ========================================================= */}
      {geminiLoading && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/30 border border-emerald-300/80 dark:border-emerald-700/60 rounded-3xl p-5 shadow-xs animate-pulse">
          <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Google Gemini 3.8 bütçe ve donanım analizini yapıyor...</span>
            <span className="text-[10px] ml-auto bg-emerald-200/70 dark:bg-emerald-800/60 text-emerald-900 dark:text-emerald-200 px-2.5 py-0.5 rounded-full font-black">
              RoboPengu 🐧
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Katalogdaki tüm alternatifler taranıyor, en yüksek fiyat/performans dengeli modeller seçiliyor...
          </p>
        </div>
      )}

      {geminiData && geminiData.recommendations && geminiData.recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-emerald-950/30 dark:via-slate-900 dark:to-teal-950/20 border border-emerald-300/90 dark:border-emerald-700/60 rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-800/40 pb-3">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-black text-sm sm:text-base">
              <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-500" />
              <span>Gemini 3.8 & RoboPengu Uzman Tavsiyesi</span>
              <span className="text-base">🐧</span>
            </div>
            <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-2xs">
              Yapay Zeka Analizi
            </span>
          </div>

          {geminiData.reply && (
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold leading-relaxed bg-white/80 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-emerald-100 dark:border-slate-700">
              "{geminiData.reply}"
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
            {geminiData.recommendations.map((rec, idx) => (
              <Link
                key={rec.productId || idx}
                href={getProductHref({ id: rec.productId, slug: rec.slug, category: rec.category } as any)}
                className="bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-100 dark:bg-emerald-900/60 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      {getCategoryLabel(rec.category)}
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                      ✨ En İyi Tercih #{idx + 1}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                    {rec.productName}
                  </h4>
                  {rec.reason && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-1.5 leading-snug">
                      💡 {rec.reason}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold">En Uygun Fiyat</span>
                  <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                    ₺{rec.price.toLocaleString('tr-TR')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Explicit trigger button if Gemini hasn't run yet */}
      {!geminiData && !geminiLoading && queryParam && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={triggerGeminiExplicitly}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>"{queryParam}" için Gemini 3.8 Alışveriş Danışmanına Sor</span>
          </button>
        </div>
      )}

      {/* Filter Tabs & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tümü ({results.length})
          </button>

          {Object.entries(categoryCounts).map(([catKey, count]) => (
            <button
              key={catKey}
              onClick={() => setSelectedCategory(catKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                selectedCategory === catKey
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getCategoryLabel(catKey)} ({count})
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-extrabold text-slate-600">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-100 text-slate-800 text-xs font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="relevance">Önerilen (En Alakalı)</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
            <option value="rating">En Yüksek Puanlılar</option>
          </select>
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Ürün kataloğu taranıyor...</p>
        </div>
      )}

      {/* Search Results Grid */}
      {!loading && sortedResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {sortedResults.map((product) => {
            const inCompare = isInCompare(product.id);
            const offersCount = product.storeOffers?.length || 1;

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs hover:shadow-md relative group"
              >
                {/* Compare Checkbox Button Top Right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inCompare ? removeFromCompare(product.id) : addToCompare(product);
                  }}
                  title={inCompare ? 'Karşılaştırma Listesinde' : 'Karşılaştırmaya Ekle'}
                  className={`absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    inCompare
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 border border-slate-200'
                  }`}
                >
                  {inCompare ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Scale className="w-3.5 h-3.5" />}
                </button>

                {/* Rating Badge Top Left */}
                {product.rating && (
                  <div className="absolute top-2.5 left-2.5 z-10 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-2xs">
                    <Award className="w-3 h-3 text-white" />
                    <span>{product.rating}</span>
                  </div>
                )}

                <Link href={getProductHref(product)} className="flex flex-col items-center text-center w-full">
                  {/* Product Image Stage */}
                  <div className="w-full flex justify-center mb-2.5">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      variant="card"
                      className="group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                    />
                  </div>

                  {/* Brand & Category Badge */}
                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 mb-1">
                    <span className="uppercase font-black text-slate-900">{product.brand}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-extrabold">{getCategoryLabel(product.category)}</span>
                  </div>

                  {/* Product Name */}
                  <h3
                    className="text-slate-900 font-bold text-xs line-clamp-2 min-h-[32px] flex items-center justify-center leading-snug tracking-tight mb-2 px-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  {/* Offers Count & Price */}
                  <div className="w-full pt-2 border-t border-slate-100 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-semibold mb-0.5">
                      {offersCount} Mağaza Teklifi
                    </span>
                    <div className="text-emerald-600 font-black text-xs">
                      {product.basePrice.toLocaleString()} {product.currency || 'TL'}
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && queryParam && sortedResults.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Search className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">
            "{queryParam}" ile eşleşen ürün bulunamadı
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Arama sözcüklerinizi kontrol edebilir veya alternatif marka/model isimleriyle tekrar arama yapabilirsiniz.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2">
            {popularSearches.map((chip) => (
              <button
                key={chip}
                onClick={() => router.push(`/search?q=${encodeURIComponent(chip)}`)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="py-16 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">Yükleniyor...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
