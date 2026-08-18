const fs = require('fs');
const path = require('path');

const hisenseSeriesList = [
  // --- 2018 (H Series & Laser TV) ---
  { name: 'H6', year: 2018, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 8999, chip: 'Hisense Hi-View Engine', hdr: ['HDR10'], inches: [55, 65] },
  { name: 'H8', year: 2018, tech: 'ULED Local Dimming', res: '4K Ultra HD', hz: 60, basePrice: 11999, chip: 'Hi-View Engine', hdr: ['HDR10', 'Dolby Vision'], inches: [55, 65, 75] },
  { name: 'H9', year: 2018, tech: 'ULED Premium', res: '4K Ultra HD', hz: 120, basePrice: 16999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision', 'HDR10'], inches: [55, 65, 75] },
  { name: 'H9 Plus', year: 2018, tech: 'ULED 120Hz Native', res: '4K Ultra HD', hz: 120, basePrice: 19999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision', 'HDR10'], inches: [55, 65, 75] },
  { name: 'H10 Amiral Gemisi', year: 2018, tech: 'Quantum Dot ULED (1000 Nits)', res: '4K Ultra HD', hz: 120, basePrice: 27999, chip: 'Hi-View Master Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [65, 75] },
  { name: '100L8D Laser TV', year: 2018, tech: 'Laser TV 4K Projection', res: '4K Ultra HD', hz: 60, basePrice: 69999, chip: 'Laser Cinema Engine', hdr: ['HDR10'], inches: [100] },

  // --- 2019 - 2020 (H8F, H9F, U7QF, U8QF) ---
  { name: 'H8F', year: 2019, tech: 'ULED Quantum', res: '4K Ultra HD', hz: 60, basePrice: 13999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision', 'HDR10+'], inches: [50, 55, 65] },
  { name: 'H9F', year: 2019, tech: 'ULED 120Hz (1000 Nits)', res: '4K Ultra HD', hz: 120, basePrice: 19999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision', 'HDR10+'], inches: [55, 65, 75] },
  { name: 'U7QF', year: 2020, tech: 'ULED Quantum Dot', res: '4K Ultra HD', hz: 60, basePrice: 14999, chip: 'Hi-View Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 65] },
  { name: 'U8QF', year: 2020, tech: 'ULED Mini-LED (1500 Nits)', res: '4K Ultra HD', hz: 120, basePrice: 24999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision Atmos', 'HDR10+'], inches: [55, 65, 75] },

  // --- 2021 (A6G, U6G, U7G, U8G) ---
  { name: 'A6G', year: 2021, tech: 'Smart UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 11999, chip: 'VIDAA U5 Engine', hdr: ['HDR10'], inches: [50, 55, 65, 75] },
  { name: 'U6G', year: 2021, tech: 'ULED Quantum Dot', res: '4K Ultra HD', hz: 60, basePrice: 16999, chip: 'Hi-View Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [50, 55, 65, 75] },
  { name: 'U7G', year: 2021, tech: 'ULED 120Hz Gaming', res: '4K Ultra HD', hz: 120, basePrice: 23999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [55, 65, 75] },
  { name: 'U8G', year: 2021, tech: 'ULED 120Hz (1500 Nits)', res: '4K Ultra HD', hz: 120, basePrice: 32999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [55, 65, 75] },

  // --- 2022 ("H" Kodlu) ---
  { name: 'A6H', year: 2022, tech: 'Google TV UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 13999, chip: 'VIDAA U6 Engine', hdr: ['HDR10'], inches: [55, 65, 75] },
  { name: 'U6H', year: 2022, tech: 'ULED Quantum Dot', res: '4K Ultra HD', hz: 60, basePrice: 19999, chip: 'Hi-View Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [55, 65, 75] },
  { name: 'U8H', year: 2022, tech: 'ULED Mini-LED 120Hz (1500 Nits)', res: '4K Ultra HD', hz: 120, basePrice: 37999, chip: 'Hi-View Engine Pro', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },

  // --- 2023 ("K" Kodlu) ---
  { name: 'A6K', year: 2023, tech: 'Smart UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 14999, chip: 'VIDAA U7 Engine', hdr: ['HDR10'], inches: [32, 50, 55, 65, 75, 85] },
  { name: 'U6K', year: 2023, tech: 'Mini-LED Quantum Dot', res: '4K Ultra HD', hz: 60, basePrice: 22999, chip: 'Hi-View Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [50, 55, 65, 75, 85] },
  { name: 'U7K', year: 2023, tech: 'Mini-LED 144Hz Gaming', res: '4K Ultra HD', hz: 144, basePrice: 34999, chip: 'Hi-View Engine PRO', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },
  { name: 'U8K', year: 2023, tech: 'Mini-LED 144Hz (1500 Nits)', res: '4K Ultra HD', hz: 144, basePrice: 48999, chip: 'Hi-View Engine PRO', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },

  // --- 2024 ("N" Kodlu) ---
  { name: 'A6N', year: 2024, tech: 'Google TV UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 18999, chip: 'VIDAA U7 Engine', hdr: ['HDR10+'], inches: [55, 65, 75, 85] },
  { name: 'U7N', year: 2024, tech: 'Mini-LED PRO 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 39999, chip: 'Hi-View Engine PRO', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85, 100] },
  { name: 'U8N', year: 2024, tech: 'Mini-LED PRO 3000 Nits 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 62999, chip: 'Hi-View Engine PRO (5,000 Zones)', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85, 100] },

  // --- 2025 ("Q" Kodlu) ---
  { name: 'QD6QF', year: 2025, tech: 'Fire TV QLED', res: '4K Ultra HD', hz: 60, basePrice: 21999, chip: 'Hi-View AI Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [55, 65, 75] },
  { name: 'U65QF', year: 2025, tech: 'Mini-LED QLED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 35999, chip: 'Hi-View AI Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },
  { name: 'U8QG', year: 2025, tech: 'Mini-LED PRO 4000 Nits 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 79999, chip: 'Hi-View Engine AI Neural', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55, 65, 75, 85, 100] },

  // --- 2026 ("S" Kodlu / RGB Mini-LED & Micro-LED) ---
  { name: 'E7S', year: 2026, tech: 'QLED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 32999, chip: 'Hi-View Engine AI Neural', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [50, 55, 65, 75] },
  { name: 'E7S Pro', year: 2026, tech: 'QLED PRO 165Hz Gaming', res: '4K Ultra HD', hz: 165, basePrice: 42999, chip: 'Hi-View Engine AI Neural', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },
  { name: 'E8S', year: 2026, tech: 'RGB Mini-LED 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 58999, chip: 'Hi-View Engine AI Neural', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55, 65, 75, 85, 100] },
  { name: 'U6S', year: 2026, tech: 'Mini-LED QLED 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 49999, chip: 'Hi-View Engine AI Neural', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },
  { name: 'U7S Pro', year: 2026, tech: 'RGB Mini-LED 165Hz (3500 Nits)', res: '4K Ultra HD', hz: 165, basePrice: 74999, chip: 'Hi-View Engine AI Neural', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55, 65, 75, 85, 100, 116] },
  { name: 'UR8S', year: 2026, tech: 'RGB Mini-LED 5000 Nits 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 119999, chip: 'Hi-View Master AI Neural (10,000 Zones)', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [65, 75, 85, 100, 116] },
  { name: 'UR9S', year: 2026, tech: 'RGB Mini-LED 8000 Nits 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 189999, chip: 'Hi-View Master AI Neural (20,000 Zones)', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [75, 85, 100, 116] },
  { name: 'M136 Micro-LED Laser TV', year: 2026, tech: 'Micro-LED Laser Cinema 136"', res: '4K Ultra HD', hz: 165, basePrice: 499999, chip: 'Micro-LED Master Matrix Engine', hdr: ['Micro-LED Master HDR', 'Dolby Vision IQ Max'], inches: [136] }
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

function getHisenseMockupImage(tech, name) {
  if (name.includes('Micro-LED') || name.includes('100L8D') || name.includes('UR9S')) {
    return '/images/tvs/micro_rgb.jpg';
  }
  if (tech.includes('Mini') || tech.includes('ULED') || tech.includes('RGB')) {
    return '/images/tvs/neo_qled.jpg';
  }
  if (tech.includes('OLED')) {
    return '/images/tvs/qd_oled.jpg';
  }
  return '/images/tvs/neo_qled.jpg';
}

const generatedHisenseTVs = [];
let modelIndex = 1;

hisenseSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `Hisense ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `hisense-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 136 ? 4.5 : (inch >= 116 ? 3.5 : (inch >= 100 ? 2.6 : (inch >= 85 ? 1.6 : (inch >= 75 ? 1.35 : (inch >= 65 ? 1.15 : (inch === 55 ? 1.0 : 0.85))))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('Mini') || series.tech.includes('Micro') || series.tech.includes('RGB') || series.name.includes('UR') || series.name.includes('U8') || series.name.includes('H10');
    const rating = isFlagship ? Number((4.8 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.5 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(110 + (modelIndex * 23) % 650);
    const image = getHisenseMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-hisensetv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi Hisense Türkiye Distribütörü', 'Ücretsiz Kurulum'],
        sellerRating: 4.9,
        sellerReviews: 21500,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-hisensetv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['Hisense Yetkili Bayi', 'Vatan Güvencesi'],
        sellerRating: 4.8,
        sellerReviews: 17800,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-hisensetv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Kargo', 'Puan Kazan'],
        sellerRating: 4.8,
        sellerReviews: 28100,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-hisensetv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Taksit Avantajı'],
        sellerRating: 4.7,
        sellerReviews: 31900,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedHisenseTVs.push({
      id,
      slug,
      name: fullName,
      brand: "Hisense",
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
        '4K Ultra HD',
        `${series.hz}Hz Gaming`
      ],
      ssIndexRatio: isFlagship ? 98 : 88,
      highlights: [
        `${inch}" ${cmVal} cm ${series.tech} Panel (${series.year})`,
        `${series.hz}Hz Yenileme Hızı & Game Mode PRO`,
        `${series.chip} İşlemci`,
        `VIDAA / Google TV Akıllı Platform & Dolby Atmos`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: series.year >= 2022 ? "VIDAA / Google TV" : "VIDAA OS",
        audioPowerWatts: isFlagship ? 60 : 20,
        processorEngine: series.chip,
        hdrSupport: series.hdr,
        gamingFeatures: [
          `4K @ ${series.hz}Hz VRR`,
          "AMD FreeSync Premium Pro",
          "Game Bar 3.0",
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
const fileContent = fs.readFileSync(mockTVsPath, 'utf-8');

// Extract current JSON data using regex matching
const jsonMatch = fileContent.match(/const tvData: any\[\] = (\[[\s\S]*?\]);\s*export const mockTVs/);

let existingTVs = [];
if (jsonMatch) {
  existingTVs = JSON.parse(jsonMatch[1]);
} else {
  // Fallback match for standard export
  const match2 = fileContent.match(/export const mockTVs: TVProduct\[\] = (\[[\s\S]*?\]);/);
  if (match2) existingTVs = JSON.parse(match2[1]);
}

console.log(`Current TV count in mockTVs.ts: ${existingTVs.length}`);

// Remove existing Hisense TVs to overwrite cleanly
const nonHisenseTVs = existingTVs.filter(t => t.brand !== 'Hisense');
const combinedTVs = [...nonHisenseTVs, ...generatedHisenseTVs];

console.log(`Generated ${generatedHisenseTVs.length} exhaustive Hisense TV models!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const fileOutput = `import { TVProduct } from './types';\n\nconst tvData: any[] = ${JSON.stringify(combinedTVs, null, 2)};\n\nexport const mockTVs: TVProduct[] = tvData as TVProduct[];\n`;

fs.writeFileSync(mockTVsPath, fileOutput, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with TS2590 workaround!");
