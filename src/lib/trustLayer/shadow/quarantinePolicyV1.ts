export type DecisionState =
  | 'CLEAR'
  | 'OBSERVE'
  | 'REVIEW_REQUIRED'
  | 'SHADOW_QUARANTINE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'KNOWN_LEGACY'
  | 'FALSE_POSITIVE'
  | 'RESOLVED';

export type SeverityClass = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface PolicyRule {
  ruleId: string;
  ruleVersion: string;
  findingClass: string;
  severity: SeverityClass;
  targetState: DecisionState;
  failClosed: boolean;
  description: string;
}

export const POLICY_VERSION = 'quarantine_policy_v1.0.0';
export const PIPELINE_REVISION = '37489e4a (main)';

export const FAIL_CLOSED_TRIGGER_CLASSES = new Set([
  'REAL_IDENTITY_COLLISION',
  'REAL_CROSS_BRAND_REFERENCE',
  'REAL_CROSS_BRAND_EVIDENCE_LINK',
  'REAL_NAMESPACE_VIOLATION',
  'CAPACITY_SCOPE_LEAK',
  'REGIONAL_SCOPE_LEAK',
  'UNSUPPORTED_ROOT_IDENTITY',
  'SPECULATIVE_PRODUCT',
  'UNAUTHORIZED_ROOT_CHANGE',
  'PRICE_MUTATION_ATTEMPT',
  'AUDIT_CHAIN_FAILURE'
]);

export const QUARANTINE_POLICY_RULES: Record<string, PolicyRule> = {
  'RULE_REAL_IDENTITY_COLLISION': {
    ruleId: 'RULE_REAL_IDENTITY_COLLISION',
    ruleVersion: '1.0.0',
    findingClass: 'REAL_IDENTITY_COLLISION',
    severity: 'HIGH',
    targetState: 'SHADOW_QUARANTINE',
    failClosed: true,
    description: 'Verified identity collision across multiple catalog roots triggers shadow quarantine.'
  },
  'RULE_REAL_CROSS_BRAND_REFERENCE': {
    ruleId: 'RULE_REAL_CROSS_BRAND_REFERENCE',
    ruleVersion: '1.0.0',
    findingClass: 'REAL_CROSS_BRAND_REFERENCE',
    severity: 'HIGH',
    targetState: 'SHADOW_QUARANTINE',
    failClosed: true,
    description: 'Verified cross-brand hardware spec contamination triggers shadow quarantine.'
  },
  'RULE_REAL_NAMESPACE_VIOLATION': {
    ruleId: 'RULE_REAL_NAMESPACE_VIOLATION',
    ruleVersion: '1.0.0',
    findingClass: 'REAL_NAMESPACE_VIOLATION',
    severity: 'CRITICAL',
    targetState: 'SHADOW_QUARANTINE',
    failClosed: true,
    description: 'Explicit brand namespace mismatch triggers critical shadow quarantine.'
  },
  'RULE_PRICE_MUTATION_ATTEMPT': {
    ruleId: 'RULE_PRICE_MUTATION_ATTEMPT',
    ruleVersion: '1.0.0',
    findingClass: 'PRICE_MUTATION_ATTEMPT',
    severity: 'CRITICAL',
    targetState: 'SHADOW_QUARANTINE',
    failClosed: true,
    description: 'Unauthorized price field mutation attempt triggers critical shadow quarantine.'
  },
  'RULE_AUDIT_CHAIN_FAILURE': {
    ruleId: 'RULE_AUDIT_CHAIN_FAILURE',
    ruleVersion: '1.0.0',
    findingClass: 'AUDIT_CHAIN_FAILURE',
    severity: 'CRITICAL',
    targetState: 'SHADOW_QUARANTINE',
    failClosed: true,
    description: 'Cryptographic audit chain tampering triggers critical shadow quarantine.'
  },
  'RULE_LEGACY_DUPLICATE_CANDIDATE': {
    ruleId: 'RULE_LEGACY_DUPLICATE_CANDIDATE',
    ruleVersion: '1.0.0',
    findingClass: 'LEGACY_DUPLICATE_CANDIDATE',
    severity: 'MEDIUM',
    targetState: 'KNOWN_LEGACY',
    failClosed: false,
    description: 'Registered non-Golden legacy duplicate candidate assigned to KNOWN_LEGACY state.'
  },
  'RULE_TEXT_ONLY_OCCURRENCE': {
    ruleId: 'RULE_TEXT_ONLY_OCCURRENCE',
    ruleVersion: '1.0.0',
    findingClass: 'LEGITIMATE_TEXT_CONTEXT',
    severity: 'INFO',
    targetState: 'CLEAR',
    failClosed: false,
    description: 'Textual mention or comparison context resolves to CLEAR.'
  }
};
