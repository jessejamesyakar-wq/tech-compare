const { execSync } = require('child_process');

console.log('====================================================');
console.log('🚀 RUNNING WAVE 8 FULL TEST TOUR (ALL 5 CHECKS) 🚀');
console.log('====================================================\n');

const checks = [
  { name: '1. Trust & Governance Suites', cmd: 'npx tsx scripts/run_all_trust_suites_rc4.ts' },
  { name: '2. TypeScript Type Check', cmd: 'npx tsc --noEmit' },
  { name: '3. Pre-Deploy Gatekeeper', cmd: 'node scripts/preDeployCheck.js' },
  { name: '4. Next.js Production Build', cmd: 'npm run build' },
  { name: '5. 301 Canonical Redirects Verification', cmd: 'node scripts/testRedirects.js' },
];

let failed = 0;
for (const check of checks) {
  console.log(`\n>>> STARTING: ${check.name} [${check.cmd}]`);
  try {
    const out = execSync(check.cmd, { stdio: 'inherit', cwd: process.cwd() });
    console.log(`✅ PASS: ${check.name}`);
  } catch (err) {
    console.error(`❌ FAIL: ${check.name}`);
    failed++;
    process.exit(1);
  }
}

console.log('\n====================================================');
console.log('🎉 ALL 5 TEST TOUR CHECKS PASSED PERFECTLY (0 FAILURES)! 🎉');
console.log('====================================================');
