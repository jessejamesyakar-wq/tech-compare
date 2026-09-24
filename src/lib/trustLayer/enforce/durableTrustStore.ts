import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { RecoveryJournalEntry, JournalStage } from './durableRecoveryJournal';
import { CircuitBreakerStatus, CircuitBreakerTripReason } from './enforcementCircuitBreaker';
import { ENFORCEMENT_POLICY_VERSION } from './enforcementPolicyV1';

export interface DurableAuditRecord {
  eventId: string;
  eventType: string;
  timestamp: string;
  payloadHash: string;
  prevHash: string;
  eventHash: string;
  data: any;
}

export interface DurableIdempotencyRecord {
  idempotencyKey: string;
  candidateId: string;
  targetRootId: string;
  factDomain: string;
  status: 'COMMITTED' | 'ROLLED_BACK';
  committedAt: string;
  manifestId: string;
}

export interface DurableCircuitBreakerState {
  state: 'CLOSED' | 'OPEN';
  tripReason?: CircuitBreakerTripReason;
  trippedAt?: string;
  tripCount: number;
  message: string;
  persistedAt: string;
}

export interface DurablePolicyHistoryEntry {
  policyVersion: string;
  policyHash: string;
  activatedAt: string;
  revision: string;
}

export interface DurabilityBackendAssessment {
  storageClassification: 'LOCAL_DURABLE_FOR_CONTROLLED_HOST_ONLY';
  hostProcessSurvives: boolean;
  persistentLocalDiskAvailable: boolean;
  ephemeralFilesystem: boolean;
  serverlessDurabilityRequirement: 'DURABLE_BACKEND_SELECTION_REQUIRED';
  recommendedCloudBackends: string[];
}

export class DurableTrustStoreAdapter {
  private static storeDir = process.env.DURABLE_STORE_PATH || 'C:\\Users\\Alpdeniz\\AceleEtme_Audits\\durable_store';
  
  private static journalPath = path.join(DurableTrustStoreAdapter.storeDir, 'durable_wal_journal.json');
  private static auditPath = path.join(DurableTrustStoreAdapter.storeDir, 'durable_audit_chain.json');
  private static cbPath = path.join(DurableTrustStoreAdapter.storeDir, 'durable_circuit_breaker.json');
  private static idempotencyPath = path.join(DurableTrustStoreAdapter.storeDir, 'durable_idempotency.json');
  private static policyPath = path.join(DurableTrustStoreAdapter.storeDir, 'durable_policy_history.json');

  public static getDurabilityAssessment(): DurabilityBackendAssessment {
    return {
      storageClassification: 'LOCAL_DURABLE_FOR_CONTROLLED_HOST_ONLY',
      hostProcessSurvives: true,
      persistentLocalDiskAvailable: false,
      ephemeralFilesystem: true,
      serverlessDurabilityRequirement: 'DURABLE_BACKEND_SELECTION_REQUIRED',
      recommendedCloudBackends: ['AWS_S3', 'GCP_CLOUD_STORAGE', 'REDIS', 'POSTGRES_DYNAMO']
    };
  }

  private static ensureDirExists(): void {
    if (!fs.existsSync(this.storeDir)) {
      fs.mkdirSync(this.storeDir, { recursive: true });
    }
  }

  // 1. WAL Recovery Journal Operations
  public static saveWALEntry(entry: RecoveryJournalEntry): void {
    this.ensureDirExists();
    const entries = this.loadWALEntries();
    const idx = entries.findIndex(e => e.journalId === entry.journalId);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    fs.writeFileSync(this.journalPath, JSON.stringify(entries, null, 2), 'utf-8');
  }

  public static loadWALEntries(): RecoveryJournalEntry[] {
    this.ensureDirExists();
    if (!fs.existsSync(this.journalPath)) return [];
    try {
      const data = fs.readFileSync(this.journalPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // 2. Circuit Breaker Durability Operations
  public static saveCircuitBreakerState(status: CircuitBreakerStatus): void {
    this.ensureDirExists();
    const state: DurableCircuitBreakerState = {
      ...status,
      persistedAt: new Date().toISOString()
    };
    fs.writeFileSync(this.cbPath, JSON.stringify(state, null, 2), 'utf-8');
  }

  public static loadCircuitBreakerState(): DurableCircuitBreakerState | null {
    this.ensureDirExists();
    if (!fs.existsSync(this.cbPath)) return null;
    try {
      const data = fs.readFileSync(this.cbPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // 3. Idempotency Key Durability Operations
  public static saveIdempotencyRecord(rec: DurableIdempotencyRecord): void {
    this.ensureDirExists();
    const records = this.loadIdempotencyRecords();
    const idx = records.findIndex(r => r.idempotencyKey === rec.idempotencyKey);
    if (idx >= 0) {
      records[idx] = rec;
    } else {
      records.push(rec);
    }
    fs.writeFileSync(this.idempotencyPath, JSON.stringify(records, null, 2), 'utf-8');
  }

  public static loadIdempotencyRecords(): DurableIdempotencyRecord[] {
    this.ensureDirExists();
    if (!fs.existsSync(this.idempotencyPath)) return [];
    try {
      const data = fs.readFileSync(this.idempotencyPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static checkIdempotency(idempotencyKey: string): DurableIdempotencyRecord | undefined {
    const records = this.loadIdempotencyRecords();
    return records.find(r => r.idempotencyKey === idempotencyKey);
  }

  // 4. Audit Chain Durability Operations
  public static saveAuditRecord(record: DurableAuditRecord): void {
    this.ensureDirExists();
    const records = this.loadAuditRecords();
    records.push(record);
    fs.writeFileSync(this.auditPath, JSON.stringify(records, null, 2), 'utf-8');
  }

  public static loadAuditRecords(): DurableAuditRecord[] {
    this.ensureDirExists();
    if (!fs.existsSync(this.auditPath)) return [];
    try {
      const data = fs.readFileSync(this.auditPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // 5. Policy History Durability Operations
  public static savePolicyHistory(entry: DurablePolicyHistoryEntry): void {
    this.ensureDirExists();
    const history = this.loadPolicyHistory();
    history.push(entry);
    fs.writeFileSync(this.policyPath, JSON.stringify(history, null, 2), 'utf-8');
  }

  public static loadPolicyHistory(): DurablePolicyHistoryEntry[] {
    this.ensureDirExists();
    if (!fs.existsSync(this.policyPath)) return [];
    try {
      const data = fs.readFileSync(this.policyPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // 6. Complete Durable State Purge (for clean test environment initialization)
  public static resetDurableStore(): void {
    this.ensureDirExists();
    if (fs.existsSync(this.journalPath)) fs.unlinkSync(this.journalPath);
    if (fs.existsSync(this.auditPath)) fs.unlinkSync(this.auditPath);
    if (fs.existsSync(this.cbPath)) fs.unlinkSync(this.cbPath);
    if (fs.existsSync(this.idempotencyPath)) fs.unlinkSync(this.idempotencyPath);
    if (fs.existsSync(this.policyPath)) fs.unlinkSync(this.policyPath);
  }
}
