const fs = require('fs');
const path = require('path');

// --- GOOGLE PIXEL (2018 - 2026) ---
const pixelModels = [
  // 2018 - 2019
  { name: "Google Pixel 3", year: 2018, category: "flagship", price: 6999, ram: 4, storage: 64, chipset: "Snapdragon 845 (Night Sight Kamera)", screen: "5.5\" FHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 2915, has5G: false },
  { name: "Google Pixel 3 XL", year: 2018, category: "flagship", price: 8499, ram: 4, storage: 128, chipset: "Snapdragon 845", screen: "6.3\" QHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 3430, has5G: false },
  { name: "Google Pixel 3a", year: 2019, category: "budget", price: 4499, ram: 4, storage: 64, chipset: "Snapdragon 670", screen: "5.6\" FHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 3000, has5G: false },
  { name: "Google Pixel 3a XL", year: 2019, category: "budget", price: 5299, ram: 4, storage: 64, chipset: "Snapdragon 670", screen: "6.0\" FHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 3700, has5G: false },
  { name: "Google Pixel 4", year: 2019, category: "flagship", price: 9999, ram: 6, storage: 64, chipset: "Snapdragon 855 (Soli Radar 90Hz)", screen: "5.7\" FHD+ 90Hz Smooth OLED", camera: "12.2 MP OIS + 16 MP 2x Tele OIS", battery: 2800, has5G: false },
  { name: "Google Pixel 4 XL", year: 2019, category: "flagship", price: 11999, ram: 6, storage: 128, chipset: "Snapdragon 855", screen: "6.3\" QHD+ 90Hz Smooth OLED", camera: "12.2 MP OIS + 16 MP 2x Tele OIS", battery: 3700, has5G: false },

  // 2020 - 2021
  { name: "Google Pixel 4a", year: 2020, category: "budget", price: 5999, ram: 6, storage: 128, chipset: "Snapdragon 730G", screen: "5.81\" FHD+ OLED", camera: "12.2 MP Dual Pixel OIS", battery: 3140, has5G: false },
  { name: "Google Pixel 4a 5G", year: 2020, category: "midrange", price: 7999, ram: 6, storage: 128, chipset: "Snapdragon 765G 5G", screen: "6.2\" FHD+ OLED", camera: "12.2 MP OIS + 16 MP UW", battery: 3885, has5G: true },
  { name: "Google Pixel 5", year: 2020, category: "flagship", price: 11999, ram: 8, storage: 128, chipset: "Snapdragon 765G 5G (90Hz / IP68 / Ters Şarj)", screen: "6.0\" FHD+ 90Hz Smooth OLED", camera: "12.2 MP OIS + 16 MP UW", battery: 4080, has5G: true },
  { name: "Google Pixel 5a 5G", year: 2021, category: "midrange", price: 8999, ram: 6, storage: 128, chipset: "Snapdragon 765G 5G (IP67)", screen: "6.34\" FHD+ OLED", camera: "12.2 MP OIS + 16 MP UW", battery: 4680, has5G: true },
  { name: "Google Pixel 6", year: 2021, category: "flagship", price: 17999, ram: 8, storage: 128, chipset: "Google Tensor 1 (İkonik Vizör Tasarımı)", screen: "6.4\" FHD+ 90Hz AMOLED Gorilla Glass Victus", camera: "50 MP 1/1.31\" OIS + 12 MP UW", battery: 4614, has5G: true },
  { name: "Google Pixel 6 Pro", year: 2021, category: "flagship", price: 23999, ram: 12, storage: 256, chipset: "Google Tensor 1 (4x Periskop Zoom)", screen: "6.7\" QHD+ 120Hz LTPO AMOLED", camera: "50 MP OIS + 48 MP 4x Periskop OIS + 12 MP UW", battery: 5003, has5G: true },

  // 2022 - 2023
  { name: "Google Pixel 6a", year: 2022, category: "budget", price: 11999, ram: 6, storage: 128, chipset: "Google Tensor 1", screen: "6.1\" FHD+ OLED", camera: "12.2 MP OIS + 12 MP UW", battery: 4410, has5G: true },
  { name: "Google Pixel 7", year: 2022, category: "flagship", price: 22999, ram: 8, storage: 128, chipset: "Google Tensor G2", screen: "6.3\" FHD+ 90Hz AMOLED", camera: "50 MP OIS + 12 MP UW", battery: 4355, has5G: true },
  { name: "Google Pixel 7 Pro", year: 2022, category: "flagship", price: 31999, ram: 12, storage: 256, chipset: "Google Tensor G2 (5x Periskop Macro Focus)", screen: "6.7\" QHD+ 120Hz LTPO AMOLED", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 12 MP UW", battery: 5000, has5G: true },
  { name: "Google Pixel 7a", year: 2023, category: "midrange", price: 15999, ram: 8, storage: 128, chipset: "Google Tensor G2 (90Hz / 64MP)", screen: "6.1\" FHD+ 90Hz OLED (Kablosuz Şarj)", camera: "64 MP OIS + 13 MP UW", battery: 4385, has5G: true },
  { name: "Google Pixel 8", year: 2023, category: "flagship", price: 34999, ram: 8, storage: 256, chipset: "Google Tensor G3 (7 Yıl Güncelleme Garantisi)", screen: "6.2\" FHD+ 120Hz Actua OLED 2000 Nits", camera: "50 MP OIS + 12 MP UW Macro", battery: 4575, has5G: true },
  { name: "Google Pixel 8 Pro", year: 2023, category: "flagship", price: 47999, ram: 12, storage: 512, chipset: "Google Tensor G3 (Vücut Sıcaklığı Sensörü)", screen: "6.7\" QHD+ 120Hz Super Actua LTPO OLED 2400 Nits", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 48 MP UW Macro", battery: 5050, has5G: true },
  { name: "Google Pixel Fold", year: 2023, category: "foldable", price: 69999, ram: 12, storage: 512, chipset: "Google Tensor G2 (İlk Google Katlanabilir)", screen: "7.6\" 120Hz Katlanabilir OLED + 5.8\" Dış Ekran", camera: "48 MP OIS + 10.8 MP 5x Periskop + 10.8 MP UW", battery: 4821, has5G: true },

  // 2024 - 2026
  { name: "Google Pixel 8a", year: 2024, category: "midrange", price: 21999, ram: 8, storage: 128, chipset: "Google Tensor G3 (120Hz / 2000 Nits)", screen: "6.1\" FHD+ 120Hz Actua OLED", camera: "64 MP OIS + 13 MP UW", battery: 4492, has5G: true },
  { name: "Google Pixel 9", year: 2024, category: "flagship", price: 44999, ram: 12, storage: 256, chipset: "Google Tensor G4 (Gemini Nano AI)", screen: "6.3\" FHD+ 120Hz Actua OLED 2700 Nits", camera: "50 MP OIS + 48 MP UW Macro", battery: 4700, has5G: true },
  { name: "Google Pixel 9 Pro", year: 2024, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Google Tensor G4 (Super Actua / Compact Pro)", screen: "6.3\" 1.5K 120Hz Super Actua LTPO OLED 3000 Nits", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 48 MP UW", battery: 4700, has5G: true },
  { name: "Google Pixel 9 Pro XL", year: 2024, category: "flagship", price: 64999, ram: 16, storage: 512, chipset: "Google Tensor G4 (Zirve Boyut & 37W Şarj)", screen: "6.8\" QHD+ 120Hz Super Actua LTPO OLED 3000 Nits", camera: "50 MP OIS + 48 MP 5x Periskop OIS + 48 MP UW", battery: 5060, has5G: true },
  { name: "Google Pixel 9 Pro Fold", year: 2024, category: "foldable", price: 84999, ram: 16, storage: 512, chipset: "Google Tensor G4 (İnce Katlanabilir 10.5mm)", screen: "8.0\" 120Hz Katlanabilir Super Actua OLED + 6.3\" Dış Ekran", camera: "48 MP OIS + 10.8 MP 5x Periskop + 10.5 MP UW", battery: 4650, has5G: true },
  { name: "Google Pixel 10 Pro", year: 2025, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Google Tensor G5 (TSMC 3nm Döküm)", screen: "6.3\" 1.5K 144Hz LTPO OLED 3500 Nits", camera: "50 MP Sony OIS + 50 MP 5x Periskop + 50 MP UW", battery: 4900, has5G: true },
  { name: "Google Pixel 10 Pro XL", year: 2025, category: "flagship", price: 79999, ram: 16, storage: 512, chipset: "Google Tensor G5 (TSMC 3nm)", screen: "6.85\" 2K 144Hz LTPO OLED 3500 Nits", camera: "50 MP Sony OIS + 50 MP 5x Periskop + 50 MP UW", battery: 5300, has5G: true },
  { name: "Google Pixel 11 Pro XL", year: 2026, category: "flagship", price: 89999, ram: 16, storage: 1024, chipset: "Google Tensor G6 (2nm TSMC / AI 4.0)", screen: "6.85\" 2K 144Hz LTPO OLED 4000 Nits", camera: "50 MP 1\" Sony OIS + 50 MP 10x Periskop OIS + 50 MP UW", battery: 5500, has5G: true }
];

// --- REALME (2018 - 2026) ---
const realmeModels = [
  // 2018 - 2019
  { name: "Realme 1", year: 2018, category: "budget", price: 2199, ram: 4, storage: 64, chipset: "Helio P60", screen: "6.0\" FHD+ IPS LCD", camera: "13 MP", battery: 3410, has5G: false },
  { name: "Realme 2 Pro", year: 2018, category: "budget", price: 2999, ram: 6, storage: 64, chipset: "Snapdragon 660", screen: "6.3\" FHD+ Damla Çentikli LCD", camera: "16 MP Sony IMX398 + 2 MP Çift", battery: 3500, has5G: false },
  { name: "Realme 3 Pro", year: 2019, category: "budget", price: 3499, ram: 6, storage: 64, chipset: "Snapdragon 710", screen: "6.3\" FHD+ IPS LCD", camera: "16 MP Sony IMX519 + 5 MP Çift", battery: 4045, has5G: false },
  { name: "Realme 5 Pro", year: 2019, category: "budget", price: 4299, ram: 8, storage: 128, chipset: "Snapdragon 712 (48MP Dörtlü Kamera)", screen: "6.3\" FHD+ IPS LCD", camera: "48 MP IMX586 + 8 MP UW + 2 MP + 2 MP Dörtlü", battery: 4035, has5G: false },
  { name: "Realme XT", year: 2019, category: "midrange", price: 4999, ram: 8, storage: 128, chipset: "Snapdragon 712 (64MP Kameralı Efsane)", screen: "6.4\" FHD+ Super AMOLED Ekrana Gömülü Parmak İzi", camera: "64 MP Samsung GW1 + 8 MP UW + 2 MP + 2 MP", battery: 4000, has5G: false },
  { name: "Realme X2 Pro", year: 2019, category: "flagship", price: 7999, ram: 12, storage: 256, chipset: "Snapdragon 855+ (90Hz / 50W Fast Charge)", screen: "6.5\" FHD+ 90Hz Super AMOLED", camera: "64 MP OIS + 13 MP 2x Tele + 8 MP UW + 2 MP", battery: 4000, has5G: false },

  // 2020 - 2021
  { name: "Realme 6 Pro", year: 2020, category: "budget", price: 5499, ram: 8, storage: 128, chipset: "Snapdragon 720G (90Hz / Çift Ön Kamera)", screen: "6.6\" FHD+ 90Hz LCD", camera: "64 MP + 12 MP 2x Tele + 8 MP UW + 2 MP", battery: 4300, has5G: false },
  { name: "Realme 7 Pro", year: 2020, category: "midrange", price: 6499, ram: 8, storage: 128, chipset: "Snapdragon 720G (65W SuperDart Charge & Stereo)", screen: "6.4\" FHD+ Super AMOLED", camera: "64 MP IMX682 + 8 MP UW + 2 MP + 2 MP", battery: 4500, has5G: false },
  { name: "Realme 8 Pro", year: 2021, category: "midrange", price: 7999, ram: 8, storage: 128, chipset: "Snapdragon 720G (108MP Kamera)", screen: "6.4\" FHD+ Super AMOLED 50W", camera: "108 MP HM2 + 8 MP UW + 2 MP + 2 MP", battery: 4500, has5G: false },
  { name: "Realme GT 5G", year: 2021, category: "flagship", price: 12999, ram: 12, storage: 256, chipset: "Snapdragon 888 5G (Yarış Sarı Deri Tasarım)", screen: "6.43\" FHD+ 120Hz Super AMOLED 65W", camera: "64 MP IMX682 + 8 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "Realme GT Master Edition", year: 2021, category: "midrange", price: 9999, ram: 8, storage: 256, chipset: "Snapdragon 778G 5G (Valiz Tasarımlı)", screen: "6.43\" FHD+ 120Hz Super AMOLED 65W", camera: "64 MP + 8 MP UW + 2 MP", battery: 4300, has5G: true },

  // 2022 - 2023
  { name: "Realme 9 Pro+", year: 2022, category: "midrange", price: 11999, ram: 8, storage: 256, chipset: "Dimensity 920 5G (Sony IMX766 OIS & Kalp Atış Sensörü)", screen: "6.4\" FHD+ 90Hz Super AMOLED 60W", camera: "50 MP IMX766 OIS + 8 MP UW + 2 MP", battery: 4500, has5G: true },
  { name: "Realme GT2 Pro", year: 2022, category: "flagship", price: 19999, ram: 12, storage: 256, chipset: "Snapdragon 8 Gen 1 (2K 120Hz LTPO / Kağıt Biyo-Polimer)", screen: "6.7\" 2K+ 120Hz LTPO 2.0 AMOLED 65W", camera: "50 MP IMX766 OIS + 50 MP 150° UW + 3 MP Mikro 40x", battery: 5000, has5G: true },
  { name: "Realme 11 Pro+", year: 2023, category: "midrange", price: 17999, ram: 12, storage: 512, chipset: "Dimensity 7050 5G (200MP OIS & 100W Şarj)", screen: "6.7\" FHD+ 120Hz 3D Kavisli AMOLED Deri", camera: "200 MP HP3 OIS 4x Zoom + 8 MP UW + 2 MP", battery: 5000, has5G: true },
  { name: "Realme GT3", year: 2023, category: "flagship", price: 24999, ram: 16, storage: 1024, chipset: "Snapdragon 8+ Gen 1 (Dünyanın En Hızlı 240W Şarjı - 9 Dakikada %100)", screen: "6.74\" 1.5K 144Hz AMOLED RGB LED", camera: "50 MP IMX890 OIS + 8 MP UW + 2 MP", battery: 4600, has5G: true },

  // 2024 - 2026
  { name: "Realme 12 Pro+", year: 2024, category: "midrange", price: 21999, ram: 12, storage: 512, chipset: "Snapdragon 7s Gen 2 5G (64MP 3x Periskop Telephoto)", screen: "6.7\" FHD+ 120Hz Kavisli Lüks Saat Tasarımlı AMOLED", camera: "50 MP Sony IMX890 OIS + 64 MP 3x Periskop OIS + 8 MP UW", battery: 5000, has5G: true },
  { name: "Realme GT 6", year: 2024, category: "flagship", price: 32999, ram: 16, storage: 512, chipset: "Snapdragon 8s Gen 3 (6000 Nits Rekor Parlaklık / 120W)", screen: "6.78\" 1.5K 120Hz 8T LTPO AMOLED 6000 Nits", camera: "50 MP Sony LYT-808 OIS + 50 MP 2x Tele OIS + 8 MP UW", battery: 5500, has5G: true },
  { name: "Realme GT 7 Pro", year: 2025, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (3nm / Su Altı Modu IP69)", screen: "6.78\" 1.5K 120Hz Eco2 OLED 120W (6500 mAh Batarya)", camera: "50 MP Sony OIS + 50 MP 3x Periskop OIS + 8 MP UW", battery: 6500, has5G: true },
  { name: "Realme GT 8 Pro", year: 2026, category: "flagship", price: 69999, ram: 16, storage: 512, chipset: "Snapdragon 8 Gen 5 (2nm Zirve Oyuncu)", screen: "6.85\" 2K 144Hz LTPO AMOLED 150W", camera: "50 MP 1\" OIS + 200 MP Periskop OIS + 50 MP UW", battery: 7000, has5G: true }
];

// --- NOTHING PHONE (2022 - 2026) ---
const nothingModels = [
  { name: "Nothing Phone (1)", year: 2022, category: "midrange", price: 14999, ram: 8, storage: 256, chipset: "Snapdragon 778G+ 5G (İkonik Glyph Şeffaf LED)", screen: "6.55\" FHD+ 120Hz OLED (Kablosuz Şarj)", camera: "50 MP Sony IMX766 OIS + 50 MP JN1 UW", battery: 4500, has5G: true },
  { name: "Nothing Phone (2)", year: 2023, category: "flagship", price: 27999, ram: 12, storage: 512, chipset: "Snapdragon 8+ Gen 1 (Gelişmiş 33 Bölgeli Glyph)", screen: "6.7\" FHD+ 120Hz LTPO OLED (45W Şarj)", camera: "50 MP Sony IMX890 OIS + 50 MP JN1 UW", battery: 4700, has5G: true },
  { name: "Nothing Phone (2a)", year: 2024, category: "midrange", price: 18999, ram: 12, storage: 256, chipset: "Dimensity 7200 Pro 5G (Glyph Tasarım)", screen: "6.7\" FHD+ 120Hz AMOLED 1300 Nits", camera: "50 MP OIS + 50 MP UW", battery: 5000, has5G: true },
  { name: "Nothing Phone (2a) Plus", year: 2024, category: "midrange", price: 21999, ram: 12, storage: 256, chipset: "Dimensity 7350 Pro 5G (50MP Selfie)", screen: "6.7\" FHD+ 120Hz AMOLED 50W", camera: "50 MP OIS + 50 MP UW (50MP Selfie)", battery: 5000, has5G: true },
  { name: "Nothing CMF Phone 1", year: 2024, category: "budget", price: 11999, ram: 8, storage: 128, chipset: "Dimensity 7300 5G (Değiştirilebilir Arka Kapaklar)", screen: "6.67\" FHD+ 120Hz Super AMOLED", camera: "50 MP Sony IMX882 + 2 MP", battery: 5000, has5G: true },
  { name: "Nothing Phone (3)", year: 2025, category: "flagship", price: 39999, ram: 16, storage: 512, chipset: "Snapdragon 8s Gen 3 (Yapay Zeka Glyph Matrix)", screen: "6.78\" 1.5K 144Hz LTPO OLED 65W", camera: "50 MP Sony OIS + 50 MP Tele + 50 MP UW", battery: 5200, has5G: true },
  { name: "Nothing Phone (4)", year: 2026, category: "flagship", price: 54999, ram: 16, storage: 512, chipset: "Snapdragon 8 Elite (Ultra Glyph Matrix)", screen: "6.8\" 2K 144Hz LTPO OLED 100W", camera: "50 MP 1\" OIS + 50 MP 3x Periskop OIS + 50 MP UW", battery: 5800, has5G: true }
];

const brandImages = [
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

function processBrand(models, brandName) {
  return models.map((m, index) => {
    const slug = slugify(m.name);
    const id = `${brandName.toLowerCase()}-${slug}-${index + 1}`;
    const isFlagship = m.category === 'flagship' || m.category === 'foldable';
    const rating = isFlagship ? Number((4.7 + (index % 3) * 0.1).toFixed(1)) : Number((4.3 + (index % 5) * 0.1).toFixed(1));
    const reviewCount = Math.floor(120 + (index * 37) % 780);
    const image = brandImages[index % brandImages.length];

    const storeBase = m.price;
    const storeOffers = [
      {
        id: `st-hb-${slug.slice(0, 4)}-${index}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600',
        price: Math.round(storeBase * 0.99),
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Distribütör', 'Hızlı Teslimat'],
        sellerRating: 4.9,
        sellerReviews: 14200,
        url: '#'
      },
      {
        id: `st-ty-${slug.slice(0, 4)}-${index}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600',
        price: Math.round(storeBase * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Kuponlu Ürün'],
        sellerRating: 4.8,
        sellerReviews: 19800,
        url: '#'
      },
      {
        id: `st-vt-${slug.slice(0, 4)}-${index}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800',
        price: storeBase,
        inStock: true,
        shippingDays: 1,
        badges: ['Resmi Garanti'],
        sellerRating: 4.9,
        sellerReviews: 15100,
        url: '#'
      },
      {
        id: `st-mm-${slug.slice(0, 4)}-${index}`,
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
      { date: 'Ekim 2025', price: Math.round(storeBase * 1.08), store: `${brandName} TR` },
      { date: 'Aralık 2025', price: Math.round(storeBase * 1.04), store: 'Hepsiburada' },
      { date: 'Şubat 2026', price: Math.round(storeBase * 1.01), store: 'Trendyol' },
      { date: 'Mart 2026', price: storeBase, store: 'Vatan Bilgisayar' }
    ];

    return {
      id,
      slug,
      name: m.name,
      brand: brandName,
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
          resolution: isFlagship ? "2800 x 1260 px" : "2400 x 1080 px",
          refreshRate: m.screen.includes('144Hz') ? 144 : (isFlagship || m.year >= 2021 ? 120 : 90),
          ppi: isFlagship ? 450 : 390,
          brightnessNits: isFlagship ? 3000 : 1200
        },
        processor: {
          chip: m.chipset,
          cores: "8 Çekirdek",
          process: m.year >= 2026 ? "2nm" : (m.year >= 2024 ? "4nm" : "6nm"),
          antutuScore: isFlagship ? 1880000 : 780000
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
          ultrawideMp: "12 MP",
          telephotoMp: isFlagship ? "50 MP 5x Periskop OIS" : "Yok",
          selfieMp: "32 MP",
          videoRes: isFlagship ? "4K @ 60fps" : "1080p @ 60fps",
          dxomarkScore: isFlagship ? 154 : 118
        },
        battery: {
          capacitymAh: m.battery,
          chargingWatts: m.screen.includes('120W') || m.chipset.includes('240W') ? 120 : (isFlagship ? 65 : 33),
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
          weightGrams: isFlagship ? 205 : 185,
          thicknessMm: 8.2,
          waterResistance: m.name.includes('IP69') ? "IP69" : (isFlagship ? "IP68" : "IP54"),
          frameMaterial: isFlagship ? "Alüminyum / Cam" : "Polikarbonat"
        },
        software: {
          osName: m.year >= 2026 ? "Android 16" : "Android 14",
          updateYears: m.year >= 2024 ? 4 : 3
        }
      }
    };
  });
}

const generatedPixelPhones = processBrand(pixelModels, "Google");
const generatedRealmePhones = processBrand(realmeModels, "Realme");
const generatedNothingPhones = processBrand(nothingModels, "Nothing");

const newGeneratedAll = [...generatedPixelPhones, ...generatedRealmePhones, ...generatedNothingPhones];

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

// Remove any older Google / Realme / Nothing entries
const cleanedPhones = existingPhones.filter(p => p.brand !== 'Google' && p.brand !== 'Realme' && p.brand !== 'Nothing');
const combinedPhones = [...cleanedPhones, ...newGeneratedAll];

console.log(`Generated ${newGeneratedAll.length} comprehensive Google Pixel, Realme & Nothing models!`);
console.log(`New total phone count: ${combinedPhones.length}`);

const updatedArrayCode = `export const mockSmartphones: Smartphone[] = ${JSON.stringify(combinedPhones, null, 2)};`;

fileContent = fileContent.replace(/export const mockSmartphones: Smartphone\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockDataPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts with Google Pixel, Realme & Nothing 2018-2026 models!");
