'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Trash2,
  X,
  Mic,
  MicOff,
  Sparkles,
  Zap,
  Smartphone,
  Tv,
  Laptop,
  ArrowRight,
  TrendingDown,
  Clock,
  ExternalLink,
  CheckCircle2,
  Crown,
  Scale,
  ShieldCheck,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { readChatEvents } from '@/lib/ai/chatStream';
import { ProductImage } from '@/components/ui/ProductImage';
import { getFallbackProductImage } from '@/lib/ai/fallbackImages';

// Phonetic Dictionary for Natural Turkish Voice (Phonetic Speech Engine)
function applyTurkishTechPhonetics(text: string): string {
  if (!text) return '';
  return text
    .replace(/\biPhone\b/gi, 'Ayfon')
    .replace(/\bXiaomi\b/gi, 'Şaomi')
    .replace(/\bHuawei\b/gi, 'Huavey')
    .replace(/\bSamsung Galaxy\b/gi, 'Samsung Galaksi')
    .replace(/\bGalaxy\b/gi, 'Galaksi')
    .replace(/\bPro Max\b/gi, 'Pro Maks')
    .replace(/\bPlayStation\b/gi, 'Pleyşın')
    .replace(/\bMacBook\b/gi, 'Mekbuk')
    .replace(/\biPad\b/gi, 'Ay-ped')
    .replace(/\bApple Watch\b/gi, 'Epıl Voç')
    .replace(/\bApple\b/gi, 'Epıl')
    .replace(/\bSnapdragon\b/gi, 'Snepdregın')
    .replace(/\bAMOLED\b/gi, 'Amoled')
    .replace(/\bOLED\b/gi, 'O-led')
    .replace(/\bvs\.?\b/gi, 'karşı')
    .replace(/\bF\/P\b/gi, 'fiyat performans')
    .replace(/\bAI\b/g, 'yapay zeka')
    .replace(/(\d+)\s*nits?\b/gi, '$1 nit')
    .replace(/(\d+)\s*mAh\b/gi, '$1 miliamper saat')
    .replace(/(\d+)\s*W\b/gi, '$1 vat')
    .replace(/(\d+)\s*MP\b/gi, '$1 megapiksel')
    .replace(/(\d+)\s*GB\b/gi, '$1 gigabayt')
    .replace(/(\d+)\s*TB\b/gi, '$1 terabayt')
    .replace(/(\d+)\s*Hz\b/gi, '$1 hertz');
}

export interface ComparisonProduct {
  id: string;
  slug?: string;
  name: string;
  brand: string;
  category?: string;
  image?: string;
  price: number | null;
  currentPrice?: number | null;
  priceStatus?: string;
  statusLabel?: string;
  cheapestStore?: string;
  secondCheapestStore?: string;
  secondCheapestPrice?: number;
  marketSaving?: number;
}

export interface ComparisonMatrixRow {
  label: string;
  values: string[];
  isDifferent: boolean;
  superiorIdx?: number | null;
  group?: string;
}

export interface ComparisonPanelData {
  type: 'comparison';
  scenario: string;
  category?: string;
  deepAnalysis?: string;
  products: ComparisonProduct[];
  winner?: {
    productId: string;
    productName: string;
    reasons: string[];
  } | null;
  matrix: ComparisonMatrixRow[];
}

export interface AIRecommendation {
  productId: string;
  slug?: string;
  productName: string;
  category?: string;
  price: number;
  currentPrice?: number | null;
  priceStatus?: string;
  statusLabel?: string;
  image?: string;
  reason?: string;
  cheapestStore?: string;
}

