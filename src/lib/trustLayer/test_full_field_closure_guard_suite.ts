/**
 * TEST SUITE: FULL-FIELD CLOSURE GUARD & RUMOR POLLUTION REGRESSIONS
 *
 * PROVES:
 * 1. Original queue empty + hidden wrong field -> batch FAILS closure (P1_BATCH_BLOCKED_CLOSURE_FAIL)
 * 2. Non-null rumor value conflicting with manufacturer -> detected by PreLaunchRumorPollutionDetector
 * 3. Flat Icecat field participates in closure audit via CrossSchemaSpecNormalizer
 * 4. Schema limitation does not trigger unsafe mutation (SCHEMA_LIMITATION allowed, no unsafe write)
 * 5. Clean product passes closure audit (P1_BATCH_PASS)
 */

import {
  FullFieldClosureGuard,
  PreLaunchRumorPollutionDetector,
  CrossSchemaSpecNormalizer,
  ClosureAuditRootResult,
  ClosureAuditField
} from './enforce/fullFieldClosureGuard';

let passedTests = 0;
const totalTests = 5;

console.log('=== RUNNING FULL-FIELD CLOSURE GUARD REGRESSION TEST SUITE ===');

// --------------------------------------------------------------------------
// TEST 1: Original queue empty + hidden wrong field -> batch FAILS closure
// --------------------------------------------------------------------------
try {
  const dummyTargetRoot: ClosureAuditRootResult = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    modelName: 'Google Pixel 10 Pro XL',
    counts: {
      VERIFIED_CORRECT: 20,
      FILLED_VERIFIED: 0,
      DEMONSTRABLY_WRONG: 1, // Hidden wrong field e.g. 144Hz
      SCHEMA_LIMITATION: 1,
      BLOCKED_EVIDENCE: 0,
      THIRD_PARTY_PROVENANCE_DEBT: 2,
      NOT_APPLICABLE: 0
    },
    isClean: false,
    inspectedFields: [
      {
        domain: 'DISPLAY',
        fieldPath: 'specs.screen.refreshRate',
        catalogValue: 144,
        officialValue: 120,
        classification: 'DEMONSTRABLY_WRONG',
        evidenceUrl: 'https://support.google.com/pixelphone/answer/7158570',
        notes: 'Refresh rate is 144Hz in catalog, official is 120Hz'
      }
    ]
  };

  const gateResult = FullFieldClosureGuard.evaluateClosureGate({
    batchId: 'BATCH-GOOGLE-P1',
    targetRoots: [dummyTargetRoot],
    originalQueueIssuesRemaining: 0, // Queue claims 0 issues!
    scopeLockPassed: true,
    unauthorizedMutationsCount: 0,
    priceMutationCount: 0,
    goldenMutationCount: 0,
    testsAndBuildPassed: true
  });

  if (
    gateResult.verdict === 'P1_BATCH_BLOCKED_CLOSURE_FAIL' &&
    gateResult.passed === false &&
    gateResult.reasons.some(r => r.includes('FALSE_COMPLETION_PREVENTED')) &&
    gateResult.counts.DEMONSTRABLY_WRONG === 1
  ) {
    console.log('✅ Regression Test 1: Original queue empty + hidden wrong field -> batch FAILS closure');
    passedTests++;
  } else {
    throw new Error(`Test 1 Failed: Expected P1_BATCH_BLOCKED_CLOSURE_FAIL but got ${gateResult.verdict}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 1 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 2: Non-null rumor value conflicting with manufacturer -> detected
// --------------------------------------------------------------------------
try {
  // Check 144Hz rumor
  const r1 = PreLaunchRumorPollutionDetector.detect('specs.screen.refreshRate', 144, {
    brand: 'Google',
    model: 'Google Pixel 10 Pro XL'
  });

  // Check 5300mAh rumor
  const r2 = PreLaunchRumorPollutionDetector.detect('specs.battery.capacitymAh', 5300, {
    brand: 'Google',
    model: 'Google Pixel 10 Pro XL'
  });

  // Check 48MP ultrawide on 9a rumor
  const r3 = PreLaunchRumorPollutionDetector.detect('specs.camera.ultrawideMp', '48 MP Super Actua UW', {
    brand: 'Google',
    model: 'Google Pixel 9a'
  });

  // Check mixed semantic chip name
  const r4 = PreLaunchRumorPollutionDetector.detect('specs.processor.chip', 'Google Tensor G5 (TSMC 3nm)', {
    brand: 'Google',
    model: 'Google Pixel 10 Pro XL'
  });

  if (
    r1.isSuspicious && r1.trigger === 'REQUIRES_OFFICIAL_VERIFICATION' &&
    r2.isSuspicious && r2.trigger === 'REQUIRES_OFFICIAL_VERIFICATION' &&
    r3.isSuspicious && r3.trigger === 'REQUIRES_OFFICIAL_VERIFICATION' &&
    r4.isSuspicious && r4.trigger === 'REQUIRES_OFFICIAL_VERIFICATION'
  ) {
    console.log('✅ Regression Test 2: Non-null rumor values conflicting with manufacturer -> detected');
    passedTests++;
  } else {
    throw new Error('Test 2 Failed: Rumor pollution detector failed to flag known pre-launch rumor artifacts.');
  }
} catch (e: any) {
  console.error('❌ Regression Test 2 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 3: Flat Icecat field participates in closure audit
// --------------------------------------------------------------------------
try {
  const flatIcecatRecord = {
    id: 'google-pixel-10-pro-xl-256gb-icecat',
    name: 'Google Pixel 10 Pro XL (256 GB)',
    brand: 'Google',
    specs: {
      screenSize: '6.8"',
      resolution: '2992 x 1344',
      batteryCapacity: 5100, // Flat battery field
      weight: 232
    }
  };

  const lookupScreen = CrossSchemaSpecNormalizer.getValue(flatIcecatRecord, 'specs.screen.size');
  const lookupBattery = CrossSchemaSpecNormalizer.getValue(flatIcecatRecord, 'specs.battery.capacitymAh');
  const lookupWeight = CrossSchemaSpecNormalizer.getValue(flatIcecatRecord, 'specs.build.weightGrams');

  if (
    lookupScreen.value === '6.8"' && lookupScreen.foundPath === 'specs.screenSize' &&
    lookupBattery.value === 5100 && lookupBattery.foundPath === 'specs.batteryCapacity' &&
    lookupWeight.value === 232 && lookupWeight.foundPath === 'specs.weight'
  ) {
    console.log('✅ Regression Test 3: Flat Icecat fields participate in closure audit via cross-schema normalizer');
    passedTests++;
  } else {
    throw new Error(`Test 3 Failed: CrossSchemaSpecNormalizer failed on flat record: ${JSON.stringify({ lookupScreen, lookupBattery, lookupWeight })}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 3 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 4: Schema limitation does not trigger unsafe mutation
// --------------------------------------------------------------------------
try {
  // A record with SCHEMA_LIMITATION (e.g. brightnessNits cannot hold both HDR 2200 and Peak 3300)
  const rootWithSchemaLimitation: ClosureAuditRootResult = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    modelName: 'Google Pixel 10 Pro XL',
    counts: {
      VERIFIED_CORRECT: 25,
      FILLED_VERIFIED: 0,
      DEMONSTRABLY_WRONG: 0, // Zero wrong fields!
      SCHEMA_LIMITATION: 1, // Brightness limitation acknowledged
      BLOCKED_EVIDENCE: 0,
      THIRD_PARTY_PROVENANCE_DEBT: 2,
      NOT_APPLICABLE: 0
    },
    isClean: true,
    inspectedFields: [
      {
        domain: 'DISPLAY',
        fieldPath: 'specs.screen.brightnessNits',
        catalogValue: 3000,
        officialValue: 'HDR: 2200, Peak: 3300',
        classification: 'SCHEMA_LIMITATION',
        notes: 'SCHEMA_LIMITATION_BRIGHTNESS: Cannot fit HDR 2200 and Peak 3300 into single scalar'
      }
    ]
  };

  const gateResult = FullFieldClosureGuard.evaluateClosureGate({
    batchId: 'BATCH-GOOGLE-P1',
    targetRoots: [rootWithSchemaLimitation],
    originalQueueIssuesRemaining: 0,
    scopeLockPassed: true,
    unauthorizedMutationsCount: 0,
    priceMutationCount: 0,
    goldenMutationCount: 0,
    testsAndBuildPassed: true
  });

  if (
    gateResult.verdict === 'P1_BATCH_PASS' &&
    gateResult.passed === true &&
    gateResult.counts.DEMONSTRABLY_WRONG === 0 &&
    gateResult.schemaLimitations.length === 1
  ) {
    console.log('✅ Regression Test 4: Schema limitation permitted in audit without triggering unsafe mutation');
    passedTests++;
  } else {
    throw new Error(`Test 4 Failed: Expected P1_BATCH_PASS with 1 schema limitation, got ${gateResult.verdict}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 4 Failed:', e.message);
}

// --------------------------------------------------------------------------
// TEST 5: Clean product passes closure audit
// --------------------------------------------------------------------------
try {
  const cleanTargetRoot: ClosureAuditRootResult = {
    rootId: 'google-google-pixel-10-pro-xl-28',
    modelName: 'Google Pixel 10 Pro XL',
    counts: {
      VERIFIED_CORRECT: 30,
      FILLED_VERIFIED: 0,
      DEMONSTRABLY_WRONG: 0,
      SCHEMA_LIMITATION: 0,
      BLOCKED_EVIDENCE: 0,
      THIRD_PARTY_PROVENANCE_DEBT: 0,
      NOT_APPLICABLE: 0
    },
    isClean: true,
    inspectedFields: [
      {
        domain: 'DISPLAY',
        fieldPath: 'specs.screen.refreshRate',
        catalogValue: 120,
        officialValue: 120,
        classification: 'VERIFIED_CORRECT'
      },
      {
        domain: 'BATTERY',
        fieldPath: 'specs.battery.capacitymAh',
        catalogValue: 5200,
        officialValue: 5200,
        classification: 'VERIFIED_CORRECT'
      }
    ]
  };

  const gateResult = FullFieldClosureGuard.evaluateClosureGate({
    batchId: 'BATCH-GOOGLE-P1-CLEAN',
    targetRoots: [cleanTargetRoot],
    originalQueueIssuesRemaining: 0,
    scopeLockPassed: true,
    unauthorizedMutationsCount: 0,
    priceMutationCount: 0,
    goldenMutationCount: 0,
    testsAndBuildPassed: true
  });

  if (gateResult.verdict === 'P1_BATCH_PASS' && gateResult.passed === true) {
    console.log('✅ Regression Test 5: Clean product passes closure audit');
    passedTests++;
  } else {
    throw new Error(`Test 5 Failed: Expected clean product to pass closure audit, got ${gateResult.verdict}`);
  }
} catch (e: any) {
  console.error('❌ Regression Test 5 Failed:', e.message);
}

console.log(`\nSummary: ${passedTests}/${totalTests} tests passed.`);
if (passedTests !== totalTests) {
  process.exit(1);
}
