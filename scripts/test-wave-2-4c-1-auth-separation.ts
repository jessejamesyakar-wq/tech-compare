/**
 * scripts/test-wave-2-4c-1-auth-separation.ts
 *
 * Unit & Integration Test for Wave 2.4C.1 Auth Separation:
 * 1. Verifies CRON_SECRET is strictly restricted to scheduler/cron scope.
 * 2. Verifies ADMIN_ANALYTICS_TOKEN is strictly required for admin analytics scope.
 * 3. Verifies cross-domain token rejection (CRON_SECRET cannot access admin, ADMIN_ANALYTICS_TOKEN cannot trigger cron).
 * 4. Verifies operational monitoring counters and error logging.
 */

import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { requireMaintenanceAccess } from '../src/lib/security/maintenanceAuth';
import {
  recordIngestionEvent,
  recordRollupExecution,
  recordPurgeExecution,
  getOperationalHealthSummary,
} from '../src/lib/analytics/operationalMonitoring';

function createRequest(token?: string, headerSize?: number): Request {
  const headers = new Headers();
  if (token) {
    headers.set('authorization', token);
  }
  if (headerSize) {
    headers.set('authorization', 'Bearer ' + 'x'.repeat(headerSize));
  }
  return new NextRequest('http://localhost/api/test', {
    method: 'GET',
    headers,
  });
}

async function run() {
  console.log('--- Testing Wave 2.4C.1 Auth Separation & Operational Monitoring ---');

  const savedCron = process.env.CRON_SECRET;
  const savedAdmin = process.env.ADMIN_ANALYTICS_TOKEN;
  const savedAdminApi = process.env.ADMIN_API_SECRET;

  try {
    const CRON_VAL = 'test-cron-secret-12345';
    const ADMIN_VAL = 'test-admin-token-67890';

    process.env.CRON_SECRET = CRON_VAL;
    process.env.ADMIN_ANALYTICS_TOKEN = ADMIN_VAL;
    delete process.env.ADMIN_API_SECRET;

    // 1. Cron scope tests
    console.log('1. Testing cron scope...');
    // CRON_SECRET granted
    assert.equal(requireMaintenanceAccess(createRequest(`Bearer ${CRON_VAL}`), 'cron'), null);
    // ADMIN_ANALYTICS_TOKEN rejected
    const cronWithAdminToken = requireMaintenanceAccess(createRequest(`Bearer ${ADMIN_VAL}`), 'cron');
    assert.ok(cronWithAdminToken, 'Cron scope must reject ADMIN_ANALYTICS_TOKEN');
    assert.equal(cronWithAdminToken.status, 401);
    // Missing token rejected
    assert.equal(requireMaintenanceAccess(createRequest(), 'cron')?.status, 401);
    // Tampered token rejected
    assert.equal(requireMaintenanceAccess(createRequest(`Bearer ${CRON_VAL}_wrong`), 'cron')?.status, 401);

    // 2. Admin scope tests
    console.log('2. Testing admin scope...');
    // ADMIN_ANALYTICS_TOKEN granted
    assert.equal(requireMaintenanceAccess(createRequest(`Bearer ${ADMIN_VAL}`), 'admin'), null);
    assert.equal(requireMaintenanceAccess(createRequest(`Bearer ${ADMIN_VAL}`), 'admin-analytics'), null);
    // CRON_SECRET rejected
    const adminWithCronSecret = requireMaintenanceAccess(createRequest(`Bearer ${CRON_VAL}`), 'admin');
    assert.ok(adminWithCronSecret, 'Admin scope must reject CRON_SECRET');
    assert.equal(adminWithCronSecret.status, 401);
    const adminAnalyticsWithCronSecret = requireMaintenanceAccess(createRequest(`Bearer ${CRON_VAL}`), 'admin-analytics');
    assert.ok(adminAnalyticsWithCronSecret, 'admin-analytics scope must reject CRON_SECRET');
    assert.equal(adminAnalyticsWithCronSecret.status, 401);
    // Missing token rejected
    assert.equal(requireMaintenanceAccess(createRequest(), 'admin')?.status, 401);
    // Tampered token rejected
    assert.equal(requireMaintenanceAccess(createRequest(`Bearer ${ADMIN_VAL}_wrong`), 'admin')?.status, 401);

    // 3. Header size limit test
    console.log('3. Testing header size security boundary...');
    assert.equal(requireMaintenanceAccess(createRequest(undefined, 5000), 'admin')?.status, 401);
    assert.equal(requireMaintenanceAccess(createRequest(undefined, 5000), 'cron')?.status, 401);

    // 4. Fallback behavior when secrets unset
    console.log('4. Testing fail-closed behavior when secrets unset...');
    delete process.env.CRON_SECRET;
    delete process.env.ADMIN_ANALYTICS_TOKEN;
    assert.equal(requireMaintenanceAccess(createRequest(`Bearer ${CRON_VAL}`), 'cron')?.status, 401);
    assert.equal(requireMaintenanceAccess(createRequest(`Bearer ${ADMIN_VAL}`), 'admin')?.status, 401);

    // 5. Operational monitoring test
    console.log('5. Testing operational failure monitoring counters...');
    const initialSummary = getOperationalHealthSummary();
    assert.equal(initialSummary.telemetryFailuresNonBlocking, true);

    recordIngestionEvent({ receivedCount: 5, persistedCount: 5, success: true });
    recordIngestionEvent({ receivedCount: 2, persistedCount: 0, success: false, error: 'Database timeout mock' });
    recordRollupExecution({ success: true, rowsAffected: 10, mechanism: 'rpc' });
    recordRollupExecution({ success: false, error: 'RPC execution failed mock' });
    recordPurgeExecution({ success: true, purgedRows: 0, mechanism: 'rpc' });
    recordPurgeExecution({ success: false, error: 'Purge safety floor violated mock' });

    const summaryAfter = getOperationalHealthSummary();
    assert.equal(summaryAfter.counters.ingestion.totalReceived, 7);
    assert.equal(summaryAfter.counters.ingestion.failures, 1);
    assert.equal(summaryAfter.counters.rollup.failures, 1);
    assert.equal(summaryAfter.counters.purge.failures, 1);
    assert.equal(summaryAfter.counters.ingestion.lastFailureReason, 'Database timeout mock');
    assert.equal(summaryAfter.telemetryFailuresNonBlocking, true);

    console.log('ALL AUTH SEPARATION & OPERATIONAL MONITORING UNIT TESTS PASSED!');
  } finally {
    if (savedCron !== undefined) process.env.CRON_SECRET = savedCron; else delete process.env.CRON_SECRET;
    if (savedAdmin !== undefined) process.env.ADMIN_ANALYTICS_TOKEN = savedAdmin; else delete process.env.ADMIN_ANALYTICS_TOKEN;
    if (savedAdminApi !== undefined) process.env.ADMIN_API_SECRET = savedAdminApi; else delete process.env.ADMIN_API_SECRET;
  }
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