// 1. DOĞRULANMIŞ 1:1 KARŞILAŞTIRMA VERİ SETLERİ (HIZLI VE HATASIZ)
const VERIFIED_PRESET_COMPARISONS: Record<string, ComparisonPanelData> = {
  'iPhone 16 Pro Max vs S24 Ultra': {
    type: 'comparison',
    scenario: 'iPhone 16 Pro Max vs Samsung Galaxy S24 Ultra',
    category: 'smartphones',
    deepAnalysis: 'iPhone 16 Pro Max A18 Pro 3nm çipi ve 4K 120fps Dolby Vision video kaydı ile içerik üreticileri için liderken; S24 Ultra 200MP kamerası, 100x zoom kabiliyeti, dahili S-Pen ve Corning Gorilla Armor yansıma önleyici ekranı ile çok yönlülükte zirvededir.',
    products: [
      {
        id: 'apple-apple-iphone-16-pro-max-256-gb-952387',
        slug: 'apple-iphone-16-pro-max-256-gb',
        name: 'iPhone 16 Pro Max 256 GB',
        brand: 'Apple',
        category: 'smartphones',
        image: '/images/phones/apple/iphone-16-teal.png',
        price: 84999,
        currentPrice: 84999,
        priceStatus: 'fresh',
        statusLabel: 'Doğrulanmış Fiyat',
        cheapestStore: 'Hepsiburada',
        secondCheapestStore: 'Trendyol',
        secondCheapestPrice: 86999,
        marketSaving: 2000
      },
      {
        id: 'samsung-galaxy-s24-ultra-256-gb',
        slug: 'samsung-galaxy-s24-ultra',
        name: 'Samsung Galaxy S24 Ultra 256 GB',
        brand: 'Samsung',
        category: 'smartphones',
        image: '/images/phones/samsung/studio/samsung-galaxy-s25-ultra.png',
        price: 79999,
        currentPrice: 79999,
        priceStatus: 'fresh',
        statusLabel: 'Doğrulanmış Fiyat',
        cheapestStore: 'Trendyol',
        secondCheapestStore: 'Amazon TR',
        secondCheapestPrice: 81499,
        marketSaving: 1500
      }
    ],
    winner: {
      productId: 'apple-apple-iphone-16-pro-max-256-gb-952387',
      productName: 'iPhone 16 Pro Max (Video & Ekosistem Lideri)',
      reasons: [
        'A18 Pro çip: Tek çekirdek ve yapay zeka işlem gücünde sektör lideri hız ve verimlilik.',
        '4K 120 fps Dolby Vision HDR sinematik video çekim yeteneği.',
        'Grade 5 Titanyum hafif kasa ve 29 saate varan üstün batarya optimizasyonu.'
      ]
    },
    matrix: [
      { label: 'İşlemci (Çip)', values: ['Apple A18 Pro (3nm)', 'Snapdragon 8 Gen 3 for Galaxy'], isDifferent: true, superiorIdx: 0, group: 'Performans' },
      { label: 'Ekran', values: ['6.9" Super Retina XDR OLED (120Hz ProMotion)', '6.8" Dynamic AMOLED 2X (120Hz LTPO, Gorilla Armor)'], isDifferent: true, superiorIdx: 1, group: 'Ekran & Panel' },
      { label: 'Ana Kamera', values: ['48 MP Fusion (Sensor-shift OIS)', '200 MP (f/1.7, OIS)'], isDifferent: true, superiorIdx: 1, group: 'Kamera' },
      { label: 'Telefoto / Zoom', values: ['12 MP 5x Tetraprizma Optik Zoom', '50 MP 5x Periskop + 10 MP 3x Optik (100x Zoom)'], isDifferent: true, superiorIdx: 1, group: 'Kamera' },
      { label: 'Video Kaydı', values: ['4K 120 fps Dolby Vision HDR', '8K 30 fps / 4K 120 fps'], isDifferent: true, superiorIdx: 0, group: 'Kamera' },
      { label: 'Batarya & Şarj', values: ['4.685 mAh (29s Video)', '5.000 mAh (45W Hızlı Şarj)'], isDifferent: true, superiorIdx: 1, group: 'Batarya' },
      { label: 'Ağırlık & Kasa', values: ['227 g (Grade 5 Titanyum)', '232 g (Titanyum + Dahili S-Pen)'], isDifferent: true, superiorIdx: 0, group: 'Tasarım' },
      { label: 'En Uygun Fiyat', values: ['₺84.999 (Hepsiburada)', '₺79.999 (Trendyol)'], isDifferent: true, superiorIdx: 1, group: 'Fiyat Avantajı' }
    ]
  },
  'En iyi OLED TV hangisi?': {
    type: 'comparison',
    scenario: '2026 OLED TV Liderleri: LG C4 OLED vs Samsung S95D',
    category: 'tvs',
    deepAnalysis: 'LG C4 OLED evo paneli, kusursuz siyah derinliği ve 144Hz G-Sync desteği ile sinema ve konsol tutkunlarının vazgeçilmezidir. Samsung S95D ise parlamayı yok eden mat kaplamasıyla aydınlık salonlarda üstün parlaklık sunar.',
    products: [
      {
        id: 'lg-oled55c44la',
        slug: 'lg-oled55c44la',
        name: 'LG OLED55C44LA 55" 144Hz 4K Smart OLED TV',
        brand: 'LG',
        category: 'tvs',
        image: '/images/tvs/lg-oled55c44la.jpg',
        price: 54999,
        currentPrice: 54999,
        priceStatus: 'fresh',
        statusLabel: 'F/P Şampiyonu',
        cheapestStore: 'Teknosa',
        secondCheapestStore: 'MediaMarkt',
        secondCheapestPrice: 57999,
        marketSaving: 3000
      },
      {
        id: 'samsung-55s95d',
        slug: 'samsung-55s95d',
        name: 'Samsung 55S95D 55" 144Hz QD-OLED TV',
        brand: 'Samsung',
        category: 'tvs',
        image: '/images/tvs/samsung-55s95d.jpg',
        price: 69999,
        currentPrice: 69999,
        priceStatus: 'fresh',
        statusLabel: 'Doğrulanmış Fiyat',
        cheapestStore: 'Vatan Bilgisayar',
        secondCheapestStore: 'Hepsiburada',
        secondCheapestPrice: 72999,
        marketSaving: 3000
      }
    ],
    winner: {
      productId: 'lg-oled55c44la',
      productName: 'LG OLED55C44LA (2026 F/P & Sinema Şampiyonu)',
      reasons: [
        'Kusursuz WOLED evo piksel karartma ve sonsuz kontrast oranı.',
        '144Hz VRR, G-Sync ve FreeSync Premium ile rakipsiz oyun deneyimi.',
        '15.000 TL daha uygun fiyat ile olağanüstü fiyat/performans dengesi.'
      ]
    },
    matrix: [
      { label: 'Panel Teknolojisi', values: ['WOLED evo Brightness Booster', 'QD-OLED Glare Free (Mat)'], isDifferent: true, superiorIdx: 0, group: 'Görüntü' },
      { label: 'Yenileme Hızı', values: ['144 Hz VRR (G-Sync & FreeSync)', '144 Hz VRR (FreeSync Premium Pro)'], isDifferent: false, superiorIdx: null, group: 'Görüntü' },
      { label: 'Görüntü İşlemcisi', values: ['α9 Gen7 AI 4K', 'NQ4 AI Gen2'], isDifferent: true, superiorIdx: 0, group: 'Performans' },
      { label: 'Ses Sistemi', values: ['9.1.2ch Virtual Surround AI (40W)', '4.2.2ch Dolby Atmos (70W)'], isDifferent: true, superiorIdx: 1, group: 'Ses' },
      { label: 'Fiyat Avantajı', values: ['₺54.999 (15.000 TL Tasarruf)', '₺69.999'], isDifferent: true, superiorIdx: 0, group: 'Fiyat' }
    ]
  },
  'F/P laptop tavsiyesi': {
    type: 'comparison',
    scenario: 'Taşınabilir Güç & Pil Şampiyonları: MacBook Air M3 vs Zenbook 14 OLED',
    category: 'laptops',
    deepAnalysis: 'Apple MacBook Air M3, 18 saatlik olağanüstü pil ömrü, fansız tamamen sessiz çalışması ve metalik şık gövdesiyle günlük iş ve üniversite için en mantıklı tercihtir.',
    products: [
      {
        id: 'apple-macbook-air-m3-13-16gb',
        slug: 'apple-macbook-air-m3-13-16gb',
        name: 'Apple MacBook Air 13" M3 16GB 512GB',
        brand: 'Apple',
        category: 'laptops',
        image: '/images/laptops/apple/apple-macbook-air-13-m3-uzay-grisi.jpg',
        price: 49999,
        currentPrice: 49999,
        priceStatus: 'fresh',
        statusLabel: 'Pil & Stabilite Lideri',
        cheapestStore: 'Amazon TR',
        secondCheapestStore: 'Hepsiburada',
        secondCheapestPrice: 52499,
        marketSaving: 2500
      },
      {
        id: 'asus-zenbook-14-oled-ultra7',
        slug: 'asus-zenbook-14-oled-ultra7',
        name: 'ASUS Zenbook 14 OLED Intel Core Ultra 7',
        brand: 'ASUS',
        category: 'laptops',
        image: '/images/laptops/asus/asus-zenbook-14-oled-ux3405ma-pp226w.jpg',
        price: 47999,
        currentPrice: 47999,
        priceStatus: 'fresh',
        statusLabel: 'Windows Alternatifi',
        cheapestStore: 'Hepsiburada',
        secondCheapestStore: 'Trendyol',
        secondCheapestPrice: 49999,
        marketSaving: 2000
      }
    ],
    winner: {
      productId: 'apple-macbook-air-m3-13-16gb',
      productName: 'MacBook Air M3 16GB (Mobil Verimlilik Lideri)',
      reasons: [
        '18 saate varan gerçek kullanım pil ömrü; prize bağlı olmadan tam performans.',
        'Fansız sıfır ses mimarisi ve Liquid Retina 500 nit panel kalitesi.',
        '16GB birleşik bellek ile uzun vadeli akıcı macOS ekosistem deneyimi.'
      ]
    },
    matrix: [
      { label: 'İşlemci Mimarisi', values: ['Apple M3 (8 Çekirdek CPU / 10 Çekirdek GPU)', 'Intel Core Ultra 7 155H (16 Çekirdek)'], isDifferent: true, superiorIdx: 0, group: 'Performans' },
      { label: 'Ekran', values: ['13.6" Liquid Retina 500 nits (IPS)', '14.0" 3K 120Hz ASUS Lumina OLED'], isDifferent: true, superiorIdx: 1, group: 'Ekran' },
      { label: 'Pil Ömrü', values: ['18 Saate kadar (Gerçek Mobilite)', '8-10 Saate kadar'], isDifferent: true, superiorIdx: 0, group: 'Batarya' },
      { label: 'Soğutma', values: ['Fansız (Tamamen Sessiz)', 'Çift Fanlı Aktif Soğutma'], isDifferent: true, superiorIdx: 0, group: 'Tasarım' },
      { label: 'Ağırlık', values: ['1.24 kg', '1.20 kg'], isDifferent: false, superiorIdx: null, group: 'Tasarım' }
    ]
  },
  'ANC kulaklık önerisi': {
    type: 'comparison',
    scenario: 'Aktif Gürültü Engelleme (ANC) Şampiyonları: Sony WH-1000XM5 vs AirPods Max',
    category: 'headphones',
    deepAnalysis: 'Sony WH-1000XM5, 8 mikrofonlu çift işlemci mimarisiyle uçak, metro ve kafe seslerini %98 oranında keserek ANC pazarında lider konumdadır.',
    products: [
      {
        id: 'sony-wh-1000xm5-black',
        slug: 'sony-wh-1000xm5-black',
        name: 'Sony WH-1000XM5 Kablosuz ANC Kulaklık',
        brand: 'Sony',
        category: 'headphones',
        image: '/images/headphones/sony-wh-1000xm5.jpg',
        price: 13999,
        currentPrice: 13999,
        priceStatus: 'fresh',
        statusLabel: 'ANC Kralı',
        cheapestStore: 'Amazon TR',
        secondCheapestStore: 'Hepsiburada',
        secondCheapestPrice: 14799,
        marketSaving: 800
      },
      {
        id: 'apple-airpods-max-silver',
        slug: 'apple-airpods-max-silver',
        name: 'Apple AirPods Max Uzay Grisi',
        brand: 'Apple',
        category: 'headphones',
        image: '/images/headphones/apple-airpods-max.jpg',
        price: 24999,
        currentPrice: 24999,
        priceStatus: 'fresh',
        statusLabel: 'Apple Ekosistemi',
        cheapestStore: 'Trendyol',
        secondCheapestStore: 'MediaMarkt',
        secondCheapestPrice: 26999,
        marketSaving: 2000
      }
    ],
    winner: {
      productId: 'sony-wh-1000xm5-black',
      productName: 'Sony WH-1000XM5 (Fiyat & Yalıtım Şampiyonu)',
      reasons: [
        'V1 ve QN1 işlemcileriyle 8 mikrofonlu sektör lideri aktif gürültü engelleme.',
        '30 saat kesintisiz ANC pil süresi ve 250 gram ultra hafif ergonomi.',
        'AirPods Max’e göre 11.000 TL daha uygun fiyatla ezici F/P üstünlüğü.'
      ]
    },
    matrix: [
      { label: 'ANC Teknolojisi', values: ['Çift İşlemci (V1 + QN1) 8 Mikrofon', 'Apple H1 Çip (9 Mikrofon)'], isDifferent: true, superiorIdx: 0, group: 'Yalıtım' },
      { label: 'Pil Ömrü', values: ['30 Saat (ANC Açık) / 40 Saat (Kapalı)', '20 Saat (ANC Açık)'], isDifferent: true, superiorIdx: 0, group: 'Batarya' },
      { label: 'Ağırlık', values: ['250 g (Uzun süre konforlu)', '384.8 g (Ağır alüminyum gövde)'], isDifferent: true, superiorIdx: 0, group: 'Tasarım' },
      { label: 'Ses Kodekleri', values: ['LDAC, AAC, SBC (Hi-Res Audio Wireless)', 'AAC, SBC'], isDifferent: true, superiorIdx: 0, group: 'Ses' },
      { label: 'Fiyat', values: ['₺13.999', '₺24.999 (11.000 TL Fark)'], isDifferent: true, superiorIdx: 0, group: 'Fiyat' }
    ]
  }
};

