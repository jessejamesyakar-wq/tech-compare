import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import { CONFIG, isOpenAiApiKeyPresent } from './config';
import { QueueStore } from './queueStore';
import { validateTaskGovernance } from './governance';
import { redactObject, redactSecrets } from './secretRedactor';
import { BuilderPolicyEngine } from './builderPolicy';
import {
  RiskLevel,
  QueueTask,
  TaskPriority,
  StrategicTaskProposal,
  StrategicRoadmap,
  ProposalDomain,
  SuggestedExecutor,
  ProposalPriority
} from './types';

export const GREEN_AUTONOMOUS_ALLOWLIST = [
  'REPOSITORY_INSPECTION',
  'ROOT_TYPESCRIPT',
  'ROOT_NEXT_BUILD',
  'CONTROL_HUB_TEST',
  'CONTROL_HUB_BUILD',
  'READ_ONLY_AUDIT'
];

export const RED_DETERMINISTIC_CONDITIONS = [
  'MAIN_MERGE',
  'PRODUCTION_DEPLOY',
  'PRODUCTION_DATABASE_MUTATION',
  'DESTRUCTIVE_MIGRATION',
  'PRODUCT_ROOT_DELETE',
  'PRODUCT_ROOT_MERGE',
  'GOLDEN_DATASET_MUTATION',
  'AUTOMATIC_FACT_CORRECTION',
  'RETAILER_FEED_ACTIVATION',
  'CREDENTIAL_MODIFICATION',
  'SECURITY_WEAKENING',
  'PAID_INFRASTRUCTURE',
  'SECRET_EXPOSURE',
  'PERMISSION_ESCALATION'
];

export interface ProjectTelemetry {
  repositoryHead: string;
  gitCleanliness: boolean;
  controlHubHealth: string;
  killSwitchState: string;
  pendingTasksCount: number;
  completedTasksCount: number;
  failedTasksCount: number;
  ownerDecisionsWaiting: number;
  catalogAudit: string;
  commerceReadiness: string;
  knownUnresolvedFindings: string[];
  resolvedHistoricalFindings?: string[];
  activeUnresolvedFindings?: string[];
  routeStructure: string[];
}

export class OpenAIStrategicPlanner {
  private queueStore: QueueStore;
  private roadmapFilePath: string;

  constructor(queueStore?: QueueStore, roadmapFilePath?: string) {
    this.queueStore = queueStore || new QueueStore();
    this.roadmapFilePath = roadmapFilePath || CONFIG.STRATEGIC_ROADMAP_FILE_PATH;
  }

