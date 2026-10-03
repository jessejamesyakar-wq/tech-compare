import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { executeVatanPriceRefreshWorker } from '@/lib/pricing/vatanPriceRefreshWorker';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Validates Authorization: Bearer <CRON_SECRET> header using timing-safe comparison.
 */
function verifyCronAuth(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !secret.trim()) return false;

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return false;

  const suppliedToken = authHeader.slice(7).trim();
  const actual = Buffer.from(suppliedToken);
  const expected = Buffer.from(secret);

  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

export async function POST(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized: Valid CRON_SECRET Bearer token required.' },
      { status: 401 }
    );
  }

  try {
    const sbClient = getSupabaseServerClient();
    const result = await executeVatanPriceRefreshWorker({
      mode: 'CONTROLLED_FETCH',
      maxRequestsPerRun: 2,
      sbClient: sbClient || undefined,
    });

    return NextResponse.json({
      ok: true,
      phase: 'G',
      runtime: 'VERCEL_PRODUCTION',
      result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: 'Execution failed', message: error?.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { ok: false, error: 'Method Not Allowed. POST required.' },
    { status: 405 }
  );
}
