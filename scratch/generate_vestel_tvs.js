const fs = require('fs');
const path = require('path');

const vestelSeriesList = [
  // --- 2018 - 2019 (F7500, U9500, UA9800) ---
  { name: 'F7500', year: 2018, tech: 'Smart LED', res: 'Full HD', hz: 60, basePrice: 4999, chip: 'Vestel Smart Core', hdr: ['HDR10'], inches: [24, 32, 40, 43] },
  { name: 'U9500', year: 2018, tech: '4K Ultra HD LED', res: '4K Ultra HD', hz: 60, basePrice: 7999, chip: 'Vestel 4K Engine', hdr: ['HDR10', 'Dolby Vision'], inches: [43, 50, 55, 65] },
  { name: 'UA9800', year: 2019, tech: 'Android TV 4K', res: '4K Ultra HD', hz: 60, basePrice: 9999, chip: 'Quad Core Processor', hdr: ['Dolby Vision', 'HDR10'], inches: [43, 50, 55, 65, 75] },

  // --- 2020 - 2022 (Q9900, O9900, UA9600, U9600) ---
  { name: 'UA9600', year: 2020, tech: 'Android TV 4K', res: '4K Ultra HD', hz: 60, basePrice: 11999, chip: 'Quad Core Processor', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 58, 65] },
  { name: 'U9600', year: 2021, tech: 'Smart 4K UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 12999, chip: 'Vestel Master 4K Processor', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 58, 65, 75] },
  { name: 'Q9900', year: 2021, tech: 'QLED 4K', res: '4K Ultra HD', hz: 60, basePrice: 15999, chip: 'Vestel QLED Color Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [50, 55, 65, 75] },
  { name: 'O9900', year: 2022, tech: 'OLED 4K (120Hz)', res: '4K Ultra HD', hz: 120, basePrice: 28999, chip: 'Vestel OLED Master Processor', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [55, 65] },

  // --- 2023 - 2026 (UG9750, UA9740, UT9760, QG9840, QO9950, UM9800) ---
  { name: 'UA9740', year: 2023, tech: 'Android TV 4K', res: '4K Ultra HD', hz: 60, basePrice: 13999, chip: 'AIPQ Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [24, 32, 40, 43, 50, 55, 58, 65] },
  { name: 'UG9750', year: 2023, tech: 'Google TV 4K', res: '4K Ultra HD', hz: 60, basePrice: 16999, chip: 'Google TV AI Processor', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 58, 65, 75] },
  { name: 'QG9840', year: 2024, tech: 'Google TV QLED 120Hz', res: '4K Ultra HD', hz: 120, basePrice: 23999, chip: 'Vestel QLED AI Processor', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [50, 55, 65, 75, 85] },
  { name: 'UT9760', year: 2024, tech: 'Powered by TiVo 4K', res: '4K Ultra HD', hz: 60, basePrice: 17999, chip: 'TiVo Smart Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 58, 65, 75] },
  { name: 'UM9800', year: 2025, tech: 'Mini-LED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 38999, chip: 'Vestel Mini-LED Master Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },
  { name: 'QO9950', year: 2026, tech: 'OLED evo 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 59999, chip: 'Vestel Quantum Neural OLED Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55, 65, 77, 83] },
  { name: 'UG9980 Flagship', year: 2026, tech: 'QD-Mini LED 165Hz 3000 Nits', res: '4K Ultra HD', hz: 165, basePrice: 74999, chip: 'Vestel Master Matrix Neural Processor', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [65, 75, 85, 98] }
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

function getVestelMockupImage(tech, name) {
  if (tech.includes('OLED') || name.includes('QO9950')) {
    return '/images/tvs/qd_oled.jpg';
  }
  if (tech.includes('Mini-LED') || tech.includes('QLED') || name.includes('UG9980')) {
    return '/images/tvs/neo_qled.jpg';
  }
  return '/images/tvs/neo_qled.jpg';
}

const generatedVestelTVs = [];
let modelIndex = 1;

vestelSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `Vestel ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `vestel-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 98 ? 3.0 : (inch >= 85 ? 2.2 : (inch >= 75 ? 1.4 : (inch >= 65 ? 1.15 : (inch === 58 ? 1.05 : (inch === 55 ? 1.0 : (inch === 50 ? 0.88 : (inch === 43 ? 0.75 : 0.55)))))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('OLED') || series.tech.includes('Mini-LED') || series.name.startsWith('UG9980') || series.name.startsWith('QO9950');
    const rating = isFlagship ? Number((4.7 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.4 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(140 + (modelIndex * 19) % 590);
    const image = getVestelMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-vesteltv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi Vestel Türkiye Distribütörü', 'Ücretsiz Montaj'],
        sellerRating: 4.9,
        sellerReviews: 24500,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-vesteltv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['Vestel Yetkili Satıcı', 'Yerli Üretim Garanti'],
        sellerRating: 4.8,
        sellerReviews: 19800,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-vesteltv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Teslimat', 'Taksit Fırsatı'],
        sellerRating: 4.8,
        sellerReviews: 31200,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-vesteltv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Peşin Fiyatına Taksit'],
        sellerRating: 4.7,
        sellerReviews: 36400,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedVestelTVs.push({
      id,
      slug,
      name: fullName,
      brand: "Vestel",
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
        series.res,
        `${series.hz}Hz Refresh`
      ],
      ssIndexRatio: isFlagship ? 96 : 85,
      highlights: [
        `${inch}" ${cmVal} cm ${series.tech} Panel (${series.year})`,
        `${series.hz}Hz Yenileme Hızı & Pixellence PRO`,
        `${series.chip}`,
        `Yerli Üretim 3 Yıl Vestel Garantisi`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: series.year >= 2024 ? "Google TV / TiVo OS" : (series.year >= 2020 ? "Android TV" : "Vestel Smart TV OS"),
        audioPowerWatts: isFlagship ? 50 : 20,
        processorEngine: series.chip,
        hdrSupport: series.hdr,
        gamingFeatures: [
          `4K @ ${series.hz}Hz VRR`,
          "ALLM (Auto Low Latency Mode)",
          "Vestel Game Mode PRO"
        ],
        hdmiPorts: 3,
        usbPorts: 2,
        energyClass: "F"
      },
      storeOffers,
      priceHistory
    });
  });
});

// Read existing mockTVs.ts
const mockTVsPath = path.join(__dirname, '../src/lib/mockTVs.ts');
const fileContent = fs.readFileSync(mockTVsPath, 'utf-8');

const jsonMatch = fileContent.match(/const tvData: any\[\] = (\[[\s\S]*?\]);\s*export const mockTVs/);

let existingTVs = [];
if (jsonMatch) {
  existingTVs = JSON.parse(jsonMatch[1]);
} else {
  const match2 = fileContent.match(/export const mockTVs: TVProduct\[\] = (\[[\s\S]*?\]);/);
  if (match2) existingTVs = JSON.parse(match2[1]);
}

console.log(`Current TV count in mockTVs.ts: ${existingTVs.length}`);

// Remove existing Vestel TVs to overwrite cleanly
const nonVestelTVs = existingTVs.filter(t => t.brand !== 'Vestel');
const combinedTVs = [...nonVestelTVs, ...generatedVestelTVs];

console.log(`Generated ${generatedVestelTVs.length} exhaustive Vestel TV models!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const fileOutput = `import { TVProduct } from './types';\n\nconst tvData: any[] = ${JSON.stringify(combinedTVs, null, 2)};\n\nexport const mockTVs: TVProduct[] = tvData as TVProduct[];\n`;

fs.writeFileSync(mockTVsPath, fileOutput, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with all Vestel TV 2018-2026 models!");
