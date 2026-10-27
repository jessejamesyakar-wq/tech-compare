import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('reports/icecat-phones-400/manifest.json', 'utf8'));
const results = fs.readFileSync('reports/icecat-phones-400/product-results.jsonl', 'utf8').trim().split('\n').map(l => JSON.parse(l));
const completedIds = new Set(results.filter(r => r.outcome === 'APPLIED_ALL_AVAILABLE' || r.outcome === 'NO_CHANGE_NEEDED').map(r => r.canonicalId));

const remainingSamsung = manifest.items.filter((i: any) => i.brand === 'Samsung' && !completedIds.has(i.canonicalId));
console.log('Remaining Samsung count:', remainingSamsung.length);
remainingSamsung.forEach((i: any, idx: number) => {
  console.log((idx + 1) + '. ' + i.canonicalId + ' | ' + i.model + ' | mpn: ' + (i.mpn || 'NONE') + ' | gtin: ' + (i.gtin || 'NONE'));
});
