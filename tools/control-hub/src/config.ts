import path from 'path';

export const CONFIG = {
  CANONICAL_REPO_PATH: 'C:\\Projects\\aceleetme',
  WORKSPACES_ROOT: 'C:\\Projects\\aceleetme-agent-workspaces',
  CANONICAL_BRANCH: 'main',
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  ANALYSIS_AGENT: 'antigravity-preview-09-2026',
  OPENAI_API_BASE_URL: 'https://api.openai.com/v1',
  OPENAI_DEFAULT_REVIEW_MODEL: 'gpt-5.6-luna',
  OPENAI_DEFAULT_ESCALATION_MODEL: 'gpt-5.6-sol',
  MAX_OPENAI_REVIEWS_PER_TASK: 2,
  MAX_LUNA_REVIEWS_PER_TASK: 1,
  MAX_SOL_REVIEWS_PER_TASK: 1,
  MAX_OPENAI_REVIEW_INPUT_CHARS: 16000,
  MAX_TASKS_PER_RUN: 5,
  MAX_RETRIES_PER_TASK: 1, // Max 1 retry for transient process errors
  MAX_TASK_RUNTIME_MINUTES: 30,
  STATE_FILE_PATH: path.join(__dirname, '..', 'data', 'control-hub-state.json')
};

export function isApiKeyPresent(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 0);
}

export function isOpenAiApiKeyPresent(): boolean {
  return Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 0);
}
