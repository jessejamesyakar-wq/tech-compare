const fs = require('fs');
const path = require('path');

const realmeModels = [
  // --- 2018 ---
  { name: "Realme 1", year: 2018, category: "budget", price: 2199, ram: 4, storage: 64, chipset: "Helio P60", screen: "6.0\" FHD+ IPS LCD", camera: "13 MP", battery: 3410, has5G: false },
  { name: "Realme 2", year: 2018, category: "budget", price: 2499, ram: 4, storage: 64, chipset: "Snapdragon 450", screen: "6.2\" HD+ Çentikli LCD", camera: "13 MP + 2 MP Çift", battery: 4230, has5G: false },
  { name: "Realme 2 Pro", year: 2018, category: "budget", price: 2999, ram: 6, storage: 64, chipset: "Snapdragon 660", screen: "6.3\" FHD+ Damla Çentikli LCD", camera: "16 MP Sony IMX398 + 2 MP Çift", battery: 3500, has5G: false },
  { name: "Realme C1", year: 2018, category: "budget", price: 1799, ram: 2, storage: 16, chipset: "Snapdragon 450", screen: "6.2\" HD+ LCD", camera: "13 MP + 2 MP", battery: 4230, has5G: false },
  { name: "Realme U1", year: 2018, category: "budget", price: 2299, ram: 3, storage: 32, chipset: "Helio P70 (25MP Selfie)", screen: "6.3\" FHD+ LCD", camera: "13 MP + 2 MP (25MP Selfie)", battery: 3500, has5G: false },

  // --- 2019 ---
  { name: "Realme 3", year: 2019, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Helio P70", screen: "6.22\" HD+ LCD", camera: "13 MP + 2 MP", battery: 4230, has5G: false },
  { name: "Realme 3 Pro", year: 2019, category: "budget", price: 3499, ram: 6, storage: 64, chipset: "Snapdragon 710", screen: "6.3\" FHD+ IPS LCD", camera: "16 MP Sony IMX519 + 5 MP Çift", battery: 4045, has5G: false },
  { name: "Realme 3i", year: 2019, category: "budget", price: 2399, ram: 3, storage: 32, chipset: "Helio P60", screen: "6.22\" HD+ LCD", camera: "13 MP + 2 MP", battery: 4230, has5G: false },
  { name: "Realme 5", year: 2019, category: "budget", price: 3299, ram: 4, storage: 64, chipset: "Snapdragon 665 (5000 mAh Batarya)", screen: "6.5\" HD+ LCD", camera: "12 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Realme 5 Pro", year: 2019, category: "budget", price: 4299, ram: 8, storage: 128, chipset: "Snapdragon 712 (48MP Dörtlü Kamera)", screen: "6.3\" FHD+ IPS LCD", camera: "48 MP IMX586 + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4035, has5G: false },
  { name: "Realme 5i", year: 2019, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Snapdragon 665", screen: "6.5\" HD+ LCD", camera: "12 MP + 8 MP UW + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Realme C2", year: 2019, category: "budget", price: 1899, ram: 3, storage: 32, chipset: "Helio P22", screen: "6.1\" HD+ LCD", camera: "13 MP + 2 MP", battery: 4000, has5G: false },
  { name: "Realme X", year: 2019, category: "midrange", price: 4999, ram: 8, storage: 128, chipset: "Snapdragon 710 (Pop-Up Kameralı AMOLED)", screen: "6.53\" FHD+ AMOLED Pop-Up Kamera", camera: "48 MP IMX586 + 5 MP", battery: 3765, has5G: false },
  { name: "Realme XT", year: 2019, category: "midrange", price: 5499, ram: 8, storage: 128, chipset: "Snapdragon 712 (64MP Kameralı Efsane)", screen: "6.4\" FHD+ Super AMOLED Ekrana Gömülü Parmak İzi", camera: "64 MP Samsung GW1 + 8 MP UW + 2 MP + 2 MP", battery: 4000, has5G: false },
  { name: "Realme X2", year: 2019, category: "midrange", price: 6299, ram: 8, storage: 128, chipset: "Snapdragon 730G (30W VOOC 4.0)", screen: "6.4\" FHD+ Super AMOLED", camera: "64 MP GW1 + 8 MP UW + 2 MP + 2 MP", battery: 4000, has5G: false },
  { name: "Realme X2 Pro", year: 2019, category: "flagship", price: 7999, ram: 12, storage: 256, chipset: "Snapdragon 855+ (90Hz / 50W Fast Charge)", screen: "6.5\" FHD+ 90Hz Super AMOLED", camera: "64 MP OIS + 13 MP 2x Tele + 8 MP UW + 2 MP", battery: 4000, has5G: false },

  // --- 2020 ---
  { name: "Realme 6", year: 2020, category: "budget", price: 4499, ram: 8, storage: 128, chipset: "Helio G90T (90Hz Ekran / 30W Şarj)", screen: "6.5\" FHD+ 90Hz LCD", camera: "64 MP + 8 MP UW + 2 MP + 2 MP", battery: 4300, has5G: false },
  { name: "Realme 6 Pro", year: 2020, category: "budget", price: 5499, ram: 8, storage: 128, chipset: "Snapdragon 720G (90Hz / Çift Ön Kamera)", screen: "6.6\" FHD+ 90Hz LCD", camera: "64 MP + 12 MP 2x Tele + 8 MP UW + 2 MP", battery: 4300, has5G: false },
  { name: "Realme 6i", year: 2020, category: "budget", price: 3499, ram: 4, storage: 128, chipset: "Helio G80 (5000 mAh Batarya)", screen: "6.5\" HD+ LCD", camera: "48 MP + 8 MP UW + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Realme 7", year: 2020, category: "budget", price: 5299, ram: 8, storage: 128, chipset: "Helio G95 (90Hz / 30W Dart)", screen: "6.5\" FHD+ 90Hz LCD", camera: "64 MP Sony IMX682 + 8 MP UW + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Realme 7 Pro", year: 2020, category: "midrange", price: 6499, ram: 8, storage: 128, chipset: "Snapdragon 720G (65W SuperDart Charge & Stereo)", screen: "6.4\" FHD+ Super AMOLED", camera: "64 MP IMX682 + 8 MP UW + 2 MP + 2 MP", battery: 4500, has5G: false },
  { name: "Realme 7i", year: 2020, category: "budget", price: 4199, ram: 8, storage: 128, chipset: "Snapdragon 662 (90Hz Ekran)", screen: "6.5\" HD+ 90Hz LCD", camera: "64 MP + 8 MP UW + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Realme C3", year: 2020, category: "budget", price: 2499, ram: 3, storage: 64, chipset: "Helio G70", screen: "6.5\" HD+ LCD", camera: "12 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Realme C11", year: 2020, category: "budget", price: 2199, ram: 2, storage: 32, chipset: "Helio G35", screen: "6.5\" HD+ LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Realme C15", year: 2020, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Helio G35 (6000 mAh Mega Batarya)", screen: "6.5\" HD+ LCD", camera: "13 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 6000, has5G: false },
  { name: "Realme X50 Pro 5G", year: 2020, category: "flagship", price: 11999, ram: 12, storage: 256, chipset: "Snapdragon 865 5G (90Hz Super AMOLED & 65W)", screen: "6.44\" FHD+ 90Hz Super AMOLED", camera: "64 MP GW1 + 12 MP 2x Tele + 8 MP UW + 2 MP", battery: 4200, has5G: true },

  // --- 2021 ---
  { name: "Realme 8", year: 2021, category: "budget", price: 6299, ram: 6, storage: 128, chipset: "Helio G95 (Super AMOLED Ekran)", screen: "6.4\" FHD+ Super AMOLED 30W", camera: "64 MP + 8 MP UW + 2 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Realme 8 Pro", year: 2021, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 720G (108MP HM2 Kamera)", screen: "6.4\" FHD+ Super AMOLED 50W", camera: "108 MP HM2 + 8 MP UW + 2 MP + 2 MP", battery: 4500, has5G: false },
  { name: "Realme 8i", year: 2021, category: "budget", price: 4999, ram: 6, storage: 128, chipset: "Helio G96 (120Hz Ekran)", screen: "6.6\" FHD+ 120Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Realme 9", year: 2021, category: "midrange", price: 8499, ram: 8, storage: 128, chipset: "Snapdragon 680 (108MP ProLight Kamera)", screen: "6.4\" FHD+ 90Hz Super AMOLED 1000 Nits", camera: "108 MP HM6 + 8 MP UW + 2 MP", battery: 5000, has5G: false },

  // --- 2022 ---
  { name: "Realme 9 Pro+", year: 2022, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 920 5G (Sony IMX766 OIS & Kalp Atış Sensörü)", screen: "6.4\" FHD+ 90Hz Super AMOLED 60W", camera: "50 MP IMX766 OIS + 8 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "Realme 9i", year: 2022, category: "budget", price: 5999, ram: 6, storage: 128, chipset: "Snapdragon 680 (33W Dart Charge)", screen: "6.6\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Realme 10", year: 2022, category: "budget", price: 7499, ram: 8, storage: 128, chipset: "Helio G99 (90Hz Super AMOLED / 33W)", screen: "6.4\" FHD+ 90Hz Super AMOLED Gorilla Glass 5", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Realme 10 Pro+", year: 2022, category: "midrange", price: 13999, ram: 12, storage: 256, chipset: "Dimensity 1080 5G (120Hz 3D Kavisli AMOLED & 108MP)", screen: "6.7\" FHD+ 120Hz Kavisli OLED 67W", camera: "108 MP HM6 + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "Realme C30", year: 2022, category: "budget", price: 3199, ram: 3, storage: 32, chipset: "Unisoc T612", screen: "6.5\" HD+ LCD", camera: "8 MP", battery: 5000, has5G: false },
  { name: "Realme C33", year: 2022, category: "budget", price: 3899, ram: 4, storage: 64, chipset: "Unisoc T612 (50MP Kamera)", screen: "6.5\" HD+ LCD", camera: "50 MP + 0.3 MP", battery: 5000, has5G: false },
  { name: "Realme C35", year: 2022, category: "budget", price: 4499, ram: 4, storage: 128, chipset: "Unisoc T616 (FHD+ Ekran & 50MP)", screen: "6.6\" FHD+ LCD", camera: "50 MP + 2 MP + 0.3 MP", battery: 5000, has5G: false },

  // --- 2023 ---
  { name: "Realme 11 Pro+", year: 2023, category: "midrange", price: 17999, ram: 12, storage: 512, chipset: "Dimensity 7050 5G (200MP OIS 4x Zoom & 100W / Deri Kasa)", screen: "6.7\" FHD+ 120Hz 3D Kavisli AMOLED", camera: "200 MP Samsung HP3 OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "Realme 11 Pro", year: 2023, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Dimensity 7050 5G (100MP OIS & 67W)", screen: "6.7\" FHD+ 120Hz Kavisli AMOLED", camera: "100 MP OIS + 2 MP", battery: 5000, has5G: true },
  { name: "Realme C51", year: 2023, category: "budget", price: 4999, ram: 4, storage: 128, chipset: "Unisoc T612 (33W Şarj)", screen: "6.74\" HD+ 90Hz LCD", camera: "50 MP + 0.08 MP", battery: 5000, has5G: false },
  { name: "Realme C53", year: 2023, category: "budget", price: 5699, ram: 6, storage: 128, chipset: "Unisoc T612 (Mini Capsule Dinamik Ada)", screen: "6.74\" FHD+ 90Hz LCD", camera: "50 MP + 0.08 MP", battery: 5000, has5G: false },
  { name: "Realme C55", year: 2023, category: "budget", price: 6999, ram: 8, storage: 256, chipset: "Helio G88 (64MP Kamera & Mini Capsule)", screen: "6.72\" FHD+ 90Hz LCD 33W", camera: "64 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Realme Narzo 60", year: 2023, category: "midrange", price: 9999, ram: 8, storage: 128, chipset: "Dimensity 6020 5G (90Hz Super AMOLED)", screen: "6.43\" FHD+ 90Hz Super AMOLED", camera: "64 MP + 2 MP", battery: 5000, has5G: true },

  // --- 2024 ---
  { name: "Realme 12 Pro+", year: 2024, category: "midrange", price: 21999, ram: 12, storage: 512, chipset: "Snapdragon 7s Gen 2 5G (64MP 3x Periskop Telephoto)", screen: "6.7\" FHD+ 120Hz Kavisli Lüks Saat Tasarımlı AMOLED", camera: "50 MP Sony IMX890 OIS + 64 MP 3x Periskop OIS + 8 MP UW", battery: 5000, has5G: true },
  { name: "Realme 12 Pro", year: 2024, category: "midrange", price: 17999, ram: 8, storage: 256, chipset: "Snapdragon 6 Gen 1 5G (32MP 2x Telephoto)", screen: "6.7\" FHD+ 120Hz Kavisli AMOLED", camera: "50 MP Sony IMX882 OIS + 32 MP 2x Tele + 8 MP UW", battery: 5000, has5G: true },
  { name: "Realme 12+ 5G", year: 2024, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Dimensity 7050 5G (Sony LYT-600 OIS & 67W)", screen: "6.67\" FHD+ 120Hz Düz AMOLED 2000 Nits", camera: "50 MP Sony LYT-600 OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "Realme GT 6", year: 2024, category: "flagship", price: 32999, ram: 16, storage: 512, chipset: "Snapdragon 8s Gen 3 (6000 Nits Rekor Parlaklık / 120W)", screen: "6.78\" 1.5K 120Hz 8T LTPO AMOLED 6000 Nits", camera: "50 MP Sony LYT-808 OIS + 50 MP 2x Tele OIS + 8 MP UW", battery: 5500, has5G: true },
  { name: "Realme GT 6T", year: 2024, category: "midrange", price: 24999, ram: 12, storage: 256, chipset: "Snapdragon 7+ Gen 3 5G (6000 Nits Ekran & 120W)", screen: "6.78\" 1.5K 120Hz LTPO AMOLED 6000 Nits", camera: "50 MP Sony LYT-600 OIS + 8 MP UW", battery: 5500, has5G: true },
  { name: "Realme Note 50", year: 2024, category: "budget", price: 3999, ram: 4, storage: 64, chipset: "Unisoc T612 (IP54)", screen: "6.74\" HD+ 90Hz LCD", camera: "13 MP + 0.08 MP", battery: 5000, has5G: false },
  { name: "Realme C61", year: 2024, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Unisoc T612 (50MP Kamera / IP54)", screen: "6.74\" HD+ 90Hz LCD", camera: "50 MP + 0.08 MP", battery: 5000, has5G: false },
  { name: "Realme C65", year: 2024, category: "budget", price: 6999, ram: 8, storage: 256, chipset: "Helio G85 (45W Şarj / TÜV Sertifikası)", screen: "6.67\" HD+ 90Hz LCD 45W", camera: "50 MP + 2 MP", battery: 5000, has5G: false },
  { name: "Realme C75", year: 2024, category: "budget", price: 8999, ram: 8, storage: 256, chipset: "Helio G92 Max (IP69 Dayanıklı Gövde & 6000 mAh)", screen: "6.72\" FHD+ 90Hz LCD 45W", camera: "50 MP + 2 MP", battery: 6000, has5G: false },

  // --- 2025 ---
  { name: "Realme GT 7 Pro", year: 2025, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (3nm / Su Altı Modu IP69 & 6500 mAh)", screen: "6.78\" 1.5K 120Hz Eco2 OLED 120W", camera: "50 MP Sony OIS + 50 MP 3x Periskop OIS + 8 MP UW", battery: 6500, has5G: true },
  { name: "Realme 14 Pro", year: 2025, category: "midrange", price: 23999, ram: 12, storage: 256, chipset: "Snapdragon 7s Gen 3 5G (Soğuk Renk Katmanı & Kavisli OLED)", screen: "6.7\" FHD+ 120Hz Kavisli AMOLED 80W", camera: "50 MP Sony OIS + 50 MP 3x Tele OIS + 8 MP UW", battery: 5500, has5G: true },
  { name: "Realme 14 Pro+", year: 2025, category: "midrange", price: 28999, ram: 16, storage: 512, chipset: "Snapdragon 7 Gen 4 5G (50MP 3.5x Periskop OIS)", screen: "6.78\" 1.5K 144Hz LTPO AMOLED 100W", camera: "50 MP Sony OIS + 50 MP 3.5x Periskop OIS + 12 MP UW", battery: 5800, has5G: true },
  { name: "Realme Narzo 70", year: 2025, category: "budget", price: 11999, ram: 8, storage: 128, chipset: "Dimensity 7050 5G (VC Sıvı Soğutma & 45W)", screen: "6.67\" FHD+ 120Hz AMOLED 1200 Nits", camera: "50 MP + 2 MP", battery: 5000, has5G: true },
  { name: "Realme C73", year: 2025, category: "budget", price: 9499, ram: 8, storage: 256, chipset: "Dimensity 6300 5G", screen: "6.72\" FHD+ 120Hz LCD", camera: "50 MP + 2 MP", battery: 5500, has5G: true },

  // --- 2026 ---
  { name: "Realme GT 8 Pro", year: 2026, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 (2nm Zirve Oyuncu / 7000 mAh Batarya / 150W)", screen: "6.85\" 2K 144Hz LTPO AMOLED 150W", camera: "50 MP 1\" OIS + 200 MP Periskop OIS + 50 MP UW", battery: 7000, has5G: true },
  { name: "Realme 16 Pro", year: 2026, category: "midrange", price: 29999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 5 5G", screen: "6.78\" 1.5K 144Hz Kavisli AMOLED 100W", camera: "50 MP Sony OIS + 50 MP 3x Tele OIS + 12 MP UW", battery: 6000, has5G: true },
  { name: "Realme 16 Pro+", year: 2026, category: "midrange", price: 35999, ram: 16, storage: 512, chipset: "Snapdragon 8s Gen 5 (200MP Periskop OIS)", screen: "6.8\" 1.5K 144Hz LTPO AMOLED 120W", camera: "50 MP Sony 1\" OIS + 200 MP Periskop OIS + 50 MP UW", battery: 6200, has5G: true },
  { name: "Realme P4 Power", year: 2026, category: "midrange", price: 21999, ram: 12, storage: 256, chipset: "Dimensity 7400 5G (7000 mAh Dev Pil & 80W)", screen: "6.78\" FHD+ 144Hz OLED 2500 Nits", camera: "50 MP OIS + 8 MP UW", battery: 7000, has5G: true },
  { name: "Realme P4 Pro", year: 2026, category: "midrange", price: 24999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 4 5G (6000 mAh & 100W)", screen: "6.78\" 1.5K 144Hz OLED", camera: "50 MP OIS + 50 MP Tele + 8 MP UW", battery: 6000, has5G: true },
  { name: "Realme C85", year: 2026, category: "budget", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 6400 5G (6000 mAh & IP69)", screen: "6.74\" FHD+ 120Hz LCD", camera: "50 MP OIS + 2 MP", battery: 6000, has5G: true }
];

const realmeImages = [
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

const generatedRealmePhones = realmeModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `realme-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.name.includes('Pro+') || m.name.includes('GT') || m.name.includes('X2 Pro') || m.name.includes('X50');
  const rating = isFlagship ? Number((4.7 + (index % 3) * 0.1).toFixed(1)) : Number((4.3 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(110 + (index * 33) % 720);
  const image = realmeImages[index % realmeImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-rlm-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 16500,
      url: '#'
    },
    {
      id: `st-ty-rlm-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 24100,
      url: '#'
    },
    {
      id: `st-vt-rlm-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 14800,
      url: '#'
    },
    {
      id: `st-mm-rlm-${index}`,
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
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Realme TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Realme",
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
        size: m.screen.split(' ')[0] || "6.7\"",
        type: m.screen,
        resolution: isFlagship ? "2800 x 1260 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2020 ? 120 : 90),
        ppi: isFlagship ? 450 : 394,
        brightnessNits: isFlagship ? 4500 : 1200
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2024 ? "4nm" : "6nm"),
        antutuScore: isFlagship ? 1850000 : 750000
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
        ultrawideMp: "8 MP",
        telephotoMp: m.camera.includes('Periskop') ? "64 MP Periskop OIS" : (m.camera.includes('Tele') ? "32 MP Tele OIS" : "Yok"),
        selfieMp: isFlagship ? "32 MP" : "16 MP",
        videoRes: isFlagship ? "4K @ 60fps" : "1080p @ 60fps",
        dxomarkScore: isFlagship ? 152 : 122
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('120W') || m.chipset.includes('120W') ? 120 : (m.screen.includes('67W') || m.screen.includes('65W') ? 67 : 33),
        wirelessCharging: isFlagship && m.year >= 2025,
        reverseWireless: isFlagship && m.year >= 2025
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: isFlagship ? "Wi-Fi 7" : "Wi-Fi 6",
        bluetooth: "5.4",
        hasNFC: true,
        hasesim: isFlagship
      },
      build: {
        weightGrams: isFlagship ? 205 : 185,
        thicknessMm: 8.2,
        waterResistance: m.chipset.includes('IP69') ? "IP69" : (isFlagship ? "IP68" : "IP54"),
        frameMaterial: isFlagship ? "Deri / Alüminyum / Cam" : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "Realme UI 7.0 (Android 16)" : (m.year >= 2024 ? "Realme UI 5.0 (Android 14)" : "Realme UI 3.0"),
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

// Remove older Realme entries to replace with our exhaustive 61-model Realme catalog
const nonRealmePhones = existingPhones.filter(p => p.brand !== 'Realme');
const combinedPhones = [...nonRealmePhones, ...generatedRealmePhones];

console.log(`Generated ${generatedRealmePhones.length} comprehensive Realme smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Realme 2018-2026 smartphone models!");
