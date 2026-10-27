import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { parseIcecatPayload } from './icecat_mapper';
import { CANONICAL_EXCLUDED_ID_SET } from '../src/lib/governance/canonicalExclusions';
import { GOLDEN_DATASET_V1_IDS } from '../src/lib/trustLayer/observe/goldenDatasetV1';
import { buildVerifiedEvidenceMap } from '../src/lib/evidence/productCompleteness';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

const username = process.env.ICECAT_USERNAME || 'MehmetYakar';
const apiToken = process.env.ICECAT_API_TOKEN || '';

const REPORTS_DIR = path.resolve('reports/icecat-phones-400');
const RAW_ARCHIVE_DIR = path.join(REPORTS_DIR, 'raw_archive');
if (!fs.existsSync(RAW_ARCHIVE_DIR)) {
  fs.mkdirSync(RAW_ARCHIVE_DIR, { recursive: true });
}

const MANIFEST_PATH = path.join(REPORTS_DIR, 'manifest.json');
const CHECKPOINT_PATH = path.join(REPORTS_DIR, 'checkpoint.json');
const RESULTS_PATH = path.join(REPORTS_DIR, 'product-results.jsonl');
const EVIDENCE_PATH = path.join(REPORTS_DIR, 'field-evidence.jsonl');
const JOURNAL_PATH = path.join(REPORTS_DIR, 'change-journal.jsonl');
const BLOCKERS_PATH = path.join(REPORTS_DIR, 'blockers.json');

// Safety Golden IDs
const goldenIds = new Set<string>();
Object.values(GOLDEN_DATASET_V1_IDS).forEach(arr => arr.forEach(id => goldenIds.add(id)));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchIcecat(brand: string, code: string) {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  url.searchParams.set('Brand', brand);
  url.searchParams.set('ProductCode', code);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'TechCompare-IcecatIntegration/2.0'
  };
  if (apiToken) headers['api-token'] = apiToken;

  const res = await fetch(url.toString(), { headers });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch {}
  return {
    ok: res.status === 200 && json?.msg === 'OK' && !!json?.data,
    status: res.status,
    data: json?.data
  };
}

// 17 Verified Samsung MPNs
const RESOLVED_ITEMS: Array<{ id: string; brand: string; mpn: string }> = [
  { id: 'samsung-samsung-galaxy-a14-86', brand: 'Samsung', mpn: 'SM-A146PZKDEUB' },
  { id: 'samsung-samsung-galaxy-z-flip-4-69', brand: 'Samsung', mpn: 'SM-F721BZAGEUE' },
  { id: 'samsung-samsung-galaxy-z-fold-4-70', brand: 'Samsung', mpn: 'SM-F936BZABEUB' },
  { id: 'samsung-samsung-galaxy-a12-57', brand: 'Samsung', mpn: 'SM-A125FZKKEUB' },
  { id: 'samsung-samsung-galaxy-z-flip-3-54', brand: 'Samsung', mpn: 'SM-F711BZEEEUE' },
  { id: 'samsung-samsung-galaxy-note-20-36', brand: 'Samsung', mpn: 'SM-N981BZAGEUE' },
  { id: 'samsung-samsung-galaxy-a50-24', brand: 'Samsung', mpn: 'SM-A505FZWSITV' },
  { id: 'samsung-samsung-galaxy-a80-27', brand: 'Samsung', mpn: 'SM-A805FZKDITV' },
  { id: 'samsung-samsung-galaxy-a16-5g-114', brand: 'Samsung', mpn: 'SM-A166BZKDEUB' },
  { id: 'samsung-samsung-galaxy-a21s-41', brand: 'Samsung', mpn: 'SM-A217FZKNEUA' },
  { id: 'samsung-samsung-galaxy-a41-43', brand: 'Samsung', mpn: 'SM-A415FZKDEUE' },
  { id: 'samsung-samsung-galaxy-m51-49', brand: 'Samsung', mpn: 'SM-M515FZKDEUE' },
  { id: 'samsung-samsung-galaxy-z-flip-38', brand: 'Samsung', mpn: 'SM-F700FZKDITV' },
  { id: 'samsung-samsung-galaxy-a20-21', brand: 'Samsung', mpn: 'SM-A202FZKDITV' },
  { id: 'samsung-samsung-galaxy-a30-22', brand: 'Samsung', mpn: 'SM-A307FN/DS' },
  { id: 'samsung-samsung-galaxy-a40-23', brand: 'Samsung', mpn: 'SM-A405FN/DS' },
  { id: 'samsung-samsung-galaxy-fold-19', brand: 'Samsung', mpn: 'SM-F900FZKDITV' }
];

