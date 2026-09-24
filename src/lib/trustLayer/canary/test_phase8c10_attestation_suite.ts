import fs from 'node:fs';
import path from 'node:path';
import { executePhase8C10Attestation } from './provenanceAttestationEngine';
import { ControlledRetrievalPipeline } from './pipelineHashEnforcer';

export interface Phase8C10SuiteResult {
  pass: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  testLog: string[];
}

export function runPhase8C10AttestationSuite(): Phase8C10SuiteResult {
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

  // Pre-check catalog unmutated
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';
  const rawCatalogBefore = fs.readFileSync(catalogPath, 'utf-8');
  const catalogBefore: any[] = JSON.parse(rawCatalogBefore);

  // 1. Run Read-Only Attestation Engine
  const attestationReport = executePhase8C10Attestation(catalogPath);

  assert(attestationReport.auditMode === 'READ_ONLY_FORENSIC_ATTESTATION', '1. Audit mode is READ_ONLY_FORENSIC_ATTESTATION');
  assert(attestationReport.attestationVerdicts.SOURCE_URL_ATTESTATION === 'FAIL', '2. SOURCE_URL_ATTESTATION = FAIL (404 page)');
  assert(attestationReport.attestationVerdicts.SOURCE_HTTP_ATTESTATION === 'FAIL', '3. SOURCE_HTTP_ATTESTATION = FAIL (Status 404)');
  assert(attestationReport.attestationVerdicts.HASH_ATTESTATION === 'FAIL', '4. HASH_ATTESTATION = FAIL (Synthetic test hash detected)');
  assert(attestationReport.attestationVerdicts.HASH_REPRODUCIBILITY === 'HASH_REPRODUCIBILITY_FAIL', '5. HASH_REPRODUCIBILITY = HASH_REPRODUCIBILITY_FAIL');
  assert(attestationReport.attestationVerdicts.ATOMIC_CLAIM_ATTESTATION === 'SEMANTIC_MISMATCH', '6. ATOMIC_CLAIM_ATTESTATION = SEMANTIC_MISMATCH (Super AMOLED vs Super AMOLED Plus)');
  assert(attestationReport.attestationVerdicts.NORMALIZATION_ATTESTATION === 'FAIL', '7. NORMALIZATION_ATTESTATION = FAIL (No pre-existing approved rule)');
  assert(attestationReport.attestationVerdicts.TIMESTAMP_ATTESTATION === 'PASS', '8. TIMESTAMP_ATTESTATION = PASS (True UTC verified)');
  assert(attestationReport.attestationVerdicts.AUDIT_ATTESTATION === 'PASS', '9. AUDIT_ATTESTATION = PASS (Audit chain intact)');
  assert(attestationReport.finalVerdict === 'CANARY_01_SECOND_REMEDIATION_REQUIRED', '10. Final Verdict is CANARY_01_SECOND_REMEDIATION_REQUIRED');
  assert(attestationReport.secondRemediationPlanProposal?.action === 'PROPOSAL_ONLY_DO_NOT_EXECUTE', '11. Remediation plan is PROPOSAL ONLY (Not executed)');

  // 2. ControlledRetrievalPipeline Hash Enforcement & Reproducibility Tests
  const ret1 = ControlledRetrievalPipeline.retrieveAndBindProvenance('https://example.com/spec', '<html>Spec Content</html>', 200);
  const ret2 = ControlledRetrievalPipeline.retrieveAndBindProvenance('https://example.com/spec', '<html>Spec Content</html>', 200);

  assert(ret1.valid === true && ret2.valid === true, '12. ControlledRetrievalPipeline succeeds on 2xx content');
  assert(ret1.artifact?.canonicalContentHash === ret2.artifact?.canonicalContentHash, '13. Hash reproducibility verified (Run1 hash === Run2 hash)');
  assert(ControlledRetrievalPipeline.verifyArtifactSignature(ret1.artifact!) === true, '14. Artifact signature valid');

  // Verify synthetic signature forgery fails
  const forgedArtifact = { ...ret1.artifact!, canonicalContentHash: '4f89d3a12b6789e0123456789abcdef0123456789abcdef0123456789abcdef0' };
  assert(ControlledRetrievalPipeline.verifyArtifactSignature(forgedArtifact) === false, '15. Pipeline hash enforcer rejects synthetic/caller-supplied hash forgery');

  // 3. Post-attestation Zero-Mutation Invariant Check
  const rawCatalogAfter = fs.readFileSync(catalogPath, 'utf-8');
  assert(rawCatalogBefore === rawCatalogAfter, '16. Zero production catalog mutations during attestation audit');

  // Save attestation report to audit directory
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/phase8c10_attestation_${Date.now()}`;
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }
  fs.writeFileSync(path.join(auditDir, 'phase8c10_attestation_report.json'), JSON.stringify(attestationReport, null, 2), 'utf-8');

  return {
    pass: failedTests === 0,
    totalTests,
    passedTests,
    failedTests,
    testLog
  };
}

if (require.main === module) {
  const res = runPhase8C10AttestationSuite();
  console.log('=== PHASE 8-C.10 CANARY 01 PROVENANCE ATTESTATION SUITE ===');
  console.log(`Passed: ${res.passedTests} / ${res.totalTests}`);
  for (const log of res.testLog) {
    console.log(log);
  }
}
