/**
 * src/lib/pricing/retailerQuantumScheduler.ts
 *
 * RETAILER QUANTUM OPTIMIZATION CONTROL PLANE (V1.1)
 *
 * Mathematical formulation of the Retailer Request Scheduling Problem as a
 * Quadratic Unconstrained Binary Optimization (QUBO) model with Hard Cooldown Policy Gates.
 *
 * PURPOSE:
 * Solves: "Which safe retailer/product mappings should be checked now, which should be deferred?"
 *
 * V1.1 ENHANCEMENTS:
 * - Deterministic Hard Cooldown Policy Gates BEFORE QUBO model creation.
 * - Standardized HardGateReason enum (RECENT_LIVE_PRICE, RECENT_OUT_OF_STOCK, RECENT_STORE_ONLY, etc.).
 * - If 0 candidates are QUANTUM_ELIGIBLE, QUBO execution is skipped (QUBO_EXECUTED = NO).
 * - Classical fallback operates strictly on QUANTUM_ELIGIBLE candidates (cooldown cannot be bypassed).
 * - Multi-store override support for all 8 supported retailers (vatan, teknosa, hepsiburada, n11, pttavm, amazon, trendyol, mediamarkt).
 *
 * SAFETY & INTEGRITY:
 * - Does NOT generate prices.
 * - Does NOT make identity decisions.
 * - Does NOT bypass WAF or anti-bot rules.
 * - Does NOT mutate Supabase (0 writes).
 * - REAL_QPU = NO, QUANTUM_BACKEND = SIMULATED_ANNEALING with CLASSICAL_FALLBACK.
 */

import { PRICE_FRESHNESS_HOURS } from '@/lib/priceFreshness';

// ============================================================================
// 1. DATA CONTRACTS & INTERFACES
// ============================================================================

export type SupportedStoreId =
  | 'vatan'
  | 'teknosa'
  | 'hepsiburada'
  | 'n11'
  | 'pttavm'
  | 'amazon'
  | 'trendyol'
  | 'mediamarkt';

export type HardGateReason =
  | 'RECENT_LIVE_PRICE'
  | 'RECENT_OUT_OF_STOCK'
  | 'RECENT_STORE_ONLY'
  | 'RECENT_NO_VALID_OFFER'
  | 'CIRCUIT_BREAKER_OPEN'
  | 'RATE_LIMIT_COOLDOWN'
  | 'INACTIVE_MAPPING'
  | 'IDENTITY_NOT_MATCHED'
  | 'LOW_MATCH_CONFIDENCE'
  | 'DEAD_MAPPING';

export interface RetailerRefreshCandidate {
  productId: string;
  storeId: string;
  storeProductId: string;

  mappingActive: boolean;
  identityStatus: 'MATCHED' | 'MATCH_REVIEW_REQUIRED' | 'REJECTED' | 'UNREACHABLE';
  matchConfidence: number;

  lastCheckedAt: string | null;
  ageHours: number;

  currentPriceExists: boolean;
  currentPrice: number | null;
  currentStock: string | null;

  historyCount: number;

  lastHttpStatus: number | null;
  lastOfferStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'STORE_ONLY' | 'NO_VALID_OFFER' | null;

  productPriority: 'HIGH_PRIORITY' | 'NORMAL' | 'LOW_PRIORITY' | null;
  storeHealth: number | null; // 0.0 (unhealthy) to 1.0 (optimal)
  recentFailureCount: number | null;
  recentNoOfferCount: number | null;
}

export interface RetailerStorePolicyOverrides {
  cooldownFreshHours?: number;
  cooldownOutOfStockHours?: number;
  cooldownStoreOnlyHours?: number;
  cooldownNoValidOfferHours?: number;
  cooldownFailureHours?: number;
  baseRequestCost?: number;
  congestionPenaltyWeight?: number;
}

export interface RetailerOptimizationPolicy {
  // Existing codebase constant: PRICE_FRESHNESS_HOURS = 24 (from src/lib/priceFreshness.ts)
  freshnessThresholdHours: number;

  // CONFIGURABLE_DEFAULTS (Separated from missing code config)
  cooldownFreshHours: number; // 4.0h
  cooldownOutOfStockHours: number; // 12.0h
  cooldownStoreOnlyHours: number; // 24.0h
  cooldownNoValidOfferHours: number; // 8.0h (CONFIGURABLE_DEFAULT)
  cooldownFailureHours: number; // 2.0h (CONFIGURABLE_DEFAULT)

