import crypto from 'node:crypto';
import { PostgresDatabaseEngine } from './postgresClient';
import { PostgresTrustStoreAdapter } from './postgresTrustStore';
import { PostgresCatalogRepository } from '../catalog/catalogRepository';
import { JsonCatalogBaseline } from '../baseline/jsonCatalogBaseline';

export interface PostgresWriteRequest {
  candidateId: string;
  targetRootId: string;
  atomicFactDomain: string;
  claimValue: any;
  provenanceType: 'REAL_LIVE_HTTP';
  sourceType: string;
  requestedUrl?: string;
  policyVersion: string;
  policyHash: string;
  candidatePayloadHash: string;
  manifestId: string;
  idempotencyKey: string;
  expectedVersion: number;
}

export interface PostgresWriteResult {
  status: 'COMMITTED' | 'ROLLED_BACK' | 'REJECTED';
  transactionId: string;
  targetRootId: string;
  atomicFactDomain: string;
  oldValueHash?: string;
  newValueHash?: string;
  newVersion?: number;
  rejectionReason?: string;
  auditEventId?: string;
}

export class PostgresAuthorizedWriter {
  private static catalogRepo = new PostgresCatalogRepository();

  public static async executeAuthorizedWrite(
    req: PostgresWriteRequest
  ): Promise<PostgresWriteResult> {
    const transactionId = `TX_PG_${crypto.randomBytes(6).toString('hex')}`;

    // 0. Circuit Breaker Pre-Flight Check
    const cb = PostgresTrustStoreAdapter.loadCircuitBreakerState();
    if (cb && cb.state === 'OPEN') {
      return {
        status: 'REJECTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: `ENFORCEMENT_CIRCUIT_BREAKER_OPEN: ${cb.message || 'Circuit breaker is OPEN.'}`
      };
    }

    // 1. Price Firewall Enforcement
    if (
      req.atomicFactDomain.includes('price') ||
      req.atomicFactDomain.includes('storeOffers') ||
      req.atomicFactDomain.includes('basePrice')
    ) {
      return {
        status: 'REJECTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: 'PRICE_FIREWALL_BREACH: Spec write path cannot modify price attributes.'
      };
    }

    // 2. Golden Dataset Protection
    const baseline = JsonCatalogBaseline.generateBaseline();
    if (baseline.goldenRootIds.includes(req.targetRootId)) {
      return {
        status: 'REJECTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: 'ENF_GOLDEN_MUTATION: Golden Dataset V1 roots are immutable.'
      };
    }

    // 3. Known Legacy Protection
    if (baseline.knownLegacyRootIds.includes(req.targetRootId)) {
      return {
        status: 'REJECTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: 'ENF_KNOWN_LEGACY_MUTATION: Known Legacy Huawei duplicate roots are protected.'
      };
    }

    // 4. Durable Idempotency Check (Evaluated before single-use manifest reuse so identical retries return ALREADY_APPLIED)
    const existingIdemp = PostgresTrustStoreAdapter.checkIdempotency(req.idempotencyKey);
    if (existingIdemp) {
      return {
        status: 'COMMITTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: 'ALREADY_APPLIED: Idempotency key already committed.'
      };
    }

    // 5. Single-Use Authorization Manifest Check
    const auth = PostgresTrustStoreAdapter.loadAuthorization(req.manifestId);
    if (!auth) {
      return {
        status: 'REJECTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: `UNAUTHORIZED_MANIFEST: Manifest ID ${req.manifestId} not found.`
      };
    }
    if (auth.status === 'COMMITTED') {
      return {
        status: 'REJECTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: `MANIFEST_REUSED: Manifest ID ${req.manifestId} has already been consumed.`
      };
    }

    // -------------------------------------------------------------
    // BEGIN POSTGRES TRANSACTION BOUNDARY
    // -------------------------------------------------------------
    try {
      PostgresDatabaseEngine.beginTransaction();

      const now = new Date().toISOString();
      const journalId = `wal_${crypto.randomBytes(6).toString('hex')}`;
      PostgresTrustStoreAdapter.saveWALEntry({
        journalId,
        candidateId: req.candidateId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        stage: 'STAGED',
        candidatePayloadHash: req.candidatePayloadHash,
        createdAt: now,
        updatedAt: now
      });

      // Fetch target catalog document
      const currentDoc = await this.catalogRepo.getProduct(req.targetRootId);
      if (!currentDoc) {
        PostgresDatabaseEngine.rollbackTransaction();
        return {
          status: 'REJECTED',
          transactionId,
          targetRootId: req.targetRootId,
          atomicFactDomain: req.atomicFactDomain,
          rejectionReason: `TARGET_ROOT_NOT_FOUND: Product ${req.targetRootId} does not exist.`
        };
      }

      const oldValueHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(currentDoc))
        .digest('hex');

      // Mutate document spec field safely
      const updatedDoc = JSON.parse(JSON.stringify(currentDoc));
      if (!updatedDoc.specs) updatedDoc.specs = {};
      const domainParts = req.atomicFactDomain.split('.');
      let ptr = updatedDoc;
      for (let i = 0; i < domainParts.length - 1; i++) {
        const p = domainParts[i];
        if (!ptr[p]) ptr[p] = {};
        ptr = ptr[p];
      }
      ptr[domainParts[domainParts.length - 1]] = req.claimValue;

      const newValueHash = crypto
        .createHash('sha256')
        .update(JSON.stringify(updatedDoc))
        .digest('hex');

      // Optimistic Concurrency Update against DB
      const updateRes = await this.catalogRepo.updateProduct(
        req.targetRootId,
        updatedDoc,
        req.expectedVersion
      );

      if (!updateRes.success || updateRes.conflict) {
        PostgresDatabaseEngine.rollbackTransaction();
        return {
          status: 'ROLLED_BACK',
          transactionId,
          targetRootId: req.targetRootId,
          atomicFactDomain: req.atomicFactDomain,
          rejectionReason: updateRes.errorMessage || 'CONCURRENT_MODIFICATION_DETECTED'
        };
      }

      // Append Chained Audit Event
      const auditEventId = `evt_pg_${crypto.randomBytes(6).toString('hex')}`;
      const lastAudits = PostgresTrustStoreAdapter.loadAuditRecords();
      const prevHash = lastAudits.length > 0 ? lastAudits[lastAudits.length - 1].eventHash : 'GENESIS_PREV_HASH';
      const eventHash = crypto
        .createHash('sha256')
        .update(`${auditEventId}:${req.targetRootId}:${req.candidatePayloadHash}:${prevHash}`)
        .digest('hex');

      PostgresTrustStoreAdapter.saveAuditRecord({
        eventId: auditEventId,
        eventType: 'ATOMIC_FACT_EVIDENCE_COMMITTED',
        timestamp: new Date().toISOString(),
        payloadHash: req.candidatePayloadHash,
        prevHash,
        eventHash,
        data: {
          targetRootId: req.targetRootId,
          atomicFactDomain: req.atomicFactDomain,
          oldValueHash,
          newValueHash,
          policyVersion: req.policyVersion,
          policyHash: req.policyHash,
          candidateId: req.candidateId,
          manifestId: req.manifestId
        }
      });

      // Save Idempotency Record (DB Unique Constraint enforced)
      const idempRes = PostgresTrustStoreAdapter.saveIdempotencyRecord({
        idempotencyKey: req.idempotencyKey,
        candidateId: req.candidateId,
        targetRootId: req.targetRootId,
        factDomain: req.atomicFactDomain,
        status: 'COMMITTED',
        manifestId: req.manifestId
      });

      if (!idempRes.success) {
        PostgresDatabaseEngine.rollbackTransaction();
        return {
          status: 'ROLLED_BACK',
          transactionId,
          targetRootId: req.targetRootId,
          atomicFactDomain: req.atomicFactDomain,
          rejectionReason: 'IDEMPOTENCY_CONSTRAINT_VIOLATION'
        };
      }

      // Update Authorization Manifest Status to COMMITTED
      auth.status = 'COMMITTED';
      auth.usedAt = new Date().toISOString();
      PostgresTrustStoreAdapter.saveAuthorization(auth);

      // Update WAL stage to COMMITTED
      PostgresTrustStoreAdapter.saveWALEntry({
        journalId,
        candidateId: req.candidateId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        stage: 'COMMITTED',
        candidatePayloadHash: req.candidatePayloadHash,
        createdAt: now,
        updatedAt: new Date().toISOString()
      });

      // COMMIT TRANSACTION
      PostgresDatabaseEngine.commitTransaction();

      return {
        status: 'COMMITTED',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        oldValueHash,
        newValueHash,
        newVersion: updateRes.newVersion,
        auditEventId
      };
    } catch (err: any) {
      PostgresDatabaseEngine.rollbackTransaction();
      return {
        status: 'ROLLED_BACK',
        transactionId,
        targetRootId: req.targetRootId,
        atomicFactDomain: req.atomicFactDomain,
        rejectionReason: `POSTGRES_TRANSACTION_FAILURE: ${err.message}`
      };
    }
  }
}
