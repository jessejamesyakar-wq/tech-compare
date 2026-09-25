import { Orchestrator } from './orchestrator';
import { TaskStore } from './taskStore';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'inspect';

  const taskStore = new TaskStore();
  const orchestrator = new Orchestrator(taskStore);

  console.log(`==================================================`);
  console.log(`ACELEETME Control Hub V0.1 — Command: ${command}`);
  console.log(`==================================================`);

  if (command === 'inspect') {
    console.log('Dispatching REPOSITORY_INSPECTION GREEN task...');
    const result = await orchestrator.submitAndExecuteTask(
      'REPOSITORY_INSPECTION',
      'GREEN',
      `Read the ACELEETME repository from working directory /workspace/aceleetme.

Run from /workspace/aceleetme:
- git -C /workspace/aceleetme branch --show-current
- git -C /workspace/aceleetme rev-parse HEAD
- git -C /workspace/aceleetme status --short
- read /workspace/aceleetme/package.json
- count tracked files under /workspace/aceleetme/src/lib/trustLayer
- verify if /workspace/aceleetme/src/lib/trustLayer/postgres/postgresCommerceRepository.ts exists
- verify if /workspace/aceleetme/src/lib/trustLayer/postgres/priceHistoryAndAnomalyEngine.ts exists

Do not modify files.`
    );

    console.log(`TASK STATUS: ${result.status}`);
    console.log(`INTERACTION ID: ${result.interactionId || 'NONE'}`);
    console.log(`ATTEMPTS: ${result.attempts}`);
    if (result.failureClassification) {
      console.log(`FAILURE CLASSIFICATION: ${result.failureClassification}`);
    }
    console.log('OUTPUT RESULT:');
    console.log(result.result || '(no result)');
  } else if (command === 'typecheck') {
    console.log('Dispatching TYPECHECK GREEN task...');
    const result = await orchestrator.submitAndExecuteTask(
      'TYPECHECK',
      'GREEN',
      `Run TypeScript typecheck for ACELEETME repository.

Contract:
1. Verify working directory is /workspace/aceleetme.
2. Verify /workspace/aceleetme/.git exists.
3. Check if node_modules exists in /workspace/aceleetme. If missing, report DEPENDENCIES_MISSING / BLOCKED_BY_DEPENDENCIES and do not fail typecheck artificially.
4. If dependencies are present, run typecheck (npx tsc --noEmit or npm run typecheck) inside /workspace/aceleetme.

Return exit code and concise result.`
    );

    console.log(`TASK STATUS: ${result.status}`);
    console.log(`INTERACTION ID: ${result.interactionId || 'NONE'}`);
    console.log(`ATTEMPTS: ${result.attempts}`);
    if (result.failureClassification) {
      console.log(`FAILURE CLASSIFICATION: ${result.failureClassification}`);
    }
    console.log('OUTPUT RESULT:');
    console.log(result.result || '(no result)');
  } else if (command === 'test-red') {
    console.log('Submitting synthetic PRODUCTION_DEPLOY RED task...');
    const result = await orchestrator.submitAndExecuteTask(
      'PRODUCTION_DEPLOY' as any,
      'RED',
      `Attempting to deploy to production.`
    );

    console.log(`TASK STATUS: ${result.status}`);
    console.log(`INTERACTION ID: ${result.interactionId || 'NONE'}`);
    console.log(`GOVERNANCE REJECTION RESULT: ${result.failureClassification}`);
  } else if (command === 'status') {
    const tasks = orchestrator.getAllTasks();
    console.log(`TOTAL TASKS RECORDED: ${tasks.length}`);
    tasks.forEach((t, i) => {
      console.log(`[${i + 1}] ID: ${t.taskId} | Type: ${t.type} | Risk: ${t.risk} | Status: ${t.status} | Interaction: ${t.interactionId || 'NONE'}`);
    });
  } else {
    console.log(`Unknown command: ${command}. Use 'inspect', 'typecheck', 'test-red', or 'status'.`);
  }
}

main().catch((err) => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
