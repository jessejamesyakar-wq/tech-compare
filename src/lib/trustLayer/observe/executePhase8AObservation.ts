import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { buildGoldenDatasetManifestV1, GoldenDatasetManifestV1 } from './goldenDatasetV1';
import { runGoldenRegressionSuite, GoldenRegressionSuiteReport } from './goldenRegressionRunner';
import { evaluateCatalogHealth, CatalogHealthReport } from './catalogHealthEngine';
import { auditSourceAuthority, SourceAuthorityAuditReport } from './sourceAuthorityMatrix';
import { detectEvidenceConflicts, ConflictDetectorReport } from './evidenceConflictDetector';
import { observeSourceFreshness, SourceFreshnessReport } from './sourceFreshnessObserver';
import { observeIdentityCollisions, IdentityCollisionReport } from './identityCollisionObserver';
import { observeScopeIsolation, ScopeIsolationReport } from './scopeIsolationObserver';
import { observePriceImmutability, PriceImmutabilityReport } from './priceImmutabilityObserver';
import { observeCrossBrandIsolation, CrossBrandIsolationReport } from './crossBrandIsolationObserver';
import { ChainedAuditGenerator, AuditEventPayload } from './chainedAuditGenerator';
import { evaluateDeploymentGateReportOnly, DeploymentGateReport, GateVerdict } from './deploymentGateReportOnly';

export interface Phase8AObservationResult {
  timestamp: string;
  catalogRootCountBefore: number;
  catalogRootCountAfter: number;
  catalogFingerprintBefore: string;
  catalogFingerprintAfter: string;
  priceStateHashBefore: string;
  priceStateHashAfter: string;
  zeroMutationVerified: boolean;
  goldenManifest: GoldenDatasetManifestV1;
  goldenRegressionReport: GoldenRegressionSuiteReport;
  healthReport: CatalogHealthReport;
  authorityReport: SourceAuthorityAuditReport;
  conflictReport: ConflictDetectorReport;
  freshnessReport: SourceFreshnessReport;
  identityCollisionReport: IdentityCollisionReport;
  scopeIsolationReport: ScopeIsolationReport;
  priceImmutabilityReport: PriceImmutabilityReport;
  crossBrandReport: CrossBrandIsolationReport;
  auditChainEvents: AuditEventPayload[];
  auditChainValid: boolean;
  deploymentGateReport: DeploymentGateReport;
  readinessVerdict: GateVerdict;
  auditDir: string;
}

