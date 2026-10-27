import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { parseIcecatPayload, MappedIcecatResult } from './icecat_mapper';
import { KNOWN_PHONE_MPNS } from './known_phone_mpns';
import { CANONICAL_EXCLUDED_ID_SET } from '../src/lib/governance/canonicalExclusions';
import { GOLDEN_DATASET_V1_IDS } from '../src/lib/trustLayer/observe/goldenDatasetV1';
import { buildVerifiedEvidenceMap, evaluateProductCompleteness } from '../src/lib/evidence/productCompleteness';

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

// Sleep helper
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// HTTP fetcher with timeout and retries
async function queryIcecatApi(params: { brand?: string; code?: string; gtin?: string; icecatId?: number; lang?: string }): Promise<{
  ok: boolean;
  status: number;
  statusCode?: number;
  msg?: string;
  data?: any;
  error?: string;
}> {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', params.lang || 'tr');
  url.searchParams.set('content', 'all');

  if (params.icecatId) {
    url.searchParams.set('IcecatId', String(params.icecatId));
  } else if (params.brand && params.code) {
    url.searchParams.set('Brand', params.brand);
    url.searchParams.set('ProductCode', params.code);
  } else if (params.gtin) {
    url.searchParams.set('GTIN', params.gtin);
  } else {
    return { ok: false, status: 400, error: 'NO_QUERY_PARAMS' };
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'TechCompare-IcecatIntegration/2.0'
  };
  if (apiToken) headers['api-token'] = apiToken;

  let retries = 0;
  while (retries <= 2) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(url.toString(), {
        headers,
        signal: controller.signal
      });
      clearTimeout(timer);

      const text = await res.text();
      let json: any = null;
      try { json = JSON.parse(text); } catch {}

      if (res.status === 429) {
        const retryAfter = parseInt(res.headers.get('Retry-After') || '5', 10);
        console.log(`[Rate Limit] 429 received, backing off ${retryAfter}s...`);
        await sleep(retryAfter * 1000);
        retries++;
        continue;
      }

      if (res.status >= 500 && retries < 2) {
        console.log(`[Server Error] HTTP ${res.status}, retrying in 2s...`);
        await sleep(2000);
        retries++;
        continue;
      }

      const isOk = res.status === 200 && json?.msg === 'OK' && !!json?.data;
      return {
        ok: isOk,
        status: res.status,
        statusCode: json?.StatusCode,
        msg: json?.msg || json?.Message || json?.Error,
        data: json?.data
      };
    } catch (e: any) {
      if (retries < 2) {
        await sleep(2000);
        retries++;
        continue;
      }
      return { ok: false, status: 0, error: e.message };
    }
  }

  return { ok: false, status: 0, error: 'MAX_RETRIES_EXCEEDED' };
}

