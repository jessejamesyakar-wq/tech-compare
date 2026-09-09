'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, Loader2, ArrowRight, CornerDownLeft, RefreshCw, ShoppingBag, ExternalLink } from 'lucide-react';
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
      content: 'Merhaba! Ben RoboPengu 🐧 TechCompare\'in akıllı yapay zeka danışmanıyım. Bütçenize uygun ürün tavsiyesi alabilir, modelleri kıyaslatabilir ya da sitemizdeki fiyat alarmları, kargo ve özellikler hakkında her şeyi bana sorabilirsiniz. Size nasıl yardımcı olabilirim?',
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
                content: 'Üzgünüm, şu an yanıt verirken bir aksaklık oluştu. Lütfen sorunuzu tekrar deneyin. 🐧',
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
    'iPhone 17 Pro Max mi Samsung S26 Ultra mı?',
    'Fiyat takibi ve grafikler nasıl çalışır?',
    'Kargo ve teslimat süreci nasıl işler?',
    'Üniversite için hafif ve hızlı laptop?',
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl h-[85vh] max-h-[720px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md text-white text-lg">
                🐧
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    RoboPengu & Gemini 3.8 AI
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700">
                    Canlı Asistan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  5.800+ ürünlük katalog, anlık fiyatlar ve site rehberi
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center shrink-0 text-sm font-bold shadow-2xs">
                    🐧
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed space-y-2.5 shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-tr-none'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-normal rounded-tl-none border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  <div className="whitespace-pre-wrap">
                    {m.content}
                    {m.isStreaming && (
                      <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-500 animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Recommendations Cards inside Assistant Message */}
                  {m.recommendations && m.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <div className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Önerilen Modeller</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {m.recommendations.map((rec, i) => (
                          <Link
                            key={rec.productId || i}
                            href={getProductUrl(rec)}
                            onClick={onClose}
                            className="p-2.5 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition-all flex items-center gap-2.5 group"
                          >
                            {rec.image && (
                              <div className="w-11 h-11 bg-slate-50 dark:bg-slate-800 rounded-lg p-1 shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-800">
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

          {/* Quick Prompt Chips (when few messages) */}
          {messages.length <= 2 && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[10px] font-black uppercase text-slate-400 shrink-0">Hızlı Sor:</span>
              {quickPrompts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-400 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 whitespace-nowrap transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Bir model sorun (örn: 'iPhone 17 mi S26 mı?'), bütçe belirtin veya kargoyu sorun..."
                  disabled={loading}
                  className="w-full pl-4 pr-10 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-slate-200 dark:border-slate-700 placeholder:text-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center cursor-pointer shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
