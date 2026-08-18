const fs = require('fs');
const path = require('path');

const existingTVs = [
  // TCL 2025 C8K FLAGSHIP QD-MINI LED SERIES
  {
    id: 'tcl-98c8k-2025',
    slug: 'tcl-98c8k-2025',
    name: 'TCL 98C8K 98" 248 Ekran Amiral Gemisi QD-Mini LED 144Hz 4K Smart TV (2025)',
    brand: 'TCL',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 145,
    basePrice: 349999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['2025 Serisi', 'QD-Mini LED', 'Amiral Gemisi', '5000 Nits', 'TSR AI'],
    ssIndexRatio: 100.0,
    highlights: [
      '2025 Amiral Gemisi QD-Mini LED Panel',
      '5000 Nits Zirve Parlaklık & 3840 Karartma Bölgesi',
      'TSR AI Akıllı Görüntü İşlemcisi',
      'Bang & Olufsen Akustik 2.1.2 Kanal 100W Ses'
    ],
    specs: {
      screenSizeInches: 98,
      displayTech: 'QD-Mini LED',
      resolution: '4K Ultra HD',
      refreshRateHz: 144,
      smartOs: 'Google TV',
      audioPowerWatts: 100,
      brightnessNits: 5000,
      localDimmingZones: 3840,
      processorEngine: 'TSR AI Super Engine',
      hdrSupport: ['Dolby Vision IQ', 'HDR10+ Adaptive', 'IMAX Enhanced'],
      gamingFeatures: ['4K @ 144Hz VRR', 'AMD FreeSync Premium Pro', 'Game Accelerator 240Hz'],
      hdmiPorts: 4,
      usbPorts: 3,
      energyClass: 'G'
    },
    storeOffers: [
      { id: 'tcl-98c8k-msh', storeName: 'MediaMarkt (MSH)', storeLogoColor: 'bg-red-600 text-white', price: 349999, inStock: true, shippingDays: 2, badges: ['Resmi Distribütör', 'VIP Kurulum'], sellerRating: 4.8, sellerReviews: 14500, url: 'https://www.mediamarkt.com.tr' },
      { id: 'tcl-98c8k-vat', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: 349999, inStock: true, shippingDays: 2, badges: ['2025 Yeni Seri'], sellerRating: 4.8, sellerReviews: 12100, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [{ date: 'Şubat 2026', price: 359999, store: 'MediaMarkt (MSH)' }, { date: 'Mart 2026', price: 349999, store: 'MediaMarkt (MSH)' }]
  },
  {
    id: 'tcl-85c8k-2025',
    slug: 'tcl-85c8k-2025',
    name: 'TCL 85C8K 85" 215 Ekran Flagship QD-Mini LED 144Hz TV (2025)',
    brand: 'TCL',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 190,
    basePrice: 279999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['2025 Serisi', 'QD-Mini LED', '5000 Nits', 'TSR AI'],
    ssIndexRatio: 99.8,
    highlights: ['5000 Nits Parlaklık & 3840 Mikro Karartma', 'TSR AI İşlemci ile %100 Renk Hacmi', 'Çerçevesiz Kristal Gövde Tasarımı'],
    specs: { screenSizeInches: 85, displayTech: 'QD-Mini LED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'Google TV', audioPowerWatts: 90, brightnessNits: 5000, localDimmingZones: 3840, processorEngine: 'TSR AI Engine', hdrSupport: ['Dolby Vision IQ', 'IMAX Enhanced'], gamingFeatures: ['144Hz VRR', 'ALLM', 'FreeSync Pro'], hdmiPorts: 4, usbPorts: 3, energyClass: 'G' },
    storeOffers: [
      { id: 'tcl-85c8k-vat', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: 279999, inStock: true, shippingDays: 1, badges: ['En Uygun Fiyat', 'VIP Kurulum'], sellerRating: 4.8, sellerReviews: 14200, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [{ date: 'Mart 2026', price: 279999, store: 'Vatan Bilgisayar' }]
  },
  {
    id: 'tcl-75c8k-2025',
    slug: 'tcl-75c8k-2025',
    name: 'TCL 75C8K 75" 190 Ekran Flagship QD-Mini LED 144Hz TV (2025)',
    brand: 'TCL',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 230,
    basePrice: 199999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['2025 Serisi', 'QD-Mini LED', '5000 Nits'],
    ssIndexRatio: 99.5,
    highlights: ['5000 Nits Tepe Parlaklık', 'TSR AI İşlemci', '144Hz VRR Oyun Modu'],
    specs: { screenSizeInches: 75, displayTech: 'QD-Mini LED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'Google TV', audioPowerWatts: 80, brightnessNits: 5000, localDimmingZones: 3840, processorEngine: 'TSR AI', hdrSupport: ['Dolby Vision IQ'], gamingFeatures: ['144Hz VRR'], hdmiPorts: 4, usbPorts: 3, energyClass: 'G' },
    storeOffers: [
      { id: 'tcl-75c8k-vat', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: 199999, inStock: true, shippingDays: 1, badges: ['En Uygun Fiyat'], sellerRating: 4.8, sellerReviews: 14200, url: 'https://www.vatanbilgisayar.com' }
    ],
    priceHistory: [{ date: 'Mart 2026', price: 199999, store: 'Vatan Bilgisayar' }]
  },

  // SAMSUNG FLAGSHIP TVS
  {
    id: 'samsung-85qn900d-2025',
    slug: 'samsung-85qn900d-2025',
    name: 'Samsung 85QN900D 85" 215 Ekran Neo QLED 8K Smart TV (2025)',
    brand: 'Samsung',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 160,
    basePrice: 329999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['8K Ultra HD', 'Neo QLED', 'NQ8 AI Gen3', '240Hz DLG'],
    ssIndexRatio: 99.9,
    highlights: ['NQ8 AI Gen3 İşlemci ile 8K Upscaling', 'Sonsuz Ekran İnce Çerçeve', 'Dolby Atmos 90W Ses'],
    specs: { screenSizeInches: 85, displayTech: 'Mini-LED', resolution: '8K Ultra HD', refreshRateHz: 144, smartOs: 'Tizen', audioPowerWatts: 90, brightnessNits: 4000, localDimmingZones: 2048, processorEngine: 'NQ8 AI Gen3', hdrSupport: ['Neo Quantum HDR 8K Pro'], gamingFeatures: ['4K @ 240Hz DLG', 'FreeSync Premium Pro'], hdmiPorts: 4, usbPorts: 3, energyClass: 'G' },
    storeOffers: [{ id: 'sam-hb', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-600 text-white', price: 329999, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör'], sellerRating: 4.9, sellerReviews: 21000, url: 'https://www.hepsiburada.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 329999, store: 'Hepsiburada' }]
  },
  {
    id: 'samsung-65s95d-2025',
    slug: 'samsung-65s95d-2025',
    name: 'Samsung 65S95D 65" 165 Ekran OLED 4K Smart TV (2025)',
    brand: 'Samsung',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 210,
    basePrice: 119999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['QD-OLED', 'Glare-Free', '144Hz'],
    ssIndexRatio: 99.7,
    highlights: ['Parlama Önleyici Glare-Free QD-OLED', 'NQ4 AI Gen2 Görsel İşlemci', 'Ultra İnce Slim Design'],
    specs: { screenSizeInches: 65, displayTech: 'QD-OLED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'Tizen', audioPowerWatts: 70, brightnessNits: 2000, processorEngine: 'NQ4 AI Gen2', hdrSupport: ['OLED HDR Pro'], gamingFeatures: ['144Hz VRR'], hdmiPorts: 4, usbPorts: 3, energyClass: 'F' },
    storeOffers: [{ id: 'sam-vat', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: 119999, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör'], sellerRating: 4.8, sellerReviews: 14200, url: 'https://www.vatanbilgisayar.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 119999, store: 'Vatan Bilgisayar' }]
  },
  {
    id: 'samsung-55qn90d-2025',
    slug: 'samsung-55qn90d-2025',
    name: 'Samsung 55QN90D 55" 140 Ekran Neo QLED 4K Smart TV (2025)',
    brand: 'Samsung',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 175,
    basePrice: 69999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    tags: ['Neo QLED', 'Mini-LED', '144Hz'],
    ssIndexRatio: 97.8,
    highlights: ['Neo Quantum HDR+', '144Hz VRR Oyuncu Modu', 'NQ4 AI Görsel İşlemci'],
    specs: { screenSizeInches: 55, displayTech: 'Mini-LED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'Tizen', audioPowerWatts: 60, brightnessNits: 1800, processorEngine: 'NQ4 AI Gen2', hdrSupport: ['HDR10+ Gaming'], gamingFeatures: ['144Hz VRR'], hdmiPorts: 4, usbPorts: 2, energyClass: 'F' },
    storeOffers: [{ id: 'sam-tek', storeName: 'Teknosa', storeLogoColor: 'bg-orange-600 text-white', price: 69999, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör'], sellerRating: 4.9, sellerReviews: 11200, url: 'https://www.teknosa.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 69999, store: 'Teknosa' }]
  },

  // LG FLAGSHIP TVS
  {
    id: 'lg-oled77g4-2025',
    slug: 'lg-oled77g4-2025',
    name: 'LG OLED77G4 77" 195 Ekran OLED evo 4K Smart TV (2025)',
    brand: 'LG',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 220,
    basePrice: 179999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['OLED evo', 'Alpha 11 AI', 'MLA 2.0', '144Hz'],
    ssIndexRatio: 100.0,
    highlights: ['Micro Lens Array (MLA 2.0) %150 Parlaklık', 'Alpha 11 AI 4K İşlemci', 'Duvara Sıfır Gallery Design'],
    specs: { screenSizeInches: 77, displayTech: 'OLED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'webOS', audioPowerWatts: 60, brightnessNits: 2200, processorEngine: 'Alpha 11 AI Processor 4K', hdrSupport: ['Dolby Vision', 'HDR10', 'HLG'], gamingFeatures: ['4K @ 144Hz VRR', 'G-Sync', 'FreeSync Premium'], hdmiPorts: 4, usbPorts: 3, energyClass: 'G' },
    storeOffers: [{ id: 'lg-msh', storeName: 'MediaMarkt (MSH)', storeLogoColor: 'bg-red-600 text-white', price: 179999, inStock: true, shippingDays: 2, badges: ['Resmi Distribütör', 'Gallery Mount Desteği'], sellerRating: 4.8, sellerReviews: 14500, url: 'https://www.mediamarkt.com.tr' }],
    priceHistory: [{ date: 'Mart 2025', price: 179999, store: 'MediaMarkt (MSH)' }]
  },
  {
    id: 'lg-oled65g4-2025',
    slug: 'lg-oled65g4-2025',
    name: 'LG OLED65G4 65" 165 Ekran OLED evo 4K Smart TV (2025)',
    brand: 'LG',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 5.0,
    reviewCount: 340,
    basePrice: 124999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['OLED evo', 'Alpha 11 AI', '144Hz'],
    ssIndexRatio: 99.8,
    highlights: ['Alpha 11 AI İşlemci', 'MLA 2.0 Parlaklık Artırıcı', 'webOS Re:New Programı'],
    specs: { screenSizeInches: 65, displayTech: 'OLED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'webOS', audioPowerWatts: 60, brightnessNits: 2200, processorEngine: 'Alpha 11 AI', hdrSupport: ['Dolby Vision IQ'], gamingFeatures: ['144Hz VRR', 'Nvidia G-Sync'], hdmiPorts: 4, usbPorts: 3, energyClass: 'F' },
    storeOffers: [{ id: 'lg-vat', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: 124999, inStock: true, shippingDays: 1, badges: ['En Çok Satan OLED'], sellerRating: 4.8, sellerReviews: 14200, url: 'https://www.vatanbilgisayar.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 124999, store: 'Vatan Bilgisayar' }]
  },
  {
    id: 'lg-oled55c4-2025',
    slug: 'lg-oled55c4-2025',
    name: 'LG OLED55C4 55" 140 Ekran OLED evo 4K Smart TV (2025)',
    brand: 'LG',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 410,
    basePrice: 74999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    tags: ['OLED evo', 'Alpha 9 AI', '144Hz Oyuncu TV'],
    ssIndexRatio: 98.5,
    highlights: ['Alpha 9 AI 4K Gen7 İşlemci', '144Hz VRR & G-Sync/FreeSync', 'Dolby Vision & Atmos'],
    specs: { screenSizeInches: 55, displayTech: 'OLED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'webOS', audioPowerWatts: 40, brightnessNits: 1400, processorEngine: 'Alpha 9 AI Gen7', hdrSupport: ['Dolby Vision'], gamingFeatures: ['144Hz VRR', 'G-Sync'], hdmiPorts: 4, usbPorts: 3, energyClass: 'G' },
    storeOffers: [{ id: 'lg-c4-tek', storeName: 'Teknosa', storeLogoColor: 'bg-orange-600 text-white', price: 74999, inStock: true, shippingDays: 1, badges: ['Oyuncunun Tercihi'], sellerRating: 4.9, sellerReviews: 11200, url: 'https://www.teknosa.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 74999, store: 'Teknosa' }]
  },

  // Additional Global & Turkish Brands
  {
    id: 'grundig-65ggh9700',
    slug: 'grundig-65ggh9700',
    name: 'Grundig 65 GGH 9700 65" 165 Ekran 4K OLED Google TV',
    brand: 'Grundig',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 4.8,
    reviewCount: 110,
    basePrice: 59999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    tags: ['OLED', 'Google TV', '4K'],
    ssIndexRatio: 94.5,
    highlights: ['65 inç 4K OLED Panel', 'Dolby Vision & Atmos', 'Google TV'],
    specs: { screenSizeInches: 65, displayTech: 'OLED', resolution: '4K Ultra HD', refreshRateHz: 120, smartOs: 'Google TV', audioPowerWatts: 40, hdrSupport: ['Dolby Vision'], gamingFeatures: ['120Hz VRR'], hdmiPorts: 4, usbPorts: 2, energyClass: 'F' },
    storeOffers: [{ id: 'gr-vat', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: 59999, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör'], sellerRating: 4.8, sellerReviews: 14200, url: 'https://www.vatanbilgisayar.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 59999, store: 'Vatan Bilgisayar' }]
  },
  {
    id: 'hisense-65u8k',
    slug: 'hisense-65u8k',
    name: 'Hisense 65U8K 65" 165 Ekran Mini-LED 144Hz ULED 4K TV',
    brand: 'Hisense',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 4.9,
    reviewCount: 180,
    basePrice: 64999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    tags: ['Mini-LED', '144Hz', 'Vidaa'],
    ssIndexRatio: 96.0,
    highlights: ['Mini-LED 144Hz VRR', '1500 Nits Tepe Parlaklık', 'Vidaa Smart OS'],
    specs: { screenSizeInches: 65, displayTech: 'Mini-LED', resolution: '4K Ultra HD', refreshRateHz: 144, smartOs: 'Vidaa', audioPowerWatts: 50, hdrSupport: ['Dolby Vision IQ'], gamingFeatures: ['144Hz VRR'], hdmiPorts: 4, usbPorts: 2, energyClass: 'G' },
    storeOffers: [{ id: 'hi-tek', storeName: 'Teknosa', storeLogoColor: 'bg-orange-600 text-white', price: 64999, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör'], sellerRating: 4.9, sellerReviews: 11200, url: 'https://www.teknosa.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 64999, store: 'Teknosa' }]
  },
  {
    id: 'onvo-ov65500',
    slug: 'onvo-ov65500',
    name: 'Onvo OV65500 65" 165 Ekran 4K Ultra HD webOS Smart LED TV',
    brand: 'Onvo',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 4.5,
    reviewCount: 220,
    basePrice: 22999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    tags: ['Fiyat/Performans', 'webOS', '4K'],
    ssIndexRatio: 91.0,
    highlights: ['65 inç Geniş Ekran Fiyat/Performans', 'webOS Akıllı TV', '4K Ultra HD'],
    specs: { screenSizeInches: 65, displayTech: 'LED', resolution: '4K Ultra HD', refreshRateHz: 60, smartOs: 'webOS', audioPowerWatts: 20, hdrSupport: ['HDR10'], gamingFeatures: ['ALLM'], hdmiPorts: 3, usbPorts: 2, energyClass: 'E' },
    storeOffers: [{ id: 'on-hb', storeName: 'Hepsiburada', storeLogoColor: 'bg-orange-600 text-white', price: 22999, inStock: true, shippingDays: 1, badges: ['En Uygun Fiyat'], sellerRating: 4.7, sellerReviews: 19800, url: 'https://www.hepsiburada.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 22999, store: 'Hepsiburada' }]
  },
  {
    id: 'vestel-65q9900',
    slug: 'vestel-65q9900',
    name: 'Vestel 65Q9900 65" 165 Ekran QLED 4K Smart TV',
    brand: 'Vestel',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 4.7,
    reviewCount: 310,
    basePrice: 34999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    tags: ['Yerli Üretim', 'QLED', 'Dolby Vision'],
    ssIndexRatio: 93.8,
    highlights: ['Vestel Quantum Renk Teknolojisi', 'Dolby Vision & Atmos', 'Yerli Üretim Garantisi'],
    specs: { screenSizeInches: 65, displayTech: 'QLED', resolution: '4K Ultra HD', refreshRateHz: 60, smartOs: 'Android TV', audioPowerWatts: 24, hdrSupport: ['Dolby Vision'], gamingFeatures: ['MEMC'], hdmiPorts: 3, usbPorts: 2, energyClass: 'E' },
    storeOffers: [{ id: 'ves-vat', storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: 34999, inStock: true, shippingDays: 1, badges: ['Yerli Üretim'], sellerRating: 4.8, sellerReviews: 14200, url: 'https://www.vatanbilgisayar.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 34999, store: 'Vatan Bilgisayar' }]
  },
  {
    id: 'seg-55sbu7300',
    slug: 'seg-55sbu7300',
    name: 'Seg 55SBU7300 55" 140 Ekran 4K Ultra HD Smart LED TV',
    brand: 'Seg',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: 4.4,
    reviewCount: 150,
    basePrice: 16999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: false,
    isFeatured: false,
    tags: ['Ekonomik', '4K', 'Smart TV'],
    ssIndexRatio: 89.5,
    highlights: ['55 inç Uygun Fiyatlı 4K TV', 'Smart TV Özellikleri', 'HDR10 Desteği'],
    specs: { screenSizeInches: 55, displayTech: 'LED', resolution: '4K Ultra HD', refreshRateHz: 60, smartOs: 'Vidaa', audioPowerWatts: 16, hdrSupport: ['HDR10'], gamingFeatures: [], hdmiPorts: 3, usbPorts: 1, energyClass: 'E' },
    storeOffers: [{ id: 'seg-tek', storeName: 'Teknosa', storeLogoColor: 'bg-orange-600 text-white', price: 16999, inStock: true, shippingDays: 1, badges: ['Ekonomik Seçim'], sellerRating: 4.9, sellerReviews: 11200, url: 'https://www.teknosa.com' }],
    priceHistory: [{ date: 'Mart 2025', price: 16999, store: 'Teknosa' }]
  }
];

// Combine all catalog models
const philipsModels = [
  // --- 2026 MODELS (66 Items) ---
  { model: '65OLED951/12', year: 2026, size: 65, tech: 'QD-OLED', refresh: 144, price: 139999, tags: ['2026 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side', '144Hz'], highlights: ['OLED+ META 2.0 Panel', 'Bowers & Wilkins 80W Ses', 'Ambilight 4-Taraflı'] },
  { model: '77OLED951/12', year: 2026, size: 77, tech: 'QD-OLED', refresh: 144, price: 199999, tags: ['2026 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['77 inç Dev OLED+ META 2.0', 'Bowers & Wilkins 95W Ses', 'Ambilight 4-Taraflı'] },
  { model: '42OLED811/12', year: 2026, size: 42, tech: 'OLED', refresh: 120, price: 49999, tags: ['2026 Serisi', 'OLED EX', 'Ambilight', 'Oyuncu TV'], highlights: ['42 inç Kompakt OLED EX', '120Hz VRR G-Sync/FreeSync', 'Ambilight 3-Taraflı'] },
  { model: '48OLED811/12', year: 2026, size: 48, tech: 'OLED', refresh: 120, price: 56999, tags: ['2026 Serisi', 'OLED EX', 'Ambilight'], highlights: ['48 inç OLED EX Panel', 'P5 AI Perfect Picture Engine', 'Ambilight 3-Taraflı'] },
  { model: '55OLED761/12', year: 2026, size: 55, tech: 'OLED', refresh: 120, price: 64999, tags: ['2026 Serisi', 'OLED', 'Ambilight'], highlights: ['55 inç OLED Sinema Paneli', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '65OLED761/12', year: 2026, size: 65, tech: 'OLED', refresh: 120, price: 84999, tags: ['2026 Serisi', 'OLED', 'Ambilight'], highlights: ['65 inç OLED 4K', 'P5 Perfect Picture Engine', 'Ambilight 3-Taraflı'] },
  { model: '77OLED761/12', year: 2026, size: 77, tech: 'OLED', refresh: 120, price: 139999, tags: ['2026 Serisi', 'OLED', 'Ambilight'], highlights: ['77 inç OLED Sinema', '4x HDMI 2.1 120Hz', 'Ambilight 3-Taraflı'] },

  { model: '43PQS9001/12', year: 2026, size: 43, tech: 'QLED', refresh: 144, price: 34999, tags: ['2026 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 2026', '144Hz VRR QLED Panel', 'Ambilight 3-Taraflı'] },
  { model: '50PQS9001/12', year: 2026, size: 50, tech: 'QLED', refresh: 144, price: 41999, tags: ['2026 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 50 inç', '144Hz Oyun Modu', 'Ambilight 3-Taraflı'] },
  { model: '55PQS9001/12', year: 2026, size: 55, tech: 'QLED', refresh: 144, price: 49999, tags: ['2026 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 55 inç', 'P5 AI Görsel İşlemci', 'Ambilight 3-Taraflı'] },
  { model: '65PQS9001/12', year: 2026, size: 65, tech: 'QLED', refresh: 144, price: 67999, tags: ['2026 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 65 inç', '144Hz VRR & FreeSync', 'Ambilight 3-Taraflı'] },
  { model: '75PQS9001/12', year: 2026, size: 75, tech: 'QLED', refresh: 144, price: 89999, tags: ['2026 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 75 inç', 'Dev QLED Ekran', 'Ambilight 3-Taraflı'] },
  { model: '85PQS9001/12', year: 2026, size: 85, tech: 'QLED', refresh: 144, price: 129999, tags: ['2026 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 85 inç Giant', '144Hz Oyuncu TV', 'Ambilight 3-Taraflı'] },
  { model: '100PQS9001/12', year: 2026, size: 100, tech: 'QLED', refresh: 144, price: 249999, tags: ['2026 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight', '100 inç'], highlights: ['100 inç Dev Ev Sineması', '144Hz QLED Ambilight', 'DTS Play-Fi Uyumlu'] },

  { model: '43PQS8601/12', year: 2026, size: 43, tech: 'Mini-LED', refresh: 144, price: 39999, tags: ['2026 Serisi', 'Mini-LED', '144Hz', 'Ambilight'], highlights: ['Mini-LED Hassas Karartma', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '50PQS8601/12', year: 2026, size: 50, tech: 'Mini-LED', refresh: 144, price: 47999, tags: ['2026 Serisi', 'Mini-LED', '144Hz', 'Ambilight'], highlights: ['50 inç Mini-LED', '1000 Nits Parlaklık', 'Ambilight 3-Taraflı'] },
  { model: '55PQS8601/12', year: 2026, size: 55, tech: 'Mini-LED', refresh: 144, price: 58999, tags: ['2026 Serisi', 'Mini-LED', '144Hz', 'Ambilight'], highlights: ['55 inç Mini-LED QLED', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65PQS8601/12', year: 2026, size: 65, tech: 'Mini-LED', refresh: 144, price: 78999, tags: ['2026 Serisi', 'Mini-LED', '144Hz', 'Ambilight'], highlights: ['65 inç Mini-LED', '2000 Nits Zirve Parlaklık', 'Ambilight 3-Taraflı'] },
  { model: '75PQS8601/12', year: 2026, size: 75, tech: 'Mini-LED', refresh: 144, price: 104999, tags: ['2026 Serisi', 'Mini-LED', '144Hz', 'Ambilight'], highlights: ['75 inç Dev Mini-LED', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },

  { model: '43PQS8701/12', year: 2026, size: 43, tech: 'QLED', refresh: 120, price: 31999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['43 inç QLED Ambilight', '120Hz DLG', 'Ambilight 3-Taraflı'] },
  { model: '50PQS8701/12', year: 2026, size: 50, tech: 'QLED', refresh: 120, price: 37999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['50 inç QLED Ambilight', '120Hz Oyun Desteği', 'Ambilight 3-Taraflı'] },
  { model: '55PQS8701/12', year: 2026, size: 55, tech: 'QLED', refresh: 120, price: 44999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['55 inç QLED Ambilight', 'Dolby Vision IQ', 'Ambilight 3-Taraflı'] },
  { model: '65PQS8701/12', year: 2026, size: 65, tech: 'QLED', refresh: 120, price: 61999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['65 inç QLED Ambilight', 'P5 AI Image Processor', 'Ambilight 3-Taraflı'] },
  { model: '43PQS8501/12', year: 2026, size: 43, tech: 'QLED', refresh: 120, price: 29999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['43 inç QLED 120Hz', 'Ambilight Işık Halesi', 'Dolby Atmos'] },
  { model: '50PQS8501/12', year: 2026, size: 50, tech: 'QLED', refresh: 120, price: 35999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['50 inç QLED 120Hz', 'Titan OS / Google TV', 'Ambilight 3-Taraflı'] },
  { model: '55PQS8501/12', year: 2026, size: 55, tech: 'QLED', refresh: 120, price: 42999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['55 inç QLED 120Hz', 'HDMI 2.1 Oyun Modu', 'Ambilight 3-Taraflı'] },
  { model: '65PQS8501/12', year: 2026, size: 65, tech: 'QLED', refresh: 120, price: 59999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['65 inç QLED 120Hz', 'DTS Play-Fi Kablosuz Ses', 'Ambilight 3-Taraflı'] },
  { model: '75PQS8501/12', year: 2026, size: 75, tech: 'QLED', refresh: 120, price: 82999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['75 inç QLED 120Hz', 'Dev Ekran Ambilight', 'Ambilight 3-Taraflı'] },
  { model: '85PQS8501/12', year: 2026, size: 85, tech: 'QLED', refresh: 120, price: 119999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['85 inç QLED Giant', '120Hz DLG', 'Ambilight 3-Taraflı'] },
  { model: '43PQS7801/12', year: 2026, size: 43, tech: 'QLED', refresh: 60, price: 24999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['43 inç QLED 4K', 'Ambilight Işık Halesi', 'HDR10+'] },
  { model: '50PQS7801/12', year: 2026, size: 50, tech: 'QLED', refresh: 60, price: 29999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['50 inç QLED 4K', 'Ambilight 3-Taraflı', 'Dolby Vision'] },
  { model: '55PQS7801/12', year: 2026, size: 55, tech: 'QLED', refresh: 60, price: 36999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['55 inç QLED 4K', 'Ambilight 3-Taraflı', 'Dolby Atmos'] },
  { model: '65PQS7801/12', year: 2026, size: 65, tech: 'QLED', refresh: 60, price: 51999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['65 inç QLED 4K', 'Ambilight 3-Taraflı', 'Titan OS'] },
  { model: '75PQS7801/12', year: 2026, size: 75, tech: 'QLED', refresh: 60, price: 74999, tags: ['2026 Serisi', 'QLED', 'Ambilight'], highlights: ['75 inç QLED 4K', 'Ambilight 3-Taraflı', 'Dolby Vision'] },

  { model: '32PQS6901/12', year: 2026, size: 32, tech: 'LED', refresh: 60, price: 16999, tags: ['2026 Serisi', 'Full HD', 'Ambilight'], highlights: ['32 inç Full HD Ambilight', 'Kompakt Mutfak/Yatak Odası TV', 'Titan OS'] },
  { model: '40PQS6901/12', year: 2026, size: 40, tech: 'LED', refresh: 60, price: 19999, tags: ['2026 Serisi', 'Full HD', 'Ambilight'], highlights: ['40 inç Full HD Ambilight', 'Pixel Plus HD', 'Ambilight 3-Taraflı'] },
  { model: '43PUS8001/12', year: 2026, size: 43, tech: 'LED', refresh: 60, price: 22999, tags: ['2026 Serisi', '4K LED', 'Ambilight'], highlights: ['43 inç 4K Ambilight LED', 'Dolby Vision & Atmos', 'Pixel Precise Ultra HD'] },
  { model: '50PUS8001/12', year: 2026, size: 50, tech: 'LED', refresh: 60, price: 26999, tags: ['2026 Serisi', '4K LED', 'Ambilight'], highlights: ['50 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '55PUS8001/12', year: 2026, size: 55, tech: 'LED', refresh: 60, price: 31999, tags: ['2026 Serisi', '4K LED', 'Ambilight'], highlights: ['55 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'Dolby Atmos'] },
  { model: '65PUS8001/12', year: 2026, size: 65, tech: 'LED', refresh: 60, price: 44999, tags: ['2026 Serisi', '4K LED', 'Ambilight'], highlights: ['65 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'HDMI 2.1 ALLM'] },
  { model: '43PUS7001/12', year: 2026, size: 43, tech: 'LED', refresh: 60, price: 18999, tags: ['2026 Serisi', '4K LED'], highlights: ['43 inç 4K Ultra HD', 'Dolby Audio', 'İnce Çerçeve'] },
  { model: '50PUS7001/12', year: 2026, size: 50, tech: 'LED', refresh: 60, price: 22999, tags: ['2026 Serisi', '4K LED'], highlights: ['50 inç 4K Ultra HD', 'Pixel Precise Ultra HD Engine', 'Smart TV'] },
  { model: '55PUS7001/12', year: 2026, size: 55, tech: 'LED', refresh: 60, price: 27999, tags: ['2026 Serisi', '4K LED'], highlights: ['55 inç 4K Ultra HD', 'HDR10 Desteği', 'Smart TV'] },
  { model: '65PUS7001/12', year: 2026, size: 65, tech: 'LED', refresh: 60, price: 38999, tags: ['2026 Serisi', '4K LED'], highlights: ['65 inç 4K Ultra HD', 'Geniş Görüş Açısı', 'Smart TV'] },
  { model: '75PUS7001/12', year: 2026, size: 75, tech: 'LED', refresh: 60, price: 59999, tags: ['2026 Serisi', '4K LED'], highlights: ['75 inç 4K Ultra HD Dev Ekran', 'Dolby Audio', 'Smart TV'] },

  { model: '55OLED811/12', year: 2026, size: 55, tech: 'OLED', refresh: 120, price: 68999, tags: ['2026 Serisi', 'OLED EX', 'Ambilight'], highlights: ['55 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED811/12', year: 2026, size: 65, tech: 'OLED', refresh: 120, price: 89999, tags: ['2026 Serisi', 'OLED EX', 'Ambilight'], highlights: ['65 inç OLED EX 120Hz', 'Dolby Vision IQ & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '77OLED811/12', year: 2026, size: 77, tech: 'OLED', refresh: 120, price: 149999, tags: ['2026 Serisi', 'OLED EX', 'Ambilight'], highlights: ['77 inç OLED EX Dev Sinema', 'HDMI 2.1 120Hz VRR', 'Ambilight 3-Taraflı'] },

  { model: '48OLED911/12', year: 2026, size: 48, tech: 'QD-OLED', refresh: 144, price: 74999, tags: ['2026 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side', '144Hz'], highlights: ['48 inç OLED+ META 2.0', 'Bowers & Wilkins Ses', 'Ambilight 4-Taraflı'] },
  { model: '55OLED911/12', year: 2026, size: 55, tech: 'QD-OLED', refresh: 144, price: 89999, tags: ['2026 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side', '144Hz'], highlights: ['55 inç OLED+ META 2.0', 'Bowers & Wilkins 80W Ses', 'Ambilight 4-Taraflı'] },
  { model: '65OLED911/12', year: 2026, size: 65, tech: 'QD-OLED', refresh: 144, price: 129999, tags: ['2026 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side', '144Hz'], highlights: ['65 inç OLED+ META 2.0', 'Bowers & Wilkins 85W Ses', 'Ambilight 4-Taraflı'] },
  { model: '77OLED911/12', year: 2026, size: 77, tech: 'QD-OLED', refresh: 144, price: 189999, tags: ['2026 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side', '144Hz'], highlights: ['77 inç Dev OLED+ META 2.0', 'Bowers & Wilkins 95W Ses', 'Ambilight 4-Taraflı'] },

  { model: '50PUL7985/F7', year: 2026, size: 50, tech: 'LED', refresh: 60, price: 24999, tags: ['2026 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Smart TV', 'Ambilight 3-Taraflı', 'Dolby Vision & Atmos'] },
  { model: '55PUL7985/F7', year: 2026, size: 55, tech: 'LED', refresh: 60, price: 29999, tags: ['2026 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Smart TV', 'Ambilight 3-Taraflı', 'Google TV OS'] },
  { model: '65PUL7985/F7', year: 2026, size: 65, tech: 'LED', refresh: 60, price: 41999, tags: ['2026 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Smart TV', 'Ambilight 3-Taraflı', 'HDMI 2.1 ALLM'] },

  { model: '32PFL6446/F7', year: 2026, size: 32, tech: 'LED', refresh: 60, price: 14999, tags: ['2026 Serisi', 'Full HD', 'Smart TV'], highlights: ['32 inç Full HD Smart TV', 'Pixel Plus HD Engine', 'Kompakt Tasarım'] },
  { model: '40PQF7446/F7', year: 2026, size: 40, tech: 'QLED', refresh: 60, price: 18999, tags: ['2026 Serisi', 'Full HD', 'QLED'], highlights: ['40 inç Full HD QLED Smart TV', 'Quantum Dot Renkler', 'Google TV'] },

  { model: '43PQL7456/F7', year: 2026, size: 43, tech: 'QLED', refresh: 60, price: 26999, tags: ['2026 Serisi', 'QLED 4K'], highlights: ['43 inç QLED 4K Ultra HD', 'Google TV Akıllı Platform', 'Dolby Vision'] },
  { model: '50PQL7456/F7', year: 2026, size: 50, tech: 'QLED', refresh: 60, price: 31999, tags: ['2026 Serisi', 'QLED 4K'], highlights: ['50 inç QLED 4K Ultra HD', 'Dolby Atmos Ses', 'Google TV'] },
  { model: '60PQL7456/F7', year: 2026, size: 60, tech: 'QLED', refresh: 60, price: 44999, tags: ['2026 Serisi', 'QLED 4K'], highlights: ['60 inç QLED 4K Ultra HD', 'Geniş Görüş Açısı', 'Google TV'] },
  { model: '65PQL7456/F7', year: 2026, size: 65, tech: 'QLED', refresh: 60, price: 52999, tags: ['2026 Serisi', 'QLED 4K'], highlights: ['65 inç QLED 4K Ultra HD', 'HDMI 2.1 eARC', 'Google TV'] },
  { model: '75PQL7456/F7', year: 2026, size: 75, tech: 'QLED', refresh: 60, price: 76999, tags: ['2026 Serisi', 'QLED 4K'], highlights: ['75 inç QLED 4K Dev Ekran', 'Quantum Dot Renk', 'Google TV'] },
  { model: '85PQL7456/F7', year: 2026, size: 85, tech: 'QLED', refresh: 60, price: 112999, tags: ['2026 Serisi', 'QLED 4K', '85 inç'], highlights: ['85 inç QLED 4K Giant TV', 'Stadyum Sinema Deneyimi', 'Google TV'] },

  { model: '100PQL7556/F7', year: 2026, size: 100, tech: 'QLED', refresh: 120, price: 229999, tags: ['2026 Serisi', 'QLED 4K', '100 inç'], highlights: ['100 inç Dev Ev Sineması', '120Hz DLG Oyun Modu', 'Google TV'] },

  { model: '42OLED901/12', year: 2026, size: 42, tech: 'OLED', refresh: 120, price: 54999, tags: ['2026 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['42 inç OLED+ Sinema Paneli', 'Ambilight 4-Taraflı', 'P5 AI Perfect Engine'] },
  { model: '48OLED901/12', year: 2026, size: 48, tech: 'OLED', refresh: 120, price: 62999, tags: ['2026 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['48 inç OLED+ Sinema Paneli', 'Ambilight 4-Taraflı', 'Bowers & Wilkins Akustik'] },

  // --- 2025 MODELS ---
  { model: '48OLED760/12', year: 2025, size: 48, tech: 'OLED', refresh: 120, price: 54999, tags: ['2025 Serisi', 'OLED', 'Ambilight'], highlights: ['48 inç OLED Panel', 'P5 Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '55OLED760/12', year: 2025, size: 55, tech: 'OLED', refresh: 120, price: 62999, tags: ['2025 Serisi', 'OLED', 'Ambilight'], highlights: ['55 inç OLED Panel', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '65OLED760/12', year: 2025, size: 65, tech: 'OLED', refresh: 120, price: 82999, tags: ['2025 Serisi', 'OLED', 'Ambilight'], highlights: ['65 inç OLED 4K', 'P5 Engine', 'Ambilight 3-Taraflı'] },
  { model: '77OLED760/12', year: 2025, size: 77, tech: 'OLED', refresh: 120, price: 134999, tags: ['2025 Serisi', 'OLED', 'Ambilight'], highlights: ['77 inç Dev OLED', 'HDMI 2.1 120Hz', 'Ambilight 3-Taraflı'] },

  { model: '42OLED810/12', year: 2025, size: 42, tech: 'OLED', refresh: 120, price: 47999, tags: ['2025 Serisi', 'OLED EX', 'Ambilight'], highlights: ['42 inç OLED EX Panel', '120Hz Oyun Modu', 'Ambilight 3-Taraflı'] },
  { model: '48OLED810/12', year: 2025, size: 48, tech: 'OLED', refresh: 120, price: 54999, tags: ['2025 Serisi', 'OLED EX', 'Ambilight'], highlights: ['48 inç OLED EX Panel', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '55OLED810/12', year: 2025, size: 55, tech: 'OLED', refresh: 120, price: 64999, tags: ['2025 Serisi', 'OLED EX', 'Ambilight'], highlights: ['55 inç OLED EX Panel', 'Dolby Vision IQ', 'Ambilight 3-Taraflı'] },
  { model: '65OLED810/12', year: 2025, size: 65, tech: 'OLED', refresh: 120, price: 84999, tags: ['2025 Serisi', 'OLED EX', 'Ambilight'], highlights: ['65 inç OLED EX 4K', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '77OLED810/12', year: 2025, size: 77, tech: 'OLED', refresh: 120, price: 139999, tags: ['2025 Serisi', 'OLED EX', 'Ambilight'], highlights: ['77 inç Dev OLED EX', 'Bowers & Wilkins Audio', 'Ambilight 3-Taraflı'] },

  { model: '55OLED850/12', year: 2025, size: 55, tech: 'OLED', refresh: 120, price: 67999, tags: ['2025 Serisi', 'OLED', 'Ambilight'], highlights: ['55 inç OLED Sinema', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED850/12', year: 2025, size: 65, tech: 'OLED', refresh: 120, price: 87999, tags: ['2025 Serisi', 'OLED', 'Ambilight'], highlights: ['65 inç OLED Sinema', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },

  { model: '55OLED910/12', year: 2025, size: 55, tech: 'QD-OLED', refresh: 144, price: 84999, tags: ['2025 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['55 inç OLED+ META Panel', 'Bowers & Wilkins Ses', 'Ambilight 4-Taraflı'] },
  { model: '65OLED910/12', year: 2025, size: 65, tech: 'QD-OLED', refresh: 144, price: 124999, tags: ['2025 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ META Panel', 'Bowers & Wilkins Ses', 'Ambilight 4-Taraflı'] },
  { model: '77OLED910/12', year: 2025, size: 77, tech: 'QD-OLED', refresh: 144, price: 179999, tags: ['2025 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['77 inç Dev OLED+ META', 'Bowers & Wilkins Ses', 'Ambilight 4-Taraflı'] },

  { model: '55OLED974/F7', year: 2025, size: 55, tech: 'OLED+', refresh: 144, price: 88999, tags: ['2025 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['55 inç OLED+ Flagship', 'Ambilight 4-Taraflı', 'Bowers & Wilkins'] },
  { model: '65OLED974/F7', year: 2025, size: 65, tech: 'OLED+', refresh: 144, price: 128999, tags: ['2025 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ Flagship', 'Ambilight 4-Taraflı', 'Bowers & Wilkins'] },
  { model: '77OLED974/F7', year: 2025, size: 77, tech: 'OLED+', refresh: 144, price: 184999, tags: ['2025 Serisi', 'OLED+', 'Ambilight 4-Side'], highlights: ['77 inç OLED+ Flagship', 'Ambilight 4-Taraflı', 'Bowers & Wilkins'] },

  { model: '43PUG7674/F7', year: 2025, size: 43, tech: 'LED', refresh: 60, price: 19999, tags: ['2025 Serisi', '4K LED'], highlights: ['43 inç 4K Smart TV', 'Dolby Audio', 'Google TV'] },
  { model: '50PUG7674/F7', year: 2025, size: 50, tech: 'LED', refresh: 60, price: 23999, tags: ['2025 Serisi', '4K LED'], highlights: ['50 inç 4K Smart TV', 'Dolby Audio', 'Google TV'] },

  { model: '43PUS9000/12', year: 2025, size: 43, tech: 'QLED', refresh: 120, price: 32999, tags: ['2025 Serisi', 'The One', 'QLED', 'Ambilight'], highlights: ['43 inç "The One" QLED', '120Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '50PUS9000/12', year: 2025, size: 50, tech: 'QLED', refresh: 120, price: 39999, tags: ['2025 Serisi', 'The One', 'QLED', 'Ambilight'], highlights: ['50 inç "The One" QLED', '120Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '55PUS9000/12', year: 2025, size: 55, tech: 'QLED', refresh: 120, price: 47999, tags: ['2025 Serisi', 'The One', 'QLED', 'Ambilight'], highlights: ['55 inç "The One" QLED', 'P5 Engine', 'Ambilight 3-Taraflı'] },
  { model: '65PUS9000/12', year: 2025, size: 65, tech: 'QLED', refresh: 120, price: 64999, tags: ['2025 Serisi', 'The One', 'QLED', 'Ambilight'], highlights: ['65 inç "The One" QLED', '120Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '75PUS9000/12', year: 2025, size: 75, tech: 'QLED', refresh: 120, price: 86999, tags: ['2025 Serisi', 'The One', 'QLED', 'Ambilight'], highlights: ['75 inç "The One" QLED', 'Dev Ekran', 'Ambilight 3-Taraflı'] },
  { model: '85PUS9000/12', year: 2025, size: 85, tech: 'QLED', refresh: 120, price: 124999, tags: ['2025 Serisi', 'The One', 'QLED', 'Ambilight'], highlights: ['85 inç "The One" Giant', '120Hz VRR', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8600/12', year: 2025, size: 43, tech: 'LED', refresh: 60, price: 25999, tags: ['2025 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Dolby Vision', 'Google TV'] },
  { model: '55PUS8600/12', year: 2025, size: 55, tech: 'LED', refresh: 60, price: 34999, tags: ['2025 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Pixel Precise HD', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8600/12', year: 2025, size: 65, tech: 'LED', refresh: 60, price: 47999, tags: ['2025 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Dolby Atmos', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8000/12', year: 2025, size: 43, tech: 'LED', refresh: 60, price: 21999, tags: ['2025 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8000/12', year: 2025, size: 50, tech: 'LED', refresh: 60, price: 25999, tags: ['2025 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8000/12', year: 2025, size: 55, tech: 'LED', refresh: 60, price: 30999, tags: ['2025 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8000/12', year: 2025, size: 65, tech: 'LED', refresh: 60, price: 43999, tags: ['2025 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Google TV', 'Ambilight 3-Taraflı'] },

  { model: '43PUS7800/12', year: 2025, size: 43, tech: 'LED', refresh: 60, price: 18999, tags: ['2025 Serisi', '4K LED'], highlights: ['43 inç 4K Ultra HD', 'Pixel Precise HD', 'Smart TV'] },
  { model: '50PUS7800/12', year: 2025, size: 50, tech: 'LED', refresh: 60, price: 22999, tags: ['2025 Serisi', '4K LED'], highlights: ['50 inç 4K Ultra HD', 'Pixel Precise HD', 'Smart TV'] },
  { model: '55PUS7800/12', year: 2025, size: 55, tech: 'LED', refresh: 60, price: 27999, tags: ['2025 Serisi', '4K LED'], highlights: ['55 inç 4K Ultra HD', 'Pixel Precise HD', 'Smart TV'] },
  { model: '65PUS7800/12', year: 2025, size: 65, tech: 'LED', refresh: 60, price: 38999, tags: ['2025 Serisi', '4K LED'], highlights: ['65 inç 4K Ultra HD', 'Pixel Precise HD', 'Smart TV'] },
  { model: '75PUS7800/12', year: 2025, size: 75, tech: 'LED', refresh: 60, price: 58999, tags: ['2025 Serisi', '4K LED'], highlights: ['75 inç 4K Dev Ekran', 'Pixel Precise HD', 'Smart TV'] },

  { model: '43PUS7000/12', year: 2025, size: 43, tech: 'LED', refresh: 60, price: 17999, tags: ['2025 Serisi', '4K LED'], highlights: ['43 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '50PUS7000/12', year: 2025, size: 50, tech: 'LED', refresh: 60, price: 21999, tags: ['2025 Serisi', '4K LED'], highlights: ['50 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '55PUS7000/12', year: 2025, size: 55, tech: 'LED', refresh: 60, price: 26999, tags: ['2025 Serisi', '4K LED'], highlights: ['55 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '65PUS7000/12', year: 2025, size: 65, tech: 'LED', refresh: 60, price: 37999, tags: ['2025 Serisi', '4K LED'], highlights: ['65 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '75PUS7000/12', year: 2025, size: 75, tech: 'LED', refresh: 60, price: 56999, tags: ['2025 Serisi', '4K LED'], highlights: ['75 inç 4K Dev Ekran', 'Dolby Audio', 'Smart TV'] },

  { model: '24PHS6000/12', year: 2025, size: 24, tech: 'LED', refresh: 60, price: 9999, tags: ['2025 Serisi', 'HD'], highlights: ['24 inç Kompakt HD TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '32PHS6000/12', year: 2025, size: 32, tech: 'LED', refresh: 60, price: 12999, tags: ['2025 Serisi', 'HD Smart'], highlights: ['32 inç HD Smart TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '40PFS6000/12', year: 2025, size: 40, tech: 'LED', refresh: 60, price: 15999, tags: ['2025 Serisi', 'Full HD'], highlights: ['40 inç Full HD Smart TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '32PFS6900/12', year: 2025, size: 32, tech: 'LED', refresh: 60, price: 15999, tags: ['2025 Serisi', 'Full HD Ambilight'], highlights: ['32 inç Full HD Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },

  { model: '43PUS8500/12', year: 2025, size: 43, tech: 'QLED', refresh: 120, price: 28999, tags: ['2025 Serisi', 'QLED', 'Ambilight'], highlights: ['43 inç QLED 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8500/12', year: 2025, size: 50, tech: 'QLED', refresh: 120, price: 34999, tags: ['2025 Serisi', 'QLED', 'Ambilight'], highlights: ['50 inç QLED 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8500/12', year: 2025, size: 55, tech: 'QLED', refresh: 120, price: 41999, tags: ['2025 Serisi', 'QLED', 'Ambilight'], highlights: ['55 inç QLED 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8500/12', year: 2025, size: 65, tech: 'QLED', refresh: 120, price: 58999, tags: ['2025 Serisi', 'QLED', 'Ambilight'], highlights: ['65 inç QLED 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8500/12', year: 2025, size: 75, tech: 'QLED', refresh: 120, price: 81999, tags: ['2025 Serisi', 'QLED', 'Ambilight'], highlights: ['75 inç QLED 120Hz', 'Dev Ekran', 'Ambilight 3-Taraflı'] },
  { model: '85PUS8500/12', year: 2025, size: 85, tech: 'QLED', refresh: 120, price: 116999, tags: ['2025 Serisi', 'QLED', 'Ambilight'], highlights: ['85 inç QLED Giant', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },

  // --- 2024 PHILIPS CATALOG MODELS (45 Items from 2024 Image) ---
  { model: '43PUL6643/F7', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 16999, tags: ['2024 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'Pixel Precise HD', 'Smart TV'] },
  { model: '50PUL6643/F7', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 20999, tags: ['2024 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Pixel Precise HD', 'Smart TV'] },
  { model: '55PUL6643/F7', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 24999, tags: ['2024 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Pixel Precise HD', 'Smart TV'] },
  { model: '75PUL6643/F7', year: 2024, size: 75, tech: 'LED', refresh: 60, price: 52999, tags: ['2024 Serisi', '4K Smart'], highlights: ['75 inç 4K Dev Ekran', 'Pixel Precise HD', 'Smart TV'] },

  { model: '43PUS8209/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 19999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '50PUS8209/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 23999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '55PUS8209/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 28999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '65PUS8209/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 39999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },

  { model: '32PFS6939/12', year: 2024, size: 32, tech: 'LED', refresh: 60, price: 14999, tags: ['2024 Serisi', 'Full HD Ambilight'], highlights: ['32 inç Full HD Ambilight', 'Pixel Plus HD', 'Smart TV'] },

  { model: '55PML8709/12', year: 2024, size: 55, tech: 'Mini-LED', refresh: 120, price: 39999, tags: ['2024 Serisi', 'Mini-LED', '120Hz'], highlights: ['55 inç Mini-LED 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '65PML8709/12', year: 2024, size: 65, tech: 'Mini-LED', refresh: 120, price: 54999, tags: ['2024 Serisi', 'Mini-LED', '120Hz'], highlights: ['65 inç Mini-LED 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '75PML8709/12', year: 2024, size: 75, tech: 'Mini-LED', refresh: 120, price: 74999, tags: ['2024 Serisi', 'Mini-LED', '120Hz'], highlights: ['75 inç Dev Mini-LED 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },

  { model: '65OLED959/12', year: 2024, size: 65, tech: 'QD-OLED', refresh: 144, price: 114999, tags: ['2024 Serisi', 'OLED+', 'Amiral Gemisi', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ Amiral Gemisi META 2.0', 'Bowers & Wilkins 102W Ses', 'Ambilight 4-Taraflı'] },

  { model: '55OLED909/12', year: 2024, size: 55, tech: 'QD-OLED', refresh: 144, price: 79999, tags: ['2024 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['55 inç OLED+ META Panel', 'Bowers & Wilkins 80W Ses', 'Ambilight 4-Taraflı'] },
  { model: '65OLED909/12', year: 2024, size: 65, tech: 'QD-OLED', refresh: 144, price: 114999, tags: ['2024 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ META Panel', 'Bowers & Wilkins 80W Ses', 'Ambilight 4-Taraflı'] },
  { model: '77OLED909/12', year: 2024, size: 77, tech: 'QD-OLED', refresh: 144, price: 164999, tags: ['2024 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['77 inç Dev OLED+ META Panel', 'Bowers & Wilkins 95W Ses', 'Ambilight 4-Taraflı'] },

  { model: '55PML9049/12', year: 2024, size: 55, tech: 'Mini-LED', refresh: 120, price: 44999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Mini-LED', '120Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '65PML9049/12', year: 2024, size: 65, tech: 'Mini-LED', refresh: 120, price: 61999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Mini-LED', '120Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '75PML9049/12', year: 2024, size: 75, tech: 'Mini-LED', refresh: 120, price: 82999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Dev Mini-LED', '120Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '85PML9049/12', year: 2024, size: 85, tech: 'Mini-LED', refresh: 120, price: 112999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED', '85 inç'], highlights: ['Philips "The Xtra" 85 inç Giant Mini-LED', '120Hz VRR', 'Ambilight 3-Taraflı'] },

  { model: '55PML9009/12', year: 2024, size: 55, tech: 'Mini-LED', refresh: 120, price: 41999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['55 inç Mini-LED "The Xtra"', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65PML9009/12', year: 2024, size: 65, tech: 'Mini-LED', refresh: 120, price: 58999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['65 inç Mini-LED "The Xtra"', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '75PML9009/12', year: 2024, size: 75, tech: 'Mini-LED', refresh: 120, price: 79999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['75 inç Mini-LED "The Xtra"', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '85PML9009/12', year: 2024, size: 85, tech: 'Mini-LED', refresh: 120, price: 109999, tags: ['2024 Serisi', 'The Xtra', 'Mini-LED', '85 inç'], highlights: ['85 inç Giant Mini-LED "The Xtra"', '120Hz VRR', 'Ambilight 3-Taraflı'] },

  { model: '32PHS6009/12', year: 2024, size: 32, tech: 'LED', refresh: 60, price: 11999, tags: ['2024 Serisi', 'HD Smart'], highlights: ['32 inç HD Smart TV', 'Pixel Plus HD Engine', 'Kompakt Tasarım'] },
  { model: '40PFS6009/12', year: 2024, size: 40, tech: 'LED', refresh: 60, price: 14999, tags: ['2024 Serisi', 'Full HD Smart'], highlights: ['40 inç Full HD Smart TV', 'Pixel Plus HD Engine', 'Smart TV'] },

  { model: '43PUS7009/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 16999, tags: ['2024 Serisi', '4K LED'], highlights: ['43 inç 4K Ultra HD', 'Dolby Audio', 'Titan OS'] },
  { model: '50PUS7009/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 20999, tags: ['2024 Serisi', '4K LED'], highlights: ['50 inç 4K Ultra HD', 'Pixel Precise Engine', 'Titan OS'] },
  { model: '55PUS7009/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 25999, tags: ['2024 Serisi', '4K LED'], highlights: ['55 inç 4K Ultra HD', 'Dolby Audio', 'Titan OS'] },
  { model: '65PUS7009/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 36999, tags: ['2024 Serisi', '4K LED'], highlights: ['65 inç 4K Ultra HD', 'Pixel Precise Engine', 'Titan OS'] },
  { model: '75PUS7009/12', year: 2024, size: 75, tech: 'LED', refresh: 60, price: 54999, tags: ['2024 Serisi', '4K LED'], highlights: ['75 inç 4K Dev Ekran', 'Dolby Audio', 'Titan OS'] },

  { model: '50PUS7409/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 21999, tags: ['2024 Serisi', '4K LED'], highlights: ['50 inç 4K Ultra HD', 'HDR10+', 'Titan OS'] },
  { model: '55PUS7409/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 26999, tags: ['2024 Serisi', '4K LED'], highlights: ['55 inç 4K Ultra HD', 'HDR10+', 'Titan OS'] },
  { model: '65PUS7409/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 37999, tags: ['2024 Serisi', '4K LED'], highlights: ['65 inç 4K Ultra HD', 'HDR10+', 'Titan OS'] },

  { model: '43PUS7609/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 17999, tags: ['2024 Serisi', '4K LED'], highlights: ['43 inç 4K Smart TV', 'Dolby Vision', 'Google TV'] },
  { model: '50PUS7609/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 21999, tags: ['2024 Serisi', '4K LED'], highlights: ['50 inç 4K Smart TV', 'Dolby Vision', 'Google TV'] },
  { model: '55PUS7609/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 26999, tags: ['2024 Serisi', '4K LED'], highlights: ['55 inç 4K Smart TV', 'Dolby Vision', 'Google TV'] },
  { model: '65PUS7609/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 37999, tags: ['2024 Serisi', '4K LED'], highlights: ['65 inç 4K Smart TV', 'Dolby Vision', 'Google TV'] },
  { model: '75PUS7609/12', year: 2024, size: 75, tech: 'LED', refresh: 60, price: 55999, tags: ['2024 Serisi', '4K LED'], highlights: ['75 inç 4K Dev Ekran', 'Dolby Vision', 'Google TV'] },

  { model: '43PUS8079/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 20999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '50PUS8079/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 24999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '55PUS8079/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 29999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '65PUS8079/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 41999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },
  { model: '75PUS8079/12', year: 2024, size: 75, tech: 'LED', refresh: 60, price: 61999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['75 inç 4K Dev Ambilight', 'Ambilight 3-Taraflı', 'Google TV'] },

  { model: '43PUS8109/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 21999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Dolby Vision & Atmos'] },

  // --- NEWEST CATALOG IMAGE MODELS (43 ADDITIONAL ITEMS) ---
  { model: '55PUS8109/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 27999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'Titan OS'] },
  { model: '65PUS8109/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 39999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'Titan OS'] },

  { model: '43PUS8609/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 21999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'Dolby Vision'] },
  { model: '55PUS8609/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 29999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'Dolby Vision'] },
  { model: '65PUS8609/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 42999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight LED', 'Ambilight 3-Taraflı', 'Dolby Vision'] },

  { model: '43PUS8949/12', year: 2024, size: 43, tech: 'QLED', refresh: 144, price: 31999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 144Hz QLED', 'Ambilight 3-Taraflı', 'Game Bar 2.0'] },
  { model: '50PUS8949/12', year: 2024, size: 50, tech: 'QLED', refresh: 144, price: 37999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 50 inç QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8949/12', year: 2024, size: 55, tech: 'QLED', refresh: 144, price: 44999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 55 inç QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8949/12', year: 2024, size: 65, tech: 'QLED', refresh: 144, price: 61999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 65 inç QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8949/12', year: 2024, size: 75, tech: 'QLED', refresh: 144, price: 82999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" 75 inç Dev QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8909/12', year: 2024, size: 43, tech: 'QLED', refresh: 144, price: 29999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8909/12', year: 2024, size: 50, tech: 'QLED', refresh: 144, price: 35999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8909/12', year: 2024, size: 55, tech: 'QLED', refresh: 144, price: 42999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8909/12', year: 2024, size: 65, tech: 'QLED', refresh: 144, price: 58999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8909/12', year: 2024, size: 75, tech: 'QLED', refresh: 144, price: 79999, tags: ['2024 Serisi', 'The One', 'QLED', '144Hz', 'Ambilight'], highlights: ['Philips "The One" Dev QLED', '144Hz VRR', 'Ambilight 3-Taraflı'] },

  { model: '48OLED859/12', year: 2024, size: 48, tech: 'OLED', refresh: 120, price: 52999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['48 inç OLED EX Panel', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '55OLED859/12', year: 2024, size: 55, tech: 'OLED', refresh: 120, price: 62999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['55 inç OLED EX Panel', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED859/12', year: 2024, size: 65, tech: 'OLED', refresh: 120, price: 82999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['65 inç OLED EX Panel', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '77OLED859/12', year: 2024, size: 77, tech: 'OLED', refresh: 120, price: 134999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['77 inç Dev OLED EX', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },

  { model: '48OLED759/12', year: 2024, size: 48, tech: 'OLED', refresh: 120, price: 47999, tags: ['2024 Serisi', 'OLED', 'Ambilight'], highlights: ['48 inç OLED Panel', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '55OLED759/12', year: 2024, size: 55, tech: 'OLED', refresh: 120, price: 56999, tags: ['2024 Serisi', 'OLED', 'Ambilight'], highlights: ['55 inç OLED Panel', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '65OLED759/12', year: 2024, size: 65, tech: 'OLED', refresh: 120, price: 76999, tags: ['2024 Serisi', 'OLED', 'Ambilight'], highlights: ['65 inç OLED Panel', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '77OLED759/12', year: 2024, size: 77, tech: 'OLED', refresh: 120, price: 124999, tags: ['2024 Serisi', 'OLED', 'Ambilight'], highlights: ['77 inç Dev OLED Panel', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },

  { model: '42OLED809/12', year: 2024, size: 42, tech: 'OLED', refresh: 120, price: 44999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['42 inç Kompakt OLED EX', '120Hz VRR', 'Ambilight 3-Taraflı'] },
  { model: '48OLED809/12', year: 2024, size: 48, tech: 'OLED', refresh: 120, price: 51999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['48 inç OLED EX', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '55OLED809/12', year: 2024, size: 55, tech: 'OLED', refresh: 120, price: 59999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['55 inç OLED EX', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED809/12', year: 2024, size: 65, tech: 'OLED', refresh: 120, price: 79999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['65 inç OLED EX', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '77OLED809/12', year: 2024, size: 77, tech: 'OLED', refresh: 120, price: 129999, tags: ['2024 Serisi', 'OLED EX', 'Ambilight'], highlights: ['77 inç Dev OLED EX', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },

  { model: '42PFL6574/F7', year: 2024, size: 42, tech: 'LED', refresh: 60, price: 17999, tags: ['2024 Serisi', 'Full HD Smart'], highlights: ['42 inç Full HD Smart TV', 'Google TV', 'İnce Gövde'] },
  { model: '32PFL4674/F7', year: 2024, size: 32, tech: 'LED', refresh: 60, price: 12999, tags: ['2024 Serisi', 'HD Smart'], highlights: ['32 inç HD Smart TV', 'Google TV', 'Kompakt'] },

  { model: '43PUS8389/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 20999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Pixel Precise HD'] },
  { model: '50PUS8389/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 24999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Pixel Precise HD'] },
  { model: '55PUS8389/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 29999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Pixel Precise HD'] },
  { model: '65PUS8389/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 41999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Pixel Precise HD'] },

  { model: '43PUS8359/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 19999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Dolby Audio'] },
  { model: '50PUS8359/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 23999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Dolby Audio'] },
  { model: '55PUS8359/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 28999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Dolby Audio'] },
  { model: '65PUS8359/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 39999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Dolby Audio'] },

  { model: '43PUS8309/12', year: 2024, size: 43, tech: 'LED', refresh: 60, price: 18999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Titan OS'] },
  { model: '50PUS8309/12', year: 2024, size: 50, tech: 'LED', refresh: 60, price: 22999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Titan OS'] },
  { model: '55PUS8309/12', year: 2024, size: 55, tech: 'LED', refresh: 60, price: 27999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Titan OS'] },
  { model: '65PUS8309/12', year: 2024, size: 65, tech: 'LED', refresh: 60, price: 38999, tags: ['2024 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Titan OS'] },
  { model: '75PUS8309/12', year: 2024, size: 75, tech: 'LED', refresh: 60, price: 57999, tags: ['2024 Serisi', '4K Dev Ambilight'], highlights: ['75 inç 4K Dev Ambilight', 'Ambilight 3-Taraflı', 'Titan OS'] },

  // --- 2023 PHILIPS CATALOG MODELS (45 ITEMS FROM 2023 IMAGE) ---
  { model: '32PFL6573/F7', year: 2023, size: 32, tech: 'LED', refresh: 60, price: 10999, tags: ['2023 Serisi', 'Full HD Smart'], highlights: ['32 inç Full HD Smart TV', 'Google TV', 'Pixel Plus HD'] },
  { model: '65PUS8008/12', year: 2023, size: 65, tech: 'LED', refresh: 60, price: 34999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },
  { model: '75PUS8008/12', year: 2023, size: 75, tech: 'LED', refresh: 60, price: 49999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['75 inç 4K Dev Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },

  { model: '55OLED908/12', year: 2023, size: 55, tech: 'QD-OLED', refresh: 120, price: 74999, tags: ['2023 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 3-Side'], highlights: ['55 inç OLED+ META Panel', 'Bowers & Wilkins 80W Ses', 'Ambilight 3-Taraflı'] },
  { model: '65OLED908/12', year: 2023, size: 65, tech: 'QD-OLED', refresh: 120, price: 104999, tags: ['2023 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 3-Side'], highlights: ['65 inç OLED+ META Panel', 'Bowers & Wilkins 80W Ses', 'Ambilight 3-Taraflı'] },
  { model: '77OLED908/12', year: 2023, size: 77, tech: 'QD-OLED', refresh: 120, price: 154999, tags: ['2023 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 3-Side'], highlights: ['77 inç Dev OLED+ META Panel', 'Bowers & Wilkins 95W Ses', 'Ambilight 3-Taraflı'] },

  { model: '55PML9308/12', year: 2023, size: 55, tech: 'Mini-LED', refresh: 120, price: 42999, tags: ['2023 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Mini-LED', 'Bowers & Wilkins Ses', 'Ambilight 3-Taraflı'] },
  { model: '65PML9308/12', year: 2023, size: 65, tech: 'Mini-LED', refresh: 120, price: 59999, tags: ['2023 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Mini-LED', 'Bowers & Wilkins Ses', 'Ambilight 3-Taraflı'] },

  { model: '55PML9008/12', year: 2023, size: 55, tech: 'Mini-LED', refresh: 120, price: 38999, tags: ['2023 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Mini-LED', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65PML9008/12', year: 2023, size: 65, tech: 'Mini-LED', refresh: 120, price: 54999, tags: ['2023 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Mini-LED', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '75PML9008/12', year: 2023, size: 75, tech: 'Mini-LED', refresh: 120, price: 74999, tags: ['2023 Serisi', 'The Xtra', 'Mini-LED'], highlights: ['Philips "The Xtra" Dev Mini-LED', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8108/12', year: 2023, size: 43, tech: 'LED', refresh: 60, price: 16999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },
  { model: '50PUS8108/12', year: 2023, size: 50, tech: 'LED', refresh: 60, price: 20999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },
  { model: '55PUS8108/12', year: 2023, size: 55, tech: 'LED', refresh: 60, price: 24999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },
  { model: '65PUS8108/12', year: 2023, size: 65, tech: 'LED', refresh: 60, price: 34999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },
  { model: '70PUS8108/12', year: 2023, size: 70, tech: 'LED', refresh: 60, price: 42999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['70 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },
  { model: '75PUS8108/12', year: 2023, size: 75, tech: 'LED', refresh: 60, price: 51999, tags: ['2023 Serisi', '4K Ambilight'], highlights: ['75 inç 4K Dev Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },

  { model: '43PUS8508/12', year: 2023, size: 43, tech: 'LED', refresh: 60, price: 22999, tags: ['2023 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 4K Smart TV', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8508/12', year: 2023, size: 50, tech: 'LED', refresh: 60, price: 27999, tags: ['2023 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 50 inç', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8508/12', year: 2023, size: 55, tech: 'LED', refresh: 60, price: 32999, tags: ['2023 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 55 inç', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8508/12', year: 2023, size: 65, tech: 'LED', refresh: 60, price: 46999, tags: ['2023 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 65 inç', 'Google TV', 'Ambilight 3-Taraflı'] },

  { model: '42OLED808/12', year: 2023, size: 42, tech: 'OLED', refresh: 120, price: 39999, tags: ['2023 Serisi', 'OLED EX', 'Ambilight'], highlights: ['42 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '48OLED808/12', year: 2023, size: 48, tech: 'OLED', refresh: 120, price: 46999, tags: ['2023 Serisi', 'OLED EX', 'Ambilight'], highlights: ['48 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '55OLED808/12', year: 2023, size: 55, tech: 'OLED', refresh: 120, price: 54999, tags: ['2023 Serisi', 'OLED EX', 'Ambilight'], highlights: ['55 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED808/12', year: 2023, size: 65, tech: 'OLED', refresh: 120, price: 74999, tags: ['2023 Serisi', 'OLED EX', 'Ambilight'], highlights: ['65 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '77OLED808/12', year: 2023, size: 77, tech: 'OLED', refresh: 120, price: 119999, tags: ['2023 Serisi', 'OLED EX', 'Ambilight'], highlights: ['77 inç Dev OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },

  { model: '48OLED708/12', year: 2023, size: 48, tech: 'OLED', refresh: 120, price: 42999, tags: ['2023 Serisi', 'OLED', 'Ambilight'], highlights: ['48 inç OLED 4K TV', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '55OLED708/12', year: 2023, size: 55, tech: 'OLED', refresh: 120, price: 49999, tags: ['2023 Serisi', 'OLED', 'Ambilight'], highlights: ['55 inç OLED 4K TV', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },
  { model: '65OLED708/12', year: 2023, size: 65, tech: 'OLED', refresh: 120, price: 68999, tags: ['2023 Serisi', 'OLED', 'Ambilight'], highlights: ['65 inç OLED 4K TV', 'Dolby Vision & Atmos', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8808/12', year: 2023, size: 43, tech: 'LED', refresh: 120, price: 25999, tags: ['2023 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 120Hz VRR', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8808/12', year: 2023, size: 50, tech: 'LED', refresh: 120, price: 30999, tags: ['2023 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 50 inç 120Hz', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8808/12', year: 2023, size: 55, tech: 'LED', refresh: 120, price: 36999, tags: ['2023 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 55 inç 120Hz', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8808/12', year: 2023, size: 65, tech: 'LED', refresh: 120, price: 51999, tags: ['2023 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 65 inç 120Hz', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8808/12', year: 2023, size: 75, tech: 'LED', refresh: 120, price: 71999, tags: ['2023 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 75 inç 120Hz', 'Google TV', 'Ambilight 3-Taraflı'] },
  { model: '85PUS8808/12', year: 2023, size: 85, tech: 'LED', refresh: 120, price: 99999, tags: ['2023 Serisi', 'The One', '120Hz', 'Ambilight', '85 inç'], highlights: ['Philips "The One" 85 inç Giant 120Hz', 'Google TV', 'Ambilight 3-Taraflı'] },

  { model: '55PUS7008/12', year: 2023, size: 55, tech: 'LED', refresh: 60, price: 21999, tags: ['2023 Serisi', '4K LED'], highlights: ['55 inç 4K Ultra HD', 'Pixel Precise HD Engine', 'Smart TV'] },
  { model: '65PUS7008/12', year: 2023, size: 65, tech: 'LED', refresh: 60, price: 31999, tags: ['2023 Serisi', '4K LED'], highlights: ['65 inç 4K Ultra HD', 'Pixel Precise HD Engine', 'Smart TV'] },
  { model: '32PFS6908/12', year: 2023, size: 32, tech: 'LED', refresh: 60, price: 12999, tags: ['2023 Serisi', 'Full HD Ambilight'], highlights: ['32 inç Full HD Ambilight', 'Ambilight 3-Taraflı', 'Smart TV'] },

  { model: '43PUS7608/12', year: 2023, size: 43, tech: 'LED', refresh: 60, price: 14999, tags: ['2023 Serisi', '4K LED'], highlights: ['43 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '50PUS7608/12', year: 2023, size: 50, tech: 'LED', refresh: 60, price: 18999, tags: ['2023 Serisi', '4K LED'], highlights: ['50 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '55PUS7608/12', year: 2023, size: 55, tech: 'LED', refresh: 60, price: 22999, tags: ['2023 Serisi', '4K LED'], highlights: ['55 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '65PUS7608/12', year: 2023, size: 65, tech: 'LED', refresh: 60, price: 32999, tags: ['2023 Serisi', '4K LED'], highlights: ['65 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '70PUS7608/12', year: 2023, size: 70, tech: 'LED', refresh: 60, price: 41999, tags: ['2023 Serisi', '4K LED'], highlights: ['70 inç 4K Ultra HD', 'Dolby Audio', 'Smart TV'] },
  { model: '75PUS7608/12', year: 2023, size: 75, tech: 'LED', refresh: 60, price: 48999, tags: ['2023 Serisi', '4K LED'], highlights: ['75 inç 4K Dev Ekran', 'Dolby Audio', 'Smart TV'] },
  { model: '24PHS6808/12', year: 2023, size: 24, tech: 'LED', refresh: 60, price: 8999, tags: ['2023 Serisi', 'HD'], highlights: ['24 inç Kompakt HD TV', 'Pixel Plus HD', 'Smart TV'] },

  // --- NEWEST 2023 CATALOG IMAGE MODELS (15 ITEMS) ---
  { model: '32PHS6808/12', year: 2023, size: 32, tech: 'LED', refresh: 60, price: 11999, tags: ['2023 Serisi', 'HD Smart'], highlights: ['32 inç HD Smart TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '43PFS6808/12', year: 2023, size: 43, tech: 'LED', refresh: 60, price: 15999, tags: ['2023 Serisi', 'Full HD Smart'], highlights: ['43 inç Full HD Smart TV', 'Pixel Plus HD', 'Smart TV'] },

  { model: '43PUL6673/F7', year: 2023, size: 43, tech: 'LED', refresh: 60, price: 15999, tags: ['2023 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'Pixel Precise HD', 'Google TV'] },
  { model: '50PUL6673/F7', year: 2023, size: 50, tech: 'LED', refresh: 60, price: 19999, tags: ['2023 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Pixel Precise HD', 'Google TV'] },
  { model: '55PUL6673/F7', year: 2023, size: 55, tech: 'LED', refresh: 60, price: 23999, tags: ['2023 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Pixel Precise HD', 'Google TV'] },
  { model: '65PUL6673/F7', year: 2023, size: 65, tech: 'LED', refresh: 60, price: 34999, tags: ['2023 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'Pixel Precise HD', 'Google TV'] },
  { model: '75PUL6673/F7', year: 2023, size: 75, tech: 'LED', refresh: 60, price: 49999, tags: ['2023 Serisi', '4K Smart'], highlights: ['75 inç 4K Dev Ekran', 'Pixel Precise HD', 'Google TV'] },

  { model: '32PFL6473/F7', year: 2023, size: 32, tech: 'LED', refresh: 60, price: 11999, tags: ['2023 Serisi', 'Full HD Smart'], highlights: ['32 inç Full HD Smart TV', 'Google TV', 'İnce Çerçeve'] },

  { model: '50PUL6573/F7', year: 2023, size: 50, tech: 'LED', refresh: 60, price: 19999, tags: ['2023 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Roku / Smart OS', 'HDR10'] },
  { model: '55PUL6573/F7', year: 2023, size: 55, tech: 'LED', refresh: 60, price: 23999, tags: ['2023 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Roku / Smart OS', 'HDR10'] },
  { model: '65PUL6573/F7', year: 2023, size: 65, tech: 'LED', refresh: 60, price: 34999, tags: ['2023 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'Roku / Smart OS', 'HDR10'] },

  { model: '50PUL7973/F7', year: 2023, size: 50, tech: 'QLED', refresh: 60, price: 24999, tags: ['2023 Serisi', 'QLED 4K'], highlights: ['50 inç QLED 4K Ultra HD', 'Google TV', 'Dolby Vision'] },
  { model: '55PUL7973/F7', year: 2023, size: 55, tech: 'QLED', refresh: 60, price: 29999, tags: ['2023 Serisi', 'QLED 4K'], highlights: ['55 inç QLED 4K Ultra HD', 'Google TV', 'Dolby Vision'] },
  { model: '65PUL7973/F7', year: 2023, size: 65, tech: 'QLED', refresh: 60, price: 42999, tags: ['2023 Serisi', 'QLED 4K'], highlights: ['65 inç QLED 4K Ultra HD', 'Google TV', 'Dolby Vision'] },
  { model: '75PUL7973/F7', year: 2023, size: 75, tech: 'QLED', refresh: 60, price: 61999, tags: ['2023 Serisi', 'QLED 4K'], highlights: ['75 inç QLED 4K Dev Ekran', 'Google TV', 'Dolby Vision'] },

  // --- 2022 PHILIPS CATALOG MODELS (45 ITEMS FROM 2022 IMAGE) ---
  { model: '32PFL4756', year: 2022, size: 32, tech: 'LED', refresh: 60, price: 8999, tags: ['2022 Serisi', 'Smart TV'], highlights: ['32 inç Smart TV', 'Android TV', 'Pixel Plus HD'] },
  { model: '40PFL4775', year: 2022, size: 40, tech: 'LED', refresh: 60, price: 11999, tags: ['2022 Serisi', 'Full HD'], highlights: ['40 inç Full HD Smart TV', 'Android TV', 'Smart TV'] },
  { model: '43PFL4775', year: 2022, size: 43, tech: 'LED', refresh: 60, price: 13999, tags: ['2022 Serisi', 'Full HD'], highlights: ['43 inç Full HD Smart TV', 'Android TV', 'Smart TV'] },
  { model: '50PFL5756', year: 2022, size: 50, tech: 'LED', refresh: 60, price: 17999, tags: ['2022 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Android TV', 'HDR10'] },
  { model: '55PFL5756', year: 2022, size: 55, tech: 'LED', refresh: 60, price: 21999, tags: ['2022 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Android TV', 'HDR10'] },
  { model: '43PUL7672', year: 2022, size: 43, tech: 'LED', refresh: 60, price: 14999, tags: ['2022 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'Google TV / Roku', 'Smart TV'] },
  { model: '70PFL5656', year: 2022, size: 70, tech: 'LED', refresh: 60, price: 34999, tags: ['2022 Serisi', '4K Dev Ekran'], highlights: ['70 inç 4K Ultra HD Dev Ekran', 'Android TV', 'HDR10'] },

  { model: '48OLED907/12', year: 2022, size: 48, tech: 'QD-OLED', refresh: 120, price: 49999, tags: ['2022 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['48 inç OLED+ Amiral Gemisi', 'Bowers & Wilkins 80W Ses', 'Ambilight 4-Taraflı'] },
  { model: '55OLED907/12', year: 2022, size: 55, tech: 'QD-OLED', refresh: 120, price: 64999, tags: ['2022 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['55 inç OLED+ Amiral Gemisi', 'Bowers & Wilkins 80W Ses', 'Ambilight 4-Taraflı'] },
  { model: '65OLED907/12', year: 2022, size: 65, tech: 'QD-OLED', refresh: 120, price: 89999, tags: ['2022 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ Amiral Gemisi', 'Bowers & Wilkins 80W Ses', 'Ambilight 4-Taraflı'] },
  { model: '65OLED937/12', year: 2022, size: 65, tech: 'QD-OLED', refresh: 120, price: 99999, tags: ['2022 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ Bowers & Wilkins 95W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },
  { model: '77OLED937/12', year: 2022, size: 77, tech: 'QD-OLED', refresh: 120, price: 144999, tags: ['2022 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['77 inç Dev OLED+ Bowers & Wilkins 95W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },

  { model: '43PUS8007/12', year: 2022, size: 43, tech: 'LED', refresh: 60, price: 14999, tags: ['2022 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Android TV'] },
  { model: '50PUS8007/12', year: 2022, size: 50, tech: 'LED', refresh: 60, price: 18999, tags: ['2022 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Android TV'] },
  { model: '55PUS8007/12', year: 2022, size: 55, tech: 'LED', refresh: 60, price: 22999, tags: ['2022 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Android TV'] },
  { model: '65PUS8007/12', year: 2022, size: 65, tech: 'LED', refresh: 60, price: 31999, tags: ['2022 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Android TV'] },
  { model: '70PUS8007/12', year: 2022, size: 70, tech: 'LED', refresh: 60, price: 39999, tags: ['2022 Serisi', '4K Ambilight'], highlights: ['70 inç 4K Ambilight', 'Ambilight 3-Taraflı', 'Android TV'] },
  { model: '75PUS8007/12', year: 2022, size: 75, tech: 'LED', refresh: 60, price: 47999, tags: ['2022 Serisi', '4K Ambilight'], highlights: ['75 inç 4K Dev Ambilight', 'Ambilight 3-Taraflı', 'Android TV'] },

  { model: '50PUL7552', year: 2022, size: 50, tech: 'LED', refresh: 60, price: 17999, tags: ['2022 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Roku Smart TV', 'HDR10'] },
  { model: '55PUL7552', year: 2022, size: 55, tech: 'LED', refresh: 60, price: 21999, tags: ['2022 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Roku Smart TV', 'HDR10'] },
  { model: '65PUL7552', year: 2022, size: 65, tech: 'LED', refresh: 60, price: 31999, tags: ['2022 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'Roku Smart TV', 'HDR10'] },
  { model: '75PUL7552', year: 2022, size: 75, tech: 'LED', refresh: 60, price: 46999, tags: ['2022 Serisi', '4K Smart'], highlights: ['75 inç 4K Dev Ekran', 'Roku Smart TV', 'HDR10'] },

  { model: '43PUS7607/12', year: 2022, size: 43, tech: 'LED', refresh: 60, price: 13999, tags: ['2022 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'Dolby Vision', 'Smart TV'] },
  { model: '50PUS7607/12', year: 2022, size: 50, tech: 'LED', refresh: 60, price: 17999, tags: ['2022 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Dolby Vision', 'Smart TV'] },
  { model: '55PUS7607/12', year: 2022, size: 55, tech: 'LED', refresh: 60, price: 21999, tags: ['2022 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Dolby Vision', 'Smart TV'] },
  { model: '65PUS7607/12', year: 2022, size: 65, tech: 'LED', refresh: 60, price: 29999, tags: ['2022 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'Dolby Vision', 'Smart TV'] },
  { model: '70PUS7607/12', year: 2022, size: 70, tech: 'LED', refresh: 60, price: 37999, tags: ['2022 Serisi', '4K Smart'], highlights: ['70 inç 4K Ultra HD', 'Dolby Vision', 'Smart TV'] },

  { model: '32PFL6452/F7', year: 2022, size: 32, tech: 'LED', refresh: 60, price: 9999, tags: ['2022 Serisi', 'Full HD Smart'], highlights: ['32 inç Full HD Smart TV', 'Roku / Smart TV', 'Kompakt'] },
  { model: '24PHS5537/12', year: 2022, size: 24, tech: 'LED', refresh: 60, price: 7999, tags: ['2022 Serisi', 'HD'], highlights: ['24 inç Kompakt HD TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '32PHS5507/12', year: 2022, size: 32, tech: 'LED', refresh: 60, price: 9999, tags: ['2022 Serisi', 'HD'], highlights: ['32 inç HD TV', 'Pixel Plus HD', 'Kompakt'] },
  { model: '43PHS5507/12', year: 2022, size: 43, tech: 'LED', refresh: 60, price: 12999, tags: ['2022 Serisi', 'HD'], highlights: ['43 inç HD TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '55PUL7472/F7', year: 2022, size: 55, tech: 'LED', refresh: 60, price: 21999, tags: ['2022 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Google TV', 'HDR10'] },
  { model: '65PUL7472/F7', year: 2022, size: 65, tech: 'LED', refresh: 60, price: 30999, tags: ['2022 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'Google TV', 'HDR10'] },
  { model: '24PFS5507/12', year: 2022, size: 24, tech: 'LED', refresh: 60, price: 8499, tags: ['2022 Serisi', 'Full HD'], highlights: ['24 inç Kompakt Full HD', 'Pixel Plus HD', 'Smart TV'] },
  { model: '32PFS5507/12', year: 2022, size: 32, tech: 'LED', refresh: 60, price: 10999, tags: ['2022 Serisi', 'Full HD'], highlights: ['32 inç Full HD TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '43PFS5507/12', year: 2022, size: 43, tech: 'LED', refresh: 60, price: 13999, tags: ['2022 Serisi', 'Full HD'], highlights: ['43 inç Full HD TV', 'Pixel Plus HD', 'Smart TV'] },

  { model: '39PHS6707/12', year: 2022, size: 39, tech: 'LED', refresh: 60, price: 11999, tags: ['2022 Serisi', 'HD Smart'], highlights: ['39 inç HD Smart TV', 'Android TV', 'Ambilight'] },
  { model: '43PUS8507/12', year: 2022, size: 43, tech: 'LED', refresh: 60, price: 19999, tags: ['2022 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 43 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8507/12', year: 2022, size: 50, tech: 'LED', refresh: 60, price: 24999, tags: ['2022 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 50 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8507/12', year: 2022, size: 55, tech: 'LED', refresh: 60, price: 29999, tags: ['2022 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 55 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '58PUS8507/12', year: 2022, size: 58, tech: 'LED', refresh: 60, price: 32999, tags: ['2022 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 58 inç Özel Boyut', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8507/12', year: 2022, size: 65, tech: 'LED', refresh: 60, price: 41999, tags: ['2022 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 65 inç', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '48OLED707/12', year: 2022, size: 48, tech: 'OLED', refresh: 120, price: 38999, tags: ['2022 Serisi', 'OLED', 'Ambilight'], highlights: ['48 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '55OLED707/12', year: 2022, size: 55, tech: 'OLED', refresh: 120, price: 44999, tags: ['2022 Serisi', 'OLED', 'Ambilight'], highlights: ['55 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED707/12', year: 2022, size: 65, tech: 'OLED', refresh: 120, price: 61999, tags: ['2022 Serisi', 'OLED', 'Ambilight'], highlights: ['65 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },

  // --- NEWEST 2022 CATALOG IMAGE MODELS (13 ITEMS) ---
  { model: '55PML9507/12', year: 2022, size: 55, tech: 'Mini-LED', refresh: 120, price: 39999, tags: ['2022 Serisi', 'Mini-LED', '120Hz', 'Ambilight 4-Side'], highlights: ['55 inç Mini-LED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '65PML9507/12', year: 2022, size: 65, tech: 'Mini-LED', refresh: 120, price: 54999, tags: ['2022 Serisi', 'Mini-LED', '120Hz', 'Ambilight 4-Side'], highlights: ['65 inç Mini-LED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '75PML9507/12', year: 2022, size: 75, tech: 'Mini-LED', refresh: 120, price: 74999, tags: ['2022 Serisi', 'Mini-LED', '120Hz', 'Ambilight 4-Side'], highlights: ['75 inç Dev Mini-LED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },

  { model: '43PUS8807/12', year: 2022, size: 43, tech: 'LED', refresh: 120, price: 21999, tags: ['2022 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 43 inç 120Hz VRR', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8807/12', year: 2022, size: 50, tech: 'LED', refresh: 120, price: 26999, tags: ['2022 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 50 inç 120Hz VRR', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8807/12', year: 2022, size: 55, tech: 'LED', refresh: 120, price: 31999, tags: ['2022 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 55 inç 120Hz VRR', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8807/12', year: 2022, size: 65, tech: 'LED', refresh: 120, price: 44999, tags: ['2022 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 65 inç 120Hz VRR', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8807/12', year: 2022, size: 75, tech: 'LED', refresh: 120, price: 64999, tags: ['2022 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 75 inç 120Hz VRR', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '86PUS8807/12', year: 2022, size: 86, tech: 'LED', refresh: 120, price: 94999, tags: ['2022 Serisi', 'The One', '120Hz', 'Ambilight', '86 inç'], highlights: ['Philips "The One" 86 inç Giant 120Hz VRR', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '48OLED807/12', year: 2022, size: 48, tech: 'OLED', refresh: 120, price: 42999, tags: ['2022 Serisi', 'OLED EX', 'Ambilight 4-Side'], highlights: ['48 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '55OLED807/12', year: 2022, size: 55, tech: 'OLED', refresh: 120, price: 49999, tags: ['2022 Serisi', 'OLED EX', 'Ambilight 4-Side'], highlights: ['55 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '65OLED807/12', year: 2022, size: 65, tech: 'OLED', refresh: 120, price: 69999, tags: ['2022 Serisi', 'OLED EX', 'Ambilight 4-Side'], highlights: ['65 inç OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '77OLED807/12', year: 2022, size: 77, tech: 'OLED', refresh: 120, price: 114999, tags: ['2022 Serisi', 'OLED EX', 'Ambilight 4-Side'], highlights: ['77 inç Dev OLED EX 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },

  // --- 2021 PHILIPS CATALOG MODELS (45 ITEMS FROM 2021 IMAGE) ---
  { model: '43PFL5766/F7', year: 2021, size: 43, tech: 'LED', refresh: 60, price: 12999, tags: ['2021 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'Android TV', 'HDR10'] },
  { model: '65OLED986/12', year: 2021, size: 65, tech: 'QD-OLED', refresh: 120, price: 89999, tags: ['2021 Serisi', 'OLED+', 'Bowers & Wilkins', 'Amiral Gemisi'], highlights: ['65 inç OLED+ Bowers & Wilkins 3.0.2 102W', 'Ambilight 4-Taraflı', 'P5 AI Dual Engine'] },

  { model: '32PFS6906/12', year: 2021, size: 32, tech: 'LED', refresh: 60, price: 9999, tags: ['2021 Serisi', 'Full HD Ambilight'], highlights: ['32 inç Full HD Ambilight', 'Ambilight 3-Taraflı', 'Android TV'] },
  { model: '32PFS6805/12', year: 2021, size: 32, tech: 'LED', refresh: 60, price: 8999, tags: ['2021 Serisi', 'Full HD'], highlights: ['32 inç Full HD Smart TV', 'Pixel Plus HD', 'Smart TV'] },
  { model: '32PFL5505/F7', year: 2021, size: 32, tech: 'LED', refresh: 60, price: 7999, tags: ['2021 Serisi', 'HD'], highlights: ['32 inç HD Smart TV', 'Android TV', 'Kompakt'] },
  { model: '24PFL4664/F7', year: 2021, size: 24, tech: 'LED', refresh: 60, price: 5999, tags: ['2021 Serisi', 'HD'], highlights: ['24 inç Kompakt HD TV', 'Smart TV', 'Kompakt'] },
  { model: '32PFL4664/F7', year: 2021, size: 32, tech: 'LED', refresh: 60, price: 7499, tags: ['2021 Serisi', 'HD'], highlights: ['32 inç HD Smart TV', 'Smart TV', 'Kompakt'] },
  { model: '24PFL4764/F7', year: 2021, size: 24, tech: 'LED', refresh: 60, price: 6499, tags: ['2021 Serisi', 'HD'], highlights: ['24 inç HD Smart TV', 'Entegre Bluetooth Hoparlör', 'Kompakt'] },
  { model: '50PFL5806/F7', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 15999, tags: ['2021 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Android TV', 'HDR10'] },

  { model: '48OLED936/12', year: 2021, size: 48, tech: 'QD-OLED', refresh: 120, price: 44999, tags: ['2021 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['48 inç OLED+ Bowers & Wilkins 70W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },
  { model: '55OLED936/12', year: 2021, size: 55, tech: 'QD-OLED', refresh: 120, price: 57999, tags: ['2021 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['55 inç OLED+ Bowers & Wilkins 70W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },
  { model: '65OLED936/12', year: 2021, size: 65, tech: 'QD-OLED', refresh: 120, price: 79999, tags: ['2021 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ Bowers & Wilkins 70W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },

  { model: '55OLED856/12', year: 2021, size: 55, tech: 'OLED', refresh: 120, price: 46999, tags: ['2021 Serisi', 'OLED', 'Ambilight 4-Side'], highlights: ['55 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '65OLED856/12', year: 2021, size: 65, tech: 'OLED', refresh: 120, price: 64999, tags: ['2021 Serisi', 'OLED', 'Ambilight 4-Side'], highlights: ['65 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },

  { model: '50PUS9006/12', year: 2021, size: 50, tech: 'LED', refresh: 120, price: 21999, tags: ['2021 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 120Hz', 'Android TV', 'Ambilight 4-Taraflı'] },
  { model: '58PUS9006/12', year: 2021, size: 58, tech: 'LED', refresh: 120, price: 26999, tags: ['2021 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 58 inç Özel Boyut 120Hz', 'Android TV', 'Ambilight 4-Taraflı'] },
  { model: '70PUS9006/12', year: 2021, size: 70, tech: 'LED', refresh: 120, price: 37999, tags: ['2021 Serisi', 'The One', '120Hz', 'Ambilight'], highlights: ['Philips "The One" 70 inç 120Hz', 'Android TV', 'Ambilight 4-Taraflı'] },
  { model: '42PFL7406K/12', year: 2021, size: 42, tech: 'LED', refresh: 60, price: 11999, tags: ['2021 Serisi', '4K Smart'], highlights: ['42 inç 4K Ultra HD', 'Android TV', 'HDR10+'] },

  { model: '43PUS7406/12', year: 2021, size: 43, tech: 'LED', refresh: 60, price: 11999, tags: ['2021 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'Android TV', 'Dolby Vision'] },
  { model: '50PUS7406/12', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 14999, tags: ['2021 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Android TV', 'Dolby Vision'] },
  { model: '55PUS7406/12', year: 2021, size: 55, tech: 'LED', refresh: 60, price: 18999, tags: ['2021 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Android TV', 'Dolby Vision'] },
  { model: '65PUS7406/12', year: 2021, size: 65, tech: 'LED', refresh: 60, price: 26999, tags: ['2021 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'Android TV', 'Dolby Vision'] },

  { model: '43PUS7506/12', year: 2021, size: 43, tech: 'LED', refresh: 60, price: 11499, tags: ['2021 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'SAPHI Smart OS', 'Dolby Vision'] },
  { model: '50PUS7506/12', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 14499, tags: ['2021 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'SAPHI Smart OS', 'Dolby Vision'] },
  { model: '55PUS7506/12', year: 2021, size: 55, tech: 'LED', refresh: 60, price: 17999, tags: ['2021 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'SAPHI Smart OS', 'Dolby Vision'] },
  { model: '65PUS7506/12', year: 2021, size: 65, tech: 'LED', refresh: 60, price: 25999, tags: ['2021 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'SAPHI Smart OS', 'Dolby Vision'] },

  { model: '55OLED705/12', year: 2021, size: 55, tech: 'OLED', refresh: 120, price: 38999, tags: ['2021 Serisi', 'OLED', 'Ambilight'], highlights: ['55 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED705/12', year: 2021, size: 65, tech: 'OLED', refresh: 120, price: 54999, tags: ['2021 Serisi', 'OLED', 'Ambilight'], highlights: ['65 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8106/12', year: 2021, size: 43, tech: 'LED', refresh: 60, price: 13999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8106/12', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 16999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '55PUS8106/12', year: 2021, size: 55, tech: 'LED', refresh: 60, price: 20999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8106/12', year: 2021, size: 65, tech: 'LED', refresh: 60, price: 28999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '50PFL4756/F7', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 14999, tags: ['2021 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'Android TV', 'HDR10'] },
  { model: '55PFL4756/F7', year: 2021, size: 55, tech: 'LED', refresh: 60, price: 17999, tags: ['2021 Serisi', '4K Smart'], highlights: ['55 inç 4K Ultra HD', 'Android TV', 'HDR10'] },
  { model: '65PFL4756/F7', year: 2021, size: 65, tech: 'LED', refresh: 60, price: 25999, tags: ['2021 Serisi', '4K Smart'], highlights: ['65 inç 4K Ultra HD', 'Android TV', 'HDR10'] },
  { model: '75PFL4756/F7', year: 2021, size: 75, tech: 'LED', refresh: 60, price: 39999, tags: ['2021 Serisi', '4K Dev Ekran'], highlights: ['75 inç 4K Ultra HD Dev Ekran', 'Android TV', 'HDR10'] },

  { model: '43PUS7906/12', year: 2021, size: 43, tech: 'LED', refresh: 60, price: 12999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS7906/12', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 15999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '55PUS7906/12', year: 2021, size: 55, tech: 'LED', refresh: 60, price: 19999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS7906/12', year: 2021, size: 65, tech: 'LED', refresh: 60, price: 27999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '70PUS7906/12', year: 2021, size: 70, tech: 'LED', refresh: 60, price: 34999, tags: ['2021 Serisi', '4K Ambilight'], highlights: ['70 inç 4K Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '75PUS7906/12', year: 2021, size: 75, tech: 'LED', refresh: 60, price: 42999, tags: ['2021 Serisi', '4K Dev Ambilight'], highlights: ['75 inç 4K Dev Ambilight', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '65OLED806/12', year: 2021, size: 65, tech: 'OLED', refresh: 120, price: 58999, tags: ['2021 Serisi', 'OLED', 'Ambilight 4-Side'], highlights: ['65 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },

  // --- NEWEST 2021 CATALOG IMAGE MODELS (25 ITEMS) ---
  { model: '77OLED806/12', year: 2021, size: 77, tech: 'OLED', refresh: 120, price: 99999, tags: ['2021 Serisi', 'OLED', 'Ambilight 4-Side'], highlights: ['77 inç Dev OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },

  { model: '55PUS9206/12', year: 2021, size: 55, tech: 'LED', refresh: 120, price: 23999, tags: ['2021 Serisi', '120Hz', 'Ambilight 4-Side'], highlights: ['55 inç 4K 120Hz VRR', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '65PUS9206/12', year: 2021, size: 65, tech: 'LED', refresh: 120, price: 32999, tags: ['2021 Serisi', '120Hz', 'Ambilight 4-Side'], highlights: ['65 inç 4K 120Hz VRR', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },

  { model: '43PUS8536/12', year: 2021, size: 43, tech: 'LED', refresh: 60, price: 15999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 43 inç Premium Stand', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8536/12', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 19999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 50 inç Premium Stand', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '58PUS8536/12', year: 2021, size: 58, tech: 'LED', refresh: 60, price: 23999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 58 inç Özel Boyut', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8536/12', year: 2021, size: 65, tech: 'LED', refresh: 60, price: 31999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 65 inç Premium Stand', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '70PUS8536/12', year: 2021, size: 70, tech: 'LED', refresh: 60, price: 39999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 70 inç Premium Stand', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8536/12', year: 2021, size: 75, tech: 'LED', refresh: 60, price: 47999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 75 inç Dev Ekran', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8506/12', year: 2021, size: 43, tech: 'LED', refresh: 60, price: 14999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 43 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8506/12', year: 2021, size: 50, tech: 'LED', refresh: 60, price: 18999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 50 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '58PUS8506/12', year: 2021, size: 58, tech: 'LED', refresh: 60, price: 22999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 58 inç Özel Boyut', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8506/12', year: 2021, size: 65, tech: 'LED', refresh: 60, price: 29999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 65 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '70PUS8506/12', year: 2021, size: 70, tech: 'LED', refresh: 60, price: 37999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 70 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8506/12', year: 2021, size: 75, tech: 'LED', refresh: 60, price: 44999, tags: ['2021 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 75 inç Dev Ekran', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '55OLED706/12', year: 2021, size: 55, tech: 'OLED', refresh: 120, price: 36999, tags: ['2021 Serisi', 'OLED', '120Hz', 'Ambilight'], highlights: ['55 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED706/12', year: 2021, size: 65, tech: 'OLED', refresh: 120, price: 52999, tags: ['2021 Serisi', 'OLED', '120Hz', 'Ambilight'], highlights: ['65 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },

  { model: '65PML9636/12', year: 2021, size: 65, tech: 'Mini-LED', refresh: 120, price: 64999, tags: ['2021 Serisi', 'Mini-LED', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['65 inç Mini-LED Bowers & Wilkins 70W', 'P5 AI Dual Engine', 'Ambilight 4-Taraflı'] },
  { model: '75PML9636/12', year: 2021, size: 75, tech: 'Mini-LED', refresh: 120, price: 89999, tags: ['2021 Serisi', 'Mini-LED', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['75 inç Dev Mini-LED Bowers & Wilkins 70W', 'P5 AI Dual Engine', 'Ambilight 4-Taraflı'] },

  { model: '65PML9506/12', year: 2021, size: 65, tech: 'Mini-LED', refresh: 120, price: 54999, tags: ['2021 Serisi', 'Mini-LED', '120Hz', 'Ambilight 4-Side'], highlights: ['65 inç Mini-LED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },
  { model: '75PML9506/12', year: 2021, size: 75, tech: 'Mini-LED', refresh: 120, price: 79999, tags: ['2021 Serisi', 'Mini-LED', '120Hz', 'Ambilight 4-Side'], highlights: ['75 inç Dev Mini-LED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 4-Taraflı'] },

  // --- 2020 PHILIPS CATALOG MODELS (42 ITEMS FROM 2020 IMAGE) ---
  { model: '32PFL4764', year: 2020, size: 32, tech: 'LED', refresh: 60, price: 6999, tags: ['2020 Serisi', 'HD Smart'], highlights: ['32 inç HD Smart TV', 'Roku / Smart OS', 'Kompakt'] },
  { model: '48OLED935/12', year: 2020, size: 48, tech: 'QD-OLED', refresh: 120, price: 39999, tags: ['2020 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['48 inç OLED+ Bowers & Wilkins 70W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },
  { model: '55OLED935/12', year: 2020, size: 55, tech: 'QD-OLED', refresh: 120, price: 49999, tags: ['2020 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['55 inç OLED+ Bowers & Wilkins 70W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },
  { model: '65OLED935/12', year: 2020, size: 65, tech: 'QD-OLED', refresh: 120, price: 69999, tags: ['2020 Serisi', 'OLED+', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['65 inç OLED+ Bowers & Wilkins 70W', 'Ambilight 4-Taraflı', 'Dolby Vision'] },

  { model: '32PHT5505/12', year: 2020, size: 32, tech: 'LED', refresh: 60, price: 6499, tags: ['2020 Serisi', 'HD'], highlights: ['32 inç HD TV', 'Pixel Plus HD', 'Kompakt'] },
  { model: '43PFT5505/12', year: 2020, size: 43, tech: 'LED', refresh: 60, price: 8999, tags: ['2020 Serisi', 'Full HD'], highlights: ['43 inç Full HD TV', 'Pixel Plus HD', 'Kompakt'] },

  { model: '50PUS9005/12', year: 2020, size: 50, tech: 'LED', refresh: 60, price: 17999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 50 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '58PUS9005/12', year: 2020, size: 58, tech: 'LED', refresh: 60, price: 21999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 58 inç Özel Boyut', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '70PUS9005/12', year: 2020, size: 70, tech: 'LED', refresh: 60, price: 32999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 70 inç Dev Ekran', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '55OLED855/12', year: 2020, size: 55, tech: 'OLED', refresh: 120, price: 39999, tags: ['2020 Serisi', 'OLED', '120Hz', 'Ambilight'], highlights: ['55 inç OLED 4K 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED855/12', year: 2020, size: 65, tech: 'OLED', refresh: 120, price: 54999, tags: ['2020 Serisi', 'OLED', '120Hz', 'Ambilight'], highlights: ['65 inç OLED 4K 120Hz', 'P5 AI Engine', 'Ambilight 3-Taraflı'] },

  { model: '24PFS5505/12', year: 2020, size: 24, tech: 'LED', refresh: 60, price: 5499, tags: ['2020 Serisi', 'Full HD'], highlights: ['24 inç Kompakt Full HD TV', 'Pixel Plus HD', 'Mutfak/Yatak Odası'] },
  { model: '32PHS5505/12', year: 2020, size: 32, tech: 'LED', refresh: 60, price: 6999, tags: ['2020 Serisi', 'HD'], highlights: ['32 inç HD TV', 'Pixel Plus HD', 'Kompakt'] },
  { model: '43PFS5505/12', year: 2020, size: 43, tech: 'LED', refresh: 60, price: 9499, tags: ['2020 Serisi', 'Full HD'], highlights: ['43 inç Full HD TV', 'Pixel Plus HD', 'Kompakt'] },

  { model: '24PHS6605/12', year: 2020, size: 24, tech: 'LED', refresh: 60, price: 5999, tags: ['2020 Serisi', 'HD Smart'], highlights: ['24 inç HD Smart TV', 'SAPHI Smart OS', 'Kompakt'] },
  { model: '32PHS6605/12', year: 2020, size: 32, tech: 'LED', refresh: 60, price: 7999, tags: ['2020 Serisi', 'HD Smart'], highlights: ['32 inç HD Smart TV', 'SAPHI Smart OS', 'Kompakt'] },
  { model: '24PFS6805/12', year: 2020, size: 24, tech: 'LED', refresh: 60, price: 6499, tags: ['2020 Serisi', 'Full HD Smart'], highlights: ['24 inç Full HD Smart TV', 'SAPHI Smart OS', 'Kompakt'] },
  { model: '32PFS6905/12', year: 2020, size: 32, tech: 'LED', refresh: 60, price: 8999, tags: ['2020 Serisi', 'Full HD Ambilight'], highlights: ['32 inç Full HD Ambilight', 'Ambilight 3-Taraflı', 'SAPHI Smart OS'] },

  { model: '32PFS6805/12', year: 2020, size: 32, tech: 'LED', refresh: 60, price: 8499, tags: ['2020 Serisi', 'Full HD Smart'], highlights: ['32 inç Full HD Smart TV', 'SAPHI Smart OS', 'Kompakt'] },
  { model: '43PFS6805/12', year: 2020, size: 43, tech: 'LED', refresh: 60, price: 10999, tags: ['2020 Serisi', 'Full HD Smart'], highlights: ['43 inç Full HD Smart TV', 'SAPHI Smart OS', 'HDR10'] },

  { model: '43PUS7505/12', year: 2020, size: 43, tech: 'LED', refresh: 60, price: 10499, tags: ['2020 Serisi', '4K Smart'], highlights: ['43 inç 4K Ultra HD', 'SAPHI Smart OS', 'Dolby Vision'] },
  { model: '50PUS7505/12', year: 2020, size: 50, tech: 'LED', refresh: 60, price: 12999, tags: ['2020 Serisi', '4K Smart'], highlights: ['50 inç 4K Ultra HD', 'SAPHI Smart OS', 'Dolby Vision'] },
  { model: '58PUS7505/12', year: 2020, size: 58, tech: 'LED', refresh: 60, price: 16999, tags: ['2020 Serisi', '4K Smart'], highlights: ['58 inç 4K Ultra HD Özel Boyut', 'SAPHI Smart OS', 'Dolby Vision'] },
  { model: '70PUS7505/12', year: 2020, size: 70, tech: 'LED', refresh: 60, price: 27999, tags: ['2020 Serisi', '4K Dev Ekran'], highlights: ['70 inç 4K Dev Ekran', 'SAPHI Smart OS', 'Dolby Vision'] },

  { model: '43PUS7805/12', year: 2020, size: 43, tech: 'LED', refresh: 60, price: 11999, tags: ['2020 Serisi', '4K Ambilight'], highlights: ['43 inç 4K Ambilight', 'SAPHI Smart OS', 'Ambilight 3-Taraflı'] },
  { model: '50PUS7805/12', year: 2020, size: 50, tech: 'LED', refresh: 60, price: 14999, tags: ['2020 Serisi', '4K Ambilight'], highlights: ['50 inç 4K Ambilight', 'SAPHI Smart OS', 'Ambilight 3-Taraflı'] },
  { model: '55PUS7805/12', year: 2020, size: 55, tech: 'LED', refresh: 60, price: 17999, tags: ['2020 Serisi', '4K Ambilight'], highlights: ['55 inç 4K Ambilight', 'SAPHI Smart OS', 'Ambilight 3-Taraflı'] },
  { model: '58PUS7805/12', year: 2020, size: 58, tech: 'LED', refresh: 60, price: 19999, tags: ['2020 Serisi', '4K Ambilight'], highlights: ['58 inç 4K Ambilight Özel Boyut', 'SAPHI Smart OS', 'Ambilight 3-Taraflı'] },
  { model: '65PUS7805/12', year: 2020, size: 65, tech: 'LED', refresh: 60, price: 25999, tags: ['2020 Serisi', '4K Ambilight'], highlights: ['65 inç 4K Ambilight', 'SAPHI Smart OS', 'Ambilight 3-Taraflı'] },
  { model: '70PUS7805/12', year: 2020, size: 70, tech: 'LED', refresh: 60, price: 31999, tags: ['2020 Serisi', '4K Ambilight'], highlights: ['70 inç 4K Ambilight', 'SAPHI Smart OS', 'Ambilight 3-Taraflı'] },
  { model: '75PUS7805/12', year: 2020, size: 75, tech: 'LED', refresh: 60, price: 38999, tags: ['2020 Serisi', '4K Dev Ambilight'], highlights: ['75 inç 4K Dev Ambilight', 'SAPHI Smart OS', 'Ambilight 3-Taraflı'] },

  { model: '43PUS8505/12', year: 2020, size: 43, tech: 'LED', refresh: 60, price: 13999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 43 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '50PUS8505/12', year: 2020, size: 50, tech: 'LED', refresh: 60, price: 16999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 50 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '58PUS8505/12', year: 2020, size: 58, tech: 'LED', refresh: 60, price: 20999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 58 inç Özel Boyut', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS8505/12', year: 2020, size: 65, tech: 'LED', refresh: 60, price: 27999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 65 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '70PUS8505/12', year: 2020, size: 70, tech: 'LED', refresh: 60, price: 34999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 70 inç', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '75PUS8505/12', year: 2020, size: 75, tech: 'LED', refresh: 60, price: 41999, tags: ['2020 Serisi', 'The One', '4K Ambilight'], highlights: ['Philips "The One" 75 inç Dev Ekran', 'Android TV', 'Ambilight 3-Taraflı'] },

  { model: '55OLED805/12', year: 2020, size: 55, tech: 'OLED', refresh: 120, price: 34999, tags: ['2020 Serisi', 'OLED', '120Hz', 'Ambilight'], highlights: ['55 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },
  { model: '65OLED805/12', year: 2020, size: 65, tech: 'OLED', refresh: 120, price: 48999, tags: ['2020 Serisi', 'OLED', '120Hz', 'Ambilight'], highlights: ['65 inç OLED 4K 120Hz', 'P5 AI Perfect Engine', 'Ambilight 3-Taraflı'] },

  { model: '43PUS9235/12', year: 2020, size: 43, tech: 'LED', refresh: 60, price: 18999, tags: ['2020 Serisi', 'Bowers & Wilkins', 'Ambilight 4-Side'], highlights: ['43 inç Bowers & Wilkins 50W Ses', 'Android TV', 'Ambilight 4-Taraflı'] },
  { model: '55PUS9435/12', year: 2020, size: 55, tech: 'LED', refresh: 60, price: 27999, tags: ['2020 Serisi', 'Bowers & Wilkins', 'Ambilight 3-Side'], highlights: ['55 inç Bowers & Wilkins 2.1.2 50W Soundbar', 'Android TV', 'Ambilight 3-Taraflı'] },
  { model: '65PUS9435/12', year: 2020, size: 65, tech: 'LED', refresh: 60, price: 38999, tags: ['2020 Serisi', 'Bowers & Wilkins', 'Ambilight 3-Side'], highlights: ['65 inç Bowers & Wilkins 2.1.2 50W Soundbar', 'Android TV', 'Ambilight 3-Taraflı'] }
];

const generatedPhilipsTVs = philipsModels.map((p) => {
  const isOled = p.tech.includes('OLED');
  const isMiniLed = p.tech.includes('Mini-LED');

  return {
    id: `philips-${p.model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    slug: `philips-${p.model.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
    name: `Philips ${p.model} ${p.size}" ${Math.round(p.size * 2.54)} Ekran ${p.tech} ${p.tags.includes('Ambilight') ? 'Ambilight ' : ''}Smart TV (${p.year})`,
    brand: 'Philips',
    category: 'tvs',
    image: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    rating: isOled ? 5.0 : isMiniLed ? 4.9 : 4.8,
    reviewCount: Math.floor(Math.random() * 200) + 100,
    basePrice: p.price,
    currency: 'TL',
    releaseYear: p.year,
    isPopular: p.price > 40000,
    isFeatured: p.tags.includes('The One') || p.tags.includes('The Xtra') || isOled || isMiniLed,
    tags: p.tags,
    ssIndexRatio: isOled ? 99.8 : isMiniLed ? 98.9 : 96.5,
    highlights: p.highlights,
    specs: {
      screenSizeInches: p.size,
      displayTech: p.tech,
      resolution: p.size <= 32 ? 'Full HD' : '4K Ultra HD',
      refreshRateHz: p.refresh,
      smartOs: isOled || p.tags.includes('The One') || p.tags.includes('Google TV') ? 'Google TV' : 'Titan OS',
      audioPowerWatts: isOled ? 80 : isMiniLed ? 50 : 30,
      brightnessNits: isOled ? 2200 : isMiniLed ? 1800 : 1000,
      hdrSupport: ['Ambilight 3-Taraflı', 'Dolby Vision IQ', 'HDR10+ Adaptive', 'HLG'],
      gamingFeatures: ['4K @ ' + p.refresh + 'Hz VRR', 'ALLM', 'AMD FreeSync Premium', 'Game Bar'],
      hdmiPorts: 4,
      usbPorts: 3,
      energyClass: isOled ? 'G' : 'E'
    },
    storeOffers: [
      { id: `st-vat-${p.model}`, storeName: 'Vatan Bilgisayar', storeLogoColor: 'bg-blue-800 text-white', price: p.price, inStock: true, shippingDays: 1, badges: ['Resmi Distribütör', `${p.year} Seri`], sellerRating: 4.8, sellerReviews: 14200, url: 'https://www.vatanbilgisayar.com' },
      { id: `st-tek-${p.model}`, storeName: 'Teknosa', storeLogoColor: 'bg-orange-600 text-white', price: Math.round(p.price * 1.01), inStock: true, shippingDays: 1, badges: ['Stokta Var'], sellerRating: 4.9, sellerReviews: 11200, url: 'https://www.teknosa.com' },
      { id: `st-msh-${p.model}`, storeName: 'MediaMarkt (MSH)', storeLogoColor: 'bg-red-600 text-white', price: Math.round(p.price * 1.015), inStock: true, shippingDays: 2, badges: ['Ücretsiz Kargo'], sellerRating: 4.7, sellerReviews: 9800, url: 'https://www.mediamarkt.com.tr' }
    ],
    priceHistory: [
      { date: 'Ocak ' + p.year, price: Math.round(p.price * 1.05), store: 'Vatan Bilgisayar' },
      { date: 'Mart ' + p.year, price: p.price, store: 'Vatan Bilgisayar' }
    ]
  };
});

const allTVs = [...existingTVs, ...generatedPhilipsTVs];

const fileContent = `import { TVProduct } from './types';

export const mockTVs: TVProduct[] = ${JSON.stringify(allTVs, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, '..', 'src', 'lib', 'mockTVs.ts'), fileContent, 'utf-8');
console.log(`Successfully generated ${allTVs.length} total TV products!`);
