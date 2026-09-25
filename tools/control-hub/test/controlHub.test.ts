import assert from 'node:assert';
import test, { describe } from 'node:test';
import path from 'path';
import fs from 'fs';

import { validateTaskGovernance } from '../src/governance';
import { redactObject, redactSecrets } from '../src/secretRedactor';
import { TaskStore } from '../src/taskStore';
import { Orchestrator } from '../src/orchestrator';
import { AntigravityClient } from '../src/antigravityClient';
import { TaskExecutionResult } from '../src/types';

describe('ACELEETME Control Hub V0.1 — Unit Test Suite', () => {

  test('1. Governance: GREEN task is accepted', () => {
    const res = validateTaskGovernance('REPOSITORY_INSPECTION', 'GREEN');
    assert.strictEqual(res.ok, true);
    assert.strictEqual(res.reason, undefined);
  });

  test('2. Governance: RED task is rejected locally before dispatch', () => {
    const res = validateTaskGovernance('PRODUCTION_DEPLOY' as any, 'RED');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.reason, 'TASK_REQUIRES_HIGHER_GOVERNANCE');
  });

  test('3. Governance: YELLOW task is rejected locally before dispatch', () => {
    const res = validateTaskGovernance('REPOSITORY_INSPECTION', 'YELLOW');
    assert.strictEqual(res.ok, false);
    assert.strictEqual(res.reason, 'TASK_REQUIRES_HIGHER_GOVERNANCE');
  });

  test('4. Secret Redaction: API key and GitHub tokens are redacted from strings and objects', () => {
    process.env.GEMINI_API_KEY = 'test_gemini_key_12345';
    process.env.ACELEETME_GITHUB_READ_TOKEN = 'test_github_token_abcde';

    const rawStr = 'Error accessing with key test_gemini_key_12345 and token test_github_token_abcde and Authorization: Bearer secret_bearer_token';
    const redacted = redactSecrets(rawStr);

    assert.strictEqual(redacted.includes('test_gemini_key_12345'), false);
    assert.strictEqual(redacted.includes('test_github_token_abcde'), false);
    assert.strictEqual(redacted.includes('[REDACTED_GEMINI_API_KEY]'), true);
    assert.strictEqual(redacted.includes('[REDACTED_ACELEETME_GITHUB_READ_TOKEN]'), true);
    assert.strictEqual(redacted.includes('secret_bearer_token'), false);

    const obj = {
      apiKey: 'test_gemini_key_12345',
      header: 'Authorization: Basic x-oauth-basic:test_github_token_abcde'
    };
    const redactedObj = redactObject(obj);
    assert.strictEqual(redactedObj.apiKey.includes('test_gemini_key_12345'), false);
  });

  test('5. TaskStore: Stores tasks and redacts secrets when persisting', () => {
    const testStorePath = path.join(__dirname, 'test-state.json');
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

    const store = new TaskStore(testStorePath);
    store.addTask({
      taskId: 'test_task_1',
      type: 'REPOSITORY_INSPECTION',
      risk: 'GREEN',
      instruction: 'Read with key test_gemini_key_12345',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      attempts: 0
    });

    const tasks = store.getAllTasks();
    assert.strictEqual(tasks.length, 1);
    assert.strictEqual(tasks[0].instruction.includes('test_gemini_key_12345'), false);

    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
  });

  test('6. Risk Gating: Synthetic RED task is blocked without calling Antigravity Client', async () => {
    const testStorePath = path.join(__dirname, 'test-red-state.json');
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

    let apiCalled = false;
    const mockClient = {
      executeTask: async (): Promise<TaskExecutionResult> => {
        apiCalled = true;
        return { success: true, status: 'COMPLETED', attempts: 1 };
      }
    } as unknown as AntigravityClient;

    const store = new TaskStore(testStorePath);
    const orchestrator = new Orchestrator(store, mockClient);

    const result = await orchestrator.submitAndExecuteTask('PRODUCTION_DEPLOY' as any, 'RED', 'Deploy to production');

    assert.strictEqual(apiCalled, false, 'API must NOT be called for RED task');
    assert.strictEqual(result.status, 'BLOCKED');
    assert.strictEqual(result.interactionId, undefined, 'Interaction ID must be undefined');
    assert.strictEqual(result.failureClassification, 'TASK_REQUIRES_HIGHER_GOVERNANCE');

    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
  });

  test('7. Orchestrator: Valid GREEN task calls client and preserves real interaction ID', async () => {
    const testStorePath = path.join(__dirname, 'test-green-state.json');
    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);

    const mockClient = {
      executeTask: async (): Promise<TaskExecutionResult> => {
        return {
          success: true,
          status: 'COMPLETED',
          outputText: 'branch: main\nHEAD: 249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
          interactionId: 'v1_real_interaction_id_999',
          attempts: 1
        };
      }
    } as unknown as AntigravityClient;

    const store = new TaskStore(testStorePath);
    const orchestrator = new Orchestrator(store, mockClient);

    const result = await orchestrator.submitAndExecuteTask('REPOSITORY_INSPECTION', 'GREEN', 'Inspect repo');

    assert.strictEqual(result.status, 'COMPLETED');
    assert.strictEqual(result.interactionId, 'v1_real_interaction_id_999');
    assert.strictEqual(result.attempts, 1);
    assert.strictEqual(result.result?.includes('249d3ead0ee1d3ea5fda40d53208f45513f0dd44'), true);

    if (fs.existsSync(testStorePath)) fs.unlinkSync(testStorePath);
  });
});
