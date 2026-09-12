'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
  ExternalLink,
  Trophy,
  CheckCircle2,
  Newspaper,
  Swords,
  TrendingDown,
  Trash2,
  X
} from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';

// ---- Tipler ----------------------------------------------------------

export interface AIAssistantRecommendation {
  productId: string;
  slug: string;
  productName: string;
  category: string;
  price: number;
  image?: string;
  reason: string;
  cheapestStore?: string;
}

export interface ComparisonMatrixRow {
  label: string;
  values: string[];
  isDifferent: boolean;
  highlightIdx?: number;
}

export interface ComparisonPanelData {
  type: 'comparison';
  scenario: string;
  products: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    category: string;
    image?: string;
    price: number;
    cheapestStore: string;
    secondCheapestStore?: string;
    secondCheapestPrice?: number;
    marketSaving?: number;
  }[];
  matrix: ComparisonMatrixRow[];
  winner: {
    productId: string;
    productName: string;
    scenario: string;
    reasons: string[];
  };
}

export interface TechNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  tag: string;
  url?: string;
}

export interface TechNewsPanelData {
  type: 'news';
  topic: string;
  articles: TechNewsArticle[];
}

export type ActiveSidePanel = ComparisonPanelData | TechNewsPanelData;

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

// ---- Basit & Hızlı Markdown Ayrıştırıcı Bileşeni --------------------

function MarkdownRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  if (!content) {
    return isStreaming ? (
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-1 animate-pulse">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
        <span className="italic font-medium">RoboPengu donanım verilerini inceliyor... 🐧</span>
      </div>
    ) : null;
  }

  // Check if content contains a markdown table
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Table detection: line starts and ends with |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        // Parse table
        const parseRow = (r: string) =>
          r
            .split('|')
            .slice(1, -1)
            .map((cell) => cell.trim());

        const headers = parseRow(tableLines[0]);
        // line 1 is usually separator (|---|---|)
        const dataRows = tableLines.slice(2).map(parseRow);

        elements.push(
          <div key={`table-${i}`} className="my-2.5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-[11px] text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 font-bold">
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-2.5 py-1.5">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-2.5 py-1.5 whitespace-nowrap">
                        {renderInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // Bullet list detection: line starts with * or -
    if (/^[\*\-]\s+/.test(line.trim())) {
      const bulletText = line.trim().replace(/^[\*\-]\s+/, '');
      elements.push(
        <div key={`bullet-${i}`} className="flex items-start gap-1.5 my-0.5 pl-1">
          <span className="text-emerald-500 font-bold leading-none mt-1">•</span>
          <span className="flex-1">{renderInlineFormatting(bulletText)}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list detection: line starts with e.g. "1. "
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="flex items-start gap-1.5 my-0.5 pl-1">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] mt-0.5">
            {numMatch[1]}.
          </span>
          <span className="flex-1">{renderInlineFormatting(numMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    // Headers: ### or ##
    if (line.trim().startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${i}`} className="font-bold text-slate-800 dark:text-slate-100 text-xs mt-2 mb-1">
          {renderInlineFormatting(line.trim().slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.trim().startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${i}`} className="font-bold text-slate-900 dark:text-white text-xs mt-2.5 mb-1 text-emerald-600 dark:text-emerald-400">
          {renderInlineFormatting(line.trim().slice(3))}
        </h3>
      );
      i++;
      continue;
    }

    // Regular paragraph
    if (line.trim()) {
      elements.push(
        <p key={`p-${i}`} className="my-1 leading-relaxed">
          {renderInlineFormatting(line)}
        </p>
      );
    } else {
      elements.push(<div key={`sp-${i}`} className="h-1" />);
    }
    i++;
  }

  return (
    <div className="space-y-0.5 text-xs text-slate-700 dark:text-slate-200">
      {elements}
      {isStreaming && (
        <span className="inline-block w-1.5 h-3.5 ml-1 bg-emerald-500 animate-pulse align-middle" />
      )}
    </div>
  );
}

// Inline formatting for **bold**, *italic*, and `code`
function renderInlineFormatting(text: string): React.ReactNode {
  if (!text) return '';

  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic text-slate-600 dark:text-slate-300">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 rounded text-[11px] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

// ---- ANA MODAL BİLEŞENİ ---------------------------------------------

export function AIAssistantModal({ isOpen, onClose, initialQuery = '' }: AIAssistantModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Merhaba! Ben RoboPengu, aceleetme'nin tarafsız ve uzman baş teknoloji danışmanıyım! 🐧\n\nTelefon, TV, laptop, tablet ve tüm teknoloji ürünleri hakkında tarafsız karşılaştırmalar yapabilir, en ucuz mağaza fiyatlarını çıkarabilir veya acele etmeden en doğru kararı vermen için donanımları kıyaslayabilirim.\n\nNasıl yardımcı olabilirim?",
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePanel, setActivePanel] = useState<ActiveSidePanel | null>(null);
  const [mobileTab, setMobileTab] = useState<'chat' | 'panel'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getProductUrl = (rec: { slug?: string; productId?: string; category?: string }) => {
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

  // 1. Tarayıcıda saklanan sohbet geçmişini yükle (LocalStorage)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('robopengu_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error('[RoboPengu][ERROR] Failed to load chat history from localStorage', e);
    }
  }, []);

  // 2. Mesajlar tamamlandıkça localStorage'a kaydet (Streaming bitince)
  useEffect(() => {
    if (messages.length > 1 && !messages.some((m) => m.isStreaming)) {
      try {
        localStorage.setItem('robopengu_chat_history', JSON.stringify(messages.slice(-25)));
      } catch (e) {
        console.error('[RoboPengu][ERROR] Failed to save chat history to localStorage', e);
      }
    }
  }, [messages]);

  // Sohbeti Sıfırlama
  const handleClearChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setActivePanel(null);
    setMobileTab('chat');
    setLoading(false);
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content:
          "Merhaba! Ben RoboPengu, aceleetme'nin tarafsız ve uzman baş teknoloji danışmanıyım! 🐧\n\nTelefon, TV, laptop, tablet ve tüm teknoloji ürünleri hakkında tarafsız karşılaştırmalar yapabilir, en ucuz mağaza fiyatlarını çıkarabilir veya acele etmeden en doğru kararı vermen için donanımları kıyaslayabilirim.\n\nNasıl yardımcı olabilirim?",
      }
    ]);
    try {
      localStorage.removeItem('robopengu_chat_history');
    } catch {}
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
    if (!trimmed || loading || trimmed.length > 500) return;

    // Önceki yarım kalan isteği iptal et (Race condition önleme)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const currentRequestId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    activeRequestIdRef.current = currentRequestId;

    const controller = new AbortController();
    abortControllerRef.current = controller;

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

    // 30 saniye başlangıç bağlantı zaman aşımı (Sonsuz yükleniyor'da takılı kalmayı önler)
    let hasReceivedData = false;
    const uiTimeout = setTimeout(() => {
      if (activeRequestIdRef.current === currentRequestId && !hasReceivedData) {
        controller.abort();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  content:
                    'Şu anda sunucu yanıt vermiyor. Lütfen sorunuzu tekrar iletir misiniz? 🐧',
                  isStreaming: false,
                }
              : m
          )
        );
        setLoading(false);
      }
    }, 30000);

    try {
      // Konuşma hafızası aktarımı (Hatalı ve boş mesajları filtrele)
      const history = messages
        .filter((m) => m.id !== 'welcome' && m.content && m.content.trim())
        .filter((m) => !m.content.startsWith('⚠️'))
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      // DOĞRUDAN API (/api/chat) AKIŞI: Yerel ürün arama engeli YOK
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          prompt: trimmed,
          history,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => '');
        let errMsg = `Sunucu hatası (HTTP ${res.status})`;
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.error || errText;
        } catch {
          if (errText) errMsg = errText;
        }
        throw new Error(errMsg);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (!hasReceivedData) {
          hasReceivedData = true;
          clearTimeout(uiTimeout);
        }

        // Eğer bu esnada yeni bir istek geldiyse bu eski akışı sonlandır
        if (activeRequestIdRef.current !== currentRequestId) {
          reader.cancel();
          return;
        }

        const chunk = decoder.decode(value, { stream: true });
        if (chunk) {
          let textToAdd = chunk;

          // SSE formatında (data: ...) gelen parçaları ayıkla
          if (chunk.includes('data: ')) {
            const lines = chunk.split('\n');
            let accumulated = '';
            for (const l of lines) {
              const trimmedLine = l.trim();
              if (trimmedLine.startsWith('data: ')) {
                const content = trimmedLine.slice(6).trim();
                if (content && content !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(content);
                    accumulated += parsed.choices?.[0]?.delta?.content || (typeof parsed === 'string' ? parsed : '');
                  } catch {
                    accumulated += content;
                  }
                }
              }
            }
            if (accumulated) textToAdd = accumulated;
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === botMsgId ? { ...m, content: m.content + textToAdd } : m
            )
          );
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.error('[RoboPengu][ERROR] Chat request failed:', err);
      const detailedError = err?.message || 'Bilinmeyen hata';
      if (activeRequestIdRef.current === currentRequestId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId
              ? {
                  ...m,
                  content: `⚠️ RoboPengu Bağlantı Hatası: ${detailedError}`,
                  isStreaming: false,
                }
              : m
          )
        );
      }
    } finally {
      clearTimeout(uiTimeout);
      if (activeRequestIdRef.current === currentRequestId) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === botMsgId) {
              const finalContent =
                m.content && m.content.trim()
                  ? m.content
                  : '⚠️ Yanıt alınamadı: API sunucusundan veri akışı sağlanamadı.';
              return { ...m, content: finalContent, isStreaming: false };
            }
            return m;
          })
        );
        setLoading(false);
      }
    }
  };

  // 4 Hızlı Aksiyon Butonu
  const quickActions = [
    {
      label: '💰 Bütçe Önerisi Al',
      prompt: '30.000 TL bütçe ile alınabilecek en mantıklı telefon ve teknoloji ürünleri hangileri?',
    },
    {
      label: '⚔️ Spesifik Model Kıyasla',
      prompt: 'iPhone 16 Pro ile Samsung Galaxy S24 Ultra yı karşılaştır, hangisi daha iyi?',
    },
    {
      label: '📈 Fiyat Takip Grafiği',
      prompt: 'aceleetme sitesindeki 6 aylık fiyat geçmişi grafiği ve fiyat alarmı nasıl çalışır?',
    },
    {
      label: '📰 Teknoloji Gündemi',
      prompt: 'Teknoloji dünyasındaki en yeni işlemciler, yapay zeka trendleri ve lansman haberlerini anlat.',
    }
  ];

  if (!isOpen) return null;

  const hasPanel = activePanel !== null;

  return (
    <AnimatePresence>
      {/* Arka Plan Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 pt-14 sm:pt-4 z-50 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Ana Kapsayıcı: Maskot + Dinamik Genişleyen Modal */}
        <div
          className={`relative w-full transition-all duration-300 ease-out flex items-center justify-center ${
            hasPanel ? 'max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl' : 'max-w-full sm:max-w-2xl lg:max-w-3xl'
          }`}
        >
          {/* 1. MASKOT (DESKTOP): Sol Kenarda 3D Robot Penguen */}
          <div className="hidden lg:block absolute -left-[275px] -top-[40px] z-30 pointer-events-none select-none animate-float">
            <div className="relative">
              <img
                src="/assets/robopengu.png"
                alt="RoboPengu 3D"
                className="w-[340px] max-w-none h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
              />
              {/* Güç Reaktörü LED Butonu */}
              <button
                type="button"
                className="absolute top-[57.5%] left-[68.8%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center cursor-pointer pointer-events-auto group active:scale-95 transition-transform"
                title="RoboPengu Güç Reaktörü (Aktif)"
                onClick={() => handleSend('Bana kendinden ve bu sitede yapabileceklerinden bahset!')}
                aria-label="RoboPengu Güç Reaktörü"
              >
                <span className="absolute w-8 h-8 rounded-full bg-cyan-400/20 blur-[3px] animate-led-breathe pointer-events-none"></span>
                <span className="absolute w-4 h-4 rounded-full bg-cyan-400/50 mix-blend-screen shadow-[0_0_8px_rgba(34,211,238,0.6)] animate-led-breathe pointer-events-none"></span>
                <span className="absolute w-1.5 h-1.5 rounded-full bg-cyan-200/90 shadow-[0_0_4px_#22d3ee] animate-led-breathe pointer-events-none"></span>
              </button>
            </div>
          </div>

          {/* 1. MASKOT (TABLET): Kompakt Sol Boyut */}
          <div className="hidden md:block lg:hidden absolute -left-[190px] -top-[30px] z-30 pointer-events-none select-none animate-float">
            <div className="relative">
              <img
                src="/assets/robopengu.png"
                alt="RoboPengu 3D"
                className="w-[240px] max-w-none h-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.30)]"
              />
              <button
                type="button"
                className="absolute top-[57.5%] left-[68.8%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-pointer pointer-events-auto group active:scale-95 transition-transform"
                title="RoboPengu Güç Reaktörü (Aktif)"
                onClick={() => handleSend('Bana kendinden ve bu sitede yapabileceklerinden bahset!')}
                aria-label="RoboPengu Güç Reaktörü"
              >
                <span className="absolute w-6 h-6 rounded-full bg-cyan-400/20 blur-[2px] animate-led-breathe pointer-events-none"></span>
                <span className="absolute w-3 h-3 rounded-full bg-cyan-400/50 mix-blend-screen shadow-[0_0_6px_rgba(34,211,238,0.6)] animate-led-breathe pointer-events-none"></span>
                <span className="absolute w-1 h-1 rounded-full bg-cyan-200/90 shadow-[0_0_3px_#22d3ee] animate-led-breathe pointer-events-none"></span>
              </button>
            </div>
          </div>

          {/* 1. MASKOT (MOBİL): Üstten Dışa Taşan Sevimli Penguen */}
          <div className="block md:hidden absolute -top-[65px] left-2 z-30 select-none animate-float">
            <div className="relative">
              <img
                src="/assets/robopengu.png"
                alt="RoboPengu 3D"
                className="w-[100px] h-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.40)] pointer-events-none"
              />
              <button
                type="button"
                className="absolute top-[57.5%] left-[68.8%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center cursor-pointer active:scale-90 transition-transform touch-manipulation z-40 group"
                title="RoboPengu Güç Reaktörü (Aktif)"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSend('Bana kendinden ve bu sitede yapabileceklerinden bahset!');
                }}
                aria-label="RoboPengu Güç Reaktörü"
              >
                <span className="absolute w-5 h-5 rounded-full bg-cyan-400/20 blur-[2px] animate-led-breathe pointer-events-none"></span>
                <span className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400/50 mix-blend-screen shadow-[0_0_6px_rgba(34,211,238,0.6)] animate-led-breathe pointer-events-none"></span>
                <span className="absolute w-1 h-1 rounded-full bg-cyan-200/90 shadow-[0_0_3px_#22d3ee] animate-led-breathe pointer-events-none"></span>
              </button>
            </div>
          </div>

          {/* 2. CHAT VE YAN PANEL KAPSAYICISI */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden h-[600px] sm:h-[620px] z-20"
          >
            {/* Modal Üst Başlık Çubuğu */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 pl-16 md:pl-0">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img src="/assets/robopengu.png" alt="Robo" className="w-6 h-6 object-contain" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm">
                    RoboPengu
                  </h3>
                  <span className="px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>TEKNOLOJİ UZMANI</span>
                  </span>
                </div>
              </div>

              {/* Mobilde Tab Değiştirici (Panel Açıkken) */}
              {hasPanel && (
                <div className="flex lg:hidden items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setMobileTab('chat')}
                    className={`px-2.5 py-1 rounded-lg transition-colors ${
                      mobileTab === 'chat'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    💬 Sohbet
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('panel')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                      mobileTab === 'panel'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    {activePanel.type === 'comparison' ? (
                      <>
                        <Swords className="w-3 h-3" />
                        <span>Kıyaslama</span>
                      </>
                    ) : (
                      <>
                        <Newspaper className="w-3 h-3" />
                        <span>Haberler</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
                  title="Sohbeti Temizle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px] font-medium">Sohbeti Temizle</span>
                </button>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition text-lg p-1 cursor-pointer"
                  aria-label="Kapat"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* İç Gövde: Desktop'ta Çift Bölme (Split View), Mobilde Tab ile Değişim */}
            <div className="flex-1 flex overflow-hidden min-h-0">
              {/* SOL BÖLME: SOHBET & GİRİŞ ALANI */}
              <div
                className={`flex flex-col h-full bg-slate-50/40 dark:bg-slate-950/40 transition-all duration-200 ${
                  hasPanel
                    ? 'w-full lg:w-[420px] xl:w-[460px] shrink-0 border-r border-slate-100 dark:border-slate-800'
                    : 'w-full'
                } ${hasPanel && mobileTab === 'panel' ? 'hidden lg:flex' : 'flex'}`}
              >
                {/* Mesaj Listesi */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {messages.map((m) => (
                    <div key={m.id} className="space-y-3">
                      {m.role === 'assistant' ? (
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 mt-0.5">
                            <img src="/assets/robopengu.png" alt="Robo" className="w-5 h-5 object-contain" />
                          </div>
                          <div className="space-y-2.5 max-w-[90%] flex-1">
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-xs text-slate-700 dark:text-slate-200">
                              <MarkdownRenderer content={m.content} isStreaming={m.isStreaming} />
                            </div>

                            {/* Bot Ürün Öneri Kartları */}
                            {m.recommendations && m.recommendations.length > 0 && (
                              <div className="space-y-1.5 pt-1">
                                <div className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  <span>Öne Çıkan Seçenekler</span>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {m.recommendations.map((rec, idx) => (
                                    <Link
                                      key={rec.productId || idx}
                                      href={getProductUrl(rec)}
                                      onClick={onClose}
                                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center gap-2.5 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 transition cursor-pointer group"
                                    >
                                      {rec.image ? (
                                        <div className="w-10 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                          <ProductImage
                                            src={rec.image}
                                            alt={rec.productName}
                                            variant="card"
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-10 h-12 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-xs shrink-0">
                                          📱
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                          {rec.productName}
                                        </h4>
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                            ₺{rec.price.toLocaleString('tr-TR')}
                                          </span>
                                          {rec.cheapestStore && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                                              {rec.cheapestStore}
                                            </span>
                                          )}
                                        </div>
                                        {rec.reason && (
                                          <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
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
                        <div className="flex items-start justify-end gap-2.5">
                          <div className="bg-emerald-600 text-white p-3 rounded-2xl rounded-tr-none text-xs leading-relaxed max-w-[85%] font-medium shadow-xs">
                            {m.content}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Alt Kısım: 4 Hızlı Aksiyon Butonu & Input */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shrink-0">
                  {/* Hızlı Aksiyon Butonları */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] sm:text-[11px] no-scrollbar pb-0.5">
                    {quickActions.map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(qa.prompt)}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-full whitespace-nowrap text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>

                  {/* Mesaj Giriş Formu */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (input.trim() && input.length <= 500 && !loading) {
                        handleSend(input);
                      }
                    }}
                    className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Model sor, karşılaştır veya bütçe belirt..."
                        disabled={loading}
                        className="w-full bg-transparent text-xs text-slate-700 dark:text-slate-200 outline-none px-1 py-1 font-medium placeholder:text-slate-400"
                      />
                      <button
                        type="submit"
                        disabled={loading || !input.trim() || input.length > 500}
                        className="w-8 h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0"
                        aria-label="Gönder"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '➤'}
                      </button>
                    </div>

                    {/* Karakter Sayacı ve Dinamik Uyarı */}
                    <div className="flex items-center justify-between text-[10px] px-1 text-slate-400">
                      {input.length > 450 ? (
                        <span className={input.length > 500 ? "text-rose-500 font-semibold" : "text-amber-500 font-medium"}>
                          {input.length > 500
                            ? "Mesajınız 500 karakteri aşıyor. Lütfen kısaltınız."
                            : "500 karakter sınırına yaklaşıyorsunuz."}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className={`font-mono text-[9px] ${input.length > 500 ? "text-rose-500 font-bold" : input.length > 450 ? "text-amber-500 font-bold" : "text-slate-400"}`}>
                        {input.length}/500
                      </span>
                    </div>
                  </form>
                </div>
              </div>

              {/* SAĞ BÖLME: CANLI YAN PANEL (KARŞILAŞTIRMA VEYA HABERLER) */}
              {hasPanel && (
                <div
                  className={`flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-hidden transition-all duration-300 ${
                    mobileTab === 'panel' ? 'flex' : 'hidden lg:flex'
                  }`}
                >
                  {/* Panel Başlığı ve Kapatma Butonu */}
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 shrink-0">
                    <div className="flex items-center gap-2">
                      {activePanel.type === 'comparison' ? (
                        <>
                          <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                            <Swords className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                              Canlı Karşılaştırma Paneli
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              {activePanel.scenario}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="p-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
                            <Newspaper className="w-4 h-4" />
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100">
                              Teknoloji Gündemi
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              {activePanel.topic}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePanel(null);
                        setMobileTab('chat');
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1"
                      title="Paneli Kapat"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Kapat</span>
                    </button>
                  </div>

                  {/* Panel İçeriği (Kaydırılabilir) */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {/* A. KARŞILAŞTIRMA GÖRÜNÜMÜ */}
                    {activePanel.type === 'comparison' && (!Array.isArray(activePanel.products) || activePanel.products.length < 2 || !Array.isArray(activePanel.matrix)) && (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Bu bilgiyi şu an gösteremiyorum. 🐧</p>
                      </div>
                    )}
                    {activePanel.type === 'comparison' && Array.isArray(activePanel.products) && activePanel.products.length >= 2 && Array.isArray(activePanel.matrix) && (
                      <div className="space-y-4">
                        {/* 1. Ürün Kartları Başlığı */}
                        <div className={`grid gap-3 ${activePanel.products.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                          {activePanel.products.map((p) => {
                            const isWinner = activePanel.winner?.productId === p.id;
                            return (
                              <div
                                key={p.id}
                                className={`relative p-3 rounded-2xl border transition-all ${
                                  isWinner
                                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-600 shadow-sm'
                                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-800'
                                }`}
                              >
                                {isWinner && (
                                  <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1 uppercase tracking-wide">
                                    <Trophy className="w-2.5 h-2.5" />
                                    <span>Kazanan</span>
                                  </div>
                                )}

                                <div className="h-20 sm:h-24 w-full flex items-center justify-center mb-2">
                                  {p.image ? (
                                    <ProductImage
                                      src={p.image}
                                      alt={p.name}
                                      variant="card"
                                      className="max-h-full max-w-full object-contain"
                                    />
                                  ) : (
                                    <div className="text-3xl">📱</div>
                                  )}
                                </div>

                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {p.brand}
                                </div>
                                <h5 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                                  {p.name}
                                </h5>

                                <div className="mt-1.5 flex items-baseline gap-1">
                                  <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                                    ₺{p.price.toLocaleString('tr-TR')}
                                  </span>
                                </div>

                                <div className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                  En Ucuz: <strong className="text-slate-700 dark:text-slate-300">{p.cheapestStore}</strong>
                                </div>

                                <Link
                                  href={getProductUrl(p)}
                                  onClick={onClose}
                                  className="mt-2 block text-center py-1 bg-white dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-semibold transition cursor-pointer"
                                >
                                  Detay & Mağazalar ↗
                                </Link>
                              </div>
                            );
                          })}
                        </div>

                        {/* 2. Satır Satır Özellik Matrisi */}
                        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                          <div className="px-3 py-2 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                              Teknik Özellik Kıyaslaması
                            </span>
                            <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                              ● Farklı olanlar vurgulanmıştır
                            </span>
                          </div>

                          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                            {activePanel.matrix.map((row, idx) => (
                              <div
                                key={idx}
                                className={`p-2.5 transition-colors ${
                                  row.isDifferent
                                    ? 'bg-emerald-50/30 dark:bg-emerald-950/10'
                                    : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                <div className="text-[10px] font-semibold text-slate-400 mb-1">
                                  {row.label}
                                </div>
                                <div className={`grid gap-3 ${row.values.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                                  {row.values.map((val, valIdx) => (
                                    <div
                                      key={valIdx}
                                      className={`text-xs ${
                                        row.highlightIdx === valIdx
                                          ? 'font-bold text-emerald-600 dark:text-emerald-400'
                                          : row.isDifferent
                                          ? 'font-semibold text-slate-800 dark:text-slate-200'
                                          : 'text-slate-600 dark:text-slate-400'
                                      }`}
                                    >
                                      {val}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Kazanan Kartı ve 3 Maddelik Sayısal Gerekçe */}
                        {activePanel.winner && (
                          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-300 dark:border-emerald-700/60 shadow-xs space-y-2.5">
                            <div className="flex items-center gap-2">
                              <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
                                <Trophy className="w-4 h-4" />
                              </span>
                              <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                  RoboPengu Değerlendirmesi
                                </span>
                                <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                                  🏆 Kazanan: {activePanel.winner.productName}
                                </h4>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                              {activePanel.winner.reasons.map((reason, rIdx) => (
                                <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="font-medium">{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* B. TEKNOLOJİ HABERLERİ GÖRÜNÜMÜ */}
                    {activePanel.type === 'news' && (!Array.isArray(activePanel.articles) || activePanel.articles.length === 0) && (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-center space-y-2">
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">Bu bilgiyi şu an gösteremiyorum. 🐧</p>
                      </div>
                    )}
                    {activePanel.type === 'news' && Array.isArray(activePanel.articles) && activePanel.articles.length > 0 && (
                      <div className="space-y-3">
                        {activePanel.articles.map((art) => (
                          <div
                            key={art.id}
                            className="p-3.5 bg-slate-50/70 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-1.5 hover:border-cyan-400 dark:hover:border-cyan-600 transition shadow-xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                                {art.tag}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {art.date}
                              </span>
                            </div>

                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                              {art.title}
                            </h5>

                            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                              {art.summary}
                            </p>

                            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-slate-700/50">
                              <span>Kaynak: {art.source}</span>
                              {art.url && (
                                <a
                                  href={art.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-1"
                                >
                                  Detay ↗
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
