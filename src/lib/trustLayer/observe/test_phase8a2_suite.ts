import crypto from 'node:crypto';
import { observeCrossBrandIsolation } from './crossBrandIsolationObserver';
import { observeIdentityCollisions } from './identityCollisionObserver';
import { observeSourceFreshness } from './sourceFreshnessObserver';
import { getFreshnessPolicyForDomain } from './freshnessPolicies';
import { auditSourceAuthority, FACT_DOMAIN_AUTHORITY_POLICIES } from './sourceAuthorityMatrix';
import { ChainedAuditGenerator, AuditEventPayload } from './chainedAuditGenerator';

export function runPhase8A2TestSuite(): { pass: boolean; totalTests: number; passedTests: number; failedTests: number; testLog: string[] } {
  const testLog: string[] = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      testLog.push(`[PASS] ${testName}`);
    } else {
      failedTests++;
      testLog.push(`[FAIL] ${testName}`);
    }
  }

  // 1. Samsung Galaxy M-series vs Apple M-series False Positives Test
  const mockSamsungCatalog = [
    { id: 'samsung-samsung-galaxy-m10-29', brand: 'Samsung', name: 'Samsung Galaxy M10', image: 'm10.jpg' },
    { id: 'samsung-samsung-galaxy-m20-30', brand: 'Samsung', name: 'Samsung Galaxy M20', image: 'm20.jpg' },
    { id: 'samsung-samsung-galaxy-m30-31', brand: 'Samsung', name: 'Samsung Galaxy M30', image: 'm30.jpg' }
  ];
  const crossBrandRes = observeCrossBrandIsolation(mockSamsungCatalog);
  assert(crossBrandRes.realViolationsCount === 0, 'Samsung Galaxy M-series vs Apple M-series false positives eliminated');

  // 2. Media format string false positive (m4a/mp4)
  const mockMediaFormatCatalog = [
    { id: 'samsung-galaxy-s26-ultra', brand: 'Samsung', name: 'Samsung Galaxy S26 Ultra', specs: { videoFormats: 'mp4, m4a, 3gp' } }
  ];
  const mediaRes = observeCrossBrandIsolation(mockMediaFormatCatalog);
  assert(mediaRes.realViolationsCount === 0, 'm4a/mp4 media string false positives eliminated');

  // 3. Genuine cross-brand foreign root reference detection
  const mockContaminatedCatalog = [
    { id: 'samsung-galaxy-fake', brand: 'Samsung', name: 'Samsung Fake', specs: { processor: 'Apple A17 Pro Bionic' } }
  ];
  const contamRes = observeCrossBrandIsolation(mockContaminatedCatalog);
  assert(contamRes.realViolationsCount === 1, 'Genuine cross-brand foreign processor spec detected');

  // 4. Genuine foreign brand namespace violation
  const mockNamespaceCatalog = [
    { id: 'samsung-galaxy-fake-2', brand: 'Samsung', name: 'Samsung Fake 2', specs: { manufacturer: 'Apple Inc.' } }
  ];
  const nsRes = observeCrossBrandIsolation(mockNamespaceCatalog);
  assert(nsRes.realViolationsCount === 1, 'Genuine foreign brand namespace violation detected');

  // 5. Huawei trailing-whitespace duplicate roots detection
  const mockHuaweiCatalog = [
    { id: 'huawei-huawei-p40-pro', brand: 'Huawei', name: 'Huawei P40 Pro' },
    { id: 'huawei-huawei-p40-pro-1', brand: 'Huawei', name: 'Huawei P40 Pro ' }
  ];
  const huaweiRes = observeIdentityCollisions(mockHuaweiCatalog);
  assert(
    huaweiRes.legacyDuplicatesCount === 1 && huaweiRes.collisions[0].classification === 'LEGACY_DUPLICATE_CANDIDATE',
    'Huawei trailing-whitespace duplicates detected and classified as LEGACY_DUPLICATE_CANDIDATE'
  );

  // 6. Legitimate capacity variants handling
  const mockCapacityCatalog = [
    { id: 'apple-iphone-15-128gb', brand: 'Apple', name: 'Apple iPhone 15 (128 GB)' },
    { id: 'apple-iphone-15-256gb', brand: 'Apple', name: 'Apple iPhone 15 (256 GB)' }
  ];
  const capacityRes = observeIdentityCollisions(mockCapacityCatalog);
  assert(capacityRes.realCollisionsCount === 0, 'Legitimate capacity variants do not trigger critical identity collision');

  // 7. Immutable freshness behavior (launch chipset / dimensions return NOT_TEMPORAL, never decay)
  const mockImmutableCatalog = [
    { id: 'samsung-s25', evidence: [{ domain: 'spec.chipset', timestamp: '2020-01-01T00:00:00Z', source: 'official' }] }
  ];
  const immRes = observeSourceFreshness(mockImmutableCatalog);
  assert(immRes.results[0].freshnessState === 'NOT_TEMPORAL', 'Immutable specs return NOT_TEMPORAL regardless of age');

  // 8. Retailer price temporal behavior
  const policyPrice = getFreshnessPolicyForDomain('offer.price');
  assert(policyPrice.temporalClass === 'FAST_TEMPORAL' && policyPrice.staleAfterDays === 3, 'Retailer price policy uses FAST_TEMPORAL (stale after 3 days)');

  // 9. Current OS temporal behavior
  const policyOS = getFreshnessPolicyForDomain('software.current_os');
  assert(policyOS.temporalClass === 'TEMPORAL' && policyOS.staleAfterDays === 90, 'Current OS policy uses TEMPORAL (stale after 90 days)');

  // 10. Missing freshness policy handling
  const policyUnknown = getFreshnessPolicyForDomain('unknown.custom_domain');
  assert(policyUnknown.fallbackBehavior === 'UNKNOWN_POLICY', 'Unconfigured domain policy returns UNKNOWN_POLICY');

  // 11. Fact-domain specific source authority policies
  assert(
    FACT_DOMAIN_AUTHORITY_POLICIES['spec.chipset'].preferredSourceTypes.includes('OFFICIAL_MANUFACTURER') &&
    FACT_DOMAIN_AUTHORITY_POLICIES['offer.price'].preferredSourceTypes.includes('RETAILER_DIRECT'),
    'Fact-domain specific source authority matrix applies domain-specific preferences'
  );

  // 12. Audit Chain Tampering Tests
  const auditGen = new ChainedAuditGenerator();
  auditGen.appendEvent('EVENT_1', { summary: 'Event 1' });
  auditGen.appendEvent('EVENT_2', { summary: 'Event 2' });
  auditGen.appendEvent('EVENT_3', { summary: 'Event 3' });
  const cleanChain = auditGen.getChain();

  // Test A: Intact Chain -> PASS
  const checkPass = ChainedAuditGenerator.verifyChainIntegrity(cleanChain);
  assert(checkPass.valid === true, 'Audit chain integrity verification passes on intact chain');

  // Test B: Mutate payload -> FAIL
  const tamperedPayloadChain: AuditEventPayload[] = JSON.parse(JSON.stringify(cleanChain));
  tamperedPayloadChain[1].payloadSummary = 'TAMPERED SUMMARY';
  const checkFailPayload = ChainedAuditGenerator.verifyChainIntegrity(tamperedPayloadChain);
  assert(checkFailPayload.valid === false, 'Audit chain fails on tampered payload content');

  // Test C: Mutate previous hash link -> FAIL
  const tamperedPrevHashChain: AuditEventPayload[] = JSON.parse(JSON.stringify(cleanChain));
  tamperedPrevHashChain[2].previousEventHash = 'badhash123456';
  const checkFailPrevHash = ChainedAuditGenerator.verifyChainIntegrity(tamperedPrevHashChain);
  assert(checkFailPrevHash.valid === false, 'Audit chain fails on broken previous hash link');

  // Test D: Remove middle event -> FAIL
  const removedMiddleChain = [cleanChain[0], cleanChain[2]];
  const checkFailRemove = ChainedAuditGenerator.verifyChainIntegrity(removedMiddleChain);
  assert(checkFailRemove.valid === false, 'Audit chain fails when middle event is removed');

  // Test E: Reorder events -> FAIL
  const reorderedChain = [cleanChain[1], cleanChain[0], cleanChain[2]];
  const checkFailReorder = ChainedAuditGenerator.verifyChainIntegrity(reorderedChain);
  assert(checkFailReorder.valid === false, 'Audit chain fails when events are reordered');

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const result = runPhase8A2TestSuite();
  console.log(`=== PHASE 8-A.2 REGRESSION TEST SUITE ===`);
  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  console.log(`Failed: ${result.failedTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }
}
