const fs = require('fs');

const queueData = JSON.parse(fs.readFileSync('reports/MASTER_REPAIR_QUEUE_V2.json', 'utf8'));
const oppoItems = queueData.queue.filter(item => item.recommendedBatchGroup === 'BATCH-OPPO-P1-COMPLETION-CHUNK-3');

console.log('=== BATCH-OPPO-P1-COMPLETION-CHUNK-3 RESOLUTION ===');
console.log('Total Queued Items:', oppoItems.length);

const rootsMap = new Map();
for (const item of oppoItems) {
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
    priority: item.priority,
    issueType: item.issueType,
    fieldCategory: item.fieldCategory,
    status: item.status,
    reason: item.reason
  });
}

console.log('Total Distinct Roots in Batch:', rootsMap.size);

const rootsList = Array.from(rootsMap.values());
rootsList.forEach((r, idx) => {
  console.log(`\n[Root ${idx + 1}/${rootsList.length}]`);
  console.log(`  Root ID: ${r.rootId}`);
  console.log(`  Model:   ${r.model}`);
  console.log(`  Slug:    ${r.slug}`);
  console.log(`  Queued Fields (${r.fields.length}):`);
  r.fields.forEach(f => {
    console.log(`    - ${f.fieldPath} (current: ${JSON.stringify(f.currentValue)}, issue: ${f.issueType}, cat: ${f.fieldCategory})`);
  });
});

fs.writeFileSync('reports/oppo-chunk3-resolved.json', JSON.stringify({
  batchGroup: 'BATCH-OPPO-P1-COMPLETION-CHUNK-3',
  rootsCount: rootsMap.size,
  issuesCount: oppoItems.length,
  roots: rootsList
}, null, 2), 'utf8');
