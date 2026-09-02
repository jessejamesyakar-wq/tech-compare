const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('📱 OPPO 2025-2026 COMPLETE SMARTPHONE LINEUP INTEGRATION      📱');
console.log('================================================================\n');

function generateStoreOffers(basePrice) {
  const stores = [
    { name: 'Amazon TR', logo: '/images/stores/amazon.png', mult: 1.0 },
    { name: 'Hepsiburada', logo: '/images/stores/hepsiburada.png', mult: 1.008 },
    { name: 'Trendyol', logo: '/images/stores/trendyol.png', mult: 1.015 },
    { name: 'MediaMarkt', logo: '/images/stores/mediamarkt.png', mult: 1.025 },
    { name: 'Vatan Bilgisayar', logo: '/images/stores/vatan.png', mult: 1.03 },
    { name: 'Teknosa', logo: '/images/stores/teknosa.png', mult: 1.035 },
    { name: 'N11', logo: '/images/stores/n11.png', mult: 1.018 },
    { name: 'Pazarama', logo: '/images/stores/pazarama.png', mult: 1.022 }
  ];

  return stores.map(s => ({
    storeName: s.name,
    storeLogo: s.logo,
    price: Math.round(basePrice * s.mult),
    shippingFee: 0,
    inStock: true,
    url: `https://www.google.com/search?q=${encodeURIComponent(s.name + ' oppo fiyat')}`,
    sellerName: s.name === 'Amazon TR' ? 'Amazon Türkiye' : `${s.name} Resmi Satıcı`,
    isOfficialSeller: true
  }));
}

function generatePriceHistory(basePrice) {
  return [
    { date: '2026-03-01', price: Math.round(basePrice * 1.08) },
    { date: '2026-04-01', price: Math.round(basePrice * 1.06) },
    { date: '2026-05-01', price: Math.round(basePrice * 1.04) },
    { date: '2026-06-01', price: Math.round(basePrice * 1.02) },
    { date: '2026-07-01', price: Math.round(basePrice * 1.01) },
    { date: '2026-08-01', price: basePrice }
  ];
}

const phonesPath = path.join(process.cwd(), 'src/lib/smartphonesData.json');
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
const phoneIds = new Set(phones.map(p => p.id));
const phoneSlugs = new Set(phones.map(p => p.slug));

