import crypto from 'node:crypto';

export interface AuditEventPayload {
  eventId: string;
  sequenceId: number;
  eventType: string;
  entityId: string | 'NOT_APPLICABLE';
  fieldDomain: string | 'NOT_APPLICABLE';
  oldValueHash: string | 'NOT_APPLICABLE';
  newValueHash: string | 'NOT_APPLICABLE';
  evidenceOrSourceId: string | 'NOT_APPLICABLE';
  sourceContentHash: string | 'NOT_APPLICABLE';
  observedAt: string;
  appliedAt: string | 'NOT_APPLICABLE';
  pipelineIdentity: string;
  gitOrBuildRevision: string;
  previousEventHash: string;
  eventHash: string;
  payloadSummary: string;
}

export class ChainedAuditGenerator {
  private chain: AuditEventPayload[] = [];
  private lastHash: string = '0000000000000000000000000000000000000000000000000000000000000000';
  private gitRevision: string = '37489e4a (main)';
  private pipelineIdentity: string = 'phase_8a2_trust_control_plane';

  public appendEvent(
    eventType: string,
    options?: {
      entityId?: string;
      fieldDomain?: string;
      oldValueHash?: string;
      newValueHash?: string;
      evidenceOrSourceId?: string;
      sourceContentHash?: string;
      appliedAt?: string;
      summary?: string;
    }
  ): AuditEventPayload {
    const sequenceId = this.chain.length + 1;
    const eventId = `evt_${sequenceId}_${Date.now()}`;
    const observedAt = new Date().toISOString();

    const entityId = options?.entityId || 'NOT_APPLICABLE';
    const fieldDomain = options?.fieldDomain || 'NOT_APPLICABLE';
    const oldValueHash = options?.oldValueHash || 'NOT_APPLICABLE';
    const newValueHash = options?.newValueHash || 'NOT_APPLICABLE';
    const evidenceOrSourceId = options?.evidenceOrSourceId || 'NOT_APPLICABLE';
    const sourceContentHash = options?.sourceContentHash || 'NOT_APPLICABLE';
    const appliedAt = options?.appliedAt || 'NOT_APPLICABLE';
    const payloadSummary = options?.summary || `${eventType} executed`;

    const canonicalPayload = [
      eventId,
      sequenceId,
      eventType,
      entityId,
      fieldDomain,
      oldValueHash,
      newValueHash,
      evidenceOrSourceId,
      sourceContentHash,
      observedAt,
      appliedAt,
      this.pipelineIdentity,
      this.gitRevision,
      this.lastHash,
      payloadSummary
    ].join('|');

    const eventHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');

    const event: AuditEventPayload = {
      eventId,
      sequenceId,
      eventType,
      entityId,
      fieldDomain,
      oldValueHash,
      newValueHash,
      evidenceOrSourceId,
      sourceContentHash,
      observedAt,
      appliedAt,
      pipelineIdentity: this.pipelineIdentity,
      gitOrBuildRevision: this.gitRevision,
      previousEventHash: this.lastHash,
      eventHash,
      payloadSummary
    };

    this.chain.push(event);
    this.lastHash = eventHash;
    return event;
  }

  public getChain(): AuditEventPayload[] {
    return [...this.chain];
  }

  public getHeadHash(): string {
    return this.lastHash;
  }

  public static verifyChainIntegrity(chain: AuditEventPayload[]): { valid: boolean; brokenAtSequence?: number; reason?: string } {
    let prevHash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < chain.length; i++) {
      const event = chain[i];

      // Sequence check
      if (event.sequenceId !== i + 1) {
        return { valid: false, brokenAtSequence: event.sequenceId, reason: `Sequence gap or reorder at position ${i + 1}` };
      }

      // Prev hash link check
      if (event.previousEventHash !== prevHash) {
        return { valid: false, brokenAtSequence: event.sequenceId, reason: `Previous hash link mismatch at event ${event.sequenceId}` };
      }

      // Hash recomputation check
      const canonicalPayload = [
        event.eventId,
        event.sequenceId,
        event.eventType,
        event.entityId,
        event.fieldDomain,
        event.oldValueHash,
        event.newValueHash,
        event.evidenceOrSourceId,
        event.sourceContentHash,
        event.observedAt,
        event.appliedAt,
        event.pipelineIdentity,
        event.gitOrBuildRevision,
        prevHash,
        event.payloadSummary
      ].join('|');

      const recomputedHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');

      if (recomputedHash !== event.eventHash) {
        return { valid: false, brokenAtSequence: event.sequenceId, reason: `Payload hash tampering detected at event ${event.sequenceId}` };
      }

      prevHash = event.eventHash;
    }

    return { valid: true };
  }
}
