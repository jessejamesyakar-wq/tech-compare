// src/lib/ai/robopengu/recommendationEngine.ts
/**
 * Worker 3: Recommendation Engine
 * Multi-criteria scoring with dynamic intent weighting, TrustLayer penalization, and explainability breakdown.
 */

import { ShoppingIntent, ScoredCandidate, RecommendationResult, ScoreBreakdown, PriorityLevel } from './types';
import { CatalogProduct, CandidateEngine } from './candidateEngine';
import { PriceIntelligence } from './priceIntelligence';
import { TrustEngine } from './trustEngine';
import { BuyWaitEngine } from './buyWaitEngine';
import { ClassicalOptimizer } from './optimizer/classicalOptimizer';
import { OptimizationEngine } from './optimizer/optimizationEngine';

export class RecommendationEngine {
  private optimizer: OptimizationEngine;

  constructor(optimizer?: OptimizationEngine) {
    this.optimizer = optimizer || new ClassicalOptimizer();
  }

  public recommend(
    intent: ShoppingIntent,
    options?: { customCatalog?: CatalogProduct[]; limit?: number }
  ): RecommendationResult {
    const startTime = Date.now();
    const limit = options?.limit || 5;

    // 1. Generate Candidates
    const candidateResult = CandidateEngine.filterCandidates(intent, {
      customCatalog: options?.customCatalog,
      maxCandidates: 50,
    });

    const focusFields = this.determineUserFocusFields(intent);

    // 2. Score and evaluate each candidate
    const scoredCandidates: ScoredCandidate[] = candidateResult.candidates.map(product => {
      const priceInfo = PriceIntelligence.evaluate(product);
      const trustEvaluation = TrustEngine.evaluate(product, focusFields);
      const buyWaitAdvice = BuyWaitEngine.evaluate(product, priceInfo);
      const scoreBreakdown = this.calculateScores(product, intent, priceInfo, trustEvaluation);
      const { matchedHighlights, compromises } = this.generateExplanations(product, intent, scoreBreakdown, priceInfo);

      return {
        rootId: product.id,
        name: product.name,
        brand: product.brand,
        slug: product.slug || product.id,
        category: product.category || 'smartphones',
        specs: product.specs,
        priceInfo,
        buyWaitAdvice,
        trustEvaluation,
        scoreBreakdown,
        matchedHighlights,
        compromises,
      };
    });

    // 3. Optimize & Rank via Optimizer
    const optimization = this.optimizer.optimize(scoredCandidates, intent, limit);
    const rankedCandidates = optimization.selectedCandidates;

    // 4. Synthesize overall compromises and trust summary
    const globalCompromises: string[] = [];
    if (intent.hasConflictingConstraints && intent.conflictExplanation) {
      globalCompromises.push(intent.conflictExplanation);
    }
    if (rankedCandidates.some(c => c.priceInfo.isFallback)) {
      globalCompromises.push('Listelenen bazı modeller için canlı mağaza stoğu yerine katalog liste fiyatı baz alınmıştır.');
    }

    const hasBlocked = rankedCandidates.some(c => c.trustEvaluation.hasBlockedFields);
    const trustSummary = hasBlocked
      ? 'Bazı donanım alanları (işlemci üretim süreci veya RAM standardı) üretici tarafından resmi olarak açıklanmadığı için tarafsız güven politikamız gereği puanlamaya dahil edilmemiştir.'
      : 'Tüm önerilen ürünlerin temel spesifikasyonları doğrulanmıştır.';

    return {
      intent,
      totalCandidatesEvaluated: scoredCandidates.length,
      rankedCandidates,
      compromises: globalCompromises,
      trustSummary,
      followUpQuestions: intent.followUpQuestions,
      executionTimeMs: Date.now() - startTime,
    };
  }

  private determineUserFocusFields(intent: ShoppingIntent): string[] {
    const focus: string[] = [];
    if (intent.cameraPriority !== 'none') focus.push('camera');
    if (intent.displayPriority !== 'none') focus.push('display', 'brightness');
    if (intent.batteryPriority !== 'none') focus.push('battery');
    if (intent.performancePriority !== 'none') focus.push('processor', 'ram');
    return focus;
  }

  private calculateScores(
    product: CatalogProduct,
    intent: ShoppingIntent,
    priceInfo: any,
    trust: any
  ): ScoreBreakdown {
    // 1. Raw Dimension Scores (0 - 100)
    const cameraScore = this.computeCameraScore(product);
    const batteryScore = this.computeBatteryScore(product);
    const displayScore = this.computeDisplayScore(product);
    const performanceScore = this.computePerformanceScore(product);
    const valueScore = this.computeValueScore(product, priceInfo, intent);

    // 2. Preference Match Score
    let preferenceMatchScore = 70;
    if (intent.preferredBrands.some(b => product.brand.toLowerCase() === b.toLowerCase())) {
      preferenceMatchScore += 20;
    }

    // 3. Dynamic Weighting based on User Priorities
    const wCamera = this.priorityToWeight(intent.cameraPriority);
    const wBattery = this.priorityToWeight(intent.batteryPriority);
    const wDisplay = this.priorityToWeight(intent.displayPriority);
    const wPerf = this.priorityToWeight(intent.performancePriority);
    const wGaming = this.priorityToWeight(intent.gamingPriority);
    const effectivePerfWeight = Math.max(wPerf, wGaming);

    const totalWeight = wCamera + wBattery + wDisplay + effectivePerfWeight + 1.0; // 1.0 for value

    const weightedScore = (
      cameraScore * wCamera +
      batteryScore * wBattery +
      displayScore * wDisplay +
      performanceScore * effectivePerfWeight +
      valueScore * 1.0
    ) / totalWeight;

    // 4. Trust Penalty: Unverified or blocked fields reduce total score to prevent ranking inflation
    const trustPenalty = (1.0 - trust.overallTrustScore) * 15; // Max 15 points penalty

    const totalScore = Math.max(0, Math.min(100, Number((weightedScore + (preferenceMatchScore * 0.1) - trustPenalty).toFixed(1))));

    return {
      cameraScore: Number(cameraScore.toFixed(1)),
      batteryScore: Number(batteryScore.toFixed(1)),
      displayScore: Number(displayScore.toFixed(1)),
      performanceScore: Number(performanceScore.toFixed(1)),
      valueScore: Number(valueScore.toFixed(1)),
      preferenceMatchScore: Number(preferenceMatchScore.toFixed(1)),
      trustPenalty: Number(trustPenalty.toFixed(1)),
      totalScore,
    };
  }

