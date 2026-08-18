const fs = require('fs');
const path = require('path');

const vivoModels = [
  // --- 2018 ---
  { name: "Vivo NEX", year: 2018, category: "flagship", price: 8999, ram: 8, storage: 128, chipset: "Snapdragon 845", screen: "6.59\" FHD+ Ultra FullView Pop-Up AMOLED", camera: "12 MP Dual Pixel OIS + 5 MP", battery: 4000, has5G: false },
  { name: "Vivo X21", year: 2018, category: "midrange", price: 5499, ram: 6, storage: 128, chipset: "Snapdragon 660", screen: "6.28\" FHD+ Ekrana Gömülü Parmak İzli Super AMOLED", camera: "12 MP + 5 MP Çift", battery: 3200, has5G: false },
  { name: "Vivo V9", year: 2018, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Snapdragon 626", screen: "6.3\" FHD+ IPS LCD (24MP Selfie)", camera: "16 MP + 5 MP Çift", battery: 3260, has5G: false },
  { name: "Vivo V11", year: 2018, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Snapdragon 660", screen: "6.41\" FHD+ Halo FullView Super AMOLED", camera: "12 MP + 5 MP Çift", battery: 3400, has5G: false },
  { name: "Vivo Y81", year: 2018, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Helio P22", screen: "6.22\" HD+ IPS LCD", camera: "13 MP", battery: 3260, has5G: false },
  { name: "Vivo Y71", year: 2018, category: "budget", price: 1899, ram: 3, storage: 16, chipset: "Snapdragon 425", screen: "6.0\" HD+ IPS LCD", camera: "13 MP", battery: 3360, has5G: false },

  // --- 2019 ---
  { name: "Vivo NEX 3", year: 2019, category: "flagship", price: 13999, ram: 8, storage: 256, chipset: "Snapdragon 855+", screen: "6.89\" FHD+ %99.6 Şelale Kavisli AMOLED", camera: "64 MP + 13 MP Tele + 13 MP UW Pop-Up", battery: 4500, has5G: true },
  { name: "Vivo V15", year: 2019, category: "midrange", price: 4999, ram: 6, storage: 128, chipset: "Helio P70", screen: "6.53\" FHD+ Pop-Up Kameralı LCD (32MP Selfie)", camera: "12 MP + 8 MP + 5 MP Üçlü", battery: 4000, has5G: false },
  { name: "Vivo V15 Pro", year: 2019, category: "midrange", price: 6499, ram: 8, storage: 128, chipset: "Snapdragon 675", screen: "6.39\" FHD+ Pop-Up Super AMOLED", camera: "48 MP + 8 MP + 5 MP Üçlü", battery: 3700, has5G: false },
  { name: "Vivo S1", year: 2019, category: "budget", price: 3999, ram: 6, storage: 128, chipset: "Helio P65", screen: "6.38\" FHD+ Halo FullView Super AMOLED", camera: "16 MP + 8 MP + 2 MP Üçlü", battery: 4500, has5G: false },
  { name: "Vivo Y17", year: 2019, category: "budget", price: 3299, ram: 4, storage: 128, chipset: "Helio P35", screen: "6.35\" HD+ IPS LCD", camera: "13 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Vivo Y12", year: 2019, category: "budget", price: 2799, ram: 3, storage: 64, chipset: "Helio P22", screen: "6.35\" HD+ IPS LCD", camera: "13 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Vivo Y15", year: 2019, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Helio P22", screen: "6.35\" HD+ IPS LCD", camera: "13 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: false },

  // --- 2020 ---
  { name: "Vivo X50", year: 2020, category: "flagship", price: 9999, ram: 8, storage: 128, chipset: "Snapdragon 730", screen: "6.56\" FHD+ 90Hz AMOLED", camera: "48 MP OIS + 13 MP Portre + 8 MP UW + 5 MP", battery: 4200, has5G: false },
  { name: "Vivo X50 Pro", year: 2020, category: "flagship", price: 14999, ram: 8, storage: 256, chipset: "Snapdragon 765G 5G", screen: "6.56\" FHD+ 90Hz Gimbal Kameralı 3D Kavisli AMOLED", camera: "48 MP Dahili Gimbal OIS + 13 MP 50mm + 8 MP 5x Periskop + 8 MP UW", battery: 4315, has5G: true },
  { name: "Vivo V20", year: 2020, category: "midrange", price: 6999, ram: 8, storage: 128, chipset: "Snapdragon 720G", screen: "6.44\" FHD+ AMOLED (44MP Eye Autofocus Selfie)", camera: "64 MP + 8 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "Vivo Y20", year: 2020, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Snapdragon 460", screen: "6.51\" HD+ IPS LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Vivo Y12s", year: 2020, category: "budget", price: 2999, ram: 3, storage: 32, chipset: "Helio P35", screen: "6.51\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Vivo Y11", year: 2020, category: "budget", price: 2499, ram: 3, storage: 32, chipset: "Snapdragon 439", screen: "6.35\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2021 ---
  { name: "Vivo X60", year: 2021, category: "flagship", price: 16999, ram: 8, storage: 128, chipset: "Snapdragon 870 5G", screen: "6.56\" FHD+ 120Hz ZEISS AMOLED", camera: "48 MP ZEISS OIS + 13 MP 50mm + 13 MP UW", battery: 4300, has5G: true },
  { name: "Vivo X60 Pro", year: 2021, category: "flagship", price: 22999, ram: 12, storage: 256, chipset: "Snapdragon 870 5G", screen: "6.56\" FHD+ 120Hz ZEISS Gimbal 2.0 3D Kavisli AMOLED", camera: "48 MP ZEISS Gimbal 2.0 + 13 MP 50mm Portre + 13 MP UW", battery: 4200, has5G: true },
  { name: "Vivo V21", year: 2021, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Dimensity 800U 5G", screen: "6.44\" FHD+ 90Hz AMOLED (44MP OIS Selfie)", camera: "64 MP OIS + 8 MP + 2 MP Üçlü", battery: 4000, has5G: true },
  { name: "Vivo Y53s", year: 2021, category: "midrange", price: 5999, ram: 8, storage: 128, chipset: "Helio G80 (64MP Kamera)", screen: "6.58\" FHD+ IPS LCD", camera: "64 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Vivo Y21", year: 2021, category: "budget", price: 3999, ram: 4, storage: 64, chipset: "Helio P35 (Slim Tasarım)", screen: "6.51\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Vivo Y12A", year: 2021, category: "budget", price: 3299, ram: 3, storage: 32, chipset: "Snapdragon 439", screen: "6.51\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2022 ---
  { name: "Vivo X80", year: 2022, category: "flagship", price: 24999, ram: 12, storage: 256, chipset: "Dimensity 9000 5G (Vivo V1+ Çip)", screen: "6.78\" FHD+ 120Hz E5 ZEISS AMOLED", camera: "50 MP Sony IMX866 RGBW OIS + 12 MP 50mm + 12 MP UW", battery: 4500, has5G: true },
  { name: "Vivo X80 Pro", year: 2022, category: "flagship", price: 34999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (ZEISS T* Kaplama)", screen: "6.78\" QHD+ 120Hz LTPO 3.0 Ultrasonik Parmak İzli ZEISS", camera: "50 MP GNV OIS + 48 MP UW + 12 MP Gimbal Portre + 8 MP 5x Periskop", battery: 4700, has5G: true },
  { name: "Vivo V25", year: 2022, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Dimensity 900 5G", screen: "6.44\" FHD+ 90Hz Renk Değiştiren Cam AMOLED", camera: "64 MP OIS + 8 MP + 2 MP (50MP Eye AF Selfie)", battery: 4500, has5G: true },
  { name: "Vivo V25 Pro", year: 2022, category: "midrange", price: 18999, ram: 12, storage: 256, chipset: "Dimensity 1300 5G (66W FlashCharge)", screen: "6.56\" FHD+ 120Hz Kavisli AMOLED", camera: "64 MP OIS + 8 MP + 2 MP Üçlü", battery: 4830, has5G: true },
  { name: "Vivo Y22s", year: 2022, category: "budget", price: 6999, ram: 6, storage: 128, chipset: "Snapdragon 680", screen: "6.55\" HD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Vivo Y35", year: 2022, category: "budget", price: 8499, ram: 8, storage: 256, chipset: "Snapdragon 680 (44W Şarj)", screen: "6.58\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Vivo Y16", year: 2022, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Helio P35", screen: "6.51\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2023 ---
  { name: "Vivo X90", year: 2023, category: "flagship", price: 34999, ram: 12, storage: 256, chipset: "Dimensity 9200 5G (120W Şarj)", screen: "6.78\" FHD+ 120Hz ZEISS Curved AMOLED", camera: "50 MP VCS IMX866 OIS + 12 MP 50mm + 12 MP UW", battery: 4810, has5G: true },
  { name: "Vivo X90 Pro", year: 2023, category: "flagship", price: 44999, ram: 12, storage: 256, chipset: "Dimensity 9200 5G (1 Inç ZEISS Sensör)", screen: "6.78\" FHD+ 120Hz Deri Kaplamalı ZEISS AMOLED", camera: "50.3 MP 1\" Sony IMX989 OIS + 50 MP 50mm OIS + 12 MP UW", battery: 4870, has5G: true },
  { name: "Vivo X90 Pro+", year: 2023, category: "flagship", price: 54999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 2 (ZEISS APO Kamera Canavarı)", screen: "6.78\" 2K+ 120Hz E6 LTPO 4.0 ZEISS AMOLED", camera: "50.3 MP 1\" IMX989 OIS + 64 MP 3.5x Periskop OIS + 50 MP 50mm + 48 MP UW", battery: 4700, has5G: true },
  { name: "Vivo V29", year: 2023, category: "midrange", price: 19999, ram: 8, storage: 256, chipset: "Snapdragon 778G 5G (Aura Light Halkası / IP68)", screen: "6.78\" 1.5K 120Hz 3D Kavisli AMOLED", camera: "50 MP OIS + 8 MP UW + 2 MP (50MP Group Selfie)", battery: 4600, has5G: true },
  { name: "Vivo V29 Lite", year: 2023, category: "midrange", price: 12999, ram: 8, storage: 128, chipset: "Snapdragon 695 5G", screen: "6.78\" FHD+ 120Hz Kavisli AMOLED", camera: "64 MP OIS + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Vivo Y36", year: 2023, category: "budget", price: 9499, ram: 8, storage: 256, chipset: "Snapdragon 680 (44W FlashCharge)", screen: "6.64\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Vivo Y27", year: 2023, category: "budget", price: 7999, ram: 6, storage: 128, chipset: "Helio G85 (44W Şarj)", screen: "6.64\" FHD+ Sunlight LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Vivo Y17s", year: 2023, category: "budget", price: 6499, ram: 6, storage: 128, chipset: "Helio G85 (IP54)", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2024 ---
  { name: "Vivo X100", year: 2024, category: "flagship", price: 49999, ram: 16, storage: 512, chipset: "Dimensity 9300 5G (120W Şarj)", screen: "6.78\" 1.5K 120Hz ZEISS LTPO AMOLED", camera: "50 MP Sony VCS OIS + 64 MP ZEISS Tele + 50 MP UW", battery: 5000, has5G: true },
  { name: "Vivo X100 Pro", year: 2024, category: "flagship", price: 64999, ram: 16, storage: 512, chipset: "Dimensity 9300 (ZEISS APO Periskop 1\" Sensör)", screen: "6.78\" 1.5K 120Hz ZEISS LTPO Curved AMOLED", camera: "50 MP 1\" Sony IMX989 OIS + 50 MP ZEISS APO Periskop + 50 MP UW", battery: 5400, has5G: true },
  { name: "Vivo X100 Ultra", year: 2024, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (200MP ZEISS APO Periskop)", screen: "6.78\" 2K+ 120Hz E7 ZEISS LTPO 4.0 AMOLED", camera: "50 MP 1\" Sony LYT-900 Gimbal OIS + 200 MP ZEISS APO 3.7x Periskop + 50 MP UW", battery: 5500, has5G: true },
  { name: "Vivo V30", year: 2024, category: "midrange", price: 23999, ram: 12, storage: 512, chipset: "Snapdragon 7 Gen 3 5G (Akıllı Aura Light 2.0 / IP54)", screen: "6.78\" 1.5K 120Hz 3D Kavisli AMOLED", camera: "50 MP VCS OIS + 50 MP Ultrawide (50MP Eye AF Selfie)", battery: 5000, has5G: true },
  { name: "Vivo V30 Pro", year: 2024, category: "midrange", price: 32999, ram: 12, storage: 512, chipset: "Dimensity 8200 5G (ZEISS Dörtlü 50MP)", screen: "6.78\" 1.5K 120Hz ZEISS 3D Kavisli AMOLED", camera: "50 MP Sony IMX920 OIS + 50 MP 2x Tele + 50 MP UW", battery: 5000, has5G: true },
  { name: "Vivo Y28", year: 2024, category: "budget", price: 9999, ram: 8, storage: 256, chipset: "Helio G85 (6000 mAh / 44W / Dinamik Işık)", screen: "6.68\" HD+ 90Hz LCD", camera: "50 MP + 2 MP Çift", battery: 6000, has5G: false },
  { name: "Vivo Y18", year: 2024, category: "budget", price: 7499, ram: 6, storage: 128, chipset: "Helio G85 (IP54 / 840 Nits)", screen: "6.56\" HD+ 90Hz LCD", camera: "50 MP + 0.08 MP Çift", battery: 5000, has5G: false },
  { name: "Vivo Y03", year: 2024, category: "budget", price: 5499, ram: 4, storage: 64, chipset: "Helio G85", screen: "6.56\" HD+ 90Hz LCD", camera: "13 MP + QVGA", battery: 5000, has5G: false },

  // --- 2025 ---
  { name: "Vivo X200", year: 2025, category: "flagship", price: 59999, ram: 16, storage: 512, chipset: "Dimensity 9400 (3nm / ZEISS Telephoto)", screen: "6.67\" 1.5K 120Hz ZEISS LTPO OLED", camera: "50 MP Sony LYT-818 OIS + 50 MP ZEISS Tele + 50 MP UW", battery: 5800, has5G: true },
  { name: "Vivo X200 Pro", year: 2025, category: "flagship", price: 74999, ram: 16, storage: 512, chipset: "Dimensity 9400 (200MP ZEISS APO Periskop / IP69)", screen: "6.78\" 1.5K 120Hz ZEISS Quad-Curved OLED", camera: "50 MP Sony LYT-818 OIS + 200 MP ZEISS APO 3.7x Periskop + 50 MP UW", battery: 6000, has5G: true },
  { name: "Vivo X200 Ultra", year: 2025, category: "flagship", price: 94999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Elite (200MP ZEISS APO Lideri)", screen: "6.82\" 2K 120Hz E8 ZEISS LTPO 4.0 OLED", camera: "50 MP 1\" LYT-900 OIS + 200 MP ZEISS APO Periskop + 50 MP UW", battery: 6100, has5G: true },
  { name: "Vivo V50", year: 2025, category: "midrange", price: 28999, ram: 12, storage: 512, chipset: "Snapdragon 7 Gen 3 5G (Akıllı Aura Light 3.0)", screen: "6.78\" 1.5K 120Hz 3D Kavisli AMOLED", camera: "50 MP VCS OIS + 50 MP UW + 50 MP Selfie", battery: 5500, has5G: true },
  { name: "Vivo V50 Pro", year: 2025, category: "midrange", price: 38999, ram: 16, storage: 512, chipset: "Dimensity 8300 Ultra 5G (ZEISS Üçlü 50MP)", screen: "6.78\" 1.5K 144Hz ZEISS Kavisli AMOLED", camera: "50 MP Sony OIS + 50 MP ZEISS Tele + 50 MP UW", battery: 5500, has5G: true },
  { name: "Vivo Y200 5G", year: 2025, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Snapdragon 4 Gen 2 5G (Aura Light)", screen: "6.67\" FHD+ 120Hz Smart AMOLED", camera: "64 MP OIS + 2 MP Çift", battery: 4800, has5G: true },

  // --- 2026 ---
  { name: "Vivo X300", year: 2026, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Dimensity 9500 (2nm / ZEISS Master)", screen: "6.67\" 1.5K 144Hz ZEISS LTPO 3.0 OLED", camera: "50 MP Sony OIS + 50 MP ZEISS Tele + 50 MP UW", battery: 6100, has5G: true },
  { name: "Vivo X300 Pro", year: 2026, category: "flagship", price: 84999, ram: 16, storage: 512, chipset: "Dimensity 9500 (200MP ZEISS APO 2.0)", screen: "6.8\" 2K 144Hz ZEISS Quad-Curved OLED", camera: "50 MP 1\" OIS + 200 MP ZEISS APO 2.0 Periskop + 50 MP UW", battery: 6300, has5G: true },
  { name: "Vivo X300 Ultra", year: 2026, category: "flagship", price: 109999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Gen 5 (2nm / Dünyanın En İçi Kamera Amiral Gemisi)", screen: "6.85\" 2K+ 144Hz Titanyum ZEISS Master 4.0", camera: "200 MP ZEISS APO Periskop + 50 MP 1\" Gimbal OIS + 50 MP Tele + 50 MP UW", battery: 6500, has5G: true },
  { name: "Vivo V70", year: 2026, category: "midrange", price: 34999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 3 5G (Aura Light 4.0)", screen: "6.78\" 1.5K 144Hz 3D Kavisli AMOLED", camera: "50 MP VCS OIS + 50 MP Tele + 50 MP UW", battery: 5800, has5G: true },
  { name: "Vivo V70 FE", year: 2026, category: "midrange", price: 24999, ram: 12, storage: 256, chipset: "Dimensity 7350 5G", screen: "6.7\" FHD+ 120Hz Kavisli AMOLED", camera: "50 MP OIS + 8 MP UW", battery: 5500, has5G: true },
  { name: "Vivo V60 Lite", year: 2026, category: "midrange", price: 18999, ram: 8, storage: 256, chipset: "Snapdragon 6 Gen 3 5G", screen: "6.67\" FHD+ 120Hz AMOLED", camera: "50 MP OIS + 8 MP UW", battery: 5200, has5G: true },
  { name: "Vivo Y300 5G", year: 2026, category: "budget", price: 13999, ram: 8, storage: 256, chipset: "Snapdragon 4s Gen 2 5G", screen: "6.67\" FHD+ 120Hz AMOLED", camera: "50 MP OIS + 2 MP", battery: 5500, has5G: true },
  { name: "Vivo Y400 5G", year: 2026, category: "budget", price: 16999, ram: 12, storage: 256, chipset: "Snapdragon 6s Gen 3 5G", screen: "6.7\" FHD+ 120Hz AMOLED (80W Şarj)", camera: "50 MP OIS + 8 MP", battery: 6000, has5G: true }
];

const vivoImages = [
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

const generatedVivoPhones = vivoModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `vivo-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable';
  const rating = isFlagship ? Number((4.7 + (index % 4) * 0.1).toFixed(1)) : Number((4.2 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(125 + (index * 43) % 790);
  const image = vivoImages[index % vivoImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-vv-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 14800,
      url: '#'
    },
    {
      id: `st-ty-vv-${index}`,
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
      id: `st-vt-vv-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 16400,
      url: '#'
    },
    {
      id: `st-mm-vv-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 9200,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Vivo TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Vivo",
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
        resolution: isFlagship ? "3200 x 1440 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2022 ? 120 : 90),
        ppi: isFlagship ? 517 : 392,
        brightnessNits: isFlagship ? 3000 : 1200
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2025 ? "3nm" : (m.year >= 2023 ? "4nm" : "6nm")),
        antutuScore: isFlagship ? 1940000 : 810000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR5X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: !isFlagship && !m.name.includes('X')
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "12 MP",
        telephotoMp: isFlagship ? "200 MP ZEISS APO 3.7x Periskop" : "Yok",
        selfieMp: m.name.includes('V') ? "50 MP Eye AF Selfie" : "32 MP",
        videoRes: isFlagship ? "8K @ 30fps ZEISS CINE" : "4K @ 60fps",
        dxomarkScore: isFlagship ? 158 : 121
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('120W') || m.chipset.includes('120W') ? 120 : (isFlagship ? 90 : 44),
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
        weightGrams: isFlagship ? 211 : 186,
        thicknessMm: 8.0,
        waterResistance: m.name.includes('IP69') ? "IP69 Yüksek Basınçlı Suya Dayanıklı" : (isFlagship ? "IP68 (1.5m 30dk)" : "IP54"),
        frameMaterial: isFlagship ? "Titanyum / Alüminyum" : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "Funtouch OS 16 (Android 16)" : (m.year >= 2024 ? "Funtouch OS 14 (Android 14)" : "Funtouch OS 13"),
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

// Remove any older Vivo phones that we are replacing with our exhaustive catalog
const nonVivoPhones = existingPhones.filter(p => p.brand !== 'Vivo');
const combinedPhones = [...nonVivoPhones, ...generatedVivoPhones];

console.log(`Generated ${generatedVivoPhones.length} comprehensive Vivo models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Vivo 2018-2026 models!");
