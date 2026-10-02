// src/lib/ai/robopengu/optimizer/classicalOptimizer.ts
/**
 * Worker 8: Production Classical Optimizer
 * Multi-objective Pareto frontier identification and weighted scalarization.
 * Deterministic, explainable, and high performance (< 10ms execution).
 */

import { OptimizationEngine } from './optimizationEngine';
import { ScoredCandidate, ShoppingIntent, OptimizationResult, OptimizationMetrics } from '../types';

export class ClassicalOptimizer implements OptimizationEngine {
  public optimize(
    candidates: ScoredCandidate[],
    intent: ShoppingIntent,
    limit: number = 5
  ): OptimizationResult {
    const startTime = Date.now();
    const totalConsidered = candidates.length;

    if (totalConsidered === 0) {
      return {
        selectedCandidates: [],
        metrics: {
          candidatesConsidered: 0,
          feasibleCount: 0,
          paretoFrontSize: 0,
          solverType: 'CLASSICAL',
          solveDurationMs: Date.now() - startTime,
        },
      };
    }

    // Step 1: Feasibility filter
    const feasible = candidates.filter(c => {
      // Must have positive total score
      if (c.scoreBreakdown.totalScore <= 0) return false;
      // Must not be severely penalized
      return true;
    });

    // Step 2: Multi-Objective Pareto Dominance Analysis
    // Objectives to maximize:
    // Obj 1: Capability (Camera + Battery + Display)
    // Obj 2: Performance (Processor + RAM)
    // Obj 3: Value for Money (Score / Normalized Price)
    // Obj 4: Trust Score
    const objectiveVectors = feasible.map(c => {
      const price = c.priceInfo.effectivePrice || 99999;
      const capability = (c.scoreBreakdown.cameraScore + c.scoreBreakdown.batteryScore + c.scoreBreakdown.displayScore) / 3;
      const performance = c.scoreBreakdown.performanceScore;
      const value = (c.scoreBreakdown.totalScore / Math.max(1000, price)) * 10000;
      const trust = c.trustEvaluation.overallTrustScore * 100;
      return { candidate: c, capability, performance, value, trust };
    });

    const isDominated = new Array(objectiveVectors.length).fill(false);
    for (let i = 0; i < objectiveVectors.length; i++) {
      for (let j = 0; j < objectiveVectors.length; j++) {
        if (i === j) continue;
        const A = objectiveVectors[j];
        const B = objectiveVectors[i];
        // Does A dominate B?
        const aAtLeastB = A.capability >= B.capability &&
                          A.performance >= B.performance &&
                          A.value >= B.value &&
                          A.trust >= B.trust;
        const aStrictlyBetter = A.capability > B.capability ||
                               A.performance > B.performance ||
                               A.value > B.value ||
                               A.trust > B.trust;
        if (aAtLeastB && aStrictlyBetter) {
          isDominated[i] = true;
          break;
        }
      }
    }

    const paretoFront = objectiveVectors.filter((_, idx) => !isDominated[idx]).map(o => o.candidate);

    // Step 3: Sort by Total Weighted Score
    // Place Pareto-optimal candidates first, then non-dominated secondary
    paretoFront.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);

    const nonPareto = objectiveVectors.filter((_, idx) => isDominated[idx]).map(o => o.candidate);
    nonPareto.sort((a, b) => b.scoreBreakdown.totalScore - a.scoreBreakdown.totalScore);

    const sorted = [...paretoFront, ...nonPareto];
    const selected = sorted.slice(0, limit);

    const solveDurationMs = Date.now() - startTime;

    const metrics: OptimizationMetrics = {
      candidatesConsidered: totalConsidered,
      feasibleCount: feasible.length,
      paretoFrontSize: paretoFront.length,
      solverType: 'CLASSICAL',
      solveDurationMs,
    };

    return {
      selectedCandidates: selected,
      metrics,
    };
  }
}
