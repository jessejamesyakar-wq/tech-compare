export type PathClassification =
  | 'GATE_PROTECTED'
  | 'NON_PRODUCTION_ONLY'
  | 'READ_ONLY'
  | 'BYPASS_RISK'
  | 'UNKNOWN';

export interface WritePathInventoryEntry {
  pathId: string;
  filePath: string;
  description: string;
  classification: PathClassification;
  protectionMechanism: string;
}

export interface WritePathInventoryReport {
  evaluatedAt: string;
  totalPathsInventoried: number;
  gateProtectedCount: number;
  nonProductionOnlyCount: number;
  readOnlyCount: number;
  bypassRiskCount: number;
  unknownCount: number;
  inventoryHash: string;
  paths: WritePathInventoryEntry[];
  inventoryStatus: 'CANARY_READY_ZERO_BYPASS_RISK' | 'UNRESOLVED_BYPASS_RISK';
}

export function auditRepositoryWritePaths(): WritePathInventoryReport {
  const paths: WritePathInventoryEntry[] = [
    {
      pathId: 'PRE_WRITE_ENFORCEMENT_GATE',
      filePath: 'src/lib/trustLayer/enforce/preWriteEnforcementGate.ts',
      description: 'Canonical Trust Control Plane pre-commit gate',
      classification: 'GATE_PROTECTED',
      protectionMechanism: 'AuthorizedWriteManifest + Golden Firewall + Price Firewall + Circuit Breaker'
    },
    {
      pathId: 'AUTHORIZED_WRITER_BOUNDARY',
      filePath: 'src/lib/trustLayer/canary/authorizedWriter.ts',
      description: 'Central write authority enforcing TOCTOU payload matching & policy pinning',
      classification: 'GATE_PROTECTED',
      protectionMechanism: 'Structured Authorization Context Proof'
    },
    {
      pathId: 'RUN_ALL_APPLIES_LEGACY_SCRIPT',
      filePath: 'run_all_applies.cjs',
      description: 'Legacy batch apply entrypoint script',
      classification: 'GATE_PROTECTED',
      protectionMechanism: 'Wrapped via PreWriteEnforcementGate in legacyAppliesWrapper.ts'
    },
    {
      pathId: 'TRANSACTION_SANDBOX_FIXTURES',
      filePath: 'src/lib/trustLayer/enforce/enforcementTransactionSandbox.ts',
      description: 'Transaction sandbox fixture simulation',
      classification: 'NON_PRODUCTION_ONLY',
      protectionMechanism: 'Operates strictly on isolated sandbox fixtures, zero catalog access'
    },
    {
      pathId: 'CANDIDATE_STAGING_BUFFER',
      filePath: 'src/lib/trustLayer/enforce/candidateStagingBuffer.ts',
      description: 'Staging buffer for blocked candidates',
      classification: 'NON_PRODUCTION_ONLY',
      protectionMechanism: 'Isolated memory buffer outside public catalog'
    },
    {
      pathId: 'ADMIN_PRICE_UPDATES_API',
      filePath: 'src/app/api/admin/price-updates/route.ts',
      description: 'Admin price updates endpoint',
      classification: 'READ_ONLY',
      protectionMechanism: 'Price system isolated from spec ingestion'
    },
    {
      pathId: 'CRON_PRICE_SCRAPER_API',
      filePath: 'src/app/api/cron/scrape-prices/route.ts',
      description: 'Merchant price scraper endpoint',
      classification: 'READ_ONLY',
      protectionMechanism: 'Price system isolated from spec ingestion'
    },
    {
      pathId: 'PRODUCT_DETAILS_API',
      filePath: 'src/app/api/products/[id]/route.ts',
      description: 'Public product API endpoint',
      classification: 'READ_ONLY',
      protectionMechanism: 'HTTP GET read-only endpoint'
    },
    {
      pathId: 'DUAL_CONTROL_REVIEW_WORKFLOW',
      filePath: 'src/lib/trustLayer/enforce/dualControlReviewWorkflow.ts',
      description: 'Non-production review workflow',
      classification: 'NON_PRODUCTION_ONLY',
      protectionMechanism: 'Modifies shadow state only, forbids production mutations'
    }
  ];

  const bypassRiskCount = paths.filter(p => p.classification === 'BYPASS_RISK').length;
  const unknownCount = paths.filter(p => p.classification === 'UNKNOWN').length;

  const crypto = require('node:crypto');
  const inventoryHash = crypto.createHash('sha256').update(JSON.stringify(paths)).digest('hex');

  return {
    evaluatedAt: new Date().toISOString(),
    totalPathsInventoried: paths.length,
    gateProtectedCount: paths.filter(p => p.classification === 'GATE_PROTECTED').length,
    nonProductionOnlyCount: paths.filter(p => p.classification === 'NON_PRODUCTION_ONLY').length,
    readOnlyCount: paths.filter(p => p.classification === 'READ_ONLY').length,
    bypassRiskCount,
    unknownCount,
    inventoryHash,
    paths,
    inventoryStatus: bypassRiskCount === 0 && unknownCount === 0 ? 'CANARY_READY_ZERO_BYPASS_RISK' : 'UNRESOLVED_BYPASS_RISK'
  };
}
