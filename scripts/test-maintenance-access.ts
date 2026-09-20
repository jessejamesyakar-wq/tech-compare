import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NextRequest } from 'next/server';
import { requireMaintenanceAccess } from '../src/lib/security/maintenanceAuth';

async function main() {
  const saved = { CRON_SECRET: process.env.CRON_SECRET, ADMIN_API_SECRET: process.env.ADMIN_API_SECRET };
  const files = ['data/robopengu_anomalies.json', 'data/robopengu_learning_patterns.json'];
  const snapshot = files.map((path) => fs.existsSync(path) ? fs.readFileSync(path) : null);
  const originalFetch = globalThis.fetch;
  const targets = [
    ['admin/learning', 'GET'], ['admin/learning', 'POST'],
    ['admin/price-anomalies', 'GET'], ['admin/price-anomalies', 'POST'],
    ['admin/auto-image', 'POST'], ['admin/price-updates', 'GET'], ['admin/auth', 'GET'],
    ['admin/stores/[id]/test', 'POST'], ['products/[id]/update-prices', 'POST'],
    ['cron/daily-tech-news', 'GET'], ['cron/daily-tech-news', 'POST'],
    ['cron/scrape-prices', 'GET'], ['cron/scrape-2026-prices', 'GET'],
    ['cron/update-prices', 'GET'], ['watchdog/broken-image', 'POST'],
  ];
  let passed = 0;
  const request = (method: string, token?: string) => new NextRequest('http://localhost/api/test-only', {
    method, headers: token ? { Authorization: token } : {},
    ...(method === 'POST' ? { body: '{malformed JSON' } : {}),
  });
  try {
    globalThis.fetch = async () => { throw new Error('Network calls are forbidden in access tests'); };
    for (const [route, method] of targets) {
      const module = await import(`../src/app/api/${route}/route`);
      const handler = module[method];
      assert.equal(typeof handler, 'function');
      for (const secretConfigured of [false, true]) {
        if (secretConfigured) {
          process.env.CRON_SECRET = 'test-cron-secret';
          process.env.ADMIN_API_SECRET = 'test-admin-secret';
        } else {
          delete process.env.CRON_SECRET;
          delete process.env.ADMIN_API_SECRET;
        }
        for (const token of [undefined, 'Bearer undefined', 'Bearer invalid-token']) {
          // Reaching params would prove the gate did not run first.
          const params = { params: { then(): never { throw new Error('Unauthorized handler awaited params'); } } };
          const response = await handler(request(method, token), params);
          assert.equal(response.status, 401, `${method} ${route} must reject before side effects`);
          passed++;
        }
      }
      console.log(`PASS: ${method} ${route} (6 denied-request cases)`);
    }
    process.env.CRON_SECRET = 'test-cron-secret';
    process.env.ADMIN_API_SECRET = 'test-admin-secret';
    assert.equal(requireMaintenanceAccess(request('GET', 'Bearer test-admin-secret'), 'admin'), null); passed++;
    assert.equal(requireMaintenanceAccess(request('GET', 'Bearer test-cron-secret'), 'cron'), null); passed++;
    assert.equal(requireMaintenanceAccess(request('GET', 'Bearer test-cron-secret'), 'admin')?.status, 401); passed++;
    assert.equal(requireMaintenanceAccess(request('GET', 'Bearer test-admin-secret'), 'maintenance'), null); passed++;
    assert.equal(requireMaintenanceAccess(request('GET', 'Bearer test-cron-secret'), 'maintenance'), null); passed++;
    for (let i = 0; i < files.length; i++) {
      assert.deepEqual(fs.existsSync(files[i]) ? fs.readFileSync(files[i]) : null, snapshot[i]);
      passed++;
    }
    console.log(`Maintenance authorization: ${passed} PASS, 0 FAIL; no network calls or data writes`);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
