export type TemporalClass =
  | 'FAST_TEMPORAL'
  | 'TEMPORAL'
  | 'SLOW_TEMPORAL'
  | 'IMMUTABLE'
  | 'EVENT_EXPIRY_DRIVEN'
  | 'UNKNOWN';

export interface DomainFreshnessPolicy {
  domain: string;
  temporalClass: TemporalClass;
  freshWindowDays: number;
  agingWindowDays: number;
  staleAfterDays: number;
  expirySource?: string;
  fallbackBehavior: 'UNKNOWN_POLICY' | 'IMMUTABLE_NO_DECAY' | 'TEMPORAL_DECAY';
}

export const DOMAIN_FRESHNESS_POLICIES: Record<string, DomainFreshnessPolicy> = {
  'offer.price': {
    domain: 'offer.price',
    temporalClass: 'FAST_TEMPORAL',
    freshWindowDays: 1,
    agingWindowDays: 2,
    staleAfterDays: 3,
    fallbackBehavior: 'TEMPORAL_DECAY'
  },
  'offer.availability': {
    domain: 'offer.availability',
    temporalClass: 'FAST_TEMPORAL',
    freshWindowDays: 1,
    agingWindowDays: 2,
    staleAfterDays: 3,
    fallbackBehavior: 'TEMPORAL_DECAY'
  },
  'promotion': {
    domain: 'promotion',
    temporalClass: 'EVENT_EXPIRY_DRIVEN',
    freshWindowDays: 7,
    agingWindowDays: 14,
    staleAfterDays: 30,
    expirySource: 'promotionEndDate',
    fallbackBehavior: 'TEMPORAL_DECAY'
  },
  'software.current_os': {
    domain: 'software.current_os',
    temporalClass: 'TEMPORAL',
    freshWindowDays: 30,
    agingWindowDays: 60,
    staleAfterDays: 90,
    fallbackBehavior: 'TEMPORAL_DECAY'
  },
  'software.support_status': {
    domain: 'software.support_status',
    temporalClass: 'TEMPORAL',
    freshWindowDays: 60,
    agingWindowDays: 120,
    staleAfterDays: 180,
    fallbackBehavior: 'TEMPORAL_DECAY'
  },
  'spec.chipset': {
    domain: 'spec.chipset',
    temporalClass: 'IMMUTABLE',
    freshWindowDays: Infinity,
    agingWindowDays: Infinity,
    staleAfterDays: Infinity,
    fallbackBehavior: 'IMMUTABLE_NO_DECAY'
  },
  'spec.dimensions': {
    domain: 'spec.dimensions',
    temporalClass: 'IMMUTABLE',
    freshWindowDays: Infinity,
    agingWindowDays: Infinity,
    staleAfterDays: Infinity,
    fallbackBehavior: 'IMMUTABLE_NO_DECAY'
  },
  'spec.display': {
    domain: 'spec.display',
    temporalClass: 'IMMUTABLE',
    freshWindowDays: Infinity,
    agingWindowDays: Infinity,
    staleAfterDays: Infinity,
    fallbackBehavior: 'IMMUTABLE_NO_DECAY'
  },
  'identity.legacy': {
    domain: 'identity.legacy',
    temporalClass: 'IMMUTABLE',
    freshWindowDays: Infinity,
    agingWindowDays: Infinity,
    staleAfterDays: Infinity,
    fallbackBehavior: 'IMMUTABLE_NO_DECAY'
  }
};

export function getFreshnessPolicyForDomain(domain: string): DomainFreshnessPolicy {
  if (DOMAIN_FRESHNESS_POLICIES[domain]) {
    return DOMAIN_FRESHNESS_POLICIES[domain];
  }
  return {
    domain,
    temporalClass: 'UNKNOWN',
    freshWindowDays: 0,
    agingWindowDays: 0,
    staleAfterDays: 0,
    fallbackBehavior: 'UNKNOWN_POLICY'
  };
}
