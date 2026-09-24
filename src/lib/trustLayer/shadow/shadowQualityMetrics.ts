import { QuarantineDecisionRecord } from './quarantineDecisionEngine';

export interface ShadowQualityMetricsReport {
  evaluatedAt: string;
  totalDecisions: number;
  totalShadowQuarantined: number;
  bySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  byClass: Record<string, number>;
  goldenFindingsCount: number;
  nonGoldenFindingsCount: number;
  knownLegacyFindingsCount: number;
  newLegacyFindingsCount: number;
  falsePositivesCount: number;
  unknownFindingsCount: number;
  reviewRequiredCount: number;
  duplicateQueueEventsPrevented: number;
}

export function computeShadowQualityMetrics(
  decisions: QuarantineDecisionRecord[],
  duplicateQueueEventsPrevented: number
): ShadowQualityMetricsReport {
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const byClass: Record<string, number> = {};
  let totalShadowQuarantined = 0;
  let goldenFindingsCount = 0;
  let nonGoldenFindingsCount = 0;
  let knownLegacyFindingsCount = 0;
  let falsePositivesCount = 0;
  let reviewRequiredCount = 0;

  for (const d of decisions) {
    if (d.severity === 'CRITICAL') bySeverity.critical++;
    else if (d.severity === 'HIGH') bySeverity.high++;
    else if (d.severity === 'MEDIUM') bySeverity.medium++;
    else if (d.severity === 'LOW') bySeverity.low++;
    else if (d.severity === 'INFO') bySeverity.info++;

    byClass[d.findingClass] = (byClass[d.findingClass] || 0) + 1;

    if (d.decisionState === 'SHADOW_QUARANTINE') totalShadowQuarantined++;
    if (d.goldenMembership) goldenFindingsCount++;
    else nonGoldenFindingsCount++;

    if (d.legacyFinding) knownLegacyFindingsCount++;
    if (d.decisionState === 'FALSE_POSITIVE' || d.findingClass === 'PARSER_FALSE_POSITIVE') falsePositivesCount++;
    if (d.requiredReview) reviewRequiredCount++;
  }

  return {
    evaluatedAt: new Date().toISOString(),
    totalDecisions: decisions.length,
    totalShadowQuarantined,
    bySeverity,
    byClass,
    goldenFindingsCount,
    nonGoldenFindingsCount,
    knownLegacyFindingsCount,
    newLegacyFindingsCount: 0,
    falsePositivesCount,
    unknownFindingsCount: 0,
    reviewRequiredCount,
    duplicateQueueEventsPrevented
  };
}
