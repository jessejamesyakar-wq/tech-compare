export type ProvenanceClass =
  | 'MANUFACTURER_DIRECT'
  | 'STRUCTURED_SECONDARY'
  | 'DERIVED_FROM_MANUFACTURER'
  | 'MANUAL_VERIFIED'
  | 'TEMPORAL'
  | 'SEMANTIC_REVIEW_REQUIRED'
  | 'VARIANT_SPECIFIC'
  | 'REGION_SPECIFIC'
  | 'CONFLICT'
  | 'UNSUPPORTED';

export type SourceScope =
  | 'FAMILY'
  | 'CAPACITY_ROOT'
  | 'EXACT_VARIANT'
  | 'REGION'
  | 'GENERIC_MODEL'
  | 'TEMPORAL';

export type EvidenceFreshnessStatus =
  | 'CURRENT_EVIDENCE'
  | 'STALE_EVIDENCE'
  | 'UNVERIFIED_EVIDENCE';

export type IdentityTrustStatus =
  | 'VERIFIED'
  | 'PARTIAL'
  | 'UNVERIFIED'
  | 'CONFLICT';

export type VariantTrustStatus =
  | 'EXACT_SKU'
  | 'EXACT_OFFICIAL_VARIANT'
  | 'GENERIC_FAMILY'
  | 'CAPACITY_VERIFIED'
  | 'NO_EXACT_VARIANT'
  | 'VARIANT_CONFLICT';

export type SpecCoverageTrustStatus =
  | 'MANUFACTURER_VERIFIED'
  | 'MIXED_VERIFIED'
  | 'PARTIAL'
  | 'REVIEW_REQUIRED'
  | 'CONFLICT_PRESENT';

export type PriceFreshnessStatus =
  | 'LIVE'
  | 'RECENT'
  | 'STALE'
  | 'NO_CURRENT_OFFER';

export type PriceHistoryTrustStatus =
  | 'REAL_HISTORY_AVAILABLE'
  | 'COLLECTING'
  | 'NO_HISTORY';

export type DirectionalCompareStatus =
  | 'SAME'
  | 'DIFFERENT'
  | 'MISSING_LEFT'
  | 'MISSING_RIGHT'
  | 'MISSING_BOTH'
  | 'CONFLICT_LEFT'
  | 'CONFLICT_RIGHT'
  | 'NOT_COMPARABLE';

export interface ProductIdentityEvidence {
  productId: string;
  brand: string;
  modelFamily: string;
  storageGb?: number;
  verifiedSkuCount: number;
  skus: string[];
  officialSourceUrls: string[];
  identityStatus: IdentityTrustStatus;
  variantStatus: VariantTrustStatus;
  sourceScope: SourceScope;
}

export interface SpecEvidenceRecord {
  fieldPath: string;
  fieldLabel: string;
  value: any;
  valueFingerprint: string;
  evidenceFreshness: EvidenceFreshnessStatus;
  provenanceClass: ProvenanceClass;
  sourceName: string;
  sourceType: string;
  sourceUrl: string;
  verificationDate: string;
  sourceScope: SourceScope;
  isRicherLocal?: boolean;
}

export interface PriceEvidenceRecord {
  storeName: string;
  priceTry: number;
  offerUrl: string;
  lastScrapedAt: string;
  freshnessStatus: PriceFreshnessStatus;
  inStock: boolean;
  priceScope: SourceScope;
}

export interface CatalogChangeRecord {
  changeId: string;
  fieldPath: string;
  fieldLabel: string;
  oldValue: any;
  newValue: any;
  changeDate: string;
  sourceName: string;
  userFacingSummary: string;
}

export interface ProductTrustProfile {
  productId: string;
  productName: string;
  brand: string;
  identity: IdentityTrustStatus;
  variant: VariantTrustStatus;
  specCoverage: SpecCoverageTrustStatus;
  priceFreshness: PriceFreshnessStatus;
  priceHistory: PriceHistoryTrustStatus;
  openConflictsCount: number;
  evidence: ProductIdentityEvidence;
}

export interface RoboPenguFactItem {
  value: any;
  provenance: ProvenanceClass;
  source: string;
  evidenceRef: string;
  sourceScope: SourceScope;
}

export interface RoboPenguVerifiedFacts {
  productId: string;
  productName: string;
  brand: string;
  isVerifiedProduct: boolean;
  verifiedSpecs: Record<string, RoboPenguFactItem>;
  derivedSpecs: Record<string, RoboPenguFactItem>;
  uncertainFields: string[];
  missingFields: string[];
  conflictingFields: string[];
  disallowedFields: string[];
}

export interface SmartCompareItem {
  fieldPath: string;
  fieldLabel: string;
  valueA: any;
  valueB: any;
  provenanceA: ProvenanceClass;
  provenanceB: ProvenanceClass;
  comparisonStatus: 'same' | 'different' | 'missing' | 'conflicting';
  directionalStatus: DirectionalCompareStatus;
}

export interface SmartCompareAnalysis {
  productIdA: string;
  productIdB: string;
  nameA: string;
  nameB: string;
  sameCount: number;
  differentCount: number;
  missingCount: number;
  conflictingCount: number;
  items: SmartCompareItem[];
}

export interface PriceIntelligenceFacts {
  productId: string;
  currentBestPriceTry?: number;
  bestStoreName?: string;
  offerTimestamp?: string;
  historicalMinimumTry?: number;
  priceRange30d?: { min: number; max: number };
  priceRange90d?: { min: number; max: number };
  priceRange180d?: { min: number; max: number };
  daysOfRealHistory: number;
  historyStatus: PriceHistoryTrustStatus;
  priceScope: SourceScope;
}
