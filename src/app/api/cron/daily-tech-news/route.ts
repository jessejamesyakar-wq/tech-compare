import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { NextResponse } from 'next/server';
import { getDailyTechNews } from '@/lib/news/dailyTechNewsEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const denied = requireMaintenanceAccess(request, 'cron');
  if (denied) return denied;
  try {
    const data = await getDailyTechNews(true); // Force generate/update
    return NextResponse.json({
      success: true,
      message: '09:00 Küresel Teknoloji Gündemi bülteni başarıyla yenilendi.',
      dateStr: data.dateStr,
      scheduledTime: data.scheduledTime,
      count: data.count,
      articles: data.articles
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Günlük teknoloji haberleri güncellenemedi: ' + error?.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = requireMaintenanceAccess(request, 'cron');
  if (denied) return denied;
  return GET(request);
}
