import {
  P2AProvenanceRecord,
  P2AProvenanceManifest,
  P2AProvenanceValidator
} from '../canary/p2aProvenanceValidator';

export type ProvenanceVerificationCode =
  | 'PROVENANCE_VERIFIED_MATCH'
  | 'PROVENANCE_STALE_HASH_MISMATCH'
  | 'PROVENANCE_CHIP_MISMATCH'
  | 'PROVENANCE_RECORD_BLOCKED'
  | 'PROVENANCE_RECORD_NOT_FOUND'
  | 'CATALOG_PRODUCT_NOT_FOUND'
  | 'CATALOG_FIELD_NOT_FOUND';

export interface FieldVerificationResult {
  rootId: string;
  fieldPath: string;
  verified: boolean;
  status: ProvenanceVerificationCode;
  currentValue: any;
  valueHash?: string;
  expectedHash?: string;
  chipDependency?: string;
  actualChip?: string;
  sourceUrl?: string;
  message: string;
}

export interface QueueReconciliationItemResult {
  rootId: string;
  fieldPath: string;
  priority: string;
  resolved: boolean;
  resolutionStatus: ProvenanceVerificationCode;
  provenanceRecordId?: string;
  message: string;
}

export interface QueueReconciliationSummary {
  runId: string;
  reconciledAt: string;
  totalQueueItemsEvaluated: number;
  initialP2Debt: number;
  newlyResolvedP2Count: number;
  remainingP2Debt: number;
  resolvedItems: QueueReconciliationItemResult[];
}

export class ProvenanceConsumer {
  /**
   * Verifies a specific catalog field against a provenance ledger.
   * Loads product, reads raw value, verifies valueHash and hardware chip dependency.
   */
  public static verifyField(
    rootId: string,
    fieldPath: string,
    catalog: any[],
    records: P2AProvenanceRecord[]
  ): FieldVerificationResult {
    const product = catalog.find((p: any) => p.id === rootId);
    if (!product) {
      return {
        rootId,
        fieldPath,
        verified: false,
        status: 'CATALOG_PRODUCT_NOT_FOUND',
        currentValue: undefined,
        message: `Product '${rootId}' not found in catalog.`
      };
    }

    const currentVal = P2AProvenanceValidator.getNestedValue(product, fieldPath);
    if (currentVal === undefined) {
      return {
        rootId,
        fieldPath,
        verified: false,
        status: 'CATALOG_FIELD_NOT_FOUND',
        currentValue: undefined,
        message: `Field '${fieldPath}' does not exist on product '${rootId}'.`
      };
    }

    const currentValueHash = P2AProvenanceValidator.computeValueHash(currentVal);

    // Find provenance record
    const record = records.find(
      r => r.rootId === rootId && (r.canonicalFieldPath === fieldPath || r.rawFieldPath === fieldPath)
    );

    if (!record) {
      return {
        rootId,
        fieldPath,
        verified: false,
        status: 'PROVENANCE_RECORD_NOT_FOUND',
        currentValue: currentVal,
        valueHash: currentValueHash,
        message: `No provenance record found for ${rootId}::${fieldPath}.`
      };
    }

    if (record.status !== 'VERIFIED_EXISTING_VALUE') {
      return {
        rootId,
        fieldPath,
        verified: false,
        status: 'PROVENANCE_RECORD_BLOCKED',
        currentValue: currentVal,
        valueHash: currentValueHash,
        message: `Provenance record status is '${record.status}', not VERIFIED_EXISTING_VALUE.`
      };
    }

    // Value Hash Match check
    if (record.valueHash !== currentValueHash) {
      return {
        rootId,
        fieldPath,
        verified: false,
        status: 'PROVENANCE_STALE_HASH_MISMATCH',
        currentValue: currentVal,
        valueHash: currentValueHash,
        expectedHash: record.valueHash,
        message: `Catalog value has mutated or hash mismatch. Stale provenance detected.`
      };
    }

    // Hardware Chip Dependency Check
    const actualChip = product.specs?.processor?.chip || '';
    if (record.chipDependency) {
      if (!actualChip.toLowerCase().includes(record.chipDependency.toLowerCase())) {
        return {
          rootId,
          fieldPath,
          verified: false,
          status: 'PROVENANCE_CHIP_MISMATCH',
          currentValue: currentVal,
          valueHash: currentValueHash,
          chipDependency: record.chipDependency,
          actualChip,
          message: `Product chip '${actualChip}' does not match provenance dependency '${record.chipDependency}'.`
        };
      }
    }

    return {
      rootId,
      fieldPath,
      verified: true,
      status: 'PROVENANCE_VERIFIED_MATCH',
      currentValue: currentVal,
      valueHash: currentValueHash,
      expectedHash: record.valueHash,
      chipDependency: record.chipDependency,
      actualChip,
      sourceUrl: record.sourceUrls?.[0],
      message: `Verified Level 1 OEM provenance matches catalog value '${currentVal}' with chip dependency '${actualChip}'.`
    };
  }

  /**
   * Reconciles the repair queue against active verified provenance ledgers.
   */
  public static reconcileQueue(
    queue: any[],
    catalog: any[],
    provenanceRecords: P2AProvenanceRecord[],
    runId = 'RUN-RECONCILE'
  ): QueueReconciliationSummary {
    const p2Items = queue.filter((i: any) => (i.priority || i.severity) === 'P2');
    const initialP2Debt = p2Items.length;

    const resolvedItems: QueueReconciliationItemResult[] = [];
    let newlyResolvedP2Count = 0;

    for (const item of p2Items) {
      const fieldResult = this.verifyField(item.rootId, item.fieldPath, catalog, provenanceRecords);
      if (fieldResult.verified && fieldResult.status === 'PROVENANCE_VERIFIED_MATCH') {
        newlyResolvedP2Count++;
        resolvedItems.push({
          rootId: item.rootId,
          fieldPath: item.fieldPath,
          priority: item.priority || item.severity || 'P2',
          resolved: true,
          resolutionStatus: 'PROVENANCE_VERIFIED_MATCH',
          provenanceRecordId: `${item.rootId}::${item.fieldPath}`,
          message: fieldResult.message
        });
      }
    }

    return {
      runId,
      reconciledAt: new Date().toISOString(),
      totalQueueItemsEvaluated: queue.length,
      initialP2Debt,
      newlyResolvedP2Count,
      remainingP2Debt: initialP2Debt - newlyResolvedP2Count,
      resolvedItems
    };
  }
}
