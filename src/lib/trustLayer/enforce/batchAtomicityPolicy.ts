import { FullEvidenceCandidatePayload, evaluateCandidateProvenance, ProvenanceGateEvaluationResult } from '../canary/provenanceEnforcementGate';
import { DurableRecoveryJournal } from './durableRecoveryJournal';
import { EnforcementObservabilityCollector } from './enforcementObservabilityMetrics';
import { ConcurrencyHardenedEvaluator } from './concurrencyHardening';

export type BatchExecutionMode = 'ATOMIC_BATCH' | 'PARTIAL_ALLOWED';

export interface BatchCandidateResult {
  candidateId: string;
  targetRootId: string;
  atomicFactDomain: string;
  decisionState: 'ALLOW' | 'BLOCK' | 'REQUIRE_REVIEW' | 'ROLLED_BACK';
  explanation: string;
  journalId: string;
  appliedRuleId?: string;
}

export interface BatchExecutionResult {
  batchId: string;
  mode: BatchExecutionMode;
  totalCandidates: number;
  committedCount: number;
  rolledBackCount: number;
  stagedForReviewCount: number;
  blockedCount: number;
  batchStatus: 'COMMITTED' | 'ROLLED_BACK' | 'PARTIALLY_COMMITTED';
  candidateResults: BatchCandidateResult[];
  atomicityPreserved: boolean;
}

export class BatchAtomicityPolicy {
  private static evaluator = new ConcurrencyHardenedEvaluator();

  public static async processBatch(
    batchId: string,
    candidates: FullEvidenceCandidatePayload[],
    mode: BatchExecutionMode = 'ATOMIC_BATCH'
  ): Promise<BatchExecutionResult> {
    const stagedEntries: Array<{ journalId: string; candidate: FullEvidenceCandidatePayload }> = [];

    // Stage all candidates in durable recovery journal first
    for (const candidate of candidates) {
      const journalEntry = DurableRecoveryJournal.stageEntry(candidate);
      stagedEntries.push({ journalId: journalEntry.journalId, candidate });
    }

    // Evaluate candidates concurrently with lock hardening
    const evaluations: Array<{
      candidate: FullEvidenceCandidatePayload;
      journalId: string;
      evalResult: ProvenanceGateEvaluationResult;
    }> = await this.evaluator.processBatchConcurrently(
      stagedEntries,
      10, // Max 10 concurrent worker evaluations per batch
      async (item) => {
        const evalResult = await this.evaluator.evaluateCandidateWithLock(item.candidate);
        return {
          candidate: item.candidate,
          journalId: item.journalId,
          evalResult
        };
      }
    );

    const hasAnyBlocker = evaluations.some(
      (ev) => ev.evalResult.decisionState === 'BLOCK' || ev.evalResult.decisionState === 'REQUIRE_REVIEW'
    );

    if (mode === 'ATOMIC_BATCH' && hasAnyBlocker) {
      // Complete Fail-Closed Batch Rollback: 0 mutations applied
      EnforcementObservabilityCollector.recordRollback();

      const candidateResults: BatchCandidateResult[] = evaluations.map((ev) => {
        DurableRecoveryJournal.markRolledBack(ev.journalId, `ATOMIC_BATCH_ROLLBACK: Candidate ${ev.candidate.candidateId} or peer candidate in batch failed governance evaluation.`);
        return {
          candidateId: ev.candidate.candidateId,
          targetRootId: ev.candidate.targetRootId,
          atomicFactDomain: ev.candidate.atomicFactDomain,
          decisionState: 'ROLLED_BACK',
          explanation: `ATOMIC_BATCH_ROLLBACK: Transaction aborted due to blocker in batch. Rule: ${ev.evalResult.appliedRuleId || 'ENF_BATCH_ROLLBACK'}. Reason: ${ev.evalResult.explanation}`,
          journalId: ev.journalId,
          appliedRuleId: ev.evalResult.appliedRuleId
        };
      });

      return {
        batchId,
        mode,
        totalCandidates: candidates.length,
        committedCount: 0,
        rolledBackCount: candidates.length,
        stagedForReviewCount: 0,
        blockedCount: candidates.length,
        batchStatus: 'ROLLED_BACK',
        candidateResults,
        atomicityPreserved: true
      };
    }

    // Process allowable candidates or partial execution
    let committedCount = 0;
    let rolledBackCount = 0;
    let stagedForReviewCount = 0;
    let blockedCount = 0;

    const candidateResults: BatchCandidateResult[] = [];

    for (const ev of evaluations) {
      if (ev.evalResult.decisionState === 'ALLOW') {
        DurableRecoveryJournal.markPreCommitVerified(ev.journalId);
        DurableRecoveryJournal.markCommitted(ev.journalId);
        committedCount++;

        candidateResults.push({
          candidateId: ev.candidate.candidateId,
          targetRootId: ev.candidate.targetRootId,
          atomicFactDomain: ev.candidate.atomicFactDomain,
          decisionState: 'ALLOW',
          explanation: ev.evalResult.explanation,
          journalId: ev.journalId,
          appliedRuleId: ev.evalResult.appliedRuleId
        });
      } else if (ev.evalResult.decisionState === 'REQUIRE_REVIEW') {
        DurableRecoveryJournal.markAborted(ev.journalId, 'STAGED_FOR_REVIEW');
        stagedForReviewCount++;

        candidateResults.push({
          candidateId: ev.candidate.candidateId,
          targetRootId: ev.candidate.targetRootId,
          atomicFactDomain: ev.candidate.atomicFactDomain,
          decisionState: 'REQUIRE_REVIEW',
          explanation: ev.evalResult.explanation,
          journalId: ev.journalId,
          appliedRuleId: ev.evalResult.appliedRuleId
        });
      } else {
        DurableRecoveryJournal.markRolledBack(ev.journalId, `BLOCKED: ${ev.evalResult.explanation}`);
        blockedCount++;

        candidateResults.push({
          candidateId: ev.candidate.candidateId,
          targetRootId: ev.candidate.targetRootId,
          atomicFactDomain: ev.candidate.atomicFactDomain,
          decisionState: 'BLOCK',
          explanation: ev.evalResult.explanation,
          journalId: ev.journalId,
          appliedRuleId: ev.evalResult.appliedRuleId
        });
      }
    }

    return {
      batchId,
      mode,
      totalCandidates: candidates.length,
      committedCount,
      rolledBackCount,
      stagedForReviewCount,
      blockedCount,
      batchStatus: mode === 'ATOMIC_BATCH' ? 'COMMITTED' : (blockedCount > 0 || stagedForReviewCount > 0 ? 'PARTIALLY_COMMITTED' : 'COMMITTED'),
      candidateResults,
      atomicityPreserved: true
    };
  }
}
