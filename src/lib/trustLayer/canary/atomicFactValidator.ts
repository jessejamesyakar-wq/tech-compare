export interface AtomicClaimValidationRequest {
  atomicFactDomain: string;
  claimValue: string;
  sourceText?: string;
  normalizationRuleId?: string;
}

export interface AtomicClaimValidationResult {
  valid: boolean;
  atomicFactDomain: string;
  claimValue: string;
  compatible: boolean;
  unsupportedComponentsFound: string[];
  normalizationApplied: boolean;
  normalizationRuleId?: string;
  errorCode?: string;
  errorMessage?: string;
}

const ALLOWED_ATOMIC_DOMAINS = new Set([
  'spec.screen.type',
  'spec.screen.technology',
  'spec.screen.resolution',
  'spec.screen.refresh_rate',
  'spec.screen.size',
  'spec.build.frame_material',
  'spec.build.water_resistance',
  'spec.battery.capacity_mah'
]);

export function validateAtomicClaim(
  request: AtomicClaimValidationRequest
): AtomicClaimValidationResult {
  const domain = request.atomicFactDomain;
  const claim = request.claimValue;

  // 1. Atomic Domain Whitelist Check
  if (!ALLOWED_ATOMIC_DOMAINS.has(domain)) {
    return {
      valid: false,
      atomicFactDomain: domain,
      claimValue: claim,
      compatible: false,
      unsupportedComponentsFound: [],
      normalizationApplied: false,
      errorCode: 'ATOMIC_FACT_MODEL_REQUIRED',
      errorMessage: `Fact domain ${domain} is not an approved atomic semantic domain.`
    };
  }

  // 2. Composite Fact Contamination Guard (e.g. Metal Frame in Screen Type)
  const unsupportedComponents: string[] = [];
  if (domain.startsWith('spec.screen.')) {
    if (claim.includes('Metal Çerçeve') || claim.includes('Metal Frame') || claim.includes('Titanyum Kasa')) {
      unsupportedComponents.push('Metal Çerçeve');
    }
  }

  if (unsupportedComponents.length > 0) {
    return {
      valid: false,
      atomicFactDomain: domain,
      claimValue: claim,
      compatible: false,
      unsupportedComponentsFound: unsupportedComponents,
      normalizationApplied: false,
      errorCode: 'UNSUPPORTED_COMPONENT',
      errorMessage: `Claim '${claim}' in domain '${domain}' contains unsupported non-display component: [${unsupportedComponents.join(', ')}].`
    };
  }

  // 3. Taxonomy Normalization Guard (Super AMOLED vs Super AMOLED Plus)
  let normalizationApplied = false;
  let ruleId = request.normalizationRuleId;

  if (claim.includes('Super AMOLED Plus')) {
    if (!ruleId) {
      return {
        valid: false,
        atomicFactDomain: domain,
        claimValue: claim,
        compatible: false,
        unsupportedComponentsFound: [],
        normalizationApplied: false,
        errorCode: 'TAXONOMY_NORMALIZATION_RULE_MISSING',
        errorMessage: `Claim 'Super AMOLED Plus' requires an explicit approved normalization_rule_id.`
      };
    }
    normalizationApplied = true;
  }

  return {
    valid: true,
    atomicFactDomain: domain,
    claimValue: claim,
    compatible: true,
    unsupportedComponentsFound: [],
    normalizationApplied,
    normalizationRuleId: ruleId
  };
}
