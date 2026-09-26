import fs from 'fs';
import path from 'path';
import execSync from 'child_process';
import crypto from 'crypto';
import { CONFIG } from './config';
import {
  VerifiedIssueRecord,
  IssueScanner,
  IssueConfidence,
  VerificationStatus,
  ProposalDomain,
  RiskLevel
} from './types';

export interface ScannerResult {
  scanner: IssueScanner;
  issues: VerifiedIssueRecord[];
}

function computeFingerprint(
  scanner: string,
  targetFile: string,
  title: string,
  evidence: string,
  repoHead: string
): string {
  const payload = `${scanner}:${targetFile}:${title}:${evidence}:${repoHead}`;
  return crypto.createHash('sha256').update(payload).digest('hex').substring(0, 32);
}

export class AccessibilityScanner {
  public scan(repoPath: string = CONFIG.CANONICAL_REPO_PATH, repoHead: string = 'HEAD'): VerifiedIssueRecord[] {
    const issues: VerifiedIssueRecord[] = [];
    let trackedFiles: string[] = [];

    try {
      const output = execSync.execSync('git ls-files src/components/ src/app/', {
        cwd: repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      trackedFiles = output.split('\n').map((l) => l.trim()).filter(Boolean);
    } catch {
      return [];
    }

    const uiFiles = trackedFiles.filter(
      (f) => (f.endsWith('.tsx') || f.endsWith('.jsx')) && !f.includes('/admin/') && !f.includes('/api/')
    );

    for (const file of uiFiles) {
      const fullPath = path.join(repoPath, file);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      // 1. Icon-only button or button missing accessible name/label
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
          (line.includes('<button') || line.includes('<Button')) &&
          !line.includes('aria-label=') &&
          !line.includes('aria-labelledby=')
        ) {
          const chunk = lines.slice(i, i + 5).join(' ');
          if (chunk.includes('/>') || chunk.includes('</button>') || chunk.includes('</Button>')) {
            const hasDirectText = />\s*[A-Za-z0-9]+\s*</.test(chunk) || /aria-label=/.test(chunk);
            const hasIconOnly = chunk.includes('Icon') || chunk.includes('Svg') || chunk.includes('svg');

            if (!hasDirectText && hasIconOnly) {
              const evidence = `Line ${i + 1}: ${line.trim()}`;
              const title = `Button in ${path.basename(file)} is missing an accessible name or aria-label`;
              const fingerprint = computeFingerprint('ACCESSIBILITY_STRUCTURE', file, title, evidence, repoHead);

              issues.push({
                issueId: `ISSUE_ACC_${issues.length + 1}`,
                scanner: 'ACCESSIBILITY_STRUCTURE',
                domain: 'USER_VALUE',
                title,
                targetFiles: [file],
                targetReferences: [],
                evidenceType: 'SOURCE_CODE',
                evidence,
                currentBehavior: 'Button renders an icon without visible text or an aria-label attribute.',
                expectedBehavior: 'Button should include an aria-label attribute describing its action for screen readers.',
                userImpact: 'Screen reader users cannot determine the purpose of the interactive button.',
                technicalImpact: 'Accessibility standard WCAG 2.1 4.1.2 requirement unfulfilled.',
                confidence: 'HIGH',
                verificationStatus: 'VERIFIED',
                riskHint: 'GREEN',
                suggestedExecutionProfile: 'AUTONOMOUS_BUILDER_PATCH',
                discoveredAt: new Date().toISOString(),
                repositoryHead: repoHead,
                fingerprint
              });
            }
          }
        }

        // 2. Image without alt attribute
        if (
          (line.includes('<img') || line.includes('<Image')) &&
          !line.includes('alt=') &&
          !line.includes('aria-hidden=')
        ) {
          const evidence = `Line ${i + 1}: ${line.trim()}`;
          const title = `Image element in ${path.basename(file)} is missing an alt attribute`;
          const fingerprint = computeFingerprint('ACCESSIBILITY_STRUCTURE', file, title, evidence, repoHead);

          issues.push({
            issueId: `ISSUE_ACC_${issues.length + 1}`,
            scanner: 'ACCESSIBILITY_STRUCTURE',
            domain: 'USER_VALUE',
            title,
            targetFiles: [file],
            targetReferences: [],
            evidenceType: 'SOURCE_CODE',
            evidence,
            currentBehavior: 'Image element renders without an alt attribute.',
            expectedBehavior: 'Image element should include a meaningful alt attribute or alt="" if decorative.',
            userImpact: 'Screen readers read raw file paths or skip image context.',
            technicalImpact: 'Violates WCAG 1.1.1 Non-text Content requirement.',
            confidence: 'HIGH',
            verificationStatus: 'VERIFIED',
            riskHint: 'GREEN',
            suggestedExecutionProfile: 'AUTONOMOUS_BUILDER_PATCH',
            discoveredAt: new Date().toISOString(),
            repositoryHead: repoHead,
            fingerprint
          });
        }
      }
    }

    return issues.slice(0, 20);
  }
}

