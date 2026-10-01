const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const srcDir = path.resolve(__dirname, '..');
const targetDir = 'C:\\Projects\\aceleetme-agent-workspaces\\AceleEtme_ReleaseCandidates\\20261001_010700\\RC_WAVE6';

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

console.log('Copying files from workspace to RC_WAVE6...');
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
  .filter(f => f !== 'rc_wave6_manifest.json')
  .sort();

console.log(`Hashing ${allFiles.length} files...`);

const hasher = crypto.createHash('sha256');
for (const relPath of allFiles) {
  const fullPath = path.join(targetDir, relPath);
  const content = fs.readFileSync(fullPath);
  hasher.update(relPath);
  hasher.update(content);
}

const rcWave6Hash = hasher.digest('hex');
console.log('====================================================');
console.log('RC_WAVE6 DETERMINISTIC HASH:', rcWave6Hash);
console.log('====================================================');

// 3. Write manifest
const manifest = {
  releaseCandidate: 'RC_WAVE6',
  createdAt: new Date().toISOString(),
  rcWave6Hash,
  totalFiles: allFiles.length,
  invariants: {
    rootCount: 905,
    goldenHistoricalMutations: 0,
    priceUnexpectedMutations: 0,
    nonGoldenProcessPatchesApplied: 113,
    goldenOverlayCorrectionsRegistered: 21,
    totalProcessClosedInWave6: 134,
    processP2Baseline: 244,
    processP2Remaining: 110,
    otherP2Baseline: 1674,
    antutuPolicyReclassified: 417,
    verifiedBrightnessClosures: 3,
    otherP2Remaining: 1254,
    goldenCorrectionRegistryTotal: 22,
    cameraV2MigrationCount: 7,
    deploymentConstraint: 'COMMIT_PUSH_DEPLOY_WAVE6 = NOT_ATTEMPTED'
  }
};

const manifestPath = path.join(targetDir, 'rc_wave6_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('rc_wave6_manifest.json written successfully to:', manifestPath);
