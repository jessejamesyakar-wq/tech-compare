import crypto from 'node:crypto';
import { QuarantineDecisionRecord } from './quarantineDecisionEngine';

export interface ShadowQueueItem {
  queueId: string;
  rootId: string;
  findingId: string;
  severity: string;
  reason: string;
  createdAt: string;
  policyVersion: string;
  reviewStatus: string;
  goldenStatus: boolean;
  legacyStatus: boolean;
  evidenceReferences: string[];
  deduplicationKey: string;
}

export class ShadowQuarantineQueue {
  private queue: Map<string, ShadowQueueItem> = new Map();
  private duplicateEventsPrevented: number = 0;

  public enqueueDecision(decision: QuarantineDecisionRecord): { item: ShadowQueueItem; isNew: boolean } {
    // Deterministic deduplication key: entityId + findingClass + policyVersion
    const dedupKey = crypto
      .createHash('sha256')
      .update(`${decision.entityId}|${decision.findingClass}|${decision.policyVersion}`)
      .digest('hex');

    if (this.queue.has(dedupKey)) {
      this.duplicateEventsPrevented++;
      return { item: this.queue.get(dedupKey)!, isNew: false };
    }

    const item: ShadowQueueItem = {
      queueId: `sq_${decision.entityId}_${decision.findingClass}`,
      rootId: decision.rootId,
      findingId: decision.decisionId,
      severity: decision.severity,
      reason: decision.explanation.whatFailed,
      createdAt: decision.observedAt,
      policyVersion: decision.policyVersion,
      reviewStatus: decision.decisionState,
      goldenStatus: decision.goldenMembership,
      legacyStatus: decision.legacyFinding,
      evidenceReferences: decision.evidenceIds,
      deduplicationKey: dedupKey
    };

    this.queue.set(dedupKey, item);
    return { item, isNew: true };
  }

  public getQueue(): ShadowQueueItem[] {
    return Array.from(this.queue.values());
  }

  public getDuplicateEventsPrevented(): number {
    return this.duplicateEventsPrevented;
  }
}
