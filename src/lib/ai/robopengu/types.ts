// src/lib/ai/robopengu/types.ts
/**
 * Types and interfaces for the RoboPengu AI Engine (Wave 10)
 */

export interface BudgetConstraint {
  min?: number;
  max?: number;
  target?: number;
  currency: 'TRY' | 'USD' | 'EUR';
  isStrict: boolean;
}

export type PriorityLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface UsagePriorities {
  camera: PriorityLevel;
  battery: PriorityLevel;
  gaming: PriorityLevel;
  display: PriorityLevel;
  performance: PriorityLevel;
  compactSize: PriorityLevel;
  storage: PriorityLevel;
}

export type PurchaseTiming = 'immediate' | 'can_wait' | 'looking_for_deals' | 'uncertain';

export interface ShoppingIntent {
  rawQuery: string;
  category: 'smartphones' | 'tablets' | 'laptops' | 'smartwatches' | 'headphones' | 'unknown';
  budget?: BudgetConstraint;
  preferredBrands: string[];
  excludedBrands: string[];
  usagePriorities: UsagePriorities;
  cameraPriority: PriorityLevel;
  batteryPriority: PriorityLevel;
  gamingPriority: PriorityLevel;
  displayPriority: PriorityLevel;
  performancePriority: PriorityLevel;
  storageMinimumGb?: number;
  ramMinimumGb?: number;
  purchaseTiming: PurchaseTiming;
  mustHaveFeatures: string[];
  avoidFeatures: string[];
  hasConflictingConstraints: boolean;
  conflictExplanation?: string;
  requiresFollowUp: boolean;
  followUpQuestions: string[];
}

export type PriceStatus = 'LIVE_PRICE' | 'PERSISTED_PRICE' | 'CATALOG_FALLBACK' | 'NO_PRICE_DATA';

export interface PriceIntelligenceInfo {
  status: PriceStatus;
  effectivePrice: number | null;
  displayPriceFormatted: string;
  currency: string;
  isFallback: boolean;
  storeCount: number;
  activeOffers: number;
  bestStore?: string;
  lastUpdated?: string;
  confidence: number;
  // Provenance V2 (Day 3.4)
  sourceType?: string | null;
  channelId?: string | null;
  observedAt?: string | null;
  provenanceTrustLabel?: string | null;
}

export type BuyWaitDecision = 'BUY_NOW' | 'WAIT' | 'NEUTRAL' | 'INSUFFICIENT_DATA';

export interface BuyWaitAdvice {
  decision: BuyWaitDecision;
  confidence: number; // 0.0 to 1.0
  reasonCodes: string[];
  freshness: string;
  summary: string;
}

export interface TrustEvaluation {
  hasUnverifiedFields: boolean;
  unverifiedFields: string[];
  hasBlockedFields: boolean;
  blockedFields: string[];
  warnings: string[];
  verifiedProvenances: string[];
  overallTrustScore: number; // 0.0 to 1.0
}

export interface ScoreBreakdown {
  cameraScore: number;
  batteryScore: number;
  displayScore: number;
  performanceScore: number;
  valueScore: number;
  preferenceMatchScore: number;
  trustPenalty: number;
  totalScore: number;
}

export interface ScoredCandidate {
  rootId: string;
  name: string;
  brand: string;
  slug: string;
  category: string;
  specs: any;
  priceInfo: PriceIntelligenceInfo;
  buyWaitAdvice: BuyWaitAdvice;
  trustEvaluation: TrustEvaluation;
  scoreBreakdown: ScoreBreakdown;
  matchedHighlights: string[];
  compromises: string[];
}

export interface RecommendationResult {
  intent: ShoppingIntent;
  totalCandidatesEvaluated: number;
  rankedCandidates: ScoredCandidate[];
  compromises: string[];
  trustSummary: string;
  followUpQuestions?: string[];
  executionTimeMs: number;
}

export interface OptimizationWeights {
  camera: number;
  battery: number;
  display: number;
  performance: number;
  priceValue: number;
  storage: number;
}

export interface OptimizationMetrics {
  candidatesConsidered: number;
  feasibleCount: number;
  paretoFrontSize: number;
  solverType: 'CLASSICAL' | 'QUANTUM_SIMULATION';
  solveDurationMs: number;
}

export interface OptimizationResult {
  selectedCandidates: ScoredCandidate[];
  metrics: OptimizationMetrics;
}
