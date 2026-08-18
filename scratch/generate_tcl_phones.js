const fs = require('fs');
const path = require('path');

const tclModels = [
  // --- 2019 ---
  { name: "TCL Plex", year: 2019, category: "midrange", price: 3499, ram: 6, storage: 128, chipset: "Snapdragon 675", screen: "6.53\" FHD+ NXTVISION Cam Gövde", camera: "48 MP Sony IMX582 + 16 MP UW + 2 MP", battery: 3820, has5G: false },

  // --- 2020 ---
  { name: "TCL 10 Pro", year: 2020, category: "midrange", price: 5499, ram: 6, storage: 128, chipset: "Snapdragon 675", screen: "6.47\" FHD+ 3D Kavisli NXTVISION AMOLED", camera: "64 MP + 16 MP UW + 5 MP Makro + 2 MP Low-Light", battery: 4500, has5G: false },
  { name: "TCL 10L", year: 2020, category: "budget", price: 3299, ram: 6, storage: 64, chipset: "Snapdragon 665", screen: "6.53\" FHD+ Dotch LCD NXTVISION", camera: "48 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4000, has5G: false },
  { name: "TCL 10 5G", year: 2020, category: "midrange", price: 6499, ram: 6, storage: 128, chipset: "Snapdragon 765G 5G", screen: "6.53\" FHD+ NXTVISION LCD", camera: "64 MP + 8 MP UW + 5 MP + 2 MP Dörtlü", battery: 4500, has5G: true },
  { name: "TCL 10 Plus", year: 2020, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Snapdragon 665", screen: "6.47\" FHD+ 3D Kavisli AMOLED", camera: "48 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4500, has5G: false },
  { name: "TCL 10 SE", year: 2020, category: "budget", price: 2499, ram: 4, storage: 128, chipset: "Helio P22", screen: "6.52\" HD+ V-Notch LCD", camera: "48 MP + 5 MP UW + 2 MP Üçlü", battery: 4000, has5G: false },

  // --- 2021 ---
  { name: "TCL 20 Pro 5G", year: 2021, category: "flagship", price: 9999, ram: 6, storage: 256, chipset: "Snapdragon 750G 5G", screen: "6.67\" FHD+ 3D Kavisli NXTVISION 2.0 AMOLED OIS", camera: "48 MP Sony IMX582 OIS + 16 MP UW + 5 MP + 2 MP", battery: 4500, has5G: true },
  { name: "TCL 20 5G", year: 2021, category: "midrange", price: 6999, ram: 6, storage: 128, chipset: "Snapdragon 690 5G", screen: "6.67\" FHD+ NXTVISION LCD", camera: "48 MP + 8 MP UW + 2 MP Üçlü", battery: 4500, has5G: true },
  { name: "TCL 20L", year: 2021, category: "budget", price: 4299, ram: 4, storage: 128, chipset: "Snapdragon 662 (Dairesel Polarize Güneş Gözlüğü Uyumlu)", screen: "6.67\" FHD+ NXTVISION LCD", camera: "48 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "TCL 20L+", year: 2021, category: "budget", price: 4999, ram: 6, storage: 256, chipset: "Snapdragon 662 (64MP Kamera)", screen: "6.67\" FHD+ NXTVISION LCD", camera: "64 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "TCL 20 SE", year: 2021, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Snapdragon 460", screen: "6.82\" HD+ V-Notch LCD Sinematik", camera: "16 MP + 5 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "TCL 20E", year: 2021, category: "budget", price: 2999, ram: 3, storage: 32, chipset: "Helio P22", screen: "6.52\" HD+ V-Notch LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "TCL 20 R 5G", year: 2021, category: "budget", price: 5499, ram: 4, storage: 128, chipset: "Dimensity 700 5G (90Hz)", screen: "6.52\" HD+ 90Hz V-Notch LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 4500, has5G: true },
  { name: "TCL 20 XE", year: 2021, category: "budget", price: 3299, ram: 3, storage: 32, chipset: "Helio P22", screen: "6.52\" HD+ 90Hz LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "TCL A3", year: 2021, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Helio P22", screen: "5.5\" HD+ LCD", camera: "8 MP", battery: 3000, has5G: false },
  { name: "TCL A30", year: 2021, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Helio P22", screen: "5.5\" HD+ LCD", camera: "8 MP", battery: 3000, has5G: false },
  { name: "TCL L7", year: 2021, category: "budget", price: 1599, ram: 2, storage: 32, chipset: "QM215", screen: "5.5\" HD+ LCD", camera: "8 MP", battery: 3000, has5G: false },

  // --- 2022 ---
  { name: "TCL 30", year: 2022, category: "budget", price: 5499, ram: 4, storage: 64, chipset: "Helio G37 (50MP Kamera & AMOLED)", screen: "6.7\" FHD+ AMOLED NXTVISION", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "TCL 30 5G", year: 2022, category: "midrange", price: 7999, ram: 4, storage: 128, chipset: "Dimensity 700 5G (50MP AMOLED)", screen: "6.7\" FHD+ AMOLED NXTVISION", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "TCL 30 Pro 5G", year: 2022, category: "midrange", price: 9499, ram: 8, storage: 256, chipset: "Dimensity 810 5G", screen: "6.7\" FHD+ AMOLED NXTVISION", camera: "50 MP OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "TCL 30+", year: 2022, category: "budget", price: 6299, ram: 4, storage: 128, chipset: "Helio G37", screen: "6.7\" FHD+ AMOLED NXTVISION", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "TCL 30 SE", year: 2022, category: "budget", price: 4499, ram: 4, storage: 128, chipset: "Helio G25 (50MP Kamera)", screen: "6.52\" HD+ V-Notch LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "TCL 30 LE", year: 2022, category: "budget", price: 3499, ram: 3, storage: 32, chipset: "Helio A22", screen: "6.52\" HD+ LCD", camera: "13 MP", battery: 4000, has5G: false },
  { name: "TCL 30 E", year: 2022, category: "budget", price: 3999, ram: 3, storage: 64, chipset: "Helio G25", screen: "6.52\" HD+ LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "TCL 30 V 5G", year: 2022, category: "midrange", price: 7499, ram: 4, storage: 128, chipset: "Snapdragon 480 5G", screen: "6.67\" FHD+ 90Hz LCD", camera: "50 MP + 5 MP UW + 2 MP Üçlü", battery: 4500, has5G: true },
  { name: "TCL 30 XE", year: 2022, category: "budget", price: 4999, ram: 3, storage: 64, chipset: "Dimensity 700 5G (90Hz)", screen: "6.52\" HD+ 90Hz LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 4500, has5G: true },
  { name: "TCL 303", year: 2022, category: "budget", price: 2199, ram: 2, storage: 32, chipset: "MT6739", screen: "5.5\" FWVGA+ LCD", camera: "8 MP", battery: 3000, has5G: false },
  { name: "TCL 30XL", year: 2022, category: "budget", price: 5499, ram: 6, storage: 64, chipset: "Helio A25", screen: "6.82\" HD+ V-Notch LCD", camera: "50 MP + 5 MP UW + 2 MP + 2 MP", battery: 5000, has5G: false },

  // --- 2023 ---
  { name: "TCL 40 NxtPaper", year: 2023, category: "midrange", price: 8999, ram: 8, storage: 256, chipset: "Helio G88 (Devrimsel Kağıt Doku Mat Ekran)", screen: "6.78\" FHD+ 90Hz NXTPAPER Parlamayan Mat Ekran", camera: "50 MP + 5 MP UW + 2 MP (32MP Selfie)", battery: 5000, has5G: false },
  { name: "TCL 40 NxtPaper 5G", year: 2023, category: "midrange", price: 10999, ram: 6, storage: 256, chipset: "Dimensity 6020 5G (NXTPAPER Mat Ekran)", screen: "6.6\" HD+ 90Hz NXTPAPER Mat Ekran", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "TCL 40 Pro 5G", year: 2023, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 700 5G (108MP Kamera)", screen: "6.7\" FHD+ AMOLED NXTVISION", camera: "108 MP + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "TCL 40 SE", year: 2023, category: "budget", price: 5999, ram: 6, storage: 256, chipset: "Helio G37 (50MP / Çift Hoparlör)", screen: "6.75\" HD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "TCL 40 R 5G", year: 2023, category: "budget", price: 6999, ram: 4, storage: 128, chipset: "Dimensity 700 5G (90Hz / 50MP)", screen: "6.6\" HD+ 90Hz NXTVISION LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "TCL 40 X 5G", year: 2023, category: "budget", price: 6499, ram: 4, storage: 64, chipset: "Dimensity 700 5G", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "TCL 40 XE 5G", year: 2023, category: "budget", price: 5999, ram: 4, storage: 64, chipset: "Dimensity 700 5G", screen: "6.56\" HD+ 90Hz LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "TCL 403", year: 2023, category: "budget", price: 2499, ram: 2, storage: 32, chipset: "Helio A22", screen: "6.0\" FWVGA+ LCD", camera: "8 MP", battery: 3000, has5G: false },
  { name: "TCL 405", year: 2023, category: "budget", price: 2999, ram: 2, storage: 64, chipset: "Helio G25", screen: "6.6\" HD+ V-Notch LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "TCL 408", year: 2023, category: "budget", price: 3999, ram: 4, storage: 64, chipset: "Helio P22 (50MP Hyper-Camera)", screen: "6.6\" HD+ V-Notch LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2024 ---
  { name: "TCL 50 5G", year: 2024, category: "midrange", price: 8999, ram: 6, storage: 128, chipset: "MediaTek Dimensity 6100+ 5G", screen: "6.6\" HD+ 90Hz NXTVISION LCD", camera: "50 MP + 5 MP UW Çift", battery: 5000, has5G: true },
  { name: "TCL 50 Pro NxtPaper 5G", year: 2024, category: "flagship", price: 14999, ram: 8, storage: 512, chipset: "Dimensity 6300 5G (Max NxtPaper Tuşu / 108MP)", screen: "6.8\" FHD+ 120Hz NXTPAPER 3.0 Kağıt Ekran Switch", camera: "108 MP OIS + 8 MP UW + 2 MP (32MP Selfie)", battery: 5010, has5G: true },
  { name: "TCL 50 SE", year: 2024, category: "budget", price: 6999, ram: 6, storage: 256, chipset: "Helio G88 (33W Fast Charge / 50MP)", screen: "6.78\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5010, has5G: false },
  { name: "TCL 50 LE", year: 2024, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Helio A22", screen: "6.56\" HD+ 90Hz LCD", camera: "13 MP", battery: 4000, has5G: false },
  { name: "TCL 505", year: 2024, category: "budget", price: 4999, ram: 4, storage: 128, chipset: "Helio G36 (90Hz NXTVISION)", screen: "6.75\" HD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "TCL 501", year: 2024, category: "budget", price: 2999, ram: 2, storage: 32, chipset: "MT6739", screen: "6.0\" FWVGA+ LCD", camera: "5 MP", battery: 3000, has5G: false },

  // --- 2025 ---
  { name: "TCL 60", year: 2025, category: "midrange", price: 9999, ram: 8, storage: 256, chipset: "Helio G99 (108MP Kamera)", screen: "6.78\" FHD+ 120Hz NXTVISION 3.0 LCD", camera: "108 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "TCL 60 5G", year: 2025, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 6300 5G", screen: "6.78\" FHD+ 120Hz NXTVISION 3.0 LCD", camera: "108 MP OIS + 8 MP UW", battery: 5000, has5G: true },
  { name: "TCL 60 NxtPaper 4G", year: 2025, category: "midrange", price: 12999, ram: 8, storage: 256, chipset: "Helio G99 (NXTPAPER Kağıt Modu Tuşu)", screen: "6.8\" FHD+ 120Hz NXTPAPER 3.5 Parlamayan Mat Ekran", camera: "108 MP + 8 MP UW + 2 MP", battery: 5010, has5G: false },
  { name: "TCL 60 SE NxtPaper 5G", year: 2025, category: "midrange", price: 15999, ram: 12, storage: 512, chipset: "Dimensity 7020 5G (Göz Koruyucu Kağıt Doku)", screen: "6.8\" 1.5K 120Hz NXTPAPER Mat Ekran", camera: "108 MP OIS + 8 MP UW + 2 MP", battery: 5500, has5G: true },
  { name: "TCL 60 XE NxtPaper", year: 2025, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Dimensity 6100+ 5G", screen: "6.6\" HD+ 120Hz NXTPAPER Mat Ekran", camera: "50 MP OIS + 2 MP", battery: 5000, has5G: true },
  { name: "TCL 605", year: 2025, category: "budget", price: 5999, ram: 6, storage: 128, chipset: "Helio G37", screen: "6.75\" HD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2026 ---
  { name: "TCL NxtPaper 70 Pro", year: 2026, category: "flagship", price: 24999, ram: 16, storage: 512, chipset: "Dimensity 8300 Ultra 5G (144Hz 3D Kavisli NXTPAPER 4.0 Mat OLED)", screen: "6.82\" 1.5K 144Hz 3D Kavisli NXTPAPER 4.0 Mat OLED (TCL Stylus 3.0)", camera: "108 MP OIS + 50 MP 3x Tele + 12 MP UW", battery: 5800, has5G: true },
  { name: "TCL K70 5G", year: 2026, category: "midrange", price: 16999, ram: 12, storage: 256, chipset: "Dimensity 7300 5G (66W Fast Charge)", screen: "6.78\" FHD+ 144Hz NXTVISION 4.0 OLED", camera: "108 MP OIS + 8 MP UW + 2 MP", battery: 5500, has5G: true },
  { name: "TCL K70 SE 5G", year: 2026, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Dimensity 6400+ 5G", screen: "6.78\" FHD+ 120Hz LCD", camera: "108 MP OIS + 2 MP", battery: 5000, has5G: true },
  { name: "TCL K70 Power", year: 2026, category: "midrange", price: 17999, ram: 12, storage: 256, chipset: "Dimensity 7050 5G (7000 mAh Dev Batarya / 66W)", screen: "6.8\" FHD+ 120Hz NXTVISION LCD", camera: "108 MP OIS + 8 MP UW", battery: 7000, has5G: true },
  { name: "TCL K70 NXTpaper", year: 2026, category: "midrange", price: 19999, ram: 12, storage: 512, chipset: "Dimensity 7400 5G (Kağıt Doku Ekran)", screen: "6.8\" 1.5K 144Hz NXTPAPER 4.0 Mat Ekran", camera: "108 MP OIS + 12 MP UW + 2 MP", battery: 6000, has5G: true },
  { name: "TCL Note A1 NXTPAPER", year: 2026, category: "flagship", price: 29999, ram: 16, storage: 1024, chipset: "Snapdragon 8s Gen 3 (E-Mürekkep / Kağıt Tablet Hibrit Telefon)", screen: "7.2\" 2K 120Hz NXTPAPER 4.0 Renkli E-Kağıt Mat OLED (Pencil Pro)", camera: "108 MP OIS + 50 MP UW", battery: 6500, has5G: true }
];

const tclImages = [
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

const generatedTclPhones = tclModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `tcl-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.name.includes('NxtPaper') || m.name.includes('Plex');
  const rating = isFlagship ? Number((4.6 + (index % 4) * 0.1).toFixed(1)) : Number((4.1 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(95 + (index * 33) % 590);
  const image = tclImages[index % tclImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-tcl-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 11800,
      url: '#'
    },
    {
      id: `st-ty-tcl-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 14900,
      url: '#'
    },
    {
      id: `st-vt-tcl-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 12600,
      url: '#'
    },
    {
      id: `st-mm-tcl-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 7900,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'TCL TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "TCL",
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
        ppi: isFlagship ? 410 : 388,
        brightnessNits: isFlagship ? 1600 : 900
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "4nm" : (m.year >= 2024 ? "6nm" : "12nm"),
        antutuScore: isFlagship ? 1390000 : 580000
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
        ultrawideMp: "12 MP",
        telephotoMp: isFlagship ? "50 MP 3x Telephoto" : "Yok",
        selfieMp: m.name.includes('NxtPaper') ? "32 MP Mat Selfie" : "16 MP",
        videoRes: isFlagship ? "4K @ 60fps" : "1080p @ 60fps",
        dxomarkScore: isFlagship ? 138 : 108
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('66W') || m.chipset.includes('66W') ? 66 : (isFlagship ? 45 : 33),
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
        weightGrams: isFlagship ? 195 : 185,
        thicknessMm: 7.9,
        waterResistance: "IP54 Su Sıçramasına Dayanıklı",
        frameMaterial: isFlagship ? "NXTPAPER Mat Cam / Alüminyum" : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "TCL UI 8.0 (Android 16)" : (m.year >= 2024 ? "TCL UI 6.0 (Android 14)" : "TCL UI 4.0"),
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

// Remove any older TCL phones that we are replacing with our exhaustive catalog
const nonTclPhones = existingPhones.filter(p => p.brand !== 'TCL');
const combinedPhones = [...nonTclPhones, ...generatedTclPhones];

console.log(`Generated ${generatedTclPhones.length} comprehensive TCL smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all TCL 2019-2026 smartphone models!");
