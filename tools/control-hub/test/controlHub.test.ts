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
import { CONFIG } from '../src/config';

describe('ACELEETME Control Hub V0.2 — Local Execution Test Suite', () => {

  test('1. Governance: GREEN task is accepted', () => {
    const res = validateTaskGovernance('REPOSITORY_INSPECTION', 'GREEN');
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.reason, undefined);
  });

  test('2. Governance: RED task is rejected locally before worktree creation', () => {
    const res = validateTaskGovernance('PRODUCTION_DEPLOY' as any, 'RED');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.reason, 'TASK_REQUIRES_HIGHER_GOVERNANCE');
  });

  test('3. Governance: YELLOW task is rejected locally before worktree creation', () => {
    const res = validateTaskGovernance('REPOSITORY_INSPECTION', 'YELLOW');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.reason, 'TASK_REQUIRES_HIGHER_GOVERNANCE');
  });

  test('4. Secret Redaction: API keys and sensitive tokens are redacted', () => {
    process.env.GEMINI_API_KEY = 'test_gemini_key_67890';
    process.env.ACELEETME_GITHUB_READ_TOKEN = 'test_github_token_fghij';

    const rawStr = 'Log with test_gemini_key_67890 and test_github_token_fghij and Authorization: Bearer token_xyz';
    const redacted = redactSecrets(rawStr);

    assert.strictEqual(redacted.includes('test_gemini_key_67890'), false);
    assert.strictEqual(redacted.includes('test_github_token_fghij'), false);
    assert.strictEqual(redacted.includes('[REDACTED_GEMINI_API_KEY]'), true);
    assert.strictEqual(redacted.includes('[REDACTED_ACELEETME_GITHUB_READ_TOKEN]'), true);
    assert.strictEqual(redacted.includes('token_xyz'), false);
  });

  test('5. TaskStore: Stores tasks and redacts secrets when persisting', () => {
    const testStorePath = path.join(__dirname, 'test-v02-state.json');
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

    const store = new TaskStore(testStorePath);
    store.addTask({
      taskId: 'test_task_v02',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      instruction: 'Read with key test_gemini_key_67890',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const tasks = store.getAllTasks();
    assert.strictEqual(tasks.length, 1);
    assert.strictEqual(tasks[0].instruction.includes('test_gemini_key_67890'), false);

    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
  });

  test('6. Risk Gating: Synthetic RED task is blocked without creating worktree or process', async () => {
    const testStorePath = path.join(__dirname, 'test-red-v02-state.json');
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

    let worktreeCreated = false;
    const mockWorktreeManager = {
      createTaskWorktree: () => {
        worktreeCreated = true;
        return { workspacePath: '/mock/path', originMainHead: '249d3ead' };
      },
      removeTaskWorktree: () => ({ success: true }),
      checkReadOnlyViolation: () => ({ clean: true, modifiedFiles: [] })
    } as unknown as WorktreeManager;

    const store = new TaskStore(testStorePath);
    const orchestrator = new Orchestrator(store, mockWorktreeManager);

    const result = await orchestrator.submitAndExecuteTask('PRODUCTION_DEPLOY' as any, 'RED', 'Deploy to production');

    assert.strictEqual(worktreeCreated, false, 'Worktree must NOT be created for RED task');
    assert.strictEqual(result.status, 'BLOCKED');
    assert.strictEqual(result.workspacePath, undefined, 'Workspace path must be undefined');
    assert.strictEqual(result.failureClassification, 'TASK_REQUIRES_HIGHER_GOVERNANCE');

    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
  });

  test('7. Worktree Manager: Creation, origin/main HEAD pinning, and Cleanup', () => {
    const manager = new WorktreeManager();
    const taskId = `test_wt_${Date.now()}`;

    const info = manager.createTaskWorktree(taskId);
    assert.strictEqual(typeof info.workspacePath, 'string');
    assert.strictEqual(typeof info.originMainHead, 'string');
    assert.strictEqual(info.originMainHead.length, 40);
    assert.strictEqual(fs.existsSync(info.workspacePath), true);
    assert.strictEqual(info.workspacePath.startsWith(CONFIG.WORKSPACES_ROOT), true);

    const cleanup = manager.removeTaskWorktree(info.workspacePath);
    assert.strictEqual(cleanup.success, true);
    assert.strictEqual(fs.existsSync(info.workspacePath), false);
  });

  test('8. Worktree Safety: Refuses to remove canonical repo path', () => {
    const manager = new WorktreeManager();
    const cleanup = manager.removeTaskWorktree(CONFIG.CANONICAL_REPO_PATH);
    assert.strictEqual(cleanup.success, false);
    assert.strictEqual(cleanup.error?.includes('SAFETY VIOLATION'), true);
  });

  test('9. Local Executor: REPOSITORY_INSPECTION returns evidence from worktree', () => {
    const manager = new WorktreeManager();
    const executor = new LocalTaskExecutor();
    const taskId = `test_exec_${Date.now()}`;

    const info = manager.createTaskWorktree(taskId);
    const execResult = executor.executeTaskInWorktree('REPOSITORY_INSPECTION', info.workspacePath, info.originMainHead);

    assert.strictEqual(execResult.exitCode, 0);
    assert.strictEqual(execResult.output.includes('[LOCAL_EXECUTOR]'), true);
    assert.strictEqual(execResult.output.includes('package_name: tech-compare'), true);
    assert.strictEqual(execResult.output.includes('postgres_commerce_repository: PRESENT'), true);
    assert.strictEqual(execResult.output.includes('price_history_and_anomaly_engine: PRESENT'), true);

    manager.removeTaskWorktree(info.workspacePath);
  });

  test('10. Read-Only Violation Detector: Flags READONLY_VIOLATION when tracked file modified', () => {
    const manager = new WorktreeManager();
    const taskId = `test_violation_${Date.now()}`;

    const info = manager.createTaskWorktree(taskId);
    const targetFile = path.join(info.workspacePath, 'package.json');

    // Mutate tracked file
    fs.appendFileSync(targetFile, '\n// test modification\n');

    const check = manager.checkReadOnlyViolation(info.workspacePath);
    assert.strictEqual(check.clean, false);
    assert.strictEqual(check.modifiedFiles.length > 0, true);

    manager.removeTaskWorktree(info.workspacePath);
  });

  test('11. Antigravity Analysis: Separates LOCAL_EXECUTOR evidence from ANTIGRAVITY_ANALYSIS output', async () => {
    const analysis = new AntigravityAnalysis();
    const sanitizedEvidence = '[LOCAL_EXECUTOR] Evidence: package_name: tech-compare';

    const result = await analysis.analyzeInspectionResult(sanitizedEvidence);
    assert.strictEqual(result.includes('[ANTIGRAVITY_ANALYSIS]'), true);
  });

});
