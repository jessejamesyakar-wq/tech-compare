// src/lib/ai/robopengu/optimizer/optimizationEngine.ts
/**
 * Worker 8: Optimization Engine Interface
 * Defines pluggable contract for candidate optimization (Classical Pareto / Future Quantum Solvers).
 */

import { ScoredCandidate, ShoppingIntent, OptimizationResult } from '../types';

export interface OptimizationEngine {
  optimize(
    candidates: ScoredCandidate[],
    intent: ShoppingIntent,
    limit?: number
  ): OptimizationResult;
}
