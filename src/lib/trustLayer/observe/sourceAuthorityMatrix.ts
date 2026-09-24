export type FactDomain =
  | 'spec.chipset'
  | 'spec.dimensions'
  | 'spec.display'
  | 'identity.legacy'
  | 'software.current_os'
  | 'software.support_status'
  | 'offer.price'
  | 'offer.availability'
  | 'promotion'
  | 'manual_verified';

export type SourceType =
  | 'OFFICIAL_MANUFACTURER'
  | 'CURATED_PRIMARY_DB'
  | 'RETAILER_DIRECT'
  | 'REGULATORY_ARCHIVAL'
  | 'UNVERIFIED_SCRAPER';

export interface FactDomainAuthorityPolicy {
  factDomain: FactDomain;
  preferredSourceTypes: SourceType[];
  allowedFallbacks: SourceType[];
  temporalRequirement: string;
  conflictBehavior: 'PREFER_HIGHER_TIER' | 'RETAILER_DIRECT_OVERRIDE' | 'MANUAL_REVIEW_REQUIRED';
  reviewRequirement: boolean;
}

export const FACT_DOMAIN_AUTHORITY_POLICIES: Record<FactDomain, FactDomainAuthorityPolicy> = {
  'spec.chipset': {
    factDomain: 'spec.chipset',
    preferredSourceTypes: ['OFFICIAL_MANUFACTURER'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'IMMUTABLE',
    conflictBehavior: 'PREFER_HIGHER_TIER',
    reviewRequirement: false
  },
  'spec.dimensions': {
    factDomain: 'spec.dimensions',
    preferredSourceTypes: ['OFFICIAL_MANUFACTURER'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'IMMUTABLE',
    conflictBehavior: 'PREFER_HIGHER_TIER',
    reviewRequirement: false
  },
  'spec.display': {
    factDomain: 'spec.display',
    preferredSourceTypes: ['OFFICIAL_MANUFACTURER'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'IMMUTABLE',
    conflictBehavior: 'PREFER_HIGHER_TIER',
    reviewRequirement: false
  },
  'identity.legacy': {
    factDomain: 'identity.legacy',
    preferredSourceTypes: ['OFFICIAL_MANUFACTURER', 'REGULATORY_ARCHIVAL'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'IMMUTABLE',
    conflictBehavior: 'PREFER_HIGHER_TIER',
    reviewRequirement: false
  },
  'software.current_os': {
    factDomain: 'software.current_os',
    preferredSourceTypes: ['OFFICIAL_MANUFACTURER'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'TEMPORAL_30_DAYS',
    conflictBehavior: 'PREFER_HIGHER_TIER',
    reviewRequirement: false
  },
  'software.support_status': {
    factDomain: 'software.support_status',
    preferredSourceTypes: ['OFFICIAL_MANUFACTURER'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'TEMPORAL_90_DAYS',
    conflictBehavior: 'PREFER_HIGHER_TIER',
    reviewRequirement: false
  },
  'offer.price': {
    factDomain: 'offer.price',
    preferredSourceTypes: ['RETAILER_DIRECT'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'FAST_TEMPORAL_1_DAY',
    conflictBehavior: 'RETAILER_DIRECT_OVERRIDE',
    reviewRequirement: false
  },
  'offer.availability': {
    factDomain: 'offer.availability',
    preferredSourceTypes: ['RETAILER_DIRECT'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'FAST_TEMPORAL_1_DAY',
    conflictBehavior: 'RETAILER_DIRECT_OVERRIDE',
    reviewRequirement: false
  },
  'promotion': {
    factDomain: 'promotion',
    preferredSourceTypes: ['RETAILER_DIRECT', 'OFFICIAL_MANUFACTURER'],
    allowedFallbacks: [],
    temporalRequirement: 'EVENT_EXPIRY_DRIVEN',
    conflictBehavior: 'RETAILER_DIRECT_OVERRIDE',
    reviewRequirement: false
  },
  'manual_verified': {
    factDomain: 'manual_verified',
    preferredSourceTypes: ['OFFICIAL_MANUFACTURER'],
    allowedFallbacks: ['CURATED_PRIMARY_DB'],
    temporalRequirement: 'EXPLICIT_PROVENANCE',
    conflictBehavior: 'MANUAL_REVIEW_REQUIRED',
    reviewRequirement: true
  }
};

export interface AuthorityViolation {
  rootId: string;
  field: string;
  factDomain: FactDomain;
  currentSource: string;
  sourceType: SourceType;
  policyViolationReason: string;
  severity: 'WARN' | 'FAIL';
}

export interface SourceAuthorityAuditReport {
  evaluatedAt: string;
  rootsAudited: number;
  domainPoliciesConfigured: number;
  totalViolations: number;
  violations: AuthorityViolation[];
  auditStatus: 'AUTHORITY_PASS' | 'AUTHORITY_WARN' | 'AUTHORITY_FAIL';
}

export function auditSourceAuthority(catalog: any[]): SourceAuthorityAuditReport {
  const violations: AuthorityViolation[] = [];

  for (const p of catalog) {
    if (!p) continue;
    const evidenceList = Array.isArray(p.evidence) ? p.evidence : [];

    for (const ev of evidenceList) {
      if (!ev || !ev.source) continue;
      const sourceStr = String(ev.source).toLowerCase();

      if (sourceStr.includes('unverified_scraper')) {
        violations.push({
          rootId: p.id,
          field: ev.field || 'spec',
          factDomain: 'spec.chipset',
          currentSource: ev.source,
          sourceType: 'UNVERIFIED_SCRAPER',
          policyViolationReason: 'UNVERIFIED_SCRAPER is forbidden for spec.chipset domain',
          severity: 'WARN'
        });
      }
    }
  }

  const auditStatus = violations.length === 0 ? 'AUTHORITY_PASS' : 'AUTHORITY_WARN';

  return {
    evaluatedAt: new Date().toISOString(),
    rootsAudited: catalog.length,
    domainPoliciesConfigured: Object.keys(FACT_DOMAIN_AUTHORITY_POLICIES).length,
    totalViolations: violations.length,
    violations,
    auditStatus
  };
}
