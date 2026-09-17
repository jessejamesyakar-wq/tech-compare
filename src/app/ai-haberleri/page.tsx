'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Globe,
  Search,
  Bot,
  Cpu,
  Binary,
  Sparkles,
  Microscope,
  Scale,
  Layers,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  X,
  CheckCircle2
} from 'lucide-react';
import { GLOBAL_AI_NEWS, GlobalAiNewsArticle } from '@/lib/ai/aiNewsData';

function AiNewsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);

  // Active AI Assistant simulation state
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<GlobalAiNewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const categories = [
    { id: 'all', label: 'Tümü', icon: Layers },
    { id: 'hardware', label: 'Yonga & GPU', icon: Cpu },
    { id: 'llm', label: 'Modeller & LLM', icon: Bot },
    { id: 'opensource', label: 'Açık Kaynak', icon: Binary },
    { id: 'robotics', label: 'Robotik & Otonom', icon: Sparkles },
    { id: 'science', label: 'Bilim & Tıp', icon: Microscope },
    { id: 'regulation', label: 'Regülasyon', icon: Scale },
  ];

  const filteredNews = useMemo(() => {
    return GLOBAL_AI_NEWS.filter((article) => {
      const matchesCat = selectedCategory === 'all' || article.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.source.toLowerCase().includes(q) ||
        (article.deviceImpact?.text || '').toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleAskAssistant = (article: GlobalAiNewsArticle) => {
    setActiveArticle(article);
    setActivePrompt(article.suggestedPrompt || `${article.title} hakkında donanım analizi yapar mısın?`);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. Page Header & Hero Ambient Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 sm:p-10 shadow-xl border border-emerald-500/20">
        <div className="absolute -top-16 -right-16 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs font-black px-3.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>KÜRESEL YAPAY ZEKA RADARI &amp; DONANIM İSTİHBARATI</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Dünyadaki En Son AI Gelişmeleri ve Cihazınıza Etkisi
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Büyük dil modelleri, NPU yongaları ve otonom teknolojiler dünyasında gerçekleşen son dakika yenilikleri;
            sadece haber olarak değil, <strong>cihaz gereksinimleri, fiyatlar ve satın alma tavsiyeleriyle</strong> birlikte anlık canlı takipte.
          </p>
        </div>
      </div>

      {/* 2. Controls: Category Filter Tabs & Search Input */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Live Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Haber veya donanım ara..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. News Articles Grid */}
      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((article) => (
            <article
              key={article.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden"
            >
              <div className="space-y-3.5">
                {/* Header: Category Badge & Source Time */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10.5px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 uppercase tracking-wide">
                    {article.categoryLabel}
                  </span>
                  <span className="text-[11px] font-medium text-slate-400">
                    {article.date} • {article.source}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {article.title}
                </h2>

                {/* Summary */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {article.summary}
                </p>

                {/* Key Bullet Points */}
                {article.keyPoints && article.keyPoints.length > 0 && (
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    {article.keyPoints.map((point, pIdx) => (
                      <div key={pIdx} className="flex items-start gap-1.5 leading-tight">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Special TechCompare Feature: Device & Wallet Impact Bridge */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {article.deviceImpact && (
                  <div className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl p-3 border border-emerald-200/80 dark:border-emerald-800/40 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                        💡 CİHAZINIZA &amp; CEBİNİZE ETKİSİ
                      </span>
                      <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-2xs border border-emerald-200/60 dark:border-emerald-800/40">
                        {article.deviceImpact.badge}
                      </span>
                    </div>

                    <p className="text-[11px] text-emerald-900 dark:text-emerald-200 font-medium leading-tight">
                      {article.deviceImpact.text}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      {article.deviceImpact.startingPrice && (
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {article.deviceImpact.startingPrice}
                        </span>
                      )}
                      <Link
                        href={article.deviceImpact.linkHref}
                        className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold underline flex items-center gap-0.5 ml-auto"
                      >
                        <span>{article.deviceImpact.linkText}</span>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Bottom Actions: Ask AI & Read Original Source */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAskAssistant(article)}
                    className="flex-1 bg-slate-900 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-emerald-600 text-white text-xs font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Bot className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Asistana Bu Haberi Sor</span>
                  </button>

                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Orijinal Kaynağı Görüntüle"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <Globe className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto animate-pulse" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Aramanıza uygun haber bulunamadı
          </h3>
          <p className="text-xs text-slate-500">
            Farklı bir anahtar kelime deneyebilir veya kategori filtresini sıfırlayabilirsiniz.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
          >
            Filtreleri Temizle
          </button>
        </div>
      )}

      {/* 4. Interactive AI Advisor Modal */}
      {isModalOpen && activeArticle && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    TechCompare AI Donanım Danışmanı
                  </h3>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                    Haber &amp; Donanım Analizi
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white block mb-0.5">💬 Soru:</span>
              <span>&ldquo;{activePrompt}&rdquo;</span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Yapay Zeka Donanım Değerlendirmesi:</span>
              </p>
              <p>
                Bu haberde bahsi geçen teknolojik atılım (<strong>{activeArticle.title}</strong>), tüketici tarafında özellikle işlemci, NPU ve bellek mimarilerini doğrudan etkiliyor.
              </p>
              <p>
                Eğer bu tür yeni nesil modelleri yerel olarak gecikmesiz çalıştırmak veya en yeni yapay zeka özelliklerinden faydalanmak istiyorsanız, sitemizdeki uyumlu cihazları inceleyebilirsiniz:
              </p>
              {activeArticle.deviceImpact && (
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-medium">
                  {activeArticle.deviceImpact.text}
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between gap-2">
              {activeArticle.deviceImpact && (
                <Link
                  href={activeArticle.deviceImpact.linkHref}
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  <span>{activeArticle.deviceImpact.linkText}</span>
                </Link>
              )}
              <button
                onClick={() => setIsModalOpen(false)}
                className="ml-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                Anladım, Kapat
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AiNewsPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-400 text-sm animate-pulse">
        Haber akışı yükleniyor...
      </div>
    }>
      <AiNewsContent />
    </Suspense>
  );
}
