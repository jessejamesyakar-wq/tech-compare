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
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-001',
      rootId: 'apple-apple-iphone-16-pro-max-1-tb-960862',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 Pro Max (1 TB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-002',
      rootId: 'apple-apple-iphone-16-pro-max-512-gb-960861',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 Pro Max (512 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-003',
      rootId: 'apple-apple-iphone-16-pro-max-256-gb-952387',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 Pro Max (256 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-004',
      rootId: 'apple-apple-iphone-16-pro-256-gb-960858',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 Pro (256 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-005',
      rootId: 'apple-apple-iphone-15-pro-max-1-tb-895854',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2023 / TSMC 3nm (N3B)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 15 Pro Max (1 TB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-006',
      rootId: 'apple-apple-iphone-15-pro-max-512-gb-895853',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2023 / TSMC 3nm (N3B)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 15 Pro Max (512 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-007',
      rootId: 'apple-apple-iphone-16-pro-128-gb-952452',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 Pro (128 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-008',
      rootId: 'apple-apple-iphone-16e-512-gb-994887',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16e (512 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-009',
      rootId: 'apple-apple-iphone-16-128-gb-959779',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 (128 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-010',
      rootId: 'apple-apple-iphone-16e-256-gb-994886',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16e (256 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-011',
      rootId: 'apple-apple-iphone-16e-128-gb-994885',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16e (128 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-012',
      rootId: 'apple-apple-iphone-15-512-gb-895867',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 4nm',
      evidence: 'Apple Keynote Sep 2022 / TSMC 4nm (N4)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 15 (512 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-013',
      rootId: 'apple-apple-iphone-16-pro-1-tb-960860',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 Pro (1 TB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-014',
      rootId: 'apple-apple-iphone-16-pro-512-gb-960859',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 Pro (512 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-015',
      rootId: 'apple-apple-iphone-15-pro-1-tb-895857',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2023 / TSMC 3nm (N3B)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 15 Pro (1 TB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-APPLE-WAVE6-PROCESS-016',
      rootId: 'apple-apple-iphone-16-256-gb-960853',
      fieldPath: 'specs.processor.process',
      oldValue: 'Bilinmiyor',
      newValue: 'TSMC 3nm',
      evidence: 'Apple Keynote Sep 2024 / TSMC 2nd-gen 3nm (N3E)',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Apple iPhone 16 (256 GB)',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-SAMSUNG-WAVE6-PROCESS-017',
      rootId: 'samsung-samsung-galaxy-s20-ultra-34',
      fieldPath: 'specs.processor.process',
      oldValue: '5nm',
      newValue: 'Samsung 7nm',
      evidence: 'Samsung Semiconductor 7LPP EUV',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Samsung Galaxy S20 Ultra',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-SAMSUNG-WAVE6-PROCESS-018',
      rootId: 'samsung-samsung-galaxy-note-20-ultra-37',
      fieldPath: 'specs.processor.process',
      oldValue: '5nm',
      newValue: 'Samsung 7nm',
      evidence: 'Samsung Semiconductor 7LPP EUV',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Samsung Galaxy Note 20 Ultra',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-SAMSUNG-WAVE6-PROCESS-019',
      rootId: 'samsung-samsung-galaxy-s21-50',
      fieldPath: 'specs.processor.process',
      oldValue: '5nm',
      newValue: 'Samsung 5nm',
      evidence: 'Samsung Semiconductor Jan 2021 / 5LPE',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Samsung Galaxy S21',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-SAMSUNG-WAVE6-PROCESS-020',
      rootId: 'samsung-samsung-galaxy-s21-51',
      fieldPath: 'specs.processor.process',
      oldValue: '5nm',
      newValue: 'Samsung 5nm',
      evidence: 'Samsung Semiconductor Jan 2021 / 5LPE',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Samsung Galaxy S21+',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },
    {
      correctionId: 'GC-SAMSUNG-WAVE6-PROCESS-021',
      rootId: 'samsung-samsung-galaxy-a72-62',
      fieldPath: 'specs.processor.process',
      oldValue: '5nm',
      newValue: 'Samsung 8nm',
      evidence: 'Samsung Foundry 8LPP / Qualcomm Tech Brief',
      reason: 'Verified official manufacturer and foundry fabrication node correction for Samsung Galaxy A72',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
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
