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
  X,
  Cpu,
  Camera,
  BatteryCharging,
  Smartphone,
  ChevronDown,
  Layers,
  Shield,
  Check,
  Crown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Globe,
} from 'lucide-react';
import { ProductImage } from '@/components/ui/ProductImage';
import { getFallbackProductImage } from '@/lib/ai/fallbackImages';
import { GlobalAiNewsDrawer } from '@/components/ai/GlobalAiNewsDrawer';

/**
 * Türkçe Teknoloji Fonetik Sözlüğü (Phonetic Speech Engine)
 * Web Speech API TTS seslendirirken İngilizce ve teknik terimlerin
 * robotik/hatalı okunmasını engeller, akıcı ve doğal Türkçe tını kazandırır.
 */
export function applyTurkishTechPhonetics(text: string): string {
  if (!text) return '';
  return text
    // Markalar & Modeller
    .replace(/\biPhone\b/gi, 'Ayfon')
    .replace(/\bXiaomi\b/gi, 'Şaomi')
    .replace(/\bHuawei\b/gi, 'Huavey')
    .replace(/\bSamsung Galaxy\b/gi, 'Samsung Galaksi')
    .replace(/\bGalaxy\b/gi, 'Galaksi')
    .replace(/\bPro Max\b/gi, 'Pro Maks')
    .replace(/\bPromax\b/gi, 'Pro Maks')
    .replace(/\bPlayStation\b/gi, 'Pleyşın')
    .replace(/\bMacBook\b/gi, 'Mekbuk')
    .replace(/\biPad\b/gi, 'Ay-ped')
    .replace(/\bApple Watch\b/gi, 'Epıl Voç')
    .replace(/\bApple\b/gi, 'Epıl')
    // Benchmark & Donanım
    .replace(/\bAnTuTu\b/gi, 'Antutu')
    .replace(/\bGeekbench\b/gi, 'Gikbenç')
    .replace(/\bDxOMark\b/gi, 'Deksomark')
    .replace(/\bSnapdragon\b/gi, 'Snepdregın')
    .replace(/\bBionic\b/gi, 'Bayonik')
    .replace(/\bTitanium\b/gi, 'Titanyum')
    // Panel & Ekran
    .replace(/\bAMOLED\b/gi, 'Amoled')
    .replace(/\bOLED\b/gi, 'O-led')
    .replace(/\bLTPO\b/gi, 'L-T-P-O')
    .replace(/\bMini-LED\b/gi, 'Mini-Led')
    .replace(/\bQNED\b/gi, 'Ku-ned')
    .replace(/\bQLED\b/gi, 'Ku-led')
    .replace(/\bHDR10\+\b/gi, 'Ha-De-Re 10 artı')
    .replace(/\bDolby Vision\b/gi, 'Dolbi Vıjın')
    .replace(/\bDolby Atmos\b/gi, 'Dolbi Atmos')
    .replace(/(\d+)\s*nits?\b/gi, '$1 nit')
    // Sayısal Donanım Birimleri
    .replace(/(\d+)\s*mAh\b/gi, '$1 miliamper saat')
    .replace(/(\d+)\s*W\b/gi, '$1 vat')
    .replace(/(\d+)\s*MP\b/gi, '$1 megapiksel')
    .replace(/(\d+)\s*GB\b/gi, '$1 gigabayt')
    .replace(/(\d+)\s*TB\b/gi, '$1 terabayt')
    .replace(/(\d+)\s*Hz\b/gi, '$1 hertz')
    .replace(/(\d+)\s*nm\b/gi, '$1 nanometre')
    // Kısaltmalar
    .replace(/\bvs\.?\b/gi, 'karşı')
    .replace(/\bF\/P\b/gi, 'fiyat performans')
    .replace(/\bAI\b/g, 'yapay zeka')
    .replace(/\bOIS(?:\s*sabitleme)?\b/gi, 'optik sabitleme')
    .replace(/\bType-C\b/gi, 'Tayp-si')
    .replace(/\bUSB-C\b/gi, 'U-es-bi-si')
    .replace(/\bWi-Fi\b/gi, 'Vayfay')
    .replace(/\bBluetooth\b/gi, 'Blutut');
}

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
  key?: string;
  group?: string;
  values: string[];
  isDifferent: boolean;
  highlightIdx?: number;
  superiorIdx?: number | null;
}

