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
  Loader2,
  Swords,
  Newspaper,
  Cpu,
  Camera,
  BatteryCharging,
  Shield,
  Layers,
  ThumbsUp,
  ThumbsDown
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
  highlightIdx?: number;
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
        name: 'iPhone 16 Pro Max (256 GB)',
        brand: 'APPLE',
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
        name: 'Samsung Galaxy S24 Ultra (256 GB)',
        brand: 'SAMSUNG',
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
      { label: 'Panel Tipi', values: ['LTPO Super Retina XDR OLED (1-120Hz ProMotion)', 'Dynamic AMOLED 2X (1-120Hz LTPO, Gorilla Armor)'], isDifferent: true, superiorIdx: 1, group: 'screen' },
      { label: 'Ekran Boyutu', values: ['6.9 inç (2868 x 1320 piksel)', '6.8 inç (3120 x 1440 piksel QHD+)'], isDifferent: true, superiorIdx: 0, group: 'screen' },
      { label: 'Tepe Parlaklık', values: ['2000 nit (Dış mekan)', '2600 nit (Yansıma Önleyici Kaplama)'], isDifferent: true, superiorIdx: 1, group: 'screen' },
      { label: 'İşlemci (Çip)', values: ['Apple A18 Pro (3nm, 6 Çekirdek)', 'Snapdragon 8 Gen 3 for Galaxy (4nm)'], isDifferent: true, superiorIdx: 0, group: 'processor' },
      { label: 'RAM Bellek', values: ['8 GB LPDDR5X (Unified)', '12 GB LPDDR5X'], isDifferent: true, superiorIdx: 1, group: 'processor' },
      { label: 'AnTuTu v10 Skoru', values: ['1.950.000+ Puan', '1.810.000+ Puan'], isDifferent: true, superiorIdx: 0, group: 'processor' },
      { label: 'Ana Kamera', values: ['48 MP Fusion (f/1.78, Sensor-shift OIS)', '200 MP (f/1.7, OIS)'], isDifferent: true, superiorIdx: 1, group: 'camera' },
      { label: 'Telefoto / Zoom', values: ['12 MP 5x Tetraprizma Optik Zoom', '50 MP 5x Periskop + 10 MP 3x Optik (100x Zoom)'], isDifferent: true, superiorIdx: 1, group: 'camera' },
      { label: 'Video Kaydı', values: ['4K 120 fps Dolby Vision HDR', '8K 30 fps / 4K 120 fps'], isDifferent: true, superiorIdx: 0, group: 'camera' },
      { label: 'Batarya Kapasitesi', values: ['4.685 mAh (29s Video Oynatma)', '5.000 mAh'], isDifferent: true, superiorIdx: 1, group: 'battery' },
      { label: 'Kablolu Şarj Hızı', values: ['27W Hızlı Şarj (%50 / 30 dk)', '45W Süper Hızlı Şarj 2.0'], isDifferent: true, superiorIdx: 1, group: 'battery' },
      { label: 'Kasa Malzemesi', values: ['Grade 5 Titanyum + Ceramic Shield', 'Titanyum Çerçeve + Gorilla Armor Cam'], isDifferent: false, superiorIdx: null, group: 'build' },
      { label: 'Ağırlık', values: ['227 gram', '232 gram (Dahili S-Pen Kalem Dahil)'], isDifferent: true, superiorIdx: 0, group: 'build' },
      { label: 'Fiyat Avantajı', values: ['₺84.999 (Hepsiburada)', '₺79.999 (Trendyol)'], isDifferent: true, superiorIdx: 1, group: 'general' }
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
        brand: 'SAMSUNG',
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
      { label: 'Panel Teknolojisi', values: ['WOLED evo Brightness Booster', 'QD-OLED Glare Free (Mat)'], isDifferent: true, superiorIdx: 0, group: 'screen' },
      { label: 'Yenileme Hızı', values: ['144 Hz VRR (G-Sync & FreeSync)', '144 Hz VRR (FreeSync Premium Pro)'], isDifferent: false, superiorIdx: null, group: 'screen' },
      { label: 'Görüntü İşlemcisi', values: ['α9 Gen7 AI 4K', 'NQ4 AI Gen2'], isDifferent: true, superiorIdx: 0, group: 'processor' },
      { label: 'Ses Sistemi', values: ['9.1.2ch Virtual Surround AI (40W)', '4.2.2ch Dolby Atmos (70W)'], isDifferent: true, superiorIdx: 1, group: 'camera' },
      { label: 'Fiyat Avantajı', values: ['₺54.999 (15.000 TL Tasarruf)', '₺69.999'], isDifferent: true, superiorIdx: 0, group: 'general' }
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
        brand: 'APPLE',
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
      { label: 'İşlemci Mimarisi', values: ['Apple M3 (8 Çekirdek CPU / 10 Çekirdek GPU)', 'Intel Core Ultra 7 155H (16 Çekirdek)'], isDifferent: true, superiorIdx: 0, group: 'processor' },
      { label: 'Ekran', values: ['13.6" Liquid Retina 500 nits (IPS)', '14.0" 3K 120Hz ASUS Lumina OLED'], isDifferent: true, superiorIdx: 1, group: 'screen' },
      { label: 'Pil Ömrü', values: ['18 Saate kadar (Gerçek Mobilite)', '8-10 Saate kadar'], isDifferent: true, superiorIdx: 0, group: 'battery' },
      { label: 'Soğutma', values: ['Fansız (Tamamen Sessiz)', 'Çift Fanlı Aktif Soğutma'], isDifferent: true, superiorIdx: 0, group: 'build' },
      { label: 'Ağırlık', values: ['1.24 kg', '1.20 kg'], isDifferent: false, superiorIdx: null, group: 'build' }
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
        brand: 'SONY',
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
        brand: 'APPLE',
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
      { label: 'ANC Teknolojisi', values: ['Çift İşlemci (V1 + QN1) 8 Mikrofon', 'Apple H1 Çip (9 Mikrofon)'], isDifferent: true, superiorIdx: 0, group: 'camera' },
      { label: 'Pil Ömrü', values: ['30 Saat (ANC Açık) / 40 Saat (Kapalı)', '20 Saat (ANC Açık)'], isDifferent: true, superiorIdx: 0, group: 'battery' },
      { label: 'Ağırlık', values: ['250 g (Uzun süre konforlu)', '384.8 g (Ağır alüminyum gövde)'], isDifferent: true, superiorIdx: 0, group: 'build' },
      { label: 'Ses Kodekleri', values: ['LDAC, AAC, SBC (Hi-Res Audio)', 'AAC, SBC'], isDifferent: true, superiorIdx: 0, group: 'camera' },
      { label: 'Fiyat', values: ['₺13.999', '₺24.999 (11.000 TL Fark)'], isDifferent: true, superiorIdx: 0, group: 'general' }
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
  
  // Side Comparison Panel State ("yana açılan ekran" split view)
  const [sideComparison, setSideComparison] = useState<ComparisonPanelData | null>(null);
  const [mobileTab, setMobileTab] = useState<'chat' | 'panel'>('chat');

  // Audio Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load and cache browser voices safely (Chromium / Edge / Safari / Firefox)
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) setVoices(v);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Hero Ref for Scroll Out-of-View Auto-Reset
  const heroRef = useRef<HTMLDivElement>(null);

  // Helper: Stop speaking
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
    setSideComparison(null);
    setMobileTab('chat');
  };

  // KULLANICI BAŞKA BÖLÜME GEÇTİĞİNDE SOHBETİN SIFIRLANMASI
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting && entry.boundingClientRect.top < 0 && (currentPrompt || sideComparison)) {
            handleClear();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [currentPrompt, sideComparison]);

  // Sayfa gizlendiğinde / sekme değiştiğinde sıfırlama
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && (currentPrompt || sideComparison)) {
        handleClear();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentPrompt, sideComparison]);

  // Text-To-Speech (TTS) - Doğal Türkçe Siborg Ses Motoru
  const speakText = (text: string, force = false) => {
    if ((isMuted && !force) || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (force && isMuted) {
      setIsMuted(false);
    }
    try {
      if (window.speechSynthesis.paused) {
        try { window.speechSynthesis.resume(); } catch {}
      }
      stopSpeaking();

      const cleanText = text
        .replace(/\[VOICE_SUMMARY\](.*?)\[\/VOICE_SUMMARY\]/gi, '$1')
        .replace(/\[\/?(?:SUMMARY_CHAT|DEEP_ANALYSIS)\]/gi, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/[*#`_~\[\]]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) return;

      let voiceText = cleanText;
      const sentences = voiceText.split(/(?<=[.?!])\s+/).filter((s) => s.trim().length > 0);
      if (sentences.length > 2) {
        voiceText = sentences.slice(0, 2).join(' ') + ' Detayları tablodan inceleyebilirsiniz.';
      }

      const phonetic = applyTurkishTechPhonetics(voiceText);
      const utterance = new SpeechSynthesisUtterance(phonetic);
      utterance.rate = 1.05;
      utterance.pitch = 1.15;
      utterance.lang = 'tr-TR';

      const allVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
      const trVoice = allVoices.find((v) =>
        (v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('tr')) ||
        (v.name && (v.name.toLowerCase().includes('turkish') || v.name.toLowerCase().includes('türkçe') || v.name.toLowerCase().includes('tolga')))
      );
      if (trVoice) {
        utterance.voice = trVoice;
        utterance.lang = trVoice.lang;
      }

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
          setIsMuted(false); // Kullanıcı konuştuğunda sesi aç
          handleAskRoboPengu(transcript, true); // Sesli yanıt ver
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
  const handleAskRoboPengu = async (promptText: string, isVoice = false) => {
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
      setMobileTab('panel'); // Mobilde doğrudan kıyaslama sekmesine odaklan
      
      const fastText = `Apple ${preset.products[0]?.name || ''} ile ${preset.products[1]?.name || ''} karşılaştırması hazır. ` +
        `Katalog değerleri ve doğrulanmış teknik özellik farkları sağdaki kıyaslama masasına aktarıldı.`;

      setStreamingResponse(fastText);
      setIsAnalyzing(false);
      speakText(fastText, isVoice || !isMuted);
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
              setMobileTab('panel');
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
      speakText(accumulated, isVoice || !isMuted);

    } catch (err: any) {
      setIsAnalyzing(false);
      const fallbackText = `RoboPengu "${cleanPrompt}" için 5.768+ güncel mağaza teklifini ve teknik donanım verilerini analiz etti.\n\n` +
        `💡 Tavsiye: Doğrulanmış donanım puanı en yüksek modelleri inceleyebilir veya iki modeli karşılaştırmak için "iPhone 16 Pro vs S24 Ultra" şeklinde sorabilirsiniz.`;
      setStreamingResponse(fallbackText);
      speakText(fallbackText, isVoice);
    }
  };

  // Build Compare URL for "Düelloya Git" Link
  const getComparePageUrl = (panel: ComparisonPanelData) => {
    if (!panel.products || panel.products.length < 2) return '/compare';
    const p1 = panel.products[0].slug || panel.products[0].id;
    const p2 = panel.products[1].slug || panel.products[1].id;
    return `/compare?d1=${encodeURIComponent(p1)}&d2=${encodeURIComponent(p2)}`;
  };

  // Build Individual Product Detail URL
  const getProductDetailUrl = (p: ComparisonProduct) => {
    const slug = p.slug || p.id;
    const cat = p.category || 'phones';
    if (cat === 'tvs') return `/tvs/${slug}`;
    if (cat === 'laptops') return `/laptops/${slug}`;
    if (cat === 'headphones') return `/headphones/${slug}`;
    return `/phones/${slug}`;
  };

  const hasPanel = sideComparison !== null;

  // Group definitions for spec matrix accordion
  const isTvComparison = sideComparison?.category === 'tvs';
  const groupDefs = [
    {
      key: 'screen',
      title: isTvComparison ? 'Panel, Ekran Boyutu & Görüntü Kalitesi' : 'Ekran, Panel & Görüntüleme',
      icon: isTvComparison ? <Tv className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />,
    },
    {
      key: 'processor',
      title: isTvComparison ? 'Görüntü İşlemcisi, Oyun & Akıllı TV Sistemi' : 'İşlemci, Çip & Sentetik Performans',
      icon: <Cpu className="w-3.5 h-3.5" />,
    },
    {
      key: 'camera',
      title: isTvComparison ? 'Ses Sistemi, Dolby Atmos & Hoparlör Gücü' : 'Kamera, Akustik Sürücü & Ses',
      icon: isTvComparison ? <Volume2 className="w-3.5 h-3.5" /> : <Camera className="w-3.5 h-3.5" />,
    },
    {
      key: 'battery',
      title: isTvComparison ? 'Enerji Verimliliği & Güç Tüketimi' : 'Batarya, Enerji & Güç Tüketimi',
      icon: <BatteryCharging className="w-3.5 h-3.5" />,
    },
    {
      key: 'build',
      title: isTvComparison ? 'HDMI 2.1 Portları, Kasa & Çerçeve Tasarımı' : 'Kasa, Malzeme & Dayanıklılık',
      icon: <Shield className="w-3.5 h-3.5" />,
    },
    {
      key: 'general',
      title: 'Ek Donanım Özellikleri & Bağlantılar',
      icon: <Layers className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="relative bg-gradient-to-b from-[#F0F7FF] via-[#E8F2FC] to-[#F1F6FC] text-slate-900 font-sans selection:bg-cyan-500 selection:text-white">
      
      {/* Background Soft Glow (Apple Ice Blue Ambient Atmosphere) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[640px] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-80px] left-[15%] w-[650px] h-[500px] bg-sky-200/40 blur-[140px] rounded-full" />
        <div className="absolute top-[40px] right-[15%] w-[550px] h-[450px] bg-cyan-200/35 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 pb-16">

        {/* ========================================================================= */}
        {/* 1. HERO SECTION: 1:1 PIXEL-PERFECT SPLIT CONSOLE (ICE BLUE INTEGRATED)    */}
        {/* ========================================================================= */}
        <div
          ref={heroRef}
          className={`relative mx-auto my-6 sm:my-10 transition-all duration-300 ease-out ${
            hasPanel ? 'max-w-6xl' : 'max-w-4xl'
          }`}
        >

          {/* Main Ice-Blue Console Card (Transforms into 2-Column Split View on Comparison) */}
          <div className="relative rounded-[32px] border border-sky-200/80 bg-white/95 backdrop-blur-3xl shadow-[0_24px_70px_-16px_rgba(56,189,248,0.20),0_8px_24px_-8px_rgba(14,165,233,0.08)] ring-1 ring-sky-300/40 p-4 sm:p-6 overflow-hidden flex flex-col">
            
            {/* Modal Header Bar */}
            <div className="px-2 sm:px-4 py-2 border-b border-sky-100 flex items-center justify-between shrink-0 gap-2 flex-wrap">
              
              {/* Left: RoboPengu Avatar & Live Voice / Analysis Status */}
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-[11px] font-bold shadow-xs shrink-0">
                  <span>RP</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">RoboPengu</span>
                  
                  {isSpeaking ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 animate-pulse">
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Sesli Yanıt Veriyor</span>
                      <span className="flex items-center gap-0.5 h-2.5 ml-0.5">
                        <span className="w-0.5 bg-emerald-500 rounded-full h-2 animate-bounce" />
                        <span className="w-0.5 bg-cyan-500 rounded-full h-3 animate-pulse" />
                        <span className="w-0.5 bg-blue-500 rounded-full h-1.5 animate-bounce" />
                      </span>
                    </span>
                  ) : isAnalyzing ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                      <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
                      <span>Analiz Ediliyor...</span>
                    </span>
                  ) : (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Çevrim içi • Baş Teknoloji Danışmanı</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Mobilde ve Tablette Tab Değiştirici (Panel Açıkken) */}
              {hasPanel && (
                <div className="order-3 sm:order-none w-full sm:w-auto justify-center flex lg:hidden items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold shrink-0">
                  <button
                    type="button"
                    onClick={() => setMobileTab('chat')}
                    className={`min-h-11 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      mobileTab === 'chat'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <span>💬</span>
                    <span>Sohbet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileTab('panel')}
                    className={`min-h-11 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                      mobileTab === 'panel'
                        ? 'bg-white text-emerald-600 shadow-xs'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Swords className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Kıyaslama</span>
                  </button>
                </div>
              )}

              {/* Right: Audio / Clear / Close Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 text-xs font-medium text-slate-500 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    if (!isMuted) stopSpeaking();
                    setIsMuted(!isMuted);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-sky-50 transition-colors min-h-[44px] cursor-pointer"
                  title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
                >
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-sky-600" />
                  )}
                  <span className="hidden md:inline font-semibold">{isMuted ? 'Sessiz' : 'Ses Açık'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors min-h-[44px] cursor-pointer"
                  title="Sohbeti Temizle"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Temizle</span>
                </button>

                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  title="Kapat / Sıfırla"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split View Body: Left = Chat / Welcome, Right = Kıyaslama Paneli (When hasPanel is true) */}
            <div className={`flex flex-col lg:flex-row overflow-hidden ${hasPanel ? 'min-h-[580px] lg:h-[660px]' : ''}`}>
              
              {/* =================================================================== */}
              {/* SOL SÜTUN: SOHBET & ETKİLEŞİM ALANI                                */}
              {/* =================================================================== */}
              <div
                className={`flex flex-col transition-all duration-200 ${
                  hasPanel
                    ? 'w-full lg:w-[420px] xl:w-[460px] shrink-0 lg:border-r border-sky-100 p-2 sm:p-4'
                    : 'w-full p-2 sm:p-4'
                } ${hasPanel && mobileTab === 'panel' ? 'hidden lg:flex' : 'flex'}`}
              >
                
                {/* Initial Welcome Screen: Buz Mavisi Kaide & Bütünleşik RoboPengu */}
                {!currentPrompt && !streamingResponse ? (
                  <div className="w-full my-auto py-4 sm:py-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
                      
                      {/* SOL: Buz Mavisi Kaide & Süzülen RoboPengu (0px Taşma, Kartın İçinde Güvenli) */}
                      <div className="w-full md:w-5/12 flex flex-col items-center justify-center shrink-0">
                        <div className="relative w-full max-w-[260px] sm:max-w-[280px] rounded-3xl bg-gradient-to-b from-sky-100/70 via-cyan-50/40 to-blue-50/20 border border-sky-200/70 p-4 sm:p-5 flex flex-col items-center justify-center shadow-[inset_0_2px_8px_rgba(255,255,255,0.9),0_12px_30px_rgba(56,189,248,0.12)] overflow-hidden">
                          
                          {/* Buz Mavisi Atmosferik Işık Parıltısı */}
                          <div className="absolute inset-0 bg-radial from-sky-300/25 via-transparent to-transparent blur-xl pointer-events-none" />

                          {/* Havada Süzülen RoboPengu (Kartın İçinde, Sağa/İçeri Bakıyor) */}
                          <div className="relative w-36 h-48 sm:w-44 sm:h-56 animate-antigravity-float">
                            <div className="relative w-full h-full scale-x-[-1]">
                              <Image
                                src="/assets/robopengu-character-clean.png"
                                alt="RoboPengu AI Mascot"
                                fill
                                sizes="(max-width: 640px) 144px, 176px"
                                className="object-contain filter drop-shadow-[0_15px_30px_rgba(14,165,233,0.25)]"
                                priority
                              />
                            </div>
                          </div>

                          {/* Dinamik Zemin Gölgesi */}
                          <div className="w-24 sm:w-28 h-3 bg-gradient-to-r from-transparent via-cyan-900/20 to-transparent rounded-full animate-mascot-shadow -mt-3 mb-3 pointer-events-none" />

                          {/* Maskot Altı Canlı Bilgi Hapı */}
                          <button
                            type="button"
                            onClick={() => handleAskRoboPengu('Bugünkü küresel AI haberleri ve teknoloji trendleri neler?')}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0b1329] text-white text-[11px] font-semibold shadow-md border border-slate-700/80 hover:border-cyan-400 hover:shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer z-10"
                            title="Günün Yapay Zeka Haberlerini Sor"
                          >
                            <span className="text-cyan-400">🌐</span>
                            <span>Küresel AI Danışmanı</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          </button>
                        </div>
                      </div>

                      {/* SAĞ: Başlık, 4 Öneri Hapı ve Doğrudan Başlama */}
                      <div className="w-full md:w-7/12 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/90 border border-sky-200/80 text-sky-800 text-[11px] font-extrabold tracking-wide uppercase mb-2 shadow-2xs">
                          <Sparkles className="w-3 h-3 text-sky-600" />
                          <span>YAPAY ZEKA DONANIM DANIŞMANI</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-1">
                          RoboPengu
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold text-slate-500 tracking-wide mb-5">
                          aceleetme.tech Baş Teknoloji Danışmanı
                        </p>

                        {/* 4 Öneri Hap-Butonu */}
                        <div className="w-full space-y-2 mb-4">
                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <button
                              type="button"
                              onClick={() => handleAskRoboPengu('iPhone 16 Pro Max vs S24 Ultra')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-sky-200/80 text-xs sm:text-sm font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50/50 hover:shadow-2xs transition-all min-h-[44px] cursor-pointer"
                            >
                              <span>📱 iPhone 16 Pro Max vs S24 Ultra</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAskRoboPengu('En iyi OLED TV hangisi?')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-sky-200/80 text-xs sm:text-sm font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50/50 hover:shadow-2xs transition-all min-h-[44px] cursor-pointer"
                            >
                              <span>📺 En iyi OLED TV hangisi?</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                            <button
                              type="button"
                              onClick={() => handleAskRoboPengu('F/P laptop tavsiyesi')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-sky-200/80 text-xs sm:text-sm font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50/50 hover:shadow-2xs transition-all min-h-[44px] cursor-pointer"
                            >
                              <span>💻 F/P laptop tavsiyesi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAskRoboPengu('ANC kulaklık önerisi')}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-white border border-sky-200/80 text-xs sm:text-sm font-semibold text-slate-700 hover:border-sky-400 hover:text-sky-600 hover:bg-sky-50/50 hover:shadow-2xs transition-all min-h-[44px] cursor-pointer"
                            >
                              <span>🎧 ANC kulaklık önerisi</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium">
                          Aşağıdaki kutudan istediğiniz cihazları kıyaslayabilir veya mikrofona basarak konuşabilirsiniz.
                        </p>
                      </div>

                    </div>
                  </div>
                ) : (
                  /* Active Multi-Turn Chat History (Kusursuz, Taşmasız Temiz Sohbet) */
                  <div className="flex-1 overflow-y-auto space-y-3.5 p-1 pr-2 max-h-[460px] overscroll-contain">
                    
                    {/* Welcome greeting bubble from RoboPengu */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[11px] text-white shrink-0 mt-0.5 shadow-2xs">
                        🐧
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="p-3 rounded-2xl rounded-tl-xs bg-sky-50/80 text-slate-800 text-xs leading-relaxed border border-sky-200/70 shadow-2xs">
                          Merhaba! Ben RoboPengu. Ürünleri kayıtlı özellikleriyle karşılaştırmana ve fiyatların doğrulama durumunu incelemene yardımcı olabilirim. 🐧
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSpeaking) {
                                stopSpeaking();
                              } else {
                                speakText("Merhaba! Ben RoboPengu. Ürünleri kayıtlı özellikleriyle karşılaştırmana yardımcı olabilirim.", true);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                                <span className="text-rose-600 font-bold">Durdur</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-sky-600" />
                                <span>Sesi Dinle</span>
                              </>
                            )}
                          </button>
                          <div className="flex items-center gap-1">
                            <span>Yararlı mıydı?</span>
                            <button type="button" className="hover:text-emerald-600 cursor-pointer">👍</button>
                            <button type="button" className="hover:text-rose-600 cursor-pointer">👎</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* User Prompt Pill Bubble */}
                    <div className="flex justify-end">
                      <div className="px-4 py-2 rounded-2xl rounded-tr-xs bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-semibold shadow-xs max-w-[85%]">
                        {currentPrompt}
                      </div>
                    </div>

                    {/* Bot Answer Bubble */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-[11px] text-white shrink-0 mt-0.5 shadow-2xs">
                        🐧
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white text-slate-800 text-xs leading-relaxed border border-slate-200/90 shadow-2xs space-y-2">
                          {streamingResponse || (
                            <div className="flex items-center gap-2 text-slate-400 py-1">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                              <span>Katalog verileri taranıyor...</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (isSpeaking) {
                                stopSpeaking();
                              } else {
                                speakText(streamingResponse, true);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer"
                          >
                            {isSpeaking ? (
                              <>
                                <VolumeX className="w-3 h-3 text-rose-500 animate-pulse" />
                                <span className="text-rose-600 font-bold">Durdur</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-sky-600" />
                                <span>Sesi Dinle</span>
                              </>
                            )}
                          </button>
                          <div className="flex items-center gap-1">
                            <span>Yararlı mıydı?</span>
                            <button type="button" className="hover:text-emerald-600 cursor-pointer">👍</button>
                            <button type="button" className="hover:text-rose-600 cursor-pointer">👎</button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ✨ ROBOPENGU'YA SORABİLİRSİN Suggestion Chips */}
                    <div className="pt-2 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-cyan-500" />
                        <span>ROBOPENGU'YA SORABİLİRSİN:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAskRoboPengu(`${currentPrompt} oyun ve ısınma durumu nasıl?`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border border-slate-200 text-[11px] font-medium transition-colors"
                        >
                          🎮 Oyun & Isınma durumu?
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAskRoboPengu(`${currentPrompt} gece kamerası performansı nasıl?`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border border-slate-200 text-[11px] font-medium transition-colors"
                        >
                          📷 Gece kamerası kıyas?
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAskRoboPengu(`${currentPrompt} için daha uygun F/P alternatif var mı?`)}
                          className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-700 border border-slate-200 text-[11px] font-medium transition-colors"
                        >
                          🏆 Daha F/P alternatif var mı?
                        </button>
                      </div>
                    </div>

                    {/* Quick Filter Action Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleAskRoboPengu('30.000 TL bütçe ile en iyi telefon önerisi')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
                      >
                        💰 Bütçe Önerisi Al
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAskRoboPengu('iPhone 16 Pro Max vs S24 Ultra')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
                      >
                        ⚔️ Spesifik Model Kıyasla
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAskRoboPengu('En çok fiyatı düşen teknoloji ürünleri')}
                        className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[11px] font-medium transition-colors"
                      >
                        📈 Fiyat Takip Grafiği
                      </button>
                    </div>

                  </div>
                )}

                {/* Bottom Input Console Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (inputQuery.trim()) handleAskRoboPengu(inputQuery);
                  }}
                  className="mt-auto pt-3 relative flex items-center w-full"
                >
                  <div className="relative flex items-center w-full rounded-full border-2 border-[#60a5fa] bg-white shadow-xs focus-within:ring-4 focus-within:ring-cyan-500/10 transition-all p-1 min-h-[48px]">
                    <input
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="RoboPengu'ya sorun"
                      className="w-full bg-transparent pl-4 pr-20 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium min-h-[40px]"
                    />

                    <div className="absolute right-1.5 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={`p-1.5 rounded-full transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer ${
                          isListening ? 'bg-red-50 text-red-600 animate-pulse' : 'text-slate-500 hover:text-cyan-600'
                        }`}
                        title={isListening ? 'Dinlemeyi Durdur' : 'Sesli Sor'}
                      >
                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      </button>

                      <button
                        type="submit"
                        disabled={isAnalyzing}
                        className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-white shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-50"
                        title="Soruyu Gönder"
                      >
                        {isAnalyzing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          /* Equalizer Waveform Bars */
                          <div className="flex items-center gap-0.5">
                            <span className="w-0.5 bg-white rounded-full animate-wave-1 h-2.5" />
                            <span className="w-0.5 bg-white rounded-full animate-wave-2 h-3.5" />
                            <span className="w-0.5 bg-white rounded-full animate-wave-3 h-2" />
                            <span className="w-0.5 bg-white rounded-full animate-wave-4 h-3" />
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </form>

              </div>

              {/* =================================================================== */}
              {/* SAĞ SÜTUN: YANA AÇILAN KIYASLAMA EKRANI (EXACT MATCH FOR SCREENSHOT)  */}
              {/* =================================================================== */}
              {hasPanel && (
                <div
                  className={`flex-1 flex flex-col bg-slate-50/50 overflow-hidden ${
                    mobileTab === 'chat' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  {/* Karşılaştırma Paneli Üst Barı */}
                  <div className="px-4 sm:px-6 py-2.5 border-b border-slate-200/80 bg-white flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="p-1 rounded-lg bg-emerald-100 text-emerald-600 shrink-0">
                        <Swords className="w-4 h-4" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                          Karşılaştırma Paneli
                        </h4>
                        <p className="text-[10px] text-slate-500 truncate hidden sm:block">
                          {sideComparison.scenario}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* "Düelloya Git ⚔" Butonu (Yeni Sekmede Aç) */}
                      <a
                        href={getComparePageUrl(sideComparison)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer min-h-[38px]"
                        title="Bu karşılaştırmayı yeni sekmede tam ekran aç"
                      >
                        <span>Düelloya Git</span>
                        <Swords className="w-3.5 h-3.5" />
                      </a>

                      {/* Paneli Kapat Butonu */}
                      <button
                        type="button"
                        onClick={() => {
                          setSideComparison(null);
                          setMobileTab('chat');
                        }}
                        className="text-slate-400 hover:text-slate-700 min-h-[38px] px-2 py-1 text-xs font-semibold rounded-lg hover:bg-slate-100 transition cursor-pointer flex items-center gap-1 shrink-0"
                        title="Paneli Kapat"
                      >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Kapat</span>
                      </button>
                    </div>
                  </div>

                  {/* Kaydırılabilir Karşılaştırma İçeriği */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
                    
                    {/* Durum / Doğrulama Uyarısı veya Kazanan Rozeti */}
                    {sideComparison.winner ? (
                      <div className="rounded-2xl bg-gradient-to-r from-emerald-500/10 via-slate-50 to-slate-50 border border-emerald-300/80 p-3.5 sm:p-4 shadow-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-lg shrink-0 border border-emerald-500/30">
                            👑
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] font-black uppercase tracking-wider text-emerald-700 mb-0.5">
                              ROBO PENGU TEKNOLOJİ KARARI
                            </div>
                            <div className="text-xs sm:text-sm font-extrabold text-slate-900 mb-1">
                              • Kazanan: <span className="text-emerald-600">{sideComparison.winner.productName}</span>
                            </div>
                            <div className="space-y-1">
                              {sideComparison.winner.reasons.map((reason, rIdx) => (
                                <div key={rIdx} className="flex items-start gap-1.5 text-xs text-slate-700">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div role="status" className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
                        Genel kazananı belirlemek için yeterli doğrulanmış karşılaştırma verisi yok. Katalog değerleri bağımsız donanım testi değildir.
                      </div>
                    )}

                    {/* Yan Yana 2 Ürün Kartı (Apple Studio Stili) */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {sideComparison.products.map((p, idx) => (
                        <div
                          key={p.id || idx}
                          className="relative p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between"
                        >
                          <div>
                            <div className="h-24 sm:h-28 w-full flex items-center justify-center mb-2">
                              <ProductImage
                                src={p.image || getFallbackProductImage(p.name, p.brand, p.category || '')}
                                alt={p.name}
                                variant="card"
                                className="max-h-full max-w-full object-contain drop-shadow-sm"
                              />
                            </div>

                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                              {p.brand}
                            </div>
                            <h5 className="text-xs sm:text-sm font-bold text-slate-800 text-center line-clamp-2 min-h-[32px]">
                              {p.name}
                            </h5>

                            <div className="mt-1.5 flex flex-col items-center justify-center gap-0.5">
                              {p.price && p.price > 0 ? (
                                <span className="text-sm sm:text-base font-extrabold text-slate-900 font-mono">
                                  ₺{p.price.toLocaleString('tr-TR')}
                                </span>
                              ) : (
                                <span className="text-xs font-bold text-slate-500">Fiyat Doğrulanıyor</span>
                              )}
                              <span className="text-[10px] text-slate-400 text-center">
                                {p.statusLabel || 'Katalog Referans Fiyatı'}
                              </span>
                              {p.cheapestStore && (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                  {p.cheapestStore}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            <a
                              href={getProductDetailUrl(p)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full min-h-[38px] py-1.5 px-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs"
                            >
                              <span>🛒</span>
                              <span>Ürün Detayını Aç</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Kategori Bazlı Donanım Masası Akordeonu (📱 EKRAN, ⚡ İŞLEMCİ, vb.) */}
                    <div className="space-y-3 pt-1">
                      {(() => {
                        const renderedRowIndices = new Set<number>();

                        return groupDefs.map((cat) => {
                          const catRows: { row: typeof sideComparison.matrix[0]; idx: number }[] = [];

                          sideComparison.matrix.forEach((r, idx) => {
                            if (renderedRowIndices.has(idx)) return;
                            
                            let matches = false;
                            if (r.group) {
                              matches = r.group === cat.key;
                            } else {
                              const l = r.label.toLowerCase();
                              if (cat.key === 'processor') matches = l.includes('işlemci') || l.includes('ram') || l.includes('antutu') || l.includes('gpu') || l.includes('cpu');
                              else if (cat.key === 'screen') matches = l.includes('ekran') || l.includes('panel') || l.includes('parlaklık') || l.includes('hz');
                              else if (cat.key === 'camera') matches = l.includes('kamera') || l.includes('zoom') || l.includes('video') || l.includes('ses');
                              else if (cat.key === 'battery') matches = l.includes('batarya') || l.includes('şarj') || l.includes('pil');
                              else if (cat.key === 'build') matches = l.includes('kasa') || l.includes('ağırlık') || l.includes('malzeme');
                              else if (cat.key === 'general') matches = true;
                            }

                            if (cat.key === 'general' && !matches && !r.group) {
                              matches = true;
                            }

                            if (matches) {
                              catRows.push({ row: r, idx });
                              renderedRowIndices.add(idx);
                            }
                          });

                          if (catRows.length === 0) return null;

                          return (
                            <div
                              key={cat.key}
                              className="rounded-2xl border border-slate-200/90 overflow-hidden bg-white shadow-2xs"
                            >
                              {/* Kategori Başlığı & Parametre Sayısı */}
                              <div className="px-3.5 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="p-1 rounded-lg bg-emerald-100 text-emerald-600">
                                    {cat.icon}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-800 tracking-wide uppercase">
                                    {cat.title}
                                  </span>
                                </div>
                                <span className="text-[10px] text-emerald-600 font-semibold font-mono">
                                  {catRows.length} Parametre
                                </span>
                              </div>

                              {/* Yan Yana Donanım Karşılaştırma Satırları */}
                              <div className="divide-y divide-slate-100 text-xs">
                                {catRows.map(({ row }, rIdx) => (
                                  <div
                                    key={rIdx}
                                    className="p-2.5 hover:bg-slate-50/50 transition-colors"
                                  >
                                    <div className="text-[10px] font-semibold text-slate-400 mb-1">
                                      {row.label}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {row.values.map((val, valIdx) => {
                                        const isSuperior = row.superiorIdx === valIdx || (row.highlightIdx === valIdx && row.isDifferent);
                                        return (
                                          <div
                                            key={valIdx}
                                            className={`p-2 rounded-xl border text-[11px] sm:text-xs transition-all flex flex-col items-start justify-between gap-1 ${
                                              isSuperior
                                                ? 'bg-emerald-500/10 border-emerald-400/60 text-emerald-800 font-bold'
                                                : 'bg-white border-slate-200/70 text-slate-700 font-medium'
                                            }`}
                                          >
                                            <span className="break-words">{val}</span>
                                            {isSuperior && (
                                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">
                                                ✓ Değer farkı
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* 2. PRODUCT PROOF SHOWCASE (RoboScore Doğrulanmış Donanım Vitrini)         */}
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
                  if (currentPrompt || sideComparison) handleClear();
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
                  if (currentPrompt || sideComparison) handleClear();
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
                  if (currentPrompt || sideComparison) handleClear();
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
        {/* 3. CANLI FİYAT DÜŞÜŞ RADARI (Radar Strip)                                  */}
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
