const fs = require('fs');
const path = require('path');

const onvoSeriesList = [
  // --- 24 Inch ---
  { name: 'OV6000H', year: 2022, tech: 'Caravan HD Ready Smart', res: 'HD Ready', hz: 60, basePrice: 4299, chip: 'Onvo Smart Core', hdr: ['HDR10'], inches: [24] },
  { name: 'OV6001H', year: 2024, tech: 'Android TV Caravan 12V/220V', res: 'HD Ready', hz: 60, basePrice: 4899, chip: 'Onvo Android Core', hdr: ['HDR10'], inches: [24] },

  // --- 32 Inch ---
  { name: 'OV6000H', year: 2022, tech: 'Smart Android TV', res: 'HD Ready', hz: 60, basePrice: 5499, chip: 'Onvo Smart Core', hdr: ['HDR10'], inches: [32] },
  { name: 'OVM6500X', year: 2023, tech: 'Dokunmatik Ayaklı Taşınabilir Smart', res: 'Full HD', hz: 60, basePrice: 12999, chip: 'Onvo Touch Smart Engine', hdr: ['HDR10'], inches: [32] },
  { name: 'OV32F300', year: 2025, tech: 'Google TV 32"', res: 'Full HD', hz: 60, basePrice: 6999, chip: 'Google TV Engine', hdr: ['HDR10'], inches: [32] },

  // --- 40 / 42 / 43 Inch ---
  { name: 'VQ80F2FA', year: 2023, tech: 'WhaleOS Full HD Smart', res: 'Full HD', hz: 60, basePrice: 7999, chip: 'WhaleOS Engine', hdr: ['HDR10'], inches: [40, 42] },
  { name: 'VQ80F3FA', year: 2024, tech: 'Android TV QLED 4K', res: '4K Ultra HD', hz: 60, basePrice: 10999, chip: 'Onvo QLED Engine', hdr: ['Dolby Vision', 'HDR10'], inches: [43] },
  { name: 'OVF8000Q', year: 2025, tech: 'Google TV QLED 43"', res: '4K Ultra HD', hz: 60, basePrice: 12999, chip: 'Google TV AI Core', hdr: ['Dolby Vision', 'HDR10+'], inches: [43] },

  // --- 50 Inch ---
  { name: 'OVF9001UQ', year: 2023, tech: '4K QLED Android TV', res: '4K Ultra HD', hz: 60, basePrice: 13999, chip: 'Onvo 4K AI Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [50] },
  { name: 'VQ90F3UA', year: 2024, tech: 'Google TV 4K QLED', res: '4K Ultra HD', hz: 60, basePrice: 15999, chip: 'Google TV Engine Pro', hdr: ['Dolby Vision', 'HDR10+'], inches: [50] },
  { name: 'OVF9005Q', year: 2025, tech: 'Google TV QLED 120Hz DLG', res: '4K Ultra HD', hz: 120, basePrice: 19999, chip: 'Onvo Quantum Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [50] },

  // --- 55 Inch ---
  { name: '55VQ90F3UA', year: 2024, tech: 'Google TV 4K QLED 55"', res: '4K Ultra HD', hz: 60, basePrice: 17999, chip: 'Google TV Engine Pro', hdr: ['Dolby Vision', 'HDR10+'], inches: [55] },
  { name: 'OVF9500Q', year: 2025, tech: 'Google TV QLED 120Hz 55"', res: '4K Ultra HD', hz: 120, basePrice: 22999, chip: 'Onvo Quantum Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55] },
  { name: 'OVF9900Q PRO', year: 2026, tech: 'Google TV QLED 144Hz 55"', res: '4K Ultra HD', hz: 144, basePrice: 28999, chip: 'Onvo Neural Quantum Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55] },

  // --- 65 Inch ---
  { name: 'OVF9000', year: 2023, tech: '4K UHD Android TV 65"', res: '4K Ultra HD', hz: 60, basePrice: 19999, chip: 'Onvo 4K AI Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [65] },
  { name: '65VQ90F3UA', year: 2024, tech: 'Google TV 4K QLED 65"', res: '4K Ultra HD', hz: 60, basePrice: 24999, chip: 'Google TV Engine Pro', hdr: ['Dolby Vision', 'HDR10+'], inches: [65] },
  { name: 'OVF9800Q 144Hz', year: 2026, tech: 'Google TV QLED 144Hz 65"', res: '4K Ultra HD', hz: 144, basePrice: 34999, chip: 'Onvo Neural Quantum Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [65] },

  // --- 70 / 75 Inch ---
  { name: '75OVF9001UQ', year: 2024, tech: '4K QLED Google TV 75"', res: '4K Ultra HD', hz: 60, basePrice: 32999, chip: 'Google TV Engine Pro', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [70, 75] },
  { name: 'OVF9850Q 144Hz', year: 2026, tech: 'Google TV QLED 144Hz 75"', res: '4K Ultra HD', hz: 144, basePrice: 44999, chip: 'Onvo Neural Quantum Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [75] },

  // --- 85 & 100 Inch ---
  { name: '85VQ90F2UA', year: 2025, tech: 'Dev Ekran 4K QLED Google TV 85"', res: '4K Ultra HD', hz: 120, basePrice: 59999, chip: 'Onvo Master Quantum Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [85] },
  { name: '100VQ90F3UB Zirve', year: 2026, tech: '100" Dev Ekran QLED 144Hz Google TV', res: '4K Ultra HD', hz: 144, basePrice: 99999, chip: 'Onvo Master Neural Matrix Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [100] }
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

function getOnvoMockupImage(tech, name) {
  if (tech.includes('144Hz') || tech.includes('QLED') || name.includes('100VQ90F3UB')) {
    return '/images/tvs/neo_qled.jpg';
  }
  return '/images/tvs/neo_qled.jpg';
}

const generatedOnvoTVs = [];
let modelIndex = 1;

onvoSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `Onvo ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `onvo-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 100 ? 2.8 : (inch >= 85 ? 2.0 : (inch >= 75 ? 1.4 : (inch >= 70 ? 1.25 : (inch >= 65 ? 1.12 : (inch === 55 ? 1.0 : (inch === 50 ? 0.88 : (inch === 43 || inch === 42 || inch === 40 ? 0.72 : 0.45)))))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('144Hz') || series.name.includes('100VQ90F3UB') || series.name.includes('85VQ90F2UA');
    const rating = isFlagship ? Number((4.6 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.3 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(110 + (modelIndex * 15) % 480);
    const image = getOnvoMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-onvotv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi Onvo Türkiye Garantili', 'Ücretsiz Montaj'],
        sellerRating: 4.8,
        sellerReviews: 19500,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-onvotv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['Onvo Yetkili Satıcı', 'Yerli Üretim'],
        sellerRating: 4.7,
        sellerReviews: 16200,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-onvotv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Teslimat', 'Fiyat Avantajı'],
        sellerRating: 4.8,
        sellerReviews: 27900,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-onvotv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Taksit Seçenekleri'],
        sellerRating: 4.7,
        sellerReviews: 32100,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedOnvoTVs.push({
      id,
      slug,
      name: fullName,
      brand: "Onvo",
      category: "tvs",
      image,
      basePrice: price,
      currency: "TL",
      rating,
      reviewCount,
      releaseYear: series.year,
      isPopular: isFlagship || series.year >= 2024,
      isFeatured: isFlagship && series.year >= 2025,
      tags: [
        `${series.year} Serisi`,
        `${inch}" Ekran`,
        `${series.tech}`,
        series.res,
        `${series.hz}Hz Refresh`
      ],
      ssIndexRatio: isFlagship ? 95 : 84,
      highlights: [
        `${inch}" ${cmVal} cm ${series.tech} Panel (${series.year})`,
        `${series.hz}Hz Yenileme Hızı & Onvo Smart Engine`,
        `${series.chip}`,
        `Fiyat-Performans Şampiyonu Yerli Garanti`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: series.year >= 2024 ? "Google TV" : "Android TV / WhaleOS",
        audioPowerWatts: isFlagship ? 40 : 16,
        processorEngine: series.chip,
        hdrSupport: series.hdr,
        gamingFeatures: [
          `4K @ ${series.hz}Hz VRR`,
          "ALLM (Auto Low Latency Mode)"
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

// Remove existing Onvo TVs to overwrite cleanly
const nonOnvoTVs = existingTVs.filter(t => t.brand !== 'Onvo');
const combinedTVs = [...nonOnvoTVs, ...generatedOnvoTVs];

console.log(`Generated ${generatedOnvoTVs.length} exhaustive Onvo TV models!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const fileOutput = `import { TVProduct } from './types';\n\nconst tvData: any[] = ${JSON.stringify(combinedTVs, null, 2)};\n\nexport const mockTVs: TVProduct[] = tvData as TVProduct[];\n`;

fs.writeFileSync(mockTVsPath, fileOutput, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with all Onvo TV 2022-2026 models!");
