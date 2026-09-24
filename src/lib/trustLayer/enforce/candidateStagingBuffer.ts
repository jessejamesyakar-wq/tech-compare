import { EnforcementDecisionState } from './enforcementPolicyV1';

export interface StagedCandidateItem {
  candidateId: string;
  targetRootId: string;
  operationType: string;
  proposedFacts: Record<string, any>;
  proposedEvidence: any[];
  sourceProvenance: string;
  policyDecisionState: EnforcementDecisionState;
  blockingRuleIds: string[];
  reviewRequirements: string[];
  createdAt: string;
  policyVersion: string;
  pipelineRevision: string;
  publicCatalogExposed: false;
}

export class CandidateStagingBuffer {
  private buffer: Map<string, StagedCandidateItem> = new Map();

  public stageCandidate(candidate: Omit<StagedCandidateItem, 'publicCatalogExposed'>): StagedCandidateItem {
    const item: StagedCandidateItem = {
      ...candidate,
      publicCatalogExposed: false
    };
    this.buffer.set(item.candidateId, item);
    return item;
  }

  public getStagedCandidates(): StagedCandidateItem[] {
    return Array.from(this.buffer.values());
  }

  public getCandidate(candidateId: string): StagedCandidateItem | undefined {
    return this.buffer.get(candidateId);
  }

  public clearBuffer(): void {
    this.buffer.clear();
  }
}
