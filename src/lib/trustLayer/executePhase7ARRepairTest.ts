import { executePhase7ARRepair } from './executePhase7ARRepair';

export function runPhase7ARTest(timestamp: number = Date.now()) {
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/trust_layer_phase7ar_${timestamp}`;
  const jsonPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  const result = executePhase7ARRepair(auditDir, jsonPath);

  console.log('=== PHASE 7-A-R TRUST LAYER FORENSIC REPAIR & FREEZE RESULT ===');
  console.log('Success:', result.success);
  console.log('Trust Layer Contract Frozen:', result.trustLayerContractFrozen, '(expected TRUE)');
  console.log('Vocabulary Drift Count:', result.vocabularyDriftCount, '(expected 0)');
  console.log('Stale Evidence Leak Count:', result.staleEvidenceLeakCount, '(expected 0)');
  console.log('Scope Leakage Count:', result.scopeLeakageCount, '(expected 0)');
  console.log('Wrong Source Verification Count:', result.wrongSourceVerificationCount, '(expected 0)');
  console.log('RoboPengu Unverified Leak Count:', result.roboPenguUnverifiedLeakCount, '(expected 0)');
  console.log('Fabricated History Count:', result.fabricatedHistoryCount, '(expected 0)');
  console.log('Public Metadata Leak Count:', result.publicMetadataLeakCount, '(expected 0)');
  console.log('SmartphonesData Unchanged:', result.smartphonesDataUnchanged, '(expected true)');
  console.log('Total Root Count:', result.totalRootCount, '(expected 905)');
  console.log('Final Variant Count:', result.finalVariantCount, '(expected 654)');
  console.log('Wrote to Catalog:', result.wroteToCatalog, '(expected FALSE)');
  console.log('Audit Directory:', result.auditDir);

  if (!result.success || !result.trustLayerContractFrozen || !result.smartphonesDataUnchanged || result.wroteToCatalog) {
    throw new Error('PHASE_7AR_TEST_FAILED: Trust layer forensic repair & freeze failed');
  }

  return result;
}

if (require.main === module) {
  runPhase7ARTest();
}
