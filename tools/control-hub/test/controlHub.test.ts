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
import { CONFIG } from '../src/config';
import { ReviewPackage } from '../src/types';

describe('ACELEETME Control Hub V0.3 — Local Execution & Reviewer Test Suite', () => {

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
    const testStorePath = path.join(__dirname, 'test-v03-state.json');
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

    const store = new TaskStore(testStorePath);
    store.addTask({
      taskId: 'test_task_v03',
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

  test('6. Risk Gating: Synthetic RED task is blocked without creating worktree, process, or OpenAI calls', async () => {
    const testStorePath = path.join(__dirname, 'test-red-v03-state.json');
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

    let reviewerCalls = 0;
    const mockReviewer = {
      reviewTask: async () => {
        reviewerCalls++;
        return {
          lunaReview: { decision: 'PASS_GREEN' },
          finalDecision: 'PASS_GREEN',
          openAiCallCount: 1
        };
      }
    } as unknown as OpenAIReviewer;

    const store = new TaskStore(testStorePath);
    const orchestrator = new Orchestrator(store, mockWorktreeManager, undefined, undefined, mockReviewer);

    const result = await orchestrator.submitAndExecuteTask('PRODUCTION_DEPLOY' as any, 'RED', 'Deploy to production');

    assert.strictEqual(worktreeCreated, false, 'Worktree must NOT be created for RED task');
    assert.strictEqual(reviewerCalls, 0, 'OpenAI Reviewer must NOT be called for RED task');
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

  test('12. OpenAI Reviewer: Luna default routing and response ID preservation', async () => {
    const reviewer = new OpenAIReviewer();
    const pkg: ReviewPackage = {
      taskId: 'task_luna_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      canonicalHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
      workspaceHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
      commandResults: '[LOCAL_EXECUTOR] package_name: tech-compare'
    };

    const res = await reviewer.reviewTask(pkg);
    assert.strictEqual(typeof res.finalDecision, 'string');
    assert.strictEqual(typeof res.lunaReview.responseId, 'string');
    assert.strictEqual(res.lunaReview.modelUsed.includes('gpt-5.6-luna'), true);
    assert.strictEqual(res.openAiCallCount, 1);
  });

  test('13. OpenAI Reviewer: Sol escalation routing on uncertainty or owner decision', async () => {
    const reviewer = new OpenAIReviewer();
    const pkg: ReviewPackage = {
      taskId: 'task_sol_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      canonicalHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
      workspaceHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
      commandResults: '[LOCAL_EXECUTOR] Security ambiguity detected'
    };

    // Mock Luna returning OWNER_DECISION_REQUIRED
    (reviewer as any).callResponsesApi = async (model: string, pkg: any, prev?: any) => {
      if (model.includes('luna')) {
        return {
          decision: 'OWNER_DECISION_REQUIRED',
          summary: 'Uncertain about policy implications',
          verifiedEvidenceUsed: ['canonicalHead'],
          limitations: ['UNCERTAIN_SECURITY_SCOPE'],
          risks: ['Potential scope ambiguity'],
          requiredNextAction: 'Escalate to Sol',
          escalationRequired: true,
          modelUsed: model,
          responseId: 'resp_luna_123'
        };
      } else {
        return {
          decision: 'PASS_GREEN',
          summary: 'Independent Sol analysis confirmed zero risk',
          verifiedEvidenceUsed: ['canonicalHead'],
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
    assert.strictEqual(res.openAiCallCount, 2, 'Call count must be 2 after escalation');
  });

  test('14. OpenAI Reviewer: No automatic Sol escalation for clean PASS_GREEN', async () => {
    const reviewer = new OpenAIReviewer();
    const pkg: ReviewPackage = {
      taskId: 'task_no_sol_001',
      taskType: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      canonicalHead: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44'
    };

    (reviewer as any).callResponsesApi = async (model: string) => ({
      decision: 'PASS_GREEN',
      summary: 'Clean evidence',
      verifiedEvidenceUsed: ['canonicalHead'],
      limitations: [],
      risks: [],
      requiredNextAction: 'None',
      escalationRequired: false,
      modelUsed: model,
      responseId: 'resp_luna_pass'
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
      JSON.stringify({
        decision: 'PASS_GREEN',
        summary: 'Model tried to overrule failed typecheck'
      }),
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
      JSON.stringify({
        decision: 'PASS_WITH_LIMITATION',
        summary: 'Inspection ran without head commit',
        verifiedEvidenceUsed: [],
        limitations: []
      }),
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

    // Override fetch to simulate API failure
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
      // Attempt 0 + 1 Retry = 2 total fetch attempts
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

});
