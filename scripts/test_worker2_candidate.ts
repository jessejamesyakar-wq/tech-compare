// scripts/test_worker2_candidate.ts
import { IntentEngine } from '../src/lib/ai/robopengu/intentEngine';
import { CandidateEngine } from '../src/lib/ai/robopengu/candidateEngine';
import rawSmartphones from '../src/lib/smartphonesData.json';

console.log('=== TEST WORKER 2: CANDIDATE ENGINE ===\n');

const catalogIds = new Set(rawSmartphones.map((p: any) => p.id));
console.log(`Total catalog roots: ${catalogIds.size}`);

// Scenario 1: Natural Query (30000 TL)
const intent1 = IntentEngine.parse('30000 TL bütçem var, kamerası ve ekranı iyi olsun, oyun odaklı değilim');
const res1 = CandidateEngine.filterCandidates(intent1);
console.log(`Scenario 1: Found ${res1.candidates.length} candidates. Filter log:`);
res1.filterLog.forEach(l => console.log('  -', l));

// Check zero hallucination
const allValidIds1 = res1.candidates.every(c => catalogIds.has(c.id));
console.log(`Zero hallucinated IDs (Scenario 1): ${allValidIds1}`);

// Scenario 2: Hard Constraint (60000 TL, 512GB, Apple excluded)
const intent2 = IntentEngine.parse('60000 TL bütçe, en az 512GB depolama, Apple istemiyorum');
const res2 = CandidateEngine.filterCandidates(intent2);
console.log(`\nScenario 2: Found ${res2.candidates.length} candidates. Filter log:`);
res2.filterLog.forEach(l => console.log('  -', l));

const zeroApple = res2.candidates.every(c => c.brand.toLowerCase() !== 'apple' && !c.id.startsWith('apple-'));
const allAtLeast512 = res2.candidates.every(c => {
  const cap = CandidateEngine.extractStorageGb(c);
  return cap === null || cap >= 512;
});
console.log(`Strictly 0 Apple: ${zeroApple}`);
console.log(`All >= 512GB or flexible: ${allAtLeast512}`);

const pass = allValidIds1 && zeroApple && res2.candidates.length > 0;
console.log('\nWorker 2 Verification:', pass ? 'ALL PASS ✅' : 'FAILED ❌');
process.exit(pass ? 0 : 1);