  baseRequestCost: number; // 15.0
  congestionPenaltyWeight: number; // 10.0
  budgetPenaltyWeight: number; // 100.0

  storeOverrides?: Partial<Record<SupportedStoreId, RetailerStorePolicyOverrides>>;
}

export interface RetailerHealthState {
  storeId: string;
  circuitBreakerOpen: boolean;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  rateLimitCooldownActive: boolean;
  degradedHealth: boolean; // e.g. elevated 429/403 or high latency
  reliabilityScore: number; // 0.0 to 1.0
}

export interface OptimizationBudget {
  storeId: string;
  maxRequestsPerRun: number; // e.g. 2 for Vatan pilot
}

export interface ScoredCandidate {
  candidate: RetailerRefreshCandidate;
  urgency: number;
  riskPenalty: number;
  requestCost: number;
  netScore: number;
  breakdown: {
    staleUrgency: number;
    missingPriceUrgency: number;
    historyNeedUrgency: number;
    priorityUrgency: number;
    confidenceUrgency: number;
    volatilityUrgency: number;
    recentlyCheckedPenalty: number;
    recentNoOfferPenalty: number;
    recentFailurePenalty: number;
    storeRiskPenalty: number;
  };
}

export interface OptimizationTelemetry {
  runId: string;
  timestamp: string;
  storeId: string;
  candidateCount: number;
  safeCandidateCount: number;
  quantumEligibleCount: number;
  selectedCount: number;
  estimatedRequestSavings: number;
  solverBackend: 'SIMULATED_ANNEALING' | 'CLASSICAL_GREEDY_FALLBACK' | 'NONE';
  quboExecuted: boolean;
  solverDurationMs: number;
  fallbackUsed: boolean;
  circuitBreakerState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export interface ScheduledCandidateDecision {
  productId: string;
  storeProductId: string;
  decision: 'SELECT' | 'SKIP';
  reason: HardGateReason | string;
  quantumEligible: boolean;
  urgency: number;
  risk: number;
  cost: number;
  finalScore: number;
}

export interface RetailerSchedulingResult {
  storeId: string;
  totalCandidates: number;
  safeCandidatesCount: number;
  quantumEligibleCount: number;
  selectedCandidates: RetailerRefreshCandidate[];
  selectedProductIds: string[];
  decisions: ScheduledCandidateDecision[];
  telemetry: OptimizationTelemetry;
}

// ============================================================================
// 2. CONFIGURABLE DEFAULTS & POLICY
// ============================================================================

export const DEFAULT_RETAILER_POLICY: RetailerOptimizationPolicy = {
  freshnessThresholdHours: PRICE_FRESHNESS_HOURS, // 24

  // CONFIGURABLE_DEFAULTS (Grounded per V1.1 requirements)
  cooldownFreshHours: 4.0, // Fresh LIVE_PRICE: 4 hours
  cooldownOutOfStockHours: 12.0, // OUT_OF_STOCK: 12 hours
  cooldownStoreOnlyHours: 24.0, // STORE_ONLY: 24 hours
  cooldownNoValidOfferHours: 8.0, // NO_VALID_OFFER: 8 hours (CONFIGURABLE_DEFAULT)
  cooldownFailureHours: 2.0, // Network/transient failure: 2 hours (CONFIGURABLE_DEFAULT)

  baseRequestCost: 15.0,
  congestionPenaltyWeight: 10.0,
  budgetPenaltyWeight: 100.0,

  // Multi-retailer overrides for all 8 supported stores
  storeOverrides: {
    vatan: {},
    teknosa: {},
    hepsiburada: {},
    n11: {},
    pttavm: {},
    amazon: {},
    trendyol: {},
    mediamarkt: {},
  },
};

export function getEffectivePolicy(
  policy: RetailerOptimizationPolicy = DEFAULT_RETAILER_POLICY,
  storeId: string
): RetailerOptimizationPolicy {
  const overrides = policy.storeOverrides?.[storeId as SupportedStoreId];
  if (!overrides) return policy;

  return {
    ...policy,
    cooldownFreshHours: overrides.cooldownFreshHours ?? policy.cooldownFreshHours,
    cooldownOutOfStockHours: overrides.cooldownOutOfStockHours ?? policy.cooldownOutOfStockHours,
    cooldownStoreOnlyHours: overrides.cooldownStoreOnlyHours ?? policy.cooldownStoreOnlyHours,
    cooldownNoValidOfferHours: overrides.cooldownNoValidOfferHours ?? policy.cooldownNoValidOfferHours,
    cooldownFailureHours: overrides.cooldownFailureHours ?? policy.cooldownFailureHours,
    baseRequestCost: overrides.baseRequestCost ?? policy.baseRequestCost,
    congestionPenaltyWeight: overrides.congestionPenaltyWeight ?? policy.congestionPenaltyWeight,
  };
}

// ============================================================================
// 3. HARD SAFETY & COOLDOWN GATES
// ============================================================================

export class RetailerSafetyGates {
  /**
   * Hard structural gate (circuit breaker, mapping active, identity match, dead URLs)
   */
  public static evaluateStructuralGate(
    candidate: RetailerRefreshCandidate,
    health: RetailerHealthState
  ): { passed: boolean; reason?: HardGateReason } {
    if (health.circuitBreakerOpen || health.circuitBreakerState === 'OPEN') {
      return { passed: false, reason: 'CIRCUIT_BREAKER_OPEN' };
    }
    if (health.rateLimitCooldownActive) {
      return { passed: false, reason: 'RATE_LIMIT_COOLDOWN' };
    }
    if (!candidate.mappingActive) {
      return { passed: false, reason: 'INACTIVE_MAPPING' };
    }
    if (candidate.identityStatus !== 'MATCHED') {
      return { passed: false, reason: 'IDENTITY_NOT_MATCHED' };
    }
    if (candidate.matchConfidence < 90.0) {
      return { passed: false, reason: 'LOW_MATCH_CONFIDENCE' };
    }
    if (candidate.lastHttpStatus === 404 || candidate.lastHttpStatus === 410) {
      return { passed: false, reason: 'DEAD_MAPPING' };
    }
    return { passed: true };
  }

