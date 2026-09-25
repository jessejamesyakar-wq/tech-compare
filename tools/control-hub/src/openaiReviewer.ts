import { BudgetTracker } from './budgetTracker';
import { CONFIG } from './config';
import { redactObject, redactSecrets } from './secretRedactor';
import { ReviewPackage, ReviewerDecision, StructuredReviewResult } from './types';

export interface DualReviewResult {
  lunaReview: StructuredReviewResult;
  solReview?: StructuredReviewResult;
  finalDecision: ReviewerDecision;
  openAiCallCount: number;
}

export class OpenAIReviewer {
  private reviewModel: string;
  private escalationModel: string;
  private apiKey?: string;
  private budgetTracker: BudgetTracker;

  constructor(reviewModel?: string, escalationModel?: string, apiKey?: string, budgetTracker?: BudgetTracker) {
    this.reviewModel = reviewModel || process.env.OPENAI_REVIEW_MODEL || CONFIG.OPENAI_DEFAULT_REVIEW_MODEL;
    this.escalationModel = escalationModel || process.env.OPENAI_ESCALATION_MODEL || CONFIG.OPENAI_DEFAULT_ESCALATION_MODEL;
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    this.budgetTracker = budgetTracker || new BudgetTracker();
  }

  public async reviewTask(pkg: ReviewPackage): Promise<DualReviewResult> {
    const sanitizedPkg = redactObject(pkg);
    const pkgJson = JSON.stringify(sanitizedPkg);

    // Budget Guard: Reject oversized evidence before API request
    if (pkgJson.length > CONFIG.MAX_OPENAI_REVIEW_INPUT_CHARS) {
      const fallbackResult: StructuredReviewResult = {
        decision: 'REVIEWER_UNAVAILABLE',
        summary: `Evidence size (${pkgJson.length} chars) exceeds maximum allowed limit (${CONFIG.MAX_OPENAI_REVIEW_INPUT_CHARS} chars).`,
        verifiedEvidenceUsed: [],
        limitations: ['OVERSIZED_EVIDENCE_REJECTED'],
        risks: ['Oversized evidence payload rejected prior to API dispatch.'],
        requiredNextAction: 'Truncate or summarize task output before submission.',
        escalationRequired: false,
        modelUsed: this.reviewModel,
        responseId: 'NONE'
      };
      return {
        lunaReview: fallbackResult,
        finalDecision: 'REVIEWER_UNAVAILABLE',
        openAiCallCount: 0
      };
    }

    // Check Daily Cap for Luna
    if (!this.budgetTracker.canCallLuna()) {
      const fallbackResult: StructuredReviewResult = {
        decision: 'REVIEWER_UNAVAILABLE',
        summary: 'Daily Luna review limit reached.',
        verifiedEvidenceUsed: [],
        limitations: ['OPENAI_DAILY_REVIEW_LIMIT_REACHED'],
        risks: ['Daily review budget cap exceeded.'],
        requiredNextAction: 'Wait for daily reset or increase MAX_LUNA_REVIEWS_PER_DAY.',
        escalationRequired: false,
        modelUsed: this.reviewModel,
        responseId: 'NONE'
      };
      return {
        lunaReview: fallbackResult,
        finalDecision: 'REVIEWER_UNAVAILABLE',
        openAiCallCount: 0
      };
    }

    // 1. Call Luna (Normal Reviewer)
    const lunaReview = await this.callResponsesApi(this.reviewModel, sanitizedPkg);
    let openAiCallCount = lunaReview.responseId !== 'NONE' ? 1 : 0;

    // 2. Evaluate Sol Escalation conditions
    const shouldEscalate =
      lunaReview.decision === 'OWNER_DECISION_REQUIRED' ||
      lunaReview.escalationRequired ||
      lunaReview.limitations.some(l => l.toUpperCase().includes('ESCALAT') || l.toUpperCase().includes('UNCERTAIN'));

    if (shouldEscalate && openAiCallCount < CONFIG.MAX_OPENAI_REVIEWS_PER_TASK) {
      if (this.budgetTracker.canCallSol()) {
        const solReview = await this.callResponsesApi(this.escalationModel, sanitizedPkg, lunaReview);
        if (solReview.responseId !== 'NONE') {
          openAiCallCount++;
        }
        return {
          lunaReview,
          solReview,
          finalDecision: solReview.decision,
          openAiCallCount
        };
      } else {
        lunaReview.limitations.push('OPENAI_SOL_DAILY_LIMIT_REACHED');
      }
    }

    return {
      lunaReview,
      finalDecision: lunaReview.decision,
      openAiCallCount
    };
  }

