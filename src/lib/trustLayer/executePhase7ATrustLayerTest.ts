import { executePhase7ATrustLayer } from './executePhase7ATrustLayer';

export function runPhase7ATest(timestamp: number = Date.now()) {
  const auditDir = `C:/Users/Alpdeniz/AceleEtme_Audits/trust_layer_phase7a_${timestamp}`;
  const jsonPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';

  const result = executePhase7ATrustLayer(auditDir, jsonPath);

  console.log('=== PHASE 7-A TRUST LAYER + PROVENANCE ARCHITECTURE RESULT ===');
  console.log('Success:', result.success);
  console.log('Trust Profile Generated:', result.trustProfileGenerated, '(expected true)');
  console.log('RoboPengu API Ready:', result.roboPenguApiReady, '(expected true)');
  console.log('Smart Compare Ready:', result.smartCompareReady, '(expected true)');
  console.log('Price Intelligence Ready:', result.priceIntelligenceReady, '(expected true)');
  console.log('SmartphonesData Unchanged:', result.smartphonesDataUnchanged, '(expected true)');
  console.log('Total Root Count:', result.totalRootCount, '(expected 905)');
  console.log('Final Variant Count:', result.finalVariantCount, '(expected 654)');
  console.log('Wrote to Catalog:', result.wroteToCatalog, '(expected FALSE)');
  console.log('Audit Directory:', result.auditDir);

  if (!result.success || !result.smartphonesDataUnchanged || result.wroteToCatalog || !result.trustProfileGenerated) {
    throw new Error('PHASE_7A_TEST_FAILED: Trust layer prototype test failed');
  }

  return result;
}

if (require.main === module) {
  runPhase7ATest();
}
