import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import { redactObject } from './secretRedactor';
import { OwnerDecisionItem, QueueTask, RunnerState, UsageRecord, UsageState } from './types';

export class QueueStore {
  private queueFilePath: string;
  private runnerStateFilePath: string;
  private ownerDecisionsFilePath: string;
  private usageStateFilePath: string;

  constructor(
    queueFilePath?: string,
    runnerStateFilePath?: string,
    ownerDecisionsFilePath?: string,
    usageStateFilePath?: string
  ) {
    this.queueFilePath = queueFilePath || CONFIG.QUEUE_FILE_PATH;
    this.runnerStateFilePath = runnerStateFilePath || CONFIG.RUNNER_STATE_FILE_PATH;
    this.ownerDecisionsFilePath = ownerDecisionsFilePath || CONFIG.OWNER_DECISIONS_FILE_PATH;
    this.usageStateFilePath = usageStateFilePath || CONFIG.USAGE_STATE_FILE_PATH;

    this.ensureDataDirectoryExists();
  }

  private ensureDataDirectoryExists(): void {
    const dir = path.dirname(this.queueFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  // --- Queue Tasks ---
  public getQueueTasks(): QueueTask[] {
    if (!fs.existsSync(this.queueFilePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.queueFilePath, 'utf-8');
      return JSON.parse(data) as QueueTask[];
    } catch {
      return [];
    }
  }

  public saveQueueTasks(tasks: QueueTask[]): void {
    this.ensureDataDirectoryExists();
    const redactedTasks = redactObject(tasks);
    fs.writeFileSync(this.queueFilePath, JSON.stringify(redactedTasks, null, 2), 'utf-8');
  }

  public addQueueTask(task: QueueTask): QueueTask {
    const tasks = this.getQueueTasks();
    const redactedTask = redactObject(task);
    tasks.push(redactedTask);
    this.saveQueueTasks(tasks);
    return redactedTask;
  }

  public getQueueTask(taskId: string): QueueTask | undefined {
    return this.getQueueTasks().find(t => t.taskId === taskId);
  }

  public updateQueueTask(taskId: string, updates: Partial<QueueTask>): QueueTask | undefined {
    const tasks = this.getQueueTasks();
    const index = tasks.findIndex(t => t.taskId === taskId);
    if (index === -1) return undefined;

    const existing = tasks[index];
    const updated: QueueTask = redactObject({
      ...existing,
      ...updates
    });
    tasks[index] = updated;
    this.saveQueueTasks(tasks);
    return updated;
  }

  // --- Runner State & Kill Switch & Lease ---
  public getRunnerState(): RunnerState {
    if (!fs.existsSync(this.runnerStateFilePath)) {
      return { paused: false };
    }
    try {
      const data = fs.readFileSync(this.runnerStateFilePath, 'utf-8');
      return JSON.parse(data) as RunnerState;
    } catch {
      return { paused: false };
    }
  }

  public updateRunnerState(updates: Partial<RunnerState>): RunnerState {
    this.ensureDataDirectoryExists();
    const current = this.getRunnerState();
    const updated: RunnerState = {
      ...current,
      ...updates
    };
    fs.writeFileSync(this.runnerStateFilePath, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  }

  // --- Owner Decision Inbox ---
  public getOwnerDecisions(): OwnerDecisionItem[] {
    if (!fs.existsSync(this.ownerDecisionsFilePath)) {
      return [];
    }
    try {
      const data = fs.readFileSync(this.ownerDecisionsFilePath, 'utf-8');
      return JSON.parse(data) as OwnerDecisionItem[];
    } catch {
      return [];
    }
  }

  public addOwnerDecision(item: OwnerDecisionItem): void {
    this.ensureDataDirectoryExists();
    const decisions = this.getOwnerDecisions();
    const redactedItem = redactObject(item);
    decisions.push(redactedItem);
    fs.writeFileSync(this.ownerDecisionsFilePath, JSON.stringify(decisions, null, 2), 'utf-8');
  }

  // --- Usage & Budget State ---
  public getUsageState(): UsageState {
    const today = new Date().toISOString().slice(0, 10);
    if (!fs.existsSync(this.usageStateFilePath)) {
      return { dailyLunaCount: 0, dailySolCount: 0, lastResetDate: today, records: [] };
    }
    try {
      const data = fs.readFileSync(this.usageStateFilePath, 'utf-8');
      const parsed = JSON.parse(data) as UsageState;
      if (parsed.lastResetDate !== today) {
        parsed.dailyLunaCount = 0;
        parsed.dailySolCount = 0;
        parsed.lastResetDate = today;
      }
      return parsed;
    } catch {
      return { dailyLunaCount: 0, dailySolCount: 0, lastResetDate: today, records: [] };
    }
  }

  public recordOpenAiUsage(record: UsageRecord): void {
    this.ensureDataDirectoryExists();
    const usage = this.getUsageState();
    if (record.model.includes('sol')) {
      usage.dailySolCount += 1;
    } else {
      usage.dailyLunaCount += 1;
    }
    usage.records.push(record);
    fs.writeFileSync(this.usageStateFilePath, JSON.stringify(usage, null, 2), 'utf-8');
  }
}
