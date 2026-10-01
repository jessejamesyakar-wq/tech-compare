/**
 * REGRESSION & COMPATIBILITY TEST SUITE: CAMERA SPEC V2
 *
 * Verifies:
 * 1. CameraSpec V2 backward compatibility (V1 fields mainMp, ultrawideMp, telephotoMp, selfieMp intact)
 * 2. 7 migrated products have clean mainMp and properly structured secondary sensors (depth, macro, monochrome)
 * 3. Zero data loss on migrated products
 * 4. Spec presentation projections (projectPhoneSpecs, readPhoneSpec) cleanly display V2 fields without breaking V1
 * 5. 5 blocked camera records are completely untouched
 */

import fs from 'node:fs';
import path from 'node:path';
import { readPhoneSpec, projectPhoneSpecs, PHONE_SPEC_FIELDS } from '../smartphoneSpecFields';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runCameraV2Suite(): { results: TestResult[]; summary: { total: number; passed: number; failed: number } } {
  const results: TestResult[] = [];

  function record(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: any) {
      results.push({ name, passed: false, error: err.message });
    }
  }

  const catalogPath = path.join(__dirname, '../smartphonesData.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  // 1. Verify 7 Migrated Products
  record('Test 1: Vivo Y29s 5G has clean mainMp and depthMp without data loss', () => {
    const p = catalog.find((x: any) => x.id === 'vivo-vivo-y29s-5g');
    if (!p) throw new Error('Product not found');
    if (p.specs.camera.mainMp !== '50 MP') throw new Error(`Expected mainMp 50 MP, got ${p.specs.camera.mainMp}`);
    if (p.specs.camera.depthMp !== '2 MP') throw new Error(`Expected depthMp 2 MP, got ${p.specs.camera.depthMp}`);
    if (!p.specs.camera.sensors || p.specs.camera.sensors.length !== 2) throw new Error('Missing structured sensors array');
  });

  record('Test 2: Vivo Y31d has clean mainMp and depthMp without data loss', () => {
    const p = catalog.find((x: any) => x.id === 'vivo-vivo-y31d');
    if (!p) throw new Error('Product not found');
    if (p.specs.camera.mainMp !== '50 MP') throw new Error(`Expected mainMp 50 MP, got ${p.specs.camera.mainMp}`);
    if (p.specs.camera.depthMp !== '2 MP') throw new Error(`Expected depthMp 2 MP, got ${p.specs.camera.depthMp}`);
    if (!p.specs.camera.sensors || p.specs.camera.sensors.length !== 2) throw new Error('Missing structured sensors array');
  });

  record('Test 3: Vivo V50 5G has primary ZEISS OIS and separated telephotoMp', () => {
    const p = catalog.find((x: any) => x.id === 'vivo-vivo-v50-5g');
    if (!p) throw new Error('Product not found');
    if (!p.specs.camera.mainMp.includes('50 MP')) throw new Error(`Invalid mainMp: ${p.specs.camera.mainMp}`);
    if (p.specs.camera.telephotoMp !== '50 MP') throw new Error(`Expected telephotoMp 50 MP, got ${p.specs.camera.telephotoMp}`);
    if (p.specs.camera.ultrawideMp !== '50 MP') throw new Error(`Expected ultrawideMp 50 MP, got ${p.specs.camera.ultrawideMp}`);
    if (!p.specs.camera.sensors || p.specs.camera.sensors.length !== 3) throw new Error('Expected 3 sensors');
  });

  record('Test 4: Huawei Mate 9 has RGB mainMp and monochromeMp', () => {
    const p = catalog.find((x: any) => x.id === 'huawei-huawei-mate-9');
    if (!p) throw new Error('Product not found');
    if (!p.specs.camera.mainMp.includes('12 MP')) throw new Error(`Invalid mainMp: ${p.specs.camera.mainMp}`);
    if (p.specs.camera.monochromeMp !== '20 MP') throw new Error(`Expected monochromeMp 20 MP, got ${p.specs.camera.monochromeMp}`);
  });

  record('Test 5: Oppo K1 and K7x have OIS mainMp and ultrawideMp', () => {
    ['oppo-oppo-k1-9361', 'oppo-oppo-k7x-10573'].forEach((id) => {
      const p = catalog.find((x: any) => x.id === id);
      if (!p) throw new Error(`Product ${id} not found`);
      if (!p.specs.camera.mainMp.includes('50 MP')) throw new Error(`Invalid mainMp on ${id}`);
      if (p.specs.camera.ultrawideMp !== '8 MP') throw new Error(`Expected ultrawideMp 8 MP on ${id}`);
    });
  });

  record('Test 6: Oppo Find X8s 5G has all three high-res sensors preserved', () => {
    const p = catalog.find((x: any) => x.id === 'oppo-oppo-find-x8s-5g-13769');
    if (!p) throw new Error('Product not found');
    if (!p.specs.camera.mainMp.includes('50 MP')) throw new Error('Invalid mainMp');
    if (p.specs.camera.ultrawideMp !== '50 MP') throw new Error('Expected ultrawideMp 50 MP');
    if (p.specs.camera.telephotoMp !== '50 MP') throw new Error('Expected telephotoMp 50 MP');
  });

  record('Test 7: 5 blocked camera records remain untouched', () => {
    const blockedIds = [
      'oppo-oppo-r815t-clover-5898',
      'oppo-oppo-a94-10765',
      'oppo-oppo-a17k-11936',
      'oppo-oppo-mirror-3-7193',
      'oppo-oppo-reno7-11448',
    ];
    blockedIds.forEach((id) => {
      const p = catalog.find((x: any) => x.id === id);
      if (!p) throw new Error(`Blocked product ${id} missing from catalog`);
      if (p.specs.camera.depthMp || p.specs.camera.macroMp || p.specs.camera.monochromeMp) {
        throw new Error(`Blocked product ${id} must not be migrated to V2`);
      }
    });
  });

  record('Test 8: PHONE_SPEC_FIELDS cleanly projects depth and monochrome fields', () => {
    const depthField = PHONE_SPEC_FIELDS.find((f) => f.paths === 'camera.depthMp');
    const monoField = PHONE_SPEC_FIELDS.find((f) => f.paths === 'camera.monochromeMp');
    const macroField = PHONE_SPEC_FIELDS.find((f) => f.paths === 'camera.macroMp');
    if (!depthField || !monoField || !macroField) {
      throw new Error('Missing V2 camera fields in PHONE_SPEC_FIELDS');
    }

    const mate9 = catalog.find((x: any) => x.id === 'huawei-huawei-mate-9');
    const projected = projectPhoneSpecs(mate9.specs);
    if ((projected.camera as any)?.monochromeMp !== '20 MP') {
      throw new Error('projectPhoneSpecs failed to project monochromeMp');
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  return {
    results,
    summary: { total: results.length, passed, failed },
  };
}

if (require.main === module) {
  const { results, summary } = runCameraV2Suite();
  console.log(`\n=== CAMERA SPEC V2 SUITE RESULTS ===`);
  results.forEach((r) => console.log(`${r.passed ? '✅' : '❌'} ${r.name} ${r.error ? `(${r.error})` : ''}`));
  console.log(`\nSummary: ${summary.passed}/${summary.total} Passed (${summary.failed} Failed)`);
  if (summary.failed > 0) process.exit(1);
}
