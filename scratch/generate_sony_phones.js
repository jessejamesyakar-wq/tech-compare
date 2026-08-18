const fs = require('fs');
const path = require('path');

const sonyModels = [
  // --- 2018 ---
  { name: "Sony Xperia L2", year: 2018, category: "budget", price: 2499, ram: 3, storage: 32, chipset: "MediaTek MT6737T (120° Geniş Açı Selfie)", screen: "5.5\" HD LCD", camera: "13 MP", battery: 3300, has5G: false },
  { name: "Sony Xperia XA2", year: 2018, category: "budget", price: 2999, ram: 3, storage: 32, chipset: "Snapdragon 630 (23MP 4K Video)", screen: "5.2\" FHD LCD", camera: "23 MP 4K", battery: 3300, has5G: false },
  { name: "Sony Xperia XA2 Ultra", year: 2018, category: "midrange", price: 3799, ram: 4, storage: 64, chipset: "Snapdragon 630 (Çift Ön Kamera & OIS Selfie)", screen: "6.0\" FHD LCD", camera: "23 MP + 16 MP OIS Ön Kamera", battery: 3580, has5G: false },
  { name: "Sony Xperia XA2 Plus", year: 2018, category: "midrange", price: 4299, ram: 6, storage: 64, chipset: "Snapdragon 630 (High-Resolution Audio)", screen: "6.0\" FHD+ 18:9 LCD", camera: "23 MP 4K", battery: 3580, has5G: false },
  { name: "Sony Xperia XZ2", year: 2018, category: "flagship", price: 6499, ram: 4, storage: 64, chipset: "Snapdragon 845 (4K HDR Video & 960fps Slow-Mo)", screen: "5.7\" FHD+ HDR LCD Dynamic Vibration", camera: "19 MP Motion Eye 960fps", battery: 3180, has5G: false },
  { name: "Sony Xperia XZ2 Compact", year: 2018, category: "flagship", price: 5499, ram: 4, storage: 64, chipset: "Snapdragon 845 (Kompakt Güç)", screen: "5.0\" FHD+ HDR LCD", camera: "19 MP Motion Eye", battery: 2870, has5G: false },
  { name: "Sony Xperia XZ2 Premium", year: 2018, category: "flagship", price: 8999, ram: 6, storage: 64, chipset: "Snapdragon 845 (4K HDR Ekran & Motion Eye Dual Kamera)", screen: "5.8\" 4K HDR LCD (3840x2160)", camera: "19 MP + 12 MP Siyah-Beyaz Çift Kamera", battery: 3540, has5G: false },
  { name: "Sony Xperia XZ3", year: 2018, category: "flagship", price: 7999, ram: 4, storage: 64, chipset: "Snapdragon 845 (QHD+ HDR OLED & Side Sense)", screen: "6.0\" QHD+ HDR OLED Bravia TV Motoru", camera: "19 MP Motion Eye 960fps", battery: 3300, has5G: false },

  // --- 2019 ---
  { name: "Sony Xperia L3", year: 2019, category: "budget", price: 2799, ram: 3, storage: 32, chipset: "Helio P22 (Çift Kamera & NFC)", screen: "5.7\" HD+ 18:9 Corning Gorilla Glass 5", camera: "13 MP + 2 MP Çift", battery: 3300, has5G: false },
  { name: "Sony Xperia 10", year: 2019, category: "midrange", price: 4499, ram: 3, storage: 64, chipset: "Snapdragon 630 (21:9 CinemaWide Ekran)", screen: "6.0\" FHD+ 21:9 CinemaWide LCD", camera: "13 MP + 5 MP Çift 4K Video", battery: 2870, has5G: false },
  { name: "Sony Xperia 10 Plus", year: 2019, category: "midrange", price: 5499, ram: 4, storage: 64, chipset: "Snapdragon 636 (2x Optik Zum & 21:9 Ekran)", screen: "6.5\" FHD+ 21:9 CinemaWide LCD", camera: "12 MP + 8 MP 2x Tele", battery: 3000, has5G: false },
  { name: "Sony Xperia 1", year: 2019, category: "flagship", price: 12999, ram: 6, storage: 128, chipset: "Snapdragon 855 (Dünyanın İlk 4K HDR OLED Akıllı Telefonu & CinemaPro)", screen: "6.5\" 4K HDR OLED (3840x1644) 21:9", camera: "12 MP OIS + 12 MP 2x Tele OIS + 12 MP UW (ZEISS)", battery: 3330, has5G: false },
  { name: "Sony Xperia 5", year: 2019, category: "flagship", price: 9999, ram: 6, storage: 128, chipset: "Snapdragon 855 (Kompakt 21:9 4K Sinematik)", screen: "6.1\" FHD+ HDR OLED 21:9", camera: "12 MP OIS + 12 MP 2x Tele OIS + 12 MP UW", battery: 3140, has5G: false },

  // --- 2020 ---
  { name: "Sony Xperia L4", year: 2020, category: "budget", price: 3499, ram: 3, storage: 64, chipset: "Helio P22 (21:9 Ekran & Üçlü Kamera)", screen: "6.2\" HD+ 21:9 LCD", camera: "13 MP + 5 MP UW + 2 MP", battery: 3580, has5G: false },
  { name: "Sony Xperia 10 II", year: 2020, category: "midrange", price: 6999, ram: 4, storage: 128, chipset: "Snapdragon 665 (IP68 Su Geçirmezlik & OLED)", screen: "6.0\" FHD+ OLED 21:9 Gorilla Glass 6", camera: "12 MP + 8 MP 2x Tele + 8 MP UW", battery: 3600, has5G: false },
  { name: "Sony Xperia 1 II", year: 2020, category: "flagship", price: 18999, ram: 8, storage: 256, chipset: "Snapdragon 865 5G (ZEISS T* Kaplama / 20fps Seri Çekim / 3.5mm Jack)", screen: "6.5\" 4K HDR OLED (3840x1644) 21:9 Motion Blur Reduction", camera: "12 MP OIS + 12 MP 3x Tele OIS + 12 MP UW + 3D iToF", battery: 4000, has5G: true },
  { name: "Sony Xperia 5 II", year: 2020, category: "flagship", price: 14999, ram: 8, storage: 128, chipset: "Snapdragon 865 5G (120Hz OLED & 240Hz Dokunmatik Örnekleme)", screen: "6.1\" FHD+ 120Hz OLED 21:9", camera: "12 MP OIS + 12 MP 3x Tele OIS + 12 MP UW", battery: 4000, has5G: true },
  { name: "Sony Xperia PRO", year: 2020, category: "flagship", price: 29999, ram: 12, storage: 512, chipset: "Snapdragon 865 5G (HDMI Girişli Harici Profesyonel Monitör)", screen: "6.5\" 4K HDR OLED HDMI Girdi Destekli", camera: "12 MP OIS + 12 MP Tele + 12 MP UW + 3D iToF", battery: 4000, has5G: true },

  // --- 2021 ---
  { name: "Sony Xperia 10 III", year: 2021, category: "midrange", price: 9999, ram: 6, storage: 128, chipset: "Snapdragon 690 5G (IP68 & OLED)", screen: "6.0\" FHD+ HDR OLED 21:9", camera: "12 MP + 8 MP 2x Tele + 8 MP UW", battery: 4500, has5G: true },
  { name: "Sony Xperia 10 III Lite", year: 2021, category: "midrange", price: 8499, ram: 6, storage: 64, chipset: "Snapdragon 690 5G", screen: "6.0\" FHD+ OLED 21:9", camera: "12 MP + 8 MP + 8 MP", battery: 4500, has5G: true },
  { name: "Sony Xperia 1 III", year: 2021, category: "flagship", price: 27999, ram: 12, storage: 256, chipset: "Snapdragon 888 5G (Dünyanın İlk 4K 120Hz OLED & Değişken Odaklı Periskop)", screen: "6.5\" 4K 120Hz HDR OLED 21:9", camera: "12 MP OIS + 12 MP (70mm-105mm Değişken Periskop OIS) + 12 MP UW", battery: 4500, has5G: true },
  { name: "Sony Xperia 5 III", year: 2021, category: "flagship", price: 21999, ram: 8, storage: 128, chipset: "Snapdragon 888 5G (Değişken Periskop Kompakt)", screen: "6.1\" FHD+ 120Hz HDR OLED 21:9", camera: "12 MP OIS + 12 MP Değişken Periskop OIS + 12 MP UW", battery: 4500, has5G: true },
  { name: "Sony Xperia PRO-I", year: 2021, category: "flagship", price: 39999, ram: 12, storage: 512, chipset: "Snapdragon 888 5G (1.0-inch Type Exmor RS Sensör & Fiziksel Diyafram)", screen: "6.5\" 4K 120Hz HDR OLED 21:9", camera: "12 MP 1.0\" Type OIS (f/2.0-f/4.0) + 12 MP 2x Tele + 12 MP UW", battery: 4500, has5G: true },

  // --- 2022 ---
  { name: "Sony Xperia 10 IV", year: 2022, category: "midrange", price: 12999, ram: 6, storage: 128, chipset: "Snapdragon 695 5G (Dünyanın En Hafif 5000 mAh 5G Telefonu - 161g)", screen: "6.0\" FHD+ OLED 21:9 Gorilla Glass Victus", camera: "12 MP OIS + 8 MP Tele + 8 MP UW", battery: 5000, has5G: true },
  { name: "Sony Xperia 1 IV", year: 2022, category: "flagship", price: 36999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (Gerçek 85mm-125mm Kesintisiz Optik Zum Periskop)", screen: "6.5\" 4K 120Hz HDR OLED (50% Daha Parlak)", camera: "12 MP OIS + 12 MP Kesintisiz Optik Zum OIS + 12 MP UW (Tümünde 4K 120fps)", battery: 5000, has5G: true },
  { name: "Sony Xperia 5 IV", year: 2022, category: "flagship", price: 28999, ram: 8, storage: 128, chipset: "Snapdragon 8 Gen 1 (Tüm Lenslerde 4K 120fps & Kablosuz Şarj)", screen: "6.1\" FHD+ 120Hz HDR OLED 21:9", camera: "12 MP OIS + 12 MP 2.5x Tele OIS + 12 MP UW", battery: 5000, has5G: true },

  // --- 2023 ---
  { name: "Sony Xperia 10 V", year: 2023, category: "midrange", price: 15999, ram: 6, storage: 128, chipset: "Snapdragon 695 5G (48MP OIS & Stereo Hoparlör)", screen: "6.1\" FHD+ OLED 21:9 (159 gram Tüy Hafiflik)", camera: "48 MP OIS + 8 MP Tele + 8 MP UW", battery: 5000, has5G: true },
  { name: "Sony Xperia 1 V", year: 2023, category: "flagship", price: 49999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 2 (Yeni Nesil Exmor T 2 Kat Gece Hassasiyeti)", screen: "6.5\" 4K 120Hz HDR OLED 21:9 Victus 2", camera: "52 MP (48MP Etkin) Exmor T OIS + 12 MP Optik Zoom OIS + 12 MP UW", battery: 5000, has5G: true },
  { name: "Sony Xperia 5 V", year: 2023, category: "flagship", price: 38999, ram: 8, storage: 256, chipset: "Snapdragon 8 Gen 2 (Exmor T Sensörlü Kompakt)", screen: "6.1\" FHD+ 120Hz HDR OLED 21:9", camera: "52 MP Exmor T OIS + 12 MP UW (2x Kayıpsız Sensör İçi Zum)", battery: 5000, has5G: true },

  // --- 2024 ---
  { name: "Sony Xperia 10 VI", year: 2024, category: "midrange", price: 19999, ram: 8, storage: 128, chipset: "Snapdragon 6 Gen 1 5G (2 Günlük Batarya Ömrü)", screen: "6.1\" FHD+ OLED 21:9 Victus", camera: "48 MP OIS + 8 MP UW", battery: 5000, has5G: true },
  { name: "Sony Xperia 1 VI", year: 2024, category: "flagship", price: 64999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 3 (85mm-170mm Telephoto Makro & Bravia AI Ekran)", screen: "6.5\" FHD+ 1-120Hz LTPO OLED 1.5x Parlaklık (19.5:9)", camera: "48 MP Exmor T OIS + 12 MP (85-170mm Optik Zoom Makro OIS) + 12 MP UW", battery: 5000, has5G: true },

  // --- 2025 ---
  { name: "Sony Xperia 10 VII", year: 2025, category: "midrange", price: 23999, ram: 8, storage: 256, chipset: "Snapdragon 7s Gen 3 5G", screen: "6.1\" FHD+ 120Hz OLED Victus 2", camera: "50 MP Exmor T OIS + 12 MP UW", battery: 5200, has5G: true },
  { name: "Sony Xperia 1 VII", year: 2025, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (3nm / Exmor T 2.0 & 200mm Optik Zoom)", screen: "6.5\" 4K 120Hz LTPO OLED 2500 Nits", camera: "50 MP Exmor T 2.0 1\" OIS + 50 MP (85-200mm Optik Zoom OIS) + 50 MP UW", battery: 5300, has5G: true },

  // --- 2026 ---
  { name: "Sony Xperia VIII", year: 2026, category: "flagship", price: 94999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Gen 5 (2nm / Sony Alpha Kamera Mühendisliği & 4K 144Hz)", screen: "6.5\" 4K 144Hz LTPO OLED 3000 Nits Victus 3", camera: "50 MP Exmor T 3.0 1\" OIS + 50 MP (85-240mm Optik Zoom OIS) + 50 MP UW", battery: 5500, has5G: true }
];

