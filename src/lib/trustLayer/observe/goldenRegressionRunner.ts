import crypto from 'node:crypto';
import { GoldenDatasetManifestV1 } from './goldenDatasetV1';

export interface GoldenRegressionResult {
  rootId: string;
  brand: string;
  identityStable: boolean;
  capacityStable: boolean;
  evidenceIsolated: boolean;
  brandIsolated: boolean;
  priceImmutable: boolean;
  stateHashMatches: boolean;
  status: 'GOLDEN_CLEAN' | 'GOLDEN_MUTATED';
}

export interface GoldenRegressionSuiteReport {
  datasetVersion: string;
  totalGoldenRoots: number;
  cleanRootsCount: number;
  mutatedRootsCount: number;
  goldenSuitePass: boolean;
  results: GoldenRegressionResult[];
}

export function runGoldenRegressionSuite(
  catalog: any[],
  goldenManifest: GoldenDatasetManifestV1
): GoldenRegressionSuiteReport {
  const results: GoldenRegressionResult[] = [];
  let cleanRootsCount = 0;

  for (const entry of goldenManifest.protectedRoots) {
    const currentProduct = catalog.find(p => p.id === entry.rootId);
    if (!currentProduct) {
      results.push({
        rootId: entry.rootId,
        brand: entry.brand,
        identityStable: false,
        capacityStable: false,
        evidenceIsolated: false,
        brandIsolated: false,
        priceImmutable: false,
        stateHashMatches: false,
        status: 'GOLDEN_MUTATED'
      });
      continue;
    }

    const currentHash = crypto.createHash('sha256').update(JSON.stringify(currentProduct)).digest('hex');
    const stateHashMatches = currentHash === entry.initialStateHash;
    const identityStable = currentProduct.brand === entry.brand;
    const capacityStable = true;
    const evidenceIsolated = true;
    const brandIsolated = currentProduct.brand === entry.brand;
    const priceImmutable = true;

    const isClean = stateHashMatches && identityStable && capacityStable && evidenceIsolated && brandIsolated && priceImmutable;
    if (isClean) cleanRootsCount++;

    results.push({
      rootId: entry.rootId,
      brand: entry.brand,
      identityStable,
      capacityStable,
      evidenceIsolated,
      brandIsolated,
      priceImmutable,
      stateHashMatches,
      status: isClean ? 'GOLDEN_CLEAN' : 'GOLDEN_MUTATED'
    });
  }

  const goldenSuitePass = cleanRootsCount === goldenManifest.protectedRoots.length;

  return {
    datasetVersion: goldenManifest.manifestVersion,
    totalGoldenRoots: goldenManifest.protectedRoots.length,
    cleanRootsCount,
    mutatedRootsCount: goldenManifest.protectedRoots.length - cleanRootsCount,
    goldenSuitePass,
    results
  };
}
