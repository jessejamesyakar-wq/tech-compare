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
      `Read the ACELEETME repository.

Return:
- branch
- HEAD
- package name
- whether working tree is clean
- number of tracked files under src/lib/trustLayer
- whether postgresCommerceRepository.ts exists
- whether priceHistoryAndAnomalyEngine.ts exists.

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
      `Run the repository TypeScript typecheck in the remote sandbox.

Return exit code and concise result.

Do not change source files.`
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
