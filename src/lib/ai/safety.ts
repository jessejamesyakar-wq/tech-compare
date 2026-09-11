// src/lib/ai/safety.ts
/**
 * Security, input validation and rate limiting for /api/ai-assistant route.
 */

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

const requestLog = new Map<string, number[]>();

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  retryAfterMs?: number;
} {
  const now = Date.now();
  const timestamps = (requestLog.get(identifier) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = timestamps[0];
    return { allowed: false, retryAfterMs: WINDOW_MS - (now - oldest) };
  }

  timestamps.push(now);
  requestLog.set(identifier, timestamps);

  if (requestLog.size > 5000) {
    const cutoff = now - WINDOW_MS;
    for (const [key, times] of requestLog) {
      if (times.every((t) => t < cutoff)) requestLog.delete(key);
    }
  }

  return { allowed: true };
}

const MAX_MESSAGE_LENGTH = 500;

export function validateUserMessage(message: string): {
  valid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!message || !message.trim()) {
    return { valid: false, error: "Mesaj boş olamaz." };
  }

  const trimmed = message.trim();

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `Mesajın biraz uzun oldu (${trimmed.length}/${MAX_MESSAGE_LENGTH} karakter). Kısaltıp tekrar yazar mısın?`,
    };
  }

  return { valid: true, sanitized: trimmed };
}

const INJECTION_PATTERNS = [
  /ignore (all|previous|above) instructions/i,
  /(önceki|yukarıdaki|sistem) talimatlar[ıi]n[ıi]? (yoksay|unut|iptal et)/i,
  /you are now/i,
  /artık sen/i,
  /system prompt/i,
];

export function flagsPromptInjection(message: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(message));
}