export function executePhase8AObservation(
  outputDir: string,
  catalogJsonPath: string = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json'
): Phase8AObservationResult {
  const auditChain = new ChainedAuditGenerator();
  auditChain.appendEvent('PHASE_8A2_INIT', { summary: 'Initializing Phase 8-A.2 Trust Control Plane Observation' });

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Read catalog strictly read-only
  const rawCatalogContent = fs.readFileSync(catalogJsonPath, 'utf-8');
  const catalogFingerprintBefore = crypto.createHash('sha256').update(rawCatalogContent).digest('hex');
  const catalog: any[] = JSON.parse(rawCatalogContent);
  const rootCountBefore = catalog.length;

  const priceStateStringBefore = JSON.stringify(catalog.map(p => ({
    id: p.id,
    price: p.price,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    storeOffers: p.storeOffers || [],
    priceHistory: p.priceHistory || []
  })));
  const priceStateHashBefore = crypto.createHash('sha256').update(priceStateStringBefore).digest('hex');

  auditChain.appendEvent('CATALOG_LOADED_READ_ONLY', {
    entityId: 'catalog_root',
    summary: `Catalog loaded read-only with ${rootCountBefore} roots (fingerprint: ${catalogFingerprintBefore.substring(0, 12)})`
  });

  // 2. Build Golden Dataset Manifest V1
  const goldenManifest = buildGoldenDatasetManifestV1(catalog, catalogFingerprintBefore);
  auditChain.appendEvent('GOLDEN_DATASET_V1_FROZEN', {
    entityId: 'golden_dataset_v1',
    newValueHash: goldenManifest.manifestHash,
    summary: `Frozen Golden Dataset V1 with exactly ${goldenManifest.rootCount} roots`
  });

  // 3. Run Golden Regression Suite
  const goldenRegressionReport = runGoldenRegressionSuite(catalog, goldenManifest);
  auditChain.appendEvent('GOLDEN_REGRESSION_SUITE_RUN', {
    entityId: 'golden_suite',
    summary: `Golden Suite completed: Pass=${goldenRegressionReport.goldenSuitePass}, Clean=${goldenRegressionReport.cleanRootsCount}/${goldenRegressionReport.totalGoldenRoots}`
  });

  // 4. Run Individual Observers
  const authorityReport = auditSourceAuthority(catalog);
  const conflictReport = detectEvidenceConflicts(catalog);
  const freshnessReport = observeSourceFreshness(catalog);
  const identityCollisionReport = observeIdentityCollisions(catalog);
  const scopeIsolationReport = observeScopeIsolation(catalog);
  const priceImmutabilityReport = observePriceImmutability(catalog);
  const crossBrandReport = observeCrossBrandIsolation(catalog);

  // 5. Evaluate 10-Dimensional Catalog Health Model
  const legacyDuplicates = identityCollisionReport.collisions
    .filter(c => c.classification === 'LEGACY_DUPLICATE_CANDIDATE')
    .flatMap(c => c.affectedRootIds);

  const realIdentityCollisions = identityCollisionReport.collisions
    .filter(c => c.classification === 'REAL_IDENTITY_COLLISION')
    .flatMap(c => c.affectedRootIds);

  const realCrossBrandLeaks = crossBrandReport.findings
    .filter(f => f.classification === 'REAL_CROSS_BRAND_REFERENCE' || f.classification === 'REAL_NAMESPACE_VIOLATION')
    .map(f => f.rootId);

  const healthReport = evaluateCatalogHealth(catalog, catalogFingerprintBefore, {
    identityCollisions: realIdentityCollisions,
    legacyDuplicateCandidates: legacyDuplicates,
    evidenceConflicts: conflictReport.conflicts.map(c => c.rootId),
    crossBrandLeaks: realCrossBrandLeaks,
    scopeLeaks: scopeIsolationReport.leaks.map(l => l.rootId),
    priceMutations: priceImmutabilityReport.violations.map(v => v.rootId),
    staleSources: freshnessReport.results.filter(r => r.freshnessState === 'STALE').map(r => r.rootId),
    authorityViolations: authorityReport.violations.map(v => v.rootId),
    goldenSuitePass: goldenRegressionReport.goldenSuitePass
  });

  auditChain.appendEvent('CATALOG_HEALTH_EVALUATED', {
    entityId: 'catalog_health',
    summary: `Catalog Health Evaluated: Overall State = ${healthReport.overallState} (${healthReport.summary.passDimensions}/10 dimensions PASS)`
  });

  // 6. Post-observation Zero-Mutation Check
  const postRawContent = fs.readFileSync(catalogJsonPath, 'utf-8');
  const catalogFingerprintAfter = crypto.createHash('sha256').update(postRawContent).digest('hex');
  const catalogAfter: any[] = JSON.parse(postRawContent);
  const rootCountAfter = catalogAfter.length;

  const priceStateStringAfter = JSON.stringify(catalogAfter.map(p => ({
    id: p.id,
    price: p.price,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    storeOffers: p.storeOffers || [],
    priceHistory: p.priceHistory || []
  })));
  const priceStateHashAfter = crypto.createHash('sha256').update(priceStateStringAfter).digest('hex');

  const zeroMutationVerified =
    catalogFingerprintBefore === catalogFingerprintAfter &&
    priceStateHashBefore === priceStateHashAfter &&
    rootCountBefore === rootCountAfter;

  auditChain.appendEvent('ZERO_MUTATION_VERIFIED', {
    entityId: 'zero_mutation_check',
    summary: `Zero mutation check: Verified=${zeroMutationVerified} (${rootCountBefore} -> ${rootCountAfter} roots)`
  });

  // 7. Evaluate Deployment Gate Simulator
  const deploymentGateReport = evaluateDeploymentGateReportOnly(
    healthReport,
    goldenRegressionReport,
    priceImmutabilityReport,
    rootCountBefore,
    rootCountAfter,
    identityCollisionReport.legacyDuplicatesCount
  );

  auditChain.appendEvent('DEPLOYMENT_GATE_EVALUATED', {
    entityId: 'deployment_gate',
    summary: `Deployment Gate decision: ${deploymentGateReport.gateDecision} (${deploymentGateReport.readinessVerdict})`
  });

  const chainEvents = auditChain.getChain();
  const chainIntegrity = ChainedAuditGenerator.verifyChainIntegrity(chainEvents);

  const finalResult: Phase8AObservationResult = {
    timestamp: new Date().toISOString(),
    catalogRootCountBefore: rootCountBefore,
    catalogRootCountAfter: rootCountAfter,
    catalogFingerprintBefore,
    catalogFingerprintAfter,
    priceStateHashBefore,
    priceStateHashAfter,
    zeroMutationVerified,
    goldenManifest,
    goldenRegressionReport,
    healthReport,
    authorityReport,
    conflictReport,
    freshnessReport,
    identityCollisionReport,
    scopeIsolationReport,
    priceImmutabilityReport,
    crossBrandReport,
    auditChainEvents: chainEvents,
    auditChainValid: chainIntegrity.valid,
    deploymentGateReport,
    readinessVerdict: deploymentGateReport.readinessVerdict,
    auditDir: outputDir
  };

  fs.writeFileSync(
    path.join(outputDir, 'phase8a_observation_report.json'),
    JSON.stringify(finalResult, null, 2),
    'utf-8'
  );

  fs.writeFileSync(
    path.join(outputDir, 'golden_dataset_manifest_v1.json'),
    JSON.stringify(goldenManifest, null, 2),
    'utf-8'
  );

  return finalResult;
}