const sonyImages = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
];

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

const generatedSonyPhones = sonyModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `sony-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.name.includes('XZ') || m.name.includes('Xperia 1') || m.name.includes('Xperia 5') || m.name.includes('PRO');
  const rating = isFlagship ? Number((4.7 + (index % 3) * 0.1).toFixed(1)) : Number((4.4 + (index % 4) * 0.1).toFixed(1));
  const reviewCount = Math.floor(130 + (index * 31) % 680);
  const image = sonyImages[index % sonyImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-sny-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 14900,
      url: '#'
    },
    {
      id: `st-ty-sny-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 21500,
      url: '#'
    },
    {
      id: `st-vt-sny-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 13600,
      url: '#'
    },
    {
      id: `st-mm-sny-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 8900,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Sony TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Sony",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: isFlagship || m.year >= 2023,
    isFeatured: isFlagship && m.year >= 2024,
    highlights: [
      `${m.name} ZEISS & Sony Alpha Kamera Teknolojisi`,
      `${m.screen}`,
      `${m.ram} GB RAM & ${m.storage} GB Depolama`,
      `${m.battery} mAh Batarya Kapasitesi`
    ],
    image,
    storeOffers,
    priceHistory,
    specs: {
      screen: {
        size: m.screen.split(' ')[0] || "6.5\"",
        type: m.screen,
        resolution: m.screen.includes('4K') ? "3840 x 1644 px (4K HDR)" : (isFlagship ? "2520 x 1080 px" : "2400 x 1080 px"),
        refreshRate: m.screen.includes('144Hz') ? 144 : (m.screen.includes('120Hz') ? 120 : 60),
        ppi: m.screen.includes('4K') ? 643 : 449,
        brightnessNits: isFlagship ? 2500 : 1000
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2024 ? "4nm" : "7nm"),
        antutuScore: isFlagship ? 1890000 : 720000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR5X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: true
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "12 MP ZEISS T*",
        telephotoMp: m.camera.includes('Optik') || m.camera.includes('Periskop') ? "12 MP Kesintisiz Optik Zoom OIS" : "Yok",
        selfieMp: "12 MP 4K",
        videoRes: isFlagship ? "4K @ 120fps (Tüm Lenslerde)" : "4K @ 60fps",
        dxomarkScore: isFlagship ? 154 : 120
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: 30,
        wirelessCharging: isFlagship,
        reverseWireless: isFlagship
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: isFlagship ? "Wi-Fi 7" : "Wi-Fi 6",
        bluetooth: "5.4",
        hasNFC: true,
        hasesim: isFlagship
      },
      build: {
        weightGrams: isFlagship ? 187 : 161,
        thicknessMm: 8.3,
        waterResistance: "IP65/IP68 Su & Toz Geçirmezlik",
        frameMaterial: isFlagship ? "Cam & Oluklu Alüminyum Gövde (Sony Alpha Dokusu)" : "Polikarbonat / Cam"
      },
      software: {
        osName: m.year >= 2026 ? "Android 16 (CinemaPro & PhotographyPro)" : (m.year >= 2024 ? "Android 14" : "Android 11"),
        updateYears: m.year >= 2024 ? 4 : 3
      }
    }
  };
});

// Read existing mockData.ts
const mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
let fileContent = fs.readFileSync(mockDataPath, 'utf-8');

const existingPhonesMatch = fileContent.match(/export const mockSmartphones: Smartphone\[\] = (\[[\s\S]*?\]);/);

if (!existingPhonesMatch) {
  console.error("Could not match mockSmartphones array in mockData.ts!");
  process.exit(1);
}

const existingPhones = JSON.parse(existingPhonesMatch[1]);
console.log(`Current phone count in mockData.ts: ${existingPhones.length}`);

// Remove older Sony entries to replace with our exact 34-model Sony Xperia catalog
const nonSonyPhones = existingPhones.filter(p => p.brand !== 'Sony');
const combinedPhones = [...nonSonyPhones, ...generatedSonyPhones];

console.log(`Generated ${generatedSonyPhones.length} comprehensive Sony Xperia smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Sony Xperia 2018-2026 models!");
