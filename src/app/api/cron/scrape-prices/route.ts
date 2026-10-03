import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
// app/api/cron/scrape-prices/route.ts
//
// GÜNCELLEME: 87 ürünü tek seferde işlemek zaman aşımına yol açıyordu
// (~20 dakika, Vercel serverless fonksiyon limitlerini aşıyor). Bu yüzden
// artık ?offset= ve ?limit= query paramlarıyla küçük gruplar halinde
// çalışıyor. vercel.json'da her biri farklı offset ile birkaç dakika
// arayla tetiklenen birden fazla cron tanımlıyoruz.

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireMaintenanceAccess(request, 'cron');
  if (denied) return denied;
  return NextResponse.json({success:false,code:'CHANNEL_NOT_PRODUCTION_READY'}, {status:503});
}
