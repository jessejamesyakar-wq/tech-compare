/**
 * ASTERION MASTER-01 — NON-HANGING FILE EXECUTION GUARD (Step 5)
 *
 * Enforces at the startup path of batch/verification runners that:
 * 1. The process was invoked from an actual script file on disk (never -e, --eval, --print, or REPL).
 * 2. STDIN is immediately paused/detached so no child or library can hang waiting for STDIN.
 * 3. A finite global process watchdog timeout is armed so the runner can never hang indefinitely.
 */

import fs from 'fs';

const FORBIDDEN_EVAL_FLAGS = new Set(['-e', '--eval', '-p', '--print', '--interactive', '-i']);

export function assertNonInteractiveFileExecution(
  expectedScriptFile: string,
  maxRuntimeMs: number = 15 * 60 * 1000
): { cancelWatchdog: () => void } {
  const rawArgs = [...process.execArgv, ...process.argv];

  for (const arg of rawArgs) {
    const trimmed = String(arg || '').trim();
    if (FORBIDDEN_EVAL_FLAGS.has(trimmed)) {
      console.error(
        `[NON-HANGING GUARD VIOLATION] Forbidden inline eval/REPL flag detected ('${trimmed}'). Runners must execute strictly from a file.`
      );
      process.exit(2);
    }
  }

  const entrypoint = process.argv[1] || '';
  if (!entrypoint || entrypoint === '-' || entrypoint.startsWith('[eval]') || !fs.existsSync(entrypoint)) {
    console.error(
      `[NON-HANGING GUARD VIOLATION] Invalid or non-file entrypoint ('${entrypoint}'). Expected file: ${expectedScriptFile}`
    );
    process.exit(2);
  }

  // Immediately pause/unref stdin so the process never waits on STDIN
  try {
    if (process.stdin && typeof process.stdin.pause === 'function') {
      process.stdin.pause();
    }
    if (process.stdin && typeof (process.stdin as any).unref === 'function') {
      (process.stdin as any).unref();
    }
  } catch {
    // Ignore if stdin is already closed
  }

  const timer = setTimeout(() => {
    console.error(
      `[NON-HANGING WATCHDOG TIMEOUT] Script '${expectedScriptFile}' exceeded finite timeout of ${maxRuntimeMs}ms. Terminating cleanly.`
    );
    process.exit(124);
  }, maxRuntimeMs);

  if (typeof timer.unref === 'function') {
    timer.unref();
  }

  return {
    cancelWatchdog: () => clearTimeout(timer),
  };
}
