import * as crypto from 'crypto';
import { MutationScopeGuard } from '../enforce/mutationScopeGuard';

export type P2AProvenanceStatus =
  | 'VERIFIED_EXISTING_VALUE'
  | 'CONFLICT_REQUIRES_PATCH'
  | 'BLOCKED_EVIDENCE'
  | 'BLOCKED_SCHEMA_SEMANTICS'
  | 'IDENTITY_UNCERTAIN'
  | 'ALREADY_VERIFIED'
  | 'EXCLUDED_PROTECTED_ROOT'
  | 'EVIDENCE_COLLECTED_PENDING_INTEGRATION';

export interface P2AProvenanceRecord {
  rootId: string;
  rawFieldPath: string;
  canonicalFieldPath: string;
  currentRawValue: any;
  exactRawValue?: any;
  unitAndTechnicalMeaning: string;
  verifiedValueOrHash: string;
  valueHash: string; // SHA256 of currentRawValue to ensure stale detection if catalog mutates
  chipDependency?: string; // e.g. "Google Tensor G5" required for process node validity
  sourceUrls: string[];
  sourceTitle: string;
  sourceTitles?: string[];
  sectionOrTable: string;
  summaryOrExcerpt: string;
  accessedAt: string;
  publishedAt?: string;
  sourcePublishedAt?: string;
  checkedAt?: string;
  modelSkuRegion: string;
  sourceType: 'MANUFACTURER_OFFICIAL' | 'FOUNDRY_WHITEPAPER' | 'REGULATORY_REGISTRY' | 'BENCHMARK' | 'UNKNOWN';
  status: P2AProvenanceStatus;
  verificationStatus?: P2AProvenanceStatus;
  runId: string;
  notes?: string;
}

export interface P2AProvenanceManifest {
  manifestVersion: string;
  runId: string;
  generatedAt: string;
  totalRecords: number;
  countsByStatus: Record<P2AProvenanceStatus, number>;
  records: P2AProvenanceRecord[];
}

export interface ProvenanceValidationResult {
  valid: boolean;
  errorCode?: string;
  message?: string;
  record?: P2AProvenanceRecord;
}

export class P2AProvenanceValidator {
  private static readonly QUARANTINED_ROOT_PATTERNS = [
    'k14-turbo',
    'oppo-k14',
    'oppo-oppo-k14'
  ];

