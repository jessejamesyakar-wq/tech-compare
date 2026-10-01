/**
 * MUTATION SCOPE GUARD — SCOPE LOCK ENFORCEMENT
 *
 * PURPOSE:
 * Strictly locks catalog repair operations to explicitly authorized root IDs and field paths.
 * Prevents automated scope expansion to sibling/family variants.
 *
 * CRITICAL GOVERNANCE RULES:
 * 1. Every mutation task must explicitly declare its authorization scope.
 * 2. "Family consistency", "related product", "same model family",
 *    "necessary cleanup", or similar reasoning NEVER grants mutation authority.
 * 3. STOP CODES:
 *    - SCOPE_VIOLATION_ROOT
 *    - SCOPE_VIOLATION_FIELD
 *    - ROOT_LIMIT_EXCEEDED
 *    - GOLDEN_DATASET_AUTH_REQUIRED
 *    - PRICE_FIREWALL_VIOLATION
 * 4. Post-operation assertions:
 *    actualMutatedRoots ⊆ authorizedRootIds
 *    actualMutatedFields ⊆ authorizedFieldPaths
 *    actualRootMutationCount <= maxRootMutations
 *    priceMutationCount == 0 unless explicitly authorized
 *    goldenMutationCount == 0 unless explicitly authorized
 */

import { GOLDEN_DATASET_V1_IDS } from '../observe/goldenDatasetV1';
import { EnforcementCircuitBreaker } from './enforcementCircuitBreaker';

export type ScopeStopCode =
  | 'SCOPE_VIOLATION_ROOT'
  | 'SCOPE_VIOLATION_FIELD'
  | 'ROOT_LIMIT_EXCEEDED'
  | 'GOLDEN_DATASET_AUTH_REQUIRED'
  | 'PRICE_FIREWALL_VIOLATION';

export interface MutationScopeDeclaration {
  taskId: string;
  description: string;
  authorizedRootIds: string[];
  authorizedFieldPaths: string[];
  authorizedRootFieldMap?: Record<string, string[]>; // Optional exact root+field pair lock
  maxRootMutations: number;
  priceMutationAllowed?: boolean; // default: false
  goldenDatasetMutationAllowed?: boolean; // default: false
}

export interface IntendedFieldMutation {
  fieldPath: string;
  beforeValue?: any;
  afterValue?: any;
}

export interface IntendedRootMutation {
  rootId: string;
  fieldMutations: IntendedFieldMutation[];
}

export interface ScopeValidationResult {
  valid: boolean;
  stopCode?: ScopeStopCode;
  message?: string;
  details?: Record<string, any>;
  targetRootsCount: number;
  targetFieldsCount: number;
}

export interface PostOperationAssertionResult {
  passed: boolean;
  actualMutatedRoots: string[];
  actualMutatedFields: string[];
  actualRootMutationCount: number;
  priceMutationCount: number;
  goldenMutationCount: number;
}

export class MutationScopeViolationError extends Error {
  public readonly stopCode: ScopeStopCode;
  public readonly details: Record<string, any>;

  constructor(stopCode: ScopeStopCode, message: string, details: Record<string, any> = {}) {
    super(`[${stopCode}] ${message}`);
    this.name = 'MutationScopeViolationError';
    this.stopCode = stopCode;
    this.details = details;
  }
}

export class MutationScopeGuard {
  private static readonly PRICE_ROOT_FIELDS = [
    'basePrice',
    'price',
    'storeOffers',
    'priceHistory',
    'merchantOffers'
  ];

  private static readonly ALL_GOLDEN_ROOT_IDS = new Set<string>([
    ...GOLDEN_DATASET_V1_IDS.samsung21,
    ...GOLDEN_DATASET_V1_IDS.apple7b,
    ...GOLDEN_DATASET_V1_IDS.apple7c,
    ...GOLDEN_DATASET_V1_IDS.apple7d
  ]);

  /**
   * Checks whether a field path belongs to price/commerce structures protected by Price Firewall.
   */
  public static isPriceField(fieldPath: string): boolean {
    return this.PRICE_ROOT_FIELDS.some(
      pf => fieldPath === pf || fieldPath.startsWith(`${pf}.`) || fieldPath.startsWith(`${pf}[`)
    );
  }

  /**
   * Checks whether a root ID belongs to the immutable Golden Dataset.
   */
  public static isGoldenDatasetRoot(rootId: string): boolean {
    return this.ALL_GOLDEN_ROOT_IDS.has(rootId);
  }

