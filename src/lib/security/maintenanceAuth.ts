import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export type MaintenanceAccess = 'admin' | 'cron' | 'maintenance' | 'admin-analytics';

/**
 * Server-only bearer authorization with strict domain separation.
 *
 * - 'cron': Authorized ONLY by CRON_SECRET (scheduler-only scope).
 * - 'admin' | 'admin-analytics': Authorized ONLY by ADMIN_ANALYTICS_TOKEN or ADMIN_API_SECRET.
 *   CRON_SECRET is NEVER accepted for admin routes.
 * - 'maintenance': Accepts ADMIN_ANALYTICS_TOKEN, ADMIN_API_SECRET, or CRON_SECRET for general background routines.
 *
 * An unset secret never grants access.
 */
export function requireMaintenanceAccess(request: Request, access: MaintenanceAccess = 'admin') {
  let secrets: (string | undefined)[] = [];

  if (access === 'cron') {
    // CRON_SECRET scope: SCHEDULER_ONLY
    secrets = [process.env.CRON_SECRET];
  } else if (access === 'admin' || access === 'admin-analytics') {
    // Admin analytics auth: SEPARATE_FROM_CRON (Strictly rejects CRON_SECRET)
    secrets = [process.env.ADMIN_ANALYTICS_TOKEN, process.env.ADMIN_API_SECRET];
  } else if (access === 'maintenance') {
    secrets = [process.env.ADMIN_ANALYTICS_TOKEN, process.env.ADMIN_API_SECRET, process.env.CRON_SECRET];
  }

  const supplied = request.headers.get('authorization') || '';
  if (supplied.length > 4096) {
    return NextResponse.json({ ok: false, error: 'Yönetici erişimi gerekli.' }, { status: 401 });
  }
  const actual = Buffer.from(supplied);
  const authorized = secrets.some((secret) => {
    if (!secret?.trim()) return false;
    const expected = Buffer.from(`Bearer ${secret}`);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
  if (!authorized) {
    return NextResponse.json({ ok: false, error: 'Yönetici erişimi gerekli.' }, { status: 401 });
  }
  return null;
}
