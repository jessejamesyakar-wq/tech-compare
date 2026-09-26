import { IssueDiscoveryEngine } from './issueDiscoveryEngine';

export async function runDeterministicIssueDiscoveryQualification() {
  console.log('==================================================');
  console.log('ACELEETME Control Hub V0.8.2 — Deterministic Issue Discovery');
  console.log('==================================================');

  const engine = new IssueDiscoveryEngine();
  const report = await engine.runDiscoveryCycle();

  console.log(`REPOSITORY_HEAD: ${report.repositoryHead}`);
  console.log(`SCANNERS_EXECUTED: ${report.scannersExecuted}`);
  console.log(`TOTAL_ISSUES_DISCOVERED: ${report.totalIssuesDiscovered}`);
  console.log(`VERIFIED_HIGH: ${report.verifiedHighCount}`);
  console.log(`VERIFIED_MEDIUM: ${report.verifiedMediumCount}`);
  console.log(`NEEDS_REVIEW: ${report.needsReviewCount}`);
  console.log(`DISMISSED: ${report.dismissedCount}`);

  if (report.discoveredIssues.length > 0) {
    console.log('\nVERIFIED ISSUES SUMMARY:');
    report.discoveredIssues.forEach((issue) => {
      console.log(`\nIssue ID: ${issue.issueId}`);
      console.log(`  Scanner: ${issue.scanner}`);
      console.log(`  Title: ${issue.title}`);
      console.log(`  Target Files: ${JSON.stringify(issue.targetFiles)}`);
      console.log(`  Status: ${issue.verificationStatus}`);
      console.log(`  Confidence: ${issue.confidence}`);
      console.log(`  Risk Hint: ${issue.riskHint}`);
      console.log(`  Builder Eligible: ${issue.builderEligible ? 'YES' : 'NO'}`);
      console.log(`  Evidence: ${issue.evidence}`);
    });
  }

  if (report.prioritizationResponse) {
    console.log('\nOPENAI PRIORITIZATION TELEMETRY:');
    console.log(`OPENAI_RESPONSE_ID: ${report.prioritizationResponse.responseId || 'NONE'}`);
    console.log(`OPENAI_MODEL: ${report.prioritizationResponse.modelUsed || 'gpt-5.6-luna'}`);
    console.log(`OPENAI_TOTAL_TOKENS: ${report.prioritizationResponse.totalTokens || 0}`);
  }

  if (report.selectedIssue) {
    console.log('\nSELECTED BUILDER TASK (QUALIFICATION ONLY — UNEXECUTED):');
    console.log(`SELECTED_ISSUE_ID: ${report.selectedIssue.issueId}`);
    console.log(`TITLE: ${report.selectedIssue.title}`);
    console.log(`TARGET_FILES: ${JSON.stringify(report.selectedIssue.targetFiles)}`);
    console.log(`BUILDER_ELIGIBLE: ${report.selectedIssue.builderEligible ? 'YES' : 'NO'}`);
  } else {
    console.log('\nSELECTED_ISSUE_ID: NONE');
  }

  const verdict = report.totalIssuesDiscovered > 0
    ? 'V0_8_2_DETERMINISTIC_ISSUE_DISCOVERY_QUALIFIED'
    : 'V0_8_2_NO_VERIFIED_ISSUES_FOUND';

  console.log(`\nVERDICT: ${verdict}`);

  return {
    report,
    verdict
  };
}

if (require.main === module) {
  runDeterministicIssueDiscoveryQualification().catch((err) => {
    console.error('Deterministic issue discovery error:', err);
    process.exit(1);
  });
}
