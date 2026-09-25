import { CONFIG, isApiKeyPresent } from './config';
import { redactSecrets } from './secretRedactor';

export class AntigravityAnalysis {
  private apiKey: string | null = null;

  constructor() {
    if (isApiKeyPresent()) {
      this.apiKey = process.env.GEMINI_API_KEY!;
    }
  }

  public async analyzeInspectionResult(sanitizedEvidence: string): Promise<string> {
    if (!this.apiKey) {
      return '[ANTIGRAVITY_ANALYSIS] Skipped: GEMINI_API_KEY not configured. Command evidence preserved without model analysis.';
    }

    const url = `${CONFIG.API_BASE_URL}/interactions`;

    const prompt = `Review this read-only ACELEETME repository inspection result. Identify inconsistencies or blockers only. Do not invent repository facts.

Sanitized Command Evidence:
${redactSecrets(sanitizedEvidence)}`;

    const payload = {
      agent: CONFIG.ANALYSIS_AGENT,
      input: prompt,
      environment: 'remote',
      background: true
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (response.status !== 200) {
        const errJson: any = await response.json();
        return `[ANTIGRAVITY_ANALYSIS] Analysis request failed (HTTP ${response.status}): ${redactSecrets(JSON.stringify(errJson))}`;
      }

      const json: any = await response.json();
      const interactionId = json.id || json.name;
      if (!interactionId) {
        return '[ANTIGRAVITY_ANALYSIS] Analysis request returned no interaction ID.';
      }

      // Poll interaction status (max 1 minute for quick analysis)
      const getUrl = `${CONFIG.API_BASE_URL}/interactions/${interactionId}`;
      const startTime = Date.now();

      while (Date.now() - startTime < 60000) {
        await new Promise((r) => setTimeout(r, 5000));
        const pollRes = await fetch(getUrl, {
          headers: { 'x-goog-api-key': this.apiKey }
        });

        if (pollRes.status === 200) {
          const pollJson: any = await pollRes.json();
          if (pollJson.status === 'completed') {
            let outputText = pollJson.output_text || '';
            if (!outputText && pollJson.steps) {
              for (const step of pollJson.steps) {
                if (step.content) {
                  for (const item of step.content) {
                    if (item.type === 'text' && item.text) {
                      outputText += item.text + '\n';
                    }
                  }
                }
              }
            }
            return `[ANTIGRAVITY_ANALYSIS] Model Reasoning Output:\n${redactSecrets(outputText.trim())}`;
          } else if (pollJson.status === 'failed' || pollJson.status === 'cancelled') {
            return `[ANTIGRAVITY_ANALYSIS] Analysis interaction ${pollJson.status}: ${redactSecrets(JSON.stringify(pollJson.error || pollJson))}`;
          }
        }
      }

      return `[ANTIGRAVITY_ANALYSIS] Analysis interaction timed out (Interaction ID: ${interactionId}).`;
    } catch (err: any) {
      return `[ANTIGRAVITY_ANALYSIS] Client error: ${redactSecrets(err.message || String(err))}`;
    }
  }
}
