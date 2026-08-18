const fs = require('fs');
const path = require('path');

const bilicraModels = [
  {
    name: "Bilicra TTX1",
    year: 2022,
    category: "budget",
    price: 1299,
    ram: 0.128,
    storage: 0.128,
    chipset: "MTK6261D (Klasik Tuşlu Platform)",
    screen: "2.8\" QVGA Renkli Ekran (Büyük Tuşlu Ergonomik Gövde)",
    camera: "0.3 MP VGA Kamera + Flaş",
    battery: 1800,
    has5G: false
  },
  {
    name: "Bilicra TTX1NC",
    year: 2023,
    category: "budget",
    price: 1499,
    ram: 0.128,
    storage: 0.128,
    chipset: "MTK6261D (SOS Acil Durum Butonlu & Şarj Standlı)",
    screen: "2.8\" QVGA Renkli Ekran (Büyük Yazı Tipi & Yüksek Ses)",
    camera: "0.3 MP VGA Kamera",
    battery: 1800,
    has5G: false
  }
];

const bilicraImages = [
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80"
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

const generatedBilicraPhones = bilicraModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `bilicra-${slug}-${index + 1}`;
  const rating = 4.4;
  const reviewCount = 312 + index * 45;
  const image = bilicraImages[index % bilicraImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-blc-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 8900,
      url: '#'
    },
    {
      id: `st-ty-blc-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 11200,
      url: '#'
    },
    {
      id: `st-vt-blc-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 9400,
      url: '#'
    },
    {
      id: `st-mm-blc-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 5600,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Bilicra TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Bilicra",
    category: "smartphones",
    basePrice: m.price,
    currency: "TL",
    rating,
    reviewCount,
    releaseYear: m.year,
    isPopular: true,
    isFeatured: false,
    highlights: [
      `${m.name} Çift SIM Destekli Tuşlu Cep Telefonu`,
      `2.8 inç QVGA Canlı Renkli Ekran`,
      `1800 mAh Dev Bekleme Süreli Batarya`,
      `SOS Acil Durum Butonu & Dahili FM Radyo`
    ],
    image,
    storeOffers,
    priceHistory,
    specs: {
      screen: {
        size: "2.8\"",
        type: m.screen,
        resolution: "320 x 240 px",
        refreshRate: 60,
        ppi: 143,
        brightnessNits: 400
      },
      processor: {
        chip: m.chipset,
        cores: "Tek Çekirdek",
        process: "28nm",
        antutuScore: 15000
      },
      memory: {
        ramGb: 0.128,
        ramType: "SRAM",
        storageGb: 0.128,
        storageOptions: [0.128],
        expandableStorage: true
      },
      camera: {
        mainMp: "0.3 MP VGA",
        ultrawideMp: "Yok",
        telephotoMp: "Yok",
        selfieMp: "Yok",
        videoRes: "240p",
        dxomarkScore: 45
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: 5,
        wirelessCharging: false,
        reverseWireless: false
      },
      connectivity: {
        has5G: false,
        wifiStandard: "Yok",
        bluetooth: "3.0",
        hasNFC: false,
        hasesim: false
      },
      build: {
        weightGrams: 110,
        thicknessMm: 12.5,
        waterResistance: "Darbe ve Düşmeye Dayanıklı Gövde",
        frameMaterial: "Polikarbonat Tuş Takımı"
      },
      software: {
        osName: "Bilicra OS (Klasik Tuşlu Arayüz)",
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

// Remove any older Bilicra phones that we are replacing with our exact entries
const nonBilicraPhones = existingPhones.filter(p => p.brand !== 'Bilicra');
const combinedPhones = [...nonBilicraPhones, ...generatedBilicraPhones];

console.log(`Generated ${generatedBilicraPhones.length} Bilicra tuşlu telefon models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with Bilicra TTX1 / TTX1NC tuşlu telefon models!");