  /**
   * Computes deterministic SHA256 of a specification value.
   */
  public static computeValueHash(val: any): string {
    const serialized = typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val ?? '');
    return crypto.createHash('sha256').update(serialized.trim()).digest('hex');
  }

  /**
   * Checks whether a root ID is quarantined.
   */
  public static isQuarantinedRoot(rootId: string): boolean {
    const lower = (rootId || '').toLowerCase();
    return this.QUARANTINED_ROOT_PATTERNS.some(pat => lower.includes(pat));
  }

  /**
   * Validates a single provenance record against the live catalog and governance rules.
   */
  public static validateRecord(
    record: P2AProvenanceRecord,
    catalog: any[],
    allowedRootsList?: string[],
    allowedRootFieldPairs?: string[]
  ): ProvenanceValidationResult {
    // 0. Non-verified status check: a blocked record cannot be accepted as an actionable verified record
    if (record.status !== 'VERIFIED_EXISTING_VALUE') {
      return {
        valid: false,
        errorCode: 'RECORD_STATUS_BLOCKED',
        message: `Record has status '${record.status}'. Only VERIFIED_EXISTING_VALUE can be validated as an actionable provenance record.`
      };
    }

    // 1. Scope / Protected Root Check
    if (allowedRootsList && !allowedRootsList.includes(record.rootId)) {
      return {
        valid: false,
        errorCode: 'SCOPE_VIOLATION_ROOT',
        message: `Root '${record.rootId}' is not in the authorized candidate scope.`
      };
    }

    if (allowedRootFieldPairs) {
      const pair = `${record.rootId}::${record.canonicalFieldPath}`;
      if (!allowedRootFieldPairs.includes(pair)) {
        return {
          valid: false,
          errorCode: 'SCOPE_VIOLATION_FIELD',
          message: `Root-field pair '${pair}' is not authorized.`
        };
      }
    }

    if (MutationScopeGuard.isGoldenDatasetRoot(record.rootId)) {
      return {
        valid: false,
        errorCode: 'GOLDEN_DATASET_PROTECTED',
        message: `Root '${record.rootId}' belongs to the Golden Dataset. P2 provenance write is forbidden.`
      };
    }

    if (this.isQuarantinedRoot(record.rootId)) {
      return {
        valid: false,
        errorCode: 'QUARANTINED_ROOT_REJECTED',
        message: `Root '${record.rootId}' is quarantined. Provenance writes are forbidden.`
      };
    }

    // 2. Catalog Identity Check: must exist exactly once in catalog
    const matchingProducts = catalog.filter((p: any) => p.id === record.rootId);
    if (matchingProducts.length === 0) {
      return {
        valid: false,
        errorCode: 'CATALOG_ROOT_NOT_FOUND',
        message: `Root '${record.rootId}' does not exist in the active catalog.`
      };
    }
    if (matchingProducts.length > 1) {
      return {
        valid: false,
        errorCode: 'AMBIGUOUS_CATALOG_MATCH',
        message: `Root '${record.rootId}' matches multiple (${matchingProducts.length}) products in catalog.`
      };
    }
    const product = matchingProducts[0];

    // 3. Raw Field Path existence check
    const currentVal = this.getNestedValue(product, record.canonicalFieldPath);
    if (currentVal === undefined) {
      return {
        valid: false,
        errorCode: 'FIELD_PATH_NOT_FOUND',
        message: `Field path '${record.canonicalFieldPath}' does not exist in catalog product '${record.rootId}'.`
      };
    }

    // 4. Model Identity Matching Rule
    if (record.modelSkuRegion && record.modelSkuRegion !== 'NOT_FOUND') {
      const prodName = (product.name || '').toLowerCase();
      const skuLower = record.modelSkuRegion.toLowerCase();
      // If the source explicitly references a different model family
      if (skuLower.includes('iphone') && !prodName.includes('iphone')) {
        return {
          valid: false,
          errorCode: 'MODEL_IDENTITY_MISMATCH',
          message: `Source model '${record.modelSkuRegion}' does not match product '${product.name}'.`
        };
      }
    }

    // 5. Semantics Check: Ambiguous brightness nits cannot be verified as peak
    if (
      record.canonicalFieldPath === 'specs.screen.brightnessNits' &&
      record.unitAndTechnicalMeaning.includes('peak')
    ) {
      return {
        valid: false,
        errorCode: 'BLOCKED_SCHEMA_SEMANTICS',
        message: `Flat field 'specs.screen.brightnessNits' cannot be auto-verified with peak nits due to schema ambiguity.`
      };
    }

    // 6. Chip RAM vs Device RAM Rule
    if (
      record.canonicalFieldPath === 'specs.memory.ramType' &&
      record.sourceType === 'FOUNDRY_WHITEPAPER'
    ) {
      return {
        valid: false,
        errorCode: 'CHIP_RAM_INSUFFICIENT',
        message: `Chipmaker processor specification does not prove device-level RAM implementation.`
      };
    }

    // 7. RAM Capacity cannot prove RAM Generation Rule
    if (record.canonicalFieldPath === 'specs.memory.ramType') {
      const summaryLower = (record.summaryOrExcerpt || '').toLowerCase();
      const supportedLower = (record.verifiedValueOrHash || '').toLowerCase();
      if ((summaryLower.includes('gb ram') || supportedLower.includes('gb')) &&
          !summaryLower.includes('lpddr') && !supportedLower.includes('lpddr')) {
        return {
          valid: false,
          errorCode: 'RAM_CAPACITY_INSUFFICIENT',
          message: `Manufacturer capacity statement (e.g. 16 GB) does not establish RAM type/generation (LPDDR).`
        };
      }
    }

    // 8. Chip Dependency Check (Hardware Architecture Chain)
    if (record.chipDependency) {
      const actualChip = product.specs?.processor?.chip || '';
      if (!actualChip.toLowerCase().includes(record.chipDependency.toLowerCase())) {
        return {
          valid: false,
          errorCode: 'CHIP_DEPENDENCY_MISMATCH',
          message: `Product chip '${actualChip}' does not match required dependency '${record.chipDependency}'.`
        };
      }
    }

    // 9. Stale Value Check (Current Catalog Value vs Value Hash)
    const expectedHash = this.computeValueHash(currentVal);
    if (record.valueHash && record.valueHash !== expectedHash) {
      return {
        valid: false,
        errorCode: 'VALUE_HASH_MISMATCH',
        message: `Catalog value has mutated since provenance was recorded (Stale provenance detected).`
      };
    }

    return {
      valid: true,
      record
    };
  }

  public static getNestedValue(obj: any, pathStr: string): any {
    if (!obj || typeof obj !== 'object') return undefined;
    const parts = pathStr.split('.');
    let curr = obj;
    for (const part of parts) {
      if (curr === null || curr === undefined || typeof curr !== 'object') {
        return undefined;
      }
      curr = curr[part];
    }
    return curr;
  }
}
