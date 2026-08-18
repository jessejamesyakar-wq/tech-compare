const fs = require('fs');
const path = require('path');

const segSeriesList = [
  // --- Classic Series (2018 - 2020) ---
  { name: 'SC5600', year: 2018, tech: 'LED', res: 'HD Ready', hz: 60, basePrice: 3499, chip: 'Seg Standard Core', hdr: ['HDR10'], inches: [22, 24] },
  { name: 'SC5650', year: 2019, tech: 'Smart LED', res: 'Full HD', hz: 60, basePrice: 4299, chip: 'Seg Smart Core', hdr: ['HDR10'], inches: [32, 40, 43] },

  // --- Middle / New Gen Smart & 4K Series (2021 - 2026) ---
  { name: 'SBH715', year: 2021, tech: 'Smart HD Ready', res: 'HD Ready', hz: 60, basePrice: 4999, chip: 'Seg Smart Core Gen 2', hdr: ['HDR10'], inches: [32] },
  { name: 'SBH730', year: 2022, tech: 'Android TV HD', res: 'HD Ready', hz: 60, basePrice: 5999, chip: 'Seg Android Core', hdr: ['HDR10'], inches: [32] },
  { name: 'SFA750', year: 2023, tech: 'Android TV Full HD', res: 'Full HD', hz: 60, basePrice: 7999, chip: 'Seg Android Core Pro', hdr: ['HDR10'], inches: [40, 43] },
  { name: 'SUA740', year: 2024, tech: 'Android TV 4K Ultra HD', res: '4K Ultra HD', hz: 60, basePrice: 11999, chip: 'Seg 4K Engine', hdr: ['Dolby Vision', 'HDR10'], inches: [50, 55] },
  { name: 'SRB900', year: 2025, tech: 'Powered by TiVo QLED 4K', res: '4K Ultra HD', hz: 60, basePrice: 15999, chip: 'TiVo Smart QLED Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [50, 55] },
  { name: 'SBU740', year: 2025, tech: 'Google TV 4K 65"', res: '4K Ultra HD', hz: 60, basePrice: 18999, chip: 'Google TV AI Core', hdr: ['Dolby Vision', 'HDR10+'], inches: [65] },
  { name: 'SRB950', year: 2026, tech: 'Google TV QLED 120Hz DLG 65"', res: '4K Ultra HD', hz: 120, basePrice: 23999, chip: 'Seg Quantum Engine Pro', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65] }
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

function getSegMockupImage(tech, name) {
  if (tech.includes('QLED') || name.includes('SRB950')) {
    return '/images/tvs/neo_qled.jpg';
  }
  return '/images/tvs/neo_qled.jpg';
}

const generatedSegTVs = [];
let modelIndex = 1;

segSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `SEG ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `seg-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 65 ? 1.15 : (inch === 55 ? 1.0 : (inch === 50 ? 0.88 : (inch === 43 || inch === 40 ? 0.72 : (inch === 32 ? 0.52 : 0.42))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('QLED') || series.name.includes('SRB950');
    const rating = isFlagship ? Number((4.5 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.2 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(95 + (modelIndex * 13) % 410);
    const image = getSegMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-segtv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi SEG Vestel Garantili', 'Ücretsiz Kurulum'],
        sellerRating: 4.8,
        sellerReviews: 18400,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-segtv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['SEG Yetkili Satıcı', 'Bütçe Dostu'],
        sellerRating: 4.7,
        sellerReviews: 15100,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-segtv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Kargo', 'Puan Kazan'],
        sellerRating: 4.8,
        sellerReviews: 26400,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-segtv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Taksit Avantajı'],
        sellerRating: 4.7,
        sellerReviews: 30800,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedSegTVs.push({
      id,
      slug,
      name: fullName,
      brand: "Seg",
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
      ssIndexRatio: isFlagship ? 92 : 82,
      highlights: [
        `${inch}" ${cmVal} cm ${series.tech} Panel (${series.year})`,
        `${series.hz}Hz Yenileme Hızı & Vestel Servis Güvencesi`,
        `${series.chip}`,
        `Bütçe Dostu Yüksek Performanslı Smart TV`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: series.year >= 2024 ? "Google TV / TiVo OS" : (series.year >= 2021 ? "Android TV" : "Seg Smart OS"),
        audioPowerWatts: isFlagship ? 30 : 16,
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

// Remove existing Seg TVs to overwrite cleanly
const nonSegTVs = existingTVs.filter(t => t.brand.toLowerCase() !== 'seg');
const combinedTVs = [...nonSegTVs, ...generatedSegTVs];

console.log(`Generated ${generatedSegTVs.length} exhaustive Seg TV models!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const fileOutput = `import { TVProduct } from './types';\n\nconst tvData: any[] = ${JSON.stringify(combinedTVs, null, 2)};\n\nexport const mockTVs: TVProduct[] = tvData as TVProduct[];\n`;

fs.writeFileSync(mockTVsPath, fileOutput, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with all Seg TV 2018-2026 models!");