  /**
   * Deterministic Hard Cooldown Gate (V1.1)
   * Evaluates if candidate is in cooldown. If so, candidate is strictly ineligible for QUBO.
   */
  public static evaluateCooldownGate(
    candidate: RetailerRefreshCandidate,
    policy: RetailerOptimizationPolicy
  ): { passed: boolean; reason?: HardGateReason } {
    // 1. Fresh LIVE_PRICE in-stock cooldown (4h)
    if (candidate.currentPriceExists && candidate.currentStock === 'IN_STOCK') {
      if (candidate.ageHours < policy.cooldownFreshHours) {
        return { passed: false, reason: 'RECENT_LIVE_PRICE' };
      }
    }

    // 2. OUT_OF_STOCK cooldown (12h)
    if (candidate.lastOfferStatus === 'OUT_OF_STOCK') {
      if (candidate.ageHours < policy.cooldownOutOfStockHours) {
        return { passed: false, reason: 'RECENT_OUT_OF_STOCK' };
      }
    }

    // 3. STORE_ONLY cooldown (24h)
    if (candidate.lastOfferStatus === 'STORE_ONLY') {
      if (candidate.ageHours < policy.cooldownStoreOnlyHours) {
        return { passed: false, reason: 'RECENT_STORE_ONLY' };
      }
    }

    // 4. NO_VALID_OFFER cooldown (8h)
    if (candidate.lastOfferStatus === 'NO_VALID_OFFER') {
      if (candidate.ageHours < policy.cooldownNoValidOfferHours) {
        return { passed: false, reason: 'RECENT_NO_VALID_OFFER' };
      }
    }

    return { passed: true };
  }
}

// ============================================================================
// 4. CANDIDATE SCORER (FOR QUANTUM-ELIGIBLE CANDIDATES ONLY)
// ============================================================================

export class RetailerCandidateScorer {
  public static score(
    candidate: RetailerRefreshCandidate,
    policy: RetailerOptimizationPolicy,
    health: RetailerHealthState
  ): ScoredCandidate {
    // -------------------------------------------------------------------------
    // A. URGENCY COMPONENTS (+)
    // -------------------------------------------------------------------------
    let staleUrgency = 0;
    if (candidate.currentPriceExists) {
      if (candidate.ageHours > policy.freshnessThresholdHours) {
        staleUrgency = Math.min(50, (candidate.ageHours - policy.freshnessThresholdHours) * 2.0);
      } else if (candidate.ageHours > policy.cooldownFreshHours) {
        staleUrgency = (candidate.ageHours - policy.cooldownFreshHours) * 0.5;
      }
    }

    const missingPriceUrgency = !candidate.currentPriceExists ? 50.0 : 0.0;

    let historyNeedUrgency = 0;
    if (candidate.historyCount === 0) {
      historyNeedUrgency = 20.0;
    } else if (candidate.historyCount < 3) {
      historyNeedUrgency = 10.0;
    }

    let priorityUrgency = 10.0; // NORMAL
    if (candidate.productPriority === 'HIGH_PRIORITY') {
      priorityUrgency = 25.0;
    } else if (candidate.productPriority === 'LOW_PRIORITY') {
      priorityUrgency = 0.0;
    }

    const confidenceUrgency = (candidate.matchConfidence / 100.0) * 10.0;
    const volatilityUrgency = candidate.historyCount >= 2 ? 15.0 : 0.0;

    const totalUrgency =
      staleUrgency +
      missingPriceUrgency +
      historyNeedUrgency +
      priorityUrgency +
      confidenceUrgency +
      volatilityUrgency;

    // -------------------------------------------------------------------------
    // B. RISK PENALTIES (-)
    // -------------------------------------------------------------------------
    let recentFailurePenalty = 0;
    if ((candidate.recentFailureCount ?? 0) > 0) {
      recentFailurePenalty = 35.0 * Math.min(3, candidate.recentFailureCount!);
    }

    let storeRiskPenalty = 0;
    if (health.degradedHealth) {
      storeRiskPenalty = 45.0;
    }

    const totalRiskPenalty = recentFailurePenalty + storeRiskPenalty;

    // -------------------------------------------------------------------------
    // C. REQUEST COST & NET SCORE
    // -------------------------------------------------------------------------
    const requestCost = policy.baseRequestCost;
    const netScore = Number((totalUrgency - totalRiskPenalty - requestCost).toFixed(2));

    return {
      candidate,
      urgency: Number(totalUrgency.toFixed(2)),
      riskPenalty: Number(totalRiskPenalty.toFixed(2)),
      requestCost,
      netScore,
      breakdown: {
        staleUrgency: Number(staleUrgency.toFixed(2)),
        missingPriceUrgency,
        historyNeedUrgency,
        priorityUrgency,
        confidenceUrgency,
        volatilityUrgency,
        recentlyCheckedPenalty: 0,
        recentNoOfferPenalty: 0,
        recentFailurePenalty: Number(recentFailurePenalty.toFixed(2)),
        storeRiskPenalty,
      },
    };
  }
}

// ============================================================================
// 5. QUBO MODEL FOR RETAILER SCHEDULING
// ============================================================================

export interface RetailerQUBOMatrix {
  size: number;
  variables: string[];
  matrix: number[][]; // Upper triangular Q matrix
  constantOffset: number;
}

export class QuboRetailerModel {
  public static build(
    scored: ScoredCandidate[],
    budget: OptimizationBudget,
    policy: RetailerOptimizationPolicy
  ): RetailerQUBOMatrix {
    const N = scored.length;
    const matrix: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
    const variables: string[] = scored.map(s => s.candidate.productId);

    // 1. Diagonal: minimize -netScore
    for (let i = 0; i < N; i++) {
      matrix[i][i] = -scored[i].netScore;
    }

    // 2. Off-diagonal: Congestion penalty between concurrent requests to same store
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        matrix[i][j] = policy.congestionPenaltyWeight;
      }
    }

