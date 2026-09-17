'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Search, 
  RefreshCw,
  ExternalLink,
  Layers,
  Smartphone,
  Cpu,
  Bot,
  Laptop,
  Gamepad2,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus
} from 'lucide-react';
import { 
  DailyTechNewsArticle, 
  generateCuratedDailyArticles, 
  getFormattedTurkishDate 
} from '@/lib/news/dailyTechNewsTypes';

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
    { id: 'all', label: 'Ön Sayfa (Tümü)', icon: Layers },
    { id: 'mobile', label: 'Mobil & Çip', icon: Smartphone },
    { id: 'hardware', label: 'Donanım & GPU', icon: Cpu },
    { id: 'ai', label: 'Yapay Zekâ', icon: Bot },
    { id: 'pc', label: 'Dizüstü & PC', icon: Laptop },
    { id: 'gaming', label: 'Oyun & Konsol', icon: Gamepad2 },
    { id: 'robotics', label: 'Robotik & Ev', icon: Sparkles },
  ];

  // Fetch live daily news (refreshing daily at 09:00)
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
      console.warn('[GlobalAiNewsDrawer] Fetch error, keeping curated data:', e);
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

  const leadArticle = useMemo(() => {
    if (selectedCategory === 'all' && !searchQuery.trim() && filteredNews.length > 0) {
      return filteredNews.find((a) => a.isLead) || filteredNews[0];
    }
    return null;
  }, [selectedCategory, searchQuery, filteredNews]);

  const sideArticles = useMemo(() => {
    if (leadArticle) {
      return filteredNews.filter((a) => a.id !== leadArticle.id);
    }
    return filteredNews;
  }, [filteredNews, leadArticle]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Global Injected CSS for Harry Potter Living Newsprint */}
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,400;1,700;1,900&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;0,6..72,700;1,6..72,400;1,6..72,600&family=UnifrakturMaguntia&display=swap');

            .prophet-drawer-paper {
              background-color: #F4EEDF !important;
              color: #1c1917 !important;
              font-family: 'Newsreader', Georgia, serif !important;
            }

            .font-prophet-masthead {
              font-family: 'UnifrakturMaguntia', 'Cinzel Decorative', Georgia, serif !important;
            }

            .font-prophet-headline {
              font-family: 'Playfair Display', Georgia, serif !important;
            }

            .prophet-drop-cap::first-letter {
              float: left;
              font-size: 3.2rem;
              line-height: 2.6rem;
              padding-top: 3px;
              padding-right: 7px;
              font-family: 'Playfair Display', Georgia, serif;
              font-weight: 900;
              color: #0c0a09;
            }

            /* Çift gazete çizgileri */
            .prophet-double-rule {
              border-top: 3px solid #1c1917;
              border-bottom: 1px solid #1c1917;
              height: 6px;
            }

            .prophet-thin-rule {
              border-top: 1px solid #44403c;
              border-bottom: 1px solid #44403c;
              height: 4px;
            }

            /* =================================================== */
            /* HARRY POTTER HAREKETLİ SİHİRLİ FOTOĞRAF ANİMASYONU */
            /* =================================================== */
            .prophet-living-frame {
              position: relative;
              overflow: hidden;
              border: 2px solid #292524;
              box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.4);
              background: #1c1917;
            }

            .prophet-living-img {
              filter: contrast(115%) sepia(25%) brightness(92%) grayscale(15%);
              transform-origin: center center;
              animation: prophetBreathing 8s ease-in-out infinite alternate;
            }

            @keyframes prophetBreathing {
              0% {
                transform: scale(1) translateY(0) rotate(0deg);
                filter: contrast(110%) sepia(26%) brightness(90%) grayscale(20%);
              }
              50% {
                transform: scale(1.06) translateY(-3px) rotate(0.3deg);
                filter: contrast(118%) sepia(18%) brightness(96%) grayscale(10%);
              }
              100% {
                transform: scale(1.03) translateY(-1px) rotate(-0.2deg);
                filter: contrast(114%) sepia(22%) brightness(93%) grayscale(15%);
              }
            }

            .prophet-magic-light {
              position: absolute;
              inset: 0;
              background: linear-gradient(
                105deg,
                transparent 20%,
                rgba(255, 255, 255, 0.22) 35%,
                rgba(56, 189, 248, 0.35) 45%,
                rgba(255, 255, 255, 0.45) 50%,
                rgba(56, 189, 248, 0.25) 55%,
                transparent 70%
              );
              transform: translateX(-160%);
              animation: prophetSweepLight 5.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              mix-blend-mode: overlay;
              pointer-events: none;
            }

            @keyframes prophetSweepLight {
              0% { transform: translateX(-160%) skewX(-15deg); }
              40% { transform: translateX(180%) skewX(-15deg); }
              100% { transform: translateX(180%) skewX(-15deg); }
            }

            @keyframes prophetSpinSlow {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .prophet-spin-slow {
              animation: prophetSpinSlow 14s linear infinite;
            }

            @keyframes prophetNeuralPulse {
              0%, 100% { transform: scale(1); opacity: 0.35; }
              50% { transform: scale(1.2); opacity: 0.8; }
            }
            .prophet-neural-pulse {
              animation: prophetNeuralPulse 3s ease-in-out infinite;
            }

            .prophet-wax-seal {
              background: radial-gradient(circle, #991b1b 0%, #7f1d1d 80%, #450a0a 100%);
              border: 1.5px solid #ef4444;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35), inset 0 0 6px rgba(0, 0, 0, 0.6);
              transform: rotate(-3deg);
            }
          `}} />

          {/* Karartılmış Arka Plan (Backdrop) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs z-50 transition-opacity"
            aria-hidden="true"
          />

          {/* Harry Potter Gelecek Postası Sağ Çekmecesi */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="prophet-drawer-paper fixed top-0 right-0 bottom-0 w-full sm:w-[600px] md:w-[680px] max-w-full z-50 flex flex-col shadow-2xl border-l-2 border-stone-800 overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="The Daily Tech Prophet - Gelecek Postası"
          >
            {/* =================================================== */}
            {/* GAZETE MASTHEAD ÜST KÜNYESİ */}
            {/* =================================================== */}
            <div className="p-4 sm:p-5 pb-2 shrink-0 border-b border-stone-400 bg-[#F4EEDF]">
              
              {/* Gazete Üst Künyesi */}
              <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] font-bold text-stone-700 uppercase tracking-widest pb-1 border-b border-stone-400">
                <span>BASKI NO: 17.842 • SİHİRLİ MATBAA</span>
                <span className="font-black text-stone-950 flex items-center gap-1">
                  <span>⚡ HAREKETLİ FOTOĞRAFLI BASKI ⚡</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fetchNews(true)}
                    className="hover:underline cursor-pointer flex items-center gap-1 text-stone-900"
                    title="Yenile (09:00 Baskısını Al)"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-stone-950' : ''}`} />
                    <span>09:00 BASKISI</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded hover:bg-stone-300 text-stone-700 hover:text-stone-950 transition ml-2 cursor-pointer"
                    title="Kapat (ESC)"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Gazete Ana Logosu */}
              <div className="text-center py-1.5 relative">
                <h1 className="text-3xl sm:text-5xl font-black font-prophet-masthead text-stone-950 tracking-tight select-none leading-none">
                  The Daily Tech Prophet
                </h1>
                <p className="text-[10px] sm:text-[11px] font-serif italic text-stone-700 tracking-wider mt-0.5">
                  "Sihirli Fotoğraflarla Dünyanın En Hızlı Çipleri, Donanımları ve Yeni Nesil Cihazları"
                </p>

                {/* Sağ Köşede Mum Mührü */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden sm:flex">
                  <div className="prophet-wax-seal text-white text-[8.5px] font-black uppercase px-2 py-1 rounded-full text-center leading-tight shadow-md">
                    <span>CANLI</span><br /><span>BASKI</span>
                  </div>
                </div>
              </div>

              {/* Çift Çizgi */}
              <div className="prophet-double-rule my-1" />

              {/* Tarih ve Canlılık Bildirimi */}
              <div className="flex items-center justify-between text-xs py-0.5 px-0.5 font-bold text-stone-800">
                <div className="flex items-center gap-2 text-stone-900 text-[11px]">
                  <span>{dateStr}, Cuma</span>
                  <span>•</span>
                  <span className="italic font-serif text-stone-600 font-normal">Silikon Vadisi &amp; Tayvan</span>
                </div>

                <div className="flex items-center gap-1.5 bg-stone-900/10 px-2 py-0.5 rounded-full border border-stone-900/20 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                  <span className="font-black uppercase tracking-wider text-stone-950">
                    🪄 Fotoğraflar Canlıdır
                  </span>
                </div>
              </div>

              <div className="prophet-thin-rule mt-1" />

              {/* Gazete Bölüm Sekmeleri (Kategoriler) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 pb-1 text-[11px] font-bold">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-sm uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-[#F4EEDF] font-black shadow-xs'
                          : 'bg-stone-200/80 hover:bg-stone-300 text-stone-800 border border-stone-400/80'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Gazete İçi Arama Çubuğu */}
              <div className="mt-2 relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Gazetede ara: Apple 2nm, RTX 5080, PS5 Pro, robot süpürge..."
                  className="w-full bg-[#ebe4d3] border border-stone-400 rounded-sm pl-8 pr-7 py-1.5 text-xs text-stone-950 placeholder:text-stone-500 placeholder:italic focus:outline-none focus:border-stone-800 transition font-serif"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 text-xs p-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* =================================================== */}
            {/* GAZETE İÇERİK AKIŞI (SİHİRLİ HAREKETLİ BASKI) */}
            {/* =================================================== */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
              
              {filteredNews.length === 0 ? (
                <div className="py-16 text-center space-y-2 font-serif">
                  <div className="w-12 h-12 mx-auto rounded-full bg-stone-300 text-stone-700 flex items-center justify-center text-xl border border-stone-400">
                    📜
                  </div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Aradığınız teknoloji haberi bu baskıda bulunamadı
                  </h4>
                  <p className="text-xs text-stone-600 italic">
                    Lütfen farklı bir arama sözcüğü deneyin veya bölüm filtresini 'Ön Sayfa' yapın.
                  </p>
                </div>
              ) : (
                <>
                  {/* 1. SÜRMANŞET: BÜYÜK HAREKETLİ FOTOĞRAFLI BAŞYAZI */}
                  {leadArticle && (
                    <article className="border-b-2 border-stone-800 pb-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-stone-950 text-[#F4EEDF] text-[9.5px] font-black uppercase px-2 py-0.5 tracking-widest">
                          GÜNÜN BAŞ HABERİ • ÖZEL İSTİHBARAT
                        </span>
                        <span className="text-[10.5px] font-serif italic text-stone-600">
                          Tayvan Bürosu Canlı Yayını • {leadArticle.readTime}
                        </span>
                      </div>

                      {/* Başlık */}
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-prophet-headline text-stone-950 leading-[1.15] tracking-tight">
                        {leadArticle.title}
                      </h2>

                      {/* İtalik Alt Başlık (Deck) */}
                      <p className="text-xs sm:text-sm font-serif italic text-stone-800 leading-snug">
                        {leadArticle.summary}
                      </p>

                      {/* 🪄 HARRY POTTER SİHİRLİ HAREKETLİ MANŞET FOTOĞRAFI */}
                      <div className="space-y-1 pt-1">
                        <div className="prophet-living-frame w-full h-56 sm:h-64 md:h-72 relative">
                          <img 
                            src={leadArticle.imageUrl} 
                            alt={leadArticle.title} 
                            className="prophet-living-img w-full h-full object-cover"
                            loading="lazy"
                          />
                          
                          {/* Sihirli Işık Demeti Dalgası */}
                          <div className="prophet-magic-light" />

                          {/* Çip Üzerinde Dönen Canlı Devre / Radar Efekti */}
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-40 h-40 sm:w-52 sm:h-52 rounded-full border border-cyan-400/40 border-dashed prophet-spin-slow" />
                            <div className="absolute w-16 h-16 bg-cyan-400/20 rounded-full blur-xl prophet-neural-pulse" />
                          </div>

                          {/* Fotoğraf İçi Canlı Matbaa Damgası */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-white text-[9.5px] font-sans font-bold border border-white/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Canlı Hareketli Fotoğraf</span>
                          </div>

                          <div className="absolute bottom-2 right-2 bg-black/70 text-stone-300 px-1.5 py-0.5 text-[8.5px] font-mono uppercase tracking-wider">
                            TSMC FAB-20 CANLI AKIŞ
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-stone-600 font-serif italic pt-0.5">
                          <span>Sihirli fotoğrafta: TSMC 2nm temiz odasında transistör akımlarının ilk testi görüntüleniyor.</span>
                          <span className="font-sans text-[9px] font-bold uppercase text-stone-500">REUTERS / CANLI YAYIN</span>
                        </div>
                      </div>

                      {/* Gazete Gövde Metni (Drop-Cap ile) */}
                      <div className="text-xs sm:text-[12.5px] text-stone-800 font-serif leading-relaxed pt-1">
                        <p className="prophet-drop-cap text-justify">
                          Gelecek Postası'nın Tayvan Hsinchu'daki özel istihbarat bürosundan sızan bilgilere göre, yarı iletken dünyasında yeni bir çağ başladı. Apple ve Qualcomm, TSMC'nin 2 nanometrelik Gate-All-Around (GAA) üretim hattında ilk ticari kapasiteleri kilitledi. Bu mimari akıllı telefonlarda ısınmayı kalıcı olarak engellerken 48 saatlik kesintisiz pil ömrünü mümkün kılıyor.
                        </p>
                      </div>

                      {/* Başyazarın Tüketici Notu (RoboPengu Mührü) */}
                      {leadArticle.takeaway && (
                        <div className="bg-stone-300/60 border-l-4 border-stone-950 p-3 my-2 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase tracking-wider text-stone-950 font-serif">
                              📜 Başyazarın Alım Tavsiyesi:
                            </span>
                            <span className="text-[9px] font-sans font-black bg-stone-900 text-[#F4EEDF] px-1.5 py-0.2 uppercase tracking-widest">
                              ROBOPENGU MÜHRÜ
                            </span>
                          </div>
                          <p className="text-[11.5px] text-stone-800 italic font-serif leading-snug">
                            {leadArticle.takeaway}
                          </p>
                        </div>
                      )}

                      {/* Gazete Aksiyonları */}
                      <div className="pt-2 flex items-center justify-between border-t border-stone-400 flex-wrap gap-2">
                        {onAskAboutNews && (
                          <button
                            type="button"
                            onClick={() => {
                              onAskAboutNews(leadArticle.suggestedPrompt || leadArticle.title);
                              onClose();
                            }}
                            className="inline-flex items-center gap-1.5 bg-stone-950 hover:bg-stone-800 text-[#F4EEDF] text-xs font-serif font-bold px-3 py-1.5 transition cursor-pointer shadow-sm active:scale-95"
                          >
                            <span>🪶 RoboPengu'ya Bu Haberi Danış →</span>
                          </button>
                        )}

                        {leadArticle.url && (
                          <a
                            href={leadArticle.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-950 italic font-serif"
                          >
                            <span>Orijinal Kaynak ({leadArticle.source})</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </article>
                  )}

                  {/* 2. CANLI PİYASA TELGRAFI (Gazetenin Borsa Köşesi) */}
                  <div className="border-2 border-stone-900 p-3 bg-stone-200/80 my-3">
                    <div className="border-b border-stone-900 pb-1 mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-stone-950 font-serif">
                        📈 GÜNLÜK CİHAZ VE PİYASA TELGRAFI
                      </span>
                      <span className="text-[9.5px] font-bold text-stone-600">HER SABAH 09:00</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-serif">
                      <div className="border-r border-stone-300 pr-2">
                        <div className="font-bold truncate text-[11px]">iPhone 16 Pro Max</div>
                        <div className="font-sans font-black text-stone-950 text-[11px]">
                          ₺89.999 <span className="text-emerald-800 font-bold text-[9.5px]">▼ ₺1.200</span>
                        </div>
                      </div>
                      <div className="border-r border-stone-300 pr-2">
                        <div className="font-bold truncate text-[11px]">Galaxy S25 Ultra</div>
                        <div className="font-sans font-black text-stone-950 text-[11px]">
                          ₺74.499 <span className="text-emerald-800 font-bold text-[9.5px]">▼ ₺850</span>
                        </div>
                      </div>
                      <div className="border-r border-stone-300 pr-2">
                        <div className="font-bold truncate text-[11px]">RTX 5080 GPU</div>
                        <div className="font-sans font-black text-stone-950 text-[11px]">
                          ₺48.990 <span className="text-amber-800 font-bold text-[9.5px]">■ Sabit</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold truncate text-[11px]">PS5 Pro Konsol</div>
                        <div className="font-sans font-black text-stone-950 text-[11px]">
                          ₺49.999 <span className="text-emerald-800 font-bold text-[9.5px]">▼ ₺500</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. DİĞER HAREKETLİ GAZETE HABERLERİ (2 Sütunlu Izgara) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                    {sideArticles.map((art) => (
                      <article 
                        key={art.id}
                        className="space-y-2 border-b border-stone-400 sm:border-b-0 pb-4 sm:pb-0"
                      >
                        <div className="flex items-center justify-between text-[10px] font-serif">
                          <span className="font-black uppercase tracking-wider text-stone-950 bg-stone-300/80 px-1.5 py-0.2">
                            {art.categoryLabel}
                          </span>
                          <span className="text-stone-500 italic">{art.source}</span>
                        </div>

                        <h3 className="text-sm font-bold font-prophet-headline text-stone-950 leading-snug">
                          {art.title}
                        </h3>

                        {/* 🪄 HAREKETLİ SİHİRLİ FOTOĞRAF (Living Cinemagraph) */}
                        <div className="prophet-living-frame w-full h-32 relative">
                          <img 
                            src={art.imageUrl} 
                            alt={art.title} 
                            className="prophet-living-img w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="prophet-magic-light" />
                          
                          <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-[8.5px] text-stone-300 font-mono px-1 py-0.2">
                            CANLI AKIŞ
                          </div>
                        </div>

                        <p className="text-xs font-serif text-stone-800 leading-relaxed text-justify line-clamp-3">
                          {art.summary}
                        </p>

                        {art.takeaway && (
                          <div className="text-[10.5px] font-serif italic text-stone-700 bg-stone-200/60 p-1.5 border-l-2 border-stone-800">
                            💡 {art.takeaway}
                          </div>
                        )}

                        <div className="pt-1 flex items-center justify-between text-xs font-serif">
                          {onAskAboutNews && (
                            <button
                              type="button"
                              onClick={() => {
                                onAskAboutNews(art.suggestedPrompt || art.title);
                                onClose();
                              }}
                              className="font-bold underline text-stone-950 hover:text-stone-700 cursor-pointer"
                            >
                              🪶 RoboPengu'ya Sor →
                            </button>
                          )}
                          <span className="text-[10.5px] text-stone-500 italic">{art.readTime}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* =================================================== */}
            {/* GAZETE MATBAA BİTİŞİ (FOOTER) */}
            {/* =================================================== */}
            <div className="p-2.5 bg-[#ebe2d1] border-t-2 border-stone-800 text-center shrink-0">
              <p className="text-[10px] sm:text-[10.5px] font-serif text-stone-700 italic">
                The Daily Tech Prophet • aceleEtme Sihirli Dijital Matbaası • Her sabah 09:00'da canlı baskı yenilenir.
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default GlobalAiNewsDrawer;
