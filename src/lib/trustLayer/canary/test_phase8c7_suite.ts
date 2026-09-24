import crypto from 'node:crypto';
import { runPhase8CTestSuite } from '../enforce/test_phase8c_suite';
import { auditRepositoryWritePaths } from './writePathInventoryAuditor';
import { AuthorizedWriter, AuthorizationProof } from './authorizedWriter';
import { executeLegacyApplyBatchProtected } from './legacyAppliesWrapper';
import { executeCanaryDryRun } from './canaryDryRunner';
import { EnforcementCircuitBreaker } from '../enforce/enforcementCircuitBreaker';
import { createAuthorizedWriteManifest } from '../enforce/authorizedWriteManifest';
import { PreWriteEnforcementGate } from '../enforce/preWriteEnforcementGate';
import { CandidateStagingBuffer } from '../enforce/candidateStagingBuffer';
import { ChainedAuditGenerator } from '../observe/chainedAuditGenerator';
import { EnforcementTransactionSandbox } from '../enforce/enforcementTransactionSandbox';
import { ENFORCEMENT_POLICY_VERSION } from '../enforce/enforcementPolicyV1';

export interface ScenarioResult {
  scenarioId: string;
  scenarioName: string;
  expectedDecision: string;
  actualDecision: string;
  appliedRuleId: string;
  pass: boolean;
}