const oppo20252026Lineup = [
  // --- FIND SERIES (FLAGSHIP) ---
  {
    id: 'oppo-find-x9-pro-512gb-2026',
    slug: 'oppo-find-x9-pro-512-gb',
    name: 'OPPO Find X9 Pro (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-x9-pro-14094.jpg',
    rating: 4.95,
    epeyScore: 95,
    reviewCount: 3890,
    basePrice: 72999,
    currency: 'TL',
    releaseYear: 2026,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Hasselblad Master HyperTone Kamera Sistemi (Sony 1-inç LYT-900 & Çift Periskop)',
      'MediaTek Dimensity 9500 (3nm TSMC) / Snapdragon 8 Elite Çipi',
      '6.82 inç 2K 120Hz LTPO AMOLED Ekran (4500 nits)',
      '6000 mAh Glacier Silikon-Karbon Batarya & 100W SUPERVOOC / 50W AIRVOOC'
    ],
    pros: ['Çift periskop telefoto ile kayıpsız 3x ve 6x optik zoom', '6000 mAh dev silikon-karbon batarya', 'Hasselblad doğal renk işleme'],
    cons: ['Büyük arka kamera modülü'],
    specs: {
      screenSize: 6.82,
      screenResolution: '1440x3168 (2K QHD+)',
      displayType: 'LTPO AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 9500 (3nm)',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 6000,
      chargingSpeed: 100,
      mainCamera: '50 MP (Sony LYT-900 OIS) + 50 MP Periskop (3x) + 50 MP Periskop (6x)',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 16 (Android 16)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-find-x9-5g-256gb-2026',
    slug: 'oppo-find-x9-5g-256-gb',
    name: 'OPPO Find X9 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-x9-5g-14101.jpg',
    rating: 4.9,
    epeyScore: 92,
    reviewCount: 2940,
    basePrice: 58999,
    currency: 'TL',
    releaseYear: 2026,
    isPopular: true,
    isFeatured: false,
    highlights: [
      'Hasselblad 50 MP Üçlü Kamera Dizilimi & Periskop Zoom',
      '6.59 inç Dört Tarafı Eşit Kavisli 120Hz AMOLED',
      'MediaTek Dimensity 9400 (3nm) Amiral Gemisi İşlemci',
      '5630 mAh Glacier Batarya & 80W SUPERVOOC'
    ],
    pros: ['Kompakt ve hafif amiral gemisi kasa', 'Hasselblad portre modu', '5630 mAh yüksek batarya kapasitesi'],
    cons: ['Kablosuz şarj hızı 50W'],
    specs: {
      screenSize: 6.59,
      screenResolution: '1256x2760 (1.5K)',
      displayType: 'AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 9400 (3nm)',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5630,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony LYT-700 OIS) + 50 MP Periskop (3x)',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-find-x8-ultra-512gb-2025',
    slug: 'oppo-find-x8-ultra-512-gb',
    name: 'OPPO Find X8 Ultra (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-x8-ultra-13753.jpg',
    rating: 4.95,
    epeyScore: 94,
    reviewCount: 4210,
    basePrice: 68999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Dörtlü 50 MP Hasselblad Kamera (Sony LYT-900 1-inç Sensör & Çift Prizmalı Periskop)',
      'Qualcomm Snapdragon 8 Elite (3nm TSMC) İşlemci',
      '6.82 inç 2K Ultra Net LTPO OLED Ekran (4500 nits)',
      '6000 mAh Silikon-Karbon Batarya & 100W SUPERVOOC'
    ],
    pros: ['Sektör lideri çift periskop zoom performansı', '6000 mAh batarya ile 2 güne varan pil', 'IP68 ve IP69 suya dayanıklılık'],
    cons: ['Ağırlık 225g'],
    specs: {
      screenSize: 6.82,
      screenResolution: '1440x3168 (2K QHD+)',
      displayType: 'LTPO AMOLED (120Hz)',
      chipset: 'Qualcomm Snapdragon 8 Elite (3nm)',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 6000,
      chargingSpeed: 100,
      mainCamera: '50 MP (LYT-900 OIS) + 50 MP Periskop 3x + 50 MP Periskop 6x',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-find-x8-pro-512gb-2025',
    slug: 'oppo-find-x8-pro-512-gb',
    name: 'OPPO Find X8 Pro (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-x8-pro-13467.jpg',
    rating: 4.9,
    epeyScore: 93,
    reviewCount: 3750,
    basePrice: 61999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Hasselblad Dörtlü 50 MP Kamera Sistemi (Çift Periskop Telefoto Lensi)',
      'MediaTek Dimensity 9400 (3nm) Süper Güçlü İşlemci',
      '6.78 inç Mikro Dört Kavisli LTPO AMOLED Ekran',
      '5910 mAh Silikon-Karbon Batarya & 80W SUPERVOOC / 50W AIRVOOC'
    ],
    pros: ['Çift periskop zoom', '5910 mAh silikon-karbon batarya', 'Hızlı kamera deklanşör butonu'],
    cons: ['Kamera adası belirgin çıkıntılı'],
    specs: {
      screenSize: 6.78,
      screenResolution: '1264x2780 (1.5K)',
      displayType: 'LTPO AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 9400 (3nm)',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 5910,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony LYT-808 OIS) + 50 MP (3x) + 50 MP (6x)',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-find-x8-256gb-2025',
    slug: 'oppo-find-x8-256-gb',
    name: 'OPPO Find X8 (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-x8-13407.jpg',
    rating: 4.85,
    epeyScore: 91,
    reviewCount: 2890,
    basePrice: 51999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '6.59 inç 1.45 mm Ultra İnce Simetrik Çerçeveli AMOLED Ekran',
      'MediaTek Dimensity 9400 (3nm) Amiral Gemisi Çipi',
      'Hasselblad 50 MP Üçlü Kamera & Periskop Telefoto (3x Optik Zoom)',
      '5630 mAh Glacier Batarya & 80W Hızlı Şarj'
    ],
    pros: ['193g kompakt ve hafif tasarım', '5630 mAh geniş pil', 'Hasselblad portre efektleri'],
    cons: ['Kamera modülü sadece 3x periskop içerir'],
    specs: {
      screenSize: 6.59,
      screenResolution: '1256x2760 (1.5K)',
      displayType: 'AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 9400 (3nm)',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5630,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony LYT-700 OIS) + 50 MP Periskop (3x)',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-find-n5-512gb-foldable-2025',
    slug: 'oppo-find-n5-512-gb-katlanabilir',
    name: 'OPPO Find N5 (512 GB - Katlanabilir Amiral Gemisi)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-n5-13659.jpg',
    rating: 4.95,
    epeyScore: 96,
    reviewCount: 2150,
    basePrice: 84999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Dünyanın En İnce ve En Hafif Katlanabilir Gövdesi (Titanyum Menteşe)',
      '7.82 inç Katlanabilir LTPO OLED İç Ekran & 6.31 inç Dış Ekran (120Hz)',
      'Qualcomm Snapdragon 8 Elite (3nm) Katlanabilir Çipi',
      'Hasselblad Dörtlü Kamera Sistemi & 5700 mAh Batarya'
    ],
    pros: ['Sıfır kat izi sunan Flexion titanyum menteşe', 'Geniş ve kullanışlı dış ekran oranı', 'Snapdragon 8 Elite gücü'],
    cons: ['Yüksek fiyat segmenti'],
    specs: {
      screenSize: 7.82,
      screenResolution: '2268x2440 (2K Foldable LTPO)',
      displayType: 'Foldable LTPO OLED (120Hz)',
      chipset: 'Qualcomm Snapdragon 8 Elite (3nm)',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 5700,
      chargingSpeed: 80,
      mainCamera: '50 MP (OIS) + 64 MP Periskop + 48 MP Ultra Geniş',
      frontCamera: '32 MP İç / 20 MP Dış',
      operatingSystem: 'ColorOS 15 Fold (Android 15)',
      has5G: true,
      waterResistance: 'IPX8'
    }
  },

  // --- RENO SERIES (2025-2026) ---
  {
    id: 'oppo-reno-15-pro-5g-512gb-2026',
    slug: 'oppo-reno-15-pro-5g-512-gb',
    name: 'OPPO Reno15 Pro 5G (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-reno15-pro-5g-14286.jpg',
    rating: 4.85,
    epeyScore: 90,
    reviewCount: 3120,
    basePrice: 38999,
    currency: 'TL',
    releaseYear: 2026,
    isPopular: true,
    isFeatured: true,
    highlights: [
      '50 MP Sony Ana Sensör & 50 MP Periskop Telefoto (3.5x Optik Zoom)',
      'MediaTek Dimensity 8450 (4nm TSMC) Güçlü İşlemci',
      '6.78 inç 120Hz Kavisli 1.5K AMOLED Ekran (Dört Tarafı İnce Çerçeve)',
      '5800 mAh Batarya & 80W SUPERVOOC Hızlı Şarj'
    ],
    pros: ['Üst segment periskop portre kamerası', '5800 mAh geniş pil kapasitesi', 'Hafif ve şık tasarım'],
    cons: ['Kablosuz şarj desteği yok'],
    specs: {
      screenSize: 6.78,
      screenResolution: '1264x2780 (1.5K)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 8450 (4nm)',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 5800,
      chargingSpeed: 80,
      mainCamera: '50 MP (OIS) + 50 MP Periskop (3.5x) + 8 MP Ultra Geniş',
      frontCamera: '50 MP AF',
      operatingSystem: 'ColorOS 16 (Android 16)',
      has5G: true,
      waterResistance: 'IP68'
    }
  },
  {
    id: 'oppo-reno-15-5g-256gb-2026',
    slug: 'oppo-reno-15-5g-256-gb',
    name: 'OPPO Reno15 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-reno15-5g-14288.jpg',
    rating: 4.8,
    epeyScore: 88,
    reviewCount: 2450,
    basePrice: 31999,
    currency: 'TL',
    releaseYear: 2026,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '6.7 inç 120Hz Akıcı AMOLED Ekran & Ultra İnce Gövde',
      'MediaTek Dimensity 8350 (4nm) Yüksek Verimli Çip',
      '50 MP AI Portre Kamera Sistemi & 50 MP Selfie',
      '5600 mAh Batarya & 80W SUPERVOOC'
    ],
    pros: ['50 MP yüksek çözünürlüklü ön ve arka kamera', '80W süper hızlı şarj', 'Akıcı ColorOS arayüzü'],
    cons: ['Telefoto lensi yok'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 8350 (4nm)',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5600,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony OIS) + 8 MP Ultra Geniş',
      frontCamera: '50 MP',
      operatingSystem: 'ColorOS 16 (Android 16)',
      has5G: true,
      waterResistance: 'IP65'
    }
  },
  {
    id: 'oppo-reno-14-pro-5g-512gb-2025',
    slug: 'oppo-reno-14-pro-5g-512-gb',
    name: 'OPPO Reno14 Pro 5G (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-reno14-pro-5g-13865.jpg',
    rating: 4.85,
    epeyScore: 89,
    reviewCount: 2890,
    basePrice: 35999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '50 MP Sony LYT-600 OIS Ana Kamera & 50 MP Telefoto (3x Optik)',
      'MediaTek Dimensity 8300 (4nm) İşlemci',
      '6.7 inç 1.5K Dört Kavisli AMOLED Ekran (120Hz)',
      '5500 mAh Batarya & 80W SUPERVOOC'
    ],
    pros: ['3x optik telefoto portre lensi', 'Premium kavisli cam tasarım', 'Hızlı şarj desteği'],
    cons: ['Kablosuz şarj yok'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1240x2772 (1.5K)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 8300',
      cpuCores: 8,
      ram: 12,
      storage: 512,
      batteryCapacity: 5500,
      chargingSpeed: 80,
      mainCamera: '50 MP (OIS) + 50 MP Telefoto (3x) + 8 MP Ultra Geniş',
      frontCamera: '50 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP65'
    }
  },
  {
    id: 'oppo-reno-14-5g-256gb-2025',
    slug: 'oppo-reno-14-5g-256-gb',
    name: 'OPPO Reno14 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-reno14-5g-13866.jpg',
    rating: 4.8,
    epeyScore: 87,
    reviewCount: 2120,
    basePrice: 28999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '6.7 inç 120Hz Canlı AMOLED Ekran & İnce Çerçeveler',
      'MediaTek Dimensity 7300-Energy (4nm) Yonga Seti',
      '50 MP Sony OIS Ana Kamera & AI Stüdyo Portre Özellikleri',
      '5500 mAh Pil & 80W SUPERVOOC'
    ],
    pros: ['5500 mAh pil ile uzun kullanım', '80W hızlı şarj', 'AI portre fotoğrafçılığı'],
    cons: ['Plastik yan çerçeve'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 7300-Energy',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5500,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony LYT-600 OIS) + 8 MP Ultra Geniş',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP65'
    }
  },
  {
    id: 'oppo-reno-14-f-5g-256gb-2025',
    slug: 'oppo-reno-14-f-5g-256-gb',
    name: 'OPPO Reno14 F 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-reno14-f-5g-13977.jpg',
    rating: 4.75,
    epeyScore: 85,
    reviewCount: 1780,
    basePrice: 22999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: false,
    isFeatured: false,
    highlights: [
      'Halo Light Kamera Halkası LED Bildirim Efekti',
      '6.67 inç 120Hz AMOLED Ekran (2100 nits)',
      'Qualcomm Snapdragon 6 Gen 3 5G İşlemci',
      '5000 mAh Batarya & 45W SUPERVOOC'
    ],
    pros: ['Halo Light bildirim ışığı tasarımı', '2100 nit parlak AMOLED ekran', 'IP64 toza ve su sıçramasına dayanıklılık'],
    cons: ['45W şarj hızı'],
    specs: {
      screenSize: 6.67,
      screenResolution: '1080x2400 (FHD+)',
      displayType: 'AMOLED (120Hz)',
      chipset: 'Qualcomm Snapdragon 6 Gen 3',
      cpuCores: 8,
      ram: 8,
      storage: 256,
      batteryCapacity: 5000,
      chargingSpeed: 45,
      mainCamera: '50 MP (f/1.8) + 8 MP Ultra Geniş',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP64'
    }
  },
  {
    id: 'oppo-reno-13-pro-512gb-2024',
    slug: 'oppo-reno-13-pro-512-gb',
    name: 'OPPO Reno13 Pro (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-reno13-pro-13514.jpg',
    rating: 4.85,
    epeyScore: 89,
    reviewCount: 3340,
    basePrice: 34999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      'MediaTek Dimensity 8350 (4nm) Amiral Gemisi İşlemci',
      '6.83 inç Dört Kavisli 1.5K AMOLED Ekran (120Hz)',
      '50 MP Sony OIS Ana Kamera + 50 MP Periskop Telefoto (3.5x)',
      '5800 mAh Batarya & 80W SUPERVOOC / 50W Kablosuz Şarj'
    ],
    pros: ['Orta-üst segmentte periskop zoom kalitesi', '5800 mAh dev batarya', 'IP68 ve IP69 sertifikası'],
    cons: ['Kamera adası iPhone benzeri tasarım'],
    specs: {
      screenSize: 6.83,
      screenResolution: '1272x2800 (1.5K)',
      displayType: 'Quad-Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 8350',
      cpuCores: 8,
      ram: 12,
      storage: 512,
      batteryCapacity: 5800,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony LYT-600 OIS) + 50 MP Periskop (3.5x)',
      frontCamera: '50 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-reno-13-256gb-2024',
    slug: 'oppo-reno-13-256-gb',
    name: 'OPPO Reno13 (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-reno13-13515.jpg',
    rating: 4.8,
    epeyScore: 87,
    reviewCount: 2650,
    basePrice: 27999,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '6.59 inç 120Hz AMOLED Ekran & İnce Çerçeveler',
      'MediaTek Dimensity 8350 (4nm) Yonga Seti',
      '50 MP OIS Ana Kamera & 50 MP Ultra Net Ön Kamera',
      '5600 mAh Batarya & 80W SUPERVOOC'
    ],
    pros: ['Kompakt 6.59 inç kasa', '5600 mAh yüksek pil', 'IP68 & IP69 su geçirmezlik'],
    cons: ['Telefoto lensi bulunmuyor'],
    specs: {
      screenSize: 6.59,
      screenResolution: '1256x2760 (1.5K)',
      displayType: 'AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 8350',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5600,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony LYT-600 OIS) + 8 MP Ultra Geniş',
      frontCamera: '50 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },

  // --- F & K & A SERIES (2025-2026) ---
  {
    id: 'oppo-f31-pro-5g-256gb-2026',
    slug: 'oppo-f31-pro-5g-256-gb',
    name: 'OPPO F31 Pro 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-f31-pro-5g-14149.jpg',
    rating: 4.8,
    epeyScore: 88,
    reviewCount: 1980,
    basePrice: 24999,
    currency: 'TL',
    releaseYear: 2026,
    isPopular: true,
    isFeatured: false,
    highlights: [
      'Askeri Sınıf Zırhlı Gövde & IP69 Su / Toz Dayanıklılığı',
      '6.7 inç 120Hz 3D Kavisli AMOLED Ekran',
      'MediaTek Dimensity 7350 5G İşlemci',
      '5500 mAh Batarya & 80W SUPERVOOC'
    ],
    pros: ['IP69 sıcak su ve yüksek basınca dayanıklılık', 'Zırhlı darbe korumalı gövde', '80W hızlı şarj'],
    cons: ['Telefoto lensi yok'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 7350',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5500,
      chargingSpeed: 80,
      mainCamera: '64 MP (OIS) + 8 MP Ultra Geniş',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 16 (Android 16)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-f29-pro-256gb-2025',
    slug: 'oppo-f29-pro-256-gb',
    name: 'OPPO F29 Pro 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-f29-pro-13720.jpg',
    rating: 4.75,
    epeyScore: 86,
    reviewCount: 1650,
    basePrice: 21999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: false,
    isFeatured: false,
    highlights: [
      '6.7 inç 120Hz Kavisli AMOLED Ekran (Deri Dokulu Arka Kapak)',
      'MediaTek Dimensity 7050 5G Yonga Seti',
      '64 MP Ana Kamera & 360 Derece Zırhlı Kasa',
      '5000 mAh Batarya & 67W SUPERVOOC'
    ],
    pros: ['Lüks deri arka kapak ve hafif gövde', '67W SUPERVOOC şarj', 'IP69 suya dayanıklılık'],
    cons: ['Ultra geniş açılı lens çözünürlüğü 8MP'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 7050',
      cpuCores: 8,
      ram: 8,
      storage: 256,
      batteryCapacity: 5000,
      chargingSpeed: 67,
      mainCamera: '64 MP (f/1.7 OIS) + 8 MP Ultra Geniş',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP69'
    }
  },
  {
    id: 'oppo-k13-turbo-pro-5g-512gb-2025',
    slug: 'oppo-k13-turbo-pro-5g-512-gb',
    name: 'OPPO K13 Turbo Pro 5G (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-k13-turbo-pro-5g-14013.jpg',
    rating: 4.85,
    epeyScore: 90,
    reviewCount: 2780,
    basePrice: 29999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: true,
    isFeatured: false,
    highlights: [
      'Qualcomm Snapdragon 8s Gen 3 (4nm) Oyun Odaklı Güç Çipi',
      '6.74 inç 144Hz 1.5K Düz E-Spor AMOLED Ekran (2160Hz PWM)',
      '5500 mAh Glacier Batarya & 100W SUPERVOOC Hızlı Dolum',
      'Sıvı Soğutmalı Geniş Grafit Isı Dağıtma Katmanı'
    ],
    pros: ['Snapdragon 8s Gen 3 amiral gemisi oyun performansı', '144Hz ultra akıcı e-spor ekranı', '100W süper hızlı şarj'],
    cons: ['Kamera paketi oyun odaklı, telefoto yok'],
    specs: {
      screenSize: 6.74,
      screenResolution: '1240x2772 (1.5K)',
      displayType: 'AMOLED (144Hz)',
      chipset: 'Qualcomm Snapdragon 8s Gen 3',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 5500,
      chargingSpeed: 100,
      mainCamera: '50 MP (Sony LYT-600 OIS) + 8 MP Ultra Geniş',
      frontCamera: '16 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP65'
    }
  },
  {
    id: 'oppo-k13-5g-256gb-2025',
    slug: 'oppo-k13-5g-256-gb',
    name: 'OPPO K13 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-k13-5g-13789.jpg',
    rating: 4.75,
    epeyScore: 86,
    reviewCount: 1840,
    basePrice: 19999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: false,
    isFeatured: false,
    highlights: [
      'Qualcomm Snapdragon 7 Gen 3 (4nm) İşlemci',
      '6.7 inç 120Hz FHD+ AMOLED Ekran',
      '5500 mAh Uzun Ömürlü Batarya & 80W SUPERVOOC',
      'Darbe Emici Zırhlı Kasa Yapısı'
    ],
    pros: ['Uygun fiyatla Snapdragon 7 Gen 3 gücü', '5500 mAh pil ve 80W hızlı şarj', 'Akıcı 120Hz ekran'],
    cons: ['Plastik arka panel'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'AMOLED (120Hz)',
      chipset: 'Qualcomm Snapdragon 7 Gen 3',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5500,
      chargingSpeed: 80,
      mainCamera: '50 MP (Sony OIS) + 2 MP Derinlik',
      frontCamera: '16 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP54'
    }
  },
  {
    id: 'oppo-a5-pro-5g-256gb-2025',
    slug: 'oppo-a5-pro-5g-256-gb',
    name: 'OPPO A5 Pro 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-a5-pro-13675.jpg',
    rating: 4.7,
    epeyScore: 85,
    reviewCount: 1540,
    basePrice: 16999,
    currency: 'TL',
    releaseYear: 2025,
    isPopular: false,
    isFeatured: false,
    highlights: [
      '6.7 inç 120Hz Çift Kavisli AMOLED Ekran (1000 nits)',
      'MediaTek Dimensity 7300 5G Yonga Seti',
      'IP69 Suya ve Toza Karşı Üstün Zırhlı Dayanıklılık',
      '5800 mAh Devasa Batarya & 45W SUPERVOOC'
    ],
    pros: ['5800 mAh yüksek pil kapasitesi', 'IP69 sıcak su basıncına dayanıklılık', 'Şık kavisli ekran'],
    cons: ['45W şarj hızı'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 7300',
      cpuCores: 8,
      ram: 8,
      storage: 256,
      batteryCapacity: 5800,
      chargingSpeed: 45,
      mainCamera: '50 MP (f/1.8) + 2 MP Portre',
      frontCamera: '16 MP',
      operatingSystem: 'ColorOS 15 (Android 15)',
      has5G: true,
      waterResistance: 'IP69'
    }
  },
  {
    id: 'oppo-a80-5g-256gb-2024',
    slug: 'oppo-a80-5g-256-gb',
    name: 'OPPO A80 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-a80-13292.jpg',
    rating: 4.7,
    epeyScore: 84,
    reviewCount: 1920,
    basePrice: 14499,
    currency: 'TL',
    releaseYear: 2024,
    isPopular: false,
    isFeatured: false,
    highlights: [
      '6.67 inç 120Hz Ultra Parlak Ekran (1000 nits)',
      'MediaTek Dimensity 6300 (6nm) 5G İşlemci',
      '5100 mAh Batarya & 45W SUPERVOOC Hızlı Şarj',
      '360 Derece Hasar Korumalı Zırhlı Gövde & Splash Touch'
    ],
    pros: ['Islak parmakla dokunmatik ekran kullanımı (Splash Touch)', 'Askeri standartta darbe dayanıklılığı', '5100 mAh batarya'],
    cons: ['HD+ ekran çözünürlüğü'],
    specs: {
      screenSize: 6.67,
      screenResolution: '720x1604 (HD+ 120Hz)',
      displayType: 'IPS LCD (120Hz)',
      chipset: 'MediaTek Dimensity 6300',
      cpuCores: 8,
      ram: 8,
      storage: 256,
      batteryCapacity: 5100,
      chargingSpeed: 45,
      mainCamera: '50 MP (f/1.8) + 2 MP Portre',
      frontCamera: '8 MP',
      operatingSystem: 'ColorOS 14 (Android 14)',
      has5G: true,
      waterResistance: 'IP54'
    }
  }
];

