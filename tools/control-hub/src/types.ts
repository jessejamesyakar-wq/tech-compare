export type TaskState = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'REVIEWED_COMPLETE' | 'FAILED' | 'BLOCKED';

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

export interface TaskRecord {
  taskId: string;
  type: TaskType;
  risk: RiskLevel;
  instruction: string;
  status: TaskState;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  workspacePath?: string;
  originMainHead?: string;
  attempts: number;
  commandOutput?: string;
  analysisResult?: string;
  readOnlyViolation?: boolean;
  failureClassification?: string;
  reviewResult?: StructuredReviewResult;
  solReviewResult?: StructuredReviewResult;
  reviewerDecision?: ReviewerDecision;
}

export interface TaskExecutionResult {
  success: boolean;
  status: TaskState;
  commandOutput?: string;
  analysisResult?: string;
  workspacePath?: string;
  originMainHead?: string;
  readOnlyViolation?: boolean;
  failureClassification?: string;
  attempts: number;
  reviewResult?: StructuredReviewResult;
  solReviewResult?: StructuredReviewResult;
  reviewerDecision?: ReviewerDecision;
}

export interface ControlHubState {
  version: string;
  lastUpdated: string;
  tasks: TaskRecord[];
}