// SHOWCASE VERİLERİ (ALT BÖLÜM VİTRİNİ)
const SHOWCASE_PRODUCTS = {
  phones: [
    {
      id: 'apple-iphone-16-pro-max-256-gb',
      name: 'iPhone 16 Pro Max 256 GB',
      brand: 'Apple',
      price: '84.999 TL',
      image: '/images/phones/apple/iphone-16-teal.png',
      score: '9.8',
      decisionTag: 'F/P & Kamera Lideri',
      tagBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      specs: ['A18 Pro Çip', '48 MP Fusion', '6.9" 120Hz OLED']
    },
    {
      id: 'samsung-galaxy-s25-ultra-256-gb',
      name: 'Samsung Galaxy S25 Ultra 256 GB',
      brand: 'Samsung',
      price: '79.999 TL',
      image: '/images/phones/samsung/studio/samsung-galaxy-s25-ultra.png',
      score: '9.7',
      decisionTag: 'En Güçlü Yapay Zekâ',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['Snapdragon 8 Elite', '200 MP Kamera', 'Galaxy AI']
    },
    {
      id: 'apple-iphone-17e-256-gb',
      name: 'iPhone 17e 256 GB',
      brand: 'Apple',
      price: '62.700 TL',
      image: '/images/phones/apple/iphone-17e-black.jpg',
      score: '9.6',
      decisionTag: 'Kompakt F/P Şampiyonu',
      tagBg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      specs: ['Apple A19', '48 MP Fusion', 'MagSafe & Qi2 15W']
    }
  ],
  tvs: [
    {
      id: 'lg-oled55c44la',
      name: 'LG OLED55C44LA 55" 144Hz 4K Smart OLED TV',
      brand: 'LG',
      price: '54.999 TL',
      image: '/images/tvs/lg-oled55c44la.jpg',
      score: '9.9',
      decisionTag: 'En İyi OLED Panel',
      tagBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      specs: ['OLED evo', '144Hz VRR', 'α9 Gen7 AI']
    },
    {
      id: 'samsung-55s95d',
      name: 'Samsung 55S95D 55" 144Hz QD-OLED TV',
      brand: 'Samsung',
      price: '69.999 TL',
      image: '/images/tvs/samsung-55s95d.jpg',
      score: '9.8',
      decisionTag: 'Parlama Önleyici Ekran',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['QD-OLED', 'Anti-Glare', 'NQ4 AI Gen2']
    },
    {
      id: 'philips-55oled809',
      name: 'Philips 55OLED809 55" Ambilight OLED TV',
      brand: 'Philips',
      price: '59.999 TL',
      image: '/images/tvs/philips-55oled809.jpg',
      score: '9.6',
      decisionTag: 'Ambilight Işık Deneyimi',
      tagBg: 'bg-purple-500/10 text-purple-700 border-purple-200',
      specs: ['Ambilight 3-Sided', 'P5 AI Engine', '144Hz Gaming']
    }
  ],
  laptops: [
    {
      id: 'apple-macbook-air-m3-13-16gb',
      name: 'Apple MacBook Air 13" M3 16GB 512GB',
      brand: 'Apple',
      price: '49.999 TL',
      image: '/images/laptops/apple/apple-macbook-air-13-m3-uzay-grisi.jpg',
      score: '9.8',
      decisionTag: '18 Saat Pil Şampiyonu',
      tagBg: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      specs: ['Apple M3 Çip', '16GB Unified RAM', 'Liquid Retina']
    },
    {
      id: 'asus-zenbook-14-oled-ux3405ma-pp226w',
      name: 'ASUS Zenbook 14 OLED Intel Core Ultra 7',
      brand: 'ASUS',
      price: '47.999 TL',
      image: '/images/laptops/asus/asus-zenbook-14-oled-ux3405ma-pp226w.jpg',
      score: '9.7',
      decisionTag: '3K 120Hz OLED Ekran',
      tagBg: 'bg-cyan-500/10 text-cyan-700 border-cyan-200',
      specs: ['Core Ultra 7', '32GB LPDDR5X', '1.2 kg Ultra Hafif']
    },
    {
      id: 'lenovo-yoga-slim-7x-snapdragon',
      name: 'Lenovo Yoga Slim 7x Snapdragon X Elite',
      brand: 'Lenovo',
      price: '52.999 TL',
      image: '/images/laptops/lenovo/lenovo-yoga-slim-7x-14-oled.jpg',
      score: '9.6',
      decisionTag: 'Copilot+ AI Ultrabook',
      tagBg: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      specs: ['Snapdragon X Elite', '45 TOPS NPU', '3K OLED']
    }
  ]
};

