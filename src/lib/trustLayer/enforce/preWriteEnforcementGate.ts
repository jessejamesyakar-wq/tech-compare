import crypto from 'node:crypto';
import {
  EnforcementDecisionState,
  ENFORCEMENT_POLICY_VERSION,
  PIPELINE_REVISION,
  HARD_BLOCK_CLASSES,
  ENFORCEMENT_POLICY_RULES
} from './enforcementPolicyV1';
import { AuthorizedWriteManifest, validateCandidateAgainstManifest, AllowedOperationType } from './authorizedWriteManifest';
import { EnforcementCircuitBreaker } from './enforcementCircuitBreaker';
import { CandidateStagingBuffer } from './candidateStagingBuffer';
import { EnforcementObservabilityCollector } from './enforcementObservabilityMetrics';
import { ChainedAuditGenerator, AuditEventPayload } from '../observe/chainedAuditGenerator';
import { GOLDEN_DATASET_V1_IDS } from '../observe/goldenDatasetV1';
import { observeCrossBrandIsolation } from '../observe/crossBrandIsolationObserver';
import { observeIdentityCollisions } from '../observe/identityCollisionObserver';

export interface CandidateWritePayload {
  candidateId: string;
  targetRootId: string;
  operationType: AllowedOperationType;
  factDomain: string;
  proposedFacts: Record<string, any>;
  proposedEvidence?: any[];
  sourceProvenance?: string;
  manifest: AuthorizedWriteManifest;
}

export interface EnforcementDecisionRecord {
  candidateId: string;
  targetRootId: string;
  operationType: AllowedOperationType;
  factDomain: string;
  decisionState: EnforcementDecisionState;
  appliedRuleId: string;
  hardBlock: boolean;
  explanation: string;
  manifestId: string;
  policyVersion: string;
  pipelineRevision: string;
  evaluatedAt: string;
  isGolden: boolean;
}

export class PreWriteEnforcementGate {
  private stagingBuffer: CandidateStagingBuffer;
  private auditChain: ChainedAuditGenerator;

  constructor(stagingBuffer: CandidateStagingBuffer, auditChain: ChainedAuditGenerator) {
    this.stagingBuffer = stagingBuffer;
    this.auditChain = auditChain;
  }

