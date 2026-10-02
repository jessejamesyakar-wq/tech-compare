// src/lib/labs/quantum/quboModel.ts
/**
 * Worker 9: Quantum Labs - QUBO Model
 * Quadratic Unconstrained Binary Optimization (QUBO) Matrix Generator.
 * Maps Smartphone Selection with Knapsack & Cardinality constraints to Q matrix.
 * Status: SIMULATION_READY. Zero external QPU calls.
 */

import { SelectionProblemSpec, CandidateItem } from './problemDefinition';

export interface QUBOMatrix {
  size: number;
  variables: string[];
  matrix: number[][]; // Upper triangular or symmetric Q matrix
  constantOffset: number;
}

export class QUBOModel {
  public static build(spec: SelectionProblemSpec): QUBOMatrix {
    const N = spec.candidates.length;
    const { k, maxBudget, lambdaCardinality, lambdaBudget } = spec;

    // Normalize prices relative to maxBudget to avoid numerical instability
    const priceScale = maxBudget > 0 ? 1.0 / maxBudget : 0.0001;

    // Initialize N x N matrix
    const matrix: number[][] = Array.from({ length: N }, () => new Array(N).fill(0));
    const variables: string[] = spec.candidates.map(c => c.id);

    // 1. Objective: Maximize Value -> Minimize -Value
    for (let i = 0; i < N; i++) {
      matrix[i][i] -= spec.candidates[i].value;
    }

    // 2. Cardinality Constraint: lambda_c * (\sum x_i - k)^2
    //    (\sum x_i - k)^2 = \sum x_i + 2 \sum_{i<j} x_i x_j - 2k \sum x_i + k^2
    //    Diagonal: + lambda_c * (1 - 2k)
    //    Off-diagonal: + 2 * lambda_c
    for (let i = 0; i < N; i++) {
      matrix[i][i] += lambdaCardinality * (1 - 2 * k);
      for (let j = i + 1; j < N; j++) {
        matrix[i][j] += 2 * lambdaCardinality;
      }
    }

    // 3. Soft Budget Penalty: lambda_b * (\sum (P_i * priceScale) x_i - 1.0)^2
    for (let i = 0; i < N; i++) {
      const pNorm_i = spec.candidates[i].price * priceScale;
      matrix[i][i] += lambdaBudget * (Math.pow(pNorm_i, 2) - 2 * pNorm_i);

      for (let j = i + 1; j < N; j++) {
        const pNorm_j = spec.candidates[j].price * priceScale;
        matrix[i][j] += 2 * lambdaBudget * pNorm_i * pNorm_j;
      }
    }

    const constantOffset = lambdaCardinality * Math.pow(k, 2) + lambdaBudget * 1.0;

    return {
      size: N,
      variables,
      matrix,
      constantOffset,
    };
  }

  public static evaluateEnergy(qubo: QUBOMatrix, state: number[]): number {
    let energy = qubo.constantOffset;
    const N = qubo.size;
    for (let i = 0; i < N; i++) {
      if (state[i] === 0) continue;
      energy += qubo.matrix[i][i];
      for (let j = i + 1; j < N; j++) {
        if (state[j] === 1) {
          energy += qubo.matrix[i][j];
        }
      }
    }
    return energy;
  }
}
