import assert from 'node:assert';
import test, { describe } from 'node:test';
import path from 'path';
import fs from 'fs';

import { validateTaskGovernance } from '../src/governance';
import { redactObject, redactSecrets } from '../src/secretRedactor';
import { TaskStore } from '../src/taskStore';
import { WorktreeManager } from '../src/worktreeManager';
import { LocalTaskExecutor } from '../src/localExecutor';
import { Orchestrator } from '../src/orchestrator';
import { AntigravityAnalysis } from '../src/antigravityAnalysis';
import { OpenAIReviewer } from '../src/openaiReviewer';
import { QueueStore } from '../src/queueStore';
import { LeaseManager } from '../src/leaseManager';
import { BudgetTracker } from '../src/budgetTracker';
import { QueueRunner } from '../src/queueRunner';
import { CONFIG } from '../src/config';
import { QueueTask, ReviewPackage } from '../src/types';

describe('ACELEETME Control Hub V0.4 — Autonomous Queue Runner Test Suite', () => {

  const testDir = path.join(__dirname, 'v04_test_data');

  function getMockStores() {
    if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

    const qPath = path.join(testDir, `queue_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
    const rPath = path.join(testDir, `runner_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
    const oPath = path.join(testDir, `owner_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);
    const uPath = path.join(testDir, `usage_${Date.now()}_${Math.random().toString(36).slice(2)}.json`);

    const queueStore = new QueueStore(qPath, rPath, oPath, uPath);
    return { queueStore, qPath, rPath, oPath, uPath };
  }

  function cleanupTestFiles(...paths: string[]) {
    for (const p of paths) {
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch {}
      }
    }
  }

  test('1. Governance: GREEN task is accepted, YELLOW/RED rejected', () => {
    assert.strictEqual(validateTaskGovernance('REPOSITORY_INSPECTION', 'GREEN').ok, true);
    assert.strictEqual(validateTaskGovernance('PRODUCTION_DEPLOY' as any, 'RED').ok, false);
    assert.strictEqual(validateTaskGovernance('REPOSITORY_INSPECTION', 'YELLOW').ok, false);
  });

  test('2. Secret Redaction: Redacts OpenAI keys, Gemini keys, GitHub tokens and Bearer headers', () => {
    process.env.GEMINI_API_KEY = 'test_gemini_key_67890';
    process.env.OPENAI_API_KEY = 'sk-proj-test-secret-123456';
    process.env.ACELEETME_GITHUB_READ_TOKEN = 'test_github_token_fghij';

    const rawStr = 'Log with test_gemini_key_67890, sk-proj-test-secret-123456, test_github_token_fghij and Authorization: Bearer token_xyz';
    const redacted = redactSecrets(rawStr);

    assert.strictEqual(redacted.includes('test_gemini_key_67890'), false);
    assert.strictEqual(redacted.includes('sk-proj-test-secret-123456'), false);
    assert.strictEqual(redacted.includes('test_github_token_fghij'), false);
    assert.strictEqual(redacted.includes('token_xyz'), false);
    assert.strictEqual(redacted.includes('[REDACTED_GEMINI_API_KEY]'), true);
    assert.strictEqual(redacted.includes('[REDACTED_OPENAI_API_KEY]'), true);
    assert.strictEqual(redacted.includes('[REDACTED_ACELEETME_GITHUB_READ_TOKEN]'), true);
  });

  test('3. Priority Ordering: Selects higher priority tasks before low priority', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    queueStore.addQueueTask({
      taskId: 'task_low',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'LOW',
      instruction: 'Low task',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date(Date.now() - 10000).toISOString(),
      attempts: 0
    });

    queueStore.addQueueTask({
      taskId: 'task_critical',
      type: 'TYPECHECK',
      risk: 'GREEN',
      priority: 'CRITICAL',
      instruction: 'Critical task',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    let executedFirst = '';
    const mockExecutor = {
      executeTaskInWorktree: (type: any) => {
        if (!executedFirst) executedFirst = type;
        return { exitCode: 0, output: '[MOCK] OK' };
      }
    } as unknown as LocalTaskExecutor;

    const mockReviewer = {
      reviewTask: async () => ({
        lunaReview: { decision: 'PASS_GREEN' },
        finalDecision: 'PASS_GREEN',
        openAiCallCount: 1
      })
    } as unknown as OpenAIReviewer;

    const mockWorktree = {
      createTaskWorktree: (id: string) => ({ workspacePath: `/mock/${id}`, originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' }),
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, mockExecutor, undefined, mockReviewer);
    await runner.runCycle();

    assert.strictEqual(executedFirst, 'TYPECHECK', 'CRITICAL priority task must execute first');
    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('4. Dependency Ordering: Task B waits for Task A completion', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    queueStore.addQueueTask({
      taskId: 'task_A',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Task A',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    queueStore.addQueueTask({
      taskId: 'task_B',
      type: 'TYPECHECK',
      risk: 'GREEN',
      priority: 'CRITICAL',
      instruction: 'Task B depends on A',
      status: 'PENDING',
      dependencies: ['task_A'],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const executionOrder: string[] = [];
    const mockExecutor = {
      executeTaskInWorktree: (type: any) => {
        executionOrder.push(type);
        return { exitCode: 0, output: '[MOCK] OK' };
      }
    } as unknown as LocalTaskExecutor;

    const mockReviewer = {
      reviewTask: async () => ({
        lunaReview: { decision: 'PASS_GREEN' },
        finalDecision: 'PASS_GREEN',
        openAiCallCount: 1
      })
    } as unknown as OpenAIReviewer;

    const mockWorktree = {
      createTaskWorktree: (id: string) => ({ workspacePath: `/mock/${id}`, originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' }),
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, mockExecutor, undefined, mockReviewer);
    await runner.runCycle();

    assert.strictEqual(executionOrder[0], 'REPOSITORY_INSPECTION', 'Task A must execute before Task B');
    assert.strictEqual(executionOrder[1], 'TYPECHECK', 'Task B executes after Task A');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('5. RED Task Rejection & Owner Inbox Placement: RED task blocked without worktree or OpenAI call', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    queueStore.addQueueTask({
      taskId: 'task_red_001',
      type: 'PRODUCTION_DEPLOY' as any,
      risk: 'RED',
      priority: 'CRITICAL',
      instruction: 'Deploy to production',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    let worktreeCreated = false;
    let reviewerCalled = false;

    const mockWorktree = {
      createTaskWorktree: () => {
        worktreeCreated = true;
        return { workspacePath: '/mock/red', originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' };
      },
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const mockReviewer = {
      reviewTask: async () => {
        reviewerCalled = true;
        return { lunaReview: { decision: 'PASS_GREEN' }, finalDecision: 'PASS_GREEN', openAiCallCount: 1 };
      }
    } as unknown as OpenAIReviewer;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, undefined, undefined, mockReviewer);
    await runner.runCycle();

    const redTask = queueStore.getQueueTask('task_red_001');
    assert.strictEqual(worktreeCreated, false, 'No worktree for RED task');
    assert.strictEqual(reviewerCalled, false, 'No OpenAI reviewer call for RED task');
    assert.strictEqual(redTask?.status, 'OWNER_DECISION_REQUIRED');

    const decisions = queueStore.getOwnerDecisions();
    assert.strictEqual(decisions.length, 1, 'Owner decision item created for RED task');
    assert.strictEqual(decisions[0].taskId, 'task_red_001');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('6. Kill Switch: PAUSED state prevents new tasks from starting', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    queueStore.updateRunnerState({ paused: true });

    queueStore.addQueueTask({
      taskId: 'task_paused_001',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Inspection while paused',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const runner = new QueueRunner(queueStore);
    const summary = await runner.runCycle();

    assert.strictEqual(summary.status, 'PAUSED');
    assert.strictEqual(summary.processedCount, 0);

    const task = queueStore.getQueueTask('task_paused_001');
    assert.strictEqual(task?.status, 'PENDING', 'Task must remain PENDING while paused');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('7. Runner Lease & Concurrency: Second runner exits RUNNER_ALREADY_ACTIVE', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    const leaseMgr = new LeaseManager(queueStore);
    leaseMgr.acquireLease('runner_active_owner_123');

    const runner2 = new QueueRunner(queueStore);
    const summary = await runner2.runCycle();

    assert.strictEqual(summary.status, 'RUNNER_ALREADY_ACTIVE');
    assert.strictEqual(summary.processedCount, 0);

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('8. Crash Recovery: Detects crashed RUNNING/REVIEWING tasks and sets INTERRUPTED_PREVIOUS_RUN', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    queueStore.addQueueTask({
      taskId: 'task_crashed_001',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Task caught in crash',
      status: 'RUNNING',
      workspacePath: 'C:\\Projects\\aceleetme-agent-workspaces\\task_crashed_001',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 1
    });

    let cleanedWorktree = '';
    const mockWorktree = {
      removeTaskWorktree: (p: string) => {
        cleanedWorktree = p;
        return { success: true };
      }
    } as unknown as WorktreeManager;

    const leaseMgr = new LeaseManager(queueStore);
    leaseMgr.recoverInterruptedTasks(mockWorktree);

    const task = queueStore.getQueueTask('task_crashed_001');
    assert.strictEqual(task?.status, 'BLOCKED');
    assert.strictEqual(task?.failureClassification, 'INTERRUPTED_PREVIOUS_RUN');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('9. Deterministic Failure & Dependency Blocking: Failed TYPECHECK blocks dependent BUILD', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    queueStore.addQueueTask({
      taskId: 'task_typecheck_fail',
      type: 'TYPECHECK',
      risk: 'GREEN',
      priority: 'HIGH',
      instruction: 'Failing typecheck',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    queueStore.addQueueTask({
      taskId: 'task_build_dep',
      type: 'BUILD',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Build depending on typecheck',
      status: 'PENDING',
      dependencies: ['task_typecheck_fail'],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const mockExecutor = {
      executeTaskInWorktree: () => ({ exitCode: 1, output: 'Type error: Cannot find name foo' })
    } as unknown as LocalTaskExecutor;

    const mockWorktree = {
      createTaskWorktree: (id: string) => ({ workspacePath: `/mock/${id}`, originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' }),
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, mockExecutor);
    await runner.runCycle();

    const taskA = queueStore.getQueueTask('task_typecheck_fail');
    const taskB = queueStore.getQueueTask('task_build_dep');

    assert.strictEqual(taskA?.status, 'FAILED');
    assert.strictEqual(taskB?.status, 'BLOCKED_BY_DEPENDENCY');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('10. Daily Budget Caps: Reaches max Luna limit and returns REVIEWER_UNAVAILABLE', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    // Fill daily Luna count to max (10)
    queueStore.updateRunnerState({});
    const today = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(uPath, JSON.stringify({ dailyLunaCount: 10, dailySolCount: 0, lastResetDate: today, records: [] }), 'utf-8');

    const budget = new BudgetTracker(queueStore);
    assert.strictEqual(budget.canCallLuna(), false, 'Luna call must be disallowed when daily limit reached');

    const reviewer = new OpenAIReviewer('gpt-5.6-luna', 'gpt-5.6-sol', 'test_key', budget);
    const pkg: ReviewPackage = { taskId: 'task_cap_001', taskType: 'REPOSITORY_INSPECTION', risk: 'GREEN' };

    const res = await reviewer.reviewTask(pkg);
    assert.strictEqual(res.finalDecision, 'REVIEWER_UNAVAILABLE');
    assert.strictEqual(res.lunaReview.limitations.includes('OPENAI_DAILY_REVIEW_LIMIT_REACHED'), true);

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('11. Qualification Queue A/B/C/D End-to-End', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    // Task A: REPOSITORY_INSPECTION, GREEN, HIGH
    queueStore.addQueueTask({
      taskId: 'QUAL_TASK_A',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'HIGH',
      instruction: 'Repository inspection qualification',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    // Task B: TYPECHECK, GREEN, NORMAL, depends on A
    queueStore.addQueueTask({
      taskId: 'QUAL_TASK_B',
      type: 'TYPECHECK',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Typecheck qualification',
      status: 'PENDING',
      dependencies: ['QUAL_TASK_A'],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    // Task C: BUILD, GREEN, NORMAL, depends on B
    queueStore.addQueueTask({
      taskId: 'QUAL_TASK_C',
      type: 'BUILD',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Build qualification',
      status: 'PENDING',
      dependencies: ['QUAL_TASK_B'],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    // Task D: PRODUCTION_DEPLOY, RED, CRITICAL
    queueStore.addQueueTask({
      taskId: 'QUAL_TASK_D',
      type: 'PRODUCTION_DEPLOY' as any,
      risk: 'RED',
      priority: 'CRITICAL',
      instruction: 'Deploy qualification',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const mockExecutor = {
      executeTaskInWorktree: () => ({ exitCode: 0, output: '[MOCK_QUAL] Success' })
    } as unknown as LocalTaskExecutor;

    let lunaCallCount = 0;
    let solCallCount = 0;

    const mockReviewer = {
      reviewTask: async () => {
        lunaCallCount++;
        return {
          lunaReview: { decision: 'PASS_GREEN', modelUsed: 'gpt-5.6-luna', responseId: `resp_luna_${Date.now()}` },
          finalDecision: 'PASS_GREEN',
          openAiCallCount: 1
        };
      }
    } as unknown as OpenAIReviewer;

    const mockWorktree = {
      createTaskWorktree: (id: string) => ({ workspacePath: `/mock/${id}`, originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' }),
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, mockExecutor, undefined, mockReviewer);
    await runner.runCycle();

    const taskA = queueStore.getQueueTask('QUAL_TASK_A');
    const taskB = queueStore.getQueueTask('QUAL_TASK_B');
    const taskC = queueStore.getQueueTask('QUAL_TASK_C');
    const taskD = queueStore.getQueueTask('QUAL_TASK_D');

    assert.strictEqual(taskA?.status, 'COMPLETED');
    assert.strictEqual(taskB?.status, 'COMPLETED');
    assert.strictEqual(taskC?.status, 'COMPLETED');
    assert.strictEqual(taskD?.status, 'OWNER_DECISION_REQUIRED');

    assert.strictEqual(lunaCallCount, 3, 'Luna reviewer must be called 3 times (Task A, B, C)');
    assert.strictEqual(solCallCount, 0, 'Sol reviewer must be called 0 times');

    const ownerDecisions = queueStore.getOwnerDecisions();
    assert.strictEqual(ownerDecisions.some(d => d.taskId === 'QUAL_TASK_D'), true, 'Task D must appear in owner decision inbox');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('12. OpenAI Reviewer: Request construction and Luna default model routing', async () => {
    const reviewer = new OpenAIReviewer();
    const pkg: ReviewPackage = {
      taskId: 'task_luna_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      canonicalHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
      workspaceHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
      commandResults: '[LOCAL_EXECUTOR] package_name: tech-compare'
    };

    (reviewer as any).callResponsesApi = async (model: string) => ({
      decision: 'PASS_GREEN',
      summary: 'Clean',
      verifiedEvidenceUsed: ['canonicalHead'],
      limitations: [],
      risks: [],
      requiredNextAction: 'None',
      escalationRequired: false,
      modelUsed: model,
      responseId: 'resp_mock_luna'
    });

    const res = await reviewer.reviewTask(pkg);
    assert.strictEqual(res.finalDecision, 'PASS_GREEN');
    assert.strictEqual(res.lunaReview.responseId, 'resp_mock_luna');
    assert.strictEqual(res.lunaReview.modelUsed.includes('luna'), true);
    assert.strictEqual(res.openAiCallCount, 1);
  });

  test('13. OpenAI Reviewer: Sol escalation routing on uncertainty or owner decision', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const budgetTracker = new BudgetTracker(queueStore);
    const reviewer = new OpenAIReviewer('gpt-5.6-luna', 'gpt-5.6-sol', undefined, budgetTracker);
    const pkg: ReviewPackage = {
      taskId: 'task_sol_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      canonicalHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44'
    };

    (reviewer as any).callResponsesApi = async (model: string) => {
      if (model.includes('luna')) {
        return {
          decision: 'OWNER_DECISION_REQUIRED',
          summary: 'Uncertain',
          verifiedEvidenceUsed: [],
          limitations: ['UNCERTAIN_SCOPE'],
          risks: [],
          requiredNextAction: 'Escalate to Sol',
          escalationRequired: true,
          modelUsed: model,
          responseId: 'resp_luna_123'
        };
      } else {
        return {
          decision: 'PASS_GREEN',
          summary: 'Sol confirmed clean',
          verifiedEvidenceUsed: [],
          limitations: [],
          risks: [],
          requiredNextAction: 'Proceed',
          escalationRequired: false,
          modelUsed: model,
          responseId: 'resp_sol_456'
        };
      }
    };

    const res = await reviewer.reviewTask(pkg);
    assert.strictEqual(res.solReview !== undefined, true, 'Sol review must be present');
    assert.strictEqual(res.solReview?.modelUsed.includes('sol'), true);
    assert.strictEqual(res.openAiCallCount, 2);

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('14. OpenAI Reviewer: No automatic Sol escalation for clean PASS_GREEN', async () => {
    const reviewer = new OpenAIReviewer();
    const pkg: ReviewPackage = {
      taskId: 'task_no_sol_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN'
    };

    (reviewer as any).callResponsesApi = async (model: string) => ({
      decision: 'PASS_GREEN',
      summary: 'Clean evidence',
      verifiedEvidenceUsed: [],
      limitations: [],
      risks: [],
      requiredNextAction: 'None',
      escalationRequired: false,
      modelUsed: model,
      responseId: 'resp_luna_clean'
    });

    const res = await reviewer.reviewTask(pkg);
    assert.strictEqual(res.solReview, undefined, 'Sol review must NOT be called for clean PASS_GREEN');
    assert.strictEqual(res.openAiCallCount, 1);
  });

  test('15. OpenAI Reviewer: Deterministic failure (typecheckResult = FAIL) cannot become PASS_GREEN', async () => {
    const reviewer = new OpenAIReviewer();
    const pkg: ReviewPackage = {
      taskId: 'task_neg_001',
      taskType: 'TYPECHECK',
      risk: 'GREEN',
      typecheckResult: 'FAIL',
      failureClassification: 'TYPECHECK_ERROR: 2 errors found'
    };

    const parsed = (reviewer as any).parseReviewerJson(
      JSON.stringify({ decision: 'PASS_GREEN', summary: 'Overruled failed typecheck' }),
      'gpt-5.6-luna',
      'resp_mock_neg',
      pkg
    );

    assert.strictEqual(parsed.decision, 'FAIL_REVIEW', 'Deterministic failure must force FAIL_REVIEW');
  });

  test('16. OpenAI Reviewer: Missing evidence (canonicalHead = UNVERIFIED) remains UNVERIFIED', async () => {
    const reviewer = new OpenAIReviewer();
    const pkg: ReviewPackage = {
      taskId: 'task_missing_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      canonicalHead: 'UNVERIFIED',
      workspaceHead: 'UNVERIFIED'
    };

    const parsed = (reviewer as any).parseReviewerJson(
      JSON.stringify({ decision: 'PASS_WITH_LIMITATION', summary: 'Ran without head commit', verifiedEvidenceUsed: [], limitations: [] }),
      'gpt-5.6-luna',
      'resp_mock_missing',
      pkg
    );

    assert.strictEqual(parsed.limitations.includes('UNVERIFIED_CANONICAL_HEAD'), true, 'Missing head must be marked UNVERIFIED');
  });

  test('17. OpenAI Reviewer: Secret redaction in ReviewPackage before sending', async () => {
    const reviewer = new OpenAIReviewer();
    process.env.OPENAI_API_KEY = 'sk-proj-test-secret-123456';
    const pkg: ReviewPackage = {
      taskId: 'task_secret_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      commandResults: 'Log containing sk-proj-test-secret-123456 and Authorization: Bearer token_999'
    };

    let sentPrompt = '';
    (reviewer as any).callResponsesApi = async (model: string, sanitizedPkg: any) => {
      sentPrompt = JSON.stringify(sanitizedPkg);
      return {
        decision: 'PASS_GREEN',
        summary: 'Clean',
        verifiedEvidenceUsed: [],
        limitations: [],
        risks: [],
        requiredNextAction: 'None',
        escalationRequired: false,
        modelUsed: model,
        responseId: 'resp_secret_test'
      };
    };

    await reviewer.reviewTask(pkg);
    assert.strictEqual(sentPrompt.includes('sk-proj-test-secret-123456'), false, 'API key must be redacted');
    assert.strictEqual(sentPrompt.includes('token_999'), false, 'Bearer token must be redacted');
  });

  test('18. OpenAI Reviewer: API failure fail-closed (REVIEWER_UNAVAILABLE)', async () => {
    const reviewer = new OpenAIReviewer('gpt-5.6-luna', 'gpt-5.6-sol', 'invalid_key_trigger_err');
    const pkg: ReviewPackage = {
      taskId: 'task_apifail_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN'
    };

    const origFetch = globalThis.fetch;
    globalThis.fetch = (async () => ({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error'
    })) as any;

    try {
      const res = await reviewer.reviewTask(pkg);
      assert.strictEqual(res.finalDecision, 'REVIEWER_UNAVAILABLE');
      assert.strictEqual(res.lunaReview.responseId, 'NONE');
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  test('19. OpenAI Reviewer: Retry maximum of 1 on transient failure', async () => {
    const reviewer = new OpenAIReviewer('gpt-5.6-luna', 'gpt-5.6-sol', 'test_key');
    const pkg: ReviewPackage = {
      taskId: 'task_retry_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN'
    };

    let fetchCount = 0;
    const origFetch = globalThis.fetch;
    globalThis.fetch = (async () => {
      fetchCount++;
      return {
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable'
      };
    }) as any;

    try {
      await reviewer.reviewTask(pkg);
      assert.strictEqual(fetchCount, 2, 'Must perform exactly 1 retry (2 total attempts)');
    } finally {
      globalThis.fetch = origFetch;
    }
  });

  test('20. OpenAI Reviewer: Oversized evidence rejection (MAX_OPENAI_REVIEW_INPUT_CHARS)', async () => {
    const reviewer = new OpenAIReviewer();
    const hugePayload = 'X'.repeat(CONFIG.MAX_OPENAI_REVIEW_INPUT_CHARS + 500);
    const pkg: ReviewPackage = {
      taskId: 'task_oversized_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      commandResults: hugePayload
    };

    const res = await reviewer.reviewTask(pkg);
    assert.strictEqual(res.finalDecision, 'REVIEWER_UNAVAILABLE');
    assert.strictEqual(res.lunaReview.limitations.includes('OVERSIZED_EVIDENCE_REJECTED'), true);
    assert.strictEqual(res.openAiCallCount, 0, 'Zero OpenAI calls made for oversized evidence');
  });

  test('21. Supervisor: Enforces maximum 3 process restarts in 1 hour', () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const { Supervisor } = require('../src/supervisor');
    const supervisor = new Supervisor(queueStore);

    assert.strictEqual(supervisor.checkAndRecordRestart().allowed, true);
    assert.strictEqual(supervisor.checkAndRecordRestart().allowed, true);
    assert.strictEqual(supervisor.checkAndRecordRestart().allowed, true);

    const fourth = supervisor.checkAndRecordRestart();
    assert.strictEqual(fourth.allowed, false);
    assert.strictEqual(fourth.status, 'RUNNER_RESTART_LIMIT_REACHED');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('22. BudgetTracker: Enforces MAX_TOTAL_OPENAI_CALLS_PER_DAY = 12 ($5 credit protection)', () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const today = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(uPath, JSON.stringify({
      dailyLunaCount: 10,
      dailySolCount: 2,
      queueLunaCalls: 10,
      queueSolCalls: 2,
      forensicLunaCalls: 0,
      forensicSolCalls: 0,
      totalOpenAiCalls: 12,
      lastResetDate: today,
      records: []
    }), 'utf-8');

    const budget = new BudgetTracker(queueStore);
    assert.strictEqual(budget.canCallLuna(), false, 'Luna call must be disallowed when total daily calls reach 12');
    assert.strictEqual(budget.canCallSol(), false, 'Sol call must be disallowed when total daily calls reach 12');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('23. Logger: Redacts secrets before console or file write', () => {
    const { Logger } = require('../src/logger');
    const logPath = path.join(testDir, `log_${Date.now()}.log`);
    const logger = new Logger(logPath);

    process.env.OPENAI_API_KEY = 'sk-proj-test-secret-123456';
    logger.log('Test event with sk-proj-test-secret-123456 and Bearer auth_xyz');

    const content = fs.readFileSync(logPath, 'utf-8');
    assert.strictEqual(content.includes('sk-proj-test-secret-123456'), false);
    assert.strictEqual(content.includes('[REDACTED_OPENAI_API_KEY]'), true);

    cleanupTestFiles(logPath);
  });

  test('24. Telegram Notifier: Dispatches mocked notification and respects mockMode', async () => {
    const { TelegramNotifier } = require('../src/telegramNotifier');
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);
    const notifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    const result = await notifier.sendMessage('Test notification message', 'test_key_001', 'TEST_EVENT');
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.messageId, 'mock_msg_99999');

    cleanupTestFiles(sentPath);
  });

  test('25. Telegram Notifier: Deduplication suppresses second notification within 24 hours', async () => {
    const { TelegramNotifier } = require('../src/telegramNotifier');
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);
    const notifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    const first = await notifier.sendMessage('Message 1', 'dedup_key_001', 'TEST_EVENT');
    assert.strictEqual(first.success, true);
    assert.strictEqual(first.error, undefined);

    const second = await notifier.sendMessage('Message 2', 'dedup_key_001', 'TEST_EVENT');
    assert.strictEqual(second.success, true);
    assert.strictEqual(second.error, 'DUPLICATE_SUPPRESSED');

    cleanupTestFiles(sentPath);
  });

  test('26. Telegram Notifier: Secret redaction in message body before dispatch', async () => {
    const { TelegramNotifier } = require('../src/telegramNotifier');
    process.env.OPENAI_API_KEY = 'sk-proj-test-secret-123456';
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);

    let dispatchedText = '';
    const notifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    const origSend = notifier.sendMessage.bind(notifier);
    notifier.sendMessage = async (text: string, dedupKey?: string, eventType?: string) => {
      const { redactSecrets } = require('../src/secretRedactor');
      dispatchedText = redactSecrets(text);
      return origSend(text, dedupKey, eventType);
    };

    await notifier.sendMessage('Alert with sk-proj-test-secret-123456 embedded', 'secret_key_001', 'TEST_EVENT');
    assert.strictEqual(dispatchedText.includes('sk-proj-test-secret-123456'), false);
    assert.strictEqual(dispatchedText.includes('[REDACTED_OPENAI_API_KEY]'), true);

    cleanupTestFiles(sentPath);
  });

  test('27. Telegram Notifier: GREEN task success produces NO notification', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);
    const { TelegramNotifier } = require('../src/telegramNotifier');
    const mockNotifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    let telegramCallCount = 0;
    mockNotifier.sendMessage = async () => {
      telegramCallCount++;
      return { success: true };
    };

    queueStore.addQueueTask({
      taskId: 'task_green_success',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Green inspection',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const mockExecutor = {
      executeTaskInWorktree: () => ({ exitCode: 0, output: '[MOCK] GREEN OK' })
    } as unknown as LocalTaskExecutor;

    const mockReviewer = {
      reviewTask: async () => ({
        lunaReview: { decision: 'PASS_GREEN', summary: 'Clean' },
        finalDecision: 'PASS_GREEN',
        openAiCallCount: 1
      })
    } as unknown as OpenAIReviewer;

    const mockWorktree = {
      createTaskWorktree: (id: string) => ({ workspacePath: `/mock/${id}`, originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' }),
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, mockExecutor, undefined, mockReviewer, mockNotifier);
    await runner.runCycle();

    const task = queueStore.getQueueTask('task_green_success');
    assert.strictEqual(task?.status, 'COMPLETED');
    assert.strictEqual(telegramCallCount, 0, 'No Telegram notification sent for successful GREEN task');

    cleanupTestFiles(qPath, rPath, oPath, uPath, sentPath);
  });

  test('28. Telegram Notifier: RED task governance rejection triggers notifyOwnerDecisionRequired', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);
    const { TelegramNotifier } = require('../src/telegramNotifier');
    const mockNotifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    let ownerDecisionNotified = false;
    mockNotifier.notifyOwnerDecisionRequired = async () => {
      ownerDecisionNotified = true;
      return true;
    };

    queueStore.addQueueTask({
      taskId: 'task_red_notif',
      type: 'PRODUCTION_DEPLOY' as any,
      risk: 'RED',
      priority: 'CRITICAL',
      instruction: 'Red deploy',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const runner = new QueueRunner(queueStore, undefined, undefined, undefined, undefined, undefined, mockNotifier);
    await runner.runCycle();

    assert.strictEqual(ownerDecisionNotified, true, 'RED task rejection must send Telegram owner alert');

    cleanupTestFiles(qPath, rPath, oPath, uPath, sentPath);
  });

  test('29. Telegram Notifier: Critical execution failure triggers notifyCriticalError', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);
    const { TelegramNotifier } = require('../src/telegramNotifier');
    const mockNotifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    let criticalErrorNotified = false;
    mockNotifier.notifyCriticalError = async () => {
      criticalErrorNotified = true;
      return true;
    };

    queueStore.addQueueTask({
      taskId: 'task_fail_notif',
      type: 'TYPECHECK',
      risk: 'GREEN',
      priority: 'HIGH',
      instruction: 'Failing typecheck',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const mockExecutor = {
      executeTaskInWorktree: () => ({ exitCode: 1, output: 'Typecheck error TS2304' })
    } as unknown as LocalTaskExecutor;

    const mockWorktree = {
      createTaskWorktree: (id: string) => ({ workspacePath: `/mock/${id}`, originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' }),
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, mockExecutor, undefined, undefined, mockNotifier);
    await runner.runCycle();

    assert.strictEqual(criticalErrorNotified, true, 'Execution failure must send Telegram critical error alert');

    cleanupTestFiles(qPath, rPath, oPath, uPath, sentPath);
  });

  test('30. Telegram Notifier: OpenAI budget limit triggers notifyOpenAiBudgetExhausted', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);
    const { TelegramNotifier } = require('../src/telegramNotifier');
    const mockNotifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    let budgetExhaustedNotified = false;
    mockNotifier.notifyOpenAiBudgetExhausted = async () => {
      budgetExhaustedNotified = true;
      return true;
    };

    queueStore.addQueueTask({
      taskId: 'task_budget_notif',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'NORMAL',
      instruction: 'Inspection',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const mockExecutor = {
      executeTaskInWorktree: () => ({ exitCode: 0, output: '[MOCK] OK' })
    } as unknown as LocalTaskExecutor;

    const mockWorktree = {
      createTaskWorktree: (id: string) => ({ workspacePath: `/mock/${id}`, originMainHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44' }),
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const mockReviewer = {
      reviewTask: async () => ({
        lunaReview: {
          decision: 'REVIEWER_UNAVAILABLE',
          summary: 'Daily Luna review limit reached.',
          verifiedEvidenceUsed: [],
          limitations: ['OPENAI_DAILY_REVIEW_LIMIT_REACHED'],
          risks: [],
          requiredNextAction: 'Wait',
          escalationRequired: false,
          modelUsed: 'gpt-5.6-luna',
          responseId: 'NONE'
        },
        finalDecision: 'REVIEWER_UNAVAILABLE',
        openAiCallCount: 0
      })
    } as unknown as OpenAIReviewer;

    const runner = new QueueRunner(queueStore, undefined, mockWorktree, mockExecutor, undefined, mockReviewer, mockNotifier);
    await runner.runCycle();

    assert.strictEqual(budgetExhaustedNotified, true, 'Reviewer budget limit hit must trigger notifyOpenAiBudgetExhausted');

    cleanupTestFiles(qPath, rPath, oPath, uPath, sentPath);
  });

  test('31. Telegram Notifier: Supervisor restart limit triggers notifyRunnerRestartLimitReached', () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const sentPath = path.join(testDir, `sent_${Date.now()}.json`);
    const { TelegramNotifier } = require('../src/telegramNotifier');
    const mockNotifier = new TelegramNotifier('mock_token', '123456', undefined, sentPath, true);

    let restartLimitNotified = false;
    mockNotifier.notifyRunnerRestartLimitReached = async () => {
      restartLimitNotified = true;
      return true;
    };

    const { Supervisor } = require('../src/supervisor');
    const supervisor = new Supervisor(queueStore, mockNotifier);

    supervisor.checkAndRecordRestart();
    supervisor.checkAndRecordRestart();
    supervisor.checkAndRecordRestart();
    const fourth = supervisor.checkAndRecordRestart();

    assert.strictEqual(fourth.allowed, false);
    assert.strictEqual(restartLimitNotified, true, 'Exceeding supervisor restart limit must trigger notifyRunnerRestartLimitReached');

    cleanupTestFiles(qPath, rPath, oPath, uPath, sentPath);
  });

  test('32. ProjectPlanner: Generates shadow plan and categorizes GREEN / YELLOW / RED candidates', () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const { ProjectPlanner } = require('../src/projectPlanner');
    const planner = new ProjectPlanner(queueStore);

    const plan = planner.generateShadowPlan();
    assert.strictEqual(plan.totalCandidates > 0, true, 'Shadow plan must contain candidate items');
    assert.strictEqual(plan.greenCandidates > 0, true, 'Shadow plan must classify GREEN candidates');
    assert.strictEqual(plan.redCandidates > 0, true, 'Shadow plan must classify RED candidates');

    const redItem = plan.backlog.find((b: any) => b.riskClass === 'RED');
    assert.strictEqual(redItem !== undefined, true);
    assert.strictEqual(redItem.category, 'GOVERNANCE_SECURITY');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('33. ProjectPlanner: Classifies task risks deterministically based on action types', () => {
    const { ProjectPlanner } = require('../src/projectPlanner');
    const planner = new ProjectPlanner();

    assert.strictEqual(planner.classifyTaskRisk('CATALOG_HEALTH', 'READ_ONLY_AUDIT'), 'GREEN');
    assert.strictEqual(planner.classifyTaskRisk('COMMERCE_READINESS', 'CONFIG_CHANGE'), 'YELLOW');
    assert.strictEqual(planner.classifyTaskRisk('GOVERNANCE_SECURITY', 'PRODUCTION_DEPLOY', true), 'RED');
    assert.strictEqual(planner.classifyTaskRisk('COMMERCE_READINESS', 'PUBLIC_RETAILER_ACTIVATE'), 'RED');
  });

  test('34. LocalTaskExecutor: Execution profile resolution maps BUILD tasks correctly', () => {
    const { resolveExecutionProfile } = require('../src/localExecutor');
    const mockRoot = '/mock/workspace';

    const nextBuild = resolveExecutionProfile('BUILD', 'Technical SEO build verification', mockRoot);
    assert.strictEqual(nextBuild.name, 'ROOT_NEXT_BUILD');
    assert.strictEqual(nextBuild.cwd, mockRoot);
    assert.strictEqual(nextBuild.command, 'npx next build');

    const hubBuild = resolveExecutionProfile('BUILD', 'Control Hub build verification', mockRoot);
    assert.strictEqual(hubBuild.name, 'CONTROL_HUB_BUILD');
    assert.strictEqual(path.normalize(hubBuild.cwd), path.normalize(path.join(mockRoot, 'tools', 'control-hub')));
    assert.strictEqual(hubBuild.command, 'npm run build');
  });

  test('35. LocalTaskExecutor: Execution profile resolution maps TEST tasks to CONTROL_HUB_TEST', () => {
    const { resolveExecutionProfile } = require('../src/localExecutor');
    const mockRoot = '/mock/workspace';

    const testProfile = resolveExecutionProfile('TEST', 'Control Hub test suite execution', mockRoot);
    assert.strictEqual(testProfile.name, 'CONTROL_HUB_TEST');
    assert.strictEqual(path.normalize(testProfile.cwd), path.normalize(path.join(mockRoot, 'tools', 'control-hub')));
    assert.strictEqual(testProfile.command, 'npm test');
  });

  test('36. LocalTaskExecutor: Unknown task type fails closed with EXECUTION_PROFILE_NOT_DEFINED', () => {
    const { LocalTaskExecutor, resolveExecutionProfile } = require('../src/localExecutor');
    const mockRoot = path.join(testDir, `worktree_${Date.now()}`);
    fs.mkdirSync(mockRoot, { recursive: true });

    const profile = resolveExecutionProfile('UNAPPROVED_FUTURE_TASK' as any, 'Do something', mockRoot);
    assert.strictEqual(profile.name, 'EXECUTION_PROFILE_NOT_DEFINED');

    const executor = new LocalTaskExecutor();
    const res = executor.executeTaskInWorktree('UNAPPROVED_FUTURE_TASK' as any, mockRoot, '249d3ead0ee1d3ea5fda40d53208f45513f0dd44');
    assert.strictEqual(res.exitCode, 1);
    assert.strictEqual(res.executionProfile, 'EXECUTION_PROFILE_NOT_DEFINED');
    assert.strictEqual(res.output.includes('EXECUTION_PROFILE_NOT_DEFINED'), true);

    cleanupTestFiles(mockRoot);
  });

  test('37. LocalTaskExecutor: Failure evidence preserves stdout/stderr and redacts secrets', () => {
    const { LocalTaskExecutor } = require('../src/localExecutor');
    const mockRoot = path.join(testDir, `worktree_${Date.now()}`);
    fs.mkdirSync(mockRoot, { recursive: true });

    process.env.OPENAI_API_KEY = 'sk-proj-secret-key-to-redact-999';
    const executor = new LocalTaskExecutor();
    const res = executor.executeTaskInWorktree('TYPECHECK', mockRoot, '249d3ead0ee1d3ea5fda40d53208f45513f0dd44');

    assert.strictEqual(res.executionProfile, 'ROOT_TYPESCRIPT');
    assert.strictEqual(res.output.includes('stdout_stderr_evidence'), true);
    assert.strictEqual(res.output.includes('sk-proj-secret-key-to-redact-999'), false, 'Secrets must be redacted from evidence output');

    cleanupTestFiles(mockRoot);
  });

  test('38. Repository Identity: Root package name "tech-compare" does not trigger false identity error', () => {
    const { LocalTaskExecutor } = require('../src/localExecutor');
    const execSync = require('child_process');
    const rootRepoPath = path.resolve(__dirname, '../../..');
    const headRes = execSync.execSync('git rev-parse HEAD', { cwd: rootRepoPath, encoding: 'utf-8' }).trim();

    const executor = new LocalTaskExecutor();
    const res = executor.executeTaskInWorktree('REPOSITORY_INSPECTION', rootRepoPath, headRes);

    assert.strictEqual(res.exitCode, 0);
    assert.strictEqual(res.output.includes('repository_identity_status: VERIFIED_ACELEETME_REPO'), true);
    assert.strictEqual(res.output.includes('root_package_name: tech-compare'), true);
  });

  test('39. Governance: RED task synthetic decision tagging', async () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    queueStore.addQueueTask({
      taskId: 'task_synth_001',
      type: 'PRODUCTION_DEPLOY' as any,
      risk: 'RED',
      priority: 'CRITICAL',
      instruction: 'Bounded synthetic owner decision live test',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const runner = new QueueRunner(queueStore);
    await runner.runCycle();

    const decisions = queueStore.getOwnerDecisions();
    const synthDec = decisions.find(d => d.taskId === 'task_synth_001');
    assert.strictEqual(synthDec !== undefined, true);
    assert.strictEqual(synthDec?.shortTitle.includes('[SYNTHETIC_TEST]'), true);
    assert.strictEqual(synthDec?.status, 'PENDING');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('40. Dependency Isolation Guard: Fingerprint match allows canonical junction linking', () => {
    const { LocalTaskExecutor } = require('../src/localExecutor');
    const mockWorktree = path.join(testDir, `worktree_guard_match_${Date.now()}`);
    fs.mkdirSync(mockWorktree, { recursive: true });

    // Copy exact package-lock.json and package.json to mock worktree
    const canonicalRepo = path.resolve(__dirname, '../../..');
    fs.copyFileSync(path.join(canonicalRepo, 'package.json'), path.join(mockWorktree, 'package.json'));
    fs.copyFileSync(path.join(canonicalRepo, 'package-lock.json'), path.join(mockWorktree, 'package-lock.json'));

    const executor = new LocalTaskExecutor();
    const res = executor.executeTaskInWorktree('TYPECHECK', mockWorktree, '249d3ead0ee1d3ea5fda40d53208f45513f0dd44');

    assert.strictEqual(res.fingerprintMatch, true, 'Fingerprint must match when lockfiles are identical');
    assert.strictEqual(res.dependencyStrategy, 'CANONICAL_JUNCTION');
    assert.strictEqual(res.dependenciesState, 'LINKED_CANONICAL_NODE_MODULES_MATCHED');

    cleanupTestFiles(mockWorktree);
  });

  test('41. Dependency Isolation Guard: Fingerprint mismatch rejects canonical junction link', () => {
    const { LocalTaskExecutor } = require('../src/localExecutor');
    const mockWorktree = path.join(testDir, `worktree_guard_mismatch_${Date.now()}`);
    fs.mkdirSync(mockWorktree, { recursive: true });

    // Create modified package-lock.json in mock worktree
    fs.writeFileSync(path.join(mockWorktree, 'package.json'), JSON.stringify({ name: 'tech-compare', version: '0.1.0' }), 'utf-8');
    fs.writeFileSync(path.join(mockWorktree, 'package-lock.json'), JSON.stringify({ name: 'tech-compare', lockfileVersion: 3, packages: { diff: 1 } }), 'utf-8');

    const executor = new LocalTaskExecutor();
    const res = executor.executeTaskInWorktree('TYPECHECK', mockWorktree, '249d3ead0ee1d3ea5fda40d53208f45513f0dd44');

    assert.strictEqual(res.fingerprintMatch, false, 'Fingerprint must NOT match when lockfiles differ');
    assert.strictEqual(res.dependencyStrategy, 'ISOLATED_NPM_CI');
    assert.strictEqual(res.output.includes('fingerprintMatch: false'), true);

    cleanupTestFiles(mockWorktree);
  });

  test('42. CLI Parser: Correct named argument parsing', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res = parseQueueAddArgs([
      '--type', 'REPOSITORY_INSPECTION',
      '--risk', 'GREEN',
      '--priority', 'HIGH',
      '--instruction', 'Live runner qualification: REPOSITORY_INSPECTION'
    ]);

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.task?.type, 'REPOSITORY_INSPECTION');
    assert.strictEqual(res.task?.risk, 'GREEN');
    assert.strictEqual(res.task?.priority, 'HIGH');
    assert.strictEqual(res.task?.instruction, 'Live runner qualification: REPOSITORY_INSPECTION');
  });

  test('43. CLI Parser: Quoted and multi-word instruction parsing', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res = parseQueueAddArgs([
      '--type', 'BUILD',
      '--risk', 'GREEN',
      '--priority', 'NORMAL',
      '--instruction', 'Technical', 'SEO', 'and', 'Next.js', 'build'
    ]);

    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.task?.type, 'BUILD');
    assert.strictEqual(res.task?.instruction, 'Technical SEO and Next.js build');
  });

  test('44. CLI Parser: Missing value rejection', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res1 = parseQueueAddArgs(['--type']);
    assert.strictEqual(res1.ok, false);
    assert.strictEqual(res1.error, 'INVALID_TASK_ARGUMENTS');

    const res2 = parseQueueAddArgs(['--type', '--risk', 'GREEN']);
    assert.strictEqual(res2.ok, false);
    assert.strictEqual(res2.error, 'INVALID_TASK_ARGUMENTS');
  });

  test('45. CLI Parser: Unknown flag rejection', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res = parseQueueAddArgs(['--unknown-flag', 'value']);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, 'INVALID_TASK_ARGUMENTS');
    assert.strictEqual(res.reason?.includes('Unknown flag'), true);
  });

  test('46. CLI Parser: Risk enum validation', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res = parseQueueAddArgs(['--type', 'BUILD', '--risk', 'INVALID_RISK']);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, 'INVALID_TASK_ARGUMENTS');
    assert.strictEqual(res.reason?.includes('Invalid risk level'), true);
  });

  test('47. CLI Parser: Priority enum validation', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res = parseQueueAddArgs(['--type', 'BUILD', '--priority', 'ULTRA_HIGH']);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, 'INVALID_TASK_ARGUMENTS');
    assert.strictEqual(res.reason?.includes('Invalid task priority'), true);
  });

  test('48. CLI Parser: Task type validation', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res = parseQueueAddArgs(['--type', 'INVALID_TYPE']);
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.error, 'INVALID_TASK_ARGUMENTS');
    assert.strictEqual(res.reason?.includes('Invalid task type'), true);
  });

  test('49. CLI Parser: Flags can never become field values (shifted argument rejection)', () => {
    const { parseQueueAddArgs } = require('../src/cliParser');
    const res1 = parseQueueAddArgs(['--type', 'REPOSITORY_INSPECTION', 'GREEN', '--priority', 'HIGH']);
    assert.strictEqual(res1.ok, false);
    assert.strictEqual(res1.error, 'INVALID_TASK_ARGUMENTS');

    const res2 = parseQueueAddArgs(['--type', '--risk', '--priority']);
    assert.strictEqual(res2.ok, false);
    assert.strictEqual(res2.error, 'INVALID_TASK_ARGUMENTS');
  });

  test('50. QueueStore Defense-in-Depth: Malformed input never enters queue', () => {
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();

    assert.throws(() => {
      queueStore.addQueueTask({
        taskId: 'task_malformed_test',
        type: '--TYPE' as any,
        risk: 'GREEN',
        priority: 'HIGH',
        instruction: 'Malformed field test',
        status: 'PENDING',
        dependencies: [],
        createdAt: new Date().toISOString(),
        attempts: 0
      });
    }, (err: any) => {
      return err instanceof Error && err.message.includes('INVALID_TASK_ARGUMENTS');
    });

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('51. OpenAI Strategic Planner: Telemetry gathering and telemetry structure', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const planner = new OpenAIStrategicPlanner(queueStore);

    const telemetry = planner.getProjectTelemetry();
    assert.strictEqual(typeof telemetry.repositoryHead, 'string');
    assert.strictEqual(typeof telemetry.gitCleanliness, 'boolean');
    assert.strictEqual(telemetry.catalogAudit.includes('CANONICAL_DB_AUDIT = NOT_PERFORMED'), true);
    assert.strictEqual(telemetry.commerceReadiness.includes('PERMISSION_UNVERIFIED'), true);

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('52. OpenAI Strategic Planner: GREEN proposal governance validation', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_test_001',
      title: 'Repository Structure Inspection',
      domain: 'TECHNICAL',
      problem: 'Inspect repository identity',
      evidence: ['Repo status'],
      reason: 'Verify clean tree',
      expectedUserValue: 'Fast loading',
      expectedBusinessValue: 'Zero debt',
      expectedTechnicalValue: 'Clean tree',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'REPOSITORY_INSPECTION',
      dependencies: [],
      acceptanceCriteria: ['Pass'],
      estimatedComplexity: 'LOW',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_test_001'
    });

    assert.strictEqual(validated.validatedRisk, 'GREEN');
    assert.strictEqual(validated.executionProfile, 'REPOSITORY_INSPECTION');
  });

  test('53. OpenAI Strategic Planner: Main merge proposal overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_merge_001',
      title: 'Main merge execution',
      domain: 'GOVERNANCE',
      problem: 'Merge feature branch into main',
      evidence: ['Git diff'],
      reason: 'Release feature',
      expectedUserValue: 'New feature',
      expectedBusinessValue: 'Value',
      expectedTechnicalValue: 'Merged',
      priority: 'CRITICAL',
      riskProposal: 'GREEN',
      executionProfile: 'REPOSITORY_INSPECTION',
      dependencies: [],
      acceptanceCriteria: ['Merged'],
      estimatedComplexity: 'HIGH',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_merge_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
    assert.strictEqual(validated.ownerDecisionNeeded, true);
    assert.strictEqual(validated.suggestedExecutor, 'OWNER');
  });

  test('54. OpenAI Strategic Planner: Production database mutation overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_db_001',
      title: 'Production database mutation',
      domain: 'DATA',
      problem: 'Directly update production Postgres DB table',
      evidence: ['Schema mismatch'],
      reason: 'Fix table data',
      expectedUserValue: 'Correct data',
      expectedBusinessValue: 'Correctness',
      expectedTechnicalValue: 'Updated',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Updated'],
      estimatedComplexity: 'HIGH',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_db_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
    assert.strictEqual(validated.ownerDecisionNeeded, true);
  });

  test('55. OpenAI Strategic Planner: Destructive migration overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_drop_001',
      title: 'Destructive migration drop table',
      domain: 'DATA',
      problem: 'Drop table in production DB',
      evidence: ['Unused table'],
      reason: 'Clean schema',
      expectedUserValue: 'Faster DB',
      expectedBusinessValue: 'Clean DB',
      expectedTechnicalValue: 'Dropped',
      priority: 'MEDIUM',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Dropped'],
      estimatedComplexity: 'HIGH',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_drop_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('56. OpenAI Strategic Planner: Golden Dataset mutation overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_golden_001',
      title: 'Golden Dataset mutation',
      domain: 'DATA',
      problem: 'Modify Golden Dataset V1 records',
      evidence: ['New dataset'],
      reason: 'Update baseline',
      expectedUserValue: 'Better baseline',
      expectedBusinessValue: 'Accuracy',
      expectedTechnicalValue: 'Updated',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Updated'],
      estimatedComplexity: 'MEDIUM',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_golden_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('57. OpenAI Strategic Planner: Automatic fact correction overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_fact_001',
      title: 'Automatic fact correction enable',
      domain: 'DATA',
      problem: 'Auto-correct product specs in catalog',
      evidence: ['Spec errors'],
      reason: 'Auto fix',
      expectedUserValue: 'Correct specs',
      expectedBusinessValue: 'Precision',
      expectedTechnicalValue: 'Auto fixed',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Fixed'],
      estimatedComplexity: 'MEDIUM',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_fact_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('58. OpenAI Strategic Planner: Retailer feed activation overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_retailer_001',
      title: 'Activate retailer feed for live crawling',
      domain: 'COMMERCE',
      problem: 'Enable live feed crawling for Trendyol',
      evidence: ['Unverified feed'],
      reason: 'Ingest prices',
      expectedUserValue: 'Live prices',
      expectedBusinessValue: 'Revenue',
      expectedTechnicalValue: 'Ingesting',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Ingesting'],
      estimatedComplexity: 'MEDIUM',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_retailer_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('59. OpenAI Strategic Planner: Credential modification overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_cred_001',
      title: 'Credential modification and key rotation',
      domain: 'GOVERNANCE',
      problem: 'Change credential secrets in environment',
      evidence: ['Old keys'],
      reason: 'Rotate keys',
      expectedUserValue: 'Security',
      expectedBusinessValue: 'Security',
      expectedTechnicalValue: 'Rotated',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Rotated'],
      estimatedComplexity: 'MEDIUM',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_cred_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('60. OpenAI Strategic Planner: Security weakening overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_sec_001',
      title: 'Bypass governance and security weakening',
      domain: 'GOVERNANCE',
      problem: 'Disable auth checks on API routes',
      evidence: ['Slow auth'],
      reason: 'Speed up API',
      expectedUserValue: 'Faster load',
      expectedBusinessValue: 'Faster load',
      expectedTechnicalValue: 'Disabled auth',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Disabled'],
      estimatedComplexity: 'HIGH',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_sec_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('61. OpenAI Strategic Planner: Paid infrastructure action overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_paid_001',
      title: 'Paid infrastructure billing upgrade',
      domain: 'GOVERNANCE',
      problem: 'Purchase paid cloud server instances',
      evidence: ['High traffic'],
      reason: 'Scale server',
      expectedUserValue: 'Zero downtime',
      expectedBusinessValue: 'Capacity',
      expectedTechnicalValue: 'Upgraded',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Upgraded'],
      estimatedComplexity: 'HIGH',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_paid_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('62. OpenAI Strategic Planner: Secret exposure overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_secret_001',
      title: 'Secret exposure logging',
      domain: 'GOVERNANCE',
      problem: 'Log raw auth tokens to public log',
      evidence: ['Debug needs'],
      reason: 'Debug auth',
      expectedUserValue: 'Fixed bugs',
      expectedBusinessValue: 'Debug',
      expectedTechnicalValue: 'Logged',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Logged'],
      estimatedComplexity: 'LOW',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_secret_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('63. OpenAI Strategic Planner: Permission escalation overridden to RED', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_perm_001',
      title: 'Permission escalation to admin',
      domain: 'GOVERNANCE',
      problem: 'Grant admin role to anonymous guest',
      evidence: ['Guest access'],
      reason: 'Easy access',
      expectedUserValue: 'Access',
      expectedBusinessValue: 'Access',
      expectedTechnicalValue: 'Granted',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'READ_ONLY_AUDIT',
      dependencies: [],
      acceptanceCriteria: ['Granted'],
      estimatedComplexity: 'LOW',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_perm_001'
    });

    assert.strictEqual(validated.validatedRisk, 'RED');
  });

  test('64. OpenAI Strategic Planner: Self-modification protection', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_self_001',
      title: 'Modify tools/control-hub/src/governance.ts logic',
      domain: 'GOVERNANCE',
      problem: 'Change control_hub rules in supervisor',
      evidence: ['New rules'],
      reason: 'Update governance rules',
      expectedUserValue: 'Self-update',
      expectedBusinessValue: 'Flexibility',
      expectedTechnicalValue: 'Modified',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'REPOSITORY_INSPECTION',
      dependencies: [],
      acceptanceCriteria: ['Modified'],
      estimatedComplexity: 'MEDIUM',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_self_001'
    });

    assert.strictEqual(validated.validatedRisk, 'YELLOW');
    assert.strictEqual(validated.executionProfile, 'PLANNER_PROPOSAL_ONLY');
    assert.strictEqual(validated.governanceOverrideNote?.includes('Self-modification protection'), true);
  });

  test('65. OpenAI Strategic Planner: Code mutation proposals set to PLANNER_PROPOSAL_ONLY', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_code_001',
      title: 'Add new Next.js component to phones page',
      domain: 'USER_VALUE',
      problem: 'Build new phone filter UI widget',
      evidence: ['UI gap'],
      reason: 'Better UI',
      expectedUserValue: 'Interactive UI',
      expectedBusinessValue: 'Engagement',
      expectedTechnicalValue: 'New code',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'CODE_MUTATION_BUILDER',
      dependencies: [],
      acceptanceCriteria: ['Built'],
      estimatedComplexity: 'MEDIUM',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'FUTURE_AUTONOMOUS_BUILDER',
      dedupeFingerprint: 'fp_code_001'
    });

    assert.strictEqual(validated.validatedRisk, 'YELLOW');
    assert.strictEqual(validated.executionProfile, 'PLANNER_PROPOSAL_ONLY');
  });

  test('66. OpenAI Strategic Planner: Unknown execution profile fails closed', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const planner = new OpenAIStrategicPlanner();

    const validated = planner.validateProposalGovernance({
      taskId: 'plan_unk_001',
      title: 'Unknown execution profile test',
      domain: 'TECHNICAL',
      problem: 'Execute unknown profile',
      evidence: ['Test'],
      reason: 'Test',
      expectedUserValue: 'Test',
      expectedBusinessValue: 'Test',
      expectedTechnicalValue: 'Test',
      priority: 'LOW',
      riskProposal: 'GREEN',
      executionProfile: 'UNKNOWN_EXECUTION_PROFILE',
      dependencies: [],
      acceptanceCriteria: ['Test'],
      estimatedComplexity: 'LOW',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_unk_001'
    });

    assert.strictEqual(validated.validatedRisk, 'YELLOW');
    assert.strictEqual(validated.executionProfile, 'PLANNER_PROPOSAL_ONLY');
  });

  test('67. OpenAI Strategic Planner: Duplicate suppression (24-hour window)', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const rPathRoadmap = path.join(testDir, `roadmap_dedup_${Date.now()}.json`);
    const planner = new OpenAIStrategicPlanner(queueStore, rPathRoadmap);

    const fp = 'fp_data_catalog_audit_8077c07';
    planner.saveRoadmap({
      generatedAt: new Date().toISOString(),
      plannerModelUsed: 'gpt-5.6-luna',
      escalationUsed: false,
      top3CurrentBlockers: [],
      top3NextMoves: [],
      doNotWorkOnYet: [],
      dependencyChain: [],
      userValueGap: '',
      dataGap: '',
      commerceGap: '',
      growthGap: '',
      technicalRisk: '',
      ownerDecisionsNeeded: [],
      proposals: [
        {
          taskId: 'plan_catalog_audit_001',
          title: 'Catalog spec audit',
          domain: 'DATA',
          problem: 'Missing specs',
          evidence: [],
          reason: 'Audit specs',
          expectedUserValue: 'Value',
          expectedBusinessValue: 'Value',
          expectedTechnicalValue: 'Value',
          priority: 'HIGH',
          riskProposal: 'GREEN',
          executionProfile: 'REPOSITORY_INSPECTION',
          dependencies: [],
          acceptanceCriteria: [],
          estimatedComplexity: 'LOW',
          ownerDecisionNeeded: false,
          suggestedExecutor: 'CONTROL_HUB',
          dedupeFingerprint: fp
        }
      ]
    });

    const newProposals: any[] = [
      {
        taskId: 'plan_catalog_audit_002',
        title: 'Catalog spec audit duplicate',
        domain: 'DATA',
        problem: 'Missing specs',
        executionProfile: 'REPOSITORY_INSPECTION',
        dedupeFingerprint: fp
      },
      {
        taskId: 'plan_seo_001',
        title: 'SEO Build',
        domain: 'TECHNICAL',
        problem: 'New problem',
        executionProfile: 'ROOT_NEXT_BUILD',
        dedupeFingerprint: 'fp_unique_seo_001'
      }
    ];

    const { activeProposals, suppressedCount } = planner.deduplicateProposals(newProposals);
    assert.strictEqual(suppressedCount, 1);
    assert.strictEqual(activeProposals.length, 1);
    assert.strictEqual(activeProposals[0].taskId, 'plan_seo_001');

    cleanupTestFiles(qPath, rPath, oPath, uPath, rPathRoadmap);
  });

  test('68. OpenAI Strategic Planner: Daily run limit (max 4/day)', async () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const rPathRoadmap = path.join(testDir, `roadmap_limit_${Date.now()}.json`);
    const planner = new OpenAIStrategicPlanner(queueStore, rPathRoadmap);

    // Save 4 roadmaps for today
    for (let i = 0; i < 4; i++) {
      planner.saveRoadmap({
        generatedAt: new Date(Date.now() - (10 - i) * 60 * 60 * 1000).toISOString(),
        plannerModelUsed: 'gpt-5.6-luna',
        escalationUsed: false,
        top3CurrentBlockers: [],
        top3NextMoves: [],
        doNotWorkOnYet: [],
        dependencyChain: [],
        userValueGap: '',
        dataGap: '',
        commerceGap: '',
        growthGap: '',
        technicalRisk: '',
        ownerDecisionsNeeded: [],
        proposals: []
      });
    }

    const check = planner.isIdleAndEligibleForPlanning();
    assert.strictEqual(check.eligible, false);
    assert.strictEqual(check.reason?.includes('Daily planner run limit reached'), true);

    cleanupTestFiles(qPath, rPath, oPath, uPath, rPathRoadmap);
  });

  test('69. OpenAI Strategic Planner: Minimum interval limit (min 4 hours)', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const rPathRoadmap = path.join(testDir, `roadmap_interval_${Date.now()}.json`);
    const planner = new OpenAIStrategicPlanner(queueStore, rPathRoadmap);

    // Save 1 roadmap generated 1 hour ago
    planner.saveRoadmap({
      generatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      plannerModelUsed: 'gpt-5.6-luna',
      escalationUsed: false,
      top3CurrentBlockers: [],
      top3NextMoves: [],
      doNotWorkOnYet: [],
      dependencyChain: [],
      userValueGap: '',
      dataGap: '',
      commerceGap: '',
      growthGap: '',
      technicalRisk: '',
      ownerDecisionsNeeded: [],
      proposals: []
    });

    const check = planner.isIdleAndEligibleForPlanning();
    assert.strictEqual(check.eligible, false);
    assert.strictEqual(check.reason?.includes('Minimum interval between planner runs is 4 hours'), true);

    cleanupTestFiles(qPath, rPath, oPath, uPath, rPathRoadmap);
  });

  test('70. OpenAI Strategic Planner: Queue flood limit (max 3 auto-enqueued GREEN per run)', async () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const rPathRoadmap = path.join(testDir, `roadmap_flood_${Date.now()}.json`);
    const planner = new OpenAIStrategicPlanner(queueStore, rPathRoadmap);

    const mockProposals: any[] = [1, 2, 3, 4, 5].map(i => ({
      taskId: `plan_flood_green_00${i}`,
      title: `Flood task ${i}`,
      domain: 'TECHNICAL',
      problem: `Problem ${i}`,
      evidence: ['Evidence'],
      reason: `Reason ${i}`,
      expectedUserValue: 'Value',
      expectedBusinessValue: 'Value',
      expectedTechnicalValue: 'Value',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: 'REPOSITORY_INSPECTION',
      dependencies: [],
      acceptanceCriteria: ['Pass'],
      estimatedComplexity: 'LOW',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: `fp_flood_00${i}`
    }));

    const res = await planner.generateStrategicPlan({
      bypassIdleCheck: true,
      mockResponse: { proposals: mockProposals }
    });

    assert.strictEqual(res.autoEnqueuedCount, 3);
    const queuedTasks = queueStore.getQueueTasks();
    assert.strictEqual(queuedTasks.length, 3);

    cleanupTestFiles(qPath, rPath, oPath, uPath, rPathRoadmap);
  });

  test('71. OpenAI Strategic Planner: Idle-only planner execution check', () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const planner = new OpenAIStrategicPlanner(queueStore);

    // Add 1 executable pending task to queue
    queueStore.addQueueTask({
      taskId: 'task_pending_exec',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      priority: 'HIGH',
      instruction: 'Pending exec task',
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const check = planner.isIdleAndEligibleForPlanning();
    assert.strictEqual(check.eligible, false);
    assert.strictEqual(check.reason?.includes('Executable queue is not empty'), true);

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

  test('72. OpenAI Strategic Planner: Planner output cannot bypass queue validation', async () => {
    const { OpenAIStrategicPlanner } = require('../src/strategicPlanner');
    const { queueStore, qPath, rPath, oPath, uPath } = getMockStores();
    const rPathRoadmap = path.join(testDir, `roadmap_bypass_${Date.now()}.json`);
    const planner = new OpenAIStrategicPlanner(queueStore, rPathRoadmap);

    // Proposal trying to pass shifted flag arguments
    const malformedProposal: any = {
      taskId: 'plan_bypass_001',
      title: 'Bypass attempt',
      domain: 'TECHNICAL',
      problem: 'Bypass problem',
      evidence: [],
      reason: 'Reason',
      expectedUserValue: 'Value',
      expectedBusinessValue: 'Value',
      expectedTechnicalValue: 'Value',
      priority: 'HIGH',
      riskProposal: 'GREEN',
      executionProfile: '--TYPE' as any,
      dependencies: [],
      acceptanceCriteria: [],
      estimatedComplexity: 'LOW',
      ownerDecisionNeeded: false,
      suggestedExecutor: 'CONTROL_HUB',
      dedupeFingerprint: 'fp_bypass_001'
    };

    const res = await planner.generateStrategicPlan({
      bypassIdleCheck: true,
      mockResponse: { proposals: [malformedProposal] }
    });

    assert.strictEqual(res.autoEnqueuedCount, 0);
    const queuedTasks = queueStore.getQueueTasks();
    assert.strictEqual(queuedTasks.length, 0);

    cleanupTestFiles(qPath, rPath, oPath, uPath, rPathRoadmap);
  });

});



