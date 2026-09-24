import { runPhase8C8ProvenanceAudit } from './test_phase8c8_provenance_audit';

export function runPhase8C8AuditRunner() {
  console.log('--- EXECUTING PHASE 8-C.8 FORENSIC AUDIT ---');
  const report = runPhase8C8ProvenanceAudit();

  console.log('\n=== FORENSIC AUDIT SUMMARY ===');
  console.log('Stored Content Hash:', report.hashInvestigation.stored_hash, '(SHA-256 of empty byte sequence)');
  console.log('Computed Content Hash:', report.hashInvestigation.computed_hash, '(SHA-256 of real HTTP response)');
  console.log('Hash Match Status:', report.hashInvestigation.match_status);
  console.log('Timestamp Classification:', report.timestampInvestigation.classification);
  console.log('Composite Fact Assessment:', report.compositeFactDecomposition.architecture_assessment);
  console.log('Control Plane Enforcement:', report.controlPlaneVsProvenanceSeparation.CONTROL_PLANE_ENFORCEMENT);
  console.log('Provenance Payload:', report.controlPlaneVsProvenanceSeparation.PROVENANCE_PAYLOAD);
  console.log('VERDICT:', report.verdict);

  return report;
}

if (require.main === module) {
  runPhase8C8AuditRunner();
}
