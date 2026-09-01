import { NextRequest, NextResponse } from 'next/server';
import { priceAnomalyStore, AnomalyRecord } from '@/lib/security/priceAnomalyGuard';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'PENDING_REVIEW';

    const all = priceAnomalyStore.getAll();
    const filtered = status === 'ALL' ? all : all.filter((r) => r.status === status);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      pendingCount: priceAnomalyStore.getPendingReviews().length,
      anomalies: filtered
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch price anomalies' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, action } = body; // action: 'APPROVE' | 'REJECT'

    if (!id || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid parameters. id and action (APPROVE/REJECT) are required.' },
        { status: 400 }
      );
    }

    const updated = priceAnomalyStore.updateStatus(id, action === 'APPROVE' ? 'APPROVED' : 'REJECTED');

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Anomaly record not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Anomali kaydı başarıyla ${action === 'APPROVE' ? 'onaylandı' : 'reddedildi'}.`,
      id,
      status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update anomaly record' },
      { status: 500 }
    );
  }
}
