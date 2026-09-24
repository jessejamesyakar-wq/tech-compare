import crypto from 'node:crypto';

export interface SqlQueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export class PostgresDatabaseEngine {
  private static simulateOutage: boolean = false;

  // In-memory SQL tables for test execution & staging fallback
  private static tables: {
    catalog_products: Map<string, any>;
    catalog_evidence: Map<string, any>;
    trust_audit_events: Map<string, any>;
    trust_wal_operations: Map<string, any>;
    trust_authorizations: Map<string, any>;
    trust_idempotency: Map<string, any>;
    trust_circuit_breakers: Map<string, any>;
    trust_policy_history: Map<string, any>;
    trust_retrieval_artifacts: Map<string, any>;
  } = {
    catalog_products: new Map(),
    catalog_evidence: new Map(),
    trust_audit_events: new Map(),
    trust_wal_operations: new Map(),
    trust_authorizations: new Map(),
    trust_idempotency: new Map(),
    trust_circuit_breakers: new Map(),
    trust_policy_history: new Map(),
    trust_retrieval_artifacts: new Map()
  };

  private static auditSeq: number = 0;
  private static activeTransaction: boolean = false;
  private static transactionSnapshot: any = null;
  private static auditAppendLock: boolean = false;

  public static setOutageSimulation(active: boolean): void {
    this.simulateOutage = active;
  }

  public static isOutageSimulated(): boolean {
    return this.simulateOutage;
  }

  public static isPostgresConnected(): boolean {
    if (this.simulateOutage) return false;
    return true;
  }

  public static resetDatabaseState(): void {
    this.tables = {
      catalog_products: new Map(),
      catalog_evidence: new Map(),
      trust_audit_events: new Map(),
      trust_wal_operations: new Map(),
      trust_authorizations: new Map(),
      trust_idempotency: new Map(),
      trust_circuit_breakers: new Map(),
      trust_policy_history: new Map(),
      trust_retrieval_artifacts: new Map()
    };
    this.auditSeq = 0;
    this.activeTransaction = false;
    this.transactionSnapshot = null;
    this.simulateOutage = false;
    this.auditAppendLock = false;
  }

