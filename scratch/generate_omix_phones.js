const fs = require('fs');
const path = require('path');

const omixModels = [
  // --- X Series Historic (2021 - 2023) ---
  { name: "Omix X500", year: 2021, category: "budget", price: 3999, ram: 4, storage: 128, chipset: "Helio G80", screen: "6.67\" FHD+ IPS LCD", camera: "48 MP + 5 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Omix X300", year: 2022, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Helio G35", screen: "6.52\" HD+ IPS LCD", camera: "16 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Omix X400", year: 2022, category: "budget", price: 4499, ram: 4, storage: 128, chipset: "Helio G37", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Omix X600", year: 2022, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Helio G88 (NFC & 90Hz)", screen: "6.78\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Omix X700", year: 2023, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Helio G99 (108MP Kamera & 120Hz)", screen: "6.78\" FHD+ 120Hz IPS LCD", camera: "108 MP + 5 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Omix X3", year: 2023, category: "budget", price: 4999, ram: 4, storage: 64, chipset: "Unisoc T606", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- X Series Modern (2024 - 2026) ---
  { name: "Omix X4", year: 2024, category: "budget", price: 6499, ram: 6, storage: 128, chipset: "Helio G85", screen: "6.6\" HD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Omix X5", year: 2024, category: "budget", price: 7999, ram: 8, storage: 128, chipset: "Helio G88 (90Hz FHD+)", screen: "6.78\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Omix X6", year: 2025, category: "budget", price: 9999, ram: 8, storage: 256, chipset: "Helio G99 (108MP Kamera)", screen: "6.78\" FHD+ 120Hz LCD", camera: "108 MP OIS + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Omix X7", year: 2026, category: "midrange", price: 14999, ram: 12, storage: 256, chipset: "Dimensity 7020 5G (66W Fast Charge)", screen: "6.78\" FHD+ 120Hz 3D Kavisli AMOLED", camera: "108 MP OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },

  // --- O Series (2024 - 2026) ---
  { name: "Omix O1 Icon", year: 2024, category: "budget", price: 5999, ram: 4, storage: 128, chipset: "Unisoc T606 (Ikonik Tasarım)", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP AI Çift", battery: 5000, has5G: false },
  { name: "Omix O1 Neo", year: 2025, category: "budget", price: 7499, ram: 6, storage: 128, chipset: "Helio G85 (Fiyat/Performans Kralı)", screen: "6.6\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Omix O1 Next 5G", year: 2026, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 6080 5G (5G Destekli Güncel)", screen: "6.78\" FHD+ 120Hz LCD", camera: "108 MP OIS + 2 MP", battery: 5000, has5G: true }
];

const omixImages = [
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

const generatedOmixPhones = omixModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `omix-${slug}-${index + 1}`;
  const isFlagship = m.category === 'midrange' || m.name.includes('5G') || m.name.includes('X7');
  const rating = isFlagship ? Number((4.5 + (index % 4) * 0.1).toFixed(1)) : Number((4.1 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(75 + (index * 29) % 480);
  const image = omixImages[index % omixImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-omx-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 10500,
      url: '#'
    },
    {
      id: `st-ty-omx-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 13200,
      url: '#'
    },
    {
      id: `st-vt-omx-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 11100,
      url: '#'
    },
    {
      id: `st-mm-omx-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 6900,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Omix TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Omix",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: isFlagship || m.year >= 2024,
    isFeatured: isFlagship && m.year >= 2024,
    highlights: [
      `${m.name} Orijinal Türkiye Garantili`,
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
        resolution: isFlagship ? "2400 x 1080 px" : "1600 x 720 px",
        refreshRate: m.screen.includes('120Hz') ? 120 : (m.screen.includes('90Hz') ? 90 : 60),
        ppi: isFlagship ? 395 : 270,
        brightnessNits: isFlagship ? 1200 : 600
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "6nm" : "12nm",
        antutuScore: isFlagship ? 650000 : 380000
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
        ultrawideMp: "5 MP",
        telephotoMp: "Yok",
        selfieMp: "16 MP",
        videoRes: "1080p @ 30fps",
        dxomarkScore: isFlagship ? 112 : 98
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('66W') ? 66 : 18,
        wirelessCharging: false,
        reverseWireless: false
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: "Wi-Fi 5",
        bluetooth: "5.0",
        hasNFC: m.name.includes('X600') || isFlagship,
        hasesim: false
      },
      build: {
        weightGrams: 190,
        thicknessMm: 8.3,
        waterResistance: "Yok",
        frameMaterial: "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "Android 16 (Mix UI)" : "Android 13",
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

// Remove any older Omix phones that we are replacing with our exhaustive catalog
const nonOmixPhones = existingPhones.filter(p => p.brand !== 'Omix');
const combinedPhones = [...nonOmixPhones, ...generatedOmixPhones];

console.log(`Generated ${generatedOmixPhones.length} comprehensive Omix smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Omix 2021-2026 smartphone models!");
