export interface KnownLegacyFindingRecord {
  findingId: string;
  family: string;
  rootIds: string[];
  findingClass: 'LEGACY_DUPLICATE_CANDIDATE';
  registeredAt: string;
  goldenMembership: boolean;
  notes: string;
}

export interface KnownLegacyRegistryManifest {
  registryVersion: string;
  totalFindingsCount: number;
  totalRootsCount: number;
  findings: KnownLegacyFindingRecord[];
}

export const KNOWN_LEGACY_HUAWEI_FINDINGS: KnownLegacyFindingRecord[] = [
  {
    findingId: 'leg_huawei_p40_pro',
    family: 'Huawei P40 Pro',
    rootIds: ['huawei-huawei-p40-pro', 'huawei-huawei-p40-pro-1'],
    findingClass: 'LEGACY_DUPLICATE_CANDIDATE',
    registeredAt: '2026-09-23T21:50:00Z',
    goldenMembership: false,
    notes: 'Legacy raw catalog trailing-space duplicate roots for Huawei P40 Pro.'
  },
  {
    findingId: 'leg_huawei_y9',
    family: 'Huawei Y9',
    rootIds: ['huawei-huawei-y9', 'huawei-huawei-y9-1'],
    findingClass: 'LEGACY_DUPLICATE_CANDIDATE',
    registeredAt: '2026-09-23T21:50:00Z',
    goldenMembership: false,
    notes: 'Legacy raw catalog trailing-space duplicate roots for Huawei Y9.'
  },
  {
    findingId: 'leg_huawei_pura_70_pro',
    family: 'Huawei Pura 70 Pro',
    rootIds: ['huawei-huawei-pura-70-pro', 'huawei-huawei-pura-70-pro-1'],
    findingClass: 'LEGACY_DUPLICATE_CANDIDATE',
    registeredAt: '2026-09-23T21:50:00Z',
    goldenMembership: false,
    notes: 'Legacy raw catalog trailing-space duplicate roots for Huawei Pura 70 Pro.'
  },
  {
    findingId: 'leg_huawei_mate_60_pro',
    family: 'Huawei Mate 60 Pro',
    rootIds: ['huawei-huawei-mate-60-pro', 'huawei-huawei-mate-60-pro-1'],
    findingClass: 'LEGACY_DUPLICATE_CANDIDATE',
    registeredAt: '2026-09-23T21:50:00Z',
    goldenMembership: false,
    notes: 'Legacy raw catalog trailing-space duplicate roots for Huawei Mate 60 Pro.'
  }
];

export function getKnownLegacyRegistry(): KnownLegacyRegistryManifest {
  const totalRootsCount = KNOWN_LEGACY_HUAWEI_FINDINGS.reduce((sum, f) => sum + f.rootIds.length, 0);

  return {
    registryVersion: 'known_legacy_registry_v1.0.0',
    totalFindingsCount: KNOWN_LEGACY_HUAWEI_FINDINGS.length,
    totalRootsCount,
    findings: KNOWN_LEGACY_HUAWEI_FINDINGS
  };
}

export function auditKnownLegacyRegistryDisappearance(observedLegacyFindingIds: string[]): {
  intactCount: number;
  disappearedFindings: string[];
  status: 'ALL_INTACT' | 'KNOWN_FINDING_DISAPPEARED';
} {
  const observedSet = new Set(observedLegacyFindingIds);
  const disappeared: string[] = [];

  for (const record of KNOWN_LEGACY_HUAWEI_FINDINGS) {
    if (!observedSet.has(record.findingId)) {
      disappeared.push(record.findingId);
    }
  }

  return {
    intactCount: KNOWN_LEGACY_HUAWEI_FINDINGS.length - disappeared.length,
    disappearedFindings: disappeared,
    status: disappeared.length === 0 ? 'ALL_INTACT' : 'KNOWN_FINDING_DISAPPEARED'
  };
}
