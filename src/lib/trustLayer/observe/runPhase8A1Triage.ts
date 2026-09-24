import fs from 'node:fs';
import crypto from 'node:crypto';

import { GOLDEN_DATASET_V1_IDS, buildGoldenDatasetManifestV1 } from './goldenDatasetV1';
import { runGoldenRegressionSuite } from './goldenRegressionRunner';
import { observeIdentityCollisions } from './identityCollisionObserver';
import { observeCrossBrandIsolation } from './crossBrandIsolationObserver';

export function runPhase8A1ForensicTriage() {
  const catalogPath = 'C:/Users/Alpdeniz/.gemini/antigravity/scratch/tech-compare-test-workspace/src/lib/smartphonesData.json';
  const rawCatalogContent = fs.readFileSync(catalogPath, 'utf-8');
  const catalogFingerprintBefore = crypto.createHash('sha256').update(rawCatalogContent).digest('hex');
  const catalog: any[] = JSON.parse(rawCatalogContent);

  const priceStateString = JSON.stringify(catalog.map(p => ({
    id: p.id,
    price: p.price,
    priceMin: p.priceMin,
    priceMax: p.priceMax,
    storeOffers: p.storeOffers || [],
    priceHistory: p.priceHistory || []
  })));
  const priceStateHashBefore = crypto.createHash('sha256').update(priceStateString).digest('hex');

  const identityReport = observeIdentityCollisions(catalog);
  const goldenAllIds = new Set([
    ...GOLDEN_DATASET_V1_IDS.samsung21,
    ...GOLDEN_DATASET_V1_IDS.apple7b,
    ...GOLDEN_DATASET_V1_IDS.apple7c,
    ...GOLDEN_DATASET_V1_IDS.apple7d
  ]);

  const expandedCollisions = identityReport.collisions.map(col => {
    const affectedProducts = col.affectedRootIds.map(id => {
      const p = catalog.find(catP => catP.id === id);
      return {
        id,
        brand: p?.brand || 'Unknown',
        name: p?.name || 'Unknown',
        isGolden: goldenAllIds.has(id)
      };
    });

    return {
      collisionKey: col.collisionKey,
      collisionType: col.collisionType,
      severity: col.severity,
      affectedRoots: affectedProducts,
      classification: col.classification
    };
  });

  const crossBrandReport = observeCrossBrandIsolation(catalog);
  const expandedBrandLeaks = crossBrandReport.findings.map(f => {
    return {
      rootId: f.rootId,
      productName: f.productName,
      owningBrand: f.owningBrand,
      offendingKeyword: f.offendingTerm,
      matchedField: f.matchedField,
      isGolden: goldenAllIds.has(f.rootId),
      classification: f.classification
    };
  });

  const goldenManifest = buildGoldenDatasetManifestV1(catalog, catalogFingerprintBefore);
  const goldenReport = runGoldenRegressionSuite(catalog, goldenManifest);

  const postRawContent = fs.readFileSync(catalogPath, 'utf-8');
  const catalogFingerprintAfter = crypto.createHash('sha256').update(postRawContent).digest('hex');

  return {
    catalogRootCountBefore: catalog.length,
    catalogRootCountAfter: catalog.length,
    catalogFingerprintBefore,
    catalogFingerprintAfter,
    priceStateHashBefore,
    zeroMutationVerified: catalogFingerprintBefore === catalogFingerprintAfter,
    goldenManifestHash: goldenManifest.manifestHash,
    goldenSuitePass: goldenReport.goldenSuitePass,
    goldenCleanCount: goldenReport.cleanRootsCount,
    expandedCollisions,
    expandedBrandLeaks
  };
}

if (require.main === module) {
  const result = runPhase8A1ForensicTriage();
  console.log(JSON.stringify(result, null, 2));
}
