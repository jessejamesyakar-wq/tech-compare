import { TaskType, RiskLevel, TaskPriority } from './types';

export const ALLOWED_TASK_TYPES: TaskType[] = [
  'REPOSITORY_INSPECTION',
  'TYPECHECK',
  'BUILD',
  'TEST',
  'DEPENDENCY_ANALYSIS',
  'STATIC_SECURITY_ANALYSIS',
  'DOCUMENTATION_ANALYSIS',
  'READONLY_DATA_AUDIT',
  'PRODUCTION_DEPLOY',
  'DATABASE_MIGRATION',
  'RETAILER_CRAWL',
  'SHADOW_OFFER_PROMOTE',
  'FACT_CORRECTION_ENABLE'
];

export const ALLOWED_RISK_LEVELS: RiskLevel[] = ['GREEN', 'YELLOW', 'RED'];

export const ALLOWED_TASK_PRIORITIES: TaskPriority[] = ['CRITICAL', 'HIGH', 'NORMAL', 'LOW'];

export interface ParsedTaskArgs {
  type: TaskType;
  risk: RiskLevel;
  priority: TaskPriority;
  instruction: string;
}

export interface ParseResult {
  ok: boolean;
  task?: ParsedTaskArgs;
  error?: string;
  reason?: string;
}

export function validateAndBuildTask(
  rawType: string,
  rawRisk: string,
  rawPriority: string,
  rawInstruction: string
): ParseResult {
  if (
    rawType.startsWith('--') ||
    rawRisk.startsWith('--') ||
    rawPriority.startsWith('--') ||
    rawInstruction.startsWith('--')
  ) {
    return {
      ok: false,
      error: 'INVALID_TASK_ARGUMENTS',
      reason: 'Field value cannot start with --'
    };
  }

  const typeUpper = rawType.toUpperCase() as TaskType;
  if (!ALLOWED_TASK_TYPES.includes(typeUpper)) {
    return {
      ok: false,
      error: 'INVALID_TASK_ARGUMENTS',
      reason: `Invalid task type '${rawType}'. Allowed types: ${ALLOWED_TASK_TYPES.join(', ')}`
    };
  }

  const riskUpper = rawRisk.toUpperCase() as RiskLevel;
  if (!ALLOWED_RISK_LEVELS.includes(riskUpper)) {
    return {
      ok: false,
      error: 'INVALID_TASK_ARGUMENTS',
      reason: `Invalid risk level '${rawRisk}'. Allowed levels: ${ALLOWED_RISK_LEVELS.join(', ')}`
    };
  }

  const priorityUpper = rawPriority.toUpperCase() as TaskPriority;
  if (!ALLOWED_TASK_PRIORITIES.includes(priorityUpper)) {
    return {
      ok: false,
      error: 'INVALID_TASK_ARGUMENTS',
      reason: `Invalid task priority '${rawPriority}'. Allowed priorities: ${ALLOWED_TASK_PRIORITIES.join(', ')}`
    };
  }

  const cleanInstruction = rawInstruction.trim();
  if (!cleanInstruction) {
    return {
      ok: false,
      error: 'INVALID_TASK_ARGUMENTS',
      reason: 'Task instruction cannot be empty'
    };
  }

  return {
    ok: true,
    task: {
      type: typeUpper,
      risk: riskUpper,
      priority: priorityUpper,
      instruction: cleanInstruction
    }
  };
}

export function parseQueueAddArgs(args: string[]): ParseResult {
  if (!args || args.length === 0) {
    return validateAndBuildTask('REPOSITORY_INSPECTION', 'GREEN', 'NORMAL', 'Execute REPOSITORY_INSPECTION task');
  }

  const hasFlags = args.some(a => a.startsWith('--'));

  if (hasFlags) {
    const validFlags = new Set(['--type', '--risk', '--priority', '--instruction']);

    let type: string | undefined;
    let risk: string | undefined;
    let priority: string | undefined;
    let instructionParts: string[] = [];

    let currentFlag: string | null = null;

    for (let i = 0; i < args.length; i++) {
      const token = args[i];

      if (token.startsWith('--')) {
        if (!validFlags.has(token)) {
          return {
            ok: false,
            error: 'INVALID_TASK_ARGUMENTS',
            reason: `Unknown flag '${token}'`
          };
        }

        if (currentFlag && currentFlag !== '--instruction') {
          return {
            ok: false,
            error: 'INVALID_TASK_ARGUMENTS',
            reason: `Flag '${currentFlag}' missing value`
          };
        }

        currentFlag = token;
      } else {
        if (!currentFlag) {
          return {
            ok: false,
            error: 'INVALID_TASK_ARGUMENTS',
            reason: `Positional argument '${token}' cannot be mixed with named flags`
          };
        }

        if (currentFlag === '--type') {
          if (type !== undefined) {
            return { ok: false, error: 'INVALID_TASK_ARGUMENTS', reason: `Duplicate flag '--type'` };
          }
          type = token;
          currentFlag = null;
        } else if (currentFlag === '--risk') {
          if (risk !== undefined) {
            return { ok: false, error: 'INVALID_TASK_ARGUMENTS', reason: `Duplicate flag '--risk'` };
          }
          risk = token;
          currentFlag = null;
        } else if (currentFlag === '--priority') {
          if (priority !== undefined) {
            return { ok: false, error: 'INVALID_TASK_ARGUMENTS', reason: `Duplicate flag '--priority'` };
          }
          priority = token;
          currentFlag = null;
        } else if (currentFlag === '--instruction') {
          instructionParts.push(token);
        }
      }
    }

    if (currentFlag && currentFlag !== '--instruction') {
      return {
        ok: false,
        error: 'INVALID_TASK_ARGUMENTS',
        reason: `Flag '${currentFlag}' missing value`
      };
    }

    if (currentFlag === '--instruction' && instructionParts.length === 0) {
      return {
        ok: false,
        error: 'INVALID_TASK_ARGUMENTS',
        reason: `Flag '--instruction' missing value`
      };
    }

    const finalType = type || 'REPOSITORY_INSPECTION';
    const finalRisk = risk || 'GREEN';
    const finalPriority = priority || 'NORMAL';
    const finalInstruction = instructionParts.length > 0
      ? instructionParts.join(' ')
      : `Execute ${finalType} task`;

    return validateAndBuildTask(finalType, finalRisk, finalPriority, finalInstruction);
  } else {
    const rawType = args[0] || 'REPOSITORY_INSPECTION';
    const rawRisk = args[1] || 'GREEN';
    const rawPriority = args[2] || 'NORMAL';
    const rawInstruction = args.slice(3).join(' ') || `Execute ${rawType} task`;

    return validateAndBuildTask(rawType, rawRisk, rawPriority, rawInstruction);
  }
}
