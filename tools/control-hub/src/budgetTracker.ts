import { CONFIG } from './config';
import { QueueStore } from './queueStore';

export class BudgetTracker {
  private queueStore: QueueStore;

  constructor(queueStore?: QueueStore) {
    this.queueStore = queueStore || new QueueStore();
  }

  public canCallLuna(): boolean {
    const usage = this.queueStore.getUsageState();
    return (
      usage.dailyLunaCount < CONFIG.MAX_LUNA_REVIEWS_PER_DAY &&
      (usage.totalOpenAiCalls || (usage.dailyLunaCount + usage.dailySolCount)) < CONFIG.MAX_TOTAL_OPENAI_CALLS_PER_DAY
    );
  }

  public canCallSol(): boolean {
    const usage = this.queueStore.getUsageState();
    return (
      usage.dailySolCount < CONFIG.MAX_SOL_REVIEWS_PER_DAY &&
      (usage.totalOpenAiCalls || (usage.dailyLunaCount + usage.dailySolCount)) < CONFIG.MAX_TOTAL_OPENAI_CALLS_PER_DAY
    );
  }

  public recordUsage(
    taskId: string,
    model: string,
    inputTokens: number = 0,
    outputTokens: number = 0,
    responseId?: string,
    callCategory?: 'QUEUE_LUNA' | 'QUEUE_SOL' | 'MANUAL_LUNA' | 'MANUAL_SOL'
  ): void {
    const timestamp = new Date().toISOString();
    const category = callCategory || (model.includes('sol') ? 'QUEUE_SOL' : 'QUEUE_LUNA');
    this.queueStore.recordOpenAiUsage({
      taskId,
      model,
      inputTokens,
      outputTokens,
      responseId,
      callCategory: category,
      timestamp
    });
  }
}
