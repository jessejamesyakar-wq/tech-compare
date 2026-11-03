import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { parseIcecatPayload } from './icecat_mapper';
import { verifyIcecatTargetIdentity } from '../src/lib/evidence/canonicalIdentityGate';
import { buildVerifiedEvidenceMap } from '../src/lib/evidence/productCompleteness';

const BASELINE_COMMIT = '8325bcba5bf0ef4df32d5d30905d28e1cec7cfa3';
const REPORTS_DIR = path.resolve('reports/icecat-phones-400');
const RAW_ARCHIVE_DIR = path.join(REPORTS_DIR, 'raw_archive');
const QUARANTINED_ARCHIVE_DIR = path.join(REPORTS_DIR, 'quarantined_raw_archive');

if (!fs.existsSync(QUARANTINED_ARCHIVE_DIR)) {
  fs.mkdirSync(QUARANTINED_ARCHIVE_DIR, { recursive: true });
}

const MANIFEST_PATH = path.join(REPORTS_DIR, 'manifest.json');
const CHECKPOINT_PATH = path.join(REPORTS_DIR, 'checkpoint.json');
const RESULTS_PATH = path.join(REPORTS_DIR, 'product-results.jsonl');
const EVIDENCE_PATH = path.join(REPORTS_DIR, 'field-evidence.jsonl');
const JOURNAL_PATH = path.join(REPORTS_DIR, 'change-journal.jsonl');
const P0_JOURNAL_PATH = path.join(REPORTS_DIR, 'p0-repair-journal.jsonl');
const BLOCKERS_PATH = path.join(REPORTS_DIR, 'blockers.json');

const ALL_PHONE_SPEC_PATHS = [
  'screen.size',
  'screen.type',
  'screen.resolution',
  'screen.refreshRate',
  'screen.ppi',
  'screen.brightnessNits',
  'processor.chip',
  'processor.cores',
  'processor.process',
  'processor.antutuScore',
  'memory.ramGb',
  'memory.ramType',
  'memory.storageGb',
  'memory.expandableStorage',
  'camera.mainMp',
  'camera.ultrawideMp',
  'camera.telephotoMp',
  'camera.selfieMp',
  'camera.videoRes',
  'camera.dxomarkScore',
  'battery.capacitymAh',
  'battery.chargingWatts',
  'battery.wirelessCharging',
  'battery.reverseWireless',
  'connectivity.has5G',
  'connectivity.wifiStandard',
  'connectivity.bluetooth',
  'connectivity.hasNFC',
  'connectivity.hasesim',
  'build.weightGrams',
  'build.thicknessMm',
  'build.waterResistance',
  'build.frameMaterial',
  'software.osName',
];

function getNested(obj: any, dotPath: string): any {
  const parts = dotPath.replace(/^specs\./, '').split('.');
  let curr = obj?.specs;
  for (const p of parts) {
    if (curr == null) return undefined;
    curr = curr[p];
  }
  return curr;
}

function setNested(obj: any, dotPath: string, value: any): void {
  const parts = dotPath.replace(/^specs\./, '').split('.');
  if (!obj.specs) obj.specs = {};
  let curr = obj.specs;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!curr[parts[i]] || typeof curr[parts[i]] !== 'object') {
      curr[parts[i]] = {};
    }
    curr = curr[parts[i]];
  }
  const last = parts[parts.length - 1];
  if (value === undefined) {
    delete curr[last];
  } else {
    curr[last] = value;
  }
}

function addUnresolvedFields(product: any, paths: string[], note?: string) {
  if (!product.specVerification) {
    product.specVerification = {
      status: 'UNVERIFIED',
      unresolvedFields: [],
    };
  }
  const set = new Set<string>(product.specVerification.unresolvedFields || []);
  for (const p of paths) {
    set.add(p.replace(/^specs\./, ''));
  }
  product.specVerification.unresolvedFields = Array.from(set);
  if (note) {
    product.specVerification.note = note;
  }
}

