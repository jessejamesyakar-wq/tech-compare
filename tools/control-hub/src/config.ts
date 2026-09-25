import path from 'path';

export const CONFIG = {
  API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',
  RUNTIME_AGENT: 'antigravity-preview-09-2026',
  BASE_ENVIRONMENT_TYPE: 'remote',
  MANAGED_CREDENTIAL_ID: 'aceleetme-github-readonly-v1',
  REPO_URL: 'https://github.com/jessejamesyakar-wq/tech-compare.git',
  REPO_MOUNT_TARGET: '/workspace/aceleetme',
  MAX_TASKS_PER_RUN: 5,
  MAX_RETRIES_PER_TASK: 1, // Max 2 attempts total (1 initial + 1 retry)
  MAX_TASK_RUNTIME_MINUTES: 30,
  EXPECTED_CANONICAL_MAIN_HEAD: '249d3ead0ee1d3ea5fda40d53208f45513f0dd44',
  STATE_FILE_PATH: path.join(__dirname, '..', 'data', 'control-hub-state.json')
};

export function verifySecrets(): { ok: boolean; missing: string[] } {
  const missing: string[] = [];
  if (!process.env.GEMINI_API_KEY) {
    missing.push('GEMINI_API_KEY');
  }
  if (!process.env.ACELEETME_GITHUB_READ_TOKEN) {
    missing.push('ACELEETME_GITHUB_READ_TOKEN');
  }
  return {
    ok: missing.length === 0,
    missing
  };
}
