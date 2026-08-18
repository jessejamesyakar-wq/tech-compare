const fs = require('fs');
const path = require('path');

// Generate multi-inch variations for all Samsung TV series from 2018 to 2026
const samsungSeriesList = [
  // --- 2018 ---
  { name: 'Q9F', year: 2018, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 32999, nits: 2000, dimming: 480, chip: 'Q Engine 4K', hdr: ['HDR2000', 'HDR10+'], inches: [55, 65, 75] },
  { name: 'Q8F', year: 2018, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 24999, nits: 1500, dimming: 240, chip: 'Q Engine 4K', hdr: ['HDR1500', 'HDR10+'], inches: [55, 65] },
  { name: 'Q7C', year: 2018, tech: 'Curved QLED', res: '4K Ultra HD', hz: 120, basePrice: 22999, nits: 1500, dimming: 120, chip: 'Q Engine 4K', hdr: ['HDR1500', 'HDR10+'], inches: [55, 65] },
  { name: 'Q7F', year: 2018, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 19999, nits: 1500, dimming: 120, chip: 'Q Engine 4K', hdr: ['HDR1500', 'HDR10+'], inches: [49, 55, 65, 75] },
  { name: 'Q6F', year: 2018, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 16999, nits: 1000, dimming: 60, chip: 'Q Engine 4K', hdr: ['HDR1000', 'HDR10+'], inches: [49, 55, 65, 75, 82] },
  { name: 'NU8500', year: 2018, tech: 'Curved UHD', res: '4K Ultra HD', hz: 120, basePrice: 15999, nits: 800, dimming: 0, chip: 'UHD Engine', hdr: ['HDR10+'], inches: [55, 65] },
  { name: 'NU8000', year: 2018, tech: 'UHD LCD', res: '4K Ultra HD', hz: 120, basePrice: 13999, nits: 800, dimming: 0, chip: 'UHD Engine', hdr: ['HDR10+'], inches: [49, 55, 65, 75, 82] },
  { name: 'NU7100', year: 2018, tech: 'UHD LCD', res: '4K Ultra HD', hz: 60, basePrice: 8999, nits: 400, dimming: 0, chip: 'UHD Engine', hdr: ['HDR10'], inches: [43, 49, 50, 55, 65, 75] },

  // --- 2019 ---
  { name: 'Q950R', year: 2019, tech: '8K QLED', res: '8K Ultra HD', hz: 120, basePrice: 79999, nits: 4000, dimming: 480, chip: 'Quantum Processor 8K', hdr: ['HDR4000', 'HDR10+'], inches: [65, 75, 82, 98] },
  { name: 'Q90R', year: 2019, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 36999, nits: 2000, dimming: 480, chip: 'Quantum Processor 4K', hdr: ['HDR2000', 'HDR10+'], inches: [55, 65, 75, 82] },
  { name: 'Q80R', year: 2019, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 26999, nits: 1500, dimming: 96, chip: 'Quantum Processor 4K', hdr: ['HDR1500', 'HDR10+'], inches: [55, 65, 75, 82] },
  { name: 'Q70R', year: 2019, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 20999, nits: 1000, dimming: 48, chip: 'Quantum Processor 4K', hdr: ['HDR1000', 'HDR10+'], inches: [49, 55, 65, 75, 82] },
  { name: 'Q60R', year: 2019, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 14999, nits: 600, dimming: 0, chip: 'Quantum Processor 4K Lite', hdr: ['HDR10+'], inches: [43, 49, 55, 65, 75, 82] },
  { name: 'RU8000', year: 2019, tech: 'UHD LCD', res: '4K Ultra HD', hz: 120, basePrice: 13999, nits: 500, dimming: 0, chip: 'UHD Processor', hdr: ['HDR10+'], inches: [49, 55, 65, 75, 82] },
  { name: 'RU7100', year: 2019, tech: 'UHD LCD', res: '4K Ultra HD', hz: 60, basePrice: 9999, nits: 350, dimming: 0, chip: 'UHD Processor', hdr: ['HDR10+'], inches: [43, 50, 55, 58, 65, 75] },

  // --- 2020 ---
  { name: 'Q950TS', year: 2020, tech: '8K QLED', res: '8K Ultra HD', hz: 120, basePrice: 94999, nits: 3000, dimming: 480, chip: 'Quantum Processor 8K AI', hdr: ['HDR3000', 'HDR10+ Adaptive'], inches: [65, 75, 85] },
  { name: 'Q90T', year: 2020, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 38999, nits: 2000, dimming: 120, chip: 'Quantum Processor 4K', hdr: ['HDR2000', 'HDR10+'], inches: [55, 65, 75, 85] },
  { name: 'Q80T', year: 2020, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 28999, nits: 1500, dimming: 48, chip: 'Quantum Processor 4K', hdr: ['HDR1500', 'HDR10+'], inches: [49, 55, 65, 75, 85] },
  { name: 'Q70T', year: 2020, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 22999, nits: 800, dimming: 0, chip: 'Quantum Processor 4K', hdr: ['HDR10+'], inches: [55, 65, 75, 85] },
  { name: 'Q60T', year: 2020, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 15999, nits: 500, dimming: 0, chip: 'Quantum Processor 4K Lite', hdr: ['HDR10+'], inches: [43, 50, 55, 65, 75, 85] },
  { name: 'TU8000', year: 2020, tech: 'Crystal UHD', res: '4K Ultra HD', hz: 60, basePrice: 14999, nits: 400, dimming: 0, chip: 'Crystal Processor 4K', hdr: ['HDR10+'], inches: [43, 50, 55, 65, 75, 82, 85] },
  { name: 'TU7000', year: 2020, tech: 'Crystal UHD', res: '4K Ultra HD', hz: 60, basePrice: 10999, nits: 350, dimming: 0, chip: 'Crystal Processor 4K', hdr: ['HDR10+'], inches: [43, 50, 55, 58, 65, 70, 75] },

  // --- 2021 ---
  { name: 'QN900A', year: 2021, tech: 'Neo QLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 119999, nits: 4000, dimming: 1920, chip: 'Neo Quantum Processor 8K', hdr: ['HDR4000', 'HDR10+ Adaptive'], inches: [65, 75, 85] },
  { name: 'QN800A', year: 2021, tech: 'Neo QLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 84999, nits: 2000, dimming: 1344, chip: 'Neo Quantum Processor 8K', hdr: ['HDR2000', 'HDR10+ Adaptive'], inches: [65, 75, 85] },
  { name: 'QN90A', year: 2021, tech: 'Neo QLED', res: '4K Ultra HD', hz: 120, basePrice: 42999, nits: 2000, dimming: 792, chip: 'Neo Quantum Processor 4K', hdr: ['HDR2000', 'HDR10+ Adaptive'], inches: [50, 55, 65, 75, 85, 98] },
  { name: 'QN85A', year: 2021, tech: 'Neo QLED', res: '4K Ultra HD', hz: 120, basePrice: 33999, nits: 1500, dimming: 576, chip: 'Neo Quantum Processor 4K', hdr: ['HDR1500', 'HDR10+ Adaptive'], inches: [55, 65, 75, 85] },
  { name: 'Q60A', year: 2021, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 17999, nits: 500, dimming: 0, chip: 'Quantum Processor 4K Lite', hdr: ['HDR10+'], inches: [43, 50, 55, 60, 65, 70, 75, 85] },
  { name: 'AU8000', year: 2021, tech: 'Crystal UHD', res: '4K Ultra HD', hz: 60, basePrice: 16999, nits: 400, dimming: 0, chip: 'Crystal Processor 4K', hdr: ['HDR10+'], inches: [43, 50, 55, 60, 65, 70, 75, 85] },

  // --- 2022 ---
  { name: 'QN900B', year: 2022, tech: 'Neo QLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 139999, nits: 4000, dimming: 1920, chip: 'Neural Quantum Processor 8K', hdr: ['HDR4000', 'HDR10+ Adaptive'], inches: [65, 75, 85] },
  { name: 'QN95B', year: 2022, tech: 'Neo QLED', res: '4K Ultra HD', hz: 144, basePrice: 58999, nits: 2000, dimming: 792, chip: 'Neural Quantum Processor 4K', hdr: ['HDR2000', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },
  { name: 'QN90B', year: 2022, tech: 'Neo QLED', res: '4K Ultra HD', hz: 144, basePrice: 47999, nits: 2000, dimming: 576, chip: 'Neural Quantum Processor 4K', hdr: ['HDR2000', 'HDR10+ Gaming'], inches: [43, 50, 55, 65, 75, 85] },
  { name: 'Q80B', year: 2022, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 34999, nits: 1500, dimming: 48, chip: 'Quantum Processor 4K', hdr: ['HDR1500', 'HDR10+'], inches: [50, 55, 65, 75, 85] },
  { name: 'Q60B', year: 2022, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 20999, nits: 500, dimming: 0, chip: 'Quantum Processor 4K Lite', hdr: ['HDR10+'], inches: [43, 50, 55, 60, 65, 70, 75, 85] },
  { name: 'BU8000', year: 2022, tech: 'Crystal UHD', res: '4K Ultra HD', hz: 60, basePrice: 18999, nits: 400, dimming: 0, chip: 'Crystal Processor 4K', hdr: ['HDR10+'], inches: [43, 50, 55, 60, 65, 70, 75, 85] },

  // --- 2023 ---
  { name: 'S95C', year: 2023, tech: 'QD-OLED', res: '4K Ultra HD', hz: 144, basePrice: 89999, nits: 2000, dimming: 8290000, chip: 'Neural Quantum Processor 4K', hdr: ['OLED HDR+', 'HDR10+ Gaming'], inches: [55, 65, 77] },
  { name: 'S90C', year: 2023, tech: 'QD-OLED', res: '4K Ultra HD', hz: 144, basePrice: 69999, nits: 1500, dimming: 8290000, chip: 'Neural Quantum Processor 4K', hdr: ['OLED HDR', 'HDR10+ Gaming'], inches: [55, 65, 77, 83] },
  { name: 'QN900C', year: 2023, tech: 'Neo QLED 8K', res: '8K Ultra HD', hz: 144, basePrice: 159999, nits: 4000, dimming: 1920, chip: 'Neural Quantum Processor 8K', hdr: ['HDR4000', 'HDR10+ Gaming'], inches: [65, 75, 85] },
  { name: 'QN90C', year: 2023, tech: 'Neo QLED', res: '4K Ultra HD', hz: 144, basePrice: 53999, nits: 2000, dimming: 576, chip: 'Neural Quantum Processor 4K', hdr: ['HDR2000', 'HDR10+ Gaming'], inches: [43, 50, 55, 65, 75, 85] },
  { name: 'Q80C', year: 2023, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 38999, nits: 1500, dimming: 96, chip: 'Neural Quantum Processor 4K', hdr: ['HDR1500', 'HDR10+'], inches: [50, 55, 65, 75, 85, 98] },
  { name: 'CU8000', year: 2023, tech: 'Crystal UHD', res: '4K Ultra HD', hz: 60, basePrice: 22999, nits: 400, dimming: 0, chip: 'Crystal Processor 4K', hdr: ['HDR10+'], inches: [43, 50, 55, 65, 75, 85] },

  // --- 2024 ---
  { name: 'S95D', year: 2024, tech: 'QD-OLED', res: '4K Ultra HD', hz: 144, basePrice: 114999, nits: 2500, dimming: 8290000, chip: 'NQ4 AI Gen2 Processor', hdr: ['OLED HDR Pro', 'HDR10+ Gaming'], inches: [55, 65, 77] },
  { name: 'S90D', year: 2024, tech: 'QD-OLED', res: '4K Ultra HD', hz: 144, basePrice: 84999, nits: 1800, dimming: 8290000, chip: 'NQ4 AI Gen2 Processor', hdr: ['OLED HDR+', 'HDR10+ Gaming'], inches: [48, 55, 65, 77, 83] },
  { name: 'QN900D', year: 2024, tech: 'Neo QLED 8K', res: '8K Ultra HD', hz: 240, basePrice: 199999, nits: 4500, dimming: 2304, chip: 'NQ8 AI Gen3 Processor (512 Neural Networks)', hdr: ['HDR4500', 'HDR10+ Gaming'], inches: [65, 75, 85] },
  { name: 'QN90D', year: 2024, tech: 'Neo QLED', res: '4K Ultra HD', hz: 144, basePrice: 64999, nits: 2200, dimming: 792, chip: 'NQ4 AI Gen2 Processor', hdr: ['HDR2200', 'HDR10+ Gaming'], inches: [43, 50, 55, 65, 75, 85, 98] },
  { name: 'Q80D', year: 2024, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 44999, nits: 1500, dimming: 96, chip: 'NQ4 AI Gen2 Processor', hdr: ['HDR1500', 'HDR10+'], inches: [50, 55, 65, 75, 85] },
  { name: 'DU8000', year: 2024, tech: 'Crystal UHD', res: '4K Ultra HD', hz: 60, basePrice: 26999, nits: 450, dimming: 0, chip: 'Crystal Processor 4K', hdr: ['HDR10+'], inches: [43, 50, 55, 65, 75, 85] },

  // --- 2025 ---
  { name: 'S95F', year: 2025, tech: 'QD-OLED', res: '4K Ultra HD', hz: 165, basePrice: 144999, nits: 3000, dimming: 8290000, chip: 'NQ4 AI Gen4 Processor', hdr: ['OLED HDR Pro Max', 'HDR10+ Gaming 165Hz'], inches: [55, 65, 77, 83] },
  { name: 'S90F', year: 2025, tech: 'QD-OLED', res: '4K Ultra HD', hz: 165, basePrice: 99999, nits: 2200, dimming: 8290000, chip: 'NQ4 AI Gen4 Processor', hdr: ['OLED HDR Pro', 'HDR10+ Gaming 165Hz'], inches: [48, 55, 65, 77, 83] },
  { name: 'QN90F', year: 2025, tech: 'Neo QLED', res: '4K Ultra HD', hz: 165, basePrice: 79999, nits: 2500, dimming: 1024, chip: 'NQ4 AI Gen4 Processor', hdr: ['HDR2500', 'HDR10+ Gaming'], inches: [43, 50, 55, 65, 75, 85, 98] },
  { name: 'Q80F', year: 2025, tech: 'QLED', res: '4K Ultra HD', hz: 120, basePrice: 51999, nits: 1600, dimming: 120, chip: 'NQ4 AI Gen4 Processor', hdr: ['HDR1600', 'HDR10+'], inches: [50, 55, 65, 75, 85] },
  { name: 'Q7FA', year: 2025, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 35999, nits: 700, dimming: 0, chip: 'Quantum Processor 4K Lite', hdr: ['HDR10+'], inches: [43, 50, 55, 65, 75] },

  // --- 2026 ---
  { name: 'S95H', year: 2026, tech: 'QD-OLED', res: '4K Ultra HD', hz: 165, basePrice: 174999, nits: 3500, dimming: 8290000, chip: 'NQ4 AI Gen5 Neural Engine', hdr: ['OLED HDR Ultimate 3500', 'HDR10+ Gaming 165Hz'], inches: [55, 65, 77, 83] },
  { name: 'S90H', year: 2026, tech: 'QD-OLED', res: '4K Ultra HD', hz: 165, basePrice: 124999, nits: 2500, dimming: 8290000, chip: 'NQ4 AI Gen5 Neural Engine', hdr: ['OLED HDR Ultimate', 'HDR10+ Gaming 165Hz'], inches: [48, 55, 65, 77, 83] },
  { name: 'QN80H', year: 2026, tech: 'Neo QLED', res: '4K Ultra HD', hz: 165, basePrice: 94999, nits: 2800, dimming: 1536, chip: 'NQ4 AI Gen5 Neural Engine', hdr: ['HDR2800', 'HDR10+ Gaming'], inches: [50, 55, 65, 75, 85, 98] },
  { name: 'QN70H', year: 2026, tech: 'Neo QLED', res: '4K Ultra HD', hz: 144, basePrice: 69999, nits: 2000, dimming: 768, chip: 'NQ4 AI Gen5 Neural Engine', hdr: ['HDR2000', 'HDR10+ Gaming'], inches: [43, 50, 55, 65, 75] },
  { name: 'R95H', year: 2026, tech: 'Micro RGB', res: '4K Ultra HD', hz: 165, basePrice: 529999, nits: 5000, dimming: 24960000, chip: 'Micro RGB Neural Matrix Chip', hdr: ['Micro RGB Ultimate HDR', 'Dolby Vision IQ', 'HDR10+'], inches: [76, 85, 98, 114] }
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

function getStudioMockupImage(tech, name) {
  if (tech === 'QD-OLED' || name.includes('S95') || name.includes('S90')) {
    return '/images/tvs/qd_oled.jpg';
  }
  if (tech === 'Micro RGB' || name.includes('R95')) {
    return '/images/tvs/micro_rgb.jpg';
  }
  if (tech.includes('Neo') || tech.includes('8K') || name.includes('QN900')) {
    return '/images/tvs/neo_qled.jpg';
  }
  return '/images/tvs/neo_qled.jpg';
}

const generatedSamsungTVs = [];
let modelIndex = 1;

samsungSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `Samsung ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} ${series.hz}Hz ${series.res.includes('8K') ? '8K' : '4K'} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `samsung-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 98 ? 2.5 : (inch >= 85 ? 1.6 : (inch >= 75 ? 1.3 : (inch >= 65 ? 1.15 : (inch === 55 ? 1.0 : (inch === 48 || inch === 50 ? 0.85 : 0.75)))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('OLED') || series.tech.includes('8K') || series.tech.includes('Micro') || series.name.includes('QN900') || series.name.includes('S95');
    const rating = isFlagship ? Number((4.8 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.5 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(110 + (modelIndex * 31) % 680);
    const image = getStudioMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-samtv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi Distribütör', 'Ücretsiz Kurulum'],
        sellerRating: 4.9,
        sellerReviews: 19800,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-samtv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi Garanti', 'Vatan Kurulum'],
        sellerRating: 4.8,
        sellerReviews: 16400,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-samtv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Teslimat', 'Kupon Fırsatı'],
        sellerRating: 4.8,
        sellerReviews: 26200,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-samtv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Peşin Fiyatına Taksit'],
        sellerRating: 4.7,
        sellerReviews: 31200,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedSamsungTVs.push({
      id,
      slug,
      name: fullName,
      brand: "Samsung",
      category: "tvs",
      image,
      basePrice: price,
      currency: "TL",
      rating,
      reviewCount,
      releaseYear: series.year,
      isPopular: isFlagship || series.year >= 2023,
      isFeatured: isFlagship && series.year >= 2024,
      tags: [
        `${series.year} Serisi`,
        `${inch}" Ekran`,
        `${series.tech}`,
        series.res.includes('8K') ? '8K Ultra HD' : '4K Ultra HD',
        `${series.hz}Hz Gaming`
      ],
      ssIndexRatio: isFlagship ? 98 : 88,
      highlights: [
        `${inch}" ${cmVal} cm ${series.tech} Panel (${series.year})`,
        `${series.nits} Nits Zirve Parlaklık & ${series.hz}Hz Yenileme Hızı`,
        `${series.chip} Yapay Zeka İşlemcisi`,
        `Dolby Atmos & OTS Pro Ses Teknolojisi`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: "Tizen OS (Samsung Gaming Hub)",
        audioPowerWatts: isFlagship ? 70 : 40,
        brightnessNits: series.nits,
        localDimmingZones: series.dimming,
        processorEngine: series.chip,
        hdrSupport: series.hdr,
        gamingFeatures: [
          `4K @ ${series.hz}Hz VRR`,
          "AMD FreeSync Premium Pro",
          "Samsung Gaming Hub (Xbox Pass / GeForce Now)",
          "ALLM (Auto Low Latency Mode)"
        ],
        hdmiPorts: 4,
        usbPorts: 3,
        energyClass: "G"
      },
      storeOffers,
      priceHistory
    });
  });
});

// Read existing mockTVs.ts
const mockTVsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
let fileContent = fs.readFileSync(mockTVsPath, 'utf-8');

const existingTVsMatch = fileContent.match(/export const mockTVs: TVProduct\[\] = (\[[\s\S]*?\]);/);

if (!existingTVsMatch) {
  console.error("Could not match mockTVs array in mockTVs.ts!");
  process.exit(1);
}

const existingTVs = JSON.parse(existingTVsMatch[1]);
console.log(`Current TV count in mockTVs.ts: ${existingTVs.length}`);

// Remove older Samsung entries to replace with our exhaustive multi-inch Samsung TV catalog
const nonSamsungTVs = existingTVs.filter(t => t.brand !== 'Samsung');
const combinedTVs = [...nonSamsungTVs, ...generatedSamsungTVs];

console.log(`Generated ${generatedSamsungTVs.length} exhaustive Samsung TV inch-size models (2018-2026) with AI studio mockups!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const updatedArrayCode = `export const mockTVs: TVProduct[] = ${JSON.stringify(combinedTVs, null, 2)};`;

fileContent = fileContent.replace(/export const mockTVs: TVProduct\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockTVsPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with AI studio mockups for Samsung!");
