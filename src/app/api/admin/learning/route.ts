import { requireMaintenanceAccess } from '@/lib/security/maintenanceAuth';
import { NextResponse } from 'next/server';
import {
  getLearnedPatterns,
  saveLearnedPatterns,
  getAnomalies,
  LearnedPattern,
} from '@/lib/ai/learningHub';

export async function GET(request: Request) {
  const denied = requireMaintenanceAccess(request, 'admin');
  if (denied) return denied;
  try {
    const patterns = getLearnedPatterns();
    const anomalies = getAnomalies();

    return NextResponse.json({
      ok: true,
      patterns,
      anomalies,
      stats: {
        totalApproved: patterns.filter((p) => p.status === 'approved').length,
        totalPending: patterns.filter((p) => p.status === 'pending').length,
        totalRejected: patterns.filter((p) => p.status === 'rejected').length,
        totalAnomalies: anomalies.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Veriler alınamadı' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = requireMaintenanceAccess(req, 'admin');
  if (denied) return denied;
  try {
    const body = await req.json().catch(() => ({}));
    const { action, patternId, updatedPattern } = body;

    const patterns = getLearnedPatterns();

    if (action === 'approve') {
      const idx = patterns.findIndex((p) => p.id === patternId);
      if (idx >= 0) {
        patterns[idx].status = 'approved';
        patterns[idx].approvedAt = new Date().toISOString();
        if (updatedPattern?.lessonNotes) {
          patterns[idx].lessonNotes = updatedPattern.lessonNotes;
        }
        saveLearnedPatterns(patterns);
        return NextResponse.json({ ok: true, message: 'Kural onaylandı ve RoboPengu hafızasına işlendi! 🐧' });
      }
    } else if (action === 'reject') {
      const idx = patterns.findIndex((p) => p.id === patternId);
      if (idx >= 0) {
        patterns[idx].status = 'rejected';
        saveLearnedPatterns(patterns);
        return NextResponse.json({ ok: true, message: 'Öneri reddedildi ve devre dışı bırakıldı.' });
      }
    } else if (action === 'delete') {
      const filtered = patterns.filter((p) => p.id !== patternId);
      saveLearnedPatterns(filtered);
      return NextResponse.json({ ok: true, message: 'Kural silindi.' });
    } else if (action === 'create') {
      if (!updatedPattern?.triggerQuery || !updatedPattern?.lessonNotes) {
        return NextResponse.json({ error: 'Tetikleyici ve not gerekli' }, { status: 400 });
      }
      const newP: LearnedPattern = {
        id: 'admin-manual-' + Date.now(),
        triggerQuery: updatedPattern.triggerQuery,
        normalizedTrigger: updatedPattern.triggerQuery.toLowerCase().replace(/['’]/g, '').trim(),
        lessonNotes: updatedPattern.lessonNotes,
        status: 'approved',
        safetyScore: 100,
        createdAt: new Date().toISOString(),
        approvedAt: new Date().toISOString(),
      };
      patterns.unshift(newP);
      saveLearnedPatterns(patterns);
      return NextResponse.json({ ok: true, message: 'Yeni altın kural eklendi!', pattern: newP });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: 'İşlem gerçekleştirilemedi' }, { status: 500 });
  }
}
