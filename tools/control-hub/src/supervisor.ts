import { CONFIG } from './config';
import { QueueStore } from './queueStore';

export class Supervisor {
  private queueStore: QueueStore;

  constructor(queueStore?: QueueStore) {
    this.queueStore = queueStore || new QueueStore();
  }

  public checkAndRecordRestart(): { allowed: boolean; restartCount: number; status: string } {
    const state = this.queueStore.getRunnerState();
    const now = new Date();
    const nowIso = now.toISOString();

    let windowStart = state.lastRestartWindowStart ? new Date(state.lastRestartWindowStart) : now;
    let count = state.restartCount || 0;

    // Reset 1-hour window if more than 60 minutes have elapsed
    const elapsedMinutes = (now.getTime() - windowStart.getTime()) / (1000 * 60);
    if (elapsedMinutes >= 60) {
      windowStart = now;
      count = 0;
    }

    count += 1;

    if (count > CONFIG.MAX_SUPERVISOR_RESTARTS_PER_HOUR) {
      this.queueStore.updateRunnerState({
        restartCount: count,
        lastRestartWindowStart: windowStart.toISOString(),
        supervisorStatus: 'RUNNER_RESTART_LIMIT_REACHED'
      });
      return {
        allowed: false,
        restartCount: count,
        status: 'RUNNER_RESTART_LIMIT_REACHED'
      };
    }

    this.queueStore.updateRunnerState({
      restartCount: count,
      lastRestartWindowStart: windowStart.toISOString(),
      supervisorStatus: 'HEALTHY'
    });

    return {
      allowed: true,
      restartCount: count,
      status: 'HEALTHY'
    };
  }

  public getStatus(): { supervisorStatus: string; restartCount: number; windowStart?: string } {
    const state = this.queueStore.getRunnerState();
    return {
      supervisorStatus: state.supervisorStatus || 'HEALTHY',
      restartCount: state.restartCount || 0,
      windowStart: state.lastRestartWindowStart
    };
  }
}
