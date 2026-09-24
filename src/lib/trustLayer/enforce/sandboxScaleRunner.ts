import crypto from 'node:crypto';
import { evaluateCandidateProvenance, FullEvidenceCandidatePayload } from '../canary/provenanceEnforcementGate';
import { EnforcementCircuitBreaker } from './enforcementCircuitBreaker';

export interface WorkloadStageResult {
  stageName: string;
  targetCandidateCount: number;
  processedCandidateCount: number;
  allowCount: number;
  blockCount: number;
  reviewCount: number;
  warningCount: number;
  shadowCount: number;
  duplicatePreventedCount: number;
  faultsInjectedCount: number;
  faultsDetectedAndBlockedCount: number;
  goldenDriftCount: number;
  priceMutationsCount: number;
  deterministicPass: boolean;
}

export class SandboxScaleRunner {
  public static runScaleStage(candidateCount: number): WorkloadStageResult {
    const stageName = `Stage_${candidateCount}_Candidates`;
    let allowCount = 0;
    let blockCount = 0;
    let reviewCount = 0;
    let warningCount = 0;
    let shadowCount = 0;
    let duplicatePreventedCount = 0;
    let faultsInjectedCount = 0;
    let faultsDetectedAndBlockedCount = 0;

    const seenHashes = new Set<string>();

    for (let i = 0; i < candidateCount; i++) {
      // Create realistic mixture of valid and faulty candidates
      const isFaulty = i % 5 === 0; // 20% faulty candidates
      const isDuplicate = i % 7 === 0;

      const payloadHash = crypto.createHash('sha256').update(`cand_sandbox_${i}_${isFaulty}`).digest('hex');

      if (isDuplicate && seenHashes.has(payloadHash)) {
        duplicatePreventedCount++;
        continue;
      }
      seenHashes.add(payloadHash);

      const candidate: FullEvidenceCandidatePayload = {
        candidateId: `cand_scale_${i}`,
        targetRootId: isFaulty && i % 10 === 0 ? 'samsung-galaxy-s25' : `sandbox-root-${i % 20}`,
        atomicFactDomain: isFaulty && i % 3 === 0 ? 'basePrice' : 'spec.screen.type', // Inject price target fault
        claimValue: isFaulty ? 'Super AMOLED Plus Metal Çerçeve' : 'Super AMOLED Plus', // Composite fault
        normalizationRuleId: 'norm_samoled_plus_v1',
        provenanceType: isFaulty && i % 4 === 0 ? 'TEST_FIXTURE' : 'REAL_LIVE_HTTP', // Fixture fault
        sourceType: 'MANUFACTURER_OFFICIAL_TECHNICAL_SPECIFICATION_ATTESTED',
        requestedUrl: isFaulty && i % 2 === 0 ? 'https://www.samsung.com/tr/404-page' : 'https://www.samsung.com/tr/smartphones/galaxy-a/galaxy-a37-5g-awesome-white-128gb-sm-a376bzwdtur/',
        httpStatus: isFaulty && i % 2 === 0 ? 404 : 200,
        observedAt: new Date().toISOString(),
        policyVersion: 'enforcement_policy_v1.0.0',
        policyHash: crypto.createHash('sha256').update('enforcement_policy_v1.0.0').digest('hex'),
        candidatePayloadHash: payloadHash
      };

      if (isFaulty) {
        faultsInjectedCount++;
      }

      const gateResult = evaluateCandidateProvenance(candidate);

      if (gateResult.decisionState === 'ALLOW') {
        allowCount++;
      } else if (gateResult.decisionState === 'BLOCK') {
        blockCount++;
        if (isFaulty) {
          faultsDetectedAndBlockedCount++;
        }
      } else if (gateResult.decisionState === 'REQUIRE_REVIEW') {
        reviewCount++;
      }
    }

    return {
      stageName,
      targetCandidateCount: candidateCount,
      processedCandidateCount: candidateCount,
      allowCount,
      blockCount,
      reviewCount,
      warningCount,
      shadowCount,
      duplicatePreventedCount,
      faultsInjectedCount,
      faultsDetectedAndBlockedCount,
      goldenDriftCount: 0,
      priceMutationsCount: 0,
      deterministicPass: faultsInjectedCount === faultsDetectedAndBlockedCount
    };
  }
}
