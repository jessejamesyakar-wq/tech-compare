import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('reports/icecat-phones-400/manifest.json', 'utf8'));
const results = fs.readFileSync('reports/icecat-phones-400/product-results.jsonl', 'utf8').trim().split('\n').map(l => JSON.parse(l));

console.log('Total manifest items:', manifest.items.length);
console.log('Total results in product-results.jsonl:', results.length);

const resultMap = new Map<string, any>();
results.forEach(r => resultMap.set(r.canonicalId, r));

// Check each 20-product chunk
for (let b = 0; b < 20; b++) {
  const chunk = manifest.items.slice(b * 20, (b + 1) * 20);
  const outcomes: Record<string, number> = {};
  chunk.forEach((item: any) => {
    const res = resultMap.get(item.canonicalId);
    const out = res ? res.outcome : 'UNPROCESSED';
    outcomes[out] = (outcomes[out] || 0) + 1;
  });
  console.log(`Batch ${b + 1} (items ${b * 20 + 1}-${(b + 1) * 20}):`, outcomes);
}
