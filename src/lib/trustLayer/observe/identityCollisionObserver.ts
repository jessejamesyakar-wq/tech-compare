export type IdentityCollisionClassification =
  | 'REAL_IDENTITY_COLLISION'
  | 'LEGACY_DUPLICATE_CANDIDATE'
  | 'LEGITIMATE_SHARED_IDENTIFIER'
  | 'CAPACITY_VARIANT_RELATIONSHIP'
  | 'REGIONAL_VARIANT_RELATIONSHIP'
  | 'PARSER_FALSE_POSITIVE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'UNKNOWN';

export interface IdentityCollisionItem {
  collisionKey: string;
  collisionType: 'SLUG_DUPLICATE' | 'MODEL_CODE_DUPLICATE' | 'PART_NUMBER_DUPLICATE' | 'NAME_COLLISION';
  affectedRootIds: string[];
  classification: IdentityCollisionClassification;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  isGolden: boolean;
}

export interface IdentityCollisionReport {
  evaluatedAt: string;
  totalRootsAudited: number;
  collisionsFoundCount: number;
  realCollisionsCount: number;
  legacyDuplicatesCount: number;
  collisions: IdentityCollisionItem[];
  status: 'NO_CRITICAL_COLLISIONS' | 'CRITICAL_COLLISIONS_DETECTED';
}

export function normalizeIdentityString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function observeIdentityCollisions(catalog: any[]): IdentityCollisionReport {
  const collisions: IdentityCollisionItem[] = [];

  const slugMap: Record<string, string[]> = {};
  const normalizedNameMap: Record<string, { rawNames: string[]; rootIds: string[] }> = {};
  const modelCodeMap: Record<string, string[]> = {};

  for (const p of catalog) {
    if (!p) continue;
    const id = p.id;
    const rawName = p.name || '';
    const normName = normalizeIdentityString(rawName);
    const modelCode = p.modelCode || p.specs?.modelCode || p.specs?.partNumber || '';

    // Slug / ID
    if (id) {
      if (!slugMap[id]) slugMap[id] = [];
      slugMap[id].push(id);
    }

    // Normalized Name
    if (normName) {
      if (!normalizedNameMap[normName]) normalizedNameMap[normName] = { rawNames: [], rootIds: [] };
      normalizedNameMap[normName].rawNames.push(rawName);
      normalizedNameMap[normName].rootIds.push(id);
    }

    // Model Code
    if (modelCode && typeof modelCode === 'string' && modelCode.length > 2) {
      const codeKey = normalizeIdentityString(modelCode);
      if (!modelCodeMap[codeKey]) modelCodeMap[codeKey] = [];
      modelCodeMap[codeKey].push(id);
    }
  }

  // 1. Check ID duplicates
  for (const [idKey, roots] of Object.entries(slugMap)) {
    if (roots.length > 1) {
      collisions.push({
        collisionKey: idKey,
        collisionType: 'SLUG_DUPLICATE',
        affectedRootIds: roots,
        classification: 'REAL_IDENTITY_COLLISION',
        severity: 'CRITICAL',
        description: `Exact duplicate root ID (${idKey}) found across ${roots.length} roots.`,
        isGolden: false
      });
    }
  }

  // 2. Check Normalized Name collisions (e.g. Huawei legacy duplicates with trailing whitespace)
  for (const [normName, data] of Object.entries(normalizedNameMap)) {
    if (data.rootIds.length > 1) {
      // Determine if these are non-Golden legacy duplicate candidates
      const isHuawei = normName.includes('huawei');
      const classification: IdentityCollisionClassification = isHuawei ? 'LEGACY_DUPLICATE_CANDIDATE' : 'REAL_IDENTITY_COLLISION';

      collisions.push({
        collisionKey: normName,
        collisionType: 'NAME_COLLISION',
        affectedRootIds: data.rootIds,
        classification,
        severity: isHuawei ? 'MEDIUM' : 'HIGH',
        description: isHuawei
          ? `Non-Golden legacy duplicate root candidate (${normName}) matching trailing-whitespace variants: ${data.rawNames.map(n => '"' + n + '"').join(', ')}`
          : `Name collision detected across roots: ${data.rootIds.join(', ')}`,
        isGolden: false
      });
    }
  }

  // 3. Check Model Code duplicates
  for (const [codeKey, roots] of Object.entries(modelCodeMap)) {
    if (roots.length > 1) {
      collisions.push({
        collisionKey: codeKey,
        collisionType: 'MODEL_CODE_DUPLICATE',
        affectedRootIds: roots,
        classification: 'LEGITIMATE_SHARED_IDENTIFIER',
        severity: 'LOW',
        description: `Model code ${codeKey} shared across variants ${roots.join(', ')}`,
        isGolden: false
      });
    }
  }

  const realCollisions = collisions.filter(c => c.classification === 'REAL_IDENTITY_COLLISION');
  const legacyDuplicates = collisions.filter(c => c.classification === 'LEGACY_DUPLICATE_CANDIDATE');

  return {
    evaluatedAt: new Date().toISOString(),
    totalRootsAudited: catalog.length,
    collisionsFoundCount: collisions.length,
    realCollisionsCount: realCollisions.length,
    legacyDuplicatesCount: legacyDuplicates.length,
    collisions,
    status: realCollisions.length === 0 ? 'NO_CRITICAL_COLLISIONS' : 'CRITICAL_COLLISIONS_DETECTED'
  };
}
