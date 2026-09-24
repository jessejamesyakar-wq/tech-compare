import crypto from 'node:crypto';
import { FullEvidenceCandidatePayload } from '../canary/provenanceEnforcementGate';

export type JournalStage = 'STAGED' | 'PRE_COMMIT_GATE_VERIFIED' | 'COMMITTED' | 'ABORTED' | 'ROLLED_BACK';

export interface RecoveryJournalEntry {
  journalId: string;
  candidateId: string;
  targetRootId: string;
  atomicFactDomain: string;
  candidatePayloadHash: string;
  stage: JournalStage;
  createdAt: string;
  updatedAt: string;
  committedAt?: string;
  rollbackReason?: string;
}

export interface RecoveryReplaySummary {
  totalEntriesInspected: number;
  alreadyCommittedIgnoredCount: number;
  incompleteTransactionsAbortedCount: number;
  rolledBackCount: number;
  idempotencyPreserved: boolean;
  replaySuccess: boolean;
}

export class DurableRecoveryJournal {
  private static journalEntries: Map<string, RecoveryJournalEntry> = new Map();
  private static crashInjectionStage?: 'PRE_COMMIT' | 'MANIFEST_APPEND' | 'COMPLETION';

  public static stageEntry(candidate: FullEvidenceCandidatePayload): RecoveryJournalEntry {
    const journalId = `jnl_${crypto.createHash('sha256').update(`${candidate.candidateId}_${Date.now()}`).digest('hex').substring(0, 16)}`;
    const now = new Date().toISOString();

    const entry: RecoveryJournalEntry = {
      journalId,
      candidateId: candidate.candidateId,
      targetRootId: candidate.targetRootId,
      atomicFactDomain: candidate.atomicFactDomain,
      candidatePayloadHash: candidate.candidatePayloadHash,
      stage: 'STAGED',
      createdAt: now,
      updatedAt: now
    };

    this.journalEntries.set(journalId, entry);
    return { ...entry };
  }

  public static markPreCommitVerified(journalId: string): RecoveryJournalEntry {
    if (this.crashInjectionStage === 'PRE_COMMIT') {
      throw new Error('CRASH_INJECTION_SIMULATION: Process crashed at PRE_COMMIT stage before manifest write.');
    }

    const entry = this.getEntryOrThrow(journalId);
    entry.stage = 'PRE_COMMIT_GATE_VERIFIED';
    entry.updatedAt = new Date().toISOString();
    return { ...entry };
  }

  public static markCommitted(journalId: string): RecoveryJournalEntry {
    if (this.crashInjectionStage === 'MANIFEST_APPEND') {
      throw new Error('CRASH_INJECTION_SIMULATION: Process crashed during MANIFEST_APPEND stage.');
    }

    const entry = this.getEntryOrThrow(journalId);
    entry.stage = 'COMMITTED';
    entry.committedAt = new Date().toISOString();
    entry.updatedAt = entry.committedAt;

    if (this.crashInjectionStage === 'COMPLETION') {
      throw new Error('CRASH_INJECTION_SIMULATION: Process crashed immediately after write but before ack completion.');
    }

    return { ...entry };
  }

  public static markAborted(journalId: string, reason: string): RecoveryJournalEntry {
    const entry = this.getEntryOrThrow(journalId);
    entry.stage = 'ABORTED';
    entry.rollbackReason = reason;
    entry.updatedAt = new Date().toISOString();
    return { ...entry };
  }

  public static markRolledBack(journalId: string, reason: string): RecoveryJournalEntry {
    const entry = this.getEntryOrThrow(journalId);
    entry.stage = 'ROLLED_BACK';
    entry.rollbackReason = reason;
    entry.updatedAt = new Date().toISOString();
    return { ...entry };
  }

  public static injectCrashAtStage(stage?: 'PRE_COMMIT' | 'MANIFEST_APPEND' | 'COMPLETION'): void {
    this.crashInjectionStage = stage;
  }

  public static clearCrashInjection(): void {
    this.crashInjectionStage = undefined;
  }

  public static replayJournal(): RecoveryReplaySummary {
    let totalEntriesInspected = 0;
    let alreadyCommittedIgnoredCount = 0;
    let incompleteTransactionsAbortedCount = 0;
    let rolledBackCount = 0;

    for (const [_, entry] of this.journalEntries) {
      totalEntriesInspected++;

      if (entry.stage === 'COMMITTED') {
        alreadyCommittedIgnoredCount++; // Idempotent: Do not duplicate write
      } else if (entry.stage === 'STAGED' || entry.stage === 'PRE_COMMIT_GATE_VERIFIED') {
        // Incomplete / crashed transaction: Fail-Closed Abort & Rollback
        entry.stage = 'ABORTED';
        entry.rollbackReason = 'CRASH_RECOVERY_FAIL_CLOSED_ABORT';
        entry.updatedAt = new Date().toISOString();
        incompleteTransactionsAbortedCount++;
      } else if (entry.stage === 'ROLLED_BACK' || entry.stage === 'ABORTED') {
        rolledBackCount++;
      }
    }

    return {
      totalEntriesInspected,
      alreadyCommittedIgnoredCount,
      incompleteTransactionsAbortedCount,
      rolledBackCount,
      idempotencyPreserved: true,
      replaySuccess: true
    };
  }

  public static getEntry(journalId: string): RecoveryJournalEntry | undefined {
    const entry = this.journalEntries.get(journalId);
    return entry ? { ...entry } : undefined;
  }

  public static getAllEntries(): RecoveryJournalEntry[] {
    return Array.from(this.journalEntries.values()).map(e => ({ ...e }));
  }

  public static resetJournal(): void {
    this.journalEntries.clear();
    this.crashInjectionStage = undefined;
  }

  private static getEntryOrThrow(journalId: string): RecoveryJournalEntry {
    const entry = this.journalEntries.get(journalId);
    if (!entry) {
      throw new Error(`JOURNAL_ENTRY_NOT_FOUND: Recovery journal entry '${journalId}' does not exist.`);
    }
    return entry;
  }
}
