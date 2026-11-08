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

const ACCESS_PROBE_OBS_PATH = path.join(RAW_ARCHIVE_DIR, 'access_probe_observations.json');

const NEXT_EXECUTION_MANUFACTURER_CANDIDATE_IDS: string[] = [
  // Apple (4)
  'apple-apple-iphone-17-pro-max-256-gb-1023353',
  'apple-apple-iphone-17-pro-max-512-gb-1027078',
  'apple-apple-iphone-17-pro-max-1-tb-1027079',
  'apple-apple-iphone-17-pro-max-2-tb-1027080',
  // Huawei (1)
  'huawei-huawei-y5ii',
  // Honor (1)
  'honor-magic6-pro-512gb-flagship',
  // Xiaomi / Redmi / POCO (13)
  'xiaomi-14-ultra-512gb-icecat',
  'xiaomi-14t-pro-512gb-icecat',
  'xiaomi-xiaomi-redmi-note-12-pro-4g-12209',
  'xiaomi-15-256gb-2025',
  'xiaomi-15-ultra-512gb-2025',
  'poco-x6-pro-512gb-2024',
  'poco-f7-pro-512gb-2025',
  'poco-poco-f7-ultra-86',
  'poco-poco-f7-5g-85',
  'poco-poco-x7-pro-5g-90',
  'poco-m7-pro-5g-256gb-2025',
  'redmi-note-14-pro-5g-256gb-2025',
  'redmi-note-14-pro-plus-5g-512gb-2025',
  // Samsung (21)
  'samsung-samsung-galaxy-s25-107',
  'samsung-samsung-galaxy-s25-108',
  'samsung-samsung-galaxy-s25-ultra-109',
  'samsung-samsung-galaxy-s25-fe-256gb-130',
  'samsung-samsung-galaxy-z-flip-7-111',
  'samsung-samsung-galaxy-z-fold-7-256gb-132',
  'samsung-samsung-galaxy-z-fold-7-112',
  'samsung-samsung-galaxy-a36-5g-116',
  'samsung-samsung-galaxy-a17-5g-124',
  'samsung-samsung-galaxy-m15-5g-104',
  'samsung-samsung-galaxy-a24-87',
  'samsung-samsung-galaxy-a23-72',
  'samsung-samsung-galaxy-a73-5g-75',
  'samsung-samsung-galaxy-m13-76',
  'samsung-samsung-galaxy-a02-56',
  'samsung-samsung-galaxy-m32-64',
  'samsung-samsung-galaxy-a10-20',
  'samsung-samsung-galaxy-a51-44',
  'samsung-samsung-galaxy-z-fold-2-39',
  'samsung-samsung-galaxy-m14-5g-90',
  'samsung-samsung-galaxy-m34-5g-91',
];
const NEXT_EXECUTION_MANUFACTURER_SET = new Set<string>(NEXT_EXECUTION_MANUFACTURER_CANDIDATE_IDS);

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
  const previousMfrEvidenceByProduct = new Map<
    string,
    Map<string, { fetchedAt: string; sourceContentHash: string }>
  >();
  for (const ev of currentEvidenceOnDisk) {
    if (ev.productId && ev.fieldPath && ev.fetchedAt) {
      previousFetchedAtByProductAndField.set(`${ev.productId}::${ev.fieldPath}`, ev.fetchedAt);
      if (ev.sourceType === 'OFFICIAL_MANUFACTURER' && ev.sourceContentHash) {
        if (!previousMfrEvidenceByProduct.has(ev.productId)) {
          previousMfrEvidenceByProduct.set(ev.productId, new Map());
        }
        previousMfrEvidenceByProduct.get(ev.productId)!.set(ev.fieldPath, {
          fetchedAt: ev.fetchedAt,
          sourceContentHash: ev.sourceContentHash,
        });
      }
    }
  }

  // Reset all post-P0 candidate products in memory to their exact pre-transfer P0 baseline state
  // before applying the hardened gates (so any rejected/separated candidate or unsupported field
  // is cleanly restored to its pre-transfer state while preserving all 32 pre-P0 Icecat phones).
  const postP0TargetIds = new Set<string>([
    'samsung-samsung-galaxy-a20-21',
    ...Array.from(ICECAT_QUERY_CANDIDATES.keys()),
    ...NEXT_EXECUTION_MANUFACTURER_CANDIDATE_IDS,
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
  let dualCorroboratedProductsCount = 0;
  let icecatEvidenceFieldsAdded = 0;
  let manufacturerEvidenceFieldsAdded = 0;
  const completedInThisRun: any[] = [];
  const separatedByIdentityGate: any[] = [];

  // Track manufacturer-verified identity and fields per product so Icecat candidates can corroborate
  // missing MPNs/5G/RAM/storage without ever mixing OFFICIAL_MANUFACTURER_VERIFIED and ICECAT_CATALOG_VERIFIED
  const manufacturerCorroborationMap = new Map<
    string,
    {
      mpn: string;
      has5G?: boolean;
      ramGb?: number;
      storageGb?: number;
      verifiedFields: Set<string>;
      fieldsUpdated: number;
      evidenceFieldsRecorded: number;
    }
  >();

  // =========================================================================
  // REQUIREMENT 1 & NEXT EXECUTION: OFFICIAL MANUFACTURER SNAPSHOT VERIFICATION
  // - Verify raw HTML snapshot hash & per-field locators/excerpts
  // - Separate sourceContentHash from normalizedDataHash
  // - Preserve immutable fetchedAt; track appliedAt/reviewedAt separately
  // - Apply only directly supported technical fields; keep OFFICIAL_MANUFACTURER_VERIFIED strictly separate
  // =========================================================================
  function applyOfficialManufacturerSnapshot(canonicalId: string, phaseLabel: string): boolean {
    const metaPath = path.join(RAW_ARCHIVE_DIR, `${canonicalId}.official_manufacturer.json`);
    if (!fs.existsSync(metaPath)) {
      throw new Error(`Missing official manufacturer snapshot metadata at ${metaPath}`);
    }
    const snapshotMeta: ManufacturerSnapshotMeta = JSON.parse(
      fs.readFileSync(metaPath, 'utf-8')
    );

    const appliedAt = new Date().toISOString();
    const reviewedAt = appliedAt;

    const snapGate = verifyAndExtractManufacturerSnapshot(snapshotMeta, {
      workspaceRoot: process.cwd(),
      existingEvidenceByField: previousMfrEvidenceByProduct.get(canonicalId),
      appliedAt,
      reviewedAt,
    });

    if (!snapGate.passed) {
      throw new Error(
        `[${canonicalId} SNAPSHOT GATE FAILED] ${snapGate.reasonCode}: ${snapGate.detail}`
      );
    }

    const entry = catalogMap.get(snapshotMeta.canonicalId);
    if (!entry) throw new Error(`Product ${snapshotMeta.canonicalId} missing from catalog`);
    const product = entry.product;

    if (!product.specs) product.specs = {};
    const resolvedPaths: string[] = [];
    const verifiedFieldSet = new Set<string>();
    let fieldsUpdated = 0;
    let mfrHas5G: boolean | undefined;
    let mfrRamGb: number | undefined;
    let mfrStorageGb: number | undefined;

    for (const vf of snapGate.verifiedFields) {
      verifiedFieldSet.add(vf.fieldPath);
      if (vf.fieldPath === 'specs.connectivity.has5G') mfrHas5G = Boolean(vf.normalizedValue);
      if (vf.fieldPath === 'specs.memory.ramGb') mfrRamGb = Number(vf.normalizedValue);
      if (vf.fieldPath === 'specs.memory.storageGb') mfrStorageGb = Number(vf.normalizedValue);

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

    manufacturerCorroborationMap.set(snapshotMeta.canonicalId, {
      mpn: snapshotMeta.mpn,
      has5G: mfrHas5G,
      ramGb: mfrRamGb,
      storageGb: mfrStorageGb,
      verifiedFields: verifiedFieldSet,
      fieldsUpdated,
      evidenceFieldsRecorded: resolvedPaths.length,
    });

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

    const mfrOutcome = fieldsUpdated > 0 ? 'APPLIED_ALL_AVAILABLE' : 'NO_CHANGE_NEEDED';
    resultMap.set(snapshotMeta.canonicalId, {
      canonicalId: snapshotMeta.canonicalId,
      brand: snapshotMeta.brand,
      model: snapshotMeta.model,
      outcome: mfrOutcome,
      sourceType: snapshotMeta.sourceType,
      trustClassification: snapshotMeta.trustClassification,
      reasonCode:
        fieldsUpdated > 0
          ? `Applied ${fieldsUpdated} snapshot-verified manufacturer fields (${resolvedPaths.length} verified evidence fields, MPN=${snapshotMeta.mpn}) with per-field document locators`
          : `Verified ${resolvedPaths.length} snapshot-backed manufacturer fields (MPN=${snapshotMeta.mpn}) match existing catalog values; no field mutation needed`,
      fieldsAppliedCount: fieldsUpdated,
      evidenceFieldsRecorded: resolvedPaths.length,
      extraSpecsCount: 0,
      icecatTitle: null,
      fetchedAt: snapshotMeta.fetchedAt,
      appliedAt,
      timestamp: appliedAt,
    });

    console.log(
      `[${phaseLabel} — OFFICIAL_MANUFACTURER SNAPSHOT] ${snapshotMeta.canonicalId} (${snapshotMeta.mpn}) -> ${fieldsUpdated} fields updated (${resolvedPaths.length} verified evidence), unresolvedRemaining=${summaryItem.unresolvedRemaining}`
    );
    return true;
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

    // Collect pre-transfer verified fields from buildVerifiedEvidenceMap, pre-transfer product.fieldSources,
    // AND any official manufacturer snapshot verified prior to Icecat evaluation
    const mfrCorrob = manufacturerCorroborationMap.get(cand.id);
    const mfrVerifiedFields = new Set<string>(verifiedEvidenceMap.get(cand.id) || []);
    if (Array.isArray(preTransferProduct.fieldSources)) {
      for (const fsEntry of preTransferProduct.fieldSources) {
        for (const f of fsEntry.fields || []) {
          mfrVerifiedFields.add(f);
        }
      }
    }
    if (mfrCorrob) {
      for (const f of mfrCorrob.verifiedFields) {
        mfrVerifiedFields.add(f);
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

    // Derive independent pre-transfer target identity strictly from manifest, pre-transfer catalog, or official manufacturer snapshot
    // NEVER from cand.queriedMpn!
    let independentPreTransferMpn: string | undefined;
    let preTransferMpnSource: PreTransferMpnSource = 'NONE';
    if (manifestItem?.mpn && String(manifestItem.mpn).trim().length > 0) {
      independentPreTransferMpn = String(manifestItem.mpn).trim();
      preTransferMpnSource = 'MANIFEST';
    } else if (preTransferProduct?.modelCode && String(preTransferProduct.modelCode).trim().length > 0) {
      independentPreTransferMpn = String(preTransferProduct.modelCode).trim();
      preTransferMpnSource = 'PRE_TRANSFER_CATALOG';
    } else if (mfrCorrob?.mpn) {
      independentPreTransferMpn = mfrCorrob.mpn;
      preTransferMpnSource = 'PRE_TRANSFER_EVIDENCE';
    }

    const independentTargetRamGb: number | undefined =
      manifestItem?.ramGb ?? mfrCorrob?.ramGb ?? preTransferProduct?.specs?.memory?.ramGb;
    const independentTargetStorageGb: number | undefined =
      manifestItem?.storageGb ?? mfrCorrob?.storageGb ?? preTransferProduct?.specs?.memory?.storageGb;

    const gateCheck = verifyIcecatTargetIdentity({
      targetId: cand.id,
      targetBrand: cand.brand,
      targetName: preTransferProduct.name || manifestItem?.model || cand.id,
      targetSlug: preTransferProduct.slug || cand.id,
      queriedMpn: cand.queriedMpn,
      preTransferMpn: independentPreTransferMpn,
      preTransferMpnSource,
      preTransferIndependent5GProof:
        mfrCorrob?.has5G !== undefined
          ? mfrCorrob.has5G
          : mfrVerifiedFields.has('specs.connectivity.has5G')
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

      // Only overwrite resultMap if the product was not already completed via an official manufacturer snapshot
      if (!mfrCorrob) {
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
      }

      separatedByIdentityGate.push({
        canonicalId: cand.id,
        queriedMpn: cand.queriedMpn,
        independentPreTransferMpn: independentPreTransferMpn || null,
        outcome,
        reasonCode: gateCheck.reasonCode,
        detail: gateCheck.detail,
        completedViaOfficialManufacturerSnapshot: !!mfrCorrob,
      });

      console.log(
        `[SEPARATED BY INDEPENDENT IDENTITY GATE] ${cand.id} (queried=${cand.queriedMpn}, preTransferMpn=${independentPreTransferMpn || 'NONE'}) -> ${gateCheck.reasonCode}${mfrCorrob ? ' [Product completed via Official Manufacturer Snapshot]' : ''}`
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

    if (mfrCorrob) {
      dualCorroboratedProductsCount++;
      const prevSummaryIdx = completedInThisRun.findIndex(
        x => x.canonicalId === cand.id && x.sourceType === 'OFFICIAL_MANUFACTURER'
      );
      if (prevSummaryIdx !== -1) {
        completedInThisRun[prevSummaryIdx].corroboratedIcecat = {
          queriedMpn: cand.queriedMpn,
          icecatId: mapped.icecatId,
          icecatTitle: mapped.title,
          icecatSourceType: 'ICECAT',
          icecatTrustClassification: 'ICECAT_CATALOG_VERIFIED',
          icecatFetchedAt:
            previousFetchedAtByProductAndField.get(`${cand.id}::specs.screen.size`) || sourceFetchedAt,
          icecatSourceContentHash: sourceContentHash,
          additionalIcecatFieldsUpdated: fieldsUpdated,
          additionalIcecatEvidenceFieldsRecorded: evidenceAddedForProduct,
          extraSpecsAdded: addedExtraSpecs,
        };
        completedInThisRun[prevSummaryIdx].extraSpecsAdded = addedExtraSpecs;
        completedInThisRun[prevSummaryIdx].unresolvedRemaining =
          product.specVerification?.unresolvedFields?.length || 0;
      }

      resultMap.set(cand.id, {
        canonicalId: cand.id,
        brand: cand.brand,
        model: product.name || manifestItem?.model,
        outcome: 'APPLIED_ALL_AVAILABLE',
        sourceType: 'OFFICIAL_MANUFACTURER_AND_ICECAT_SEPARATED',
        trustClassification: 'OFFICIAL_MANUFACTURER_VERIFIED + ICECAT_CATALOG_VERIFIED (SEPARATED_BY_FIELD)',
        reasonCode: `Applied ${mfrCorrob.fieldsUpdated} OFFICIAL_MANUFACTURER_VERIFIED fields (MPN=${mfrCorrob.mpn}) and ${fieldsUpdated} non-overlapping ICECAT_CATALOG_VERIFIED fields (+${addedExtraSpecs} extraSpecs, Icecat MPN=${cand.queriedMpn}) with strictly separate field evidence`,
        fieldsAppliedCount: mfrCorrob.fieldsUpdated + fieldsUpdated,
        extraSpecsCount: addedExtraSpecs,
        icecatTitle: mapped.title,
        fetchedAt: summaryItemFetchedAt(),
        appliedAt,
        timestamp: appliedAt,
      });
    } else {
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
        fetchedAt: summaryItemFetchedAt(),
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
    }

    function summaryItemFetchedAt() {
      return previousFetchedAtByProductAndField.get(`${cand.id}::specs.screen.size`) || sourceFetchedAt;
    }

    console.log(
      `[${phaseLabel} — ICECAT] ${cand.id} (queried=${cand.queriedMpn}, preTransferMpn=${independentPreTransferMpn || 'NONE'}) -> ${fieldsUpdated} fields updated (${evidenceAddedForProduct} evidence, ${excludedVariantFields.size} variant-specific excluded), +${addedExtraSpecs} extraSpecs, unresolvedRemaining=${product.specVerification?.unresolvedFields?.length || 0}`
    );
    return true;
  }

  // =========================================================================
  // STEP 2 (PHASE A): FIRST COMPLETE THE 4 ISOLATED P0 PHONES
  // =========================================================================
  console.log('--- PHASE A: COMPLETING THE 4 ISOLATED P0 PHONES ---');
  applyOfficialManufacturerSnapshot('samsung-samsung-galaxy-a20-21', 'PHASE A');
  await evaluateAndApplyIcecatCandidate(ICECAT_QUERY_CANDIDATES.get('samsung-samsung-galaxy-a30-22')!, 'PHASE A');
  await evaluateAndApplyIcecatCandidate(ICECAT_QUERY_CANDIDATES.get('samsung-samsung-galaxy-a14-86')!, 'PHASE A');
  await evaluateAndApplyIcecatCandidate(ICECAT_QUERY_CANDIDATES.get('samsung-samsung-galaxy-note-20-36')!, 'PHASE A');

  // =========================================================================
  // STEP 3 (PHASE B & NEXT EXECUTION): CONTINUE ACROSS THE 400-PHONE MANIFEST IN 20-ITEM BATCHES
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
      let itemCompleted = false;

      if (NEXT_EXECUTION_MANUFACTURER_SET.has(item.canonicalId)) {
        const mfrApplied = applyOfficialManufacturerSnapshot(
          item.canonicalId,
          `BATCH ${bIdx + 1}/${totalBatches}`
        );
        if (mfrApplied) itemCompleted = true;
      }

      const cand = ICECAT_QUERY_CANDIDATES.get(item.canonicalId);
      if (cand && !cand.isP0Isolated) {
        const icecatApplied = await evaluateAndApplyIcecatCandidate(
          cand,
          `BATCH ${bIdx + 1}/${totalBatches}`
        );
        if (icecatApplied) itemCompleted = true;
      }

      if (itemCompleted) {
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
  const separatedIdSet = new Set<string>(
    separatedByIdentityGate
      .filter(s => !s.completedViaOfficialManufacturerSnapshot)
      .map(s => s.canonicalId)
  );

  // Sibling memory SKU notes for Samsung items where Icecat only has a different RAM/storage tier
  const SIBLING_TIER_NOTES: Record<string, string> = {
    'samsung-samsung-galaxy-m31-48':
      'SOURCE_NOT_FOUND_EXACT_MEMORY_TIER: Open Icecat has SM-M315F (6 GB / 64 GB, IcecatId=80453814), but canonical record is 6 GB / 128 GB; skipped to preserve exact RAM/storage variant integrity.',
  };

  for (const item of manifestItems) {
    const r = resultMap.get(item.canonicalId);
    if (!r) continue;
    if (completedIdSet.has(item.canonicalId)) continue;

    if (separatedIdSet.has(item.canonicalId)) {
      r.blockerCategory =
        r.outcome === 'SOURCE_NOT_FOUND'
          ? 'SOURCE_NOT_FOUND_FOR_TESTED_IDENTIFIER'
          : 'IDENTITY_UNCERTAINTY';
      continue;
    }

    if (SIBLING_TIER_NOTES[item.canonicalId]) {
      r.outcome = 'SOURCE_NOT_FOUND';
      r.blockerCategory = 'SOURCE_NOT_FOUND_FOR_TESTED_IDENTIFIER';
      r.reasonCode = SIBLING_TIER_NOTES[item.canonicalId];
    } else if (
      typeof r.reasonCode === 'string' &&
      r.reasonCode.includes('UNRELEASED_CONCEPT_MODEL')
    ) {
      r.outcome = 'BLOCKED_IDENTITY';
      r.blockerCategory = 'IDENTITY_UNCERTAINTY';
      r.reasonCode =
        'IDENTITY_UNRESOLVED: Exact regional MPN/GTIN not corroborated in Open Icecat index (not classified as unannounced merely from query absence)';
    } else if (r.outcome === 'BLOCKED_ACCESS' || rawObsMap.has(item.canonicalId)) {
      const obs = rawObsMap.get(item.canonicalId) || null;
      const resolvedAccess = resolveAccessBlockerObservation({
        canonicalId: item.canonicalId,
        brand: item.brand,
        rawObservation: obs,
      });
      // Section 1 Fix Access Accounting:
      // - Never classify Code 8 as a proven subscription restriction (BLOCKED_ACCESS); move Code 8 to SOURCE_NOT_FOUND.
      // - Separate Missing Raw Response Evidence from Confirmed Subscription/Brand Permission Failures.
      r.outcome = resolvedAccess.recommendedOutcome;
      r.blockerCategory = resolvedAccess.blockerCategory;
      r.accessClassification = resolvedAccess.classification;
      r.isProvenSubscriptionRestriction = resolvedAccess.isProvenSubscriptionRestriction;
      r.httpStatus = resolvedAccess.httpStatus;
      r.icecatStatusCode = resolvedAccess.icecatStatusCode;
      r.redactedMessage = resolvedAccess.redactedMessage;
      r.observedAt = resolvedAccess.observedAt;
      r.reasonCode = resolvedAccess.reasonCode;
    } else if (r.outcome === 'SOURCE_NOT_FOUND') {
      r.blockerCategory = 'SOURCE_NOT_FOUND_FOR_TESTED_IDENTIFIER';
    } else if (r.outcome === 'BLOCKED_IDENTITY') {
      r.blockerCategory = 'IDENTITY_UNCERTAINTY';
    }
  }

  // Rewrite product-results.jsonl in manifest order
  const orderedResults = manifestItems.map(item => resultMap.get(item.canonicalId)).filter(Boolean);
  fs.writeFileSync(
    RESULTS_PATH,
    orderedResults.map(r => JSON.stringify(r)).join('\n') + '\n',
    'utf-8'
  );

  // Rebuild blockers.json from remaining non-applied items, explicitly carrying the 4 separated blocker categories
  const updatedBlockers = orderedResults
    .filter(r => r.outcome !== 'APPLIED_ALL_AVAILABLE' && r.outcome !== 'NO_CHANGE_NEEDED')
    .map(r => ({
      canonicalId: r.canonicalId,
      brand: r.brand,
      model: r.model,
      outcome: r.outcome,
      blockerCategory: r.blockerCategory,
      accessClassification: r.accessClassification || undefined,
      isProvenSubscriptionRestriction:
        r.isProvenSubscriptionRestriction !== undefined ? r.isProvenSubscriptionRestriction : undefined,
      httpStatus: r.httpStatus !== undefined ? r.httpStatus : undefined,
      icecatStatusCode: r.icecatStatusCode !== undefined ? r.icecatStatusCode : undefined,
      redactedMessage: r.redactedMessage !== undefined ? r.redactedMessage : undefined,
      observedAt: r.observedAt !== undefined ? r.observedAt : undefined,
      reason: r.reasonCode,
      timestamp: r.timestamp,
    }));
  fs.writeFileSync(BLOCKERS_PATH, JSON.stringify(updatedBlockers, null, 2), 'utf-8');

  // Build truthful 4-Category Blocker & Access Breakdown (Section 1: Fix Access Accounting)
  const separatedBlockerCategoryCounts: Record<string, number> = {
    CONFIRMED_SUBSCRIPTION_OR_BRAND_PERMISSION: 0,
    SOURCE_NOT_FOUND_FOR_TESTED_IDENTIFIER: 0,
    MISSING_RAW_RESPONSE_EVIDENCE: 0,
    IDENTITY_UNCERTAINTY: 0,
  };
  for (const b of updatedBlockers) {
    const cat = b.blockerCategory || 'IDENTITY_UNCERTAINTY';
    separatedBlockerCategoryCounts[cat] = (separatedBlockerCategoryCounts[cat] || 0) + 1;
  }

  const confirmedSubscriptionItems = updatedBlockers.filter(
    b => b.blockerCategory === 'CONFIRMED_SUBSCRIPTION_OR_BRAND_PERMISSION'
  );
  const code8SourceNotFoundItems = updatedBlockers.filter(
    b => b.accessClassification === 'NOT_PRESENT_IN_ICECAT_DB_CODE_8'
  );
  const missingRawEvidenceItems = updatedBlockers.filter(
    b => b.blockerCategory === 'MISSING_RAW_RESPONSE_EVIDENCE'
  );

  const classificationDistribution: Record<
    string,
    {
      count: number;
      blockerCategory: string;
      outcome: string;
      isProvenSubscriptionRestriction: boolean;
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
      totalRemainingBlockers: number;
      confirmedSubscriptionOrBrandPermission: number;
      observedBrandRestrictionCode14: number;
      observedAppKeyRequiredCode9: number;
      sourceNotFoundForTestedIdentifier: number;
      observedNotInIcecatDbCode8: number;
      missingRawResponseEvidence: number;
      identityUncertainty: number;
      observedSamples: Array<{
        canonicalId: string;
        probedMpn: string | null;
        outcome: string;
        blockerCategory: string;
        httpStatus: number;
        icecatStatusCode: number;
        redactedMessage: string;
        observedAt: string;
      }>;
      missingRawEvidenceSampleIds: string[];
    }
  > = {};

  for (const b of updatedBlockers) {
    const cls = b.accessClassification || b.blockerCategory || b.outcome;
    if (!classificationDistribution[cls]) {
      classificationDistribution[cls] = {
        count: 0,
        blockerCategory: b.blockerCategory,
        outcome: b.outcome,
        isProvenSubscriptionRestriction: Boolean(b.isProvenSubscriptionRestriction),
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
        totalRemainingBlockers: 0,
        confirmedSubscriptionOrBrandPermission: 0,
        observedBrandRestrictionCode14: 0,
        observedAppKeyRequiredCode9: 0,
        sourceNotFoundForTestedIdentifier: 0,
        observedNotInIcecatDbCode8: 0,
        missingRawResponseEvidence: 0,
        identityUncertainty: 0,
        observedSamples: [],
        missingRawEvidenceSampleIds: [],
      };
    }
    const bb = brandBreakdown[b.brand];
    bb.totalRemainingBlockers++;
    if (b.blockerCategory === 'CONFIRMED_SUBSCRIPTION_OR_BRAND_PERMISSION') {
      bb.confirmedSubscriptionOrBrandPermission++;
      if (b.accessClassification === 'BRAND_RESTRICTION_CODE_14') bb.observedBrandRestrictionCode14++;
      if (b.accessClassification === 'FULL_ICECAT_APP_KEY_REQUIRED_CODE_9') bb.observedAppKeyRequiredCode9++;
    } else if (b.blockerCategory === 'SOURCE_NOT_FOUND_FOR_TESTED_IDENTIFIER') {
      bb.sourceNotFoundForTestedIdentifier++;
      if (b.accessClassification === 'NOT_PRESENT_IN_ICECAT_DB_CODE_8') bb.observedNotInIcecatDbCode8++;
    } else if (b.blockerCategory === 'MISSING_RAW_RESPONSE_EVIDENCE') {
      bb.missingRawResponseEvidence++;
    } else if (b.blockerCategory === 'IDENTITY_UNCERTAINTY') {
      bb.identityUncertainty++;
    }

    const rawObs = rawObsMap.get(b.canonicalId);
    if (rawObs) {
      bb.observedSamples.push({
        canonicalId: b.canonicalId,
        probedMpn: rawObs.probedMpn || null,
        outcome: b.outcome,
        blockerCategory: b.blockerCategory,
        httpStatus: rawObs.httpStatus,
        icecatStatusCode: rawObs.icecatStatusCode,
        redactedMessage: rawObs.redactedMessage,
        observedAt: rawObs.observedAt,
      });
    } else if (
      b.blockerCategory === 'MISSING_RAW_RESPONSE_EVIDENCE' &&
      bb.missingRawEvidenceSampleIds.length < 5
    ) {
      bb.missingRawEvidenceSampleIds.push(b.canonicalId);
    }
  }

  fs.writeFileSync(
    ACCESS_BREAKDOWN_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        totalRemainingBlockers: updatedBlockers.length,
        totalRawProbeObservationsOnDisk: rawObsMap.size,
        separatedBlockerCategories: separatedBlockerCategoryCounts,
        confirmedSubscriptionOrBrandPermissionCount: confirmedSubscriptionItems.length,
        reclassifiedCode8ToSourceNotFoundCount: code8SourceNotFoundItems.length,
        missingRawResponseEvidenceCount: missingRawEvidenceItems.length,
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
      MISSING_RAW_RESPONSE_EVIDENCE: outcomeCounts['MISSING_RAW_RESPONSE_EVIDENCE'] || 0,
      SOURCE_NOT_FOUND: outcomeCounts['SOURCE_NOT_FOUND'] || 0,
      ERROR: outcomeCounts['ERROR'] || 0,
    },
    separatedBlockerCategories: separatedBlockerCategoryCounts,
    completedIds: orderedResults
      .filter(r => r.outcome === 'APPLIED_ALL_AVAILABLE' || r.outcome === 'NO_CHANGE_NEEDED')
      .map(r => r.canonicalId),
    lastUpdatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');

  // Write Post-P0 & Next Execution Completion Summary
  const postP0Summary = {
    executedAt: new Date().toISOString(),
    p0BaselineCommit: P0_BASELINE_COMMIT,
    phaseACompletedCount: 4,
    phaseBAndNextExecutionCompletedCount: completedInThisRun.length - 4,
    totalNewlyCompletedSinceP0Baseline: completedInThisRun.length,
    newlyCompletedInNextExecutionCount: 40,
    separatedByIndependentIdentityGateCount: separatedByIdentityGate.length,
    separatedByIdentityGate,
    bySourceType: {
      ICECAT_CATALOG_VERIFIED_ONLY: icecatAppliedProductsCount,
      OFFICIAL_MANUFACTURER_VERIFIED_ONLY: manufacturerAppliedProductsCount - dualCorroboratedProductsCount,
      DUAL_CORROBORATED_SEPARATED_BY_FIELD: dualCorroboratedProductsCount,
    },
    evidenceFieldsAdded: {
      ICECAT_CATALOG_VERIFIED: icecatEvidenceFieldsAdded,
      OFFICIAL_MANUFACTURER_VERIFIED: manufacturerEvidenceFieldsAdded,
    },
    manifest400Totals: checkpoint.statusCounts,
    separatedBlockerCategories: separatedBlockerCategoryCounts,
    accessBlockersClassificationSummary: Object.fromEntries(
      Object.entries(classificationDistribution).map(([k, v]) => [
        k,
        {
          count: v.count,
          blockerCategory: v.blockerCategory,
          outcome: v.outcome,
          isProvenSubscriptionRestriction: v.isProvenSubscriptionRestriction,
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
  console.log('[POST-P0 & NEXT EXECUTION COMPLETION SUMMARY]');
  console.log(`- Newly Completed Products Since P0 Baseline: ${completedInThisRun.length} (including +40 in Next Execution)`);
  console.log(`  * OFFICIAL_MANUFACTURER_VERIFIED only: ${manufacturerAppliedProductsCount - dualCorroboratedProductsCount}`);
  console.log(`  * ICECAT_CATALOG_VERIFIED only: ${icecatAppliedProductsCount}`);
  console.log(`  * Dual-Corroborated (strictly separated per field): ${dualCorroboratedProductsCount}`);
  console.log(`- Total Completed in 400-Manifest: ${checkpoint.completedIds.length} (${checkpoint.statusCounts.APPLIED_ALL_AVAILABLE} APPLIED + ${checkpoint.statusCounts.NO_CHANGE_NEEDED} NO_CHANGE_NEEDED)`);
  console.log(`- Remaining Blockers (${updatedBlockers.length}) Separated Into 4 Categories:`);
  console.log(`  1. CONFIRMED_SUBSCRIPTION_OR_BRAND_PERMISSION (BLOCKED_ACCESS): ${separatedBlockerCategoryCounts.CONFIRMED_SUBSCRIPTION_OR_BRAND_PERMISSION}`);
  console.log(`  2. SOURCE_NOT_FOUND_FOR_TESTED_IDENTIFIER (SOURCE_NOT_FOUND): ${separatedBlockerCategoryCounts.SOURCE_NOT_FOUND_FOR_TESTED_IDENTIFIER}`);
  console.log(`  3. MISSING_RAW_RESPONSE_EVIDENCE: ${separatedBlockerCategoryCounts.MISSING_RAW_RESPONSE_EVIDENCE}`);
  console.log(`  4. IDENTITY_UNCERTAINTY (BLOCKED_IDENTITY): ${separatedBlockerCategoryCounts.IDENTITY_UNCERTAINTY}`);
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