  // Transaction control
  public static beginTransaction(): void {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Connection to PostgreSQL database failed.');
    }
    this.activeTransaction = true;
    this.transactionSnapshot = {
      catalog_products: new Map(this.tables.catalog_products),
      catalog_evidence: new Map(this.tables.catalog_evidence),
      trust_audit_events: new Map(this.tables.trust_audit_events),
      trust_wal_operations: new Map(this.tables.trust_wal_operations),
      trust_authorizations: new Map(this.tables.trust_authorizations),
      trust_idempotency: new Map(this.tables.trust_idempotency),
      trust_circuit_breakers: new Map(this.tables.trust_circuit_breakers),
      trust_policy_history: new Map(this.tables.trust_policy_history),
      trust_retrieval_artifacts: new Map(this.tables.trust_retrieval_artifacts),
      auditSeq: this.auditSeq
    };
  }

  public static commitTransaction(): void {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Transaction commit failed due to database outage.');
    }
    this.activeTransaction = false;
    this.transactionSnapshot = null;
  }

  public static rollbackTransaction(): void {
    if (this.transactionSnapshot) {
      this.tables = {
        catalog_products: new Map(this.transactionSnapshot.catalog_products),
        catalog_evidence: new Map(this.transactionSnapshot.catalog_evidence),
        trust_audit_events: new Map(this.transactionSnapshot.trust_audit_events),
        trust_wal_operations: new Map(this.transactionSnapshot.trust_wal_operations),
        trust_authorizations: new Map(this.transactionSnapshot.trust_authorizations),
        trust_idempotency: new Map(this.transactionSnapshot.trust_idempotency),
        trust_circuit_breakers: new Map(this.transactionSnapshot.trust_circuit_breakers),
        trust_policy_history: new Map(this.transactionSnapshot.trust_policy_history),
        trust_retrieval_artifacts: new Map(this.transactionSnapshot.trust_retrieval_artifacts)
      };
      this.auditSeq = this.transactionSnapshot.auditSeq;
    }
    this.activeTransaction = false;
    this.transactionSnapshot = null;
  }

  // Catalog Products Operations
  public static upsertProduct(product: {
    root_id: string;
    brand: string;
    canonical_name: string;
    catalog_document: any;
    document_hash: string;
    version: number;
  }): { success: boolean; conflict?: boolean } {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Database unavailable for product write.');
    }
    const existing = this.tables.catalog_products.get(product.root_id);
    if (existing) {
      if (existing.version !== product.version) {
        return { success: false, conflict: true };
      }
      const updated = {
        ...product,
        version: existing.version + 1,
        created_at: existing.created_at,
        updated_at: new Date().toISOString(),
        status: 'ACTIVE'
      };
      this.tables.catalog_products.set(product.root_id, updated);
      return { success: true };
    } else {
      const inserted = {
        ...product,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'ACTIVE'
      };
      this.tables.catalog_products.set(product.root_id, inserted);
      return { success: true };
    }
  }

  public static getProduct(root_id: string): any | null {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Database read failed.');
    }
    return this.tables.catalog_products.get(root_id) || null;
  }

  public static getAllProducts(): any[] {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Database query failed.');
    }
    return Array.from(this.tables.catalog_products.values());
  }

  // Thread-Safe Chained Audit Event Operations (FOR UPDATE Lock Simulation)
  public static appendAuditEvent(eventInput: any): { success: boolean; event: any } {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Audit record write failed.');
    }

    // Acquire chain-head lock for serializing concurrent serverless appends
    while (this.auditAppendLock) {
      // Synchronous spin-wait
    }
    this.auditAppendLock = true;

    try {
      if (this.tables.trust_audit_events.has(eventInput.event_id)) {
        throw new Error(`UNIQUE_CONSTRAINT_VIOLATION: Audit event_id ${eventInput.event_id} already exists.`);
      }

      // Fetch current chain head to bind previous_event_hash deterministically
      const events = Array.from(this.tables.trust_audit_events.values()).sort(
        (a, b) => a.sequence_number - b.sequence_number
      );

      const lastHead = events.length > 0 ? events[events.length - 1] : null;
      const prevHash = lastHead ? lastHead.event_hash : 'GENESIS_PREV_HASH';

      this.auditSeq += 1;
      const seqNumber = this.auditSeq;

      // Calculate tamper-proof cryptographic event hash bound to previous chain head
      const eventHash = crypto
        .createHash('sha256')
        .update(`${eventInput.event_id}:${seqNumber}:${eventInput.entity_id}:${eventInput.payload_hash}:${prevHash}`)
        .digest('hex');

      const fullEvent = {
        ...eventInput,
        sequence_number: seqNumber,
        previous_event_hash: prevHash,
        event_hash: eventHash,
        created_at: new Date().toISOString()
      };

      this.tables.trust_audit_events.set(eventInput.event_id, fullEvent);
      return { success: true, event: fullEvent };
    } finally {
      this.auditAppendLock = false;
    }
  }

  public static getAuditEvents(): any[] {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Audit query failed.');
    }
    return Array.from(this.tables.trust_audit_events.values()).sort(
      (a, b) => a.sequence_number - b.sequence_number
    );
  }

  /**
   * Performs full-chain cryptographic audit verification walking events in order.
   * Note: PostgreSQL sequence_number may legitimately contain gaps (e.g., rolled-back transactions).
   * Sequence gaps do NOT constitute audit corruption.
   */
  public static verifyAuditChainIntegrity(): {
    valid: boolean;
    count: number;
    reason?: string;
  } {
    const events = this.getAuditEvents();
    if (events.length === 0) {
      return { valid: true, count: 0 };
    }

    const seenEventIds = new Set<string>();

    for (let i = 0; i < events.length; i++) {
      const current = events[i];

      // 1. Unique event_id check
      if (seenEventIds.has(current.event_id)) {
        return {
          valid: false,
          count: events.length,
          reason: `DUPLICATE_EVENT_ID: Event ${current.event_id} appears multiple times.`
        };
      }
      seenEventIds.add(current.event_id);

      // 2. Monotonic sequence check (sequence numbers must strictly increase, but gaps are permitted)
      if (i > 0) {
        const predecessor = events[i - 1];
        if (current.sequence_number <= predecessor.sequence_number) {
          return {
            valid: false,
            count: events.length,
            reason: `NON_MONOTONIC_SEQUENCE: Event ${current.event_id} sequence ${current.sequence_number} is not greater than predecessor ${predecessor.sequence_number}.`
          };
        }
      }

      // 3. Cryptographic hash chain link check
      const expectedPrevHash = i === 0 ? 'GENESIS_PREV_HASH' : events[i - 1].event_hash;
      if (current.previous_event_hash !== expectedPrevHash) {
        return {
          valid: false,
          count: events.length,
          reason: `FORKED_CHAIN_HEAD_DETECTED: Event ${current.event_id} previous_event_hash ${current.previous_event_hash} does not match predecessor ${expectedPrevHash}.`
        };
      }

      // 4. Event content hash integrity check
      const expectedHash = crypto
        .createHash('sha256')
        .update(`${current.event_id}:${current.sequence_number}:${current.entity_id}:${current.payload_hash}:${expectedPrevHash}`)
        .digest('hex');

      if (current.event_hash !== expectedHash) {
        return {
          valid: false,
          count: events.length,
          reason: `TAMPERED_EVENT_HASH: Event ${current.event_id} hash mismatch.`
        };
      }
    }

    return { valid: true, count: events.length };
  }

  // WAL Operations
  public static saveWAL(wal: any): void {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: WAL write failed.');
    }
    const existing = this.tables.trust_wal_operations.get(wal.journal_id);
    const record = {
      ...wal,
      created_at: existing ? existing.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.tables.trust_wal_operations.set(wal.journal_id, record);
  }

  public static getWALEntries(): any[] {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: WAL load failed.');
    }
    return Array.from(this.tables.trust_wal_operations.values());
  }

  // Idempotency Operations
  public static saveIdempotency(rec: {
    idempotency_key: string;
    candidate_id: string;
    target_root_id: string;
    fact_domain: string;
    status: string;
    manifest_id: string;
  }): { success: boolean; duplicate?: boolean } {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Idempotency write failed.');
    }
    if (this.tables.trust_idempotency.has(rec.idempotency_key)) {
      return { success: false, duplicate: true };
    }
    const record = {
      ...rec,
      committed_at: new Date().toISOString()
    };
    this.tables.trust_idempotency.set(rec.idempotency_key, record);
    return { success: true };
  }

  public static getIdempotency(idempotency_key: string): any | null {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Idempotency check failed.');
    }
    return this.tables.trust_idempotency.get(idempotency_key) || null;
  }

  // Circuit Breaker Operations
  public static saveCircuitBreaker(cb: {
    scope?: string;
    state: 'CLOSED' | 'OPEN';
    trip_reason?: string;
    tripped_at?: string;
    trip_count: number;
    message: string;
    policy_version: string;
  }): void {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Circuit breaker write failed.');
    }
    const scope = cb.scope || 'GLOBAL';
    const record = {
      ...cb,
      scope,
      updated_at: new Date().toISOString()
    };
    this.tables.trust_circuit_breakers.set(scope, record);
  }

  public static getCircuitBreaker(scope: string = 'GLOBAL'): any | null {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Circuit breaker read failed.');
    }
    return this.tables.trust_circuit_breakers.get(scope) || null;
  }

  // Authorizations Operations
  public static saveAuthorization(auth: {
    manifest_id: string;
    target_roots: any[];
    allowed_operations: any[];
    allowed_domains: any[];
    candidate_payload_hash: string;
    policy_version: string;
    policy_hash: string;
    expires_at: string;
    status: string;
  }): void {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Authorization write failed.');
    }
    const record = {
      ...auth,
      created_at: new Date().toISOString()
    };
    this.tables.trust_authorizations.set(auth.manifest_id, record);
  }

  public static getAuthorization(manifest_id: string): any | null {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Authorization read failed.');
    }
    return this.tables.trust_authorizations.get(manifest_id) || null;
  }

  // Policy History Operations
  public static savePolicyHistory(entry: {
    policy_version: string;
    policy_hash: string;
    revision: string;
    policy_document?: any;
  }): void {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Policy history write failed.');
    }
    const record = {
      ...entry,
      activated_at: new Date().toISOString()
    };
    this.tables.trust_policy_history.set(entry.policy_version, record);
  }

  public static getPolicyHistory(): any[] {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Policy history query failed.');
    }
    return Array.from(this.tables.trust_policy_history.values());
  }

  // Retrieval Artifacts Operations
  public static saveRetrievalArtifact(artifact: any): void {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Retrieval artifact write failed.');
    }
    this.tables.trust_retrieval_artifacts.set(artifact.retrieval_artifact_id, {
      ...artifact,
      retrieved_at: new Date().toISOString()
    });
  }

  public static getRetrievalArtifact(artifact_id: string): any | null {
    if (this.simulateOutage) {
      throw new Error('DURABLE_BACKEND_UNAVAILABLE: Retrieval artifact read failed.');
    }
    return this.tables.trust_retrieval_artifacts.get(artifact_id) || null;
  }
}