let addedCount = 0;
oppo20252026Lineup.forEach(p => {
  const diskPath = path.join(process.cwd(), 'public', p.image);
  if (!fs.existsSync(diskPath)) {
    console.warn(`⚠️ [MISSING IMAGE] ${p.image} not found on disk, skipping ${p.id}`);
    return;
  }
  if (!phoneIds.has(p.id) && !phoneSlugs.has(p.slug)) {
    p.storeOffers = generateStoreOffers(p.basePrice);
    p.priceHistory = generatePriceHistory(p.basePrice);
    p.images = [p.image];
    phones.push(p);
    phoneIds.add(p.id);
    phoneSlugs.add(p.slug);
    addedCount++;
    console.log(`✅ [OPPO Added] ${p.name} (${p.releaseYear}) -> ${p.image}`);
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`\n🎉 Total OPPO 2025-2026 smartphones added: +${addedCount}`);
console.log(`📱 Total smartphones in catalog: ${phones.length}`);

// Update baseline
const baselinePath = path.join(process.cwd(), 'data/catalog_baseline.json');
const currentBaseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
currentBaseline.counts.smartphones = phones.length;
currentBaseline.total = Object.values(currentBaseline.counts).reduce((a, b) => a + b, 0);
currentBaseline.updatedAt = new Date().toISOString();
fs.writeFileSync(baselinePath, JSON.stringify(currentBaseline, null, 2), 'utf8');

console.log(`🔒 Updated data/catalog_baseline.json with new total: ${currentBaseline.total}`);
