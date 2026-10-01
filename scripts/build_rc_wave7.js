const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const srcDir = path.resolve(__dirname, '..');
const targetDir = 'C:\\Projects\\aceleetme-agent-workspaces\\AceleEtme_ReleaseCandidates\\20261001_010700\\RC_WAVE7';

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

console.log('Copying files from workspace to RC_WAVE7...');
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
  .filter(f => f !== 'rc_wave7_manifest.json')
  .sort();

console.log(`Hashing ${allFiles.length} files...`);

const hasher = crypto.createHash('sha256');
for (const relPath of allFiles) {
  const fullPath = path.join(targetDir, relPath);
  const content = fs.readFileSync(fullPath);
  hasher.update(relPath);
  hasher.update(content);
}

const rcWave7Hash = hasher.digest('hex');
console.log('====================================================');
console.log('RC_WAVE7 DETERMINISTIC HASH:', rcWave7Hash);
console.log('====================================================');

// 3. Write manifest
const manifest = {
  releaseCandidate: 'RC_WAVE7',
  createdAt: new Date().toISOString(),
  rcWave7Hash,
  totalFiles: allFiles.length,
  invariants: {
    rootCount: 905,
    goldenHistoricalMutations: 0,
    priceUnexpectedMutations: 0,
    processP2Baseline: 110,
    processPatchesApplied: 8,
    goldenOverlayCorrectionsRegistered: 8,
    totalProcessClosedInWave7: 16,
    processP2Remaining: 94,
    cameraP2Baseline: 409,
    cameraVerifiedClosed: 95,
    cameraP2Remaining: 314,
    brightnessP2Baseline: 422,
    brightnessSchemaV2Implemented: true,
    brightnessP2Remaining: 422,
    ramP2Baseline: 423,
    ramPatchesApplied: 5,
    ramVerifiedExisting: 1,
    ramP2Remaining: 417,
    temporalBenchmarkDebt: 417,
    totalP2Baseline: 1364,
    totalP2ClosedInWave7: 117,
    totalP2Remaining: 1247,
    goldenCorrectionRegistryTotal: 30,
    cameraV2MigrationCount: 7,
    brightnessSchemaV2Fields: ['brightnessTypicalNits', 'brightnessHBMNits', 'brightnessPeakNits', 'brightnessOutdoorNits'],
    deploymentConstraint: 'COMMIT_PUSH_DEPLOY_WAVE7 = NOT_ATTEMPTED'
  }
};

const manifestPath = path.join(targetDir, 'rc_wave7_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('rc_wave7_manifest.json written successfully to:', manifestPath);
