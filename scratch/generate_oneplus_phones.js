const fs = require('fs');
const path = require('path');

const oneplusModels = [
  // --- 2018 ---
  { name: "OnePlus 6", year: 2018, category: "flagship", price: 4499, ram: 6, storage: 64, chipset: "Snapdragon 845", screen: "6.28\" FHD+ Optic AMOLED", camera: "16 MP Sony IMX519 OIS + 20 MP Çift", battery: 3300, has5G: false },
  { name: "OnePlus 6T", year: 2018, category: "flagship", price: 5499, ram: 8, storage: 128, chipset: "Snapdragon 845 (Ekrana Gömülü Parmak İzi)", screen: "6.41\" FHD+ Optic AMOLED Damla Çentik", camera: "16 MP OIS + 20 MP Çift", battery: 3700, has5G: false },

  // --- 2019 ---
  { name: "OnePlus 7", year: 2019, category: "flagship", price: 6999, ram: 8, storage: 128, chipset: "Snapdragon 855", screen: "6.41\" FHD+ Optic AMOLED", camera: "48 MP Sony IMX586 OIS + 5 MP Çift", battery: 3700, has5G: false },
  { name: "OnePlus 7 Pro", year: 2019, category: "flagship", price: 9999, ram: 8, storage: 256, chipset: "Snapdragon 855 (90Hz QHD+ Çentiksiz Pop-Up Ekran)", screen: "6.67\" QHD+ 90Hz Fluid AMOLED Pop-Up Kamera", camera: "48 MP OIS + 8 MP 3x Tele OIS + 16 MP UW", battery: 4000, has5G: false },
  { name: "OnePlus 7T", year: 2019, category: "flagship", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 855+", screen: "6.55\" FHD+ 90Hz Fluid AMOLED (30W Warp Charge)", camera: "48 MP OIS + 12 MP 2x Tele + 16 MP UW", battery: 3800, has5G: false },
  { name: "OnePlus 7T Pro", year: 2019, category: "flagship", price: 11999, ram: 12, storage: 256, chipset: "Snapdragon 855+ (McLaren Edition Seçenekli)", screen: "6.67\" QHD+ 90Hz Fluid AMOLED Pop-Up", camera: "48 MP OIS + 8 MP 3x Tele OIS + 16 MP UW", battery: 4085, has5G: false },

  // --- 2020 ---
  { name: "OnePlus 8", year: 2020, category: "flagship", price: 11999, ram: 8, storage: 128, chipset: "Snapdragon 865 5G", screen: "6.55\" FHD+ 90Hz Fluid AMOLED", camera: "48 MP Sony IMX586 OIS + 16 MP UW + 2 MP", battery: 4300, has5G: true },
  { name: "OnePlus 8 Pro", year: 2020, category: "flagship", price: 16999, ram: 12, storage: 256, chipset: "Snapdragon 865 5G (120Hz QHD+ & 30W Kablosuz Şarj / IP68)", screen: "6.78\" QHD+ 120Hz 10-Bit Fluid AMOLED", camera: "48 MP IMX689 OIS + 48 MP UW + 8 MP 3x Tele OIS + 5 MP Filter", battery: 4510, has5G: true },
  { name: "OnePlus 8T", year: 2020, category: "flagship", price: 13999, ram: 12, storage: 256, chipset: "Snapdragon 865 5G (65W Warp Charge)", screen: "6.55\" FHD+ 120Hz Fluid AMOLED", camera: "48 MP OIS + 16 MP UW + 5 MP Makro + 2 MP Monochrome", battery: 4500, has5G: true },
  { name: "OnePlus Nord", year: 2020, category: "midrange", price: 7499, ram: 8, storage: 128, chipset: "Snapdragon 765G 5G", screen: "6.44\" FHD+ 90Hz Fluid AMOLED (Çift Ön Kamera)", camera: "48 MP IMX586 OIS + 8 MP UW + 5 MP + 2 MP", battery: 4115, has5G: true },
  { name: "OnePlus Nord N10 5G", year: 2020, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Snapdragon 690 5G (90Hz)", screen: "6.49\" FHD+ 90Hz LCD (Çift Hoparlör)", camera: "64 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4300, has5G: true },
  { name: "OnePlus Nord N100", year: 2020, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Snapdragon 460", screen: "6.52\" HD+ 90Hz LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },

  // --- 2021 ---
  { name: "OnePlus 9", year: 2021, category: "flagship", price: 18999, ram: 8, storage: 128, chipset: "Snapdragon 888 5G (Hasselblad Renk Ayarları)", screen: "6.55\" FHD+ 120Hz Fluid AMOLED (65W Şarj)", camera: "48 MP IMX689 + 50 MP IMX766 Free-Form UW + 2 MP Monochrome", battery: 4500, has5G: true },
  { name: "OnePlus 9 Pro", year: 2021, category: "flagship", price: 25999, ram: 12, storage: 256, chipset: "Snapdragon 888 5G (Hasselblad Kameralı Zirve & 50W Kablosuz Şarj)", screen: "6.7\" QHD+ 120Hz LTPO Fluid AMOLED (IP68)", camera: "48 MP IMX789 OIS + 50 MP IMX766 UW + 8 MP 3.3x Tele OIS + 2 MP Mono", battery: 4500, has5G: true },
  { name: "OnePlus 9R", year: 2021, category: "flagship", price: 14999, ram: 8, storage: 128, chipset: "Snapdragon 870 5G", screen: "6.55\" FHD+ 120Hz Fluid AMOLED", camera: "48 MP OIS + 16 MP UW + 5 MP + 2 MP Dörtlü", battery: 4500, has5G: true },
  { name: "OnePlus 9RT", year: 2021, category: "flagship", price: 17999, ram: 12, storage: 256, chipset: "Snapdragon 888 5G", screen: "6.62\" FHD+ 120Hz E4 AMOLED 600Hz Touch", camera: "50 MP IMX766 OIS + 16 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "OnePlus Nord 2 5G", year: 2021, category: "midrange", price: 9999, ram: 8, storage: 128, chipset: "Dimensity 1200-AI 5G (50MP IMX766 OIS)", screen: "6.43\" FHD+ 90Hz Fluid AMOLED", camera: "50 MP IMX766 OIS + 8 MP UW + 2 MP Mono", battery: 4500, has5G: true },
  { name: "OnePlus Nord CE 5G", year: 2021, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 750G 5G", screen: "6.43\" FHD+ 90Hz Fluid AMOLED", camera: "64 MP + 8 MP UW + 2 MP Mono", battery: 4500, has5G: true },
  { name: "OnePlus Nord N200 5G", year: 2021, category: "budget", price: 4999, ram: 4, storage: 64, chipset: "Snapdragon 480 5G", screen: "6.49\" FHD+ 90Hz LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },

  // --- 2022 ---
  { name: "OnePlus 10 Pro", year: 2022, category: "flagship", price: 29999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (2. Nesil Hasselblad & 80W Şarj)", screen: "6.7\" QHD+ 120Hz LTPO 2.0 AMOLED (IP68)", camera: "48 MP IMX789 OIS + 50 MP 150° UW + 8 MP 3.3x Tele OIS", battery: 5000, has5G: true },
  { name: "OnePlus 10T", year: 2022, category: "flagship", price: 24999, ram: 16, storage: 256, chipset: "Snapdragon 8+ Gen 1 (150W SUPERVOOC Rekortmen Şarj)", screen: "6.7\" FHD+ 120Hz Düz Fluid AMOLED", camera: "50 MP IMX766 OIS + 8 MP UW + 2 MP", battery: 4800, has5G: true },
  { name: "OnePlus 10R", year: 2022, category: "midrange", price: 18999, ram: 12, storage: 256, chipset: "Dimensity 8100-MAX 5G (150W Şarj)", screen: "6.7\" FHD+ 120Hz Fluid AMOLED", camera: "50 MP IMX766 OIS + 8 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "OnePlus Nord 2T", year: 2022, category: "midrange", price: 13999, ram: 8, storage: 128, chipset: "Dimensity 1300 5G (80W SuperVOOC)", screen: "6.43\" FHD+ 90Hz AMOLED", camera: "50 MP IMX766 OIS + 8 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "OnePlus Nord CE 2 5G", year: 2022, category: "budget", price: 9499, ram: 8, storage: 128, chipset: "Dimensity 900 5G (65W Şarj)", screen: "6.43\" FHD+ 90Hz AMOLED", camera: "64 MP + 8 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "OnePlus Nord CE 2 Lite 5G", year: 2022, category: "budget", price: 6999, ram: 6, storage: 128, chipset: "Snapdragon 695 5G", screen: "6.59\" FHD+ 120Hz LCD", camera: "64 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "OnePlus Nord N20 5G", year: 2022, category: "budget", price: 7999, ram: 6, storage: 128, chipset: "Snapdragon 695 5G (Ekrana Gömülü Parmak İzli AMOLED)", screen: "6.43\" FHD+ AMOLED", camera: "64 MP + 2 MP + 2 MP Üçlü", battery: 4500, has5G: true },

  // --- 2023 ---
  { name: "OnePlus 11 5G", year: 2023, category: "flagship", price: 37999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2 (3. Nesil Hasselblad & Cryo-Velocity Soğutma)", screen: "6.7\" QHD+ 120Hz LTPO 3.0 AMOLED 100W", camera: "50 MP Sony IMX890 OIS + 48 MP IMX581 UW + 32 MP IMX709 2x Portre", battery: 5000, has5G: true },
  { name: "OnePlus 11R", year: 2023, category: "midrange", price: 23999, ram: 16, storage: 256, chipset: "Snapdragon 8+ Gen 1 (100W Şarj)", screen: "6.74\" 1.5K 120Hz Kavisli AMOLED", camera: "50 MP IMX890 OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "OnePlus Open", year: 2023, category: "foldable", price: 79999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2 (Dünyanın En İyi Katlanabilir Kamerası Hasselblad)", screen: "7.82\" 2K 120Hz Flexi-fluid LTPO 3.0 OLED + 6.31\" Dış Ekran Ceramic Guard", camera: "48 MP LYT-T808 OIS + 64 MP 3x Periskop OIS + 48 MP UW", battery: 4805, has5G: true },
  { name: "OnePlus Nord 3 5G", year: 2023, category: "midrange", price: 17999, ram: 16, storage: 256, chipset: "Dimensity 9000 5G (50MP IMX890 OIS / 80W Şarj)", screen: "6.74\" 1.5K 120Hz Düz Fluid AMOLED", camera: "50 MP IMX890 OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "OnePlus Nord CE 3 5G", year: 2023, category: "midrange", price: 13999, ram: 8, storage: 128, chipset: "Snapdragon 782G 5G", screen: "6.7\" FHD+ 120Hz Fluid AMOLED", camera: "50 MP IMX890 OIS + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "OnePlus Nord CE 3 Lite 5G", year: 2023, category: "budget", price: 9999, ram: 8, storage: 128, chipset: "Snapdragon 695 5G (108MP Kamera)", screen: "6.72\" FHD+ 120Hz LCD", camera: "108 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "OnePlus Nord N30 5G", year: 2023, category: "budget", price: 10999, ram: 8, storage: 128, chipset: "Snapdragon 695 5G (50W SuperVOOC)", screen: "6.72\" FHD+ 120Hz LCD", camera: "108 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },

  // --- 2024 ---
  { name: "OnePlus 12 5G", year: 2024, category: "flagship", price: 49999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (4500 Nits Ekran & 4. Nesil Hasselblad)", screen: "6.82\" QHD+ 120Hz LTPO 4.0 AMOLED 4500 Nits (100W & 50W Kablosuz)", camera: "50 MP Sony LYT-808 OIS + 64 MP 3x Periskop OIS + 48 MP UW", battery: 5400, has5G: true },
  { name: "OnePlus 12R", year: 2024, category: "midrange", price: 29999, ram: 16, storage: 256, chipset: "Snapdragon 8 Gen 2 (5500 mAh Dev Pil & 100W)", screen: "6.78\" 1.5K 120Hz LTPO 4.0 AMOLED 4500 Nits", camera: "50 MP IMX890 OIS + 8 MP UW + 2 MP", battery: 5500, has5G: true },
  { name: "OnePlus Nord 4 5G", year: 2024, category: "midrange", price: 22999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 3 5G (Yekpare Alüminyum Gövde / 6 Yıl Güncelleme)", screen: "6.74\" 1.5K 120Hz Ultra Bright AMOLED 100W", camera: "50 MP Sony LYT-600 OIS + 8 MP UW", battery: 5500, has5G: true },
  { name: "OnePlus Nord CE4 5G", year: 2024, category: "budget", price: 15999, ram: 8, storage: 256, chipset: "Snapdragon 7 Gen 3 5G (100W SUPERVOOC)", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "50 MP Sony LYT-600 OIS + 8 MP UW", battery: 5500, has5G: true },
  { name: "OnePlus Nord CE4 Lite 5G", year: 2024, category: "budget", price: 11999, ram: 8, storage: 256, chipset: "Snapdragon 695 5G (OIS Kamera & 80W)", screen: "6.67\" FHD+ 120Hz AMOLED 2100 Nits", camera: "50 MP Sony LYT-600 OIS + 2 MP", battery: 5110, has5G: true },
  { name: "OnePlus Nord N30 SE 5G", year: 2024, category: "budget", price: 7999, ram: 4, storage: 128, chipset: "Dimensity 6020 5G (33W Şarj)", screen: "6.72\" FHD+ LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: true },
  { name: "OnePlus Ace 3", year: 2024, category: "midrange", price: 24999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2 (5500 mAh / 100W)", screen: "6.78\" 1.5K 120Hz LTPO AMOLED", camera: "50 MP IMX890 OIS + 8 MP UW + 2 MP", battery: 5500, has5G: true },
  { name: "OnePlus Ace 3 Pro", year: 2024, category: "flagship", price: 34999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (6100 mAh Buz Çekirdeği Pil)", screen: "6.78\" 1.5K 120Hz LTPO AMOLED Seramik", camera: "50 MP Sony LYT-800 OIS + 8 MP UW + 2 MP", battery: 6100, has5G: true },
  { name: "OnePlus Ace 3V", year: 2024, category: "midrange", price: 18999, ram: 12, storage: 256, chipset: "Snapdragon 7+ Gen 3 (5500 mAh / 100W)", screen: "6.74\" 1.5K 120Hz AMOLED", camera: "50 MP Sony IMX882 OIS + 8 MP UW", battery: 5500, has5G: true },

  // --- 2025 ---
  { name: "OnePlus 13", year: 2025, category: "flagship", price: 59999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (3nm / Hasselblad 4.0 / IP69)", screen: "6.82\" 2K 120Hz BOE X2 LTPO 4.5 AMOLED 100W & 50W Kablosuz", camera: "50 MP Sony LYT-808 OIS + 50 MP 3x Periskop OIS + 50 MP UW", battery: 6000, has5G: true },
  { name: "OnePlus 13R", year: 2025, category: "midrange", price: 34999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (6000 mAh Pil)", screen: "6.78\" 1.5K 120Hz LTPO AMOLED", camera: "50 MP Sony OIS + 50 MP UW + 8 MP", battery: 6000, has5G: true },
  { name: "OnePlus 13T", year: 2025, category: "midrange", price: 38999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (120W SuperVOOC)", screen: "6.78\" 1.5K 144Hz AMOLED", camera: "50 MP Sony OIS + 50 MP Tele + 12 MP UW", battery: 6200, has5G: true },
  { name: "OnePlus Nord 5", year: 2025, category: "midrange", price: 27999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 4 5G", screen: "6.74\" 1.5K 144Hz Düz Fluid AMOLED", camera: "50 MP Sony OIS + 50 MP UW", battery: 6000, has5G: true },
  { name: "OnePlus Nord CE5", year: 2025, category: "budget", price: 18999, ram: 8, storage: 256, chipset: "Snapdragon 7 Gen 4 5G", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "50 MP Sony OIS + 8 MP UW", battery: 5800, has5G: true },
  { name: "OnePlus Ace 5", year: 2025, category: "midrange", price: 29999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (6300 mAh Pil)", screen: "6.78\" 1.5K 144Hz LTPO AMOLED", camera: "50 MP Sony OIS + 8 MP UW + 2 MP", battery: 6300, has5G: true },
  { name: "OnePlus Ace 5 Pro", year: 2025, category: "flagship", price: 42999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (Seramik & Serinlik Odaklı)", screen: "6.78\" 1.5K 144Hz LTPO AMOLED 120W", camera: "50 MP Sony OIS + 50 MP Tele OIS + 8 MP UW", battery: 6500, has5G: true },
  { name: "OnePlus Ace 5 Ultra", year: 2025, category: "flagship", price: 49999, ram: 24, storage: 1024, chipset: "Snapdragon 8 Elite (24GB RAM & 6500 mAh)", screen: "6.82\" 2K 144Hz LTPO AMOLED 120W", camera: "50 MP 1\" OIS + 50 MP 3x Periskop OIS + 50 MP UW", battery: 6500, has5G: true },

  // --- 2026 ---
  { name: "OnePlus 15", year: 2026, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 (2nm / 6500 mAh / IP69)", screen: "6.85\" 2K 144Hz LTPO 5.0 AMOLED 120W & 80W Kablosuz", camera: "50 MP Sony 1\" OIS + 50 MP 5x Periskop OIS + 50 MP UW", battery: 6500, has5G: true },
  { name: "OnePlus 15R", year: 2026, category: "midrange", price: 39999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (6500 mAh Pil / 120W)", screen: "6.78\" 1.5K 144Hz LTPO AMOLED", camera: "50 MP Sony OIS + 50 MP Tele OIS + 12 MP UW", battery: 6500, has5G: true },
  { name: "OnePlus 15T", year: 2026, category: "midrange", price: 44999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (150W Şarj)", screen: "6.78\" 1.5K 144Hz AMOLED", camera: "50 MP Sony OIS + 50 MP Tele + 12 MP UW", battery: 6600, has5G: true },
  { name: "OnePlus Nord 6", year: 2026, category: "midrange", price: 32999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 5 5G", screen: "6.74\" 1.5K 144Hz Fluid AMOLED", camera: "50 MP Sony OIS + 50 MP UW", battery: 6200, has5G: true },
  { name: "OnePlus Nord CE6", year: 2026, category: "budget", price: 21999, ram: 12, storage: 256, chipset: "Snapdragon 7 Gen 5 5G", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "50 MP OIS + 8 MP UW", battery: 6000, has5G: true },
  { name: "OnePlus Nord CE6 Lite", year: 2026, category: "budget", price: 15999, ram: 8, storage: 256, chipset: "Snapdragon 6s Gen 3 5G", screen: "6.67\" FHD+ 120Hz AMOLED", camera: "50 MP OIS + 2 MP", battery: 5500, has5G: true },
  { name: "OnePlus Ace 6", year: 2026, category: "midrange", price: 34999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (6700 mAh Batarya)", screen: "6.78\" 1.5K 144Hz LTPO AMOLED", camera: "50 MP Sony OIS + 50 MP Tele + 12 MP UW", battery: 6700, has5G: true },
  { name: "OnePlus Ace 6T", year: 2026, category: "midrange", price: 39999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (150W Şarj)", screen: "6.78\" 1.5K 144Hz AMOLED", camera: "50 MP OIS + 50 MP Tele + 12 MP UW", battery: 6700, has5G: true },
  { name: "OnePlus Ace 6 Ultra", year: 2026, category: "flagship", price: 54999, ram: 24, storage: 1024, chipset: "Snapdragon 8 Gen 5 (2nm Zirve Oyuncu)", screen: "6.85\" 2K 144Hz LTPO AMOLED 150W", camera: "50 MP 1\" OIS + 50 MP 5x Periskop OIS + 50 MP UW", battery: 7000, has5G: true },
  { name: "OnePlus Turbo 6", year: 2026, category: "midrange", price: 29999, ram: 12, storage: 512, chipset: "Snapdragon 8s Gen 5 (Turbo Sıvı Soğutmalı)", screen: "6.78\" 1.5K 144Hz Oyun Ekranı", camera: "50 MP OIS + 8 MP UW", battery: 6500, has5G: true },
  { name: "OnePlus Turbo 6X", year: 2026, category: "midrange", price: 34999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (Turbo Oyuncu)", screen: "6.78\" 1.5K 144Hz Oyun Ekranı", camera: "50 MP OIS + 12 MP UW", battery: 6700, has5G: true },
  { name: "OnePlus Turbo 6V", year: 2026, category: "budget", price: 24999, ram: 12, storage: 256, chipset: "Snapdragon 7+ Gen 3 5G", screen: "6.7\" FHD+ 144Hz LCD", camera: "50 MP OIS + 8 MP UW", battery: 6300, has5G: true },
  { name: "OnePlus N6 5G", year: 2026, category: "budget", price: 13999, ram: 8, storage: 256, chipset: "Snapdragon 4s Gen 2 5G", screen: "6.72\" FHD+ 120Hz LCD", camera: "50 MP OIS + 2 MP", battery: 5500, has5G: true },
  { name: "OnePlus N6x 5G", year: 2026, category: "budget", price: 16999, ram: 8, storage: 256, chipset: "Snapdragon 6 Gen 3 5G", screen: "6.72\" FHD+ 120Hz LCD", camera: "50 MP OIS + 8 MP UW", battery: 6000, has5G: true }
];

const oneplusImages = [
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

const generatedOneplusPhones = oneplusModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `oneplus-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable' || m.name.includes('Pro') || m.name.includes('Open') || m.name.includes('12') || m.name.includes('13') || m.name.includes('15');
  const rating = isFlagship ? Number((4.7 + (index % 4) * 0.1).toFixed(1)) : Number((4.3 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(130 + (index * 43) % 820);
  const image = oneplusImages[index % oneplusImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-op-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 15600,
      url: '#'
    },
    {
      id: `st-ty-op-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 22400,
      url: '#'
    },
    {
      id: `st-vt-op-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 17100,
      url: '#'
    },
    {
      id: `st-mm-op-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 9800,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'OnePlus TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "OnePlus",
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
        resolution: isFlagship ? "3168 x 1440 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2020 ? 120 : 90),
        ppi: isFlagship ? 510 : 394,
        brightnessNits: isFlagship ? 4500 : 1300
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2025 ? "3nm" : (m.year >= 2023 ? "4nm" : "7nm")),
        antutuScore: isFlagship ? 1920000 : 840000
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
        ultrawideMp: "48 MP",
        telephotoMp: isFlagship ? "64 MP Hasselblad Periskop OIS" : "Yok",
        selfieMp: m.name.includes('Pro') || isFlagship ? "32 MP 4K" : "16 MP",
        videoRes: isFlagship ? "8K @ 24fps Hasselblad" : "4K @ 60fps",
        dxomarkScore: isFlagship ? 156 : 124
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('150W') || m.chipset.includes('150W') ? 150 : (m.screen.includes('100W') ? 100 : 80),
        wirelessCharging: isFlagship && !m.name.includes('Nord'),
        reverseWireless: isFlagship && !m.name.includes('Nord')
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: isFlagship ? "Wi-Fi 7" : "Wi-Fi 6",
        bluetooth: "5.4",
        hasNFC: true,
        hasesim: isFlagship
      },
      build: {
        weightGrams: isFlagship ? 207 : 185,
        thicknessMm: 8.4,
        waterResistance: m.name.includes('IP69') ? "IP69" : (isFlagship ? "IP68 (1.5m 30dk)" : "IP54"),
        frameMaterial: isFlagship ? (m.name.includes('Alüminyum') ? "Yekpare Alüminyum" : "Alüminyum / Cam") : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "OxygenOS 16 (Android 16)" : (m.year >= 2024 ? "OxygenOS 14 (Android 14)" : "OxygenOS 12"),
        updateYears: m.year >= 2024 ? 5 : 3
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

// Remove any older OnePlus phones that we are replacing with our exhaustive catalog
const nonOneplusPhones = existingPhones.filter(p => p.brand !== 'OnePlus');
const combinedPhones = [...nonOneplusPhones, ...generatedOneplusPhones];

console.log(`Generated ${generatedOneplusPhones.length} comprehensive OnePlus smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all OnePlus 2018-2026 smartphone models!");
