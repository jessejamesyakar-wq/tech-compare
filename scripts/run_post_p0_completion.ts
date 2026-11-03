import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import { assertNonInteractiveFileExecution } from './non_interactive_guard';
import { parseIcecatPayload } from './icecat_mapper';
import { CANONICAL_EXCLUDED_ID_SET } from '../src/lib/governance/canonicalExclusions';
import { GOLDEN_DATASET_V1_IDS } from '../src/lib/trustLayer/observe/goldenDatasetV1';
import { buildVerifiedEvidenceMap } from '../src/lib/evidence/productCompleteness';
import {
  verifyIcecatTargetIdentity,
  verifyAndExtractManufacturerSnapshot,
  resolveAccessBlockerObservation,
  ManufacturerSnapshotMeta,
  RawAccessObservation,
  PreTransferMpnSource,
} from '../src/lib/evidence/canonicalIdentityGate';
import { DOWNGRADED_PILOT_FIELDS } from '../src/lib/evidence/trustClassification';

const guard = assertNonInteractiveFileExecution(__filename, 10 * 60 * 1000);

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
const ACCESS_BREAKDOWN_PATH = path.join(REPORTS_DIR, 'access-blockers-breakdown.json');
const POST_P0_SUMMARY_PATH = path.join(REPORTS_DIR, 'post_p0_completion_summary.json');

const A20_SNAPSHOT_META_PATH = path.join(
  RAW_ARCHIVE_DIR,
  'samsung-samsung-galaxy-a20-21.official_manufacturer.json'
);
const ACCESS_PROBE_OBS_PATH = path.join(RAW_ARCHIVE_DIR, 'access_probe_observations.json');

// P0 Commit used as the clean pre-transfer baseline for the 21 post-P0 candidates
const P0_BASELINE_COMMIT = '22f60412e3a948f489770c35673ae68dcb218f54';

const goldenIds = new Set<string>();
Object.values(GOLDEN_DATASET_V1_IDS).forEach(arr => arr.forEach(id => goldenIds.add(id)));

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchIcecatSheet(params: { brand: string; mpn?: string; gtin?: string }): Promise<{
  ok: boolean;
  status: number;
  statusCode?: number;
  msg?: string;
  data?: any;
}> {
  const url = new URL('https://live.icecat.biz/api/');
  url.searchParams.set('UserName', username);
  url.searchParams.set('Language', 'tr');
  url.searchParams.set('content', 'all');
  if (params.gtin) {
    url.searchParams.set('GTIN', params.gtin);
  } else if (params.mpn) {
    url.searchParams.set('Brand', params.brand);
    url.searchParams.set('ProductCode', params.mpn);
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'User-Agent': 'TechCompare-IcecatIntegration/2.2-PostP0Hardened',
  };
  if (apiToken) headers['api-token'] = apiToken;

  for (let attempt = 0; attempt <= 1; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 20000);
      const res = await fetch(url.toString(), { headers, signal: controller.signal });
      clearTimeout(timer);
      const text = await res.text();
      let json: any = null;
      try {
        json = JSON.parse(text);
      } catch {}
      return {
        ok: res.status === 200 && json?.msg === 'OK' && !!json?.data,
        status: res.status,
        statusCode: json?.StatusCode,
        msg: json?.msg || json?.Message || json?.Error,
        data: json?.data,
      };
    } catch (e: any) {
      if (attempt === 0) {
        await sleep(1000);
        continue;
      }
      return { ok: false, status: 0, msg: e?.message || 'FETCH_ERROR' };
    }
  }
  return { ok: false, status: 0, msg: 'MAX_RETRIES' };
}

/**
 * Candidate Icecat queries to evaluate against the Independent Pre-Transfer Target Identity Gate.
 * NOTE (Requirement 3): cand.mpn is ONLY the query parameter for Icecat.
 * It is NEVER passed as preTransferMpn or used to self-validate target identity, RAM/storage, or 4G/5G!
 */
interface IcecatQueryCandidate {
  id: string;
  brand: string;
  queriedMpn: string;
  queriedGtin?: string;
  isP0Isolated?: boolean;
}

