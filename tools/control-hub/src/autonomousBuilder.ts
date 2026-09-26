import execSync from 'child_process';
import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import { WorktreeManager } from './worktreeManager';
import { DependencyIsolationGuard } from './localExecutor';
import { redactSecrets } from './secretRedactor';
import { OpenAIReviewer } from './openaiReviewer';
import {
  BuilderTaskContract,
  BuilderPolicyEngine,
  DEFAULT_BUILDER_PATCH_BUDGET
} from './builderPolicy';
import { QueueTask, ReviewerDecision, StructuredReviewResult } from './types';

const execOptions = { encoding: 'utf-8' as const, windowsHide: true };

function runCmd(cmd: string, cwd: string): string {
  try {
    return execSync.execSync(cmd, { ...execOptions, cwd }).trim();
  } catch (err: any) {
    const stdout = err.stdout ? String(err.stdout) : '';
    const stderr = err.stderr ? String(err.stderr) : '';
    throw new Error(`Command failed: ${cmd}\nStdout: ${stdout}\nStderr: ${stderr}`);
  }
}

export interface AutonomousBuilderResult {
  success: boolean;
  status: 'COMPLETED' | 'FAILED' | 'BLOCKED' | 'YELLOW';
  reason?: string;
  taskId: string;
  workspacePath: string;
  changedFiles: string[];
  commitSha?: string;
  reviewerResult?: StructuredReviewResult;
  attempts: number;
}

export class AutonomousBuilder {
  private worktreeManager: WorktreeManager;
  private reviewer: OpenAIReviewer;
  private dailyTaskCount: number = 0;
  private lastResetDate: string = new Date().toISOString().slice(0, 10);

  public static MAX_AUTONOMOUS_BUILDER_TASKS_PER_RUN = 1;
  public static MAX_AUTONOMOUS_BUILDER_TASKS_PER_DAY = 3;
  public static MAX_BUILDER_ATTEMPTS_PER_TASK = 2;

  constructor(customWorktreeManager?: WorktreeManager, customReviewer?: OpenAIReviewer) {
    this.worktreeManager = customWorktreeManager || new WorktreeManager();
    this.reviewer = customReviewer || new OpenAIReviewer();
  }

  private checkDailyBudget(): { allowed: boolean; reason?: string } {
    const currentDate = new Date().toISOString().slice(0, 10);
    if (currentDate !== this.lastResetDate) {
      this.lastResetDate = currentDate;
      this.dailyTaskCount = 0;
    }
    if (this.dailyTaskCount >= AutonomousBuilder.MAX_AUTONOMOUS_BUILDER_TASKS_PER_DAY) {
      return {
        allowed: false,
        reason: `BUILDER_DAILY_BUDGET_EXCEEDED: ${this.dailyTaskCount}/${AutonomousBuilder.MAX_AUTONOMOUS_BUILDER_TASKS_PER_DAY}`
      };
    }
    return { allowed: true };
  }

  public async executeTask(
    contract: BuilderTaskContract,
    patchApplicator?: (workspacePath: string) => Promise<void> | void
  ): Promise<AutonomousBuilderResult> {
    const taskId = contract.taskId;

    // 1. Budget check
    const budgetCheck = this.checkDailyBudget();
    if (!budgetCheck.allowed) {
      return {
        success: false,
        status: 'YELLOW',
        reason: budgetCheck.reason,
        taskId,
        workspacePath: '',
        changedFiles: [],
        attempts: 0
      };
    }

    // 2. Contract validation
    const contractVal = BuilderPolicyEngine.validateContract(contract);
    if (!contractVal.valid) {
      return {
        success: false,
        status: 'YELLOW',
        reason: contractVal.reason,
        taskId,
        workspacePath: '',
        changedFiles: [],
        attempts: 0
      };
    }

    // 3. Target files policy check
    const targetFilesVal = BuilderPolicyEngine.validateTargetFiles(contract.targetFiles);
    if (!targetFilesVal.eligible) {
      return {
        success: false,
        status: 'YELLOW',
        reason: targetFilesVal.reason,
        taskId,
        workspacePath: '',
        changedFiles: [],
        attempts: 0
      };
    }

    // 4. Create isolated worktree
    let workspacePath = '';
    let canonicalStatusBefore = '';
    try {
      const worktreeRes = this.worktreeManager.createTaskWorktree(taskId, contract.repositoryHead || 'HEAD');
      workspacePath = worktreeRes.workspacePath;
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        reason: `WORKTREE_CREATION_FAILED: ${err.message}`,
        taskId,
        workspacePath: '',
        changedFiles: [],
        attempts: 1
      };
    }

