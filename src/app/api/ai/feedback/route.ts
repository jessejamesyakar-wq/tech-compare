import { NextResponse } from 'next/server';
import {
  evaluateFeedbackSafety,
  saveAnomaly,
  getLearnedPatterns,
  saveLearnedPatterns,
  LearnedPattern,
  FeedbackSubmission,
} from '@/lib/ai/learningHub';
import { notifyAnomalyToTelegram } from '@/lib/ai/telegramNotifier';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      messageId = 'msg-' + Date.now(),
      userPrompt = '',
      assistantResponse = '',
      rating = 'positive',
      reasonCategory = 'other',
      userComment = '',
    } = body;

    if (!userPrompt) {
      return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';

    // 1. Anti-Abuse ve Güvenlik Değerlendirmesi
    const safety = evaluateFeedbackSafety(userPrompt, userComment);

    const submission: FeedbackSubmission = {
      messageId,
      userPrompt,
      assistantResponse,
      rating,
      reasonCategory,
      userComment,
      timestamp: new Date().toISOString(),
    };

    // 2. Olumsuz bildirimleri anomali günlüğüne kaydet
    if (rating === 'negative') {
      saveAnomaly(submission);

      // Güvenlik filtresini geçen mantıklı şikayetlerden otomatik "Öğrenme Önerisi" (Pending) türet
      if (safety.safe && safety.score >= 70) {
        const patterns = getLearnedPatterns();
        const newPattern: LearnedPattern = {
          id: 'learned-' + Date.now(),
          triggerQuery: userPrompt,
          normalizedTrigger: userPrompt.toLowerCase().replace(/['’]/g, '').trim(),
          lessonNotes: `Kullanıcı Bildirimi [${reasonCategory}]: ${userComment || 'Yanıt beklentiyi karşılamadı, geliştirilmeli.'}`,
          status: 'pending',
          safetyScore: safety.score,
          reportedByIpHash: ip,
          createdAt: new Date().toISOString(),
        };
        patterns.push(newPattern);
        saveLearnedPatterns(patterns);

        // Telegram Bekçi Bildirimi Gönder
        notifyAnomalyToTelegram({
          userPrompt,
          assistantResponse,
          reasonCategory,
          userComment,
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      ok: true,
      message: rating === 'positive' ? 'Geri bildirimin için teşekkürler! 🐧' : 'Geri bildirimin incelenmek üzere RoboPengu Zeka Havuzuna iletildi! 🛡️',
      safetyScore: safety.score,
    });
  } catch (error: any) {
    console.error('[Feedback API Error]:', error);
    return NextResponse.json({ error: 'Geri bildirim kaydedilemedi' }, { status: 500 });
  }
}
