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
  if (phone.brand.toLowerCase() === 'apple') {
    const isIPhone17ProMax = phone.name.includes("iPhone 17 Pro Max");
    const isIPhone17Pro = phone.name.includes("iPhone 17 Pro") && !isIPhone17ProMax;
    const isIPhoneAir = phone.name.includes("iPhone Air");
    const isIPhone17Base = phone.name.includes("iPhone 17") && !isIPhone17Pro && !isIPhone17ProMax && !phone.name.includes("17e") && !isIPhoneAir;
    const isIPhone17e = phone.name.includes("iPhone 17e");

    if (isIPhone17ProMax || isIPhone17Pro) {
      updatedCount++;
      phone.image = "/images/phones/iphone_17_pro.jpg";
      phone.highlights = [
        `Apple ${phone.name} Orijinal Türkiye Garantili`,
        "A19 Pro Çip & Lazer Kaynaklı Buhar Odası (Vapor Chamber) Soğutma",
        "Üçlü 48 MP Pro Fusion Kamera & 8x Optik-Kalite Zoom (200mm Tetraprism)",
        "18 MP Center Stage Ön Kamera (Grup Selfieleri & Dual Capture Video)",
        "Dövme Alüminyum Unibody Gövde & Ceramic Shield 2 Çizilmez Cam",
        "iOS 26 & Apple Intelligence (Canlı Çeviri, Visual Intelligence, Clean Up)"
      ];
      phone.specs.processor = {
        chip: "Apple A19 Pro",
        cores: "6 Çekirdek (Neural Accelerators + Lazer Buhar Odası Soğutma)",
        process: "3nm N3E",
        antutuScore: 2450000
      };
      phone.specs.camera = {
        mainMp: "48 MP Pro Fusion (24/48 mm, f/1.78, 2.44µm)",
        ultrawideMp: "48 MP Fusion Ultra Wide (13 mm, f/2.2, Makro)",
        telephotoMp: "48 MP Fusion Telephoto (100/200 mm, 4x ve 8x Optik Zoom)",
        selfieMp: "18 MP Center Stage (Otomatik Kadraj & Dual Capture Video)",
        videoRes: "4K @ 120fps Dolby Vision / ProRes RAW / Apple Log 2 / Genlock",
        dxomarkScore: 168
      };
      phone.specs.screen = {
        size: isIPhone17ProMax ? "6.9\"" : "6.3\"",
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
        frameMaterial: "Dövme Alüminyum Unibody & Titanyum Kenarlar"
      };
      phone.specs.software = {
        osName: "iOS 26 (Apple Intelligence Dahil)",
        updateYears: 7
      };
    } else if (isIPhoneAir) {
      updatedCount++;
      phone.image = "/images/phones/iphone_air.jpg";
      phone.highlights = [
        `Apple ${phone.name} Orijinal Türkiye Garantili`,
        "Tüm Zamanların En İnce iPhone Tasarımı & Parlatılmış Titanyum Çerçeve",
        "A19 Pro Çip & Super Retina XDR ProMotion 120Hz 6.5\" Ekran",
        "48 MP Fusion Ana Kamera & 2x Optik Kalite Zoom",
        "18 MP Center Stage Ön Kamera (Grup Selfieleri & Dual Capture Video)",
        "Seramik Kalkan 2 (Ceramic Shield 2) Ön ve Arka Cam Koruma"
      ];
      phone.specs.processor = {
        chip: "Apple A19 Pro",
        cores: "6 Çekirdek (5-Core GPU + Neural Accelerators)",
        process: "3nm N3E",
        antutuScore: 2320000
      };
      phone.specs.camera = {
        mainMp: "48 MP Fusion (24/48 mm, f/1.6)",
        ultrawideMp: "—",
        telephotoMp: "2x Optik Kalite Zoom",
        selfieMp: "18 MP Center Stage (Otomatik Kadraj & Dual Capture Video)",
        videoRes: "4K @ 60fps Dolby Vision",
        dxomarkScore: 161
      };
      phone.specs.screen = {
        size: "6.5\"",
        type: "Super Retina XDR OLED (ProMotion 120Hz)",
        resolution: "2736 x 1260 px",
        refreshRate: 120,
        ppi: 460,
        brightnessNits: 2500
      };
      phone.specs.battery = {
        capacitymAh: 3900,
        chargingWatts: 30,
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
        weightGrams: 156,
        thicknessMm: 5.6,
        waterResistance: "IP68 (6m 30dk)",
        frameMaterial: "Parlatılmış Titanyum Çerçeve & Seramik Kalkan Cam"
      };
      phone.specs.software = {
        osName: "iOS 26 (Apple Intelligence Dahil)",
        updateYears: 7
      };
    } else if (isIPhone17Base) {
      updatedCount++;
      phone.highlights = [
        `Apple ${phone.name} Orijinal Türkiye Garantili`,
        "A19 Bionic Çip & ProMotion 120Hz 6.3\" Super Retina XDR Ekran",
        "Çift 48 MP Fusion & 48 MP Ultra Geniş Kamera",
        "18 MP Center Stage Ön Kamera (Grup Selfieleri & Dual Capture Video)",
        "Seramik Kalkan 2 (Ceramic Shield 2) - 3 Kat Çizilmeye Dayanıklı Cam",
        "iOS 26 & Apple Intelligence (Görsel Zeka, Canlı Çeviri & Clean Up)"
      ];
      phone.specs.processor = {
        chip: "Apple A19",
        cores: "6 Çekirdek",
        process: "3nm N3E",
        antutuScore: 2150000
      };
      phone.specs.camera = {
        mainMp: "48 MP Fusion (24 mm, f/1.6)",
        ultrawideMp: "48 MP Fusion Ultra Wide (13 mm, f/2.2)",
        telephotoMp: "2x Optik Kalite Zoom",
        selfieMp: "18 MP Center Stage (Otomatik Kadraj & Dual Capture Video)",
        videoRes: "4K @ 60fps Dolby Vision",
        dxomarkScore: 158
      };
      phone.specs.screen = {
        size: "6.3\"",
        type: "Super Retina XDR OLED (ProMotion 120Hz)",
        resolution: "2622 x 1206 px",
        refreshRate: 120,
        ppi: 460,
        brightnessNits: 2500
      };
      phone.specs.battery = {
        capacitymAh: 4100,
        chargingWatts: 30,
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
        weightGrams: 177,
        thicknessMm: 7.8,
        waterResistance: "IP68 (6m 30dk)",
        frameMaterial: "Dayanıklı Alüminyum Gövde & Seramik Kalkan 2 Cam"
      };
      phone.specs.software = {
        osName: "iOS 26 (Apple Intelligence Dahil)",
        updateYears: 7
      };
    }
  }
});

console.log(`Updated ${updatedCount} Apple iPhone models in total with high-res photos and official specs!`);

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
