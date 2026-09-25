import { CONFIG } from './config';
import { Logger } from './logger';
import { QueueRunner } from './queueRunner';
import { QueueStore } from './queueStore';
import { Supervisor } from './supervisor';

async function main() {
  const logger = new Logger();
  const queueStore = new QueueStore();
  const queueRunner = new QueueRunner(queueStore);
  const supervisor = new Supervisor(queueStore);

  logger.log('==================================================');
  logger.log('ACELEETME Control Hub V0.5 — Windows Autonomous Runner Starting');
  logger.log('==================================================');

  // Check supervisor restart limits
  const supervisorCheck = supervisor.checkAndRecordRestart();
  if (!supervisorCheck.allowed) {
    logger.error(`SUPERVISOR BLOCKED RUNNER: ${supervisorCheck.status} (${supervisorCheck.restartCount} restarts in 1h limit exceeded).`);
    process.exit(1);
  }

  logger.log(`Supervisor Status: ${supervisorCheck.status} (Restart Count in 1h: ${supervisorCheck.restartCount})`);

  let isRunning = true;

  const shutdown = () => {
    logger.log('Graceful shutdown signal received. Stopping runner daemon...');
    isRunning = false;
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  logger.log(`Continuous runner daemon active. Polling interval: ${CONFIG.POLLING_INTERVAL_MS / 1000}s.`);

  while (isRunning) {
    try {
      const runnerState = queueStore.getRunnerState();
      if (runnerState.paused) {
        logger.log('KILL SWITCH ENGAGED: State is PAUSED. Sleeping...');
      } else {
        const cycleResult = await queueRunner.runCycle();
        if (cycleResult.processedCount > 0) {
          logger.log(`Runner cycle finished. Processed tasks: ${cycleResult.tasksProcessed.join(', ')}`);
        }
      }
    } catch (err: any) {
      logger.error('Error during runner cycle execution:', err);
    }

    // Sleep for polling interval without busy loop
    await new Promise(resolve => setTimeout(resolve, CONFIG.POLLING_INTERVAL_MS));
  }

  logger.log('Runner daemon stopped cleanly.');
}

main().catch(err => {
  const logger = new Logger();
  logger.error('Fatal Daemon Error:', err);
  process.exit(1);
});
