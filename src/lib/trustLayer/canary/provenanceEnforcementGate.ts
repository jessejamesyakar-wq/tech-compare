import { validateHttpSourceContent, HttpSourceValidationResult } from './httpSourceValidator';
import { validateEvidenceTimestamps, TimestampValidationResult } from './timestampValidator';
import { validateAtomicClaim, AtomicClaimValidationResult } from './atomicFactValidator';

export interface FullEvidenceCandidatePayload {
  candidateId: string;
  targetRootId: string;
  atomicFactDomain: string;
  claimValue: string;
  normalizationRuleId?: string;
  provenanceType?: 'REAL_LIVE_HTTP' | 'TEST_FIXTURE';
  sourceType: string;
  requestedUrl: string;
  finalUrl?: string;
  canonicalUrl?: string;
  httpStatus?: number;
  contentType?: string;
  rawBodyLength?: number;
  canonicalContentLength?: number;
  canonicalizationVersion?: string;
  rawContentHash?: string;
  canonicalContentHash?: string;
  observedAt: string;
  retrievedAt?: string;
  policyVersion: string;
  policyHash: string;
  candidatePayloadHash: string;
  contentOverride?: string; // For testing/fixtures
}

export interface ProvenanceGateEvaluationResult {
  decisionState: 'ALLOW' | 'BLOCK' | 'REQUIRE_REVIEW';
  appliedRuleId: string;
  explanation: string;
  httpValidation: HttpSourceValidationResult;
  timestampValidation: TimestampValidationResult;
  atomicValidation: AtomicClaimValidationResult;
}

export function evaluateCandidateProvenance(
  candidate: FullEvidenceCandidatePayload,
  trustedExecutionInstant: Date = new Date()
): ProvenanceGateEvaluationResult {
  // 0. Structural Synthetic Fixture Guard (Test Fixtures forbidden for Production Write)
  if (candidate.provenanceType === 'TEST_FIXTURE' || candidate.contentOverride) {
    return {
      decisionState: 'BLOCK',
      appliedRuleId: 'ENF_PROVENANCE_SYNTHETIC_FIXTURE_FORBIDDEN',
      explanation: 'PROVENANCE HARD BLOCK: Test fixtures and contentOverride synthetic paths are structurally forbidden for production persistence.',
      httpValidation: {
        valid: false,
        requestedUrl: candidate.requestedUrl,
        finalUrl: candidate.requestedUrl,
        redirectChain: [candidate.requestedUrl],
        httpStatus: candidate.httpStatus || 200,
        contentType: 'text/html',
        rawBodyLength: 0,
        canonicalContentLength: 0,
        hashInputLength: 0,
        canonicalizationVersion: 'v1.0.0',
        rawContentHash: '',
        canonicalContentHash: '',
        errorCode: 'SYNTHETIC_FIXTURE_PROVENANCE',
        errorMessage: 'Test fixtures and contentOverride synthetic paths are structurally forbidden for production persistence.'
      },
      timestampValidation: {
        valid: false,
        observedAt: candidate.observedAt,
        retrievedAt: candidate.retrievedAt || candidate.observedAt,
        trustedExecutionTime: trustedExecutionInstant.toISOString(),
        formattedUtc: '',
        formattedLocalOffset: '',
        clockSkewSeconds: 0
      },
      atomicValidation: {
        valid: false,
        atomicFactDomain: candidate.atomicFactDomain,
        claimValue: candidate.claimValue,
        compatible: false,
        unsupportedComponentsFound: [],
        normalizationApplied: false
      }
    };
  }
  // 1. Validate HTTP Source Content
  const httpVal = validateHttpSourceContent({
    requestedUrl: candidate.requestedUrl,
    contentOverride: candidate.contentOverride,
    httpStatusOverride: candidate.httpStatus,
    rawBodyLength: candidate.rawBodyLength,
    rawContentHash: candidate.rawContentHash,
    canonicalContentHash: candidate.canonicalContentHash
  });

  if (!httpVal.valid) {
    return {
      decisionState: 'BLOCK',
      appliedRuleId: `ENF_PROVENANCE_HTTP_${httpVal.errorCode || 'FAIL'}`,
      explanation: `PROVENANCE HARD BLOCK: ${httpVal.errorMessage}`,
      httpValidation: httpVal,
      timestampValidation: {
        valid: false,
        observedAt: candidate.observedAt,
        retrievedAt: candidate.retrievedAt || candidate.observedAt,
        trustedExecutionTime: trustedExecutionInstant.toISOString(),
        formattedUtc: '',
        formattedLocalOffset: '',
        clockSkewSeconds: 0
      },
      atomicValidation: {
        valid: false,
        atomicFactDomain: candidate.atomicFactDomain,
        claimValue: candidate.claimValue,
        compatible: false,
        unsupportedComponentsFound: [],
        normalizationApplied: false
      }
    };
  }

  // 2. Validate Evidence Timestamps
  const tsVal = validateEvidenceTimestamps(
    candidate.observedAt,
    candidate.retrievedAt || candidate.observedAt,
    trustedExecutionInstant
  );

  if (!tsVal.valid) {
    return {
      decisionState: 'BLOCK',
      appliedRuleId: `ENF_PROVENANCE_TIMESTAMP_${tsVal.errorCode || 'FAIL'}`,
      explanation: `PROVENANCE HARD BLOCK: ${tsVal.errorMessage}`,
      httpValidation: httpVal,
      timestampValidation: tsVal,
      atomicValidation: {
        valid: false,
        atomicFactDomain: candidate.atomicFactDomain,
        claimValue: candidate.claimValue,
        compatible: false,
        unsupportedComponentsFound: [],
        normalizationApplied: false
      }
    };
  }

  // 3. Validate Atomic Claim Domain & Compatibility
  const atomVal = validateAtomicClaim({
    atomicFactDomain: candidate.atomicFactDomain,
    claimValue: candidate.claimValue,
    normalizationRuleId: candidate.normalizationRuleId
  });

  if (!atomVal.valid) {
    return {
      decisionState: 'BLOCK',
      appliedRuleId: `ENF_PROVENANCE_ATOMIC_${atomVal.errorCode || 'FAIL'}`,
      explanation: `PROVENANCE HARD BLOCK: ${atomVal.errorMessage}`,
      httpValidation: httpVal,
      timestampValidation: tsVal,
      atomicValidation: atomVal
    };
  }

  return {
    decisionState: 'ALLOW',
    appliedRuleId: 'ENF_PROVENANCE_ALLOW',
    explanation: 'PROVENANCE CLEAN: Candidate passed all HTTP, cryptographic hash, timestamp, and atomic claim checks cleanly.',
    httpValidation: httpVal,
    timestampValidation: tsVal,
    atomicValidation: atomVal
  };
}
