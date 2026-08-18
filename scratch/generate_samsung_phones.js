const fs = require('fs');
const path = require('path');

const samsungModels = [
  // --- 2018 ---
  { name: "Samsung Galaxy S9", year: 2018, category: "flagship", price: 7999, ram: 4, storage: 64, chipset: "Exynos 9810", screen: "5.8\" Quad HD+ Super AMOLED", camera: "12 MP Dual Aperture", battery: 3000, has5G: false },
  { name: "Samsung Galaxy S9+", year: 2018, category: "flagship", price: 9499, ram: 6, storage: 128, chipset: "Exynos 9810", screen: "6.2\" Quad HD+ Super AMOLED", camera: "12 MP + 12 MP Çift", battery: 3500, has5G: false },
  { name: "Samsung Galaxy Note 9", year: 2018, category: "flagship", price: 11999, ram: 8, storage: 512, chipset: "Exynos 9810", screen: "6.4\" Quad HD+ Super AMOLED (S-Pen)", camera: "12 MP + 12 MP Çift", battery: 4000, has5G: false },
  { name: "Samsung Galaxy A8 (2018)", year: 2018, category: "midrange", price: 3499, ram: 4, storage: 32, chipset: "Exynos 7885", screen: "5.6\" FHD+ Super AMOLED", camera: "16 MP", battery: 3000, has5G: false },
  { name: "Samsung Galaxy A8+ (2018)", year: 2018, category: "midrange", price: 3999, ram: 6, storage: 64, chipset: "Exynos 7885", screen: "6.0\" FHD+ Super AMOLED", camera: "16 MP", battery: 3500, has5G: false },
  { name: "Samsung Galaxy A7 (2018)", year: 2018, category: "midrange", price: 3299, ram: 4, storage: 64, chipset: "Exynos 7885", screen: "6.0\" FHD+ Super AMOLED", camera: "24 MP + 8 MP + 5 MP Üçlü", battery: 3300, has5G: false },
  { name: "Samsung Galaxy A6 (2018)", year: 2018, category: "budget", price: 2499, ram: 3, storage: 32, chipset: "Exynos 7870", screen: "5.6\" HD+ Super AMOLED", camera: "16 MP", battery: 3000, has5G: false },
  { name: "Samsung Galaxy A6+ (2018)", year: 2018, category: "midrange", price: 2999, ram: 4, storage: 64, chipset: "Snapdragon 450", screen: "6.0\" FHD+ Super AMOLED", camera: "16 MP + 5 MP Çift", battery: 3500, has5G: false },
  { name: "Samsung Galaxy A9 (2018)", year: 2018, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Snapdragon 660", screen: "6.3\" FHD+ Super AMOLED", camera: "24 MP + 10 MP + 8 MP + 5 MP Dörtlü", battery: 3800, has5G: false },
  { name: "Samsung Galaxy J4 (2018)", year: 2018, category: "budget", price: 1799, ram: 2, storage: 16, chipset: "Exynos 7570", screen: "5.5\" HD Super AMOLED", camera: "13 MP", battery: 3000, has5G: false },
  { name: "Samsung Galaxy J6 (2018)", year: 2018, category: "budget", price: 1999, ram: 3, storage: 32, chipset: "Exynos 7870", screen: "5.6\" HD+ Super AMOLED", camera: "13 MP", battery: 3000, has5G: false },
  { name: "Samsung Galaxy J8 (2018)", year: 2018, category: "budget", price: 2299, ram: 4, storage: 64, chipset: "Snapdragon 450", screen: "6.0\" HD+ Super AMOLED", camera: "16 MP + 5 MP Çift", battery: 3500, has5G: false },

  // --- 2019 ---
  { name: "Samsung Galaxy S10e", year: 2019, category: "flagship", price: 9999, ram: 6, storage: 128, chipset: "Exynos 9820", screen: "5.8\" Dynamic AMOLED", camera: "12 MP + 16 MP Çift", battery: 3100, has5G: false },
  { name: "Samsung Galaxy S10", year: 2019, category: "flagship", price: 12499, ram: 8, storage: 128, chipset: "Exynos 9820", screen: "6.1\" Quad HD+ Dynamic AMOLED", camera: "12 MP + 12 MP + 16 MP Üçlü", battery: 3400, has5G: false },
  { name: "Samsung Galaxy S10+", year: 2019, category: "flagship", price: 14999, ram: 8, storage: 512, chipset: "Exynos 9820", screen: "6.4\" Quad HD+ Dynamic AMOLED", camera: "12 MP + 12 MP + 16 MP Üçlü", battery: 4100, has5G: false },
  { name: "Samsung Galaxy S10 5G", year: 2019, category: "flagship", price: 16999, ram: 8, storage: 256, chipset: "Exynos 9820 5G", screen: "6.7\" Quad HD+ Dynamic AMOLED", camera: "12 MP + 12 MP + 16 MP + TOF 3D", battery: 4500, has5G: true },
  { name: "Samsung Galaxy Note 10", year: 2019, category: "flagship", price: 15999, ram: 8, storage: 256, chipset: "Exynos 9825", screen: "6.3\" FHD+ Dynamic AMOLED (S-Pen)", camera: "12 MP + 12 MP + 16 MP Üçlü", battery: 3500, has5G: false },
  { name: "Samsung Galaxy Note 10+", year: 2019, category: "flagship", price: 18999, ram: 12, storage: 512, chipset: "Exynos 9825", screen: "6.8\" Quad HD+ Dynamic AMOLED (S-Pen)", camera: "12 MP + 12 MP + 16 MP + TOF 3D", battery: 4300, has5G: false },
  { name: "Samsung Galaxy Fold", year: 2019, category: "foldable", price: 29999, ram: 12, storage: 512, chipset: "Snapdragon 855", screen: "7.3\" QXGA+ Katlanabilir Dynamic AMOLED", camera: "12 MP + 12 MP + 16 MP Üçlü", battery: 4380, has5G: true },
  { name: "Samsung Galaxy A10", year: 2019, category: "budget", price: 1999, ram: 2, storage: 32, chipset: "Exynos 7884", screen: "6.2\" HD+ IPS LCD", camera: "13 MP", battery: 3400, has5G: false },
  { name: "Samsung Galaxy A20", year: 2019, category: "budget", price: 2499, ram: 3, storage: 32, chipset: "Exynos 7884", screen: "6.4\" HD+ Super AMOLED", camera: "13 MP + 5 MP Çift", battery: 4000, has5G: false },
  { name: "Samsung Galaxy A30", year: 2019, category: "midrange", price: 2999, ram: 4, storage: 64, chipset: "Exynos 7904", screen: "6.4\" FHD+ Super AMOLED", camera: "16 MP + 5 MP Çift", battery: 4000, has5G: false },
  { name: "Samsung Galaxy A40", year: 2019, category: "midrange", price: 3299, ram: 4, storage: 64, chipset: "Exynos 7904", screen: "5.9\" FHD+ Super AMOLED", camera: "16 MP + 5 MP Çift", battery: 3100, has5G: false },
  { name: "Samsung Galaxy A50", year: 2019, category: "midrange", price: 3999, ram: 6, storage: 128, chipset: "Exynos 9610", screen: "6.4\" FHD+ Super AMOLED", camera: "25 MP + 8 MP + 5 MP Üçlü", battery: 4000, has5G: false },
  { name: "Samsung Galaxy A60", year: 2019, category: "midrange", price: 4299, ram: 6, storage: 128, chipset: "Snapdragon 675", screen: "6.3\" FHD+ TFT LCD", camera: "32 MP + 8 MP + 5 MP Üçlü", battery: 3500, has5G: false },
  { name: "Samsung Galaxy A70", year: 2019, category: "midrange", price: 4999, ram: 6, storage: 128, chipset: "Snapdragon 675", screen: "6.7\" FHD+ Super AMOLED", camera: "32 MP + 8 MP + 5 MP Üçlü", battery: 4500, has5G: false },
  { name: "Samsung Galaxy A80", year: 2019, category: "midrange", price: 6499, ram: 8, storage: 128, chipset: "Snapdragon 730G", screen: "6.7\" FHD+ Döner Kameralı New Infinity AMOLED", camera: "48 MP + 8 MP + TOF Döner Kamera", battery: 3700, has5G: false },
  { name: "Samsung Galaxy A90 5G", year: 2019, category: "flagship", price: 8499, ram: 8, storage: 128, chipset: "Snapdragon 855", screen: "6.7\" FHD+ Super AMOLED", camera: "48 MP + 8 MP + 5 MP Üçlü", battery: 4500, has5G: true },
  { name: "Samsung Galaxy M10", year: 2019, category: "budget", price: 1799, ram: 3, storage: 32, chipset: "Exynos 7870", screen: "6.22\" HD+ PLS TFT", camera: "13 MP + 5 MP Çift", battery: 3400, has5G: false },
  { name: "Samsung Galaxy M20", year: 2019, category: "budget", price: 2199, ram: 4, storage: 64, chipset: "Exynos 7904", screen: "6.3\" FHD+ PLS TFT", camera: "13 MP + 5 MP Çift", battery: 5000, has5G: false },
  { name: "Samsung Galaxy M30", year: 2019, category: "midrange", price: 2799, ram: 4, storage: 64, chipset: "Exynos 7904", screen: "6.4\" FHD+ Super AMOLED", camera: "13 MP + 5 MP + 5 MP Üçlü", battery: 5000, has5G: false },

  // --- 2020 ---
  { name: "Samsung Galaxy S20", year: 2020, category: "flagship", price: 14999, ram: 8, storage: 128, chipset: "Exynos 990", screen: "6.2\" Quad HD+ 120Hz Dynamic AMOLED 2X", camera: "64 MP + 12 MP + 12 MP Üçlü", battery: 4000, has5G: false },
  { name: "Samsung Galaxy S20+", year: 2020, category: "flagship", price: 17999, ram: 8, storage: 128, chipset: "Exynos 990", screen: "6.7\" Quad HD+ 120Hz Dynamic AMOLED 2X", camera: "64 MP + 12 MP + 12 MP + TOF", battery: 4500, has5G: false },
  { name: "Samsung Galaxy S20 Ultra", year: 2020, category: "flagship", price: 22999, ram: 12, storage: 128, chipset: "Exynos 990", screen: "6.9\" Quad HD+ 120Hz Dynamic AMOLED 2X", camera: "108 MP 100x Space Zoom + 48 MP + 12 MP", battery: 5000, has5G: true },
  { name: "Samsung Galaxy S20 FE", year: 2020, category: "flagship", price: 12999, ram: 8, storage: 128, chipset: "Snapdragon 865", screen: "6.5\" FHD+ 120Hz Super AMOLED", camera: "12 MP + 12 MP + 8 MP Üçlü", battery: 4500, has5G: true },
  { name: "Samsung Galaxy Note 20", year: 2020, category: "flagship", price: 18999, ram: 8, storage: 256, chipset: "Exynos 990", screen: "6.7\" FHD+ Super AMOLED Plus (S-Pen)", camera: "64 MP + 12 MP + 12 MP Üçlü", battery: 4300, has5G: false },
  { name: "Samsung Galaxy Note 20 Ultra", year: 2020, category: "flagship", price: 24999, ram: 12, storage: 256, chipset: "Exynos 990", screen: "6.9\" Quad HD+ 120Hz Dynamic AMOLED 2X (S-Pen 9ms)", camera: "108 MP Laser AF + 12 MP + 12 MP", battery: 4500, has5G: true },
  { name: "Samsung Galaxy Z Flip", year: 2020, category: "foldable", price: 19999, ram: 8, storage: 256, chipset: "Snapdragon 855+", screen: "6.7\" FHD+ Katlanabilir Dynamic AMOLED", camera: "12 MP + 12 MP Çift", battery: 3300, has5G: false },
  { name: "Samsung Galaxy Z Fold 2", year: 2020, category: "foldable", price: 34999, ram: 12, storage: 256, chipset: "Snapdragon 865+", screen: "7.6\" QXGA+ 120Hz Katlanabilir Dynamic AMOLED 2X", camera: "12 MP + 12 MP + 12 MP Üçlü", battery: 4500, has5G: true },
  { name: "Samsung Galaxy A11", year: 2020, category: "budget", price: 2499, ram: 3, storage: 32, chipset: "Snapdragon 450", screen: "6.4\" HD+ PLS TFT", camera: "13 MP + 5 MP + 2 MP Üçlü", battery: 4000, has5G: false },
  { name: "Samsung Galaxy A21s", year: 2020, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Exynos 850", screen: "6.5\" HD+ PLS TFT", camera: "48 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A31", year: 2020, category: "midrange", price: 3499, ram: 4, storage: 128, chipset: "Helio P65", screen: "6.4\" FHD+ Super AMOLED", camera: "48 MP + 8 MP + 5 MP + 5 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A41", year: 2020, category: "midrange", price: 3799, ram: 4, storage: 64, chipset: "Helio P65", screen: "6.1\" FHD+ Super AMOLED", camera: "48 MP + 8 MP + 5 MP Üçlü", battery: 3500, has5G: false },
  { name: "Samsung Galaxy A51", year: 2020, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Exynos 9611", screen: "6.5\" FHD+ Super AMOLED", camera: "48 MP + 12 MP + 5 MP + 5 MP Dörtlü", battery: 4000, has5G: false },
  { name: "Samsung Galaxy A71", year: 2020, category: "midrange", price: 5499, ram: 8, storage: 128, chipset: "Snapdragon 730", screen: "6.7\" FHD+ Super AMOLED Plus", camera: "64 MP + 12 MP + 5 MP + 5 MP Dörtlü", battery: 4500, has5G: false },
  { name: "Samsung Galaxy M11", year: 2020, category: "budget", price: 2199, ram: 3, storage: 32, chipset: "Snapdragon 450", screen: "6.4\" HD+ PLS TFT", camera: "13 MP + 5 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy M21", year: 2020, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Exynos 9611", screen: "6.4\" FHD+ Super AMOLED", camera: "48 MP + 8 MP + 5 MP Üçlü", battery: 6000, has5G: false },
  { name: "Samsung Galaxy M31", year: 2020, category: "midrange", price: 3299, ram: 6, storage: 128, chipset: "Exynos 9611", screen: "6.4\" FHD+ Super AMOLED", camera: "64 MP + 8 MP + 5 MP + 5 MP Dörtlü", battery: 6000, has5G: false },
  { name: "Samsung Galaxy M51", year: 2020, category: "midrange", price: 4499, ram: 8, storage: 128, chipset: "Snapdragon 730G", screen: "6.7\" FHD+ Super AMOLED Plus", camera: "64 MP + 12 MP + 5 MP + 5 MP Dörtlü", battery: 7000, has5G: false },

  // --- 2021 ---
  { name: "Samsung Galaxy S21", year: 2021, category: "flagship", price: 18999, ram: 8, storage: 128, chipset: "Exynos 2100", screen: "6.2\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "64 MP + 12 MP + 12 MP Üçlü", battery: 4000, has5G: true },
  { name: "Samsung Galaxy S21+", year: 2021, category: "flagship", price: 22999, ram: 8, storage: 256, chipset: "Exynos 2100", screen: "6.7\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "64 MP + 12 MP + 12 MP Üçlü", battery: 4800, has5G: true },
  { name: "Samsung Galaxy S21 Ultra", year: 2021, category: "flagship", price: 29999, ram: 12, storage: 256, chipset: "Exynos 2100", screen: "6.8\" Quad HD+ 120Hz Dynamic AMOLED 2X", camera: "108 MP Pro + 10 MP 10x Optik + 10 MP 3x + 12 MP", battery: 5000, has5G: true },
  { name: "Samsung Galaxy S21 FE", year: 2021, category: "flagship", price: 15999, ram: 8, storage: 128, chipset: "Exynos 2100", screen: "6.4\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "12 MP + 12 MP + 8 MP Üçlü", battery: 4500, has5G: true },
  { name: "Samsung Galaxy Z Flip 3", year: 2021, category: "foldable", price: 22999, ram: 8, storage: 128, chipset: "Snapdragon 888", screen: "6.7\" FHD+ 120Hz Dynamic AMOLED 2X Katlanabilir", camera: "12 MP + 12 MP Çift", battery: 3300, has5G: true },
  { name: "Samsung Galaxy Z Fold 3", year: 2021, category: "foldable", price: 39999, ram: 12, storage: 256, chipset: "Snapdragon 888", screen: "7.6\" QXGA+ 120Hz Ekran Altı Kameralı Katlanabilir", camera: "12 MP + 12 MP + 12 MP Üçlü", battery: 4400, has5G: true },
  { name: "Samsung Galaxy A02", year: 2021, category: "budget", price: 2299, ram: 3, storage: 32, chipset: "MT6739", screen: "6.5\" HD+ PLS TFT", camera: "13 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A12", year: 2021, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Helio P35", screen: "6.5\" HD+ PLS TFT", camera: "48 MP + 5 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A22", year: 2021, category: "budget", price: 3799, ram: 4, storage: 128, chipset: "Helio G80", screen: "6.4\" HD+ 90Hz Super AMOLED", camera: "48 MP OIS + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A32", year: 2021, category: "midrange", price: 4499, ram: 6, storage: 128, chipset: "Helio G80", screen: "6.4\" FHD+ 90Hz Super AMOLED", camera: "64 MP + 8 MP + 5 MP + 5 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A52", year: 2021, category: "midrange", price: 5999, ram: 8, storage: 128, chipset: "Snapdragon 720G", screen: "6.5\" FHD+ 90Hz Super AMOLED (IP67)", camera: "64 MP OIS + 12 MP + 5 MP + 5 MP Dörtlü", battery: 4500, has5G: false },
  { name: "Samsung Galaxy A52s 5G", year: 2021, category: "midrange", price: 6999, ram: 8, storage: 128, chipset: "Snapdragon 778G 5G", screen: "6.5\" FHD+ 120Hz Super AMOLED (IP67)", camera: "64 MP OIS + 12 MP + 5 MP + 5 MP Dörtlü", battery: 4500, has5G: true },
  { name: "Samsung Galaxy A72", year: 2021, category: "midrange", price: 7499, ram: 8, storage: 128, chipset: "Snapdragon 720G", screen: "6.7\" FHD+ 90Hz Super AMOLED (3x Telephoto)", camera: "64 MP OIS + 12 MP + 8 MP 3x + 5 MP", battery: 5000, has5G: false },
  { name: "Samsung Galaxy M12", year: 2021, category: "budget", price: 2799, ram: 4, storage: 64, chipset: "Exynos 850", screen: "6.5\" HD+ 90Hz PLS TFT", camera: "48 MP + 5 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy M32", year: 2021, category: "midrange", price: 3999, ram: 6, storage: 128, chipset: "Helio G80", screen: "6.4\" FHD+ 90Hz Super AMOLED", camera: "64 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy M52 5G", year: 2021, category: "midrange", price: 5499, ram: 8, storage: 128, chipset: "Snapdragon 778G 5G", screen: "6.7\" FHD+ 120Hz Super AMOLED Plus", camera: "64 MP + 12 MP + 5 MP Üçlü", battery: 5000, has5G: true },

  // --- 2022 ---
  { name: "Samsung Galaxy S22", year: 2022, category: "flagship", price: 23999, ram: 8, storage: 128, chipset: "Snapdragon 8 Gen 1", screen: "6.1\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 3700, has5G: true },
  { name: "Samsung Galaxy S22+", year: 2022, category: "flagship", price: 28999, ram: 8, storage: 256, chipset: "Snapdragon 8 Gen 1", screen: "6.6\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4500, has5G: true },
  { name: "Samsung Galaxy S22 Ultra", year: 2022, category: "flagship", price: 37999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1", screen: "6.8\" Quad HD+ 120Hz Dynamic AMOLED 2X (Dahili S-Pen)", camera: "108 MP Nightography + 10 MP 10x + 10 MP 3x + 12 MP", battery: 5000, has5G: true },
  { name: "Samsung Galaxy Z Flip 4", year: 2022, category: "foldable", price: 27999, ram: 8, storage: 256, chipset: "Snapdragon 8+ Gen 1", screen: "6.7\" FHD+ 120Hz Dynamic AMOLED 2X Katlanabilir", camera: "12 MP OIS + 12 MP Çift", battery: 3700, has5G: true },
  { name: "Samsung Galaxy Z Fold 4", year: 2022, category: "foldable", price: 47999, ram: 12, storage: 256, chipset: "Snapdragon 8+ Gen 1", screen: "7.6\" QXGA+ 120Hz Katlanabilir Dynamic AMOLED 2X", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4400, has5G: true },
  { name: "Samsung Galaxy A13", year: 2022, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Exynos 850", screen: "6.6\" FHD+ PLS TFT", camera: "50 MP + 5 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A23", year: 2022, category: "budget", price: 5499, ram: 4, storage: 128, chipset: "Snapdragon 680", screen: "6.6\" FHD+ 90Hz PLS TFT", camera: "50 MP OIS + 5 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A33 5G", year: 2022, category: "midrange", price: 7499, ram: 6, storage: 128, chipset: "Exynos 1280", screen: "6.4\" FHD+ 90Hz Super AMOLED (IP67)", camera: "48 MP OIS + 8 MP + 5 MP + 2 MP Dörtlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A53 5G", year: 2022, category: "midrange", price: 9499, ram: 8, storage: 128, chipset: "Exynos 1280", screen: "6.5\" FHD+ 120Hz Super AMOLED (IP67)", camera: "64 MP OIS + 12 MP + 5 MP + 5 MP Dörtlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A73 5G", year: 2022, category: "midrange", price: 12999, ram: 8, storage: 128, chipset: "Snapdragon 778G 5G", screen: "6.7\" FHD+ 120Hz Super AMOLED Plus (IP67)", camera: "108 MP OIS + 12 MP + 5 MP + 5 MP Dörtlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy M13", year: 2022, category: "budget", price: 3999, ram: 4, storage: 64, chipset: "Exynos 850", screen: "6.6\" FHD+ PLS TFT", camera: "50 MP + 5 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy M23 5G", year: 2022, category: "budget", price: 5299, ram: 4, storage: 128, chipset: "Snapdragon 750G 5G", screen: "6.6\" FHD+ 120Hz TFT LCD", camera: "50 MP + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy M33 5G", year: 2022, category: "midrange", price: 6499, ram: 6, storage: 128, chipset: "Exynos 1280", screen: "6.6\" FHD+ 120Hz TFT LCD", camera: "50 MP + 5 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy M53 5G", year: 2022, category: "midrange", price: 8999, ram: 8, storage: 128, chipset: "Dimensity 900 5G", screen: "6.7\" FHD+ 120Hz Super AMOLED Plus", camera: "108 MP + 8 MP + 2 MP + 2 MP Dörtlü", battery: 5000, has5G: true },

  // --- 2023 ---
  { name: "Samsung Galaxy S23", year: 2023, category: "flagship", price: 29999, ram: 8, storage: 128, chipset: "Snapdragon 8 Gen 2 for Galaxy", screen: "6.1\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 3900, has5G: true },
  { name: "Samsung Galaxy S23+", year: 2023, category: "flagship", price: 36999, ram: 8, storage: 256, chipset: "Snapdragon 8 Gen 2 for Galaxy", screen: "6.6\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4700, has5G: true },
  { name: "Samsung Galaxy S23 Ultra", year: 2023, category: "flagship", price: 47999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 2 for Galaxy", screen: "6.8\" Quad HD+ 120Hz Dynamic AMOLED 2X (200MP)", camera: "200 MP HP2 + 10 MP 10x + 10 MP 3x + 12 MP", battery: 5000, has5G: true },
  { name: "Samsung Galaxy S23 FE", year: 2023, category: "flagship", price: 23999, ram: 8, storage: 128, chipset: "Exynos 2200", screen: "6.4\" FHD+ 120Hz Dynamic AMOLED 2X", camera: "50 MP OIS + 8 MP 3x + 12 MP Üçlü", battery: 4500, has5G: true },
  { name: "Samsung Galaxy Z Flip 5", year: 2023, category: "foldable", price: 37999, ram: 8, storage: 256, chipset: "Snapdragon 8 Gen 2 for Galaxy", screen: "6.7\" FHD+ 120Hz Flex Window Katlanabilir", camera: "12 MP OIS + 12 MP Çift", battery: 3700, has5G: true },
  { name: "Samsung Galaxy Z Fold 5", year: 2023, category: "foldable", price: 59999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 2 for Galaxy", screen: "7.6\" QXGA+ 120Hz Flex Hinge Katlanabilir", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4400, has5G: true },
  { name: "Samsung Galaxy A14", year: 2023, category: "budget", price: 5999, ram: 4, storage: 64, chipset: "Helio G80 / Exynos 850", screen: "6.6\" FHD+ PLS LCD", camera: "50 MP + 5 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A24", year: 2023, category: "budget", price: 7499, ram: 6, storage: 128, chipset: "Helio G99", screen: "6.5\" FHD+ 90Hz Super AMOLED", camera: "50 MP OIS + 5 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A34 5G", year: 2023, category: "midrange", price: 10999, ram: 8, storage: 128, chipset: "Dimensity 1080 5G", screen: "6.6\" FHD+ 120Hz Super AMOLED (IP67)", camera: "48 MP OIS + 8 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A54 5G", year: 2023, category: "midrange", price: 14999, ram: 8, storage: 128, chipset: "Exynos 1380", screen: "6.4\" FHD+ 120Hz Cam Arka Super AMOLED (IP67)", camera: "50 MP OIS (Flagship Sensor) + 12 MP + 5 MP", battery: 5000, has5G: true },
  { name: "Samsung Galaxy M14 5G", year: 2023, category: "budget", price: 6299, ram: 4, storage: 128, chipset: "Exynos 1330 5G", screen: "6.6\" FHD+ 90Hz PLS LCD", camera: "50 MP + 2 MP + 2 MP Üçlü", battery: 6000, has5G: true },
  { name: "Samsung Galaxy M34 5G", year: 2023, category: "midrange", price: 8999, ram: 6, storage: 128, chipset: "Exynos 1280", screen: "6.5\" FHD+ 120Hz Super AMOLED", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 6000, has5G: true },
  { name: "Samsung Galaxy M54 5G", year: 2023, category: "midrange", price: 13499, ram: 8, storage: 256, chipset: "Exynos 1380", screen: "6.7\" FHD+ 120Hz Super AMOLED Plus", camera: "108 MP OIS + 8 MP + 2 MP Üçlü", battery: 6000, has5G: true },

  // --- 2024 ---
  { name: "Samsung Galaxy S24", year: 2024, category: "flagship", price: 38999, ram: 8, storage: 128, chipset: "Exynos 2400 / Snapdragon 8 Gen 3", screen: "6.2\" FHD+ 1-120Hz LTPO Dynamic AMOLED 2X (Galaxy AI)", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4000, has5G: true },
  { name: "Samsung Galaxy S24+", year: 2024, category: "flagship", price: 45999, ram: 12, storage: 256, chipset: "Exynos 2400", screen: "6.7\" QHD+ 1-120Hz LTPO Dynamic AMOLED 2X (Galaxy AI)", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4900, has5G: true },
  { name: "Samsung Galaxy S24 Ultra", year: 2024, category: "flagship", price: 64999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 3 for Galaxy", screen: "6.8\" QHD+ 120Hz Titanyum Gorilla Armor (Galaxy AI)", camera: "200 MP + 50 MP 5x Periscope + 10 MP 3x + 12 MP", battery: 5000, has5G: true },
  { name: "Samsung Galaxy S24 FE", year: 2024, category: "flagship", price: 29999, ram: 8, storage: 256, chipset: "Exynos 2400e", screen: "6.7\" FHD+ 120Hz Dynamic AMOLED 2X (Galaxy AI)", camera: "50 MP OIS + 8 MP 3x + 12 MP Üçlü", battery: 4700, has5G: true },
  { name: "Samsung Galaxy Z Flip 6", year: 2024, category: "foldable", price: 49999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 3 for Galaxy", screen: "6.7\" FHD+ 120Hz Flex Window 50MP Kamera (Galaxy AI)", camera: "50 MP OIS + 12 MP Çift", battery: 4000, has5G: true },
  { name: "Samsung Galaxy Z Fold 6", year: 2024, category: "foldable", price: 74999, ram: 12, storage: 512, chipset: "Snapdragon 8 Gen 3 for Galaxy", screen: "7.6\" QXGA+ 120Hz İnce Alüminyum Gövde (Galaxy AI)", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4400, has5G: true },
  { name: "Samsung Galaxy A05", year: 2024, category: "budget", price: 4999, ram: 4, storage: 64, chipset: "Helio G85", screen: "6.7\" HD+ PLS LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A15", year: 2024, category: "budget", price: 7299, ram: 6, storage: 128, chipset: "Helio G99 / Dimensity 6100+", screen: "6.5\" FHD+ 90Hz Super AMOLED", camera: "50 MP + 5 MP + 2 MP Üçlü", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A25 5G", year: 2024, category: "midrange", price: 9999, ram: 6, storage: 128, chipset: "Exynos 1280", screen: "6.5\" FHD+ 120Hz Super AMOLED", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A35 5G", year: 2024, category: "midrange", price: 13999, ram: 8, storage: 128, chipset: "Exynos 1380", screen: "6.6\" FHD+ 120Hz Super AMOLED (Knox Vault)", camera: "50 MP OIS + 8 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A55 5G", year: 2024, category: "midrange", price: 17999, ram: 8, storage: 256, chipset: "Exynos 1480 (AMD Xclipse 530 GPU)", screen: "6.6\" FHD+ 120Hz Metal Çerçeve Super AMOLED", camera: "50 MP OIS + 12 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy M15 5G", year: 2024, category: "budget", price: 7999, ram: 4, storage: 128, chipset: "Dimensity 6100+ 5G", screen: "6.5\" FHD+ 90Hz Super AMOLED", camera: "50 MP + 5 MP + 2 MP Üçlü", battery: 6000, has5G: true },
  { name: "Samsung Galaxy M35 5G", year: 2024, category: "midrange", price: 11499, ram: 6, storage: 128, chipset: "Exynos 1380", screen: "6.6\" FHD+ 120Hz Super AMOLED", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 6000, has5G: true },
  { name: "Samsung Galaxy M55 5G", year: 2024, category: "midrange", price: 15499, ram: 8, storage: 256, chipset: "Snapdragon 7 Gen 1 5G", screen: "6.7\" FHD+ 120Hz Super AMOLED Plus 45W", camera: "50 MP OIS + 8 MP + 2 MP (50MP Selfie)", battery: 5000, has5G: true },

  // --- 2025 ---
  { name: "Samsung Galaxy S25", year: 2025, category: "flagship", price: 46999, ram: 12, storage: 128, chipset: "Snapdragon 8 Elite for Galaxy", screen: "6.2\" QHD+ 1-120Hz Dynamic AMOLED 2X (Galaxy AI 2.0)", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4000, has5G: true },
  { name: "Samsung Galaxy S25+", year: 2025, category: "flagship", price: 54999, ram: 12, storage: 256, chipset: "Snapdragon 8 Elite for Galaxy", screen: "6.7\" QHD+ 1-120Hz Dynamic AMOLED 2X (Galaxy AI 2.0)", camera: "50 MP OIS + 10 MP 3x + 12 MP Üçlü", battery: 4900, has5G: true },
  { name: "Samsung Galaxy S25 Ultra", year: 2025, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite for Galaxy (3nm)", screen: "6.9\" QHD+ 120Hz Titanyum Yuvarlatılmış Kasa (Galaxy AI)", camera: "200 MP HP2 + 50 MP 5x + 50 MP UltraWide + 10 MP 3x", battery: 5000, has5G: true },
  { name: "Samsung Galaxy S25 FE", year: 2025, category: "flagship", price: 34999, ram: 12, storage: 256, chipset: "Exynos 2500 / Snapdragon 8s Gen 3", screen: "6.7\" FHD+ 120Hz Dynamic AMOLED 2X (Galaxy AI)", camera: "50 MP OIS + 12 MP 3x + 12 MP Üçlü", battery: 4800, has5G: true },
  { name: "Samsung Galaxy Z Flip 7", year: 2025, category: "foldable", price: 59999, ram: 12, storage: 256, chipset: "Snapdragon 8 Elite for Galaxy", screen: "6.8\" Full Cover Flex Window Katlanabilir", camera: "50 MP OIS + 50 MP Ultrawide Çift", battery: 4300, has5G: true },
  { name: "Samsung Galaxy Z Fold 7", year: 2025, category: "foldable", price: 89999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite for Galaxy", screen: "8.0\" QXGA+ 120Hz Ultra Thin Glass Katlanabilir", camera: "200 MP OIS + 50 MP 5x + 12 MP Üçlü", battery: 4600, has5G: true },
  { name: "Samsung Galaxy A06", year: 2025, category: "budget", price: 5999, ram: 4, storage: 64, chipset: "Helio G85", screen: "6.7\" HD+ 90Hz PLS LCD", camera: "50 MP + 2 MP Çift", battery: 5000, has5G: false },
  { name: "Samsung Galaxy A16 5G", year: 2025, category: "budget", price: 8999, ram: 6, storage: 128, chipset: "Exynos 1330 / Dimensity 6300 5G", screen: "6.7\" FHD+ 90Hz Super AMOLED (6 Yıl Güncelleme)", camera: "50 MP + 5 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A26 5G", year: 2025, category: "midrange", price: 11999, ram: 6, storage: 128, chipset: "Exynos 1280 5G", screen: "6.6\" FHD+ 120Hz Super AMOLED", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A36 5G", year: 2025, category: "midrange", price: 15999, ram: 8, storage: 128, chipset: "Snapdragon 6 Gen 3 5G", screen: "6.6\" FHD+ 120Hz Super AMOLED (Punch Hole)", camera: "50 MP OIS + 8 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A56 5G", year: 2025, category: "midrange", price: 21999, ram: 8, storage: 256, chipset: "Exynos 1580 (AMD RDNA3 GPU) 45W", screen: "6.7\" FHD+ 120Hz Metal Çerçeve Super AMOLED", camera: "50 MP OIS + 12 MP + 5 MP Üçlü", battery: 5000, has5G: true },

  // --- 2026 ---
  { name: "Samsung Galaxy S26", year: 2026, category: "flagship", price: 54999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 5 for Galaxy", screen: "6.2\" QHD+ 1-120Hz LTPO OLED 3.0 (Galaxy AI 3.0)", camera: "50 MP OIS + 12 MP 3x + 12 MP Üçlü", battery: 4200, has5G: true },
  { name: "Samsung Galaxy S26+", year: 2026, category: "flagship", price: 64999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 5 for Galaxy", screen: "6.7\" QHD+ 1-120Hz LTPO OLED 3.0 (Galaxy AI 3.0)", camera: "50 MP OIS + 12 MP 3x + 12 MP Üçlü", battery: 5100, has5G: true },
  { name: "Samsung Galaxy S26 Ultra", year: 2026, category: "flagship", price: 92999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 for Galaxy (2nm)", screen: "6.9\" QHD+ 144Hz Titanyum Armor 2.0 (Galaxy AI 3.0)", camera: "200 MP ISOCELL HP3 + 50 MP 10x + 50 MP 3x + 50 MP UltraWide", battery: 5200, has5G: true },
  { name: "Samsung Galaxy Z Flip 8", year: 2026, category: "foldable", price: 69999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 5 for Galaxy", screen: "6.85\" Zero-Crease Flex Window OLED", camera: "50 MP OIS + 50 MP Ultrawide Çift", battery: 4400, has5G: true },
  { name: "Samsung Galaxy Z Fold 8", year: 2026, category: "foldable", price: 99999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 for Galaxy", screen: "8.1\" Ultra-Thin Flexible OLED (Dahili S-Pen)", camera: "200 MP OIS + 50 MP 5x + 50 MP UltraWide", battery: 4800, has5G: true },
  { name: "Samsung Galaxy Z Fold 8 Ultra", year: 2026, category: "foldable", price: 119999, ram: 16, storage: 1024, chipset: "Snapdragon 8 Gen 5 for Galaxy", screen: "8.3\" Titanyum Çerçeve Katlanabilir OLED", camera: "200 MP Periscope + 50 MP + 50 MP + TOF", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A17 5G", year: 2026, category: "budget", price: 9999, ram: 6, storage: 128, chipset: "Exynos 1380 5G", screen: "6.7\" FHD+ 90Hz Super AMOLED (6 Yıl Güncelleme)", camera: "50 MP OIS + 5 MP + 2 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A37 5G", year: 2026, category: "midrange", price: 17999, ram: 8, storage: 128, chipset: "Snapdragon 7s Gen 3 5G", screen: "6.6\" FHD+ 120Hz Super AMOLED (IP67)", camera: "50 MP OIS + 12 MP + 5 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy A57 5G", year: 2026, category: "midrange", price: 24999, ram: 12, storage: 256, chipset: "Exynos 1680 5G 45W", screen: "6.7\" FHD+ 120Hz Metal Çerçeve Super AMOLED", camera: "50 MP OIS (Flagship Sensor) + 12 MP + 8 MP Üçlü", battery: 5000, has5G: true },
  { name: "Samsung Galaxy M17 5G", year: 2026, category: "budget", price: 8999, ram: 6, storage: 128, chipset: "Dimensity 6300+ 5G", screen: "6.6\" FHD+ 90Hz Super AMOLED", camera: "50 MP + 5 MP + 2 MP Üçlü", battery: 6000, has5G: true },
  { name: "Samsung Galaxy M37 5G", year: 2026, category: "midrange", price: 13999, ram: 8, storage: 128, chipset: "Exynos 1480 5G", screen: "6.6\" FHD+ 120Hz Super AMOLED", camera: "50 MP OIS + 8 MP + 2 MP Üçlü", battery: 6000, has5G: true },
  { name: "Samsung Galaxy M57 5G", year: 2026, category: "midrange", price: 18999, ram: 8, storage: 256, chipset: "Snapdragon 7+ Gen 3 5G", screen: "6.7\" FHD+ 120Hz Super AMOLED Plus 45W", camera: "50 MP OIS + 12 MP + 5 MP Üçlü", battery: 6000, has5G: true }
];

const samsungImages = [
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80"
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

const generatedSamsungPhones = samsungModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `samsung-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable';
  const rating = isFlagship ? Number((4.6 + (index % 4) * 0.1).toFixed(1)) : Number((4.2 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(120 + (index * 47) % 850);
  const image = samsungImages[index % samsungImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-sam-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 14500,
      url: '#'
    },
    {
      id: `st-ty-sam-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 21000,
      url: '#'
    },
    {
      id: `st-vt-sam-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 18000,
      url: '#'
    },
    {
      id: `st-mm-sam-${index}`,
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
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Samsung TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Samsung",
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
        size: m.screen.split(' ')[0] || "6.5\"",
        type: m.screen,
        resolution: isFlagship ? "3080 x 1440 px" : "2340 x 1080 px",
        refreshRate: isFlagship || m.year >= 2024 ? 120 : (m.year >= 2021 ? 90 : 60),
        ppi: isFlagship ? 500 : 390,
        brightnessNits: isFlagship ? 2600 : 1000
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm" : (m.year >= 2025 ? "3nm" : (m.year >= 2023 ? "4nm" : "5nm")),
        antutuScore: isFlagship ? 1850000 : 750000
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
        telephotoMp: isFlagship ? "50 MP (5x Optik Zoom)" : "Yok",
        selfieMp: isFlagship ? "12 MP Dual Pixel" : "13 MP",
        videoRes: isFlagship ? "8K @ 30fps" : "4K @ 30fps",
        dxomarkScore: isFlagship ? 154 : 118
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: isFlagship ? 45 : 25,
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
        weightGrams: isFlagship ? 219 : 185,
        thicknessMm: 7.9,
        waterResistance: isFlagship ? "IP68 (1.5m 30dk)" : (m.year >= 2022 && m.name.includes('A5') ? "IP67" : "Yok"),
        frameMaterial: isFlagship ? (m.name.includes('Ultra') ? "Titanyum" : "Zırh Alüminyum") : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2026 ? "Android 16 (One UI 8.0)" : (m.year >= 2025 ? "Android 15 (One UI 7.0)" : "Android 14 (One UI 6.1)"),
        updateYears: m.year >= 2024 ? 7 : 4
      }
    }
  };
});

// Read existing mockData.ts
const mockDataPath = path.join(__dirname, '../src/lib/mockData.ts');
let fileContent = fs.readFileSync(mockDataPath, 'utf-8');

// Parse non-samsung existing smartphones from mockData.ts
// Or load the existing array
const existingPhonesMatch = fileContent.match(/export const mockSmartphones: Smartphone\[\] = (\[[\s\S]*?\]);/);

if (!existingPhonesMatch) {
  console.error("Could not match mockSmartphones array in mockData.ts!");
  process.exit(1);
}

const existingPhones = JSON.parse(existingPhonesMatch[1]);
console.log(`Current phone count in mockData.ts: ${existingPhones.length}`);

// Remove any older mock Samsung phones that we are replacing with our exhaustive catalog
const nonSamsungPhones = existingPhones.filter(p => p.brand !== 'Samsung');
const combinedPhones = [...nonSamsungPhones, ...generatedSamsungPhones];

console.log(`Generated ${generatedSamsungPhones.length} comprehensive Samsung Galaxy models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Samsung Galaxy 2018-2026 models!");
