import { CONFIG } from './config';
import { QueueStore } from './queueStore';

export class BudgetTracker {
  private queueStore: QueueStore;

  constructor(queueStore?: QueueStore) {
    this.queueStore = queueStore || new QueueStore();
  }

  public canCallLuna(): boolean {
    const usage = this.queueStore.getUsageState();
    return usage.dailyLunaCount < CONFIG.MAX_LUNA_REVIEWS_PER_DAY;
  }

  public canCallSol(): boolean {
    const usage = this.queueStore.getUsageState();
    return usage.dailySolCount < CONFIG.MAX_SOL_REVIEWS_PER_DAY;
  }

  public recordUsage(taskId: string, model: string, inputTokens: number = 0, outputTokens: number = 0): void {
    const timestamp = new Date().toISOString();
    this.queueStore.recordOpenAiUsage({
      taskId,
      model,
      inputTokens,
      outputTokens,
      timestamp
    });
  }
}
