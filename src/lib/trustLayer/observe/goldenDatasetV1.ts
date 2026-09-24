import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export interface GoldenRootEntry {
  rootId: string;
  brand: string;
  marketingFamily: string;
  capacityRoot: string;
  phaseSource: 'Phase 6-D Samsung' | 'Phase 7-B Apple Pilot' | 'Phase 7-C Apple Batch25' | 'Phase 7-D Apple Batch50';
  expectedIdentityStatus: 'VERIFIED';
  expectedPriceProtection: 'IMMUTABLE_CLEAN';
  initialStateHash: string;
}

export interface GoldenDatasetManifestV1 {
  manifestVersion: string;
  datasetName: string;
  createdAt: string;
  rootCount: number;
  catalogFingerprint: string;
  gitRevision: string;
  manifestHash: string;
  protectedRoots: GoldenRootEntry[];
}

export const GOLDEN_DATASET_V1_IDS = {
  samsung21: [
    'samsung-galaxy-s25', 'samsung-galaxy-s25-plus', 'samsung-galaxy-s25-ultra', 'samsung-galaxy-s26-plus',
    'samsung-galaxy-a57-5g', 'samsung-galaxy-a17-5g', 'samsung-galaxy-s26-ultra', 'samsung-samsung-galaxy-s24-93',
    'samsung-samsung-galaxy-s24-ultra-95', 'samsung-samsung-galaxy-a55-5g-103', 'samsung-samsung-galaxy-z-flip-6-97',
    'samsung-samsung-galaxy-z-fold-6-98', 'samsung-samsung-galaxy-s24-fe-96', 'samsung-samsung-galaxy-a54-5g-89',
    'samsung-samsung-galaxy-s22-ultra-68', 'samsung-samsung-galaxy-s21-51', 'samsung-samsung-galaxy-s21-50',
    'samsung-samsung-galaxy-s20-ultra-34', 'samsung-samsung-galaxy-z-fold-3-55', 'samsung-samsung-galaxy-note-20-ultra-37',
    'samsung-samsung-galaxy-a72-62'
  ],
  apple7b: [
    'apple-apple-iphone-16-pro-max-1-tb-960862', 'apple-apple-iphone-16-pro-max-512-gb-960861', 'apple-apple-iphone-16-pro-max-256-gb-952387',
    'apple-apple-iphone-16-pro-256-gb-960858', 'apple-apple-iphone-15-pro-max-1-tb-895854', 'apple-apple-iphone-15-pro-max-512-gb-895853',
    'apple-apple-iphone-16-pro-128-gb-952452', 'apple-apple-iphone-16-128-gb-959779', 'apple-apple-iphone-11-128-gb-335107',
    'apple-apple-iphone-16-pro-1-tb-960860'
  ],
  apple7c: [
    'apple-apple-iphone-16-plus-128-gb-959953', 'apple-apple-iphone-16-plus-256-gb-959954', 'apple-apple-iphone-16-plus-512-gb-959955',
    'apple-apple-iphone-16-256-gb-960853', 'apple-apple-iphone-16-512-gb-959781', 'apple-apple-iphone-16-pro-512-gb-960859',
    'apple-apple-iphone-15-128-gb-895865', 'apple-apple-iphone-15-256-gb-895866', 'apple-apple-iphone-15-512-gb-895867',
    'apple-apple-iphone-15-plus-128-gb-895859', 'apple-apple-iphone-15-plus-256-gb-895858', 'apple-apple-iphone-15-plus-512-gb-895862',
    'apple-apple-iphone-15-pro-128-gb-895855', 'apple-apple-iphone-15-pro-256-gb-895856', 'apple-apple-iphone-15-pro-512-gb-895860',
    'apple-apple-iphone-15-pro-1-tb-895857', 'apple-apple-iphone-15-pro-max-256-gb-895852', 'apple-apple-iphone-14-pro-max-128-gb-802361',
    'apple-apple-iphone-14-pro-256-gb-809144', 'apple-apple-iphone-14-pro-128-gb-802356', 'apple-apple-iphone-14-pro-512-gb-809145',
    'apple-apple-iphone-14-pro-1-tb-809146', 'apple-apple-iphone-13-128-gb-717135', 'apple-apple-iphone-13-pro-max-128-gb-716471',
    'apple-apple-iphone-13-pro-max-256-gb-717141'
  ],
  apple7d: [
    'apple-apple-iphone-13-pro-max-1-tb-717143', 'apple-apple-iphone-16e-512-gb-994887', 'apple-apple-iphone-13-pro-max-512-gb-717142',
    'apple-apple-iphone-16e-256-gb-994886', 'apple-apple-iphone-16e-128-gb-994885', 'apple-apple-iphone-13-pro-512-gb-717139',
    'apple-apple-iphone-11-64-gb-223976', 'apple-apple-iphone-se-2-2020-128-gb-548606', 'apple-apple-iphone-se-2-2020-548579',
    'apple-apple-iphone-xr-64-gb-127715', 'apple-apple-iphone-13-pro-1-tb-717140', 'apple-apple-iphone-11-pro-max-64-gb-224036',
    'apple-apple-iphone-11-pro-64-gb-224024', 'apple-apple-iphone-xs-max-512-gb-131639', 'apple-apple-iphone-xs-512-gb-131614',
    'apple-apple-iphone-xs-max-256-gb-131638', 'apple-apple-iphone-11-256-gb-335126', 'apple-apple-iphone-se-3-2022-256-gb-758822',
    'apple-apple-iphone-xs-256-gb-131610', 'apple-apple-iphone-se-3-2022-128-gb-758817', 'apple-apple-iphone-x-256-gb-92486',
    'apple-apple-iphone-xs-max-64-gb-127714', 'apple-apple-iphone-se-3-2022-758749', 'apple-apple-iphone-xs-64-gb-126668',
    'apple-apple-iphone-se-2-2020-256-gb-548607', 'apple-apple-iphone-xr-256-gb-138630', 'apple-apple-iphone-se-128-gb-76038'
  ]
};

