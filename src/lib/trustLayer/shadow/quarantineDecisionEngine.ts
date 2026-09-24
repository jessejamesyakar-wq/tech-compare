import {
  DecisionState,
  SeverityClass,
  POLICY_VERSION,
  PIPELINE_REVISION,
  QUARANTINE_POLICY_RULES,
  FAIL_CLOSED_TRIGGER_CLASSES
} from './quarantinePolicyV1';
import { KNOWN_LEGACY_HUAWEI_FINDINGS } from './knownLegacyRegistry';

export interface DecisionExplanation {
  whatFailed: string;
  whereFailed: string;
  whichEvidenceTriggered: string[];
  whichPolicyRuleApplied: string;
  whyQuarantineSuggested: string;
  whatWouldClearFinding: string;
  isGolden: boolean;
  isLegacyFinding: boolean;
  wouldProductionEnforcementOccurIn8C: boolean;
}

export interface QuarantineDecisionRecord {
  decisionId: string;
  entityId: string;
  brand: string;
  rootId: string;
  detector: string;
  failureCode: string;
  severity: SeverityClass;
  findingClass: string;
  evidenceIds: string[];
  sourceIds: string[];
  scope: string;
  observedAt: string;
  firstSeenAt: string;
  lastSeenAt: string;
  decisionState: DecisionState;
  explanation: DecisionExplanation;
  requiredReview: boolean;
  goldenMembership: boolean;
  legacyFinding: boolean;
  confidenceBasis: string;
  policyVersion: string;
  pipelineRevision: string;
}

export function evaluateQuarantineDecision(
  finding: {
    rootId: string;
    productName?: string;
    brand?: string;
    detector: string;
    findingClass: string;
    description: string;
    evidenceIds?: string[];
    sourceIds?: string[];
    isGolden?: boolean;
  },
  observedAt: string = new Date().toISOString()
): QuarantineDecisionRecord {
  const isGolden = finding.isGolden ?? false;
  const isLegacyFinding = KNOWN_LEGACY_HUAWEI_FINDINGS.some(f => f.rootIds.includes(finding.rootId));

  const rule = QUARANTINE_POLICY_RULES[`RULE_${finding.findingClass}`] || {
    ruleId: 'RULE_DEFAULT_GENERIC',
    ruleVersion: '1.0.0',
    findingClass: finding.findingClass,
    severity: isLegacyFinding ? 'MEDIUM' : 'INFO',
    targetState: isLegacyFinding ? 'KNOWN_LEGACY' : 'CLEAR',
    failClosed: false,
    description: finding.description
  };

  let decisionState: DecisionState = rule.targetState;
  let severity: SeverityClass = rule.severity;

  if (FAIL_CLOSED_TRIGGER_CLASSES.has(finding.findingClass)) {
    decisionState = 'SHADOW_QUARANTINE';
    severity = finding.findingClass === 'REAL_NAMESPACE_VIOLATION' || finding.findingClass === 'PRICE_MUTATION_ATTEMPT' ? 'CRITICAL' : 'HIGH';
  } else if (isLegacyFinding) {
    decisionState = 'KNOWN_LEGACY';
    severity = 'MEDIUM';
  } else if (finding.findingClass === 'LEGITIMATE_TEXT_CONTEXT' || finding.findingClass === 'PARSER_FALSE_POSITIVE') {
    decisionState = 'CLEAR';
    severity = 'INFO';
  }

  const decisionId = `dec_${finding.rootId}_${finding.findingClass}_${Date.now()}`;
  const evidenceIds = finding.evidenceIds || [`ev_${finding.rootId}`];
  const sourceIds = finding.sourceIds || ['source_catalog_v1'];

  const explanation: DecisionExplanation = {
    whatFailed: `Finding class [${finding.findingClass}]: ${finding.description}`,
    whereFailed: `Root ID ${finding.rootId} (${finding.productName || finding.rootId})`,
    whichEvidenceTriggered: evidenceIds,
    whichPolicyRuleApplied: rule.ruleId,
    whyQuarantineSuggested: decisionState === 'SHADOW_QUARANTINE'
      ? `Fail-closed policy rule ${rule.ruleId} satisfied for ${finding.findingClass}`
      : `No quarantine required for decision state ${decisionState}`,
    whatWouldClearFinding: decisionState === 'SHADOW_QUARANTINE'
      ? 'Remove conflicting/foreign evidence or supply authoritative manufacturer evidence.'
      : 'Record is already clear or tracked as known legacy.',
    isGolden,
    isLegacyFinding,
    wouldProductionEnforcementOccurIn8C: decisionState === 'SHADOW_QUARANTINE'
  };

  return {
    decisionId,
    entityId: finding.rootId,
    brand: finding.brand || 'Unknown',
    rootId: finding.rootId,
    detector: finding.detector,
    failureCode: finding.findingClass,
    severity,
    findingClass: finding.findingClass,
    evidenceIds,
    sourceIds,
    scope: isGolden ? 'GOLDEN_ROOT_SCOPE' : 'CATALOG_ROOT_SCOPE',
    observedAt,
    firstSeenAt: observedAt,
    lastSeenAt: observedAt,
    decisionState,
    explanation,
    requiredReview: decisionState === 'SHADOW_QUARANTINE' || decisionState === 'REVIEW_REQUIRED' || isLegacyFinding,
    goldenMembership: isGolden,
    legacyFinding: isLegacyFinding,
    confidenceBasis: 'DETERMINISTIC_POLICY_RULES_V1',
    policyVersion: POLICY_VERSION,
    pipelineRevision: PIPELINE_REVISION
  };
}
