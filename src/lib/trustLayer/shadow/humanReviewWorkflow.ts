export type ReviewAction =
  | 'CONFIRM_FINDING'
  | 'REJECT_AS_FALSE_POSITIVE'
  | 'MARK_KNOWN_LEGACY'
  | 'REQUEST_MORE_EVIDENCE'
  | 'APPROVE_FOR_FUTURE_REMEDIATION';

export interface HumanReviewRecord {
  reviewId: string;
  decisionId: string;
  rootId: string;
  action: ReviewAction;
  reviewerId: string;
  reviewedAt: string;
  notes: string;
  shadowStateAfterReview: string;
  productionMutationAttempted: false;
}

export function simulateHumanReview(
  decisionId: string,
  rootId: string,
  action: ReviewAction,
  notes: string = 'Shadow review action executed'
): HumanReviewRecord {
  // Enforce zero production mutation capability
  const FORBIDDEN_ACTIONS = ['MERGE_NOW', 'DELETE_NOW', 'FIX_NOW', 'PUBLISH_NOW'];
  if (FORBIDDEN_ACTIONS.includes(action as string)) {
    throw new Error(`HUMAN_REVIEW_FORBIDDEN_ACTION: Action ${action} is prohibited in Phase 8-B shadow mode.`);
  }

  let shadowStateAfterReview = 'PENDING';
  if (action === 'CONFIRM_FINDING') shadowStateAfterReview = 'CONFIRMED_SHADOW_QUARANTINE';
  else if (action === 'REJECT_AS_FALSE_POSITIVE') shadowStateAfterReview = 'RESOLVED_FALSE_POSITIVE';
  else if (action === 'MARK_KNOWN_LEGACY') shadowStateAfterReview = 'TRACKED_KNOWN_LEGACY';
  else if (action === 'REQUEST_MORE_EVIDENCE') shadowStateAfterReview = 'INSUFFICIENT_EVIDENCE_HOLD';
  else if (action === 'APPROVE_FOR_FUTURE_REMEDIATION') shadowStateAfterReview = 'APPROVED_FOR_PHASE8C';

  return {
    reviewId: `rev_${rootId}_${Date.now()}`,
    decisionId,
    rootId,
    action,
    reviewerId: 'trusted_reviewer_admin',
    reviewedAt: new Date().toISOString(),
    notes,
    shadowStateAfterReview,
    productionMutationAttempted: false
  };
}
