import fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('reports/icecat-phones-400/manifest.json', 'utf8'));
const results = fs.readFileSync('reports/icecat-phones-400/product-results.jsonl', 'utf8').trim().split('\n').map(l => JSON.parse(l));
const completedIds = new Set(results.filter(r => r.outcome === 'APPLIED_ALL_AVAILABLE' || r.outcome === 'NO_CHANGE_NEEDED').map(r => r.canonicalId));

console.log('--- CHECKING S22, S21, S20, Note, S10 in manifest ---');
const checkNames = ['s22', 's21', 's20', 'note', 's10', 's9'];
for (const item of manifest.items) {
  if (checkNames.some(cn => item.canonicalId.includes(cn))) {
    const isComp = completedIds.has(item.canonicalId);
    console.log(`${item.canonicalId} -> ${isComp ? 'COMPLETED' : 'REMAINING'}`);
  }
}
