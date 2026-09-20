import { NextResponse } from 'next/server';
import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';

export async function GET(request: Request) {
  const denied = requireMaintenanceAccess(request);
  if (denied) return denied;
  return NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
}
