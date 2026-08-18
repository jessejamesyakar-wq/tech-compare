const fs = require('fs');
const path = require('path');

const reederModels = [
  // --- P13 Serisi (2019 - 2022) ---
  { name: "Reeder P13", year: 2019, category: "budget", price: 1499, ram: 2, storage: 16, chipset: "MediaTek MT6739", screen: "5.7\" HD+ LCD", camera: "8 MP", battery: 2500, has5G: false },
  { name: "Reeder P13 Blue", year: 2020, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "MediaTek Helio A22", screen: "6.09\" HD+ Damla Çentik", camera: "8 MP + 0.3 MP", battery: 4080, has5G: false },
  { name: "Reeder P13 Blue Max", year: 2020, category: "budget", price: 2499, ram: 4, storage: 64, chipset: "Helio P22 (4680 mAh Batarya)", screen: "6.49\" HD+ Damla Çentik", camera: "13 MP + 0.3 MP + 0.3 MP", battery: 4680, has5G: false },
  { name: "Reeder P13 Blue Max Lite", year: 2021, category: "budget", price: 2199, ram: 2, storage: 32, chipset: "Unisoc SC9863A", screen: "6.22\" HD+ LCD", camera: "13 MP + 0.3 MP", battery: 4000, has5G: false },
  { name: "Reeder P13 Blue Max Pro", year: 2021, category: "budget", price: 2999, ram: 6, storage: 128, chipset: "Helio P60 (Dörtlü Kamera)", screen: "6.53\" HD+ LCD", camera: "16 MP + 5 MP + 2 MP + 0.3 MP", battery: 5380, has5G: false },
  { name: "Reeder P13 Blue Max Pro Lite", year: 2021, category: "budget", price: 2699, ram: 4, storage: 64, chipset: "Unisoc SC9863A", screen: "6.51\" HD+ LCD", camera: "13 MP + 2 MP + 0.3 MP", battery: 5000, has5G: false },
  { name: "Reeder P13 Blue Max 2022", year: 2022, category: "budget", price: 3299, ram: 4, storage: 64, chipset: "Unisoc T310 (Yenilenmiş Tasarım)", screen: "6.51\" HD+ LCD", camera: "13 MP + 2 MP", battery: 5000, has5G: false },

  // --- S19 ve S Serisi (2021 - 2024) ---
  { name: "Reeder S19 Max", year: 2021, category: "budget", price: 3999, ram: 4, storage: 128, chipset: "Unisoc T606 (13MP Üçlü Kamera)", screen: "6.5\" HD+ LCD", camera: "13 MP + 2 MP + 0.3 MP", battery: 5000, has5G: false },
  { name: "Reeder S19 Max Pro", year: 2022, category: "midrange", price: 4999, ram: 6, storage: 256, chipset: "Unisoc T606 (64MP Üçlü Kamera & 256GB)", screen: "6.51\" HD+ LCD", camera: "64 MP + 2 MP + 0.3 MP", battery: 5000, has5G: false },
  { name: "Reeder S19 Max Pro S", year: 2023, category: "midrange", price: 5999, ram: 8, storage: 128, chipset: "Unisoc T606 (64MP Kamera & 8GB RAM)", screen: "6.7\" HD+ 90Hz LCD", camera: "64 MP + 2 MP + 0.3 MP", battery: 5000, has5G: false },
  { name: "Reeder S19 Max Pro S Edge", year: 2023, category: "midrange", price: 6999, ram: 8, storage: 256, chipset: "Unisoc T616 (108MP Kamera & Kavisli Ekran)", screen: "6.7\" FHD+ 120Hz Kavisli AMOLED", camera: "108 MP + 8 MP UW + 2 MP", battery: 5000, has5G: false },
  { name: "Reeder S19 Max Pro S Zoom", year: 2024, category: "midrange", price: 7499, ram: 8, storage: 256, chipset: "Unisoc T616 (108MP Periskop Görünümlü Kamera)", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "108 MP + 8 MP UW + 2 MP", battery: 5000, has5G: false },

  // --- S23 ve Yeni Nesil Seri (2024 - 2026) ---
  { name: "Reeder S23 Pro Max", year: 2024, category: "midrange", price: 8999, ram: 8, storage: 256, chipset: "Unisoc T616 (Dinamik Ada & 108MP Kamera)", screen: "6.7\" FHD+ 120Hz LCD", camera: "108 MP + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Reeder S23 SE", year: 2024, category: "budget", price: 4499, ram: 4, storage: 128, chipset: "Unisoc T606 (Dinamik Ada Arayüzü)", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Reeder S71", year: 2025, category: "midrange", price: 9999, ram: 8, storage: 256, chipset: "Helio G99 (108MP Kamera & 33W Şarj)", screen: "6.67\" FHD+ 120Hz AMOLED 1000 Nits", camera: "108 MP + 8 MP UW + 2 MP", battery: 5000, has5G: false },
  { name: "Reeder S919", year: 2026, category: "midrange", price: 12999, ram: 12, storage: 256, chipset: "Dimensity 7020 5G (İlk 5G Reeder Amiral Gemisi)", screen: "6.78\" FHD+ 120Hz AMOLED 33W", camera: "108 MP OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "Reeder S919 SE", year: 2026, category: "budget", price: 8999, ram: 8, storage: 256, chipset: "Dimensity 6100+ 5G (5G Destekli Bütçe Dostu)", screen: "6.72\" FHD+ 120Hz LCD", camera: "50 MP + 2 MP", battery: 5000, has5G: true }
];

const reederImages = [
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

const generatedReederPhones = reederModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `reeder-${slug}-${index + 1}`;
  const isFlagship = m.name.includes('S919') || m.name.includes('S23 Pro Max') || m.name.includes('S71');
  const rating = isFlagship ? Number((4.6 + (index % 3) * 0.1).toFixed(1)) : Number((4.2 + (index % 4) * 0.1).toFixed(1));
  const reviewCount = Math.floor(80 + (index * 26) % 420);
  const image = reederImages[index % reederImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-rdr-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.8,
      sellerReviews: 8800,
      url: '#'
    },
    {
      id: `st-ty-rdr-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 13100,
      url: '#'
    },
    {
      id: `st-vt-rdr-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 7900,
      url: '#'
    },
    {
      id: `st-mm-rdr-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.7,
      sellerReviews: 4800,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Reeder TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Reeder",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: isFlagship || m.year >= 2023,
    isFeatured: isFlagship && m.year >= 2024,
    highlights: [
      `${m.name} Yerli Üretim Samsun Tesisleri Garantili`,
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
        brightnessNits: isFlagship ? 1000 : 450
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "6nm" : "12nm",
        antutuScore: isFlagship ? 380000 : 160000
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
        dxomarkScore: isFlagship ? 104 : 80
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
        weightGrams: 185,
        thicknessMm: 8.5,
        waterResistance: "Çizilmeye Dayanıklı Kasa",
        frameMaterial: "Polikarbonat Gövde"
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

// Remove older Reeder entries to replace with our exact 17-model Reeder catalog
const nonReederPhones = existingPhones.filter(p => p.brand !== 'Reeder');
const combinedPhones = [...nonReederPhones, ...generatedReederPhones];

console.log(`Generated ${generatedReederPhones.length} comprehensive Reeder smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Reeder 2019-2026 models!");
