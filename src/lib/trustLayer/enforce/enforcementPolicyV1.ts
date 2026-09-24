export type EnforcementDecisionState =
  | 'ALLOW'
  | 'ALLOW_WITH_WARNING'
  | 'REQUIRE_REVIEW'
  | 'BLOCK'
  | 'SHADOW_ONLY';

export const ENFORCEMENT_POLICY_VERSION = 'enforcement_policy_v1.0.0';
export const PIPELINE_REVISION = '37489e4a (main)';

export const HARD_BLOCK_CLASSES = new Set([
  'REAL_CROSS_BRAND_REFERENCE',
  'REAL_CROSS_BRAND_EVIDENCE_LINK',
  'REAL_NAMESPACE_VIOLATION',
  'VERIFIED_IDENTITY_COLLISION',
  'CAPACITY_SCOPE_LEAK',
  'REGIONAL_SCOPE_LEAK',
  'SPECULATIVE_OR_UNRELEASED_PRODUCT',
  'UNAUTHORIZED_ROOT_CREATION',
  'PRICE_MUTATION_FROM_SPEC_PIPELINE',
  'AUDIT_CHAIN_FAILURE',
  'GOLDEN_DATASET_MUTATION_ATTEMPT',
  'PROTECTED_REFERENCE_MUTATION',
  'INVALID_TARGET_MANIFEST',
  'WRITE_OUTSIDE_AUTHORIZED_SCOPE',
  'EXPECTED_ROOT_DELTA_MISMATCH'
]);

export interface EnforcementPolicyRule {
  ruleId: string;
  ruleVersion: string;
  conditionClass: string;
  decisionState: EnforcementDecisionState;
  hardBlock: boolean;
  explanationTemplate: string;
}

export const ENFORCEMENT_POLICY_RULES: Record<string, EnforcementPolicyRule> = {
  'ENF_GOLDEN_MUTATION': {
    ruleId: 'ENF_GOLDEN_MUTATION',
    ruleVersion: '1.0.0',
    conditionClass: 'GOLDEN_DATASET_MUTATION_ATTEMPT',
    decisionState: 'BLOCK',
    hardBlock: true,
    explanationTemplate: 'Candidate attempts unauthorized mutation of a frozen Golden Dataset V1 root.'
  },
  'ENF_PRICE_FIREWALL': {
    ruleId: 'ENF_PRICE_FIREWALL',
    ruleVersion: '1.0.0',
    conditionClass: 'PRICE_MUTATION_FROM_SPEC_PIPELINE',
    decisionState: 'BLOCK',
    hardBlock: true,
    explanationTemplate: 'Candidate attempts to reach price, store offer, or price history fields from spec pipeline.'
  },
  'ENF_CROSS_BRAND_REF': {
    ruleId: 'ENF_CROSS_BRAND_REF',
    ruleVersion: '1.0.0',
    conditionClass: 'REAL_CROSS_BRAND_REFERENCE',
    decisionState: 'BLOCK',
    hardBlock: true,
    explanationTemplate: 'Candidate contains verified cross-brand hardware spec contamination.'
  },
  'ENF_NAMESPACE_VIOLATION': {
    ruleId: 'ENF_NAMESPACE_VIOLATION',
    ruleVersion: '1.0.0',
    conditionClass: 'REAL_NAMESPACE_VIOLATION',
    decisionState: 'BLOCK',
    hardBlock: true,
    explanationTemplate: 'Candidate contains explicit brand namespace ownership mismatch.'
  },
  'ENF_WRITE_SCOPE': {
    ruleId: 'ENF_WRITE_SCOPE',
    ruleVersion: '1.0.0',
    conditionClass: 'WRITE_OUTSIDE_AUTHORIZED_SCOPE',
    decisionState: 'BLOCK',
    hardBlock: true,
    explanationTemplate: 'Candidate target root is outside authorized write manifest scope.'
  },
  'ENF_KNOWN_LEGACY': {
    ruleId: 'ENF_KNOWN_LEGACY',
    ruleVersion: '1.0.0',
    conditionClass: 'KNOWN_LEGACY_FINDING_EXISTING',
    decisionState: 'ALLOW_WITH_WARNING',
    hardBlock: false,
    explanationTemplate: 'Candidate touches non-Golden product with pre-existing registered legacy finding.'
  },
  'ENF_STALE_EVIDENCE': {
    ruleId: 'ENF_STALE_EVIDENCE',
    ruleVersion: '1.0.0',
    conditionClass: 'TEMPORAL_EVIDENCE_STALE',
    decisionState: 'ALLOW_WITH_WARNING',
    hardBlock: false,
    explanationTemplate: 'Candidate evidence contains temporal stale observation (refresh requested).'
  },
  'ENF_UNKNOWN_SPEC': {
    ruleId: 'ENF_UNKNOWN_SPEC',
    ruleVersion: '1.0.0',
    conditionClass: 'OPTIONAL_SPEC_MISSING',
    decisionState: 'ALLOW_WITH_WARNING',
    hardBlock: false,
    explanationTemplate: 'Candidate lacks optional metadata attribute.'
  },
  'ENF_INSUFFICIENT_EVIDENCE': {
    ruleId: 'ENF_INSUFFICIENT_EVIDENCE',
    ruleVersion: '1.0.0',
    conditionClass: 'EVIDENCE_INSUFFICIENT',
    decisionState: 'REQUIRE_REVIEW',
    hardBlock: false,
    explanationTemplate: 'Candidate requires manual review due to insufficient corroborating evidence.'
  }
};