export class RouteIntegrityScanner {
  public scan(repoPath: string = CONFIG.CANONICAL_REPO_PATH, repoHead: string = 'HEAD'): VerifiedIssueRecord[] {
    const issues: VerifiedIssueRecord[] = [];
    let trackedFiles: string[] = [];

    try {
      const output = execSync.execSync('git ls-files src/', {
        cwd: repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      trackedFiles = output.split('\n').map((l) => l.trim()).filter(Boolean);
    } catch {
      return [];
    }

    const routeFiles = trackedFiles.filter((f) => f.startsWith('src/app/'));
    const knownRoutes = new Set<string>();

    knownRoutes.add('/');
    for (const rf of routeFiles) {
      if (!rf.endsWith('/page.tsx') && !rf.endsWith('/page.jsx')) continue;
      const rel = rf.replace(/^src\/app/, '').replace(/\/page\.(tsx|jsx)$/, '');
      const routePath = rel === '' ? '/' : rel;
      knownRoutes.add(routePath);
    }

    const codeFiles = trackedFiles.filter(
      (f) => (f.endsWith('.tsx') || f.endsWith('.jsx')) && !f.includes('/admin/') && !f.includes('/api/')
    );

    for (const file of codeFiles) {
      const fullPath = path.join(repoPath, file);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/href=["'](\/[a-zA-Z0-9_\-\/]+)["']/);
        if (match) {
          const targetRoute = match[1];

          if (targetRoute === '/' || targetRoute.includes('[') || targetRoute.startsWith('/api')) continue;

          let isKnown = knownRoutes.has(targetRoute);
          if (!isKnown) {
            for (const kr of knownRoutes) {
              const krRegex = new RegExp('^' + kr.replace(/\[[^\]]+\]/g, '[^/]+') + '$');
              if (krRegex.test(targetRoute)) {
                isKnown = true;
                break;
              }
            }
          }

          if (!isKnown) {
            const evidence = `Line ${i + 1}: ${line.trim()}`;
            const title = `Broken internal link to missing route '${targetRoute}' in ${path.basename(file)}`;
            const fingerprint = computeFingerprint('ROUTE_LINK_INTEGRITY', file, title, evidence, repoHead);

            issues.push({
              issueId: `ISSUE_ROUTE_${issues.length + 1}`,
              scanner: 'ROUTE_LINK_INTEGRITY',
              domain: 'USER_VALUE',
              title,
              targetFiles: [file],
              targetReferences: [],
              evidenceType: 'ROUTE_MAP',
              evidence,
              currentBehavior: `Component links to internal route '${targetRoute}' which does not exist in src/app.`,
              expectedBehavior: `Internal link should target an existing route in src/app.`,
              userImpact: 'Users clicking this link will encounter a 404 page.',
              technicalImpact: 'Broken navigation integrity.',
              confidence: 'HIGH',
              verificationStatus: 'VERIFIED',
              riskHint: 'GREEN',
              suggestedExecutionProfile: 'AUTONOMOUS_BUILDER_PATCH',
              discoveredAt: new Date().toISOString(),
              repositoryHead: repoHead,
              fingerprint
            });
          }
        }
      }
    }

    return issues.slice(0, 20);
  }
}

export class MetadataScanner {
  public scan(repoPath: string = CONFIG.CANONICAL_REPO_PATH, repoHead: string = 'HEAD'): VerifiedIssueRecord[] {
    const issues: VerifiedIssueRecord[] = [];
    let trackedFiles: string[] = [];

    try {
      const output = execSync.execSync('git ls-files src/app/', {
        cwd: repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      trackedFiles = output.split('\n').map((l) => l.trim()).filter(Boolean);
    } catch {
      return [];
    }

    const pageFiles = trackedFiles.filter(
      (f) =>
        (f.endsWith('/page.tsx') || f.endsWith('/page.jsx')) &&
        !f.includes('/admin/') &&
        !f.includes('/api/') &&
        !f.includes('[')
    );

    for (const file of pageFiles) {
      const fullPath = path.join(repoPath, file);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const hasMetadata = content.includes('export const metadata') || content.includes('generateMetadata');

      if (!hasMetadata && file !== 'src/app/page.tsx') {
        const title = `Missing page metadata definition in ${file}`;
        const evidence = `File ${file} exports a page component but defines no metadata or generateMetadata export.`;
        const fingerprint = computeFingerprint('METADATA_SEO_STRUCTURE', file, title, evidence, repoHead);

        issues.push({
          issueId: `ISSUE_META_${issues.length + 1}`,
          scanner: 'METADATA_SEO_STRUCTURE',
          domain: 'USER_VALUE',
          title,
          targetFiles: [file],
          targetReferences: [],
          evidenceType: 'METADATA_CONFIG',
          evidence,
          currentBehavior: `Page component ${file} lacks static or dynamic metadata export.`,
          expectedBehavior: `Page component should export static or dynamic metadata containing title and description.`,
          userImpact: 'Search engines and browser tabs display fallback root title.',
          technicalImpact: 'Incomplete SEO metadata configuration.',
          confidence: 'HIGH',
          verificationStatus: 'VERIFIED',
          riskHint: 'GREEN',
          suggestedExecutionProfile: 'AUTONOMOUS_BUILDER_PATCH',
          discoveredAt: new Date().toISOString(),
          repositoryHead: repoHead,
          fingerprint
        });
      }
    }

    return issues.slice(0, 20);
  }
}

export class StateScanner {
  public scan(repoPath: string = CONFIG.CANONICAL_REPO_PATH, repoHead: string = 'HEAD'): VerifiedIssueRecord[] {
    const issues: VerifiedIssueRecord[] = [];
    let trackedFiles: string[] = [];

    try {
      const output = execSync.execSync('git ls-files src/components/', {
        cwd: repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      trackedFiles = output.split('\n').map((l) => l.trim()).filter(Boolean);
    } catch {
      return [];
    }

    const componentFiles = trackedFiles.filter(
      (f) => (f.endsWith('.tsx') || f.endsWith('.jsx')) && !f.includes('/admin/') && !f.includes('/api/')
    );

    for (const file of componentFiles) {
      const fullPath = path.join(repoPath, file);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('.map(') && !content.includes('.length === 0') && !content.includes('.length ?') && !content.includes('?.length')) {
          const evidence = `Line ${i + 1}: ${line.trim()}`;
          const title = `Potential unhandled empty list state in ${path.basename(file)}`;
          const fingerprint = computeFingerprint('STATE_HANDLING', file, title, evidence, repoHead);

          issues.push({
            issueId: `ISSUE_STATE_${issues.length + 1}`,
            scanner: 'STATE_HANDLING',
            domain: 'USER_VALUE',
            title,
            targetFiles: [file],
            targetReferences: [],
            evidenceType: 'SOURCE_CODE',
            evidence,
            currentBehavior: 'Component maps over list items without explicit empty-state feedback UI.',
            expectedBehavior: 'Component should render an explicit empty state when list array is empty.',
            userImpact: 'Users see a blank component section without explanation when no items are available.',
            technicalImpact: 'Missing empty-state UI handling.',
            confidence: 'MEDIUM',
            verificationStatus: 'VERIFIED',
            riskHint: 'GREEN',
            suggestedExecutionProfile: 'AUTONOMOUS_BUILDER_PATCH',
            discoveredAt: new Date().toISOString(),
            repositoryHead: repoHead,
            fingerprint
          });
        }
      }
    }

    return issues.slice(0, 20);
  }
}

export class ResponsiveScanner {
  public scan(repoPath: string = CONFIG.CANONICAL_REPO_PATH, repoHead: string = 'HEAD'): VerifiedIssueRecord[] {
    const issues: VerifiedIssueRecord[] = [];
    let trackedFiles: string[] = [];

    try {
      const output = execSync.execSync('git ls-files src/components/', {
        cwd: repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      trackedFiles = output.split('\n').map((l) => l.trim()).filter(Boolean);
    } catch {
      return [];
    }

    const componentFiles = trackedFiles.filter(
      (f) => (f.endsWith('.tsx') || f.endsWith('.jsx')) && !f.includes('/admin/')
    );

    for (const file of componentFiles) {
      const fullPath = path.join(repoPath, file);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/width:\s*['"]([1-9][0-9]{3,})px['"]/);
        if (match) {
          const evidence = `Line ${i + 1}: ${line.trim()}`;
          const title = `Hardcoded fixed pixel width (${match[1]}px) in ${path.basename(file)}`;
          const fingerprint = computeFingerprint('RESPONSIVE_STRUCTURE', file, title, evidence, repoHead);

          issues.push({
            issueId: `ISSUE_RESP_${issues.length + 1}`,
            scanner: 'RESPONSIVE_STRUCTURE',
            domain: 'USER_VALUE',
            title,
            targetFiles: [file],
            targetReferences: [],
            evidenceType: 'SOURCE_CODE',
            evidence,
            currentBehavior: `Component specifies a fixed pixel width of ${match[1]}px.`,
            expectedBehavior: 'Component width should use responsive max-width or percent units.',
            userImpact: 'Layout overflows on narrower viewport screens.',
            technicalImpact: 'Non-responsive layout constraint.',
            confidence: 'MEDIUM',
            verificationStatus: 'NEEDS_REVIEW',
            riskHint: 'GREEN',
            suggestedExecutionProfile: 'PLANNER_PROPOSAL_ONLY',
            discoveredAt: new Date().toISOString(),
            repositoryHead: repoHead,
            fingerprint
          });
        }
      }
    }

    return issues.slice(0, 20);
  }
}

export class TodoScanner {
  public scan(repoPath: string = CONFIG.CANONICAL_REPO_PATH, repoHead: string = 'HEAD'): VerifiedIssueRecord[] {
    const issues: VerifiedIssueRecord[] = [];
    let trackedFiles: string[] = [];

    try {
      const output = execSync.execSync('git ls-files src/', {
        cwd: repoPath,
        encoding: 'utf-8',
        windowsHide: true
      });
      trackedFiles = output.split('\n').map((l) => l.trim()).filter(Boolean);
    } catch {
      return [];
    }

    const codeFiles = trackedFiles.filter(
      (f) => (f.endsWith('.tsx') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.js')) && !f.includes('/admin/')
    );

    for (const file of codeFiles) {
      const fullPath = path.join(repoPath, file);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.includes('TODO:') || line.includes('FIXME:') || line.includes('HACK:')) {
          const lower = line.toLowerCase();
          const isUserVisible =
            lower.includes('ui') ||
            lower.includes('accessibility') ||
            lower.includes('contrast') ||
            lower.includes('button') ||
            lower.includes('image') ||
            lower.includes('label') ||
            lower.includes('aria') ||
            lower.includes('empty state') ||
            lower.includes('loading');

          const status: VerificationStatus = isUserVisible ? 'VERIFIED' : 'NEEDS_REVIEW';
          const confidence: IssueConfidence = isUserVisible ? 'HIGH' : 'MEDIUM';

          const evidence = `Line ${i + 1}: ${line.trim()}`;
          const title = `Grounded user-visible defect comment in ${path.basename(file)}`;
          const fingerprint = computeFingerprint('TODO_DEFECT', file, title, evidence, repoHead);

          issues.push({
            issueId: `ISSUE_TODO_${issues.length + 1}`,
            scanner: 'TODO_DEFECT',
            domain: 'USER_VALUE',
            title,
            targetFiles: [file],
            targetReferences: [],
            evidenceType: 'SOURCE_CODE',
            evidence,
            currentBehavior: `Source code contains a user-visible TODO/FIXME comment: "${line.trim()}".`,
            expectedBehavior: 'Source code comment should be resolved with safe code implementation.',
            userImpact: 'Identified user-visible feature defect remains unaddressed.',
            technicalImpact: 'Unresolved source code defect marker.',
            confidence,
            verificationStatus: status,
            riskHint: 'GREEN',
            suggestedExecutionProfile: isUserVisible ? 'AUTONOMOUS_BUILDER_PATCH' : 'PLANNER_PROPOSAL_ONLY',
            discoveredAt: new Date().toISOString(),
            repositoryHead: repoHead,
            fingerprint
          });
        }
      }
    }

    return issues.slice(0, 20);
  }
}

export class BuildSignalScanner {
  public scan(repoPath: string = CONFIG.CANONICAL_REPO_PATH, repoHead: string = 'HEAD'): VerifiedIssueRecord[] {
    const issues: VerifiedIssueRecord[] = [];

    try {
      execSync.execSync('npx tsc --noEmit', {
        cwd: repoPath,
        encoding: 'utf-8',
        windowsHide: true,
        stdio: 'pipe'
      });
    } catch (err: any) {
      const stdout = err.stdout ? err.stdout.toString() : '';
      const stderr = err.stderr ? err.stderr.toString() : '';
      const evidence = (stdout + '\n' + stderr).substring(0, 300);
      const title = 'TypeScript typecheck error detected';
      const fingerprint = computeFingerprint('BUILD_SIGNAL', 'tsconfig.json', title, evidence, repoHead);

      issues.push({
        issueId: `ISSUE_BUILD_${issues.length + 1}`,
        scanner: 'BUILD_SIGNAL',
        domain: 'TECHNICAL',
        title,
        targetFiles: ['tsconfig.json'],
        targetReferences: [],
        evidenceType: 'COMMAND_OUTPUT',
        evidence,
        currentBehavior: 'TypeScript compilation fails with type errors.',
        expectedBehavior: 'TypeScript compilation should pass cleanly with 0 errors.',
        userImpact: 'Type errors may lead to runtime failures.',
        technicalImpact: 'Broken build signal.',
        confidence: 'HIGH',
        verificationStatus: 'VERIFIED',
        riskHint: 'GREEN',
        suggestedExecutionProfile: 'AUTONOMOUS_BUILDER_PATCH',
        discoveredAt: new Date().toISOString(),
        repositoryHead: repoHead,
        fingerprint
      });
    }

    return issues;
  }
}