  public getProjectTelemetry(): ProjectTelemetry {
    let repositoryHead = '8077c077e4cc5cb0f739fe7161279f37e191f382';
    let gitCleanliness = true;

    try {
      repositoryHead = execSync.execSync('git rev-parse HEAD', { cwd: CONFIG.CANONICAL_REPO_PATH, encoding: 'utf-8' }).trim();
      const status = execSync.execSync('git status --porcelain', { cwd: CONFIG.CANONICAL_REPO_PATH, encoding: 'utf-8' }).trim();
      gitCleanliness = status.length === 0;
    } catch {}

    const tasks = this.queueStore.getQueueTasks();
    const decisions = this.queueStore.getOwnerDecisions();
    const runnerState = this.queueStore.getRunnerState();

    const pending = tasks.filter(t => t.status === 'PENDING').length;
    const completed = tasks.filter(t => t.status === 'COMPLETED' || t.status === 'COMPLETED_WITH_LIMITATION').length;
    const failed = tasks.filter(t => t.status === 'FAILED').length;
    const waitingDecisions = decisions.filter(d => d.status === 'PENDING').length;

    return {
      repositoryHead,
      gitCleanliness,
      controlHubHealth: runnerState.supervisorStatus || 'HEALTHY',
      killSwitchState: runnerState.paused ? 'PAUSED' : 'RUNNING',
      pendingTasksCount: pending,
      completedTasksCount: completed,
      failedTasksCount: failed,
      ownerDecisionsWaiting: waitingDecisions,
      catalogAudit: 'CANONICAL_DB_AUDIT = NOT_PERFORMED (smartphonesData.json = BOOTSTRAP_BASELINE, Postgres/Neon = CANONICAL_MUTABLE_AUTHORITY)',
      commerceReadiness: 'RETAILERS_8 = PERMISSION_UNVERIFIED (Hepsiburada, Trendyol, Amazon, n11, PTTAVM, MediaMarkt, Vatan, Teknosa)',
      resolvedHistoricalFindings: [
        'BUILD and TEST root command failures: RESOLVED_HISTORICAL_FINDING (routed via CONTROL_HUB_TEST and ROOT_NEXT_BUILD)',
        'CLI task flag parsing corruption: RESOLVED_HISTORICAL_FINDING (resolved by strict argument parser in cliParser.ts)',
        'Dependency isolation junction caching: RESOLVED_HISTORICAL_FINDING (resolved by DependencyIsolationGuard)'
      ],
      activeUnresolvedFindings: [
        'Canonical Postgres/Neon DB schema audit not performed (smartphonesData.json remains bootstrap baseline)',
        'All 8 retailer offer feeds are PERMISSION_UNVERIFIED',
        'Automatic factual product correction is DISABLED_BY_GOVERNANCE'
      ],
      knownUnresolvedFindings: [
        'Canonical Postgres/Neon DB schema audit not performed',
        'All 8 retailer offer feeds are PERMISSION_UNVERIFIED',
        'Automatic factual product correction is DISABLED_BY_GOVERNANCE'
      ],
      routeStructure: [
        '/', '/phones', '/phones/[id]', '/compare', '/smartwatches', '/laptops', '/tablets',
        '/tvs', '/headphones', '/appliances', '/consoles', '/admin/stores', '/admin/learning',
        '/api/search', '/api/chat', '/api/compare', '/api/prices/compare', '/api/health'
      ]
    };
  }

  public getSavedRoadmaps(): StrategicRoadmap[] {
    if (!fs.existsSync(this.roadmapFilePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.roadmapFilePath, 'utf-8');
      return JSON.parse(data) as StrategicRoadmap[];
    } catch {
      return [];
    }
  }

