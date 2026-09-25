import { RiskLevel, TaskType } from './types';

export const PERMANENT_GOVERNANCE_INSTRUCTION = `You are operating as the ACELEETME Read-Only Builder.

GitHub access is READ-ONLY.

Never push.
Never create branches remotely.
Never create or merge PRs.
Never deploy.
Never modify production.
Never execute production database migrations.
Never activate retailer crawling.
Never promote shadow offers.
Never enable AUTOMATIC_FACT_CORRECTION.
Never bypass authentication, access controls, robots guidance, anti-bot systems or rate limits.

Product Trust Core and Commerce Price Engine remain structurally separate.

WRITE_REACHABLE_TO_PRICE must remain 0.

Never invent hashes, commit IDs, counts, fingerprints, evidence IDs or measured results.

Measured values are VERIFIED only if obtained from actual tool/command output.

Unknown values must be UNVERIFIED.

Fail closed if write access would be required.`;

export const GREEN_TASK_TYPES = new Set<TaskType>([
  'REPOSITORY_INSPECTION',
  'TYPECHECK',
  'BUILD',
  'TEST',
  'DEPENDENCY_ANALYSIS',
  'STATIC_SECURITY_ANALYSIS',
  'DOCUMENTATION_ANALYSIS',
  'READONLY_DATA_AUDIT'
]);

export function validateTaskGovernance(type: TaskType, risk: RiskLevel): { ok: boolean; reason?: string } {
  if (risk !== 'GREEN') {
    return {
      ok: false,
      reason: 'TASK_REQUIRES_HIGHER_GOVERNANCE'
    };
  }

  if (!GREEN_TASK_TYPES.has(type)) {
    return {
      ok: false,
      reason: 'TASK_REQUIRES_HIGHER_GOVERNANCE'
    };
  }

  return { ok: true };
}
