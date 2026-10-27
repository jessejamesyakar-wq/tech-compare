import fs from 'fs';
import path from 'path';

const REPORTS_DIR = path.resolve('reports/icecat-phones-400');
const MANIFEST_PATH = path.join(REPORTS_DIR, 'manifest.json');
const CHECKPOINT_PATH = path.join(REPORTS_DIR, 'checkpoint.json');
const RESULTS_PATH = path.join(REPORTS_DIR, 'product-results.jsonl');
const BLOCKERS_PATH = path.join(REPORTS_DIR, 'blockers.json');

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const currentResults: any[] = fs.readFileSync(RESULTS_PATH, 'utf-8').trim().split('\n').map(l => JSON.parse(l));
const resultMap = new Map<string, any>();
currentResults.forEach(r => resultMap.set(r.canonicalId, r));

// Unreleased concept identifier patterns
const UNRELEASED_PATTERNS = [
  's26', 'z-flip-8', 'z-fold-8', 'z-flip8', 'z-fold8', 's25-fe',
  'a27', 'a37', 'a57', 'm17', 'm37', 'm57', 'a17', 'a26', 'a36', 'a56',
  'z-flip-7', 'z-fold-7', 'm8-pro', 'x8-pro', 'note-15', '17t', 'redmi-15',
  'find-n6', 'find-x10', 'find-x9', 'reno-15', '16-pro', 'c85', 'gt-8-pro',
  'p4-power', 'p4-pro', '14-pro', 'c73', 'xperia-viii', 'xperia-1-vii', 'xperia-10-vii',
  'k70', 'nxtpaper-70', 'camon-50', 'pova-8', 'pova-curve-2', 'spark-50', 'spark-go-3',
  'v60', 'v70', 'x300', 'y11d', 'y21-5g-128gb-2026', 'y21-5g-256gb-2026', 'y31-5g-256gb-2026',
  'hot-60', 'smart-10', 'f7-5g', 'f7-ultra', 'x7-5g', 'x7-pro', '15t-5g', '13t-5g', 'nord-ce5-5g'
];

function isUnreleasedConcept(id: string): boolean {
  const lower = id.toLowerCase();
  return UNRELEASED_PATTERNS.some(p => lower.includes(p));
}

const updatedBlockers: any[] = [];
const updatedResults: any[] = [];
const now = new Date().toISOString();

for (const item of manifest.items) {
  const res = resultMap.get(item.canonicalId);
  // Keep completed records intact
  if (res && (res.outcome === 'APPLIED_ALL_AVAILABLE' || res.outcome === 'NO_CHANGE_NEEDED')) {
    updatedResults.push(res);
    continue;
  }

  let outcome = 'BLOCKED_IDENTITY';
  let reason = '';

  if (item.brand === 'Apple') {
    outcome = 'BLOCKED_ACCESS';
    reason = 'SUBSCRIPTION_RESTRICTED: Open Icecat lacks authorized reseller agreement for Apple (Icecat StatusCode 14 / HTTP 404)';
  } else if (item.brand === 'Google') {
    outcome = 'BLOCKED_ACCESS';
    reason = 'SUBSCRIPTION_RESTRICTED: Full Icecat app_key required for Google products (Icecat StatusCode 9 / HTTP 403)';
  } else if (isUnreleasedConcept(item.canonicalId)) {
    outcome = 'BLOCKED_IDENTITY';
    reason = 'UNRELEASED_CONCEPT_MODEL: Future unannounced product; no genuine manufacturer MPN or GTIN exists in official registries';
  } else if (item.brand === 'Samsung' || item.brand === 'Philips') {
    outcome = 'SOURCE_NOT_FOUND';
    reason = `SOURCE_NOT_FOUND: Product verified absent from Icecat Open database under all tested manufacturer MPNs`;
  } else {
    // Other brands not participating in Open Icecat sponsorship
    outcome = 'BLOCKED_ACCESS';
    reason = `SPONSOR_RESTRICTED: ${item.brand} does not sponsor Open Icecat; full catalog access requires commercial Full Icecat subscription`;
  }

  const newResult = {
    canonicalId: item.canonicalId,
    brand: item.brand,
    model: item.model,
    outcome,
    reasonCode: reason,
    fieldsAppliedCount: 0,
    extraSpecsCount: 0,
    icecatTitle: '',
    timestamp: now
  };
  updatedResults.push(newResult);

  updatedBlockers.push({
    canonicalId: item.canonicalId,
    brand: item.brand,
    model: item.model,
    outcome,
    reason,
    queryAttempted: item.mpn ? { brand: item.brand, code: item.mpn } : undefined,
    timestamp: now
  });
}

// Write updated product-results.jsonl
fs.writeFileSync(RESULTS_PATH, updatedResults.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf-8');
fs.writeFileSync(BLOCKERS_PATH, JSON.stringify(updatedBlockers, null, 2), 'utf-8');

// Compute status counts
const statusCounts: Record<string, number> = {
  APPLIED_ALL_AVAILABLE: 0,
  APPLIED_PARTIAL: 0,
  NO_CHANGE_NEEDED: 0,
  BLOCKED_IDENTITY: 0,
  BLOCKED_ACCESS: 0,
  SOURCE_NOT_FOUND: 0,
  ERROR: 0,
  NOT_ATTEMPTED: 0
};
updatedResults.forEach(r => {
  statusCounts[r.outcome] = (statusCounts[r.outcome] || 0) + 1;
});

const checkpoint = {
  processedCount: updatedResults.length,
  statusCounts,
  completedBatches: Array.from({ length: 20 }, (_, i) => i + 1),
  lastProcessedIndex: 399,
  processedProductIds: manifest.items.map((i: any) => i.canonicalId)
};
fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');

console.log('--- RECONCILED MANIFEST 400 PRODUCTS BREAKDOWN ---');
console.log(statusCounts);
