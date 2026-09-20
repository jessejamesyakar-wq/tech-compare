'use client';

import { useI18n } from '@/lib/i18n/context';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/ui/ProductImage';
import { useSearchParams, useRouter } from 'next/navigation';
import { getSearchProductHref, getSearchPrice, compareSearchPrices, type SearchProduct } from '@/lib/searchPresentation';
import { useCompare } from '@/context/CompareContext';
import { Search, ChevronRight, Scale, Check, Sparkles, Award, ArrowUpDown, RefreshCw } from 'lucide-react';
import { LazyAIAssistantModal } from '@/components/ai/LazyAIAssistantModal';

function SearchContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryParam = searchParams.get('q') || '';

  const { addToCompare, removeFromCompare, isInCompare } = useCompare();

  const [queryInput, setQueryInput] = useState(queryParam);
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(Boolean(queryParam.trim()));
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance');

  const [searchError, setSearchError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setQueryInput(queryParam);
    setResults([]);
    setSelectedCategory('all');
    setSearchError('');
    const trimmed = queryParam.trim();
    setLoading(Boolean(trimmed));
    const timeout = trimmed ? setTimeout(() => {
      if (!active) return;
      setSearchError('Arama yanıtı zamanında alınamadı. Lütfen tekrar deneyin.');
      setLoading(false);
      active = false;
      controller.abort();
    }, 15000) : undefined;
    if (trimmed) {
      fetch('/api/search?q=' + encodeURIComponent(trimmed), { signal: controller.signal })
        .then(async res => {
          if (!res.ok) throw new Error(res.status === 400 ? 'Arama en fazla 200 karakter olabilir.' : 'Arama şu anda tamamlanamadı. Lütfen tekrar deneyin.');
          const data = await res.json();
          if (!Array.isArray(data)) throw new Error('Arama yanıtı okunamadı. Lütfen tekrar deneyin.');
          if (active) setResults(data);
        })
        .catch(error => { if (active && error.name !== 'AbortError') setSearchError(error.message); })
        .finally(() => { clearTimeout(timeout); if (active) setLoading(false); });
    }
    return () => { active = false; clearTimeout(timeout); controller.abort(); };
  }, [queryParam, retryKey]);

  const triggerGeminiExplicitly = () => {
    setIsAiModalOpen(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(queryInput.trim() ? `/search?q=${encodeURIComponent(queryInput.trim())}` : '/search');
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
      case 'monitors': return 'Monitörler';
      default: return cat;
    }
  };

  const filteredResults = results.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    return true;
  });

  const sortedResults = [...filteredResults].sort((a, b) => {
    if (sortBy === 'price-asc') return compareSearchPrices(a, b, 'asc');
    if (sortBy === 'price-desc') return compareSearchPrices(a, b, 'desc');
    return 0;
  });

  const categoryCounts: Record<string, number> = {};
  results.forEach((item) => {
    categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
  });

  const popularSearches = ['iPhone 17', 'LG OLED', 'Samsung S26', 'PS5 Pro', '144Hz', 'Dyson V15', 'MacBook Pro'];

  return (
    <div className="space-y-6 py-4">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">Ana Sayfa</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-emerald-600 font-bold">Arama Sonuçları</span>
      </div>

      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold px-3 py-1 rounded-full border border-emerald-500/20 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>ÜRÜN KATALOĞUNDA ARA</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight break-words">
            {queryParam ? `"${queryParam}" için arama sonuçları` : 'Ürün veya Özellik Arayın'}
          </h1>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                aria-label="Aranacak ürün veya özellik"
                maxLength={200}
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Model, Marka, Özellik veya Fiyat Ara..."
                className="w-full bg-slate-900/90 text-white text-base font-bold pl-12 pr-4 py-3.5 rounded-2xl border border-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-inner"
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

      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/25 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white text-lg shadow-sm shrink-0">
            🐧
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>RoboPengu AI Danışmanı</span>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-extrabold px-2 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-700">
                Canlı Asistan
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Bütçe analizi, model tavsiyesi ve site rehberi için sorularınızı anında yanıtlar.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={triggerGeminiExplicitly}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{queryParam ? 'Bu Aramayı RoboPengu’ya Sor 🐧' : 'RoboPengu’ya Sor 🐧'}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            aria-pressed={selectedCategory === 'all'}
            className={`min-h-11 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
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
              aria-pressed={selectedCategory === catKey}
              className={`min-h-11 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shrink-0 ${
                selectedCategory === catKey
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {getCategoryLabel(catKey)} ({count})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-extrabold text-slate-600">Sırala:</span>
          <select
            aria-label="Sonuçları sırala"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-100 text-slate-800 text-base sm:text-xs min-h-11 font-extrabold px-3 py-1.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="relevance">Önerilen (En Alakalı)</option>
            <option value="price-asc">Fiyat: Düşükten Yükseğe</option>
            <option value="price-desc">Fiyat: Yüksekten Düşüğe</option>
          </select>
        </div>
      </div>

      {!loading && results.length >= 20 && <p className="text-xs text-slate-500">İlk 20 eşleşme gösteriliyor. Sıralama bu sonuçlara uygulanır; aramanı model veya kapasiteyle daraltabilirsin.</p>}
      {searchError && (
        <div role="alert" className="p-5 rounded-2xl border border-amber-300 bg-amber-50 text-amber-950">
          <p>{searchError}</p>
          <button type="button" className="mt-2 min-h-11 underline font-bold" onClick={() => setRetryKey(k => k + 1)}>Tekrar Dene</button>
        </div>
      )}
      {loading && (
        <div className="py-16 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Ürün kataloğu taranıyor...</p>
        </div>
      )}

      {!loading && sortedResults.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {sortedResults.map((product) => {
            const inCompare = isInCompare(product.id);

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-3 flex flex-col justify-between transition-all shadow-2xs hover:shadow-md relative group"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    inCompare ? removeFromCompare(product.id) : addToCompare(product);
                  }}
                  aria-label={product.name + (inCompare ? ' — Karşılaştırmadan çıkar' : ' — Karşılaştırmaya ekle')}
                  aria-pressed={inCompare}
                  title={inCompare ? 'Karşılaştırma Listesinde' : 'Karşılaştırmaya Ekle'}
                  className={`absolute top-2.5 right-2.5 z-10 w-11 h-11 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                    inCompare
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-700 border border-slate-200'
                  }`}
                >
                  {inCompare ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Scale className="w-3.5 h-3.5" />}
                </button>

                <Link href={getSearchProductHref(product)} className="flex flex-col items-center text-center w-full">
                  <div className="w-full flex justify-center mb-2.5">
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      variant="card"
                      className="group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                    />
                  </div>

                  <div className="flex items-center gap-1 text-[10px] font-extrabold text-slate-500 mb-1">
                    <span className="uppercase font-black text-slate-900">{product.brand}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-extrabold">{getCategoryLabel(product.category)}</span>
                  </div>

                  <h3
                    className="text-slate-900 font-bold text-xs break-words min-h-[32px] flex items-center justify-center leading-snug tracking-tight mb-2 px-1"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <div className="w-full pt-2 border-t border-slate-100 flex flex-col items-center">
                    {(() => {
                      const evaluated = getSearchPrice(product);
                      const isFresh = evaluated.status === 'fresh';
                      const isStale = evaluated.status === 'stale';
                      const priceVal = evaluated.value;

                      return (
                        <>
                          <span className="text-[10px] text-slate-500 font-semibold mb-0.5">
                            {evaluated.heading}
                          </span>
                          <div className={`font-black text-xs ${isFresh ? 'text-emerald-600' : isStale ? 'text-amber-700' : 'text-slate-600'}`}>
                            {priceVal && priceVal > 0 ? `₺${priceVal.toLocaleString('tr-TR')}` : (evaluated.label || 'Fiyat Yok')}
                          </div>
                          {isFresh ? (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 mt-0.5">
                              Güncel Fiyat
                            </span>
                          ) : isStale ? (
                            <span className="text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-0.5">
                              {evaluated.label}
                            </span>
                          ) : product.basePrice ? (
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                              Fiyat doğrulanmadı
                            </span>
                          ) : null}
                        </>
                      );
                    })()}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {!loading && !searchError && queryParam && sortedResults.length === 0 && (
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
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold min-h-11 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      )}

      <LazyAIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialQuery={queryParam || queryInput}
      />
    </div>
  );
}

export default function SearchClient() {
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
