export function redactSecrets(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let redacted = text;

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.length > 0) {
    redacted = redacted.split(apiKey).join('[REDACTED_GEMINI_API_KEY]');
  }

  const githubToken = process.env.ACELEETME_GITHUB_READ_TOKEN;
  if (githubToken && githubToken.length > 0) {
    redacted = redacted.split(githubToken).join('[REDACTED_ACELEETME_GITHUB_READ_TOKEN]');
  }

  // Redact Authorization headers and Basic/Bearer tokens
  redacted = redacted.replace(/Authorization:\s*(Basic|Bearer)\s+[A-Za-z0-9+/=_-]+/gi, 'Authorization: [REDACTED_HEADER]');
  redacted = redacted.replace(/["']?Authorization["']?\s*:\s*["'](Basic|Bearer)\s+[A-Za-z0-9+/=_-]+["']/gi, '"Authorization": "[REDACTED_HEADER]"');
  redacted = redacted.replace(/x-goog-api-key\s*=\s*[^\s&]+/gi, 'x-goog-api-key=[REDACTED]');
  redacted = redacted.replace(/["']?x-goog-api-key["']?\s*:\s*["'][^"']+["']/gi, '"x-goog-api-key": "[REDACTED]"');

  return redacted;
}

export function redactObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  const jsonStr = JSON.stringify(obj);
  const redactedStr = redactSecrets(jsonStr);
  return JSON.parse(redactedStr) as T;
}
