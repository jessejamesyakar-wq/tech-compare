import execSync from 'child_process';
import crypto from 'crypto';
import { AntigravityAnalysis } from './antigravityAnalysis';
import { BudgetTracker } from './budgetTracker';
import { CONFIG } from './config';
import { validateTaskGovernance } from './governance';
import { LeaseManager } from './leaseManager';
import { LocalTaskExecutor } from './localExecutor';
import { OpenAIReviewer } from './openaiReviewer';
import { QueueStore } from './queueStore';
import { redactSecrets } from './secretRedactor';
import { TelegramNotifier } from './telegramNotifier';
import { GreenTaskType, OwnerDecisionItem, QueueTask, ReviewPackage, TaskPriority, TaskState } from './types';
import { WorktreeManager } from './worktreeManager';

export interface CycleSummary {
  processedCount: number;
  status: 'COMPLETED' | 'PAUSED' | 'RUNNER_ALREADY_ACTIVE';
  tasksProcessed: string[];
}

export class QueueRunner {
  private queueStore: QueueStore;
  private leaseManager: LeaseManager;
  private worktreeManager: WorktreeManager;
  private localExecutor: LocalTaskExecutor;
  private antigravityAnalysis: AntigravityAnalysis;
  private openaiReviewer: OpenAIReviewer;
  private telegramNotifier: TelegramNotifier;
  private runnerId: string;

