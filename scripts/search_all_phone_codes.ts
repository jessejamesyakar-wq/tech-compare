import { mockSmartphones } from '../src/lib/mockData';
import { CANONICAL_EXCLUDED_ID_SET } from '../src/lib/governance/canonicalExclusions';

console.log('Searching all 905 smartphones for exact Turkish MPN/SKU or model codes...');

const candidatesWithCodes: any[] = [];

for (const p of mockSmartphones) {
  if (CANONICAL_EXCLUDED_ID_SET.has(p.id)) continue;

  // Check for any model codes in name, id, slug
  const patterns = [
    /TU\/A/i,
    /TUR\b/i,
    /\/DS\b/i,
    /SM-[A-Z0-9]+/i,
    /\b2[0-9]{3}[A-Z0-9]{5,}G\b/i, // Xiaomi model format e.g. 23116PN5BC
    /CPH[0-9]{4}/i, // Oppo/Realme
    /V[0-9]{4}[A-Z]*/i, // Vivo
    /TA-[0-9]{4}/i // Nokia
  ];

  for (const regex of patterns) {
    if (regex.test(p.name) || regex.test(p.id)) {
      candidatesWithCodes.push({
        id: p.id,
        name: p.name,
        brand: p.brand,
        patternMatched: regex.toString(),
        specs: p.specs
      });
      break;
    }
  }
}

console.log(`Total smartphones with potential model codes: ${candidatesWithCodes.length}`);
candidatesWithCodes.forEach((c, idx) => {
  console.log(`[${idx + 1}] id="${c.id}" | name="${c.name}" | pattern=${c.patternMatched}`);
});
