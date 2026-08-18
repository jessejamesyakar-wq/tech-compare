const fs = require('fs');
const path = require('path');

const pixelModels = [
  // --- 2018 ---
  { name: "Google Pixel 3", year: 2018, category: "flagship", price: 6999, ram: 4, storage: 64, chipset: "Snapdragon 845 (Night Sight Efsanesi)", screen: "5.5\" FHD+ OLED Gorilla Glass 5", camera: "12.2 MP Dual Pixel OIS", battery: 2915, has5G: false },
  { name: "Google Pixel 3 XL", year: 2018, category: "flagship", price: 8499, ram: 4, storage: 128, chipset: "Snapdragon 845 (Titan M Güvenlik)", screen: "6.3\" QHD+ OLED Çentikli Ekran", camera: "12.2 MP Dual Pixel OIS", battery: 3430, has5G: false },

  // --- 2019 ---
  { name: "Google Pixel 3a", year: 2019, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Snapdragon 670", screen: "5.6\" FHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 3000, has5G: false },
  { name: "Google Pixel 3a XL", year: 2019, category: "budget", price: 5299, ram: 4, storage: 64, chipset: "Snapdragon 670", screen: "6.0\" FHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 3700, has5G: false },
  { name: "Google Pixel 4", year: 2019, category: "flagship", price: 9999, ram: 6, storage: 64, chipset: "Snapdragon 855 (Soli Radar Hareket Sensörü)", screen: "5.7\" FHD+ 90Hz Smooth OLED", camera: "12.2 MP OIS + 16 MP 2x Tele OIS", battery: 2800, has5G: false },
  { name: "Google Pixel 4 XL", year: 2019, category: "flagship", price: 11999, ram: 6, storage: 128, chipset: "Snapdragon 855", screen: "6.3\" QHD+ 90Hz Smooth OLED", camera: "12.2 MP OIS + 16 MP 2x Tele OIS", battery: 3700, has5G: false },

  // --- 2020 ---
  { name: "Google Pixel 4a", year: 2020, category: "budget", price: 5999, ram: 6, storage: 128, chipset: "Snapdragon 730G", screen: "5.81\" FHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 3140, has5G: false },
  { name: "Google Pixel 4a 5G", year: 2020, category: "midrange", price: 7999, ram: 6, storage: 128, chipset: "Snapdragon 765G 5G", screen: "6.2\" FHD+ OLED", camera: "12.2 MP OIS + 16 MP UW", battery: 3885, has5G: true },
  { name: "Google Pixel 5", year: 2020, category: "flagship", price: 11999, ram: 8, storage: 128, chipset: "Snapdragon 765G 5G (90Hz / IP68 / Ters Şarj)", screen: "6.0\" FHD+ 90Hz Smooth OLED", camera: "12.2 MP OIS + 16 MP UW", battery: 4080, has5G: true },

  // --- 2021 ---
  { name: "Google Pixel 5a 5G", year: 2021, category: "midrange", price: 8999, ram: 6, storage: 128, chipset: "Snapdragon 765G 5G (IP67 Su Geçirmezlik)", screen: "6.34\" FHD+ OLED", camera: "12.2 MP OIS + 16 MP UW", battery: 4680, has5G: true },
  { name: "Google Pixel 6", year: 2021, category: "flagship", price: 17999, ram: 8, storage: 128, chipset: "Google Tensor 1 (İkonik Kamera Vizörü & Magic Eraser)", screen: "6.4\" FHD+ 90Hz AMOLED Victus", camera: "50 MP 1/1.31\" OIS + 12 MP UW", battery: 4614, has5G: true },
  { name: "Google Pixel 6 Pro", year: 2021, category: "flagship", price: 23999, ram: 12, storage: 256, chipset: "Google Tensor 1 (4x Periskop Zoom)", screen: "6.7\" QHD+ 120Hz LTPO AMOLED", camera: "50 MP OIS + 48 MP 4x Periskop OIS + 12 MP UW", battery: 5003, has5G: true },

  // --- 2022 ---
  { name: "Google Pixel 6a", year: 2022, category: "budget", price: 11999, ram: 6, storage: 128, chipset: "Google Tensor 1", screen: "6.1\" FHD+ OLED", camera: "12.2 MP OIS + 12 MP UW", battery: 4410, has5G: true },
  { name: "Google Pixel 7", year: 2022, category: "flagship", price: 22999, ram: 8, storage: 128, chipset: "Google Tensor G2 (Mat Alüminyum Vizör)", screen: "6.3\" FHD+ 90Hz AMOLED", camera: "50 MP OIS + 12 MP UW", battery: 4355, has5G: true },
  { name: "Google Pixel 7 Pro", year: 2022, category: "flagship", price: 31999, ram: 12, storage: 256, chipset: "Google Tensor G2 (5x Periskop Macro Focus)", screen: "6.7\" QHD+ 120Hz LTPO AMOLED", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 12 MP UW", battery: 5000, has5G: true },

  // --- 2023 ---
  { name: "Google Pixel 7a", year: 2023, category: "midrange", price: 15999, ram: 8, storage: 128, chipset: "Google Tensor G2 (90Hz / 64MP)", screen: "6.1\" FHD+ 90Hz OLED (Kablosuz Şarj)", camera: "64 MP OIS + 13 MP UW", battery: 4385, has5G: true },
  { name: "Google Pixel Fold", year: 2023, category: "foldable", price: 69999, ram: 12, storage: 512, chipset: "Google Tensor G2 (İlk Google Katlanabilir)", screen: "7.6\" 120Hz Katlanabilir OLED + 5.8\" Dış Ekran", camera: "48 MP OIS + 10.8 MP 5x Periskop + 10.8 MP UW", battery: 4821, has5G: true },
  { name: "Google Pixel 8", year: 2023, category: "flagship", price: 34999, ram: 8, storage: 256, chipset: "Google Tensor G3 (7 Yıl Güncelleme Garantisi)", screen: "6.2\" FHD+ 120Hz Actua OLED 2000 Nits", camera: "50 MP OIS + 12 MP UW Macro", battery: 4575, has5G: true },
  { name: "Google Pixel 8 Pro", year: 2023, category: "flagship", price: 47999, ram: 12, storage: 512, chipset: "Google Tensor G3 (Vücut Sıcaklığı Sensörü)", screen: "6.7\" QHD+ 120Hz Super Actua LTPO OLED 2400 Nits", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 48 MP UW Macro", battery: 5050, has5G: true },

  // --- 2024 ---
  { name: "Google Pixel 8a", year: 2024, category: "midrange", price: 21999, ram: 8, storage: 128, chipset: "Google Tensor G3 (120Hz / 2000 Nits)", screen: "6.1\" FHD+ 120Hz Actua OLED", camera: "64 MP OIS + 13 MP UW", battery: 4492, has5G: true },
  { name: "Google Pixel 9", year: 2024, category: "flagship", price: 44999, ram: 12, storage: 256, chipset: "Google Tensor G4 (Gemini Nano Yapay Zeka)", screen: "6.3\" FHD+ 120Hz Actua OLED 2700 Nits", camera: "50 MP OIS + 48 MP UW Macro", battery: 4700, has5G: true },
  { name: "Google Pixel 9 Pro", year: 2024, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Google Tensor G4 (Super Actua / Kompakt Pro)", screen: "6.3\" 1.5K 120Hz Super Actua LTPO OLED 3000 Nits", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 48 MP UW", battery: 4700, has5G: true },
  { name: "Google Pixel 9 Pro XL", year: 2024, category: "flagship", price: 64999, ram: 16, storage: 512, chipset: "Google Tensor G4 (Zirve Boyut & 37W Şarj)", screen: "6.8\" QHD+ 120Hz Super Actua LTPO OLED 3000 Nits", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 48 MP UW", battery: 5060, has5G: true },
  { name: "Google Pixel 9 Pro Fold", year: 2024, category: "foldable", price: 84999, ram: 16, storage: 512, chipset: "Google Tensor G4 (İnce Katlanabilir 10.5mm)", screen: "8.0\" 120Hz Katlanabilir Super Actua OLED + 6.3\" Dış Ekran", camera: "48 MP OIS + 10.8 MP 5x Periskop + 10.5 MP UW", battery: 4650, has5G: true },

  // --- 2025 ---
  { name: "Google Pixel 9a", year: 2025, category: "midrange", price: 25999, ram: 8, storage: 256, chipset: "Google Tensor G4 (Düz Arka Gövde)", screen: "6.3\" FHD+ 120Hz Actua OLED", camera: "48 MP OIS + 13 MP UW", battery: 4800, has5G: true },
  { name: "Google Pixel 10", year: 2025, category: "flagship", price: 54999, ram: 12, storage: 256, chipset: "Google Tensor G5 (TSMC 3nm Döküm)", screen: "6.3\" 1.5K 120Hz LTPO OLED 3200 Nits", camera: "50 MP Sony OIS + 48 MP UW", battery: 4850, has5G: true },
  { name: "Google Pixel 10 Pro", year: 2025, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Google Tensor G5 (TSMC 3nm Döküm / Gemini 2.0)", screen: "6.3\" 1.5K 144Hz LTPO OLED 3500 Nits", camera: "50 MP Sony OIS + 50 MP 5x Periskop OIS + 50 MP UW", battery: 4900, has5G: true },
  { name: "Google Pixel 10 Pro XL", year: 2025, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Google Tensor G5 (TSMC 3nm)", screen: "6.85\" 2K 144Hz LTPO OLED 3500 Nits", camera: "50 MP Sony OIS + 50 MP 5x Periskop OIS + 50 MP UW", battery: 5300, has5G: true },
  { name: "Google Pixel 10 Pro Fold", year: 2025, category: "foldable", price: 89999, ram: 16, storage: 512, chipset: "Google Tensor G5 (Ultra İnce Katlanabilir)", screen: "8.05\" 144Hz Super Actua OLED + 6.4\" Dış Ekran", camera: "50 MP OIS + 50 MP 5x Periskop + 48 MP UW", battery: 4800, has5G: true },

  // --- 2026 ---
  { name: "Google Pixel 10a", year: 2026, category: "midrange", price: 29999, ram: 12, storage: 256, chipset: "Google Tensor G5 (TSMC 3nm Bütçe Amiral Gemisi)", screen: "6.3\" FHD+ 120Hz OLED", camera: "50 MP OIS + 13 MP UW", battery: 5000, has5G: true },
  { name: "Google Pixel 11", year: 2026, category: "flagship", price: 64999, ram: 12, storage: 512, chipset: "Google Tensor G6 (TSMC 2nm / Yapay Zeka 4.0)", screen: "6.3\" 1.5K 144Hz LTPO OLED 3800 Nits", camera: "50 MP 1\" OIS + 50 MP UW", battery: 5100, has5G: true },
  { name: "Google Pixel 11 Pro", year: 2026, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Google Tensor G6 (TSMC 2nm / 10x Periskop)", screen: "6.3\" 1.5K 144Hz LTPO OLED 4000 Nits", camera: "50 MP 1\" Sony OIS + 50 MP 10x Periskop OIS + 50 MP UW", battery: 5200, has5G: true },
  { name: "Google Pixel 11 Pro XL", year: 2026, category: "flagship", price: 89999, ram: 16, storage: 1024, chipset: "Google Tensor G6 (TSMC 2nm / Zirve Yapay Zeka & 50W Kablosuz)", screen: "6.85\" 2K 144Hz LTPO OLED 4000 Nits", camera: "50 MP 1\" Sony OIS + 50 MP 10x Periskop OIS + 50 MP UW", battery: 5500, has5G: true },
  { name: "Google Pixel 11 Pro Fold", year: 2026, category: "foldable", price: 99999, ram: 16, storage: 1024, chipset: "Google Tensor G6 (TSMC 2nm / Titanyum Menteşeli Katlanabilir)", screen: "8.1\" 144Hz Katlanabilir Super Actua OLED + 6.4\" Dış Ekran", camera: "50 MP 1\" OIS + 50 MP 10x Periskop + 50 MP UW", battery: 5000, has5G: true }
];

const pixelImages = [
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
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

const generatedPixelPhones = pixelModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `google-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable' || m.name.includes('Pro') || m.name.includes('Fold') || m.name.includes('10') || m.name.includes('11');
  const rating = isFlagship ? Number((4.7 + (index % 3) * 0.1).toFixed(1)) : Number((4.4 + (index % 4) * 0.1).toFixed(1));
  const reviewCount = Math.floor(150 + (index * 34) % 790);
  const image = pixelImages[index % pixelImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-ggl-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 17200,
      url: '#'
    },
    {
      id: `st-ty-ggl-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 25600,
      url: '#'
    },
    {
      id: `st-vt-ggl-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 15400,
      url: '#'
    },
    {
      id: `st-mm-ggl-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 9900,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Google TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Google",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: isFlagship || m.year >= 2023,
    isFeatured: isFlagship && m.year >= 2024,
    highlights: [
      `${m.name} Orijinal Google Tensor & Yapay Zeka`,
      `${m.screen}`,
      `${m.ram} GB RAM & ${m.storage} GB Depolama`,
      `${m.battery} mAh Batarya Kapasitesi`
    ],
    image,
    storeOffers,
    priceHistory,
    specs: {
      screen: {
        size: m.screen.split(' ')[0] || "6.3\"",
        type: m.screen,
        resolution: isFlagship ? "2992 x 1344 px (Super Actua)" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (m.screen.includes('120Hz') || isFlagship || m.year >= 2023 ? 120 : 90),
        ppi: isFlagship ? 490 : 411,
        brightnessNits: isFlagship ? 3000 : 1400
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm (TSMC)" : (m.year >= 2025 ? "3nm (TSMC)" : "4nm"),
        antutuScore: isFlagship ? 1910000 : 810000
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
        ultrawideMp: "48 MP Super Actua UW",
        telephotoMp: isFlagship ? "48 MP 5x/10x Periskop OIS" : "Yok",
        selfieMp: isFlagship ? "42 MP 4K" : "13 MP",
        videoRes: "4K @ 60fps (Night Sight Video)",
        dxomarkScore: isFlagship ? 158 : 128
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: isFlagship ? 37 : 27,
        wirelessCharging: true,
        reverseWireless: isFlagship
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: isFlagship ? "Wi-Fi 7" : "Wi-Fi 6E",
        bluetooth: "5.4",
        hasNFC: true,
        hasesim: true
      },
      build: {
        weightGrams: isFlagship ? 207 : 178,
        thicknessMm: 8.5,
        waterResistance: "IP68 (1.5m 30dk)",
        frameMaterial: isFlagship ? "Mat Alüminyum & Gorrila Glass Victus 2" : "Geri Dönüştürülmüş Alüminyum"
      },
      software: {
        osName: m.year >= 2026 ? "Android 16 (Gemini Nano 2.0)" : (m.year >= 2024 ? "Android 15 (Gemini AI)" : "Android 12"),
        updateYears: m.year >= 2023 ? 7 : 5
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

// Remove older Google entries to replace with our exact 34-model Google Pixel catalog
const nonGooglePhones = existingPhones.filter(p => p.brand !== 'Google');
const combinedPhones = [...nonGooglePhones, ...generatedPixelPhones];

console.log(`Generated ${generatedPixelPhones.length} comprehensive Google Pixel smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Google Pixel 2018-2026 models!");
