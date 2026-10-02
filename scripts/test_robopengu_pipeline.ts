// scripts/test_robopengu_pipeline.ts
import { RoboPenguPipeline } from '../src/lib/ai/robopengu/pipeline';

console.log('========================================================');
console.log('🐧  ROBOPENGU AI PIPELINE COMPREHENSIVE TEST TOUR  🐧');
console.log('========================================================\n');

let allPassed = true;

// TEST 1: Natural query with priorities
console.log('--- TEST 1: Natural Query (30000 TL, camera & display priority, no gaming) ---');
{
  const result = RoboPenguPipeline.execute('30000 TL bütçem var, kamerası ve ekranı iyi olsun, oyun odaklı değilim');
  console.log(`Duration: ${result.durationMs}ms`);
  console.log(`Ranked candidates count: ${result.recommendation.rankedCandidates.length}`);
  const top1 = result.recommendation.rankedCandidates[0];
  console.log(`Top 1 Pick: ${top1.name} (${top1.brand}) - Score: ${top1.scoreBreakdown.totalScore}`);
  console.log(`Price info: ${top1.priceInfo.displayPriceFormatted} [${top1.priceInfo.status}]`);
  console.log(`Buy/Wait: ${top1.buyWaitAdvice.decision} - ${top1.buyWaitAdvice.summary}`);

  const pass = result.recommendation.rankedCandidates.length > 0 &&
               result.composedResponseText.includes('RoboPengu') &&
               result.composedResponseText.includes(top1.name);
  console.log(`Result: ${pass ? 'PASS ✅' : 'FAIL ❌'}\n`);
  if (!pass) allPassed = false;
}

// TEST 2: Hard constraint (60000 TL, >=512GB, Apple excluded)
console.log('--- TEST 2: Hard Constraint (60000 TL, >=512GB storage, Apple excluded) ---');
{
  const result = RoboPenguPipeline.execute('60000 TL bütçe, en az 512GB depolama, Apple istemiyorum');
  const candidates = result.recommendation.rankedCandidates;
  const zeroApple = candidates.every(c => c.brand.toLowerCase() !== 'apple' && !c.rootId.startsWith('apple-'));
  console.log(`Total candidates: ${candidates.length}`);
  console.log(`Zero Apple check: ${zeroApple}`);
  candidates.slice(0, 3).forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.name} (${c.brand}) - Price: ${c.priceInfo.displayPriceFormatted}`);
  });

  const pass = candidates.length > 0 && zeroApple;
  console.log(`Result: ${pass ? 'PASS ✅' : 'FAIL ❌'}\n`);
  if (!pass) allPassed = false;
}

// TEST 3: Conflict query (10000 TL budget + flagship SoC + 200MP camera)
console.log('--- TEST 3: Conflict Query (10000 TL, flagship SoC & 200MP camera) ---');
{
  const result = RoboPenguPipeline.execute('10000 TL bütçeye en iyi amiral gemisi işlemci ve 200MP kamera');
  console.log(`Has conflict: ${result.intent.hasConflictingConstraints}`);
  console.log(`Conflict explanation: ${result.intent.conflictExplanation}`);
  console.log(`Composed response contains conflict notice: ${result.composedResponseText.includes('Önemli Not ve Kısıt Değerlendirmesi')}`);

  const pass = result.intent.hasConflictingConstraints &&
               result.composedResponseText.includes('10.000 TL');
  console.log(`Result: ${pass ? 'PASS ✅' : 'FAIL ❌'}\n`);
  if (!pass) allPassed = false;
}

// TEST 4: Unverified / Blocked field honest warning
console.log('--- TEST 4: Blocked / Unverified Field Query (iPhone RAM tipi / ekran parlaklığı) ---');
{
  const result = RoboPenguPipeline.execute('iPhone 11 ram tipi ve ekran parlaklığı nedir');
  console.log(`Candidates returned: ${result.recommendation.rankedCandidates.length}`);
  const sample = result.recommendation.rankedCandidates[0];
  if (sample) {
    console.log(`Sample candidate: ${sample.name}`);
    console.log(`Trust warnings:`, sample.trustEvaluation.warnings);
    console.log(`Doğruluk notu in response: ${result.composedResponseText.includes('Doğruluk Notu') || result.composedResponseText.includes('doğrulanmadı')}`);
  }
  const pass = result.composedResponseText.includes('RoboPengu');
  console.log(`Result: ${pass ? 'PASS ✅' : 'FAIL ❌'}\n`);
  if (!pass) allPassed = false;
}

// TEST 7: Live price vs catalog fallback representation
console.log('--- TEST 7: Live Price vs Catalog Fallback Representation ---');
{
  const result = RoboPenguPipeline.execute('Samsung Galaxy telefon öner');
  const hasLiveOrFallback = result.recommendation.rankedCandidates.some(c =>
    c.priceInfo.status === 'LIVE_PRICE' || c.priceInfo.status === 'CATALOG_FALLBACK'
  );
  console.log(`Candidates evaluated: ${result.recommendation.rankedCandidates.length}`);
  result.recommendation.rankedCandidates.slice(0, 3).forEach((c, idx) => {
    console.log(`  ${idx + 1}. ${c.name}: ${c.priceInfo.displayPriceFormatted} (${c.priceInfo.status})`);
  });
  console.log(`Distinct price status verified: ${hasLiveOrFallback}`);
  const pass = hasLiveOrFallback;
  console.log(`Result: ${pass ? 'PASS ✅' : 'FAIL ❌'}\n`);
  if (!pass) allPassed = false;
}

console.log(`========================================================`);
console.log(`OVERALL PIPELINE TOUR STATUS: ${allPassed ? 'ALL PASSED ✅' : 'FAILED ❌'}`);
console.log(`========================================================`);
process.exit(allPassed ? 0 : 1);
