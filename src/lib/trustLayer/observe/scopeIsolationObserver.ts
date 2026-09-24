export interface ScopeLeakItem {
  rootId: string;
  productName: string;
  leakType: 'CAPACITY_IN_GENERIC_ROOT' | 'GENERIC_IN_CAPACITY_ROOT' | 'CROSS_GENERATION_LEAK';
  description: string;
  severity: 'WARN' | 'FAIL';
}

export interface ScopeIsolationReport {
  evaluatedAt: string;
  rootsAudited: number;
  totalLeaksCount: number;
  leaks: ScopeLeakItem[];
  status: 'SCOPE_CLEAN' | 'SCOPE_LEAKS_DETECTED';
}

export function observeScopeIsolation(catalog: any[]): ScopeIsolationReport {
  const leaks: ScopeLeakItem[] = [];

  const capacityRegex = /\b(64|128|256|512)\s*gb\b|\b1\s*tb\b/i;

  for (const p of catalog) {
    if (!p) continue;
    const name = p.name || '';
    const id = p.id || '';

    const isGenericRoot = !capacityRegex.test(name) && !capacityRegex.test(id);

    // If generic root, check if evidence or specs force a single capacity variant into root definition
    if (isGenericRoot && p.specs?.storageCapacity) {
      // If a generic root has hardcoded single capacity in specs without being a capacity root
      leaks.push({
        rootId: id,
        productName: name,
        leakType: 'CAPACITY_IN_GENERIC_ROOT',
        description: `Generic root ${id} contains hardcoded specific storage capacity (${p.specs.storageCapacity}).`,
        severity: 'WARN'
      });
    }
  }

  return {
    evaluatedAt: new Date().toISOString(),
    rootsAudited: catalog.length,
    totalLeaksCount: leaks.length,
    leaks,
    status: leaks.length === 0 ? 'SCOPE_CLEAN' : 'SCOPE_LEAKS_DETECTED'
  };
}
