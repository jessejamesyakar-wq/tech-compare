'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Tv
} from 'lucide-react';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedProducts?: {
    product: Product;
    reason: string;
  }[];
}

const PRESET_PROMPTS = [
  '🎮 25.000 TL bütçe ile 240Hz+ espor monitörü öner',
  '📱 iPhone 16 Pro mu yoksa Galaxy S24 Ultra mı?',
  '💻 Yazılım ve grafik tasarım için güçlü laptop',
  '📺 Sinema keyfi için en iyi 65 inç OLED televizyon',
  '🎧 Gürültü engellemesi en iyi kablosuz kulaklık'
];

export function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Merhaba! Ben TechKıyas Yapay Zekâ Alışveriş Asistanı. 🤖\n\nBütçenizi, kullanım amacınızı veya aklınızdaki modelleri yazın; 600+ ürün arasından sizin için en mantıklı seçenekleri analiz edip listeleyeyim!'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    getAllProducts().then((res) => {
      setAllProducts(res);
    });
  }, []);

  if (!isOpen) return null;

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || query).trim();
    if (!text) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let matched: Product[] = [];
      let aiText = '';

      // Match logic based on user input
      if (lower.includes('monitör') || lower.includes('hz') || lower.includes('ms') || lower.includes('espor') || lower.includes('ips') || lower.includes('oled') && !lower.includes('tv')) {
        matched = allProducts
          .filter((p) => p.category === 'monitors')
          .sort((a, b) => b.basePrice - a.basePrice)
          .slice(0, 3);

        if (lower.includes('240') || lower.includes('300') || lower.includes('espor')) {
          matched = allProducts
            .filter((p) => p.category === 'monitors' && (((p.specs || {}) as any).refreshRateHz || 0) >= 240)
            .slice(0, 3);
          aiText = 'Kriterlerinize göre en yüksek tepki hızı ve yenileme oranına sahip espor monitörlerini derledim:';
        } else {
          aiText = 'Kullanım amacınıza en uygun, yüksek renk doğruluğu ve akıcılığa sahip öne çıkan monitörler:';
        }
      } else if (lower.includes('laptop') || lower.includes('bilgisayar') || lower.includes('yazılım') || lower.includes('macbook')) {
        matched = allProducts
          .filter((p) => p.category === 'laptops')
          .slice(0, 3);
        aiText = 'Yüksek işlemci gücü, geniş RAM kapasitesi ve uzun pil ömrüne sahip laptop modelleri:';
      } else if (lower.includes('tv') || lower.includes('televizyon') || lower.includes('sinema')) {
        matched = allProducts
          .filter((p) => p.category === 'tvs')
          .slice(0, 3);
        aiText = 'Geniş ekran, kusursuz kontrast ve 120Hz konsol desteğine sahip en iyi televizyonlar:';
      } else if (lower.includes('iphone') || lower.includes('galaxy') || lower.includes('s24') || lower.includes('telefon')) {
        matched = allProducts
          .filter((p) => p.category === 'smartphones')
          .slice(0, 3);
        aiText = 'Kamera performansı, yonga gücü ve malzeme kalitesiyle öne çıkan amiral gemisi telefonlar:';
      } else {
        matched = allProducts.slice(0, 3);
        aiText = 'İsteğinize en uygun puan/fiyat dengesine sahip modelleri inceleyebilirsiniz:';
      }

      const recommended = matched.map((p) => {
        let reason = `${p.brand} ekosistem avantajı ve yüksek kullanıcı memnuniyeti.`;
        const specs = (p.specs || {}) as any;
        if (p.category === 'monitors') {
          reason = `${specs.refreshRateHz || 240}Hz ultra akıcı panel ve ${specs.responseTimeMs || 0.5}ms düşük gecikme.`;
        } else if (p.category === 'laptops') {
          reason = `${specs.processor || 'Güçlü İşlemci'} ve yüksek grafik performansı.`;
        } else if (p.category === 'smartphones') {
          reason = `Zirve yonga seti, profesyonel kamera ve uzun vadeli güncelleme garantisi.`;
        }

        return {
          product: p,
          reason
        };
      });

      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: aiText,
        recommendedProducts: recommended
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const getProductHref = (p: Product) => {
    if (p.category === 'monitors') return `/monitors/${p.slug}`;
    if (p.category === 'tvs') return `/tvs/${p.slug}`;
    if (p.category === 'laptops') return `/laptops/${p.slug}`;
    return `/phones/${p.slug}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[720px] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black tracking-tight">TechKıyas Yapay Zekâ Asistanı</h3>
                <span className="text-[10px] bg-white/20 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Canlı AI
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 font-medium">
                600+ Modeli Anlık Analiz Eder • Tarafsız Tavsiye Verir
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
                className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs font-semibold leading-relaxed shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 rounded-bl-none'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Recommended Cards */}
                {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                  <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    {m.recommendedProducts.map(({ product, reason }) => (
                      <div
                        key={product.id}
                        className="bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 flex items-center justify-between gap-3 hover:border-emerald-500 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 p-1 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
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
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 w-fit">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>Yapay zekâ modelleri analiz ediyor...</span>
            </div>
          )}
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
              placeholder="Örn: 20.000 TL bütçeye en iyi ekran kartı olan laptop hangisi?..."
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