    return {
      size: N,
      variables,
      matrix,
      constantOffset: 0,
    };
  }

  public static evaluateEnergy(
    qubo: RetailerQUBOMatrix,
    state: number[],
    maxK: number,
    penaltyWeight: number
  ): number {
    let energy = qubo.constantOffset;
    const N = qubo.size;
    let selectedCount = 0;

    for (let i = 0; i < N; i++) {
      if (state[i] === 0) continue;
      selectedCount++;
      energy += qubo.matrix[i][i];
      for (let j = i + 1; j < N; j++) {
        if (state[j] === 1) {
          energy += qubo.matrix[i][j];
        }
      }
    }

    if (selectedCount > maxK) {
      energy += penaltyWeight * Math.pow(selectedCount - maxK, 2);
    }

    return energy;
  }
}

// ============================================================================
// 6. SIMULATED ANNEALING SOLVER
// ============================================================================

export class SimulatedAnnealingScheduler {
  public static solve(
    qubo: RetailerQUBOMatrix,
    maxK: number,
    penaltyWeight: number,
    scored: ScoredCandidate[]
  ): number[] {
    const N = qubo.size;
    if (N === 0) return [];

    let state = new Array(N).fill(0);

    // Initial warm greedy start for positive net scores up to maxK
    const positiveIndices = scored
      .map((s, idx) => ({ idx, netScore: s.netScore }))
      .filter(x => x.netScore > 0)
      .sort((a, b) => b.netScore - a.netScore)
      .slice(0, maxK)
      .map(x => x.idx);

    for (const idx of positiveIndices) {
      state[idx] = 1;
    }

    let currentEnergy = QuboRetailerModel.evaluateEnergy(qubo, state, maxK, penaltyWeight);
    let bestState = [...state];
    let bestEnergy = currentEnergy;

    let temp = 100.0;
    const coolingRate = 0.95;
    const maxIterations = 300;

    for (let step = 0; step < maxIterations; step++) {
      const flipIdx = Math.floor(Math.random() * N);
      const nextState = [...state];
      nextState[flipIdx] = 1 - nextState[flipIdx];

      const nextEnergy = QuboRetailerModel.evaluateEnergy(qubo, nextState, maxK, penaltyWeight);
      const delta = nextEnergy - currentEnergy;

      if (delta < 0 || Math.exp(-delta / temp) > Math.random()) {
        state = nextState;
        currentEnergy = nextEnergy;
        if (currentEnergy < bestEnergy) {
          bestEnergy = currentEnergy;
          bestState = [...state];
        }
      }

      temp *= coolingRate;
    }

    // Enforce budget limit K
    let totalSelected = bestState.reduce((sum, b) => sum + b, 0);
    if (totalSelected > maxK) {
      const activeIndices = bestState
        .map((b, idx) => (b === 1 ? { idx, netScore: scored[idx].netScore } : null))
        .filter((x): x is { idx: number; netScore: number } => x !== null)
        .sort((a, b) => b.netScore - a.netScore);

      bestState.fill(0);
      for (let i = 0; i < Math.min(maxK, activeIndices.length); i++) {
        if (activeIndices[i].netScore > 0) {
          bestState[activeIndices[i].idx] = 1;
        }
      }
    }

    return bestState;
  }
}