export function buildGoldenDatasetManifestV1(catalog: any[], catalogFingerprint: string): GoldenDatasetManifestV1 {
  const allIds = [
    ...GOLDEN_DATASET_V1_IDS.samsung21,
    ...GOLDEN_DATASET_V1_IDS.apple7b,
    ...GOLDEN_DATASET_V1_IDS.apple7c,
    ...GOLDEN_DATASET_V1_IDS.apple7d
  ];

  if (allIds.length !== 83) {
    throw new Error(`GOLDEN_DATASET_V1_ERROR: Expected exactly 83 roots, got ${allIds.length}`);
  }

  const protectedRoots: GoldenRootEntry[] = allIds.map(id => {
    const p = catalog.find((catP: any) => catP.id === id);
    if (!p) throw new Error(`GOLDEN_DATASET_V1_ERROR: Root ID ${id} not found in catalog`);

    let phaseSource: GoldenRootEntry['phaseSource'] = 'Phase 6-D Samsung';
    if (GOLDEN_DATASET_V1_IDS.apple7b.includes(id)) phaseSource = 'Phase 7-B Apple Pilot';
    else if (GOLDEN_DATASET_V1_IDS.apple7c.includes(id)) phaseSource = 'Phase 7-C Apple Batch25';
    else if (GOLDEN_DATASET_V1_IDS.apple7d.includes(id)) phaseSource = 'Phase 7-D Apple Batch50';

    const pHash = crypto.createHash('sha256').update(JSON.stringify(p)).digest('hex');

    return {
      rootId: id,
      brand: p.brand || 'Unknown',
      marketingFamily: p.name ? p.name.split(' (')[0] : id,
      capacityRoot: p.name ? (p.name.match(/\((\d+\s*(GB|TB))\)/i)?.[1] || 'ROOT_NO_CAPACITY') : 'ROOT_NO_CAPACITY',
      phaseSource,
      expectedIdentityStatus: 'VERIFIED',
      expectedPriceProtection: 'IMMUTABLE_CLEAN',
      initialStateHash: pHash
    };
  });

  const partialManifest = {
    manifestVersion: 'v1.0.0',
    datasetName: 'golden_dataset_v1',
    createdAt: '2026-09-23T21:36:00Z',
    rootCount: protectedRoots.length,
    catalogFingerprint,
    gitRevision: '37489e4a (main)',
    protectedRoots
  };

  const manifestHash = crypto.createHash('sha256').update(JSON.stringify(partialManifest)).digest('hex');

  return {
    ...partialManifest,
    manifestHash
  };
}
