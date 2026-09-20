import assert from 'node:assert/strict';
import fs from 'node:fs';
import { NextRequest } from 'next/server';
import { POST } from '../src/app/api/watchdog/broken-image/route';

async function main() {
  const originalSecret = process.env.CRON_SECRET;
  const anomalyPath = 'data/robopengu_anomalies.json';
  const originalAnomalies = fs.existsSync(anomalyPath) ? fs.readFileSync(anomalyPath) : null;
  const request = (authorization?: string, body: unknown = {}) => new NextRequest('http://localhost/api/watchdog/broken-image', {
    method: 'POST', headers: { 'content-type': 'application/json', ...(authorization ? { authorization } : {}) },
    body: JSON.stringify(body),
  });
  let passed = 0;
  const expectStatus = async (label: string, req: NextRequest, status: number) => {
    const response = await POST(req);
    assert.equal(response.status, status, label);
    passed++;
    console.log(`PASS: ${label}`);
  };
  try {
    delete process.env.CRON_SECRET;
    await expectStatus('Missing server secret fails closed', request('Bearer undefined'), 401);
    process.env.CRON_SECRET = 'test-only-watchdog-token';
    await expectStatus('Anonymous visitors cannot trigger maintenance', request(), 401);
    await expectStatus('Wrong length token rejected', request('Bearer wrong'), 401);
    await expectStatus('Same length wrong token rejected', request('Bearer test-only-watchdog-tokeX'), 401);
    await expectStatus('Valid authentication still requires a product', request('Bearer test-only-watchdog-token'), 400);
    await expectStatus('Unknown product cannot enter repair pipeline', request('Bearer test-only-watchdog-token', {
      productId: 'night-audit-nonexistent-product', failedSrc: '/images/test-only.png',
      productName: 'Untrusted caller text', category: '../../outside',
    }), 400);
    const after = fs.existsSync(anomalyPath) ? fs.readFileSync(anomalyPath) : null;
    assert.deepEqual(after, originalAnomalies, 'Rejected requests cannot change anomaly records');
    passed++;
    console.log(`Watchdog access: ${passed} PASS, 0 FAIL (no repair or notification sent)`);
  } finally {
    if (originalSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = originalSecret;
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
