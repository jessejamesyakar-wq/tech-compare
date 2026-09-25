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
    assert.strictEqual(redTask?.status, 'BLOCKED');

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
    assert.strictEqual(taskD?.status, 'BLOCKED');

    assert.strictEqual(lunaCallCount, 3, 'Luna reviewer must be called 3 times (Task A, B, C)');
    assert.strictEqual(solCallCount, 0, 'Sol reviewer must be called 0 times');

    const ownerDecisions = queueStore.getOwnerDecisions();
    assert.strictEqual(ownerDecisions.some(d => d.taskId === 'QUAL_TASK_D'), true, 'Task D must appear in owner decision inbox');

    cleanupTestFiles(qPath, rPath, oPath, uPath);
  });

});
