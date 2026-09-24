import crypto from 'node:crypto';
import { ENFORCEMENT_POLICY_VERSION, PIPELINE_REVISION } from './enforcementPolicyV1';

export type AllowedOperationType = 'CREATE_ROOT' | 'UPDATE_SPEC' | 'ADD_EVIDENCE' | 'ADD_EVIDENCE_ONLY' | 'SYNC_PROJECTION';

export interface AuthorizedWriteManifest {
  manifestId: string;
  authorizedTargetRoots: string[];
  allowedOperationTypes: AllowedOperationType[];
  allowedFactDomains: string[];
  expectedRootCountDelta: number;
  policyVersion: string;
  pipelineRevision: string;
  createdAt: string;
  expiry: string;
  manifestHash: string;
}

export function createAuthorizedWriteManifest(
  targetRoots: string[],
  operationTypes: AllowedOperationType[],
  factDomains: string[],
  expectedRootCountDelta: number = 0,
  ttlMinutes: number = 60
): AuthorizedWriteManifest {
  const createdAt = new Date().toISOString();
  const expiry = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  const manifestId = `man_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

  const manifestData = {
    manifestId,
    authorizedTargetRoots: targetRoots,
    allowedOperationTypes: operationTypes,
    allowedFactDomains: factDomains,
    expectedRootCountDelta,
    policyVersion: ENFORCEMENT_POLICY_VERSION,
    pipelineRevision: PIPELINE_REVISION,
    createdAt,
    expiry
  };

  const manifestHash = crypto.createHash('sha256').update(JSON.stringify(manifestData)).digest('hex');

  return {
    ...manifestData,
    manifestHash
  };
}

export function validateCandidateAgainstManifest(
  manifest: AuthorizedWriteManifest,
  candidate: {
    targetRootId: string;
    operationType: AllowedOperationType;
    factDomain: string;
  }
): { valid: boolean; violationReason?: string } {
  // Check target root authorization
  if (!manifest.authorizedTargetRoots.includes(candidate.targetRootId)) {
    return {
      valid: false,
      violationReason: `Target root ${candidate.targetRootId} is not in authorized target set [${manifest.authorizedTargetRoots.join(', ')}]`
    };
  }

  // Check operation type authorization
  if (!manifest.allowedOperationTypes.includes(candidate.operationType)) {
    return {
      valid: false,
      violationReason: `Operation ${candidate.operationType} is not authorized by write manifest`
    };
  }

  // Check fact domain authorization
  if (!manifest.allowedFactDomains.includes(candidate.factDomain) && !manifest.allowedFactDomains.includes('*')) {
    return {
      valid: false,
      violationReason: `Fact domain ${candidate.factDomain} is not authorized by write manifest`
    };
  }

  // Check manifest expiry
  if (new Date().getTime() > new Date(manifest.expiry).getTime()) {
    return {
      valid: false,
      violationReason: `Authorized write manifest ${manifest.manifestId} has expired`
    };
  }

  return { valid: true };
}
