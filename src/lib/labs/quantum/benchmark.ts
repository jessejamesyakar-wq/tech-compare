// src/lib/labs/quantum/benchmark.ts
/**
 * Worker 9: Quantum Labs - Benchmark Suite
 * Compares Classical Pareto Optimization vs Simulated Annealing QUBO Solver.
 * Status: SIMULATION_READY. Zero external QPU calls. Completely isolated.
 */

import { CandidateItem, SelectionProblemSpec } from './problemDefinition';
import { QUBOModel, QUBOMatrix } from './quboModel';

export interface BenchmarkResult {
  solver: 'CLASSICAL_DETERMINISTIC' | 'SIMULATED_ANNEALING_QUBO';
  selectedIds: string[];
  totalValue: number;
  totalCost: number;
  isBudgetFeasible: boolean;
  isCardinalityFeasible: boolean;
  runtimeMs: number;
  energy?: number;
}

export interface ComparativeBenchmarkSummary {
  candidateCount: number;
  targetK: number;
  budgetLimit: number;
  classical: BenchmarkResult;
  quantumSimulation: BenchmarkResult;
  relativeQualityRatio: number;
  quboMatrixSize: number;
  isolationStatus: 'SIMULATION_READY_ZERO_EXTERNAL_DEPENDENCY';
}

export class OptimizationBenchmark {
  public static runComparison(
    candidates: CandidateItem[],
    k: number = 3,
    maxBudget: number = 50000
  ): ComparativeBenchmarkSummary {
    const spec: SelectionProblemSpec = {
      candidates,
      k,
      maxBudget,
      lambdaCardinality: 50,
      lambdaBudget: 40,
    };

    // 1. Classical Deterministic Solver (Greedy Pareto / Value-Ratio)
    const tStartClassical = Date.now();
    const sorted = [...candidates].sort((a, b) => {
      const valRatioA = a.value / Math.max(1000, a.price);
      const valRatioB = b.value / Math.max(1000, b.price);
      return valRatioB - valRatioA;
    });

    const classicalSelected: CandidateItem[] = [];
    let classicalCost = 0;
    for (const c of sorted) {
      if (classicalSelected.length < k && classicalCost + c.price <= maxBudget * 1.05) {
        classicalSelected.push(c);
        classicalCost += c.price;
      }
    }
    const classicalRuntime = Date.now() - tStartClassical;

    const classicalResult: BenchmarkResult = {
      solver: 'CLASSICAL_DETERMINISTIC',
      selectedIds: classicalSelected.map(c => c.id),
      totalValue: classicalSelected.reduce((sum, c) => sum + c.value, 0),
      totalCost: classicalCost,
      isBudgetFeasible: classicalCost <= maxBudget,
      isCardinalityFeasible: classicalSelected.length === k,
      runtimeMs: Math.max(1, classicalRuntime),
    };

    // 2. Quantum QUBO Model + Simulated Annealing (Numerical local simulation)
    const tStartQubo = Date.now();
    const qubo = QUBOModel.build(spec);
    const quboState = this.solveSimulatedAnnealing(qubo, k);
    const quboRuntime = Date.now() - tStartQubo;

    const quboSelected: CandidateItem[] = [];
    let quboCost = 0;
    for (let i = 0; i < quboState.length; i++) {
      if (quboState[i] === 1) {
        quboSelected.push(candidates[i]);
        quboCost += candidates[i].price;
      }
    }

    const energy = QUBOModel.evaluateEnergy(qubo, quboState);

    const quantumResult: BenchmarkResult = {
      solver: 'SIMULATED_ANNEALING_QUBO',
      selectedIds: quboSelected.map(c => c.id),
      totalValue: quboSelected.reduce((sum, c) => sum + c.value, 0),
      totalCost: quboCost,
      isBudgetFeasible: quboCost <= maxBudget,
      isCardinalityFeasible: quboSelected.length === k,
      runtimeMs: Math.max(1, quboRuntime),
      energy,
    };

    const relativeQualityRatio = classicalResult.totalValue > 0
      ? Number((quantumResult.totalValue / classicalResult.totalValue).toFixed(3))
      : 1.0;

    return {
      candidateCount: candidates.length,
      targetK: k,
      budgetLimit: maxBudget,
      classical: classicalResult,
      quantumSimulation: quantumResult,
      relativeQualityRatio,
      quboMatrixSize: qubo.size,
      isolationStatus: 'SIMULATION_READY_ZERO_EXTERNAL_DEPENDENCY',
    };
  }

  private static solveSimulatedAnnealing(qubo: QUBOMatrix, targetK: number): number[] {
    const N = qubo.size;
    let state = new Array(N).fill(0);

    // Initial greedy state: set first targetK items to 1
    for (let i = 0; i < Math.min(targetK, N); i++) {
      state[i] = 1;
    }

    let currentEnergy = QUBOModel.evaluateEnergy(qubo, state);
    let bestState = [...state];
    let bestEnergy = currentEnergy;

    let temp = 100.0;
    const coolingRate = 0.95;
    const maxIterations = 200;

    for (let step = 0; step < maxIterations; step++) {
      // Pick random bit to flip
      const flipIdx = Math.floor(Math.random() * N);
      const nextState = [...state];
      nextState[flipIdx] = 1 - nextState[flipIdx];

      const nextEnergy = QUBOModel.evaluateEnergy(qubo, nextState);
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

    return bestState;
  }
}
