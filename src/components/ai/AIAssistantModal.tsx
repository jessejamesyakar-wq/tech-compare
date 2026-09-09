'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ExternalLink } from 'lucide-react';
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
      content: 'Merhaba! Ben RoboPengu, senin 3D Akıllı Asistanın! Fiyatları karşılaştırır, bütçene uygun modelleri ve sitenin tüm özelliklerini senin için incelerim. Nasıl yardımcı olabilirim?',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                content:
                  'Üzgünüm, yanıt oluşturulurken bir bağlantı gecikmesi yaşandı. Lütfen sorunuzu tekrar iletin.',
              }
            : m
        )
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? { ...m, isStreaming: false } : m))
      );
      setLoading(false);
    }
  };

  const quickPrompts = [
    '20.000 TL bütçeye en iyi telefon?',
    'iPhone 17 Pro Max vs S26 Ultra',
    'Fiyat takibi ve grafikler nasıl çalışır?',
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {/* Arka Plan Overlay */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-3 pt-16 sm:p-4 z-50 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        
        {/* Ana Kapsayıcı: Maskot + Modal */}
        <div className="relative w-full max-w-full sm:max-w-2xl lg:max-w-3xl flex items-center justify-center">

          {/* 1. MASKOT (DESKTOP / GENİŞ EKRAN - lg ve üzeri): Sol Kenara Yaslı Büyük Boy */}
          <div className="hidden lg:block absolute -left-[275px] -top-[40px] z-30 pointer-events-none select-none animate-float">
            <div className="relative">
              <img 
                src="/assets/robopengu.png" 
                alt="RoboPengu 3D" 
                className="w-[340px] max-w-none h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
              />
              {/* Göğsündeki Güç Düğmesi Canlı Neon / Pulse Efekti */}
              <div 
                className="absolute top-[58%] left-[69%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                title="RoboPengu Güç Reaktörü (Aktif)"
                onClick={() => handleSend('Bana kendinden ve bu sitede yapabileceklerinden bahset!')}
              >
                <span className="absolute inline-flex h-8 w-8 -top-1 -left-1 animate-ping rounded-full bg-cyan-400 opacity-60"></span>
                <span className="relative inline-flex rounded-full h-6 w-6 bg-cyan-400 shadow-[0_0_18px_#22d3ee] border-2 border-white animate-neon-pulse flex items-center justify-center">
                  <span className="text-[8px] text-slate-950 font-black">⏻</span>
                </span>
              </div>
            </div>
          </div>

          {/* 1. MASKOT (TABLET - md to lg): Kompakt Sol Kenar Boyutu */}
          <div className="hidden md:block lg:hidden absolute -left-[190px] -top-[30px] z-30 pointer-events-none select-none animate-float">
            <div className="relative">
              <img 
                src="/assets/robopengu.png" 
                alt="RoboPengu 3D" 
                className="w-[240px] max-w-none h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.30)]"
              />
              <div 
                className="absolute top-[58%] left-[69%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                title="RoboPengu Güç Reaktörü (Aktif)"
                onClick={() => handleSend('Bana kendinden ve bu sitede yapabileceklerinden bahset!')}
              >
                <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-400 shadow-[0_0_14px_#22d3ee] border-2 border-white animate-neon-pulse flex items-center justify-center">
                  <span className="text-[7px] text-slate-950 font-black">⏻</span>
                </span>
              </div>
            </div>
          </div>

          {/* 1. MASKOT (MOBİL TELEFON - < md): Modalın Üstünden Dışa Taşan Sevimli 3D Penguen */}
          <div className="block md:hidden absolute -top-[64px] left-3 z-30 pointer-events-none select-none animate-float">
            <div className="relative">
              <img 
                src="/assets/robopengu.png" 
                alt="RoboPengu 3D" 
                className="w-[95px] h-auto object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
              />
              <div 
                className="absolute top-[58%] left-[69%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer"
                onClick={() => handleSend('Bana kendinden ve bu sitede yapabileceklerinden bahset!')}
              >
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee] border border-white animate-neon-pulse flex items-center justify-center">
                  <span className="text-[5px] text-slate-950 font-black">⏻</span>
                </span>
              </div>
              {/* Mobil Konuşma Kuyruğu: Modala Doğru */}
              <div className="absolute bottom-1 right-3 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white dark:border-t-slate-900"></div>
            </div>
          </div>

          {/* 2. ORTA: TEK VE NET CHAT MODALI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-visible h-[580px] sm:h-[600px] z-20"
          >
            {/* Desktop Konuşma Oku */}
            <div className="hidden lg:block absolute top-[88px] -left-3.5 w-0 h-0 
                        border-t-[10px] border-t-transparent 
                        border-b-[10px] border-b-transparent 
                        border-r-[14px] border-r-white dark:border-r-slate-900 z-20">
            </div>
            {/* Tablet Konuşma Oku */}
            <div className="hidden md:block lg:hidden absolute top-[65px] -left-3 w-0 h-0 
                        border-t-[8px] border-t-transparent 
                        border-b-[8px] border-b-transparent 
                        border-r-[12px] border-r-white dark:border-r-slate-900 z-20">
            </div>
            
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 pl-20 md:pl-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src="/assets/robopengu.png" alt="Robo" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-base">
                    RoboPengu & Gemini 3.8
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full">
                    CANLI ASİSTAN
                  </span>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition text-lg p-1 cursor-pointer"
                aria-label="Kapat"
              >
                ✕
              </button>
            </div>

            {/* Mesajlaşma Alanı */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40 dark:bg-slate-950/40">
              {messages.map((m) => (
                <div key={m.id} className="space-y-3">
                  {m.role === 'assistant' ? (
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                        <img src="/assets/robopengu.png" alt="Robo" className="w-5 h-5 object-contain" />
                      </div>
                      <div className="space-y-3 max-w-[88%]">
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-xs text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                          <div className="whitespace-pre-wrap">
                            {m.content}
                            {m.isStreaming && (
                              <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-500 animate-pulse align-middle" />
                            )}
                          </div>
                        </div>

                        {/* Bot Ürün Öneri Kartları */}
                        {m.recommendations && m.recommendations.length > 0 && (
                          <div className="space-y-2 pt-1">
                            <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              <span>Önerilen Modeller</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {m.recommendations.map((rec, idx) => (
                                <Link
                                  key={rec.productId || idx}
                                  href={getProductUrl(rec)}
                                  onClick={onClose}
                                  className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-2 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 transition cursor-pointer group"
                                >
                                  {rec.image ? (
                                    <div className="w-8 h-10 bg-slate-50 dark:bg-slate-800 rounded p-0.5 shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                      <ProductImage
                                        src={rec.image}
                                        alt={rec.productName}
                                        variant="card"
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-10 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-xs shrink-0">
                                      📱
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                      {rec.productName}
                                    </h4>
                                    <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                      ₺{rec.price.toLocaleString('tr-TR')}
                                    </p>
                                    {rec.reason && (
                                      <p className="text-[9px] text-slate-400 dark:text-slate-500 line-clamp-1">
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
                  ) : (
                    <div className="flex items-start justify-end gap-3">
                      <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[80%] font-medium">
                        {m.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Alt Bar: Hızlı Butonlar & Input */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto text-[11px] no-scrollbar">
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

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(input);
                }}
                className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition"
              >
                <input 
                  ref={inputRef}
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bir model sorun veya bütçe belirtin..." 
                  disabled={loading}
                  className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none px-2 py-1 font-medium placeholder:text-slate-400"
                />
                <button 
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '➤'}
                </button>
              </form>
            </div>

          </motion.div>

        </div>
      </div>
    </AnimatePresence>
  );
}