  public evaluateCandidatePreWrite(candidate: CandidateWritePayload): EnforcementDecisionRecord {
    const evaluatedAt = new Date().toISOString();
    const goldenSet = new Set([
      ...GOLDEN_DATASET_V1_IDS.samsung21,
      ...GOLDEN_DATASET_V1_IDS.apple7b,
      ...GOLDEN_DATASET_V1_IDS.apple7c,
      ...GOLDEN_DATASET_V1_IDS.apple7d
    ]);
    const isGolden = goldenSet.has(candidate.targetRootId);

    // 1. Check Circuit Breaker
    if (!EnforcementCircuitBreaker.isOperational()) {
      const decision: EnforcementDecisionRecord = {
        candidateId: candidate.candidateId,
        targetRootId: candidate.targetRootId,
        operationType: candidate.operationType,
        factDomain: candidate.factDomain,
        decisionState: 'BLOCK',
        appliedRuleId: 'ENF_CIRCUIT_BREAKER_OPEN',
        hardBlock: true,
        explanation: `FAIL CLOSED: Trust Control Plane Circuit Breaker is OPEN (${EnforcementCircuitBreaker.getStatus().tripReason}). Writes prohibited.`,
        manifestId: candidate.manifest.manifestId,
        policyVersion: ENFORCEMENT_POLICY_VERSION,
        pipelineRevision: PIPELINE_REVISION,
        evaluatedAt,
        isGolden
      };

      this.recordAndAuditDecision(candidate, decision, { isAuditFailure: true });
      return decision;
    }

    // 2. Check Authorized Write Manifest Scope
    const manifestCheck = validateCandidateAgainstManifest(candidate.manifest, {
      targetRootId: candidate.targetRootId,
      operationType: candidate.operationType,
      factDomain: candidate.factDomain
    });

    if (!manifestCheck.valid) {
      const decision: EnforcementDecisionRecord = {
        candidateId: candidate.candidateId,
        targetRootId: candidate.targetRootId,
        operationType: candidate.operationType,
        factDomain: candidate.factDomain,
        decisionState: 'BLOCK',
        appliedRuleId: 'ENF_WRITE_SCOPE',
        hardBlock: true,
        explanation: `HARD BLOCK [WRITE_OUTSIDE_AUTHORIZED_SCOPE]: ${manifestCheck.violationReason}`,
        manifestId: candidate.manifest.manifestId,
        policyVersion: ENFORCEMENT_POLICY_VERSION,
        pipelineRevision: PIPELINE_REVISION,
        evaluatedAt,
        isGolden
      };

      this.recordAndAuditDecision(candidate, decision, { isScopeViolation: true });
      return decision;
    }

    // 3. Golden Dataset Immutability Firewall
    if (isGolden && candidate.operationType !== 'SYNC_PROJECTION') {
      const decision: EnforcementDecisionRecord = {
        candidateId: candidate.candidateId,
        targetRootId: candidate.targetRootId,
        operationType: candidate.operationType,
        factDomain: candidate.factDomain,
        decisionState: 'BLOCK',
        appliedRuleId: 'ENF_GOLDEN_MUTATION',
        hardBlock: true,
        explanation: `HARD BLOCK [GOLDEN_DATASET_MUTATION_ATTEMPT]: Target ${candidate.targetRootId} is a frozen Golden Dataset V1 root. Unauthorized mutation rejected.`,
        manifestId: candidate.manifest.manifestId,
        policyVersion: ENFORCEMENT_POLICY_VERSION,
        pipelineRevision: PIPELINE_REVISION,
        evaluatedAt,
        isGolden: true
      };

      this.recordAndAuditDecision(candidate, decision, { isGoldenBlock: true });
      return decision;
    }

    // 4. Price Firewall (WRITE_REACHABLE_TO_PRICE = 0)
    const touchesPriceFields =
      candidate.factDomain.includes('price') ||
      candidate.factDomain.includes('offer') ||
      'price' in candidate.proposedFacts ||
      'storeOffers' in candidate.proposedFacts ||
      'priceHistory' in candidate.proposedFacts;

    if (touchesPriceFields) {
      const decision: EnforcementDecisionRecord = {
        candidateId: candidate.candidateId,
        targetRootId: candidate.targetRootId,
        operationType: candidate.operationType,
        factDomain: candidate.factDomain,
        decisionState: 'BLOCK',
        appliedRuleId: 'ENF_PRICE_FIREWALL',
        hardBlock: true,
        explanation: `HARD BLOCK [PRICE_MUTATION_FROM_SPEC_PIPELINE]: Spec ingestion pipeline attempting price mutation is strictly forbidden (WRITE_REACHABLE_TO_PRICE = 0).`,
        manifestId: candidate.manifest.manifestId,
        policyVersion: ENFORCEMENT_POLICY_VERSION,
        pipelineRevision: PIPELINE_REVISION,
        evaluatedAt,
        isGolden
      };

      this.recordAndAuditDecision(candidate, decision, { isPriceFirewallAttempt: true });
      return decision;
    }

    // 5. Cross-Brand Semantic Contamination Check
    const mockProduct = { id: candidate.targetRootId, brand: candidate.proposedFacts.brand || 'Samsung', name: candidate.proposedFacts.name || candidate.targetRootId, specs: candidate.proposedFacts.specs || candidate.proposedFacts };
    const crossBrandRes = observeCrossBrandIsolation([mockProduct]);

    if (crossBrandRes.realViolationsCount > 0) {
      const firstViolation = crossBrandRes.findings[0];
      const decision: EnforcementDecisionRecord = {
        candidateId: candidate.candidateId,
        targetRootId: candidate.targetRootId,
        operationType: candidate.operationType,
        factDomain: candidate.factDomain,
        decisionState: 'BLOCK',
        appliedRuleId: 'ENF_CROSS_BRAND_REF',
        hardBlock: true,
        explanation: `HARD BLOCK [${firstViolation.classification}]: ${firstViolation.description}`,
        manifestId: candidate.manifest.manifestId,
        policyVersion: ENFORCEMENT_POLICY_VERSION,
        pipelineRevision: PIPELINE_REVISION,
        evaluatedAt,
        isGolden
      };

      this.recordAndAuditDecision(candidate, decision);
      return decision;
    }

    // 6. Identity Collision Check
    const identityRes = observeIdentityCollisions([mockProduct]);
    if (identityRes.realCollisionsCount > 0) {
      const decision: EnforcementDecisionRecord = {
        candidateId: candidate.candidateId,
        targetRootId: candidate.targetRootId,
        operationType: candidate.operationType,
        factDomain: candidate.factDomain,
        decisionState: 'BLOCK',
        appliedRuleId: 'ENF_IDENTITY_COLLISION',
        hardBlock: true,
        explanation: `HARD BLOCK [VERIFIED_IDENTITY_COLLISION]: Candidate triggers identity collision.`,
        manifestId: candidate.manifest.manifestId,
        policyVersion: ENFORCEMENT_POLICY_VERSION,
        pipelineRevision: PIPELINE_REVISION,
        evaluatedAt,
        isGolden
      };

      this.recordAndAuditDecision(candidate, decision);
      return decision;
    }

    // Default: ALLOW or ALLOW_WITH_WARNING
    const decision: EnforcementDecisionRecord = {
      candidateId: candidate.candidateId,
      targetRootId: candidate.targetRootId,
      operationType: candidate.operationType,
      factDomain: candidate.factDomain,
      decisionState: 'ALLOW',
      appliedRuleId: 'ENF_ALLOW_DEFAULT',
      hardBlock: false,
      explanation: `ALLOW: Candidate passed all pre-write security, manifest, and trust firewalls cleanly.`,
      manifestId: candidate.manifest.manifestId,
      policyVersion: ENFORCEMENT_POLICY_VERSION,
      pipelineRevision: PIPELINE_REVISION,
      evaluatedAt,
      isGolden
    };

    this.recordAndAuditDecision(candidate, decision);
    return decision;
  }

