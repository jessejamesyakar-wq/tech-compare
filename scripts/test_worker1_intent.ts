// scripts/test_worker1_intent.ts
import { IntentEngine } from '../src/lib/ai/robopengu/intentEngine';

console.log('=== TEST WORKER 1: INTENT ENGINE ===\n');

// Scenario 1: Natural query
const q1 = IntentEngine.parse('30000 TL bütçem var, kamerası ve ekranı iyi olsun, oyun odaklı değilim');
console.log('Scenario 1:');
console.log('  Budget:', q1.budget);
console.log('  Camera:', q1.cameraPriority);
console.log('  Display:', q1.displayPriority);
console.log('  Gaming:', q1.gamingPriority);
console.log('  Pass 1:', q1.budget?.max === 30000 && q1.cameraPriority !== 'none' && q1.gamingPriority === 'none');

// Scenario 2: Hard constraint
const q2 = IntentEngine.parse('60000 TL bütçe, en az 512GB depolama, Apple istemiyorum');
console.log('\nScenario 2:');
console.log('  Budget:', q2.budget);
console.log('  Storage Min:', q2.storageMinimumGb);
console.log('  Excluded Brands:', q2.excludedBrands);
console.log('  Pass 2:', q2.budget?.max === 60000 && q2.storageMinimumGb === 512 && q2.excludedBrands.includes('apple'));

// Scenario 3: Conflict query
const q3 = IntentEngine.parse('10000 TL bütçeye en iyi amiral gemisi işlemci ve 200MP kamera');
console.log('\nScenario 3:');
console.log('  Has Conflict:', q3.hasConflictingConstraints);
console.log('  Conflict Explanation:', q3.conflictExplanation);
console.log('  Pass 3:', q3.hasConflictingConstraints && typeof q3.conflictExplanation === 'string');

// Scenario 4: Underspecified follow-up
const q4 = IntentEngine.parse('telefon öner');
console.log('\nScenario 4:');
console.log('  Requires FollowUp:', q4.requiresFollowUp);
console.log('  Questions:', q4.followUpQuestions);
console.log('  Pass 4:', q4.requiresFollowUp && q4.followUpQuestions.length > 0);

const allOk = (q1.budget?.max === 30000 && q1.cameraPriority !== 'none' && q1.gamingPriority === 'none') &&
  (q2.budget?.max === 60000 && q2.storageMinimumGb === 512 && q2.excludedBrands.includes('apple')) &&
  (q3.hasConflictingConstraints) &&
  (q4.requiresFollowUp);

console.log('\nWorker 1 Verification:', allOk ? 'ALL PASS ✅' : 'FAILED ❌');
process.exit(allOk ? 0 : 1);
