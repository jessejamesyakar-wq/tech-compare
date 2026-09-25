import { CONFIG } from './config';
import { QueueStore } from './queueStore';
import { WorktreeManager } from './worktreeManager';

export class LeaseManager {
  private queueStore: QueueStore;

  constructor(queueStore?: QueueStore) {
    this.queueStore = queueStore || new QueueStore();
  }

  public acquireLease(runnerId: string): { acquired: boolean; reason?: string } {
    const state = this.queueStore.getRunnerState();
    const now = Date.now();

    if (state.activeLeaseOwner && state.leaseExpiresAt) {
      const expiresAt = new Date(state.leaseExpiresAt).getTime();
      if (expiresAt > now && state.activeLeaseOwner !== runnerId) {
        return { acquired: false, reason: 'RUNNER_ALREADY_ACTIVE' };
      }
    }

    const leaseAcquiredAt = new Date(now).toISOString();
    const leaseExpiresAt = new Date(now + CONFIG.LEASE_TTL_MS).toISOString();

    this.queueStore.updateRunnerState({
      activeLeaseOwner: runnerId,
      leaseAcquiredAt,
      leaseExpiresAt
    });

    return { acquired: true };
  }

  public releaseLease(runnerId: string): void {
    const state = this.queueStore.getRunnerState();
    if (state.activeLeaseOwner === runnerId) {
      this.queueStore.updateRunnerState({
        activeLeaseOwner: undefined,
        leaseAcquiredAt: undefined,
        leaseExpiresAt: undefined
      });
    }
  }

  public recoverInterruptedTasks(worktreeManager?: WorktreeManager): void {
    const wtManager = worktreeManager || new WorktreeManager();
    const tasks = this.queueStore.getQueueTasks();
    const now = new Date().toISOString();

    for (const task of tasks) {
      if (task.status === 'RUNNING' || task.status === 'REVIEWING') {
        if (task.workspacePath) {
          wtManager.removeTaskWorktree(task.workspacePath);
        }
        this.queueStore.updateQueueTask(task.taskId, {
          status: 'BLOCKED',
          completedAt: now,
          failureClassification: 'INTERRUPTED_PREVIOUS_RUN'
        });
      }
    }
  }
}
