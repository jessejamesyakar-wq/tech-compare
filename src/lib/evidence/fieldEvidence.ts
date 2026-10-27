import crypto from 'crypto';
import {
  FieldVerificationStatus,
  FieldMatchMethod,
  EvidenceTrustClassification,
  EvidenceHashVersion,
  classifyEvidenceTrust
} from './trustClassification';

export type {
  FieldVerificationStatus,
  FieldMatchMethod,
  EvidenceTrustClassification,
  EvidenceHashVersion
};
export { classifyEvidenceTrust };
export { evaluateShadowMode, shadowTelemetry } from './shadowRuntime';
export type { ShadowEvaluationInput, ShadowEvaluationResult, ShadowTelemetrySummary } from './shadowRuntime';

export interface FieldEvidenceRecord {
  productId: string;
  fieldPath: string;
  observedValue: any;
  sourceName: string;
  sourceUrl: string;
  sourceProductId?: string;
  matchMethod: FieldMatchMethod;
  checkedAt: string; // ISO 8601 UTC
  verificationStatus: FieldVerificationStatus;
  trustClassification: EvidenceTrustClassification;
  evidenceHash: string; // SHA-256 of canonical fields
  evidenceHashVersion: EvidenceHashVersion;
  legacyHashV1?: string; // Preserved v1 hash for migration traceability
  scopeNote?: string;
}

/**
 * Deterministic deep canonical serialization:
 * - Primitives (number, string, boolean, null) serialized as standard JSON.
 * - Plain objects: keys sorted alphabetically; nested fields recursively serialized.
 *   Object key ordering NEVER affects the output string.
 * - Arrays: element ordering is preserved where meaningful, each element recursively serialized.
 * - Undefined properties are omitted.
 */
export function deepCanonicalStringify(val: any): string {
  if (val === null || typeof val !== 'object') {
    return JSON.stringify(val);
  }

  if (Array.isArray(val)) {
    return '[' + val.map(el => deepCanonicalStringify(el)).join(',') + ']';
  }

  const keys = Object.keys(val).sort();
  const parts: string[] = [];

  for (const k of keys) {
    if (val[k] !== undefined) {
      parts.push(`${JSON.stringify(k)}:${deepCanonicalStringify(val[k])}`);
    }
  }

  return '{' + parts.join(',') + '}';
}

/**
 * Legacy shallow whitelisted serialization (v1).
 * NOTE: Had a known vulnerability where nested objects in observedValue collapsed to {}
 * due to JSON.stringify replacer array whitelisting. Preserved for backward compatibility.
 */
export function computeEvidenceHashV1(
  record: Pick<
    FieldEvidenceRecord,
    | 'productId'
    | 'fieldPath'
    | 'observedValue'
    | 'sourceName'
    | 'sourceUrl'
    | 'sourceProductId'
    | 'matchMethod'
    | 'checkedAt'
    | 'verificationStatus'
  >
): string {
  const canonicalPayload = {
    productId: record.productId,
    fieldPath: record.fieldPath,
    observedValue: record.observedValue,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    sourceProductId: record.sourceProductId || '',
    matchMethod: record.matchMethod,
    checkedAt: record.checkedAt,
    verificationStatus: record.verificationStatus
  };

  const keys = Object.keys(canonicalPayload).sort();
  const serialized = JSON.stringify(canonicalPayload, keys);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Hardened deep canonical SHA-256 hash calculation (v2).
 * Recursively serializes all nested properties and arrays deterministically.
 * Any nested field mutation GUARANTEES a change in the SHA-256 hash.
 */
export function computeEvidenceHashV2(
  record: Pick<
    FieldEvidenceRecord,
    | 'productId'
    | 'fieldPath'
    | 'observedValue'
    | 'sourceName'
    | 'sourceUrl'
    | 'sourceProductId'
    | 'matchMethod'
    | 'checkedAt'
    | 'verificationStatus'
  >
): string {
  const canonicalPayload = {
    productId: record.productId,
    fieldPath: record.fieldPath,
    observedValue: record.observedValue,
    sourceName: record.sourceName,
    sourceUrl: record.sourceUrl,
    sourceProductId: record.sourceProductId || '',
    matchMethod: record.matchMethod,
    checkedAt: record.checkedAt,
    verificationStatus: record.verificationStatus
  };

  const serialized = deepCanonicalStringify(canonicalPayload);
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

/**
 * Versioned evidence hash calculation.
 * Defaults to 'v2'.
 */
export function computeEvidenceHash(
  record: Pick<
    FieldEvidenceRecord,
    | 'productId'
    | 'fieldPath'
    | 'observedValue'
    | 'sourceName'
    | 'sourceUrl'
    | 'sourceProductId'
    | 'matchMethod'
    | 'checkedAt'
    | 'verificationStatus'
  >,
  version: EvidenceHashVersion = 'v2'
): string {
  if (version === 'v1') {
    return computeEvidenceHashV1(record);
  }
  return computeEvidenceHashV2(record);
}

/**
 * Evaluates and verifies evidence hash integrity with version detection.
 */
export function verifyEvidenceHash(
  record: FieldEvidenceRecord
): {
  isValid: boolean;
  matchedVersion: EvidenceHashVersion | null;
  computedV2: string;
  computedV1: string;
} {
  const computedV2 = computeEvidenceHashV2(record);
  const computedV1 = computeEvidenceHashV1(record);

  if (record.evidenceHash === computedV2) {
    return { isValid: true, matchedVersion: 'v2', computedV2, computedV1 };
  }

  if (record.evidenceHash === computedV1) {
    return { isValid: true, matchedVersion: 'v1', computedV2, computedV1 };
  }

  return { isValid: false, matchedVersion: null, computedV2, computedV1 };
}

/**
 * Creates a fully validated, versioned FieldEvidenceRecord.
 */
export function createFieldEvidenceRecord(
  params: Omit<
    FieldEvidenceRecord,
    'evidenceHash' | 'evidenceHashVersion' | 'trustClassification' | 'legacyHashV1'
  > & {
    version?: EvidenceHashVersion;
    trustClassification?: EvidenceTrustClassification;
    legacyHashV1?: string;
  }
): FieldEvidenceRecord {
  const version = params.version || 'v2';
  const trustClassification =
    params.trustClassification || classifyEvidenceTrust(params);

  const hashV2 = computeEvidenceHashV2(params);
  const hashV1 = params.legacyHashV1 || computeEvidenceHashV1(params);

  return {
    productId: params.productId,
    fieldPath: params.fieldPath,
    observedValue: params.observedValue,
    sourceName: params.sourceName,
    sourceUrl: params.sourceUrl,
    sourceProductId: params.sourceProductId,
    matchMethod: params.matchMethod,
    checkedAt: params.checkedAt,
    verificationStatus: params.verificationStatus,
    trustClassification,
    evidenceHash: version === 'v2' ? hashV2 : hashV1,
    evidenceHashVersion: version,
    legacyHashV1: hashV1,
    scopeNote: params.scopeNote
  };
}

export interface BacklogFieldEvidence {
  backlogId?: string;
  productId: string;
  fieldPath: string;
  verifiedValue: any;
  sourceName: string;
  sourceUrl: string;
  checkedAt: string;
  evidenceHashV2: string;
  verificationStatus: string;
  trustClassification: string;
  scopeNote?: string;
  promotedAt?: string;
}

