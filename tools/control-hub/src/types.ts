export type TaskState = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'BLOCKED';

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

export interface TaskRecord {
  taskId: string;
  type: TaskType;
  risk: RiskLevel;
  instruction: string;
  status: TaskState;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  interactionId?: string;
  attempts: number;
  result?: string;
  failureClassification?: string;
}

export interface TaskExecutionResult {
  success: boolean;
  status: TaskState;
  outputText?: string;
  interactionId?: string;
  failureClassification?: string;
  attempts: number;
}

export interface ControlHubState {
  version: string;
  lastUpdated: string;
  tasks: TaskRecord[];
}
