const fs = require('fs');
const path = require('path');

const oppoModels = [
  // --- 2018 ---
  { name: "Oppo Find X", year: 2018, category: "flagship", price: 9999, ram: 8, storage: 256, chipset: "Snapdragon 845", screen: "6.42\" FHD+ Gizli Motorlu Kameralı AMOLED", camera: "16 MP + 20 MP Çift Motorlu Pop-Up", battery: 3730, has5G: false },
  { name: "Oppo R15", year: 2018, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Helio P60", screen: "6.28\" FHD+ OLED", camera: "16 MP + 5 MP Çift", battery: 3450, has5G: false },
  { name: "Oppo R15 Pro", year: 2018, category: "midrange", price: 5499, ram: 6, storage: 128, chipset: "Snapdragon 660", screen: "6.28\" FHD+ OLED", camera: "20 MP + 16 MP Çift", battery: 3430, has5G: false },
  { name: "Oppo RX17 Pro", year: 2018, category: "midrange", price: 6499, ram: 6, storage: 128, chipset: "Snapdragon 710", screen: "6.4\" FHD+ AMOLED (SuperVOOC 50W)", camera: "12 MP + 20 MP + TOF 3D Üçlü", battery: 3700, has5G: false },
  { name: "Oppo F7", year: 2018, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Helio P60", screen: "6.23\" FHD+ IPS LCD (25MP Selfie)", camera: "16 MP", battery: 3400, has5G: false },
  { name: "Oppo F9", year: 2018, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Helio P60", screen: "6.3\" FHD+ Su Damlası Çentikli LTPS LCD", camera: "16 MP + 2 MP Çift", battery: 3500, has5G: false },
  { name: "Oppo F9 Pro", year: 2018, category: "budget", price: 3999, ram: 6, storage: 64, chipset: "Helio P60", screen: "6.3\" FHD+ LTPS LCD (VOOC 20W)", camera: "16 MP + 2 MP Çift", battery: 3500, has5G: false },
  { name: "Oppo A3", year: 2018, category: "budget", price: 2499, ram: 4, storage: 128, chipset: "Helio P60", screen: "6.2\" FHD+ LTPS LCD", camera: "16 MP", battery: 3400, has5G: false },
  { name: "Oppo A5 (2018)", year: 2018, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Snapdragon 450", screen: "6.2\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 4230, has5G: false },
  { name: "Oppo A7", year: 2018, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Snapdragon 450", screen: "6.2\" HD+ IPS LCD", camera: "13 MP + 2 MP Çift", battery: 4230, has5G: false },
  { name: "Oppo A83", year: 2018, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Helio P23", screen: "5.7\" HD+ IPS LCD", camera: "13 MP", battery: 3180, has5G: false },

  // --- 2019 ---
  { name: "Oppo Reno", year: 2019, category: "midrange", price: 6999, ram: 6, storage: 256, chipset: "Snapdragon 710", screen: "6.4\" FHD+ Köpekbalığı Yüzgeci Pop-Up AMOLED", camera: "48 MP + 5 MP Çift", battery: 3765, has5G: false },
  { name: "Oppo Reno 10x Zoom", year: 2019, category: "flagship", price: 12999, ram: 8, storage: 256, chipset: "Snapdragon 855", screen: "6.6\" FHD+ 10x Periskop Zoom Köpekbalığı Pop-Up AMOLED", camera: "48 MP OIS + 13 MP 5x Periskop OIS + 8 MP UW", battery: 4065, has5G: false },
  { name: "Oppo Reno2", year: 2019, category: "midrange", price: 7999, ram: 8, storage: 256, chipset: "Snapdragon 730G", screen: "6.5\" FHD+ 20x Zoom Pop-Up AMOLED", camera: "48 MP OIS + 13 MP 5x Hibrit + 8 MP + 2 MP Dörtlü", battery: 4000, has5G: false },
  { name: "Oppo Reno2 Z", year: 2019, category: "midrange", price: 5999, ram: 8, storage: 128, chipset: "Helio P90", screen: "6.53\" FHD+ Dikey Pop-Up AMOLED", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4000, has5G: false },
  { name: "Oppo Reno Z", year: 2019, category: "midrange", price: 4999, ram: 6, storage: 128, chipset: "Helio P90", screen: "6.4\" FHD+ AMOLED", camera: "48 MP + 5 MP Çift", battery: 4035, has5G: false },
  { name: "Oppo A9 (2019)", year: 2019, category: "budget", price: 3499, ram: 6, storage: 128, chipset: "Helio P70", screen: "6.53\" FHD+ IPS LCD", camera: "16 MP + 2 MP Çift", battery: 4020, has5G: false },
  { name: "Oppo A5 (2020)", year: 2019, category: "budget", price: 3299, ram: 3, storage: 64, chipset: "Snapdragon 665", screen: "6.5\" HD+ IPS LCD (Stereo Hoparlör)", camera: "12 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Oppo A9 (2020)", year: 2019, category: "budget", price: 4299, ram: 8, storage: 128, chipset: "Snapdragon 665", screen: "6.5\" HD+ IPS LCD", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Oppo F11", year: 2019, category: "budget", price: 3799, ram: 4, storage: 128, chipset: "Helio P70", screen: "6.53\" FHD+ LTPS LCD", camera: "48 MP + 5 MP Çift", battery: 4020, has5G: false },
  { name: "Oppo F11 Pro", year: 2019, category: "midrange", price: 4799, ram: 6, storage: 128, chipset: "Helio P70", screen: "6.53\" FHD+ Pop-Up Kameralı LTPS LCD", camera: "48 MP + 5 MP Çift", battery: 4000, has5G: false },

  // --- 2020 ---
  { name: "Oppo Find X2", year: 2020, category: "flagship", price: 16999, ram: 12, storage: 256, chipset: "Snapdragon 865", screen: "6.7\" QHD+ 120Hz 3K 10-Bit Curved AMOLED", camera: "48 MP IMX586 + 13 MP Tele + 12 MP Ultrawide", battery: 4200, has5G: true },
  { name: "Oppo Find X2 Pro", year: 2020, category: "flagship", price: 21999, ram: 12, storage: 512, chipset: "Snapdragon 865 (65W SuperVOOC)", screen: "6.7\" QHD+ 120Hz Seramik/Deri DxOMark Şampiyonu", camera: "48 MP IMX689 OIS + 13 MP 5x Periskop OIS + 48 MP UW", battery: 4260, has5G: true },
  { name: "Oppo Reno3", year: 2020, category: "midrange", price: 5499, ram: 8, storage: 128, chipset: "Helio P90", screen: "6.4\" FHD+ AMOLED (44MP Selfie)", camera: "48 MP + 13 MP Tele + 8 MP + 2 MP Dörtlü", battery: 4025, has5G: false },
  { name: "Oppo Reno3 Pro", year: 2020, category: "midrange", price: 7499, ram: 8, storage: 256, chipset: "Helio P95", screen: "6.4\" FHD+ Çift Ön Kameralı AMOLED", camera: "64 MP + 13 MP Tele + 8 MP + 2 MP Dörtlü", battery: 4025, has5G: false },
  { name: "Oppo Reno4", year: 2020, category: "midrange", price: 6999, ram: 8, storage: 128, chipset: "Snapdragon 720G", screen: "6.4\" FHD+ AMOLED", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4015, has5G: false },
  { name: "Oppo Reno4 Pro", year: 2020, category: "midrange", price: 9999, ram: 8, storage: 256, chipset: "Snapdragon 720G (65W SuperVOOC 2.0 / 90Hz)", screen: "6.5\" FHD+ 90Hz Curved AMOLED", camera: "48 MP Sony IMX586 + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4000, has5G: false },
  { name: "Oppo A53", year: 2020, category: "budget", price: 3499, ram: 4, storage: 128, chipset: "Snapdragon 460", screen: "6.5\" HD+ 90Hz IPS LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Oppo A73", year: 2020, category: "budget", price: 4499, ram: 6, storage: 128, chipset: "Snapdragon 662", screen: "6.44\" FHD+ OLED (Deri Görünümlü Arka Kapak)", camera: "16 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4015, has5G: false },
  { name: "Oppo A31", year: 2020, category: "budget", price: 2999, ram: 4, storage: 128, chipset: "Helio P35", screen: "6.5\" HD+ IPS LCD", camera: "12 MP + 2 MP + 2 MP Üçlü", battery: 4230, has5G: false },

  // --- 2021 ---
  { name: "Oppo Find X3", year: 2021, category: "flagship", price: 18999, ram: 8, storage: 256, chipset: "Snapdragon 870 5G", screen: "6.7\" QHD+ 120Hz LTPO AMOLED", camera: "50 MP IMX766 OIS + 50 MP UW + 13 MP Tele + 3 MP Mikroskop", battery: 4500, has5G: true },
  { name: "Oppo Find X3 Pro", year: 2021, category: "flagship", price: 25999, ram: 12, storage: 256, chipset: "Snapdragon 888", screen: "6.7\" QHD+ 120Hz 60x Mikroskop Kameralı İnceltilmiş Cam", camera: "50 MP IMX766 OIS + 50 MP Ultrawide + 13 MP Tele + 3 MP 60x Mikroskop", battery: 4500, has5G: true },
  { name: "Oppo Reno5", year: 2021, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 720G", screen: "6.43\" FHD+ 90Hz OLED (50W Flash Charge)", camera: "64 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4310, has5G: false },
  { name: "Oppo Reno5 Pro", year: 2021, category: "midrange", price: 11999, ram: 12, storage: 256, chipset: "Dimensity 1000+ 5G (65W SuperVOOC)", screen: "6.55\" FHD+ 90Hz Curved OLED", camera: "64 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4350, has5G: true },
  { name: "Oppo Reno6", year: 2021, category: "midrange", price: 10999, ram: 8, storage: 128, chipset: "Dimensity 900 5G (Retro Düz Kenar Tasarım)", screen: "6.43\" FHD+ 90Hz AMOLED", camera: "64 MP + 8 MP + 2 MP Üçlü", battery: 4300, has5G: true },
  { name: "Oppo Reno6 Pro", year: 2021, category: "midrange", price: 15999, ram: 12, storage: 256, chipset: "Snapdragon 870 5G", screen: "6.55\" FHD+ 90Hz Curved AMOLED", camera: "50 MP Sony IMX766 OIS + 13 MP Tele + 16 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "Oppo A54", year: 2021, category: "budget", price: 3999, ram: 4, storage: 128, chipset: "Helio P35", screen: "6.51\" HD+ IPS LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Oppo A74", year: 2021, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Snapdragon 662", screen: "6.43\" FHD+ AMOLED (33W Şarj)", camera: "48 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Oppo A94", year: 2021, category: "midrange", price: 6499, ram: 8, storage: 128, chipset: "Helio P95", screen: "6.43\" FHD+ AMOLED (30W VOOC)", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 4310, has5G: false },

  // --- 2022 ---
  { name: "Oppo Find X5", year: 2022, category: "flagship", price: 23999, ram: 8, storage: 256, chipset: "Snapdragon 888 (MariSilicon X NPU)", screen: "6.55\" FHD+ 120Hz AMOLED Hasselblad", camera: "50 MP IMX766 OIS + 50 MP UW + 13 MP Tele", battery: 4800, has5G: true },
  { name: "Oppo Find X5 Pro", year: 2022, category: "flagship", price: 32999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (Hasselblad + Seramik Gövde)", screen: "6.7\" QHD+ 120Hz LTPO 2.0 Seramik Hasselblad", camera: "50 MP 5-Axis OIS + 50 MP Ultrawide + 13 MP Tele", battery: 5000, has5G: true },
  { name: "Oppo Find N2", year: 2022, category: "foldable", price: 39999, ram: 12, storage: 256, chipset: "Snapdragon 8+ Gen 1 (Kompakt Katlanabilir)", screen: "7.1\" 120Hz LTPO Katlanabilir AMOLED Hasselblad", camera: "50 MP Sony IMX890 OIS + 32 MP 2x + 48 MP UW", battery: 4520, has5G: true },
  { name: "Oppo Find N2 Flip", year: 2022, category: "foldable", price: 28999, ram: 8, storage: 256, chipset: "Dimensity 9000+ 5G (Geniş Dikey Kapak Ekranı)", screen: "6.8\" FHD+ 120Hz Katlanabilir AMOLED", camera: "50 MP Hasselblad + 8 MP UW", battery: 4300, has5G: true },
  { name: "Oppo Reno7", year: 2022, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Snapdragon 680 (Mikroskop Kameralı)", screen: "6.43\" FHD+ 90Hz AMOLED", camera: "64 MP + 2 MP Mikroskop + 2 MP", battery: 4500, has5G: false },
  { name: "Oppo Reno8", year: 2022, category: "midrange", price: 13999, ram: 8, storage: 256, chipset: "Dimensity 1300 5G (80W SuperVOOC)", screen: "6.4\" FHD+ 90Hz AMOLED Sony Sensörler", camera: "50 MP Sony IMX766 + 8 MP + 2 MP", battery: 4500, has5G: true },
  { name: "Oppo Reno8 Pro", year: 2022, category: "flagship", price: 19999, ram: 12, storage: 256, chipset: "Dimensity 8100 MAX 5G (MariSilicon X NPU)", screen: "6.7\" FHD+ 120Hz Yekpare Cam AMOLED", camera: "50 MP Sony IMX766 OIS + 8 MP + 2 MP", battery: 4500, has5G: true },
  { name: "Oppo A16", year: 2022, category: "budget", price: 3999, ram: 4, storage: 64, chipset: "Helio G35", screen: "6.52\" HD+ IPS LCD", camera: "13 MP + 2 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Oppo A57", year: 2022, category: "budget", price: 5499, ram: 4, storage: 64, chipset: "Helio G35 (33W SUPERVOOC)", screen: "6.56\" HD+ IPS LCD (Stereo Hoparlör)", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Oppo A76", year: 2022, category: "budget", price: 6499, ram: 6, storage: 128, chipset: "Snapdragon 680", screen: "6.56\" HD+ 90Hz Punch-Hole LCD", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Oppo A96", year: 2022, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 680 (33W SUPERVOOC)", screen: "6.59\" FHD+ 90Hz Punch-Hole LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2023 ---
  { name: "Oppo Find N3", year: 2023, category: "foldable", price: 64999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 2 (Düz Katlanan Efsane)", screen: "7.82\" QXGA+ 120Hz LTPO 3.0 Hasselblad Katlanabilir", camera: "48 MP Sony LYT-T808 + 64 MP 3x Periskop + 48 MP UW", battery: 4805, has5G: true },
  { name: "Oppo Find N3 Flip", year: 2023, category: "foldable", price: 39999, ram: 12, storage: 256, chipset: "Dimensity 9200 5G (Üçlü Hasselblad Kameralı Flip)", screen: "6.8\" FHD+ 120Hz AMOLED Kapak Ekranı", camera: "50 MP OIS + 32 MP 2x Tele + 48 MP UW", battery: 4300, has5G: true },
  { name: "Oppo Reno10", year: 2023, category: "midrange", price: 16999, ram: 8, storage: 256, chipset: "Dimensity 7050 5G (32MP Telephoto)", screen: "6.7\" FHD+ 120Hz Kavisli 3D AMOLED", camera: "64 MP + 32 MP Telephoto + 8 MP UW", battery: 5000, has5G: true },
  { name: "Oppo Reno10 Pro", year: 2023, category: "midrange", price: 22999, ram: 12, storage: 256, chipset: "Snapdragon 778G 5G (80W SUPERVOOC)", screen: "6.7\" FHD+ 120Hz Kavisli 3D AMOLED", camera: "50 MP IMX890 OIS + 32 MP Telephoto + 8 MP UW", battery: 4600, has5G: true },
  { name: "Oppo A18", year: 2023, category: "budget", price: 4999, ram: 4, storage: 128, chipset: "Helio G85", screen: "6.56\" HD+ 90Hz Sunlit LCD", camera: "8 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Oppo A38", year: 2023, category: "budget", price: 6299, ram: 4, storage: 128, chipset: "Helio G85 (33W SUPERVOOC)", screen: "6.56\" HD+ 90Hz 720 Nits LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Oppo A58", year: 2023, category: "budget", price: 7499, ram: 6, storage: 128, chipset: "Helio G85 (FHD+ Çift Hoparlör)", screen: "6.72\" FHD+ Sunlit LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Oppo A78", year: 2023, category: "midrange", price: 9499, ram: 8, storage: 256, chipset: "Snapdragon 680 (67W SUPERVOOC / AMOLED)", screen: "6.43\" FHD+ 90Hz AMOLED", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2024 ---
  { name: "Oppo Find X7", year: 2024, category: "flagship", price: 42999, ram: 16, storage: 512, chipset: "Dimensity 9300 5G", screen: "6.78\" 1.5K 120Hz LTPO AMOLED Hasselblad", camera: "50 MP OIS + 64 MP 3x Periskop OIS + 50 MP UW", battery: 5000, has5G: true },
  { name: "Oppo Find X7 Ultra", year: 2024, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 3 (Dünyanın İlk Çift Periskop Kameralı)", screen: "6.82\" QHD+ 120Hz LTPO 4500 Nits Hasselblad Master", camera: "50 MP 1\" LYT-900 OIS + 50 MP 3x Periskop + 50 MP 6x Periskop + 50 MP UW", battery: 5000, has5G: true },
  { name: "Oppo Reno11", year: 2024, category: "midrange", price: 18999, ram: 12, storage: 256, chipset: "Dimensity 7050 5G (Portre Uzmanı)", screen: "6.7\" FHD+ 120Hz 3D Kavisli OLED", camera: "50 MP Sony LYT-600 OIS + 32 MP Tele + 8 MP UW", battery: 5000, has5G: true },
  { name: "Oppo Reno11 Pro", year: 2024, category: "midrange", price: 25999, ram: 12, storage: 512, chipset: "Dimensity 8200 5G (80W SUPERVOOC)", screen: "6.7\" FHD+ 120Hz 3D Kavisli OLED", camera: "50 MP Sony IMX890 OIS + 32 MP Tele + 8 MP UW", battery: 4600, has5G: true },
  { name: "Oppo Reno12", year: 2024, category: "midrange", price: 23999, ram: 12, storage: 256, chipset: "Dimensity 7300 Energy 5G (Yapay Zeka AI Eraser)", screen: "6.7\" FHD+ 120Hz Dört Tarafı Kavisli AMOLED", camera: "50 MP Sony LYT-600 OIS + 50 MP Tele + 8 MP UW", battery: 5000, has5G: true },
  { name: "Oppo Reno12 Pro", year: 2024, category: "midrange", price: 29999, ram: 12, storage: 512, chipset: "Dimensity 7300 Energy 5G (GenAI Özellikleri / IP65)", screen: "6.7\" FHD+ 120Hz Dört Tarafı Kavisli AMOLED", camera: "50 MP Sony Samsung JN5 2x Tele + 50 MP LYT-600 OIS + 8 MP", battery: 5000, has5G: true },
  { name: "Oppo A60", year: 2024, category: "budget", price: 8999, ram: 8, storage: 128, chipset: "Snapdragon 680 (Askeri Sınıf Darbe Dayanıklılığı)", screen: "6.67\" HD+ 90Hz 950 Nits LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },

  // --- 2025 ---
  { name: "Oppo Find X8", year: 2025, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Dimensity 9400 (3nm)", screen: "6.59\" 1.5K 120Hz İnce Çerçeveli Hasselblad OLED", camera: "50 MP LYT-700 OIS + 50 MP 3x Periskop OIS + 50 MP UW", battery: 5630, has5G: true },
  { name: "Oppo Find X8 Pro", year: 2025, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Dimensity 9400 (Çift Periskop Hasselblad)", screen: "6.78\" 1.5K 120Hz Quad-Curved OLED (Kamera Butonu)", camera: "50 MP LYT-808 OIS + 50 MP 3x Periskop + 50 MP 6x Periskop + 50 MP UW", battery: 5910, has5G: true },
  { name: "Oppo Find X8 Ultra", year: 2025, category: "flagship", price: 89999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Elite (Lider Kamera Şampiyonu)", screen: "6.82\" 2K+ 120Hz LTPO 4.0 Hasselblad Master 2.0", camera: "50 MP 1\" LYT-900 OIS + 50 MP 3x Periskop + 50 MP 6x Periskop + 50 MP UW", battery: 6000, has5G: true },
  { name: "Oppo Find N5", year: 2025, category: "foldable", price: 79999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (Dünyanın En İnce Katlanabiliri)", screen: "8.0\" 2K+ 120Hz Zero-Crease Katlanabilir LTPO", camera: "50 MP Hasselblad + 50 MP 3x Periskop + 50 MP UW", battery: 5500, has5G: true },
  { name: "Oppo Reno13", year: 2025, category: "midrange", price: 27999, ram: 12, storage: 256, chipset: "Dimensity 8350 5G (IP69 Suya Dayanıklı / AI)", screen: "6.59\" 1.5K 120Hz Düz AMOLED", camera: "50 MP OIS + 50 MP Tele + 8 MP UW", battery: 5600, has5G: true },
  { name: "Oppo Reno13 Pro", year: 2025, category: "midrange", price: 34999, ram: 16, storage: 512, chipset: "Dimensity 8350 5G (IP69 / AI Live Photo)", screen: "6.83\" 1.5K 120Hz Quad-Curved AMOLED", camera: "50 MP Sony LYT-808 OIS + 50 MP 3.5x Periskop + 8 MP UW", battery: 5800, has5G: true },
  { name: "Oppo F29", year: 2025, category: "budget", price: 11999, ram: 8, storage: 256, chipset: "Snapdragon 6 Gen 1 5G", screen: "6.7\" FHD+ 120Hz AMOLED (IP64)", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 5500, has5G: true },

  // --- 2026 ---
  { name: "Oppo Find X9", year: 2026, category: "flagship", price: 62999, ram: 16, storage: 512, chipset: "Dimensity 9500 (2nm)", screen: "6.6\" 1.5K 120Hz LTPO Hasselblad OLED 2.0", camera: "50 MP OIS + 50 MP 3x Periskop + 50 MP UW", battery: 6000, has5G: true },
  { name: "Oppo Find X9 Pro", year: 2026, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Dimensity 9500 (Hasselblad Master 3.0)", screen: "6.8\" 2K 144Hz Quad-Curved OLED", camera: "50 MP 1\" OIS + 50 MP 3x Periskop + 50 MP 6x Periskop + 50 MP UW", battery: 6200, has5G: true },
  { name: "Oppo Find X9 Ultra", year: 2026, category: "flagship", price: 99999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Gen 5 (2nm / Dünyanın En İyisi)", screen: "6.85\" 2K+ 144Hz Titanyum Hasselblad Ultra", camera: "200 MP Periscope + 50 MP 1\" OIS + 50 MP 3x Tele + 50 MP UW", battery: 6400, has5G: true },
  { name: "Oppo Find N6", year: 2026, category: "foldable", price: 89999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5", screen: "8.1\" 2K+ 144Hz Ultra-Thin Glass Katlanabilir", camera: "50 MP Hasselblad + 50 MP 3x Periskop + 50 MP UW", battery: 5800, has5G: true },
  { name: "Oppo Reno16", year: 2026, category: "midrange", price: 32999, ram: 12, storage: 256, chipset: "Dimensity 8450 5G (IP69 / GenAI)", screen: "6.67\" 1.5K 144Hz AMOLED", camera: "50 MP OIS + 50 MP Tele + 12 MP UW", battery: 6000, has5G: true },
  { name: "Oppo Reno16 Pro", year: 2026, category: "midrange", price: 39999, ram: 16, storage: 512, chipset: "Dimensity 8450 5G (100W SuperVOOC)", screen: "6.8\" 1.5K 144Hz Quad-Curved AMOLED", camera: "50 MP OIS + 50 MP 3.5x Periskop + 12 MP UW", battery: 6200, has5G: true },
  { name: "Oppo A6 Pro", year: 2026, category: "budget", price: 12999, ram: 8, storage: 256, chipset: "Snapdragon 6s Gen 3 5G", screen: "6.7\" FHD+ 120Hz AMOLED (IP65)", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 5500, has5G: true },
  { name: "Oppo K15", year: 2026, category: "midrange", price: 14999, ram: 12, storage: 256, chipset: "Snapdragon 7+ Gen 3 5G (Oyun Odaklı)", screen: "6.7\" FHD+ 144Hz IPS LCD", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 6000, has5G: true }
];

const oppoImages = [
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
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

const generatedOppoPhones = oppoModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `oppo-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable';
  const rating = isFlagship ? Number((4.6 + (index % 4) * 0.1).toFixed(1)) : Number((4.2 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(110 + (index * 41) % 780);
  const image = oppoImages[index % oppoImages.length];

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
      sellerReviews: 13200,
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
      sellerReviews: 18400,
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
      sellerReviews: 14200,
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
      sellerReviews: 8900,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Oppo TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Oppo",
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
        resolution: isFlagship ? "3168 x 1440 px" : "2412 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2022 ? 120 : 90),
        ppi: isFlagship ? 510 : 394,
        brightnessNits: isFlagship ? 2800 : 1100
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2025 ? "3nm" : (m.year >= 2023 ? "4nm" : "6nm")),
        antutuScore: isFlagship ? 1880000 : 790000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR5X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: !isFlagship && !m.name.includes('Find')
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "16 MP",
        telephotoMp: isFlagship ? "50 MP Hasselblad 3x Periskop" : "Yok",
        selfieMp: isFlagship ? "32 MP Sony IMX709" : "16 MP",
        videoRes: isFlagship ? "4K @ 60fps Hasselblad" : "4K @ 30fps",
        dxomarkScore: isFlagship ? 157 : 120
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('80W') || m.chipset.includes('80W') ? 80 : (isFlagship ? 100 : 67),
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
        weightGrams: isFlagship ? 208 : 185,
        thicknessMm: 7.9,
        waterResistance: m.name.includes('IP69') ? "IP69 Yüksek Basınçlı Suya Dayanıklı" : (isFlagship ? "IP68 (1.5m 30dk)" : "IP54"),
        frameMaterial: isFlagship ? (m.name.includes('Seramik') ? "Seramik Kasa" : "Alüminyum") : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "ColorOS 16 (Android 16)" : (m.year >= 2024 ? "ColorOS 14 (Android 15)" : "ColorOS 13"),
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

// Remove any older Oppo phones that we are replacing with our exhaustive catalog
const nonOppoPhones = existingPhones.filter(p => p.brand !== 'Oppo');
const combinedPhones = [...nonOppoPhones, ...generatedOppoPhones];

console.log(`Generated ${generatedOppoPhones.length} comprehensive Oppo models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Oppo 2018-2026 models!");
