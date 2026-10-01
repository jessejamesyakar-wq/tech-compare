/**
 * GOLDEN DATASET CORRECTION REGISTRY & OVERLAY MECHANISM
 *
 * GOVERNANCE RULES:
 * 1. Golden Dataset V1 (goldenDatasetV1.ts) is an immutable historical snapshot. It MUST NOT be mutated in-place.
 * 2. When a frozen Golden V1 field is proven inaccurate by incontrovertible evidence, corrections
 *    must be recorded as versioned superseding overlays.
 * 3. Every correction must declare:
 *    - correctionId
 *    - rootId (must exist in Golden Dataset V1)
 *    - fieldPath (valid spec field)
 *    - oldValue (exact frozen baseline value)
 *    - newValue (verified evidence-backed value)
 *    - evidence (official manufacturer/foundry disclosure)
 *    - reason (justification for correction)
 *    - supersedesVersion (e.g., "V1.0")
 *    - checkedAt (ISO timestamp)
 *    - status ('APPROVED' | 'PENDING' | 'REJECTED')
 * 4. Guard behavior:
 *    - Arbitrary Golden mutation -> BLOCK
 *    - Unauthorized correction -> BLOCK
 *    - Wrong root/field -> BLOCK
 *    - Missing evidence -> BLOCK
 *    - Approved superseding correction -> PASS
 */

import { GOLDEN_DATASET_V1_IDS } from './goldenDatasetV1';

export type GoldenCorrectionStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

export interface GoldenCorrection {
  correctionId: string;
  rootId: string;
  fieldPath: string;
  oldValue: any;
  newValue: any;
  evidence: string;
  reason: string;
  supersedesVersion: string;
  checkedAt: string;
  status: GoldenCorrectionStatus;
}

export type GoldenCorrectionStopCode =
  | 'INVALID_ROOT'
  | 'INVALID_FIELD'
  | 'MISSING_EVIDENCE'
  | 'UNAUTHORIZED_CORRECTION'
  | 'CORRECTION_REJECTED';

export interface GoldenCorrectionValidationResult {
  valid: boolean;
  stopCode?: GoldenCorrectionStopCode;
  message?: string;
}

export class GoldenCorrectionRegistry {
  private static readonly ALL_GOLDEN_ROOTS = new Set<string>([
    ...GOLDEN_DATASET_V1_IDS.samsung21,
    ...GOLDEN_DATASET_V1_IDS.apple7b,
    ...GOLDEN_DATASET_V1_IDS.apple7c,
    ...GOLDEN_DATASET_V1_IDS.apple7d,
  ]);

  /**
   * Versioned immutable registry of approved superseding corrections.
   * Frozen V1 history remains untouched in goldenDatasetV1.ts.
   */
  private static readonly CORRECTIONS: GoldenCorrection[] = [
    {
      correctionId: 'GC-APPLE-A13-PROCESS-001',
      rootId: 'apple-apple-iphone-11-128-gb-335107',
      fieldPath: 'specs.processor.process',
      oldValue: 'TSMC 5nm',
      newValue: 'TSMC 7nm+',
      evidence: 'Apple Keynote Sep 2019 & TSMC 2nd-gen 7nm (N7P) semiconductor fabrication disclosure. TSMC 5nm (N5) was first deployed in late 2020 on A14 Bionic; 5nm is physically impossible for A13. Verified consistent with catalog siblings apple-apple-iphone-11-64-gb-223976 and apple-apple-iphone-11-256-gb-335126.',
      reason: 'A13 Bionic fabrication node correction from 5nm seed typo to verified TSMC 7nm+ (N7P)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T00:00:00Z',
      status: 'APPROVED',
    },
  ];

  /**
   * Returns all registered corrections.
   */
  public static getAllCorrections(): GoldenCorrection[] {
    return [...this.CORRECTIONS];
  }

  /**
   * Returns all currently approved corrections.
   */
  public static getApprovedCorrections(): GoldenCorrection[] {
    return this.CORRECTIONS.filter((c) => c.status === 'APPROVED');
  }

  /**
   * Finds an approved correction for a specific root and field.
   */
  public static getApprovedCorrection(rootId: string, fieldPath: string): GoldenCorrection | undefined {
    return this.CORRECTIONS.find(
      (c) => c.rootId === rootId && c.fieldPath === fieldPath && c.status === 'APPROVED'
    );
  }

  /**
   * Checks whether a specific mutation is an approved Golden correction.
   */
  public static isApprovedGoldenCorrection(rootId: string, fieldPath: string, newValue?: any): boolean {
    const correction = this.getApprovedCorrection(rootId, fieldPath);
    if (!correction) return false;
    if (newValue !== undefined && correction.newValue !== newValue) return false;
    return true;
  }

  /**
   * Validates a correction candidate against governance rules.
   */
  public static validateCorrectionCandidate(
    candidate: Partial<GoldenCorrection>
  ): GoldenCorrectionValidationResult {
    // 1. Root ID must exist in Golden Dataset V1
    if (!candidate.rootId || !this.ALL_GOLDEN_ROOTS.has(candidate.rootId)) {
      return {
        valid: false,
        stopCode: 'INVALID_ROOT',
        message: `Root ID '${candidate.rootId}' is not part of the Golden Dataset V1.`,
      };
    }

    // 2. Field path must be a non-empty string
    if (!candidate.fieldPath || typeof candidate.fieldPath !== 'string' || candidate.fieldPath.trim() === '') {
      return {
        valid: false,
        stopCode: 'INVALID_FIELD',
        message: `Field path '${candidate.fieldPath}' is invalid.`,
      };
    }

    // 3. Evidence must be strong, non-empty, and descriptive
    if (!candidate.evidence || typeof candidate.evidence !== 'string' || candidate.evidence.trim().length < 20) {
      return {
        valid: false,
        stopCode: 'MISSING_EVIDENCE',
        message: `Correction on Golden root '${candidate.rootId}' requires incontrovertible evidence (>20 chars).`,
      };
    }

    // 4. Status check
    if (candidate.status === 'REJECTED') {
      return {
        valid: false,
        stopCode: 'CORRECTION_REJECTED',
        message: `Correction '${candidate.correctionId}' is rejected.`,
      };
    }

    if (candidate.status !== 'APPROVED') {
      return {
        valid: false,
        stopCode: 'UNAUTHORIZED_CORRECTION',
        message: `Correction '${candidate.correctionId}' is not approved (status: ${candidate.status}).`,
      };
    }

    return { valid: true };
  }

  /**
   * Applies approved corrections to a catalog list without mutating frozen baseline definitions.
   */
  public static applyCorrectionsToCatalog(products: any[]): { modifiedCount: number; appliedIds: string[] } {
    let modifiedCount = 0;
    const appliedIds: string[] = [];

    const approved = this.getApprovedCorrections();
    for (const correction of approved) {
      const product = products.find((p) => p.id === correction.rootId);
      if (!product) continue;

      const pathParts = correction.fieldPath.split('.');
      let current = product;
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }

      const lastKey = pathParts[pathParts.length - 1];
      if (current[lastKey] !== correction.newValue) {
        current[lastKey] = correction.newValue;
        modifiedCount++;
        appliedIds.push(correction.correctionId);
      }
    }

    return { modifiedCount, appliedIds };
  }
}
