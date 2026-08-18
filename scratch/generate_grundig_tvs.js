const fs = require('fs');
const path = require('path');

const grundigSeriesList = [
  // --- 2018 - 2019 (VLX & VLO OLED) ---
  { name: 'VLX 7850', year: 2018, tech: 'Smart UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 5999, chip: 'Grundig Vision Engine', hdr: ['HDR10'], inches: [24, 32, 40, 43, 49, 50, 55, 65] },
  { name: 'VLO 9895', year: 2019, tech: 'OLED 4K', res: '4K Ultra HD', hz: 120, basePrice: 24999, chip: 'Grundig Vision Master Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [55, 65] },

  // --- 2020 - 2022 (GFU, GEU, GGU Android & Google TV) ---
  { name: 'GFU 7800', year: 2020, tech: 'Android TV 4K', res: '4K Ultra HD', hz: 60, basePrice: 9999, chip: 'Quad Core Processor', hdr: ['HDR10+'], inches: [40, 43, 50, 55, 65] },
  { name: 'GEU 8910B', year: 2021, tech: 'Smart 4K UHD', res: '4K Ultra HD', hz: 60, basePrice: 11999, chip: 'Grundig AI Vision Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 58, 65] },
  { name: 'GGU 8960B', year: 2022, tech: 'Android TV 4K Ultra', res: '4K Ultra HD', hz: 60, basePrice: 14999, chip: 'Grundig Quad Core Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 58, 65, 75] },

  // --- 2023 - 2024 (GHU, GJQ Google TV & QLED) ---
  { name: 'GHU 8500A', year: 2023, tech: 'Google TV 4K', res: '4K Ultra HD', hz: 60, basePrice: 16999, chip: 'Google TV AI Processor', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 58, 65, 75] },
  { name: 'GJQ 9200', year: 2024, tech: 'Google TV QLED 120Hz', res: '4K Ultra HD', hz: 120, basePrice: 24999, chip: 'Grundig Quantum AI Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [50, 55, 65, 75] },

  // --- 2025 - 2026 (GQ QLED & GO OLED) ---
  { name: 'GQ 700A', year: 2025, tech: 'Google TV QLED', res: '4K Ultra HD', hz: 60, basePrice: 19999, chip: 'Grundig Quantum Engine Gen 2', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 65] },
  { name: 'GQ 850A', year: 2025, tech: 'QLED 144Hz Gaming', res: '4K Ultra HD', hz: 144, basePrice: 32999, chip: 'Grundig Quantum Neural Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75] },
  { name: 'GO 990A', year: 2026, tech: 'OLED 165Hz Master', res: '4K Ultra HD', hz: 165, basePrice: 54999, chip: 'Grundig Quantum Neural OLED Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55, 65, 77] }
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

function getGrundigMockupImage(tech, name) {
  if (tech.includes('OLED') || name.includes('GO 990A') || name.includes('VLO 9895')) {
    return '/images/tvs/qd_oled.jpg';
  }
  if (tech.includes('QLED') || name.includes('GJQ') || name.includes('GQ')) {
    return '/images/tvs/neo_qled.jpg';
  }
  return '/images/tvs/neo_qled.jpg';
}

const generatedGrundigTVs = [];
let modelIndex = 1;

grundigSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `Grundig ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `grundig-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 77 ? 2.5 : (inch >= 75 ? 1.4 : (inch >= 65 ? 1.15 : (inch === 58 ? 1.05 : (inch === 55 ? 1.0 : (inch === 50 ? 0.88 : (inch === 43 ? 0.75 : 0.55))))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('OLED') || series.tech.includes('QLED 144Hz') || series.name.startsWith('GO 990A');
    const rating = isFlagship ? Number((4.7 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.4 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(120 + (modelIndex * 17) % 520);
    const image = getGrundigMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-grundigtv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi Grundig / Arçelik Distribütörü', 'Ücretsiz Kurulum'],
        sellerRating: 4.9,
        sellerReviews: 23100,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-grundigtv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['Grundig Yetkili Bayi', 'Arçelik Garanti'],
        sellerRating: 4.8,
        sellerReviews: 18400,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-grundigtv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Kargo', 'Kupon Avantajı'],
        sellerRating: 4.8,
        sellerReviews: 29800,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-grundigtv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Peşin Fiyatına Taksit'],
        sellerRating: 4.7,
        sellerReviews: 34900,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedGrundigTVs.push({
      id,
      slug,
      name: fullName,
      brand: "Grundig",
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
        `${series.hz}Hz Yenileme Hızı & Vision Engine`,
        `${series.chip}`,
        `Alman Tasarımı & Arçelik 3 Yıl Garanti`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: series.year >= 2023 ? "Google TV" : (series.year >= 2020 ? "Android TV" : "Grundig Vision OS"),
        audioPowerWatts: isFlagship ? 50 : 20,
        processorEngine: series.chip,
        hdrSupport: series.hdr,
        gamingFeatures: [
          `4K @ ${series.hz}Hz VRR`,
          "ALLM (Auto Low Latency Mode)",
          "Grundig Game Mode"
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

// Remove existing Grundig TVs to overwrite cleanly
const nonGrundigTVs = existingTVs.filter(t => t.brand !== 'Grundig');
const combinedTVs = [...nonGrundigTVs, ...generatedGrundigTVs];

console.log(`Generated ${generatedGrundigTVs.length} exhaustive Grundig TV models!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const fileOutput = `import { TVProduct } from './types';\n\nconst tvData: any[] = ${JSON.stringify(combinedTVs, null, 2)};\n\nexport const mockTVs: TVProduct[] = tvData as TVProduct[];\n`;

fs.writeFileSync(mockTVsPath, fileOutput, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with all Grundig TV 2018-2026 models!");