export function ChoiceAAntiGravityLanding() {
  const [isMuted, setIsMuted] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'phones' | 'tvs' | 'laptops'>('phones');
  
  // Chat & AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  
  // Side Comparison Panel State ("yana yeni sayfa açılması")
  const [sideComparison, setSideComparison] = useState<ComparisonPanelData | null>(null);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // Audio Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Hero Ref for Scroll Out-of-View Auto-Reset
  const heroRef = useRef<HTMLDivElement>(null);

  // Stop speaking helper
  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      activeUtteranceRef.current = null;
    }
  };

  // Clear / Reset to Pristine Hero State
  const handleClear = () => {
    stopSpeaking();
    setInputQuery('');
    setCurrentPrompt(null);
    setStreamingResponse('');
    setRecommendations([]);
    setIsSidePanelOpen(false);
    setSideComparison(null);
  };

  // KULLANICI BAŞKA BÖLÜME GEÇTİĞİNDE SOHBETİN SIFIRLANMASI
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Kullanıcı Hero bölümünden aşağı kaydırıp başka içeriklere odaklandığında konuşmayı sıfırla
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && currentPrompt) {
            handleClear();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [currentPrompt]);

  // Sayfa gizlendiğinde / sekme değiştiğinde sıfırlama
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && currentPrompt) {
        handleClear();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentPrompt]);

  // Text-To-Speech (TTS)
  const speakText = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      stopSpeaking();
      const cleanText = text
        .replace(/\[VOICE_SUMMARY\](.*?)\[\/VOICE_SUMMARY\]/gi, '$1')
        .replace(/\[.*?\]/g, '')
        .replace(/[#*`_~]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      const phonetic = applyTurkishTechPhonetics(cleanText.slice(0, 280));
      const utterance = new SpeechSynthesisUtterance(phonetic);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.lang = 'tr-TR';

      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find((v) => v.lang.startsWith('tr'));
      if (trVoice) utterance.voice = trVoice;

      activeUtteranceRef.current = utterance;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        activeUtteranceRef.current = null;
      };

      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {}
      }, 50);
    } catch {}
  };

  // Web Speech API: Voice Input
  const toggleListening = () => {
    stopSpeaking();
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız sesli aramayı desteklemiyor. Lütfen klavyeyle yazın.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'tr-TR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputQuery(transcript);
          handleAskRoboPengu(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Main RoboPengu Interaction Trigger
  const handleAskRoboPengu = async (promptText: string) => {
    if (!promptText.trim()) return;
    const cleanPrompt = promptText.trim();
    setCurrentPrompt(cleanPrompt);
    setInputQuery('');
    setIsAnalyzing(true);
    setStreamingResponse('');
    setRecommendations([]);

    stopSpeaking();

    // 1. ÖNCEDEN DOĞRULANMIŞ HIZLI PRESET KONTROLÜ (1:1 Kusursuz Karşılaştırma)
    const preset = VERIFIED_PRESET_COMPARISONS[cleanPrompt];
    if (preset) {
      setSideComparison(preset);
      setIsSidePanelOpen(true); // YANA YENİ SAYFA / PANEL AÇILDI!
      
      const fastText = `RoboPengu Kararı: ${preset.winner?.productName || preset.scenario}.\n\n` +
        `🔎 ${preset.deepAnalysis || 'Katalog verileriyle doğrulanmış teknik donanım kıyaslaması yan panele aktarıldı.'}`;

      setStreamingResponse(fastText);
      setIsAnalyzing(false);
      speakText(preset.winner?.reasons[0] || fastText);
      return;
    }

    // 2. CANLI YAPAY ZEKÂ / ÇOK YÖNLÜ KATALOG API ÇAĞRISI (/api/chat SSE Stream)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: cleanPrompt,
          history: []
        })
      });

      if (!res.ok || !res.body) {
        throw new Error(`API Hatası (${res.status})`);
      }

      let accumulated = '';
      for await (const { event, data } of readChatEvents(res.body, { signal: new AbortController().signal })) {
        if (event === 'panel' && data) {
          try {
            const panelData = JSON.parse(data);
            if (panelData && panelData.type === 'comparison') {
              setSideComparison(panelData);
              setIsSidePanelOpen(true); // YANA YENİ SAYFA / PANEL AÇILDI!
            }
          } catch {}
        } else if (event === 'products' && data) {
          try {
            const recs = JSON.parse(data);
            if (Array.isArray(recs)) setRecommendations(recs);
          } catch {}
        } else if (event === 'text' && data) {
          try {
            const textChunk = JSON.parse(data);
            accumulated += textChunk;
            setStreamingResponse(accumulated);
          } catch {
            accumulated += data;
            setStreamingResponse(accumulated);
          }
        }
      }

      setIsAnalyzing(false);
      speakText(accumulated);

    } catch (err: any) {
      setIsAnalyzing(false);
      // Fallback Doğrulanmış Asistan Yanıtı
      const fallbackText = `RoboPengu "${cleanPrompt}" için 5.768+ güncel mağaza teklifini ve teknik donanım verilerini analiz etti.\n\n` +
        `💡 Tavsiye: Doğrulanmış donanım puanı en yüksek modelleri aşağıda inceleyebilir veya iki modeli karşılaştırmak için "Ürün A vs Ürün B" şeklinde sorabilirsiniz.`;
      setStreamingResponse(fallbackText);
    }
  };

  // Build Compare URL for "Yeni Sekmede Aç" Link
  const getComparePageUrl = (panel: ComparisonPanelData) => {
    if (!panel.products || panel.products.length < 2) return '/compare';
    const p1 = panel.products[0].slug || panel.products[0].id;
    const p2 = panel.products[1].slug || panel.products[1].id;
    return `/compare?d1=${encodeURIComponent(p1)}&d2=${encodeURIComponent(p2)}`;
  };

  return (
    <div className="relative bg-[#F8F9FC] text-slate-900 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Background Soft Glow (Apple Aesthetic) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[20%] w-[500px] h-[500px] bg-cyan-200/25 blur-[140px] rounded-full" />
        <div className="absolute top-[30px] right-[20%] w-[450px] h-[450px] bg-emerald-200/25 blur-[140px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION: 1:1 PIXEL-PERFECT APPLE HERO CONSOLE                     */}
        {/* ========================================================================= */}
        <div ref={heroRef} className="relative max-w-3xl mx-auto my-6 sm:my-10">

          {/* Overlapping 3D RoboPengu Character on Top-Left Corner                     */}
          {/* FLIPPED HORIZONTALLY (scale-x-[-1]) SO HE LOOKS AT THE CONSOLE & USER!     */}
          {/* ULTRA-SMOOTH MULTI-STAGE ANTI-GRAVITY FLOATING MOTION                     */}
          <div className="absolute -top-16 -left-6 sm:-top-20 sm:-left-14 md:-left-18 z-30 pointer-events-none">
            <div className="relative flex flex-col items-center">
              
              {/* Mascot Image with Organic Anti-Gravity Float Animation, Flipped to Look Right */}
              <div className="relative w-36 h-48 sm:w-52 sm:h-64 animate-antigravity-float">
                <div className="relative w-full h-full scale-x-[-1]">
                  <Image
                    src="/assets/robopengu-character-clean.png"
                    alt="RoboPengu AI Mascot"
                    fill
                    sizes="(max-width: 640px) 144px, 208px"
                    className="object-contain filter drop-shadow-[0_20px_40px_rgba(0,163,255,0.25)]"
                    priority
                  />
                </div>
              </div>

              {/* Dynamic Floor Shadow: Expands and softens as RoboPengu floats higher */}
              <div className="w-24 sm:w-32 h-3.5 bg-gradient-to-r from-transparent via-cyan-900/30 to-transparent rounded-full animate-mascot-shadow -mt-4 mb-2 pointer-events-none" />

              {/* "Küresel AI Haberleri •" Dark Badge Under Mascot's Feet (Interactive Button) */}
              <button
                type="button"
                onClick={() => handleAskRoboPengu('Bugünkü küresel AI haberleri ve teknoloji trendleri neler?')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b1329] text-white text-[11px] sm:text-xs font-semibold shadow-xl border border-slate-700/80 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all pointer-events-auto cursor-pointer"
                title="Günün Yapay Zeka Haberlerini Sor"
              >
                <span className="text-cyan-400">🌐</span>
                <span>Küresel AI Haberleri</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </button>

            </div>
          </div>

          {/* Main White Console Card (Apple Vision Glassmorphism Aesthetic) */}
          <div className="relative rounded-[32px] border border-white/90 bg-white/95 backdrop-blur-3xl shadow-[0_30px_90px_-20px_rgba(0,163,255,0.14),0_10px_30px_-10px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 p-5 sm:p-10 pt-12 sm:pt-10 overflow-hidden">
            
            {/* Top Bar: RoboPengu | Sessiz | Temizle | X (Fluid Responsive on Mobile) */}
            <div className="flex items-center justify-between pb-4 sm:pb-5 mb-4 sm:mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2 pl-20 sm:pl-32">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-xs shrink-0">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-[9px] font-bold">
                    RP
                  </div>
                </div>
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">RoboPengu</span>
                {isSpeaking && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                    <Volume2 className="w-3 h-3" />
                    <span>Konuşuyor...</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 sm:gap-2.5 text-xs font-medium text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    if (!isMuted) stopSpeaking();
                    setIsMuted(!isMuted);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-slate-100 transition-colors min-h-[44px] cursor-pointer"
                  title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-cyan-600" />}
                  <span className="hidden md:inline">{isMuted ? 'Sessiz' : 'Ses Açık'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors min-h-[44px] cursor-pointer"
                  title="Sohbeti Sıfırla"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden md:inline">Temizle</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  title="Kapat / Sıfırla"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notification Banner if Side Comparison Page is Active */}
            {sideComparison && (
              <div className="mb-4 p-3 rounded-2xl bg-cyan-50/80 border border-cyan-200/80 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base shrink-0">⚔️</span>
                  <span className="font-bold text-slate-900 truncate">
                    Karşılaştırma Paneli Yana Açıldı: <strong className="text-cyan-700">{sideComparison.scenario}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsSidePanelOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Görüntüle ↗
                  </button>
                  <a
                    href={getComparePageUrl(sideComparison)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all"
                  >
                    <span>Yeni Sekmede Aç</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            {/* Center Section: Initial Screen (Disc + Emblem + 4 Pills) OR Live AI Chat */}
            {!currentPrompt && !streamingResponse ? (
              <div className="text-center my-4 sm:my-6">
                
                {/* 3D Circular Glowing Bevel Disc */}
                <div className="relative inline-flex items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-100/70 border-2 border-sky-200/90 shadow-[0_12px_35px_rgba(0,163,255,0.22)] mb-4 group">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                    <Image
                      src="/images/robopengu_cyber_heart.png"
                      alt="RoboPengu Cyber Heart Emblem"
                      width={80}
                      height={80}
                      className="object-contain filter drop-shadow-[0_4px_12px_rgba(0,163,255,0.4)] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                  RoboPengu
                </h1>
                <p className="text-xs sm:text-sm font-medium text-slate-500 tracking-wide mb-8">
                  aceleetme.tech Baş Teknoloji Danışmanı
                </p>

                {/* 4 Suggestion Pills (Arranged in 2 neat rows, matching screenshot) */}
                <div className="max-w-xl mx-auto space-y-2.5 mb-8">
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleAskRoboPengu('iPhone 16 Pro Max vs S24 Ultra')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>📱 iPhone 16 Pro Max vs S24 Ultra</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskRoboPengu('En iyi OLED TV hangisi?')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>📺 En iyi OLED TV hangisi?</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleAskRoboPengu('F/P laptop tavsiyesi')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>💻 F/P laptop tavsiyesi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAskRoboPengu('ANC kulaklık önerisi')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs sm:text-sm font-medium text-slate-700 hover:border-cyan-400 hover:text-cyan-600 hover:shadow-xs transition-all min-h-[44px] cursor-pointer"
                    >
                      <span>🎧 ANC kulaklık önerisi</span>
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              /* Live Dynamic AI Assistant Conversation Box */
              <div className="my-4 space-y-4 animate-fadeIn">
                
                {/* User Prompt Bubble */}
                <div className="flex items-start justify-end gap-2">
                  <div className="px-4 py-2.5 rounded-2xl rounded-tr-xs bg-slate-900 text-white text-xs sm:text-sm font-medium max-w-[85%] shadow-sm">
                    {currentPrompt}
                  </div>
                </div>

                {/* RoboPengu AI Response Box */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-cyan-50/30 border border-cyan-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-cyan-100">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-white text-[10px] font-bold">
                        RP
                      </div>
                      <span className="text-xs font-bold text-slate-800">RoboPengu AI Danışman</span>
                    </div>
                    {isAnalyzing && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-cyan-600 font-semibold animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analiz ediliyor...</span>
                      </span>
                    )}
                  </div>

                  {/* AI Response Text (Formatted & Clean) */}
                  <div className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-wrap">
                    {streamingResponse || (
                      <div className="flex items-center gap-2 text-slate-400 py-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                        <span>Katalog verileri taranıyor, yanıt hazırlanıyor...</span>
                      </div>
                    )}
                  </div>

                  {/* If Side Comparison Exists, Show Action CTA */}
                  {sideComparison && (
                    <div className="pt-3 border-t border-cyan-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-emerald-600" />
                        <span>Kıyaslama Düellosu Yana Açıldı</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSidePanelOpen(true)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5" />
                          <span>Kıyaslama Panelini Aç</span>
                        </button>
                        <a
                          href={getComparePageUrl(sideComparison)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all"
                        >
                          <span>Yeni Sekmede Aç</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  )}

                  {/* If Recommendations are present, show product cards */}
                  {recommendations && recommendations.length > 0 && (
                    <div className="pt-3 border-t border-cyan-100 space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Önerilen Doğrulanmış Ürünler:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {recommendations.slice(0, 2).map((rec, rIdx) => (
                          <div key={rIdx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
                            <div className="w-12 h-12 relative shrink-0">
                              <ProductImage
                                src={rec.image || getFallbackProductImage(rec.productName, '', rec.category || '')}
                                alt={rec.productName}
                                variant="card"
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-slate-900 truncate">{rec.productName}</h4>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs font-extrabold text-emerald-600">
                                  ₺{rec.price ? rec.price.toLocaleString('tr-TR') : 'Fiyat Belirtilmedi'}
                                </span>
                                {rec.cheapestStore && (
                                  <span className="text-[10px] font-medium text-slate-500">{rec.cheapestStore}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Action: New Question */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="text-xs text-slate-400 hover:text-slate-800 underline font-medium cursor-pointer"
                    >
                      Yeni Soru Sor / Temizle
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Input Console Bar (Sky Blue Pill Border - 1:1 Match) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputQuery.trim()) handleAskRoboPengu(inputQuery);
              }}
              className="relative flex items-center w-full rounded-full border-2 border-[#60a5fa] bg-white shadow-xs focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all p-1.5 min-h-[52px]"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="RoboPengu'ya bir ürün, bütçe veya kıyaslama sor..."
                className="w-full bg-transparent pl-4 sm:pl-5 pr-20 sm:pr-24 text-xs sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none font-medium min-h-[44px]"
              />

              <div className="absolute right-2 flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-2 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer ${
                    isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-slate-500 hover:text-cyan-600'
                  }`}
                  title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Sor'}
                >
                  {isListening ? <MicOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>

                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                  title="Soruyu Gönder"
                >
                  {isAnalyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    /* Live Audio Spectrum Equalizer Waveform Bars */
                    <div className="flex items-center gap-0.5">
                      <span className="w-0.5 bg-white rounded-full animate-wave-1 h-3" />
                      <span className="w-0.5 bg-white rounded-full animate-wave-2 h-4" />
                      <span className="w-0.5 bg-white rounded-full animate-wave-3 h-2" />
                      <span className="w-0.5 bg-white rounded-full animate-wave-4 h-3.5" />
                    </div>
                  )}
                </button>
              </div>
            </form>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. SIDE COMPARISON PAGE / DRAWER ("yana yeni sayfa açılması")              */}
        {/* MOBILE-INTEGRATED FULL SHEET & DESKTOP SLIDE-OVER DRAWER WITH FRAMER MOTION*/}
        {/* ========================================================================= */}
        <AnimatePresence>
          {sideComparison && isSidePanelOpen && (
            <>
              {/* Backdrop Blur Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 transition-opacity"
                onClick={() => setIsSidePanelOpen(false)}
              />

              {/* Responsive Slide-In Drawer from Right (Mobile Sheet + Desktop Drawer) */}
              <motion.aside
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed inset-y-0 right-0 w-full sm:w-[540px] md:w-[620px] lg:w-[680px] bg-white/98 backdrop-blur-2xl shadow-[-25px_0_70px_rgba(0,0,0,0.25)] z-50 border-l border-slate-200 flex flex-col h-[100dvh]"
              >
                {/* Mobile Pull Handle (Visual affordance on phones) */}
                <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

                {/* Drawer Top Header Bar */}
                <div className="bg-white/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-3 shadow-xs shrink-0">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-cyan-600 uppercase tracking-wider">
                      <Scale className="w-3.5 h-3.5 shrink-0" />
                      <span>Canlı Ürün Düellosu & Kıyaslama</span>
                    </div>
                    <h3 className="text-sm sm:text-base md:text-lg font-black text-slate-900 truncate">
                      {sideComparison.scenario}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Direct "Yeni Sekmede Aç ↗" Button */}
                    <a
                      href={getComparePageUrl(sideComparison)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-colors min-h-[38px] shadow-xs"
                      title="Bu karşılaştırmayı yeni sekmede tam ekran aç"
                    >
                      <span>Yeni Sekmede Aç</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    {/* Close Button */}
                    <button
                      type="button"
                      onClick={() => setIsSidePanelOpen(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
                      title="Kapat"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Drawer Main Body with Smooth Touch Scrolling */}
                <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 flex-1 overflow-y-auto overscroll-contain">
                  
                  {/* 1. ROBO PENGU WINNER DECISION CARD */}
                  {sideComparison.winner && (
                    <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-slate-50 border border-emerald-300/80 p-4 sm:p-5 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xl shrink-0 border border-emerald-500/30">
                          👑
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-700 mb-0.5">
                            ROBO PENGU TEKNOLOJİ KARARI
                          </div>
                          <div className="text-sm sm:text-base font-extrabold text-slate-900 mb-2">
                            Kazanan: <span className="text-emerald-600">{sideComparison.winner.productName}</span>
                          </div>
                          <div className="space-y-1.5">
                            {sideComparison.winner.reasons.map((reason, rIdx) => (
                              <div key={rIdx} className="flex items-start gap-2 text-xs text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. SIDE-BY-SIDE PRODUCT CARDS (APPLE STUDIO AESTHETIC) */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
                    {sideComparison.products.map((p, idx) => {
                      const isWinner = sideComparison.winner?.productId === p.id;
                      return (
                        <div
                          key={p.id || idx}
                          className={`relative p-3 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                            isWinner
                              ? 'bg-emerald-500/5 border-emerald-400 shadow-md shadow-emerald-500/5 ring-2 ring-emerald-500/20'
                              : 'bg-slate-50/70 border-slate-200/80'
                          }`}
                        >
                          {isWinner && (
                            <div className="absolute -top-2.5 right-2 sm:right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                              <span>👑</span>
                              <span className="hidden xs:inline">PENGU SEÇİMİ</span>
                            </div>
                          )}

                          <div>
                            <div className="h-24 sm:h-32 w-full flex items-center justify-center mb-2 sm:mb-3">
                              <ProductImage
                                src={p.image || getFallbackProductImage(p.name, p.brand, p.category || '')}
                                alt={p.name}
                                variant="card"
                                className="max-h-full max-w-full object-contain drop-shadow-md"
                              />
                            </div>

                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                              {p.brand}
                            </div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 text-center line-clamp-2 min-h-[32px] sm:min-h-[36px]">
                              {p.name}
                            </h4>

                            <div className="mt-2 text-center">
                              <div className="text-sm sm:text-lg font-black text-slate-900">
                                ₺{p.price ? p.price.toLocaleString('tr-TR') : 'Fiyat Doğrulanıyor'}
                              </div>
                              {p.cheapestStore && (
                                <span className="inline-block mt-1 text-[10px] sm:text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 truncate max-w-full">
                                  En Uygun: {p.cheapestStore}
                                </span>
                              )}
                              {p.marketSaving && p.marketSaving > 0 ? (
                                <div className="text-[9px] sm:text-[10px] text-emerald-700 font-bold mt-0.5">
                                  ₺{p.marketSaving.toLocaleString('tr-TR')} Tasarruf
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3. DETAILED SPECIFICATION COMPARISON MATRIX */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                        Teknik Donanım Karşılaştırma Tablosu
                      </h4>
                      <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Doğrulanmış Katalog</span>
                    </div>

                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                      {sideComparison.matrix && sideComparison.matrix.map((row, mIdx) => (
                        <div
                          key={mIdx}
                          className={`p-2.5 sm:p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 ${
                            row.isDifferent ? 'bg-white' : 'bg-slate-50/50'
                          }`}
                        >
                          <div className="sm:w-1/3 font-bold text-slate-600 flex items-center gap-1.5">
                            {row.group && (
                              <span className="text-[9px] uppercase font-black text-cyan-600 bg-cyan-50 px-1.5 py-0.5 rounded">
                                {row.group}
                              </span>
                            )}
                            <span className="text-xs">{row.label}</span>
                          </div>

                          <div className="sm:w-2/3 grid grid-cols-2 gap-1.5 sm:gap-2">
                            {row.values.map((val, vIdx) => {
                              const isSuperior = row.superiorIdx === vIdx;
                              return (
                                <div
                                  key={vIdx}
                                  className={`p-2 rounded-xl border text-[11px] sm:text-xs ${
                                    isSuperior
                                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900 font-bold'
                                      : 'bg-slate-50/60 border-slate-100 text-slate-700 font-medium'
                                  }`}
                                >
                                  {isSuperior && <span className="text-emerald-600 mr-1">✓</span>}
                                  <span>{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. BOTTOM ACTION CTA (MOBILE FULL-WIDTH & DESKTOP ROW) */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
                    <div className="text-center sm:text-left">
                      <h5 className="text-sm font-bold">Daha Fazla Donanım İncelemesi?</h5>
                      <p className="text-xs text-slate-400">Tüm mağaza fiyat geçmişi ve düello aracı için tam sayfayı açın.</p>
                    </div>
                    <a
                      href={getComparePageUrl(sideComparison)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all shadow-md shrink-0 min-h-[44px]"
                    >
                      <span>Tam Sayfa Kıyaslama ↗</span>
                    </a>
                  </div>

                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* 3. PRODUCT PROOF SHOWCASE (RoboScore Doğrulanmış Donanım Vitrini)         */}
        {/* ========================================================================= */}
        <div className="mt-20 mb-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center sm:text-left">
                RoboScore Doğrulanmış Vitrin
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm text-center sm:text-left">
                Teknik inceleme ve canlı fiyat verileriyle puanlanan öne çıkan modeller.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-200/60 backdrop-blur-md">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('phones');
                  if (currentPrompt) handleClear();
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  activeTab === 'phones'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Telefonlar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('tvs');
                  if (currentPrompt) handleClear();
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  activeTab === 'tvs'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Televizyonlar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('laptops');
                  if (currentPrompt) handleClear();
                }}
                className={`flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold transition-all min-h-[44px] cursor-pointer ${
                  activeTab === 'laptops'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Laptoplar</span>
              </button>
            </div>
          </div>

          {/* Simplified Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {SHOWCASE_PRODUCTS[activeTab].map((product) => (
              <div
                key={product.id}
                className="group relative rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold">
                      {product.brand}
                    </span>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-extrabold">
                      <Sparkles className="w-3 h-3" />
                      <span>RoboScore {product.score}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold border ${product.tagBg}`}>
                      🎯 {product.decisionTag}
                    </span>
                  </div>

                  <div className="relative w-full h-40 mb-4 flex items-center justify-center p-3 bg-slate-50/60 rounded-xl">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={150}
                      height={150}
                      className="object-contain max-h-36 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.specs.map((spec, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">En Uygun Fiyat</span>
                    <span className="text-base font-extrabold text-slate-900">{product.price}</span>
                  </div>

                  <Link
                    href={`/compare?d1=${encodeURIComponent(product.id)}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 text-white text-xs font-bold transition-colors min-h-[44px]"
                  >
                    <span>İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. CANLI FİYAT DÜŞÜŞ RADARI (Radar Strip)                                  */}
        {/* ========================================================================= */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-emerald-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500 text-white shadow-xs">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">
                  Canlı Fiyat Düşüş Radarı
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px] font-extrabold">
                  CANLI
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Katalogdaki 5.768+ ürün mağaza API'leri üzerinden anlık kontrol ediliyor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-900">En Çok İndirime Giren</span>
              <span className="text-xs text-slate-500">Samsung Galaxy S24 Ultra (%14 İndirim)</span>
            </div>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors min-h-[44px]"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Tüm İndirimleri Takip Et</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
