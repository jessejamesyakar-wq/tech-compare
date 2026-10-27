const fs = require('fs');

const queueData = JSON.parse(fs.readFileSync('reports/MASTER_REPAIR_QUEUE_V2.json', 'utf8'));
const vivoItems = queueData.queue.filter(item => item.recommendedBatchGroup === 'BATCH-VIVO-P1-COMPLETION-CHUNK-1');

console.log('=== BATCH-VIVO-P1-COMPLETION-CHUNK-1 RESOLUTION ===');
console.log('Total Queued Items:', vivoItems.length);

const rootsMap = new Map();
for (const item of vivoItems) {
  if (!rootsMap.has(item.rootId)) {
    rootsMap.set(item.rootId, {
      rootId: item.rootId,
      model: item.model,
      slug: item.slug,
      brand: item.brand,
      fields: []
    });
  }
  rootsMap.get(item.rootId).fields.push({
    fieldPath: item.fieldPath,
    currentValue: item.currentValue,
    issueType: item.issueType,
    fieldCategory: item.fieldCategory
  });
}

console.log('Distinct Roots:', rootsMap.size);

const catalog = JSON.parse(fs.readFileSync('src/lib/smartphonesData.json', 'utf8'));

const rootsList = Array.from(rootsMap.values());
rootsList.forEach((r, idx) => {
  const p = catalog.find(x => x.id === r.rootId);
  console.log(`\n------------------------------------------------------------`);
  console.log(`[Root ${idx + 1}/${rootsList.length}]`);
  console.log(`  Root ID:     ${r.rootId}`);
  console.log(`  Model:       ${r.model}`);
  console.log(`  Slug:        ${r.slug}`);
  console.log(`  Found in DB: ${!!p}`);
  if (p) {
    console.log(`  DB Name:     ${p.name}`);
    console.log(`  Year:        ${p.releaseYear}`);
    console.log(`  Price:       ${p.basePrice} TRY`);
    console.log(`  Schema Type: ${p.specs && p.specs.screen ? 'NESTED' : 'FLAT'}`);
    console.log(`  Specs Keys:  ${Object.keys(p.specs || {}).join(', ')}`);
  }
  console.log(`  Queued Fields (${r.fields.length}):`);
  r.fields.forEach(f => {
    console.log(`    - ${f.fieldPath} (current: ${JSON.stringify(f.currentValue)}, issue: ${f.issueType})`);
  });
});
