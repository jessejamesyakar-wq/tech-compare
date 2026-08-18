const fs = require('fs');
const path = require('path');

const nothingFullCatalog = [
  // --- 2022 ---
  {
    name: "Nothing Phone (1)",
    year: 2022,
    month: "Temmuz 2022",
    category: "midrange",
    price: 14999,
    ram: 8,
    storage: 256,
    chipset: "Snapdragon 778G+ 5G (İkonik 900 LED Glyph Arayüzü)",
    screen: "6.55\" FHD+ 120Hz OLED Gorilla Glass 5",
    camera: "50 MP Sony IMX766 OIS + 50 MP Samsung JN1 UW",
    battery: 4500,
    has5G: true
  },

  // --- 2023 ---
  {
    name: "Nothing Phone (2)",
    year: 2023,
    month: "Temmuz 2023",
    category: "flagship",
    price: 27999,
    ram: 12,
    storage: 512,
    chipset: "Snapdragon 8+ Gen 1 (33 Bölgeli Gelişmiş Glyph Arayüzü)",
    screen: "6.7\" FHD+ 120Hz LTPO OLED 1600 Nits",
    camera: "50 MP Sony IMX890 OIS + 50 MP Samsung JN1 UW",
    battery: 4700,
    has5G: true
  },

  // --- 2024 ---
  {
    name: "Nothing Phone (2a)",
    year: 2024,
    month: "Mart 2024",
    category: "midrange",
    price: 18999,
    ram: 12,
    storage: 256,
    chipset: "Dimensity 7200 Pro 5G (Merkezi Kamera & 3 Bölgeli Glyph)",
    screen: "6.7\" FHD+ 120Hz Flexible AMOLED 1300 Nits",
    camera: "50 MP OIS + 50 MP UW",
    battery: 5000,
    has5G: true
  },
  {
    name: "CMF Phone 1",
    year: 2024,
    month: "Temmuz 2024",
    category: "budget",
    price: 11999,
    ram: 8,
    storage: 128,
    chipset: "Dimensity 7300 5G (Değiştirilebilir Arka Kasa & Modüler Kadran)",
    screen: "6.67\" FHD+ 120Hz Super AMOLED 2000 Nits",
    camera: "50 MP Sony IMX882 + 2 MP Derinlik",
    battery: 5000,
    has5G: true
  },
  {
    name: "Nothing Phone (2a) Plus",
    year: 2024,
    month: "Temmuz 2024",
    category: "midrange",
    price: 21999,
    ram: 12,
    storage: 256,
    chipset: "Dimensity 7350 Pro 5G (Metalik Tasarım & 50MP 4K Selfie)",
    screen: "6.7\" FHD+ 120Hz AMOLED 1300 Nits",
    camera: "50 MP OIS + 50 MP UW (50 MP 4K Selfie)",
    battery: 5000,
    has5G: true
  },

  // --- 2025 ---
  {
    name: "Nothing Phone (3)",
    year: 2025,
    month: "Temmuz 2025",
    category: "flagship",
    price: 39999,
    ram: 16,
    storage: 512,
    chipset: "Snapdragon 8s Gen 3 (Matrix AI Glyph & Şeffaf Cam Zirve)",
    screen: "6.78\" 1.5K 144Hz LTPO OLED 3000 Nits",
    camera: "50 MP Sony LYT-808 OIS + 50 MP 3x Periskop OIS + 50 MP UW",
    battery: 5200,
    has5G: true
  },
  {
    name: "CMF Phone 2 Pro",
    year: 2025,
    month: "Nisan 2025",
    category: "midrange",
    price: 15999,
    ram: 12,
    storage: 256,
    chipset: "Dimensity 7400 5G (Modüler Aksesuar Girişleri & OIS Kamera)",
    screen: "6.7\" FHD+ 120Hz AMOLED 2200 Nits",
    camera: "50 MP Sony OIS + 8 MP UW + 2 MP",
    battery: 5200,
    has5G: true
  },

  // --- 2026 ---
  {
    name: "Nothing Phone (3a)",
    year: 2026,
    month: "Ocak 2026",
    category: "midrange",
    price: 23999,
    ram: 12,
    storage: 256,
    chipset: "Dimensity 7500 Pro 5G (Glyph Matrix Light)",
    screen: "6.7\" 1.5K 120Hz AMOLED 2400 Nits",
    camera: "50 MP Sony OIS + 50 MP UW",
    battery: 5300,
    has5G: true
  },
  {
    name: "Nothing Phone (3a) Pro",
    year: 2026,
    month: "Şubat 2026",
    category: "midrange",
    price: 27999,
    ram: 12,
    storage: 512,
    chipset: "Snapdragon 7+ Gen 4 5G (3x Telephoto OIS)",
    screen: "6.74\" 1.5K 144Hz LTPO AMOLED",
    camera: "50 MP Sony OIS + 50 MP 3x Tele OIS + 50 MP UW",
    battery: 5400,
    has5G: true
  },
  {
    name: "Nothing Phone (3a) Lite",
    year: 2026,
    month: "Mart 2026",
    category: "budget",
    price: 17999,
    ram: 8,
    storage: 256,
    chipset: "Snapdragon 6 Gen 3 5G (Mini Glyph Bar)",
    screen: "6.67\" FHD+ 120Hz AMOLED",
    camera: "50 MP OIS + 8 MP UW",
    battery: 5000,
    has5G: true
  },
  {
    name: "Nothing Phone (4a)",
    year: 2026,
    month: "Mayıs 2026",
    category: "midrange",
    price: 29999,
    ram: 12,
    storage: 512,
    chipset: "Dimensity 8400 5G (Yeni Nesil Şeffaf Seramik Polimer)",
    screen: "6.78\" 1.5K 144Hz LTPO OLED 2800 Nits",
    camera: "50 MP Sony OIS + 50 MP UW",
    battery: 5500,
    has5G: true
  },
  {
    name: "Nothing Phone (4a) Pro",
    year: 2026,
    month: "Haziran 2026",
    category: "midrange",
    price: 34999,
    ram: 16,
    storage: 512,
    chipset: "Snapdragon 8s Gen 4 (5x Periskop OIS & 100W Şarj)",
    screen: "6.8\" 1.5K 144Hz LTPO OLED 3200 Nits",
    camera: "50 MP 1\" OIS + 50 MP 5x Periskop OIS + 50 MP UW",
    battery: 5600,
    has5G: true
  },
  {
    name: "Nothing Phone (4b)",
    year: 2026,
    month: "Temmuz 2026",
    category: "budget",
    price: 21999,
    ram: 12,
    storage: 256,
    chipset: "Dimensity 7450 5G (Kompakt Tasarım & Şeffaf Renkli Kasa)",
    screen: "6.5\" FHD+ 120Hz AMOLED 2200 Nits",
    camera: "50 MP OIS + 12 MP UW",
    battery: 5100,
    has5G: true
  }
];

