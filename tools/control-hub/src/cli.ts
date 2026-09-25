import { CONFIG } from './config';
import { QueueRunner } from './queueRunner';
import { QueueStore } from './queueStore';
import { QueueTask, RiskLevel, TaskPriority, TaskType } from './types';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  const queueStore = new QueueStore();
  const queueRunner = new QueueRunner(queueStore);

  console.log(`==================================================`);
  console.log(`ACELEETME Control Hub V0.4 — Command: ${command}`);
  console.log(`==================================================`);

  if (command === 'queue:add') {
    const typeArg = (args[1] || 'REPOSITORY_INSPECTION').toUpperCase() as TaskType;
    const riskArg = (args[2] || 'GREEN').toUpperCase() as RiskLevel;
    const priorityArg = (args[3] || 'NORMAL').toUpperCase() as TaskPriority;
    const instructionArg = args.slice(4).join(' ') || `Execute ${typeArg} task`;

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const task: QueueTask = {
      taskId,
      type: typeArg,
      risk: riskArg,
      priority: priorityArg,
      instruction: instructionArg,
      status: 'PENDING',
      dependencies: [],
      createdAt: new Date().toISOString(),
      attempts: 0
    };

    queueStore.addQueueTask(task);
    console.log(`ADDED TASK TO QUEUE:`);
    console.log(`ID: ${task.taskId} | Type: ${task.type} | Risk: ${task.risk} | Priority: ${task.priority}`);
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
  } else {
    // Direct command support for inspect, typecheck, build
    const taskType = command.toUpperCase() as TaskType;
    console.log(`Dispatching direct task: ${taskType}`);
    const taskId = `task_${Date.now()}_direct`;
    const task: QueueTask = {
      taskId,
      type: taskType || 'REPOSITORY_INSPECTION',
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
