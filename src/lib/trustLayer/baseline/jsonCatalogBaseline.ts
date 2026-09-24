import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import smartphonesData from '../../smartphonesData.json';
import { GOLDEN_DATASET_V1_IDS } from '../observe/goldenDatasetV1';
import { KNOWN_LEGACY_HUAWEI_FINDINGS } from '../shadow/knownLegacyRegistry';

export interface CatalogBaselineManifest {
  manifestId: string;
  generationTimestamp: string;
  gitRevision: string;
  status: 'IMMUTABLE_MIGRATION_BASELINE';
  catalogRootCount: number;
  globalCatalogFingerprint: string;
  goldenDatasetRootsCount: number;
  knownLegacyRootsCount: number;
  rootIds: string[];
  perRootHashes: Record<string, string>;
  goldenRootIds: string[];
  knownLegacyRootIds: string[];
}

export class JsonCatalogBaseline {
  private static cachedBaseline: CatalogBaselineManifest | null = null;

  public static generateBaseline(): CatalogBaselineManifest {
    if (this.cachedBaseline) {
      return this.cachedBaseline;
    }

    const rawData = smartphonesData as any[];
    const rootIds = rawData.map((p) => p.id);
    const perRootHashes: Record<string, string> = {};

    for (const p of rawData) {
      const canonicalString = JSON.stringify(p);
      const hash = crypto.createHash('sha256').update(canonicalString).digest('hex');
      perRootHashes[p.id] = hash;
    }

    const globalString = JSON.stringify(rawData);
    const globalCatalogFingerprint = crypto
      .createHash('sha256')
      .update(globalString)
      .digest('hex');

    // Exactly 83 Golden Dataset V1 root IDs
    const goldenSet = new Set(Object.values(GOLDEN_DATASET_V1_IDS).flat());
    const goldenRootIds = Array.from(goldenSet);

    // Known Legacy Huawei duplicate pairs (8 roots / 4 pairs)
    const knownLegacyRootIds = KNOWN_LEGACY_HUAWEI_FINDINGS.flatMap((f) => f.rootIds);

    const manifest: CatalogBaselineManifest = {
      manifestId: `BASELINE_JSON_905_${crypto.randomBytes(6).toString('hex')}`,
      generationTimestamp: '2026-09-24T20:39:36.000Z',
      gitRevision: 'baseline_v1_frozen',
      status: 'IMMUTABLE_MIGRATION_BASELINE',
      catalogRootCount: rawData.length,
      globalCatalogFingerprint,
      goldenDatasetRootsCount: goldenRootIds.length,
      knownLegacyRootsCount: knownLegacyRootIds.length,
      rootIds,
      perRootHashes,
      goldenRootIds,
      knownLegacyRootIds
    };

    this.cachedBaseline = manifest;
    return manifest;
  }

  public static getRootPayloadHash(rootId: string): string | null {
    const baseline = this.generateBaseline();
    return baseline.perRootHashes[rootId] || null;
  }

  public static getAllBaselineRoots(): any[] {
    return smartphonesData as any[];
  }

  public static getGoldenDatasetV1Ids(): string[] {
    return this.generateBaseline().goldenRootIds;
  }

  public static getKnownLegacyRootIds(): string[] {
    return this.generateBaseline().knownLegacyRootIds;
  }
}