const ICECAT_QUERY_CANDIDATES = new Map<string, IcecatQueryCandidate>([
  // --- Phase A: 3 Isolated P0 Phones Evaluated via Icecat ---
  [
    'samsung-samsung-galaxy-a30-22',
    {
      id: 'samsung-samsung-galaxy-a30-22',
      brand: 'Samsung',
      queriedMpn: 'SM-A305FZKF',
      queriedGtin: '8801643723255',
      isP0Isolated: true,
    },
  ],
  [
    'samsung-samsung-galaxy-a14-86',
    {
      id: 'samsung-samsung-galaxy-a14-86',
      brand: 'Samsung',
      queriedMpn: 'SM-A145RZKUEUE',
      isP0Isolated: true,
    },
  ],
  [
    'samsung-samsung-galaxy-note-20-36',
    {
      id: 'samsung-samsung-galaxy-note-20-36',
      brand: 'Samsung',
      queriedMpn: 'SM-N980FZAGEUE',
      isP0Isolated: true,
    },
  ],

  // --- Phase B: 17 Pending Manifest Phones Evaluated Against Independent Pre-Transfer Target Identity ---
  [
    'samsung-samsung-galaxy-z-fold-2-39',
    {
      id: 'samsung-samsung-galaxy-z-fold-2-39',
      brand: 'Samsung',
      queriedMpn: 'SM-F916BZKAEUE',
    },
  ],
  [
    'samsung-samsung-galaxy-a31-42',
    {
      id: 'samsung-samsung-galaxy-a31-42',
      brand: 'Samsung',
      queriedMpn: 'SM-A315GZKVEUE',
    },
  ],
  [
    'samsung-samsung-galaxy-a71-45',
    {
      id: 'samsung-samsung-galaxy-a71-45',
      brand: 'Samsung',
      queriedMpn: 'SM-A715FZKGTUR',
    },
  ],
  [
    'samsung-samsung-galaxy-m11-46',
    {
      id: 'samsung-samsung-galaxy-m11-46',
      brand: 'Samsung',
      queriedMpn: 'SM-M115FZKNEUE',
    },
  ],
  [
    'samsung-samsung-galaxy-m12-63',
    {
      id: 'samsung-samsung-galaxy-m12-63',
      brand: 'Samsung',
      queriedMpn: 'SM-M127FZKVEUE',
    },
  ],
  [
    'samsung-samsung-galaxy-a23-72',
    {
      id: 'samsung-samsung-galaxy-a23-72',
      brand: 'Samsung',
      queriedMpn: 'SM-A235FZOGXSA',
      queriedGtin: '8806094275872',
    },
  ],
  [
    'samsung-samsung-galaxy-m23-5g-77',
    {
      id: 'samsung-samsung-galaxy-m23-5g-77',
      brand: 'Samsung',
      queriedMpn: 'SM-M236BZGGEUE',
      queriedGtin: '8806094182323',
    },
  ],
  [
    'samsung-samsung-galaxy-m33-5g-78',
    {
      id: 'samsung-samsung-galaxy-m33-5g-78',
      brand: 'Samsung',
      queriedMpn: 'SM-M336BZBGEUE',
    },
  ],
  [
    'samsung-samsung-galaxy-m53-5g-79',
    {
      id: 'samsung-samsung-galaxy-m53-5g-79',
      brand: 'Samsung',
      queriedMpn: 'SM-M536BZBGEUE',
    },
  ],
  [
    'samsung-samsung-galaxy-z-fold-5-85',
    {
      id: 'samsung-samsung-galaxy-z-fold-5-85',
      brand: 'Samsung',
      queriedMpn: 'SM-F946BZKCEUE',
    },
  ],
  [
    'samsung-samsung-galaxy-a05-99',
    {
      id: 'samsung-samsung-galaxy-a05-99',
      brand: 'Samsung',
      queriedMpn: 'SM-A055FZSDTUR',
    },
  ],
  [
    'samsung-samsung-galaxy-z-flip-7-111',
    {
      id: 'samsung-samsung-galaxy-z-flip-7-111',
      brand: 'Samsung',
      queriedMpn: 'SM-F766BZKGTUR',
    },
  ],
  [
    'samsung-samsung-galaxy-a26-5g-115',
    {
      id: 'samsung-samsung-galaxy-a26-5g-115',
      brand: 'Samsung',
      queriedMpn: 'SM-A266BZKBEUE',
      queriedGtin: '8806097072812',
    },
  ],
  [
    'samsung-samsung-galaxy-a56-5g-117',
    {
      id: 'samsung-samsung-galaxy-a56-5g-117',
      brand: 'Samsung',
      queriedMpn: 'SM-A566BZKCEUB',
    },
  ],
  [
    'samsung-samsung-galaxy-a17-5g-256gb-128',
    {
      id: 'samsung-samsung-galaxy-a17-5g-256gb-128',
      brand: 'Samsung',
      queriedMpn: 'SM-A176BZKDEUB',
    },
  ],
  [
    'samsung-samsung-galaxy-s25-fe-256gb-130',
    {
      id: 'samsung-samsung-galaxy-s25-fe-256gb-130',
      brand: 'Samsung',
      queriedMpn: 'SM-S731BDBGTUR',
    },
  ],
  [
    'samsung-samsung-galaxy-z-fold-7-256gb-132',
    {
      id: 'samsung-samsung-galaxy-z-fold-7-256gb-132',
      brand: 'Samsung',
      queriedMpn: 'SM-F966BZSBEUB',
    },
  ],
]);

function removeResolvedFromUnresolvedFields(product: any, resolvedPaths: string[]) {
  if (!product.specVerification || !Array.isArray(product.specVerification.unresolvedFields)) {
    return;
  }
  const normalizedResolved = new Set(resolvedPaths.map(p => p.replace(/^specs\./, '')));
  // Only remove the exact resolved leaf path and its exact legacy alias (NEVER sibling leaves)
  const ALIAS_MAP: Record<string, string[]> = {
    'screen.size': ['screen.size', 'screenSize'],
    'screen.type': ['screen.type', 'panelType', 'displayType'],
    'screen.resolution': ['screen.resolution', 'resolution'],
    'screen.refreshRate': ['screen.refreshRate', 'refreshRate', 'refreshRateHz'],
    'processor.chip': ['processor.chip', 'processor', 'chipset'],
    'processor.cores': ['processor.cores'],
    'memory.ramGb': ['memory.ramGb', 'ramGb', 'ram'],
    'memory.storageGb': ['memory.storageGb', 'storageGb', 'storage'],
    'memory.expandableStorage': ['memory.expandableStorage'],
    'camera.mainMp': ['camera.mainMp', 'mainCamera', 'rearCameraMp'],
    'camera.selfieMp': ['camera.selfieMp', 'frontCamera', 'selfieMp'],
    'camera.videoRes': ['camera.videoRes'],
    'battery.capacitymAh': ['battery.capacitymAh', 'batteryCapacityMah', 'batteryMah', 'battery'],
    'battery.chargingWatts': ['battery.chargingWatts', 'chargingWatts', 'fastChargingWatts'],
    'battery.wirelessCharging': ['battery.wirelessCharging'],
    'connectivity.has5G': ['connectivity.has5G', 'has5G'],
    'connectivity.wifiStandard': ['connectivity.wifiStandard', 'wifiStandard'],
    'connectivity.bluetooth': ['connectivity.bluetooth', 'bluetoothVersion'],
    'connectivity.hasNFC': ['connectivity.hasNFC', 'nfc'],
    'connectivity.hasesim': ['connectivity.hasesim', 'esim'],
    'build.weightGrams': ['build.weightGrams', 'weightGrams', 'weight'],
    'build.thicknessMm': ['build.thicknessMm', 'thicknessMm'],
    'build.waterResistance': ['build.waterResistance', 'waterResistance', 'ipRating'],
    'software.osName': ['software.osName', 'os'],
  };
  for (const norm of Array.from(normalizedResolved)) {
    for (const alias of ALIAS_MAP[norm] || []) {
      normalizedResolved.add(alias);
    }
  }
  product.specVerification.unresolvedFields = product.specVerification.unresolvedFields.filter(
    (f: string) => !normalizedResolved.has(f.replace(/^specs\./, ''))
  );
  if (product.specVerification.unresolvedFields.length === 0) {
    delete product.specVerification;
  } else {
    product.specVerification.note =
      'Bu üründe yalnızca kaynak belgesinde yer almayan ikincil/lens-türü veya alt-varyant alanları doğrulama bekliyor; doğrulanmış teknik özellikler günceldir.';
  }
}