  public saveRoadmap(roadmap: StrategicRoadmap): void {
    const roadmaps = this.getSavedRoadmaps();
    roadmaps.push(roadmap);
    const dir = path.dirname(this.roadmapFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(this.roadmapFilePath, JSON.stringify(roadmaps, null, 2), 'utf-8');
  }

  public isIdleAndEligibleForPlanning(): { eligible: boolean; reason?: string } {
    const runnerState = this.queueStore.getRunnerState();
    if (runnerState.paused) {
      return { eligible: false, reason: 'IDLE_PLANNING_BLOCKED: Kill switch is PAUSED' };
    }
    if (runnerState.supervisorStatus === 'RUNNER_RESTART_LIMIT_REACHED') {
      return { eligible: false, reason: 'IDLE_PLANNING_BLOCKED: Runner is in restart limit status' };
    }
    if (runnerState.activeLeaseOwner) {
      const leaseExpiry = runnerState.leaseExpiresAt ? new Date(runnerState.leaseExpiresAt).getTime() : 0;
      if (Date.now() < leaseExpiry) {
        return { eligible: false, reason: 'IDLE_PLANNING_BLOCKED: Active task lease exists' };
      }
    }

    const tasks = this.queueStore.getQueueTasks();
    const executablePending = tasks.filter(t => t.status === 'PENDING');
    if (executablePending.length > 0) {
      return { eligible: false, reason: 'IDLE_PLANNING_BLOCKED: Executable queue is not empty' };
    }

    const usage = this.queueStore.getUsageState();
    if (usage.totalOpenAiCalls >= CONFIG.MAX_TOTAL_OPENAI_CALLS_PER_DAY) {
      return { eligible: false, reason: 'IDLE_PLANNING_BLOCKED: Daily OpenAI budget cap reached' };
    }

    const roadmaps = this.getSavedRoadmaps();
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRoadmaps = roadmaps.filter(r => r.generatedAt && r.generatedAt.slice(0, 10) === todayStr);

    if (todayRoadmaps.length >= CONFIG.MAX_PLANNER_RUNS_PER_DAY) {
      return { eligible: false, reason: 'IDLE_PLANNING_BLOCKED: Daily planner run limit reached (max 4/day)' };
    }

    if (roadmaps.length > 0) {
      const lastRun = new Date(roadmaps[roadmaps.length - 1].generatedAt).getTime();
      const hoursSinceLast = (Date.now() - lastRun) / (1000 * 60 * 60);
      if (hoursSinceLast < CONFIG.MIN_PLANNER_INTERVAL_HOURS) {
        return { eligible: false, reason: `IDLE_PLANNING_BLOCKED: Minimum interval between planner runs is 4 hours (${hoursSinceLast.toFixed(1)}h elapsed)` };
      }
    }

    return { eligible: true };
  }

  public validateProposalGovernance(proposal: StrategicTaskProposal): StrategicTaskProposal {
    const textToScan = `${proposal.title} ${proposal.problem} ${proposal.reason} ${proposal.executionProfile} ${proposal.taskId}`.toUpperCase();

    // 1. Check Deterministic RED Conditions (Section 14)
    const isRedCondition =
      textToScan.includes('MAIN MERGE') || textToScan.includes('MERGE MAIN') ||
      textToScan.includes('PRODUCTION DEPLOY') || textToScan.includes('DEPLOY PRODUCTION') ||
      textToScan.includes('DATABASE MUTATION') || textToScan.includes('MUTATE DATABASE') ||
      textToScan.includes('DESTRUCTIVE MIGRATION') || textToScan.includes('DROP TABLE') ||
      textToScan.includes('PRODUCT ROOT DELETE') || textToScan.includes('DELETE PRODUCT ROOT') ||
      textToScan.includes('PRODUCT ROOT MERGE') || textToScan.includes('MERGE PRODUCT ROOT') ||
      textToScan.includes('GOLDEN DATASET') ||
      textToScan.includes('AUTOMATIC FACT CORRECTION') || textToScan.includes('FACT CORRECTION') ||
      textToScan.includes('RETAILER FEED ACTIVATION') || textToScan.includes('ACTIVATE RETAILER') ||
      textToScan.includes('CREDENTIAL MODIFICATION') || textToScan.includes('CHANGE CREDENTIAL') ||
      textToScan.includes('SECURITY WEAKENING') || textToScan.includes('BYPASS GOVERNANCE') ||
      textToScan.includes('PAID INFRASTRUCTURE') ||
      textToScan.includes('SECRET EXPOSURE') ||
      textToScan.includes('PERMISSION ESCALATION');

    if (isRedCondition) {
      return {
        ...proposal,
        validatedRisk: 'RED',
        ownerDecisionNeeded: true,
        suggestedExecutor: 'OWNER',
        governanceOverrideNote: 'Deterministic RED Condition: Higher governance and owner authorization required.'
      };
    }

    // 2. Check Self-Modification Protection (Section 19)
    const targetsControlHub =
      textToScan.includes('TOOLS/CONTROL-HUB') ||
      textToScan.includes('CONTROL_HUB') ||
      textToScan.includes('PLANNER') ||
      textToScan.includes('SUPERVISOR') ||
      textToScan.includes('GOVERNANCE') ||
      textToScan.includes('QUEUESTORE') ||
      textToScan.includes('RUNNER');

    if (targetsControlHub) {
      return {
        ...proposal,
        validatedRisk: 'YELLOW',
        builderEligible: false,
        executionProfile: 'PLANNER_PROPOSAL_ONLY',
        ownerDecisionNeeded: true,
        suggestedExecutor: 'OWNER',
        governanceOverrideNote: 'Self-modification protection: Control Hub changes must be PLANNER_PROPOSAL_ONLY'
      };
    }

    // 3. Check Autonomous Builder Executor proposals
    if (proposal.suggestedExecutor === 'AUTONOMOUS_BUILDER') {
      const targetFiles = proposal.targetFiles || [];
      const scopeCheck = BuilderPolicyEngine.validateTargetFiles(targetFiles);
      const groundingCheck = BuilderPolicyEngine.validateCandidateTargetGrounding(targetFiles);

      if (proposal.riskProposal === 'GREEN' && scopeCheck.eligible && groundingCheck.grounded && !targetsControlHub) {
        return {
          ...proposal,
          validatedRisk: 'GREEN',
          builderEligible: true,
          executionProfile: proposal.executionProfile || 'AUTONOMOUS_BUILDER_PATCH'
        };
      } else {
        return {
          ...proposal,
          validatedRisk: proposal.riskProposal === 'RED' ? 'RED' : 'YELLOW',
          builderEligible: false,
          executionProfile: 'PLANNER_PROPOSAL_ONLY',
          governanceOverrideNote: `AUTONOMOUS_BUILDER proposal ineligible: ${!groundingCheck.grounded ? groundingCheck.reason : scopeCheck.reason || 'Requires manual review'}`
        };
      }
    }

    // 4. Check Code Modification / Un-qualified Execution Profile (Section 12 & 13)
    const isQualifiedProfile = GREEN_AUTONOMOUS_ALLOWLIST.includes(proposal.executionProfile.toUpperCase());

    if (!isQualifiedProfile || proposal.executionProfile.toUpperCase() === 'PLANNER_PROPOSAL_ONLY' || proposal.suggestedExecutor === 'FUTURE_AUTONOMOUS_BUILDER') {
      return {
        ...proposal,
        validatedRisk: proposal.riskProposal === 'RED' ? 'RED' : 'YELLOW',
        executionProfile: 'PLANNER_PROPOSAL_ONLY',
        governanceOverrideNote: !isQualifiedProfile ? `Execution profile '${proposal.executionProfile}' is not in GREEN allowlist. Proposal stored for future builder phase.` : undefined
      };
    }

    // 5. Validate through standard governance
    const govResult = validateTaskGovernance(proposal.executionProfile as any, proposal.riskProposal);
    let finalRisk: RiskLevel = proposal.riskProposal;

    if (!govResult.ok) {
      finalRisk = proposal.riskProposal === 'RED' ? 'RED' : 'YELLOW';
    }

    return {
      ...proposal,
      validatedRisk: finalRisk
    };
  }

  public generateDedupeFingerprint(domain: string, problem: string, target: string, repoHead: string): string {
    const cleanProblem = problem.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    const cleanTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
    return `fp_${domain.toLowerCase()}_${cleanProblem}_${cleanTarget}_${repoHead.slice(0, 7)}`;
  }

  public deduplicateProposals(proposals: StrategicTaskProposal[]): { activeProposals: StrategicTaskProposal[]; suppressedCount: number } {
    const roadmaps = this.getSavedRoadmaps();
    const cutoffMs = Date.now() - 24 * 60 * 60 * 1000;

    const recentFingerprints = new Set<string>();
    roadmaps.forEach(r => {
      const rTime = new Date(r.generatedAt).getTime();
      if (rTime >= cutoffMs) {
        r.proposals.forEach(p => {
          if (p.dedupeFingerprint) recentFingerprints.add(p.dedupeFingerprint);
        });
      }
    });

    const activeProposals: StrategicTaskProposal[] = [];
    let suppressedCount = 0;

    proposals.forEach(p => {
      const fp = p.dedupeFingerprint || this.generateDedupeFingerprint(p.domain, p.problem, p.executionProfile, '8077c07');
      if (recentFingerprints.has(fp)) {
        suppressedCount += 1;
      } else {
        recentFingerprints.add(fp);
        activeProposals.push({
          ...p,
          dedupeFingerprint: fp
        });
      }
    });

    return { activeProposals, suppressedCount };
  }

  public async generateStrategicPlan(options?: {
    mockResponse?: Partial<StrategicRoadmap>;
    forceEscalation?: boolean;
    bypassIdleCheck?: boolean;
  }): Promise<{ roadmap: StrategicRoadmap; autoEnqueuedCount: number; idleBlockedReason?: string }> {
    if (!options?.bypassIdleCheck) {
      const eligibility = this.isIdleAndEligibleForPlanning();
      if (!eligibility.eligible) {
        const emptyRoadmap: StrategicRoadmap = {
          generatedAt: new Date().toISOString(),
          plannerModelUsed: CONFIG.OPENAI_DEFAULT_REVIEW_MODEL,
          escalationUsed: false,
          top3CurrentBlockers: [],
          top3NextMoves: [],
          doNotWorkOnYet: [],
          dependencyChain: [],
          userValueGap: 'Idle planning check failed',
          dataGap: '',
          commerceGap: '',
          growthGap: '',
          technicalRisk: '',
          ownerDecisionsNeeded: [],
          proposals: []
        };
        return { roadmap: emptyRoadmap, autoEnqueuedCount: 0, idleBlockedReason: eligibility.reason };
      }
    }

    const telemetry = this.getProjectTelemetry();
    const useEscalation = Boolean(options?.forceEscalation);
    const modelUsed = useEscalation ? CONFIG.OPENAI_DEFAULT_ESCALATION_MODEL : CONFIG.OPENAI_DEFAULT_REVIEW_MODEL;

    let rawRoadmap: StrategicRoadmap;

    if (options?.mockResponse) {
      rawRoadmap = {
        generatedAt: new Date().toISOString(),
        plannerModelUsed: modelUsed,
        escalationUsed: useEscalation,
        reviewerModelUsed: CONFIG.OPENAI_DEFAULT_REVIEW_MODEL,
        resultStatus: 'MOCK',
        top3CurrentBlockers: options.mockResponse.top3CurrentBlockers || ['Catalog variant specification gaps', 'Unverified retailer integration boundaries', 'Detached HEAD repo state'],
        top3NextMoves: options.mockResponse.top3NextMoves || ['Product catalog spec audit', 'Technical SEO Next.js build check', 'Retailer readiness matrix audit'],
        doNotWorkOnYet: options.mockResponse.doNotWorkOnYet || ['Public retailer ingestion', 'Production deployment', 'Automatic fact correction'],
        dependencyChain: options.mockResponse.dependencyChain || ['plan_catalog_audit -> plan_commerce_matrix'],
        userValueGap: options.mockResponse.userValueGap || 'Users cannot yet compare exact live retailer variant availability with verified price history',
        dataGap: options.mockResponse.dataGap || 'Postgres canonical DB audit not performed; smartphonesData.json remains bootstrap baseline',
        commerceGap: options.mockResponse.commerceGap || 'All 8 retailer integrations gated under PERMISSION_UNVERIFIED',
        growthGap: options.mockResponse.growthGap || 'Need structured metadata validation for phone comparison SEO pages',
        technicalRisk: options.mockResponse.technicalRisk || 'Avoid un-profiled root command execution',
        ownerDecisionsNeeded: options.mockResponse.ownerDecisionsNeeded || [],
        proposals: options.mockResponse.proposals || []
      };
    } else if (isOpenAiApiKeyPresent()) {
      const apiKey = process.env.OPENAI_API_KEY!;
      const systemPrompt = `You are the ACELEETME Strategic Project Planner V0.7.1.
Analyze the provided project telemetry and return a valid JSON object matching this schema:
{
  "top3CurrentBlockers": ["string", "string", "string"],
  "top3NextMoves": ["string", "string", "string"],
  "doNotWorkOnYet": ["string", "string", "string"],
  "dependencyChain": ["string"],
  "userValueGap": "string",
  "dataGap": "string",
  "commerceGap": "string",
  "growthGap": "string",
  "technicalRisk": "string",
  "ownerDecisionsNeeded": ["string"],
  "proposals": [
    {
      "taskId": "string",
      "title": "string",
      "domain": "DATA" | "COMMERCE" | "USER_VALUE" | "GROWTH" | "TECHNICAL" | "GOVERNANCE",
      "problem": "string",
      "evidence": ["string"],
      "reason": "string",
      "expectedUserValue": "string",
      "expectedBusinessValue": "string",
      "expectedTechnicalValue": "string",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "riskProposal": "GREEN" | "YELLOW" | "RED",
      "executionProfile": "string",
      "dependencies": ["string"],
      "acceptanceCriteria": ["string"],
      "estimatedComplexity": "LOW" | "MEDIUM" | "HIGH",
      "ownerDecisionNeeded": boolean,
      "suggestedExecutor": "CONTROL_HUB" | "ANTIGRAVITY" | "OWNER" | "FUTURE_AUTONOMOUS_BUILDER"
    }
  ]
}

CRITICAL RULES:
1. Do NOT list items under resolvedHistoricalFindings (such as BUILD/TEST task failures or CLI argument parsing fixes) as active top3CurrentBlockers. Top 3 blockers MUST be drawn strictly from activeUnresolvedFindings (e.g. un-audited Postgres canonical DB schema, PERMISSION_UNVERIFIED retailer feeds, missing user funnel telemetry).
2. For non-code-modifying health checks, technical SEO build verifications, or read-only repository inspection tasks, choose an executionProfile from the approved GREEN allowlist: "REPOSITORY_INSPECTION", "ROOT_TYPESCRIPT", "ROOT_NEXT_BUILD", "CONTROL_HUB_TEST", "CONTROL_HUB_BUILD", or "READ_ONLY_AUDIT" with riskProposal: "GREEN".
3. Return raw JSON only.`;

      const userPrompt = `PROJECT TELEMETRY:
${JSON.stringify(telemetry, null, 2)}`;

      try {
        const response = await fetch(`${CONFIG.OPENAI_API_BASE_URL}/responses`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: modelUsed,
            input: `${systemPrompt}\n\n${userPrompt}`
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          rawRoadmap = {
            generatedAt: new Date().toISOString(),
            plannerModelUsed: modelUsed,
            escalationUsed: useEscalation,
            httpStatus: response.status,
            resultStatus: 'BLOCKED',
            responseId: 'UNVERIFIED',
            top3CurrentBlockers: [],
            top3NextMoves: [],
            doNotWorkOnYet: [],
            dependencyChain: [],
            userValueGap: `OPENAI_PLANNER_RESULT = BLOCKED: HTTP ${response.status}: ${redactSecrets(errText)}`,
            dataGap: '',
            commerceGap: '',
            growthGap: '',
            technicalRisk: '',
            ownerDecisionsNeeded: [],
            proposals: []
          };
        } else {
          const data: any = await response.json();
          const responseId = data.id || 'UNVERIFIED';
          const actualModel = data.model || modelUsed;
          const inputTokens = data.usage?.input_tokens;
          const outputTokens = data.usage?.output_tokens;
          const totalTokens = data.usage?.total_tokens;

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

          let parsed: any = {};
          try {
            const cleanJson = outputText.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleanJson);
          } catch {
            parsed = {};
          }

          rawRoadmap = {
            generatedAt: new Date().toISOString(),
            plannerModelUsed: actualModel,
            escalationUsed: useEscalation,
            httpStatus: 200,
            resultStatus: 'QUALIFIED',
            responseId,
            inputTokens,
            outputTokens,
            totalTokens,
            top3CurrentBlockers: parsed.top3CurrentBlockers || [],
            top3NextMoves: parsed.top3NextMoves || [],
            doNotWorkOnYet: parsed.doNotWorkOnYet || [],
            dependencyChain: parsed.dependencyChain || [],
            userValueGap: parsed.userValueGap || '',
            dataGap: parsed.dataGap || '',
            commerceGap: parsed.commerceGap || '',
            growthGap: parsed.growthGap || '',
            technicalRisk: parsed.technicalRisk || '',
            ownerDecisionsNeeded: parsed.ownerDecisionsNeeded || [],
            proposals: (parsed.proposals || []).map((p: any, idx: number) => ({
              ...p,
              taskId: p.taskId || `plan_${p.domain?.toLowerCase() || 'task'}_${Date.now()}_${idx}`,
              dedupeFingerprint: p.dedupeFingerprint || this.generateDedupeFingerprint(p.domain || 'TASK', p.problem || p.title || 'task', p.executionProfile || 'PROFILE', telemetry.repositoryHead)
            }))
          };
        }
      } catch (err: any) {
        rawRoadmap = {
          generatedAt: new Date().toISOString(),
          plannerModelUsed: modelUsed,
          escalationUsed: useEscalation,
          httpStatus: 500,
          resultStatus: 'BLOCKED',
          responseId: 'UNVERIFIED',
          top3CurrentBlockers: [],
          top3NextMoves: [],
          doNotWorkOnYet: [],
          dependencyChain: [],
          userValueGap: `OPENAI_PLANNER_RESULT = BLOCKED: ${err.message}`,
          dataGap: '',
          commerceGap: '',
          growthGap: '',
          technicalRisk: '',
          ownerDecisionsNeeded: [],
          proposals: []
        };
      }
    } else {
      // Fallback path when API key is missing
      rawRoadmap = {
        generatedAt: new Date().toISOString(),
        plannerModelUsed: modelUsed,
        escalationUsed: useEscalation,
        reviewerModelUsed: CONFIG.OPENAI_DEFAULT_REVIEW_MODEL,
        resultStatus: 'MOCK',
        top3CurrentBlockers: [
          'Catalog variant specification gaps in bootstrap baseline',
          'Retailer offer ingestion gated under PERMISSION_UNVERIFIED',
          'Un-audited Postgres canonical database schema vs smartphonesData.json'
        ],
        top3NextMoves: [
          'Product catalog specification and variant identity audit',
          'Technical SEO metadata and Next.js route build check',
          'Retailer integration readiness and anomaly guard audit'
        ],
        doNotWorkOnYet: [
          'Live public retailer offer ingestion',
          'Multi-region production deployment',
          'Automatic factual product correction'
        ],
        dependencyChain: [
          'plan_catalog_audit_001 -> plan_commerce_matrix_001'
        ],
        userValueGap: 'Users require verified smartphone variant specifications and authentic price history.',
        dataGap: 'Postgres DB audit not performed; smartphonesData.json is bootstrap baseline only.',
        commerceGap: 'Retailers remain PERMISSION_UNVERIFIED pending owner authorization.',
        growthGap: 'Organic search discovery requires structured Product and BreadcrumbList JSON-LD metadata.',
        technicalRisk: 'Ensure all tasks run in isolated worktrees with verified execution profiles.',
        ownerDecisionsNeeded: [],
        proposals: [
          {
            taskId: `plan_catalog_audit_${Date.now()}`,
            title: 'Product Catalog Spec & Variant Identity Audit',
            domain: 'DATA',
            problem: 'Bootstrap smartphonesData.json may contain missing specifications or variant identity ambiguities.',
            evidence: [telemetry.catalogAudit, telemetry.repositoryHead],
            reason: 'Establishes verified baseline spec data for phone comparison.',
            expectedUserValue: 'Ensures users see accurate phone specs (RAM, Storage, Processor, Display).',
            expectedBusinessValue: 'Builds trust and eliminates bad product data.',
            expectedTechnicalValue: 'Identifies missing fields without mutating production database.',
            priority: 'HIGH',
            riskProposal: 'GREEN',
            executionProfile: 'REPOSITORY_INSPECTION',
            dependencies: [],
            acceptanceCriteria: ['Audit catalog items', 'Produce JSON audit report', 'Keep DB clean'],
            estimatedComplexity: 'LOW',
            ownerDecisionNeeded: false,
            suggestedExecutor: 'CONTROL_HUB',
            dedupeFingerprint: `fp_data_catalog_audit_${telemetry.repositoryHead.slice(0, 7)}`
          },
          {
            taskId: `plan_seo_build_${Date.now()}`,
            title: 'Technical SEO and Production Next.js Build Verification',
            domain: 'TECHNICAL',
            problem: 'Ensure Next.js 16 app routes and structured data compile cleanly.',
            evidence: [telemetry.repositoryHead, '39 static/dynamic routes in app directory'],
            reason: 'Guarantees zero build breaks or broken routes across phone category pages.',
            expectedUserValue: 'Fast, working page loads for phone comparisons.',
            expectedBusinessValue: 'Improves search engine indexing and organic traffic.',
            expectedTechnicalValue: 'Validates Next.js build integrity.',
            priority: 'HIGH',
            riskProposal: 'GREEN',
            executionProfile: 'ROOT_NEXT_BUILD',
            dependencies: [],
            acceptanceCriteria: ['npx next build compiles 39 routes with zero errors'],
            estimatedComplexity: 'MEDIUM',
            ownerDecisionNeeded: false,
            suggestedExecutor: 'CONTROL_HUB',
            dedupeFingerprint: `fp_technical_seo_build_${telemetry.repositoryHead.slice(0, 7)}`
          },
          {
            taskId: `plan_commerce_gating_${Date.now()}`,
            title: 'Retailer Ingestion Authorization & Anomaly Matrix',
            domain: 'COMMERCE',
            problem: '8 key retailers are currently PERMISSION_UNVERIFIED.',
            evidence: [telemetry.commerceReadiness],
            reason: 'Prepare offer schema matching before live retailer activation.',
            expectedUserValue: 'Paves way for accurate multi-retailer price comparison.',
            expectedBusinessValue: 'Enables future affiliate revenue readiness.',
            expectedTechnicalValue: 'Validates retailer offer schema and anomaly thresholds.',
            priority: 'MEDIUM',
            riskProposal: 'YELLOW',
            executionProfile: 'PLANNER_PROPOSAL_ONLY',
            dependencies: [`plan_catalog_audit_${Date.now()}`],
            acceptanceCriteria: ['Verify retailer schema maps', 'Keep live ingestion disabled'],
            estimatedComplexity: 'MEDIUM',
            ownerDecisionNeeded: true,
            suggestedExecutor: 'FUTURE_AUTONOMOUS_BUILDER',
            dedupeFingerprint: `fp_commerce_gating_${telemetry.repositoryHead.slice(0, 7)}`
          },
          {
            taskId: `plan_prod_deploy_${Date.now()}`,
            title: 'Production Multi-Region Cloud Deployment',
            domain: 'GOVERNANCE',
            problem: 'Deploy Control Hub and platform updates to production cloud infrastructure.',
            evidence: ['Production main is 249d3ead'],
            reason: 'Required for cloud runner hosting.',
            expectedUserValue: '24/7 background platform monitoring.',
            expectedBusinessValue: 'Continuous price anomaly monitoring.',
            expectedTechnicalValue: 'Deploys code to production servers.',
            priority: 'LOW',
            riskProposal: 'RED',
            executionProfile: 'PRODUCTION_DEPLOY',
            dependencies: [],
            acceptanceCriteria: ['Requires explicit owner decision approval in inbox'],
            estimatedComplexity: 'HIGH',
            ownerDecisionNeeded: true,
            suggestedExecutor: 'OWNER',
            dedupeFingerprint: `fp_governance_prod_deploy_${telemetry.repositoryHead.slice(0, 7)}`
          }
        ]
      };
    }

    // --- Control Hub Governance Validation ---
    const validatedProposals = rawRoadmap.proposals.map(p => this.validateProposalGovernance(p));

    // --- Deduplication ---
    const { activeProposals, suppressedCount } = this.deduplicateProposals(validatedProposals);

    const finalRoadmap: StrategicRoadmap = {
      ...rawRoadmap,
      proposals: activeProposals
    };

    // Save final roadmap artifact
    this.saveRoadmap(finalRoadmap);

    // --- Auto-Enqueue GREEN Tasks ---
    let autoEnqueuedCount = 0;
    const existingTasks = this.queueStore.getQueueTasks();
    const pendingGreenCount = existingTasks.filter(t => t.status === 'PENDING' && t.risk === 'GREEN').length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayEnqueuedCount = existingTasks.filter(t => t.createdAt && t.createdAt.slice(0, 10) === todayStr && t.risk === 'GREEN').length;

    for (const prop of activeProposals) {
      if (
        prop.validatedRisk === 'GREEN' &&
        GREEN_AUTONOMOUS_ALLOWLIST.includes(prop.executionProfile.toUpperCase()) &&
        !prop.ownerDecisionNeeded &&
        autoEnqueuedCount < CONFIG.MAX_AUTO_ENQUEUED_GREEN_TASKS_PER_RUN &&
        (todayEnqueuedCount + autoEnqueuedCount) < CONFIG.MAX_AUTO_ENQUEUED_GREEN_TASKS_PER_DAY &&
        (pendingGreenCount + autoEnqueuedCount) < CONFIG.MAX_PENDING_PLANNER_GREEN_TASKS
      ) {
        const newTask: QueueTask = {
          taskId: prop.taskId,
          type: prop.executionProfile as any,
          risk: 'GREEN',
          priority: prop.priority === 'CRITICAL' ? 'CRITICAL' : prop.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
          instruction: `${prop.title}: ${prop.reason}`,
          status: 'PENDING',
          dependencies: prop.dependencies,
          createdAt: new Date().toISOString(),
          attempts: 0
        };

        try {
          this.queueStore.addQueueTask(newTask);
          prop.autoEnqueued = true;
          autoEnqueuedCount += 1;
        } catch (err) {
          // If queue insertion fails validation, skip auto-enqueue
          prop.autoEnqueued = false;
        }
      } else {
        prop.autoEnqueued = false;
      }
    }

    return { roadmap: finalRoadmap, autoEnqueuedCount };
  }
}
