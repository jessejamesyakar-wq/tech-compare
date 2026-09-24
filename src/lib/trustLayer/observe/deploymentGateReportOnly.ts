import { CatalogHealthReport } from './catalogHealthEngine';
import { GoldenRegressionSuiteReport } from './goldenRegressionRunner';
import { PriceImmutabilityReport } from './priceImmutabilityObserver';

export type GateVerdict =
  | 'READY_FOR_8B'
  | 'READY_FOR_8B_WITH_KNOWN_LEGACY_FINDINGS'
  | 'READY_FOR_8C'
  | 'READY_FOR_8C_WITH_KNOWN_LEGACY_FINDINGS'
  | 'READY_FOR_8C_CANARY'
  | 'READY_FOR_8C_CANARY_WITH_KNOWN_LEGACY'
  | 'READY_FOR_SINGLE_PATH_CANARY'
  | 'PHASE8B_REFINEMENT_REQUIRED'
  | 'PHASE8C_REFINEMENT_REQUIRED'
  | 'CONTRACT_FIX_INCOMPLETE'
  | 'BLOCKED_BY_BYPASS_RISK'
  | 'BLOCKED_BY_REAL_INTEGRITY_FAILURE';

export interface CategoryBreakdown {
  implementationFailure: boolean;
  goldenRegression: boolean;
  realProductionIntegrityFailure: boolean;
  knownLegacyNonGoldenFinding: boolean;
  falsePositiveDetectorNoise: boolean;
}

export interface DeploymentGateReport {
  evaluatedAt: string;
  gateMode: 'REPORT_ONLY';
  gateDecision: 'WOULD_PASS' | 'WOULD_BLOCK';
  readinessVerdict: GateVerdict;
  categories: CategoryBreakdown;
  zeroMutationVerified: boolean;
  goldenSuitePassed: boolean;
  priceProtectionPassed: boolean;
  healthDimensionsPassed: number;
  blockingReasons: string[];
  knownLegacyFindings: string[];
  recommendations: string[];
}

export function evaluateDeploymentGateReportOnly(
  healthReport: CatalogHealthReport,
  goldenReport: GoldenRegressionSuiteReport,
  priceReport: PriceImmutabilityReport,
  catalogRootCountBefore: number,
  catalogRootCountAfter: number,
  legacyDuplicatesCount: number = 4
): DeploymentGateReport {
  const blockingReasons: string[] = [];
  const knownLegacyFindings: string[] = [];
  const recommendations: string[] = [];

  const categories: CategoryBreakdown = {
    implementationFailure: false,
    goldenRegression: !goldenReport.goldenSuitePass,
    realProductionIntegrityFailure: false,
    knownLegacyNonGoldenFinding: legacyDuplicatesCount > 0,
    falsePositiveDetectorNoise: false
  };

  // 1. Zero Mutation Invariant
  const zeroMutationVerified = catalogRootCountBefore === catalogRootCountAfter;
  if (!zeroMutationVerified) {
    categories.implementationFailure = true;
    blockingReasons.push(`ZERO_MUTATION_VIOLATION: Root count changed from ${catalogRootCountBefore} to ${catalogRootCountAfter}`);
  }

  // 2. Golden Suite Pass
  const goldenSuitePassed = goldenReport.goldenSuitePass;
  if (!goldenSuitePassed) {
    categories.goldenRegression = true;
    blockingReasons.push(`GOLDEN_SUITE_FAIL: ${goldenReport.mutatedRootsCount} of ${goldenReport.totalGoldenRoots} golden roots mutated!`);
  }

  // 3. Price Protection Pass
  const priceProtectionPassed = priceReport.priceProtectionState === 'IMMUTABLE_CLEAN';
  if (!priceProtectionPassed) {
    categories.realProductionIntegrityFailure = true;
    blockingReasons.push(`PRICE_PROTECTION_FAIL: ${priceReport.violationsCount} price violations detected.`);
  }

  // 4. Critical Health Dimensions (Fails vs Warns)
  const criticalFails = healthReport.dimensions.filter(d => d.state === 'FAIL' || d.state === 'QUARANTINE_REQUIRED');
  if (criticalFails.length > 0) {
    categories.realProductionIntegrityFailure = true;
    for (const f of criticalFails) {
      blockingReasons.push(`HEALTH_DIMENSION_FAIL (${f.dimensionName}): ${f.details}`);
    }
  }

  // Known Legacy Non-Golden Findings (Huawei trailing space duplicates)
  if (legacyDuplicatesCount > 0) {
    knownLegacyFindings.push(`Preserved ${legacyDuplicatesCount} non-Golden legacy duplicate candidates (Huawei trailing-space duplicates).`);
  }

  let readinessVerdict: GateVerdict = 'READY_FOR_8C_CANARY';
  let gateDecision: 'WOULD_PASS' | 'WOULD_BLOCK' = 'WOULD_PASS';

  if (categories.implementationFailure || categories.goldenRegression || categories.realProductionIntegrityFailure) {
    gateDecision = 'WOULD_BLOCK';
    readinessVerdict = categories.implementationFailure ? 'PHASE8C_REFINEMENT_REQUIRED' : 'BLOCKED_BY_REAL_INTEGRITY_FAILURE';
    recommendations.push('Resolve blocking integrity failures or regressions before proceeding.');
  } else if (categories.knownLegacyNonGoldenFinding) {
    gateDecision = 'WOULD_PASS';
    readinessVerdict = 'READY_FOR_8C_CANARY_WITH_KNOWN_LEGACY';
    recommendations.push('Trust pre-write enforcement infrastructure is 100% clean and ready for Phase 8-C canary review, with 4 known non-Golden legacy Huawei findings explicitly tracked.');
  } else {
    gateDecision = 'WOULD_PASS';
    readinessVerdict = 'READY_FOR_8C_CANARY';
    recommendations.push('Trust pre-write enforcement infrastructure is 100% clean and ready for Phase 8-C canary review.');
  }

  return {
    evaluatedAt: new Date().toISOString(),
    gateMode: 'REPORT_ONLY',
    gateDecision,
    readinessVerdict,
    categories,
    zeroMutationVerified,
    goldenSuitePassed,
    priceProtectionPassed,
    healthDimensionsPassed: healthReport.summary.passDimensions,
    blockingReasons,
    knownLegacyFindings,
    recommendations
  };
}
