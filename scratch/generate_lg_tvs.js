const fs = require('fs');
const path = require('path');

const lgSeriesList = [
  // --- 2018 (Kod: 8 / K) ---
  { name: 'B8', year: 2018, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 24999, chip: 'α7 Gen 1 AI', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [55, 65] },
  { name: 'C8', year: 2018, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 29999, chip: 'α9 Gen 1 Intelligent', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [55, 65, 77] },
  { name: 'E8', year: 2018, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 34999, chip: 'α9 Gen 1 Intelligent', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [55, 65] },
  { name: 'W8', year: 2018, tech: 'Picture-on-Wall OLED', res: '4K Ultra HD', hz: 120, basePrice: 59999, chip: 'α9 Gen 1 Intelligent', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [65, 77] },
  { name: 'SK9500', year: 2018, tech: 'Super UHD NanoCell', res: '4K Ultra HD', hz: 120, basePrice: 19999, chip: 'α7 Gen 1', hdr: ['Dolby Vision', 'HDR10'], inches: [55, 65] },
  { name: 'SK8500', year: 2018, tech: 'Super UHD NanoCell', res: '4K Ultra HD', hz: 120, basePrice: 16999, chip: 'α7 Gen 1', hdr: ['Dolby Vision', 'HDR10'], inches: [55, 65, 75] },
  { name: 'SK8000', year: 2018, tech: 'Super UHD NanoCell', res: '4K Ultra HD', hz: 120, basePrice: 14999, chip: 'α7 Gen 1', hdr: ['Dolby Vision', 'HDR10'], inches: [49, 55, 65, 75] },
  { name: 'UK7700', year: 2018, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 11999, chip: 'Quad Core Processor', hdr: ['HDR10 Pro'], inches: [49, 55, 65] },
  { name: 'UK6500', year: 2018, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 9999, chip: 'Quad Core Processor', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 75, 86] },
  { name: 'UK6300', year: 2018, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 8499, chip: 'Quad Core Processor', hdr: ['HDR10 Pro'], inches: [43, 49, 50, 55, 65] },

  // --- 2019 (Kod: 9 / M) ---
  { name: 'B9', year: 2019, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 26999, chip: 'α7 Gen 2 AI', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [55, 65] },
  { name: 'C9', year: 2019, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 32999, chip: 'α9 Gen 2 AI', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [55, 65, 77] },
  { name: 'E9', year: 2019, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 37999, chip: 'α9 Gen 2 AI', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [55, 65] },
  { name: 'W9', year: 2019, tech: 'Wallpaper OLED', res: '4K Ultra HD', hz: 120, basePrice: 69999, chip: 'α9 Gen 2 AI', hdr: ['Dolby Vision', 'HDR10', 'HLG'], inches: [65, 77] },
  { name: 'SM9800', year: 2019, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 120, basePrice: 22999, chip: 'α7 Gen 2 AI', hdr: ['Dolby Vision', 'HDR10'], inches: [55, 65] },
  { name: 'SM9000', year: 2019, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 120, basePrice: 18999, chip: 'α7 Gen 2 AI', hdr: ['Dolby Vision', 'HDR10'], inches: [55, 65, 75, 86] },
  { name: 'SM8600', year: 2019, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 120, basePrice: 15999, chip: 'α7 Gen 2 AI', hdr: ['Dolby Vision', 'HDR10'], inches: [49, 55, 65, 75] },
  { name: 'UM7600', year: 2019, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 12999, chip: 'Quad Core Processor', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 75, 86] },
  { name: 'UM7500', year: 2019, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 10999, chip: 'Quad Core Processor', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 75] },
  { name: 'UM7300', year: 2019, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 9499, chip: 'Quad Core Processor', hdr: ['HDR10 Pro'], inches: [43, 49, 50, 55, 60, 65] },

  // --- 2020 (Kod: X / N) ---
  { name: 'BX', year: 2020, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 28999, chip: 'α7 Gen 3 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65] },
  { name: 'CX', year: 2020, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 35999, chip: 'α9 Gen 3 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [48, 55, 65, 77] },
  { name: 'GX', year: 2020, tech: 'Gallery OLED', res: '4K Ultra HD', hz: 120, basePrice: 44999, chip: 'α9 Gen 3 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77] },
  { name: 'WX', year: 2020, tech: 'Wallpaper OLED', res: '4K Ultra HD', hz: 120, basePrice: 74999, chip: 'α9 Gen 3 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [65] },
  { name: 'ZX', year: 2020, tech: 'OLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 149999, chip: 'α9 Gen 3 AI Processor 8K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [77, 88] },
  { name: 'NANO99', year: 2020, tech: 'NanoCell 8K', res: '8K Ultra HD', hz: 120, basePrice: 69999, chip: 'α9 Gen 3 AI Processor 8K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [65, 75] },
  { name: 'NANO90', year: 2020, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 120, basePrice: 21999, chip: 'α7 Gen 3 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 75, 86] },
  { name: 'NANO86', year: 2020, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 120, basePrice: 17999, chip: 'α7 Gen 3 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [49, 55, 65] },
  { name: 'NANO80', year: 2020, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 60, basePrice: 14999, chip: 'Quad Core Processor 4K', hdr: ['HDR10 Pro'], inches: [49, 55, 65, 75] },
  { name: 'UN8000', year: 2020, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 13999, chip: 'Quad Core Processor 4K', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 75, 82, 86] },
  { name: 'UN7300', year: 2020, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 11499, chip: 'Quad Core Processor 4K', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 70, 75] },
  { name: 'UN7100', year: 2020, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 9999, chip: 'Quad Core Processor 4K', hdr: ['HDR10 Pro'], inches: [43, 49, 55, 60, 65] },

  // --- 2021 (Kod: 1 / Q) ---
  { name: 'A1', year: 2021, tech: 'OLED', res: '4K Ultra HD', hz: 60, basePrice: 23999, chip: 'α7 Gen 4 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [48, 55, 65, 77] },
  { name: 'B1', year: 2021, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 31999, chip: 'α7 Gen 4 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77] },
  { name: 'C1', year: 2021, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 38999, chip: 'α9 Gen 4 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [48, 55, 65, 77, 83] },
  { name: 'G1', year: 2021, tech: 'OLED evo', res: '4K Ultra HD', hz: 120, basePrice: 48999, chip: 'α9 Gen 4 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77] },
  { name: 'Z1', year: 2021, tech: 'OLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 169999, chip: 'α9 Gen 4 AI Processor 8K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [77, 88] },
  { name: 'QNED99', year: 2021, tech: 'QNED Mini-LED 8K', res: '8K Ultra HD', hz: 120, basePrice: 89999, chip: 'α9 Gen 4 AI Processor 8K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [65, 75, 86] },
  { name: 'QNED90', year: 2021, tech: 'QNED Mini-LED', res: '4K Ultra HD', hz: 120, basePrice: 34999, chip: 'α7 Gen 4 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 75, 86] },
  { name: 'NANO90', year: 2021, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 120, basePrice: 24999, chip: 'α7 Gen 4 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 75, 86] },
  { name: 'NANO80', year: 2021, tech: 'NanoCell LED', res: '4K Ultra HD', hz: 60, basePrice: 16999, chip: 'Quad Core Processor 4K', hdr: ['HDR10 Pro'], inches: [50, 55, 65, 75] },

  // --- 2022 (Kod: 2) ---
  { name: 'A2', year: 2022, tech: 'OLED', res: '4K Ultra HD', hz: 60, basePrice: 25999, chip: 'α7 Gen 5 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [48, 55, 65] },
  { name: 'B2', year: 2022, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 34999, chip: 'α7 Gen 5 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77] },
  { name: 'C2', year: 2022, tech: 'OLED evo', res: '4K Ultra HD', hz: 120, basePrice: 42999, chip: 'α9 Gen 5 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [42, 48, 55, 65, 77, 83] },
  { name: 'G2', year: 2022, tech: 'OLED evo Brightness Booster Max', res: '4K Ultra HD', hz: 120, basePrice: 54999, chip: 'α9 Gen 5 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77, 83, 97] },
  { name: 'Z2', year: 2022, tech: 'OLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 189999, chip: 'α9 Gen 5 AI Processor 8K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [77, 88] },
  { name: 'QNED90', year: 2022, tech: 'QNED Mini-LED', res: '4K Ultra HD', hz: 120, basePrice: 39999, chip: 'α7 Gen 5 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [65, 75, 86] },
  { name: 'QNED85', year: 2022, tech: 'QNED Mini-LED', res: '4K Ultra HD', hz: 120, basePrice: 31999, chip: 'α7 Gen 5 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 75, 86] },
  { name: 'QNED80', year: 2022, tech: 'QNED LED', res: '4K Ultra HD', hz: 120, basePrice: 24999, chip: 'α7 Gen 5 AI Processor 4K', hdr: ['HDR10 Pro'], inches: [50, 55, 65, 75, 86] },

  // --- 2023 (Kod: 3) ---
  { name: 'A3', year: 2023, tech: 'OLED', res: '4K Ultra HD', hz: 60, basePrice: 28999, chip: 'α7 Gen 6 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [48, 55, 65] },
  { name: 'B3', year: 2023, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 39999, chip: 'α7 Gen 6 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77] },
  { name: 'C3', year: 2023, tech: 'OLED evo', res: '4K Ultra HD', hz: 120, basePrice: 48999, chip: 'α9 Gen 6 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [42, 48, 55, 65, 77, 83] },
  { name: 'G3', year: 2023, tech: 'OLED evo MLA (Micro Lens Array)', res: '4K Ultra HD', hz: 120, basePrice: 68999, chip: 'α9 Gen 6 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77, 83] },
  { name: 'Z3', year: 2023, tech: 'OLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 219999, chip: 'α9 Gen 6 AI Processor 8K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [77, 88] },
  { name: 'QNED86', year: 2023, tech: 'QNED Mini-LED', res: '4K Ultra HD', hz: 120, basePrice: 36999, chip: 'α7 Gen 6 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 75, 86] },
  { name: 'QNED81', year: 2023, tech: 'QNED LED', res: '4K Ultra HD', hz: 120, basePrice: 27999, chip: 'α7 Gen 6 AI Processor 4K', hdr: ['HDR10 Pro'], inches: [50, 55, 65, 75, 86] },
  { name: 'QNED75', year: 2023, tech: 'QNED LED', res: '4K Ultra HD', hz: 60, basePrice: 21999, chip: 'α5 Gen 6 AI Processor 4K', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 75] },

  // --- 2024 (Kod: 4) ---
  { name: 'B4', year: 2024, tech: 'OLED', res: '4K Ultra HD', hz: 120, basePrice: 46999, chip: 'α8 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [48, 55, 65, 77] },
  { name: 'C4', year: 2024, tech: 'OLED evo 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 58999, chip: 'α9 AI Processor 4K Gen 7', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [42, 48, 55, 65, 77, 83] },
  { name: 'G4', year: 2024, tech: 'OLED evo MLA Gen 2', res: '4K Ultra HD', hz: 144, basePrice: 84999, chip: 'α11 AI Processor 4K (4x AI Speed)', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77, 83, 97] },
  { name: 'Z4', year: 2024, tech: 'OLED 8K', res: '8K Ultra HD', hz: 120, basePrice: 249999, chip: 'α11 AI Processor 8K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [77, 88] },
  { name: 'QNED91T', year: 2024, tech: 'QNED Mini-LED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 49999, chip: 'α8 AI Processor 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [65, 75, 86] },
  { name: 'QNED85T', year: 2024, tech: 'QNED LED 120Hz', res: '4K Ultra HD', hz: 120, basePrice: 34999, chip: 'α8 AI Processor 4K', hdr: ['HDR10 Pro'], inches: [50, 55, 65, 75, 86, 98] },
  { name: 'QNED80T', year: 2024, tech: 'QNED LED', res: '4K Ultra HD', hz: 60, basePrice: 25999, chip: 'α5 AI Processor 4K Gen 7', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 75, 86] },

  // --- 2025 (Kod: 5) ---
  { name: 'B5', year: 2025, tech: 'OLED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 54999, chip: 'α9 AI Processor 4K Gen 8', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [48, 55, 65, 77] },
  { name: 'C5', year: 2025, tech: 'OLED evo 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 69999, chip: 'α9 AI Processor 4K Gen 8', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [42, 48, 55, 65, 77, 83] },
  { name: 'G5', year: 2025, tech: 'OLED evo MLA Gen 3 3000 Nits', res: '4K Ultra HD', hz: 165, basePrice: 99999, chip: 'α12 AI Neural Matrix 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [55, 65, 77, 83, 97] },
  { name: 'M5', year: 2025, tech: 'Zero Connect Wireless OLED', res: '4K Ultra HD', hz: 165, basePrice: 129999, chip: 'α12 AI Neural Matrix 4K', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [65, 77, 83, 97] },
  { name: 'QNED90', year: 2025, tech: 'QNED Mini-LED 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 59999, chip: 'α9 AI Processor 4K Gen 8', hdr: ['Dolby Vision IQ', 'HDR10 Pro'], inches: [65, 75, 86] },
  { name: 'QNED85', year: 2025, tech: 'QNED LED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 39999, chip: 'α8 AI Processor 4K Gen 8', hdr: ['HDR10 Pro'], inches: [50, 55, 65, 75, 86] },
  { name: 'UA7000', year: 2025, tech: 'UHD LED', res: '4K Ultra HD', hz: 60, basePrice: 27999, chip: 'α5 AI Processor 4K Gen 8', hdr: ['HDR10 Pro'], inches: [43, 50, 55, 65, 75, 86] },

  // --- 2026 ---
  { name: 'B6', year: 2026, tech: 'OLED 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 64999, chip: 'α10 AI Neural Engine 4K', hdr: ['Dolby Vision IQ Max', 'HDR10 Pro'], inches: [48, 55, 65, 77] },
  { name: 'C6', year: 2026, tech: 'OLED evo 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 79999, chip: 'α10 AI Neural Engine 4K', hdr: ['Dolby Vision IQ Max', 'HDR10 Pro'], inches: [42, 48, 55, 65, 77, 83] },
  { name: 'G6', year: 2026, tech: 'OLED evo MLA Gen 4 3500 Nits', res: '4K Ultra HD', hz: 165, basePrice: 119999, chip: 'α14 AI Super Neural Matrix', hdr: ['Dolby Vision IQ Max', 'HDR10 Pro'], inches: [55, 65, 77, 83, 97] },
  { name: 'W6', year: 2026, tech: 'Wallpaper Wireless OLED', res: '4K Ultra HD', hz: 165, basePrice: 159999, chip: 'α14 AI Super Neural Matrix', hdr: ['Dolby Vision IQ Max', 'HDR10 Pro'], inches: [65, 77, 83, 97] },
  { name: 'M6', year: 2026, tech: 'Micro RGB OLED', res: '4K Ultra HD', hz: 165, basePrice: 489999, chip: 'α14 Micro RGB Engine', hdr: ['Micro RGB Ultimate HDR', 'Dolby Vision IQ Max'], inches: [77, 88, 97, 115] },
  { name: 'QNED95', year: 2026, tech: 'QNED Mini-LED 165Hz', res: '4K Ultra HD', hz: 165, basePrice: 69999, chip: 'α10 AI Neural Engine 4K', hdr: ['Dolby Vision IQ Max', 'HDR10 Pro'], inches: [65, 75, 86, 98] },
  { name: 'QNED85', year: 2026, tech: 'QNED LED 144Hz', res: '4K Ultra HD', hz: 144, basePrice: 44999, chip: 'α9 AI Processor 4K Gen 9', hdr: ['HDR10 Pro'], inches: [55, 65, 75, 86, 98] },
  { name: 'QNED70', year: 2026, tech: 'QNED LED', res: '4K Ultra HD', hz: 60, basePrice: 29999, chip: 'α5 AI Processor 4K Gen 9', hdr: ['HDR10 Pro'], inches: [55, 65, 75, 86, 115] }
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

function getLGMockupImage(tech, name) {
  if (name.includes('M6') || tech.includes('Micro')) {
    return '/images/tvs/micro_rgb.jpg';
  }
  if (tech.includes('OLED') || name.startsWith('C') || name.startsWith('G') || name.startsWith('B') || name.startsWith('W')) {
    return '/images/tvs/lg_oled.jpg';
  }
  if (tech.includes('QNED') || tech.includes('8K')) {
    return '/images/tvs/neo_qled.jpg';
  }
  return '/images/tvs/lg_oled.jpg';
}

const generatedLGTVs = [];
let modelIndex = 1;

lgSeriesList.forEach((series) => {
  series.inches.forEach((inch) => {
    const cmVal = Math.round(inch * 2.54);
    const fullName = `LG ${inch}${series.name} ${inch}" ${cmVal} Ekran ${series.tech} webOS ${series.hz}Hz ${series.res.includes('8K') ? '8K' : '4K'} Smart TV (${series.year})`;
    const slug = slugify(fullName);
    const id = `lg-tv-${slug}-${modelIndex++}`;

    const inchMultiplier = inch >= 115 ? 3.0 : (inch >= 97 || inch >= 98 ? 2.6 : (inch >= 86 || inch >= 88 ? 1.7 : (inch >= 75 || inch >= 77 ? 1.35 : (inch >= 65 ? 1.15 : (inch === 55 ? 1.0 : (inch === 48 || inch === 50 ? 0.85 : 0.75))))));
    const price = Math.round(series.basePrice * inchMultiplier);

    const isFlagship = series.tech.includes('OLED') || series.tech.includes('8K') || series.tech.includes('Micro') || series.name.startsWith('G') || series.name.startsWith('Z') || series.name.startsWith('W') || series.name.startsWith('M');
    const rating = isFlagship ? Number((4.8 + (modelIndex % 3) * 0.1).toFixed(1)) : Number((4.5 + (modelIndex % 4) * 0.1).toFixed(1));
    const reviewCount = Math.floor(120 + (modelIndex * 29) % 750);
    const image = getLGMockupImage(series.tech, series.name);

    const storeOffers = [
      {
        id: `st-msh-lgtv-${modelIndex}`,
        storeName: 'MediaMarkt (MSH)',
        storeLogoColor: 'bg-red-600 text-white',
        price: Math.round(price * 0.99),
        inStock: true,
        shippingDays: 2,
        badges: ['Resmi LG Distribütörü', 'Ücretsiz Montaj'],
        sellerRating: 4.9,
        sellerReviews: 21400,
        url: 'https://www.mediamarkt.com.tr'
      },
      {
        id: `st-vat-lgtv-${modelIndex}`,
        storeName: 'Vatan Bilgisayar',
        storeLogoColor: 'bg-blue-800 text-white',
        price: price,
        inStock: true,
        shippingDays: 2,
        badges: ['LG Türkiye Garanti', 'Vatan Kurulum'],
        sellerRating: 4.8,
        sellerReviews: 17800,
        url: 'https://www.vatanbilgisayar.com'
      },
      {
        id: `st-hb-lgtv-${modelIndex}`,
        storeName: 'Hepsiburada',
        storeLogoColor: 'bg-orange-600 text-white',
        price: Math.round(price * 0.995),
        inStock: true,
        shippingDays: 1,
        badges: ['Hızlı Teslimat', 'Kupon Fırsatı'],
        sellerRating: 4.8,
        sellerReviews: 28900,
        url: 'https://www.hepsiburada.com'
      },
      {
        id: `st-ty-lgtv-${modelIndex}`,
        storeName: 'Trendyol',
        storeLogoColor: 'bg-amber-600 text-white',
        price: Math.round(price * 0.998),
        inStock: true,
        shippingDays: 1,
        badges: ['Peşin Fiyatına Taksit'],
        sellerRating: 4.7,
        sellerReviews: 33400,
        url: 'https://www.trendyol.com'
      }
    ];

    const priceHistory = [
      { date: 'Ekim 2025', price: Math.round(price * 1.08), store: 'MediaMarkt' },
      { date: 'Aralık 2025', price: Math.round(price * 1.04), store: 'Vatan Bilgisayar' },
      { date: 'Şubat 2026', price: Math.round(price * 1.01), store: 'Hepsiburada' },
      { date: 'Mart 2026', price: price, store: 'MediaMarkt' }
    ];

    generatedLGTVs.push({
      id,
      slug,
      name: fullName,
      brand: "LG",
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
        `${series.hz}Hz Yenileme Hızı & HDMI 2.1 VRR`,
        `${series.chip} Yapay Zeka İşlemcisi`,
        `webOS Smart TV & Sihirli Kumanda (Magic Remote)`
      ],
      specs: {
        screenSizeInches: inch,
        displayTech: series.tech,
        resolution: series.res,
        refreshRateHz: series.hz,
        smartOs: "webOS",
        audioPowerWatts: isFlagship ? 60 : 20,
        processorEngine: series.chip,
        hdrSupport: series.hdr,
        gamingFeatures: [
          `4K @ ${series.hz}Hz VRR`,
          "NVIDIA G-Sync Compatible",
          "AMD FreeSync Premium",
          "Game Optimizer & Dashboard"
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

// Remove older LG entries to replace with our exhaustive multi-inch LG TV catalog
const nonLGTVs = existingTVs.filter(t => t.brand !== 'LG');
const combinedTVs = [...nonLGTVs, ...generatedLGTVs];

console.log(`Generated ${generatedLGTVs.length} exhaustive LG TV inch-size models (2018-2026) with AI studio mockups!`);
console.log(`New total TV count: ${combinedTVs.length}`);

const updatedArrayCode = `export const mockTVs: TVProduct[] = ${JSON.stringify(combinedTVs, null, 2)};`;

fileContent = fileContent.replace(/export const mockTVs: TVProduct\[\] = \[[\s\S]*?\];/, updatedArrayCode);

fs.writeFileSync(mockTVsPath, fileContent, 'utf-8');
console.log("Successfully updated src/lib/mockTVs.ts with AI studio mockups for LG!");
