'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  ExternalLink, 
  Search, 
  Cpu, 
  Bot, 
  Binary, 
  Microscope, 
  Scale, 
  Layers, 
  MessageSquarePlus,
  RefreshCw,
  Globe
} from 'lucide-react';
import { GlobalAiNewsArticle, GLOBAL_AI_NEWS } from '@/lib/ai/aiNewsData';

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

  const categories = [
    { id: 'all', label: 'Tümü', icon: Layers },
    { id: 'llm', label: 'Modeller & LLM', icon: Bot },
    { id: 'hardware', label: 'Yonga & GPU', icon: Cpu },
    { id: 'opensource', label: 'Açık Kaynak', icon: Binary },
    { id: 'robotics', label: 'Robotik', icon: Sparkles },
    { id: 'science', label: 'Bilim & Tıp', icon: Microscope },
    { id: 'regulation', label: 'Regülasyon', icon: Scale },
  ];

  const filteredNews = useMemo(() => {
    return GLOBAL_AI_NEWS.filter((art) => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.summary.toLowerCase().includes(q) ||
        art.source.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Arka Plan Karartma & Dokunarak Kapatma */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Sağdan Kayan Pencere (Slide-over Drawer) */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[500px] md:w-[560px] max-w-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Dünyadaki Yapay Zeka Haberleri"
          >
            {/* Üst Başlık Çubuğu */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 text-white shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-inner">
                    <Globe className="w-5 h-5 animate-spin-slow" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-sm sm:text-base text-white tracking-tight truncate">
                        Dünyada Yapay Zeka Gündemi
                      </h3>
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        CANLI AKIŞ
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      RoboPengu Canlı Küresel AI & Donanım Bülteni
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    title="Haberleri Yenile"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                    title="Kapat (ESC)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Arama Kutusu */}
              <div className="mt-3.5 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Yapay zeka modelleri, çipler veya şirket ara..."
                  className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:border-cyan-500 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Kategori Filtre Butonları */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-emerald-600 dark:text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Haber Listesi */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {filteredNews.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center text-xl">
                    🔍
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    Aramanıza uygun haber bulunamadı
                  </h4>
                  <p className="text-xs text-slate-500">
                    Farklı bir anahtar kelime deneyebilir veya kategori filtresini temizleyebilirsiniz.
                  </p>
                </div>
              ) : (
                filteredNews.map((art) => (
                  <article
                    key={art.id}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-cyan-400/80 dark:hover:border-cyan-500/60 transition-all duration-200 space-y-2.5 group"
                  >
                    {/* Üst Etiketler & Tarih */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide bg-cyan-50 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-800/60">
                          {art.categoryLabel}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {art.source}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium tabular-nums">
                        {art.date}
                      </span>
                    </div>

                    {/* Başlık */}
                    <h4 className="text-[13px] sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-snug group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                      {art.title}
                    </h4>

                    {/* Özet */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {art.summary}
                    </p>

                    {/* Öne Çıkan Kritik Maddeler */}
                    {art.keyPoints && art.keyPoints.length > 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800/80 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                        {art.keyPoints.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-1.5">
                            <span className="text-cyan-500 dark:text-cyan-400 font-bold shrink-0 mt-0.5">▪</span>
                            <span className="leading-snug">{point}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Aksiyon Butonları */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                      {art.suggestedPrompt && onAskAboutNews && (
                        <button
                          type="button"
                          onClick={() => {
                            onAskAboutNews(art.suggestedPrompt!);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 dark:hover:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-1 rounded-lg transition cursor-pointer active:scale-95"
                          title="Bu haberi RoboPengu'ya sor"
                        >
                          <MessageSquarePlus className="w-3 h-3" />
                          <span>RoboPengu&apos;ya Danış</span>
                        </button>
                      )}

                      {art.url && (
                        <a
                          href={art.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition"
                        >
                          <span>Kaynağı İncele</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* Alt Bilgi */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center shrink-0">
              <span className="text-[10px] text-slate-400 font-medium">
                🐧 RoboPengu Küresel AI Takip Radarı • Güncel Veri Akışı
              </span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