  constructor(
    queueStore?: QueueStore,
    leaseManager?: LeaseManager,
    worktreeManager?: WorktreeManager,
    localExecutor?: LocalTaskExecutor,
    antigravityAnalysis?: AntigravityAnalysis,
    openaiReviewer?: OpenAIReviewer,
    telegramNotifier?: TelegramNotifier
  ) {
    this.queueStore = queueStore || new QueueStore();
    this.leaseManager = leaseManager || new LeaseManager(this.queueStore);
    this.worktreeManager = worktreeManager || new WorktreeManager();
    this.localExecutor = localExecutor || new LocalTaskExecutor();
    this.antigravityAnalysis = antigravityAnalysis || new AntigravityAnalysis();
    this.openaiReviewer = openaiReviewer || new OpenAIReviewer(undefined, undefined, undefined, new BudgetTracker(this.queueStore));
    this.telegramNotifier = telegramNotifier || new TelegramNotifier();
    this.runnerId = `runner_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  }

  public async runCycle(): Promise<CycleSummary> {
    // 1. Check Kill Switch
    const runnerState = this.queueStore.getRunnerState();
    if (runnerState.paused) {
      return { processedCount: 0, status: 'PAUSED', tasksProcessed: [] };
    }

    // 2. Acquire Lease
    const lease = this.leaseManager.acquireLease(this.runnerId);
    if (!lease.acquired) {
      return { processedCount: 0, status: 'RUNNER_ALREADY_ACTIVE', tasksProcessed: [] };
    }

    const tasksProcessed: string[] = [];
    try {
      // 3. Crash Recovery for interrupted tasks
      this.leaseManager.recoverInterruptedTasks(this.worktreeManager);

      // 4. Process up to MAX_TASKS_PER_RUNNER_CYCLE tasks
      while (tasksProcessed.length < CONFIG.MAX_TASKS_PER_RUNNER_CYCLE) {
        if (this.queueStore.getRunnerState().paused) {
          break;
        }

        this.resolveDependencies();
        const nextTask = this.selectNextExecutableTask();
        if (!nextTask) {
          break; // No more executable tasks in this cycle
        }

        await this.processSingleTask(nextTask);
        tasksProcessed.push(nextTask.taskId);
      }
    } finally {
      this.leaseManager.releaseLease(this.runnerId);
    }

    return {
      processedCount: tasksProcessed.length,
      status: 'COMPLETED',
      tasksProcessed
    };
  }

  private resolveDependencies(): void {
    const allTasks = this.queueStore.getQueueTasks();
    const taskMap = new Map<string, QueueTask>(allTasks.map(t => [t.taskId, t]));

    for (const task of allTasks) {
      if (task.status !== 'PENDING') continue;

      if (!task.dependencies || task.dependencies.length === 0) continue;

      let blocked = false;
      let blockingReason = '';

      for (const depId of task.dependencies) {
        const depTask = taskMap.get(depId);
        if (!depTask) {
          blocked = true;
          blockingReason = `Dependency ${depId} does not exist`;
          break;
        }

        if (depTask.status === 'FAILED' || depTask.status === 'BLOCKED' || depTask.status === 'BLOCKED_BY_DEPENDENCY' || depTask.status === 'CANCELLED' || depTask.status === 'OWNER_DECISION_REQUIRED') {
          blocked = true;
          blockingReason = `Dependency ${depId} failed or blocked with status ${depTask.status}`;
          break;
        }

        if (depTask.status !== 'COMPLETED' && depTask.status !== 'COMPLETED_WITH_LIMITATION') {
          // Still pending or running
          blocked = true;
          break;
        }
      }

      if (blocked && blockingReason) {
        this.queueStore.updateQueueTask(task.taskId, {
          status: 'BLOCKED_BY_DEPENDENCY',
          failureClassification: blockingReason
        });
      }
    }
  }

  private selectNextExecutableTask(): QueueTask | undefined {
    const allTasks = this.queueStore.getQueueTasks();
    const eligible = allTasks.filter(task => {
      if (task.status !== 'PENDING') return false;

      // Check dependencies
      if (task.dependencies && task.dependencies.length > 0) {
        const allCompleted = task.dependencies.every(depId => {
          const dep = allTasks.find(t => t.taskId === depId);
          return dep && (dep.status === 'COMPLETED' || dep.status === 'COMPLETED_WITH_LIMITATION');
        });
        if (!allCompleted) return false;
      }
      return true;
    });

    if (eligible.length === 0) return undefined;

    const priorityWeights: Record<TaskPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      NORMAL: 2,
      LOW: 1
    };

    eligible.sort((a, b) => {
      const weightA = priorityWeights[a.priority] || 2;
      const weightB = priorityWeights[b.priority] || 2;
      if (weightA !== weightB) return weightB - weightA;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    return eligible[0];
  }

  private async processSingleTask(task: QueueTask): Promise<void> {
    // Check Risk Gating BEFORE Worktree Creation
    const govCheck = validateTaskGovernance(task.type, task.risk);
    if (!govCheck.ok) {
      this.queueStore.updateQueueTask(task.taskId, {
        status: 'OWNER_DECISION_REQUIRED',
        completedAt: new Date().toISOString(),
        failureClassification: govCheck.reason || 'TASK_REQUIRES_HIGHER_GOVERNANCE',
        commandOutput: '[GOVERNANCE_REJECTION] Risk level or task type requires higher approval before execution.'
      });

      if (task.risk === 'RED') {
        const decision: OwnerDecisionItem = {
          decisionId: `dec_${task.taskId}`,
          taskId: task.taskId,
          createdAt: new Date().toISOString(),
          shortTitle: `High Risk Task Approval: ${task.type}`,
          reason: `Task ${task.taskId} (${task.type}) is classified as RED risk and requires owner approval before execution.`,
          optionA: 'Approve execution in isolated worktree',
          optionB: 'Reject task and cancel',
          safeDefault: 'Keep BLOCKED in owner decision inbox',
          riskIfNoDecision: 'High risk task remains pending owner authorization.',
          status: 'PENDING'
        };
        this.queueStore.addOwnerDecision(decision);
        await this.telegramNotifier.notifyOwnerDecisionRequired(task, decision);
      }

      return;
    }

    // Process GREEN task inside isolated worktree
    const startedAt = new Date().toISOString();
    this.queueStore.updateQueueTask(task.taskId, {
      status: 'RUNNING',
      startedAt
    });

    let workspacePath = '';
    let originMainHead = '';

    try {
      const info = this.worktreeManager.createTaskWorktree(task.taskId);
      workspacePath = info.workspacePath;
      originMainHead = info.originMainHead;

      this.queueStore.updateQueueTask(task.taskId, {
        workspacePath,
        canonicalHead: originMainHead,
        workspaceHead: originMainHead
      });
    } catch (err: any) {
      const failMsg = `WORKTREE_CREATION_FAILED: ${redactSecrets(err.message)}`;
      this.queueStore.updateQueueTask(task.taskId, {
        status: 'FAILED',
        completedAt: new Date().toISOString(),
        failureClassification: failMsg
      });
      await this.telegramNotifier.notifyCriticalError(task.taskId, failMsg);
      return;
    }

    // Verify Repository Identity
    const verifiedHeadMatch = originMainHead && originMainHead.length === 40;
    if (!verifiedHeadMatch) {
      const failMsg = 'BLOCKED_BY_REPOSITORY_IDENTITY: Head mismatch or unverified commit';
      this.worktreeManager.removeTaskWorktree(workspacePath);
      this.queueStore.updateQueueTask(task.taskId, {
        status: 'BLOCKED_BY_REPOSITORY_IDENTITY',
        completedAt: new Date().toISOString(),
        failureClassification: failMsg
      });
      await this.telegramNotifier.notifyCriticalError(task.taskId, failMsg);
      return;
    }

    // Execute Local Command
    let execResult: { exitCode: number; output: string };
    try {
      execResult = this.localExecutor.executeTaskInWorktree(task.type as GreenTaskType, workspacePath, originMainHead);
    } catch (err: any) {
      const failMsg = `LOCAL_EXECUTION_ERROR: ${redactSecrets(err.message)}`;
      this.worktreeManager.removeTaskWorktree(workspacePath);
      this.queueStore.updateQueueTask(task.taskId, {
        status: 'FAILED',
        completedAt: new Date().toISOString(),
        attempts: 1,
        failureClassification: failMsg
      });
      await this.telegramNotifier.notifyCriticalError(task.taskId, failMsg);
      return;
    }

    // Read-Only Violation Check
    const readOnlyCheck = this.worktreeManager.checkReadOnlyViolation(workspacePath);
    let failureClassification: string | undefined = undefined;
    if (!readOnlyCheck.clean) {
      failureClassification = `READONLY_VIOLATION: Tracked file modifications detected: ${readOnlyCheck.modifiedFiles.join(', ')}`;
    }

    // Optional Antigravity Analysis
    let analysisText: string | undefined = undefined;
    if (task.type === 'REPOSITORY_INSPECTION' && execResult.exitCode === 0 && readOnlyCheck.clean) {
      try {
        analysisText = await this.antigravityAnalysis.analyzeInspectionResult(execResult.output);
      } catch (err: any) {
        analysisText = `[ANTIGRAVITY_ANALYSIS] Skipped due to error: ${redactSecrets(err.message)}`;
      }
    }

    // Safe Cleanup
    const cleanupResult = this.worktreeManager.removeTaskWorktree(workspacePath);
    if (!cleanupResult.success) {
      failureClassification = failureClassification
        ? `${failureClassification} | CLEANUP_WARNING: ${cleanupResult.error}`
        : `CLEANUP_WARNING: ${cleanupResult.error}`;
    }

    this.verifyCanonicalRepoCleanliness();

    // Check Local Execution Success
    const isExecutionSuccess = execResult.exitCode === 0 && readOnlyCheck.clean;

    if (!isExecutionSuccess) {
      this.queueStore.updateQueueTask(task.taskId, {
        status: 'FAILED',
        completedAt: new Date().toISOString(),
        attempts: 1,
        commandOutput: redactSecrets(execResult.output),
        analysisResult: analysisText ? redactSecrets(analysisText) : undefined,
        readOnlyViolation: !readOnlyCheck.clean,
        failureClassification
      });
      await this.telegramNotifier.notifyCriticalError(task.taskId, failureClassification || 'LOCAL_EXECUTION_FAILED');
      return;
    }

    // Update Status to REVIEWING
    this.queueStore.updateQueueTask(task.taskId, {
      status: 'REVIEWING',
      commandOutput: redactSecrets(execResult.output),
      analysisResult: analysisText ? redactSecrets(analysisText) : undefined,
      readOnlyViolation: !readOnlyCheck.clean
    });

    // OpenAI Reviewer Step
    const reviewPkg: ReviewPackage = {
      taskId: task.taskId,
      taskType: task.type,
      risk: task.risk,
      canonicalHead: originMainHead,
      workspaceHead: originMainHead,
      commandResults: execResult.output,
      typecheckResult: task.type === 'TYPECHECK' ? (execResult.exitCode === 0 ? 'PASS' : 'FAIL') : undefined,
      buildResult: task.type === 'BUILD' ? (execResult.exitCode === 0 ? 'PASS' : 'FAIL') : undefined,
      testResults: task.type === 'TEST' ? (execResult.exitCode === 0 ? 'PASS' : 'FAIL') : undefined,
      readOnlyViolation: !readOnlyCheck.clean,
      failureClassification,
      antigravityAnalysis: analysisText
    };

    const dualReview = await this.openaiReviewer.reviewTask(reviewPkg);
    const decision = dualReview.finalDecision;

    let finalState: TaskState = 'COMPLETED';
    let limitationsList: string[] | undefined = undefined;
    let ownerReason: string | undefined = undefined;

    if (decision === 'PASS_GREEN') {
      finalState = 'COMPLETED';
    } else if (decision === 'PASS_WITH_LIMITATION') {
      limitationsList = dualReview.lunaReview.limitations;
      const requiresOwnerAction = dualReview.lunaReview.limitations.some(l =>
        l.toUpperCase().includes('PRODUCTION') ||
        l.toUpperCase().includes('OWNER') ||
        l.toUpperCase().includes('AUTH') ||
        l.toUpperCase().includes('MUTATION')
      );
      if (requiresOwnerAction || dualReview.lunaReview.escalationRequired) {
        finalState = 'OWNER_DECISION_REQUIRED';
        ownerReason = dualReview.lunaReview.summary;
      } else {
        finalState = 'COMPLETED_WITH_LIMITATION';
      }
    } else if (decision === 'OWNER_DECISION_REQUIRED') {
      finalState = 'OWNER_DECISION_REQUIRED';
      ownerReason = dualReview.lunaReview.summary;
    } else if (decision === 'REVIEWER_UNAVAILABLE') {
      finalState = 'BLOCKED';
      failureClassification = `REVIEWER_UNAVAILABLE: ${dualReview.lunaReview.summary}`;
      if (dualReview.lunaReview.limitations.includes('OPENAI_DAILY_REVIEW_LIMIT_REACHED')) {
        await this.telegramNotifier.notifyOpenAiBudgetExhausted();
      } else {
        await this.telegramNotifier.notifyCriticalError(task.taskId, failureClassification);
      }
    } else {
      finalState = 'FAILED';
      failureClassification = `FAIL_REVIEW: ${dualReview.lunaReview.summary}`;
      await this.telegramNotifier.notifyCriticalError(task.taskId, failureClassification);
    }

    if (finalState === 'OWNER_DECISION_REQUIRED') {
      const decisionItem: OwnerDecisionItem = {
        decisionId: `dec_${task.taskId}`,
        taskId: task.taskId,
        createdAt: new Date().toISOString(),
        shortTitle: `Reviewer Escalation: ${task.type}`,
        reason: ownerReason || dualReview.lunaReview.summary,
        optionA: 'Approve reviewer recommendation and proceed',
        optionB: 'Reject recommendation and cancel task',
        safeDefault: 'Keep BLOCKED until manual owner review',
        riskIfNoDecision: 'Task remains pending owner approval.',
        status: 'PENDING'
      };
      this.queueStore.addOwnerDecision(decisionItem);
      await this.telegramNotifier.notifyOwnerDecisionRequired(task, decisionItem);
    }

    const completedAt = new Date().toISOString();
    this.queueStore.updateQueueTask(task.taskId, {
      status: finalState,
      completedAt,
      attempts: 1,
      reviewResult: dualReview.lunaReview,
      solReviewResult: dualReview.solReview,
      reviewerDecision: decision,
      limitations: limitationsList,
      ownerDecisionReason: ownerReason,
      failureClassification
    });
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
}