export interface ComparisonPanelData {
  type: 'comparison';
  scenario: string;
  category?: string;
  deepAnalysis?: string;
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

// ---- İçerik Ayrıştırıcı (Sol Sohbet Özeti, Sağ Derinlemesine Analiz & Sesli Özet) ----

export function partitionContent(content: string) {
  if (!content) return { chatSummary: '', deepAnalysis: '', voiceSummary: '', cleanDisplay: '' };

  let voiceSummary = '';
  let cleanContent = content;

  // 1. [VOICE_SUMMARY] bloğunu ayıkla ve görsel metinden temizle
  if (cleanContent.includes('[VOICE_SUMMARY]')) {
    const vParts = cleanContent.split('[VOICE_SUMMARY]');
    const vAfter = vParts[1] || '';
    if (vAfter.includes('[/VOICE_SUMMARY]')) {
      voiceSummary = vAfter.split('[/VOICE_SUMMARY]')[0].trim();
      cleanContent = (vParts[0] + vAfter.split('[/VOICE_SUMMARY]')[1]).trim();
    } else {
      const nextTagMatch = vAfter.search(/\[(?:SUMMARY_CHAT|DEEP_ANALYSIS)\]/);
      if (nextTagMatch !== -1) {
        voiceSummary = vAfter.slice(0, nextTagMatch).trim();
        cleanContent = (vParts[0] + vAfter.slice(nextTagMatch)).trim();
      } else {
        voiceSummary = vAfter.trim();
        cleanContent = vParts[0].trim();
      }
    }
  }

  // Kalan olası [VOICE_SUMMARY] etiketlerini temizle
  cleanContent = cleanContent.replace(/\[\/?VOICE_SUMMARY\]/gi, '').trim();

  let chatSummary = '';
  let deepAnalysis = '';

  // 2. [SUMMARY_CHAT] ve [DEEP_ANALYSIS] bloklarını ayır
  if (cleanContent.includes('[SUMMARY_CHAT]') || cleanContent.includes('[DEEP_ANALYSIS]')) {
    if (cleanContent.includes('[SUMMARY_CHAT]')) {
      const parts = cleanContent.split('[SUMMARY_CHAT]');
      const afterStart = parts[1] || '';
      if (afterStart.includes('[/SUMMARY_CHAT]')) {
        chatSummary = afterStart.split('[/SUMMARY_CHAT]')[0].trim();
      } else if (afterStart.includes('[DEEP_ANALYSIS]')) {
        chatSummary = afterStart.split('[DEEP_ANALYSIS]')[0].trim();
      } else {
        chatSummary = afterStart.trim();
      }
    }

    if (cleanContent.includes('[DEEP_ANALYSIS]')) {
      const parts = cleanContent.split('[DEEP_ANALYSIS]');
      const afterStart = parts[1] || '';
      if (afterStart.includes('[/DEEP_ANALYSIS]')) {
        deepAnalysis = afterStart.split('[/DEEP_ANALYSIS]')[0].trim();
      } else {
        deepAnalysis = afterStart.trim();
      }
    }

    chatSummary = chatSummary
      .replace(/\[\/?SUMMARY_CHAT\]/g, '')
      .replace(/\[\/?DEEP_ANALYSIS\]/g, '')
      .trim();
    deepAnalysis = deepAnalysis
      .replace(/\[\/?SUMMARY_CHAT\]/g, '')
      .replace(/\[\/?DEEP_ANALYSIS\]/g, '')
      .trim();
  } else {
    // Heuristik: "### 1." veya "1. Ekran" ile başlayan teknik kısımları ayır
    const deepSplitMatch = cleanContent.match(/(?:^|\n)(?:###?\s*(?:1[\.\)]\s*)?Ekran|###?\s*1[\.\)]|##\s*1[\.\)])/i);
    if (deepSplitMatch && deepSplitMatch.index !== undefined) {
      chatSummary = cleanContent.slice(0, deepSplitMatch.index).trim();
      deepAnalysis = cleanContent.slice(deepSplitMatch.index).trim();
    } else {
      chatSummary = cleanContent;
    }
  }

  // 3. Eğer model açıkça [VOICE_SUMMARY] üretmediyse, ilk 1-2 cümleden kısa özet türet
  if (!voiceSummary) {
    const baseSummary = chatSummary || cleanContent;
    if (baseSummary) {
      const sentences = baseSummary
        .replace(/\[\/?(?:SUMMARY_CHAT|DEEP_ANALYSIS)\]/g, '')
        .split(/(?<=[.?!])\s+/)
        .filter((s) => s.trim().length > 0);
      if (sentences.length > 2) {
        voiceSummary = sentences.slice(0, 2).join(' ') + ' Detayları ekrandan inceleyebilirsin.';
      } else {
        voiceSummary = sentences.join(' ');
      }
    }
  }

  return {
    chatSummary,
    deepAnalysis,
    voiceSummary,
    cleanDisplay: chatSummary || cleanContent,
  };
}

export function parseAnalysisSections(deepText: string): Array<{ title: string; body: string }> {
  if (!deepText) return [];
  const regex = /(?:^|\n)###?\s*([1-4][\.\)]\s*[^\n]+)/g;
  const sections: Array<{ title: string; body: string }> = [];
  let match: RegExpExecArray | null;
  const indices: Array<{ title: string; index: number }> = [];

  while ((match = regex.exec(deepText)) !== null) {
    indices.push({
      title: match[1].trim(),
      index: match.index + match[0].indexOf('###'),
    });
  }

  for (let i = 0; i < indices.length; i++) {
    const title = indices[i].title;
    const start = indices[i].index;
    const end = i + 1 < indices.length ? indices[i + 1].index : deepText.length;
    const block = deepText.slice(start, end).trim();
    const body = block.replace(/^###?\s*[1-4][\.\)]\s*[^\n]+\n?/, '').trim();
    sections.push({ title, body });
  }

  return sections;
}

// ---- Basit & Hızlı Markdown Ayrıştırıcı Bileşeni --------------------

function MarkdownRenderer({ content, isStreaming }: { content: string; isStreaming?: boolean }) {
  const cleanContent = (content || '')
    .replace(/\[\/?(SUMMARY_CHAT|DEEP_ANALYSIS)\]/g, '')
    .trim();

  if (!cleanContent) {
    return isStreaming ? (
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 py-1 animate-pulse">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
        <span className="italic font-medium">RoboPengu donanım verilerini inceliyor... 🐧</span>
      </div>
    ) : null;
  }

  // Check if content contains a markdown table
  const lines = cleanContent.split('\n');
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
  const [isNewsDrawerOpen, setIsNewsDrawerOpen] = useState(false);
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  // Sesli Konuşma (Voice In / Voice Out) Durumları
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechToast, setSpeechToast] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const recognitionRef = useRef<any>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSpeechToast = (msg: string) => {
    setSpeechToast(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => setSpeechToast(null), 4500);
  };

  // Ses Tercihini LocalStorage'dan yükle, Speech API desteğini denetle & Sesleri önceden yükle
  useEffect(() => {
    try {
      const savedVoice = localStorage.getItem('robopengu_voice_enabled');
      if (savedVoice !== null) {
        setVoiceEnabled(savedVoice === 'true');
      }
    } catch {}

    if (typeof window !== 'undefined') {
      const hasSpeech = Boolean(
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      );
      setSpeechSupported(hasSpeech);

      if ('speechSynthesis' in window) {
        const loadVoices = () => {
          try {
            const v = window.speechSynthesis.getVoices();
            if (v && v.length > 0) {
              setAvailableVoices(v);
            }
          } catch {}
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  const toggleVoice = () => {
    setVoiceEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('robopengu_voice_enabled', String(next));
      } catch {}
      if (!next) {
        stopSpeaking();
      }
      return next;
    });
  };

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      activeUtteranceRef.current = null;
      setIsSpeaking(false);
    }
  };

  // 🐧 Biyo-Mekanik Reaktör Durumu & Mikro-Etkileşimler
  const isThinking = loading;
  const hasWinner = Boolean(activePanel?.type === 'comparison' && activePanel?.winner);
  const reactorState: 'thinking' | 'speaking' | 'winner' | 'idle' = isThinking
    ? 'thinking'
    : isSpeaking
    ? 'speaking'
    : hasWinner
    ? 'winner'
    : 'idle';

  const handleReactorClick = () => {
    try {
      if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
        navigator.vibrate(20);
      }
    } catch {}
    // Kullanıcı talebi: O düğmeye basınca kesinlikle konuşmasın, varsa sesi derhal durdursun
    stopSpeaking();
    // Dünyadaki yapay zeka haberleri kayan penceresini aç
    setIsNewsDrawerOpen(true);
  };

  const renderCyberReactor = (size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeConfig = {
      sm: { outer: 'w-5 h-5', bezel: 'w-3.5 h-3.5', core: 'w-1.5 h-1.5', highlight: 'top-0.5 left-0.5 w-0.5 h-0.5' },
      md: { outer: 'w-7 h-7', bezel: 'w-5 h-5', core: 'w-2 h-2', highlight: 'top-0.5 left-0.5 w-1 h-0.5' },
      lg: { outer: 'w-8 h-8', bezel: 'w-6 h-6', core: 'w-2.5 h-2.5', highlight: 'top-0.5 left-0.5 w-1 h-0.5' },
    }[size];

    return (
      <div className="relative flex items-center justify-center select-none pointer-events-none">
        {/* 1. Katman: Duruma Duyarlı Zarif & İnce Reaktif Işıma Halesi (Aşırılıktan Uzak) */}
        <span
          className={`absolute rounded-full transition-all duration-700 ${sizeConfig.outer} ${
            reactorState === 'thinking'
              ? 'bg-cyan-400/35 blur-[2px] animate-reactor-thinking'
              : reactorState === 'speaking'
              ? 'bg-emerald-400/35 blur-[2px] animate-reactor-speaking'
              : reactorState === 'winner'
              ? 'bg-emerald-400/40 blur-[2px] animate-reactor-winner'
              : 'bg-cyan-400/20 blur-[1.5px] animate-led-breathe'
          }`}
        />

        {/* 2. Katman: Rafine Titanyum Bezel Çerçeve */}
        <div
          className={`relative ${sizeConfig.bezel} rounded-full bg-slate-900/90 border border-slate-700/70 shadow-xs flex items-center justify-center backdrop-blur-xs`}
        >
          {/* 3. Katman: Kristal Çekirdek Lens (Safir Kristal Mikro Çekirdek) */}
          <span
            className={`${sizeConfig.core} rounded-full transition-all duration-300 ${
              reactorState === 'thinking'
                ? 'bg-cyan-300 shadow-[0_0_4px_rgba(6,182,212,0.6)]'
                : reactorState === 'speaking'
                ? 'bg-emerald-300 shadow-[0_0_4px_rgba(16,185,129,0.6)]'
                : reactorState === 'winner'
                ? 'bg-emerald-300 shadow-[0_0_4px_rgba(16,185,129,0.6)]'
                : 'bg-cyan-300/80 shadow-[0_0_3px_rgba(6,182,212,0.4)]'
            }`}
          />

          {/* 4. Katman: Lens Speküler Yansıma Highlight */}
          <span className={`absolute ${sizeConfig.highlight} rounded-full bg-white/70 blur-[0.1px] pointer-events-none`} />
        </div>
      </div>
    );
  };

  const renderAudioWaveform = () => (
    <span className="flex items-end gap-[2px] h-3.5 px-1 py-0.5 pointer-events-none">
      <span className="w-1 bg-emerald-500 rounded-full animate-wave-1"></span>
      <span className="w-1 bg-emerald-400 rounded-full animate-wave-2"></span>
      <span className="w-1 bg-teal-400 rounded-full animate-wave-3"></span>
      <span className="w-1 bg-cyan-400 rounded-full animate-wave-4"></span>
    </span>
  );

  const speakSummary = (text: string, force = false) => {
    if ((!voiceEnabled && !force) || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    if (force && !voiceEnabled) {
      setVoiceEnabled(true);
      try {
        localStorage.setItem('robopengu_voice_enabled', 'true');
      } catch {}
    }

    stopSpeaking();

    // Sesli özet: [VOICE_SUMMARY] varsa onu al, yoksa partitionContent'in ürettiği akıllı özet
    const { voiceSummary, chatSummary } = partitionContent(text);
    let voiceText = voiceSummary || chatSummary || text;

    // Eğer voiceSummary açıkça yoksa ve metin 2 cümleden uzunsa kısalt
    if (!voiceSummary) {
      const sentences = voiceText.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 0);
      if (sentences.length > 2) {
        voiceText = sentences.slice(0, 2).join(' ') + ' Detayları ekrandan inceleyebilirsin.';
      }
    }

    // Markdown ve özel karakterleri temizle (stripMarkdown)
    const cleanSpeech = voiceText
      .replace(/\[\/?(?:VOICE_SUMMARY|SUMMARY_CHAT|DEEP_ANALYSIS)\]/gi, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/[*#_`~\[\]]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanSpeech) return;

    try {
      // Chromium duraklatılmış (paused) kilitlenme hatasını çöz
      if (window.speechSynthesis.paused) {
        try {
          window.speechSynthesis.resume();
        } catch {}
      }

      const phoneticSpeech = applyTurkishTechPhonetics(cleanSpeech);
      const utterance = new SpeechSynthesisUtterance(phoneticSpeech);
      utterance.lang = 'tr-TR';
      utterance.pitch = 1.18; // Sempatik, genç siborg tınısı
      utterance.rate = 1.05;  // Akıcı, kendinden emin ve anlaşılır tempo
      utterance.volume = 1.0;

      // Türkçe ses arama önceliği (Tolga, Google Türkçe, Microsoft tr-TR)
      const allVoices = availableVoices.length > 0 ? availableVoices : window.speechSynthesis.getVoices();
      const trVoice = allVoices.find((v) =>
        (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('tr')) ||
        (v.name && (v.name.toLowerCase().includes('turkish') || v.name.toLowerCase().includes('türkçe') || v.name.toLowerCase().includes('tolga')))
      );
      if (trVoice) {
        utterance.voice = trVoice;
        utterance.lang = trVoice.lang;
      }

      // Garbage Collection Önleme (Chromium Issue 679437 / Issue 338735 Çözümü)
      activeUtteranceRef.current = utterance;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
      };
      utterance.onerror = (ev: any) => {
        console.warn('[RoboPengu][SpeechSynthesis] utterance error:', ev?.error, ev);
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
        if (ev?.error === 'not-allowed') {
          showSpeechToast('Tarayıcı otomatik ses çalmayı engelledi. Dinlemek için mesajdaki "Sesli Dinle" butonuna tıklayabilirsiniz.');
        }
      };

      // Chromium cancel-speak eşzamanlılık çakışmasını önlemek için 60ms güvenli gecikme
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.warn('[RoboPengu] speak failed:', e);
          setIsSpeaking(false);
          activeUtteranceRef.current = null;
        }
      }, 60);
    } catch (err) {
      console.warn('[RoboPengu][SpeechSynthesis] speak error:', err);
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    }
  };