export function runPhase8C7TestSuite(): { pass: boolean; totalTests: number; passedTests: number; failedTests: number; scenarioMatrix: ScenarioResult[]; testLog: string[] } {
  const testLog: string[] = [];
  const scenarioMatrix: ScenarioResult[] = [];
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

  function recordScenario(id: string, name: string, expected: string, actual: string, ruleId: string) {
    const pass = expected === actual;
    scenarioMatrix.push({ scenarioId: id, scenarioName: name, expectedDecision: expected, actualDecision: actual, appliedRuleId: ruleId, pass });
    assert(pass, `Scenario [${id}]: ${name} -> ${actual} (expected ${expected})`);
  }

  // 1. Run all prior Phase 8-A, 8-A.2, 8-B, 8-C tests!
  const phase8cRes = runPhase8CTestSuite();
  assert(phase8cRes.pass === true, 'All Phase 8-C tests continue to pass');

  // 2. Repository Inventory Assertion (BYPASS_RISK = 0, UNKNOWN = 0)
  const inventory = auditRepositoryWritePaths();
  assert(inventory.bypassRiskCount === 0 && inventory.unknownCount === 0, 'Repository write-path inventory has 0 bypass risks and 0 unknown paths');

  // 3. Canary Dry Run Simulation (CANARY_DRY_RUN_PASS)
  const dryRunRes = executeCanaryDryRun();
  assert(dryRunRes.status === 'CANARY_DRY_RUN_PASS', 'End-to-end Canary dry run returns CANARY_DRY_RUN_PASS');

  // 4. Attack Vector A: Direct invocation of legacy applies without manifest -> GATE_ENFORCED_BLOCK
  const legacyNoManifestRes = executeLegacyApplyBatchProtected(['unauthorized-root'], [{ candidateId: 'c1', targetRootId: 'unauthorized-root', proposedFacts: {} }], {
    manifestId: 'invalid_man',
    authorizedTargetRoots: [],
    allowedOperationTypes: [],
    allowedFactDomains: [],
    expectedRootCountDelta: 0,
    policyVersion: ENFORCEMENT_POLICY_VERSION,
    pipelineRevision: '37489e4a',
    createdAt: new Date().toISOString(),
    expiry: new Date(Date.now() - 10000).toISOString(), // Expired manifest
    manifestHash: 'invalid'
  });
  recordScenario('SCEN_22_LEGACY_BYPASS', 'Legacy apply invocation without valid manifest', 'GATE_ENFORCED_BLOCK', legacyNoManifestRes.status, 'ENF_WRITE_SCOPE');

  // 5. Attack Vector D: TOCTOU Mutation Attack (payload modified after gate approval)
  const policyHash = crypto.createHash('sha256').update(ENFORCEMENT_POLICY_VERSION).digest('hex');
  const gatePayload = { display: 'OLED' };
  const gatePayloadHash = crypto.createHash('sha256').update(JSON.stringify(gatePayload)).digest('hex');

  const proof: AuthorizationProof = {
    candidateId: 'cand_toctou',
    manifestId: 'man_123',
    gateDecisionId: 'ENF_ALLOW_DEFAULT',
    policyVersion: ENFORCEMENT_POLICY_VERSION,
    policyHash,
    decision: 'ALLOW',
    auditEventId: 'evt_toctou',
    candidatePayloadHash: gatePayloadHash
  };

  const modifiedPayload = { display: 'OLED', maliciousSpec: 'unauthorized' }; // Modified after gate!
  const writerToctouRes = AuthorizedWriter.executeAuthorizedWrite(proof, modifiedPayload, true);
  assert(writerToctouRes.authorized === false && writerToctouRes.reason.includes('TOCTOU_PAYLOAD_MISMATCH'), 'TOCTOU payload mismatch attack is blocked by AuthorizedWriter');

  // 6. Attack Vector F: Policy Hash Mismatch
  const forgedProof: AuthorizationProof = { ...proof, policyHash: 'forged_policy_hash_123' };
  const writerPolicyRes = AuthorizedWriter.executeAuthorizedWrite(forgedProof, gatePayload, true);
  assert(writerPolicyRes.authorized === false && writerPolicyRes.reason.includes('POLICY_PINNING_MISMATCH'), 'Policy hash mismatch attack is blocked by AuthorizedWriter');

  // 7. Attack Vector G: Circuit Breaker Open -> BLOCK
  EnforcementCircuitBreaker.tripCircuit('CONTROL_PLANE_INTERNAL_ERROR', 'Test circuit trip');
  const writerCircuitRes = AuthorizedWriter.executeAuthorizedWrite(proof, gatePayload, true);
  assert(writerCircuitRes.authorized === false && writerCircuitRes.reason.includes('CIRCUIT_BREAKER_OPEN'), 'Circuit Breaker OPEN blocks AuthorizedWriter');
  EnforcementCircuitBreaker.resetCircuit();

  // 8. Scenario Matrix Coverage: Valid existing root update -> ALLOW
  const staging = new CandidateStagingBuffer();
  const audit = new ChainedAuditGenerator();
  const gate = new PreWriteEnforcementGate(staging, audit);
  const manifest = createAuthorizedWriteManifest(['samsung-samsung-galaxy-a57-5g'], ['UPDATE_SPEC'], ['*']);

  const decValid = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_scen_1',
    targetRootId: 'samsung-samsung-galaxy-a57-5g',
    operationType: 'UPDATE_SPEC',
    factDomain: 'spec.display',
    proposedFacts: { display: 'AMOLED 120Hz' },
    manifest
  });
  recordScenario('SCEN_01_VALID_UPDATE', 'Valid existing-root spec update', 'ALLOW', decValid.decisionState, decValid.appliedRuleId);

  // 9. Scenario Matrix Coverage: Unauthorized new root -> BLOCK
  const decUnauthRoot = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_scen_3',
    targetRootId: 'unauthorized-root-x',
    operationType: 'CREATE_ROOT',
    factDomain: 'identity.root',
    proposedFacts: { name: 'Unauthorized Root' },
    manifest
  });
  recordScenario('SCEN_03_UNAUTH_ROOT', 'Unauthorized new root creation', 'BLOCK', decUnauthRoot.decisionState, decUnauthRoot.appliedRuleId);

  // 10. Scenario Matrix Coverage: Golden mutation attempt -> BLOCK
  const decGolden = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_scen_8',
    targetRootId: 'samsung-galaxy-s25',
    operationType: 'UPDATE_SPEC',
    factDomain: 'spec.chipset',
    proposedFacts: { processor: 'Mutated Golden' },
    manifest: createAuthorizedWriteManifest(['samsung-galaxy-s25'], ['UPDATE_SPEC'], ['*'])
  });
  recordScenario('SCEN_08_GOLDEN_MUTATION', 'Golden Dataset root mutation attempt', 'BLOCK', decGolden.decisionState, decGolden.appliedRuleId);

  // 11. Scenario Matrix Coverage: Price mutation from spec pipeline -> BLOCK
  const decPrice = gate.evaluateCandidatePreWrite({
    candidateId: 'cand_scen_10',
    targetRootId: 'samsung-samsung-galaxy-a57-5g',
    operationType: 'UPDATE_SPEC',
    factDomain: 'offer.price',
    proposedFacts: { price: 19999 },
    manifest
  });
  recordScenario('SCEN_10_PRICE_FIREWALL', 'Price mutation attempt from spec pipeline', 'BLOCK', decPrice.decisionState, decPrice.appliedRuleId);

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    scenarioMatrix,
    testLog
  };
}

if (require.main === module) {
  const result = runPhase8C7TestSuite();
  console.log(`=== PHASE 8-C.7 CANARY READINESS TEST SUITE ===`);
  console.log(`Passed: ${result.passedTests} / ${result.totalTests}`);
  console.log(`Failed: ${result.failedTests}`);
  for (const log of result.testLog) {
    console.log(log);
  }
}
