import { NextResponse } from 'next/server';
import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getYesterdayUTCDate(): string {
  const d = new Date(Date.now() - 86400000);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: Request) {
  // 1. Authenticate scheduler request using timing-safe CRON_SECRET check
  const denied = requireMaintenanceAccess(request, 'cron');
  if (denied) return denied;

  const url = new URL(request.url);
  const requestedDate = url.searchParams.get('date');
  const targetDate = requestedDate && DATE_REGEX.test(requestedDate)
    ? requestedDate
    : getYesterdayUTCDate();

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Database client unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 2. Step 1: Rollup completed historical day
  const { data: rollupResult, error: rollupError } = await supabase.rpc(
    'rollup_funnel_daily',
    { p_target_date: targetDate }
  );

  if (rollupError) {
    console.error('[Analytics:Maintenance] Rollup failed for date', targetDate, rollupError.message);
    return NextResponse.json(
      {
        ok: false,
        step: 'rollup',
        targetDate,
        error: 'Rollup execution error. Purge aborted.'
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  // 3. Step 2: Verify rollup success before proceeding
  // Invariant: Never purge before successful rollup
  const rollupRowsAffected = typeof rollupResult === 'number' ? rollupResult : 0;

  // 4. Step 3: Purge expired raw funnel rows (> 30 days retention)
  const { data: purgeResult, error: purgeError } = await supabase.rpc(
    'purge_expired_raw_funnel_events',
    { p_retention_days: 30 }
  );

  if (purgeError) {
    console.error('[Analytics:Maintenance] Purge failed:', purgeError.message);
    return NextResponse.json(
      {
        ok: false,
        step: 'purge',
        targetDate,
        rollup: { success: true, rowsAffected: rollupRowsAffected },
        error: 'Purge execution error.'
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  const purgedRows = typeof purgeResult === 'number' ? purgeResult : 0;

  return NextResponse.json(
    {
      ok: true,
      scheduler: 'vercel_cron',
      targetDate,
      rollup: {
        success: true,
        rowsAffected: rollupRowsAffected
      },
      purge: {
        success: true,
        retentionDays: 30,
        purgedRows
      },
      executedAt: new Date().toISOString()
    },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(request: Request) {
  return GET(request);
}
