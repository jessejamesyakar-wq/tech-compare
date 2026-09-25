import execSync from 'child_process';
import crypto from 'crypto';
import { AntigravityAnalysis } from './antigravityAnalysis';
import { CONFIG } from './config';
import { validateTaskGovernance } from './governance';
import { LocalTaskExecutor } from './localExecutor';
import { OpenAIReviewer } from './openaiReviewer';
import { redactSecrets } from './secretRedactor';
import { TaskStore } from './taskStore';
import { GreenTaskType, ReviewPackage, RiskLevel, TaskRecord, TaskState, TaskType } from './types';
import { WorktreeManager } from './worktreeManager';

export class Orchestrator {
  private taskStore: TaskStore;
  private worktreeManager: WorktreeManager;
  private localExecutor: LocalTaskExecutor;
  private antigravityAnalysis: AntigravityAnalysis;
  private openaiReviewer: OpenAIReviewer;

  constructor(
    taskStore?: TaskStore,
    worktreeManager?: WorktreeManager,
    localExecutor?: LocalTaskExecutor,
    antigravityAnalysis?: AntigravityAnalysis,
    openaiReviewer?: OpenAIReviewer
  ) {
    this.taskStore = taskStore || new TaskStore();
    this.worktreeManager = worktreeManager || new WorktreeManager();
    this.localExecutor = localExecutor || new LocalTaskExecutor();
    this.antigravityAnalysis = antigravityAnalysis || new AntigravityAnalysis();
    this.openaiReviewer = openaiReviewer || new OpenAIReviewer();
  }

