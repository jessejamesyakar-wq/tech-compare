import { NextResponse } from 'next/server';
import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // Guard with admin/maintenance bearer authorization
  const denied = requireMaintenanceAccess(request, 'admin');
  if (denied) return denied;

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: 'Database client unconfigured or unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  try {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Total events, daily summary, and diagnostics
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const rawSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    let schemaTables: string[] = [];
    let rpcPaths: string[] = [];
    try {
      const openApiRes = await fetch(`${rawUrl}/rest/v1/`, {
        headers: {
          apikey: rawSecretKey || '',
          Authorization: `Bearer ${rawSecretKey || ''}`
        }
      });
      const openApiJson = await openApiRes.json();
      schemaTables = Object.keys(openApiJson.definitions || {});
      rpcPaths = Object.keys(openApiJson.paths || {}).filter(p => p.startsWith('/rpc/'));
    } catch (e: any) {
      schemaTables = ['error: ' + e.message];
    }

    const [
      resTotal,
      resLast24h,
      resLatest,
      resRecent,
      resSummaries,
      resChannels,
      resRpcRollup,
      resRpcPurge
    ] = await Promise.all([
      supabase.from('analytics_funnel_events').select('*', { count: 'exact', head: true }),
      supabase.from('analytics_funnel_events').select('*', { count: 'exact', head: true }).gte('created_at', since24h),
      supabase.from('analytics_funnel_events').select('created_at, event_type').order('created_at', { ascending: false }).limit(1),
      supabase.from('analytics_funnel_events').select('event_type, session_id').gte('created_at', since24h),
      supabase.from('analytics_funnel_daily_summary').select('*', { count: 'exact' }).order('summary_date', { ascending: false }).limit(7),
      supabase.from('retailer_access_channels').select('*', { count: 'exact', head: true }),
      supabase.rpc('rollup_funnel_daily', { p_target_date: '2026-10-03' }),
      supabase.rpc('purge_expired_raw_funnel_events', { p_retention_days: 30 })
    ]);

    const totalEvents = resTotal.count;
    const last24hCount = resLast24h.count;
    const latestRow = resLatest.data;
    const recentEvents = resRecent.data;
    const summaries = resSummaries.data;
    const summaryCount = resSummaries.count;

    // 2. Aggregate KPI counts from recentEvents
    let landingSessions = 0;
    let searchSessions = 0;
    let productViews = 0;
    let comparisonStarts = 0;
    let retailerClicks = 0;

    const landingSessionSet = new Set<string>();
    const searchSessionSet = new Set<string>();

    if (recentEvents && Array.isArray(recentEvents)) {
      for (const ev of recentEvents) {
        if (ev.event_type === 'landing_view') {
          landingSessionSet.add(ev.session_id);
        } else if (ev.event_type === 'search_performed') {
          searchSessionSet.add(ev.session_id);
        } else if (ev.event_type === 'product_view') {
          productViews++;
        } else if (ev.event_type === 'comparison_started') {
          comparisonStarts++;
        } else if (ev.event_type === 'retailer_outbound_click') {
          retailerClicks++;
        }
      }
    }

    landingSessions = landingSessionSet.size;
    searchSessions = searchSessionSet.size;

    // 3. Compute conversion rates without fabricating when denominator is 0
    const conversions = {
      landingToSearchRate: landingSessions > 0 ? Number((searchSessions / landingSessions).toFixed(4)) : null,
      searchToProductRate: searchSessions > 0 ? Number((productViews / searchSessions).toFixed(4)) : null,
      productToCompareRate: productViews > 0 ? Number((comparisonStarts / productViews).toFixed(4)) : null,
      compareToRetailerClickRate: comparisonStarts > 0 ? Number((retailerClicks / comparisonStarts).toFixed(4)) : null
    };

    return NextResponse.json(
      {
        ok: true,
        analyticsHealth: {
          serverPersistence: 'ACTIVE',
          clientAutoTelemetry: true,
          scheduler: {
            type: 'vercel_cron',
            schedule: '15 3 * * *',
            endpoint: '/api/cron/analytics-maintenance',
            rawRetentionDays: 30
          },
          eventsTotal: totalEvents ?? 0,
          eventsLast24h: last24hCount ?? 0,
          latestEventTimestamp: latestRow && latestRow.length > 0 ? latestRow[0].created_at : null,
          latestEventType: latestRow && latestRow.length > 0 ? latestRow[0].event_type : null,
          dailySummaryRows: summaryCount ?? 0,
          recentSummaries: summaries || []
        },
        diagnostics: {
          schemaTables,
          rpcPaths,
          eventsError: resTotal.error?.message || null,
          summariesError: resSummaries.error?.message || null,
          channelsCount: resChannels.count,
          channelsError: resChannels.error?.message || null,
          rpcRollup: { data: resRpcRollup.data, error: resRpcRollup.error?.message || null },
          rpcPurge: { data: resRpcPurge.data, error: resRpcPurge.error?.message || null }
        },
        kpiReadModel: {
          landingSessions,
          searchSessions,
          productViews,
          comparisonStarts,
          retailerOutboundClicks: retailerClicks,
          conversions
        },
        timestamp: new Date().toISOString()
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      }
    );
  } catch (err: any) {
    console.error('[Analytics:Admin] Error fetching analytics health:', err?.message || err);
    return NextResponse.json(
      { ok: false, error: 'Internal analytics read model error.' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
