const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const srcDir = path.resolve(__dirname, '..');
const targetDir = 'C:\\Projects\\aceleetme-agent-workspaces\\AceleEtme_ReleaseCandidates\\20261001_010700\\RC_WAVE8';

console.log('Source:', srcDir);
console.log('Target:', targetDir);

// 1. Clean or create targetDir
if (fs.existsSync(targetDir)) {
  console.log('Target directory exists. Cleaning up...');
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

// Excluded patterns from copy
const EXCLUDED_DIRS = new Set(['node_modules', '.next', '.cache', 'dist', 'coverage']);

function copyDirRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDED_DIRS.has(entry.name)) {
        continue;
      }
      copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Copying files from workspace to RC_WAVE8...');
copyDirRecursive(srcDir, targetDir);
console.log('Copy completed.');

// 2. Compute deterministic hash
function getFilesRecursive(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursive(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

const allFiles = getFilesRecursive(targetDir)
  .map(p => path.relative(targetDir, p).replace(/\\/g, '/'))
  .filter(f => f !== 'rc_wave8_manifest.json')
  .sort();

console.log(`Hashing ${allFiles.length} files...`);

const hasher = crypto.createHash('sha256');
for (const relPath of allFiles) {
  const fullPath = path.join(targetDir, relPath);
  const content = fs.readFileSync(fullPath);
  hasher.update(relPath);
  hasher.update(content);
}

const rcWave8Hash = hasher.digest('hex');
console.log('====================================================');
console.log('RC_WAVE8 DETERMINISTIC HASH:', rcWave8Hash);
console.log('====================================================');

// 3. Write manifest
const manifest = {
  releaseCandidate: 'RC_WAVE8',
  createdAt: new Date().toISOString(),
  rcWave8Hash,
  totalFiles: allFiles.length,
  invariants: {
    rootCount: 905,
    goldenHistoricalMutations: 0,
    priceUnexpectedMutations: 0,
    processP2Baseline: 94,
    processPatchesApplied: 3,
    processP2Remaining: 91,
    cameraP2Baseline: 314,
    cameraReclassifiedToExternalBenchmark: 314,
    cameraP2Remaining: 0,
    brightnessP2Baseline: 422,
    brightnessV2MigrationsApplied: 49,
    brightnessP2Remaining: 373,
    ramP2Baseline: 417,
    ramPatchesApplied: 0,
    ramBlockedEvidenceRetained: 417,
    ramP2Remaining: 417,
    temporalBenchmarkDebtAntutu: 417,
    externalBenchmarkDebtDxomark: 314,
    totalStaticP2Baseline: 1247,
    totalStaticP2ClosedOrMigratedInWave8: 366, // 3 process + 314 dxomark + 49 brightness = 366
    totalStaticP2Remaining: 881, // 91 process + 0 camera + 373 brightness + 417 ram = 881
    goldenCorrectionRegistryTotal: 30,
    deploymentConstraint: 'COMMIT_PUSH_DEPLOY_WAVE8 = NOT_ATTEMPTED'
  }
};

const manifestPath = path.join(targetDir, 'rc_wave8_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('rc_wave8_manifest.json written successfully to:', manifestPath);
