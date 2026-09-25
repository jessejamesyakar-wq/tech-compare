import { Orchestrator } from './orchestrator';
import { TaskStore } from './taskStore';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'inspect';

  const taskStore = new TaskStore();
  const orchestrator = new Orchestrator(taskStore);

  console.log(`==================================================`);
  console.log(`ACELEETME Control Hub V0.2 — Command: ${command}`);
  console.log(`==================================================`);

  if (command === 'inspect') {
    console.log('Dispatching REPOSITORY_INSPECTION GREEN task to isolated local worktree...');
    const result = await orchestrator.submitAndExecuteTask(
      'REPOSITORY_INSPECTION',
      'GREEN',
      'Perform read-only repository inspection inside isolated task worktree.'
    );

    console.log(`TASK STATUS: ${result.status}`);
    console.log(`WORKSPACE PATH: ${result.workspacePath || 'NONE'}`);
    console.log(`ORIGIN/MAIN HEAD: ${result.originMainHead || 'NONE'}`);
    console.log(`READ-ONLY VIOLATION: ${result.readOnlyViolation ? 'YES' : 'NO'}`);
    if (result.failureClassification) {
      console.log(`FAILURE CLASSIFICATION: ${result.failureClassification}`);
    }
    console.log('\n--- LOCAL EXECUTOR EVIDENCE ---');
    console.log(result.commandOutput || '(no evidence)');
    if (result.analysisResult) {
      console.log('\n--- ANTIGRAVITY ANALYSIS RESULT ---');
      console.log(result.analysisResult);
    }
  } else if (command === 'typecheck') {
    console.log('Dispatching TYPECHECK GREEN task to isolated local worktree...');
    const result = await orchestrator.submitAndExecuteTask(
      'TYPECHECK',
      'GREEN',
      'Run TypeScript typecheck inside isolated task worktree.'
    );

    console.log(`TASK STATUS: ${result.status}`);
    console.log(`WORKSPACE PATH: ${result.workspacePath || 'NONE'}`);
    console.log(`ORIGIN/MAIN HEAD: ${result.originMainHead || 'NONE'}`);
    console.log(`READ-ONLY VIOLATION: ${result.readOnlyViolation ? 'YES' : 'NO'}`);
    if (result.failureClassification) {
      console.log(`FAILURE CLASSIFICATION: ${result.failureClassification}`);
    }
    console.log('\n--- TYPECHECK EVIDENCE ---');
    console.log(result.commandOutput || '(no evidence)');
  } else if (command === 'test-red') {
    console.log('Submitting synthetic PRODUCTION_DEPLOY RED task...');
    const result = await orchestrator.submitAndExecuteTask(
      'PRODUCTION_DEPLOY' as any,
      'RED',
      'Attempting to deploy to production.'
    );

    console.log(`TASK STATUS: ${result.status}`);
    console.log(`WORKSPACE CREATED: ${result.workspacePath ? 'YES' : 'NO'}`);
    console.log(`GOVERNANCE REJECTION RESULT: ${result.failureClassification}`);
  } else if (command === 'status') {
    const tasks = orchestrator.getAllTasks();
    console.log(`TOTAL TASKS RECORDED: ${tasks.length}`);
    tasks.forEach((t, i) => {
      console.log(`[${i + 1}] ID: ${t.taskId} | Type: ${t.type} | Risk: ${t.risk} | Status: ${t.status} | Workspace: ${t.workspacePath || 'NONE'}`);
    });
  } else {
    console.log(`Unknown command: ${command}. Use 'inspect', 'typecheck', 'test-red', or 'status'.`);
  }
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
