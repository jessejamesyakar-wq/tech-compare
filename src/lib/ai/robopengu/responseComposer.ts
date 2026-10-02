// src/lib/ai/robopengu/responseComposer.ts
/**
 * Worker 7: RoboPengu Response Composer
 * Formats structured recommendations into an explainable, objective Turkish response.
 * Strictly preserves engine ranking and highlights verified vs unverified data.
 */

import { RecommendationResult, ScoredCandidate } from './types';
import { PriceIntelligence } from './priceIntelligence';

export class ResponseComposer {
  public static compose(result: RecommendationResult): string {
    const { intent, rankedCandidates, compromises, trustSummary, followUpQuestions } = result;

    if (rankedCandidates.length === 0) {
      if (followUpQuestions && followUpQuestions.length > 0) {
        return [
          'Merhaba! Ben RoboPengu 🐧 Sana en doğru teknoloji tavsiyesini verebilmem için birkaç detaya ihtiyacım var:',
          '',
          ...followUpQuestions.map(q => `• ${q}`),
        ].join('\n');
      }
      return 'Belirttiğin kriterlere ve bütçeye uygun doğrulanmış bir model bulunamadı. Lütfen bütçe veya marka filtrelerini genişleterek tekrar deneyebilir misin?';
    }

    const lines: string[] = [];

    // 1. Introduction & Context
    lines.push('Merhaba! Ben RoboPengu 🐧 İhtiyaçların ve bütçen doğrultusunda 905 doğrulanmış telefon arasından senin için en uygun modelleri inceledim:');
    lines.push('');

    // 2. Conflict or Compromise notices
    if (compromises && compromises.length > 0) {
      lines.push('⚠️ **Önemli Not ve Kısıt Değerlendirmesi:**');
      compromises.forEach(c => lines.push(`• ${c}`));
      lines.push('');
    }

    // 3. Ranked Product Recommendations (Strictly keeping engine order)
    rankedCandidates.forEach((candidate: ScoredCandidate, index: number) => {
      const rank = index + 1;
      const priceText = candidate.priceInfo.effectivePrice !== null
        ? `${candidate.priceInfo.effectivePrice.toLocaleString('tr-TR')} TL`
        : 'Fiyat Bilgisi Doğrulanmadı';
      const statusLabel = PriceIntelligence.getStatusDescription(candidate.priceInfo.status);

      lines.push(`### ${rank}. ${candidate.name} (${candidate.brand})`);
      lines.push(`* **Fiyat Durumu:** ${priceText} — *${statusLabel}*`);
      if (candidate.priceInfo.storeCount > 0) {
        lines.push(`* **Mağaza Bilgisi:** ${candidate.priceInfo.storeCount} aktif mağaza teklifi`);
      }

      // Highlights
      if (candidate.matchedHighlights.length > 0) {
        lines.push(`* **Neden Önerildi:** ${candidate.matchedHighlights.join(' ')}`);
      }

      // Buy / Wait Advice
      const buyWait = candidate.buyWaitAdvice;
      const decisionIcon = buyWait.decision === 'BUY_NOW' ? '🟢 Satın Alınabilir'
        : buyWait.decision === 'WAIT' ? '🟡 Bekle / Takip Et'
        : buyWait.decision === 'NEUTRAL' ? '⚪ Nötr / Standart'
        : '⚠️ Yetersiz Veri';
      lines.push(`* **Zamanlama Tavsiyesi:** ${decisionIcon} — ${buyWait.summary}`);

      // Trust / Verification note
      if (candidate.trustEvaluation.warnings.length > 0) {
        lines.push(`* **Doğruluk Notu:** ⚠️ ${candidate.trustEvaluation.warnings.join(' ')}`);
      }

      lines.push('');
    });

    // 4. Overall Trust & Policy statement
    lines.push('---');
    lines.push(`ℹ️ **Güvenlik ve Tarafsızlık Güvencesi:** ${trustSummary}`);

    // 5. Follow-up suggestions if applicable
    if (followUpQuestions && followUpQuestions.length > 0) {
      lines.push('');
      lines.push('**Daha spesifik bir kıyaslama için:**');
      followUpQuestions.forEach(q => lines.push(`• ${q}`));
    }

    return lines.join('\n');
  }
}
