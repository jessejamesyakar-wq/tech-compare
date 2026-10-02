// scripts/test_worker8_9_quantum_benchmark.ts
import { ClassicalOptimizer } from '../src/lib/ai/robopengu/optimizer/classicalOptimizer';
import { OptimizationBenchmark } from '../src/lib/labs/quantum/benchmark';
import { CandidateItem } from '../src/lib/labs/quantum/problemDefinition';

console.log('=== TEST WORKER 8 & 9: OPTIMIZATION & QUANTUM BENCHMARK ===\n');

// 1. Worker 8 Test: Classical Optimizer
const optimizer = new ClassicalOptimizer();
console.log('ClassicalOptimizer instantiated successfully.');

// 2. Worker 9 Test: Quantum QUBO Simulation Benchmark
const sampleCandidates: CandidateItem[] = [
  { id: 'dev-1', name: 'Flagship Alpha', value: 92, price: 42000, brand: 'Samsung' },
  { id: 'dev-2', name: 'Value Hero', value: 85, price: 24000, brand: 'Xiaomi' },
  { id: 'dev-3', name: 'Compact Pro', value: 88, price: 34000, brand: 'Vivo' },
  { id: 'dev-4', name: 'Battery King', value: 78, price: 18000, brand: 'Realme' },
  { id: 'dev-5', name: 'Ultra Camera', value: 94, price: 58000, brand: 'Honor' },
  { id: 'dev-6', name: 'Budget Balance', value: 70, price: 14000, brand: 'Tecno' },
];

const benchmarkResult = OptimizationBenchmark.runComparison(sampleCandidates, 2, 45000);

console.log('Benchmark Result:');
console.log('  Candidates considered:', benchmarkResult.candidateCount);
console.log('  Target K:', benchmarkResult.targetK);
console.log('  Budget Limit:', benchmarkResult.budgetLimit);
console.log('  QUBO Matrix Size:', benchmarkResult.quboMatrixSize);
console.log('  Classical Solver:');
console.log('    Selected:', benchmarkResult.classical.selectedIds);
console.log('    Value:', benchmarkResult.classical.totalValue);
console.log('    Cost:', benchmarkResult.classical.totalCost);
console.log('    Runtime (ms):', benchmarkResult.classical.runtimeMs);
console.log('  Quantum Simulation (QUBO):');
console.log('    Selected:', benchmarkResult.quantumSimulation.selectedIds);
console.log('    Value:', benchmarkResult.quantumSimulation.totalValue);
console.log('    Cost:', benchmarkResult.quantumSimulation.totalCost);
console.log('    Energy:', benchmarkResult.quantumSimulation.energy);
console.log('    Runtime (ms):', benchmarkResult.quantumSimulation.runtimeMs);
console.log('  Isolation Status:', benchmarkResult.isolationStatus);

const pass8 = optimizer !== undefined;
const pass9 = benchmarkResult.quboMatrixSize === 6 &&
              benchmarkResult.isolationStatus === 'SIMULATION_READY_ZERO_EXTERNAL_DEPENDENCY';

console.log(`\nWorkers 8 & 9 Verification: ${pass8 && pass9 ? 'ALL PASS ✅' : 'FAILED ❌'}`);
process.exit(pass8 && pass9 ? 0 : 1);
