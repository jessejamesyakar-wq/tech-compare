import fs from 'fs';
import path from 'path';
import { CONFIG } from './config';
import { QueueStore } from './queueStore';
import { RiskLevel } from './types';

export interface CandidateBacklogItem {
  taskId: string;
  title: string;
  category: 'CATALOG_HEALTH' | 'COMMERCE_READINESS' | 'SITE_HEALTH' | 'TEST_COVERAGE' | 'GOVERNANCE_SECURITY';
  reason: string;
  expectedBenefit: string;
  riskClass: RiskLevel;
  dependencies: string[];
  acceptanceCriteria: string[];
  suggestedTests: string[];
}

export interface ShadowPlan {
  generatedAt: string;
  totalCandidates: number;
  greenCandidates: number;
  yellowCandidates: number;
  redCandidates: number;
  backlog: CandidateBacklogItem[];
}

export class ProjectPlanner {
  private queueStore: QueueStore;

  constructor(queueStore?: QueueStore) {
    this.queueStore = queueStore || new QueueStore();
  }

  public classifyTaskRisk(category: string, actionType: string, targetsProduction: boolean = false): RiskLevel {
    if (targetsProduction || actionType.includes('DEPLOY') || actionType.includes('MERGE_MAIN') || actionType.includes('DELETE_ROOTS') || actionType.includes('PUBLIC_RETAILER_ACTIVATE')) {
      return 'RED';
    }
    if (actionType.includes('SCHEMA_MUTATION') || actionType.includes('CONFIG_CHANGE') || category === 'COMMERCE_READINESS') {
      return 'YELLOW';
    }
    return 'GREEN';
  }

  public generateShadowPlan(): ShadowPlan {
    const generatedAt = new Date().toISOString();
    const existingTasks = this.queueStore.getQueueTasks();
    const existingIds = new Set(existingTasks.map(t => t.taskId));

    const candidatePool: CandidateBacklogItem[] = [
      {
        taskId: 'plan_catalog_audit_001',
        title: 'Product Catalog Spec Completeness Audit',
        category: 'CATALOG_HEALTH',
        reason: 'Identify smartphones and electronics with missing high-value specs or identity anomalies.',
        expectedBenefit: 'Improves spec accuracy, search filtering precision, and user trust.',
        riskClass: this.classifyTaskRisk('CATALOG_HEALTH', 'READ_ONLY_AUDIT'),
        dependencies: [],
        acceptanceCriteria: [
          'Audit all catalog items in smartPhonesData and Postgres repository',
          'Flag missing mandatory fields (RAM, Storage, Processor, Display, Battery)',
          'Produce clean JSON audit report without mutating production database'
        ],
        suggestedTests: ['npm run test', 'npx tsc --noEmit']
      },
      {
        taskId: 'plan_commerce_matrix_001',
        title: 'Retailer Integration Readiness & Anomaly Guard Matrix',
        category: 'COMMERCE_READINESS',
        reason: 'Evaluate 8 key retailers (Hepsiburada, Trendyol, Amazon, n11, PTTAVM, MediaMarkt, Vatan, Teknosa) for pricing engine readiness.',
        expectedBenefit: 'Establishes clear gating matrix before enabling live retailer ingestion.',
        riskClass: this.classifyTaskRisk('COMMERCE_READINESS', 'READ_ONLY_AUDIT'),
        dependencies: [],
        acceptanceCriteria: [
          'Verify schema mapping for all 8 retailers',
          'Audit offer freshness and anomaly detection thresholds',
          'Keep public offer ingestion gated under PERMISSION_UNVERIFIED'
        ],
        suggestedTests: ['npx tsc --noEmit']
      },
      {
        taskId: 'plan_site_seo_001',
        title: 'Technical SEO & Mobile Usability Verification',
        category: 'SITE_HEALTH',
        reason: 'Verify canonical tags, sitemap generation, robots.txt, structured data, and mobile layout rendering.',
        expectedBenefit: 'Ensures zero broken routes, accurate metadata, and optimal search engine crawlability.',
        riskClass: this.classifyTaskRisk('SITE_HEALTH', 'READ_ONLY_AUDIT'),
        dependencies: [],
        acceptanceCriteria: [
          'Inspect Next.js app routes for canonical URL integrity',
          'Verify JSON-LD Product and BreadcrumbList structured data',
          'Execute full production build check (npx next build)'
        ],
        suggestedTests: ['npx next build', 'npx tsc --noEmit']
      },
      {
        taskId: 'plan_test_suite_001',
        title: 'Control Hub & Trust Layer Regression Test Expansion',
        category: 'TEST_COVERAGE',
        reason: 'Add additional deterministic unit tests for queue runner, planner classification, and budget guards.',
        expectedBenefit: 'Prevents regression in autonomous execution and reporting layers.',
        riskClass: this.classifyTaskRisk('TEST_COVERAGE', 'UNIT_TEST_ADDITION'),
        dependencies: [],
        acceptanceCriteria: [
          'Expand test/controlHub.test.ts to test ProjectPlanner shadow outputs',
          'Ensure 100% test pass rate with zero flaky assertions'
        ],
        suggestedTests: ['npm run test --prefix tools/control-hub']
      },
      {
        taskId: 'plan_prod_deploy_099',
        title: 'Production Multi-Region Deployment',
        category: 'GOVERNANCE_SECURITY',
        reason: 'Deploy updated Control Hub runner to production environment.',
        expectedBenefit: 'Enables cloud execution of queue runner.',
        riskClass: this.classifyTaskRisk('GOVERNANCE_SECURITY', 'PRODUCTION_DEPLOY', true),
        dependencies: ['plan_site_seo_001'],
        acceptanceCriteria: [
          'Requires explicit owner decision approval in inbox prior to dispatch'
        ],
        suggestedTests: ['Manual owner audit']
      }
    ];

    const shadowBacklog = candidatePool.filter(item => !existingIds.has(item.taskId));

    const greenCount = shadowBacklog.filter(b => b.riskClass === 'GREEN').length;
    const yellowCount = shadowBacklog.filter(b => b.riskClass === 'YELLOW').length;
    const redCount = shadowBacklog.filter(b => b.riskClass === 'RED').length;

    return {
      generatedAt,
      totalCandidates: shadowBacklog.length,
      greenCandidates: greenCount,
      yellowCandidates: yellowCount,
      redCandidates: redCount,
      backlog: shadowBacklog
    };
  }

  public saveShadowPlan(plan: ShadowPlan, outputPath?: string): string {
    const targetPath = outputPath || path.join(CONFIG.DATA_DIR, 'shadow-plan.json');
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(plan, null, 2), 'utf-8');
    return targetPath;
  }
}