  private priorityToWeight(p?: PriorityLevel): number {
    switch (p) {
      case 'critical': return 2.5;
      case 'high': return 1.8;
      case 'medium': return 1.2;
      case 'low': return 0.8;
      case 'none': return 0.5;
      default: return 0.5;
    }
  }

  private computeCameraScore(p: CatalogProduct): number {
    const rawMp = p.specs?.rearCameraMp || p.specs?.camera?.mainMp || 48;
    const mp = typeof rawMp === 'number' ? rawMp : (parseFloat(String(rawMp)) || 48);
    let score = Math.min(95, 50 + (mp / 200) * 40);
    if (p.specs?.camera?.hasOis || p.specs?.hasOis) score += 5;
    return Number.isFinite(score) ? score : 75;
  }

  private computeBatteryScore(p: CatalogProduct): number {
    const rawMah = p.specs?.batteryCapacityMah || p.specs?.batteryMah || 5000;
    const mah = typeof rawMah === 'number' ? rawMah : (parseFloat(String(rawMah)) || 5000);
    const score = Math.min(95, 40 + (mah / 6000) * 50);
    return Number.isFinite(score) ? score : 75;
  }

  private computeDisplayScore(p: CatalogProduct): number {
    let score = 70;
    const type = (p.specs?.displayTechnology || p.specs?.displayType || '').toLowerCase();
    if (type.includes('amoled') || type.includes('oled')) score += 15;
    const hz = parseFloat(String(p.specs?.refreshRateHz || 60)) || 60;
    if (hz >= 120) score += 10;
    return Math.min(95, score);
  }

  private computePerformanceScore(p: CatalogProduct): number {
    const rawRam = p.specs?.ramGb || p.specs?.memory?.ramGb || 8;
    const ram = typeof rawRam === 'number' ? rawRam : (parseFloat(String(rawRam)) || 8);
    const score = Math.min(95, 40 + (ram / 16) * 50);
    return Number.isFinite(score) ? score : 75;
  }

  private computeValueScore(p: CatalogProduct, priceInfo: any, intent: ShoppingIntent): number {
    const price = priceInfo.effectivePrice || 99999;
    if (!intent.budget || !intent.budget.max) return 75;
    const ratio = price / intent.budget.max;
    if (ratio <= 0.85) return 90; // Great value below budget
    if (ratio <= 1.0) return 80;  // Right at budget
    return Math.max(30, 80 - (ratio - 1.0) * 100); // Over budget penalty
  }

  private generateExplanations(
    product: CatalogProduct,
    intent: ShoppingIntent,
    scores: ScoreBreakdown,
    priceInfo: any
  ): { matchedHighlights: string[]; compromises: string[] } {
    const matchedHighlights: string[] = [];
    const compromises: string[] = [];

    if (intent.cameraPriority !== 'none' && scores.cameraScore >= 75) {
      matchedHighlights.push('Yüksek çözünürlüklü ve detaylı kamera sistemiyle kamera önceliğinizi karşılar.');
    }
    if (intent.batteryPriority !== 'none' && scores.batteryScore >= 75) {
      matchedHighlights.push('Geniş batarya kapasitesi ile yoğun günlük kullanımda uzun pil ömrü sunar.');
    }
    if (intent.displayPriority !== 'none' && scores.displayScore >= 80) {
      matchedHighlights.push('Akıcı yenileme hızı ve yüksek kontrastlı ekran paneli sunar.');
    }
    if (intent.storageMinimumGb && (CandidateEngine.extractStorageGb(product) || 0) >= intent.storageMinimumGb) {
      matchedHighlights.push(`${intent.storageMinimumGb} GB ve üzeri depolama gereksinimini karşılar.`);
    }

    if (priceInfo.isFallback) {
      compromises.push('Canlı mağaza teklifi yerine katalog referans liste fiyatı kullanılmaktadır.');
    }
    if (intent.budget?.max && (priceInfo.effectivePrice || 0) > intent.budget.max) {
      compromises.push(`Belirttiğiniz ${intent.budget.max.toLocaleString('tr-TR')} TL bütçenin hafif üzerindedir.`);
    }

    if (matchedHighlights.length === 0) {
      matchedHighlights.push('Segmentinde dengeli donanım ve fiyat uyumu sunan alternatif.');
    }

    return { matchedHighlights, compromises };
  }
}
