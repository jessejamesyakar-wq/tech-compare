import { FullEvidenceCandidatePayload, evaluateCandidateProvenance, ProvenanceGateEvaluationResult } from '../canary/provenanceEnforcementGate';

export type ReleaseFunction = () => void;

export class ConcurrencyMutex {
  private activeLocks = new Set<string>();
  private lockWaitQueues = new Map<string, Array<() => void>>();
  private lockWaitTimes: number[] = [];
  private totalLockAcquisitions = 0;
  private totalLockContentions = 0;

  public async acquireLock(resourceKey: string, timeoutMs: number = 5000): Promise<ReleaseFunction> {
    const startTime = Date.now();

    if (!this.activeLocks.has(resourceKey)) {
      this.activeLocks.add(resourceKey);
      this.totalLockAcquisitions++;
      return () => this.releaseLock(resourceKey);
    }

    this.totalLockContentions++;

    return new Promise<ReleaseFunction>((resolve, reject) => {
      const timeoutTimer = setTimeout(() => {
        const queue = this.lockWaitQueues.get(resourceKey) || [];
        const index = queue.indexOf(grantLock);
        if (index !== -1) {
          queue.splice(index, 1);
        }
        reject(new Error(`ENF_CONCURRENCY_LOCK_TIMEOUT: Lock acquisition timed out for resource '${resourceKey}' after ${timeoutMs}ms.`));
      }, timeoutMs);

      const grantLock = () => {
        clearTimeout(timeoutTimer);
        this.activeLocks.add(resourceKey);
        this.lockWaitTimes.push(Date.now() - startTime);
        this.totalLockAcquisitions++;
        resolve(() => this.releaseLock(resourceKey));
      };

      if (!this.lockWaitQueues.has(resourceKey)) {
        this.lockWaitQueues.set(resourceKey, []);
      }
      this.lockWaitQueues.get(resourceKey)!.push(grantLock);
    });
  }

  private releaseLock(resourceKey: string): void {
    const queue = this.lockWaitQueues.get(resourceKey);
    if (queue && queue.length > 0) {
      const nextInLine = queue.shift()!;
      nextInLine();
    } else {
      this.activeLocks.delete(resourceKey);
      this.lockWaitQueues.delete(resourceKey);
    }
  }

  public isLocked(resourceKey: string): boolean {
    return this.activeLocks.has(resourceKey);
  }

  public getStats() {
    const sortedWait = [...this.lockWaitTimes].sort((a, b) => a - b);
    const p50 = sortedWait.length ? sortedWait[Math.floor(sortedWait.length * 0.5)] : 0;
    const p95 = sortedWait.length ? sortedWait[Math.floor(sortedWait.length * 0.95)] : 0;

    return {
      activeLocksCount: this.activeLocks.size,
      totalAcquisitions: this.totalLockAcquisitions,
      totalContentions: this.totalLockContentions,
      lockWaitP50Ms: p50,
      lockWaitP95Ms: p95
    };
  }
}

export class ConcurrencyHardenedEvaluator {
  private mutex = new ConcurrencyMutex();

  public async evaluateCandidateWithLock(
    candidate: FullEvidenceCandidatePayload
  ): Promise<ProvenanceGateEvaluationResult> {
    const resourceKey = `root:${candidate.targetRootId}`;
    const release = await this.mutex.acquireLock(resourceKey);

    try {
      return evaluateCandidateProvenance(candidate);
    } finally {
      release();
    }
  }

  public async processBatchConcurrently<T, R>(
    items: T[],
    maxConcurrency: number,
    processor: (item: T) => Promise<R>
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    let currentIndex = 0;

    const worker = async () => {
      while (currentIndex < items.length) {
        const index = currentIndex++;
        results[index] = await processor(items[index]);
      }
    };

    const workers = Array.from({ length: Math.min(maxConcurrency, items.length) }, () => worker());
    await Promise.all(workers);

    return results;
  }

  public getMutexStats() {
    return this.mutex.getStats();
  }
}
