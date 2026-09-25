import { CONFIG, verifySecrets } from './config';
import { PERMANENT_GOVERNANCE_INSTRUCTION } from './governance';
import { TaskExecutionResult } from './types';
import { redactSecrets } from './secretRedactor';

export class AntigravityClient {
  private apiKey: string;
  private githubToken: string;

  constructor() {
    const secretsCheck = verifySecrets();
    if (!secretsCheck.ok) {
      throw new Error(`Missing required environment secrets: ${secretsCheck.missing.join(', ')}`);
    }
    this.apiKey = process.env.GEMINI_API_KEY!;
    this.githubToken = process.env.ACELEETME_GITHUB_READ_TOKEN!;
  }

  public buildRepositoryEnvironmentPayload(): any {
    return {
      type: CONFIG.BASE_ENVIRONMENT_TYPE,
      sources: [
        {
          type: 'repository',
          source: CONFIG.REPO_URL,
          target: CONFIG.REPO_MOUNT_TARGET
        }
      ],
      network: {
        allowlist: [
          {
            domain: 'github.com',
            credential: CONFIG.MANAGED_CREDENTIAL_ID
          }
        ]
      }
    };
  }

  public async executeTask(prompt: string): Promise<TaskExecutionResult> {
    const fullInput = `${PERMANENT_GOVERNANCE_INSTRUCTION}\n\nTask:\n${prompt}`;
    let attempts = 0;
    const maxAttempts = CONFIG.MAX_RETRIES_PER_TASK + 1; // 1 initial + 1 retry = 2 attempts max

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const result = await this.dispatchAndPoll(fullInput);
        result.attempts = attempts;
        if (result.success || !this.isTransientError(result.failureClassification)) {
          return result;
        }
      } catch (err: any) {
        const errorMessage = redactSecrets(err.message || String(err));
        if (attempts >= maxAttempts || !this.isTransientError(errorMessage)) {
          return {
            success: false,
            status: 'FAILED',
            failureClassification: `CLIENT_ERROR: ${errorMessage}`,
            attempts
          };
        }
      }
      // Wait before retry for transient error
      await new Promise((r) => setTimeout(r, 5000));
    }

    return {
      success: false,
      status: 'FAILED',
      failureClassification: 'MAX_RETRIES_EXCEEDED',
      attempts: maxAttempts
    };
  }

  private isTransientError(errorText?: string): boolean {
    if (!errorText) return false;
    const lower = errorText.toLowerCase();
    return (
      lower.includes('429') ||
      lower.includes('rate limit') ||
      lower.includes('503') ||
      lower.includes('500') ||
      lower.includes('502') ||
      lower.includes('504') ||
      lower.includes('econnreset') ||
      lower.includes('etimedout') ||
      lower.includes('service_unavailable')
    );
  }

  private async dispatchAndPoll(fullInput: string): Promise<TaskExecutionResult> {
    const url = `${CONFIG.API_BASE_URL}/interactions`;

    const environmentPayload = this.buildRepositoryEnvironmentPayload();

    const payload: any = {
      agent: CONFIG.RUNTIME_AGENT,
      input: fullInput,
      environment: environmentPayload,
      background: true
    };

    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': this.apiKey
      },
      body: JSON.stringify(payload)
    });

    let status = response.status;
    let json: any = await response.json();

    if (status !== 200) {
      const errorMsg = redactSecrets(JSON.stringify(json.error || json));
      return {
        success: false,
        status: status === 403 || status === 401 ? 'BLOCKED' : 'FAILED',
        failureClassification: status === 401 || status === 403 ? 'REMOTE_REPOSITORY_MOUNT_BLOCKED' : `HTTP_${status}: ${errorMsg}`,
        attempts: 1
      };
    }

    const interactionId = json.id || json.name;
    if (!interactionId) {
      return {
        success: false,
        status: 'FAILED',
        failureClassification: 'NO_INTERACTION_ID_RETURNED',
        attempts: 1
      };
    }

    // Poll interaction status
    const getUrl = `${CONFIG.API_BASE_URL}/interactions/${interactionId}`;
    const startTime = Date.now();
    const maxRuntimeMs = CONFIG.MAX_TASK_RUNTIME_MINUTES * 60 * 1000;

    while (Date.now() - startTime < maxRuntimeMs) {
      await new Promise((r) => setTimeout(r, 10000));

      const pollRes = await fetch(getUrl, {
        headers: { 'x-goog-api-key': this.apiKey }
      });

      if (pollRes.status !== 200) {
        const pollErr: any = await pollRes.json();
        return {
          success: false,
          status: 'FAILED',
          interactionId,
          failureClassification: `POLL_ERROR_${pollRes.status}: ${redactSecrets(JSON.stringify(pollErr))}`,
          attempts: 1
        };
      }

      const pollJson: any = await pollRes.json();
      const currentStatus = pollJson.status;

      if (currentStatus === 'completed') {
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

        // Repository Preflight Guard Check
        if (outputText.includes('REMOTE_REPOSITORY_NOT_MOUNTED') || outputText.includes('fatal: not a git repository') || outputText.includes('No git repository')) {
          return {
            success: false,
            status: 'BLOCKED',
            outputText: redactSecrets(outputText),
            interactionId,
            failureClassification: 'REMOTE_REPOSITORY_NOT_MOUNTED',
            attempts: 1
          };
        }

        return {
          success: true,
          status: 'COMPLETED',
          outputText: redactSecrets(outputText),
          interactionId,
          attempts: 1
        };
      } else if (currentStatus === 'failed' || currentStatus === 'cancelled') {
        const errorDetail = redactSecrets(JSON.stringify(pollJson.error || pollJson));
        return {
          success: false,
          status: 'FAILED',
          interactionId,
          failureClassification: `INTERACTION_${currentStatus.toUpperCase()}: ${errorDetail}`,
          attempts: 1
        };
      }
    }

    return {
      success: false,
      status: 'BLOCKED',
      interactionId,
      failureClassification: 'REMOTE_REPOSITORY_TASK_TIMEOUT',
      attempts: 1
    };
  }
}
