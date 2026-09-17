'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Search, 
  Cpu, 
  Bot, 
  Smartphone, 
  Laptop, 
  Gamepad2, 
  Layers, 
  MessageSquarePlus,
  RefreshCw,
  Globe,
  Clock,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { DailyTechNewsArticle, generateCuratedDailyArticles, getFormattedTurkishDate } from '@/lib/news/dailyTechNewsTypes';

interface GlobalAiNewsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAskAboutNews?: (prompt: string) => void;
}

export function GlobalAiNewsDrawer({
  isOpen,
  onClose,
  onAskAboutNews
}: GlobalAiNewsDrawerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [articles, setArticles] = useState<DailyTechNewsArticle[]>(() => generateCuratedDailyArticles());
  const [dateStr, setDateStr] = useState<string>(() => getFormattedTurkishDate());

  const categories = [
    { id: 'all', label: 'Tümü', icon: Layers },
    { id: 'mobile', label: 'Mobil & Telefon', icon: Smartphone },
    { id: 'hardware', label: 'Donanım & GPU', icon: Cpu },
    { id: 'ai', label: 'Yapay Zekâ', icon: Bot },
    { id: 'pc', label: 'Laptop & PC', icon: Laptop },
    { id: 'gaming', label: 'Oyun & Konsol', icon: Gamepad2 },
    { id: 'robotics', label: 'Robotik & Ev', icon: Sparkles },
  ];

  // Fetch fresh 09:00 tech news from API
  const fetchNews = async (force = false) => {
    try {
      setIsRefreshing(true);
      const url = force ? '/api/cron/daily-tech-news' : '/api/ai-news';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(data.articles);
        }
        if (data.dateStr) {
          setDateStr(data.dateStr);
        }
      }
    } catch (e) {
      console.warn('[GlobalAiNewsDrawer] Fetch error, using curated memory fallback', e);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNews(false);
    }
  }, [isOpen]);

  const filteredNews = useMemo(() => {
    return articles.filter((art) => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.source.toLowerCase().includes(q) ||
        (art.takeaway || '').toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [articles, selectedCategory, searchQuery]);

  // Lead story is the first featured article when viewing 'all' and without search query
  const leadArticle = useMemo(() => {
    if (selectedCategory === 'all' && !searchQuery.trim() && filteredNews.length > 0) {
      return filteredNews.find((a) => a.isLead) || filteredNews[0];
    }
    return null;
  }, [selectedCategory, searchQuery, filteredNews]);

  const listArticles = useMemo(() => {
    if (leadArticle) {
      return filteredNews.filter((a) => a.id !== leadArticle.id);
    }
    return filteredNews;
  }, [filteredNews, leadArticle]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Right Slide-over Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[560px] md:w-[620px] max-w-full bg-[#FCFCFD] dark:bg-slate-900 border-l border-slate-200/90 dark:border-slate-800 z-50 flex flex-col shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Küresel Teknoloji Gündemi"
          >
            {/* The New York Times / Bloomberg Tech Stili Editoryal Başlık */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white shrink-0">
              
              {/* Masthead Bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 font-mono">
                    GLOBAL TECH CHRONICLE
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    HER SABAH 09:00 YENİLENİR
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-medium italic">
                  {dateStr}
                </div>
              </div>

              {/* Main Title & Action Cluster */}
              <div className="pt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight leading-tight">
                    Küresel Teknoloji Gündemi
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    Telefonlar, donanım, yapay zekâ, el konsolları ve yeni nesil cihazlar
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => fetchNews(true)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center transition cursor-pointer"
                    title="Haberleri Yenile (09:00 Güncellemesi)"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-600' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-500 flex items-center justify-center transition cursor-pointer"
                    title="Kapat (ESC)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Arama Kutusu */}
              <div className="mt-3.5 relative">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Model, çip, ekran kartı, konsol veya teknoloji ara..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Kategori Filtre Çubuğu */}
            <div className="px-4 py-2 border-b border-slate-200/80 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-cyan-600 dark:text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3 h-3 shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Editoryal Haber Akışı */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {filteredNews.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xl">
                    🔍
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Aramanıza uygun haber bulunamadı
                  </h4>
                  <p className="text-xs text-slate-500">
                    Farklı bir arama terimi deneyebilir veya kategori filtresini sıfırlayabilirsiniz.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. GÜNÜN MANŞET ANALİZİ (The New York Times Lead Story) */}
                  {leadArticle && (
                    <article className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 overflow-hidden shadow-xs hover:shadow-md transition duration-300 group">
                      <div className="relative w-full h-44 sm:h-52 bg-slate-900 overflow-hidden">
                        <img 
                          src={leadArticle.imageUrl} 
                          alt={leadArticle.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-xs">
                            GÜNÜN MANŞETİ
                          </span>
                          <span className="bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {leadArticle.categoryLabel}
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <div className="flex items-center gap-2 text-[10.5px] text-cyan-300 font-bold uppercase tracking-wider">
                            <span>{leadArticle.source}</span>
                            <span>•</span>
                            <span className="text-slate-300">{leadArticle.readTime}</span>
                          </div>
                          <h4 className="text-sm sm:text-base font-bold leading-snug mt-0.5 group-hover:text-cyan-200 transition">
                            {leadArticle.title}
                          </h4>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {leadArticle.summary}
                        </p>

                        {/* Editoryal Hap Not */}
                        {leadArticle.takeaway && (
                          <div className="bg-blue-50/70 dark:bg-blue-950/40 border-l-2 border-blue-600 p-2.5 rounded-r-xl space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                            <div className="font-extrabold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                              <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              <span>Donanım &amp; Alım Notu:</span>
                            </div>
                            <div className="text-[11.5px] leading-snug text-slate-600 dark:text-slate-300 pl-1">
                              {leadArticle.takeaway}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                          {onAskAboutNews && (
                            <button
                              type="button"
                              onClick={() => {
                                onAskAboutNews(leadArticle.suggestedPrompt || leadArticle.title);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 dark:text-blue-300 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200/80 dark:border-blue-800/80 transition cursor-pointer active:scale-95"
                            >
                              <MessageSquarePlus className="w-3.5 h-3.5" />
                              <span>RoboPengu&apos;ya Danış</span>
                            </button>
                          )}

                          {leadArticle.url && (
                            <a
                              href={leadArticle.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-semibold transition"
                            >
                              <span>Orijinal Kaynak</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  )}

                  {/* 2. DİĞER EDİTORYAL HABERLER (Sağda Thumbnail, Solda Zarif Metin - NYT Standart Formatı) */}
                  {listArticles.map((art) => (
                    <article
                      key={art.id}
                      className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-cyan-400/80 dark:hover:border-cyan-500/60 transition-all duration-200 space-y-2.5 group"
                    >
                      <div className="flex gap-3 sm:gap-4 items-start">
                        {/* Sol: Metin Alanı */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap text-[10px]">
                            <span className="font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-700/80 px-2 py-0.5 rounded uppercase tracking-wide">
                              {art.categoryLabel}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-500 dark:text-slate-400 font-semibold">{art.source}</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-400 font-medium">{art.readTime}</span>
                          </div>

                          <h4 className="text-[13px] sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                            {art.title}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                            {art.summary}
                          </p>
                        </div>

                        {/* Sağ: Editoryal Görsel (16:9 Thumbnail) */}
                        <div className="w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200/80 dark:border-slate-700 shadow-2xs relative">
                          <img 
                            src={art.imageUrl} 
                            alt={art.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      </div>

                      {/* Donanım Hap Notu & Aksiyonlar */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
                        {art.takeaway ? (
                          <div className="text-[10.5px] text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1 truncate max-w-[280px]">
                            <span className="text-amber-500 font-bold shrink-0">💡</span>
                            <span className="truncate">{art.takeaway}</span>
                          </div>
                        ) : <div />}

                        <div className="flex items-center gap-2 shrink-0 ml-auto">
                          {onAskAboutNews && (
                            <button
                              type="button"
                              onClick={() => {
                                onAskAboutNews(art.suggestedPrompt || art.title);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 bg-slate-100 dark:bg-slate-700/80 hover:bg-slate-200 dark:hover:bg-slate-700 px-2.5 py-1 rounded-lg transition cursor-pointer active:scale-95"
                            >
                              <MessageSquarePlus className="w-3 h-3" />
                              <span>Danış</span>
                            </button>
                          )}

                          {art.url && (
                            <a
                              href={art.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                              title="Kaynağı Aç"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </>
              )}
            </div>

            {/* Alt Bilgi */}
            <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-center shrink-0">
              <span className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <span>The Global Tech Chronicle</span>
                <span>•</span>
                <span>Her sabah 09:00 otomatik yenileme</span>
                <span>•</span>
                <span>aceleEtme</span>
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default GlobalAiNewsDrawer;