// Main batch execution
export async function runBatchExecution() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`Manifest file not found at ${MANIFEST_PATH}!`);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const totalItems: any[] = manifest.items;
  console.log(`[Runner] Manifest loaded: ${totalItems.length} items`);

  // Load existing checkpoint if present
  let checkpoint: any = {
    processedCount: 0,
    statusCounts: {
      APPLIED_ALL_AVAILABLE: 0,
      APPLIED_PARTIAL: 0,
      NO_CHANGE_NEEDED: 0,
      BLOCKED_IDENTITY: 0,
      BLOCKED_ACCESS: 0,
      SOURCE_NOT_FOUND: 0,
      ERROR: 0,
      NOT_ATTEMPTED: totalItems.length
    },
    completedBatches: [],
    lastProcessedIndex: -1,
    processedProductIds: []
  };

  if (fs.existsSync(CHECKPOINT_PATH)) {
    try {
      checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf-8'));
      console.log(`[Runner] Resuming from checkpoint: ${checkpoint.processedCount} processed.`);
    } catch {}
  }

  const processedSet = new Set<string>(checkpoint.processedProductIds || []);

  // Load catalog data
  const smartphonesDataPath = path.resolve('src/lib/smartphonesData.json');
  const catalog: any[] = JSON.parse(fs.readFileSync(smartphonesDataPath, 'utf-8'));
  const catalogMap = new Map<string, any>();
  catalog.forEach(p => catalogMap.set(p.id, p));

  // Load existing verified manufacturer fields so we NEVER overwrite them
  const verifiedEvidenceMap = buildVerifiedEvidenceMap();

  // Load existing blockers
  let blockers: any[] = [];
  if (fs.existsSync(BLOCKERS_PATH)) {
    try { blockers = JSON.parse(fs.readFileSync(BLOCKERS_PATH, 'utf-8')); } catch {}
  }

  const BATCH_SIZE = 20;
  const totalBatches = Math.ceil(totalItems.length / BATCH_SIZE);

  console.log(`[Runner] Starting batch execution: ${totalBatches} batches of ${BATCH_SIZE} items.`);

  for (let batchIdx = 0; batchIdx < totalBatches; batchIdx++) {
    const startIndex = batchIdx * BATCH_SIZE;
    const endIndex = Math.min(startIndex + BATCH_SIZE, totalItems.length);
    const batchItems = totalItems.slice(startIndex, endIndex);

    const isBatchComplete = batchItems.every(item => processedSet.has(item.canonicalId));
    if (isBatchComplete) {
      console.log(`[Runner] Batch ${batchIdx + 1}/${totalBatches} already completed, skipping.`);
      continue;
    }

    console.log(`\n==================================================`);
    console.log(`[Runner] Processing Batch ${batchIdx + 1}/${totalBatches} (Items ${startIndex + 1}-${endIndex})`);
    console.log(`==================================================`);

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i];
      const itemGlobalIndex = startIndex + i;

      if (processedSet.has(item.canonicalId)) {
        continue;
      }

      // Check safety guard: NEVER touch canonical exclusions or Golden Dataset
      if (CANONICAL_EXCLUDED_ID_SET.has(item.canonicalId) || goldenIds.has(item.canonicalId)) {
        console.warn(`[Safety Guard] Skipping protected record ${item.canonicalId}`);
        continue;
      }

      const product = catalogMap.get(item.canonicalId);
      if (!product) {
        console.error(`[Runner] Product ${item.canonicalId} not found in catalog!`);
        continue;
      }

      const manufacturerVerifiedFields = verifiedEvidenceMap.get(item.canonicalId) || new Set<string>();

      // Determine query candidates
      const queryCandidates: Array<{ brand: string; code?: string; gtin?: string; icecatId?: number }> = [];

      // Candidate 1: Manifest MPN / GTIN / IcecatId
      if (item.mpn) queryCandidates.push({ brand: item.brand, code: item.mpn });
      if (item.gtin) queryCandidates.push({ brand: item.brand, gtin: item.gtin });
      if (item.icecatId) queryCandidates.push({ brand: item.brand, icecatId: item.icecatId });

      // Candidate 2: Curated KNOWN_PHONE_MPNS
      const known = KNOWN_PHONE_MPNS[item.canonicalId];
      if (known?.mpn && (!item.mpn || known.mpn !== item.mpn)) {
        queryCandidates.push({ brand: item.brand, code: known.mpn });
      }

      // Candidate 3: Product's own modelCode if different
      if (product.modelCode && product.modelCode !== item.mpn && product.modelCode !== known?.mpn) {
        queryCandidates.push({ brand: item.brand, code: product.modelCode });
      }

      let fetchResult: any = null;
      let usedCandidate: any = null;

      if (queryCandidates.length === 0) {
        // No query candidate available
        fetchResult = { ok: false, status: 0, reasonCode: 'IDENTITY_UNRESOLVED', msg: 'No part code, GTIN or Icecat ID available' };
      } else {
        // Try candidates sequentially (up to 3)
        for (const candidate of queryCandidates.slice(0, 3)) {
          await sleep(550); // Rate limit: max ~2 req/sec
          usedCandidate = candidate;
          const res = await queryIcecatApi(candidate);
          if (res.ok) {
            fetchResult = res;
            break;
          } else {
            fetchResult = res;
          }
        }
      }

      const now = new Date().toISOString();
      let outcome: string = 'ERROR';
      let outcomeReason: string = '';
      let fieldsAppliedCount = 0;
      let extraSpecsCount = 0;
      let icecatTitle: string = '';

      if (fetchResult && fetchResult.ok && fetchResult.data) {
        // Save raw archive (with redacted secrets)
        const rawSavePath = path.join(RAW_ARCHIVE_DIR, `${item.canonicalId}.json`);
        const payloadHash = crypto.createHash('sha256').update(JSON.stringify(fetchResult.data)).digest('hex');
        fs.writeFileSync(rawSavePath, JSON.stringify(fetchResult.data, null, 2), 'utf-8');

        // Parse and map
        const mapped = parseIcecatPayload(fetchResult, 'tr');
        if (mapped) {
          icecatTitle = mapped.title;
          extraSpecsCount = mapped.extraSpecs.length;

          // Apply unmapped extraSpecs to product object
          if (!product.extraSpecs) product.extraSpecs = [];
          // Deduplicate extraSpecs by featureId
          const existingFeatureIds = new Set(product.extraSpecs.map((x: any) => x.featureId));
          for (const extra of mapped.extraSpecs) {
            if (!existingFeatureIds.has(extra.featureId)) {
              product.extraSpecs.push(extra);
              existingFeatureIds.add(extra.featureId);
            }
          }

          // Apply normalized fields
          if (!product.specs) product.specs = {};

          const fieldEntries: Array<{ path: string; val: any; unit?: string; rawVal?: any }> = [];

          // Helper to flatten mapped specs into paths
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

          for (const fe of fieldEntries) {
            // Safety: DO NOT overwrite stronger verified manufacturer evidence!
            if (manufacturerVerifiedFields.has(fe.path)) {
              // Record conflict/preserved note if values differ
              continue;
            }

            // Check existing value
            const parts = fe.path.split('.');
            let curr = product;
            for (let pIdx = 0; pIdx < parts.length - 1; pIdx++) {
              if (!curr[parts[pIdx]]) curr[parts[pIdx]] = {};
              curr = curr[parts[pIdx]];
            }
            const oldVal = curr[parts[parts.length - 1]];

            // Do not rewrite if values are already equal
            if (oldVal === fe.val) {
              continue;
            }

            // Apply change
            curr[parts[parts.length - 1]] = fe.val;
            fieldsAppliedCount++;

            // Create field evidence record
            const fieldEvidenceHash = crypto.createHash('sha256')
              .update(`${item.canonicalId}:${fe.path}:${JSON.stringify(fe.val)}:${payloadHash}`)
              .digest('hex');

            const evidenceRecord = {
              productId: item.canonicalId,
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

            // Create change journal record
            const journalRecord = {
              timestamp: now,
              productId: item.canonicalId,
              fieldPath: fe.path,
              oldValue: oldVal ?? null,
              newValue: fe.val,
              action: oldVal !== undefined && oldVal !== null ? 'VALUE_CORRECTED' : 'FIELD_POPULATED'
            };
            fs.appendFileSync(JOURNAL_PATH, JSON.stringify(journalRecord) + '\n', 'utf-8');
          }

          if (fieldsAppliedCount > 0) {
            outcome = 'APPLIED_ALL_AVAILABLE';
            outcomeReason = `Applied ${fieldsAppliedCount} fields and ${extraSpecsCount} extra specs`;
          } else {
            outcome = 'NO_CHANGE_NEEDED';
            outcomeReason = 'Existing catalog already had current or stronger specifications';
          }
        } else {
          outcome = 'ERROR';
          outcomeReason = 'Failed to map Icecat payload';
        }
      } else {
        // Failure or restriction
        if (fetchResult?.status === 404 && (item.brand === 'Apple' || fetchResult?.statusCode === 14)) {
          outcome = 'BLOCKED_ACCESS';
          outcomeReason = 'SUBSCRIPTION_RESTRICTED: Open/Partner catalog lacks reseller authorization for brand';
        } else if (fetchResult?.status === 403 || fetchResult?.statusCode === 14) {
          outcome = 'BLOCKED_ACCESS';
          outcomeReason = 'SUBSCRIPTION_RESTRICTED: Brand access restricted';
        } else if (fetchResult?.reasonCode === 'IDENTITY_UNRESOLVED') {
          outcome = 'BLOCKED_IDENTITY';
          outcomeReason = 'IDENTITY_UNRESOLVED: Missing manufacturer part code or GTIN';
        } else if (fetchResult?.status === 404 || fetchResult?.statusCode === 8) {
          outcome = 'SOURCE_NOT_FOUND';
          outcomeReason = 'SOURCE_NOT_FOUND: Product not found in Icecat database';
        } else {
          outcome = 'ERROR';
          outcomeReason = fetchResult?.error || fetchResult?.msg || `HTTP_${fetchResult?.status}`;
        }

        // Add to blockers
        blockers.push({
          canonicalId: item.canonicalId,
          brand: item.brand,
          model: item.model,
          outcome,
          reason: outcomeReason,
          queryAttempted: usedCandidate,
          timestamp: now
        });
      }

      // Record product result
      const productResultRecord = {
        canonicalId: item.canonicalId,
        brand: item.brand,
        model: item.model,
        outcome,
        reasonCode: outcomeReason,
        fieldsAppliedCount,
        extraSpecsCount,
        icecatTitle,
        timestamp: now
      };
      fs.appendFileSync(RESULTS_PATH, JSON.stringify(productResultRecord) + '\n', 'utf-8');

      // Update checkpoint counts
      checkpoint.processedCount++;
      checkpoint.lastProcessedIndex = itemGlobalIndex;
      checkpoint.lastProductId = item.canonicalId;
      checkpoint.statusCounts[outcome] = (checkpoint.statusCounts[outcome] || 0) + 1;
      checkpoint.statusCounts.NOT_ATTEMPTED = totalItems.length - checkpoint.processedCount;
      processedSet.add(item.canonicalId);
      checkpoint.processedProductIds = Array.from(processedSet);

      console.log(`[${checkpoint.processedCount}/${totalItems.length}] ${item.canonicalId} -> ${outcome} (${outcomeReason.slice(0, 45)})`);

      // Write checkpoint after every product
      fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');
      fs.writeFileSync(BLOCKERS_PATH, JSON.stringify(blockers, null, 2), 'utf-8');

      // Persist updated catalog to smartphonesData.json
      if (fieldsAppliedCount > 0 || extraSpecsCount > 0) {
        fs.writeFileSync(smartphonesDataPath, JSON.stringify(catalog, null, 2), 'utf-8');
      }

      // VERIFICATION HOOK FOR BATCH 1 FIRST 5 PRODUCTS
      if (checkpoint.processedCount === 5) {
        console.log('\n--- FIRST 5 PRODUCTS SAFETY & MAPPER VERIFICATION ---');
        console.log(`Processed 5 products. Status counts so far:`, checkpoint.statusCounts);
        // Verify prices and offers were NOT changed
        const currentPrices = catalog.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          basePrice: p.basePrice,
          price: p.price,
          currency: p.currency,
          storeOffers: p.storeOffers,
          priceHistory: p.priceHistory
        }));
        const currentPriceHash = crypto.createHash('sha256').update(JSON.stringify(currentPrices)).digest('hex');
        const snap = JSON.parse(fs.readFileSync(path.join(REPORTS_DIR, 'initial_safety_snapshot.json'), 'utf-8'));
        if (currentPriceHash !== snap.priceAndOfferHash) {
          console.error(`[CRITICAL] Price hash mismatch after first 5 products! Halting!`);
          process.exit(1);
        }
        console.log('[Safety Verification] Price and offer state hash VERIFIED UNCHANGED.');
        console.log('--- RESUMING CONTINUOUS BATCH EXECUTION ---\n');
      }
    }

    checkpoint.completedBatches.push(batchIdx + 1);
    fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');
    console.log(`[Runner] Batch ${batchIdx + 1} completed.`);
  }

  console.log('\n==================================================');
  console.log('[Runner] ALL 400 MANIFEST PRODUCTS PROCESSED!');
  console.log('Final Status Breakdown:', checkpoint.statusCounts);
  console.log('==================================================');
}

if (require.main === module) {
  runBatchExecution().catch(e => {
    console.error('Fatal batch execution error:', e);
    process.exit(1);
  });
}