async function runPostP0Completion() {
  console.log('======================================================================');
  console.log('[MASTER-01 / ICECAT-PHONES-400] HARDENED POST-P0 COMPLETION & REMEDIATION');
  console.log('======================================================================\n');

  const smartphonesDataPath = path.resolve('src/lib/smartphonesData.json');
  const catalog: any[] = JSON.parse(fs.readFileSync(smartphonesDataPath, 'utf-8'));
  const catalogMap = new Map<string, any>(catalog.map((p, idx) => [p.id, { product: p, index: idx }]));

  // Load clean pre-transfer P0 baseline from git commit 22f60412e3a948f489770c35673ae68dcb218f54
  const p0BaselineCatalog: any[] = JSON.parse(
    execSync(`git show ${P0_BASELINE_COMMIT}:src/lib/smartphonesData.json`, {
      maxBuffer: 50 * 1024 * 1024,
    }).toString('utf8')
  );
  const p0BaselineProductMap = new Map<string, any>(p0BaselineCatalog.map(p => [p.id, p]));

  const p0BaselineEvidenceLines: any[] = execSync(
    `git show ${P0_BASELINE_COMMIT}:reports/icecat-phones-400/field-evidence.jsonl`,
    { maxBuffer: 20 * 1024 * 1024 }
  )
    .toString('utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));

  const p0BaselineJournalLines: any[] = execSync(
    `git show ${P0_BASELINE_COMMIT}:reports/icecat-phones-400/change-journal.jsonl`,
    { maxBuffer: 20 * 1024 * 1024 }
  )
    .toString('utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));

  const p0BaselineResults: any[] = execSync(
    `git show ${P0_BASELINE_COMMIT}:reports/icecat-phones-400/product-results.jsonl`,
    { maxBuffer: 20 * 1024 * 1024 }
  )
    .toString('utf8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));

  // Preserve immutable fetchedAt timestamps from any existing field-evidence.jsonl rows on disk
  const currentEvidenceOnDisk: any[] = fs.existsSync(EVIDENCE_PATH)
    ? fs
        .readFileSync(EVIDENCE_PATH, 'utf-8')
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(l => JSON.parse(l))
    : [];
  const previousFetchedAtByProductAndField = new Map<string, string>();
  const previousA20EvidenceByField = new Map<string, { fetchedAt: string; sourceContentHash: string }>();
  for (const ev of currentEvidenceOnDisk) {
    if (ev.productId && ev.fieldPath && ev.fetchedAt) {
      previousFetchedAtByProductAndField.set(`${ev.productId}::${ev.fieldPath}`, ev.fetchedAt);
      if (ev.productId === 'samsung-samsung-galaxy-a20-21' && ev.sourceContentHash) {
        previousA20EvidenceByField.set(ev.fieldPath, {
          fetchedAt: ev.fetchedAt,
          sourceContentHash: ev.sourceContentHash,
        });
      }
    }
  }

  // Reset the 21 post-P0 candidate products in memory to their exact pre-transfer P0 baseline state
  // before applying the hardened gates (so any rejected/separated candidate or unsupported A20 field
  // is cleanly restored to its pre-transfer state while preserving all 32 pre-P0 Icecat phones).
  const postP0TargetIds = new Set<string>([
    'samsung-samsung-galaxy-a20-21',
    ...Array.from(ICECAT_QUERY_CANDIDATES.keys()),
  ]);
  for (const targetId of postP0TargetIds) {
    const entry = catalogMap.get(targetId);
    const p0Product = p0BaselineProductMap.get(targetId);
    if (entry && p0Product) {
      const cloned = JSON.parse(JSON.stringify(p0Product));
      catalog[entry.index] = cloned;
      entry.product = cloned;
    }
  }

  // Reset field-evidence.jsonl, change-journal.jsonl, and resultMap to P0 baseline before appending verified post-P0 entries
  fs.writeFileSync(
    EVIDENCE_PATH,
    p0BaselineEvidenceLines.map(e => JSON.stringify(e)).join('\n') + '\n',
    'utf-8'
  );
  fs.writeFileSync(
    JOURNAL_PATH,
    p0BaselineJournalLines.map(j => JSON.stringify(j)).join('\n') + '\n',
    'utf-8'
  );

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const manifestItems: any[] = manifest.items;
  const manifestMap = new Map<string, any>(manifestItems.map(m => [m.canonicalId, m]));

  const verifiedEvidenceMap = buildVerifiedEvidenceMap();
  const resultMap = new Map<string, any>(p0BaselineResults.map(r => [r.canonicalId, r]));

  const existingEvidenceKeys = new Set<string>(
    p0BaselineEvidenceLines.map(e => `${e.productId}::${e.fieldPath}`)
  );

  let icecatAppliedProductsCount = 0;
  let manufacturerAppliedProductsCount = 0;
  let icecatEvidenceFieldsAdded = 0;
  let manufacturerEvidenceFieldsAdded = 0;
  const completedInThisRun: any[] = [];
  const separatedByIdentityGate: any[] = [];

  // =========================================================================
  // REQUIREMENT 1: OFFICIAL MANUFACTURER SNAPSHOT VERIFICATION FOR GALAXY A20
  // - Never accept hardcoded OFFICIAL_A20_MANUFACTURER_SPEC alone
  // - Verify raw HTML snapshot hash & per-field table locators/excerpts
  // - Separate sourceContentHash from normalizedDataHash
  // - Preserve immutable fetchedAt ("2026-11-03T22:28:01.000Z"); track appliedAt/reviewedAt separately
  // - Apply only the 12 supported fields; leave the 7 unsupported fields unverified
  // =========================================================================
  function applyOfficialManufacturerA20FromSnapshot() {
    if (!fs.existsSync(A20_SNAPSHOT_META_PATH)) {
      throw new Error(`Missing A20 official manufacturer snapshot metadata at ${A20_SNAPSHOT_META_PATH}`);
    }
    const snapshotMeta: ManufacturerSnapshotMeta = JSON.parse(
      fs.readFileSync(A20_SNAPSHOT_META_PATH, 'utf-8')
    );

    const appliedAt = new Date().toISOString();
    const reviewedAt = appliedAt;

    const snapGate = verifyAndExtractManufacturerSnapshot(snapshotMeta, {
      workspaceRoot: process.cwd(),
      existingEvidenceByField: previousA20EvidenceByField,
      appliedAt,
      reviewedAt,
    });

    if (!snapGate.passed) {
      throw new Error(
        `[A20 SNAPSHOT GATE FAILED] ${snapGate.reasonCode}: ${snapGate.detail}`
      );
    }

    const entry = catalogMap.get(snapshotMeta.canonicalId);
    if (!entry) throw new Error(`Product ${snapshotMeta.canonicalId} missing from catalog`);
    const product = entry.product;

    if (!product.specs) product.specs = {};
    const resolvedPaths: string[] = [];
    let fieldsUpdated = 0;

    for (const vf of snapGate.verifiedFields) {
      const parts = vf.fieldPath.split('.');
      let curr = product;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!curr[parts[i]]) curr[parts[i]] = {};
        curr = curr[parts[i]];
      }
      const leaf = parts[parts.length - 1];
      const oldVal = curr[leaf];
      if (oldVal !== vf.normalizedValue) {
        curr[leaf] = vf.normalizedValue;
        fieldsUpdated++;

        const journalRecord = {
          timestamp: appliedAt,
          productId: vf.productId,
          fieldPath: vf.fieldPath,
          oldValue: oldVal ?? null,
          newValue: vf.normalizedValue,
          action: oldVal !== undefined && oldVal !== null ? 'VALUE_CORRECTED' : 'FIELD_POPULATED',
          sourceType: vf.sourceType,
          trustClassification: vf.trustClassification,
          sourceUrl: vf.sourceUrl,
          locator: vf.locator,
          mpn: vf.mpn,
          sourceContentHash: vf.sourceContentHash,
          normalizedDataHash: vf.normalizedDataHash,
        };
        fs.appendFileSync(JOURNAL_PATH, JSON.stringify(journalRecord) + '\n', 'utf-8');
      }

      const evKey = `${vf.productId}::${vf.fieldPath}`;
      if (!existingEvidenceKeys.has(evKey)) {
        fs.appendFileSync(EVIDENCE_PATH, JSON.stringify(vf) + '\n', 'utf-8');
        existingEvidenceKeys.add(evKey);
        manufacturerEvidenceFieldsAdded++;
      }
      resolvedPaths.push(vf.fieldPath);
    }

    removeResolvedFromUnresolvedFields(product, resolvedPaths);

    manufacturerAppliedProductsCount++;
    const summaryItem = {
      canonicalId: snapshotMeta.canonicalId,
      brand: snapshotMeta.brand,
      model: snapshotMeta.model,
      mpn: snapshotMeta.mpn,
      sourceType: snapshotMeta.sourceType,
      trustClassification: snapshotMeta.trustClassification,
      sourceUrl: snapshotMeta.sourceUrl,
      snapshotHtmlRelativePath: snapshotMeta.snapshotHtmlRelativePath,
      fetchedAt: snapshotMeta.fetchedAt,
      appliedAt,
      reviewedAt,
      sourceContentHash: snapGate.sourceContentHash,
      normalizedDataHash: snapGate.normalizedDataHash,
      fieldsUpdated,
      evidenceFieldsRecorded: resolvedPaths.length,
      unsupportedFieldsExcluded: snapshotMeta.unsupportedFieldsExcluded || [],
      extraSpecsAdded: 0,
      unresolvedRemaining: product.specVerification?.unresolvedFields?.length || 0,
    };
    completedInThisRun.push(summaryItem);

    resultMap.set(snapshotMeta.canonicalId, {
      canonicalId: snapshotMeta.canonicalId,
      brand: snapshotMeta.brand,
      model: snapshotMeta.model,
      outcome: 'APPLIED_ALL_AVAILABLE',
      sourceType: snapshotMeta.sourceType,
      trustClassification: snapshotMeta.trustClassification,
      reasonCode: `Applied ${fieldsUpdated} snapshot-verified manufacturer fields (${snapshotMeta.mpn}) with per-field HTML table locators; 7 unsupported fields excluded and kept unverified`,
      fieldsAppliedCount: fieldsUpdated,
      extraSpecsCount: 0,
      icecatTitle: null,
      fetchedAt: snapshotMeta.fetchedAt,
      appliedAt,
      timestamp: appliedAt,
    });

    console.log(
      `[PHASE A — OFFICIAL_MANUFACTURER SNAPSHOT] ${snapshotMeta.canonicalId} (${snapshotMeta.mpn}) -> ${fieldsUpdated} supported fields populated (7 unsupported excluded), unresolvedRemaining=${summaryItem.unresolvedRemaining}`
    );
  }

  // =========================================================================
  // REQUIREMENT 3: INDEPENDENT TARGET IDENTITY GATE FOR ICECAT CANDIDATES
  // - Never pass cand.queriedMpn as preTransferMpn
  // - Derive target identity strictly from pre-transfer manifest/catalog/evidence
  // - Compare model, submodel, region, 4G/5G, and RAM/storage against independent target
  // - Exclude variant-specific fields when sub-SKU proof is absent, or separate ambiguous record
  // =========================================================================
  async function evaluateAndApplyIcecatCandidate(cand: IcecatQueryCandidate, phaseLabel: string): Promise<boolean> {
    if (CANONICAL_EXCLUDED_ID_SET.has(cand.id) || goldenIds.has(cand.id)) {
      console.warn(`[Safety Guard] Skipping protected record ${cand.id}`);
      return false;
    }

    const entry = catalogMap.get(cand.id);
    const preTransferProduct = p0BaselineProductMap.get(cand.id);
    if (!entry || !preTransferProduct) {
      console.error(`[Error] Product ${cand.id} not found in catalog!`);
      return false;
    }
    const product = entry.product;
    const manifestItem = manifestMap.get(cand.id);

    // Collect pre-transfer verified fields from buildVerifiedEvidenceMap AND pre-transfer product.fieldSources
    const mfrVerifiedFields = new Set<string>(verifiedEvidenceMap.get(cand.id) || []);
    if (Array.isArray(preTransferProduct.fieldSources)) {
      for (const fsEntry of preTransferProduct.fieldSources) {
        for (const f of fsEntry.fields || []) {
          mfrVerifiedFields.add(f);
        }
      }
    }
    const downgradedFields = new Set<string>(DOWNGRADED_PILOT_FIELDS[cand.id]?.fields || []);

    // Load cached raw archive if present (preserving original fetchedAt), otherwise fetch from live Icecat API
    const rawSavePath = path.join(RAW_ARCHIVE_DIR, `${cand.id}.json`);
    let rawIcecatData: any = null;
    let sourceFetchedAt: string;

    if (fs.existsSync(rawSavePath)) {
      rawIcecatData = JSON.parse(fs.readFileSync(rawSavePath, 'utf-8'));
      const mtimeIso = fs.statSync(rawSavePath).mtime.toISOString();
      // Preserve earliest recorded fetchedAt from previous run if available
      const prevFetched = Array.from(previousFetchedAtByProductAndField.entries()).find(([k]) =>
        k.startsWith(`${cand.id}::`)
      )?.[1];
      sourceFetchedAt = prevFetched || mtimeIso;
    } else {
      await sleep(350);
      const fetchRes = await fetchIcecatSheet({
        brand: cand.brand,
        mpn: cand.queriedMpn,
        gtin: cand.queriedGtin,
      });
      if (!fetchRes.ok || !fetchRes.data) {
        console.error(`[Fetch Failed] ${cand.id} (${cand.queriedMpn}): HTTP ${fetchRes.status}`);
        return false;
      }
      rawIcecatData = fetchRes.data;
      sourceFetchedAt = new Date().toISOString();
      fs.writeFileSync(rawSavePath, JSON.stringify(rawIcecatData, null, 2), 'utf-8');
    }

    const mapped = parseIcecatPayload(
      { ok: true, status: 200, data: rawIcecatData },
      'tr'
    );
    if (!mapped) {
      console.error(`[Mapping Failed] ${cand.id}`);
      return false;
    }

    // Derive independent pre-transfer target identity strictly from manifest & pre-transfer catalog/evidence
    // NEVER from cand.queriedMpn!
    let independentPreTransferMpn: string | undefined;
    let preTransferMpnSource: PreTransferMpnSource = 'NONE';
    if (manifestItem?.mpn && String(manifestItem.mpn).trim().length > 0) {
      independentPreTransferMpn = String(manifestItem.mpn).trim();
      preTransferMpnSource = 'MANIFEST';
    } else if (preTransferProduct?.modelCode && String(preTransferProduct.modelCode).trim().length > 0) {
      independentPreTransferMpn = String(preTransferProduct.modelCode).trim();
      preTransferMpnSource = 'PRE_TRANSFER_CATALOG';
    }

    const independentTargetRamGb: number | undefined =
      manifestItem?.ramGb ?? preTransferProduct?.specs?.memory?.ramGb;
    const independentTargetStorageGb: number | undefined =
      manifestItem?.storageGb ?? preTransferProduct?.specs?.memory?.storageGb;

    const gateCheck = verifyIcecatTargetIdentity({
      targetId: cand.id,
      targetBrand: cand.brand,
      targetName: preTransferProduct.name || manifestItem?.model || cand.id,
      targetSlug: preTransferProduct.slug || cand.id,
      queriedMpn: cand.queriedMpn,
      preTransferMpn: independentPreTransferMpn,
      preTransferMpnSource,
      preTransferIndependent5GProof: mfrVerifiedFields.has('specs.connectivity.has5G')
        ? Boolean(preTransferProduct.specs?.connectivity?.has5G)
        : undefined,
      targetHardwareRegion: manifestItem?.hardwareRegion,
      targetRamGb: independentTargetRamGb,
      targetStorageGb: independentTargetStorageGb,
      sourceRamGb: mapped.specs.memory?.ramGb,
      sourceStorageGb: mapped.specs.memory?.storageGb,
      icecatPayload: rawIcecatData,
    });

    if (!gateCheck.passed) {
      const sepNow = new Date().toISOString();
      const outcome =
        gateCheck.reasonCode === 'REGION_VARIANT_MISMATCH' ||
        gateCheck.reasonCode === 'MEMORY_VARIANT_MISMATCH'
          ? 'SOURCE_NOT_FOUND'
          : 'BLOCKED_IDENTITY';
      const explicitReason = `${gateCheck.reasonCode}: ${gateCheck.detail} (Separated per Requirement 3 — independent pre-transfer target proof required; query MPN '${cand.queriedMpn}' not accepted as self-proof)`;

      resultMap.set(cand.id, {
        canonicalId: cand.id,
        brand: cand.brand,
        model: preTransferProduct.name || manifestItem?.model,
        outcome,
        reasonCode: explicitReason,
        fieldsAppliedCount: 0,
        extraSpecsCount: 0,
        icecatTitle: mapped.title,
        timestamp: sepNow,
      });

      separatedByIdentityGate.push({
        canonicalId: cand.id,
        queriedMpn: cand.queriedMpn,
        independentPreTransferMpn: independentPreTransferMpn || null,
        outcome,
        reasonCode: gateCheck.reasonCode,
        detail: gateCheck.detail,
      });

      console.log(
        `[SEPARATED BY INDEPENDENT IDENTITY GATE] ${cand.id} (queried=${cand.queriedMpn}, preTransferMpn=${independentPreTransferMpn || 'NONE'}) -> ${gateCheck.reasonCode}`
      );
      return false;
    }

    const excludedVariantFields = new Set<string>(gateCheck.variantSpecificExcludedFields || []);
    const appliedAt = new Date().toISOString();
    const reviewedAt = appliedAt;
    const rawBytes = fs.readFileSync(rawSavePath);
    const sourceContentHash = crypto.createHash('sha256').update(rawBytes).digest('hex');

    // Apply extraSpecs (deduplicated by featureId)
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

    // Flatten mapped specs
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

    let fieldsUpdated = 0;
    let evidenceAddedForProduct = 0;
    const resolvedPaths: string[] = [];

    for (const fe of fieldEntries) {
      if (
        mfrVerifiedFields.has(fe.path) ||
        downgradedFields.has(fe.path) ||
        excludedVariantFields.has(fe.path)
      ) {
        continue;
      }

      const parts = fe.path.split('.');
      let curr = product;
      for (let pIdx = 0; pIdx < parts.length - 1; pIdx++) {
        if (!curr[parts[pIdx]]) curr[parts[pIdx]] = {};
        curr = curr[parts[pIdx]];
      }
      const leaf = parts[parts.length - 1];
      const oldVal = curr[leaf];

      // Preserve specific processor chip name if Icecat only provides a generic family string (e.g. "Snapdragon", "Samsung Exynos")
      if (
        fe.path === 'specs.processor.chip' &&
        typeof oldVal === 'string' &&
        oldVal.trim().length > 0 &&
        (fe.val === 'Snapdragon' || fe.val === 'Samsung Exynos' || fe.val === 'MediaTek')
      ) {
        continue;
      }

      if (oldVal !== fe.val) {
        curr[leaf] = fe.val;
        fieldsUpdated++;

        const journalRecord = {
          timestamp: appliedAt,
          productId: cand.id,
          fieldPath: fe.path,
          oldValue: oldVal ?? null,
          newValue: fe.val,
          action: oldVal !== undefined && oldVal !== null ? 'VALUE_CORRECTED' : 'FIELD_POPULATED',
          sourceType: 'ICECAT',
          trustClassification: 'ICECAT_CATALOG_VERIFIED',
          mpn: cand.queriedMpn,
          preTransferMpn: independentPreTransferMpn || null,
          icecatId: mapped.icecatId,
          sourceContentHash,
        };
        fs.appendFileSync(JOURNAL_PATH, JSON.stringify(journalRecord) + '\n', 'utf-8');
      }

      const evKey = `${cand.id}::${fe.path}`;
      if (!existingEvidenceKeys.has(evKey)) {
        const immutableFetchedAt =
          previousFetchedAtByProductAndField.get(evKey) || sourceFetchedAt;
        const normalizedDataHash = crypto
          .createHash('sha256')
          .update(
            JSON.stringify({
              productId: cand.id,
              mpn: cand.queriedMpn,
              fieldPath: fe.path,
              normalizedValue: fe.val,
            })
          )
          .digest('hex');
        const fieldEvidenceHash = crypto
          .createHash('sha256')
          .update(`${cand.id}:${fe.path}:${sourceContentHash}:${normalizedDataHash}`)
          .digest('hex');

        const evidenceRecord = {
          productId: cand.id,
          icecatId: mapped.icecatId,
          mpn: cand.queriedMpn,
          preTransferMpn: independentPreTransferMpn || null,
          fieldPath: fe.path,
          rawValue: fe.val,
          normalizedValue: fe.val,
          scope: independentPreTransferMpn ? 'EXACT_SKU' : 'LEVEL_1_MODEL_FAMILY',
          sourceLang: 'tr',
          fetchedAt: immutableFetchedAt,
          appliedAt,
          reviewedAt,
          sourceType: 'ICECAT',
          trustClassification: 'ICECAT_CATALOG_VERIFIED',
          payloadHash: sourceContentHash,
          sourceContentHash,
          normalizedDataHash,
          fieldEvidenceHash,
        };
        fs.appendFileSync(EVIDENCE_PATH, JSON.stringify(evidenceRecord) + '\n', 'utf-8');
        existingEvidenceKeys.add(evKey);
        icecatEvidenceFieldsAdded++;
        evidenceAddedForProduct++;
      }

      resolvedPaths.push(fe.path);
    }

    removeResolvedFromUnresolvedFields(product, resolvedPaths);

    icecatAppliedProductsCount++;
    const summaryItem = {
      canonicalId: cand.id,
      brand: cand.brand,
      model: product.name || manifestItem?.model,
      queriedMpn: cand.queriedMpn,
      independentPreTransferMpn: independentPreTransferMpn || null,
      preTransferMpnSource,
      gtin: cand.queriedGtin || null,
      icecatId: mapped.icecatId,
      icecatTitle: mapped.title,
      sourceType: 'ICECAT',
      trustClassification: 'ICECAT_CATALOG_VERIFIED',
      fetchedAt: previousFetchedAtByProductAndField.get(`${cand.id}::specs.screen.size`) || sourceFetchedAt,
      appliedAt,
      reviewedAt,
      sourceContentHash,
      variantSpecificExcludedFields: Array.from(excludedVariantFields),
      fieldsUpdated,
      evidenceFieldsRecorded: evidenceAddedForProduct,
      extraSpecsAdded: addedExtraSpecs,
      unresolvedRemaining: product.specVerification?.unresolvedFields?.length || 0,
    };
    completedInThisRun.push(summaryItem);

    resultMap.set(cand.id, {
      canonicalId: cand.id,
      brand: cand.brand,
      model: product.name || manifestItem?.model,
      outcome: 'APPLIED_ALL_AVAILABLE',
      sourceType: 'ICECAT',
      trustClassification: 'ICECAT_CATALOG_VERIFIED',
      reasonCode: `Applied ${fieldsUpdated} spec updates (${evidenceAddedForProduct} verified evidence fields) and ${addedExtraSpecs} extra specs via MPN ${cand.queriedMpn} (preTransferMpn=${independentPreTransferMpn || 'MODEL_VARIANT_CORROBORATED'}, excludedVariantFields=${excludedVariantFields.size})`,
      fieldsAppliedCount: fieldsUpdated > 0 ? fieldsUpdated : evidenceAddedForProduct,
      extraSpecsCount: addedExtraSpecs,
      icecatTitle: mapped.title,
      fetchedAt: summaryItem.fetchedAt,
      appliedAt,
      timestamp: appliedAt,
    });

    console.log(
      `[${phaseLabel} — ICECAT] ${cand.id} (queried=${cand.queriedMpn}, preTransferMpn=${independentPreTransferMpn || 'NONE'}) -> ${fieldsUpdated} fields updated (${evidenceAddedForProduct} evidence, ${excludedVariantFields.size} variant-specific excluded), +${addedExtraSpecs} extraSpecs, unresolvedRemaining=${summaryItem.unresolvedRemaining}`
    );
    return true;
  }

  // =========================================================================
  // STEP 2 (PHASE A): FIRST COMPLETE THE 4 ISOLATED P0 PHONES
  // =========================================================================
  console.log('--- PHASE A: COMPLETING THE 4 ISOLATED P0 PHONES ---');
  applyOfficialManufacturerA20FromSnapshot();
  await evaluateAndApplyIcecatCandidate(ICECAT_QUERY_CANDIDATES.get('samsung-samsung-galaxy-a30-22')!, 'PHASE A');
  await evaluateAndApplyIcecatCandidate(ICECAT_QUERY_CANDIDATES.get('samsung-samsung-galaxy-a14-86')!, 'PHASE A');
  await evaluateAndApplyIcecatCandidate(ICECAT_QUERY_CANDIDATES.get('samsung-samsung-galaxy-note-20-36')!, 'PHASE A');

  // =========================================================================
  // STEP 3 (PHASE B): CONTINUE ACROSS THE 400-PHONE MANIFEST IN 20-ITEM BATCHES
  // =========================================================================
  console.log('\n--- PHASE B: CONTINUING ACROSS 400-PHONE MANIFEST IN 20-ITEM BATCHES ---');
  const BATCH_SIZE = 20;
  const totalBatches = Math.ceil(manifestItems.length / BATCH_SIZE);

  for (let bIdx = 0; bIdx < totalBatches; bIdx++) {
    const start = bIdx * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, manifestItems.length);
    const slice = manifestItems.slice(start, end);
    let batchApplied = 0;

    for (const item of slice) {
      const cand = ICECAT_QUERY_CANDIDATES.get(item.canonicalId);
      if (!cand || cand.isP0Isolated) {
        continue;
      }
      const applied = await evaluateAndApplyIcecatCandidate(cand, `BATCH ${bIdx + 1}/${totalBatches}`);
      if (applied) {
        batchApplied++;
      }
    }

    if (batchApplied > 0) {
      fs.writeFileSync(smartphonesDataPath, JSON.stringify(catalog, null, 2), 'utf-8');
      console.log(`[Batch ${bIdx + 1}/${totalBatches}] Saved ${batchApplied} newly completed products.`);
    }
  }

  // Final save of smartphonesData.json
  fs.writeFileSync(smartphonesDataPath, JSON.stringify(catalog, null, 2), 'utf-8');

  // =========================================================================
  // REQUIREMENT 2 (STEP 4): NORMALIZE BLOCKERS & ACCESS RESTRICTION BREAKDOWN
  // - Remove all hardcoded HTTP 404 / StatusCode=14 assignments
  // - Use real raw observations (httpStatus, icecatStatusCode, redactedMessage, observedAt)
  // - Mark records without raw observation evidence as ACCESS_REASON_UNCONFIRMED
  // =========================================================================
  const rawAccessObsFile = fs.existsSync(ACCESS_PROBE_OBS_PATH)
    ? JSON.parse(fs.readFileSync(ACCESS_PROBE_OBS_PATH, 'utf-8'))
    : [];
  const rawObsArray: any[] = Array.isArray(rawAccessObsFile)
    ? rawAccessObsFile
    : rawAccessObsFile.results || [];
  const rawObsMap = new Map<string, RawAccessObservation>(
    rawObsArray.map((r: any) => [
      r.canonicalId,
      {
        canonicalId: r.canonicalId,
        brand: r.brand,
        probedMpn: r.probedMpn || r.queriedMpn,
        httpStatus: r.httpStatus,
        icecatStatusCode: r.icecatStatusCode,
        redactedMessage: r.redactedMessage,
        observedAt: r.observedAt,
      },
    ])
  );

  const completedIdSet = new Set<string>(
    Array.from(resultMap.values())
      .filter(r => r.outcome === 'APPLIED_ALL_AVAILABLE' || r.outcome === 'NO_CHANGE_NEEDED')
      .map(r => r.canonicalId)
  );
  const separatedIdSet = new Set<string>(separatedByIdentityGate.map(s => s.canonicalId));

  // Sibling memory SKU notes for Samsung items where Icecat only has a different RAM/storage tier
  const SIBLING_TIER_NOTES: Record<string, string> = {
    'samsung-samsung-galaxy-a51-44':
      'SOURCE_NOT_FOUND_EXACT_MEMORY_TIER: Open Icecat has SM-A515F (4 GB / 128 GB, IcecatId=77264807), but canonical record is 6 GB / 128 GB; skipped to preserve exact RAM/storage variant integrity.',
    'samsung-samsung-galaxy-m31-48':
      'SOURCE_NOT_FOUND_EXACT_MEMORY_TIER: Open Icecat has SM-M315F (6 GB / 64 GB, IcecatId=80453814), but canonical record is 6 GB / 128 GB; skipped to preserve exact RAM/storage variant integrity.',
    'samsung-samsung-galaxy-a36-5g-116':
      'SOURCE_NOT_FOUND_EXACT_MEMORY_TIER: Open Icecat has SM-A366B (6 GB / 128 GB and 8 GB / 256 GB), but canonical record is 8 GB / 128 GB; skipped to preserve exact RAM/storage variant integrity.',
    'samsung-samsung-galaxy-z-fold-7-112':
      'SOURCE_NOT_FOUND_EXACT_MEMORY_TIER: Open Icecat has SM-F966B (12 GB / 256 GB), but canonical record -112 is 16 GB / 512 GB; skipped to preserve exact RAM/storage variant integrity.',
    'samsung-samsung-galaxy-a17-5g-124':
      'SOURCE_NOT_FOUND_EXACT_MEMORY_TIER: Open Icecat has SM-A176B (8 GB / 256 GB, applied to -128), but canonical record -124 is 6 GB / 128 GB; skipped to preserve exact RAM/storage variant integrity.',
  };

  for (const item of manifestItems) {
    const r = resultMap.get(item.canonicalId);
    if (!r) continue;
    if (completedIdSet.has(item.canonicalId) || separatedIdSet.has(item.canonicalId)) continue;

    if (SIBLING_TIER_NOTES[item.canonicalId]) {
      r.outcome = 'SOURCE_NOT_FOUND';
      r.reasonCode = SIBLING_TIER_NOTES[item.canonicalId];
    } else if (
      typeof r.reasonCode === 'string' &&
      r.reasonCode.includes('UNRELEASED_CONCEPT_MODEL')
    ) {
      r.outcome = 'BLOCKED_IDENTITY';
      r.reasonCode =
        'IDENTITY_UNRESOLVED: Exact regional MPN/GTIN not corroborated in Open Icecat index (not classified as unannounced merely from query absence)';
    } else if (r.outcome === 'BLOCKED_ACCESS') {
      const obs = rawObsMap.get(item.canonicalId) || null;
      const resolvedAccess = resolveAccessBlockerObservation({
        canonicalId: item.canonicalId,
        brand: item.brand,
        rawObservation: obs,
      });
      r.accessClassification = resolvedAccess.classification;
      r.httpStatus = resolvedAccess.httpStatus;
      r.icecatStatusCode = resolvedAccess.icecatStatusCode;
      r.redactedMessage = resolvedAccess.redactedMessage;
      r.observedAt = resolvedAccess.observedAt;
      r.reasonCode = resolvedAccess.reasonCode;
    }
  }

  // Rewrite product-results.jsonl in manifest order
  const orderedResults = manifestItems.map(item => resultMap.get(item.canonicalId)).filter(Boolean);
  fs.writeFileSync(
    RESULTS_PATH,
    orderedResults.map(r => JSON.stringify(r)).join('\n') + '\n',
    'utf-8'
  );

  // Rebuild blockers.json from remaining non-applied items
  const updatedBlockers = orderedResults
    .filter(r => r.outcome !== 'APPLIED_ALL_AVAILABLE' && r.outcome !== 'NO_CHANGE_NEEDED')
    .map(r => ({
      canonicalId: r.canonicalId,
      brand: r.brand,
      model: r.model,
      outcome: r.outcome,
      accessClassification: r.accessClassification || undefined,
      httpStatus: r.httpStatus !== undefined ? r.httpStatus : undefined,
      icecatStatusCode: r.icecatStatusCode !== undefined ? r.icecatStatusCode : undefined,
      redactedMessage: r.redactedMessage !== undefined ? r.redactedMessage : undefined,
      observedAt: r.observedAt !== undefined ? r.observedAt : undefined,
      reason: r.reasonCode,
      timestamp: r.timestamp,
    }));
  fs.writeFileSync(BLOCKERS_PATH, JSON.stringify(updatedBlockers, null, 2), 'utf-8');

  // Build truthful Access Blockers Breakdown strictly from real observations vs ACCESS_REASON_UNCONFIRMED (Requirement 2)
  const accessBlockedItems = updatedBlockers.filter(b => b.outcome === 'BLOCKED_ACCESS');
  const classificationDistribution: Record<
    string,
    {
      count: number;
      httpStatus: number | null;
      icecatStatusCode: number | null;
      redactedMessage: string | null;
      sampleObservedAt: string | null;
      brands: Record<string, number>;
      sampleIds: string[];
    }
  > = {};

  const brandBreakdown: Record<
    string,
    {
      totalCount: number;
      observedBrandRestrictionCode14: number;
      observedAppKeyRequiredCode9: number;
      observedNotInIcecatDbCode8: number;
      accessReasonUnconfirmed: number;
      observedSamples: Array<{
        canonicalId: string;
        probedMpn: string | null;
        httpStatus: number;
        icecatStatusCode: number;
        redactedMessage: string;
        observedAt: string;
      }>;
      unconfirmedSampleIds: string[];
    }
  > = {};

  for (const b of accessBlockedItems) {
    const cls = b.accessClassification || 'ACCESS_REASON_UNCONFIRMED';
    if (!classificationDistribution[cls]) {
      classificationDistribution[cls] = {
        count: 0,
        httpStatus: b.httpStatus ?? null,
        icecatStatusCode: b.icecatStatusCode ?? null,
        redactedMessage: b.redactedMessage ?? null,
        sampleObservedAt: b.observedAt ?? null,
        brands: {},
        sampleIds: [],
      };
    }
    classificationDistribution[cls].count++;
    classificationDistribution[cls].brands[b.brand] =
      (classificationDistribution[cls].brands[b.brand] || 0) + 1;
    if (classificationDistribution[cls].sampleIds.length < 6) {
      classificationDistribution[cls].sampleIds.push(b.canonicalId);
    }

    if (!brandBreakdown[b.brand]) {
      brandBreakdown[b.brand] = {
        totalCount: 0,
        observedBrandRestrictionCode14: 0,
        observedAppKeyRequiredCode9: 0,
        observedNotInIcecatDbCode8: 0,
        accessReasonUnconfirmed: 0,
        observedSamples: [],
        unconfirmedSampleIds: [],
      };
    }
    const bb = brandBreakdown[b.brand];
    bb.totalCount++;
    if (cls === 'BRAND_RESTRICTION_CODE_14') bb.observedBrandRestrictionCode14++;
    else if (cls === 'FULL_ICECAT_APP_KEY_REQUIRED_CODE_9') bb.observedAppKeyRequiredCode9++;
    else if (cls === 'NOT_PRESENT_IN_ICECAT_DB_CODE_8') bb.observedNotInIcecatDbCode8++;
    else bb.accessReasonUnconfirmed++;

    const rawObs = rawObsMap.get(b.canonicalId);
    if (rawObs) {
      bb.observedSamples.push({
        canonicalId: b.canonicalId,
        probedMpn: rawObs.probedMpn || null,
        httpStatus: rawObs.httpStatus,
        icecatStatusCode: rawObs.icecatStatusCode,
        redactedMessage: rawObs.redactedMessage,
        observedAt: rawObs.observedAt,
      });
    } else if (bb.unconfirmedSampleIds.length < 5) {
      bb.unconfirmedSampleIds.push(b.canonicalId);
    }
  }

  fs.writeFileSync(
    ACCESS_BREAKDOWN_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalAccessBlockedRecords: accessBlockedItems.length,
        rawObservedRecordsCount: rawObsMap.size,
        unconfirmedRecordsCount:
          accessBlockedItems.length -
          accessBlockedItems.filter(b => b.accessClassification !== 'ACCESS_REASON_UNCONFIRMED').length,
        classificationDistribution,
        brandBreakdown,
      },
      null,
      2
    ),
    'utf-8'
  );

  // Update checkpoint.json
  const outcomeCounts: Record<string, number> = {};
  for (const r of orderedResults) {
    outcomeCounts[r.outcome] = (outcomeCounts[r.outcome] || 0) + 1;
  }

  const checkpoint = {
    processedCount: orderedResults.length,
    statusCounts: {
      APPLIED_ALL_AVAILABLE: outcomeCounts['APPLIED_ALL_AVAILABLE'] || 0,
      APPLIED_PARTIAL: outcomeCounts['APPLIED_PARTIAL'] || 0,
      NO_CHANGE_NEEDED: outcomeCounts['NO_CHANGE_NEEDED'] || 0,
      BLOCKED_IDENTITY: outcomeCounts['BLOCKED_IDENTITY'] || 0,
      BLOCKED_ACCESS: outcomeCounts['BLOCKED_ACCESS'] || 0,
      SOURCE_NOT_FOUND: outcomeCounts['SOURCE_NOT_FOUND'] || 0,
      ERROR: outcomeCounts['ERROR'] || 0,
    },
    completedIds: orderedResults
      .filter(r => r.outcome === 'APPLIED_ALL_AVAILABLE' || r.outcome === 'NO_CHANGE_NEEDED')
      .map(r => r.canonicalId),
    lastUpdatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');

  // Write Post-P0 Completion Summary
  const postP0Summary = {
    executedAt: new Date().toISOString(),
    p0BaselineCommit: P0_BASELINE_COMMIT,
    phaseACompletedCount: 4,
    phaseBCompletedCount: completedInThisRun.length - 4,
    totalNewlyCompletedInPostP0: completedInThisRun.length,
    separatedByIndependentIdentityGateCount: separatedByIdentityGate.length,
    separatedByIdentityGate,
    bySourceType: {
      ICECAT_CATALOG_VERIFIED: icecatAppliedProductsCount,
      OFFICIAL_MANUFACTURER_VERIFIED: manufacturerAppliedProductsCount,
    },
    evidenceFieldsAdded: {
      ICECAT_CATALOG_VERIFIED: icecatEvidenceFieldsAdded,
      OFFICIAL_MANUFACTURER_VERIFIED: manufacturerEvidenceFieldsAdded,
    },
    manifest400Totals: checkpoint.statusCounts,
    accessBlockersClassificationSummary: Object.fromEntries(
      Object.entries(classificationDistribution).map(([k, v]) => [
        k,
        {
          count: v.count,
          httpStatus: v.httpStatus,
          icecatStatusCode: v.icecatStatusCode,
          redactedMessage: v.redactedMessage,
        },
      ])
    ),
    completedItems: completedInThisRun,
  };
  fs.writeFileSync(POST_P0_SUMMARY_PATH, JSON.stringify(postP0Summary, null, 2), 'utf-8');

  console.log('\n======================================================================');
  console.log('[POST-P0 COMPLETION SUMMARY]');
  console.log(`- Newly Completed Products: ${completedInThisRun.length} (${icecatAppliedProductsCount} ICECAT, ${manufacturerAppliedProductsCount} OFFICIAL_MANUFACTURER)`);
  console.log(`- Separated by Independent Target Identity Gate: ${separatedByIdentityGate.length}`);
  console.log(`- Total Completed in 400-Manifest: ${checkpoint.completedIds.length} (${checkpoint.statusCounts.APPLIED_ALL_AVAILABLE} APPLIED + ${checkpoint.statusCounts.NO_CHANGE_NEEDED} NO_CHANGE_NEEDED)`);
  console.log(`- Remaining Blockers: ${updatedBlockers.length} (BLOCKED_IDENTITY=${checkpoint.statusCounts.BLOCKED_IDENTITY}, SOURCE_NOT_FOUND=${checkpoint.statusCounts.SOURCE_NOT_FOUND}, BLOCKED_ACCESS=${checkpoint.statusCounts.BLOCKED_ACCESS})`);
  console.log('======================================================================');
}

runPostP0Completion()
  .then(() => {
    guard.cancelWatchdog();
  })
  .catch(err => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