// ============================================================================
// 7. CLASSICAL GREEDY FALLBACK SOLVER (SAFE_CLASSICAL_POLICY)
// ============================================================================

export class ClassicalGreedyScheduler {
  public static solve(scored: ScoredCandidate[], maxK: number): number[] {
    const N = scored.length;
    const state = new Array(N).fill(0);

    const candidatesWithScore = scored
      .map((s, idx) => ({ idx, netScore: s.netScore }))
      .filter(x => x.netScore > 0)
      .sort((a, b) => b.netScore - a.netScore);

    for (let i = 0; i < Math.min(maxK, candidatesWithScore.length); i++) {
      state[candidatesWithScore[i].idx] = 1;
    }

    return state;
  }
}

// ============================================================================
// 8. RETAILER QUANTUM SCHEDULER ORCHESTRATOR
// ============================================================================

export class RetailerQuantumScheduler {
  public static schedule(
    candidates: RetailerRefreshCandidate[],
    health: RetailerHealthState,
    budget: OptimizationBudget,
    policyInput: RetailerOptimizationPolicy = DEFAULT_RETAILER_POLICY
  ): RetailerSchedulingResult {
    const startTime = Date.now();
    const runId = `opt_${health.storeId}_${Date.now()}`;
    const effectivePolicy = getEffectivePolicy(policyInput, health.storeId);
    const decisions: ScheduledCandidateDecision[] = [];

    let safeCandidatesCount = 0;
    const eligibleForQuantum: RetailerRefreshCandidate[] = [];

    // Step 1: Hard Structural Safety Gates
    for (const c of candidates) {
      const structGate = RetailerSafetyGates.evaluateStructuralGate(c, health);
      if (!structGate.passed) {
        decisions.push({
          productId: c.productId,
          storeProductId: c.storeProductId,
          decision: 'SKIP',
          reason: structGate.reason!,
          quantumEligible: false,
          urgency: 0,
          risk: 100,
          cost: effectivePolicy.baseRequestCost,
          finalScore: -100,
        });
        continue;
      }

      safeCandidatesCount++;

      // Step 2: Deterministic Hard Cooldown Gate (V1.1)
      const cooldownGate = RetailerSafetyGates.evaluateCooldownGate(c, effectivePolicy);
      if (!cooldownGate.passed) {
        decisions.push({
          productId: c.productId,
          storeProductId: c.storeProductId,
          decision: 'SKIP',
          reason: cooldownGate.reason!,
          quantumEligible: false,
          urgency: 0,
          risk: 60,
          cost: effectivePolicy.baseRequestCost,
          finalScore: -60,
        });
        continue;
      }

      // Passed both structural and cooldown gates -> QUANTUM_ELIGIBLE
      eligibleForQuantum.push(c);
    }

    const quantumEligibleCount = eligibleForQuantum.length;

    // If 0 candidates are eligible, QUBO is NOT executed.
    if (quantumEligibleCount === 0) {
      const duration = Date.now() - startTime;
      return {
        storeId: health.storeId,
        totalCandidates: candidates.length,
        safeCandidatesCount,
        quantumEligibleCount: 0,
        selectedCandidates: [],
        selectedProductIds: [],
        decisions,
        telemetry: {
          runId,
          timestamp: new Date().toISOString(),
          storeId: health.storeId,
          candidateCount: candidates.length,
          safeCandidateCount: safeCandidatesCount,
          quantumEligibleCount: 0,
          selectedCount: 0,
          estimatedRequestSavings: candidates.length,
          solverBackend: 'NONE',
          quboExecuted: false,
          solverDurationMs: duration,
          fallbackUsed: false,
          circuitBreakerState: health.circuitBreakerState,
        },
      };
    }

    // Step 3: Score only QUANTUM_ELIGIBLE candidates
    const scoredList = eligibleForQuantum.map(c =>
      RetailerCandidateScorer.score(c, effectivePolicy, health)
    );

    // Step 4: QUBO Model Build
    const qubo = QuboRetailerModel.build(scoredList, budget, effectivePolicy);

    // Step 5: Solve via Simulated Annealing
    let solutionState: number[] = [];
    let solverBackend: 'SIMULATED_ANNEALING' | 'CLASSICAL_GREEDY_FALLBACK' = 'SIMULATED_ANNEALING';
    let fallbackUsed = false;

    try {
      solutionState = SimulatedAnnealingScheduler.solve(
        qubo,
        budget.maxRequestsPerRun,
        effectivePolicy.budgetPenaltyWeight,
        scoredList
      );
    } catch (solverError) {
      console.warn('[RetailerQuantumScheduler] Simulated Annealing solver error, invoking classical fallback:', solverError);
      solutionState = ClassicalGreedyScheduler.solve(scoredList, budget.maxRequestsPerRun);
      solverBackend = 'CLASSICAL_GREEDY_FALLBACK';
      fallbackUsed = true;
    }

    // Step 6: Construct Selection Results & Decisions
    const selectedCandidates: RetailerRefreshCandidate[] = [];
    const selectedProductIds: string[] = [];

    for (let i = 0; i < eligibleForQuantum.length; i++) {
      const scored = scoredList[i];
      const isSelected = solutionState[i] === 1;

      if (isSelected) {
        selectedCandidates.push(scored.candidate);
        selectedProductIds.push(scored.candidate.productId);
        decisions.push({
          productId: scored.candidate.productId,
          storeProductId: scored.candidate.storeProductId,
          decision: 'SELECT',
          reason: `OPTIMIZED_PRIORITY (NetScore: ${scored.netScore}, Urgency: ${scored.urgency}, Cost: ${scored.requestCost})`,
          quantumEligible: true,
          urgency: scored.urgency,
          risk: scored.riskPenalty,
          cost: scored.requestCost,
          finalScore: scored.netScore,
        });
      } else {
        decisions.push({
          productId: scored.candidate.productId,
          storeProductId: scored.candidate.storeProductId,
          decision: 'SKIP',
          reason: `DEFERRED_BUDGET_CAP (Budget: ${budget.maxRequestsPerRun} reached)`,
          quantumEligible: true,
          urgency: scored.urgency,
          risk: scored.riskPenalty,
          cost: scored.requestCost,
          finalScore: scored.netScore,
        });
      }
    }

    const duration = Date.now() - startTime;
    const telemetry: OptimizationTelemetry = {
      runId,
      timestamp: new Date().toISOString(),
      storeId: health.storeId,
      candidateCount: candidates.length,
      safeCandidateCount: safeCandidatesCount,
      quantumEligibleCount,
      selectedCount: selectedCandidates.length,
      estimatedRequestSavings: candidates.length - selectedCandidates.length,
      solverBackend,
      quboExecuted: true,
      solverDurationMs: duration,
      fallbackUsed,
      circuitBreakerState: health.circuitBreakerState,
    };

    return {
      storeId: health.storeId,
      totalCandidates: candidates.length,
      safeCandidatesCount,
      quantumEligibleCount,
      selectedCandidates,
      selectedProductIds,
      decisions,
      telemetry,
    };
  }
}