const nothingImages = [
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

const generatedNothingPhones = nothingFullCatalog.map((m, index) => {
  const slug = slugify(m.name);
  const id = `nothing-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.name.includes('Pro') || m.name.includes('Phone (2)') || m.name.includes('Phone (3)') || m.name.includes('Phone (4a) Pro');
  const rating = isFlagship ? Number((4.7 + (index % 3) * 0.1).toFixed(1)) : Number((4.4 + (index % 4) * 0.1).toFixed(1));
  const reviewCount = Math.floor(140 + (index * 39) % 650);
  const image = nothingImages[index % nothingImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-nth-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 12800,
      url: '#'
    },
    {
      id: `st-ty-nth-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 18400,
      url: '#'
    },
    {
      id: `st-vt-nth-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 11900,
      url: '#'
    },
    {
      id: `st-mm-nth-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 7600,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Nothing TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Nothing",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: true,
    isFeatured: isFlagship || m.year >= 2024,
    highlights: [
      `${m.name} Orijinal Türkiye Garantili (${m.month})`,
      `${m.screen}`,
      `${m.ram} GB RAM & ${m.storage} GB Depolama`,
      `${m.battery} mAh Batarya Kapasitesi`
    ],
    image,
    storeOffers,
    priceHistory,
    specs: {
      screen: {
        size: m.screen.split(' ')[0] || "6.7\"",
        type: m.screen,
        resolution: isFlagship ? "2800 x 1260 px" : "2412 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : 120,
        ppi: isFlagship ? 450 : 394,
        brightnessNits: isFlagship ? 3000 : 1600
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "3nm" : (m.year >= 2024 ? "4nm" : "6nm"),
        antutuScore: isFlagship ? 1750000 : 820000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR5X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: false
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "50 MP",
        telephotoMp: m.camera.includes('Periskop') ? "50 MP 5x Periskop OIS" : (m.camera.includes('Tele') ? "50 MP 3x Tele OIS" : "Yok"),
        selfieMp: m.name.includes('Plus') || isFlagship ? "50 MP 4K" : "32 MP",
        videoRes: "4K @ 60fps",
        dxomarkScore: isFlagship ? 148 : 126
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.name.includes('100W') ? 100 : (isFlagship ? 65 : 45),
        wirelessCharging: isFlagship || m.name === 'Nothing Phone (1)',
        reverseWireless: isFlagship || m.name === 'Nothing Phone (1)'
      },
      connectivity: {
        has5G: true,
        wifiStandard: isFlagship ? "Wi-Fi 7" : "Wi-Fi 6",
        bluetooth: "5.4",
        hasNFC: true,
        hasesim: isFlagship
      },
      build: {
        weightGrams: isFlagship ? 201 : 188,
        thicknessMm: 8.5,
        waterResistance: m.year >= 2025 ? "IP68" : "IP54",
        frameMaterial: isFlagship ? "Şeffaf Cam & Geri Dönüştürülmüş Alüminyum" : "Polikarbonat / Cam"
      },
      software: {
        osName: m.year >= 2026 ? "Nothing OS 3.5 (Android 16)" : (m.year >= 2024 ? "Nothing OS 2.6 (Android 14)" : "Nothing OS 1.5"),
        updateYears: 4
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

// Remove older Nothing entries to replace with our exact 13-model Nothing & CMF catalog
const nonNothingPhones = existingPhones.filter(p => p.brand !== 'Nothing');
const combinedPhones = [...nonNothingPhones, ...generatedNothingPhones];

console.log(`Generated ${generatedNothingPhones.length} comprehensive Nothing & CMF Phone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Nothing & CMF 2022-2026 models!");