  /**
   * Validates scope declaration structure.
   */
  public static validateDeclaration(scope: MutationScopeDeclaration): void {
    if (!scope.taskId || typeof scope.taskId !== 'string') {
      throw new Error('SCOPE_LOCK_ERROR: taskId must be a non-empty string');
    }
    if (!Array.isArray(scope.authorizedRootIds)) {
      throw new Error('SCOPE_LOCK_ERROR: authorizedRootIds must be an array');
    }
    if (!Array.isArray(scope.authorizedFieldPaths)) {
      throw new Error('SCOPE_LOCK_ERROR: authorizedFieldPaths must be an array');
    }
    if (typeof scope.maxRootMutations !== 'number' || scope.maxRootMutations <= 0) {
      throw new Error('SCOPE_LOCK_ERROR: maxRootMutations must be a positive integer');
    }
    if (scope.authorizedRootFieldMap !== undefined) {
      if (typeof scope.authorizedRootFieldMap !== 'object' || scope.authorizedRootFieldMap === null) {
        throw new Error('SCOPE_LOCK_ERROR: authorizedRootFieldMap must be an object');
      }
      for (const [rId, fPaths] of Object.entries(scope.authorizedRootFieldMap)) {
        if (!Array.isArray(fPaths)) {
          throw new Error(`SCOPE_LOCK_ERROR: authorizedRootFieldMap for root '${rId}' must be an array of field paths`);
        }
      }
    }
  }

  /**
   * Pre-write guard: Compares intended mutations against the authorization scope.
   * Throws MutationScopeViolationError immediately upon any violation.
   */
  public static validateIntendedMutations(
    scope: MutationScopeDeclaration,
    intendedMutations: IntendedRootMutation[]
  ): ScopeValidationResult {
    this.validateDeclaration(scope);

    const priceMutationAllowed = scope.priceMutationAllowed === true;
    const goldenDatasetMutationAllowed = scope.goldenDatasetMutationAllowed === true;
    const authorizedRootSet = new Set(scope.authorizedRootIds);
    const authorizedFieldSet = new Set(scope.authorizedFieldPaths);

    // 1. Root Count Check
    const uniqueRootIds = Array.from(new Set(intendedMutations.map(m => m.rootId)));
    if (uniqueRootIds.length > scope.maxRootMutations) {
      const stopCode: ScopeStopCode = 'ROOT_LIMIT_EXCEEDED';
      const msg = `Target root count (${uniqueRootIds.length}) exceeds authorized maxRootMutations (${scope.maxRootMutations}).`;
      EnforcementCircuitBreaker.tripCircuit('WRITE_SCOPE_BREACH', msg);
      throw new MutationScopeViolationError(stopCode, msg, {
        targetCount: uniqueRootIds.length,
        maxAllowed: scope.maxRootMutations,
        violatingRoots: uniqueRootIds
      });
    }

    let totalFields = 0;

    // 2. Per-Root and Per-Field Checks
    for (const rootMutation of intendedMutations) {
      const rootId = rootMutation.rootId;

      // Check root authorization (Rule 5 & 6: Sibling variants strictly rejected)
      if (!authorizedRootSet.has(rootId)) {
        const stopCode: ScopeStopCode = 'SCOPE_VIOLATION_ROOT';
        const msg = `Root ID '${rootId}' is not in authorizedRootIds. Sibling/family expansion is strictly forbidden.`;
        EnforcementCircuitBreaker.tripCircuit('WRITE_SCOPE_BREACH', msg);
        throw new MutationScopeViolationError(stopCode, msg, {
          rootId,
          authorizedRootIds: scope.authorizedRootIds
        });
      }

      // Check Golden Dataset authorization
      if (this.isGoldenDatasetRoot(rootId) && !goldenDatasetMutationAllowed) {
        const stopCode: ScopeStopCode = 'GOLDEN_DATASET_AUTH_REQUIRED';
        const msg = `Root ID '${rootId}' belongs to Golden Dataset V1. Mutation requires explicit goldenDatasetMutationAllowed: true.`;
        EnforcementCircuitBreaker.tripCircuit('GOLDEN_DATASET_DRIFT', msg);
        throw new MutationScopeViolationError(stopCode, msg, {
          rootId
        });
      }

      // Check field mutations
      for (const fieldMut of rootMutation.fieldMutations) {
        totalFields++;
        const fieldPath = fieldMut.fieldPath;

        // Check Price Firewall
        if (this.isPriceField(fieldPath) && !priceMutationAllowed) {
          const stopCode: ScopeStopCode = 'PRICE_FIREWALL_VIOLATION';
          const msg = `Field path '${fieldPath}' touches price/commerce data. Mutation requires explicit priceMutationAllowed: true.`;
          EnforcementCircuitBreaker.tripCircuit('PRICE_FIREWALL_BREACH', msg);
          throw new MutationScopeViolationError(stopCode, msg, {
            rootId,
            fieldPath
          });
        }

        // Check Field Path Authorization
        if (!authorizedFieldSet.has(fieldPath)) {
          const stopCode: ScopeStopCode = 'SCOPE_VIOLATION_FIELD';
          const msg = `Field path '${fieldPath}' on root '${rootId}' is not in authorizedFieldPaths.`;
          EnforcementCircuitBreaker.tripCircuit('WRITE_SCOPE_BREACH', msg);
          throw new MutationScopeViolationError(stopCode, msg, {
            rootId,
            fieldPath,
            authorizedFieldPaths: scope.authorizedFieldPaths
          });
        }

        // Check exact Root-Field Pair Lock if configured
        if (scope.authorizedRootFieldMap) {
          const allowedFieldsForRoot = scope.authorizedRootFieldMap[rootId];
          if (!allowedFieldsForRoot || !allowedFieldsForRoot.includes(fieldPath)) {
            const stopCode: ScopeStopCode = 'SCOPE_VIOLATION_FIELD';
            const msg = `Field path '${fieldPath}' is not authorized for root '${rootId}' in authorizedRootFieldMap. Pair-level authorization violated.`;
            EnforcementCircuitBreaker.tripCircuit('WRITE_SCOPE_BREACH', msg);
            throw new MutationScopeViolationError(stopCode, msg, {
              rootId,
              fieldPath,
              authorizedFieldsForRoot: allowedFieldsForRoot || []
            });
          }
        }
      }
    }

    return {
      valid: true,
      targetRootsCount: uniqueRootIds.length,
      targetFieldsCount: totalFields
    };
  }

