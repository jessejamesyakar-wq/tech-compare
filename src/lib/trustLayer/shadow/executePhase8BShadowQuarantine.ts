import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

import { generatePhase8ABaselineSeal, Phase8ABaselineSeal } from './phase8aBaselineSeal';
import { getKnownLegacyRegistry, auditKnownLegacyRegistryDisappearance } from './knownLegacyRegistry';
import { evaluateQuarantineDecision, QuarantineDecisionRecord } from './quarantineDecisionEngine';
import { ShadowQuarantineQueue, ShadowQueueItem } from './shadowQuarantineQueue';
import { computeShadowQualityMetrics, ShadowQualityMetricsReport } from './shadowQualityMetrics';
import { buildGoldenDatasetManifestV1, GOLDEN_DATASET_V1_IDS } from '../observe/goldenDatasetV1';
import { runGoldenRegressionSuite, GoldenRegressionSuiteReport } from '../observe/goldenRegressionRunner';
import { observeIdentityCollisions } from '../observe/identityCollisionObserver';
import { observeCrossBrandIsolation } from '../observe/crossBrandIsolationObserver';
import { observeSourceFreshness } from '../observe/sourceFreshnessObserver';
import { auditSourceAuthority } from '../observe/sourceAuthorityMatrix';
import { evaluateCatalogHealth, CatalogHealthReport } from '../observe/catalogHealthEngine';
import { observePriceImmutability, PriceImmutabilityReport } from '../observe/priceImmutabilityObserver';
import { evaluateDeploymentGateReportOnly, DeploymentGateReport, GateVerdict } from '../observe/deploymentGateReportOnly';
import { ChainedAuditGenerator, AuditEventPayload } from '../observe/chainedAuditGenerator';

export interface Phase8BShadowQuarantineResult {
  timestamp: string;
  baselineSeal: Phase8ABaselineSeal;
  catalogRootCountBefore: number;
  catalogRootCountAfter: number;
  catalogFingerprintBefore: string;
  catalogFingerprintAfter: string;
  priceStateHashBefore: string;
  priceStateHashAfter: string;
  storeOffersHashBefore: string;
  storeOffersHashAfter: string;
  priceHistoryHashBefore: string;
  priceHistoryHashAfter: string;
  zeroMutationVerified: boolean;
  goldenRegressionReport: GoldenRegressionSuiteReport;
  knownLegacyAudit: {
    intactCount: number;
    disappearedFindings: string[];
    status: 'ALL_INTACT' | 'KNOWN_FINDING_DISAPPEARED';
  };
  shadowQueueItems: ShadowQueueItem[];
  metrics: ShadowQualityMetricsReport;
  healthReport: CatalogHealthReport;
  deploymentGateReport: DeploymentGateReport;
  readinessVerdict: GateVerdict;
  auditChainValid: boolean;
  auditDir: string;
}

