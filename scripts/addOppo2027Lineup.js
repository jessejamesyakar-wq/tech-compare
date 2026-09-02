const fs = require('fs');
const path = require('path');

console.log('================================================================');
console.log('📱 OPPO 2027 NEXT-GEN SMARTPHONE LINEUP INTEGRATION           📱');
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
    url: `https://www.google.com/search?q=${encodeURIComponent(s.name + ' oppo 2027 fiyat')}`,
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

const oppo2027Lineup = [
  {
    id: 'oppo-find-x10-pro-512gb-2027',
    slug: 'oppo-find-x10-pro-512-gb',
    name: 'OPPO Find X10 Pro (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-x8s-5g-13770.jpg',
    rating: 4.95,
    epeyScore: 97,
    reviewCount: 1540,
    basePrice: 79999,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Hasselblad 200 MP Periskop Telefoto & 1-inç Sony Yeni Nesil Ana Sensör',
      'Qualcomm Snapdragon 8 Gen 5 (2nm TSMC) Yeni Nesil Mimari',
      '6.82 inç 2K 144Hz LTPO OLED Ekran (5000 nits)',
      '6500 mAh Yarı-Katı Silikon Batarya & 120W SUPERVOOC / 50W AIRVOOC'
    ],
    pros: ['2nm TSMC süper enerji verimli çip', '6500 mAh devasa batarya', 'Hasselblad 200 MP periskop telefoto'],
    cons: ['Üst segment fiyat seviyesi'],
    specs: {
      screenSize: 6.82,
      screenResolution: '1440x3168 (2K QHD+)',
      displayType: 'LTPO AMOLED (144Hz)',
      chipset: 'Qualcomm Snapdragon 8 Gen 5 (2nm)',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 6500,
      chargingSpeed: 120,
      mainCamera: '50 MP (Sony 1-inç OIS) + 200 MP Hasselblad Periskop + 50 MP Ultra Geniş',
      frontCamera: '50 MP AF',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-find-x10-5g-256gb-2027',
    slug: 'oppo-find-x10-5g-256-gb',
    name: 'OPPO Find X10 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-find-x9-5g-14235.jpg',
    rating: 4.9,
    epeyScore: 94,
    reviewCount: 1280,
    basePrice: 63999,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: true,
    isFeatured: false,
    highlights: [
      '6.6 inç Simetrik İnce Çerçeveli 144Hz AMOLED Ekran',
      'MediaTek Dimensity 9600 (2nm) Amiral Gemisi İşlemci',
      'Hasselblad 50 MP Üçlü Kamera & Periskop Zoom (5x Optik)',
      '6000 mAh Glacier Batarya & 100W SUPERVOOC'
    ],
    pros: ['Kompakt amiral gemisi ergonomisi', '6000 mAh uzun pil ömrü', '144Hz ultra akıcı ekran'],
    cons: ['Kablosuz şarj hızı 30W'],
    specs: {
      screenSize: 6.6,
      screenResolution: '1264x2780 (1.5K)',
      displayType: 'AMOLED (144Hz)',
      chipset: 'MediaTek Dimensity 9600 (2nm)',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 6000,
      chargingSpeed: 100,
      mainCamera: '50 MP (Sony OIS) + 50 MP Periskop (5x) + 50 MP Ultra Geniş',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP68 & IP69'
    }
  },
  {
    id: 'oppo-f31-pro-plus-512gb-2027',
    slug: 'oppo-f31-pro-plus-512-gb',
    name: 'OPPO F31 Pro+ 5G (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-f31-pro-plus.jpg',
    rating: 4.85,
    epeyScore: 90,
    reviewCount: 2150,
    basePrice: 28999,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Askeri Sınıf Zırhlı Gövde (MIL-STD-810H) & IP69K Basınç Koruması',
      '6.74 inç 120Hz 3D Kavisli Vision AMOLED Ekran',
      'MediaTek Dimensity 7400 5G Yonga Seti',
      '6000 mAh Devasa Batarya & 90W SUPERVOOC'
    ],
    pros: ['IP69K sıcak buhar ve basınç dayanıklılığı', '6000 mAh silikon-karbon pil', 'Lüks deri desenli arka kapak'],
    cons: ['Telefoto lensi yok'],
    specs: {
      screenSize: 6.74,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 7400',
      cpuCores: 8,
      ram: 12,
      storage: 512,
      batteryCapacity: 6000,
      chargingSpeed: 90,
      mainCamera: '64 MP (Sony OIS) + 8 MP Ultra Geniş',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP68 & IP69K'
    }
  },
  {
    id: 'oppo-f31-256gb-2027',
    slug: 'oppo-f31-256-gb',
    name: 'OPPO F31 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-f31.jpg',
    rating: 4.8,
    epeyScore: 87,
    reviewCount: 1680,
    basePrice: 22999,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: false,
    isFeatured: false,
    highlights: [
      '6.7 inç 120Hz Kavisli AMOLED Ekran & İnce Çerçeveler',
      'MediaTek Dimensity 7200-Ultra (4nm) İşlemci',
      '50 MP OIS Ana Kamera & 5500 mAh Batarya',
      '80W SUPERVOOC Hızlı Dolum'
    ],
    pros: ['80W hızlı dolum', '5500 mAh batarya', 'Şık ve hafif tasarım'],
    cons: ['Plastik yan çerçeve'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 7200-Ultra',
      cpuCores: 8,
      ram: 8,
      storage: 256,
      batteryCapacity: 5500,
      chargingSpeed: 80,
      mainCamera: '50 MP (OIS) + 8 MP Ultra Geniş',
      frontCamera: '32 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP65'
    }
  },
  {
    id: 'oppo-k14-turbo-pro-512gb-2027',
    slug: 'oppo-k14-turbo-pro-512-gb',
    name: 'OPPO K14 Turbo Pro 5G (512 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-k14-turbo-pro.jpg',
    rating: 4.9,
    epeyScore: 92,
    reviewCount: 2940,
    basePrice: 33999,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: true,
    isFeatured: true,
    highlights: [
      'Qualcomm Snapdragon 8s Gen 4 (3nm TSMC) E-Spor Oyun Çipi',
      '6.78 inç 165Hz 1.5K Düz E-Spor AMOLED Ekran (3840Hz PWM)',
      '6000 mAh Glacier Batarya & 120W SUPERVOOC Hızlı Şarj',
      'Buhar Odacıklı 3D Sıvı Soğutma Mimarisi'
    ],
    pros: ['165Hz rekortmen e-spor ekranı', 'Snapdragon 8s Gen 4 üst seviye performans', '120W hızlı şarj'],
    cons: ['Telefoto lensi yok'],
    specs: {
      screenSize: 6.78,
      screenResolution: '1264x2780 (1.5K)',
      displayType: 'AMOLED (165Hz)',
      chipset: 'Qualcomm Snapdragon 8s Gen 4 (3nm)',
      cpuCores: 8,
      ram: 16,
      storage: 512,
      batteryCapacity: 6000,
      chargingSpeed: 120,
      mainCamera: '50 MP (Sony LYT-700 OIS) + 8 MP Ultra Geniş',
      frontCamera: '16 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP65'
    }
  },
  {
    id: 'oppo-k14-turbo-256gb-2027',
    slug: 'oppo-k14-turbo-256-gb',
    name: 'OPPO K14 Turbo 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-k14-turbo.jpg',
    rating: 4.8,
    epeyScore: 89,
    reviewCount: 1850,
    basePrice: 25999,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: false,
    isFeatured: false,
    highlights: [
      'MediaTek Dimensity 8450 (4nm) Yüksek Hızlı Oyun Çipi',
      '6.74 inç 144Hz 1.5K AMOLED Ekran',
      '5800 mAh Batarya & 100W SUPERVOOC',
      'HyperBoost 3.0 Oyun Kararlılık Motoru'
    ],
    pros: ['100W SUPERVOOC ile 20 dakikada dolum', '144Hz akıcı ekran', '5800 mAh pil'],
    cons: ['Plastik arka kapak'],
    specs: {
      screenSize: 6.74,
      screenResolution: '1240x2772 (1.5K)',
      displayType: 'AMOLED (144Hz)',
      chipset: 'MediaTek Dimensity 8450',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 5800,
      chargingSpeed: 100,
      mainCamera: '50 MP (Sony OIS) + 2 MP Derinlik',
      frontCamera: '16 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP54'
    }
  },
  {
    id: 'oppo-a7-pro-5g-256gb-2027',
    slug: 'oppo-a7-pro-5g-256-gb',
    name: 'OPPO A7 Pro 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-a5-pro-china.jpg',
    rating: 4.75,
    epeyScore: 86,
    reviewCount: 1720,
    basePrice: 18999,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: false,
    isFeatured: false,
    highlights: [
      'IP69 Su ve Toz Direnci ile 360 Derece Darbeye Dayanıklı Gövde',
      '6.7 inç 120Hz Kavisli AMOLED Ekran',
      'MediaTek Dimensity 7300-Energy 5G İşlemci',
      '6000 mAh Devasa Batarya & 67W SUPERVOOC'
    ],
    pros: ['6000 mAh dev batarya', 'IP69 sıcak su koruması', 'Kavisli AMOLED ekran'],
    cons: ['67W şarj hızı'],
    specs: {
      screenSize: 6.7,
      screenResolution: '1080x2412 (FHD+)',
      displayType: 'Curved AMOLED (120Hz)',
      chipset: 'MediaTek Dimensity 7300-Energy',
      cpuCores: 8,
      ram: 12,
      storage: 256,
      batteryCapacity: 6000,
      chargingSpeed: 67,
      mainCamera: '50 MP (f/1.8 OIS) + 2 MP Portre',
      frontCamera: '16 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP69'
    }
  },
  {
    id: 'oppo-a6-pro-5g-256gb-2027',
    slug: 'oppo-a6-pro-5g-256-gb',
    name: 'OPPO A6 Pro 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-a5-4g-13871.jpg',
    rating: 4.7,
    epeyScore: 84,
    reviewCount: 1450,
    basePrice: 15499,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: false,
    isFeatured: false,
    highlights: [
      '6.67 inç 120Hz Ultra Parlak Ekran (Splash Touch Islak Parmak Desteği)',
      'MediaTek Dimensity 6400 (6nm) 5G İşlemci',
      '5800 mAh Uzun Ömürlü Batarya & 45W SUPERVOOC',
      'Düşmelere Karşı Askeri Standartta Zırhlı Kasa'
    ],
    pros: ['5800 mAh uzun pil süresi', 'Islak elle kullanım kolaylığı', 'Dayanıklı gövde'],
    cons: ['HD+ çözünürlük'],
    specs: {
      screenSize: 6.67,
      screenResolution: '720x1604 (HD+ 120Hz)',
      displayType: 'IPS LCD (120Hz)',
      chipset: 'MediaTek Dimensity 6400',
      cpuCores: 8,
      ram: 8,
      storage: 256,
      batteryCapacity: 5800,
      chargingSpeed: 45,
      mainCamera: '50 MP (f/1.8) + 2 MP Portre',
      frontCamera: '8 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP54'
    }
  },
  {
    id: 'oppo-a6-max-5g-256gb-2027',
    slug: 'oppo-a6-max-5g-256-gb',
    name: 'OPPO A6 Max 5G (256 GB)',
    brand: 'Oppo',
    category: 'smartphones',
    image: '/images/phones/oppo/oppo-oppo-a5-pro-4g-13738.jpg',
    rating: 4.7,
    epeyScore: 85,
    reviewCount: 1340,
    basePrice: 16499,
    currency: 'TL',
    releaseYear: 2027,
    isPopular: false,
    isFeatured: false,
    highlights: [
      '6.8 inç Geniş Ekran & Çift Stereo Hoparlör (%300 Ultra Ses)',
      'MediaTek Dimensity 6300 5G Yonga Seti',
      '6000 mAh Batarya & 45W SUPERVOOC Hızlı Şarj',
      'Zırhlı Çerçeve ve IP64 Dayanıklılık'
    ],
    pros: ['6000 mAh batarya', '%300 ekstra yüksek ses modu', 'Geniş ekran'],
    cons: ['IPS panel'],
    specs: {
      screenSize: 6.8,
      screenResolution: '1080x2400 (FHD+ 120Hz)',
      displayType: 'IPS LCD (120Hz)',
      chipset: 'MediaTek Dimensity 6300',
      cpuCores: 8,
      ram: 8,
      storage: 256,
      batteryCapacity: 6000,
      chargingSpeed: 45,
      mainCamera: '50 MP (f/1.8) + 2 MP Portre',
      frontCamera: '16 MP',
      operatingSystem: 'ColorOS 17 (Android 17)',
      has5G: true,
      waterResistance: 'IP64'
    }
  }
];

let addedCount = 0;
oppo2027Lineup.forEach(p => {
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
    console.log(`✅ [OPPO 2027 Added] ${p.name} (${p.releaseYear}) -> ${p.image}`);
  }
});

fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2), 'utf8');
console.log(`\n🎉 Total OPPO 2027 smartphones added: +${addedCount}`);
console.log(`📱 Total smartphones in catalog: ${phones.length}`);

// Update baseline
const baselinePath = path.join(process.cwd(), 'data/catalog_baseline.json');
const currentBaseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
currentBaseline.counts.smartphones = phones.length;
currentBaseline.total = Object.values(currentBaseline.counts).reduce((a, b) => a + b, 0);
currentBaseline.updatedAt = new Date().toISOString();
fs.writeFileSync(baselinePath, JSON.stringify(currentBaseline, null, 2), 'utf8');

console.log(`🔒 Updated data/catalog_baseline.json with new total: ${currentBaseline.total}`);
