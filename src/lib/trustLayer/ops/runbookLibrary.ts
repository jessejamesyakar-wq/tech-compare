export interface OperationalRunbook {
  runbookId: string;
  title: string;
  trigger: string;
  impact: string;
  automaticResponse: string;
  operatorActions: string[];
  validationChecks: string[];
  forbiddenActions: string[];
  resolutionCriteria: string;
}

export class RunbookLibrary {
  private static runbooks: Map<string, OperationalRunbook> = new Map([
    [
      'RUNBOOK_001_DB_OUTAGE',
      {
        runbookId: 'RUNBOOK_001_DB_OUTAGE',
        title: 'PostgreSQL Database Connection Outage',
        trigger: 'Postgres connection failed / DURABLE_BACKEND_UNAVAILABLE',
        impact: 'Write operations fail closed immediately. Read operations execute against cache/read replica.',
        automaticResponse: 'System transitions to READ_ONLY_SAFE_MODE. All write paths return DURABLE_BACKEND_UNAVAILABLE error.',
        operatorActions: [
          'Verify Neon PostgreSQL cluster health and connection string SSL settings.',
          'Check Vercel environment variables POSTGRES_URL and NEON_DATABASE_URL.',
          'Trigger connection pool health probe once DB recovers.'
        ],
        validationChecks: [
          'Run SELECT 1 health query via PostgresDatabaseEngine.',
          'Verify zero write operations fell back to local smartphonesData.json baseline.'
        ],
        forbiddenActions: [
          'DO NOT write to smartphonesData.json or local disk as write fallback.',
          'DO NOT bypass AuthorizedWriter gate during database outage.'
        ],
        resolutionCriteria: 'PostgreSQL connection restored; System Health transitions to HEALTHY.'
      }
    ],
    [
      'RUNBOOK_002_NEON_INCIDENT',
      {
        runbookId: 'RUNBOOK_002_NEON_INCIDENT',
        title: 'Neon Serverless Compute Escalation & Degradation',
        trigger: 'Neon API endpoint throttling, latency spikes > 500ms, or cold-start timeouts.',
        impact: 'Elevated transaction latency for AuthorizedWriter.',
        automaticResponse: 'System throttles candidate ingestion rate and records elevated SLI latency.',
        operatorActions: [
          'Check Neon status dashboard for us-east-1 compute health.',
          'Scale minimum Neon compute units if cold start latency is persistent.'
        ],
        validationChecks: ['Verify p95 transaction latency returns to < 100ms.'],
        forbiddenActions: ['DO NOT disable WAL logging to speed up transactions.'],
        resolutionCriteria: 'Neon compute metrics return to nominal parameters.'
      }
    ],
    [
      'RUNBOOK_003_GOLDEN_DRIFT',
      {
        runbookId: 'RUNBOOK_003_GOLDEN_DRIFT',
        title: 'Golden Dataset Root Mutation or Regression',
        trigger: 'Golden Dataset continuous monitor detects hash mismatch or displayed fact mutation on any of 83 Golden roots.',
        impact: 'CRITICAL governance breach.',
        automaticResponse: 'Circuit Breaker trips OPEN immediately. All write workflows are HALTED. System enters INCIDENT_REVIEW_REQUIRED.',
        operatorActions: [
          'Inspect Postgres audit log for the offending root_id.',
          'Verify if mutation was unauthorized write attempt or schema drift.',
          'Execute WAL recovery / PITR rollback to restore Golden dataset root state.'
        ],
        validationChecks: ['Run ContinuousMonitors.runGoldenDatasetCheck() -> clean: true (83/83).'],
        forbiddenActions: [
          'DO NOT disable Golden protection rule (ENF_GOLDEN_ROOT_MUTATION_FORBIDDEN).',
          'DO NOT force circuit breaker reset while Golden dataset remains corrupted.'
        ],
        resolutionCriteria: 'Golden Dataset V1 restored to 100% clean state (83/83) and explicit reset issued.'
      }
    ],
    [
      'RUNBOOK_004_AUDIT_CORRUPTION',
      {
        runbookId: 'RUNBOOK_004_AUDIT_CORRUPTION',
        title: 'Audit Hash Chain Tampering or Forked Head',
        trigger: 'verifyAuditChainIntegrity() returns valid: false due to hash mismatch, missing predecessor, or duplicate event ID.',
        impact: 'Loss of cryptographic audit provenance.',
        automaticResponse: 'Circuit Breaker trips OPEN globally. System Health transitions to INCIDENT_REVIEW_REQUIRED.',
        operatorActions: [
          'Identify corrupt event_id from audit verification reason.',
          'Compare Postgres trust_audit_events table against Neon PITR backup.',
          'Re-verify cryptographic hashes walking from genesis.'
        ],
        validationChecks: ['verifyAuditChainIntegrity() returns valid: true.'],
        forbiddenActions: [
          'DO NOT delete audit event rows manually.',
          'DO NOT treat sequence_number gap as audit corruption (sequence gaps are valid).'
        ],
        resolutionCriteria: 'Audit chain hash continuity restored and validated.'
      }
    ],
    [
      'RUNBOOK_005_CIRCUIT_BREAKER_OPEN',
      {
        runbookId: 'RUNBOOK_005_CIRCUIT_BREAKER_OPEN',
        title: 'Global Circuit Breaker Trip & Reset',
        trigger: 'Circuit Breaker status transitions to OPEN.',
        impact: 'All production writes blocked. System operates in READ_ONLY_SAFE_MODE.',
        automaticResponse: 'PreWriteEnforcementGate rejects all candidate submissions with ENF_CIRCUIT_BREAKER_OPEN.',
        operatorActions: [
          'Review trip_reason and associated CRITICAL alert.',
          'Resolve underlying root cause (Golden drift, DB failure, or price firewall breach).',
          'Issue explicit authorized EnforcementCircuitBreaker.reset() with audit event log.'
        ],
        validationChecks: ['EnforcementCircuitBreaker.getStatus().state === "CLOSED" persisted in Postgres.'],
        forbiddenActions: ['DO NOT issue circuit breaker reset without documenting root cause and resolution.'],
        resolutionCriteria: 'Circuit breaker reset successfully and persisted in database.'
      }
    ],
    [
      'RUNBOOK_006_PRICE_FIREWALL_BREACH',
      {
        runbookId: 'RUNBOOK_006_PRICE_FIREWALL_BREACH',
        title: 'Price Field Write Attempt or Firewall Breach',
        trigger: 'Attempted mutation of price, storeOffers, or priceHistory fields in spec workflow.',
        impact: 'CRITICAL pricing risk.',
        automaticResponse: 'Write is blocked immediately. Alert PRICE_FIREWALL_ATTEMPT raised. If actual mutation occurred, Circuit Breaker trips OPEN.',
        operatorActions: [
          'Audit caller code and manifest payload for price reachability.',
          'Verify WRITE_REACHABLE_TO_PRICE remains strictly 0.'
        ],
        validationChecks: ['ContinuousMonitors.runPriceFirewallCheck() -> protected: true, reachableCount: 0.'],
        forbiddenActions: ['DO NOT grant price field modification rights to spec/evidence ingestion workflows.'],
        resolutionCriteria: 'Zero price reachability confirmed across all admin spec workflows.'
      }
    ],
    [
      'RUNBOOK_007_MANUFACTURER_OUTAGE',
      {
        runbookId: 'RUNBOOK_007_MANUFACTURER_OUTAGE',
        title: 'Manufacturer Official Site Unavailability (429/403/500)',
        trigger: 'HTTP 429, 403, 500, or connection timeout during live HTTP provenance retrieval from official sources.',
        impact: 'Evidence retrieval fails for affected manufacturer domain.',
        automaticResponse: 'Retries bounded with exponential backoff. Zero fallback to synthetic provenance or third-party blogs.',
        operatorActions: [
          'Inspect source health dashboard for Samsung or Apple domains.',
          'If rate limited (429), reduce concurrent retrieval workers.'
        ],
        validationChecks: ['Verify no synthetic/mock provenance was injected during outage.'],
        forbiddenActions: ['DO NOT bypass HTTP source verification gate or generate mock provenance.'],
        resolutionCriteria: 'Official manufacturer site resumes responding with 200 OK.'
      }
    ],
    [
      'RUNBOOK_008_PARSER_DRIFT',
      {
        runbookId: 'RUNBOOK_008_PARSER_DRIFT',
        title: 'Manufacturer Specification HTML Structure Change',
        trigger: 'Parser contract failure / CLAIM_NOT_FOUND during specification extraction.',
        impact: 'Evidence extraction returns CLAIM_NOT_FOUND.',
        automaticResponse: 'Candidate is rejected with PARSER_CONTRACT_FAILURE. No corrupt values committed.',
        operatorActions: [
          'Inspect raw HTML DOM structure retrieved from official URL.',
          'Update CSS/XPath claim locator rules in test/staging before deploying parser update.'
        ],
        validationChecks: ['Verify locator extracts exact technical spec value without regex hallucinations.'],
        forbiddenActions: ['DO NOT extract values from unstructured page prose or arbitrary text snippets.'],
        resolutionCriteria: 'Parser locator updated and verified against live manufacturer HTML.'
      }
    ],
    [
      'RUNBOOK_009_IDENTITY_MISMATCH',
      {
        runbookId: 'RUNBOOK_009_IDENTITY_MISMATCH',
        title: 'Source vs Target Product Identity Mismatch',
        trigger: 'Retrieved provenance document identity (e.g. Galaxy S23) does not match target root (e.g. Galaxy S24).',
        impact: 'Candidate rejected with SOURCE_TARGET_IDENTITY_MISMATCH.',
        automaticResponse: 'Candidate blocked at PreWriteEnforcementGate. Zero catalog mutation.',
        operatorActions: [
          'Verify requested URL match against official product model page.',
          'Correct manifest target_root_id or source URL binding.'
        ],
        validationChecks: ['Validate exact match between model name, brand, and target catalog root.'],
        forbiddenActions: ['DO NOT force candidate commit when identity mismatch is flagged.'],
        resolutionCriteria: 'Target root and source identity confirmed 100% matching.'
      }
    ],
    [
      'RUNBOOK_010_WAL_RECOVERY',
      {
        runbookId: 'RUNBOOK_010_WAL_RECOVERY',
        title: 'Unfinished Transaction Recovery (WAL Journal)',
        trigger: 'System restart finds WAL entry with stage INTENT or WRITE_STARTED.',
        impact: 'Transient uncommitted write in WAL journal.',
        automaticResponse: 'Runtime recovery engine executes WAL recovery scan upon startup, completing or rolling back uncommitted entries.',
        operatorActions: [
          'Inspect Postgres trust_wal_operations table for STALE or HANGING entries.',
          'Verify whether transaction was committed to catalog_products.'
        ],
        validationChecks: ['PostgresTrustStoreAdapter.loadWALEntries() has 0 pending un-recovered journals.'],
        forbiddenActions: ['DO NOT purge WAL journal manually without verifying catalog product state.'],
        resolutionCriteria: 'All WAL journals reconciled to COMMITTED or ROLLED_BACK state.'
      }
    ],
    [
      'RUNBOOK_011_ROLLBACK_FAILURE',
      {
        runbookId: 'RUNBOOK_011_ROLLBACK_FAILURE',
        title: 'Atomic Transaction Rollback Failure',
        trigger: 'Postgres transaction rollback throws error or leaves catalog in inconsistent state.',
        impact: 'Potential partial write in database.',
        automaticResponse: 'System trips Circuit Breaker OPEN and halts write processing.',
        operatorActions: [
          'Inspect PostgreSQL WAL and catalog_products version numbers.',
          'Execute explicit database snapshot restore to last known clean transaction.'
        ],
        validationChecks: ['Confirm catalog product version matches clean state before failed write.'],
        forbiddenActions: ['DO NOT execute partial manual SQL UPDATE on catalog products.'],
        resolutionCriteria: 'Database catalog restored to consistent snapshot state.'
      }
    ],
    [
      'RUNBOOK_012_CACHE_DRIFT',
      {
        runbookId: 'RUNBOOK_012_CACHE_DRIFT',
        title: 'Canonical Postgres vs Derived Cache Projection Drift',
        trigger: 'Memory cache / derived projection doc hash differs from PostgreSQL catalog document hash.',
        impact: 'Stale read from memory cache.',
        automaticResponse: 'PostgreSQL canonical database overrides cache. Cache entry marked STALE.',
        operatorActions: ['Trigger in-memory cache purge / refresh from PostgreSQL catalog.'],
        validationChecks: ['Verify memoryProductsCache matches PostgreSQL catalog document hash.'],
        forbiddenActions: ['DO NOT rollback PostgreSQL canonical database because derived cache was stale.'],
        resolutionCriteria: 'Derived cache re-synchronized with PostgreSQL canonical authority.'
      }
    ],
    [
      'RUNBOOK_013_POLICY_MISMATCH',
      {
        runbookId: 'RUNBOOK_013_POLICY_MISMATCH',
        title: 'Enforcement Policy Hash Mismatch',
        trigger: 'Candidate manifest policy_hash does not match active policy enforcement_policy_v1.0.0.',
        impact: 'Candidate rejected with POLICY_VERSION_MISMATCH.',
        automaticResponse: 'PreWriteEnforcementGate blocks candidate.',
        operatorActions: ['Re-issue candidate manifest with active enforcement policy version and hash.'],
        validationChecks: ['Verify manifest policy_hash matches ENFORCEMENT_POLICY_HASH.'],
        forbiddenActions: ['DO NOT evaluate candidates with deprecated or modified policy hashes.'],
        resolutionCriteria: 'Manifest re-signed with correct active policy hash.'
      }
    ],
    [
      'RUNBOOK_014_KEY_ROTATION',
      {
        runbookId: 'RUNBOOK_014_KEY_ROTATION',
        title: 'Cryptographic Audit Signing Key Rotation',
        trigger: 'Scheduled key rotation or active key version update from key_v1 to key_v2.',
        impact: 'New audit events signed with key_v2.',
        automaticResponse: 'Audit engine registers key_v2 in trust_policy_history table. Historical events signed with key_v1 remain verifiable.',
        operatorActions: ['Activate key_v2 in environment configuration.'],
        validationChecks: [
          'Verify new events log key_version = key_v2.',
          'Verify historical events signed with key_v1 pass cryptographic audit verification.'
        ],
        forbiddenActions: ['DO NOT delete or re-sign historical key_v1 audit events.'],
        resolutionCriteria: 'Key rotation completed with 100% backward verification compatibility.'
      }
    ],
    [
      'RUNBOOK_015_PITR_RESTORE',
      {
        runbookId: 'RUNBOOK_015_PITR_RESTORE',
        title: 'Point-in-Time Recovery from Neon Branch',
        trigger: 'Catastrophic database corruption or governance recovery directive.',
        impact: 'Full environment restore to specified timestamp.',
        automaticResponse: 'System placed in READ_ONLY_SAFE_MODE during restore operation.',
        operatorActions: [
          'Create pre-restore manifest using NeonRestoreDrillEngine.createVerificationManifest().',
          'Provision new Neon recovery branch from target timestamp.',
          'Update POSTGRES_URL to target restored branch and run verification check.'
        ],
        validationChecks: [
          'Verify 905 catalog roots, 83 Golden clean, 8 Known Legacy clean, and audit chain head.'
        ],
        forbiddenActions: ['DO NOT overwrite production branch directly without prior branch validation.'],
        resolutionCriteria: 'Restored Neon branch verified and promoted to active production database.'
      }
    ]
  ]);

  public static getRunbook(runbookId: string): OperationalRunbook | undefined {
    return this.runbooks.get(runbookId);
  }

  public static getAllRunbooks(): OperationalRunbook[] {
    return Array.from(this.runbooks.values());
  }
}
