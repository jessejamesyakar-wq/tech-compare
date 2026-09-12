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

// Tek yetkili yapay zeka modeli: Gemini 3.8 Flash
const MODEL_PRIORITY = [
  "gemini-3.8-flash", // En akıllı, hızlı ve gelişmiş tek model
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
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
          generationConfig: options.generationConfig ?? {
            temperature: 0.4,
            maxOutputTokens: 2048,
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

async function callOpenRouter(
  options: ModelCallOptions,
  openRouterApiKey: string
): Promise<ModelCallResult> {
  try {
    const messages: any[] = [];
    if (options.systemInstruction) {
      messages.push({ role: "system", content: options.systemInstruction });
    }
    for (const c of options.contents || []) {
      const role = c.role === "model" || c.role === "assistant" ? "assistant" : "user";
      const text = c.parts?.map((p: any) => p.text || "").join("\n") || "";
      if (text) {
        messages.push({ role, content: text });
      }
    }

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey}`,
        "HTTP-Referer": process.env.SITE_URL || "https://aceleetme.tech",
        "X-Title": process.env.SITE_NAME || "aceleetme",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-sonnet",
        messages,
        temperature: 0.3
      })
    });

    if (res.ok) {
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || "";
      return {
        ok: true,
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: content }]
              }
            }
          ]
        },
        modelUsed: "anthropic/claude-3.5-sonnet"
      };
    }
  } catch (err) {
    console.error("[OpenRouter] Call error:", err);
  }
  return { ok: false };
}

export async function callGeminiWithFallback(
  options: ModelCallOptions,
  apiKey: string = process.env.GEMINI_API_KEY ?? ""
): Promise<ModelCallResult> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && !openRouterKey.includes("senin-openrouter-anahtarin") && openRouterKey.trim().length > 10) {
    const orResult = await callOpenRouter(options, openRouterKey);
    if (orResult.ok) return orResult;
  }

  if (!apiKey) {
    return { ok: false, error: "GEMINI_API_KEY veya OPENROUTER_API_KEY tanımlı değil." };
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
