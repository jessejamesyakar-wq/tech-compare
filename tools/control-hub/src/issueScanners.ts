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

export function generateStableIssueId(
  scanner: IssueScanner,
  issueType: string,
  targetFile: string,
  symbolOrLine: string
): string {
  const normFile = targetFile.replace(/\\/g, '/').toLowerCase();
  const payload = `${scanner}:${issueType}:${normFile}:${symbolOrLine.trim()}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex').substring(0, 8).toUpperCase();
  const scannerPrefix = scanner.substring(0, 4);
  return `ISSUE_${scannerPrefix}_${hash}`;
}

export function computeFingerprint(
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

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 1. Icon-only button audit with multiline block inspection
        if (line.includes('<button') || line.includes('<Button')) {
          const blockEndIndex = Math.min(i + 12, lines.length);
          const block = lines.slice(i, blockEndIndex).join('\n');

          const hasAriaLabel = /aria-label=/i.test(block);
          const hasAriaLabelledBy = /aria-labelledby=/i.test(block);
          const hasTitle = /title=/i.test(block);
          const hasSrOnly = /sr-only|visually-hidden/i.test(block);
          const hasVisibleText = />\s*[^<\s{}]+|<span>|\{[^}]+\}/i.test(block);

          const hasIconChild = /Icon|Svg|svg|Chevron|Maximize|X|Check|Plus|Trash|Search/i.test(block);

          if (!hasAriaLabel && !hasAriaLabelledBy && !hasTitle && !hasSrOnly && !hasVisibleText && hasIconChild) {
            const evidence = `Line ${i + 1}: ${line.trim()}`;
            const issueType = 'ICON_BUTTON_MISSING_ACCESSIBLE_NAME';
            const issueId = generateStableIssueId('ACCESSIBILITY_STRUCTURE', issueType, file, `Line_${i + 1}`);
            const title = `Button in ${path.basename(file)} missing accessible name or aria-label`;
            const fingerprint = computeFingerprint('ACCESSIBILITY_STRUCTURE', file, title, evidence, repoHead);

            issues.push({
              issueId,
              scanner: 'ACCESSIBILITY_STRUCTURE',
              domain: 'USER_VALUE',
              title,
              targetFiles: [file],
              targetReferences: [],
              evidenceType: 'SOURCE_CODE',
              evidence,
              currentBehavior: 'Interactive button contains icon child without aria-label, title, sr-only text, or visible label.',
              expectedBehavior: 'Button must include an aria-label, title, or sr-only text node describing its purpose.',
              userImpact: 'Screen reader users cannot determine the interactive button purpose.',
              technicalImpact: 'Violates WCAG 2.1 4.1.2 Name, Role, Value requirement.',
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

        // 2. Image alt attribute audit with multiline block inspection
        if (line.includes('<img') || line.includes('<Image')) {
          const blockEndIndex = Math.min(i + 8, lines.length);
          const block = lines.slice(i, blockEndIndex).join('\n');

          const hasAlt = /alt=/i.test(block);
          const hasAriaHidden = /aria-hidden=/i.test(block);

          if (!hasAlt && !hasAriaHidden) {
            const evidence = `Line ${i + 1}: ${line.trim()}`;
            const issueType = 'IMAGE_MISSING_ALT_ATTRIBUTE';
            const issueId = generateStableIssueId('ACCESSIBILITY_STRUCTURE', issueType, file, `Line_${i + 1}`);
            const title = `Image element in ${path.basename(file)} missing alt attribute`;
            const fingerprint = computeFingerprint('ACCESSIBILITY_STRUCTURE', file, title, evidence, repoHead);

            issues.push({
              issueId,
              scanner: 'ACCESSIBILITY_STRUCTURE',
              domain: 'USER_VALUE',
              title,
              targetFiles: [file],
              targetReferences: [],
              evidenceType: 'SOURCE_CODE',
              evidence,
              currentBehavior: 'Image component renders without an alt attribute.',
              expectedBehavior: 'Image component must specify a descriptive alt attribute or alt="" for decorative images.',
              userImpact: 'Screen readers cannot describe non-text image content.',
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

          if (targetRoute === '/' || targetRoute.includes('[') || targetRoute.startsWith('/api') || targetRoute.startsWith('/_')) continue;

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
            const issueType = 'BROKEN_INTERNAL_LINK';
            const issueId = generateStableIssueId('ROUTE_LINK_INTEGRITY', issueType, file, `Route_${targetRoute}`);
            const title = `Broken internal link to missing route '${targetRoute}' in ${path.basename(file)}`;
            const fingerprint = computeFingerprint('ROUTE_LINK_INTEGRITY', file, title, evidence, repoHead);

            issues.push({
              issueId,
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
        const issueType = 'MISSING_PAGE_METADATA_EXPORT';
        const issueId = generateStableIssueId('METADATA_SEO_STRUCTURE', issueType, file, 'Page_Metadata');
        const title = `Missing page metadata definition in ${file}`;
        const evidence = `File ${file} exports a page component but defines no metadata export. Inherits root layout metadata.`;
        const fingerprint = computeFingerprint('METADATA_SEO_STRUCTURE', file, title, evidence, repoHead);

        issues.push({
          issueId,
          scanner: 'METADATA_SEO_STRUCTURE',
          domain: 'USER_VALUE',
          title,
          targetFiles: [file],
          targetReferences: [],
          evidenceType: 'METADATA_CONFIG',
          evidence,
          currentBehavior: `Page component ${file} lacks page-specific metadata export and inherits root layout title.`,
          expectedBehavior: `Page component should export page-specific metadata for optimal search indexing.`,
          userImpact: 'Search engine snippets fall back to global root title.',
          technicalImpact: 'Non-critical SEO metadata refinement opportunity.',
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
          const issueType = 'UNHANDLED_EMPTY_LIST_STATE';
          const issueId = generateStableIssueId('STATE_HANDLING', issueType, file, `Line_${i + 1}`);
          const title = `Potential unhandled empty list state in ${path.basename(file)}`;
          const fingerprint = computeFingerprint('STATE_HANDLING', file, title, evidence, repoHead);

          issues.push({
            issueId,
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
          const issueType = 'FIXED_PIXEL_WIDTH_LAYOUT_CONSTRAINT';
          const issueId = generateStableIssueId('RESPONSIVE_STRUCTURE', issueType, file, `Line_${i + 1}`);
          const title = `Hardcoded fixed pixel width (${match[1]}px) in ${path.basename(file)}`;
          const fingerprint = computeFingerprint('RESPONSIVE_STRUCTURE', file, title, evidence, repoHead);

          issues.push({
            issueId,
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
          const evidence = `Line ${i + 1}: ${line.trim()}`;
          const issueType = 'SOURCE_DEFECT_COMMENT';
          const issueId = generateStableIssueId('TODO_DEFECT', issueType, file, `Line_${i + 1}`);
          const title = `Source defect comment in ${path.basename(file)}`;
          const fingerprint = computeFingerprint('TODO_DEFECT', file, title, evidence, repoHead);

          issues.push({
            issueId,
            scanner: 'TODO_DEFECT',
            domain: 'USER_VALUE',
            title,
            targetFiles: [file],
            targetReferences: [],
            evidenceType: 'SOURCE_CODE',
            evidence,
            currentBehavior: `Source code contains a TODO/FIXME comment: "${line.trim()}".`,
            expectedBehavior: 'Source code comment should be resolved with clean implementation.',
            userImpact: 'Source code defect marker requires review.',
            technicalImpact: 'Unresolved source code defect marker.',
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
      const issueType = 'TYPECHECK_ERROR';
      const issueId = generateStableIssueId('BUILD_SIGNAL', issueType, 'tsconfig.json', 'Typecheck_Failure');
      const title = 'TypeScript typecheck error detected';
      const fingerprint = computeFingerprint('BUILD_SIGNAL', 'tsconfig.json', title, evidence, repoHead);

      issues.push({
        issueId,
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
