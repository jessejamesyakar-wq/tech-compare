import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export type MaintenanceAccess = 'admin' | 'cron' | 'maintenance';

/** Server-only bearer authorization. An unset secret never grants access. */
export function requireMaintenanceAccess(request: Request, access: MaintenanceAccess = 'admin') {
  const secrets = access === 'maintenance'
    ? [process.env.ADMIN_API_SECRET, process.env.CRON_SECRET]
    : [access === 'cron' ? process.env.CRON_SECRET : process.env.ADMIN_API_SECRET || process.env.CRON_SECRET];
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
