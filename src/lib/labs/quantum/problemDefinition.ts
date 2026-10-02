// src/lib/labs/quantum/problemDefinition.ts
/**
 * Worker 9: Quantum Labs - Problem Definition
 * Mathematical formulation of the Smartphone Portfolio / Selection Problem.
 *
 * Variables:
 *   x_i \in {0, 1} for i \in {1, ..., N} indicating selection of candidate i.
 *
 * Objective:
 *   Maximize Quality: \sum_{i=1}^N V_i x_i
 *
 * Constraints:
 *   1. Cardinality Constraint: \sum_{i=1}^N x_i = k (choose top k items)
 *   2. Budget Constraint: \sum_{i=1}^N P_i x_i \le B
 *   3. Diversity / Complementarity Penalty / Synergy: \sum_{i < j} J_{ij} x_i x_j
 */

export interface CandidateItem {
  id: string;
  name: string;
  value: number; // Normalized multi-objective score [0, 100]
  price: number; // Price in TRY
  brand: string;
}

export interface SelectionProblemSpec {
  candidates: CandidateItem[];
  k: number; // Target number of devices to select
  maxBudget: number; // Upper budget limit
  lambdaCardinality: number; // Penalty weight for cardinality constraint
  lambdaBudget: number; // Penalty weight for budget constraint
}
