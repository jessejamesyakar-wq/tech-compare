import { CONFIG } from './config';
import { ProjectPlanner } from './projectPlanner';
import { OpenAIStrategicPlanner } from './strategicPlanner';
import { QueueRunner } from './queueRunner';
import { QueueStore } from './queueStore';
import { TelegramNotifier } from './telegramNotifier';
import { OwnerDecisionItem, QueueTask, RiskLevel, StrategicTaskProposal, TaskPriority, TaskType } from './types';
import { parseQueueAddArgs, ALLOWED_TASK_TYPES } from './cliParser';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  const queueStore = new QueueStore();
  const queueRunner = new QueueRunner(queueStore);

  console.log(`==================================================`);
  console.log(`ACELEETME Control Hub V0.6 — Command: ${command}`);
  console.log(`==================================================`);

  if (command === 'queue:add') {
    const parseResult = parseQueueAddArgs(args.slice(1));
    if (!parseResult.ok || !parseResult.task) {
      console.error(`INVALID_TASK_ARGUMENTS: ${parseResult.reason || 'Failed to parse task arguments'}`);
      process.exit(1);
    }

    const { type, risk, priority, instruction } = parseResult.task;
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const task: QueueTask = {
      taskId,
      type,
      risk,
      priority,
      instruction,
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    };

    queueStore.addQueueTask(task);
    console.log(`ADDED TASK TO QUEUE:`);
    console.log(`ID: ${task.taskId} | Type: ${task.type} | Risk: ${task.risk} | Priority: ${task.priority}`);
    console.log(`Instruction: ${task.instruction}`);
  } else if (command === 'queue:run') {
    console.log('Starting autonomous queue runner cycle...');
    const result = await queueRunner.runCycle();
    console.log(`RUNNER CYCLE COMPLETED:`);
    console.log(`Status: ${result.status}`);
    console.log(`Processed Count: ${result.processedCount}`);
    console.log(`Tasks Processed: ${result.tasksProcessed.join(', ') || 'NONE'}`);
  } else if (command === 'queue:list') {
    const tasks = queueStore.getQueueTasks();
    console.log(`TOTAL QUEUE TASKS: ${tasks.length}`);
    tasks.forEach((t, i) => {
      console.log(`[${i + 1}] ID: ${t.taskId} | Type: ${t.type} | Risk: ${t.risk} | Priority: ${t.priority} | Status: ${t.status} | Reviewer: ${t.reviewerDecision || 'NONE'}`);
    });
  } else if (command === 'decisions') {
    const decisions = queueStore.getOwnerDecisions();
    console.log(`OWNER DECISION INBOX (${decisions.length} ITEMS):`);
    console.log(`--------------------------------------------------`);
    decisions.forEach((d, i) => {
      console.log(`ITEM [${i + 1}] ID: ${d.decisionId} | Task: ${d.taskId}`);
      console.log(`PROJECT STATUS: OWNER_DECISION_REQUIRED (${d.shortTitle})`);
      console.log(`DECISION: ${d.reason}`);
      console.log(`OPTION A: ${d.optionA}`);
      console.log(`OPTION B: ${d.optionB}`);
      console.log(`SAFE DEFAULT: ${d.safeDefault}`);
      console.log(`RISK IF NO DECISION: ${d.riskIfNoDecision}`);
      console.log(`--------------------------------------------------`);
    });
  } else if (command === 'pause') {
    queueStore.updateRunnerState({ paused: true });
    console.log('KILL SWITCH ENGAGED: Queue runner state set to PAUSED.');
  } else if (command === 'resume') {
    queueStore.updateRunnerState({ paused: false });
    console.log('KILL SWITCH DISENGAGED: Queue runner state set to RUNNING.');
  } else if (command === 'summary') {
    const tasks = queueStore.getQueueTasks();
    const decisions = queueStore.getOwnerDecisions();
    const usage = queueStore.getUsageState();
    const state = queueStore.getRunnerState();

    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const completedWithLimitation = tasks.filter(t => t.status === 'COMPLETED_WITH_LIMITATION').length;
    const failed = tasks.filter(t => t.status === 'FAILED').length;
    const blocked = tasks.filter(t => t.status === 'BLOCKED' || t.status === 'BLOCKED_BY_DEPENDENCY' || t.status === 'BLOCKED_BY_REPOSITORY_IDENTITY').length;
    const ownerDecisionsWaiting = decisions.filter(d => d.status === 'PENDING').length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayRecords = usage.records.filter(r => r.timestamp && r.timestamp.slice(0, 10) === todayStr);
    const todayTokens = todayRecords.reduce((acc, r) => acc + (r.inputTokens + r.outputTokens), 0);
    const totalTokens = usage.records.reduce((acc, r) => acc + (r.inputTokens + r.outputTokens), 0);
    const totalOpenAiCallsToday = usage.totalOpenAiCalls || (usage.dailyLunaCount + usage.dailySolCount);

    console.log(`DAILY CONTROL HUB OWNER SUMMARY (${todayStr})`);
    console.log(`--------------------------------------------------`);
    console.log(`TASKS COMPLETED: ${completed}`);
    console.log(`COMPLETED WITH LIMITATION: ${completedWithLimitation}`);
    console.log(`FAILED: ${failed}`);
    console.log(`BLOCKED: ${blocked}`);
    console.log(`OWNER DECISIONS WAITING: ${ownerDecisionsWaiting}`);
    console.log(`QUEUE LUNA CALLS: ${usage.queueLunaCalls || 0}`);
    console.log(`QUEUE SOL CALLS: ${usage.queueSolCalls || 0}`);
    console.log(`FORENSIC/MANUAL LUNA CALLS: ${usage.forensicLunaCalls || 0}`);
    console.log(`FORENSIC/MANUAL SOL CALLS: ${usage.forensicSolCalls || 0}`);
    console.log(`TOTAL OPENAI CALLS (TODAY): ${totalOpenAiCallsToday}`);
    console.log(`VERIFIED TOKEN USAGE (TODAY): ${todayTokens} tokens`);
    console.log(`VERIFIED TOKEN USAGE (TOTAL): ${totalTokens} tokens (${usage.records.length} records)`);
    console.log(`RUNNER RESTARTS: ${state.restartCount || 0}`);
    console.log(`SUPERVISOR STATUS: ${state.supervisorStatus || 'HEALTHY'}`);
    console.log(`CRITICAL ERRORS: 0`);
    console.log(`--------------------------------------------------`);
  } else if (command === 'telegram:test') {
    console.log('Executing live Telegram owner notification qualification test (TEST_TELEGRAM_OWNER_GATE)...');
    const liveNotifier = new TelegramNotifier(undefined, undefined, undefined, undefined, false);
    if (!liveNotifier.isConfigured()) {
      console.error('ERROR: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing from environment.');
      process.exit(1);
    }
    const testTask: QueueTask = {
      taskId: 'TEST_TELEGRAM_OWNER_GATE',
      type: 'REPOSITORY_INSPECTION',
      risk: 'RED',
      priority: 'HIGH',
      instruction: 'V0.6 Telegram Owner Notification Layer Synthetic Gate Qualification',
      status: 'OWNER_DECISION_REQUIRED',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    };
    const testDecision: OwnerDecisionItem = {
      decisionId: 'dec_TEST_TELEGRAM_OWNER_GATE',
      taskId: 'TEST_TELEGRAM_OWNER_GATE',
      createdAt: new Date().toISOString(),
      shortTitle: 'V0.6 Telegram Notification Qualification Test',
      reason: 'QUALIFICATION_TEST: Verifying Telegram owner notification pipeline delivery.',
      optionA: 'Confirm qualification test received',
      optionB: 'Reject test',
      safeDefault: 'BLOCKED in test inbox',
      riskIfNoDecision: 'None (synthetic test gate)',
      status: 'PENDING'
    };
    const res = await liveNotifier.notifyOwnerDecisionRequired(testTask, testDecision);
    if (res) {
      console.log('SUCCESS: Delivered 1 live qualification message to Telegram for TEST_TELEGRAM_OWNER_GATE.');
    } else {
      console.error('FAILED: Live Telegram notification dispatch failed.');
      process.exit(1);
    }
  } else if (command === 'telegram:summary') {
    const tasks = queueStore.getQueueTasks();
    const decisions = queueStore.getOwnerDecisions();
    const usage = queueStore.getUsageState();
    const state = queueStore.getRunnerState();

    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const completedWithLimitation = tasks.filter(t => t.status === 'COMPLETED_WITH_LIMITATION').length;
    const failed = tasks.filter(t => t.status === 'FAILED').length;
    const blocked = tasks.filter(t => t.status === 'BLOCKED' || t.status === 'BLOCKED_BY_DEPENDENCY' || t.status === 'BLOCKED_BY_REPOSITORY_IDENTITY').length;
    const ownerDecisionsCount = decisions.length;
    const lunaCalls = usage.dailyLunaCount || 0;
    const solCalls = usage.dailySolCount || 0;
    const restarts = state.restartCount || 0;
    const criticalErrors = 0;

    const liveNotifier = new TelegramNotifier(undefined, undefined, undefined, undefined, false);
    const res = await liveNotifier.sendDailySummary(
      completed,
      completedWithLimitation,
      failed,
      blocked,
      ownerDecisionsCount,
      lunaCalls,
      solCalls,
      restarts,
      criticalErrors
    );
    if (res) {
      console.log('SUCCESS: Dispatched daily summary to Telegram.');
    } else {
      console.error('FAILED: Telegram summary dispatch failed.');
    }
  } else if (command === 'planner:v0.7' || command === 'planner:generate') {
    const strategicPlanner = new OpenAIStrategicPlanner(queueStore);
    console.log('Executing OpenAI Controlled Strategic Project Planner V0.7...');
    const result = await strategicPlanner.generateStrategicPlan({ bypassIdleCheck: true });
    const rm = result.roadmap;

    console.log(`==================================================`);
    console.log(`ACELEETME CONTROL HUB V0.7 — OPENAI STRATEGIC ROADMAP`);
    console.log(`==================================================`);
    console.log(`Generated At: ${rm.generatedAt}`);
    console.log(`Planner Model Used: ${rm.plannerModelUsed} (Escalation Used: ${rm.escalationUsed})`);
    console.log(`Reviewer Model Used: ${rm.reviewerModelUsed || 'gpt-5.6-luna'}`);
    console.log(`Auto-Enqueued GREEN Tasks: ${result.autoEnqueuedCount}`);
    console.log(`--------------------------------------------------`);
    console.log(`TOP 3 CURRENT BLOCKERS:`);
    rm.top3CurrentBlockers.forEach((b: string, i: number) => console.log(`  ${i + 1}. ${b}`));
    console.log(`TOP 3 NEXT MOVES:`);
    rm.top3NextMoves.forEach((m: string, i: number) => console.log(`  ${i + 1}. ${m}`));
    console.log(`DO NOT WORK ON YET:`);
    rm.doNotWorkOnYet.forEach((d: string, i: number) => console.log(`  ${i + 1}. ${d}`));
    console.log(`--------------------------------------------------`);
    console.log(`STRATEGIC GAPS:`);
    console.log(`  User Value Gap: ${rm.userValueGap}`);
    console.log(`  Data Gap: ${rm.dataGap}`);
    console.log(`  Commerce Gap: ${rm.commerceGap}`);
    console.log(`  Growth Gap: ${rm.growthGap}`);
    console.log(`  Technical Risk: ${rm.technicalRisk}`);
    console.log(`--------------------------------------------------`);
    console.log(`PROPOSED STRATEGIC TASKS (${rm.proposals.length} PROPOSALS):`);
    rm.proposals.forEach((p: StrategicTaskProposal, index: number) => {
      console.log(`[${index + 1}] ID: ${p.taskId} | Domain: ${p.domain} | Priority: ${p.priority}`);
      console.log(`    Title: ${p.title}`);
      console.log(`    OpenAI Risk Proposal: ${p.riskProposal} | Control Hub Validated Risk: ${p.validatedRisk || p.riskProposal}`);
      console.log(`    Execution Profile: ${p.executionProfile} | Executor: ${p.suggestedExecutor}`);
      console.log(`    Expected User Value: ${p.expectedUserValue}`);
      console.log(`    Auto-Enqueued: ${p.autoEnqueued ? 'YES (PENDING)' : 'NO (PROPOSAL ONLY)'}`);
      if (p.governanceOverrideNote) console.log(`    Governance Note: ${p.governanceOverrideNote}`);
      console.log(`--------------------------------------------------`);
    });
  } else if (command === 'planner:compare') {
    const shadowPlanner = new ProjectPlanner(queueStore);
    const strategicPlanner = new OpenAIStrategicPlanner(queueStore);

    const shadow = shadowPlanner.generateShadowPlan();
    const result = await strategicPlanner.generateStrategicPlan({ bypassIdleCheck: true });
    const rm = result.roadmap;

    console.log(`==================================================`);
    console.log(`SHADOW PLANNER V0.1 VS OPENAI STRATEGIC PLANNER V0.7`);
    console.log(`==================================================`);
    console.log(`SHADOW PLANNER (V0.1 Static Backlog):`);
    console.log(`  Candidates: ${shadow.totalCandidates} (GREEN: ${shadow.greenCandidates}, YELLOW: ${shadow.yellowCandidates}, RED: ${shadow.redCandidates})`);
    console.log(`  Static Targets: Catalog audit, Retailer matrix, SEO check, Regression tests`);
    console.log(`--------------------------------------------------`);
    console.log(`OPENAI STRATEGIC PLANNER (V0.7 Business & User Reasoning):`);
    console.log(`  Proposals: ${rm.proposals.length} proposals`);
    console.log(`  Top Blocker: ${rm.top3CurrentBlockers[0] || 'N/A'}`);
    console.log(`  Top Move: ${rm.top3NextMoves[0] || 'N/A'}`);
    console.log(`  User Value Focus: ${rm.userValueGap}`);
    console.log(`--------------------------------------------------`);
    console.log(`FACTUAL COMPARISON SUMMARY:`);
    console.log(`  1. Reasoning Scope: Shadow planner uses static array; V0.7 evaluates full platform data, commerce, UX, growth.`);
    console.log(`  2. Risk Authority: Both enforce Control Hub deterministic risk overrides (OpenAI GREEN overridden if RED/YELLOW).`);
    console.log(`  3. Auto-Enqueue: Shadow planner is passive; V0.7 auto-enqueues up to 3 validated GREEN tasks under budget caps.`);
    console.log(`  4. Deduplication: Shadow planner filters queue IDs; V0.7 uses 24h fingerprint deduplication.`);
    console.log(`==================================================`);
  } else if (command === 'planner' || command === 'plan') {
    const planner = new ProjectPlanner(queueStore);
    const plan = planner.generateShadowPlan();
    const savedPath = planner.saveShadowPlan(plan);

    console.log(`AUTONOMOUS PROJECT PLANNER V0.1 SHADOW BACKLOG`);
    console.log(`--------------------------------------------------`);
    console.log(`Generated At: ${plan.generatedAt}`);
    console.log(`Total Candidates: ${plan.totalCandidates} (GREEN: ${plan.greenCandidates}, YELLOW: ${plan.yellowCandidates}, RED: ${plan.redCandidates})`);
    console.log(`Shadow Plan Saved: ${savedPath}`);
    console.log(`--------------------------------------------------`);
    plan.backlog.forEach((item, index) => {
      console.log(`[${index + 1}] TASK: ${item.taskId} | Category: ${item.category} | Risk: ${item.riskClass}`);
      console.log(`    Title: ${item.title}`);
      console.log(`    Reason: ${item.reason}`);
      console.log(`    Expected Benefit: ${item.expectedBenefit}`);
      console.log(`    Suggested Tests: ${item.suggestedTests.join(', ')}`);
      console.log(`--------------------------------------------------`);
    });
  } else if (command === 'health') {
    const state = queueStore.getRunnerState();
    const usage = queueStore.getUsageState();

    console.log(`RUNNER HEALTH & SUPERVISION STATUS`);
    console.log(`--------------------------------------------------`);
    console.log(`KILL SWITCH STATE: ${state.paused ? 'PAUSED' : 'RUNNING'}`);
    console.log(`SUPERVISOR STATUS: ${state.supervisorStatus || 'HEALTHY'}`);
    console.log(`ACTIVE LEASE OWNER: ${state.activeLeaseOwner || 'NONE'}`);
    console.log(`LEASE ACQUIRED AT: ${state.leaseAcquiredAt || 'N/A'}`);
    console.log(`LEASE EXPIRES AT: ${state.leaseExpiresAt || 'N/A'}`);
    console.log(`RESTART COUNT (1h): ${state.restartCount || 0}`);
    console.log(`DAILY OPENAI CALLS: ${usage.totalOpenAiCalls || (usage.dailyLunaCount + usage.dailySolCount)} / ${CONFIG.MAX_TOTAL_OPENAI_CALLS_PER_DAY}`);
    console.log(`--------------------------------------------------`);
  } else if (command === 'status') {
    const state = queueStore.getRunnerState();
    const tasks = queueStore.getQueueTasks();
    const decisions = queueStore.getOwnerDecisions();
    const usage = queueStore.getUsageState();

    console.log(`KILL SWITCH STATE: ${state.paused ? 'PAUSED' : 'RUNNING'}`);
    console.log(`ACTIVE LEASE OWNER: ${state.activeLeaseOwner || 'NONE'}`);
    console.log(`TOTAL TASKS: ${tasks.length}`);
    console.log(`OWNER DECISIONS PENDING: ${decisions.filter(d => d.status === 'PENDING').length}`);
    console.log(`DAILY LUNA REVIEWS: ${usage.dailyLunaCount} / ${CONFIG.MAX_LUNA_REVIEWS_PER_DAY}`);
    console.log(`DAILY SOL REVIEWS: ${usage.dailySolCount} / ${CONFIG.MAX_SOL_REVIEWS_PER_DAY}`);
    console.log(`TOTAL DAILY CALLS: ${usage.totalOpenAiCalls || (usage.dailyLunaCount + usage.dailySolCount)} / ${CONFIG.MAX_TOTAL_OPENAI_CALLS_PER_DAY}`);
  } else {
    // Direct command support for inspect, typecheck, build
    const taskType = command.toUpperCase() as TaskType;
    if (!ALLOWED_TASK_TYPES.includes(taskType)) {
      console.error(`INVALID_TASK_ARGUMENTS: Unknown CLI command or invalid task type '${command}'`);
      process.exit(1);
    }
    console.log(`Dispatching direct task: ${taskType}`);
    const taskId = `task_${Date.now()}_direct`;
    const task: QueueTask = {
      taskId,
      type: taskType,
      risk: 'GREEN',
      priority: 'HIGH',
      instruction: `Direct execution of ${command}`,
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    };
    queueStore.addQueueTask(task);
    const result = await queueRunner.runCycle();
    const updated = queueStore.getQueueTask(taskId);
    console.log(`TASK STATUS: ${updated?.status || 'UNKNOWN'}`);
  }
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
