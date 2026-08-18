const fs = require('fs');
const path = require('path');

const tecnoModels = [
  // --- 2018 ---
  { name: "Tecno Camon X", year: 2018, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Helio P23", screen: "6.0\" HD+ IPS LCD (20MP Selfie)", camera: "16 MP", battery: 3750, has5G: false },
  { name: "Tecno Camon X Pro", year: 2018, category: "budget", price: 2499, ram: 4, storage: 64, chipset: "Helio P23", screen: "6.0\" FHD+ IPS LCD (24MP Selfie)", camera: "16 MP", battery: 3750, has5G: false },
  { name: "Tecno Camon iACE", year: 2018, category: "budget", price: 1499, ram: 2, storage: 16, chipset: "MT6739", screen: "5.5\" HD+ IPS LCD", camera: "13 MP", battery: 3050, has5G: false },
  { name: "Tecno Pop 1", year: 2018, category: "budget", price: 1299, ram: 1, storage: 8, chipset: "MT6580", screen: "5.5\" FWVGA LCD", camera: "5 MP", battery: 2400, has5G: false },
  { name: "Tecno Spark 2", year: 2018, category: "budget", price: 1699, ram: 2, storage: 16, chipset: "MT6580", screen: "6.0\" HD+ IPS LCD", camera: "13 MP", battery: 3500, has5G: false },

  // --- 2019 ---
  { name: "Tecno Camon 11 Pro", year: 2019, category: "budget", price: 2999, ram: 6, storage: 64, chipset: "Helio P22", screen: "6.2\" HD+ IPS LCD (24MP Yapay Zeka Selfie)", camera: "16 MP + 5 MP Çift", battery: 3750, has5G: false },
  { name: "Tecno Camon 12", year: 2019, category: "budget", price: 2499, ram: 4, storage: 64, chipset: "Helio P22", screen: "6.52\" HD+ IPS LCD", camera: "16 MP + 8 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "Tecno Camon 12 Pro", year: 2019, category: "budget", price: 3299, ram: 6, storage: 64, chipset: "Helio P22", screen: "6.35\" HD+ Super AMOLED (Ekrana Gömülü Parmak İzi)", camera: "16 MP + 8 MP + 2 MP Üçlü", battery: 3500, has5G: false },
  { name: "Tecno Phantom 9", year: 2019, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Helio P35", screen: "6.4\" FHD+ AMOLED Ekrana Gömülü Parmak İzi", camera: "16 MP + 8 MP + 2 MP Üçlü", battery: 3500, has5G: false },
  { name: "Tecno Spark 4", year: 2019, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Helio A22", screen: "6.52\" HD+ IPS LCD", camera: "13 MP + 2 MP + QVGA Üçlü", battery: 4000, has5G: false },
  { name: "Tecno Spark Go", year: 2019, category: "budget", price: 1599, ram: 2, storage: 16, chipset: "Helio A22", screen: "6.1\" HD+ IPS LCD", camera: "8 MP", battery: 3000, has5G: false },

  // --- 2020 ---
  { name: "Tecno Camon 15", year: 2020, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Helio P22", screen: "6.6\" HD+ IPS LCD (48MP Dörtlü Kamera)", camera: "48 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5000, has5G: false },
  { name: "Tecno Camon 15 Pro", year: 2020, category: "midrange", price: 4299, ram: 6, storage: 128, chipset: "Helio P35", screen: "6.53\" FHD+ Pop-Up Kameralı LCD", camera: "48 MP + 5 MP + 2 MP + QVGA Dörtlü", battery: 4000, has5G: false },
  { name: "Tecno Camon 16", year: 2020, category: "midrange", price: 4999, ram: 6, storage: 128, chipset: "Helio G70", screen: "6.8\" HD+ IPS LCD (64MP Kamera)", camera: "64 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5000, has5G: false },
  { name: "Tecno Spark 5", year: 2020, category: "budget", price: 2299, ram: 2, storage: 32, chipset: "Helio A22", screen: "6.6\" HD+ IPS LCD", camera: "13 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5000, has5G: false },
  { name: "Tecno Spark 6", year: 2020, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Helio G70", screen: "6.8\" HD+ IPS LCD", camera: "16 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5000, has5G: false },
  { name: "Tecno POVA (1. Nesil)", year: 2020, category: "budget", price: 3999, ram: 6, storage: 128, chipset: "Helio G80 (Efsanevi Dev Oyun Bataryası)", screen: "6.8\" HD+ Punch-Hole LCD", camera: "13 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 6000, has5G: false },

  // --- 2021 ---
  { name: "Tecno Camon 17", year: 2021, category: "midrange", price: 4999, ram: 6, storage: 128, chipset: "Helio G85", screen: "6.6\" HD+ 90Hz IPS LCD", camera: "48 MP + 2 MP + QVGA Üçlü", battery: 5000, has5G: false },
  { name: "Tecno Camon 17 Pro", year: 2021, category: "midrange", price: 6999, ram: 8, storage: 256, chipset: "Helio G95 (48MP Selfie)", screen: "6.8\" FHD+ 90Hz IPS LCD (25W Şarj)", camera: "64 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Tecno Camon 18", year: 2021, category: "midrange", price: 5999, ram: 6, storage: 128, chipset: "Helio G88", screen: "6.8\" FHD+ 90Hz IPS LCD", camera: "48 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Tecno Spark 7", year: 2021, category: "budget", price: 3299, ram: 4, storage: 64, chipset: "Helio A25", screen: "6.5\" HD+ IPS LCD", camera: "16 MP Çift", battery: 6000, has5G: false },
  { name: "Tecno Spark 8", year: 2021, category: "budget", price: 3799, ram: 4, storage: 64, chipset: "Helio P22", screen: "6.52\" HD+ IPS LCD", camera: "16 MP Çift", battery: 5000, has5G: false },
  { name: "Tecno POVA 2", year: 2021, category: "midrange", price: 5499, ram: 6, storage: 128, chipset: "Helio G85 (7000 mAh Dev Batarya)", screen: "6.9\" FHD+ 180Hz Touch Sampling LCD", camera: "48 MP + 2 MP + 2 MP + 2 MP Dörtlü", battery: 7000, has5G: false },
  { name: "Tecno Phantom X", year: 2021, category: "flagship", price: 11999, ram: 8, storage: 256, chipset: "Helio G95", screen: "6.7\" FHD+ 90Hz 3D Kavisli AMOLED", camera: "50 MP 1/1.3\" Ultra-Large + 50 MP 50mm Tele + 13 MP UW", battery: 4700, has5G: false },

  // --- 2022 ---
  { name: "Tecno Camon 19", year: 2022, category: "midrange", price: 6499, ram: 6, storage: 128, chipset: "Helio G85 (0.98mm İnce Çerçeve)", screen: "6.8\" FHD+ IPS LCD", camera: "64 MP RGBW Sensör + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Tecno Camon 19 Pro", year: 2022, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Helio G96 (RGBW + OIS + 50mm Lens)", screen: "6.8\" FHD+ 120Hz IPS LCD", camera: "64 MP RGBW OIS + 50 MP 50mm Portre + 2 MP", battery: 5000, has5G: false },
  { name: "Tecno Spark 9", year: 2022, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Helio G37", screen: "6.6\" HD+ 90Hz IPS LCD", camera: "13 MP Çift", battery: 5000, has5G: false },
  { name: "Tecno POVA 3", year: 2022, category: "midrange", price: 6999, ram: 6, storage: 128, chipset: "Helio G88 (7000 mAh / 33W Şarj / RGB Işık)", screen: "6.9\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 7000, has5G: false },
  { name: "Tecno POVA 4", year: 2022, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Helio G99 (Kristal Tasarım)", screen: "6.82\" HD+ 90Hz LCD", camera: "50 MP Çift", battery: 6000, has5G: false },
  { name: "Tecno Pop 6", year: 2022, category: "budget", price: 2999, ram: 2, storage: 32, chipset: "MT6739", screen: "6.1\" HD+ IPS LCD", camera: "5 MP Çift", battery: 5000, has5G: false },

  // --- 2023 ---
  { name: "Tecno Camon 20", year: 2023, category: "midrange", price: 8999, ram: 8, storage: 256, chipset: "Helio G85 (Deri Görünümlü Desensiz Arka Kapak)", screen: "6.67\" FHD+ 120Hz AMOLED", camera: "64 MP RGBW Sensör + 2 MP + QVGA", battery: 5000, has5G: false },
  { name: "Tecno Camon 20 Pro 5G", year: 2023, category: "midrange", price: 12999, ram: 8, storage: 256, chipset: "Dimensity 8050 5G (Sensor-Shift OIS)", screen: "6.67\" FHD+ 120Hz AMOLED", camera: "64 MP RGBW Sensor-Shift OIS + 2 MP Macro + 2 MP", battery: 5000, has5G: true },
  { name: "Tecno Spark 10", year: 2023, category: "budget", price: 5999, ram: 8, storage: 128, chipset: "Helio G37", screen: "6.6\" HD+ 90Hz LCD", camera: "50 MP Çift", battery: 5000, has5G: false },
  { name: "Tecno POVA 5", year: 2023, category: "midrange", price: 9499, ram: 8, storage: 256, chipset: "Helio G99 (Free Fire Özel Sürüm 45W)", screen: "6.78\" FHD+ 120Hz LCD", camera: "50 MP AI Çift", battery: 6000, has5G: false },
  { name: "Tecno POVA 5 Pro 5G", year: 2023, category: "midrange", price: 12499, ram: 8, storage: 256, chipset: "Dimensity 6080 5G (Arka Mecha LED Işıklı)", screen: "6.78\" FHD+ 120Hz LCD 68W Ultra Şarj", camera: "50 MP AI Çift", battery: 5000, has5G: true },
  { name: "Tecno Phantom V Fold", year: 2023, category: "foldable", price: 37999, ram: 12, storage: 512, chipset: "Dimensity 9000+ 5G (Fiyat/Performans Katlanabilir)", screen: "7.85\" 2K+ 120Hz Katlanabilir LTPO AMOLED", camera: "50 MP Main + 50 MP 2x Tele + 13 MP UW", battery: 5000, has5G: true },

  // --- 2024 ---
  { name: "Tecno Camon 30", year: 2024, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Helio G99 Ultimate (Akıllı Kırmızı Uyarı Işıklı)", screen: "6.78\" FHD+ 120Hz AMOLED (70W Şarj)", camera: "50 MP OIS + 2 MP + Light Sensor", battery: 5000, has5G: false },
  { name: "Tecno Camon 30 Premier 5G", year: 2024, category: "midrange", price: 24999, ram: 12, storage: 512, chipset: "Dimensity 8200 Ultimate 5G (Sony PolarAce)", screen: "6.77\" 1.5K 120Hz LTPO AMOLED (70W Şarj)", camera: "50 MP Sony IMX890 OIS + 50 MP 3x Tele + 50 MP UW", battery: 5000, has5G: true },
  { name: "Tecno Spark 20", year: 2024, category: "budget", price: 7499, ram: 8, storage: 256, chipset: "Helio G85 (Çift Hoparlör DTS)", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP AI Çift", battery: 5000, has5G: false },
  { name: "Tecno Spark 30", year: 2024, category: "budget", price: 8999, ram: 8, storage: 256, chipset: "Helio G91 (Transformers Sürümü / 108MP)", screen: "6.78\" FHD+ 90Hz LCD", camera: "108 MP Sony IMX682 + AI", battery: 5000, has5G: false },
  { name: "Tecno POVA 6", year: 2024, category: "midrange", price: 12999, ram: 8, storage: 256, chipset: "Helio G99 Ultimate (70W Flash Charge)", screen: "6.78\" FHD+ 120Hz AMOLED Dynamic Light", camera: "108 MP OIS + Light Sensor", battery: 6000, has5G: false },
  { name: "Tecno POVA 6 Pro 5G", year: 2024, category: "midrange", price: 15999, ram: 12, storage: 256, chipset: "Dimensity 6080 5G (Mini LED Dinamik Işık)", screen: "6.78\" FHD+ 120Hz AMOLED 70W", camera: "108 MP OIS + 2 MP + Light Sensor", battery: 6000, has5G: true },
  { name: "Tecno Phantom V Fold 2 5G", year: 2024, category: "foldable", price: 49999, ram: 12, storage: 512, chipset: "Dimensity 9000+ 5G (Phantom Pen Desteği / IPX8)", screen: "7.85\" 2K+ 120Hz Katlanabilir LTPO OLED", camera: "50 MP OIS + 50 MP 3x Tele + 50 MP UW", battery: 5750, has5G: true },
  { name: "Tecno Phantom V Flip 2 5G", year: 2024, category: "foldable", price: 34999, ram: 8, storage: 256, chipset: "Dimensity 8020 5G (Tam Kapak Ekranı)", screen: "6.9\" FHD+ 120Hz Katlanabilir LTPO OLED", camera: "50 MP OIS + 50 MP UW Çift", battery: 4720, has5G: true },

  // --- 2025 - 2026 ---
  { name: "Tecno Camon 40 5G", year: 2025, category: "midrange", price: 18999, ram: 12, storage: 256, chipset: "Dimensity 7300 5G (Sony PolarAce 2.0)", screen: "6.78\" 1.5K 144Hz AMOLED (90W Şarj)", camera: "50 MP Sony OIS + 50 MP Tele + 12 MP UW", battery: 5500, has5G: true },
  { name: "Tecno Camon 50 Ultra 5G", year: 2026, category: "flagship", price: 34999, ram: 16, storage: 512, chipset: "Dimensity 9400 5G (100W Şarj / IP69)", screen: "6.8\" 1.5K 144Hz LTPO AMOLED Yapay Zeka Lideri", camera: "50 MP Sony 1\" OIS + 50 MP 5x Periskop + 50 MP UW", battery: 6000, has5G: true },
  { name: "Tecno POVA 7 5G", year: 2025, category: "midrange", price: 16999, ram: 12, storage: 256, chipset: "Dimensity 7020 5G (6500 mAh Batarya / 90W)", screen: "6.78\" FHD+ 144Hz Mecha OLED", camera: "108 MP OIS + 2 MP", battery: 6500, has5G: true },
  { name: "Tecno POVA 8 Pro 5G", year: 2026, category: "midrange", price: 21999, ram: 16, storage: 512, chipset: "Dimensity 8400 5G (7000 mAh / 100W / RGB Mecha)", screen: "6.8\" 1.5K 144Hz Curved OLED Gamer", camera: "108 MP OIS + 12 MP UW + 2 MP", battery: 7000, has5G: true },
  { name: "Tecno Spark 40 5G", year: 2025, category: "budget", price: 10999, ram: 8, storage: 256, chipset: "Dimensity 6300 5G", screen: "6.7\" FHD+ 120Hz LCD", camera: "108 MP + 2 MP", battery: 5500, has5G: true },
  { name: "Tecno Spark 50 5G", year: 2026, category: "budget", price: 13999, ram: 8, storage: 256, chipset: "Dimensity 6400+ 5G", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "108 MP OIS + 2 MP", battery: 6000, has5G: true },
  { name: "Tecno Spark Slim", year: 2026, category: "budget", price: 14999, ram: 8, storage: 256, chipset: "Helio G100 (6.8mm Ultra İnce Gövde)", screen: "6.78\" 1.5K 120Hz Curved AMOLED", camera: "108 MP OIS + 2 MP", battery: 5000, has5G: false }
];

const tecnoImages = [
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

const generatedTecnoPhones = tecnoModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `tecno-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable';
  const rating = isFlagship ? Number((4.5 + (index % 4) * 0.1).toFixed(1)) : Number((4.1 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(95 + (index * 37) % 640);
  const image = tecnoImages[index % tecnoImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-tc-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 11200,
      url: '#'
    },
    {
      id: `st-ty-tc-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 15400,
      url: '#'
    },
    {
      id: `st-vt-tc-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 12100,
      url: '#'
    },
    {
      id: `st-mm-tc-${index}`,
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
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Tecno TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Tecno",
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
        resolution: isFlagship ? "2560 x 1080 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2023 ? 120 : 90),
        ppi: isFlagship ? 413 : 388,
        brightnessNits: isFlagship ? 2200 : 1000
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "3nm" : (m.year >= 2024 ? "4nm" : "6nm"),
        antutuScore: isFlagship ? 1540000 : 680000
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
        ultrawideMp: "13 MP",
        telephotoMp: isFlagship ? "50 MP 3x Telephoto" : "Yok",
        selfieMp: m.name.includes('Camon') ? "50 MP AI Selfie" : "16 MP",
        videoRes: isFlagship ? "4K @ 60fps" : "1080p @ 60fps",
        dxomarkScore: isFlagship ? 142 : 112
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('70W') || m.chipset.includes('68W') ? 70 : (isFlagship ? 100 : 33),
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
        weightGrams: isFlagship ? 210 : 195,
        thicknessMm: 8.4,
        waterResistance: m.name.includes('IP69') ? "IP69" : (isFlagship ? "IP54" : "Yok"),
        frameMaterial: isFlagship ? "Alüminyum / Deri" : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "HiOS 16 (Android 16)" : (m.year >= 2024 ? "HiOS 14 (Android 14)" : "HiOS 12"),
        updateYears: m.year >= 2024 ? 3 : 2
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

// Remove any older Tecno phones that we are replacing with our exhaustive catalog
const nonTecnoPhones = existingPhones.filter(p => p.brand !== 'Tecno');
const combinedPhones = [...nonTecnoPhones, ...generatedTecnoPhones];

console.log(`Generated ${generatedTecnoPhones.length} comprehensive Tecno models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Tecno 2018-2026 models!");
