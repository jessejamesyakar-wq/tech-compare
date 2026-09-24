export interface EvidenceClaim {
  source: string;
  field: string;
  claimedValue: string | number;
  timestamp?: string;
}

export interface ConflictingEvidenceItem {
  rootId: string;
  productName: string;
  field: string;
  claims: EvidenceClaim[];
  conflictSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
  resolutionRequired: boolean;
}

export interface ConflictDetectorReport {
  evaluatedAt: string;
  totalRootsAnalyzed: number;
  conflictingRootsCount: number;
  totalConflicts: number;
  conflicts: ConflictingEvidenceItem[];
  status: 'NO_CONFLICTS' | 'CONFLICTS_DETECTED';
}

export function detectEvidenceConflicts(catalog: any[]): ConflictDetectorReport {
  const conflicts: ConflictingEvidenceItem[] = [];

  for (const p of catalog) {
    if (!p) continue;
    const evidenceList: EvidenceClaim[] = Array.isArray(p.evidence) ? p.evidence : [];
    if (evidenceList.length < 2) continue;

    // Group claims by field
    const fieldMap: Record<string, EvidenceClaim[]> = {};
    for (const ev of evidenceList) {
      if (!ev.field) continue;
      if (!fieldMap[ev.field]) fieldMap[ev.field] = [];
      fieldMap[ev.field].push(ev);
    }

    for (const [field, claims] of Object.entries(fieldMap)) {
      if (claims.length < 2) continue;
      const uniqueValues = new Set(claims.map(c => String(c.claimedValue).trim().toLowerCase()));

      if (uniqueValues.size > 1) {
        conflicts.push({
          rootId: p.id,
          productName: p.name || p.id,
          field,
          claims,
          conflictSeverity: field === 'ram' || field === 'processor' || field === 'battery' ? 'HIGH' : 'MEDIUM',
          resolutionRequired: true
        });
      }
    }
  }

  const conflictingRoots = new Set(conflicts.map(c => c.rootId));

  return {
    evaluatedAt: new Date().toISOString(),
    totalRootsAnalyzed: catalog.length,
    conflictingRootsCount: conflictingRoots.size,
    totalConflicts: conflicts.length,
    conflicts,
    status: conflicts.length === 0 ? 'NO_CONFLICTS' : 'CONFLICTS_DETECTED'
  };
}
