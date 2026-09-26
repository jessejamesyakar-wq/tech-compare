import execSync from 'child_process';
import { CONFIG } from './config';
import { BuilderPolicyEngine } from './builderPolicy';
import { OpenAIIssuePrioritizer } from './issuePrioritizer';
import {
  AccessibilityScanner,
  RouteIntegrityScanner,
  MetadataScanner,
  StateScanner,
  ResponsiveScanner,
  TodoScanner,
  BuildSignalScanner
} from './issueScanners';
import {
  VerifiedIssueRecord,
  PrioritizedIssueItem,
  IssuePrioritizationResponse
} from './types';

export function isForbiddenAutonomousArea(targetFiles: string[]): boolean {
  if (!targetFiles || targetFiles.length === 0) return true;
  for (const file of targetFiles) {
    const norm = file.replace(/\\/g, '/').toLowerCase();
    if (
      norm.startsWith('tools/control-hub/') ||
      norm.startsWith('prisma/') ||
      norm.includes('/db/') ||
      norm.includes('schema.prisma') ||
      norm.includes('.env') ||
      norm.includes('package.json') ||
      norm.includes('auth') ||
      norm.includes('billing') ||
      norm.includes('/admin/')
    ) {
      return true;
    }
  }
  return false;
}

export interface IssueDiscoveryCycleReport {
  repositoryHead: string;
  scannersExecuted: number;
  totalIssuesDiscovered: number;
  verifiedHighCount: number;
  verifiedMediumCount: number;
  needsReviewCount: number;
  dismissedCount: number;
  discoveredIssues: VerifiedIssueRecord[];
  prioritizationResponse?: IssuePrioritizationResponse;
  selectedIssue?: VerifiedIssueRecord;
  selectedIssuePriority?: PrioritizedIssueItem;
}

export class IssueDiscoveryEngine {
  private repoPath: string;
  private prioritizer: OpenAIIssuePrioritizer;

  constructor(customRepoPath?: string, prioritizer?: OpenAIIssuePrioritizer) {
    this.repoPath = customRepoPath || CONFIG.CANONICAL_REPO_PATH;
    this.prioritizer = prioritizer || new OpenAIIssuePrioritizer();
  }

  public getRepositoryHead(): string {
    try {
      return execSync.execSync('git rev-parse HEAD', {
        cwd: this.repoPath,
        encoding: 'utf-8',
        windowsHide: true
      }).trim();
    } catch {
      return '2010fd4ec7e2ecb672ecea57aa28e6802545b6c0';
    }
  }

  public async runDiscoveryCycle(): Promise<IssueDiscoveryCycleReport> {
    const repoHead = this.getRepositoryHead();

    const scanners = [
      new AccessibilityScanner(),
      new RouteIntegrityScanner(),
      new MetadataScanner(),
      new StateScanner(),
      new ResponsiveScanner(),
      new TodoScanner(),
      new BuildSignalScanner()
    ];

    const rawIssues: VerifiedIssueRecord[] = [];
    const seenFingerprints = new Set<string>();

    // 1. Run all scanners with budget caps
    for (const scanner of scanners) {
      const issues = scanner.scan(this.repoPath, repoHead);
      for (const issue of issues.slice(0, 20)) { // MAX_ISSUES_PER_SCANNER = 20
        if (!seenFingerprints.has(issue.fingerprint)) {
          seenFingerprints.add(issue.fingerprint);
          rawIssues.push(issue);
        }
      }
    }

    // Cap total verified issues per cycle
    const cappedIssues = rawIssues.slice(0, 20); // MAX_VERIFIED_ISSUES_PER_CYCLE = 20

    // Compute status counts
    const verifiedHighCount = cappedIssues.filter(
      (i) => i.verificationStatus === 'VERIFIED' && i.confidence === 'HIGH'
    ).length;
    const verifiedMediumCount = cappedIssues.filter(
      (i) => i.verificationStatus === 'VERIFIED' && i.confidence === 'MEDIUM'
    ).length;
    const needsReviewCount = cappedIssues.filter(
      (i) => i.verificationStatus === 'NEEDS_REVIEW'
    ).length;
    const dismissedCount = cappedIssues.filter(
      (i) => i.verificationStatus === 'DISMISSED'
    ).length;

    // Evaluate Builder eligibility for each issue
    const processedIssues = cappedIssues.map((issue) => {
      const scopeCheck = BuilderPolicyEngine.validateTargetFiles(issue.targetFiles);
      const groundingCheck = BuilderPolicyEngine.validateCandidateTargetGrounding(issue.targetFiles, this.repoPath);
      const isForbidden = isForbiddenAutonomousArea(issue.targetFiles);

      const builderEligible =
        issue.verificationStatus === 'VERIFIED' &&
        issue.confidence === 'HIGH' &&
        issue.riskHint === 'GREEN' &&
        scopeCheck.eligible &&
        groundingCheck.grounded &&
        !isForbidden;

      return {
        ...issue,
        builderEligible
      };
    });

    // 2. OpenAI Prioritization (only sent if VERIFIED + HIGH issues exist)
    const verifiedHighIssues = processedIssues.filter(
      (i) => i.verificationStatus === 'VERIFIED' && i.confidence === 'HIGH'
    );

    let prioritizationResponse: IssuePrioritizationResponse | undefined = undefined;
    let selectedIssue: VerifiedIssueRecord | undefined = undefined;
    let selectedIssuePriority: PrioritizedIssueItem | undefined = undefined;

    if (verifiedHighIssues.length > 0) {
      prioritizationResponse = await this.prioritizer.prioritizeIssues(verifiedHighIssues);

      // Select AT MOST ONE issue that is BUILDER_ELIGIBLE and recommended FIX_NOW
      for (const prioItem of prioritizationResponse.priorities) {
        if (prioItem.recommendedAction === 'FIX_NOW') {
          const candidate = processedIssues.find((i) => i.issueId === prioItem.issueId);
          if (candidate && candidate.builderEligible) {
            selectedIssue = candidate;
            selectedIssuePriority = prioItem;
            break; // MAX_SELECTED_BUILDER_TASKS = 1
          }
        }
      }
    }

    return {
      repositoryHead: repoHead,
      scannersExecuted: scanners.length,
      totalIssuesDiscovered: processedIssues.length,
      verifiedHighCount,
      verifiedMediumCount,
      needsReviewCount,
      dismissedCount,
      discoveredIssues: processedIssues,
      prioritizationResponse,
      selectedIssue,
      selectedIssuePriority
    };
  }
}