  private recordAndAuditDecision(
    candidate: CandidateWritePayload,
    decision: EnforcementDecisionRecord,
    options?: {
      isGoldenBlock?: boolean;
      isScopeViolation?: boolean;
      isPriceFirewallAttempt?: boolean;
      isAuditFailure?: boolean;
    }
  ): void {
    EnforcementObservabilityCollector.recordCandidateEvaluation(decision.decisionState, decision.appliedRuleId, options);

    if (decision.decisionState === 'BLOCK' || decision.decisionState === 'REQUIRE_REVIEW') {
      this.stagingBuffer.stageCandidate({
        candidateId: candidate.candidateId,
        targetRootId: candidate.targetRootId,
        operationType: candidate.operationType,
        proposedFacts: candidate.proposedFacts,
        proposedEvidence: candidate.proposedEvidence || [],
        sourceProvenance: candidate.sourceProvenance || 'pre_write_gate',
        policyDecisionState: decision.decisionState,
        blockingRuleIds: [decision.appliedRuleId],
        reviewRequirements: [decision.explanation],
        createdAt: decision.evaluatedAt,
        policyVersion: decision.policyVersion,
        pipelineRevision: decision.pipelineRevision
      });
      EnforcementObservabilityCollector.recordStagedCandidate();
    }

    this.auditChain.appendEvent(`ENFORCEMENT_${decision.decisionState}`, {
      entityId: candidate.targetRootId,
      fieldDomain: candidate.factDomain,
      summary: `Pre-write gate evaluated ${candidate.candidateId}: Decision=${decision.decisionState} (${decision.appliedRuleId})`
    });
  }
}
