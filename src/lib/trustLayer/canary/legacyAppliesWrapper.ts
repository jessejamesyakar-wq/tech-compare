import { PreWriteEnforcementGate, CandidateWritePayload } from '../enforce/preWriteEnforcementGate';
import { AuthorizedWriteManifest, createAuthorizedWriteManifest } from '../enforce/authorizedWriteManifest';
import { CandidateStagingBuffer } from '../enforce/candidateStagingBuffer';
import { ChainedAuditGenerator } from '../observe/chainedAuditGenerator';
import { AuthorizedWriter, AuthorizationProof } from './authorizedWriter';
import crypto from 'node:crypto';
import { ENFORCEMENT_POLICY_VERSION } from '../enforce/enforcementPolicyV1';

export interface LegacyApplyExecutionResult {
  batchId: string;
  totalCandidatesEvaluated: number;
  allowedCount: number;
  blockedCount: number;
  productionWritesAttempted: 0;
  status: 'GATE_ENFORCED_SUCCESS' | 'GATE_ENFORCED_BLOCK' | 'FAIL_CLOSED_EXCEPTION';
  reason: string;
}

export function executeLegacyApplyBatchProtected(
  targetRoots: string[],
  candidates: { candidateId: string; targetRootId: string; proposedFacts: Record<string, any> }[],
  manifestOverride?: AuthorizedWriteManifest
): LegacyApplyExecutionResult {
  const batchId = `batch_${Date.now()}`;
  let allowedCount = 0;
  let blockedCount = 0;

  const staging = new CandidateStagingBuffer();
  const audit = new ChainedAuditGenerator();
  const gate = new PreWriteEnforcementGate(staging, audit);

  // Require Authorized Write Manifest
  const manifest = manifestOverride || createAuthorizedWriteManifest(
    targetRoots,
    ['UPDATE_SPEC'],
    ['spec.display', 'spec.chipset', '*']
  );

  try {
    for (const cand of candidates) {
      const payload: CandidateWritePayload = {
        candidateId: cand.candidateId,
        targetRootId: cand.targetRootId,
        operationType: 'UPDATE_SPEC',
        factDomain: 'spec.chipset',
        proposedFacts: cand.proposedFacts,
        manifest
      };

      // Evaluate pre-write gate
      const decision = gate.evaluateCandidatePreWrite(payload);

      if (decision.decisionState === 'ALLOW' || decision.decisionState === 'ALLOW_WITH_WARNING') {
        const payloadHash = crypto.createHash('sha256').update(JSON.stringify(cand.proposedFacts)).digest('hex');
        const policyHash = crypto.createHash('sha256').update(ENFORCEMENT_POLICY_VERSION).digest('hex');

        const proof: AuthorizationProof = {
          candidateId: cand.candidateId,
          manifestId: manifest.manifestId,
          gateDecisionId: decision.appliedRuleId,
          policyVersion: ENFORCEMENT_POLICY_VERSION,
          policyHash,
          decision: decision.decisionState,
          auditEventId: `evt_${cand.candidateId}`,
          candidatePayloadHash: payloadHash
        };

        const writerRes = AuthorizedWriter.executeAuthorizedWrite(proof, cand.proposedFacts, true);
        if (writerRes.authorized) {
          allowedCount++;
        } else {
          blockedCount++;
        }
      } else {
        blockedCount++;
      }
    }

    return {
      batchId,
      totalCandidatesEvaluated: candidates.length,
      allowedCount,
      blockedCount,
      productionWritesAttempted: 0,
      status: blockedCount === 0 ? 'GATE_ENFORCED_SUCCESS' : 'GATE_ENFORCED_BLOCK',
      reason: `Legacy apply batch executed under Trust Control Plane pre-write gate. Allowed: ${allowedCount}, Blocked: ${blockedCount}.`
    };

  } catch (err: any) {
    // FAIL CLOSED on any exception
    return {
      batchId,
      totalCandidatesEvaluated: candidates.length,
      allowedCount: 0,
      blockedCount: candidates.length,
      productionWritesAttempted: 0,
      status: 'FAIL_CLOSED_EXCEPTION',
      reason: `FAIL CLOSED: Exception in legacy apply gate wrapper (${err.message}). Zero production writes executed.`
    };
  }
}
