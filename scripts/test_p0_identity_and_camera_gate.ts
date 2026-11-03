import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  verifyIcecatTargetIdentity,
  verifyAndExtractManufacturerSnapshot,
  resolveAccessBlockerObservation,
  ManufacturerSnapshotMeta,
} from '../src/lib/evidence/canonicalIdentityGate';
import { parseIcecatPayload } from './icecat_mapper';
import { hasUnresolvedSpecField } from '../src/lib/specVerification';
import { getComparisonRows } from '../src/lib/comparisonEvidence';
import { buildProductMetaDescription } from '../src/lib/seoHelper';
import { TrustEngine } from '../src/lib/ai/robopengu/trustEngine';

const QUARANTINED_DIR = path.resolve('reports/icecat-phones-400/quarantined_raw_archive');
const RAW_DIR = path.resolve('reports/icecat-phones-400/raw_archive');

function runTests() {
  console.log('======================================================================');
  console.log('[P0 & POST-P0 NEGATIVE & REGRESSION TEST SUITE]');
  console.log('======================================================================\n');

  let passed = 0;

  // 1. Negative Test: Reject A20e (SM-A202FZKDITV) for Galaxy A20
  const a20eRaw = JSON.parse(fs.readFileSync(path.join(QUARANTINED_DIR, 'samsung-samsung-galaxy-a20-21.json'), 'utf-8'));
  const gateA20 = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-a20-21',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy A20',
    targetSlug: 'samsung-galaxy-a20',
    icecatPayload: a20eRaw,
  });
  assert.strictEqual(gateA20.passed, false, 'A20e must be rejected for Galaxy A20');
  assert.strictEqual(gateA20.reasonCode, 'SUBMODEL_MISMATCH', 'A20 vs A20e must fail with SUBMODEL_MISMATCH');
  console.log(`✅ [PASS 1] Negative Test: Galaxy A20 rejected A20e (SM-A202FZKDITV) -> ${gateA20.reasonCode}`);
  passed++;

  // 2. Negative Test: Reject A30s (SM-A307FN/DS) for Galaxy A30
  const a30sRaw = JSON.parse(fs.readFileSync(path.join(QUARANTINED_DIR, 'samsung-samsung-galaxy-a30-22.json'), 'utf-8'));
  const gateA30 = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-a30-22',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy A30',
    targetSlug: 'samsung-galaxy-a30',
    icecatPayload: a30sRaw,
  });
  assert.strictEqual(gateA30.passed, false, 'A30s must be rejected for Galaxy A30');
  assert.strictEqual(gateA30.reasonCode, 'SUBMODEL_MISMATCH', 'A30 vs A30s must fail with SUBMODEL_MISMATCH');
  console.log(`✅ [PASS 2] Negative Test: Galaxy A30 rejected A30s (SM-A307FN/DS) -> ${gateA30.reasonCode}`);
  passed++;

  // 3. Negative Test: Reject A14 5G (SM-A146PZKDEUB) for Galaxy A14 (4G)
  const a14Raw = JSON.parse(fs.readFileSync(path.join(QUARANTINED_DIR, 'samsung-samsung-galaxy-a14-86.json'), 'utf-8'));
  const gateA14 = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-a14-86',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy A14',
    targetSlug: 'samsung-galaxy-a14',
    preTransferMpn: 'SM-A145FZKUEUE',
    preTransferMpnSource: 'MANIFEST',
    preTransferIndependent5GProof: false,
    icecatPayload: a14Raw,
  });
  assert.strictEqual(gateA14.passed, false, 'A14 5G must be rejected for Galaxy A14 4G');
  assert.strictEqual(gateA14.reasonCode, 'VARIANT_4G_5G_MISMATCH', 'A14 4G vs 5G must fail with VARIANT_4G_5G_MISMATCH');
  console.log(`✅ [PASS 3] Negative Test: Galaxy A14 (4G) rejected A14 5G (SM-A146PZKDEUB) -> ${gateA14.reasonCode}`);
  passed++;

  // 4. Negative Test: Reject Note20 5G (SM-N981BZAGEUE) for Galaxy Note 20 (without pre-transfer 5G proof)
  const note20Raw = JSON.parse(fs.readFileSync(path.join(QUARANTINED_DIR, 'samsung-samsung-galaxy-note-20-36.json'), 'utf-8'));
  const gateNote20 = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-note-20-36',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy Note 20',
    targetSlug: 'samsung-galaxy-note-20',
    preTransferMpn: 'SM-N980FZNHEUE',
    preTransferMpnSource: 'MANIFEST',
    preTransferIndependent5GProof: false,
    icecatPayload: note20Raw,
  });
  assert.strictEqual(gateNote20.passed, false, 'Note20 5G must be rejected for Galaxy Note 20');
  assert.strictEqual(gateNote20.reasonCode, 'VARIANT_4G_5G_MISMATCH', 'Note 20 4G vs 5G must fail with VARIANT_4G_5G_MISMATCH');
  console.log(`✅ [PASS 4] Negative Test: Galaxy Note 20 rejected Note20 5G (SM-N981BZAGEUE) -> ${gateNote20.reasonCode}`);
  passed++;

  // 5. Negative Test: Reject Note20 5G even when preTransferMpn is omitted (no pre-transfer 5G proof)
  const gateNote20NoMpn = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-note-20-36',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy Note 20',
    targetSlug: 'samsung-galaxy-note-20',
    icecatPayload: note20Raw,
  });
  assert.strictEqual(gateNote20NoMpn.passed, false, 'Note20 5G must be rejected when target has no pre-transfer 5G proof');
  assert.strictEqual(gateNote20NoMpn.reasonCode, 'VARIANT_4G_5G_MISMATCH');
  console.log(`✅ [PASS 5] Negative Test: Galaxy Note 20 (no MPN) rejected Note20 5G -> ${gateNote20NoMpn.reasonCode}`);
  passed++;

  // 6. Negative Test: Submodel modifier mismatch (S23+ payload on S23 target)
  const s23PlusRaw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'samsung-samsung-galaxy-s23-81.json'), 'utf-8'));
  const gateS23VsPlus = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-s23-80',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy S23',
    targetSlug: 'samsung-galaxy-s23',
    preTransferMpn: 'SM-S911BZKDEUE',
    preTransferMpnSource: 'MANIFEST',
    icecatPayload: s23PlusRaw,
  });
  assert.strictEqual(gateS23VsPlus.passed, false, 'S23+ must be rejected for base S23');
  assert.strictEqual(gateS23VsPlus.reasonCode, 'SUBMODEL_MISMATCH');
  console.log(`✅ [PASS 6] Negative Test: Galaxy S23 rejected Galaxy S23+ payload -> ${gateS23VsPlus.reasonCode}`);
  passed++;

  // 7. Camera Role Negative Test: parseIcecatPayload NEVER maps positional 2nd (27588) or 3rd (35935/27587) camera to ultrawideMp / telephotoMp
  const a12Raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'samsung-samsung-galaxy-a12-57.json'), 'utf-8'));
  const mappedA12 = parseIcecatPayload({ data: a12Raw }, 'tr');
  assert(mappedA12, 'A12 payload should parse');
  assert.strictEqual(mappedA12.specs.camera?.ultrawideMp, undefined, '2nd camera (27588) must NOT produce ultrawideMp');
  assert.strictEqual(mappedA12.specs.camera?.telephotoMp, undefined, '3rd camera (35935/27587) must NOT produce telephotoMp');
  const secondCamExtra = mappedA12.extraSpecs.find(e => e.featureId === 27588);
  const thirdCamExtra = mappedA12.extraSpecs.find(e => e.featureId === 35935);
  assert(secondCamExtra && secondCamExtra.value.includes('5'), '2nd camera must be preserved neutrally in extraSpecs');
  assert(thirdCamExtra && thirdCamExtra.value.includes('2'), '3rd camera must be preserved neutrally in extraSpecs');
  console.log(`✅ [PASS 7] Negative Test: Positional 2nd/3rd cameras do NOT emit ultrawideMp/telephotoMp; neutral extraSpecs preserved`);
  passed++;

  // 8. Camera Pixel-Dimension Negative Test: 12434 ("9248 x 6936 Piksel") does NOT overwrite numeric 12435 ("64 MP")
  const a52Raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'samsung-samsung-galaxy-a52-60.json'), 'utf-8'));
  const mappedA52 = parseIcecatPayload({ data: a52Raw }, 'tr');
  assert.strictEqual(mappedA52?.specs.camera?.mainMp, '64 MP', 'A52 mainMp must be 64 MP, not 9248 MP');
  console.log(`✅ [PASS 8] Negative Test: Pixel dimensions (9248 x 6936 Piksel) rejected for mainMp; numeric '64 MP' preserved`);
  passed++;

  // 9. Post-P0 Completion & Source Classification Verification for the 4 Isolated Phones (A20, A30, A14, Note 20)
  const catalog: any[] = JSON.parse(fs.readFileSync('src/lib/smartphonesData.json', 'utf-8'));
  const catalogMap = new Map(catalog.map(p => [p.id, p]));
  const evidenceLines = fs
    .readFileSync('reports/icecat-phones-400/field-evidence.jsonl', 'utf-8')
    .trim()
    .split('\n')
    .map(l => JSON.parse(l));

  // 9a. Galaxy A20 (Official Manufacturer Snapshot SM-A205F/DS — 12 supported fields, 7 unsupported excluded)
  const a20 = catalogMap.get('samsung-samsung-galaxy-a20-21');
  assert(a20, 'A20 must exist');
  assert.strictEqual(a20.name, 'Samsung Galaxy A20');
  assert.strictEqual(a20.specs.screen.size, '6.4 inç');
  assert.strictEqual(a20.specs.screen.resolution, '720 x 1560');
  assert.strictEqual(a20.specs.screen.type, 'Super AMOLED');
  assert.strictEqual(a20.specs.processor.cores, '8 Çekirdek');
  assert.strictEqual(a20.specs.memory.ramGb, 3);
  assert.strictEqual(a20.specs.memory.storageGb, 32);
  assert.strictEqual(a20.specs.memory.expandableStorage, true);
  assert.strictEqual(a20.specs.camera.mainMp, '13 MP');
  assert.strictEqual(a20.specs.camera.selfieMp, '8 MP');
  assert.strictEqual(a20.specs.battery.capacitymAh, 4000);
  assert.strictEqual(a20.specs.build.thicknessMm, 7.8);
  assert.strictEqual(a20.specs.software.osName, 'Android 9.0');
  // Verify the 7 unsupported fields are NOT populated and remain unresolved on A20
  assert.strictEqual(a20.specs.processor?.chip, undefined, 'Unsupported processor.chip must not be populated on A20');
  assert.strictEqual(a20.specs.camera?.videoRes, undefined, 'Unsupported camera.videoRes must not be populated on A20');
  assert.strictEqual(a20.specs.battery?.chargingWatts, undefined, 'Unsupported battery.chargingWatts must not be populated on A20');
  assert.strictEqual(a20.specs.connectivity?.has5G, undefined, 'Unsupported connectivity.has5G must not be populated on A20');
  assert.strictEqual(a20.specs.connectivity?.wifiStandard, undefined, 'Unsupported connectivity.wifiStandard must not be populated on A20');
  assert.strictEqual(a20.specs.connectivity?.bluetooth, undefined, 'Unsupported connectivity.bluetooth must not be populated on A20');
  assert.strictEqual(a20.specs.build?.weightGrams, undefined, 'Unsupported build.weightGrams must not be populated on A20');
  assert.strictEqual(hasUnresolvedSpecField(a20, 'screen.size'), false);
  assert.strictEqual(hasUnresolvedSpecField(a20, 'battery.capacitymAh'), false);
  assert.strictEqual(hasUnresolvedSpecField(a20, 'processor.chip'), true, 'Unsupported processor.chip must remain unresolved on A20');
  assert.strictEqual(hasUnresolvedSpecField(a20, 'connectivity.has5G'), true, 'Unsupported connectivity.has5G must remain unresolved on A20');
  assert.strictEqual(hasUnresolvedSpecField(a20, 'camera.ultrawideMp'), true);
  const a20Ev = evidenceLines.filter(e => e.productId === 'samsung-samsung-galaxy-a20-21');
  assert.strictEqual(a20Ev.length, 12, 'A20 must have exactly 12 snapshot-backed official manufacturer evidence records');
  assert(
    a20Ev.every(
      e =>
        e.sourceType === 'OFFICIAL_MANUFACTURER' &&
        e.trustClassification === 'OFFICIAL_MANUFACTURER_VERIFIED' &&
        typeof e.locator === 'string' &&
        e.locator.length > 0 &&
        e.fetchedAt === '2026-11-03T22:28:01.000Z' &&
        typeof e.appliedAt === 'string' &&
        typeof e.reviewedAt === 'string' &&
        typeof e.sourceContentHash === 'string' &&
        typeof e.normalizedDataHash === 'string' &&
        e.sourceContentHash !== e.normalizedDataHash
    ),
    'All 12 A20 evidence records must have valid locator, immutable fetchedAt, separate appliedAt/reviewedAt, and distinct sourceContentHash vs normalizedDataHash'
  );

  // 9b. Galaxy A30 (Icecat SM-A305FZKF 4G, 4GB/64GB — NOT A30s; 15 variant-invariant fields)
  const a30 = catalogMap.get('samsung-samsung-galaxy-a30-22');
  assert(a30, 'A30 must exist');
  assert.strictEqual(a30.name, 'Samsung Galaxy A30');
  assert.strictEqual(a30.specs.screen.size, '6.4 inç');
  assert.strictEqual(a30.specs.screen.resolution, '2340 x 1080');
  assert.strictEqual(a30.specs.memory.ramGb, 4);
  assert.strictEqual(a30.specs.memory.storageGb, 64);
  assert.strictEqual(a30.specs.camera.mainMp, '16 MP');
  assert.strictEqual(a30.specs.camera.selfieMp, '16 MP');
  assert.strictEqual(a30.specs.connectivity.has5G, false);
  assert.strictEqual(hasUnresolvedSpecField(a30, 'battery.capacitymAh'), false);
  assert.strictEqual(hasUnresolvedSpecField(a30, 'camera.ultrawideMp'), true);
  const a30Ev = evidenceLines.filter(e => e.productId === 'samsung-samsung-galaxy-a30-22');
  assert.strictEqual(a30Ev.length, 15);
  assert(a30Ev.every(e => e.mpn === 'SM-A305FZKF' && e.trustClassification === 'ICECAT_CATALOG_VERIFIED'));

  // 9c. Galaxy A14 (Icecat SM-A145RZKUEUE 4G, 4GB/64GB, 60Hz — sub-revision F vs R fields processor.chip/bluetooth/NFC/eSIM excluded)
  const a14 = catalogMap.get('samsung-samsung-galaxy-a14-86');
  assert(a14, 'A14 must exist');
  assert.strictEqual(a14.specs.screen.size, '6.6 inç');
  assert.strictEqual(a14.specs.screen.refreshRate, 60);
  assert.strictEqual(a14.specs.memory.ramGb, 4);
  assert.strictEqual(a14.specs.memory.storageGb, 64);
  assert.strictEqual(a14.specs.camera.mainMp, '50 MP');
  assert.strictEqual(a14.specs.connectivity.has5G, false);
  assert.strictEqual(a14.specs.processor?.chip, undefined, 'SM-A145R processor.chip must not be applied to SM-A145F target');
  assert.strictEqual(a14.specs.connectivity?.bluetooth, undefined, 'SM-A145R bluetooth must not be applied to SM-A145F target');
  assert.strictEqual(hasUnresolvedSpecField(a14, 'battery.capacitymAh'), false);
  assert.strictEqual(hasUnresolvedSpecField(a14, 'processor.chip'), true);
  assert.strictEqual(hasUnresolvedSpecField(a14, 'camera.ultrawideMp'), true);
  const a14Ev = evidenceLines.filter(e => e.productId === 'samsung-samsung-galaxy-a14-86');
  assert.strictEqual(a14Ev.length, 17);
  assert(a14Ev.every(e => e.mpn === 'SM-A145RZKUEUE' && e.trustClassification === 'ICECAT_CATALOG_VERIFIED'));

  // 9d. Galaxy Note 20 (Icecat SM-N980FZAGEUE 4G, 8GB/256GB — matches pre-transfer SM-N980FZNHEUE)
  const note20 = catalogMap.get('samsung-samsung-galaxy-note-20-36');
  assert(note20, 'Note 20 must exist');
  assert.strictEqual(note20.specs.screen.size, '6.7 inç');
  assert.strictEqual(note20.specs.memory.ramGb, 8);
  assert.strictEqual(note20.specs.memory.storageGb, 256);
  assert.strictEqual(note20.specs.camera.mainMp, '12 MP');
  assert.strictEqual(note20.specs.battery.capacitymAh, 4300);
  assert.strictEqual(note20.specs.connectivity.has5G, false);
  assert.strictEqual(hasUnresolvedSpecField(note20, 'battery.capacitymAh'), false);
  assert.strictEqual(hasUnresolvedSpecField(note20, 'camera.ultrawideMp'), true);
  const note20Ev = evidenceLines.filter(e => e.productId === 'samsung-samsung-galaxy-note-20-36');
  assert.strictEqual(note20Ev.length, 21);
  assert(note20Ev.every(e => e.mpn === 'SM-N980FZAGEUE' && e.trustClassification === 'ICECAT_CATALOG_VERIFIED'));

  // Verify Compare, SEO, and RoboPengu on all 4 completed phones
  for (const prod of [a20, a30, a14, note20]) {
    const compRows = getComparisonRows([prod]);
    const screenRow = compRows.find(r => r.id.includes('screen.size'));
    const ramRow = compRows.find(r => r.id.includes('memory.ramGb'));
    const uwRow = compRows.find(r => r.id.includes('camera.ultrawideMp'));
    assert(screenRow && !screenRow.getValue(prod).startsWith('Doğrulama bekliyor'));
    assert(ramRow && !ramRow.getValue(prod).startsWith('Doğrulama bekliyor'));
    assert(uwRow && uwRow.getValue(prod).startsWith('Doğrulama bekliyor'));

    const seoDesc = buildProductMetaDescription(prod);
    assert(!seoDesc.includes('5.8'), `SEO for ${prod.id} must not contain A20e 5.8 inch spec`);
    const trust = TrustEngine.evaluate(prod, ['camera', 'display', 'battery', 'processor', 'ram']);
    assert(!trust.blockedFields.includes('specs.memory.ramGb'), `RAM must be unblocked on ${prod.id}`);
    assert(!trust.blockedFields.includes('specs.screen.size'), `Screen size must be unblocked on ${prod.id}`);
    assert(trust.blockedFields.includes('specs.camera.ultrawideMp'), `Unresolved ultrawideMp must stay blocked on ${prod.id}`);
  }
  console.log(`✅ [PASS 9] Completed P0 phones (A20 12-field Snapshot, A30/A14/Note 20 4G Icecat) verified across Catalog, Evidence, Compare, SEO, and RoboPengu`);
  passed++;

  // 10. Verify zero positional ultrawideMp/telephotoMp, zero pixel-dimension MP, and zero duplicate field evidence in field-evidence.jsonl
  const uwTeleEv = evidenceLines.filter(
    e => e.fieldPath === 'specs.camera.ultrawideMp' || e.fieldPath === 'specs.camera.telephotoMp'
  );
  assert.strictEqual(uwTeleEv.length, 0, 'Zero positional ultrawideMp/telephotoMp evidence records allowed');

  const bogusMpEv = evidenceLines.filter(
    e =>
      (e.fieldPath === 'specs.camera.mainMp' || e.fieldPath === 'specs.camera.selfieMp') &&
      parseInt(String(e.normalizedValue), 10) > 250
  );
  assert.strictEqual(bogusMpEv.length, 0, 'Zero pixel-dimension MP values (>250 MP) allowed in field-evidence.jsonl');

  const seenEvKeys = new Set<string>();
  for (const ev of evidenceLines) {
    const key = `${ev.productId}::${ev.fieldPath}`;
    assert(!seenEvKeys.has(key), `Duplicate field evidence detected for ${key}`);
    seenEvKeys.add(key);
  }
  console.log(`✅ [PASS 10] All ${evidenceLines.length} field-evidence.jsonl records verified free of positional lens roles, pixel-dimension MP bugs, and duplicate field evidence`);
  passed++;

  // ===========================================================================
  // REQUIREMENT 4: FOUR NEW MANDATORY NEGATIVE TESTS (11, 12, 13, 14)
  // ===========================================================================

  // 11. Negative Test (Requirement 4.1): Reject manufacturer VERIFIED label when snapshot is missing OR field locator/excerpt fails verification
  const a20SnapMeta: ManufacturerSnapshotMeta = JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, 'samsung-samsung-galaxy-a20-21.official_manufacturer.json'), 'utf-8')
  );
  const missingSnapCheck = verifyAndExtractManufacturerSnapshot({
    ...a20SnapMeta,
    snapshotHtmlRelativePath: 'reports/icecat-phones-400/raw_archive/non_existent_snapshot.html',
  });
  assert.strictEqual(missingSnapCheck.passed, false, 'Missing manufacturer snapshot file must be rejected');
  assert.strictEqual(missingSnapCheck.reasonCode, 'SNAPSHOT_MISSING_OR_EMPTY');

  const unbackedFieldSnapCheck = verifyAndExtractManufacturerSnapshot({
    ...a20SnapMeta,
    fieldExtractions: [
      ...a20SnapMeta.fieldExtractions,
      {
        fieldPath: 'specs.processor.chip',
        locator: 'table > tbody > tr[4](th="AP") > td[0]',
        rowHeader: 'AP',
        rawExcerpt: 'Exynos 7884',
        normalizedValue: 'Exynos 7884',
      },
    ],
  });
  assert.strictEqual(unbackedFieldSnapCheck.passed, false, 'Field excerpt absent from snapshot HTML must be rejected');
  assert.strictEqual(unbackedFieldSnapCheck.reasonCode, 'FIELD_LOCATOR_OR_EXCERPT_UNVERIFIED');
  assert(
    unbackedFieldSnapCheck.rejectedFields.some(r => r.fieldPath === 'specs.processor.chip'),
    'specs.processor.chip must be listed in rejectedFields'
  );
  console.log(`✅ [PASS 11] Negative Test (Req 4.1): Manufacturer VERIFIED rejected when snapshot is missing or field locator/excerpt is absent`);
  passed++;

  // 12. Negative Test (Requirement 4.2): Reject fabricated access error code without raw response observation
  const fabricatedAccessCheck = resolveAccessBlockerObservation({
    canonicalId: 'apple-apple-iphone-17-pro-max-1-tb-1027079',
    brand: 'Apple',
    rawObservation: null,
    attemptedHardcodedHttpStatus: 404,
    attemptedHardcodedIcecatCode: 14,
  });
  assert.strictEqual(fabricatedAccessCheck.passedGate, false, 'Hardcoded HTTP 404 / Code 14 without raw observation must fail gate');
  assert.strictEqual(fabricatedAccessCheck.classification, 'REJECTED_FABRICATED_CODE');

  const unconfirmedAccessCheck = resolveAccessBlockerObservation({
    canonicalId: 'apple-apple-iphone-17-pro-max-1-tb-1027079',
    brand: 'Apple',
    rawObservation: null,
  });
  assert.strictEqual(unconfirmedAccessCheck.passedGate, true);
  assert.strictEqual(unconfirmedAccessCheck.classification, 'ACCESS_REASON_UNCONFIRMED');
  assert.strictEqual(unconfirmedAccessCheck.httpStatus, null);
  assert.strictEqual(unconfirmedAccessCheck.icecatStatusCode, null);

  const accessBreakdown = JSON.parse(fs.readFileSync('reports/icecat-phones-400/access-blockers-breakdown.json', 'utf-8'));
  assert.strictEqual(accessBreakdown.totalAccessBlockedRecords, 202);
  assert.strictEqual(accessBreakdown.classificationDistribution.ACCESS_REASON_UNCONFIRMED.count, 176);
  assert.strictEqual(accessBreakdown.classificationDistribution.NOT_PRESENT_IN_ICECAT_DB_CODE_8.count, 18);
  assert.strictEqual(accessBreakdown.classificationDistribution.BRAND_RESTRICTION_CODE_14.count, 6);
  assert.strictEqual(accessBreakdown.classificationDistribution.FULL_ICECAT_APP_KEY_REQUIRED_CODE_9.count, 2);
  console.log(`✅ [PASS 12] Negative Test (Req 4.2): Fabricated access error code without raw observation rejected; real distribution (176 unconfirmed, 18 Code 8, 6 Code 14, 2 Code 9) verified`);
  passed++;

  // 13. Negative Test (Requirement 4.3): Reject using queried MPN as its own preTransferMpn proof
  const zFold2Raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'samsung-samsung-galaxy-z-fold-2-39.json'), 'utf-8'));
  const selfRefCheck1 = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-z-fold-2-39',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy Z Fold 2',
    targetSlug: 'samsung-galaxy-z-fold-2',
    queriedMpn: 'SM-F916BZKAEUE',
    preTransferMpn: 'SM-F916BZKAEUE',
    preTransferMpnSource: 'QUERY_CANDIDATE',
    icecatPayload: zFold2Raw,
  });
  assert.strictEqual(selfRefCheck1.passed, false, 'Using query MPN with QUERY_CANDIDATE source must be rejected');
  assert.strictEqual(selfRefCheck1.reasonCode, 'SELF_REFERENTIAL_QUERY_MPN_FORBIDDEN');

  const selfRefCheck2 = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-z-fold-2-39',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy Z Fold 2',
    targetSlug: 'samsung-galaxy-z-fold-2',
    queriedMpn: 'SM-F916BZKAEUE',
    preTransferMpn: 'SM-F916BZKAEUE', // omitted preTransferMpnSource when equal to queriedMpn
    icecatPayload: zFold2Raw,
  });
  assert.strictEqual(selfRefCheck2.passed, false, 'Passing queriedMpn as preTransferMpn without independent provenance must be rejected');
  assert.strictEqual(selfRefCheck2.reasonCode, 'SELF_REFERENTIAL_QUERY_MPN_FORBIDDEN');

  // Also verify Australian XSA regional mismatch is rejected for EU/Global target A23
  const a23Raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, 'samsung-samsung-galaxy-a23-72.json'), 'utf-8'));
  const a23RegionCheck = verifyIcecatTargetIdentity({
    targetId: 'samsung-samsung-galaxy-a23-72',
    targetBrand: 'Samsung',
    targetName: 'Samsung Galaxy A23',
    targetSlug: 'samsung-galaxy-a23',
    queriedMpn: 'SM-A235FZOGXSA',
    preTransferMpn: 'SM-A235FZKUEUE',
    preTransferMpnSource: 'MANIFEST',
    targetHardwareRegion: 'EU/Global',
    icecatPayload: a23Raw,
  });
  assert.strictEqual(a23RegionCheck.passed, false, 'Australian XSA regional variant must be rejected for EU/Global A23');
  assert.strictEqual(a23RegionCheck.reasonCode, 'REGION_VARIANT_MISMATCH');
  console.log(`✅ [PASS 13] Negative Test (Req 4.3): Self-referential query MPN as preTransferMpn and regional XSA mismatch rejected`);
  passed++;

  // 14. Negative Test (Requirement 4.4): Reject overwriting fetchedAt when re-applying an existing snapshot
  const reapplyOverwriteAttempt = verifyAndExtractManufacturerSnapshot(a20SnapMeta, {
    attemptedFetchedAtOverride: '2026-11-04T00:00:00.000Z',
  });
  assert.strictEqual(reapplyOverwriteAttempt.passed, false, 'Overwriting immutable fetchedAt on snapshot re-apply must be rejected');
  assert.strictEqual(reapplyOverwriteAttempt.reasonCode, 'FETCHED_AT_IMMUTABLE_VIOLATION');

  const existingMismatchMap = new Map([
    [
      'specs.screen.size',
      {
        fetchedAt: '2026-11-04T01:00:00.000Z',
        sourceContentHash: a20SnapMeta.sourceContentHash,
      },
    ],
  ]);
  const existingMismatchCheck = verifyAndExtractManufacturerSnapshot(a20SnapMeta, {
    existingEvidenceByField: existingMismatchMap,
  });
  assert.strictEqual(existingMismatchCheck.passed, false, 'Mutated fetchedAt for identical sourceContentHash must be rejected');
  assert.strictEqual(existingMismatchCheck.reasonCode, 'FETCHED_AT_IMMUTABLE_VIOLATION');

  const validReapplyCheck = verifyAndExtractManufacturerSnapshot(a20SnapMeta, {
    existingEvidenceByField: new Map([
      [
        'specs.screen.size',
        {
          fetchedAt: '2026-11-03T22:28:01.000Z',
          sourceContentHash: a20SnapMeta.sourceContentHash,
        },
      ],
    ]),
    appliedAt: '2026-11-04T02:00:00.000Z',
    reviewedAt: '2026-11-04T02:00:00.000Z',
  });
  assert.strictEqual(validReapplyCheck.passed, true);
  assert.strictEqual(validReapplyCheck.verifiedFields[0].fetchedAt, '2026-11-03T22:28:01.000Z');
  assert.strictEqual(validReapplyCheck.verifiedFields[0].appliedAt, '2026-11-04T02:00:00.000Z');
  assert.strictEqual(validReapplyCheck.verifiedFields[0].reviewedAt, '2026-11-04T02:00:00.000Z');
  console.log(`✅ [PASS 14] Negative Test (Req 4.4): Overwriting fetchedAt on snapshot re-application rejected; immutable fetchedAt + separate appliedAt/reviewedAt verified`);
  passed++;

  console.log(`\n======================================================================`);
  console.log(`ALL ${passed}/14 P0 & POST-P0 NEGATIVE & REGRESSION TESTS PASSED!`);
  console.log(`======================================================================`);
}

runTests();