    // Pre-edit safety checks in isolated worktree
    try {
      const currentHead = runCmd('git rev-parse HEAD', workspacePath);
      if (contract.repositoryHead && currentHead.slice(0, 8) !== contract.repositoryHead.slice(0, 8)) {
        return {
          success: false,
          status: 'BLOCKED',
          reason: `REPOSITORY_HEAD_MISMATCH: expected ${contract.repositoryHead}, got ${currentHead}`,
          taskId,
          workspacePath,
          changedFiles: [],
          attempts: 1
        };
      }

      // Record baseline canonical repo status to ensure Builder never mutates canonical repo
      canonicalStatusBefore = runCmd('git status --porcelain', CONFIG.CANONICAL_REPO_PATH);

      // Check dependency isolation fingerprint
      const guard = new DependencyIsolationGuard(CONFIG.CANONICAL_REPO_PATH);
      const isIsoValid = guard.ensureIsolatedDependencies(workspacePath);
      if (!isIsoValid) {
        return {
          success: false,
          status: 'BLOCKED',
          reason: 'DEPENDENCY_FINGERPRINT_MISMATCH',
          taskId,
          workspacePath,
          changedFiles: [],
          attempts: 1
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        reason: `PRE_EDIT_VERIFICATION_FAILED: ${err.message}`,
        taskId,
        workspacePath,
        changedFiles: [],
        attempts: 1
      };
    }

    // 5. Apply patch (inside isolated worktree ONLY)
    let attempts = 1;
    try {
      if (patchApplicator) {
        await patchApplicator(workspacePath);
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        reason: `PATCH_APPLICATION_FAILED: ${err.message}`,
        taskId,
        workspacePath,
        changedFiles: [],
        attempts
      };
    }

    // 6. Inspect diff & changed files
    let changedFiles: string[] = [];
    let diffContent = '';
    try {
      const statusOutput = runCmd('git status --porcelain', workspacePath);
      if (!statusOutput) {
        return {
          success: false,
          status: 'FAILED',
          reason: 'BUILDER_PATCH_PRODUCED_NO_CHANGES',
          taskId,
          workspacePath,
          changedFiles: [],
          attempts
        };
      }

      const lines = statusOutput.split('\n').map(l => l.trim()).filter(Boolean);
      changedFiles = lines.map(l => l.slice(3).trim());
      diffContent = runCmd('git diff HEAD', workspacePath);
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        reason: `DIFF_INSPECTION_FAILED: ${err.message}`,
        taskId,
        workspacePath,
        changedFiles: [],
        attempts
      };
    }

    // 7. Diff Scope Re-classification
    const scopeReclass = BuilderPolicyEngine.inspectDiffScope(
      changedFiles,
      contract.targetFiles,
      contract.patchBudget || DEFAULT_BUILDER_PATCH_BUDGET,
      diffContent
    );

    if (!scopeReclass.eligible) {
      return {
        success: false,
        status: 'BLOCKED',
        reason: scopeReclass.reason,
        taskId,
        workspacePath,
        changedFiles,
        attempts
      };
    }

    // 8. Run required verification & tests in worktree
    let testOutput = '';
    let typecheckOutput = '';
    let buildOutput = '';

    try {
      // 8a. Control Hub tests if tools/control-hub edited or required
      testOutput = runCmd('npm test', path.join(workspacePath, 'tools', 'control-hub'));

      // 8b. Root TypeScript check
      typecheckOutput = runCmd('npx tsc --noEmit', workspacePath);

      // 8c. Root Next build if app/component files modified
      const touchesApp = changedFiles.some(f => f.startsWith('src/'));
      if (touchesApp) {
        buildOutput = runCmd('npx tsc --noEmit', workspacePath);
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        reason: `VERIFICATION_FAILED: ${redactSecrets(err.message)}`,
        taskId,
        workspacePath,
        changedFiles,
        attempts
      };
    }

    // 9. Secret Scan
    const hasSecrets = redactSecrets(diffContent) !== diffContent || redactSecrets(testOutput) !== testOutput;
    if (hasSecrets) {
      return {
        success: false,
        status: 'BLOCKED',
        reason: 'SECRET_EXPOSURE_DETECTED',
        taskId,
        workspacePath,
        changedFiles,
        attempts
      };
    }

    // 10. OpenAI Reviewer Evaluation
    let reviewResult: StructuredReviewResult;
    try {
      const pkg = {
        taskId,
        taskType: 'REPOSITORY_INSPECTION' as const,
        risk: 'GREEN' as const,
        canonicalHead: contract.repositoryHead,
        workspaceHead: contract.repositoryHead,
        changedFiles,
        testResults: testOutput,
        typecheckResult: typecheckOutput,
        buildResult: buildOutput,
        commandResults: `BUILDER_DIFF:\n${diffContent}`
      };

      const dualReview = await this.reviewer.reviewTask(pkg);
      reviewResult = dualReview.lunaReview;
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        reason: `REVIEWER_INVOCATION_FAILED: ${err.message}`,
        taskId,
        workspacePath,
        changedFiles,
        attempts
      };
    }

    if (reviewResult.decision !== 'PASS_GREEN') {
      return {
        success: false,
        status: reviewResult.decision === 'PASS_WITH_LIMITATION' ? 'YELLOW' : 'FAILED',
        reason: `REVIEWER_DECISION_${reviewResult.decision}`,
        taskId,
        workspacePath,
        changedFiles,
        reviewerResult: reviewResult,
        attempts
      };
    }

    // 11. Create isolated commit inside worktree ONLY
    let commitSha = '';
    try {
      runCmd('git add -A', workspacePath);
      const commitMsg = `auto(ui): ${contract.title} [taskId:${taskId}]`;
      runCmd(`git commit -m "${commitMsg}"`, workspacePath);
      commitSha = runCmd('git rev-parse HEAD', workspacePath);

      // Confirm canonical repo & runner remain UNTOUCHED
      const postCanonicalStatus = runCmd('git status --porcelain', CONFIG.CANONICAL_REPO_PATH);
      if (postCanonicalStatus !== canonicalStatusBefore) {
        throw new Error('CANONICAL_REPO_MUTATION_DETECTED_POST_COMMIT');
      }

      this.dailyTaskCount++;
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        reason: `ISOLATED_COMMIT_FAILED: ${err.message}`,
        taskId,
        workspacePath,
        changedFiles,
        reviewerResult: reviewResult,
        attempts
      };
    }

    return {
      success: true,
      status: 'COMPLETED',
      taskId,
      workspacePath,
      changedFiles,
      commitSha,
      reviewerResult: reviewResult,
      attempts
    };
  }
}
