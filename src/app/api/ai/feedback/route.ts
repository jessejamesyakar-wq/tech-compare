import { NextResponse } from 'next/server';
import {
  evaluateFeedbackSafety,
  saveAnomaly,
  getLearnedPatterns,
  saveLearnedPatterns,
  LearnedPattern,
  FeedbackSubmission,
} from '@/lib/ai/learningHub';
import { createHmac, randomBytes } from 'node:crypto';
import { checkRateLimit } from '@/lib/ai/safety';
import { readLimitedJson } from '@/lib/security/requestBody';

const feedbackHashKey = randomBytes(32);

export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json({ error: 'Geçersiz istek kaynağı.' }, { status: 403 });
  }
  const identifier = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  const ipHash = createHmac('sha256', feedbackHashKey).update(identifier).digest('hex');
  const rate = checkRateLimit(`feedback:${ipHash}`);
  if (!rate.allowed) return NextResponse.json({ error: 'Lütfen biraz sonra tekrar deneyin.' }, {
    status: 429, headers: { 'Retry-After': String(Math.ceil((rate.retryAfterMs || 60000) / 1000)) },
  });
  let body: any;
  try {
    body = await readLimitedJson(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Geçersiz veri.');
    for (const [field, limit] of Object.entries({ messageId: 128, userPrompt: 2000, assistantResponse: 16000, userComment: 2000 })) {
      if (body[field] !== undefined && (typeof body[field] !== 'string' || body[field].length > limit)) throw new Error('Geçersiz alan.');
    }
    if (typeof body.userPrompt !== 'string' || !body.userPrompt.trim()) throw new Error('Prompt gerekli.');
    if (body.rating !== undefined && !['positive', 'negative'].includes(body.rating)) throw new Error('Geçersiz değerlendirme.');
    if (body.reasonCategory !== undefined && !['misunderstood', 'wrong_products', 'panel_error', 'bad_advice', 'other'].includes(body.reasonCategory)) throw new Error('Geçersiz neden.');
  } catch {
    return NextResponse.json({ error: 'Geri bildirim alanları geçersiz veya çok uzun.' }, { status: 400 });
  }
  try {
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
          reportedByIpHash: ipHash,
          createdAt: new Date().toISOString(),
        };
        patterns.push(newPattern);
        saveLearnedPatterns(patterns);

        // Feedback stays in the review queue; it is not forwarded to a messaging service.
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
