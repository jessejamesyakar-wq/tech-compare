import { runPhase8BTestSuite } from '../shadow/test_phase8b_suite';
import { PreWriteEnforcementGate } from './preWriteEnforcementGate';
import { CandidateStagingBuffer } from './candidateStagingBuffer';
import { ChainedAuditGenerator } from '../observe/chainedAuditGenerator';
import { createAuthorizedWriteManifest } from './authorizedWriteManifest';
import { EnforcementCircuitBreaker } from './enforcementCircuitBreaker';
import { executeDualControlReview } from './dualControlReviewWorkflow';
import { EnforcementTransactionSandbox } from './enforcementTransactionSandbox';

export function runPhase8CTestSuite(): { pass: boolean; totalTests: number; passedTests: number; failedTests: number; testLog: string[] } {
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

  // 1. Run all prior Phase 8-A, 8-A.2, 8-B tests first!
  const phase8bRes = runPhase8BTestSuite();
  assert(phase8bRes.pass === true, 'All Phase 8-B tests continue to pass');

  const staging = new CandidateStagingBuffer();
  const audit = new ChainedAuditGenerator();
  const gate = new PreWriteEnforcementGate(staging, audit);

  const manifest = createAuthorizedWriteManifest(
    ['samsung-samsung-galaxy-a57-5g', 'samsung-galaxy-s26-plus', 'samsung-galaxy-new-root'],
    ['UPDATE_SPEC', 'CREATE_ROOT'],
    ['spec.chipset', 'spec.display', '*']
  );

  // 2. Valid existing-root spec update -> ALLOW
  const decValidUpdate = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_001',
    targetRootId: 'samsung-samsung-galaxy-a57-5g',
    operationType: 'UPDATE_SPEC',
    factDomain: 'spec.display',
    proposedFacts: { displayType: 'Super AMOLED 120Hz' },
    manifest
  });
  assert(decValidUpdate.decisionState === 'ALLOW', 'Valid existing-root spec update returns ALLOW');

  // 3. Unauthorized target root write -> HARD BLOCK [WRITE_OUTSIDE_AUTHORIZED_SCOPE]
  const decUnauthorizedTarget = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_002',
    targetRootId: 'unauthorized-root-id',
    operationType: 'UPDATE_SPEC',
    factDomain: 'spec.display',
    proposedFacts: { displayType: 'OLED' },
    manifest
  });
  assert(
    decUnauthorizedTarget.decisionState === 'BLOCK' && decUnauthorizedTarget.appliedRuleId === 'ENF_WRITE_SCOPE',
    'Write outside authorized manifest scope produces HARD BLOCK [WRITE_OUTSIDE_AUTHORIZED_SCOPE]'
  );

  // 4. Golden root mutation attempt -> HARD BLOCK [GOLDEN_DATASET_MUTATION_ATTEMPT]
  const decGoldenMutation = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_003',
    targetRootId: 'samsung-galaxy-s25',
    operationType: 'UPDATE_SPEC',
    factDomain: 'spec.chipset',
    proposedFacts: { processor: 'Mutated Chip' },
    manifest: createAuthorizedWriteManifest(['samsung-galaxy-s25'], ['UPDATE_SPEC'], ['*'])
  });
  assert(
    decGoldenMutation.decisionState === 'BLOCK' && decGoldenMutation.appliedRuleId === 'ENF_GOLDEN_MUTATION',
    'Candidate attempting Golden Dataset root mutation produces HARD BLOCK [GOLDEN_DATASET_MUTATION_ATTEMPT]'
  );

  // 5. Price Firewall Breach Attempt -> HARD BLOCK [PRICE_MUTATION_FROM_SPEC_PIPELINE]
  const decPriceFirewall = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_004',
    targetRootId: 'samsung-samsung-galaxy-a57-5g',
    operationType: 'UPDATE_SPEC',
    factDomain: 'offer.price',
    proposedFacts: { price: 15999 },
    manifest
  });
  assert(
    decPriceFirewall.decisionState === 'BLOCK' && decPriceFirewall.appliedRuleId === 'ENF_PRICE_FIREWALL',
    'Spec pipeline attempting price mutation produces HARD BLOCK [PRICE_MUTATION_FROM_SPEC_PIPELINE]'
  );

  // 6. Cross-Brand Contamination -> HARD BLOCK [REAL_CROSS_BRAND_REFERENCE]
  const decCrossBrand = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_005',
    targetRootId: 'samsung-samsung-galaxy-a57-5g',
    operationType: 'UPDATE_SPEC',
    factDomain: 'spec.chipset',
    proposedFacts: { processor: 'Apple A17 Pro Bionic' },
    manifest
  });
  assert(
    decCrossBrand.decisionState === 'BLOCK' && decCrossBrand.appliedRuleId === 'ENF_CROSS_BRAND_REF',
    'Cross-brand hardware spec contamination produces HARD BLOCK [REAL_CROSS_BRAND_REFERENCE]'
  );

  // 7. Foreign Brand Namespace Violation -> HARD BLOCK [REAL_NAMESPACE_VIOLATION]
  const decNamespace = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_006',
    targetRootId: 'samsung-samsung-galaxy-a57-5g',
    operationType: 'UPDATE_SPEC',
    factDomain: 'identity.brand',
    proposedFacts: { brand: 'Samsung', specs: { manufacturer: 'Apple Inc.' } },
    manifest
  });
  assert(
    decNamespace.decisionState === 'BLOCK' && decNamespace.appliedRuleId === 'ENF_CROSS_BRAND_REF',
    'Foreign brand namespace mismatch produces HARD BLOCK'
  );

  // 8. Circuit Breaker Safe Failure (Trip circuit -> BLOCK)
  EnforcementCircuitBreaker.tripCircuit('AUDIT_CHAIN_CORRUPTION', 'Test circuit trip');
  const decCircuitTripped = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_007',
    targetRootId: 'samsung-samsung-galaxy-a57-5g',
    operationType: 'UPDATE_SPEC',
    factDomain: 'spec.display',
    proposedFacts: { displayType: 'OLED' },
    manifest
  });
  assert(
    decCircuitTripped.decisionState === 'BLOCK' && decCircuitTripped.appliedRuleId === 'ENF_CIRCUIT_BREAKER_OPEN',
    'When circuit breaker is OPEN, pre-write gate FAILS CLOSED and BLOCKS all writes'
  );
  EnforcementCircuitBreaker.resetCircuit();

  // 9. Staging Buffer Verification
  const staged = staging.getStagedCandidates();
  assert(staged.length > 0 && staged[0].publicCatalogExposed === false, 'Blocked candidates are staged in buffer outside public catalog');

  // 10. Dual-Control Review Workflow
  const review = executeDualControlReview('cand_001', 'samsung-samsung-galaxy-a57-5g', 'user_author', 'user_reviewer', 'APPROVE_CANDIDATE');
  assert(review.dualControlVerified === true && review.productionMutationAttempted === false, 'Dual-control review workflow validates distinct identities without production mutation');

  // 11. Sandbox Pre-Write Transaction & Post-Write Rollback
  const sandbox = new EnforcementTransactionSandbox([{ id: 'root_1', name: 'Root 1', price: 100 }]);
  const sbRes = sandbox.simulateAuthorizedWrite('root_1', 'UPDATE_SPEC', { price: 999 }, 0); // Attempt price mutation
  assert(sbRes.success === false && sbRes.rolledBack === true, 'Sandbox transaction rolls back when post-write verification detects price mutation');

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const result = runPhase8CTestSuite();
  console.log(`=== PHASE 8-C PRE-WRITE ENFORCEMENT TEST SUITE ===`);
  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  console.log(`Failed: ${result.failedTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }
}
