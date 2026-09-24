import { getFreshnessPolicyForDomain, DomainFreshnessPolicy } from './freshnessPolicies';

export type FreshnessState = 'FRESH' | 'AGING' | 'STALE' | 'EXPIRED' | 'NOT_TEMPORAL' | 'UNKNOWN_POLICY';

export interface DomainFreshnessResult {
  rootId: string;
  domain: string;
  sourceId: string;
  sourceName: string;
  lastUpdated: string;
  ageDays: number;
  freshnessState: FreshnessState;
  policyUsed: DomainFreshnessPolicy;
}

export interface SourceFreshnessReport {
  evaluatedAt: string;
  rootsEvaluated: number;
  freshCount: number;
  agingCount: number;
  staleCount: number;
  immutableCount: number;
  unknownPolicyCount: number;
  results: DomainFreshnessResult[];
  overallFreshnessState: 'PASS' | 'WARN' | 'STALE';
}

export function observeSourceFreshness(catalog: any[]): SourceFreshnessReport {
  const results: DomainFreshnessResult[] = [];
  let freshCount = 0;
  let agingCount = 0;
  let staleCount = 0;
  let immutableCount = 0;
  let unknownPolicyCount = 0;

  const nowMs = Date.now();

  for (const p of catalog) {
    if (!p) continue;
    const evidenceList = Array.isArray(p.evidence) ? p.evidence : [];

    for (const ev of evidenceList) {
      if (!ev) continue;
      const domain = ev.domain || 'spec.chipset';
      const policy = getFreshnessPolicyForDomain(domain);

      if (policy.temporalClass === 'IMMUTABLE') {
        immutableCount++;
        results.push({
          rootId: p.id,
          domain,
          sourceId: ev.id || 'ev_' + p.id,
          sourceName: ev.source || 'unnamed_source',
          lastUpdated: ev.timestamp || new Date().toISOString(),
          ageDays: 0,
          freshnessState: 'NOT_TEMPORAL',
          policyUsed: policy
        });
        continue;
      }

      if (policy.fallbackBehavior === 'UNKNOWN_POLICY') {
        unknownPolicyCount++;
        results.push({
          rootId: p.id,
          domain,
          sourceId: ev.id || 'ev_' + p.id,
          sourceName: ev.source || 'unnamed_source',
          lastUpdated: ev.timestamp || new Date().toISOString(),
          ageDays: 0,
          freshnessState: 'UNKNOWN_POLICY',
          policyUsed: policy
        });
        continue;
      }

      if (!ev.timestamp) continue;
      const timestampMs = new Date(ev.timestamp).getTime();
      if (isNaN(timestampMs)) continue;

      const ageDays = Math.floor((nowMs - timestampMs) / (1000 * 60 * 60 * 24));

      let freshnessState: FreshnessState = 'FRESH';
      if (ageDays > policy.staleAfterDays) {
        freshnessState = 'STALE';
        staleCount++;
      } else if (ageDays > policy.agingWindowDays) {
        freshnessState = 'AGING';
        agingCount++;
      } else {
        freshCount++;
      }

      results.push({
        rootId: p.id,
        domain,
        sourceId: ev.id || 'ev_' + p.id,
        sourceName: ev.source || 'unnamed_source',
        lastUpdated: ev.timestamp,
        ageDays,
        freshnessState,
        policyUsed: policy
      });
    }
  }

  let overallFreshnessState: SourceFreshnessReport['overallFreshnessState'] = 'PASS';
  if (staleCount > 0) overallFreshnessState = 'STALE';
  else if (agingCount > 0) overallFreshnessState = 'WARN';

  return {
    evaluatedAt: new Date().toISOString(),
    rootsEvaluated: catalog.length,
    freshCount,
    agingCount,
    staleCount,
    immutableCount,
    unknownPolicyCount,
    results,
    overallFreshnessState
  };
}
