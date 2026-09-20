import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { NextRequest, NextResponse } from 'next/server';
import { LEGACY_SCRAPER_DISABLED_MESSAGE } from '@/lib/scraper/livePriceScraper2026';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes max duration for scraping task

export async function GET(req: NextRequest) {
  const denied = requireMaintenanceAccess(req, 'cron');
  if (denied) return denied;
  return NextResponse.json(
    { success: false, code: 'LEGACY_SCRAPER_DISABLED', error: LEGACY_SCRAPER_DISABLED_MESSAGE },
    { status: 503 }
  );
}
