export interface DomainRateLimitConfig {
  domain: string;
  maxConcurrent: number;
  minIntervalMs: number;
  maxRequestsPerMinute: number;
  maxRetries: number;
  initialBackoffMs: number;
}

export interface DomainRateLimitStats {
  domain: string;
  activeRequests: number;
  totalRequestsProcessed: number;
  totalThrottled: number;
  totalRetried: number;
  consecutiveFailures: number;
  circuitOpen: boolean;
  lastRequestTime: number;
}

export class DomainRateLimiter {
  private static domainConfigs = new Map<string, DomainRateLimitConfig>();
  private static domainStats = new Map<string, DomainRateLimitStats>();
  private static activeQueue = new Map<string, Array<() => void>>();

  public static configureDomain(config: DomainRateLimitConfig): void {
    this.domainConfigs.set(config.domain.toLowerCase(), config);
  }

  public static getDomainConfig(domain: string): DomainRateLimitConfig {
    const normDomain = domain.toLowerCase();
    return (
      this.domainConfigs.get(normDomain) || {
        domain: normDomain,
        maxConcurrent: 2,
        minIntervalMs: 50,
        maxRequestsPerMinute: 60,
        maxRetries: 3,
        initialBackoffMs: 100
      }
    );
  }

  public static async scheduleFetch<T>(urlStr: string, fetchFn: () => Promise<T>): Promise<T> {
    const domain = this.extractDomain(urlStr);
    const config = this.getDomainConfig(domain);
    const stats = this.getOrCreateStats(domain);

    if (stats.circuitOpen) {
      throw new Error(`ENF_RATE_LIMIT_EXCEEDED: Domain '${domain}' circuit breaker is OPEN due to ${stats.consecutiveFailures} consecutive HTTP 429/503/timeout failures.`);
    }

    await this.acquireSlot(domain, config, stats);

    let attempts = 0;
    let currentBackoff = config.initialBackoffMs;

    while (attempts <= config.maxRetries) {
      try {
        attempts++;
        const startTime = Date.now();
        const result = await fetchFn();
        
        stats.consecutiveFailures = 0;
        stats.lastRequestTime = startTime;
        return result;
      } catch (err: any) {
        const isRetryable =
          err?.message?.includes('429') ||
          err?.message?.includes('503') ||
          err?.message?.includes('TIMEOUT') ||
          err?.status === 429 ||
          err?.status === 503;

        stats.consecutiveFailures++;

        if (stats.consecutiveFailures >= 5) {
          stats.circuitOpen = true;
          throw new Error(`ENF_RATE_LIMIT_EXCEEDED: Domain '${domain}' circuit breaker tripped. Consecutive failures reached threshold 5.`);
        }

        if (isRetryable && attempts <= config.maxRetries) {
          stats.totalThrottled++;
          stats.totalRetried++;
          // Exponential backoff with random jitter (+/- 20%)
          const jitter = currentBackoff * (0.8 + Math.random() * 0.4);
          await new Promise((res) => setTimeout(res, jitter));
          currentBackoff *= 2;
        } else {
          throw err;
        }
      } finally {
        this.releaseSlot(domain, stats);
      }
    }

    throw new Error(`ENF_RATE_LIMIT_EXCEEDED: Max retries (${config.maxRetries}) exceeded for domain '${domain}'.`);
  }

  private static async acquireSlot(domain: string, config: DomainRateLimitConfig, stats: DomainRateLimitStats): Promise<void> {
    if (stats.activeRequests < config.maxConcurrent) {
      const now = Date.now();
      const timeSinceLast = now - stats.lastRequestTime;
      if (timeSinceLast < config.minIntervalMs) {
        await new Promise((res) => setTimeout(res, config.minIntervalMs - timeSinceLast));
      }

      stats.activeRequests++;
      stats.totalRequestsProcessed++;
      return;
    }

    stats.totalThrottled++;

    return new Promise<void>((resolve) => {
      if (!this.activeQueue.has(domain)) {
        this.activeQueue.set(domain, []);
      }
      this.activeQueue.get(domain)!.push(() => {
        stats.activeRequests++;
        stats.totalRequestsProcessed++;
        resolve();
      });
    });
  }

  private static releaseSlot(domain: string, stats: DomainRateLimitStats): void {
    stats.activeRequests = Math.max(0, stats.activeRequests - 1);
    const queue = this.activeQueue.get(domain);
    if (queue && queue.length > 0) {
      const next = queue.shift()!;
      next();
    }
  }

  public static getDomainStats(domain: string): DomainRateLimitStats {
    return { ...this.getOrCreateStats(domain) };
  }

  public static resetDomainStats(domain?: string): void {
    if (domain) {
      this.domainStats.delete(domain.toLowerCase());
      this.activeQueue.delete(domain.toLowerCase());
    } else {
      this.domainStats.clear();
      this.activeQueue.clear();
    }
  }

  private static getOrCreateStats(domain: string): DomainRateLimitStats {
    const normDomain = domain.toLowerCase();
    if (!this.domainStats.has(normDomain)) {
      this.domainStats.set(normDomain, {
        domain: normDomain,
        activeRequests: 0,
        totalRequestsProcessed: 0,
        totalThrottled: 0,
        totalRetried: 0,
        consecutiveFailures: 0,
        circuitOpen: false,
        lastRequestTime: 0
      });
    }
    return this.domainStats.get(normDomain)!;
  }

  private static extractDomain(urlStr: string): string {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname;
    } catch {
      return 'unknown_domain';
    }
  }
}
