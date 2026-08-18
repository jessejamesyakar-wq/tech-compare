const fs = require('fs');
const path = require('path');

const xiaomiModels = [
  // --- 2018 ---
  { name: "Xiaomi Mi 8", brand: "Xiaomi", year: 2018, category: "flagship", price: 6499, ram: 6, storage: 64, chipset: "Snapdragon 845", screen: "6.21\" FHD+ Super AMOLED", camera: "12 MP + 12 MP Çift OIS", battery: 3400, has5G: false },
  { name: "Xiaomi Mi 8 Pro", brand: "Xiaomi", year: 2018, category: "flagship", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 845", screen: "6.21\" FHD+ Şeffaf Arka AMOLED", camera: "12 MP + 12 MP Çift OIS", battery: 3000, has5G: false },
  { name: "Xiaomi Mi Mix 2S", brand: "Xiaomi", year: 2018, category: "flagship", price: 7499, ram: 6, storage: 128, chipset: "Snapdragon 845", screen: "5.99\" FHD+ Seramik Gövde IPS", camera: "12 MP + 12 MP Çift", battery: 3400, has5G: false },
  { name: "Xiaomi Mi Mix 3", brand: "Xiaomi", year: 2018, category: "flagship", price: 8999, ram: 8, storage: 128, chipset: "Snapdragon 845", screen: "6.39\" FHD+ Kızaklı AMOLED", camera: "12 MP + 12 MP Çift", battery: 3200, has5G: false },
  { name: "Xiaomi Redmi Note 5", brand: "Xiaomi", year: 2018, category: "budget", price: 1899, ram: 4, storage: 64, chipset: "Snapdragon 636", screen: "5.99\" FHD+ IPS LCD", camera: "12 MP + 5 MP Çift", battery: 4000, has5G: false },
  { name: "Xiaomi Redmi Note 6 Pro", brand: "Xiaomi", year: 2018, category: "budget", price: 2199, ram: 4, storage: 64, chipset: "Snapdragon 636", screen: "6.26\" FHD+ Çentikli IPS LCD", camera: "12 MP + 5 MP Çift", battery: 4000, has5G: false },
  { name: "Xiaomi Redmi 7", brand: "Xiaomi", year: 2018, category: "budget", price: 1599, ram: 3, storage: 32, chipset: "Snapdragon 632", screen: "6.26\" HD+ IPS LCD", camera: "12 MP + 2 MP Çift", battery: 4000, has5G: false },
  { name: "POCO F1 (Pocophone F1)", brand: "POCO", year: 2018, category: "flagship", price: 4999, ram: 6, storage: 128, chipset: "Snapdragon 845", screen: "6.18\" FHD+ IPS LCD (Efsane Amiral Gemisi Katili)", camera: "12 MP + 5 MP Çift", battery: 4000, has5G: false },

  // --- 2019 ---
  { name: "Xiaomi Mi 9", brand: "Xiaomi", year: 2019, category: "flagship", price: 9999, ram: 6, storage: 128, chipset: "Snapdragon 855", screen: "6.39\" FHD+ Super AMOLED", camera: "48 MP + 12 MP + 16 MP Üçlü", battery: 3300, has5G: false },
  { name: "Xiaomi Mi 9T", brand: "Xiaomi", year: 2019, category: "midrange", price: 5499, ram: 6, storage: 128, chipset: "Snapdragon 730", screen: "6.39\" FHD+ Pop-up Kameralı AMOLED", camera: "48 MP + 8 MP + 13 MP Üçlü", battery: 4000, has5G: false },
  { name: "Xiaomi Mi 9T Pro", brand: "Xiaomi", year: 2019, category: "flagship", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 855", screen: "6.39\" FHD+ Pop-up Kameralı AMOLED", camera: "48 MP + 8 MP + 13 MP Üçlü", battery: 4000, has5G: false },
  { name: "Xiaomi Redmi Note 7", brand: "Xiaomi", year: 2019, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Snapdragon 660", screen: "6.3\" FHD+ Cam Arka IPS LCD", camera: "48 MP + 5 MP Çift", battery: 4000, has5G: false },
  { name: "Xiaomi Redmi Note 8", brand: "Xiaomi", year: 2019, category: "budget", price: 3299, ram: 4, storage: 64, chipset: "Snapdragon 665", screen: "6.3\" FHD+ IPS LCD", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4000, has5G: false },
  { name: "Xiaomi Redmi Note 8 Pro", brand: "Xiaomi", year: 2019, category: "midrange", price: 4299, ram: 6, storage: 128, chipset: "Helio G90T Sıvı Soğutmalı", screen: "6.53\" FHD+ IPS LCD", camera: "64 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4500, has5G: false },
  { name: "Xiaomi Redmi 8", brand: "Xiaomi", year: 2019, category: "budget", price: 1999, ram: 4, storage: 64, chipset: "Snapdragon 439", screen: "6.22\" HD+ IPS LCD", camera: "12 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2020 ---
  { name: "Xiaomi Mi 10", brand: "Xiaomi", year: 2020, category: "flagship", price: 14999, ram: 8, storage: 128, chipset: "Snapdragon 865", screen: "6.67\" FHD+ 90Hz Curved AMOLED", camera: "108 MP OIS + 13 MP + 2 MP + 2 MP Dörtlü", battery: 4780, has5G: true },
  { name: "Xiaomi Mi 10 Pro", brand: "Xiaomi", year: 2020, category: "flagship", price: 18999, ram: 12, storage: 256, chipset: "Snapdragon 865", screen: "6.67\" FHD+ 90Hz Curved AMOLED (DxOMark Lideri)", camera: "108 MP OIS + 12 MP 2x + 8 MP 10x + 20 MP", battery: 4500, has5G: true },
  { name: "Xiaomi Mi 10 Ultra", brand: "Xiaomi", year: 2020, category: "flagship", price: 23999, ram: 12, storage: 256, chipset: "Snapdragon 865", screen: "6.67\" FHD+ 120Hz 120W Şarj AMOLED", camera: "48 MP OIS + 48 MP 120x Zoom + 12 MP + 20 MP", battery: 4500, has5G: true },
  { name: "Xiaomi Mi 10T", brand: "Xiaomi", year: 2020, category: "flagship", price: 8999, ram: 8, storage: 128, chipset: "Snapdragon 865", screen: "6.67\" FHD+ 144Hz AdaptiveSync LCD", camera: "64 MP + 13 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi Mi 10T Pro", brand: "Xiaomi", year: 2020, category: "flagship", price: 10999, ram: 8, storage: 256, chipset: "Snapdragon 865", screen: "6.67\" FHD+ 144Hz AdaptiveSync LCD", camera: "108 MP OIS + 13 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi Redmi Note 9", brand: "Xiaomi", year: 2020, category: "budget", price: 3499, ram: 4, storage: 128, chipset: "Helio G85", screen: "6.53\" FHD+ IPS LCD", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5020, has5G: false },
  { name: "Xiaomi Redmi Note 9 Pro", brand: "Xiaomi", year: 2020, category: "midrange", price: 4999, ram: 6, storage: 128, chipset: "Snapdragon 720G", screen: "6.67\" FHD+ IPS LCD", camera: "64 MP + 8 MP + 5 MP + 2 MP Dörtlü", battery: 5020, has5G: false },
  { name: "Xiaomi Redmi 9", brand: "Xiaomi", year: 2020, category: "budget", price: 2499, ram: 4, storage: 64, chipset: "Helio G80", screen: "6.53\" FHD+ IPS LCD", camera: "13 MP + 8 MP + 5 MP + 2 MP Dörtlü", battery: 5020, has5G: false },
  { name: "POCO F2 Pro", brand: "POCO", year: 2020, category: "flagship", price: 8499, ram: 8, storage: 256, chipset: "Snapdragon 865", screen: "6.67\" FHD+ Pop-up Kameralı AMOLED", camera: "64 MP OIS + 13 MP + 5 MP Telemakro + 2 MP", battery: 4700, has5G: true },
  { name: "POCO X3 NFC", brand: "POCO", year: 2020, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Snapdragon 732G", screen: "6.67\" FHD+ 120Hz IPS LCD", camera: "64 MP + 13 MP + 2 MP + 2 MP Dörtlü", battery: 5160, has5G: false },
  { name: "POCO X3 Pro", brand: "POCO", year: 2020, category: "midrange", price: 5499, ram: 8, storage: 256, chipset: "Snapdragon 860", screen: "6.67\" FHD+ 120Hz Efsane Performans LCD", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5160, has5G: false },

  // --- 2021 - 2023 ---
  { name: "Xiaomi 11", brand: "Xiaomi", year: 2021, category: "flagship", price: 17999, ram: 8, storage: 256, chipset: "Snapdragon 888", screen: "6.81\" WQHD+ 120Hz Curved AMOLED (Harman Kardon)", camera: "108 MP OIS + 13 MP + 5 MP Telemakro", battery: 4600, has5G: true },
  { name: "Xiaomi 11 Ultra", brand: "Xiaomi", year: 2021, category: "flagship", price: 29999, ram: 12, storage: 256, chipset: "Snapdragon 888", screen: "6.81\" WQHD+ 120Hz Arka İkinci Ekranlı Seramik", camera: "50 MP GN2 OIS + 48 MP 5x Periscope + 48 MP Ultrawide", battery: 5000, has5G: true },
  { name: "Xiaomi 11T", brand: "Xiaomi", year: 2021, category: "flagship", price: 11999, ram: 8, storage: 128, chipset: "Dimensity 1200 Ultra 5G", screen: "6.67\" FHD+ 120Hz AdaptiveSync AMOLED", camera: "108 MP + 8 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi 11T Pro", brand: "Xiaomi", year: 2021, category: "flagship", price: 14999, ram: 12, storage: 256, chipset: "Snapdragon 888 (120W HyperCharge)", screen: "6.67\" FHD+ 120Hz Dolby Vision AMOLED", camera: "108 MP OIS + 8 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi Mi Mix Fold", brand: "Xiaomi", year: 2021, category: "foldable", price: 34999, ram: 12, storage: 512, chipset: "Snapdragon 888 (Sıvı Lens Teknolojisi)", screen: "8.01\" WQHD+ Katlanabilir AMOLED", camera: "108 MP + 13 MP + 8 MP Sıvı Lens", battery: 5020, has5G: true },
  { name: "Xiaomi 12", brand: "Xiaomi", year: 2022, category: "flagship", price: 21999, ram: 8, storage: 256, chipset: "Snapdragon 8 Gen 1", screen: "6.28\" FHD+ 120Hz Kompakt AMOLED", camera: "50 MP IMX766 OIS + 13 MP + 5 MP", battery: 4500, has5G: true },
  { name: "Xiaomi 12 Pro", brand: "Xiaomi", year: 2022, category: "flagship", price: 28999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (120W Şarj)", screen: "6.73\" WQHD+ 120Hz LTPO AMOLED", camera: "50 MP IMX707 + 50 MP 2x + 50 MP Ultrawide", battery: 4600, has5G: true },
  { name: "Xiaomi 12T", brand: "Xiaomi", year: 2022, category: "flagship", price: 15999, ram: 8, storage: 128, chipset: "Dimensity 8100 Ultra 5G", screen: "6.67\" 1.5K 120Hz CrystalRes AMOLED", camera: "108 MP OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi 12T Pro", brand: "Xiaomi", year: 2022, category: "flagship", price: 19999, ram: 12, storage: 256, chipset: "Snapdragon 8+ Gen 1 (200MP Kamera)", screen: "6.67\" 1.5K 120Hz CrystalRes AMOLED", camera: "200 MP HP1 OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi Mix Fold 2", brand: "Xiaomi", year: 2022, category: "foldable", price: 44999, ram: 12, storage: 512, chipset: "Snapdragon 8+ Gen 1 (5.4mm Ultra İnce)", screen: "8.02\" 2K+ 120Hz Eco2 Katlanabilir OLED", camera: "50 MP Leica + 13 MP + 8 MP 2x", battery: 4500, has5G: true },
  { name: "Xiaomi 13", brand: "Xiaomi", year: 2023, category: "flagship", price: 34999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 2", screen: "6.36\" FHD+ 120Hz Düz Kenar Leica AMOLED", camera: "50 MP Leica OIS + 10 MP 3.2x + 12 MP", battery: 4500, has5G: true },
  { name: "Xiaomi 13 Pro", brand: "Xiaomi", year: 2023, category: "flagship", price: 43999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 2", screen: "6.73\" WQHD+ 120Hz LTPO 1 Inç Sensörlü AMOLED", camera: "50 MP IMX989 1\" Leica + 50 MP Tele + 50 MP UW", battery: 4820, has5G: true },
  { name: "Xiaomi 13 Ultra", brand: "Xiaomi", year: 2023, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2", screen: "6.73\" WQHD+ 120Hz Dörtlü Leica Lensli Kamera Canavarı", camera: "50 MP 1\" Değişken Diyafram + 50 MP 5x + 50 MP 3.2x + 50 MP UW", battery: 5000, has5G: true },
  { name: "Xiaomi 13T", brand: "Xiaomi", year: 2023, category: "midrange", price: 21999, ram: 8, storage: 256, chipset: "Dimensity 8200 Ultra 5G (IP68)", screen: "6.67\" 1.5K 144Hz CrystalRes Leica AMOLED", camera: "50 MP Leica OIS + 50 MP 2x + 12 MP", battery: 5000, has5G: true },
  { name: "Xiaomi 13T Pro", brand: "Xiaomi", year: 2023, category: "flagship", price: 29999, ram: 12, storage: 512, chipset: "Dimensity 9200+ 5G (120W Şarj / IP68)", screen: "6.67\" 1.5K 144Hz CrystalRes Leica AMOLED", camera: "50 MP Leica OIS + 50 MP 2x + 12 MP 8K Video", battery: 5000, has5G: true },
  { name: "Xiaomi Mix Fold 3", brand: "Xiaomi", year: 2023, category: "foldable", price: 59999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2 Leading Version", screen: "8.03\" 2K+ 120Hz Dörtlü Leica Kameralı Katlanabilir", camera: "50 MP Leica + 10 MP 3.2x + 10 MP 5x Periscope + 12 MP", battery: 4800, has5G: true },

  // Redmi Note 10-12 & POCO F3-F5
  { name: "Xiaomi Redmi Note 10", brand: "Xiaomi", year: 2021, category: "budget", price: 4499, ram: 4, storage: 128, chipset: "Snapdragon 678", screen: "6.43\" FHD+ Super AMOLED", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Xiaomi Redmi Note 10 Pro", brand: "Xiaomi", year: 2021, category: "midrange", price: 6499, ram: 8, storage: 128, chipset: "Snapdragon 732G", screen: "6.67\" FHD+ 120Hz Super AMOLED (108MP)", camera: "108 MP + 8 MP + 5 MP Telemakro + 2 MP", battery: 5020, has5G: false },
  { name: "Xiaomi Redmi Note 11", brand: "Xiaomi", year: 2022, category: "budget", price: 5999, ram: 6, storage: 128, chipset: "Snapdragon 680", screen: "6.43\" FHD+ 90Hz AMOLED", camera: "50 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Xiaomi Redmi Note 11 Pro 5G", brand: "Xiaomi", year: 2022, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Snapdragon 695 5G", screen: "6.67\" FHD+ 120Hz AMOLED (67W Şarj)", camera: "108 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi Redmi Note 12", brand: "Xiaomi", year: 2023, category: "budget", price: 7499, ram: 6, storage: 128, chipset: "Snapdragon 685", screen: "6.67\" FHD+ 120Hz AMOLED 1200 Nits", camera: "50 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Xiaomi Redmi Note 12 Pro 5G", brand: "Xiaomi", year: 2023, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 1080 5G", screen: "6.67\" FHD+ 120Hz Flow AMOLED (Sony IMX766 OIS)", camera: "50 MP IMX766 OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi Redmi Note 12 Pro+ 5G", brand: "Xiaomi", year: 2023, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Dimensity 1080 5G (200MP / 120W Şarj)", screen: "6.67\" FHD+ 120Hz Flow AMOLED", camera: "200 MP HP3 OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "POCO F3", brand: "POCO", year: 2021, category: "flagship", price: 8999, ram: 8, storage: 256, chipset: "Snapdragon 870 5G", screen: "6.67\" FHD+ 120Hz E4 AMOLED (Gerçek Performans Şampiyonu)", camera: "48 MP + 8 MP + 5 MP Telemakro", battery: 4520, has5G: true },
  { name: "POCO F4", brand: "POCO", year: 2022, category: "flagship", price: 12999, ram: 8, storage: 256, chipset: "Snapdragon 870 5G (OIS + 67W Şarj)", screen: "6.67\" FHD+ 120Hz E4 AMOLED", camera: "64 MP OIS + 8 MP + 2 MP Üçlü", battery: 4500, has5G: true },
  { name: "POCO F4 GT", brand: "POCO", year: 2022, category: "flagship", price: 17999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (Tetik Tuşlu Oyuncu)", screen: "6.67\" FHD+ 120Hz 120W HyperCharge AMOLED", camera: "64 MP + 8 MP + 2 MP Üçlü", battery: 4700, has5G: true },
  { name: "POCO F5", brand: "POCO", year: 2023, category: "flagship", price: 16999, ram: 12, storage: 256, chipset: "Snapdragon 7+ Gen 2 5G", screen: "6.67\" FHD+ 120Hz İnce Çerçeveli Flow AMOLED", camera: "64 MP OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "POCO F5 Pro", brand: "POCO", year: 2023, category: "flagship", price: 23999, ram: 12, storage: 512, chipset: "Snapdragon 8+ Gen 1", screen: "6.67\" WQHD+ 120Hz Kablosuz Şarjlı AMOLED", camera: "64 MP OIS + 8 MP + 2 MP Üçlü", battery: 5160, has5G: true },
  { name: "POCO X4 Pro 5G", brand: "POCO", year: 2022, category: "midrange", price: 8499, ram: 8, storage: 256, chipset: "Snapdragon 695 5G", screen: "6.67\" FHD+ 120Hz AMOLED (108MP)", camera: "108 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "POCO X5 5G", brand: "POCO", year: 2023, category: "midrange", price: 8999, ram: 8, storage: 256, chipset: "Snapdragon 695 5G", screen: "6.67\" FHD+ 120Hz AMOLED", camera: "48 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "POCO X5 Pro 5G", brand: "POCO", year: 2023, category: "midrange", price: 12499, ram: 8, storage: 256, chipset: "Snapdragon 778G 5G", screen: "6.67\" FHD+ 120Hz Flow AMOLED (4K Video)", camera: "108 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },

  // --- 2024 - 2026 Dönemi ---
  { name: "Xiaomi 14", brand: "Xiaomi", year: 2024, category: "flagship", price: 44999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 3", screen: "6.36\" 1.5K 1-120Hz LTPO Leica Summilux AMOLED", camera: "50 MP Hunter 900 Leica + 50 MP 75mm Tele + 50 MP UW", battery: 4610, has5G: true },
  { name: "Xiaomi 14 Pro", brand: "Xiaomi", year: 2024, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3", screen: "6.73\" WQHD+ 120Hz Değişken Diyafram Leica AMOLED", camera: "50 MP f/1.4-f/4.0 Leica + 50 MP Tele + 50 MP UW", battery: 4880, has5G: true },
  { name: "Xiaomi 14 Ultra", brand: "Xiaomi", year: 2024, category: "flagship", price: 74999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (Titanyum Özel Kiti)", screen: "6.73\" WQHD+ 120Hz Dörtlü 50MP Leica Kamera Şampiyonu", camera: "50 MP LYT-900 1\" Leica + 50 MP 5x Periscope + 50 MP 3.2x + 50 MP UW", battery: 5000, has5G: true },
  { name: "Xiaomi 14T", brand: "Xiaomi", year: 2024, category: "midrange", price: 27999, ram: 12, storage: 256, chipset: "Dimensity 8300 Ultra 5G (IP68)", screen: "6.67\" 1.5K 144Hz Leica AI AMOLED", camera: "50 MP Sony IMX906 Leica OIS + 50 MP Tele + 12 MP UW", battery: 5000, has5G: true },
  { name: "Xiaomi 14T Pro", brand: "Xiaomi", year: 2024, category: "flagship", price: 38999, ram: 12, storage: 512, chipset: "Dimensity 9300+ 5G (120W & Kablosuz Şarj / IP68)", screen: "6.67\" 1.5K 144Hz Leica AI AMOLED", camera: "50 MP Light Fusion 900 Leica OIS + 50 MP 2.6x + 12 MP", battery: 5000, has5G: true },
  { name: "Xiaomi 15", brand: "Xiaomi", year: 2025, category: "flagship", price: 52999, ram: 12, storage: 512, chipset: "Snapdragon 8 Elite (3nm)", screen: "6.36\" 1.5K 1-120Hz Ultrasonik Parmak İzli Leica AMOLED", camera: "50 MP Light Fusion 900 Leica + 50 MP Tele + 50 MP UW", battery: 5400, has5G: true },
  { name: "Xiaomi 15 Pro", brand: "Xiaomi", year: 2025, category: "flagship", price: 62999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite", screen: "6.73\" 2K 120Hz Quad-Curved Leica AMOLED", camera: "50 MP Light Fusion 900 + 50 MP 5x Periscope + 50 MP UW", battery: 6100, has5G: true },
  { name: "Xiaomi 15 Ultra", brand: "Xiaomi", year: 2025, category: "flagship", price: 84999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Elite (200MP Periscope Leica)", screen: "6.73\" 2K 120Hz 200MP Periscope Kamera Lideri", camera: "50 MP 1\" LYT-900 Leica + 200 MP 4.3x Periscope + 50 MP 3x + 50 MP UW", battery: 6000, has5G: true },
  { name: "Xiaomi 15T", brand: "Xiaomi", year: 2025, category: "midrange", price: 32999, ram: 12, storage: 256, chipset: "Dimensity 8400 Ultra 5G (IP68)", screen: "6.67\" 1.5K 144Hz Leica AI 2.0 AMOLED", camera: "50 MP Leica OIS + 50 MP Tele + 12 MP UW", battery: 5500, has5G: true },
  { name: "Xiaomi 15T Pro", brand: "Xiaomi", year: 2025, category: "flagship", price: 44999, ram: 12, storage: 512, chipset: "Dimensity 9400 5G (120W Şarj / IP68)", screen: "6.67\" 1.5K 144Hz Leica AI 2.0 AMOLED", camera: "50 MP Light Fusion Leica OIS + 50 MP 3x + 12 MP", battery: 5500, has5G: true },
  { name: "Xiaomi 17", brand: "Xiaomi", year: 2026, category: "flagship", price: 59999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 (2nm)", screen: "6.36\" 1.5K 1-120Hz Ultra-Bright Leica AMOLED 3.0", camera: "50 MP Leica Gen-3 + 50 MP Tele + 50 MP UW", battery: 5800, has5G: true },
  { name: "Xiaomi 17 Pro", brand: "Xiaomi", year: 2026, category: "flagship", price: 72999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5", screen: "6.73\" 2K 144Hz Titanyum Kasa Leica AMOLED", camera: "50 MP 1\" Leica Gen-3 + 50 MP 5x + 50 MP 3x + 50 MP UW", battery: 6200, has5G: true },
  { name: "Xiaomi 17 Ultra", brand: "Xiaomi", year: 2026, category: "flagship", price: 97999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Gen 5 (Dünyanın En Gelişmiş Kamera Amiral Gemisi)", screen: "6.8\" 2K 144Hz Titanyum Quad-Curved Leica 3.0", camera: "200 MP Leica Periscope + 50 MP 1\" Main + 50 MP Tele + 50 MP Ultrawide", battery: 6300, has5G: true },
  { name: "Xiaomi 17T", brand: "Xiaomi", year: 2026, category: "midrange", price: 38999, ram: 12, storage: 256, chipset: "Dimensity 8500 Ultra 5G", screen: "6.67\" 1.5K 144Hz Leica AI 3.0 AMOLED", camera: "50 MP Leica OIS + 50 MP Tele + 12 MP UW", battery: 5800, has5G: true },
  { name: "Xiaomi 17T Pro", brand: "Xiaomi", year: 2026, category: "flagship", price: 49999, ram: 16, storage: 512, chipset: "Dimensity 9500 5G (150W Şarj)", screen: "6.67\" 1.5K 144Hz Leica AI 3.0 AMOLED", camera: "50 MP Leica OIS + 50 MP 3x + 12 MP", battery: 6000, has5G: true },

  // Redmi Note 13-15 & POCO F6-F7
  { name: "Xiaomi Redmi Note 13", brand: "Xiaomi", year: 2024, category: "budget", price: 9499, ram: 8, storage: 256, chipset: "Snapdragon 685", screen: "6.67\" FHD+ 120Hz İnce Çerçeve AMOLED (108MP)", camera: "108 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Xiaomi Redmi Note 13 Pro 5G", brand: "Xiaomi", year: 2024, category: "midrange", price: 16999, ram: 12, storage: 512, chipset: "Snapdragon 7s Gen 2 5G", screen: "6.67\" 1.5K 120Hz Gorilla Glass Victus (200MP OIS)", camera: "200 MP HP3 OIS + 8 MP + 2 MP Üçlü", battery: 5100, has5G: true },
  { name: "Xiaomi Redmi Note 13 Pro+ 5G", brand: "Xiaomi", year: 2024, category: "midrange", price: 21999, ram: 12, storage: 512, chipset: "Dimensity 7200 Ultra 5G (IP68 / 120W Şarj)", screen: "6.67\" 1.5K 120Hz Kavisli AMOLED", camera: "200 MP HP3 OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Xiaomi Redmi Note 14 5G", brand: "Xiaomi", year: 2025, category: "budget", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 7025 Ultra 5G", screen: "6.67\" FHD+ 120Hz AMOLED (IP64)", camera: "50 MP Sony LYT-600 OIS + 2 MP", battery: 5110, has5G: true },
  { name: "Xiaomi Redmi Note 14 Pro+ 5G", brand: "Xiaomi", year: 2025, category: "midrange", price: 24999, ram: 12, storage: 512, chipset: "Snapdragon 7s Gen 3 5G (IP68 / 6200mAh Batarya)", screen: "6.67\" 1.5K 120Hz Kavisli AMOLED (Düşmeye Dayanıklı)", camera: "50 MP Light Fusion 800 OIS + 50 MP 2.5x Tele + 8 MP UW", battery: 6200, has5G: true },
  { name: "Xiaomi Redmi Note 15 5G", brand: "Xiaomi", year: 2026, category: "budget", price: 14999, ram: 8, storage: 256, chipset: "Dimensity 7100 5G", screen: "6.67\" FHD+ 120Hz AMOLED (IP65)", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 5500, has5G: true },
  { name: "Xiaomi Redmi Note 15 Pro+ 5G", brand: "Xiaomi", year: 2026, category: "midrange", price: 28999, ram: 16, storage: 512, chipset: "Snapdragon 7 Gen 4 5G (IP69 / 6500mAh Batarya)", screen: "6.67\" 1.5K 144Hz AMOLED (Safir Cam)", camera: "50 MP OIS + 50 MP 3x Tele + 12 MP UW", battery: 6500, has5G: true },
  { name: "Xiaomi Redmi 13", brand: "Xiaomi", year: 2024, category: "budget", price: 6999, ram: 6, storage: 128, chipset: "Helio G91 Ultra", screen: "6.79\" FHD+ 90Hz Cam Arka LCD (108MP)", camera: "108 MP + 2 MP Çift", battery: 5030, has5G: false },
  { name: "Xiaomi Redmi 14 5G", brand: "Xiaomi", year: 2025, category: "budget", price: 8999, ram: 6, storage: 128, chipset: "Snapdragon 4 Gen 2 5G", screen: "6.79\" FHD+ 120Hz LCD", camera: "50 MP + 2 MP Çift", battery: 5160, has5G: true },
  { name: "Xiaomi Redmi 15 5G", brand: "Xiaomi", year: 2026, category: "budget", price: 10999, ram: 8, storage: 128, chipset: "Snapdragon 4s Gen 2 5G", screen: "6.79\" FHD+ 120Hz AMOLED", camera: "50 MP + 2 MP Çift", battery: 5500, has5G: true },

  // POCO F6, F7, X6, X7
  { name: "POCO F6", brand: "POCO", year: 2024, category: "flagship", price: 21999, ram: 12, storage: 512, chipset: "Snapdragon 8s Gen 3 (WildBoost 3.0)", screen: "6.67\" 1.5K 120Hz Flow AMOLED (90W Şarj)", camera: "50 MP Sony IMX882 OIS + 8 MP UW", battery: 5000, has5G: true },
  { name: "POCO F6 Pro", brand: "POCO", year: 2024, category: "flagship", price: 28999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Gen 2 (120W Şarj / Cam Kasa)", screen: "6.67\" WQHD+ 120Hz Flow AMOLED 4000 Nits", camera: "50 MP Light Fusion 800 OIS + 8 MP + 2 MP", battery: 5000, has5G: true },
  { name: "POCO F7 5G", brand: "POCO", year: 2025, category: "flagship", price: 26999, ram: 12, storage: 512, chipset: "Snapdragon 8s Gen 4 5G", screen: "6.67\" 1.5K 120Hz Flow AMOLED 2.0 (90W Şarj)", camera: "50 MP OIS + 8 MP + 2 MP", battery: 5500, has5G: true },
  { name: "POCO F7 Ultra", brand: "POCO", year: 2025, category: "flagship", price: 34999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (Kablosuz Şarj & IP68)", screen: "6.67\" WQHD+ 120Hz Flow AMOLED", camera: "50 MP OIS + 50 MP 3x Tele + 12 MP", battery: 5500, has5G: true },
  { name: "POCO X6 5G", brand: "POCO", year: 2024, category: "midrange", price: 13999, ram: 12, storage: 256, chipset: "Snapdragon 7s Gen 2 5G", screen: "6.67\" 1.5K 120Hz Flow AMOLED (67W Şarj)", camera: "64 MP OIS + 8 MP + 2 MP Üçlü", battery: 5100, has5G: true },
  { name: "POCO X6 Pro 5G", brand: "POCO", year: 2024, category: "midrange", price: 17999, ram: 12, storage: 512, chipset: "Dimensity 8300 Ultra (Performans Canavarı)", screen: "6.67\" 1.5K 120Hz Flow AMOLED 67W", camera: "64 MP OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "POCO X7 5G", brand: "POCO", year: 2025, category: "midrange", price: 16999, ram: 12, storage: 256, chipset: "Dimensity 7300 Ultra 5G", screen: "6.67\" 1.5K 120Hz Flow AMOLED", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 5110, has5G: true },
  { name: "POCO X7 Pro 5G", brand: "POCO", year: 2025, category: "midrange", price: 21999, ram: 12, storage: 512, chipset: "Dimensity 8400 5G (Gamer Edition)", screen: "6.67\" 1.5K 144Hz Flow AMOLED 90W", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 6000, has5G: true }
];

const xiaomiImages = [
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80"
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

const generatedXiaomiPhones = xiaomiModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `${slugify(m.brand)}-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable';
  const rating = isFlagship ? Number((4.6 + (index % 4) * 0.1).toFixed(1)) : Number((4.2 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(140 + (index * 53) % 920);
  const image = xiaomiImages[index % xiaomiImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-xm-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 16200,
      url: '#'
    },
    {
      id: `st-ty-xm-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 24000,
      url: '#'
    },
    {
      id: `st-vt-xm-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 19500,
      url: '#'
    },
    {
      id: `st-mm-xm-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 10400,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: `${m.brand} TR` },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: m.brand,
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
        size: m.screen.split(' ')[0] || "6.67\"",
        type: m.screen,
        resolution: isFlagship ? "3200 x 1440 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2023 ? 120 : 90),
        ppi: isFlagship ? 522 : 395,
        brightnessNits: isFlagship ? 3000 : 1200
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2025 ? "3nm" : (m.year >= 2023 ? "4nm" : "6nm")),
        antutuScore: isFlagship ? 1920000 : 820000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR5X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: !isFlagship && !m.name.includes('Pro')
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "12 MP",
        telephotoMp: isFlagship ? "50 MP (Periscope Telephoto)" : "Yok",
        selfieMp: isFlagship ? "32 MP HD" : "16 MP",
        videoRes: isFlagship ? "8K @ 30fps" : "4K @ 60fps",
        dxomarkScore: isFlagship ? 156 : 122
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('120W') || m.chipset.includes('120W') ? 120 : (isFlagship ? 90 : 67),
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
        weightGrams: isFlagship ? 212 : 188,
        thicknessMm: 8.2,
        waterResistance: m.name.includes('IP68') || isFlagship ? "IP68 (1.5m 30dk)" : "IP54 Su Sıçraması",
        frameMaterial: isFlagship ? "Titanyum / Alüminyum" : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "Xiaomi HyperOS 3.0 (Android 16)" : (m.year >= 2024 ? "Xiaomi HyperOS (Android 15)" : "MIUI 14"),
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

// Remove any older Xiaomi/POCO/Redmi phones that we are replacing with our exhaustive catalog
const nonXiaomiPhones = existingPhones.filter(p => p.brand !== 'Xiaomi' && p.brand !== 'POCO' && p.brand !== 'Redmi');
const combinedPhones = [...nonXiaomiPhones, ...generatedXiaomiPhones];

console.log(`Generated ${generatedXiaomiPhones.length} comprehensive Xiaomi / Redmi / POCO models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Xiaomi / Redmi / POCO 2018-2026 models!");
