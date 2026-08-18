const fs = require('fs');
const path = require('path');

const casperModels = [
  // --- 2018 - 2020 ---
  { name: "Casper VIA A3", year: 2018, category: "budget", price: 2499, ram: 4, storage: 64, chipset: "Helio P60 (İlk Çentikli Casper Ekranı)", screen: "6.2\" FHD+ IPS LCD", camera: "16 MP + 5 MP Çift", battery: 3400, has5G: false },
  { name: "Casper VIA A3 Plus", year: 2018, category: "budget", price: 3199, ram: 6, storage: 64, chipset: "Helio P60 (Kızılötesi Yüz Tanıma)", screen: "6.2\" FHD+ IPS LCD", camera: "16 MP + 5 MP Çift", battery: 3400, has5G: false },
  { name: "Casper VIA E2", year: 2018, category: "budget", price: 1699, ram: 2, storage: 16, chipset: "MT6737T", screen: "5.5\" HD+ LCD", camera: "13 MP", battery: 3000, has5G: false },
  { name: "Casper VIA E3", year: 2019, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Helio A22", screen: "5.71\" HD+ Damla Çentik", camera: "13 MP + 2 MP", battery: 3200, has5G: false },
  { name: "Casper VIA G1", year: 2018, category: "budget", price: 1899, ram: 3, storage: 32, chipset: "Snapdragon 425", screen: "5.7\" HD+ 18:9 LCD", camera: "13 MP", battery: 3000, has5G: false },
  { name: "Casper VIA G1 Plus", year: 2018, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Snapdragon 425", screen: "5.99\" HD+ 18:9 LCD", camera: "13 MP", battery: 3000, has5G: false },
  { name: "Casper VIA G3", year: 2019, category: "budget", price: 2399, ram: 3, storage: 64, chipset: "Helio P22 (Degrade Renkli Cam Gövde)", screen: "6.22\" HD+ Damla Çentik", camera: "13 MP + 2 MP", battery: 3260, has5G: false },
  { name: "Casper VIA S", year: 2019, category: "budget", price: 2599, ram: 3, storage: 64, chipset: "Helio P22 (Damla Çentik & Ergonomik Kasa)", screen: "6.22\" HD+ IPS LCD", camera: "13 MP + 2 MP", battery: 3500, has5G: false },
  { name: "Casper VIA E4", year: 2020, category: "budget", price: 2799, ram: 3, storage: 32, chipset: "Helio A20 (4000 mAh Batarya)", screen: "6.09\" HD+ LCD", camera: "13 MP + 2 MP", battery: 4000, has5G: false },
  { name: "Casper VIA X20", year: 2020, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Helio P70 (Dörtlü Kamera & Ekrana Gömülü Kamera)", screen: "6.53\" FHD+ IPS LCD", camera: "48 MP + 8 MP UW + 2 MP + 2 MP", battery: 4000, has5G: false },
  { name: "Casper VIA G4", year: 2020, category: "budget", price: 2999, ram: 3, storage: 32, chipset: "Helio P22", screen: "6.22\" HD+ LCD", camera: "13 MP + 2 MP", battery: 3500, has5G: false },
  { name: "Casper VIA G5", year: 2020, category: "budget", price: 3499, ram: 3, storage: 64, chipset: "Helio P22 (5000 mAh Batarya)", screen: "6.52\" HD+ LCD", camera: "13 MP + 5 MP UW + 2 MP", battery: 5000, has5G: false },

  // --- 2021 - 2023 ---
  { name: "Casper VIA F20", year: 2021, category: "midrange", price: 4999, ram: 4, storage: 128, chipset: "Helio P35 (Dörtlü Kamera & 5000 mAh)", screen: "6.55\" HD+ LCD", camera: "48 MP + 5 MP UW + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA M30", year: 2022, category: "budget", price: 4299, ram: 4, storage: 64, chipset: "Helio G25", screen: "6.5\" HD+ LCD", camera: "13 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA M30 Plus", year: 2022, category: "budget", price: 4999, ram: 4, storage: 128, chipset: "Helio G25 (128GB Depolama)", screen: "6.5\" HD+ LCD", camera: "13 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA F30", year: 2022, category: "midrange", price: 5499, ram: 4, storage: 128, chipset: "Unisoc T606 (50MP Üçlü Kamera)", screen: "6.5\" HD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA F30 Plus", year: 2023, category: "midrange", price: 6299, ram: 8, storage: 128, chipset: "Unisoc T606 (8GB RAM & 50MP)", screen: "6.5\" HD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA X30", year: 2023, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Helio G99 (50MP Kamera & 33W Şarj)", screen: "6.5\" FHD+ 90Hz IPS LCD", camera: "50 MP + 8 MP UW + 2 MP", battery: 4600, has5G: false },
  { name: "Casper VIA X30 Plus", year: 2023, category: "midrange", price: 8999, ram: 8, storage: 256, chipset: "Helio G99 (256GB Depolama & 33W)", screen: "6.5\" FHD+ 90Hz IPS LCD", camera: "50 MP + 8 MP UW + 2 MP", battery: 4600, has5G: false },
  { name: "Casper VIA E30", year: 2023, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Helio G35", screen: "6.5\" HD+ LCD", camera: "13 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA E30 Plus", year: 2023, category: "budget", price: 4999, ram: 4, storage: 128, chipset: "Helio G35 (128GB Depolama)", screen: "6.5\" HD+ LCD", camera: "13 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA M35", year: 2023, category: "budget", price: 5799, ram: 4, storage: 128, chipset: "Helio G37 (50MP Kamera)", screen: "6.52\" HD+ 90Hz LCD", camera: "50 MP + 2 MP", battery: 5000, has5G: false },

  // --- 2024 - 2026 ---
  { name: "Casper VIA X40", year: 2024, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Helio G99 (AMOLED Ekran & 50MP Kamera & 33W)", screen: "6.67\" FHD+ 120Hz AMOLED 1200 Nits", camera: "50 MP + 5 MP UW + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA A40", year: 2024, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Helio G88 (6.78 inç Ekran & 50MP)", screen: "6.78\" FHD+ 90Hz IPS LCD", camera: "50 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA M40", year: 2024, category: "budget", price: 6999, ram: 6, storage: 128, chipset: "Unisoc T616 (50MP Kamera)", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA M45", year: 2025, category: "budget", price: 8499, ram: 8, storage: 256, chipset: "Helio G91 (50MP Kamera & 256GB)", screen: "6.67\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Casper VIA X45", year: 2026, category: "midrange", price: 15999, ram: 12, storage: 256, chipset: "Dimensity 7050 5G (İlk 5G Casper VIA & 120Hz AMOLED)", screen: "6.67\" FHD+ 120Hz AMOLED 33W", camera: "50 MP OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true }
];

const casperImages = [
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"
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

const generatedCasperPhones = casperModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `casper-${slug}-${index + 1}`;
  const isFlagship = m.name.includes('X40') || m.name.includes('X45') || m.name.includes('X30');
  const rating = isFlagship ? Number((4.6 + (index % 3) * 0.1).toFixed(1)) : Number((4.3 + (index % 4) * 0.1).toFixed(1));
  const reviewCount = Math.floor(95 + (index * 29) % 480);
  const image = casperImages[index % casperImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-csp-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.8,
      sellerReviews: 9400,
      url: '#'
    },
    {
      id: `st-ty-csp-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 14200,
      url: '#'
    },
    {
      id: `st-vt-csp-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 8900,
      url: '#'
    },
    {
      id: `st-mm-csp-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.7,
      sellerReviews: 5400,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Casper TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Casper",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: isFlagship || m.year >= 2023,
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
        size: m.screen.split(' ')[0] || "6.5\"",
        type: m.screen,
        resolution: isFlagship ? "2400 x 1080 px" : "1600 x 720 px",
        refreshRate: m.screen.includes('120Hz') ? 120 : (m.screen.includes('90Hz') ? 90 : 60),
        ppi: isFlagship ? 395 : 270,
        brightnessNits: isFlagship ? 1200 : 500
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "6nm" : "12nm",
        antutuScore: isFlagship ? 420000 : 180000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR4X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: true
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: m.camera.includes('UW') ? "8 MP" : "Yok",
        telephotoMp: "Yok",
        selfieMp: "13 MP",
        videoRes: "1080p @ 30fps",
        dxomarkScore: isFlagship ? 108 : 85
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('33W') ? 33 : 18,
        wirelessCharging: false,
        reverseWireless: false
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: "Wi-Fi 5",
        bluetooth: "5.0",
        hasNFC: m.year >= 2024,
        hasesim: false
      },
      build: {
        weightGrams: 190,
        thicknessMm: 8.6,
        waterResistance: "Darbe ve Çizilmeye Dayanıklı Gövde",
        frameMaterial: "Polikarbonat / Cam Görünümlü Arka Kapak"
      },
      software: {
        osName: m.year >= 2026 ? "Android 15" : (m.year >= 2024 ? "Android 14" : "Android 11"),
        updateYears: 2
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

// Remove older Casper entries to replace with our exact 25-model Casper VIA catalog
const nonCasperPhones = existingPhones.filter(p => p.brand !== 'Casper');
const combinedPhones = [...nonCasperPhones, ...generatedCasperPhones];

console.log(`Generated ${generatedCasperPhones.length} comprehensive Casper VIA smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Casper VIA 2018-2026 models!");
