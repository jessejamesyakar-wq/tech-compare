const fs = require('fs');
const path = require('path');

const datasets = [
  { name: 'smartphones', file: 'smartphonesData.json', type: 'json' },
  { name: 'tvs', file: 'mockTVs.ts', type: 'ts' },
  { name: 'laptops', file: 'mockLaptops.ts', type: 'ts' },
  { name: 'tablets', file: 'mockTablets.ts', type: 'ts' },
  { name: 'smartwatches', file: 'mockSmartwatches.ts', type: 'ts' },
  { name: 'headphones', file: 'mockHeadphones.ts', type: 'ts' },
  { name: 'appliances', file: 'mockAppliances.ts', type: 'ts' },
  { name: 'monitors', file: 'mockMonitors.ts', type: 'ts' },
  { name: 'consoles', file: 'mockConsoles.ts', type: 'ts' }
];

const BLACKLIST = new Set([
  'QNED', 'OLED', 'MINILED', 'NANO', 'QLED', 'LED', 'LCD', 'UHD', 'FHD', 'HD', '4K', '8K', 'HDR',
  'IPS', 'VA', 'TN', 'SMART', 'TV', 'TELEVIZYON', 'MONITOR', 'LAPTOP', 'TABLET', 'KULAKLIK', 'GAMING',
  'OYUN', 'PRO', 'MAX', 'PLUS', 'ULTRA', 'MINI', 'LITE', 'SE', 'FE', 'AIR', 'CPU', 'GPU', 'RAM',
  'SSD', 'DDR', 'GB', 'TB', 'MB', 'GHZ', 'MHZ', 'HZ', 'WATT', 'BTU', 'INCH', 'EKRAN', 'INC',
  'MM', 'CM', 'KG', 'VOLT', 'MAH', 'USB', 'HDMI', 'WIFI', 'BLUETOOTH', 'BLACK', 'WHITE', 'SILVER',
  'GOLD', 'GRAY', 'GREY', 'TITANIUM', 'SIYAH', 'BEYAZ', 'GUMUS', 'ALTIN', 'GRI', 'TITANYUM', 'KIRMIZI',
  'MAVI', 'YESIL', 'PEMBE', 'TURUNCU', 'SAR', 'LACIVERT', 'MOR', 'DUO', 'MONO', 'STEREO', 'TRUE',
  'WIRELESS', 'TWS', 'ANC', 'RF', 'EV', 'SINEMA', 'CAGRI', 'MERKEZI', 'KEMIK', 'ILETIMLI', 'SPOR',
  'KORDON', 'LOOP', 'ALUMINYUM', 'CELIK', 'PASLANMAZ', 'CELLULAR', 'GPS', 'DUVAR', 'TIPI', 'INVERTER',
  'KLIMA', 'FILTRE', 'KAHVE', 'MAKINESI', 'STANDLI', 'MIKSER', 'BLENDER', 'ROBOT', 'SUPURGE', 'AIRFRYER',
  'UTU', 'KAZANLI', 'BUZDOLABI', 'CAMASIR', 'BULASIK', 'KURUTMA', 'FIRIN', 'OCAK', 'DAVLUMBAZ',
  'GEN2', 'GEN3', 'GEN4', 'GEN5', 'GEN6', 'GEN7', 'GEN8', 'GEN9', 'GEN10', 'GEN11', 'GEN12',
  'INTEL', 'AMD', 'RYZEN', 'CORE', 'SNAPDRAGON', 'EXYNOS', 'MEDIATEK', 'DIMENSITY', 'BIONIC',
  'SERIES', 'SERISI', 'EDITION', 'SPECIAL', 'NEW', 'YENI', 'MODEL', 'VERSIYON', 'VERSION'
]);

