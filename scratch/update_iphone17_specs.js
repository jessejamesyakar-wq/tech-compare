const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/mockData.ts');
let fileContent = fs.readFileSync(filePath, 'utf-8');

const match = fileContent.match(/export const mockSmartphones: Smartphone\[\] = (\[[\s\S]*?\]);\s*(?:export const popularComparisonsList|\/\/|$)/);

if (!match) {
  console.error("Could not find mockSmartphones array!");
  process.exit(1);
}

const phones = JSON.parse(match[1]);
console.log(`Loaded ${phones.length} smartphones.`);

let updatedCount = 0;

phones.forEach((phone) => {
  const isIPhone17ProMax = phone.name.includes("iPhone 17 Pro Max");
  const isIPhone17Pro = phone.name.includes("iPhone 17 Pro") && !isIPhone17ProMax;
  const isIPhone17Base = phone.name.includes("iPhone 17") && !isIPhone17Pro && !isIPhone17ProMax && !phone.name.includes("17e");
  const isIPhone17e = phone.name.includes("iPhone 17e");

  if (isIPhone17ProMax || isIPhone17Pro || isIPhone17Base || isIPhone17e) {
    updatedCount++;

    const isProSeries = isIPhone17Pro || isIPhone17ProMax;

    phone.highlights = [
      `Apple ${phone.name} Orijinal Türkiye Garantili`,
      isProSeries
        ? "A19 Pro Çip & Lazer Kaynaklı Buhar Odası (Vapor Chamber) Soğutma"
        : "A19 Bionic Çip & Yüksek Verimli Thermal Sistem",
      isProSeries
        ? "Üçlü 48 MP Pro Fusion Kamera & 8x Optik-Kalite Zoom (200mm)"
        : "Çift 48 MP Fusion Kamera & 2x Optik Zoom",
      "18 MP Center Stage Ön Kamera (Grup Selfieleri & Dual Capture Video)",
      "Seramik Kalkan 2 (Ceramic Shield 2) - 3 Kat Çizilmeye Dayanıklı Ön Cam",
      "iOS 26 & Apple Intelligence (Canlı Çeviri, Görsel Zeka, Clean Up)"
    ];

    if (!phone.specs) phone.specs = {};

    phone.specs.processor = {
      chip: isProSeries ? "Apple A19 Pro" : "Apple A19",
      cores: isProSeries ? "6 Çekirdek (Neural Accelerators + Lazer Buhar Odası Soğutma)" : "6 Çekirdek",
      process: "3nm N3E",
      antutuScore: isProSeries ? 2450000 : 2150000
    };

    phone.specs.camera = {
      mainMp: isProSeries ? "48 MP Pro Fusion (24/48 mm, f/1.78, 2.44µm)" : "48 MP Fusion (24 mm, f/1.6)",
      ultrawideMp: isProSeries ? "48 MP Fusion Ultra Wide (13 mm, f/2.2, Makro)" : "48 MP Fusion Ultra Wide (13 mm, f/2.2)",
      telephotoMp: isProSeries ? "48 MP Fusion Telephoto (100/200 mm, 4x ve 8x Optik Zoom)" : "2x Optik Kalite Zoom",
      selfieMp: "18 MP Center Stage (Otomatik Kadraj & Dual Capture Video)",
      videoRes: isProSeries ? "4K @ 120fps Dolby Vision / ProRes RAW / Apple Log 2 / Genlock" : "4K @ 60fps Dolby Vision",
      dxomarkScore: isProSeries ? 168 : 158
    };

    phone.specs.screen = {
      size: isIPhone17ProMax ? "6.9\"" : (isIPhone17Pro || isIPhone17Base ? "6.3\"" : "6.1\""),
      type: "Super Retina XDR OLED (ProMotion 120Hz, Anti-Reflective)",
      resolution: isIPhone17ProMax ? "2868 x 1320 px" : "2622 x 1206 px",
      refreshRate: 120,
      ppi: 460,
      brightnessNits: 3000
    };

    phone.specs.battery = {
      capacitymAh: isIPhone17ProMax ? 5085 : 4200,
      chargingWatts: 40,
      wirelessCharging: true,
      reverseWireless: false
    };

    phone.specs.connectivity = {
      has5G: true,
      wifiStandard: "Wi-Fi 7",
      bluetooth: "Bluetooth 6.0",
      hasNFC: true,
      hasesim: true
    };

    phone.specs.build = {
      weightGrams: isIPhone17ProMax ? 221 : 187,
      thicknessMm: 7.8,
      waterResistance: "IP68 (6m 30dk)",
      frameMaterial: "Dövme Alüminyum Unibody & Ceramic Shield 2 Cam"
    };

    phone.specs.software = {
      osName: "iOS 26 (Apple Intelligence Dahil)",
      updateYears: 7
    };
  }
});

console.log(`Updated ${updatedCount} iPhone 17 series phones with official Apple specs!`);

const popularComparisons = [
  {
    phone1Id: "apple-iphone-17-pro-max-1tb-2",
    phone2Id: "samsung-galaxy-s26-ultra-1tb-2",
    viewCount: 14820
  },
  {
    phone1Id: "apple-iphone-17-pro-512gb-6",
    phone2Id: "apple-iphone-16-pro-max-512gb-2",
    viewCount: 12450
  },
  {
    phone1Id: "apple-iphone-17-pro-max-2tb-1",
    phone2Id: "apple-iphone-17-pro-1tb-4",
    viewCount: 9840
  },
  {
    phone1Id: "samsung-galaxy-s26-ultra-512gb-3",
    phone2Id: "xiaomi-16-ultra-512gb-2",
    viewCount: 8710
  }
];

const updatedCode = `import { Smartphone } from './types';\n\nexport const mockSmartphones: Smartphone[] = ${JSON.stringify(phones, null, 2)};\n\nexport const popularComparisonsList = ${JSON.stringify(popularComparisons, null, 2)};\n`;

fs.writeFileSync(filePath, updatedCode, 'utf-8');
console.log("Successfully updated src/lib/mockData.ts!");
