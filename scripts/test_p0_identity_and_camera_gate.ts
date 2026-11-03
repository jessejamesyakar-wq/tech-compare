import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { verifyIcecatTargetIdentity } from '../src/lib/evidence/canonicalIdentityGate';
import { parseIcecatPayload } from './icecat_mapper';
import { hasUnresolvedSpecField } from '../src/lib/specVerification';
import { getComparisonRows } from '../src/lib/comparisonEvidence';
import { buildProductMetaDescription } from '../src/lib/seoHelper';
import { TrustEngine } from '../src/lib/ai/robopengu/trustEngine';

const QUARANTINED_DIR = path.resolve('reports/icecat-phones-400/quarantined_raw_archive');
const RAW_DIR = path.resolve('reports/icecat-phones-400/raw_archive');

function runTests() {
  console.log('======================================================================');
  console.log('[P0 NEGATIVE & REGRESSION TEST SUITE] IDENTITY GATE + CAMERA MAPPER');
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

  // 9a. Galaxy A20 (Official Manufacturer SM-A205F/DS — NEVER tagged as ICECAT_CATALOG_VERIFIED)
  const a20 = catalogMap.get('samsung-samsung-galaxy-a20-21');
  assert(a20, 'A20 must exist');
  assert.strictEqual(a20.name, 'Samsung Galaxy A20');
  assert.strictEqual(a20.specs.screen.size, '6.4 inç');
  assert.strictEqual(a20.specs.screen.resolution, '720 x 1560');
  assert.strictEqual(a20.specs.processor.chip, 'Exynos 7884');
  assert.strictEqual(a20.specs.memory.ramGb, 3);
  assert.strictEqual(a20.specs.memory.storageGb, 32);
  assert.strictEqual(a20.specs.camera.mainMp, '13 MP');
  assert.strictEqual(a20.specs.battery.capacitymAh, 4000);
  assert.strictEqual(a20.specs.connectivity.has5G, false);
  assert.strictEqual(hasUnresolvedSpecField(a20, 'screen.size'), false);
  assert.strictEqual(hasUnresolvedSpecField(a20, 'processor.chip'), false);
  assert.strictEqual(hasUnresolvedSpecField(a20, 'battery.capacitymAh'), false);
  assert.strictEqual(hasUnresolvedSpecField(a20, 'camera.ultrawideMp'), true);
  assert.strictEqual(hasUnresolvedSpecField(a20, 'camera.telephotoMp'), true);
  const a20Ev = evidenceLines.filter(e => e.productId === 'samsung-samsung-galaxy-a20-21');
  assert.strictEqual(a20Ev.length, 19, 'A20 must have 19 official manufacturer evidence records');
  assert(
    a20Ev.every(
      e => e.sourceType === 'OFFICIAL_MANUFACTURER' && e.trustClassification === 'OFFICIAL_MANUFACTURER_VERIFIED'
    ),
    'A20 manufacturer evidence must NEVER be labeled ICECAT_CATALOG_VERIFIED'
  );

  // 9b. Galaxy A30 (Icecat SM-A305FZKF 4G, 4GB/64GB — NOT A30s)
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
  assert.strictEqual(a30Ev.length, 16);
  assert(a30Ev.every(e => e.mpn === 'SM-A305FZKF' && e.trustClassification === 'ICECAT_CATALOG_VERIFIED'));

  // 9c. Galaxy A14 (Icecat SM-A145RZKUEUE 4G, 4GB/64GB, 60Hz — NOT A14 5G 90Hz)
  const a14 = catalogMap.get('samsung-samsung-galaxy-a14-86');
  assert(a14, 'A14 must exist');
  assert.strictEqual(a14.specs.screen.size, '6.6 inç');
  assert.strictEqual(a14.specs.screen.refreshRate, 60);
  assert.strictEqual(a14.specs.memory.ramGb, 4);
  assert.strictEqual(a14.specs.memory.storageGb, 64);
  assert.strictEqual(a14.specs.camera.mainMp, '50 MP');
  assert.strictEqual(a14.specs.connectivity.has5G, false);
  assert.strictEqual(hasUnresolvedSpecField(a14, 'battery.capacitymAh'), false);
  assert.strictEqual(hasUnresolvedSpecField(a14, 'camera.ultrawideMp'), true);
  const a14Ev = evidenceLines.filter(e => e.productId === 'samsung-samsung-galaxy-a14-86');
  assert.strictEqual(a14Ev.length, 21);
  assert(a14Ev.every(e => e.mpn === 'SM-A145RZKUEUE' && e.trustClassification === 'ICECAT_CATALOG_VERIFIED'));

  // 9d. Galaxy Note 20 (Icecat SM-N980FZAGEUE 4G, 8GB/256GB — NOT Note20 5G SM-N981B)
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
    const fiveGRow = compRows.find(r => r.id.includes('connectivity.has5G'));
    const uwRow = compRows.find(r => r.id.includes('camera.ultrawideMp'));
    assert(screenRow && !screenRow.getValue(prod).startsWith('Doğrulama bekliyor'));
    assert(ramRow && !ramRow.getValue(prod).startsWith('Doğrulama bekliyor'));
    assert(fiveGRow && !fiveGRow.getValue(prod).startsWith('Doğrulama bekliyor'));
    assert(uwRow && uwRow.getValue(prod).startsWith('Doğrulama bekliyor'));

    const seoDesc = buildProductMetaDescription(prod);
    assert(!seoDesc.includes('5.8'), `SEO for ${prod.id} must not contain A20e 5.8 inch spec`);
    const trust = TrustEngine.evaluate(prod, ['camera', 'display', 'battery', 'processor', 'ram']);
    assert(!trust.blockedFields.includes('specs.memory.ramGb'), `RAM must be unblocked on ${prod.id}`);
    assert(!trust.blockedFields.includes('specs.screen.size'), `Screen size must be unblocked on ${prod.id}`);
    assert(trust.blockedFields.includes('specs.camera.ultrawideMp'), `Unresolved ultrawideMp must stay blocked on ${prod.id}`);
  }
  console.log(`✅ [PASS 9] Completed P0 phones (A20 Official Mfr, A30/A14/Note 20 4G Icecat) verified across Catalog, Evidence, Compare, SEO, and RoboPengu`);
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

  console.log(`\n======================================================================`);
  console.log(`ALL ${passed}/10 P0 NEGATIVE & REGRESSION TESTS PASSED!`);
  console.log(`======================================================================`);
}

runTests();
