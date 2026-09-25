import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import { ControlHubState, TaskRecord } from './types';
import { redactObject } from './secretRedactor';

export class TaskStore {
  private filePath: string;
  private state: ControlHubState;

  constructor(customPath?: string) {
    this.filePath = customPath || CONFIG.STATE_FILE_PATH;
    this.state = this.loadState();
  }

  private loadState(): ControlHubState {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw) as ControlHubState;
        return redactObject(parsed);
      }
    } catch {
      // Ignore read errors and initialize fresh state
    }

    return {
      version: '0.1.0',
      lastUpdated: new Date().toISOString(),
      tasks: []
    };
  }

  public saveState(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.state.lastUpdated = new Date().toISOString();
    const redacted = redactObject(this.state);
    fs.writeFileSync(this.filePath, JSON.stringify(redacted, null, 2), 'utf-8');
  }

  public getAllTasks(): TaskRecord[] {
    return [...this.state.tasks];
  }

  public getTask(taskId: string): TaskRecord | undefined {
    return this.state.tasks.find((t) => t.taskId === taskId);
  }

  public addTask(task: TaskRecord): void {
    const redactedTask = redactObject(task);
    this.state.tasks.push(redactedTask);
    this.saveState();
  }

  public updateTask(taskId: string, updates: Partial<TaskRecord>): TaskRecord | undefined {
    const taskIndex = this.state.tasks.findIndex((t) => t.taskId === taskId);
    if (taskIndex === -1) {
      return undefined;
    }

    const updated = {
      ...this.state.tasks[taskIndex],
      ...updates
    };

    this.state.tasks[taskIndex] = redactObject(updated);
    this.saveState();
    return this.state.tasks[taskIndex];
  }
}
