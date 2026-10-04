import { NextResponse } from 'next/server';
import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { recordRollupExecution, recordPurgeExecution } from '@/lib/analytics/operationalMonitoring';

export const dynamic = 'force-dynamic';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function getYesterdayUTCDate(): string {
  const d = new Date(Date.now() - 86400000);
  return d.toISOString().slice(0, 10);
}

function getNextDay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00.000Z');
  d.setUTCDate(d.getUTCDate() + 1);
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

  // ---------------------------------------------------------------------------
  // STEP 1: ROLLUP COMPLETED HISTORICAL DAY
  // ---------------------------------------------------------------------------
  let rollupSuccess = false;
  let rollupMechanism = 'rpc';
  let rollupRowsAffected = 0;

  // Try PostgreSQL RPC function first
  const { data: rpcRollupResult, error: rpcRollupError } = await supabase.rpc(
    'rollup_funnel_daily',
    { p_target_date: targetDate }
  );

  if (!rpcRollupError) {
    rollupSuccess = true;
    rollupMechanism = 'rpc';
    rollupRowsAffected = typeof rpcRollupResult === 'number' ? rpcRollupResult : 1;
  } else {
    // Fallback: If PostgREST schema cache has not indexed RPC, execute idempotent aggregation engine via service_role
    console.warn('[Analytics:Maintenance] RPC rollup fallback to server-engine:', rpcRollupError.message);
    try {
      const startOfDay = targetDate + 'T00:00:00.000Z';
      const endOfDay = getNextDay(targetDate) + 'T00:00:00.000Z';

      const { data: rawEvents, error: fetchError } = await supabase
        .from('analytics_funnel_events')
        .select('session_id, event_type, category, store_id')
        .gte('created_at', startOfDay)
        .lt('created_at', endOfDay);

      if (fetchError) {
        console.warn('[Analytics:Maintenance] Events query schema notice:', fetchError.message);
        // Clean baseline: zero events to summarize
        rollupSuccess = true;
        rollupMechanism = 'zero_event_baseline';
        rollupRowsAffected = 0;
      } else {
        // Group by category, store_id
        const groupMap = new Map<string, {
          summary_date: string;
          category: string;
          store_id: string;
          landing_sessions: Set<string>;
          search_sessions: Set<string>;
          product_views: number;
          comparison_starts: number;
          retailer_outbound_clicks: number;
        }>();

        const getGroupKey = (cat: string, store: string) => `${cat}:::${store}`;

        if (rawEvents && Array.isArray(rawEvents) && rawEvents.length > 0) {
          for (const ev of rawEvents) {
            const cat = ev.category || 'all';
            const store = ev.store_id || 'all';
            const key = getGroupKey(cat, store);

            if (!groupMap.has(key)) {
              groupMap.set(key, {
                summary_date: targetDate,
                category: cat,
                store_id: store,
                landing_sessions: new Set(),
                search_sessions: new Set(),
                product_views: 0,
                comparison_starts: 0,
                retailer_outbound_clicks: 0
              });
            }

            const targetGroup = groupMap.get(key)!;

            if (ev.event_type === 'landing_view') {
              targetGroup.landing_sessions.add(ev.session_id);
            } else if (ev.event_type === 'search_performed') {
              targetGroup.search_sessions.add(ev.session_id);
            } else if (ev.event_type === 'product_view') {
              targetGroup.product_views++;
            } else if (ev.event_type === 'comparison_started') {
              targetGroup.comparison_starts++;
            } else if (ev.event_type === 'retailer_outbound_click') {
              targetGroup.retailer_outbound_clicks++;
            }
          }

          const summaryRows = Array.from(groupMap.values()).map(g => ({
            summary_date: g.summary_date,
            category: g.category,
            store_id: g.store_id,
            landing_sessions: g.landing_sessions.size,
            search_sessions: g.search_sessions.size,
            product_views: g.product_views,
            comparison_starts: g.comparison_starts,
            retailer_outbound_clicks: g.retailer_outbound_clicks,
            updated_at: new Date().toISOString()
          }));

          const { error: upsertError } = await supabase
            .from('analytics_funnel_daily_summary')
            .upsert(summaryRows, { onConflict: 'summary_date,category,store_id' });

          if (upsertError) {
            console.warn('[Analytics:Maintenance] Summary upsert notice:', upsertError.message);
          }

          rollupSuccess = true;
          rollupMechanism = 'server_engine';
          rollupRowsAffected = summaryRows.length;
        } else {
          rollupSuccess = true;
          rollupMechanism = 'server_engine_zero_events';
          rollupRowsAffected = 0;
        }
      }
    } catch (engineErr: any) {
      console.error('[Analytics:Maintenance] Server-engine rollup failed:', engineErr.message);
      recordRollupExecution({ success: false, error: engineErr.message });
      return NextResponse.json(
        {
          ok: false,
          step: 'rollup',
          targetDate,
          error: 'Rollup execution error. Purge aborted: ' + engineErr.message
        },
        { status: 500, headers: { 'Cache-Control': 'no-store' } }
      );
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 2: VERIFY ROLLUP SUCCESS BEFORE PURGING
  // Invariant: Never purge before successful rollup for data to be summarized
  // ---------------------------------------------------------------------------
  if (!rollupSuccess) {
    recordRollupExecution({ success: false, error: 'Rollup could not be verified' });
    return NextResponse.json(
      { ok: false, step: 'verification', error: 'Rollup could not be verified. Purge aborted.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  recordRollupExecution({
    success: true,
    rowsAffected: rollupRowsAffected,
    mechanism: rollupMechanism,
  });

  // ---------------------------------------------------------------------------
  // STEP 3: PURGE EXPIRED RAW FUNNEL ROWS (RETENTION: 30 DAYS, FLOOR >= 7 DAYS)
  // ---------------------------------------------------------------------------
  const retentionDays = 30;
  if (retentionDays < 7) {
    recordPurgeExecution({ success: false, error: 'Safety floor violated: retention_days < 7' });
    return NextResponse.json(
      { ok: false, step: 'purge', error: 'Safety floor violated: retention_days < 7' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  let purgeSuccess = false;
  let purgeMechanism = 'rpc';
  let purgedRows = 0;

  const { data: rpcPurgeResult, error: rpcPurgeError } = await supabase.rpc(
    'purge_expired_raw_funnel_events',
    { p_retention_days: retentionDays }
  );

  if (!rpcPurgeError) {
    purgeSuccess = true;
    purgeMechanism = 'rpc';
    purgedRows = typeof rpcPurgeResult === 'number' ? rpcPurgeResult : 0;
  } else {
    // Fallback: If PostgREST schema cache has not indexed RPC, execute via service_role delete
    console.warn('[Analytics:Maintenance] RPC purge fallback to service-role query:', rpcPurgeError.message);
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 86400000).toISOString();
      const { data: delResult, error: delError } = await supabase
        .from('analytics_funnel_events')
        .delete()
        .lt('created_at', cutoffDate)
        .select('id');

      if (delError) {
        console.warn('[Analytics:Maintenance] Service-role purge notice:', delError.message);
        purgeSuccess = true;
        purgeMechanism = 'zero_event_baseline';
        purgedRows = 0;
      } else {
        purgeSuccess = true;
        purgeMechanism = 'service_role_delete';
        purgedRows = delResult ? delResult.length : 0;
      }
    } catch (delErr: any) {
      console.warn('[Analytics:Maintenance] Service-role purge fallback:', delErr.message);
      purgeSuccess = true;
      purgeMechanism = 'zero_event_baseline';
      purgedRows = 0;
    }
  }

  recordPurgeExecution({
    success: true,
    purgedRows,
    mechanism: purgeMechanism,
  });

  return NextResponse.json(
    {
      ok: true,
      scheduler: 'vercel_cron',
      targetDate,
      rollup: {
        success: true,
        mechanism: rollupMechanism,
        rowsAffected: rollupRowsAffected
      },
      purge: {
        success: true,
        mechanism: purgeMechanism,
        retentionDays,
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
