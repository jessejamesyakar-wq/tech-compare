const fs = require('fs');
const path = require('path');

const infinixModels = [
  // --- 2018 ---
  { name: "Infinix Hot 6", year: 2018, category: "budget", price: 1799, ram: 2, storage: 16, chipset: "Snapdragon 425", screen: "6.0\" HD+ IPS LCD", camera: "13 MP", battery: 4000, has5G: false },
  { name: "Infinix Hot 6 Pro", year: 2018, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Snapdragon 425", screen: "6.0\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 4000, has5G: false },
  { name: "Infinix Hot 6X", year: 2018, category: "budget", price: 2499, ram: 3, storage: 32, chipset: "Snapdragon 425", screen: "6.2\" HD+ Çentikli LCD", camera: "13 MP + 2 MP Çift", battery: 4000, has5G: false },
  { name: "Infinix Note 5", year: 2018, category: "budget", price: 2999, ram: 3, storage: 32, chipset: "Helio P23 (Android One)", screen: "5.99\" FHD+ IPS LCD", camera: "12 MP", battery: 4500, has5G: false },
  { name: "Infinix Note 5 Stylus", year: 2018, category: "midrange", price: 3799, ram: 4, storage: 64, chipset: "Helio P23 (Dahili X-Pen Kalemli)", screen: "5.99\" FHD+ IPS LCD", camera: "16 MP", battery: 4000, has5G: false },
  { name: "Infinix Smart 2", year: 2018, category: "budget", price: 1499, ram: 2, storage: 16, chipset: "MT6739", screen: "5.5\" HD+ IPS LCD", camera: "13 MP", battery: 3050, has5G: false },
  { name: "Infinix S3X", year: 2018, category: "budget", price: 2699, ram: 3, storage: 32, chipset: "Snapdragon 430", screen: "6.2\" HD+ IPS LCD (16MP Selfie)", camera: "13 MP + 2 MP Çift", battery: 4000, has5G: false },

  // --- 2019 ---
  { name: "Infinix Hot 7", year: 2019, category: "budget", price: 2299, ram: 2, storage: 32, chipset: "MT6580 / Helio A22", screen: "6.2\" HD+ IPS LCD", camera: "13 MP Çift", battery: 4000, has5G: false },
  { name: "Infinix Hot 7 Pro", year: 2019, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Helio P22", screen: "6.2\" HD+ Dört Kameralı LCD", camera: "13 MP + 2 MP Arka / 13 MP + 2 MP Ön", battery: 4000, has5G: false },
  { name: "Infinix Smart 3 Plus", year: 2019, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Helio A22", screen: "6.21\" HD+ Üç Kameralı LCD", camera: "13 MP + 2 MP + QVGA Üçlü", battery: 3500, has5G: false },
  { name: "Infinix S4", year: 2019, category: "budget", price: 3299, ram: 4, storage: 64, chipset: "Helio P22 (32MP AI Selfie)", screen: "6.26\" HD+ IPS LCD", camera: "13 MP + 8 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "Infinix Zero 6", year: 2019, category: "midrange", price: 4499, ram: 6, storage: 64, chipset: "Snapdragon 636", screen: "6.18\" FHD+ IPS LCD Gorilla Glass 5", camera: "24 MP + 12 MP Çift", battery: 3650, has5G: false },
  { name: "Infinix Zero 6 Pro", year: 2019, category: "midrange", price: 5299, ram: 6, storage: 128, chipset: "Snapdragon 636", screen: "6.18\" FHD+ IPS LCD", camera: "24 MP + 12 MP Çift", battery: 3650, has5G: false },

  // --- 2020 ---
  { name: "Infinix Hot 8", year: 2020, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Helio P22 (5000 mAh Batarya)", screen: "6.52\" HD+ IPS LCD", camera: "13 MP + 2 MP + QVGA Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Hot 9", year: 2020, category: "budget", price: 3499, ram: 4, storage: 128, chipset: "Helio A25", screen: "6.6\" HD+ Punch-Hole LCD", camera: "16 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5000, has5G: false },
  { name: "Infinix Hot 9 Pro", year: 2020, category: "budget", price: 3999, ram: 4, storage: 128, chipset: "Helio P22 (48MP Kamera)", screen: "6.6\" HD+ Punch-Hole LCD", camera: "48 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5000, has5G: false },
  { name: "Infinix Hot 9 Play", year: 2020, category: "budget", price: 3299, ram: 3, storage: 64, chipset: "Helio A25 (6000 mAh Dev Pil)", screen: "6.82\" HD+ IPS LCD", camera: "13 MP + QVGA Çift", battery: 6000, has5G: false },
  { name: "Infinix Note 7", year: 2020, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Helio G70 (Stereo Hoparlör)", screen: "6.95\" HD+ Punch-Hole LCD", camera: "48 MP + 2 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Infinix Note 7 Lite", year: 2020, category: "budget", price: 3799, ram: 4, storage: 128, chipset: "Helio P22", screen: "6.6\" HD+ Punch-Hole LCD", camera: "48 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5000, has5G: false },
  { name: "Infinix Zero 8", year: 2020, category: "midrange", price: 6499, ram: 8, storage: 128, chipset: "Helio G90T (90Hz Elmas Tasarım)", screen: "6.85\" FHD+ 90Hz Çift Ön Kameralı LCD", camera: "64 MP Sony IMX686 + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4500, has5G: false },
  { name: "Infinix Zero 8i", year: 2020, category: "midrange", price: 5499, ram: 8, storage: 128, chipset: "Helio G90T", screen: "6.85\" FHD+ 90Hz LCD", camera: "48 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4500, has5G: false },
  { name: "Infinix Smart 4", year: 2020, category: "budget", price: 2199, ram: 2, storage: 32, chipset: "Helio A22", screen: "6.6\" HD+ IPS LCD", camera: "8 MP", battery: 4000, has5G: false },
  { name: "Infinix Smart 5", year: 2020, category: "budget", price: 2799, ram: 3, storage: 64, chipset: "Helio A20", screen: "6.6\" HD+ IPS LCD", camera: "13 MP + QVGA", battery: 5000, has5G: false },
  { name: "Infinix S5", year: 2020, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Helio P22 (32MP Punch-Hole Selfie)", screen: "6.6\" HD+ LCD", camera: "16 MP + 5 MP UW + 2 MP + QVGA", battery: 4000, has5G: false },
  { name: "Infinix S5 Pro", year: 2020, category: "midrange", price: 4299, ram: 6, storage: 128, chipset: "Helio P35 (40MP Pop-Up Selfie)", screen: "6.53\" FHD+ Pop-Up Kameralı LCD", camera: "48 MP + 2 MP + QVGA Üçlü", battery: 4000, has5G: false },

  // --- 2021 ---
  { name: "Infinix Hot 10", year: 2021, category: "budget", price: 3999, ram: 4, storage: 128, chipset: "Helio G70", screen: "6.78\" HD+ IPS LCD", camera: "16 MP + 2 MP + 2 MP + QVGA Dörtlü", battery: 5200, has5G: false },
  { name: "Infinix Hot 10S", year: 2021, category: "budget", price: 4799, ram: 6, storage: 128, chipset: "Helio G85 (90Hz Oyun Ekranı)", screen: "6.82\" HD+ 90Hz LCD", camera: "48 MP + 2 MP + AI Üçlü", battery: 6000, has5G: false },
  { name: "Infinix Hot 11", year: 2021, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Helio G70", screen: "6.6\" FHD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Infinix Hot 11S", year: 2021, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Helio G88 (90Hz FHD+ / 50MP)", screen: "6.78\" FHD+ 90Hz LCD", camera: "50 MP + 2 MP + AI Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Note 10", year: 2021, category: "midrange", price: 5999, ram: 6, storage: 128, chipset: "Helio G85", screen: "6.95\" FHD+ LCD", camera: "48 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Note 10 Pro", year: 2021, category: "midrange", price: 7499, ram: 8, storage: 128, chipset: "Helio G95 (90Hz 33W Fast Charge)", screen: "6.95\" FHD+ 90Hz LCD", camera: "64 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Infinix Note 11", year: 2021, category: "midrange", price: 6499, ram: 6, storage: 128, chipset: "Helio G88 (AMOLED Ekran)", screen: "6.7\" FHD+ Vivid AMOLED", camera: "50 MP + 2 MP + QVGA Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Note 11 Pro", year: 2021, category: "midrange", price: 8499, ram: 8, storage: 128, chipset: "Helio G96 (120Hz / 30x Zoom)", screen: "6.95\" FHD+ 120Hz LCD", camera: "64 MP + 13 MP 30x Tele + 2 MP", battery: 5000, has5G: false },
  { name: "Infinix Zero X", year: 2021, category: "flagship", price: 9999, ram: 8, storage: 128, chipset: "Helio G95 (OIS & 60x Periskop Zoom)", screen: "6.67\" FHD+ 120Hz AMOLED", camera: "64 MP OIS + 8 MP 5x Periskop OIS + 8 MP UW", battery: 4500, has5G: false },
  { name: "Infinix Zero X Pro", year: 2021, category: "flagship", price: 11999, ram: 8, storage: 256, chipset: "Helio G95 (108MP OIS & 60x Periskop)", screen: "6.67\" FHD+ 120Hz AMOLED (45W Şarj)", camera: "108 MP OIS + 8 MP 5x Periskop OIS + 8 MP UW", battery: 4500, has5G: false },

  // --- 2022 ---
  { name: "Infinix Hot 12", year: 2022, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Helio G85 (90Hz Pro)", screen: "6.82\" HD+ 90Hz LCD", camera: "13 MP + 2 MP + QVGA", battery: 5000, has5G: false },
  { name: "Infinix Hot 12 Pro", year: 2022, category: "budget", price: 6499, ram: 8, storage: 128, chipset: "Unisoc T616 (90Hz / 50MP)", screen: "6.6\" HD+ 90Hz LCD", camera: "50 MP + AI Çift", battery: 5000, has5G: false },
  { name: "Infinix Hot 20", year: 2022, category: "budget", price: 6999, ram: 6, storage: 128, chipset: "Helio G85 (50MP / 90Hz)", screen: "6.82\" HD+ 90Hz Punch-Hole LCD", camera: "50 MP + QVGA Çift", battery: 5000, has5G: false },
  { name: "Infinix Note 12", year: 2022, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Helio G88", screen: "6.7\" FHD+ AMOLED (33W Şarj)", camera: "50 MP + 2 MP + QVGA Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Note 12 Pro", year: 2022, category: "midrange", price: 9999, ram: 8, storage: 256, chipset: "Helio G99 (108MP AMOLED)", screen: "6.7\" FHD+ True Color AMOLED", camera: "108 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Zero 5G", year: 2022, category: "flagship", price: 10999, ram: 8, storage: 128, chipset: "Dimensity 900 5G (İlk 5G Amiral Gemisi)", screen: "6.78\" FHD+ 120Hz Uni-Curve LCD", camera: "48 MP + 13 MP 2x Tele + 2 MP", battery: 5000, has5G: true },
  { name: "Infinix Zero 20", year: 2022, category: "flagship", price: 12999, ram: 8, storage: 256, chipset: "Helio G99 (Dünyanın İlk 60MP OIS Selfie Kamerası)", screen: "6.7\" FHD+ 90Hz AMOLED 45W", camera: "108 MP + 13 MP + 2 MP (60MP OIS Selfie)", battery: 4500, has5G: false },

  // --- 2023 ---
  { name: "Infinix Hot 30", year: 2023, category: "budget", price: 7999, ram: 8, storage: 128, chipset: "Helio G88 (33W Fast Charge)", screen: "6.78\" FHD+ 90Hz 600 Nits LCD", camera: "50 MP + AI Çift", battery: 5000, has5G: false },
  { name: "Infinix Hot 30i", year: 2023, category: "budget", price: 5999, ram: 8, storage: 128, chipset: "Unisoc T606 (90Hz)", screen: "6.56\" HD+ 90Hz LCD", camera: "13 MP + AI Çift", battery: 5000, has5G: false },
  { name: "Infinix Hot 40", year: 2023, category: "budget", price: 8999, ram: 8, storage: 256, chipset: "Helio G88 (Magic Ring Bildirim Halkası)", screen: "6.78\" FHD+ 90Hz LCD 33W", camera: "50 MP + 2 MP + AI Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Hot 40 Pro", year: 2023, category: "budget", price: 10999, ram: 8, storage: 256, chipset: "Helio G99 (Free Fire Özel Sürüm / 120Hz)", screen: "6.78\" FHD+ 120Hz LCD 33W", camera: "108 MP + 2 MP + AI Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Note 30", year: 2023, category: "midrange", price: 10999, ram: 8, storage: 256, chipset: "Helio G99 (JBL Ses & 45W Şarj)", screen: "6.78\" FHD+ 120Hz Eye-Care LCD", camera: "64 MP Omnivision + 2 MP + QVGA", battery: 5000, has5G: false },
  { name: "Infinix Note 30 Pro", year: 2023, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Helio G99 (JBL Ses & 68W Kablolu / 15W Kablosuz Şarj)", screen: "6.67\" FHD+ 120Hz 10-Bit AMOLED", camera: "108 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Zero 30 4G", year: 2023, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Helio G99 (2K Vlog Ön Kamera / Kavisli)", screen: "6.78\" FHD+ 120Hz 3D Kavisli AMOLED", camera: "108 MP OIS + 2 MP + 2 MP (50MP 2K Vlog Selfie)", battery: 5000, has5G: false },
  { name: "Infinix Zero 30 5G", year: 2023, category: "flagship", price: 18999, ram: 12, storage: 256, chipset: "Dimensity 8020 5G (4K 60fps Ön Vlog Kamerası)", screen: "6.78\" FHD+ 144Hz 3D Kavisli AMOLED (68W Şarj)", camera: "108 MP OIS + 13 MP UW + 2 MP (50MP 4K 60fps Selfie)", battery: 5000, has5G: true },
  { name: "Infinix Smart 7", year: 2023, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Unisoc SC9863A", screen: "6.6\" HD+ LCD", camera: "13 MP + AI Çift", battery: 5000, has5G: false },
  { name: "Infinix Smart 8", year: 2023, category: "budget", price: 5499, ram: 4, storage: 128, chipset: "Unisoc T606 (Magic Ring / 90Hz)", screen: "6.6\" HD+ 90Hz LCD", camera: "13 MP + AI Çift", battery: 5000, has5G: false },

  // --- 2024 ---
  { name: "Infinix Hot 50", year: 2024, category: "budget", price: 9999, ram: 8, storage: 256, chipset: "Helio G100 (6.8mm İnce Gövde / 120Hz)", screen: "6.78\" FHD+ 120Hz 800 Nits LCD", camera: "50 MP + 2 MP + AI Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Hot 50 Pro", year: 2024, category: "budget", price: 11999, ram: 8, storage: 256, chipset: "Helio G100 (33W Fast Charge / AMOLED)", screen: "6.78\" FHD+ 120Hz AMOLED 1300 Nits", camera: "50 MP Sony IMX682 + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Infinix Note 40", year: 2024, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Helio G99 Ultimate (MagCharge Kablosuz Şarj)", screen: "6.78\" FHD+ 120Hz 1300 Nits AMOLED (45W Şarj)", camera: "108 MP OIS + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Infinix Note 40 Pro 5G", year: 2024, category: "midrange", price: 17999, ram: 12, storage: 256, chipset: "Dimensity 7020 5G (MagCharge & 70W Fast Charge)", screen: "6.78\" FHD+ 120Hz 3D Kavisli AMOLED JBL", camera: "108 MP OIS 3x Süper Zoom + 2 MP + 2 MP", battery: 5000, has5G: true },
  { name: "Infinix GT 20 Pro 5G", year: 2024, category: "flagship", price: 21999, ram: 12, storage: 256, chipset: "Dimensity 8200 Ultimate 5G (Mecha RGB LED Oyuncu)", screen: "6.78\" FHD+ 144Hz Bezel-less AMOLED (Pixelworks Çip)", camera: "108 MP OIS + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Infinix Zero 40 5G", year: 2024, category: "flagship", price: 24999, ram: 12, storage: 512, chipset: "Dimensity 8200 Ultimate 5G (4K 60fps GoPro Modu)", screen: "6.74\" FHD+ 144Hz 3D Kavisli AMOLED 45W", camera: "108 MP OIS + 50 MP UW + 2 MP (50MP 4K 60fps Selfie)", battery: 5000, has5G: true },
  { name: "Infinix Zero Flip 5G", year: 2024, category: "foldable", price: 37999, ram: 8, storage: 512, chipset: "Dimensity 8020 5G (4K 60fps Ön/Arka Katlanabilir Vlog)", screen: "6.9\" FHD+ 120Hz Katlanabilir LTPO AMOLED + 3.64\" Dış Ekran", camera: "50 MP OIS + 50 MP UW Çift (50MP 4K Vlog Selfie)", battery: 4720, has5G: true },

  // --- 2025 ---
  { name: "Infinix Note 50", year: 2025, category: "midrange", price: 15999, ram: 8, storage: 256, chipset: "Dimensity 7050 5G (MagCharge 2.0)", screen: "6.78\" FHD+ 120Hz AMOLED 45W", camera: "108 MP OIS + 8 MP UW + 2 MP", battery: 5200, has5G: true },
  { name: "Infinix Note 50 Pro 5G", year: 2025, category: "midrange", price: 21999, ram: 12, storage: 512, chipset: "Dimensity 7300 5G (90W Fast Charge & JBL)", screen: "6.78\" 1.5K 144Hz Kavisli AMOLED", camera: "108 MP OIS 3x + 50 MP UW + 2 MP", battery: 5500, has5G: true },
  { name: "Infinix Hot 60 5G", year: 2025, category: "budget", price: 12999, ram: 8, storage: 256, chipset: "Dimensity 6300 5G", screen: "6.78\" FHD+ 120Hz AMOLED", camera: "50 MP OIS + 2 MP", battery: 5500, has5G: true },
  { name: "Infinix Smart 10", year: 2025, category: "budget", price: 6999, ram: 4, storage: 128, chipset: "Unisoc T616", screen: "6.6\" HD+ 90Hz LCD", camera: "13 MP Çift", battery: 5000, has5G: false },
  { name: "Infinix GT 30 Pro 5G", year: 2025, category: "flagship", price: 27999, ram: 16, storage: 512, chipset: "Dimensity 8350 5G (Mecha RGB 2.0 & Aktif Soğutma)", screen: "6.78\" 1.5K 144Hz AMOLED (100W Şarj)", camera: "108 MP OIS + 13 MP UW + 2 MP", battery: 5500, has5G: true },

  // --- 2026 ---
  { name: "Infinix Note 60 5G", year: 2026, category: "midrange", price: 19999, ram: 12, storage: 256, chipset: "Dimensity 7400 5G (MagCharge 3.0)", screen: "6.78\" 1.5K 144Hz AMOLED (100W Şarj)", camera: "108 MP OIS + 12 MP UW + 2 MP", battery: 5800, has5G: true },
  { name: "Infinix Note 60 Ultra 5G", year: 2026, category: "flagship", price: 29999, ram: 16, storage: 512, chipset: "Dimensity 8450 5G (200MP OIS & JBL Surround)", screen: "6.8\" 1.5K 144Hz 3D Kavisli AMOLED 120W", camera: "200 MP Matrix OIS + 50 MP 3x Tele + 12 MP UW", battery: 6000, has5G: true },
  { name: "Infinix GT 50 Pro 5G", year: 2026, category: "flagship", price: 34999, ram: 16, storage: 512, chipset: "Dimensity 9400 5G (Sıvı Soğutmalı 144Hz Gamer)", screen: "6.78\" 1.5K 144Hz Bezel-less OLED 120W", camera: "108 MP OIS + 50 MP UW + 12 MP Tele", battery: 6000, has5G: true },
  { name: "Infinix Hot 70 5G", year: 2026, category: "budget", price: 14999, ram: 8, storage: 256, chipset: "Dimensity 6400+ 5G", screen: "6.78\" FHD+ 120Hz AMOLED", camera: "108 MP OIS + 2 MP", battery: 6000, has5G: true },
  { name: "Infinix Smart 20", year: 2026, category: "budget", price: 8999, ram: 6, storage: 128, chipset: "Unisoc T700 5G", screen: "6.6\" HD+ 90Hz LCD", camera: "50 MP Çift", battery: 5500, has5G: true }
];

const infinixImages = [
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

const generatedInfinixPhones = infinixModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `infinix-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable' || m.name.includes('GT') || m.name.includes('Zero');
  const rating = isFlagship ? Number((4.6 + (index % 4) * 0.1).toFixed(1)) : Number((4.1 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(105 + (index * 39) % 710);
  const image = infinixImages[index % infinixImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-inf-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 12900,
      url: '#'
    },
    {
      id: `st-ty-inf-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 17500,
      url: '#'
    },
    {
      id: `st-vt-inf-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 13900,
      url: '#'
    },
    {
      id: `st-mm-inf-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 8300,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Infinix TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Infinix",
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
        resolution: isFlagship ? "2436 x 1080 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2023 ? 120 : 90),
        ppi: isFlagship ? 396 : 385,
        brightnessNits: isFlagship ? 2000 : 1000
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "3nm" : (m.year >= 2024 ? "4nm" : "6nm"),
        antutuScore: isFlagship ? 1680000 : 720000
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
        telephotoMp: isFlagship ? "50 MP 3.5x Periskop" : "Yok",
        selfieMp: m.name.includes('Zero') ? "50 MP 4K 60fps Vlog Selfie" : "32 MP",
        videoRes: isFlagship ? "4K @ 60fps" : "1080p @ 60fps",
        dxomarkScore: isFlagship ? 145 : 115
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('100W') || m.chipset.includes('120W') ? 120 : (isFlagship ? 68 : 33),
        wirelessCharging: m.name.includes('MagCharge') || m.name.includes('Note 30 Pro') || isFlagship,
        reverseWireless: m.name.includes('MagCharge') || isFlagship
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: isFlagship ? "Wi-Fi 6E" : "Wi-Fi 5",
        bluetooth: "5.3",
        hasNFC: true,
        hasesim: false
      },
      build: {
        weightGrams: isFlagship ? 198 : 188,
        thicknessMm: 7.9,
        waterResistance: m.name.includes('IP68') ? "IP68" : "IP54 Su Sıçramasına Dayanıklı",
        frameMaterial: isFlagship ? (m.name.includes('GT') ? "Mecha RGB Alüminyum" : "Alüminyum") : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "XOS 16 (Android 16)" : (m.year >= 2024 ? "XOS 14 (Android 14)" : "XOS 12"),
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

// Remove any older Infinix phones that we are replacing with our exhaustive catalog
const nonInfinixPhones = existingPhones.filter(p => p.brand !== 'Infinix');
const combinedPhones = [...nonInfinixPhones, ...generatedInfinixPhones];

console.log(`Generated ${generatedInfinixPhones.length} comprehensive Infinix models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Infinix 2018-2026 models!");