function extractAccurateProductCode(product) {
  const name = product.name || '';
  const brand = (product.brand || name.split(' ')[0] || '').toUpperCase();

  // 1. Explicit Apple Part Number in parentheses: (MGE94TU/A), (MU793ZD/A), (MWTJ2TU/A)
  const appleParen = name.match(/\(([A-Z0-9]{4,7}(?:TU|FD|ZD|LL|HN|B|D|NF|QL)\/[A-Z0-9])\)/i);
  if (appleParen) return appleParen[1].toUpperCase();

  // Any other parenthesis with standard format (XXX/X)
  const anyParenPart = name.match(/\(([A-Z0-9]{4,10}\/[A-Z0-9]{1,4})\)/i);
  if (anyParenPart) return anyParenPart[1].toUpperCase();

  // Sony Console CFI code: (CFI-2000A01)
  const cfiMatch = name.match(/\((CFI-[0-9]{4}[A-Z0-9]+)\)/i);
  if (cfiMatch) return cfiMatch[1].toUpperCase();

  // 2. Philips / Braun Appliance Codes: HD7548/20, CSA250/10, 55PUS8108/62
  const slashCode = name.match(/\b([A-Z0-9]{2,8}\/[0-9]{2,4})\b/i);
  if (slashCode) return slashCode[1].toUpperCase();

  // 3. Samsung TV / Monitor Code: QE65Q70DATXTK, UE55CU7000UXTK, LS32CG552EUXUF, SM-S928B
  const samsungTV = name.match(/\b((?:QE|UE|GQ|QN|QA|TQ|GU|LS|LC|LF)[0-9]{2}[A-Z0-9]{4,12})\b/i);
  if (samsungTV) return samsungTV[1].toUpperCase();

  const samsungPhone = name.match(/\b(SM-[A-Z0-9]{4,8})\b/i);
  if (samsungPhone) return samsungPhone[1].toUpperCase();

  // 4. LG TV / Monitor Code: 55QNED81B6A, 86UT81006LA, OLED55C34LA, 27UP650P-W, 27GP850-B
  const lgTV = name.match(/\b([0-9]{2,3}(?:QNED|NANO|UT|UR|UQ|UP|UN|LM|LQ|UK|SK|SM|B[0-9]|C[0-9]|G[0-9]|M[0-9]|W[0-9]|Z[0-9])[A-Z0-9\-_]{2,8})\b/i);
  if (lgTV) {
    const code = lgTV[1].toUpperCase();
    if (!BLACKLIST.has(code)) return code;
  }

  const lgOLED = name.match(/\b(OLED[0-9]{2}[A-Z0-9\-_]{3,8})\b/i);
  if (lgOLED) return lgOLED[1].toUpperCase();

  const monitorCode = name.match(/\b([0-9]{2}[A-Z]{2,4}[0-9]{3,4}[A-Z0-9\-_]*)\b/i);
  if (monitorCode) {
    const code = monitorCode[1].toUpperCase();
    if (!BLACKLIST.has(code) && !/^[0-9]+(HZ|MS|BIT|FPS)$/i.test(code)) return code;
  }

  // 5. Bosch / Siemens / Beko / Arçelik Appliances: KGN56VWF0N, WGA25400TR, B360340
  const applianceCode = name.match(/\b([A-Z]{2,4}[0-9]{3,6}[A-Z0-9]*)\b/i);
  if (applianceCode) {
    const code = applianceCode[1].toUpperCase();
    if (!BLACKLIST.has(code) && !/^[0-9]+(BTU|W|V|A|HZ)$/i.test(code) && !/^(BTU|WATT|INCH|EKRAN|OLED|QNED)$/i.test(code)) {
      return code;
    }
  }

  // 6. Asus / Lenovo / HP / Dell Laptop part codes: 82XF0038TX, G614JIR-N4003, GA402RJ, 15ITL6, 9315
  const laptopCode = name.match(/\b([0-9]{2}[A-Z0-9]{6,10}|[A-Z][0-9]{3}[A-Z]{2,3}-[A-Z0-9]{4,6})\b/i);
  if (laptopCode) {
    const code = laptopCode[1].toUpperCase();
    if (!BLACKLIST.has(code)) return code;
  }

  // 7. General part number pattern: Word with at least 1 letter and 1 number, min 5 chars, containing no spec terms
  const tokens = name.replace(/[(),]/g, ' ').split(/\s+/);
  for (const t of tokens) {
    const clean = t.toUpperCase().trim();
    if (clean.length >= 5 && clean.length <= 16 && /[A-Z]/.test(clean) && /[0-9]/.test(clean)) {
      if (!BLACKLIST.has(clean) && !/^(18CPU|40GPU|16GB|32GB|64GB|128GB|256GB|512GB|1TB|2TB|4TB|8TB|144HZ|120HZ|165HZ|240HZ|280HZ|12000BTU|18000BTU|24000BTU|1000W|1200W|2000W|10000MAH|20000MAH|5000MAH|4000MAH|6000MAH)$/i.test(clean)) {
        // Must not contain CPU/GPU
        if (!clean.includes('CPU') && !clean.includes('GPU') && !clean.includes('RAM') && !clean.includes('SSD')) {
          return clean;
        }
      }
    }
  }

  return null; // Return null if no strict unique code found
}

// Test extraction across all datasets
let totalCount = 0;
let codeFoundCount = 0;
let noCodeCount = 0;
const codeUsage = new Map();

datasets.forEach(d => {
  const filePath = path.join('./src/lib', d.file);
  let items = [];
  if (d.type === 'json') {
    items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } else {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/export\s+const\s+(\w+)\s*:\s*(?:Product\[\]|Smartphone\[\]|TVProduct\[\]|LaptopProduct\[\]|ApplianceProduct\[\]|GenericProduct\[\])\s*=\s*(\[[\s\S]*\]);/);
    if (match) items = JSON.parse(match[2]);
  }

  items.forEach(p => {
    totalCount++;
    const code = extractAccurateProductCode(p);
    if (code) {
      codeFoundCount++;
      codeUsage.set(code, (codeUsage.get(code) || 0) + 1);
    } else {
      noCodeCount++;
    }
  });
});

console.log(`=== CODE EXTRACTION TEST RESULTS ===`);
console.log(`Total Products Scanned : ${totalCount}`);
console.log(`Strict Codes Found     : ${codeFoundCount} (${((codeFoundCount / totalCount) * 100).toFixed(1)}%)`);
console.log(`No Valid Code Found    : ${noCodeCount} (${((noCodeCount / totalCount) * 100).toFixed(1)}%)`);

// Check duplicate codes
const duplicateCodes = Array.from(codeUsage.entries()).filter(([code, count]) => count > 1);
console.log(`\nDuplicate Code Groups Found: ${duplicateCodes.length}`);
duplicateCodes.slice(0, 10).forEach(([code, count]) => console.log(` - "${code}" used ${count} times`));
