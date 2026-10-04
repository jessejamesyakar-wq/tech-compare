const fs = require('fs');

function getEnvVar(key) {
  const sources = [process.env.TEMP + '/test_dev.env', '.env.local'];
  for (const s of sources) {
    if (fs.existsSync(s)) {
      const content = fs.readFileSync(s, 'utf8');
      const regex = new RegExp(`^${key}=(.*)$`, 'm');
      const match = content.match(regex);
      if (match) return match[1].trim().replace(/^["']|["']$/g, '');
    }
  }
  return process.env[key];
}

const cronSecret = getEnvVar('CRON_SECRET');
const adminToken = getEnvVar('ADMIN_ANALYTICS_TOKEN');

if (!cronSecret || !adminToken) {
  console.error('Missing secrets:', { cronSecret: !!cronSecret, adminToken: !!adminToken });
  process.exit(1);
}

const BASE_URL = 'https://www.aceleetme.tech';

async function testEndpoint(name, path, token, expectedStatus) {
  const headers = {};
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, { headers });
  const isMatch = res.status === expectedStatus;
  console.log(`[${isMatch ? 'PASS' : 'FAIL'}] ${name}: status=${res.status} (expected ${expectedStatus})`);
  let body = null;
  try {
    body = await res.json();
  } catch {
    // ignore
  }
  return { isMatch, status: res.status, body };
}

async function run() {
  console.log('=== Wave 2.4C.1 Live Production Auth Separation Verification ===');
  console.log('Target:', BASE_URL);

  const results = [];

  // Case 1: Unauthenticated request to /api/cron/analytics-maintenance -> 401
  results.push(await testEndpoint('Case 1: Cron endpoint without token', '/api/cron/analytics-maintenance', null, 401));

  // Case 2: Unauthenticated request to /api/admin/analytics -> 401
  results.push(await testEndpoint('Case 2: Admin endpoint without token', '/api/admin/analytics', null, 401));

  // Case 3: Cron endpoint with CRON_SECRET -> 200
  results.push(await testEndpoint('Case 3: Cron endpoint with CRON_SECRET', '/api/cron/analytics-maintenance', cronSecret, 200));

  // Case 4: Cron endpoint with ADMIN_ANALYTICS_TOKEN -> 401 (Rejection: scheduler-only scope)
  results.push(await testEndpoint('Case 4: Cron endpoint with ADMIN_ANALYTICS_TOKEN (Strict scheduler-only)', '/api/cron/analytics-maintenance', adminToken, 401));

  // Case 5: Admin endpoint with ADMIN_ANALYTICS_TOKEN -> 200
  const adminRes = await testEndpoint('Case 5: Admin endpoint with ADMIN_ANALYTICS_TOKEN', '/api/admin/analytics', adminToken, 200);
  results.push(adminRes);

  // Case 6: Admin endpoint with CRON_SECRET -> 401 (Rejection: separate from cron)
  results.push(await testEndpoint('Case 6: Admin endpoint with CRON_SECRET (Strict separate from cron)', '/api/admin/analytics', cronSecret, 401));

  const allPassed = results.every(r => r.isMatch);
  console.log('==================================================');
  if (allPassed) {
    console.log('ALL LIVE AUTH SEPARATION CHECKS PASSED!');
    if (adminRes.body) {
      console.log('Admin Analytics Payload Sample:');
      console.log(JSON.stringify(adminRes.body, null, 2));
    }
  } else {
    console.error('SOME AUTH SEPARATION CHECKS FAILED!');
    process.exit(1);
  }
}

run().catch(console.error);
