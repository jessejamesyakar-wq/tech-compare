'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Loader2, ArrowRight, ExternalLink, Scale, CheckCircle2, TrendingDown } from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';

export interface AIAssistantRecommendation {
  productId: string;
  slug: string;
  productName: string;
  category: string;
  price: number;
  image?: string;
  reason: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  recommendations?: AIAssistantRecommendation[];
  isStreaming?: boolean;
}

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export function AIAssistantModal({ isOpen, onClose, initialQuery = '' }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Merhaba! Ben RoboPengu, senin 3D Akıllı Asistanın! 🐧 Fiyatları karşılaştırır, bütçene uygun modelleri ve sitenin tüm özelliklerini senin için incelerim. Nasıl yardımcı olabilirim?',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeComparison, setActiveComparison] = useState<AIAssistantRecommendation[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getProductUrl = (rec: AIAssistantRecommendation) => {
    const slug = rec.slug || rec.productId;
    const cat = rec.category || 'phones';
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      if (initialQuery.trim() && messages.length <= 1) {
        handleSend(initialQuery.trim());
      }
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed || loading) return;

    const userMsgId = 'u-' + Date.now();
    const botMsgId = 'b-' + Date.now();

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
    };

    const assistantMsg: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      recommendations: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-4)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          stream: true,
          history,
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Yanıt alınamadı');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const events = streamBuffer.split('\n\n');
        streamBuffer = events.pop() || '';

        for (const evt of events) {
          const lines = evt.split('\n');
          let eventType = 'text';
          let dataStr = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.slice(6).trim();
            }
          }

          if (eventType === 'products' && dataStr) {
            try {
              const recs: AIAssistantRecommendation[] = JSON.parse(dataStr);
              setMessages((prev) =>
                prev.map((m) => (m.id === botMsgId ? { ...m, recommendations: recs } : m))
              );
              if (recs.length > 0) {
                setActiveComparison(recs);
              }
            } catch {}
          } else if (eventType === 'text' && dataStr) {
            try {
              const token = JSON.parse(dataStr);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botMsgId ? { ...m, content: m.content + token } : m
                )
              );
            } catch {}
          } else if (eventType === 'done') {
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, isStreaming: false } : m))
            );
          }
        }
      }
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                content: 'Üzgünüm, yanıt verirken bir aksaklık oluştu. Lütfen tekrar deneyin. 🐧',
                isStreaming: false,
              }
            : m
        )
      );
    } finally {
      setLoading(false);
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? { ...m, isStreaming: false } : m))
      );
    }
  };

  const quickPrompts = [
    '20.000 TL bütçeye en iyi telefon?',
    'iPhone 17 Pro Max vs S26 Ultra',
    'Fiyat takibi ve grafikler nasıl çalışır?',
    'Kargo ve teslimat süreci nasıl işler?',
  ];

  if (!isOpen) return null;

  const lowestPrice = activeComparison.length > 0
    ? Math.min(...activeComparison.map(p => p.price).filter(Boolean))
    : 20291;

  return (
    <AnimatePresence>
      {/* Arka Plan Karartma Overlay */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
        
        <div className="relative flex items-center gap-4 lg:gap-6 max-w-6xl w-full justify-center">

          {/* ========================================================================= */}
          {/* 1. SOL: DIŞA TAŞAN 3D ROBOPENGU MASKOTU                                   */}
          {/* ========================================================================= */}
          <div className="hidden lg:block relative -mr-16 z-30 pointer-events-none select-none animate-float">
            {/* Arka planı silinmiş 3D görsel */}
            <div className="relative">
              <img 
                src="/assets/robopengu.png" 
                alt="RoboPengu 3D" 
                className="w-64 h-auto drop-shadow-2xl object-contain"
              />
              
              {/* Göğsündeki Güç Düğmesi İçin Canlı Neon/Pulse Efekti */}
              <div 
                className="absolute top-[48%] left-[49%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                title="RoboPengu Güç Reaktörü (Aktif)"
                onClick={() => handleSend('Bana kendinden ve bu sitede yapabileceklerinden bahset!')}
              >
                <span className="absolute inline-flex h-8 w-8 -top-1.5 -left-1.5 animate-ping rounded-full bg-cyan-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-400 shadow-[0_0_18px_#22d3ee] border-2 border-white/90 animate-neon-pulse flex items-center justify-center">
                  <span className="text-[8px] text-slate-950 font-black">⏻</span>
                </span>
              </div>

              {/* Konuşma Balonu Çıkıntısı (Speech Bubble Tail to Modal) */}
              <div className="absolute -right-2 top-28 w-4 h-4 bg-white rotate-45 border-t border-l border-slate-100 hidden lg:block z-40 shadow-xs" />
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. ORTA: ANA CHAT MODAL PENCERESİ                                         */}
          {/* ========================================================================= */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden h-[620px] z-20"
          >
            {/* Header */}
            <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-lg shadow-sm">
                  🐧
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm md:text-base flex items-center gap-2">
                    <span>RoboPengu 3D & Gemini 3.8 AI</span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 rounded-full">
                      CANLI ASİSTAN
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Fiyat kıyaslama, ürün analizi ve akıllı rehber</p>
                </div>
              </div>

              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition text-xl font-medium p-1 cursor-pointer"
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            {/* Mesajlaşma Alanı */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-xs shadow-2xs">
                      🐧
                    </div>
                  )}

                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[85%] shadow-xs space-y-2 ${
                      m.role === 'user'
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-tr-none font-medium'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {m.content}
                      {m.isStreaming && (
                        <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-500 animate-pulse align-middle" />
                      )}
                    </div>

                    {/* Önerilen Ürün Kartları */}
                    {m.recommendations && m.recommendations.length > 0 && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>Önerilen Modeller</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {m.recommendations.map((rec, idx) => (
                            <Link
                              key={rec.productId || idx}
                              href={getProductUrl(rec)}
                              onClick={onClose}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-2.5 group"
                            >
                              {rec.image && (
                                <div className="w-11 h-11 bg-white dark:bg-slate-900 rounded-lg p-1 shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-700">
                                  <ProductImage
                                    src={rec.image}
                                    alt={rec.productName}
                                    variant="card"
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h5 className="font-extrabold text-[11px] text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                                  {rec.productName}
                                </h5>
                                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black">
                                  ₺{rec.price.toLocaleString('tr-TR')}
                                </p>
                                {rec.reason && (
                                  <p className="text-[9px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                                    {rec.reason}
                                  </p>
                                )}
                              </div>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Alt Kısım: Hızlı Sorular & Giriş Kutusu */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shrink-0">
              {/* Hızlı Butonlar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] no-scrollbar">
                <span className="text-slate-400 font-medium whitespace-nowrap">HIZLI SOR:</span>
                {quickPrompts.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleSend(q)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full whitespace-nowrap text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition"
              >
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bir model sorun veya bütçe belirtin..." 
                  disabled={loading}
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-white outline-none px-2 py-1 font-medium placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white flex items-center justify-center transition flex-shrink-0 shadow-sm shadow-emerald-200 dark:shadow-none cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '➤'}
                </button>
              </form>
            </div>
          </motion.div>

          {/* ========================================================================= */}
          {/* 3. SAĞ: ANALİZ & KARŞILAŞTIRMA KARTI (Görseldeki Fiyat Grafiği Mockup'ı)  */}
          {/* ========================================================================= */}
          <div className="hidden xl:flex flex-col items-center justify-between w-72 bg-slate-900/85 backdrop-blur-md rounded-3xl p-5 border border-cyan-500/30 text-white shadow-2xl relative overflow-hidden h-[620px] shrink-0">
            {/* Hologram Tarama Işığı (Background Grid Glow) */}
            <div className="absolute inset-0 bg-[radial-gradient(#0891b2_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            <div className="w-full text-center relative z-10">
              <div className="text-xs font-black tracking-wider uppercase text-cyan-300 drop-shadow-[0_0_8px_#06b6d4]">
                Ürün Analizi ve Karşılaştırma
              </div>
              <span className="text-[10px] text-cyan-400/80 font-mono block mt-0.5 tracking-wide">
                (Canlı Model Telemetrisi)
              </span>
            </div>
            
            {/* Mini Hologram Pengu ve Fiyat Rozetleri */}
            <div className="relative my-auto w-full flex flex-col items-center z-10">
              {/* Sol ve Sağ Yüzen Fiyat Rozetleri */}
              <div className="relative w-full flex items-center justify-center">
                {/* Sol Fiyat Etiketi */}
                <div className="absolute -left-1 top-2 bg-cyan-950/90 border border-cyan-400/90 text-cyan-300 text-[11px] font-black px-2.5 py-1 rounded-full shadow-[0_0_14px_rgba(6,182,212,0.6)] backdrop-blur flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  <span>{lowestPrice.toLocaleString('tr-TR')} ₺</span>
                </div>

                {/* Orta Mini 3D Hologram Pengu */}
                <div className="relative py-2">
                  <img 
                    src="/assets/robopengu.png" 
                    alt="Robo Mini" 
                    className="w-28 h-auto opacity-95 mx-auto filter drop-shadow-[0_0_15px_#06b6d4] object-contain transition-transform hover:scale-105 duration-300" 
                  />
                  {/* Göğüs Mini Reaktör */}
                  <div className="absolute top-[50%] left-[49%] -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex h-3.5 w-3.5 animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></span>
                  </div>
                </div>

                {/* Sağ Fiyat Etiketi */}
                <div className="absolute -right-1 -top-2 bg-emerald-950/90 border border-emerald-400/90 text-emerald-300 text-[11px] font-black px-2.5 py-1 rounded-full shadow-[0_0_14px_rgba(16,185,129,0.6)] backdrop-blur flex items-center gap-1.5 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>{lowestPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>

              {/* HUD Telemetri Çizgileri */}
              <div className="w-full flex items-center justify-center gap-1.5 my-3 opacity-80">
                <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-cyan-500/60 to-cyan-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="text-[9px] font-mono text-cyan-300 font-extrabold uppercase tracking-widest">
                  AI SPECS COMPARISON
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-cyan-500/60 to-cyan-400"></span>
              </div>

              {/* Aktif Kıyaslama veya Prototip Özellik Listesi */}
              {activeComparison.length >= 2 ? (
                <div className="w-full space-y-1.5 bg-slate-950/60 rounded-2xl p-2.5 border border-cyan-500/20 text-[11px]">
                  <div className="flex justify-between font-bold text-slate-300 truncate">
                    <span className="truncate pr-1">1. {activeComparison[0].productName}</span>
                    <span className="text-emerald-400 shrink-0 font-black">₺{activeComparison[0].price.toLocaleString('tr-TR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-300 truncate">
                    <span className="truncate pr-1">2. {activeComparison[1].productName}</span>
                    <span className="text-cyan-400 shrink-0 font-black">₺{activeComparison[1].price.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              ) : (
                <div className="w-full text-center text-[10px] text-slate-400 bg-slate-950/50 rounded-xl p-2 border border-white/5">
                  ✨ Soru sorduğunuzda modeller burada canlı kıyaslanır
                </div>
              )}
            </div>

            {/* Alt Analiz & Fiyat İndikatörü */}
            <div className="w-full space-y-2 border-t border-white/10 pt-3 relative z-10">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>En Düşük Fiyat:</span>
                <span className="text-emerald-400 font-bold">{lowestPrice.toLocaleString('tr-TR')} TL</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full w-3/4 animate-pulse"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>Fiyat Dengesi:</span>
                <span className="text-cyan-300 font-bold">En Avantajlı Seviye</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </AnimatePresence>
  );
}
