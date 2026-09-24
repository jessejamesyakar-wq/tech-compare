export type CodePathClassification = 'PROTECTED_PATH' | 'UNPROTECTED_PATH' | 'BYPASS_CANDIDATE' | 'NOT_APPLICABLE';

export interface CodePathAuditEntry {
  pathIdentifier: string;
  location: string;
  purpose: string;
  classification: CodePathClassification;
  riskAssessment: string;
}

export interface BypassAnalysisReport {
  evaluatedAt: string;
  totalPathsAudited: number;
  protectedPathsCount: number;
  unprotectedPathsCount: number;
  bypassCandidatesCount: number;
  pathEntries: CodePathAuditEntry[];
  overallSecurityStatus: 'SAFE_NO_UNPROTECTED_WRITES' | 'BYPASS_RISK_IDENTIFIED';
}

export function performBypassAnalysis(): BypassAnalysisReport {
  const pathEntries: CodePathAuditEntry[] = [
    {
      pathIdentifier: 'TRUST_CONTROL_PLANE_PIPELINE',
      location: 'src/lib/trustLayer/enforce/preWriteEnforcementGate.ts',
      purpose: 'Pre-commit gate for spec ingestion and candidate writes',
      classification: 'PROTECTED_PATH',
      riskAssessment: 'Safe. Enforces manifest, Golden dataset, and price firewalls.'
    },
    {
      pathIdentifier: 'ADMIN_PRICE_UPDATES_ROUTE',
      location: 'src/app/api/admin/price-updates/route.ts',
      purpose: 'Admin merchant price sync API endpoint',
      classification: 'PROTECTED_PATH',
      riskAssessment: 'Price system isolated. Does not access spec ingestion pipeline.'
    },
    {
      pathIdentifier: 'CRON_SCRAPE_PRICES_ROUTE',
      location: 'src/app/api/cron/scrape-prices/route.ts',
      purpose: 'Daily merchant price scraper cron job',
      classification: 'PROTECTED_PATH',
      riskAssessment: 'Price firewall enforces WRITE_REACHABLE_TO_PRICE = 0 for spec pipeline.'
    },
    {
      pathIdentifier: 'LEGACY_DIRECT_WRITE_SCRIPTS',
      location: 'run_all_applies.cjs',
      purpose: 'Phase 7 legacy ingestion scripts',
      classification: 'BYPASS_CANDIDATE',
      riskAssessment: 'Legacy scripts exist for historical testing but are NOT executed in Phase 8-C. Pre-write gate must wrap all future execution.'
    }
  ];

  const bypassCandidatesCount = pathEntries.filter(e => e.classification === 'BYPASS_CANDIDATE').length;

  return {
    evaluatedAt: new Date().toISOString(),
    totalPathsAudited: pathEntries.length,
    protectedPathsCount: pathEntries.filter(e => e.classification === 'PROTECTED_PATH').length,
    unprotectedPathsCount: pathEntries.filter(e => e.classification === 'UNPROTECTED_PATH').length,
    bypassCandidatesCount,
    pathEntries,
    overallSecurityStatus: bypassCandidatesCount === 0 ? 'SAFE_NO_UNPROTECTED_WRITES' : 'BYPASS_RISK_IDENTIFIED'
  };
}
