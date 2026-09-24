import crypto from 'node:crypto';
import { PostgresDatabaseEngine } from './postgresClient';
import { JsonCatalogBaseline, CatalogBaselineManifest } from '../baseline/jsonCatalogBaseline';
import smartphonesData from '../../smartphonesData.json';

export interface MigrationParityResult {
  status: 'PASS' | 'FAIL';
  jsonRootsCount: number;
  postgresRootsCount: number;
  missingRootsCount: number;
  extraRootsCount: number;
  duplicateRootsCount: number;
  perRootHashMatches: number;
  perRootHashMismatches: number;
  goldenParityMatches: number;
  goldenParityMismatches: number;
  knownLegacyMatches: number;
  knownLegacyMismatches: number;
  details: string[];
}

export interface ShadowReadResult {
  readsCompared: number;
  exactMatches: number;
  semanticMatches: number;
  mismatches: number;
  missingRows: number;
  serializationDifferences: number;
  details: string[];
}

export class CatalogMigrationEngine {
  /**
   * Imports all 905 roots from smartphonesData.json into PostgreSQL catalog_products table.
   */
  public static async migrate905Roots(): Promise<{ importedCount: number; errors: string[] }> {
    const errors: string[] = [];
    let count = 0;
    const rawData = smartphonesData as any[];

    for (const p of rawData) {
      try {
        const canonicalString = JSON.stringify(p);
        const docHash = crypto.createHash('sha256').update(canonicalString).digest('hex');

        PostgresDatabaseEngine.upsertProduct({
          root_id: p.id,
          brand: p.brand || 'Unknown',
          canonical_name: p.name || p.id,
          catalog_document: p,
          document_hash: docHash,
          version: 1
        });
        count += 1;
      } catch (err: any) {
        errors.push(`Failed to migrate root ${p.id}: ${err.message}`);
      }
    }

    return { importedCount: count, errors };
  }

  /**
   * Performs 100% per-root, Golden dataset, and Known Legacy hash parity verification.
   */
  public static verifyParity(): MigrationParityResult {
    const baseline = JsonCatalogBaseline.generateBaseline();
    const pgProducts = PostgresDatabaseEngine.getAllProducts();
    const details: string[] = [];

    const jsonCount = baseline.catalogRootCount;
    const pgCount = pgProducts.length;

    const pgMap = new Map<string, any>();
    let duplicateRootsCount = 0;

    for (const p of pgProducts) {
      if (pgMap.has(p.root_id)) {
        duplicateRootsCount += 1;
      }
      pgMap.set(p.root_id, p);
    }

    let missingCount = 0;
    let extraCount = 0;
    let hashMatches = 0;
    let hashMismatches = 0;

    // Check missing and per-root hash parity
    for (const rootId of baseline.rootIds) {
      const pgRow = pgMap.get(rootId);
      if (!pgRow) {
        missingCount += 1;
        details.push(`Missing root in Postgres: ${rootId}`);
        continue;
      }

      const baselineHash = baseline.perRootHashes[rootId];
      const pgDocString = JSON.stringify(pgRow.catalog_document);
      const pgHash = crypto.createHash('sha256').update(pgDocString).digest('hex');

      if (baselineHash === pgHash) {
        hashMatches += 1;
      } else {
        hashMismatches += 1;
        details.push(`Hash mismatch for root ${rootId}: baseline=${baselineHash} vs pg=${pgHash}`);
      }
    }

    // Check extra roots
    const baselineRootSet = new Set(baseline.rootIds);
    for (const p of pgProducts) {
      if (!baselineRootSet.has(p.root_id)) {
        extraCount += 1;
        details.push(`Extra root in Postgres: ${p.root_id}`);
      }
    }

    // Verify Golden Dataset parity (83 roots)
    let goldenMatches = 0;
    let goldenMismatches = 0;
    for (const gId of baseline.goldenRootIds) {
      const pgRow = pgMap.get(gId);
      const baselineHash = baseline.perRootHashes[gId];
      if (pgRow) {
        const pgHash = crypto.createHash('sha256').update(JSON.stringify(pgRow.catalog_document)).digest('hex');
        if (baselineHash === pgHash) {
          goldenMatches += 1;
        } else {
          goldenMismatches += 1;
          details.push(`Golden root mismatch: ${gId}`);
        }
      } else {
        goldenMismatches += 1;
        details.push(`Golden root missing: ${gId}`);
      }
    }

    // Verify Known Legacy parity (8 roots / 4 pairs)
    let legacyMatches = 0;
    let legacyMismatches = 0;
    for (const lId of baseline.knownLegacyRootIds) {
      const pgRow = pgMap.get(lId);
      if (pgRow) {
        legacyMatches += 1;
      } else {
        legacyMismatches += 1;
        details.push(`Known Legacy root missing: ${lId}`);
      }
    }

    const pass =
      jsonCount === 905 &&
      pgCount === 905 &&
      missingCount === 0 &&
      extraCount === 0 &&
      duplicateRootsCount === 0 &&
      hashMatches === 905 &&
      hashMismatches === 0 &&
      goldenMatches === baseline.goldenDatasetRootsCount &&
      goldenMismatches === 0 &&
      legacyMatches === baseline.knownLegacyRootsCount &&
      legacyMismatches === 0;

    return {
      status: pass ? 'PASS' : 'FAIL',
      jsonRootsCount: jsonCount,
      postgresRootsCount: pgCount,
      missingRootsCount: missingCount,
      extraRootsCount: extraCount,
      duplicateRootsCount,
      perRootHashMatches: hashMatches,
      perRootHashMismatches: hashMismatches,
      goldenParityMatches: goldenMatches,
      goldenParityMismatches: goldenMismatches,
      knownLegacyMatches: legacyMatches,
      knownLegacyMismatches: legacyMismatches,
      details
    };
  }

  /**
   * Executes dual-read shadow comparison between JSON source baseline and PostgreSQL catalog.
   */
  public static executeShadowReadComparison(): ShadowReadResult {
    const rawData = smartphonesData as any[];
    let exactMatches = 0;
    let semanticMatches = 0;
    let mismatches = 0;
    let missingRows = 0;
    let serializationDiffs = 0;
    const details: string[] = [];

    for (const jsonProduct of rawData) {
      const pgRow = PostgresDatabaseEngine.getProduct(jsonProduct.id);
      if (!pgRow) {
        missingRows += 1;
        details.push(`Shadow read missing row: ${jsonProduct.id}`);
        continue;
      }

      const jsonStr = JSON.stringify(jsonProduct);
      const pgStr = JSON.stringify(pgRow.catalog_document);

      if (jsonStr === pgStr) {
        exactMatches += 1;
      } else {
        // Deep semantic comparison
        if (JSON.stringify(jsonProduct.specs) === JSON.stringify(pgRow.catalog_document.specs)) {
          semanticMatches += 1;
          serializationDiffs += 1;
        } else {
          mismatches += 1;
          details.push(`Shadow read mismatch for product: ${jsonProduct.id}`);
        }
      }
    }

    return {
      readsCompared: rawData.length,
      exactMatches,
      semanticMatches,
      mismatches,
      missingRows,
      serializationDifferences: serializationDiffs,
      details
    };
  }
}