  public async submitAndExecuteTask(type: TaskType, risk: RiskLevel, instruction: string): Promise<TaskRecord> {
    const taskId = `task_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();

    const initialRecord: TaskRecord = {
      taskId,
      type,
      risk,
      priority: 'NORMAL',
      instruction: redactSecrets(instruction),
      status: 'PENDING',
      dependencies: [],
      createdAt,
      attempts: 0
    };

    this.taskStore.addTask(initialRecord);

    // Step 1: Risk & Governance Gating BEFORE worktree/process/API creation
    const governanceCheck = validateTaskGovernance(type, risk);
    if (!governanceCheck.ok) {
      const blockedRecord = this.taskStore.updateTask(taskId, {
        status: 'BLOCKED',
        completedAt: new Date().toISOString(),
        failureClassification: governanceCheck.reason || 'TASK_REQUIRES_HIGHER_GOVERNANCE',
        commandOutput: '[GOVERNANCE_REJECTION] Risk level or task type requires higher approval before execution.'
      })!;
      return blockedRecord;
    }

    // Step 2: Create isolated Git worktree under C:\Projects\aceleetme-agent-workspaces\<taskId>
    const startedAt = new Date().toISOString();
    let workspacePath = '';
    let originMainHead = '';

    try {
      const worktreeInfo = this.worktreeManager.createTaskWorktree(taskId);
      workspacePath = worktreeInfo.workspacePath;
      originMainHead = worktreeInfo.originMainHead;

      this.taskStore.updateTask(taskId, {
        status: 'RUNNING',
        startedAt,
        workspacePath,
        originMainHead
      });
    } catch (err: any) {
      const failedRecord = this.taskStore.updateTask(taskId, {
        status: 'FAILED',
        startedAt,
        completedAt: new Date().toISOString(),
        failureClassification: `WORKTREE_CREATION_FAILED: ${redactSecrets(err.message)}`
      })!;
      return failedRecord;
    }

    // Step 3: Execute task commands inside isolated worktree
    let execResult: { exitCode: number; output: string; dependenciesState?: string };
    try {
      execResult = this.localExecutor.executeTaskInWorktree(type as GreenTaskType, workspacePath, originMainHead);
    } catch (err: any) {
      this.worktreeManager.removeTaskWorktree(workspacePath);
      const failedRecord = this.taskStore.updateTask(taskId, {
        status: 'FAILED',
        completedAt: new Date().toISOString(),
        attempts: 1,
        failureClassification: `LOCAL_EXECUTION_ERROR: ${redactSecrets(err.message)}`
      })!;
      return failedRecord;
    }

    // Step 4: Read-Only Violation Detector
    const readOnlyCheck = this.worktreeManager.checkReadOnlyViolation(workspacePath);
    let failureClassification: string | undefined = undefined;

    if (!readOnlyCheck.clean) {
      failureClassification = `READONLY_VIOLATION: Tracked file modifications detected: ${readOnlyCheck.modifiedFiles.join(', ')}`;
    }

    // Step 5: Optional Antigravity Analysis over sanitized command evidence
    let analysisResultText: string | undefined = undefined;
    if (type === 'REPOSITORY_INSPECTION' && execResult.exitCode === 0 && readOnlyCheck.clean) {
      try {
        analysisResultText = await this.antigravityAnalysis.analyzeInspectionResult(execResult.output);
      } catch (err: any) {
        analysisResultText = `[ANTIGRAVITY_ANALYSIS] Skipped due to error: ${redactSecrets(err.message)}`;
      }
    }

    // Step 6: Safe Worktree Cleanup
    const cleanupResult = this.worktreeManager.removeTaskWorktree(workspacePath);
    if (!cleanupResult.success) {
      failureClassification = failureClassification
        ? `${failureClassification} | CLEANUP_WARNING: ${cleanupResult.error}`
        : `CLEANUP_WARNING: ${cleanupResult.error}`;
    }

    // Step 7: Verify Canonical Repo Safety
    this.verifyCanonicalRepoCleanliness();

    // Step 8: OpenAI Reviewer Evaluation
    const reviewPkg: ReviewPackage = {
      taskId,
      taskType: type,
      risk,
      canonicalHead: originMainHead || 'UNVERIFIED',
      workspaceHead: originMainHead || 'UNVERIFIED',
      commandResults: execResult.output,
      typecheckResult: type === 'TYPECHECK' ? (execResult.exitCode === 0 ? 'PASS' : 'FAIL') : undefined,
      buildResult: type === 'BUILD' ? (execResult.exitCode === 0 ? 'PASS' : 'FAIL') : undefined,
      testResults: type === 'TEST' ? (execResult.exitCode === 0 ? 'PASS' : 'FAIL') : undefined,
      readOnlyViolation: !readOnlyCheck.clean,
      failureClassification,
      antigravityAnalysis: analysisResultText
    };

    const dualReview = await this.openaiReviewer.reviewTask(reviewPkg);

    let finalTaskStatus: TaskState = 'COMPLETED';
    if (dualReview.finalDecision === 'PASS_GREEN') {
      finalTaskStatus = 'COMPLETED';
    } else if (dualReview.finalDecision === 'PASS_WITH_LIMITATION') {
      finalTaskStatus = 'COMPLETED_WITH_LIMITATION';
    } else if (dualReview.finalDecision === 'OWNER_DECISION_REQUIRED') {
      finalTaskStatus = 'OWNER_DECISION_REQUIRED';
    } else {
      finalTaskStatus = 'FAILED';
    }

    const completedAt = new Date().toISOString();
    const finalRecord = this.taskStore.updateTask(taskId, {
      status: finalTaskStatus,
      completedAt,
      attempts: 1,
      commandOutput: redactSecrets(execResult.output),
      analysisResult: analysisResultText ? redactSecrets(analysisResultText) : undefined,
      readOnlyViolation: !readOnlyCheck.clean,
      failureClassification,
      reviewResult: dualReview.lunaReview,
      solReviewResult: dualReview.solReview,
      reviewerDecision: dualReview.finalDecision
    })!;

    return finalRecord;
  }

  private verifyCanonicalRepoCleanliness(): void {
    try {
      const output = execSync.execSync('git status --short', { cwd: CONFIG.CANONICAL_REPO_PATH, encoding: 'utf-8', windowsHide: true }).trim();
      if (output.length > 0) {
        console.warn(`[CANONICAL_SAFETY_WARNING] Canonical repo has modifications:\n${output}`);
      }
    } catch {
      // Ignore
    }
  }

  public getTaskState(taskId: string): TaskRecord | undefined {
    return this.taskStore.getTask(taskId);
  }

  public getAllTasks(): TaskRecord[] {
    return this.taskStore.getAllTasks();
  }
}
