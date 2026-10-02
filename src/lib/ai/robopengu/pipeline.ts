// src/lib/ai/robopengu/pipeline.ts
/**
 * End-to-End RoboPengu AI Pipeline
 * Integrates all 10 worker modules into a deterministic, explainable conversational advisor.
 */

import { IntentEngine } from './intentEngine';
import { RecommendationEngine } from './recommendationEngine';
import { ResponseComposer } from './responseComposer';
import { RoboPenguObservability } from './observability';
import { RecommendationResult, ShoppingIntent } from './types';

export interface PipelineExecutionResult {
  intent: ShoppingIntent;
  recommendation: RecommendationResult;
  composedResponseText: string;
  durationMs: number;
}

export class RoboPenguPipeline {
  private static recommendationEngine = new RecommendationEngine();

  public static execute(
    query: string,
    history: Array<{ role: string; content: string }> = []
  ): PipelineExecutionResult {
    const t0 = Date.now();

    // 1. Intent Parsing
    const intent = IntentEngine.parse(query, history);
    RoboPenguObservability.record('INTENT_PARSED', {
      category: intent.category,
      hasBudget: !!intent.budget,
      budgetMax: intent.budget?.max,
      preferredCount: intent.preferredBrands.length,
      excludedCount: intent.excludedBrands.length,
      hasConflict: intent.hasConflictingConstraints,
    });

    // 2. Multi-Criteria Recommendation & Optimization
    const recommendation = this.recommendationEngine.recommend(intent);
    RoboPenguObservability.record('RECOMMENDATION_GENERATED', {
      candidatesEvaluated: recommendation.totalCandidatesEvaluated,
      candidatesRanked: recommendation.rankedCandidates.length,
      hasCompromises: recommendation.compromises.length > 0,
    }, recommendation.executionTimeMs);

    // 3. Response Composition
    const composedResponseText = ResponseComposer.compose(recommendation);

    const durationMs = Date.now() - t0;
    return {
      intent,
      recommendation,
      composedResponseText,
      durationMs,
    };
  }
}
