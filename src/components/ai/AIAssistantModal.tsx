'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { getStoredProducts } from '@/lib/adminData';
import { getAllProducts } from '@/lib/data';
import { Product } from '@/lib/types';
import {
  Sparkles,
  X,
  Send,
  Bot,
  ArrowRight,
  CheckCircle2,
  Scale,
  Zap,
  TrendingUp,
  Monitor,
  Smartphone as PhoneIcon,
  Laptop as LaptopIcon,
  Tv,
  RefreshCw,
  Trophy,
  ExternalLink
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isComparison?: boolean;
  comparisonLink?: string;
  recommendedProducts?: {
    product: Product;
    reason: string;
  }[];
}

const PRESET_PROMPTS = [
  '🎮 25.000 TL altı 240Hz+ espor monitörü öner',
  '⚔️ iPhone 16 Pro Max mi yoksa Galaxy S24 Ultra mı?',
  '💻 Yazılım ve grafik için 50.000 TL altı laptop',
  '📺 Sinema ve PS5 için en iyi OLED televizyon',
  '🎧 ANC gürültü engellemesi en iyi kablosuz kulaklık'
];

export function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Merhaba! Ben aceleEtme Yapay Zekâ Alışveriş Asistanı. 🤖\n\nBütçenizi, aradığınız özellikleri veya aklınızdaki iki modeli yazın; 600+ ürünü anında tarayıp en mantıklı tavsiyeleri ve karşılaştırmaları önünüze getireyim!'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load from both stored products and default catalog
    const stored = getStoredProducts();
    if (stored.length > 0) {
      setAllProducts(stored);
    } else {
      getAllProducts().then((res) => {
        setAllProducts(res);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const parseBudget = (str: string): number | null => {
    // Matches: 25.000, 25000, 25 bin, 25k, 25.000 tl, 30bin
    const binMatch = str.match(/(\d+(?:[.,]\d+)?)\s*(?:bin|k)\b/i);
    if (binMatch) {
      const num = parseFloat(binMatch[1].replace(',', '.'));
      return num * 1000;
    }
    const fullMatch = str.match(/(\d{1,3}(?:[.]\d{3})+|\d{4,7})\s*(?:tl|₺|lira)?/i);
    if (fullMatch) {
      const clean = fullMatch[1].replace(/\./g, '');
      const num = parseInt(clean, 10);
      if (num >= 500 && num <= 500000) return num;
    }
    return null;
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text
    };

    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setQuery('');
    setIsTyping(true);

    try {
      // Build conversation history for Claude multi-turn context
      const history = nextMessages
        .filter((m) => m.id !== 'welcome')
        .slice(0, -1)
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.text
        }));

      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });

      if (!res.ok) {
        throw new Error('AI asistan isteği başarısız oldu.');
      }

      const data = await res.json();
      const lower = text.toLowerCase();
      const isVersus =
        lower.includes(' mi ') ||
        lower.includes(' mı ') ||
        lower.includes(' mu ') ||
        lower.includes(' mü ') ||
        lower.includes(' vs ') ||
        lower.includes('karşılaştır');

      // Map Claude recommendations to actual catalog products if available
      const recommendedProducts: { product: Product; reason: string }[] = [];
      let comparisonLink = '';
      let isComparison = isVersus;

      if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        data.recommendations.forEach((r: any) => {
          const matched = allProducts.find(
            (p) =>
              p.id.toLowerCase() === (r.productId || '').toLowerCase() ||
              p.slug.toLowerCase() === (r.slug || '').toLowerCase() ||
              p.name.toLowerCase() === (r.productName || '').toLowerCase()
          );

          if (matched) {
            recommendedProducts.push({
              product: matched,
              reason: r.reason || `${matched.brand} güvencesiyle yüksek fiyat/performans avantajı.`
            });
          } else if (r.productName || r.slug) {
            // Virtual product object if not found in memory
            const fallbackProduct: Product = {
              id: r.productId || r.slug || 'product',
              slug: r.slug || r.productId || 'product',
              name: r.productName || 'Önerilen Model',
              brand: r.productName ? r.productName.split(' ')[0] : 'Teknoloji',
              category: (r.category === 'smartphones' ? 'phones' : r.category) || 'phones',
              basePrice: r.price || 0,
              currency: 'TL',
              image: '/images/placeholder.jpg',
              images: [],
              rating: 4.8,
              reviewCount: 42,
              releaseYear: 2026,
              highlights: [r.reason],
              specs: {},
              storeOffers: [],
              priceHistory: []
            };
            recommendedProducts.push({
              product: fallbackProduct,
              reason: r.reason || 'Kriterlerinize en uygun model.'
            });
          }
        });

        if (isComparison && recommendedProducts.length >= 2) {
          const p1 = recommendedProducts[0].product;
          const p2 = recommendedProducts[1].product;
          comparisonLink = `/compare?p1=${p1.slug || p1.id}&p2=${p2.slug || p2.id}`;
        }
      }

      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: data.reply || 'Kriterlerinize uygun ürünleri listeledim:',
        isComparison,
        comparisonLink: comparisonLink || undefined,
        recommendedProducts: recommendedProducts.length > 0 ? recommendedProducts : undefined
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('[AIAssistantModal] Hata:', err);
      const errorMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: 'Üzgünüm, şu anda yanıt oluştururken bir bağlantı sorunu yaşandı. Lütfen sorunuzu tekrar yazınız veya bütçenizi belirterek deneyiniz.'
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const getProductHref = (p: Product) => {
    switch (p.category) {
      case 'monitors':
        return `/monitors/${p.slug || p.id}`;
      case 'tvs':
        return `/tvs/${p.slug || p.id}`;
      case 'laptops':
        return `/laptops/${p.slug || p.id}`;
      case 'headphones':
        return `/headphones/${p.slug || p.id}`;
      case 'smartwatches':
        return `/smartwatches/${p.slug || p.id}`;
      case 'tablets':
        return `/tablets/${p.slug || p.id}`;
      case 'appliances':
        return `/appliances/${p.slug || p.id}`;
      case 'consoles':
        return `/consoles/${p.slug || p.id}`;
      default:
        return `/phones/${p.slug || p.id}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[720px] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">aceleEtme Yapay Zekâ Asistanı</h3>
                <span className="text-[10px] bg-white/20 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Canlı AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                600+ Modeli Anlık Analiz Eder • Bütçe & Karşılaştırma Uzmanı
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[82%] rounded-2xl p-3.5 sm:p-4 text-xs font-semibold leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Direct Comparison Link Button if it is a versus query */}
                {m.isComparison && m.comparisonLink && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Link
                      href={m.comparisonLink}
                      onClick={onClose}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black px-4 py-2.5 rounded-xl shadow-md hover:scale-102 transition-transform"
                    >
                      <Scale className="w-4 h-4" />
                      <span>Bu İki Modeli Karşılaştırma Masasında Aç ➔</span>
                    </Link>
                  </div>
                )}

                {/* Recommended Cards */}
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    {m.recommendedProducts.map(({ product, reason }) => (
                      <div
                        key={product.id}
                        className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-emerald-500 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-11 h-11 rounded-lg bg-white dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                            <img src={product.image} alt={product.name} className="h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                              {product.name}
                            </h5>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold truncate flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="w-3 h-3 shrink-0" />
                              <span>{reason}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white block tabular-nums">
                            {product.basePrice.toLocaleString()} TL
                          </span>
                          <Link
                            href={getProductHref(product)}
                            onClick={onClose}
                            className="inline-flex items-center gap-1 text-[9.5px] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-2 py-1 rounded-md transition-colors mt-0.5"
                          >
                            <span>İncele</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 text-xs font-bold bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>Yapay zekâ modelleri ve bütçeleri analiz ediyor...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {PRESET_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="text-[11px] font-bold bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 whitespace-nowrap transition-all cursor-pointer shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Örn: 25.000 TL bütçeye en iyi ekran kartlı laptop hangisi? veya iPhone 16 vs S24..."
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Sor</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
