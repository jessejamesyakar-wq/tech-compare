import fs from 'fs';

const blockers = JSON.parse(fs.readFileSync('reports/icecat-phones-400/blockers.json', 'utf8'));
const blocked = blockers.filter((b: any) => b.outcome === 'BLOCKED_IDENTITY');
const snf = blockers.filter((b: any) => b.outcome === 'SOURCE_NOT_FOUND');

console.log('Total BLOCKED_IDENTITY:', blocked.length);
console.log('Total SOURCE_NOT_FOUND:', snf.length);

const byBrand: Record<string, Array<{ id: string; model: string }>> = {};
for (const b of blocked) {
  if (!byBrand[b.brand]) byBrand[b.brand] = [];
  byBrand[b.brand].push({ id: b.canonicalId, model: b.model });
}

for (const [brand, items] of Object.entries(byBrand)) {
  console.log(`\n=== ${brand} (${items.length} items) ===`);
  items.slice(0, 10).forEach(i => console.log(' ', i.id, '->', i.model));
  if (items.length > 10) console.log(`  ... and ${items.length - 10} more`);
}

console.log(`\n=== SOURCE_NOT_FOUND (${snf.length} items) ===`);
snf.forEach((s: any) => console.log(' ', s.canonicalId, '|', s.brand, '|', s.model, '|', JSON.stringify(s.queryAttempted)));
