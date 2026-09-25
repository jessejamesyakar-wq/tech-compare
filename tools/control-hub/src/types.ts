export type TaskState =
  | 'PENDING'
  | 'RUNNING'
  | 'REVIEWING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_LIMITATION'
  | 'FAILED'
  | 'BLOCKED'
  | 'BLOCKED_BY_DEPENDENCY'
  | 'BLOCKED_BY_REPOSITORY_IDENTITY'
  | 'OWNER_DECISION_REQUIRED'
  | 'CANCELLED';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export type RiskLevel = 'GREEN' | 'YELLOW' | 'RED';

export type GreenTaskType =
  | 'REPOSITORY_INSPECTION'
  | 'TYPECHECK'
  | 'BUILD'
  | 'TEST'
  | 'DEPENDENCY_ANALYSIS'
  | 'STATIC_SECURITY_ANALYSIS'
  | 'DOCUMENTATION_ANALYSIS'
  | 'READONLY_DATA_AUDIT';

export type HighRiskTaskType =
  | 'PRODUCTION_DEPLOY'
  | 'DATABASE_MIGRATION'
  | 'RETAILER_CRAWL'
  | 'SHADOW_OFFER_PROMOTE'
  | 'FACT_CORRECTION_ENABLE';

export type TaskType = GreenTaskType | HighRiskTaskType;

export type ReviewerDecision =
  | 'PASS_GREEN'
  | 'PASS_WITH_LIMITATION'
  | 'FAIL_REVIEW'
  | 'OWNER_DECISION_REQUIRED'
  | 'REVIEWER_UNAVAILABLE';

export interface StructuredReviewResult {
  decision: ReviewerDecision;
  summary: string;
  verifiedEvidenceUsed: string[];
  limitations: string[];
  risks: string[];
  requiredNextAction: string;
  escalationRequired: boolean;
  modelUsed: string;
  responseId: string;
}

export interface ReviewPackage {
  taskId: string;
  taskType: TaskType;
  risk: RiskLevel;
  canonicalHead?: string;
  workspaceHead?: string;
  changedFiles?: string[];
  commandResults?: string;
  testResults?: string;
  typecheckResult?: string;
  buildResult?: string;
  readOnlyViolation?: boolean;
  warnings?: string[];
  failureClassification?: string;
  antigravityAnalysis?: string;
}

export interface QueueTask {
  taskId: string;
  type: TaskType;
  risk: RiskLevel;
  priority: TaskPriority;
  instruction: string;
  status: TaskState;
  dependencies: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  attempts: number;
  canonicalHead?: string;
  originMainHead?: string;
  workspaceHead?: string;
  workspacePath?: string;
  commandOutput?: string;
  readOnlyViolation?: boolean;
  antigravityAnalysis?: string;
  analysisResult?: string;
  reviewResult?: StructuredReviewResult;
  solReviewResult?: StructuredReviewResult;
  reviewerDecision?: ReviewerDecision;
  failureClassification?: string;
  limitations?: string[];
  ownerDecisionReason?: string;
}

export interface TaskRecord extends QueueTask {}

export interface OwnerDecisionItem {
  decisionId: string;
  taskId: string;
  createdAt: string;
  shortTitle: string;
  reason: string;
  optionA: string;
  optionB: string;
  safeDefault: string;
  riskIfNoDecision: string;
  status: 'PENDING' | 'RESOLVED';
}

export interface RunnerState {
  paused: boolean;
  activeLeaseOwner?: string;
  leaseAcquiredAt?: string;
  leaseExpiresAt?: string;
  restartCount?: number;
  lastRestartWindowStart?: string;
  supervisorStatus?: 'HEALTHY' | 'RUNNER_RESTART_LIMIT_REACHED';
}

export interface UsageRecord {
  inputTokens: number;
  outputTokens: number;
  model: string;
  timestamp: string;
  taskId: string;
  responseId?: string;
  callCategory?: 'QUEUE_LUNA' | 'QUEUE_SOL' | 'MANUAL_LUNA' | 'MANUAL_SOL';
}

export interface UsageState {
  dailyLunaCount: number;
  dailySolCount: number;
  queueLunaCalls: number;
  queueSolCalls: number;
  forensicLunaCalls: number;
  forensicSolCalls: number;
  totalOpenAiCalls: number;
  lastResetDate: string; // YYYY-MM-DD
  records: UsageRecord[];
}

export interface ControlHubState {
  version: string;
  lastUpdated: string;
  tasks: QueueTask[];
}

