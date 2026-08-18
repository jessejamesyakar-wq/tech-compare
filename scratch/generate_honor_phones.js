const fs = require('fs');
const path = require('path');

const honorModels = [
  // --- 2018 ---
  { name: "Honor 10", year: 2018, category: "flagship", price: 4999, ram: 4, storage: 64, chipset: "Kirin 970 (Yapay Zeka NPU)", screen: "5.84\" FHD+ IPS LCD Cam Gövde", camera: "24 MP Siyah-Beyaz + 16 MP Renkli Çift", battery: 3400, has5G: false },
  { name: "Honor 8X", year: 2018, category: "midrange", price: 3299, ram: 4, storage: 64, chipset: "Kirin 710", screen: "6.5\" FHD+ %91 Ekran/Gövde Oranı LCD", camera: "20 MP + 2 MP Çift", battery: 3750, has5G: false },
  { name: "Honor 8X Max", year: 2018, category: "midrange", price: 3999, ram: 4, storage: 128, chipset: "Snapdragon 660", screen: "7.12\" FHD+ Dev Sinematik LCD", camera: "16 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Honor 8C", year: 2018, category: "budget", price: 2499, ram: 4, storage: 32, chipset: "Snapdragon 632", screen: "6.26\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 4000, has5G: false },
  { name: "Honor 8S", year: 2018, category: "budget", price: 1899, ram: 2, storage: 32, chipset: "Helio A22", screen: "5.71\" HD+ LCD", camera: "13 MP", battery: 3020, has5G: false },
  { name: "Honor Play", year: 2018, category: "flagship", price: 3999, ram: 4, storage: 64, chipset: "Kirin 970 (GPU Turbo Teknolojisi)", screen: "6.3\" FHD+ IPS LCD Oyun Odaklı", camera: "16 MP + 2 MP Çift", battery: 3750, has5G: false },
  { name: "Honor View 20", year: 2018, category: "flagship", price: 6999, ram: 6, storage: 128, chipset: "Kirin 980 (Dünyanın İlk Ekran Delikli Amiral Gemisi)", screen: "6.4\" FHD+ 48MP Sony IMX586 + TOF 3D LCD", camera: "48 MP Sony IMX586 + TOF 3D Kamera", battery: 4000, has5G: false },
  { name: "Honor 7A", year: 2018, category: "budget", price: 1799, ram: 2, storage: 16, chipset: "Snapdragon 430", screen: "5.7\" HD+ IPS LCD", camera: "13 MP", battery: 3000, has5G: false },
  { name: "Honor 7C", year: 2018, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Snapdragon 450", screen: "5.99\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 3000, has5G: false },
  { name: "Honor 7S", year: 2018, category: "budget", price: 1499, ram: 2, storage: 16, chipset: "MT6739", screen: "5.45\" HD+ IPS LCD", camera: "13 MP", battery: 3020, has5G: false },
  { name: "Honor Note 10", year: 2018, category: "flagship", price: 5999, ram: 6, storage: 128, chipset: "Kirin 970 (Sıvı Soğutmalı Dev Oyun Ekranı)", screen: "6.95\" FHD+ AMOLED Dolby Atmos", camera: "24 MP + 16 MP Çift", battery: 5000, has5G: false },

  // --- 2019 ---
  { name: "Honor 20", year: 2019, category: "flagship", price: 7499, ram: 6, storage: 128, chipset: "Kirin 980 (3D Dinamik Holografik Cam)", screen: "6.26\" FHD+ Punch-Hole LCD", camera: "48 MP Sony IMX586 + 16 MP UW + 2 MP + 2 MP Dörtlü", battery: 3750, has5G: false },
  { name: "Honor 20 Pro", year: 2019, category: "flagship", price: 9999, ram: 8, storage: 256, chipset: "Kirin 980 (DxOMark 111 Puan Lideri)", screen: "6.26\" FHD+ Punch-Hole LCD (f/1.4 En Geniş Diyafram)", camera: "48 MP OIS f/1.4 + 8 MP 3x Optik OIS + 16 MP UW + 2 MP", battery: 4000, has5G: false },
  { name: "Honor 20 Lite", year: 2019, category: "budget", price: 3499, ram: 4, storage: 128, chipset: "Kirin 710F", screen: "6.21\" FHD+ IPS LCD (32MP Selfie)", camera: "24 MP + 8 MP + 2 MP Üçlü", battery: 3400, has5G: false },
  { name: "Honor 20i", year: 2019, category: "budget", price: 3299, ram: 4, storage: 128, chipset: "Kirin 710", screen: "6.21\" FHD+ IPS LCD", camera: "24 MP + 8 MP + 2 MP Üçlü", battery: 3400, has5G: false },
  { name: "Honor 9X", year: 2019, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Kirin 710F", screen: "6.59\" FHD+ Pop-Up Kameralı Çentiksiz LCD", camera: "48 MP + 8 MP + 2 MP Üçlü Pop-Up", battery: 4000, has5G: false },
  { name: "Honor 9X Pro", year: 2019, category: "midrange", price: 5499, ram: 8, storage: 256, chipset: "Kirin 810 (7nm Performans Canavarı)", screen: "6.59\" FHD+ Pop-Up Kameralı Çentiksiz LCD", camera: "48 MP + 8 MP + 2 MP Üçlü Pop-Up", battery: 4000, has5G: false },
  { name: "Honor 10 Lite", year: 2019, category: "budget", price: 2999, ram: 3, storage: 64, chipset: "Kirin 710", screen: "6.21\" FHD+ Gradyan Renkli LCD", camera: "13 MP + 2 MP Çift", battery: 3400, has5G: false },
  { name: "Honor Magic 2", year: 2019, category: "flagship", price: 11999, ram: 8, storage: 128, chipset: "Kirin 980 (Kızaklı Tam Ekran & 40W Şarj)", screen: "6.39\" FHD+ Kızaklı AMOLED Altı Kamera", camera: "16 MP + 24 MP B&W + 16 MP UW (Üç Ön + Üç Arka)", battery: 3500, has5G: false },
  { name: "Honor 8A", year: 2019, category: "budget", price: 2299, ram: 3, storage: 32, chipset: "Helio P35", screen: "6.09\" HD+ IPS LCD", camera: "13 MP", battery: 3020, has5G: false },

  // --- 2020 ---
  { name: "Honor 30", year: 2020, category: "flagship", price: 10999, ram: 8, storage: 128, chipset: "Kirin 985 5G", screen: "6.53\" FHD+ OLED (50x Periskop Zoom)", camera: "40 MP RYYB Sensör + 8 MP 5x Periskop OIS + 8 MP UW + 2 MP", battery: 4000, has5G: true },
  { name: "Honor 30 Pro", year: 2020, category: "flagship", price: 14999, ram: 8, storage: 256, chipset: "Kirin 990 5G", screen: "6.57\" FHD+ 90Hz Kavisli OLED", camera: "40 MP RYYB OIS + 8 MP 5x Periskop OIS + 16 MP UW", battery: 4000, has5G: true },
  { name: "Honor 30 Pro+", year: 2020, category: "flagship", price: 18999, ram: 12, storage: 256, chipset: "Kirin 990 5G (50MP IMX700 1/1.28\" RYYB)", screen: "6.57\" FHD+ 90Hz Kavisli OLED (27W Kablosuz Şarj)", camera: "50 MP IMX700 RYYB OIS + 8 MP 5x Periskop OIS + 16 MP UW", battery: 4000, has5G: true },
  { name: "Honor 30 Lite", year: 2020, category: "midrange", price: 5999, ram: 6, storage: 128, chipset: "Dimensity 800 5G", screen: "6.5\" FHD+ 90Hz LCD", camera: "48 MP + 8 MP + 2 MP Üçlü", battery: 4000, has5G: true },
  { name: "Honor V30", year: 2020, category: "flagship", price: 11999, ram: 6, storage: 128, chipset: "Kirin 990 5G", screen: "6.57\" FHD+ Çift Ön Kameralı LCD", camera: "40 MP RYYB + 8 MP 3x Tele + 8 MP UW", battery: 4200, has5G: true },
  { name: "Honor V30 Pro", year: 2020, category: "flagship", price: 13999, ram: 8, storage: 256, chipset: "Kirin 990 5G (Matrix Kamera Teknolojisi)", screen: "6.57\" FHD+ Çift Ön Kameralı LCD", camera: "40 MP RYYB OIS + 12 MP Sinema Kamerası + 8 MP 3x Tele OIS", battery: 4100, has5G: true },
  { name: "Honor 10X Lite", year: 2020, category: "budget", price: 3999, ram: 4, storage: 128, chipset: "Kirin 710A (22.5W SuperCharge)", screen: "6.67\" FHD+ IPS LCD", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Honor 9A", year: 2020, category: "budget", price: 2999, ram: 3, storage: 64, chipset: "Helio P22", screen: "6.3\" HD+ IPS LCD", camera: "13 MP + 5 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Honor 9C", year: 2020, category: "budget", price: 3299, ram: 4, storage: 64, chipset: "Kirin 710A", screen: "6.39\" HD+ IPS LCD", camera: "48 MP + 8 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "Honor 9S", year: 2020, category: "budget", price: 2199, ram: 2, storage: 32, chipset: "Helio P22", screen: "5.45\" HD+ IPS LCD", camera: "8 MP", battery: 3020, has5G: false },

  // --- 2021 ---
  { name: "Honor 50", year: 2021, category: "midrange", price: 11999, ram: 8, storage: 128, chipset: "Snapdragon 778G 5G (Google Servisli Geri Dönüş)", screen: "6.57\" FHD+ 120Hz Kavisli OLED (66W Şarj)", camera: "108 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4300, has5G: true },
  { name: "Honor 50 Pro", year: 2021, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Snapdragon 778G 5G (100W SuperCharge)", screen: "6.72\" FHD+ 120Hz Çift Ön Kameralı Kavisli OLED", camera: "108 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4000, has5G: true },
  { name: "Honor 50 SE", year: 2021, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Dimensity 900 5G", screen: "6.78\" FHD+ 120Hz Ultra İnce Çerçeveli LCD", camera: "108 MP + 8 MP + 2 MP Üçlü", battery: 4000, has5G: true },
  { name: "Honor 50 Lite", year: 2021, category: "budget", price: 5999, ram: 6, storage: 128, chipset: "Snapdragon 662 (66W SuperCharge)", screen: "6.67\" FHD+ IPS LCD", camera: "64 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4300, has5G: false },
  { name: "Honor Magic3", year: 2021, category: "flagship", price: 18999, ram: 8, storage: 256, chipset: "Snapdragon 888 5G", screen: "6.76\" FHD+ 120Hz 89° Kavisli IMAX Enhanced OLED", camera: "50 MP + 64 MP Monokrom + 13 MP UW", battery: 4600, has5G: true },
  { name: "Honor Magic3 Pro", year: 2021, category: "flagship", price: 24999, ram: 12, storage: 256, chipset: "Snapdragon 888+ 5G (IP68)", screen: "6.76\" FHD+ 120Hz IMAX Enhanced Kavisli OLED", camera: "50 MP + 64 MP Periskop OIS + 64 MP Monokrom + 13 MP UW", battery: 4600, has5G: true },
  { name: "Honor Magic3 Pro+", year: 2021, category: "flagship", price: 32999, ram: 12, storage: 512, chipset: "Snapdragon 888+ 5G (Nano-Kristal Seramik Gövde)", screen: "6.76\" FHD+ 120Hz Nano-Kristal Seramik IMAX", camera: "50 MP IMX700 RYYB OIS + 64 MP 3.5x Periskop + 64 MP Monokrom + 64 MP UW", battery: 4600, has5G: true },
  { name: "Honor X20", year: 2021, category: "midrange", price: 6999, ram: 6, storage: 128, chipset: "Dimensity 900 5G (66W Şarj)", screen: "6.67\" FHD+ 120Hz LCD", camera: "64 MP + 2 MP + 2 MP Üçlü", battery: 4300, has5G: true },
  { name: "Honor Play 5", year: 2021, category: "midrange", price: 5499, ram: 8, storage: 128, chipset: "Dimensity 800U 5G (66W Şarj / 7.4mm İnce)", screen: "6.53\" FHD+ OLED", camera: "64 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 3800, has5G: true },

  // --- 2022 ---
  { name: "Honor Magic4", year: 2022, category: "flagship", price: 21999, ram: 8, storage: 256, chipset: "Snapdragon 8 Gen 1", screen: "6.81\" FHD+ 120Hz LTPO OLED Eye-Care", camera: "50 MP + 50 MP UW + 8 MP 5x Periskop OIS", battery: 4800, has5G: true },
  { name: "Honor Magic4 Pro", year: 2022, category: "flagship", price: 29999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (100W Kablolu & Kablosuz Şarj / IP68)", screen: "6.81\" 1312x2848 120Hz LTPO OLED 1920Hz PWM", camera: "50 MP OIS + 64 MP 3.5x Periskop OIS + 50 MP UW + dTOF", battery: 4600, has5G: true },
  { name: "Honor Magic4 Ultimate", year: 2022, category: "flagship", price: 39999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 1 (DxOMark Dünya 1.si Sensör)", screen: "6.81\" LTPO OLED Nano-Kristal Cam", camera: "50 MP 1/1.12\" Custom OIS + 64 MP 3.5x Periskop OIS + 50 MP UW + 50 MP Spectrum", battery: 4600, has5G: true },
  { name: "Honor Magic4 Lite", year: 2022, category: "midrange", price: 8999, ram: 6, storage: 128, chipset: "Snapdragon 695 5G (66W Şarj)", screen: "6.81\" FHD+ 120Hz LCD", camera: "48 MP + 2 MP + 2 MP Üçlü", battery: 4800, has5G: true },
  { name: "Honor Magic V", year: 2022, category: "foldable", price: 34999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (İlk Katlanabilir Amiral Gemisi)", screen: "7.9\" 90Hz Katlanabilir OLED + 6.45\" 120Hz Dış Ekran", camera: "50 MP Main + 50 MP Spectrum + 50 MP UW", battery: 4750, has5G: true },
  { name: "Honor Magic Vs", year: 2022, category: "foldable", price: 42999, ram: 12, storage: 512, chipset: "Snapdragon 8+ Gen 1 (Lüks İnce Menteşe)", screen: "7.9\" 120Hz Katlanabilir OLED + 6.45\" 120Hz Dış Ekran", camera: "54 MP Sony IMX800 + 50 MP UW + 8 MP 3x Tele OIS", battery: 5000, has5G: true },
  { name: "Honor 70", year: 2022, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Snapdragon 778G+ 5G (Sony IMX800 Sensör)", screen: "6.67\" FHD+ 120Hz Kavisli OLED (66W Şarj)", camera: "54 MP Sony IMX800 + 50 MP UW/Makro + 2 MP", battery: 4800, has5G: true },
  { name: "Honor 70 Pro", year: 2022, category: "midrange", price: 18999, ram: 12, storage: 256, chipset: "Dimensity 8000 5G (100W SuperCharge)", screen: "6.78\" FHD+ 120Hz Kavisli OLED", camera: "54 MP Sony IMX800 + 8 MP 3x Tele OIS + 50 MP UW", battery: 4500, has5G: true },
  { name: "Honor 70 Pro+", year: 2022, category: "flagship", price: 23999, ram: 12, storage: 256, chipset: "Dimensity 9000 5G", screen: "6.78\" FHD+ 120Hz Kavisli OLED", camera: "54 MP Sony IMX800 + 8 MP 3x Tele OIS + 50 MP UW", battery: 4500, has5G: true },
  { name: "Honor 70 Lite", year: 2022, category: "budget", price: 6499, ram: 4, storage: 128, chipset: "Snapdragon 480+ 5G", screen: "6.5\" HD+ 90Hz LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Honor X8", year: 2022, category: "budget", price: 6999, ram: 6, storage: 128, chipset: "Snapdragon 680 (7.45mm Ultra İnce)", screen: "6.7\" FHD+ 90Hz LCD", camera: "64 MP + 5 MP + 2 MP + 2 MP Dörtlü", battery: 4000, has5G: false },
  { name: "Honor X7", year: 2022, category: "budget", price: 5499, ram: 4, storage: 128, chipset: "Snapdragon 680 (5000 mAh / 22.5W)", screen: "6.74\" HD+ 90Hz LCD", camera: "48 MP + 5 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Honor X6", year: 2022, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Helio G25", screen: "6.5\" HD+ LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },

  // --- 2023 ---
  { name: "Honor Magic5", year: 2023, category: "flagship", price: 28999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 2", screen: "6.73\" 120Hz OLED 2160Hz PWM Eye-Care", camera: "54 MP Sony IMX800 + 50 MP UW + 32 MP 2.5x Tele OIS", battery: 5100, has5G: true },
  { name: "Honor Magic5 Pro", year: 2023, category: "flagship", price: 39999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 2 (DxOMark Lideri / Falcon Kamera)", screen: "6.81\" 1312x2848 120Hz LTPO OLED 2160Hz PWM", camera: "50 MP 1/1.12\" Custom OIS + 50 MP 3.5x Periskop OIS + 50 MP UW", battery: 5100, has5G: true },
  { name: "Honor Magic5 Ultimate", year: 2023, category: "flagship", price: 49999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2 (Nano-Mikrokristal Cam & Deri)", screen: "6.81\" LTPO OLED Düşmeye Dayanıklı Cam", camera: "50 MP Custom OIS + 50 MP 3.5x Periskop OIS + 50 MP UW", battery: 5450, has5G: true },
  { name: "Honor Magic Vs2", year: 2023, category: "foldable", price: 44999, ram: 12, storage: 512, chipset: "Snapdragon 8+ Gen 1 (229g Ultra Hafif Katlanabilir)", screen: "7.92\" 120Hz Katlanabilir LTPO OLED", camera: "50 MP + 20 MP 2.5x Tele OIS + 12 MP UW", battery: 5000, has5G: true },
  { name: "Honor Magic V2", year: 2023, category: "foldable", price: 64999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2 Leading Version (9.9mm İnce)", screen: "7.92\" 120Hz Katlanabilir LTPO OLED 3840Hz PWM", camera: "50 MP OIS + 20 MP 2.5x Tele OIS + 50 MP UW", battery: 5000, has5G: true },
  { name: "Honor Magic V2 RSR Porsche Design", year: 2023, category: "foldable", price: 89999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Gen 2 (Porsche Design Özel Sürüm)", screen: "7.92\" 120Hz Safir Çizilmez Katlanabilir LTPO OLED", camera: "50 MP OIS + 20 MP 2.5x Tele OIS + 50 MP UW", battery: 5000, has5G: true },
  { name: "Honor 90", year: 2023, category: "midrange", price: 17999, ram: 12, storage: 512, chipset: "Snapdragon 7 Gen 1 Accelerated Edition (200MP)", screen: "6.7\" FHD+ 120Hz Kavisli OLED (3840Hz Risk-Free PWM)", camera: "200 MP HP3 + 12 MP UW/Makro + 2 MP", battery: 5000, has5G: true },
  { name: "Honor 90 Pro", year: 2023, category: "midrange", price: 23999, ram: 16, storage: 512, chipset: "Snapdragon 8+ Gen 1 (90W SuperCharge)", screen: "6.78\" FHD+ 120Hz Kavisli OLED (3840Hz PWM)", camera: "200 MP HP3 + 32 MP 2.5x Tele OIS + 12 MP UW", battery: 5000, has5G: true },
  { name: "Honor 90 Lite", year: 2023, category: "budget", price: 9499, ram: 8, storage: 256, chipset: "Dimensity 6020 5G (100MP Kamera)", screen: "6.7\" FHD+ 90Hz LCD", camera: "100 MP + 5 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "Honor X9a", year: 2023, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Snapdragon 695 5G (Kırılmaya Dayanıklı Kavisli OLED)", screen: "6.67\" FHD+ 120Hz 0.65mm Güçlendirilmiş Cam OLED", camera: "64 MP + 5 MP UW + 2 MP", battery: 5100, has5G: true },
  { name: "Honor X7a", year: 2023, category: "budget", price: 6999, ram: 6, storage: 128, chipset: "Helio G37 (6000 mAh Dev Pil)", screen: "6.75\" HD+ 90Hz LCD", camera: "50 MP + 5 MP + 2 MP + 2 MP Dörtlü", battery: 6000, has5G: false },
  { name: "Honor X5a", year: 2023, category: "budget", price: 4999, ram: 4, storage: 64, chipset: "Helio G25", screen: "6.56\" HD+ LCD", camera: "50 MP + 2 MP Çift", battery: 5200, has5G: false },

  // --- 2024 ---
  { name: "Honor Magic6", year: 2024, category: "flagship", price: 39999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 3 (Falcon Kamera)", screen: "6.78\" 1.5K 120Hz LTPO OLED 4320Hz PWM", camera: "50 MP Custom OIS + 32 MP 2.5x Tele + 50 MP UW", battery: 5450, has5G: true },
  { name: "Honor Magic6 Pro", year: 2024, category: "flagship", price: 54999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 3 (180MP Telephoto Falcon / IP68)", screen: "6.8\" 1.5K 120Hz LTPO OLED Nano-Kristal Shield", camera: "50 MP f/1.4-f/2.0 OIS + 180 MP 2.5x Periskop OIS + 50 MP UW", battery: 5600, has5G: true },
  { name: "Honor Magic6 Ultimate", year: 2024, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (LOFIC Sensör & LiDAR AF)", screen: "6.8\" LTPO OLED Çizilmez Safir Cam", camera: "50 MP LOFIC f/1.4-f/2.0 OIS + 180 MP Periskop OIS + 50 MP UW", battery: 5600, has5G: true },
  { name: "Honor Magic6 RSR Porsche Design", year: 2024, category: "flagship", price: 89999, ram: 24, storage: 1024, chipset: "Snapdragon 8 Gen 3 (Porsche Taycan Çizgileri / 24GB RAM)", screen: "6.8\" Çift Katmanlı Tandem OLED 5000 Nits", camera: "50 MP LOFIC f/1.4-f/2.0 OIS + 180 MP Periskop OIS + 50 MP UW", battery: 5600, has5G: true },
  { name: "Honor Magic V3", year: 2024, category: "foldable", price: 74999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (Dünyanın En İnce Katlanabilir 9.2mm / IPX8)", screen: "7.92\" 120Hz Katlanabilir LTPO OLED 4320Hz PWM", camera: "50 MP OIS + 50 MP 3.5x Periskop OIS + 40 MP UW", battery: 5150, has5G: true },
  { name: "Honor Magic V Flip", year: 2024, category: "foldable", price: 44999, ram: 12, storage: 256, chipset: "Snapdragon 8+ Gen 1 (Devasa 4.0\" Dış Kapak Ekranı)", screen: "6.8\" FHD+ 120Hz Katlanabilir LTPO OLED", camera: "50 MP Sony IMX906 OIS + 12 MP UW Çift", battery: 4800, has5G: true },
  { name: "Honor 200", year: 2024, category: "midrange", price: 23999, ram: 12, storage: 512, chipset: "Snapdragon 7 Gen 3 5G (Harcourt Portre Stüdyosu)", screen: "6.7\" FHD+ 120Hz Kavisli OLED (100W Şarj)", camera: "50 MP Sony IMX906 OIS + 50 MP 2.5x Tele OIS + 12 MP UW", battery: 5200, has5G: true },
  { name: "Honor 200 Pro", year: 2024, category: "midrange", price: 34999, ram: 12, storage: 512, chipset: "Snapdragon 8s Gen 3 (Studio Harcourt Paris / IP65)", screen: "6.78\" 1.5K 120Hz Kavisli OLED (100W & 66W Kablosuz Şarj)", camera: "50 MP H9000 1/1.3\" OIS + 50 MP 2.5x Tele OIS + 12 MP UW", battery: 5200, has5G: true },
  { name: "Honor 200 Lite", year: 2024, category: "budget", price: 14999, ram: 8, storage: 256, chipset: "Dimensity 6080 5G (108MP Kamera / 6.78mm Ultra İnce)", screen: "6.7\" FHD+ 90Hz AMOLED 2000 Nits", camera: "108 MP + 5 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "Honor X8b", year: 2024, category: "budget", price: 11999, ram: 8, storage: 512, chipset: "Snapdragon 680 (Magic Capsule / 108MP)", screen: "6.7\" FHD+ 90Hz AMOLED 2000 Nits", camera: "108 MP + 5 MP UW + 2 MP (50MP Selfie Flaslı)", battery: 4500, has5G: false },
  { name: "Honor X9b 5G", year: 2024, category: "midrange", price: 16999, ram: 12, storage: 256, chipset: "Snapdragon 6 Gen 1 5G (Ultra-Bounce Anti-Drop Ekran)", screen: "6.78\" 1.5K 120Hz 360° Kırılmaz Kavisli OLED", camera: "108 MP + 5 MP UW + 2 MP", battery: 5800, has5G: true },

  // --- 2025 ---
  { name: "Honor Magic7", year: 2025, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (3nm / Magic AI Agent)", screen: "6.78\" 1.5K 120Hz LTPO OLED 4320Hz PWM", camera: "50 MP OmniVision OIS + 50 MP 3x Tele OIS + 50 MP UW", battery: 5650, has5G: true },
  { name: "Honor Magic7 Pro", year: 2025, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (200MP Periskop Kamera / IP69)", screen: "6.8\" 1.5K 120Hz LTPO OLED Rhino Glass", camera: "50 MP f/1.4-f/2.0 OIS + 200 MP 3x Periskop OIS + 50 MP UW", battery: 5850, has5G: true },
  { name: "Honor Magic7 RSR Porsche Design", year: 2025, category: "flagship", price: 99999, ram: 24, storage: 1024, chipset: "Snapdragon 8 Elite (Porsche Design Safir Cam)", screen: "6.8\" Tandem OLED 5000 Nits Çizilmez Safir", camera: "50 MP LOFIC f/1.4-f/2.0 OIS + 200 MP Periskop OIS + 50 MP UW", battery: 5850, has5G: true },
  { name: "Honor 400", year: 2025, category: "midrange", price: 29999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 3 5G (Harcourt Portre 2.0)", screen: "6.7\" 1.5K 120Hz OLED (100W Şarj)", camera: "50 MP Sony OIS + 50 MP Tele OIS + 12 MP UW", battery: 5500, has5G: true },
  { name: "Honor 400 Pro", year: 2025, category: "midrange", price: 39999, ram: 16, storage: 512, chipset: "Snapdragon 8s Gen 4 (Harcourt AI Studio / IP68)", screen: "6.78\" 1.5K 144Hz OLED (100W & 66W Kablosuz Şarj)", camera: "50 MP 1/1.3\" Custom OIS + 50 MP 3x Tele OIS + 12 MP UW", battery: 5600, has5G: true },
  { name: "Honor 400 Lite", year: 2025, category: "budget", price: 16999, ram: 8, storage: 256, chipset: "Dimensity 6300 5G", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "108 MP + 5 MP + 2 MP", battery: 5000, has5G: true },
  { name: "Honor Magic V5", year: 2025, category: "foldable", price: 84999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (8.8mm Dünyanın En İnce Katlanabiliri)", screen: "7.95\" 120Hz Katlanabilir LTPO OLED", camera: "50 MP OIS + 50 MP 3.5x Periskop OIS + 50 MP UW", battery: 5300, has5G: true },
  { name: "Honor Win", year: 2025, category: "midrange", price: 22999, ram: 12, storage: 256, chipset: "Snapdragon 8s Gen 3 (Oyun Odaklı Sıvı Soğutma)", screen: "6.78\" 1.5K 144Hz OLED Oyun Ekranı", camera: "50 MP OIS + 8 MP UW", battery: 6000, has5G: true },

  // --- 2026 ---
  { name: "Honor Magic8", year: 2026, category: "flagship", price: 64999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 (2nm / AI 3.0)", screen: "6.78\" 1.5K 144Hz LTPO OLED 4320Hz PWM", camera: "50 MP Custom OIS + 50 MP 3x Tele OIS + 50 MP UW", battery: 6000, has5G: true },
  { name: "Honor Magic8 Pro", year: 2026, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 (200MP Falcon Periskop 2.0 / IP69)", screen: "6.8\" 1.5K 144Hz LTPO OLED Safir Zırh Ekran", camera: "50 MP f/1.4-f/2.0 OIS + 200 MP 3.5x Periskop OIS + 50 MP UW", battery: 6200, has5G: true },
  { name: "Honor Magic8 Lite", year: 2026, category: "midrange", price: 19999, ram: 12, storage: 256, chipset: "Snapdragon 6s Gen 3 5G (Anti-Drop Kırılmaz Cam)", screen: "6.78\" 1.5K 120Hz OLED", camera: "108 MP OIS + 5 MP UW + 2 MP", battery: 6000, has5G: true },
  { name: "Honor Magic V6", year: 2026, category: "foldable", price: 94999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 (8.5mm Ultra Katlanabilir)", screen: "8.0\" 144Hz Katlanabilir LTPO OLED", camera: "50 MP OIS + 50 MP 5x Periskop OIS + 50 MP UW", battery: 5500, has5G: true },
  { name: "Honor 600", year: 2026, category: "midrange", price: 34999, ram: 12, storage: 512, chipset: "Snapdragon 7+ Gen 4 5G (Harcourt Studio 3.0)", screen: "6.7\" 1.5K 144Hz OLED (120W Şarj)", camera: "50 MP Sony OIS + 50 MP Tele OIS + 12 MP UW", battery: 5800, has5G: true },
  { name: "Honor 600 Pro", year: 2026, category: "midrange", price: 44999, ram: 16, storage: 512, chipset: "Snapdragon 8s Gen 5 (IP69 Suya Dayanıklı)", screen: "6.78\" 1.5K 144Hz OLED (120W & 66W Kablosuz Şarj)", camera: "50 MP 1/1.3\" Custom OIS + 50 MP 3x Tele OIS + 12 MP UW", battery: 6000, has5G: true },
  { name: "Honor 600 Lite", year: 2026, category: "budget", price: 19999, ram: 8, storage: 256, chipset: "Dimensity 6400+ 5G", screen: "6.7\" FHD+ 120Hz AMOLED", camera: "108 MP OIS + 5 MP + 2 MP", battery: 5500, has5G: true },
  { name: "Honor Win / Win Turbo", year: 2026, category: "midrange", price: 27999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (Aktif Fanlı / 144Hz Oyun Canavarı)", screen: "6.78\" 1.5K 144Hz OLED Oyun Ekranı 2500 Nits", camera: "50 MP OIS + 12 MP UW", battery: 6500, has5G: true }
];

const honorImages = [
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

const generatedHonorPhones = honorModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `honor-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable';
  const rating = isFlagship ? Number((4.6 + (index % 4) * 0.1).toFixed(1)) : Number((4.2 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(115 + (index * 41) % 760);
  const image = honorImages[index % honorImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-hn-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 13800,
      url: '#'
    },
    {
      id: `st-ty-hn-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 19400,
      url: '#'
    },
    {
      id: `st-vt-hn-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 15200,
      url: '#'
    },
    {
      id: `st-mm-hn-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 8700,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Honor TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Honor",
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
        resolution: isFlagship ? "2848 x 1312 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2022 ? 120 : 90),
        ppi: isFlagship ? 460 : 390,
        brightnessNits: isFlagship ? 5000 : 1600
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2025 ? "3nm" : (m.year >= 2023 ? "4nm" : "6nm")),
        antutuScore: isFlagship ? 1910000 : 790000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR5X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: !isFlagship
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "12 MP",
        telephotoMp: isFlagship ? "180 MP Falcon Periskop OIS" : "Yok",
        selfieMp: m.name.includes('Pro') ? "50 MP 4K Selfie" : "16 MP",
        videoRes: isFlagship ? "4K @ 60fps IMAX Enhanced" : "4K @ 30fps",
        dxomarkScore: isFlagship ? 158 : 120
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('100W') || m.chipset.includes('100W') ? 100 : (isFlagship ? 80 : 35),
        wirelessCharging: isFlagship,
        reverseWireless: isFlagship
      },
      connectivity: {
        has5G: m.has5G,
        wifiStandard: isFlagship ? "Wi-Fi 7" : "Wi-Fi 6",
        bluetooth: "5.3",
        hasNFC: true,
        hasesim: isFlagship
      },
      build: {
        weightGrams: isFlagship ? 209 : 185,
        thicknessMm: 8.1,
        waterResistance: m.name.includes('IP69') ? "IP69" : (isFlagship ? "IP68 (1.5m 30dk)" : "Yok"),
        frameMaterial: isFlagship ? (m.name.includes('Porsche') ? "Porsche Safir Kristal / Titanyum" : "Alüminyum") : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "MagicOS 10.0 (Android 16)" : (m.year >= 2024 ? "MagicOS 8.0 (Android 14)" : "Magic UI 6.0"),
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

// Remove any older Honor phones that we are replacing with our exhaustive catalog
const nonHonorPhones = existingPhones.filter(p => p.brand !== 'Honor');
const combinedPhones = [...nonHonorPhones, ...generatedHonorPhones];

console.log(`Generated ${generatedHonorPhones.length} comprehensive Honor models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Honor 2018-2026 models!");