async function runP0Repair() {
  console.log('======================================================================');
  console.log('[MASTER-01 / P0 REPAIR] EXECUTING SURGICAL REPAIR ACROSS 49 PRODUCTS');
  console.log('======================================================================\n');

  const baselineJson = execSync(`git show ${BASELINE_COMMIT}:src/lib/smartphonesData.json`, {
    maxBuffer: 50 * 1024 * 1024,
  }).toString('utf-8');
  const baselineCatalog: any[] = JSON.parse(baselineJson);
  const baselineMap = new Map<string, any>(baselineCatalog.map(p => [p.id, p]));

  const smartphonesDataPath = path.resolve('src/lib/smartphonesData.json');
  const catalog: any[] = JSON.parse(fs.readFileSync(smartphonesDataPath, 'utf-8'));
  const catalogMap = new Map<string, any>(catalog.map(p => [p.id, p]));

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
  const manifestMap = new Map<string, any>(manifest.items.map((m: any) => [m.canonicalId, m]));

  const verifiedEvidenceMap = buildVerifiedEvidenceMap();

  const existingResults: any[] = fs
    .readFileSync(RESULTS_PATH, 'utf-8')
    .trim()
    .split('\n')
    .map(l => JSON.parse(l));
  const resultMap = new Map<string, any>(existingResults.map(r => [r.canonicalId, r]));

  const existingEvidence: any[] = fs
    .readFileSync(EVIDENCE_PATH, 'utf-8')
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(l => JSON.parse(l));

  let existingBlockers: any[] = [];
  if (fs.existsSync(BLOCKERS_PATH)) {
    existingBlockers = JSON.parse(fs.readFileSync(BLOCKERS_PATH, 'utf-8'));
  }

  const applied49 = existingResults.filter(
    r => r.outcome === 'APPLIED_ALL_AVAILABLE' || r.outcome === 'APPLIED_PARTIAL'
  );
  console.log(`Found ${applied49.length} applied products in product-results.jsonl to evaluate.`);

  const p0JournalEntries: any[] = [];
  const isolatedProductIds = new Set<string>();
  const repairedProductSummaries: Record<string, { reason: string; fields: string[] }> = {};
  const now = new Date().toISOString();

  for (const resItem of applied49) {
    const id = resItem.canonicalId;
    const product = catalogMap.get(id);
    const baseProduct = baselineMap.get(id);
    const manifestItem = manifestMap.get(id);
    const mfrVerified = verifiedEvidenceMap.get(id) || new Set<string>();

    if (!product) continue;

    const rawPath = path.join(RAW_ARCHIVE_DIR, `${id}.json`);
    const quarantinePath = path.join(QUARANTINED_ARCHIVE_DIR, `${id}.json`);
    const archiveFileToRead = fs.existsSync(rawPath)
      ? rawPath
      : fs.existsSync(quarantinePath)
      ? quarantinePath
      : null;

    if (!archiveFileToRead) {
      console.warn(`[WARN] No raw archive found for ${id}`);
      continue;
    }

    const rawPayload = JSON.parse(fs.readFileSync(archiveFileToRead, 'utf-8'));

    // Run mandatory write-point identity gate using ONLY pre-transfer independent identity evidence
    const gateRes = verifyIcecatTargetIdentity({
      targetId: id,
      targetBrand: product.brand || manifestItem?.brand || 'Samsung',
      targetName: product.name || manifestItem?.model || id,
      targetSlug: product.slug || id,
      preTransferMpn: manifestItem?.mpn || baseProduct?.modelCode,
      preTransferIndependent5GProof: mfrVerified.has('specs.connectivity.has5G')
        ? Boolean(baseProduct?.specs?.connectivity?.has5G)
        : undefined,
      icecatPayload: rawPayload,
    });

    if (!gateRes.passed) {
      // =====================================================================
      // CASE 1: IDENTITY / SUBMODEL / 4G-5G VARIANT MISMATCH -> ISOLATE ALL
      // =====================================================================
      console.log(`\n[ISOLATING MISMATCHED PRODUCT] ${id}: ${gateRes.reasonCode}`);
      console.log(`  Detail: ${gateRes.detail}`);

      isolatedProductIds.add(id);
      repairedProductSummaries[id] = {
        reason: `${gateRes.reasonCode}: ${gateRes.detail}`,
        fields: [],
      };

      // Quarantine raw archive file
      if (fs.existsSync(rawPath)) {
        fs.copyFileSync(rawPath, quarantinePath);
        fs.unlinkSync(rawPath);
      }

      // Isolate extraSpecs
      const oldExtraSpecsCount = Array.isArray(product.extraSpecs) ? product.extraSpecs.length : 0;
      if (oldExtraSpecsCount > 0) {
        delete product.extraSpecs;
        p0JournalEntries.push({
          timestamp: now,
          productId: id,
          fieldPath: 'extraSpecs',
          beforeValue: `${oldExtraSpecsCount} items`,
          afterValue: null,
          action: 'ISOLATED_WRONG_SOURCE_EXTRASPECS',
          reason: gateRes.detail,
        });
        repairedProductSummaries[id].fields.push(`extraSpecs (${oldExtraSpecsCount} kayıt izole edildi)`);
      }

      // Isolate all unverified specs (do NOT restore unverified baseline values as verified!)
      const unresolvedForProduct: string[] = [];
      for (const specPath of ALL_PHONE_SPEC_PATHS) {
        const fullSpecPath = `specs.${specPath}`;
        if (mfrVerified.has(fullSpecPath)) continue;

        const currentVal = getNested(product, specPath);
        const baseVal = getNested(baseProduct, specPath);
        const wasContaminatedByIcecat = JSON.stringify(currentVal) !== JSON.stringify(baseVal);

        // Remove contaminated or unverified spec value so neither wrong Icecat value nor unverified old template value is used as verified
        if (currentVal !== undefined) {
          setNested(product, specPath, undefined);
          if (
            wasContaminatedByIcecat ||
            specPath === 'connectivity.has5G' ||
            specPath === 'camera.ultrawideMp' ||
            specPath === 'camera.telephotoMp'
          ) {
            p0JournalEntries.push({
              timestamp: now,
              productId: id,
              fieldPath: fullSpecPath,
              beforeValue: currentVal,
              afterValue: null,
              baselineUnverifiedValueNotRestored: baseVal ?? null,
              action: 'ISOLATED_AND_MARKED_UNVERIFIED',
              reason: gateRes.detail,
            });
            repairedProductSummaries[id].fields.push(
              `${specPath} (${JSON.stringify(currentVal)} -> Doğrulama bekliyor)`
            );
          }
        }
        unresolvedForProduct.push(specPath);
      }

      const isolationNote =
        gateRes.reasonCode === 'SUBMODEL_MISMATCH'
          ? 'Bu ürün için yanlış alt model kaynağından (A20e / A30s) aktarılan teknik özellikler ve kanıtlar izole edilmiştir; doğrulanmış üretici verisi beklenmektedir.'
          : 'Bu ürün için 4G/5G varyant kimliği aktarım öncesi bağımsız kanıtla doğrulanamadığından 5G varyant kaynağından gelen veriler izole edilmiştir; doğrulama beklenmektedir.';

      addUnresolvedFields(product, unresolvedForProduct, isolationNote);

      // Update product-results.jsonl & blockers.json entry
      resultMap.set(id, {
        canonicalId: id,
        brand: product.brand || manifestItem?.brand || 'Samsung',
        model: manifestItem?.model || product.name,
        outcome: 'BLOCKED_IDENTITY',
        reasonCode: `P0_IDENTITY_GATE_ISOLATED: ${gateRes.reasonCode} — ${gateRes.detail}`,
        fieldsAppliedCount: 0,
        extraSpecsCount: 0,
        icecatTitle: '',
        timestamp: now,
      });

      existingBlockers = existingBlockers.filter(b => b.canonicalId !== id);
      existingBlockers.push({
        canonicalId: id,
        brand: product.brand || manifestItem?.brand || 'Samsung',
        model: manifestItem?.model || product.name,
        outcome: 'BLOCKED_IDENTITY',
        reason: `P0_IDENTITY_GATE_ISOLATED: ${gateRes.reasonCode} — ${gateRes.detail}`,
        timestamp: now,
      });
    } else {
      // =====================================================================
      // CASE 2: VALID PRODUCT IDENTITY -> RE-EVALUATE AFFECTED CAMERA FIELDS
      // =====================================================================
      const mapped = parseIcecatPayload({ data: rawPayload }, 'tr');
      if (!mapped) continue;

      const changedFields: string[] = [];

      // 2a. Isolate positional ultrawideMp & telephotoMp (never assume 2nd=ultrawide, 3rd=telephoto)
      for (const camRolePath of ['camera.ultrawideMp', 'camera.telephotoMp'] as const) {
        const fullPath = `specs.${camRolePath}`;
        if (mfrVerified.has(fullPath)) continue;

        const mappedRoleVal = getNested({ specs: mapped.specs }, camRolePath);
        const currVal = getNested(product, camRolePath);
        const baseVal = getNested(baseProduct, camRolePath);

        if (mappedRoleVal === undefined) {
          // Lens role is NOT explicitly supported by the source feature!
          // Clear any positional or unverified template value and mark unresolved.
          if (currVal !== undefined) {
            setNested(product, camRolePath, undefined);
            p0JournalEntries.push({
              timestamp: now,
              productId: id,
              fieldPath: fullPath,
              beforeValue: currVal,
              afterValue: null,
              baselineUnverifiedValueNotRestored: baseVal ?? null,
              action: 'REMOVED_UNSUPPORTED_CAMERA_LENS_ROLE',
              reason:
                'Icecat kaynağında lens türü (ultra geniş / telefoto) açıkça belirtilmediğinden pozisyonel kamera varsayımı kaldırıldı; özellik extraSpecs içinde nötr adıyla korundu.',
            });
            changedFields.push(`${camRolePath} (${JSON.stringify(currVal)} -> Doğrulama bekliyor)`);
          }
          addUnresolvedFields(product, [camRolePath]);
        }
      }

      // 2b. Fix mainMp & selfieMp if previous mapper overwrote numeric MP with pixel dimensions (e.g. "9248 MP")
      for (const mpPath of ['camera.mainMp', 'camera.selfieMp'] as const) {
        const fullPath = `specs.${mpPath}`;
        if (mfrVerified.has(fullPath)) continue;

        const currVal = getNested(product, mpPath);
        const mappedVal = getNested({ specs: mapped.specs }, mpPath);

        if (mappedVal !== undefined && currVal !== mappedVal) {
          setNested(product, mpPath, mappedVal);
          p0JournalEntries.push({
            timestamp: now,
            productId: id,
            fieldPath: fullPath,
            beforeValue: currVal,
            afterValue: mappedVal,
            action: 'REPAIRED_NUMERIC_CAMERA_MP_FROM_RAW_ARCHIVE',
            reason: 'Piksel boyutu (12434/14077) yerine sayısal MP özelliği (12435/12437) uygulandı.',
          });
          changedFields.push(`${mpPath} (${JSON.stringify(currVal)} -> ${JSON.stringify(mappedVal)})`);
        }
      }

      if (changedFields.length > 0) {
        repairedProductSummaries[id] = {
          reason: 'CAMERA_ROLE_AND_MP_REPAIR',
          fields: changedFields,
        };
      }
    }
  }

  // Clean field-evidence.jsonl:
  // 1. Remove all records for isolatedProductIds
  // 2. Remove all specs.camera.ultrawideMp and specs.camera.telephotoMp records across the 49 products
  // 3. Update specs.camera.mainMp and specs.camera.selfieMp records where repaired from raw_archive
  const cleanedEvidence: any[] = [];
  for (const ev of existingEvidence) {
    if (isolatedProductIds.has(ev.productId)) {
      continue;
    }
    if (
      ev.fieldPath === 'specs.camera.ultrawideMp' ||
      ev.fieldPath === 'specs.camera.telephotoMp'
    ) {
      continue;
    }
    const prod = catalogMap.get(ev.productId);
    if (
      prod &&
      (ev.fieldPath === 'specs.camera.mainMp' || ev.fieldPath === 'specs.camera.selfieMp')
    ) {
      const updatedVal = getNested(prod, ev.fieldPath);
      if (updatedVal !== undefined && updatedVal !== ev.normalizedValue) {
        ev.rawValue = updatedVal;
        ev.normalizedValue = updatedVal;
        ev.fieldEvidenceHash = crypto
          .createHash('sha256')
          .update(`${ev.productId}:${ev.fieldPath}:${JSON.stringify(updatedVal)}:${ev.payloadHash}`)
          .digest('hex');
      }
    }
    cleanedEvidence.push(ev);
  }

  // Recalculate fieldsAppliedCount in product-results.jsonl for the 45 valid products
  const evCountByProduct = new Map<string, number>();
  for (const ev of cleanedEvidence) {
    evCountByProduct.set(ev.productId, (evCountByProduct.get(ev.productId) || 0) + 1);
  }
  for (const [id, r] of resultMap.entries()) {
    if (r.outcome === 'APPLIED_ALL_AVAILABLE' || r.outcome === 'APPLIED_PARTIAL') {
      r.fieldsAppliedCount = evCountByProduct.get(id) || 0;
    }
  }

  // Write updated files
  fs.writeFileSync(smartphonesDataPath, JSON.stringify(catalog, null, 2), 'utf-8');
  fs.writeFileSync(
    EVIDENCE_PATH,
    cleanedEvidence.map(e => JSON.stringify(e)).join('\n') + '\n',
    'utf-8'
  );
  fs.writeFileSync(
    P0_JOURNAL_PATH,
    p0JournalEntries.map(j => JSON.stringify(j)).join('\n') + '\n',
    'utf-8'
  );
  fs.appendFileSync(
    JOURNAL_PATH,
    p0JournalEntries.map(j => JSON.stringify(j)).join('\n') + '\n',
    'utf-8'
  );

  // Re-write product-results.jsonl in manifest order
  const updatedResults: any[] = [];
  for (const item of manifest.items) {
    const r = resultMap.get(item.canonicalId);
    if (r) updatedResults.push(r);
  }
  fs.writeFileSync(
    RESULTS_PATH,
    updatedResults.map(r => JSON.stringify(r)).join('\n') + '\n',
    'utf-8'
  );

  // Update checkpoint.json status counts
  const outcomeCounts: Record<string, number> = {};
  for (const r of updatedResults) {
    outcomeCounts[r.outcome] = (outcomeCounts[r.outcome] || 0) + 1;
  }
  const checkpoint = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf-8'));
  checkpoint.statusCounts = {
    APPLIED_ALL_AVAILABLE: outcomeCounts['APPLIED_ALL_AVAILABLE'] || 0,
    APPLIED_PARTIAL: outcomeCounts['APPLIED_PARTIAL'] || 0,
    NO_CHANGE_NEEDED: outcomeCounts['NO_CHANGE_NEEDED'] || 0,
    BLOCKED_IDENTITY: outcomeCounts['BLOCKED_IDENTITY'] || 0,
    BLOCKED_ACCESS: outcomeCounts['BLOCKED_ACCESS'] || 0,
    SOURCE_NOT_FOUND: outcomeCounts['SOURCE_NOT_FOUND'] || 0,
    ERROR: outcomeCounts['ERROR'] || 0,
    NOT_ATTEMPTED: 0,
  };
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(checkpoint, null, 2), 'utf-8');
  fs.writeFileSync(BLOCKERS_PATH, JSON.stringify(existingBlockers, null, 2), 'utf-8');
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'p0-repair-summary.json'),
    JSON.stringify(
      {
        timestamp: now,
        isolatedProductsCount: isolatedProductIds.size,
        isolatedProductIds: Array.from(isolatedProductIds),
        totalProductsTouched: Object.keys(repairedProductSummaries).length,
        totalJournalEntries: p0JournalEntries.length,
        beforeEvidenceCount: existingEvidence.length,
        afterEvidenceCount: cleanedEvidence.length,
        statusCounts: checkpoint.statusCounts,
        repairedProductSummaries,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(`\n[P0 Repair Complete]`);
  console.log(`- Isolated mismatched products: ${isolatedProductIds.size} (${Array.from(isolatedProductIds).join(', ')})`);
  console.log(`- Total products repaired across 49 set: ${Object.keys(repairedProductSummaries).length}`);
  console.log(`- Total P0 journal entries written: ${p0JournalEntries.length}`);
  console.log(`- Field evidence count: ${existingEvidence.length} -> ${cleanedEvidence.length}`);
  console.log(`- Updated checkpoint statusCounts:`, checkpoint.statusCounts);
}

runP0Repair().catch(err => {
  console.error('Fatal P0 repair error:', err);
  process.exit(1);
});
