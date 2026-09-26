import fs from 'fs';
import path from 'path';
import { RiskLevel, SuggestedExecutor } from './types';

export interface PatchBudget {
  maxFiles: number;
  maxAddedLines: number;
  maxDeletedLines: number;
}

export const DEFAULT_BUILDER_PATCH_BUDGET: PatchBudget = {
  maxFiles: 3,
  maxAddedLines: 200,
  maxDeletedLines: 120
};

export interface BuilderTaskContract {
  taskId: string;
  title: string;
  problem: string;
  evidence: string[];
  targetFiles: string[];
  expectedBehavior: string;
  acceptanceCriteria: string[];
  requiredTests: string[];
  risk: RiskLevel;
  executionProfile: string;
  patchBudget: PatchBudget;
  plannerResponseId?: string;
  repositoryHead: string;
  suggestedExecutor?: SuggestedExecutor;
}

export const BUILDER_HARD_RED_PATTERNS: string[] = [
  'prisma/schema.prisma',
  'prisma/migrations',
  'tools/control-hub',
  '.env',
  '.env.production',
  '.env.local',
  'package.json',
  'package-lock.json',
  'node_modules',
  '.github',
  'vercel.json',
  'next.config.ts',
  'src/lib/db',
  'src/lib/auth',
  'src/lib/pricing',
  'src/lib/retailers',
  'src/app/api/admin',
  'src/app/api/cron'
];

export const BUILDER_ALLOWED_PREFIXES: string[] = [
  'src/components/',
  'src/app/'
];

export interface ScopeValidationResult {
  eligible: boolean;
  reason?: string;
  violations?: string[];
}

export class BuilderPolicyEngine {
  public static validateContract(contract: Partial<BuilderTaskContract>): { valid: boolean; reason?: string } {
    if (!contract.taskId || !contract.title || !contract.problem || !contract.expectedBehavior) {
      return { valid: false, reason: 'BUILDER_CONTRACT_MISSING_REQUIRED_FIELDS' };
    }
    if (!contract.acceptanceCriteria || contract.acceptanceCriteria.length === 0) {
      return { valid: false, reason: 'BUILDER_CONTRACT_MISSING_ACCEPTANCE_CRITERIA' };
    }
    if (!contract.targetFiles || contract.targetFiles.length === 0) {
      return { valid: false, reason: 'BUILDER_CONTRACT_MISSING_TARGET_FILES' };
    }
    if (!contract.repositoryHead) {
      return { valid: false, reason: 'BUILDER_CONTRACT_MISSING_REPOSITORY_HEAD' };
    }
    if (contract.risk !== 'GREEN') {
      return { valid: false, reason: 'BUILDER_CONTRACT_NON_GREEN_RISK' };
    }
    return { valid: true };
  }

  public static validateTargetFiles(targetFiles: string[]): ScopeValidationResult {
    const violations: string[] = [];

    for (const rawFile of targetFiles) {
      const normalized = rawFile.replace(/\\/g, '/').toLowerCase();

      // Check self-modification protection
      if (normalized.startsWith('tools/control-hub')) {
        violations.push(`CONTROL_HUB_SELF_MODIFICATION_PROHIBITED: ${rawFile}`);
        continue;
      }

      // Check HARD RED patterns
      for (const pattern of BUILDER_HARD_RED_PATTERNS) {
        if (normalized === pattern || normalized.startsWith(pattern + '/')) {
          violations.push(`HARD_RED_PATH_PROHIBITED: ${rawFile} (matches ${pattern})`);
          break;
        }
      }

      // Check initial safe allowed prefix (presentation / read-only UI)
      const isAllowed = BUILDER_ALLOWED_PREFIXES.some(prefix => normalized.startsWith(prefix));
      if (!isAllowed) {
        violations.push(`PATH_OUTSIDE_ALLOWED_BUILDER_SCOPE: ${rawFile}`);
      }
    }

    if (violations.length > 0) {
      return {
        eligible: false,
        reason: 'BUILDER_TARGET_FILES_VIOLATE_POLICY',
        violations
      };
    }

    return { eligible: true };
  }

  public static inspectDiffScope(
    changedFiles: string[],
    allowedTargetFiles: string[],
    patchBudget: PatchBudget = DEFAULT_BUILDER_PATCH_BUDGET,
    diffContent: string = ''
  ): ScopeValidationResult {
    const violations: string[] = [];

    // 1. File count budget
    if (changedFiles.length > patchBudget.maxFiles) {
      violations.push(`BUILDER_PATCH_BUDGET_EXCEEDED: changed files ${changedFiles.length} > ${patchBudget.maxFiles}`);
    }

    // 2. Line count added/deleted budget
    let addedLines = 0;
    let deletedLines = 0;
    const diffLines = diffContent.split('\n');
    for (const line of diffLines) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        addedLines++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        deletedLines++;
      }
    }

    if (addedLines > patchBudget.maxAddedLines) {
      violations.push(`BUILDER_PATCH_BUDGET_EXCEEDED: added lines ${addedLines} > ${patchBudget.maxAddedLines}`);
    }
    if (deletedLines > patchBudget.maxDeletedLines) {
      violations.push(`BUILDER_PATCH_BUDGET_EXCEEDED: deleted lines ${deletedLines} > ${patchBudget.maxDeletedLines}`);
    }

    // 3. Target file scope expansion check
    const normalizedTargetFiles = allowedTargetFiles.map(f => f.replace(/\\/g, '/').toLowerCase());
    for (const changedFile of changedFiles) {
      const normalizedChanged = changedFile.replace(/\\/g, '/').toLowerCase();
      
      // Control hub self modification check
      if (normalizedChanged.startsWith('tools/control-hub')) {
        violations.push(`BLOCKED_BY_SELF_MODIFICATION: ${changedFile}`);
      }

      // Hard RED check
      for (const pattern of BUILDER_HARD_RED_PATTERNS) {
        if (normalizedChanged === pattern || normalizedChanged.startsWith(pattern + '/')) {
          violations.push(`BLOCKED_BY_HARD_RED_PATH: ${changedFile}`);
          break;
        }
      }

      // Unapproved target scope expansion
      const isTargetAllowed = normalizedTargetFiles.some(t => normalizedChanged === t || normalizedChanged.endsWith('/' + t));
      if (!isTargetAllowed) {
        violations.push(`BLOCKED_BY_SCOPE_EXPANSION: ${changedFile} was not in allowed targetFiles`);
      }
    }

    if (violations.length > 0) {
      return {
        eligible: false,
        reason: violations[0],
        violations
      };
    }

    return { eligible: true };
  }
}