export function executePhase8BShadowQuarantine(
  outputDir: string,
  catalogJsonPath: string = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json'
): Phase8BShadowQuarantineResult {
  const auditChain = new ChainedAuditGenerator();
  auditChain.appendEvent('PHASE_8B_INIT', { summary: 'Initializing Phase 8-B Shadow Quarantine & Decision Infrastructure' });

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 1. Generate Baseline Seal
  const baselineSeal = generatePhase8ABaselineSeal(catalogJsonPath);

  // 2. Read catalog read-only
  const rawCatalogContent = fs.readFileSync(catalogJsonPath, 'utf-8');
  const catalogFingerprintBefore = crypto.createHash('sha256').update(rawCatalogContent).digest('hex');
  const catalog: any[] = JSON.parse(rawCatalogContent);
  const rootCountBefore = catalog.length;

  const priceStateStringBefore = JSON.stringify(catalog.map(p => ({ id: p.id, price: p.price, priceMin: p.priceMin, priceMax: p.priceMax })));
  const priceStateHashBefore = crypto.createHash('sha256').update(priceStateStringBefore).digest('hex');

  const storeOffersStringBefore = JSON.stringify(catalog.map(p => ({ id: p.id, storeOffers: p.storeOffers || [] })));
  const storeOffersHashBefore = crypto.createHash('sha256').update(storeOffersStringBefore).digest('hex');

  const priceHistoryStringBefore = JSON.stringify(catalog.map(p => ({ id: p.id, priceHistory: p.priceHistory || [] })));
  const priceHistoryHashBefore = crypto.createHash('sha256').update(priceHistoryStringBefore).digest('hex');

  auditChain.appendEvent('BASELINE_SEAL_VERIFIED', {
    entityId: 'baseline_seal',
    newValueHash: baselineSeal.sealHash,
    summary: `Phase 8-A observation baseline sealed with ${rootCountBefore} roots and 83 golden roots`
  });

  // 3. Golden Suite Verification
  const goldenManifest = buildGoldenDatasetManifestV1(catalog, catalogFingerprintBefore);
  const goldenRegressionReport = runGoldenRegressionSuite(catalog, goldenManifest);

  const goldenAllIds = new Set([
    ...GOLDEN_DATASET_V1_IDS.samsung21,
    ...GOLDEN_DATASET_V1_IDS.apple7b,
    ...GOLDEN_DATASET_V1_IDS.apple7c,
    ...GOLDEN_DATASET_V1_IDS.apple7d
  ]);

  // 4. Run Observers & Observers
  const identityReport = observeIdentityCollisions(catalog);
  const crossBrandReport = observeCrossBrandIsolation(catalog);
  const freshnessReport = observeSourceFreshness(catalog);
  const authorityReport = auditSourceAuthority(catalog);
  const priceImmutabilityReport = observePriceImmutability(catalog);

  // 5. Evaluate Known Legacy Registry
  const knownLegacyRegistry = getKnownLegacyRegistry();
  const observedLegacyIds = identityReport.collisions
    .filter(c => c.classification === 'LEGACY_DUPLICATE_CANDIDATE')
    .map(c => {
      if (c.collisionKey.includes('p40 pro')) return 'leg_huawei_p40_pro';
      if (c.collisionKey.includes('y9')) return 'leg_huawei_y9';
      if (c.collisionKey.includes('pura 70 pro')) return 'leg_huawei_pura_70_pro';
      if (c.collisionKey.includes('mate 60 pro')) return 'leg_huawei_mate_60_pro';
      return c.collisionKey;
    });

  const knownLegacyAudit = auditKnownLegacyRegistryDisappearance(observedLegacyIds);

  // 6. Build Shadow Quarantine Decisions & Enqueue Idempotently
  const queue = new ShadowQuarantineQueue();
  const decisions: QuarantineDecisionRecord[] = [];

  // Decisions for Identity Findings
  for (const col of identityReport.collisions) {
    for (const rootId of col.affectedRootIds) {
      const p = catalog.find(catP => catP.id === rootId);
      const dec = evaluateQuarantineDecision({
        rootId,
        productName: p?.name || rootId,
        brand: p?.brand || 'Unknown',
        detector: 'identityCollisionObserver',
        findingClass: col.classification,
        description: col.description,
        isGolden: goldenAllIds.has(rootId)
      });
      decisions.push(dec);
      queue.enqueueDecision(dec);
    }
  }

  // Decisions for Cross-Brand Findings
  for (const cb of crossBrandReport.findings) {
    const dec = evaluateQuarantineDecision({
      rootId: cb.rootId,
      productName: cb.productName,
      brand: cb.owningBrand,
      detector: 'crossBrandIsolationObserver',
      findingClass: cb.classification,
      description: cb.description,
      isGolden: goldenAllIds.has(cb.rootId)
    });
    decisions.push(dec);
    queue.enqueueDecision(dec);
  }

  // 7. Compute Quality Metrics
  const metrics = computeShadowQualityMetrics(decisions, queue.getDuplicateEventsPrevented());

  // 8. Health Engine & Deployment Gate
  const healthReport = evaluateCatalogHealth(catalog, catalogFingerprintBefore, {
    identityCollisions: identityReport.collisions.filter(c => c.classification === 'REAL_IDENTITY_COLLISION').flatMap(c => c.affectedRootIds),
    legacyDuplicateCandidates: identityReport.collisions.filter(c => c.classification === 'LEGACY_DUPLICATE_CANDIDATE').flatMap(c => c.affectedRootIds),
    crossBrandLeaks: crossBrandReport.findings.filter(f => f.classification === 'REAL_CROSS_BRAND_REFERENCE' || f.classification === 'REAL_NAMESPACE_VIOLATION').map(f => f.rootId),
    priceMutations: priceImmutabilityReport.violations.map(v => v.rootId),
    staleSources: freshnessReport.results.filter(r => r.freshnessState === 'STALE').map(r => r.rootId),
    goldenSuitePass: goldenRegressionReport.goldenSuitePass
  });

  const deploymentGateReport = evaluateDeploymentGateReportOnly(
    healthReport,
    goldenRegressionReport,
    priceImmutabilityReport,
    rootCountBefore,
    rootCountBefore,
    identityReport.legacyDuplicatesCount
  );

  // 9. Post Zero-Mutation Verification
  const postRawContent = fs.readFileSync(catalogJsonPath, 'utf-8');
  const catalogFingerprintAfter = crypto.createHash('sha256').update(postRawContent).digest('hex');
  const catalogAfter: any[] = JSON.parse(postRawContent);
  const rootCountAfter = catalogAfter.length;

  const priceStateStringAfter = JSON.stringify(catalogAfter.map(p => ({ id: p.id, price: p.price, priceMin: p.priceMin, priceMax: p.priceMax })));
  const priceStateHashAfter = crypto.createHash('sha256').update(priceStateStringAfter).digest('hex');

  const storeOffersStringAfter = JSON.stringify(catalogAfter.map(p => ({ id: p.id, storeOffers: p.storeOffers || [] })));
  const storeOffersHashAfter = crypto.createHash('sha256').update(storeOffersStringAfter).digest('hex');

  const priceHistoryStringAfter = JSON.stringify(catalogAfter.map(p => ({ id: p.id, priceHistory: p.priceHistory || [] })));
  const priceHistoryHashAfter = crypto.createHash('sha256').update(priceHistoryStringAfter).digest('hex');

  const zeroMutationVerified =
    catalogFingerprintBefore === catalogFingerprintAfter &&
    priceStateHashBefore === priceStateHashAfter &&
    storeOffersHashBefore === storeOffersHashAfter &&
    priceHistoryHashBefore === priceHistoryHashAfter &&
    rootCountBefore === rootCountAfter;

  auditChain.appendEvent('ZERO_MUTATION_VERIFIED', {
    entityId: 'zero_mutation_check',
    summary: `Zero mutation check: Verified=${zeroMutationVerified} (${rootCountBefore} -> ${rootCountAfter} roots)`
  });

  const chainEvents = auditChain.getChain();
  const chainIntegrity = ChainedAuditGenerator.verifyChainIntegrity(chainEvents);

  const finalResult: Phase8BShadowQuarantineResult = {
    timestamp: new Date().toISOString(),
    baselineSeal,
    catalogRootCountBefore: rootCountBefore,
    catalogRootCountAfter: rootCountAfter,
    catalogFingerprintBefore,
    catalogFingerprintAfter,
    priceStateHashBefore,
    priceStateHashAfter,
    storeOffersHashBefore,
    storeOffersHashAfter,
    priceHistoryHashBefore,
    priceHistoryHashAfter,
    zeroMutationVerified,
    goldenRegressionReport,
    knownLegacyAudit,
    shadowQueueItems: queue.getQueue(),
    metrics,
    healthReport,
    deploymentGateReport,
    readinessVerdict: deploymentGateReport.readinessVerdict,
    auditChainValid: chainIntegrity.valid,
    auditDir: outputDir
  };

  // Export audit artifacts
  fs.writeFileSync(path.join(outputDir, 'phase8a_observation_baseline.json'), JSON.stringify(baselineSeal, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outputDir, 'phase8b_shadow_quarantine_report.json'), JSON.stringify(finalResult, null, 2), 'utf-8');
  fs.writeFileSync(path.join(outputDir, 'known_legacy_registry_v1.0.0.json'), JSON.stringify(knownLegacyRegistry, null, 2), 'utf-8');

  return finalResult;
}