  /**
   * Helper to recursively extract field-level differences between two records.
   */
  public static extractRecordDiffs(
    beforeObj: any,
    afterObj: any,
    prefix = ''
  ): { fieldPath: string; beforeValue: any; afterValue: any }[] {
    const diffs: { fieldPath: string; beforeValue: any; afterValue: any }[] = [];
    const keys = new Set([...Object.keys(beforeObj || {}), ...Object.keys(afterObj || {})]);

    for (const k of keys) {
      const v1 = beforeObj ? beforeObj[k] : undefined;
      const v2 = afterObj ? afterObj[k] : undefined;
      const pathStr = prefix ? `${prefix}.${k}` : k;

      if (typeof v1 === 'object' && v1 !== null && typeof v2 === 'object' && v2 !== null) {
        diffs.push(...this.extractRecordDiffs(v1, v2, pathStr));
      } else if (v1 !== v2) {
        diffs.push({ fieldPath: pathStr, beforeValue: v1, afterValue: v2 });
      }
    }

    return diffs;
  }

  /**
   * Post-operation assertion: Compares before-catalog and after-catalog.
   * Asserts:
   * 1. actualMutatedRoots ⊆ authorizedRootIds
   * 2. actualMutatedFields ⊆ authorizedFieldPaths
   * 3. actualRootMutationCount <= maxRootMutations
   * 4. priceMutationCount == 0 unless explicitly authorized
   * 5. goldenMutationCount == 0 unless explicitly authorized
   */
  public static assertPostOperation(
    scope: MutationScopeDeclaration,
    beforeCatalog: any[],
    afterCatalog: any[]
  ): PostOperationAssertionResult {
    this.validateDeclaration(scope);

    const priceMutationAllowed = scope.priceMutationAllowed === true;
    const goldenDatasetMutationAllowed = scope.goldenDatasetMutationAllowed === true;
    const authorizedRootSet = new Set(scope.authorizedRootIds);
    const authorizedFieldSet = new Set(scope.authorizedFieldPaths);

    const beforeMap = new Map(beforeCatalog.map((p: any) => [p.id, p]));
    const afterMap = new Map(afterCatalog.map((p: any) => [p.id, p]));

    const actualMutatedRoots: string[] = [];
    const actualMutatedFieldsSet = new Set<string>();
    let priceMutationCount = 0;
    let goldenMutationCount = 0;

    for (const [id, afterP] of afterMap.entries()) {
      const beforeP = beforeMap.get(id);
      if (!beforeP) {
        // New record added
        actualMutatedRoots.push(id);
        continue;
      }

      if (JSON.stringify(beforeP) !== JSON.stringify(afterP)) {
        actualMutatedRoots.push(id);
        const diffs = this.extractRecordDiffs(beforeP, afterP);

        if (this.isGoldenDatasetRoot(id)) {
          goldenMutationCount++;
        }

        for (const diff of diffs) {
          actualMutatedFieldsSet.add(diff.fieldPath);
          if (this.isPriceField(diff.fieldPath)) {
            priceMutationCount++;
          }
        }
      }
    }

    // 1. Root Count Assertion
    if (actualMutatedRoots.length > scope.maxRootMutations) {
      throw new MutationScopeViolationError(
        'ROOT_LIMIT_EXCEEDED',
        `POST_ASSERTION_FAILED: Mutated root count (${actualMutatedRoots.length}) exceeds authorized limit (${scope.maxRootMutations}).`,
        { actualCount: actualMutatedRoots.length, maxAllowed: scope.maxRootMutations }
      );
    }

    // 2. Root Scope Assertion (actualMutatedRoots ⊆ authorizedRootIds)
    const unauthorizedRoots = actualMutatedRoots.filter(id => !authorizedRootSet.has(id));
    if (unauthorizedRoots.length > 0) {
      throw new MutationScopeViolationError(
        'SCOPE_VIOLATION_ROOT',
        `POST_ASSERTION_FAILED: Unauthorized root(s) mutated: ${unauthorizedRoots.join(', ')}`,
        { unauthorizedRoots }
      );
    }

    // 3. Golden Dataset Assertion
    if (goldenMutationCount > 0 && !goldenDatasetMutationAllowed) {
      throw new MutationScopeViolationError(
        'GOLDEN_DATASET_AUTH_REQUIRED',
        `POST_ASSERTION_FAILED: ${goldenMutationCount} Golden Dataset root(s) mutated without authorization.`,
        { goldenMutationCount }
      );
    }

    // 4. Price Firewall Assertion
    if (priceMutationCount > 0 && !priceMutationAllowed) {
      throw new MutationScopeViolationError(
        'PRICE_FIREWALL_VIOLATION',
        `POST_ASSERTION_FAILED: Price Firewall breached! ${priceMutationCount} price mutation(s) detected.`,
        { priceMutationCount }
      );
    }

    // 5. Field Scope Assertion (actualMutatedFields ⊆ authorizedFieldPaths)
    const actualMutatedFields = Array.from(actualMutatedFieldsSet);
    const unauthorizedFields = actualMutatedFields.filter(f => !authorizedFieldSet.has(f));
    if (unauthorizedFields.length > 0) {
      throw new MutationScopeViolationError(
        'SCOPE_VIOLATION_FIELD',
        `POST_ASSERTION_FAILED: Unauthorized field(s) mutated: ${unauthorizedFields.join(', ')}`,
        { unauthorizedFields }
      );
    }

    // 6. Root-Field Pair Scope Assertion if configured
    if (scope.authorizedRootFieldMap) {
      for (const [id, afterP] of afterMap.entries()) {
        const beforeP = beforeMap.get(id);
        if (beforeP && JSON.stringify(beforeP) !== JSON.stringify(afterP)) {
          const diffs = this.extractRecordDiffs(beforeP, afterP);
          const allowedFieldsForRoot = scope.authorizedRootFieldMap[id] || [];
          for (const diff of diffs) {
            if (!allowedFieldsForRoot.includes(diff.fieldPath)) {
              throw new MutationScopeViolationError(
                'SCOPE_VIOLATION_FIELD',
                `POST_ASSERTION_FAILED: Field path '${diff.fieldPath}' on root '${id}' was mutated but is not in authorizedRootFieldMap. Pair-level authorization violated.`,
                { rootId: id, fieldPath: diff.fieldPath, allowedFieldsForRoot }
              );
            }
          }
        }
      }
    }

    return {
      passed: true,
      actualMutatedRoots,
      actualMutatedFields,
      actualRootMutationCount: actualMutatedRoots.length,
      priceMutationCount,
      goldenMutationCount
    };
  }

  /**
   * Atomic execution wrapper: validates intended changes, applies them, and asserts invariants.
   */
  public static executeGuardedMutation<T extends { id: string }>(
    scope: MutationScopeDeclaration,
    catalog: T[],
    intendedMutations: IntendedRootMutation[],
    mutationCallback: (catalogDraft: T[]) => void
  ): { catalog: T[]; assertionResult: PostOperationAssertionResult } {
    // 1. Pre-mutation validation
    this.validateIntendedMutations(scope, intendedMutations);

    // 2. Clone for before/after comparison
    const beforeClone = JSON.parse(JSON.stringify(catalog));
    const draft = JSON.parse(JSON.stringify(catalog));

    // 3. Apply mutations
    mutationCallback(draft);

    // 4. Post-mutation assertion
    const assertionResult = this.assertPostOperation(scope, beforeClone, draft);

    return {
      catalog: draft,
      assertionResult
    };
  }
}
