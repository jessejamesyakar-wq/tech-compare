import crypto from 'crypto';
import { AntigravityClient } from './antigravityClient';
import { CONFIG } from './config';
import { validateTaskGovernance } from './governance';
import { redactSecrets } from './secretRedactor';
import { TaskStore } from './taskStore';
import { RiskLevel, TaskRecord, TaskType } from './types';

export class Orchestrator {
  private taskStore: TaskStore;
  private client: AntigravityClient | null = null;

  constructor(taskStore?: TaskStore, client?: AntigravityClient) {
    this.taskStore = taskStore || new TaskStore();
    if (client) {
      this.client = client;
    }
  }

  private getClient(): AntigravityClient {
    if (!this.client) {
      this.client = new AntigravityClient();
    }
    return this.client;
  }

  public async submitAndExecuteTask(type: TaskType, risk: RiskLevel, instruction: string): Promise<TaskRecord> {
    const taskId = `task_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const createdAt = new Date().toISOString();

    const initialRecord: TaskRecord = {
      taskId,
      type,
      risk,
      instruction: redactSecrets(instruction),
      status: 'PENDING',
      createdAt,
      attempts: 0
    };

    this.taskStore.addTask(initialRecord);

    // Step 1: Risk & Governance Gating BEFORE API dispatch
    const governanceCheck = validateTaskGovernance(type, risk);
    if (!governanceCheck.ok) {
      const blockedRecord = this.taskStore.updateTask(taskId, {
        status: 'BLOCKED',
        completedAt: new Date().toISOString(),
        failureClassification: governanceCheck.reason || 'TASK_REQUIRES_HIGHER_GOVERNANCE',
        result: 'REJECTED_LOCAL_GOVERNANCE: Risk level or task type requires higher approval before dispatch.'
      })!;
      return blockedRecord;
    }

    // Step 2: Update state to RUNNING
    const startedAt = new Date().toISOString();
    this.taskStore.updateTask(taskId, {
      status: 'RUNNING',
      startedAt
    });

    // Step 3: Enforce Repository Preflight Guard & Working Directory Contract
    const repositoryPreflightPrompt = `

Pre-Task Repository Guard:
1. Working directory MUST be /workspace/aceleetme.
2. Check if repository exists: run \`test -d /workspace/aceleetme/.git\`.
3. If /workspace/aceleetme/.git is absent, STOP IMMEDIATELY and return REMOTE_REPOSITORY_NOT_MOUNTED.
4. If /workspace/aceleetme/.git is present, obtain:
   - \`git -C /workspace/aceleetme branch --show-current\`
   - \`git -C /workspace/aceleetme rev-parse HEAD\`
5. Include branch and HEAD explicitly in response output before executing the task.

Task Instruction:
${instruction}`;

    // Step 4: Dispatch to Antigravity API
    try {
      const client = this.getClient();
      const execResult = await client.executeTask(repositoryPreflightPrompt);

      const completedAt = new Date().toISOString();
      const finalRecord = this.taskStore.updateTask(taskId, {
        status: execResult.status,
        startedAt,
        completedAt,
        interactionId: execResult.interactionId,
        attempts: execResult.attempts,
        result: execResult.outputText,
        failureClassification: execResult.failureClassification
      })!;

      return finalRecord;
    } catch (err: any) {
      const completedAt = new Date().toISOString();
      const errorMsg = redactSecrets(err.message || String(err));
      const failedRecord = this.taskStore.updateTask(taskId, {
        status: 'FAILED',
        startedAt,
        completedAt,
        attempts: 1,
        failureClassification: `UNHANDLED_ORCHESTRATOR_ERROR: ${errorMsg}`
      })!;

      return failedRecord;
    }
  }

  public getTaskState(taskId: string): TaskRecord | undefined {
    return this.taskStore.getTask(taskId);
  }

  public getAllTasks(): TaskRecord[] {
    return this.taskStore.getAllTasks();
  }
}
