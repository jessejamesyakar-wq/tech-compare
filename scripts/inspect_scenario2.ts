import { RoboPenguPipeline } from '../src/lib/ai/robopengu/pipeline';

const res = RoboPenguPipeline.execute('60000 TL bütçe, en az 512GB depolama, Apple istemiyorum');
console.log('Candidates count:', res.recommendation.rankedCandidates.length);
res.recommendation.rankedCandidates.forEach(c => {
  console.log(`- ${c.name} (${c.brand}) [ID: ${c.rootId}]`);
});
console.log('\nComposed text:\n', res.composedResponseText);