  private async callResponsesApi(
    model: string,
    pkg: ReviewPackage,
    previousReview?: StructuredReviewResult
  ): Promise<StructuredReviewResult> {
    if (!this.apiKey || this.apiKey.length === 0) {
      return {
        decision: 'REVIEWER_UNAVAILABLE',
        summary: 'OPENAI_API_KEY is missing or empty.',
        verifiedEvidenceUsed: [],
        limitations: ['MISSING_API_KEY'],
        risks: ['Reviewer cannot authenticate without API key.'],
        requiredNextAction: 'Configure OPENAI_API_KEY environment variable.',
        escalationRequired: false,
        modelUsed: model,
        responseId: 'NONE'
      };
    }

    const systemPrompt = `You are the ACELEETME Reviewer.
You review supplied evidence.
You do NOT invent repository facts.
Command-derived Local Executor evidence is authoritative for measured facts.

Never invent:
- commit IDs
- hashes
- test counts
- file counts
- exit codes
- deployment states
- database state

If evidence is missing (e.g. canonicalHead or workspaceHead is UNVERIFIED), mark it UNVERIFIED in verifiedEvidenceUsed/limitations. Do not convert missing evidence into PASS.

If command evidence indicates failure (e.g. readOnlyViolation=true, typecheckResult=FAIL, buildResult=FAIL, testResults=FAIL, or failureClassification present), you must NOT return PASS_GREEN. Deterministic evidence cannot be overruled.

You may identify risks, contradictions and missing checks.

You must return a JSON object matching this exact TypeScript structure:
{
  "decision": "PASS_GREEN" | "PASS_WITH_LIMITATION" | "FAIL_REVIEW" | "OWNER_DECISION_REQUIRED",
  "summary": "Concise evaluation summary",
  "verifiedEvidenceUsed": ["list of verified facts from evidence"],
  "limitations": ["list of limitations or unverified items"],
  "risks": ["list of identified risks"],
  "requiredNextAction": "Recommended next step",
  "escalationRequired": boolean
}
`;

    const userPrompt = `TASK EVIDENCE TO REVIEW:
${JSON.stringify(pkg, null, 2)}

${previousReview ? `PREVIOUS REVIEW (LUNA):\n${JSON.stringify(previousReview, null, 2)}` : ''}

Evaluate the evidence strictly and return JSON only.`;

    const requestBody = {
      model: model,
      input: `${systemPrompt}\n\n${userPrompt}`
    };

    let lastErrMessage = '';
    let isQuotaError = false;

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
          lastErrMessage = `HTTP ${response.status}: ${redactSecrets(errText)}`;
          if (response.status === 429 || errText.includes('quota') || errText.includes('billing')) {
            isQuotaError = true;
          }
          continue;
        }

        const data: any = await response.json();
        const responseId = data.id || 'NONE';
        const modelUsed = data.model || model;

        const inputTokens = data.usage?.input_tokens || 0;
        const outputTokens = data.usage?.output_tokens || 0;
        const category = pkg.taskId.includes('QUAL') || pkg.taskId.includes('LIVE') || pkg.taskId.includes('MANUAL')
          ? (modelUsed.includes('sol') ? 'MANUAL_SOL' : 'MANUAL_LUNA')
          : (modelUsed.includes('sol') ? 'QUEUE_SOL' : 'QUEUE_LUNA');
        this.budgetTracker.recordUsage(pkg.taskId, modelUsed, inputTokens, outputTokens, responseId, category);

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

        const parsedResult = this.parseReviewerJson(outputText, modelUsed, responseId, pkg);
        return parsedResult;
      } catch (err: any) {
        lastErrMessage = redactSecrets(err.message);
      }
    }

    // Fail-closed on API failure
    return {
      decision: 'REVIEWER_UNAVAILABLE',
      summary: `OpenAI API call failed: ${lastErrMessage}`,
      verifiedEvidenceUsed: [],
      limitations: isQuotaError ? ['OPENAI_BUDGET_EXHAUSTED'] : ['API_FAILURE'],
      risks: ['Reviewer service unavailable.'],
      requiredNextAction: isQuotaError ? 'Check OpenAI billing and quota limits.' : 'Check OpenAI API connectivity or retry later.',
      escalationRequired: false,
      modelUsed: model,
      responseId: 'NONE'
    };
  }

  private parseReviewerJson(rawText: string, modelUsed: string, responseId: string, pkg: ReviewPackage): StructuredReviewResult {
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(cleanText);
    } catch {
      parsed = {
        decision: 'FAIL_REVIEW',
        summary: `Reviewer output could not be parsed as valid JSON: ${cleanText.slice(0, 100)}`,
        verifiedEvidenceUsed: [],
        limitations: ['MALFORMED_REVIEWER_JSON'],
        risks: ['Reviewer model output did not comply with JSON format.'],
        requiredNextAction: 'Inspect raw reviewer output format.',
        escalationRequired: false
      };
    }

    let decision: ReviewerDecision = parsed.decision || 'FAIL_REVIEW';
    const validDecisions: ReviewerDecision[] = ['PASS_GREEN', 'PASS_WITH_LIMITATION', 'FAIL_REVIEW', 'OWNER_DECISION_REQUIRED', 'REVIEWER_UNAVAILABLE'];
    if (!validDecisions.includes(decision)) {
      decision = 'FAIL_REVIEW';
    }

    // Deterministic Overrule Enforcement (Section 9 & 15)
    const isDeterministicFailure =
      pkg.readOnlyViolation === true ||
      pkg.typecheckResult === 'FAIL' ||
      pkg.buildResult === 'FAIL' ||
      pkg.testResults === 'FAIL' ||
      Boolean(pkg.failureClassification);

    if (isDeterministicFailure && (decision === 'PASS_GREEN' || decision === 'PASS_WITH_LIMITATION')) {
      decision = 'FAIL_REVIEW';
    }

    // Missing evidence check (Section 16)
    const verified = Array.isArray(parsed.verifiedEvidenceUsed) ? parsed.verifiedEvidenceUsed : [];
    const limitations = Array.isArray(parsed.limitations) ? parsed.limitations : [];
    if (pkg.canonicalHead === 'UNVERIFIED' || !pkg.canonicalHead) {
      if (!limitations.some((l: string) => l.includes('UNVERIFIED') || l.includes('missing'))) {
        limitations.push('UNVERIFIED_CANONICAL_HEAD');
      }
    }

    return {
      decision,
      summary: parsed.summary || 'No summary provided',
      verifiedEvidenceUsed: verified,
      limitations,
      risks: Array.isArray(parsed.risks) ? parsed.risks : [],
      requiredNextAction: parsed.requiredNextAction || 'None',
      escalationRequired: Boolean(parsed.escalationRequired),
      modelUsed,
      responseId
    };
  }
}
