const fs = require('fs');
const path = require('path');

const huaweiModels = [
  // --- 2018 ---
  { name: "Huawei Mate 20", year: 2018, category: "flagship", price: 5999, ram: 6, storage: 128, chipset: "Kirin 980 (7nm Yapay Zeka)", screen: "6.53\" FHD+ IPS LCD", camera: "12 MP + 16 MP UW + 8 MP 2x Tele Leica", battery: 4000, has5G: false },
  { name: "Huawei Mate 20 Pro", year: 2018, category: "flagship", price: 8999, ram: 6, storage: 128, chipset: "Kirin 980 (3D Yüz Tanıma & Ekrana Gömülü Parmak İzi)", screen: "6.39\" 2K+ 3D Kavisli OLED (40W Şarj & Ters Kablosuz)", camera: "40 MP f/1.8 + 20 MP UW + 8 MP 3x Tele OIS Leica", battery: 4200, has5G: false },
  { name: "Huawei Mate 20 Lite", year: 2018, category: "budget", price: 3499, ram: 4, storage: 64, chipset: "Kirin 710", screen: "6.3\" FHD+ IPS LCD", camera: "20 MP + 2 MP Arka / 24 MP + 2 MP Ön Dörtlü", battery: 3750, has5G: false },
  { name: "Huawei P20", year: 2018, category: "flagship", price: 4999, ram: 4, storage: 128, chipset: "Kirin 970", screen: "5.8\" FHD+ LCD FullView", camera: "12 MP + 20 MP Monokrom Leica", battery: 3400, has5G: false },
  { name: "Huawei P20 Pro", year: 2018, category: "flagship", price: 7499, ram: 6, storage: 128, chipset: "Kirin 970 (DxOMark 1.si Üçlü Leica)", screen: "6.1\" FHD+ OLED Alacakaranlık Gradyan Cam", camera: "40 MP Main + 20 MP Monokrom + 8 MP 3x Tele OIS Leica", battery: 4000, has5G: false },
  { name: "Huawei P20 Lite", year: 2018, category: "budget", price: 2999, ram: 4, storage: 64, chipset: "Kirin 659", screen: "5.84\" FHD+ IPS LCD", camera: "16 MP + 2 MP Çift", battery: 3000, has5G: false },
  { name: "Huawei Nova 3", year: 2018, category: "midrange", price: 3999, ram: 6, storage: 128, chipset: "Kirin 970", screen: "6.3\" FHD+ IPS LCD (24MP Çift Selfie)", camera: "24 MP Monokrom + 16 MP Renkli Çift", battery: 3750, has5G: false },
  { name: "Huawei Nova 3i", year: 2018, category: "budget", price: 2799, ram: 4, storage: 128, chipset: "Kirin 710", screen: "6.3\" FHD+ IPS LCD", camera: "16 MP + 2 MP Arka / 24 MP + 2 MP Ön", battery: 3340, has5G: false },

  // --- 2019 ---
  { name: "Huawei P30", year: 2019, category: "flagship", price: 8499, ram: 6, storage: 128, chipset: "Kirin 980 (RYYB Sensör)", screen: "6.1\" FHD+ OLED Ekrana Gömülü Parmak İzi", camera: "40 MP RYYB + 16 MP UW + 8 MP 3x Tele OIS Leica", battery: 3650, has5G: false },
  { name: "Huawei P30 Pro", year: 2019, category: "flagship", price: 11999, ram: 8, storage: 256, chipset: "Kirin 980 (50x Periskop Zoom efsanesi)", screen: "6.47\" FHD+ 3D Kavisli OLED (40W Şarj & IP68)", camera: "40 MP RYYB OIS + 20 MP UW + 8 MP 5x Periskop OIS + TOF 3D Leica", battery: 4200, has5G: false },
  { name: "Huawei P30 Lite", year: 2019, category: "budget", price: 3799, ram: 4, storage: 128, chipset: "Kirin 710", screen: "6.15\" FHD+ 32MP Selfie LCD", camera: "48 MP + 8 MP UW + 2 MP Üçlü", battery: 3340, has5G: false },
  { name: "Huawei Mate 30", year: 2019, category: "flagship", price: 10999, ram: 8, storage: 128, chipset: "Kirin 990", screen: "6.62\" FHD+ OLED Halo Halka", camera: "40 MP SuperSensing + 16 MP UW + 8 MP 3x Tele OIS Leica", battery: 4200, has5G: false },
  { name: "Huawei Mate 30 Pro", year: 2019, category: "flagship", price: 15999, ram: 8, storage: 256, chipset: "Kirin 990 (88° Şelale Ekran & 7680fps Ağır Çekim)", screen: "6.53\" FHD+ 88° Horizon OLED (Horizon Touch)", camera: "40 MP Cine Camera + 40 MP SuperSensing OIS + 8 MP 3x Tele OIS + TOF 3D", battery: 4500, has5G: true },
  { name: "Huawei Nova 5T", year: 2019, category: "midrange", price: 5499, ram: 6, storage: 128, chipset: "Kirin 980 (Google Servisli Efsane)", screen: "6.26\" FHD+ Punch-Hole LCD", camera: "48 MP IMX586 + 16 MP UW + 2 MP + 2 MP Dörtlü", battery: 3750, has5G: false },
  { name: "Huawei Y9 Prime 2019", year: 2019, category: "budget", price: 3299, ram: 4, storage: 128, chipset: "Kirin 710F", screen: "6.59\" FHD+ Pop-Up Kameralı Çentiksiz LCD", camera: "16 MP + 8 MP UW + 2 MP Üçlü", battery: 4000, has5G: false },

  // --- 2020 ---
  { name: "Huawei P40", year: 2020, category: "flagship", price: 13999, ram: 8, storage: 128, chipset: "Kirin 990 5G", screen: "6.1\" FHD+ OLED Ultra Vision", camera: "50 MP Ultra Vision RYYB + 16 MP UW + 8 MP 3x Tele OIS Leica", battery: 3800, has5G: true },
  { name: "Huawei P40 Pro", year: 2020, category: "flagship", price: 18999, ram: 8, storage: 256, chipset: "Kirin 990 5G (Quad-Curve Overflow 90Hz)", screen: "6.58\" 1200x2640 90Hz Dört Tarafı Kavisli OLED (40W & IP68)", camera: "50 MP Ultra Vision RYYB OIS + 40 MP Cine UW + 12 MP 5x RYYB Periskop OIS + TOF 3D", battery: 4200, has5G: true },
  { name: "Huawei P40 Lite", year: 2020, category: "budget", price: 5499, ram: 6, storage: 128, chipset: "Kirin 810 (40W SuperCharge)", screen: "6.4\" FHD+ Punch-Hole LCD", camera: "48 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4200, has5G: false },
  { name: "Huawei Mate 40", year: 2020, category: "flagship", price: 16999, ram: 8, storage: 128, chipset: "Kirin 9000E 5G", screen: "6.5\" FHD+ 90Hz Kavisli OLED", camera: "50 MP Ultra Vision + 16 MP UW + 8 MP 3x Tele OIS Leica", battery: 4200, has5G: true },
  { name: "Huawei Mate 40 Pro", year: 2020, category: "flagship", price: 24999, ram: 8, storage: 256, chipset: "Kirin 9000 5G (5nm Zirve İşlemci & 66W Şarj)", screen: "6.76\" 1344x2772 90Hz 88° Kavisli OLED", camera: "50 MP Ultra Vision RYYB + 20 MP Cine UW + 12 MP 5x Periskop OIS Leica", battery: 4400, has5G: true },
  { name: "Huawei Nova 7i", year: 2020, category: "budget", price: 4999, ram: 8, storage: 128, chipset: "Kirin 810", screen: "6.4\" FHD+ IPS LCD", camera: "48 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4200, has5G: false },
  { name: "Huawei Nova 8", year: 2020, category: "midrange", price: 9999, ram: 8, storage: 128, chipset: "Kirin 985 5G (66W Şarj)", screen: "6.57\" FHD+ 90Hz Kavisli OLED", camera: "64 MP + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 3800, has5G: true },

  // --- 2021 ---
  { name: "Huawei P50", year: 2021, category: "flagship", price: 19999, ram: 8, storage: 128, chipset: "Snapdragon 888", screen: "6.5\" FHD+ 90Hz True-Chroma OLED", camera: "50 MP True-Chroma + 13 MP UW + 12 MP 5x Tele OIS", battery: 4100, has5G: false },
  { name: "Huawei P50 Pro", year: 2021, category: "flagship", price: 28999, ram: 8, storage: 256, chipset: "Snapdragon 888 / Kirin 9000 (Çift Halkalı Çift Matris Kamera)", screen: "6.6\" 1228x2700 120Hz 3D Kavisli OLED (66W & IP68)", camera: "50 MP True-Chroma OIS + 40 MP MONO + 13 MP UW + 64 MP 3.5x Periskop OIS", battery: 4360, has5G: false },
  { name: "Huawei Nova 9", year: 2021, category: "midrange", price: 11999, ram: 8, storage: 128, chipset: "Snapdragon 778G (66W Şarj)", screen: "6.57\" FHD+ 120Hz Kavisli OLED", camera: "50 MP Ultra Vision RYYB + 8 MP UW + 2 MP + 2 MP", battery: 4300, has5G: false },
  { name: "Huawei Mate 40E", year: 2021, category: "flagship", price: 17999, ram: 8, storage: 128, chipset: "Kirin 990E 5G", screen: "6.5\" FHD+ 90Hz OLED", camera: "64 MP + 16 MP UW + 8 MP 3x Tele OIS", battery: 4200, has5G: true },

  // --- 2022 ---
  { name: "Huawei Mate 50", year: 2022, category: "flagship", price: 27999, ram: 8, storage: 256, chipset: "Snapdragon 8+ Gen 1 (XMAGE Kamera & Kunlun Cam)", screen: "6.7\" FHD+ 90Hz OLED Kunlun Cam", camera: "50 MP XMAGE f/1.4-f/4.0 Değişken Diyafram OIS + 13 MP UW + 12 MP 5x Tele OIS", battery: 4460, has5G: false },
  { name: "Huawei Mate 50 Pro", year: 2022, category: "flagship", price: 38999, ram: 8, storage: 512, chipset: "Snapdragon 8+ Gen 1 (XMAGE 10 Seviyeli Diyafram & Kunlun Cam)", screen: "6.74\" 1212x2616 120Hz Kavisli OLED Kunlun Cam (IP68 6m)", camera: "50 MP XMAGE OIS f/1.4-f/4.0 + 13 MP UW + 64 MP 3.5x Periskop OIS", battery: 4700, has5G: false },
  { name: "Huawei P50 Pocket", year: 2022, category: "foldable", price: 34999, ram: 8, storage: 256, chipset: "Snapdragon 888 (Şık Katlanabilir Tasarım)", screen: "6.9\" FHD+ 120Hz Katlanabilir OLED + 1.04\" Dış Ekran", camera: "40 MP True-Chroma + 32 MP Ultra Spectrum + 13 MP UW", battery: 4000, has5G: false },
  { name: "Huawei Nova 10", year: 2022, category: "midrange", price: 14999, ram: 8, storage: 128, chipset: "Snapdragon 778G (60MP Ultra Geniş Selfie)", screen: "6.67\" FHD+ 120Hz Kavisli OLED (66W Şarj)", camera: "50 MP RYYB + 8 MP UW + 2 MP (60MP 4K Selfie)", battery: 4000, has5G: false },

  // --- 2023 ---
  { name: "Huawei Mate 60", year: 2023, category: "flagship", price: 39999, ram: 12, storage: 512, chipset: "Kirin 9000s 5G (Uydu Bağlantılı Yükseliş)", screen: "6.69\" FHD+ 120Hz LTPO OLED Kunlun Cam 2.0", camera: "50 MP XMAGE OIS f/1.4-f/4.0 + 12 MP 5x Periskop OIS + 12 MP UW", battery: 4750, has5G: true },
  { name: "Huawei Mate 60 Pro", year: 2023, category: "flagship", price: 49999, ram: 12, storage: 512, chipset: "Kirin 9000s 5G (Dünyanın İlk Doğrudan Uydu Aramalı Telefonu)", screen: "6.82\" 1260x2720 120Hz LTPO OLED Kunlun Cam 2.0 (88W Şarj)", camera: "50 MP XMAGE OIS f/1.4-f/4.0 + 48 MP 3.5x Periskop Makro OIS + 12 MP UW", battery: 5000, has5G: true },
  { name: "Huawei P60 Pro", year: 2023, category: "flagship", price: 44999, ram: 12, storage: 512, chipset: "Snapdragon 8+ Gen 1 (DxOMark Lideri / İnci Dokulu Arka Kapak)", screen: "6.67\" 1220x2700 120Hz LTPO OLED Dayanıklı Kunlun Cam", camera: "48 MP Ultra Lighting XMAGE OIS f/1.4-f/4.0 + 48 MP Periskop Makro OIS + 13 MP UW", battery: 4815, has5G: false },
  { name: "Huawei Nova 11", year: 2023, category: "midrange", price: 17999, ram: 8, storage: 256, chipset: "Snapdragon 778G (Kunlun Cam Seçenekli)", screen: "6.7\" FHD+ 120Hz Düz OLED (60MP Selfie)", camera: "50 MP RYYB + 8 MP UW (60MP 4K Selfie)", battery: 4500, has5G: false },

  // --- 2024 ---
  { name: "Huawei Pura 70", year: 2024, category: "flagship", price: 49999, ram: 12, storage: 512, chipset: "Kirin 9010 5G (XMAGE Görüntüleme)", screen: "6.6\" FHD+ 120Hz LTPO OLED İkinci Nesil Kunlun Cam", camera: "50 MP XMAGE OIS f/1.4-f/4.0 + 12 MP 5x Periskop OIS + 13 MP UW", battery: 4900, has5G: true },
  { name: "Huawei Pura 70 Pro", year: 2024, category: "flagship", price: 64999, ram: 12, storage: 512, chipset: "Kirin 9010 5G (100W Şarj & Makro Periskop)", screen: "6.8\" 1.5K 120Hz LTPO Kavisli OLED Kunlun Cam 2.0", camera: "50 MP XMAGE OIS f/1.4-f/4.0 + 48 MP 3.5x Periskop Makro OIS + 12.5 MP UW", battery: 5050, has5G: true },
  { name: "Huawei Pura 70 Ultra", year: 2024, category: "flagship", price: 84999, ram: 16, storage: 512, chipset: "Kirin 9010 5G (Mekanik Geri Çekilebilir Pop-out 1\" Sensör / DxOMark 1.si)", screen: "6.8\" 1.5K 120Hz LTPO OLED Kristal Zırh Kunlun Cam", camera: "50 MP 1\" Pop-out OIS f/1.6-f/4.0 + 50 MP 3.5x Periskop Makro OIS + 40 MP UW", battery: 5200, has5G: true },
  { name: "Huawei Nova 12", year: 2024, category: "midrange", price: 22999, ram: 8, storage: 256, chipset: "Kirin 830 5G (60MP Portre Selfie)", screen: "6.7\" FHD+ 120Hz OLED (100W Şarj)", camera: "50 MP RYYB + 8 MP UW (60MP 4K Selfie)", battery: 4600, has5G: true },
  { name: "Huawei Nova 12 SE", year: 2024, category: "budget", price: 15999, ram: 8, storage: 256, chipset: "Snapdragon 680 (108MP Kamera / 66W Şarj)", screen: "6.67\" FHD+ 90Hz OLED", camera: "108 MP + 8 MP UW + 2 MP", battery: 4500, has5G: false },

  // --- 2025 - 2026 ---
  { name: "Huawei Mate X7", year: 2025, category: "foldable", price: 99999, ram: 16, storage: 512, chipset: "Kirin 9100 5G (Ultra İnce Katlanabilir XMAGE)", screen: "7.95\" 120Hz Katlanabilir LTPO OLED Kunlun Glass + 6.45\" Dış Ekran", camera: "50 MP XMAGE OIS + 48 MP 3.5x Periskop OIS + 40 MP UW", battery: 5300, has5G: true },
  { name: "Huawei Mate 80", year: 2025, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Kirin 9100 5G (HarmonyOS NEXT Tam Yerli İşletim Sistemi)", screen: "6.75\" 1.5K 120Hz LTPO OLED Kristal Zırh", camera: "50 MP XMAGE f/1.4-f/4.0 OIS + 50 MP 3.5x Periskop OIS + 40 MP UW", battery: 5600, has5G: true },
  { name: "Huawei Mate 80 Pro", year: 2025, category: "flagship", price: 89999, ram: 16, storage: 1024, chipset: "Kirin 9100 5G (Uydu İnternet & HarmonyOS NEXT)", screen: "6.85\" 2K 144Hz LTPO OLED Dört Tarafı Kavisli Zırh", camera: "50 MP XMAGE OIS + 50 MP 5x Periskop Makro OIS + 50 MP UW", battery: 5800, has5G: true },
  { name: "Huawei Pura 80 Ultra", year: 2025, category: "flagship", price: 99999, ram: 16, storage: 1024, chipset: "Kirin 9100 5G (XMAGE 2.0 Pop-out 1\" Sensör)", screen: "6.85\" 2K 144Hz LTPO OLED Kristal Safir Zırh", camera: "50 MP 1\" Mekanik Pop-out OIS + 50 MP 5x Periskop OIS + 50 MP UW", battery: 5900, has5G: true },
  { name: "Huawei Pura 90", year: 2026, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Kirin 9200 5G (2nm Yerli Zirve)", screen: "6.7\" 1.5K 144Hz LTPO OLED", camera: "50 MP XMAGE Pop-out OIS + 50 MP 5x Periskop OIS + 50 MP UW", battery: 6000, has5G: true },
  { name: "Huawei Nova 14 Pro", year: 2026, category: "midrange", price: 34999, ram: 12, storage: 512, chipset: "Kirin 850 5G (60MP Çift Ön Kamera)", screen: "6.78\" 1.5K 144Hz OLED (120W Şarj)", camera: "50 MP RYYB OIS + 50 MP 3x Tele + 12 MP UW", battery: 5500, has5G: true },
  { name: "Huawei Nova 15 Ultra", year: 2026, category: "midrange", price: 44999, ram: 16, storage: 512, chipset: "Kirin 9000s Pro 5G (HarmonyOS NEXT 2.0)", screen: "6.8\" 1.5K 144Hz OLED Kunlun Cam", camera: "50 MP XMAGE OIS + 50 MP 3.5x Periskop OIS + 12 MP UW", battery: 5800, has5G: true }
];

const huaweiImages = [
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

const generatedHuaweiPhones = huaweiModels.map((m, index) => {
  const slug = slugify(m.name);
  const id = `huawei-${slug}-${index + 1}`;
  const isFlagship = m.category === 'flagship' || m.category === 'foldable' || m.name.includes('Mate') || m.name.includes('Pura') || m.name.includes('P30 Pro') || m.name.includes('P40 Pro') || m.name.includes('P50 Pro') || m.name.includes('P60 Pro');
  const rating = isFlagship ? Number((4.8 + (index % 3) * 0.1).toFixed(1)) : Number((4.3 + (index % 5) * 0.1).toFixed(1));
  const reviewCount = Math.floor(140 + (index * 47) % 890);
  const image = huaweiImages[index % huaweiImages.length];

  const storeBase = m.price;
  const storeOffers = [
    {
      id: `st-hb-hw-${index}`,
      storeName: 'Hepsiburada',
      storeLogoColor: 'bg-orange-600',
      price: Math.round(storeBase * 0.99),
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
      sellerRating: 4.9,
      sellerReviews: 16800,
      url: '#'
    },
    {
      id: `st-ty-hw-${index}`,
      storeName: 'Trendyol',
      storeLogoColor: 'bg-amber-600',
      price: Math.round(storeBase * 0.995),
      inStock: true,
      shippingDays: 1,
      badges: ['Kuponlu Ürün'],
      sellerRating: 4.8,
      sellerReviews: 24500,
      url: '#'
    },
    {
      id: `st-vt-hw-${index}`,
      storeName: 'Vatan Bilgisayar',
      storeLogoColor: 'bg-blue-800',
      price: storeBase,
      inStock: true,
      shippingDays: 1,
      badges: ['Resmi Garanti'],
      sellerRating: 4.9,
      sellerReviews: 18200,
      url: '#'
    },
    {
      id: `st-mm-hw-${index}`,
      storeName: 'MediaMarkt',
      storeLogoColor: 'bg-red-600',
      price: Math.round(storeBase * 1.01),
      inStock: true,
      shippingDays: 1,
      badges: ['Mağazadan Teslim'],
      sellerRating: 4.8,
      sellerReviews: 11400,
      url: '#'
    }
  ];

  const priceHistory = [
    { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: 'Huawei TR' },
    { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
    { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
    { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
  ];

  return {
    id,
    slug,
    name: m.name,
    brand: "Huawei",
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
        resolution: isFlagship ? "2840 x 1260 px" : "2400 x 1080 px",
        refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2021 ? 120 : 90),
        ppi: isFlagship ? 460 : 392,
        brightnessNits: isFlagship ? 2500 : 1100
      },
      processor: {
        chip: m.chipset,
        cores: "8 Çekirdek",
        process: m.year >= 2026 ? "2nm Kirin" : (m.year >= 2024 ? "7nm Kirin 9010" : "5nm Kirin 9000"),
        antutuScore: isFlagship ? 1850000 : 760000
      },
      memory: {
        ramGb: m.ram,
        ramType: "LPDDR5X",
        storageGb: m.storage,
        storageOptions: [m.storage],
        expandableStorage: m.name.includes('Nano Memory') || !isFlagship
      },
      camera: {
        mainMp: m.camera.split(' ')[0] + " MP",
        ultrawideMp: "13 MP",
        telephotoMp: isFlagship ? "50 MP Pop-out XMAGE Periskop OIS" : "Yok",
        selfieMp: m.name.includes('Nova') ? "60 MP 4K Selfie" : "32 MP",
        videoRes: isFlagship ? "4K @ 60fps XMAGE HDR" : "4K @ 30fps",
        dxomarkScore: isFlagship ? 163 : 122
      },
      battery: {
        capacitymAh: m.battery,
        chargingWatts: m.screen.includes('100W') || m.chipset.includes('88W') ? 88 : (isFlagship ? 66 : 40),
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
        weightGrams: isFlagship ? 220 : 190,
        thicknessMm: 8.2,
        waterResistance: isFlagship ? "IP68 (6 metre su altında 30dk)" : "IP54",
        frameMaterial: isFlagship ? (m.name.includes('Kunlun') ? "Kunlun Cam / Seramik" : "Alüminyum") : "Polikarbonat"
      },
      software: {
        osName: m.year >= 2025 ? "HarmonyOS NEXT (Saf Bağımsız OS)" : (m.year >= 2022 ? "HarmonyOS 4.0" : "EMUI 12 / Android"),
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

// Remove any older Huawei phones that we are replacing with our exhaustive catalog
const nonHuaweiPhones = existingPhones.filter(p => p.brand !== 'Huawei');
const combinedPhones = [...nonHuaweiPhones, ...generatedHuaweiPhones];

console.log(`Generated ${generatedHuaweiPhones.length} comprehensive Huawei smartphone models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with all Huawei 2018-2026 smartphone models!");
