const fs = require('fs');
const path = require('path');

const gmModels = [
  // --- 2018 ---
  { name: "General Mobile GM 9 Pro", year: 2018, category: "midrange", price: 3499, ram: 4, storage: 64, chipset: "Snapdragon 660", screen: "6.01\" FHD+ AMOLED (DxOMark Ödüllü Yerli Efsane)", camera: "12 MP Sony IMX363 f/1.8 OIS + 5 MP", battery: 3800, has5G: false },
  { name: "General Mobile GM 8", year: 2018, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Snapdragon 435", screen: "5.7\" HD+ IPS LCD (Gorilla Glass)", camera: "13 MP", battery: 3075, has5G: false },
  { name: "General Mobile GM 8 Go", year: 2018, category: "budget", price: 1599, ram: 1, storage: 16, chipset: "MT6739", screen: "5.5\" HD+ IPS LCD (Android Go)", camera: "13 MP", battery: 3500, has5G: false },

  // --- 2019 ---
  { name: "General Mobile GM 9 Plus", year: 2019, category: "budget", price: 2999, ram: 3, storage: 32, chipset: "Helio P60", screen: "6.23\" FHD+ Damla Çentikli LCD", camera: "12 MP + 5 MP Çift", battery: 3450, has5G: false },
  { name: "General Mobile GM 9 Go", year: 2019, category: "budget", price: 1799, ram: 1, storage: 16, chipset: "MT6739", screen: "5.5\" HD+ IPS LCD", camera: "13 MP", battery: 3500, has5G: false },

  // --- 2020 ---
  { name: "General Mobile GM 20", year: 2020, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Helio P22", screen: "6.09\" HD+ IPS LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "General Mobile GM 20 Pro", year: 2020, category: "budget", price: 3999, ram: 6, storage: 128, chipset: "Helio P70 (48MP Yapay Zeka Kamera)", screen: "6.3\" FHD+ AMOLED", camera: "48 MP + 8 MP UW + 2 MP Üçlü", battery: 4050, has5G: false },
  { name: "General Mobile GM 20d", year: 2020, category: "budget", price: 2499, ram: 3, storage: 32, chipset: "Helio P22", screen: "6.09\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 4000, has5G: false },
  { name: "General Mobile GM 10", year: 2020, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Helio A20", screen: "6.09\" HD+ IPS LCD", camera: "13 MP", battery: 4000, has5G: false },

  // --- 2021 ---
  { name: "General Mobile GM 21", year: 2021, category: "budget", price: 3499, ram: 3, storage: 32, chipset: "Spreadtrum SC9863A", screen: "6.52\" HD+ IPS LCD", camera: "13 MP + 2 MP + 0.08 MP Üçlü", battery: 5000, has5G: false },
  { name: "General Mobile GM 21 Plus", year: 2021, category: "budget", price: 4299, ram: 4, storage: 64, chipset: "Helio G35", screen: "6.52\" HD+ IPS LCD", camera: "13 MP + 2 MP + 0.08 MP Üçlü", battery: 5050, has5G: false },
  { name: "General Mobile GM 21 Pro", year: 2021, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Helio G90T (108MP Süper Piksel Modu)", screen: "6.67\" FHD+ IPS LCD", camera: "64 MP (108MP Modu) + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },

  // --- 2022 ---
  { name: "General Mobile GM 22", year: 2022, category: "budget", price: 4499, ram: 3, storage: 32, chipset: "Helio P22", screen: "6.52\" HD+ IPS LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "General Mobile GM 22 Plus", year: 2022, category: "budget", price: 5499, ram: 4, storage: 64, chipset: "Helio G80", screen: "6.78\" FHD+ IPS LCD", camera: "48 MP + 5 MP + 2 MP Üçlü", battery: 6000, has5G: false },
  { name: "General Mobile GM 22 Pro", year: 2022, category: "budget", price: 6999, ram: 8, storage: 128, chipset: "Helio G95 (108MP Kamera & 18W Şarj)", screen: "6.78\" FHD+ IPS LCD", camera: "108 MP + 5 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "General Mobile GM 22S", year: 2022, category: "budget", price: 4999, ram: 4, storage: 64, chipset: "Helio G25", screen: "6.52\" HD+ IPS LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },

  // --- 2023 ---
  { name: "General Mobile GM Phoenix 5G", year: 2023, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Dimensity 7050 5G (Kavisli 120Hz AMOLED)", screen: "6.78\" FHD+ 120Hz 3D Kavisli AMOLED (200MP Modu)", camera: "200 MP Matrix OIS + 8 MP UW + 2 MP + 2 MP", battery: 4700, has5G: true },
  { name: "General Mobile GM 24 Pro", year: 2023, category: "midrange", price: 10999, ram: 8, storage: 256, chipset: "Helio G99 (66W Fast Charge / 120Hz AMOLED)", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "108 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "General Mobile GM 23", year: 2023, category: "budget", price: 5999, ram: 4, storage: 128, chipset: "Helio G37 (50MP Kamera)", screen: "6.52\" HD+ 90Hz IPS LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "General Mobile GM 23 SE", year: 2023, category: "budget", price: 4999, ram: 4, storage: 64, chipset: "Helio G36", screen: "6.52\" HD+ 90Hz IPS LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2024 - 2026 ---
  { name: "General Mobile Era 30", year: 2024, category: "budget", price: 7999, ram: 6, storage: 128, chipset: "Helio G88", screen: "6.78\" FHD+ 90Hz LCD", camera: "50 MP AI Çift", battery: 5000, has5G: false },
  { name: "General Mobile Era 30 Pro", year: 2024, category: "budget", price: 9999, ram: 8, storage: 256, chipset: "Helio G99 (33W Fast Charge)", screen: "6.78\" FHD+ 120Hz AMOLED", camera: "108 MP OIS + 2 MP Çift", battery: 5000, has5G: false },
  { name: "General Mobile Era 50 5G", year: 2025, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Dimensity 6100+ 5G", screen: "6.78\" FHD+ 120Hz AMOLED (45W Şarj)", camera: "108 MP OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "General Mobile GM 26 5G", year: 2025, category: "midrange", price: 11999, ram: 8, storage: 128, chipset: "Dimensity 6080 5G", screen: "6.78\" FHD+ 120Hz LCD", camera: "50 MP OIS + 2 MP", battery: 5000, has5G: true },
  { name: "General Mobile GM 26 Pro 5G", year: 2026, category: "midrange", price: 16999, ram: 12, storage: 256, chipset: "Dimensity 7020 5G (66W Fast Charge)", screen: "6.78\" FHD+ 120Hz Kavisli AMOLED", camera: "108 MP OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "General Mobile GM Fenix II Pro 5G", year: 2026, category: "flagship", price: 24999, ram: 12, storage: 512, chipset: "Dimensity 8300 Ultra 5G (Yerli Zirve Amiral Gemisi)", screen: "6.78\" 1.5K 144Hz 3D Kavisli AMOLED (66W & Kablosuz Şarj)", camera: "200 MP Matrix OIS + 50 MP 3x Tele + 12 MP UW", battery: 5200, has5G: true }
];

const gmImages = [
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

const generatedGmPhones = gmModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `general-mobile-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.name.includes('Phoenix') || m.name.includes('Fenix');
  const rating = isFlagship ? Number((4.5 + (index % 4) * 0.1).toFixed(1)) : Number((4.1 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(85 + (index * 31) % 520);
  const image = gmImages[index % gmImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-gm-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 12400,
      url: '#'
    },
    {
      id: `st-ty-gm-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 16800,
      url: '#'
    },
    {
      id: `st-vt-gm-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Yerli Üretim Garanti'],
      sellerRating: 4.9,
      sellerReviews: 13500,
      url: '#'
    },
    {
      id: `st-mm-gm-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 8100,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'General Mobile TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "General Mobile",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: isFlagship || m.year >= 2024,
    isFeatured: isFlagship && m.year >= 2024,
    highlights: [
      `${m.name} Yerli Üretim Türkiye Garantili`,
      `${m.screen}`,
      `${m.ram} GB RAM & ${m.storage} GB Depolama`,
      `${m.battery} mAh Batarya Kapasitesi`
    ],
    image,
    storeOffers,
    priceHistory,
    specs: {
      screen: {
        size: m.screen.split(' ')[0] || "6.78\"",
        type: m.screen,
        resolution: isFlagship ? "2712 x 1220 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (m.screen.includes('120Hz') ? 120 : 90),
        ppi: isFlagship ? 430 : 380,
        brightnessNits: isFlagship ? 1800 : 900
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "4nm" : (m.year >= 2024 ? "6nm" : "12nm"),
        antutuScore: isFlagship ? 1420000 : 540000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR4X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: !isFlagship
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "8 MP",
        telephotoMp: isFlagship ? "50 MP 3x Telephoto" : "Yok",
        selfieMp: m.name.includes('Pro') ? "32 MP HD" : "16 MP",
        videoRes: isFlagship ? "4K @ 60fps" : "1080p @ 30fps",
        dxomarkScore: isFlagship ? 138 : 105
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('66W') || m.chipset.includes('66W') ? 66 : (m.name.includes('Pro') ? 33 : 18),
        wirelessCharging: isFlagship,
        reverseWireless: false
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: isFlagship ? "Wi-Fi 6" : "Wi-Fi 5",
        bluetooth: "5.3",
        hasNFC: true,
        hasesim: false
      },
      build: {
        weightGrams: isFlagship ? 198 : 185,
        thicknessMm: 8.1,
        waterResistance: "IP54 Su Sıçramasına Dayanıklı",
        frameMaterial: isFlagship ? "Alüminyum / Cam" : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "Android 16 (GM OS)" : (m.year >= 2024 ? "Android 14" : "Android 12"),
        updateYears: 3
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

// Remove any older General Mobile phones that we are replacing with our exhaustive catalog
const nonGmPhones = existingPhones.filter(p => p.brand !== 'General Mobile');
const combinedPhones = [...nonGmPhones, ...generatedGmPhones];

console.log(`Generated ${generatedGmPhones.length} comprehensive General Mobile models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all General Mobile 2018-2026 models!");
