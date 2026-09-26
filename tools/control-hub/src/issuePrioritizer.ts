import { CONFIG } from './config';
import { redactSecrets } from './secretRedactor';
import { BudgetTracker } from './budgetTracker';
import {
  VerifiedIssueRecord,
  PrioritizedIssueItem,
  IssuePrioritizationResponse
} from './types';

export class OpenAIIssuePrioritizer {
  private apiKey?: string;
  private model: string;
  private budgetTracker: BudgetTracker;

  constructor(model?: string, apiKey?: string, budgetTracker?: BudgetTracker) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.model = model || process.env.OPENAI_PLANNER_MODEL || CONFIG.OPENAI_DEFAULT_REVIEW_MODEL;
    this.budgetTracker = budgetTracker || new BudgetTracker();
  }

  public async prioritizeIssues(
    verifiedIssues: VerifiedIssueRecord[]
  ): Promise<IssuePrioritizationResponse> {
    // 1. Filter for VERIFIED and HIGH confidence issues only (max 8 sent to OpenAI)
    const eligibleForOpenAi = verifiedIssues
      .filter((i) => i.verificationStatus === 'VERIFIED' && i.confidence === 'HIGH')
      .slice(0, 8);

    if (eligibleForOpenAi.length === 0) {
      return {
        priorities: []
      };
    }

    if (!this.apiKey || this.apiKey.length === 0) {
      return this.generateOfflineFallback(eligibleForOpenAi);
    }

    if (!this.budgetTracker.canCallLuna()) {
      return this.generateOfflineFallback(eligibleForOpenAi);
    }

    const validIssueIds = new Set(eligibleForOpenAi.map((i) => i.issueId));

    const systemPrompt = `You are the ACELEETME Strategic Issue Prioritizer.
You evaluate supplied DETERMINISTIC VERIFIED ISSUES.
You do NOT discover or invent new issues or target files.

You must return a JSON object with a "priorities" array containing items for the supplied issue IDs ONLY.
For each issue, evaluate:
- Which issue provides the highest user value?
- Which should be fixed first?
- Which should be deferred or reviewed by owner?

Return JSON matching this exact structure:
{
  "priorities": [
    {
      "issueId": "exact issueId from supplied list",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "reason": "Clear explanation of priority",
      "expectedUserValue": "Direct benefit to users",
      "expectedBusinessValue": "Business impact",
      "expectedTechnicalValue": "Technical code quality impact",
      "recommendedAction": "FIX_NOW" | "DEFER" | "OWNER_REVIEW" | "IGNORE",
      "suggestedExecutor": "AUTONOMOUS_BUILDER" | "ANTIGRAVITY" | "OWNER"
    }
  ]
}`;

    const userPrompt = `DETERMINISTIC VERIFIED ISSUES TO PRIORITIZE:
${JSON.stringify(eligibleForOpenAi.map((i) => ({
      issueId: i.issueId,
      scanner: i.scanner,
      title: i.title,
      targetFiles: i.targetFiles,
      evidence: i.evidence,
      userImpact: i.userImpact,
      technicalImpact: i.technicalImpact,
      confidence: i.confidence,
      riskHint: i.riskHint
    })), null, 2)}

Prioritize these verified issues strictly and return JSON only.`;

    const requestBody = {
      model: this.model,
      input: `${systemPrompt}\n\n${userPrompt}`
    };

    let lastErrorText = '';
    for (let attempt = 0; attempt <= CONFIG.MAX_RETRIES_PER_TASK; attempt++) {
      try {
        const response = await fetch(`${CONFIG.OPENAI_API_BASE_URL}/responses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errText = await response.text();
          lastErrorText = `HTTP ${response.status}: ${redactSecrets(errText)}`;
          continue;
        }

        const data: any = await response.json();
        const responseId = data.id || 'resp_prioritizer_v082';
        const modelUsed = data.model || this.model;
        const inputTokens = data.usage?.input_tokens || 0;
        const outputTokens = data.usage?.output_tokens || 0;
        const totalTokens = data.usage?.total_tokens || inputTokens + outputTokens;

        this.budgetTracker.recordUsage(
          'ISSUE_PRIORITIZATION',
          modelUsed,
          inputTokens,
          outputTokens,
          responseId,
          'QUEUE_LUNA'
        );

        let outputText = '';
        if (data.output && Array.isArray(data.output)) {
          for (const item of data.output) {
            if (item.content && Array.isArray(item.content)) {
              for (const c of item.content) {
                if (c.text) outputText += c.text;
              }
            }
          }
        }
        if (!outputText && data.choices && data.choices[0]?.message?.content) {
          outputText = data.choices[0].message.content;
        }

        const jsonMatch = outputText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          return this.generateOfflineFallback(eligibleForOpenAi);
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const rawPriorities: any[] = Array.isArray(parsed.priorities) ? parsed.priorities : [];

        // Filter out unknown issue IDs or invented targets (OpenAI unknown issue rejection)
        const sanitizedPriorities: PrioritizedIssueItem[] = rawPriorities
          .filter((item) => item && typeof item.issueId === 'string' && validIssueIds.has(item.issueId))
          .map((item) => ({
            issueId: item.issueId,
            priority: (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(item.priority)
              ? item.priority
              : 'MEDIUM') as any,
            reason: String(item.reason || 'Prioritized by OpenAI Strategic Engine'),
            expectedUserValue: String(item.expectedUserValue || 'Grounded user value'),
            expectedBusinessValue: String(item.expectedBusinessValue || 'Grounded business value'),
            expectedTechnicalValue: String(item.expectedTechnicalValue || 'Grounded technical value'),
            recommendedAction: (['FIX_NOW', 'DEFER', 'OWNER_REVIEW', 'IGNORE'].includes(item.recommendedAction)
              ? item.recommendedAction
              : 'FIX_NOW') as any,
            suggestedExecutor: (['AUTONOMOUS_BUILDER', 'ANTIGRAVITY', 'OWNER'].includes(item.suggestedExecutor)
              ? item.suggestedExecutor
              : 'AUTONOMOUS_BUILDER') as any
          }));

        return {
          responseId,
          modelUsed,
          inputTokens,
          outputTokens,
          totalTokens,
          priorities: sanitizedPriorities
        };
      } catch (err: any) {
        lastErrorText = err.message || String(err);
      }
    }

    return this.generateOfflineFallback(eligibleForOpenAi);
  }

  private generateOfflineFallback(issues: VerifiedIssueRecord[]): IssuePrioritizationResponse {
    const priorities: PrioritizedIssueItem[] = issues.map((i, idx) => ({
      issueId: i.issueId,
      priority: idx === 0 ? 'HIGH' : 'MEDIUM',
      reason: `Offline deterministic priority for verified issue: ${i.title}`,
      expectedUserValue: i.userImpact,
      expectedBusinessValue: 'Improved platform compliance',
      expectedTechnicalValue: i.technicalImpact,
      recommendedAction: 'FIX_NOW',
      suggestedExecutor: (i.suggestedExecutionProfile || '').includes('BUILDER') ? 'AUTONOMOUS_BUILDER' : 'OWNER'
    }));

    return {
      responseId: 'resp_offline_prioritizer_v082',
      modelUsed: this.model,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      priorities
    };
  }
}
