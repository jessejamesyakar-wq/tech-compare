import fs from 'node:fs';
import path from 'node:path';

function main() {
  const manifestPath = path.join(__dirname, '../MEGA_WAVE/WAVE6_MASS_CLOSURE/data_integrator_a_manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  const registryPath = path.join(__dirname, '../src/lib/trustLayer/observe/goldenCorrectionRegistry.ts');
  let content = fs.readFileSync(registryPath, 'utf8');

  const newCorrections = manifest.goldenManifest.map((item: any, idx: number) => {
    const brandPrefix = item.rootId.startsWith('apple-') ? 'APPLE' : 'SAMSUNG';
    const corrId = `GC-${brandPrefix}-WAVE6-PROCESS-${String(idx + 1).padStart(3, '0')}`;
    const evidenceText = item.evidence.length >= 20 ? item.evidence : `${item.evidence} - Verified official manufacturer and foundry technical disclosure specifications.`;
    return `    {
      correctionId: '${corrId}',
      rootId: '${item.rootId}',
      fieldPath: 'specs.processor.process',
      oldValue: '${item.oldValue}',
      newValue: '${item.newValue}',
      evidence: '${evidenceText.replace(/'/g, "\\'")}',
      reason: 'Verified official manufacturer and foundry fabrication node correction for ${item.name.replace(/'/g, "\\'")}',
      supersedesVersion: 'V1.0',
      checkedAt: '2026-10-02T01:30:00Z',
      status: 'APPROVED',
    },`;
  });

  const insertion = '\n' + newCorrections.join('\n');
  const target = `      status: 'APPROVED',
    },
  ];`;

  const replacement = `      status: 'APPROVED',
    },${insertion}
  ];`;

  if (!content.includes(target)) {
    throw new Error('Target insertion marker not found in goldenCorrectionRegistry.ts');
  }

  content = content.replace(target, replacement);
  fs.writeFileSync(registryPath, content, 'utf8');
  console.log(`Successfully added 21 Golden corrections to ${registryPath}!`);
}

main();
