export type DualControlReviewAction =
  | 'APPROVE_CANDIDATE'
  | 'REJECT_CANDIDATE'
  | 'REQUEST_MORE_EVIDENCE'
  | 'MARK_KNOWN_LEGACY'
  | 'RETURN_TO_STAGING';

export interface DualControlReviewRecord {
  reviewId: string;
  candidateId: string;
  targetRootId: string;
  requesterId: string;
  reviewerId: string;
  action: DualControlReviewAction;
  reviewedAt: string;
  notes: string;
  dualControlVerified: boolean;
  productionMutationAttempted: false;
}

export function executeDualControlReview(
  candidateId: string,
  targetRootId: string,
  requesterId: string,
  reviewerId: string,
  action: DualControlReviewAction,
  notes: string = 'Dual control review executed'
): DualControlReviewRecord {
  const FORBIDDEN_PRODUCTION_ACTIONS = ['DELETE_PRODUCTION', 'MERGE_PRODUCTION', 'REWRITE_PRODUCTION_ROOT'];
  if (FORBIDDEN_PRODUCTION_ACTIONS.includes(action as string)) {
    throw new Error(`DUAL_CONTROL_FORBIDDEN_ACTION: Action ${action} is prohibited in Phase 8-C pre-write enforcement.`);
  }

  // Dual-control check
  const dualControlVerified = requesterId !== reviewerId;
  if (!dualControlVerified) {
    throw new Error(`DUAL_CONTROL_VIOLATION: Requester (${requesterId}) cannot act as Reviewer (${reviewerId}). Dual control required.`);
  }

  return {
    reviewId: `dcr_${candidateId}_${Date.now()}`,
    candidateId,
    targetRootId,
    requesterId,
    reviewerId,
    action,
    reviewedAt: new Date().toISOString(),
    notes,
    dualControlVerified,
    productionMutationAttempted: false
  };
}