  const startListening = () => {
    stopSpeaking();
    if (typeof window === 'undefined') return;
    const SpeechRecognitionConstructor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      showSpeechToast('Bu tarayıcıda sesli giriş desteklenmiyor. Chrome veya Edge ile deneyebilirsiniz.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let recognizedSpeech = '';
      let hasError = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechToast(null);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          recognizedSpeech = transcript.trim();
          setInput(recognizedSpeech);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[RoboPengu][SpeechRecognition] error:', event.error);
        hasError = true;
        setIsListening(false);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          showSpeechToast('Mikrofon erişim izni verilmedi. Lütfen tarayıcı ayarlarından mikrofona izin verin.');
        } else if (event.error === 'no-speech') {
          showSpeechToast('Duyamadım, lütfen tekrar söyler misiniz? 🎙️');
        } else {
          showSpeechToast('Ses algılanamadı, lütfen tekrar deneyin.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        const textToSend = recognizedSpeech.trim();
        if (textToSend) {
          handleSend(textToSend);
        } else if (!hasError) {
          showSpeechToast('Duyamadım, lütfen tekrar söyler misiniz? 🎙️');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('[RoboPengu] SpeechRecognition start error:', err);
      setIsListening(false);
      showSpeechToast('Mikrofon başlatılamadı, lütfen tekrar deneyin.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => ({
      ...prev,
      [idx]: prev[idx] !== undefined ? !prev[idx] : false,
    }));
  };

  const getSectionBadgeStyle = (title: string) => {
    if (title.includes('Ekran') || title.includes('Panel')) return 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400';
    if (title.includes('İşlemci') || title.includes('Donanım') || title.includes('Performans')) return 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400';
    if (title.includes('Kamera') || title.includes('Sensör')) return 'bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400';
    if (title.includes('Batarya') || title.includes('Şarj') || title.includes('Pil')) return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
  };

  const getSectionIcon = (title: string) => {
    if (title.includes('Ekran') || title.includes('Panel')) return <Smartphone className="w-3.5 h-3.5" />;
    if (title.includes('İşlemci') || title.includes('Donanım') || title.includes('Performans')) return <Cpu className="w-3.5 h-3.5" />;
    if (title.includes('Kamera') || title.includes('Sensör')) return <Camera className="w-3.5 h-3.5" />;
    if (title.includes('Batarya') || title.includes('Şarj') || title.includes('Pil')) return <BatteryCharging className="w-3.5 h-3.5" />;
    return <Sparkles className="w-3.5 h-3.5" />;
  };

  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
  const { deepAnalysis: currentDeepAnalysis } = partitionContent(latestAssistantMsg?.content || '');
  const activeDeepAnalysis = currentDeepAnalysis || (activePanel?.type === 'comparison' ? activePanel.deepAnalysis : '');
  const analysisSections = parseAnalysisSections(activeDeepAnalysis || '');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const hasSpokenRef = useRef<boolean>(false);

  const getProductUrl = (rec: { slug?: string; productId?: string; category?: string; name?: string }) => {
    const slug = rec.slug || rec.productId;
    if (slug?.startsWith('dyn-') || rec.productId?.startsWith('dyn-')) {
      const q = rec.name || slug?.replace('dyn-', '') || '';
      return `/search?q=${encodeURIComponent(q)}`;
    }
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

  // 3. Kıyaslama Ekranını Otomatik Açma Güvencesi:
  // Asistan yanıtı kıyaslama/derin analiz içeriyor ama sunucudan panel verisi gelmemişse,
  // yanıt veya kullanıcı sorusundan ürünleri tespit edip sağ paneli anında aç!
  useEffect(() => {
    if (activePanel === null && messages.length > 0) {
      const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
      if (lastAssistant && lastAssistant.content) {
        const { deepAnalysis } = partitionContent(lastAssistant.content);
        const hasComparisonCues =
          Boolean(deepAnalysis) ||
          lastAssistant.content.includes('[DEEP_ANALYSIS]') ||
          lastAssistant.content.includes('[SUMMARY_CHAT]') ||
          /(?:^|\n)(?:###?\s*(?:1[\.\)]\s*)?Ekran|###?\s*1[\.\)]|##\s*1[\.\)])/i.test(lastAssistant.content);

        if (hasComparisonCues) {
          const lastUser = [...messages].reverse().find((m) => m.role === 'user');
          const promptText = lastUser?.content || '';
          const responseText = lastAssistant.content;

          // Asistan metninden "X ve Y modellerini" veya kıyaslanan modelleri tespit et
          const modelMatch =
            responseText.match(/([A-Za-z0-9\s\-]+?)\s+(?:ve|ile)\s+([A-Za-z0-9\s\-]+?)\s+(?:modellerini|cihazlarını|telefonlarını|televizyonlarını|ürünlerini)/i) ||
            responseText.match(/(?:kıyaslama|karşılaştırma|düello|analiz):\s*([A-Za-z0-9\s\-]+?)\s+(?:vs\.?|ile|ve)\s+([A-Za-z0-9\s\-]+)/i);

          let p1 = '';
          let p2 = '';

          if (modelMatch) {
            p1 = modelMatch[1].trim();
            p2 = modelMatch[2].trim();
          } else {
            const userParts = promptText
              .replace(/[\?\!\.]+/g, ' ')
              .replace(/\b(kiyasla|kıyasla|karsilastir|karşılaştır|hangisi|daha|iyi|farki|farkı|aralarındaki|arasındaki|alınır|tercih|edilmeli)\b/gi, '')
              .split(/\s+(?:vs\.?|ile|ve|\/|karşı|yoksa)\s+/i)
              .map((s) => s.trim())
              .filter((s) => s.length >= 2);
            if (userParts.length >= 2) {
              p1 = userParts[0];
              p2 = userParts[1];
            }
          }

          // Eğer model isimleri tespit edilemediyse jenerik "Ürün 1/2" üretme, sessizce çık
          if (!p1 || !p2 || p1.length < 2 || p2.length < 2 || /^ürün\s*\d/i.test(p1) || /^ürün\s*\d/i.test(p2)) {
            return;
          }

          // Kazananı tespit et
          const boldWinnerMatch =
            responseText.match(/\*\*([^*]+)\*\*\s+bu\s+(?:düellonun|kıyaslamanın|karşılaştırmanın)/i) ||
            responseText.match(/kazanan(?:ı|i)?:\s*\*?\*?([A-Za-z0-9\s\-]+)/i);
          const winnerName = boldWinnerMatch ? boldWinnerMatch[1].trim() : p2;

          const isTv =
            promptText.toLowerCase().includes('tv') ||
            promptText.toLowerCase().includes('oled') ||
            promptText.toLowerCase().includes('qned') ||
            responseText.toLowerCase().includes('oled') ||
            responseText.toLowerCase().includes('qned');
          const category = isTv ? 'tvs' : 'phones';

          const getBrand = (name: string) => {
            const n = name.toLowerCase();
            if (n.includes('iphone') || n.includes('apple') || n.includes('macbook') || n.includes('ipad')) return 'Apple';
            if (n.includes('samsung') || n.includes('galaxy')) return 'Samsung';
            if (n.includes('xiaomi') || n.includes('redmi') || n.includes('poco')) return 'Xiaomi';
            if (n.includes('sony')) return 'Sony';
            if (n.includes('lg')) return 'LG';
            if (n.includes('huawei')) return 'Huawei';
            if (n.includes('asus')) return 'Asus';
            return name.split(' ')[0] || 'Teknoloji';
          };

          const isPhone = category === 'phones';
          const fallbackMatrix: ComparisonMatrixRow[] = isPhone
            ? [
                { label: 'AnTuTu v10 Skoru', values: ['Amiral Gemisi Benchmark', 'Amiral Gemisi Benchmark'], isDifferent: false },
                { label: 'İşlemci & Çip Mimarisi', values: ['3nm / 2nm Gelişmiş Mimari', '3nm / 2nm Gelişmiş Mimari'], isDifferent: false },
                { label: 'Ekran & Panel', values: ['120Hz LTPO OLED / HDR', '120Hz LTPO OLED / HDR'], isDifferent: false },
                { label: 'Tepe Parlaklık (Nits)', values: ['3000+ nits Tepe Değeri', '2600+ nits Tepe Değeri'], isDifferent: true, highlightIdx: 0 },
                { label: 'Ana Kamera Sensörü', values: ['48MP / 50MP Geniş Açı', '48MP / 50MP Geniş Açı'], isDifferent: false },
                { label: 'Telefoto & Optik Zoom', values: ['5x Periskop Optik Zoom', '5x Periskop Optik Zoom'], isDifferent: false },
                { label: 'Batarya & Hızlı Şarj', values: ['Gelişmiş Güç Yönetimi & Hızlı Şarj', 'Gelişmiş Güç Yönetimi & Hızlı Şarj'], isDifferent: false },
              ]
            : [
                { label: 'Panel Teknolojisi', values: ['OLED / Mini-LED', 'OLED / Mini-LED'], isDifferent: false },
                { label: 'Çözünürlük & Yenileme', values: ['4K UHD @ 120Hz/144Hz', '4K UHD @ 120Hz/144Hz'], isDifferent: false },
                { label: 'HDR & Parlaklık', values: ['Dolby Vision / HDR10+', 'Dolby Vision / HDR10+'], isDifferent: false },
                { label: 'Ses Sistemi & Güç', values: ['Dolby Atmos Çok Kanallı', 'Dolby Atmos Çok Kanallı'], isDifferent: false },
              ];

          setActivePanel({
            type: 'comparison',
            scenario: 'Detaylı Karşılaştırma & AnTuTu/Versus Düellosu',
            category,
            products: [
              {
                id: 'dyn-1',
                slug: p1.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: p1,
                brand: getBrand(p1),
                category,
                image: getFallbackProductImage(p1, category),
                price: 0,
                cheapestStore: 'Piyasa Fiyatı',
              },
              {
                id: 'dyn-2',
                slug: p2.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: p2,
                brand: getBrand(p2),
                category,
                image: getFallbackProductImage(p2, category),
                price: 0,
                cheapestStore: 'Piyasa Fiyatı',
              },
            ],
            matrix: fallbackMatrix,
            winner: {
              productId: winnerName.toLowerCase().includes(p1.toLowerCase()) ? 'dyn-1' : 'dyn-2',
              productName: winnerName,
              scenario: 'Teknik Donanım & AnTuTu Değerlendirmesi',
              reasons: [
                'Benchmark ve grafik işlemci performansında üstün kararlılık',
                'Ekran tepe parlaklığı, renk doğruluğu ve panel mimarisi',
                'Kamera sensör boyutu ve optik görüntü sabitleme kabiliyeti',
              ],
            },
          });
          setMobileTab('panel');
        }
      }
    }
  }, [messages, activePanel]);

  // Sohbeti Sıfırlama
  const handleClearChat = () => {
    stopSpeaking();
    stopListening();
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


  const handleSend = async (queryText: string) => {
    stopSpeaking();
    stopListening();
    hasSpokenRef.current = false;
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
      let streamBuffer = '';
      let accumulatedBotText = '';

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

        streamBuffer += decoder.decode(value, { stream: true });
        const events = streamBuffer.split('\n\n');
        streamBuffer = events.pop() || '';

        for (const evt of events) {
          if (!evt.trim()) continue;
          if (activeRequestIdRef.current !== currentRequestId) return;

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

          // 1. Yan Panel Olayı (Karşılaştırma veya Haberler)
          if (eventType === 'panel' && dataStr) {
            try {
              const panelData = JSON.parse(dataStr);
              if (panelData && (panelData.type === 'comparison' || panelData.type === 'news')) {
                setActivePanel(panelData);
                setMobileTab('panel');
              }
            } catch (e) {
              console.error('[RoboPengu][ERROR] Panel JSON parse error:', e);
            }
          }
          // B. Ürün Önerileri
          else if (eventType === 'products' && dataStr) {
            try {
              const recs: AIAssistantRecommendation[] = JSON.parse(dataStr);
              if (Array.isArray(recs)) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, recommendations: recs } : m))
                );
              }
            } catch {}
          }
          // 3. Canlı Metin Akışı (SSE)
          else if (eventType === 'text' && dataStr) {
            if (dataStr !== '[DONE]') {
              let token = dataStr;
              try {
                token = JSON.parse(dataStr);
              } catch {
                token = dataStr;
              }
              if (typeof token === 'string') {
                accumulatedBotText += token;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, content: m.content + token } : m
                  )
                );

                // Erken Sesli Yanıt (Early Voice Synthesis Trigger):
                // Tüm teknik analizin bitmesini beklemeden,
                // [VOICE_SUMMARY] veya [SUMMARY_CHAT] bloğu tamamlandığı anda konuşmaya anında başla!
                if (!hasSpokenRef.current && voiceEnabled) {
                  if (accumulatedBotText.includes('[/VOICE_SUMMARY]')) {
                    const parts = accumulatedBotText.split('[VOICE_SUMMARY]');
                    const vSummary = (parts[1] || '').split('[/VOICE_SUMMARY]')[0].trim();
                    if (vSummary) {
                      hasSpokenRef.current = true;
                      speakSummary(vSummary);
                    }
                  } else if (accumulatedBotText.includes('[/SUMMARY_CHAT]')) {
                    const parts = accumulatedBotText.split('[SUMMARY_CHAT]');
                    const summary = (parts[1] || '').split('[/SUMMARY_CHAT]')[0].trim();
                    if (summary) {
                      hasSpokenRef.current = true;
                      speakSummary(summary);
                    }
                  } else if (accumulatedBotText.includes('[DEEP_ANALYSIS]') || accumulatedBotText.includes('### 1.')) {
                    const { voiceSummary, chatSummary } = partitionContent(accumulatedBotText);
                    if (voiceSummary || chatSummary) {
                      hasSpokenRef.current = true;
                      speakSummary(voiceSummary || chatSummary);
                    }
                  }
                }
              }
            }
          }
          // 4. Standart Düz Metin Akışı (Fallback)
          else if (!evt.includes('event: ') && !evt.includes('data: ')) {
            accumulatedBotText += evt;
            setMessages((prev) =>
              prev.map((m) =>
                m.id === botMsgId ? { ...m, content: m.content + evt } : m
              )
            );
          }
        }
      }

      // Kalan tampon varsa işle
      if (streamBuffer.trim()) {
        const lines = streamBuffer.split('\n');
        let eventType = 'text';
        let dataStr = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) eventType = line.slice(7).trim();
          else if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
        }
        if (eventType === 'text' && dataStr && dataStr !== '[DONE]') {
          let token = dataStr;
          try {
            token = JSON.parse(dataStr);
          } catch {
            token = dataStr;
          }
          if (typeof token === 'string') {
            accumulatedBotText += token;
            setMessages((prev) =>
              prev.map((m) => (m.id === botMsgId ? { ...m, content: m.content + token } : m))
            );
          }
        } else if (!streamBuffer.includes('data: ') && !streamBuffer.includes('event: ')) {
          accumulatedBotText += streamBuffer;
          setMessages((prev) =>
            prev.map((m) => (m.id === botMsgId ? { ...m, content: m.content + streamBuffer } : m))
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
        let textToSpeak = '';
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === botMsgId) {
              const finalContent =
                m.content && m.content.trim()
                  ? m.content
                  : '⚠️ Yanıt alınamadı: API sunucusundan veri akışı sağlanamadı.';
              textToSpeak = finalContent;
              return { ...m, content: finalContent, isStreaming: false };
            }
            return m;
          })
        );
        setLoading(false);
        if (!hasSpokenRef.current && textToSpeak && !textToSpeak.startsWith('⚠️') && voiceEnabled) {
          hasSpokenRef.current = true;
          speakSummary(textToSpeak);
        }
      }
    }
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

  const handleClose = () => {
    stopSpeaking();
    stopListening();
    onClose();
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  if (!isOpen) return null;

  const hasPanel = activePanel !== null;

  return (
    <AnimatePresence>
      {/* Arka Plan Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        {/* Ana Kapsayıcı: Maskot + Dinamik Genişleyen Modal */}
        <div
          className={`relative w-full h-full sm:h-auto transition-all duration-300 ease-out flex items-center justify-center ${
            hasPanel ? 'max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl' : 'max-w-full sm:max-w-2xl lg:max-w-3xl'
          }`}
        >
          {/* 1. MASKOT: Masaüstü ekranlarda sol kenarda 3D Penguen */}
          <div className={`${hasPanel ? 'hidden 2xl:block -left-[275px]' : 'hidden xl:block -left-[255px]'} absolute -top-[40px] z-30 pointer-events-none select-none animate-float`}>
            <div className="relative">
              <img
                src="/assets/robopengu.png"
                alt="RoboPengu 3D"
                className="w-[320px] max-w-none h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.35)]"
              />
              {/* Güç Reaktörü LED Butonu (Yapay Zeka Haberleri) */}
              <button
                type="button"
                className="absolute top-[57.5%] left-[68.8%] -translate-x-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center cursor-pointer pointer-events-auto group active:scale-95 transition-transform"
                title="Dünyadaki Yapay Zeka Haberleri (Açmak İçin Tıkla) 🌐"
                onClick={handleReactorClick}
                aria-label="Dünyadaki Yapay Zeka Haberleri"
              >
                {renderCyberReactor('lg')}
              </button>

              {/* Küresel Yapay Zeka Bülteni Butonu & Göstergesi */}
              <button
                type="button"
                onClick={handleReactorClick}
                className="absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 dark:bg-slate-950/95 text-white border border-slate-700/80 hover:border-cyan-500/60 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide shadow-lg flex items-center gap-1.5 backdrop-blur-md cursor-pointer pointer-events-auto active:scale-95 transition-all"
                title="Dünyadaki Yapay Zeka Haberlerini Aç (Kayan Pencere)"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span className="text-slate-200 text-[9.5px]">Küresel AI Haberleri</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </button>
            </div>
          </div>

          {/* 2. CHAT VE YAN PANEL KAPSAYICISI (MOBİL VE TABLET UYUMLU) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.2 }}
            className="relative w-full bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden h-[100dvh] sm:h-[640px] md:h-[680px] lg:h-[720px] max-h-[100dvh] sm:max-h-[92vh] z-20"
          >
            {/* Modal Üst Başlık Çubuğu */}
            <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-emerald-500/50 shrink-0 shadow-2xs">
                  <img src="/assets/robopengu.png" alt="Robo" className="w-6 h-6 sm:w-7 sm:h-7 object-contain" />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-1 ring-white dark:ring-slate-900 ${
                    reactorState === 'thinking'
                      ? 'bg-purple-500 animate-ping'
                      : reactorState === 'speaking'
                      ? 'bg-cyan-400 animate-pulse'
                      : reactorState === 'winner'
                      ? 'bg-amber-400 animate-bounce'
                      : 'bg-emerald-500 animate-pulse'
                  }`} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white text-xs sm:text-sm truncate">
                    RoboPengu
                  </h3>
                  <span className="hidden xs:inline-flex px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 rounded-full items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span className="hidden sm:inline">TEKNOLOJİ UZMANI</span>
                    <span className="sm:hidden">UZMAN</span>
                  </span>
                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="px-2.5 py-1 text-[10px] font-black bg-emerald-100/95 dark:bg-emerald-950/95 text-emerald-700 dark:text-emerald-300 rounded-full flex items-center gap-1.5 border border-emerald-400/60 dark:border-emerald-600/60 shadow-xs cursor-pointer active:scale-95 transition-all"
                      title="Sesi Durdur"
                    >
                      {renderAudioWaveform()}
                      <span className="hidden sm:inline">Konuşuyor</span>
                      <span className="text-[9px] opacity-70">✕</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Mobilde ve Tablette Tab Değiştirici (Panel Açıkken) */}
              {hasPanel && (
                <div className="flex lg:hidden items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileTab('chat')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer touch-manipulation ${
                      mobileTab === 'chat'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span>💬</span>
                    <span>Sohbet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('panel')}
                    className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer touch-manipulation ${
                      mobileTab === 'panel'
                        ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {activePanel.type === 'comparison' ? (
                      <>
                        <Swords className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Kıyaslama</span>
                      </>
                    ) : (
                      <>
                        <Newspaper className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Haberler</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* Sesli Yanıt (Mute / Unmute) Toggle Butonu */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-1.5 sm:p-2 rounded-xl transition text-xs flex items-center gap-1 cursor-pointer touch-manipulation active:scale-95 ${
                    voiceEnabled
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={voiceEnabled ? 'Sesli Yanıtı Kapat (Sessiz Mod)' : 'Sesli Yanıtı Aç'}
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline text-[11px] font-medium">
                    {voiceEnabled ? 'Ses Açık' : 'Sessiz'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer touch-manipulation active:scale-95"
                  title="Sohbeti Temizle"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden md:inline text-[11px] font-medium">Temizle</span>
                </button>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition text-lg p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer touch-manipulation active:scale-95 flex items-center justify-center"
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
                  {/* 🐧 MOBİL VE TABLET ROBOPENGU 3D MASKOT HERO KARTI */}
                  <div className={`${hasPanel ? '2xl:hidden' : 'xl:hidden'} flex flex-col items-center justify-center p-3.5 sm:p-4 mb-2 bg-gradient-to-b from-emerald-500/10 via-slate-50/80 to-white dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-slate-900 rounded-3xl border border-emerald-500/20 shadow-xs text-center select-none`}>
                    <div
                      onClick={handleReactorClick}
                      className="relative w-20 h-24 sm:w-24 sm:h-28 animate-float cursor-pointer group active:scale-95 transition-transform"
                      title="Dünyadaki Yapay Zeka Haberleri (Açmak İçin Dokun) 🌐"
                    >
                      <img
                        src="/assets/robopengu.png"
                        alt="RoboPengu 3D"
                        className="w-full h-full object-contain filter drop-shadow-[0_12px_22px_rgba(0,0,0,0.22)] pointer-events-none"
                      />
                      {/* Güç Reaktörü LED Butonu */}
                      <div className="absolute top-[57.5%] left-[68.8%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center pointer-events-none">
                        {renderCyberReactor('md')}
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-800 dark:text-slate-100">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        RoboPengu 3D Asistan
                      </span>
                      <button
                        type="button"
                        onClick={handleReactorClick}
                        className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border bg-slate-900 text-white dark:bg-slate-800 border-slate-700 hover:border-cyan-400 cursor-pointer active:scale-95 transition-all shadow-2xs"
                        title="Dünyadaki Yapay Zeka Haberlerini Aç"
                      >
                        <Globe className="w-2.5 h-2.5 text-cyan-400" />
                        <span>Küresel AI Haberleri</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      </button>
                      {isSpeaking && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            stopSpeaking();
                          }}
                          className="inline-flex items-center gap-1 bg-emerald-100/90 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[9px] font-black border border-emerald-300/70 cursor-pointer active:scale-95"
                          title="Sesi Durdur"
                        >
                          {renderAudioWaveform()}
                          <span>Durdur</span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs">
                      Telefon ve tabletlerdeki tarafsız teknoloji danışmanın hazır! Karşılaştırma yapabilir veya fiyat sorabilirsin.
                    </p>
                  </div>

                  {messages.map((m, idx) => {
                    const isAssistant = m.role === 'assistant';
                    const { chatSummary, cleanDisplay } = partitionContent(m.content);
                    const isComparisonMsg =
                      isAssistant &&
                      ((hasPanel && activePanel.type === 'comparison') ||
                        m.content.includes('[SUMMARY_CHAT]') ||
                        m.content.includes('[DEEP_ANALYSIS]') ||
                        /(?:^|\n)(?:###?\s*(?:1[\.\)]\s*)?Ekran|###?\s*1[\.\)]|##\s*1[\.\)])/i.test(m.content));
                    const displayContent = isAssistant
                      ? (isComparisonMsg && chatSummary ? chatSummary : cleanDisplay)
                      : m.content;

                    return (
                    <div key={m.id} className="space-y-3">
                      {m.role === 'assistant' ? (
                        <div className="flex items-start gap-2.5 sm:gap-3">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 mt-0.5">
                            <img src="/assets/robopengu.png" alt="Robo" className="w-5 h-5 object-contain" />
                          </div>
                          <div className="space-y-2.5 max-w-[90%] flex-1">
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-3.5 rounded-2xl rounded-tl-none shadow-xs text-slate-700 dark:text-slate-200">
                              {m.isStreaming && !displayContent ? (
                                <div className="flex items-center gap-2.5 py-1 text-slate-500 dark:text-slate-400">
                                  <div className="relative flex items-center justify-center w-5 h-5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-40"></span>
                                    <Sparkles className="w-4 h-4 text-cyan-500 animate-spin" />
                                  </div>
                                  <span className="text-xs font-medium animate-pulse text-cyan-700 dark:text-cyan-300">
                                    RoboPengu donanım verilerini ve senaryoyu düşünüyor... 🐧
                                  </span>
                                </div>
                              ) : (
                                <MarkdownRenderer content={displayContent} isStreaming={m.isStreaming} />
                              )}
                            </div>

                            {/* Sesli Dinle / Durdur Butonu (Doğrudan Kullanıcı Tıklaması ile Kesin Ses Çalma) */}
                            {!m.isStreaming && m.content && !m.content.startsWith('⚠️') && (
                              <div className="flex items-center gap-2 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isSpeaking) {
                                      stopSpeaking();
                                    } else {
                                      speakSummary(m.content, true);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer"
                                  title={isSpeaking ? 'Sesli Yanıtı Durdur' : "RoboPengu'nun Sesinden Dinle"}
                                >
                                  {isSpeaking ? (
                                    <>
                                      <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                                      <span className="text-rose-600 dark:text-rose-400 font-semibold">Durdur</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                      <span>Sesli Dinle</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Mobilde Sağ Paneldeki Detaylı Analizi Görme Butonu */}
                            {isComparisonMsg && hasPanel && (
                              <button
                                type="button"
                                onClick={() => setMobileTab('panel')}
                                className="lg:hidden w-full sm:w-auto inline-flex items-center justify-center gap-2 py-2 px-3.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800/80 rounded-xl cursor-pointer hover:bg-emerald-100 transition shadow-2xs active:scale-98 touch-manipulation mt-1"
                              >
                                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                <span>Detaylı Kıyaslama ve Mağaza Fiyatlarını Gör ➔</span>
                              </button>
                            )}

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
                                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center gap-2.5 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 transition cursor-pointer group active:scale-[0.99] touch-manipulation"
                                    >
                                      <div className="w-10 h-12 bg-slate-50 dark:bg-slate-800 rounded-lg p-0.5 shrink-0 flex items-center justify-center border border-slate-100 dark:border-slate-700 overflow-hidden">
                                        <ProductImage
                                          src={rec.image || getFallbackProductImage(rec.productName, '', rec.category)}
                                          alt={rec.productName}
                                          variant="card"
                                          className="w-full h-full object-contain"
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate">
                                          {rec.productName}
                                        </h5>
                                        <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                                            ₺{rec.price.toLocaleString('tr-TR')}
                                          </span>
                                          <span className="text-[10px] text-slate-400 truncate">
                                            • {rec.cheapestStore}
                                          </span>
                                        </div>
                                      </div>
                                      <span className="text-slate-300 group-hover:text-emerald-500 transition-colors text-xs font-bold shrink-0">
                                        →
                                      </span>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Akıllı Takip ve Derinleşme Soruları (Proactive Follow-ups) */}
                            {!m.isStreaming && idx === messages.length - 1 && m.id !== 'welcome' && !m.content.startsWith('⚠️') && (
                              <div className="pt-2 space-y-1.5 animate-in fade-in duration-300">
                                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-cyan-500" />
                                  <span>RoboPengu'ya Sorabilirsin:</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleSend('Ağır oyun ve yoğun kullanımda hangisi daha az ısınır ve stabil kalır?')}
                                    className="text-[11px] bg-white dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-full transition shadow-2xs cursor-pointer active:scale-95"
                                  >
                                    🎮 Oyun & Isınma durumu?
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSend('Gece ve loş ışık kamerasında aralarındaki fark ne kadar hissedilir?')}
                                    className="text-[11px] bg-white dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-full transition shadow-2xs cursor-pointer active:scale-95"
                                  >
                                    📸 Gece kamerası kıyası?
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSend('Bu bütçede acele etmeden bakabileceğim daha fiyat/performans bir alternatif var mı?')}
                                    className="text-[11px] bg-white dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-slate-700/80 px-2.5 py-1 rounded-full transition shadow-2xs cursor-pointer active:scale-95"
                                  >
                                    💡 Daha F/P alternatif var mı?
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none max-w-[85%] text-xs sm:text-[13px] font-medium leading-relaxed shadow-xs">
                            {m.content}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Alt Kısım: 4 Hızlı Aksiyon Butonu & Input */}
                <div className="p-2.5 sm:p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shrink-0">
                  {/* Hızlı Aksiyon Butonları */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] sm:text-xs no-scrollbar pb-0.5 touch-pan-x -mx-1 px-1">
                    {quickActions.map((qa, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSend(qa.prompt)}
                        className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 dark:hover:text-emerald-300 rounded-full whitespace-nowrap text-slate-600 dark:text-slate-300 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/60 active:scale-95 touch-manipulation font-medium shrink-0"
                      >
                        {qa.label}
                      </button>
                    ))}
                  </div>

                  {/* Sesli Giriş Aktif Göstergesi (Listening Indicator) */}
                  {isListening && (
                    <div className="flex items-center justify-between px-3 py-2 bg-rose-50 dark:bg-rose-950/70 border border-rose-200/80 dark:border-rose-900/60 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 animate-pulse mb-1">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                        </span>
                        <span>Dinliyorum, konuşabilirsiniz... 🎙️</span>
                      </div>
                      <button
                        type="button"
                        onClick={stopListening}
                        className="text-[11px] font-bold text-rose-600 dark:text-rose-300 hover:underline cursor-pointer touch-manipulation px-2 py-0.5"
                      >
                        Durdur
                      </button>
                    </div>
                  )}

                  {/* Mesaj Giriş Formu */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (input.trim() && input.length <= 500 && !loading) {
                        handleSend(input);
                      }
                    }}
                    className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition shadow-2xs"
                  >
                    <div className="flex items-center gap-1.5">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => {
                          stopSpeaking();
                          setInput(e.target.value);
                        }}
                        placeholder={
                          isListening
                            ? 'Dinliyorum, konuşabilirsiniz... 🎙️'
                            : 'Model sor, karşılaştır veya bütçe belirt...'
                        }
                        disabled={loading}
                        className={`w-full bg-transparent text-[15px] sm:text-xs outline-none px-1 py-1 font-medium transition-colors ${
                          isListening
                            ? 'text-rose-600 dark:text-rose-400 placeholder:text-rose-500 animate-pulse font-semibold'
                            : 'text-slate-700 dark:text-slate-200 placeholder:text-slate-400'
                        }`}
                      />

                      {/* Sesli Giriş (Mikrofon) Butonu */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isListening) stopListening();
                          else startListening();
                        }}
                        disabled={loading}
                        className={`w-9 h-9 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition shadow-2xs cursor-pointer shrink-0 active:scale-95 touch-manipulation ${
                          isListening
                            ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-2 ring-rose-300 dark:ring-rose-800'
                            : 'bg-slate-200/70 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400'
                        }`}
                        title={
                          !speechSupported
                            ? 'Tarayıcınız sesli girişi desteklemiyor (Chrome veya Edge önerilir)'
                            : isListening
                            ? 'Dinlemeyi Durdur'
                            : 'Sesli Soru Sor (Mikrofon)'
                        }
                        aria-label="Mikrofon"
                      >
                        {isListening ? (
                          <MicOff className="w-4 h-4 animate-bounce" />
                        ) : (
                          <Mic className={`w-4 h-4 ${!speechSupported ? 'opacity-35' : ''}`} />
                        )}
                      </button>

                      {/* Gönder Butonu */}
                      <button
                        type="submit"
                        disabled={loading || !input.trim() || input.length > 500}
                        className="w-9 h-9 sm:w-8 sm:h-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition shadow-xs cursor-pointer shrink-0 active:scale-95 touch-manipulation"
                        aria-label="Gönder"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '➤'}
                      </button>
                    </div>

                    {/* Sesli Giriş Bildirimi / Toast */}
                    {speechToast && (
                      <div className="px-2 py-1 text-[10px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200/80 dark:border-rose-900/60 rounded-lg flex items-center justify-between animate-in fade-in duration-150">
                        <span>{speechToast}</span>
                        <button
                          type="button"
                          onClick={() => setSpeechToast(null)}
                          className="text-xs hover:text-rose-900 dark:hover:text-white p-0.5 ml-1 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}

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
                  <div className="px-3 sm:px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 shrink-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Mobilde/Tablette Sohbete Hızlı Dönüş Butonu */}
                      <button
                        type="button"
                        onClick={() => setMobileTab('chat')}
                        className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800/80 rounded-lg hover:bg-emerald-200 transition cursor-pointer touch-manipulation shrink-0"
                      >
                        <span>←</span>
                        <span>Sohbet</span>
                      </button>

                      {activePanel.type === 'comparison' ? (
                        <>
                          <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
                            <Swords className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                              Karşılaştırma Paneli
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                              {activePanel.scenario}
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="p-1 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 shrink-0">
                            <Newspaper className="w-4 h-4" />
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">
                              Teknoloji Gündemi
                            </h4>
                            <p className="text-[10px] text-slate-500 truncate hidden sm:block">
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
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer flex items-center gap-1 shrink-0 touch-manipulation"
                      title="Paneli Kapat"
                    >
                      <X className="w-4 h-4" />
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
                        {/* 1. ROBO PENGU TEKNOLOJİ KAZANANI HERO BANNER */}
                        {activePanel.winner && (
                          <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-slate-50 dark:from-emerald-950/40 dark:via-slate-900/90 dark:to-slate-900/90 border border-emerald-300/80 dark:border-emerald-500/30 p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-lg shrink-0 border border-emerald-500/30 shadow-xs">
                                👑
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                                    ROBO PENGU TEKNOLOJİ KARARI
                                  </span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                    • Kazanan: <strong className="text-emerald-600 dark:text-emerald-400">{activePanel.winner.productName}</strong>
                                  </span>
                                </div>
                                <div className="space-y-1 mt-1">
                                  {activePanel.winner.reasons.map((reason, rIdx) => (
                                    <div key={rIdx} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                      <span>{reason}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 2. KARŞILAŞTIRILAN ÜRÜN KARTLARI (APPLE MASASI STİLİ) */}
                        <div className={`grid gap-3 ${activePanel.products.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                          {activePanel.products.map((p) => {
                            const isWinner = activePanel.winner?.productId === p.id;
                            return (
                              <div
                                key={p.id}
                                className={`relative p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                                  isWinner
                                    ? 'bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-500/50 shadow-md shadow-emerald-500/5'
                                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                                }`}
                              >
                                {isWinner && (
                                  <div className="absolute -top-2.5 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                                    <span>👑</span>
                                    <span>PENGU SEÇİMİ</span>
                                  </div>
                                )}

                                <div>
                                  <div className="h-24 sm:h-28 w-full flex items-center justify-center mb-2.5">
                                    <ProductImage
                                      src={p.image || getFallbackProductImage(p.name, p.brand, p.category)}
                                      alt={p.name}
                                      variant="card"
                                      className="max-h-full max-w-full object-contain drop-shadow-md"
                                    />
                                  </div>

                                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                                    {p.brand}
                                  </div>
                                  <h5 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 text-center line-clamp-1">
                                    {p.name}
                                  </h5>

                                  <div className="mt-1 flex items-center justify-center gap-1">
                                    <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                                      {p.price > 0 ? `₺${p.price.toLocaleString('tr-TR')}` : 'Piyasa Fiyatı'}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-2.5">
                                  <Link
                                    href={getProductUrl(p)}
                                    onClick={onClose}
                                    className="w-full py-1.5 px-2 bg-white dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold transition cursor-pointer flex items-center justify-center gap-1 text-center shadow-2xs"
                                  >
                                    <span>🛒</span>
                                    <span className="truncate">{p.cheapestStore ? `${p.cheapestStore}'da İncele` : 'Katalogda Gör ↗'}</span>
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Yükleniyor / Canlı Analiz Hazırlanıyor Göstergesi */}
                        {analysisSections.length === 0 && !activeDeepAnalysis && latestAssistantMsg?.isStreaming && (
                          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/70 flex items-center gap-3 animate-pulse">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                              <Sparkles className="w-4 h-4 animate-spin" />
                            </div>
                            <div>
                              <h6 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                                Teknik Analiz Canlı Olarak Hazırlanıyor...
                              </h6>
                              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                                RoboPengu ekran, işlemci, kamera ve batarya kıyaslamalarını panele aktarıyor.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* 3. KATEGORİ BAZLI DONANIM MASASI & AKILLI DERİN ANALİZ ENTEGRASYONU */}
                        <div id="comparison-details-container" className="space-y-3.5 pt-1">
                          {[
                            {
                              key: 'processor',
                              title: 'İşlemci, Grafik & Sentetik Performans',
                              icon: <Cpu className="w-3.5 h-3.5" />,
                            },
                            {
                              key: 'screen',
                              title: 'Ekran & Görsel Deneyim',
                              icon: <Smartphone className="w-3.5 h-3.5" />,
                            },
                            {
                              key: 'camera',
                              title: 'Kamera & Video Yetenekleri',
                              icon: <Camera className="w-3.5 h-3.5" />,
                            },
                            {
                              key: 'battery',
                              title: 'Batarya & Şarj Teknolojisi',
                              icon: <BatteryCharging className="w-3.5 h-3.5" />,
                            },
                            {
                              key: 'build',
                              title: 'Kasa, Malzeme & Dayanıklılık',
                              icon: <Shield className="w-3.5 h-3.5" />,
                            },
                          ].map((cat) => {
                            const catRows = activePanel.matrix.filter((r) => {
                              if (r.group) return r.group === cat.key;
                              const l = r.label.toLowerCase();
                              if (cat.key === 'processor') return l.includes('antutu') || l.includes('işlemci') || l.includes('ram') || l.includes('depolama') || l.includes('bellek');
                              if (cat.key === 'screen') return l.includes('ekran') || l.includes('parlaklık') || l.includes('çözünürlük') || l.includes('panel');
                              if (cat.key === 'camera') return l.includes('kamera') || l.includes('zoom') || l.includes('dxomark') || l.includes('telefoto');
                              if (cat.key === 'battery') return l.includes('batarya') || l.includes('şarj') || l.includes('pil');
                              if (cat.key === 'build') return l.includes('kasa') || l.includes('su') || l.includes('koruma') || l.includes('malzeme') || l.includes('ağırlık');
                              return false;
                            });

                            if (catRows.length === 0) return null;

                            // Eşleşen derin analiz paragrafını bul
                            const matchingAnalysisIdx = analysisSections.findIndex((s) => {
                              const t = s.title.toLowerCase();
                              if (cat.key === 'processor') return t.includes('işlemci') || t.includes('donanım') || t.includes('performans');
                              if (cat.key === 'screen') return t.includes('ekran') || t.includes('panel');
                              if (cat.key === 'camera') return t.includes('kamera') || t.includes('sensör');
                              if (cat.key === 'battery') return t.includes('batarya') || t.includes('şarj') || t.includes('pil');
                              return false;
                            });
                            const matchingAnalysis = matchingAnalysisIdx >= 0 ? analysisSections[matchingAnalysisIdx] : null;
                            const isSectionOpen = matchingAnalysisIdx >= 0 ? (openSections[matchingAnalysisIdx] ?? true) : true;

                            return (
                              <div
                                key={cat.key}
                                className="rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs"
                              >
                                {/* Kategori Başlığı */}
                                <div className="px-3.5 py-2.5 bg-slate-100/70 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                                      {cat.icon}
                                    </span>
                                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 tracking-wide uppercase">
                                      {cat.title}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                                    {catRows.length} Parametre
                                  </span>
                                </div>

                                {/* Bire Bir Donanım Satırları */}
                                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 text-[11px]">
                                  {catRows.map((row, rIdx) => (
                                    <div
                                      key={rIdx}
                                      className="p-2.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                    >
                                      <div className="text-[10px] font-semibold text-slate-400 mb-1 flex items-center justify-between">
                                        <span>{row.label}</span>
                                      </div>
                                      <div className={`grid gap-2 ${row.values.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
                                        {row.values.map((val, valIdx) => {
                                          const isSuperior = row.superiorIdx === valIdx || (row.highlightIdx === valIdx && row.isDifferent);
                                          return (
                                            <div
                                              key={valIdx}
                                              className={`p-2 rounded-xl border text-xs transition-all flex items-center justify-between gap-1.5 ${
                                                isSuperior
                                                  ? 'bg-emerald-500/10 dark:bg-emerald-950/30 border-emerald-400/60 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-bold'
                                                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200/70 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                                              }`}
                                            >
                                              <span className="truncate">{val}</span>
                                              {isSuperior && (
                                                <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                                  ✓ Üstün
                                                </span>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                {/* Kategoriye Özel Pengu'nun Mimari Analiz Notu (Kompakt / Açılır Kapanır) */}
                                {matchingAnalysis && (
                                  <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-slate-800/80">
                                    <div className="flex items-start gap-2.5">
                                      <span className="text-sm">🐧</span>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                            Pengu'nun {matchingAnalysis.title.replace(/^\d+\.\s*/, '')} Notu:
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => toggleSection(matchingAnalysisIdx)}
                                            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
                                          >
                                            {isSectionOpen ? 'Tüm Detayı Gizle ▲' : 'Detaylı Mimariyi Oku ▼'}
                                          </button>
                                        </div>
                                        {isSectionOpen && (
                                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/60 pt-2">
                                            <MarkdownRenderer
                                              content={matchingAnalysis.body}
                                              isStreaming={latestAssistantMsg?.isStreaming}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Kategorilere ayrışmamış genel derin analiz metni varsa */}
                          {analysisSections.length === 0 && activeDeepAnalysis && (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 mb-2">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                                <span>Detaylı Donanım Değerlendirmesi</span>
                              </div>
                              <div className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
                                <MarkdownRenderer
                                  content={activeDeepAnalysis}
                                  isStreaming={latestAssistantMsg?.isStreaming}
                                />
                              </div>
                            </div>
                          )}
                        </div>
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

        {/* 🌐 Dünyadaki Yapay Zeka Haberleri Kayan Penceresi (Slide-over Drawer) */}
        <GlobalAiNewsDrawer
          isOpen={isNewsDrawerOpen}
          onClose={() => setIsNewsDrawerOpen(false)}
          onAskAboutNews={(prompt) => {
            setIsNewsDrawerOpen(false);
            handleSend(prompt);
          }}
        />
      </div>
    </AnimatePresence>
  );
}
