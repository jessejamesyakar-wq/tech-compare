// src/lib/ai/modelRouter.ts
/**
 * Robust Gemini API caller with model fallback chain, retries, and timeout.
 * Replaces ad-hoc "try each model in sequence" logic previously inline in
 * src/app/api/ai-assistant/route.ts.
 */

export interface ModelCallOptions {
  contents: any[];
  systemInstruction?: string;
  tools?: any[];
  generationConfig?: Record<string, any>;
  signal?: AbortSignal;
}

export interface ModelCallResult {
  ok: boolean;
  data?: any;
  modelUsed?: string;
  error?: string;
}

// Priority order: strongest reasoning first, cheap/lite models only as a
// last resort when everything above is out of quota or failing.
const MODEL_PRIORITY = [
  "gemini-3.1-pro-preview", // best reasoning — use for compare/budget analysis and open-ended Q&A
  "gemini-3.8-flash", // strong + fast, good default fallback
  "gemini-3.6-flash", // previous-gen fallback
  "gemini-flash-lite-latest", // last resort: quota exhaustion only
  "gemini-3.5-flash-lite", // final fallback
];

const MAX_RETRIES_PER_MODEL = 2;
const REQUEST_TIMEOUT_MS = 15_000;
const RETRY_BASE_DELAY_MS = 800;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isQuotaError(status: number, body: string): boolean {
  if (status === 429) return true;
  const lowered = body.toLowerCase();
  return (
    lowered.includes("quota") ||
    lowered.includes("resource_exhausted") ||
    lowered.includes("rate limit")
  );
}

function isRetryableError(status: number): boolean {
  return status >= 500 || status === 429 || status === 0;
}

async function callSingleModel(
  model: string,
  apiKey: string,
  options: ModelCallOptions
): Promise<{ status: number; body: string; json?: any }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: options.signal ?? controller.signal,
        body: JSON.stringify({
          contents: options.contents,
          systemInstruction: options.systemInstruction
            ? { parts: [{ text: options.systemInstruction }] }
            : undefined,
          tools: options.tools,
          generationConfig: options.generationConfig ?? {
            temperature: 0.7,
            maxOutputTokens: 4096,
          },
        }),
      }
    );

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      // Non-JSON body
    }

    return { status: res.status, body: text, json };
  } catch (err: any) {
    if (err?.name === "AbortError") {
      return { status: 0, body: "Request timed out" };
    }
    return { status: 0, body: err?.message ?? "Unknown network error" };
  } finally {
    clearTimeout(timeout);
  }
}

export async function callGeminiWithFallback(
  options: ModelCallOptions,
  apiKey: string = process.env.GEMINI_API_KEY ?? ""
): Promise<ModelCallResult> {
  if (!apiKey) {
    return { ok: false, error: "GEMINI_API_KEY tanımlı değil (env eksik)." };
  }

  const attemptLog: string[] = [];

  for (const model of MODEL_PRIORITY) {
    let lastError = "";

    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      const result = await callSingleModel(model, apiKey, options);

      if (result.status >= 200 && result.status < 300 && result.json) {
        return { ok: true, data: result.json, modelUsed: model };
      }

      lastError = `[${model}] status=${result.status} body=${result.body.slice(0, 200)}`;
      attemptLog.push(lastError);

      if (isQuotaError(result.status, result.body)) {
        break;
      }

      if (!isRetryableError(result.status)) {
        break;
      }

      if (attempt < MAX_RETRIES_PER_MODEL) {
        await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt));
      }
    }

    console.error(`[Gemini] ${model} failed:`, lastError);
  }

  console.error("[Gemini] Tüm modeller başarısız oldu:", attemptLog.join(" | "));
  return {
    ok: false,
    error:
      "Şu anda bağlantıda küçük bir sorun yaşıyorum, birkaç saniye sonra tekrar dener misin? 🐧",
  };
}
