const fs = require('fs');
const path = require('path');

const tclSeriesList = [
  // --- 2018 (1, 3, 4, 5, 6 Series) ---
  { name: 'S325', year: 2018, tech: 'LED', res: 'Full HD', hz: 60, basePrice: 6999, chip: 'Quad Core CPU', hdr: ['HDR10'], inches: [28, 32, 40, 43] },
  { name: 'S425', year: 2018, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 8999, chip: 'Quad Core CPU', hdr: ['HDR10'], inches: [43, 49, 50, 55, 65, 75] },
  { name: 'S517', year: 2018, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 11999, chip: 'Quad Core CPU', hdr: ['Dolby Vision', 'HDR10'], inches: [43, 49, 55, 65] },
  { name: 'R617', year: 2018, tech: 'QLED Full Array', res: '4K Ultra HD', hz: 60, basePrice: 15999, chip: 'IPQ Engine', hdr: ['Dolby Vision', 'HDR10'], inches: [55, 65, 75] },

  // --- 2020 (x15) - 2021 (x25) ---
  { name: 'P615', year: 2020, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 10999, chip: 'AIPQ Engine', hdr: ['HDR10'], inches: [43, 50, 55, 65, 75] },
  { name: 'P715', year: 2020, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 12999, chip: 'AIPQ Engine', hdr: ['HDR10+'], inches: [43, 50, 55, 65, 75] },
  { name: 'C715', year: 2020, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 16999, chip: 'AIPQ Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [50, 55, 65, 75] },
  { name: 'C815', year: 2020, tech: 'QLED 120Hz', res: '4K Ultra HD', hz: 120, basePrice: 22999, chip: 'AIPQ Engine', hdr: ['Dolby Vision', 'HDR10+'], inches: [55, 65, 75] },
  { name: 'C725', year: 2021, tech: 'QLED', res: '4K Ultra HD', hz: 60, basePrice: 18999, chip: 'AIPQ Engine Gen 2', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 65, 75] },
  { name: 'C825', year: 2021, tech: 'Mini-LED 120Hz', res: '4K Ultra HD', hz: 120, basePrice: 27999, chip: 'AIPQ Engine Gen 2', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [55, 65, 75] },

  // --- 2022 (x35) - 2023 (x45) ---
  { name: 'P635', year: 2022, tech: 'Google TV LED', res: '4K Ultra HD', hz: 60, basePrice: 13999, chip: 'AIPQ Engine Gen 2', hdr: ['HDR10'], inches: [43, 50, 55, 65, 75] },
  { name: 'C635', year: 2022, tech: 'QLED 120Hz DLG', res: '4K Ultra HD', hz: 120, basePrice: 19999, chip: 'AIPQ Engine Gen 2', hdr: ['Dolby Vision', 'HDR10+'], inches: [43, 50, 55, 65, 75] },
  { name: 'C735', year: 2022, tech: 'QLED 144Hz Gaming', res: '4K Ultra HD', hz: 144, basePrice: 28999, chip: 'AIPQ Engine Gen 2', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [55, 65, 75, 85, 98] },
  { name: 'C835', year: 2022, tech: 'Mini-LED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 38999, chip: 'AIPQ Engine Gen 2', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [55, 65, 75] },
  { name: 'C935', year: 2022, tech: 'Mini-LED 144Hz Onkyo 2.1.2', res: '4K Ultra HD', hz: 144, basePrice: 54999, chip: 'AIPQ Engine Gen 2', hdr: ['Dolby Vision IQ', 'HDR10+'], inches: [65, 75, 85] },
  { name: 'C845', year: 2023, tech: 'QD-Mini LED 2000 Nits', res: '4K Ultra HD', hz: 144, basePrice: 46999, chip: 'AIPQ Processor 3.0', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },

  // --- 2024 (x55) ---
  { name: 'P755', year: 2024, tech: 'Google TV LED', res: '4K Ultra HD', hz: 60, basePrice: 19999, chip: 'AIPQ Processor 3.0', hdr: ['Dolby Vision', 'HDR10+'], inches: [50, 55, 65, 75, 85] },
  { name: 'C655', year: 2024, tech: 'QLED PRO 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 26999, chip: 'AIPQ Pro Processor', hdr: ['Dolby Vision', 'HDR10+ Gaming'], inches: [50, 55, 65, 75, 85, 98] },
  { name: 'C755', year: 2024, tech: 'QD-Mini LED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 39999, chip: 'AIPQ Pro Processor', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [50, 55, 65, 75, 85, 98] },
  { name: 'C855', year: 2024, tech: 'QD-Mini LED 3500 Nits', res: '4K Ultra HD', hz: 144, basePrice: 64999, chip: 'AIPQ Pro Processor', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [65, 75, 85, 98] },
  { name: 'X955', year: 2024, tech: 'QD-Mini LED 5000 Nits', res: '4K Ultra HD', hz: 144, basePrice: 119999, chip: 'AIPQ Pro Processor (20,000 Zones)', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [85, 98, 115] },

  // --- 2025 (K Serisi) ---
  { name: 'S5K', year: 2025, tech: 'Google TV LED', res: '4K Ultra HD', hz: 60, basePrice: 16999, chip: 'AIPQ Pro Processor', hdr: ['HDR10+'], inches: [32, 43, 50, 55, 65] },
  { name: 'T6C', year: 2025, tech: 'QLED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 28999, chip: 'AIPQ Pro Processor', hdr: ['Dolby Vision', 'HDR10+ Gaming'], inches: [43, 50, 55, 65, 75, 85] },
  { name: 'C6K', year: 2025, tech: 'QLED PRO 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 34999, chip: 'AIPQ Gen 4 Neural Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [50, 55, 65, 75, 85, 98] },
  { name: 'C7K', year: 2025, tech: 'QD-Mini LED 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 52999, chip: 'AIPQ Gen 4 Neural Engine', hdr: ['Dolby Vision IQ', 'HDR10+ Gaming'], inches: [55, 65, 75, 85, 98] },
  { name: 'C8K', year: 2025, tech: 'QD-Mini LED 4500 Nits', res: '4K Ultra HD', hz: 165, basePrice: 84999, chip: 'AIPQ Gen 4 Neural Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [65, 75, 85, 98, 115] },

  // --- 2026 (L Serisi / SQD) ---
  { name: 'C6K Pro', year: 2026, tech: 'QLED PRO 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 44999, chip: 'AIPQ Gen 5 Quantum Neural Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55, 65, 75, 85] },
  { name: 'QM7L', year: 2026, tech: 'QD-Mini LED 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 64999, chip: 'AIPQ Gen 5 Quantum Neural Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [55, 65, 75, 85, 98] },
  { name: 'QM8L', year: 2026, tech: 'QD-Mini LED 5000 Nits', res: '4K Ultra HD', hz: 165, basePrice: 99999, chip: 'AIPQ Gen 5 Quantum Neural Engine', hdr: ['Dolby Vision IQ Max', 'HDR10+ Gaming'], inches: [65, 75, 85, 98, 115] },
  { name: 'RM9L', year: 2026, tech: 'Micro RGB QD', res: '4K Ultra HD', hz: 165, basePrice: 249999, chip: 'Micro RGB Neural Matrix Engine', hdr: ['Micro RGB Ultimate HDR', 'Dolby Vision IQ Max'], inches: [75, 85, 98, 115] },
  { name: 'X11L', year: 2026, tech: 'SQD Quantum Mini-LED 10000 Nits', res: '4K Ultra HD', hz: 165, basePrice: 399999, chip: 'SQD AI Master Engine (20,000 Zones)', hdr: ['SQD Master HDR', 'Dolby Vision IQ Max'], inches: [85, 98, 115] }
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

function getTCLMockupImage(tech, name) {
  if (name.includes('X11L') || name.includes('X955') || tech.includes('SQD')) {
    return '/images/tvs/micro_rgb.jpg';
  }
  if (tech.includes('Mini') || tech.includes('QLED') || name.includes('C8') || name.includes('C9')) {
    return '/images/tvs/neo_qled.jpg';
  }
  if (tech.includes('OLED')) {
    return '/images/tvs/qd_oled.jpg';
  }
  return '/images/tvs/neo_qled.jpg';
}

const generatedTCLTVs = [];
let modelIndex = 1;

tclSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `TCL ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} Google TV ${series.hz}Hz ${series.res.includes('8K') ? '8K' : '4K'} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `tcl-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 115 ? 3.2 : (inch >= 98 ? 2.5 : (inch >= 85 ? 1.6 : (inch >= 75 ? 1.35 : (inch >= 65 ? 1.15 : (inch === 55 ? 1.0 : (inch === 48 || inch === 50 ? 0.85 : 0.75))))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('Mini') || series.tech.includes('SQD') || series.tech.includes('Micro') || series.name.startsWith('X') || series.name.startsWith('RM') || series.name.startsWith('C9') || series.name.startsWith('C8');
    const rating = isFlagship ? Number((4.8 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.5 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(130 + (modelIndex * 27) % 710);
    const image = getTCLMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-tcltv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi TCL Distribütörü', 'Ücretsiz Montaj'],
        sellerRating: 4.9,
        sellerReviews: 22100,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-tcltv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['Bilkom TCL Garanti', 'Vatan Kurulum'],
        sellerRating: 4.8,
        sellerReviews: 18900,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-tcltv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Teslimat', 'Kupon Fırsatı'],
        sellerRating: 4.8,
        sellerReviews: 29400,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-tcltv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Peşin Fiyatına Taksit'],
        sellerRating: 4.7,
        sellerReviews: 34100,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedTCLTVs.push({
      id,
      slug,
      name: fullName,
      brand: "TCL",
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
        `${series.hz}Hz Yenileme Hızı & HDMI 2.1 Gaming`,
        `${series.chip} İşlemci`,
        `Google TV Akıllı Platform & Dolby Atmos Audio`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: "Google TV",
        audioPowerWatts: isFlagship ? 60 : 20,
        processorEngine: series.chip,
        hdrSupport: series.hdr,
        gamingFeatures: [
          `4K @ ${series.hz}Hz VRR`,
          "AMD FreeSync Premium Pro",
          "Game Master 2.0 & Game Bar",
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

// Remove older TCL entries to replace with our exhaustive multi-inch TCL TV catalog
const nonTCLTVs = existingTVs.filter(t => t.brand !== 'TCL');
const combinedTVs = [...nonTCLTVs, ...generatedTCLTVs];

console.log(`Generated ${generatedTCLTVs.length} exhaustive TCL TV inch-size models (2018-2026)!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const updatedArrayCode = `export const mockTVs: TVProduct[] = ${JSON.stringify(combinedTVs, null, 2)};`;

fileContent = fileContent.replace(/export const mockTVs: TVProduct\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockTVsPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with all multi-inch TCL TV 2018-2026 models!");