async function run() {
  console.log('======================================================================');
  console.log(`[ASTERION / MASTER-01] APPLYING RESOLVED ICECAT PRODUCT BATCH (17 PRODUCTS)`);
  console.log('======================================================================\n');

  // Load catalog
  const smartphonesDataPath = path.resolve('src/lib/smartphonesData.json');
  const catalog: any[] = JSON.parse(fs.readFileSync(smartphonesDataPath, 'utf-8'));
  const catalogMap = new Map<string, any>();
  catalog.forEach(p => catalogMap.set(p.id, p));

  // Verified evidence map (protect existing manufacturer evidence)
  const verifiedEvidenceMap = buildVerifiedEvidenceMap();

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const manifestMap = new Map<string, any>();
  manifest.items.forEach((m: any) => manifestMap.set(m.canonicalId, m));

  let newlyAppliedCount = 0;
  const appliedProductsList: any[] = [];

  for (const item of RESOLVED_ITEMS) {
    if (CANONICAL_EXCLUDED_ID_SET.has(item.id) || goldenIds.has(item.id)) {
      console.warn(`[Safety Guard] Skipping protected record ${item.id}`);
      continue;
    }

    const product = catalogMap.get(item.id);
    if (!product) {
      console.error(`[Error] Product ${item.id} not found in catalog!`);
      continue;
    }

    const manifestItem = manifestMap.get(item.id);
    const mfrVerifiedFields = verifiedEvidenceMap.get(item.id) || new Set<string>();

    await sleep(400);
    const fetchRes = await fetchIcecat(item.brand, item.mpn);
    if (!fetchRes.ok || !fetchRes.data) {
      console.error(`[Fetch Failed] ${item.id} with MPN ${item.mpn}`);
      continue;
    }

    const now = new Date().toISOString();

    // Raw archive save
    const rawSavePath = path.join(RAW_ARCHIVE_DIR, `${item.id}.json`);
    const payloadHash = crypto.createHash('sha256').update(JSON.stringify(fetchRes.data)).digest('hex');
    fs.writeFileSync(rawSavePath, JSON.stringify(fetchRes.data, null, 2), 'utf-8');

    // Parse and map
    const mapped = parseIcecatPayload(fetchRes, 'tr');
    if (!mapped) {
      console.error(`[Mapping Failed] ${item.id}`);
      continue;
    }

    // Apply extraSpecs
    if (!product.extraSpecs) product.extraSpecs = [];
    const existingFeatureIds = new Set(product.extraSpecs.map((x: any) => x.featureId));
    let addedExtraSpecs = 0;
    for (const extra of mapped.extraSpecs) {
      if (!existingFeatureIds.has(extra.featureId)) {
        product.extraSpecs.push(extra);
        existingFeatureIds.add(extra.featureId);
        addedExtraSpecs++;
      }
    }

    // Apply normalized fields
    if (!product.specs) product.specs = {};
    const fieldEntries: Array<{ path: string; val: any }> = [];
    const walkSpecs = (obj: any, prefix: string) => {
      for (const [k, v] of Object.entries(obj)) {
        if (v !== undefined && v !== null && v !== '') {
          const fullPath = `${prefix}.${k}`;
          if (typeof v === 'object' && !Array.isArray(v)) {
            walkSpecs(v, fullPath);
          } else {
            fieldEntries.push({ path: fullPath, val: v });
          }
        }
      }
    };
    walkSpecs(mapped.specs, 'specs');

    let appliedFields = 0;
    for (const fe of fieldEntries) {
      if (mfrVerifiedFields.has(fe.path)) {
        continue;
      }

      const parts = fe.path.split('.');
      let curr = product;
      for (let pIdx = 0; pIdx < parts.length - 1; pIdx++) {
        if (!curr[parts[pIdx]]) curr[parts[pIdx]] = {};
        curr = curr[parts[pIdx]];
      }
      const oldVal = curr[parts[parts.length - 1]];
      if (oldVal === fe.val) {
        continue;
      }

      curr[parts[parts.length - 1]] = fe.val;
      appliedFields++;

      // Field evidence record
      const fieldEvidenceHash = crypto.createHash('sha256')
        .update(`${item.id}:${fe.path}:${JSON.stringify(fe.val)}:${payloadHash}`)
        .digest('hex');

      const evidenceRecord = {
        productId: item.id,
        icecatId: mapped.icecatId,
        fieldPath: fe.path,
        rawValue: fe.val,
        normalizedValue: fe.val,
        scope: 'LEVEL_1_MODEL_FAMILY',
        sourceLang: 'tr',
        fetchedAt: now,
        sourceType: 'ICECAT',
        trustClassification: 'ICECAT_CATALOG_VERIFIED',
        payloadHash,
        fieldEvidenceHash
      };
      fs.appendFileSync(EVIDENCE_PATH, JSON.stringify(evidenceRecord) + '\n', 'utf-8');

      // Change journal record
      const journalRecord = {
        timestamp: now,
        productId: item.id,
        fieldPath: fe.path,
        oldValue: oldVal ?? null,
        newValue: fe.val,
        action: oldVal !== undefined && oldVal !== null ? 'VALUE_CORRECTED' : 'FIELD_POPULATED'
      };
      fs.appendFileSync(JOURNAL_PATH, JSON.stringify(journalRecord) + '\n', 'utf-8');
    }

    console.log(`[APPLIED] ${item.id} -> ${appliedFields} fields updated, ${addedExtraSpecs} extra specs added (Total extraSpecs: ${product.extraSpecs.length})`);
    newlyAppliedCount++;
    appliedProductsList.push({
      canonicalId: item.id,
      brand: item.brand,
      model: product.model || manifestItem?.model,
      slug: product.slug,
      appliedFields,
      addedExtraSpecs,
      icecatTitle: mapped.title,
      mpn: item.mpn
    });
  }

  // Save updated smartphonesData.json
  fs.writeFileSync(smartphonesDataPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\nSuccessfully applied Icecat updates to ${newlyAppliedCount} products!`);

  // Update product-results.jsonl, checkpoint.json, and blockers.json
  const existingResults: any[] = fs.readFileSync(RESULTS_PATH, 'utf-8').trim().split('\n').map(l => JSON.parse(l));
  const resultMap = new Map<string, any>();
  existingResults.forEach(r => resultMap.set(r.canonicalId, r));

  appliedProductsList.forEach(p => {
    resultMap.set(p.canonicalId, {
      canonicalId: p.canonicalId,
      brand: p.brand,
      model: p.model,
      outcome: 'APPLIED_ALL_AVAILABLE',
      reasonCode: `Applied ${p.appliedFields} fields and ${p.addedExtraSpecs} extra specs via MPN ${p.mpn}`,
      fieldsAppliedCount: p.appliedFields,
      extraSpecsCount: p.addedExtraSpecs,
      icecatTitle: p.icecatTitle,
      timestamp: new Date().toISOString()
    });
  });

  // Re-write results.jsonl in manifest order
  const updatedResults: any[] = [];
  manifest.items.forEach((item: any) => {
    const res = resultMap.get(item.canonicalId);
    if (res) {
      updatedResults.push(res);
    }
  });
  fs.writeFileSync(RESULTS_PATH, updatedResults.map(r => JSON.stringify(r)).join('\n') + '\n', 'utf-8');

  // Count updated outcomes
  const outcomeCounts: Record<string, number> = {};
  updatedResults.forEach(r => {
    outcomeCounts[r.outcome] = (outcomeCounts[r.outcome] || 0) + 1;
  });

  // Update checkpoint.json
  const checkpoint: any = {
    processedCount: updatedResults.length,
    statusCounts: {
      APPLIED_ALL_AVAILABLE: outcomeCounts['APPLIED_ALL_AVAILABLE'] || 0,
      APPLIED_PARTIAL: outcomeCounts['APPLIED_PARTIAL'] || 0,
      NO_CHANGE_NEEDED: outcomeCounts['NO_CHANGE_NEEDED'] || 0,
      BLOCKED_IDENTITY: outcomeCounts['BLOCKED_IDENTITY'] || 0,
      BLOCKED_ACCESS: outcomeCounts['BLOCKED_ACCESS'] || 0,
      SOURCE_NOT_FOUND: outcomeCounts['SOURCE_NOT_FOUND'] || 0,
      ERROR: outcomeCounts['ERROR'] || 0,
      NOT_ATTEMPTED: 0
    },
    completedBatches: Array.from({ length: 20 }, (_, i) => i + 1),
    lastProcessedIndex: 399,
    processedProductIds: manifest.items.map((i: any) => i.canonicalId)
  };
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');

  // Update blockers.json (remove unblocked products)
  const unblockedIdSet = new Set(appliedProductsList.map(p => p.canonicalId));
  let existingBlockers: any[] = [];
  if (fs.existsSync(BLOCKERS_PATH)) {
    try { existingBlockers = JSON.parse(fs.readFileSync(BLOCKERS_PATH, 'utf-8')); } catch {}
  }
  const remainingBlockers = existingBlockers.filter(b => !unblockedIdSet.has(b.canonicalId));
  fs.writeFileSync(BLOCKERS_PATH, JSON.stringify(remainingBlockers, null, 2), 'utf-8');

  console.log('\n[Summary Status Counts]');
  console.log(checkpoint.statusCounts);
  fs.writeFileSync('reports/icecat-phones-400/applied_batch_17_summary.json', JSON.stringify(appliedProductsList, null, 2), 'utf-8');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
